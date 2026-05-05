import { useState } from 'react'
import MessageInput from './components/MessageInput'
import MessageDisplay from './components/MessageDisplay'

// ─── Icons (Tailwind Optimized) ────────────────────────────────────────────────

const MenuIcon = () => (
  <svg width="24" height="24" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const PlusIcon = () => (
  <svg width="20" height="20" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const BotIcon = () => (
  <svg width="24" height="24" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 14c-.83 0-1.5.67-1.5 1.5S6.67 17 7.5 17 9 16.33 9 15.5 8.33 14 7.5 14m9 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5M12 19c-2.09 0-4-.81-5.5-2.15A1.65 1.65 0 0 0 5 18.5V22h14v-3.5c0-.54-.26-1.02-.5-1.65C17 18.2 15.09 19 12 19z" />
  </svg>
)

const ChatIcon = () => (
  <svg width="20" height="20" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ─── Initial Data ──────────────────────────────────────────────────────────────

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    title: '¡Bienvenido al Chat!',
    time: '10:30',
    messages: [
      { id: 1, text: 'Hola, ¿cómo estás?', role: 'user', time: '10:30' },
      { id: 2, text: '¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?', role: 'bot', time: '10:30' },
    ],
  },
  {
    id: 2,
    title: 'Explícame inteligencia artificial',
    time: 'Ayer',
    messages: [
      { id: 1, text: 'Explícame inteligencia artificial', role: 'user', time: '09:15' },
      { id: 2, text: 'La inteligencia artificial (IA) es una rama de la informática que busca crear sistemas capaces de realizar tareas que normalmente requieren inteligencia humana, como aprender, razonar y resolver problemas.', role: 'bot', time: '09:15' },
    ],
  },
  {
    id: 3,
    title: 'Ayúdame con un resumen',
    time: 'Ayer',
    messages: [
      { id: 1, text: 'Ayúdame con un resumen', role: 'user', time: '15:42' },
      { id: 2, text: 'Claro, con gusto te ayudo con el resumen. ¿De qué texto o tema necesitas el resumen?', role: 'bot', time: '15:42' },
    ],
  },
  {
    id: 4,
    title: 'Dame ideas para un proyecto',
    time: '2 días',
    messages: [
      { id: 1, text: 'Dame ideas para un proyecto', role: 'user', time: '11:20' },
      { id: 2, text: 'Con gusto te propongo algunas ideas: 1) App de hábitos saludables, 2) Sistema de gestión de tareas, 3) Chatbot educativo, 4) Plataforma de recetas personalizadas. ¿Cuál te interesa más?', role: 'bot', time: '11:20' },
    ],
  },
  {
    id: 5,
    title: '¿Cómo funciona tu sistema?',
    time: '3 días',
    messages: [
      { id: 1, text: '¿Cómo funciona tu sistema?', role: 'user', time: '08:05' },
      { id: 2, text: 'Soy un asistente de IA basado en modelos de lenguaje de gran escala. Proceso texto y genero respuestas coherentes según el contexto de nuestra conversación.', role: 'bot', time: '08:05' },
    ],
  },
]

// ─── URL de la API externa ────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL ?? 'https://projectsplace.co/api/chat'

/**
 * Obtiene la hora actual formateada en HH:mm
 * @returns {string} Hora formateada
 */
function getCurrentTime() {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// ─── Components ───────────────────────────────────────────────────────────────

/**
 * Componente Sidebar que gestiona el historial de conversaciones.
 */
function Sidebar({ conversations, activeId, onSelect, onNewChat, isOpen, setIsOpen }) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-chat-sidebar border-r border-white/5 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BotIcon />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight">
              ChatBot
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-white/40 hover:text-white transition-colors">
            <CloseIcon />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => { onNewChat(); setIsOpen(false); }}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl flex items-center justify-center gap-2 font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <PlusIcon />
            <span>Nuevo Chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
            Conversaciones recientes
          </div>
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => { onSelect(conv.id); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeId === conv.id ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80'}`}
            >
              <div className={`flex-shrink-0 transition-colors ${activeId === conv.id ? 'text-indigo-400' : 'text-white/20 group-hover:text-white/40'}`}>
                <ChatIcon />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-[10px] opacity-40">{conv.time}</p>
              </div>
            </button>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="relative">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                U
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-chat-sidebar rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white/90 truncate">Usuario Pro</p>
              <p className="text-[10px] text-green-500 font-medium">En línea</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

/**
 * Componente principal de la aplicación.
 * Gestiona el estado de las conversaciones, el envío de mensajes y el streaming de respuestas.
 */
export default function App() {
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS)
  const [activeId, setActiveId] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const activeConv = conversations.find(c => c.id === activeId)

  const handleNewChat = () => {
    const id = Date.now()
    const newConv = { id, title: 'Nueva conversación', time: getCurrentTime(), messages: [] }
    setConversations(prev => [newConv, ...prev])
    setActiveId(id)
  }

  /**
   * Agrega el mensaje del usuario y un marcador para la respuesta del bot.
   * @param {string} text - Texto del mensaje.
   */
  const handleUserSend = (text) => {
    const time = getCurrentTime()
    const userMsg = { id: Date.now(), text, role: 'user', time }
    const botMsgPlaceholder = { id: Date.now() + 1, text: '', role: 'bot', time, isStreaming: true }

    setIsLoading(true)
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c
      const isFirst = c.messages.length === 0
      return {
        ...c,
        title: isFirst ? text.slice(0, 35) + (text.length > 35 ? '…' : '') : c.title,
        time,
        messages: [...c.messages, userMsg, botMsgPlaceholder],
      }
    }))
  }

  /**
   * Procesa cada fragmento (chunk) de la respuesta en streaming.
   * @param {string} chunk - Texto recibido.
   */
  const handleApiChunk = (chunk) => {
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c
      const msgs = [...c.messages]
      const lastIdx = msgs.length - 1
      if (lastIdx >= 0 && msgs[lastIdx].role === 'bot') {
        msgs[lastIdx] = { ...msgs[lastIdx], text: msgs[lastIdx].text + chunk }
        return { ...c, messages: msgs }
      }
      return c
    }))
  }

  const handleApiResponse = (text, errorMsg) => {
    setIsLoading(false)
    setConversations(prev => prev.map(c => {
      if (c.id !== activeId) return c
      const msgs = [...c.messages]
      const lastIdx = msgs.length - 1
      if (lastIdx >= 0 && msgs[lastIdx].role === 'bot') {
        msgs[lastIdx] = { ...msgs[lastIdx], isStreaming: false }
        return { ...c, messages: msgs }
      }
      return c
    }))

    if (errorMsg) {
      const time = getCurrentTime()
      const errorMsgObj = { id: Date.now() + 2, text: errorMsg, role: 'error', time }
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, messages: [...c.messages, errorMsgObj], time } : c))
    }
  }

  return (
    <div className="flex h-screen bg-chat-bg text-white font-sans overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col relative min-w-0 bg-gradient-to-b from-[#13162b] to-chat-bg">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-chat-sidebar/50 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white/60 hover:text-white transition-colors">
            <MenuIcon />
          </button>
          <div className="text-sm font-bold truncate max-w-[200px]">{activeConv?.title || 'ChatBot'}</div>
          <button onClick={handleNewChat} className="p-2 text-indigo-400 hover:text-indigo-300 transition-colors">
            <PlusIcon />
          </button>
        </header>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <MessageDisplay
            messages={activeConv?.messages ?? []}
            isLoading={isLoading}
            botName="ChatBot"
          />
          <div className="max-w-4xl w-full mx-auto">
            <MessageInput
              onSend={handleUserSend}
              onChunk={handleApiChunk}
              onResponse={handleApiResponse}
              apiUrl={API_URL}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
