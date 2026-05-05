import os
import time
import tiktoken
import markdown
import bleach
from typing import List, Dict
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from together import AsyncTogether
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Chatbot Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://projectsplace.co"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"]
)

# Initialize Together AI client
client = AsyncTogether(api_key=os.getenv("TOGETHER_API_KEY"))
MODEL = "openai/gpt-oss-20b"

# InputToken Limiter Logic
class TokenLimiter:
    """
    Clase para controlar y limitar el uso de tokens por tiempo.
    Utiliza tiktoken para el conteo preciso o una aproximación en caso de fallo de red.
    """
    def __init__(self, tokens_per_minute: int):
        self.tokens_per_minute = tokens_per_minute
        self.usage_log: List[tuple] = [] # (timestamp, token_count)
        try:
            self.encoding = tiktoken.get_encoding("cl100k_base")
            print("INFO: Tiktoken encoding loaded correctly.")
        except Exception as e:
            print(f"WARNING: Tiktoken could not be loaded ({e}). Using approximation.")
            self.encoding = None

    def count_tokens(self, text: str) -> int:
        """
        Calcula la cantidad de tokens en un texto.
        Si tiktoken no está disponible, usa una aproximación de caracteres/3.
        """
        if self.encoding:
            try:
                return len(self.encoding.encode(text))
            except:
                pass
        # Fallback: ~4 chars per token
        return len(text) // 3 + 1

    def _clean_old_logs(self):
        now = time.time()
        self.usage_log = [log for log in self.usage_log if now - log[0] < 3600]

    def can_consume(self, tokens: int) -> bool:
        self._clean_old_logs()
        current_total = sum(log[1] for log in self.usage_log)
        return (current_total + tokens) <= self.tokens_per_minute

    def consume(self, tokens: int):
        self.usage_log.append((time.time(), tokens))

limit_val = 7000
limiter = TokenLimiter(limit_val)

class ChatRequest(BaseModel):
    """
    Modelo de datos para la petición de chat.
    Define el mensaje del usuario, el historial y los parámetros del modelo.
    """
    from pydantic import Field
    message: str = Field(..., description="El mensaje actual enviado por el usuario")
    history: List[Dict[str, str]] = Field(default_factory=list, description="Historial de mensajes previos")
    temperature: float = Field(0.5, description="Nivel de creatividad del modelo (0.0 a 1.0)")
    max_tokens: int = Field(1024, description="Límite máximo de tokens en la respuesta")
    top_p: float = Field(0.1, description="Parámetro nucleus sampling para diversidad")

def sanitize_and_format(text: str) -> str:
    """
    Limpia el texto Markdown generado y lo sanitiza para evitar ataques XSS.
    """
    html = markdown.markdown(text, extensions=['extra', 'codehilite'])
    safe_html = bleach.clean(html)
    # Use markdown library to process text
    # This converts markdown to HTML, which is a common way to "sanitize" and format
    return safe_html

async def generate_response(prompt: str, history: List[Dict[str, str]], temperature: float, max_tokens: int, top_p: float):
    """
    Generador asíncrono que interactúa con la API de Together AI.
    Añade instrucciones de restricción al prompt y gestiona el streaming.
    """
    print(f"DEBUG: Processing prompt: {prompt[:50]}...")
    
    messages = history + [{"role": "user", "content": prompt}]
    
    # Check tokens input in prompt
    full_prompt_text = " ".join([m["content"] for m in messages])
    prompt_tokens = limiter.count_tokens(full_prompt_text)
    
    if not limiter.can_consume(prompt_tokens):
        yield "Error: Token limit exceeded. Please wait a moment."
        return

    limiter.consume(prompt_tokens)

    try:
        print(f"DEBUG: Calling Together AI with model {MODEL}...")
        response = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            stream=True,
            temperature=temperature, 
            max_tokens=max_tokens,    
            top_p=top_p,              
            repetition_penalty=1.1,
            extra_body={
                "reasoning": {"enabled": False} # Sin pensar
            },
        )

        found_content = False
        async for chunk in response:
            if hasattr(chunk, 'choices') and chunk.choices:
                content = chunk.choices[0].delta.content
                if content:
                    found_content = True
                    # We send the raw content for the UI to handle streaming
                    # But we count tokens as we go
                    chunk_tokens = limiter.count_tokens(content)
                    limiter.consume(chunk_tokens)
                    yield content
        
        if not found_content:
            print("DEBUG: Together AI returned an empty response")
            yield "Error: No response generated by the model."
                    
    except Exception as e:
        print(f"ERROR: Exception in generate_response: {str(e)}")
        yield f"Error: {str(e)}"

@app.post("/api/chat")
async def chat_endpoint(request: Request, chat_request: ChatRequest):
    """
    Endpoint principal para interactuar con el Chatbot.
    Recibe un mensaje y devuelve un StreamingResponse con la respuesta del LLM.
    """
    async def stream_wrapper():
        async for chunk in generate_response(
            chat_request.message, 
            chat_request.history,
            temperature=chat_request.temperature,
            max_tokens=chat_request.max_tokens,
            top_p=chat_request.top_p
        ):

            if await request.is_disconnected():
                break
            yield chunk

    return StreamingResponse(
        stream_wrapper(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

@app.get("/api/status")
async def status():
    return {
        "status": "online",
        "model": MODEL,
        "tokens_remaining": limiter.tokens_per_minute - sum(log[1] for log in limiter.usage_log)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
