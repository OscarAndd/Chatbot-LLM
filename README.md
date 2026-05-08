# 🤖 AI Chatbot Fullstack

Un chatbot moderno construido con **FastAPI** en el backend y **React + Tailwind CSS** en el frontend. Utiliza la API de **Together AI** para procesamiento de lenguaje natural con soporte de streaming y control de tokens. Esta aplicación se crea con asistencia de Inteligencia Artificial, lo que permitio reducir el tiempo de desarrollo en un 70%. Adicionalmente para realizar despliegue automatizado en un VPS se utiliza github Actions y para dar evitar que se suban cambios indeseados se solicita Pull Request para dar paso a la rama main.

---

## 🚀 Características

- **Streaming en tiempo real**: Las respuestas aparecen palabra por palabra mediante Server-Sent Events (SSE).
- **Control de Tokens**: Implementación de un `TokenLimiter` con `tiktoken` para gestionar el consumo de la API.
- **Diseño Premium**: Interfaz oscura con estética moderna, efectos de glassmorphism y animaciones suaves usando Tailwind CSS.
- **Soporte Markdown & Math**: Renderizado completo de código (con resaltado), tablas y fórmulas matemáticas complejas (KaTeX).
- **Arquitectura Robusta**: Manejo de errores, cancelación de peticiones (AbortController) y auto-scroll inteligente.
- **Dockerizado**: Configuración completa con Docker y Docker Compose para un despliegue sencillo.
- **Seguridad**: Sanitización de HTML en el backend con `bleach` y `markdown`.

---

## 🛠️ Tecnologías

### Backend
- **Python 3.12**
- **FastAPI**: Framework web asíncrono de alto rendimiento.
- **Together AI SDK**: Integración con modelos de lenguaje de vanguardia.
- **Tiktoken**: Conteo preciso de tokens.
- **Bleach & Markdown**: Procesamiento seguro de texto.

### Frontend
- **React 19** + **Vite**: Desarrollo rápido y moderno.
- **Tailwind CSS v3**: Estilos utilitarios y responsive.
- **React Markdown**: Renderizado de contenido dinámico.
- **KaTeX**: Motor de renderizado matemático ultra rápido.

---

## 📦 Estructura del Proyecto

```text
.
├── Back/           # Código del servidor (FastAPI)
│   ├── main.py     # Lógica principal y API
│   ├── Dockerfile  # Configuración de Docker para el backend
│   └── .env        # Variables de entorno (API Keys)
├── Front/          # Código del cliente (React)
│   ├── src/        # Componentes y lógica de UI
│   ├── Dockerfile  # Configuración de Docker para el frontend
│   └── nginx.conf  # Configuración del servidor web
└── docker-compose.yml # Orquestación de contenedores
```

---

## 🚀 Instalación y Uso

### Requisitos previos
- Docker y Docker Compose (Recomendado).
- Una API Key de [Together AI](https://www.together.ai/).

### Opción 1: Despliegue con Docker (Recomendado)

1. Clona el repositorio.
2. Configura tu API Key en `Back/.env`:
   ```env
   TOGETHER_API_KEY=tu_api_key_aqui
   TOGETHER_MODEL=LiquidAI/LFM2-24B-A2B
   ```
3. Ejecuta el comando de inicio en la raíz: 
   ```bash
   docker-compose up --build
   ```
   El frontend estará disponible en `http://localhost:5173/chat/` (o el puerto configurado).

### Opción 2: Instalación Manual

#### Backend:
1. Accede a la carpeta Back:
   ```bash
   cd Back
   pip install -r requirements.txt
   python main.py
   ```

#### Frontend:
1. Accede a la carpeta Front:
   ```bash
   cd Front
   npm install
   npm run dev
   ```

---

## ⚙️ Configuración del Modelo

Puedes ajustar los parámetros de generación en `Back/main.py` o mediante el modelo `ChatRequest`:
- **Temperature**: Controla la aleatoriedad/creatividad (0.0 a 1.0).
- **Max Tokens**: Límite de tokens en la respuesta generada.
- **Top P**: Nucleus sampling para filtrar la diversidad de palabras.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. ¡Siéntete libre de usarlo y mejorarlo!
