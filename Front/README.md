# 🎨 Chatbot Frontend (React + Tailwind)

Interfaz de usuario moderna y responsiva para interactuar con el chatbot de IA.

## Características

- **Diseño Mobile-First**: Adaptado perfectamente para móviles y escritorio.
- **Glassmorphism UI**: Estética moderna con transparencias y desenfoques.
- **Markdown & Math**: Soporte completo para fórmulas matemáticas (KaTeX) y bloques de código.
- **Auto-scroll Inteligente**: Sigue la respuesta del bot automáticamente a menos que el usuario suba a leer.
- **Cancelación de Peticiones**: Botón de "Stop" para detener la generación en cualquier momento.

## Tecnologías

- **React 19**
- **Vite** (Build tool)
- **Tailwind CSS v3**
- **React Markdown** & **rehype-katex**

## Configuración

El frontend utiliza la variable de entorno `VITE_API_URL` para saber a dónde enviar las peticiones. Si no se define, apuntará a `https://projectsplace.co/api/chat` por defecto.

## Instalación Manual

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Inicia en modo desarrollo:
   ```bash
   npm run dev
   ```

## Estructura de Componentes

- `App.jsx`: Componente principal y gestión de estado.
- `MessageDisplay.jsx`: Renderizado de mensajes y lógica de scroll.
- `MessageInput.jsx`: Entrada de texto y comunicación con la API.
