# 🧠 Chatbot Backend (FastAPI)

Este es el núcleo de procesamiento del chatbot, encargado de interactuar con los modelos de IA y gestionar la seguridad y límites de la API.

## Funcionalidades Clave

- **Streaming de Respuestas**: Implementa generadores asíncronos para enviar fragmentos de texto al cliente en tiempo real.
- **Token Limiter**: Sistema de control que evita exceder los límites de la API de Together AI, calculando tokens con `tiktoken`.
- **Sanitización**: Limpia el contenido generado para asegurar que no se inyecte código malicioso (XSS).
- **Flexibilidad**: Parámetros configurables como temperatura y penalización de repetición.

## Configuración

Crea un archivo `.env` con lo siguiente:

```env
TOGETHER_API_KEY=tu_token_aqui
TOGETHER_MODEL=LiquidAI/LFM2-24B-A2B  # O el modelo de tu elección
LIMIT_TOKENS_PER_MINUTE=50000        # Opcional
```

## Instalación Manual

1. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
2. Inicia el servidor:
   ```bash
   python main.py
   ```
   La API estará en `http://localhost:8000`.

## Endpoints

- `POST /api/chat`: Recibe un `ChatRequest` y devuelve un `StreamingResponse`.
- `GET /`: Health check básico.
