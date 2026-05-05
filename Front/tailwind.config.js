import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chat-bg': '#0d0f1a',
        'chat-sidebar': '#111327',
        'chat-accent': '#6c63ff',
        'chat-bubble-bot': '#1e2138',
        'chat-bubble-user': '#5b54f5',
      }
    },
  },
  plugins: [
    typography,
  ],
}
