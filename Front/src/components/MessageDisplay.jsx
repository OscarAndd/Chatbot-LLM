import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// ─── Icons (Tailwind Optimized) ────────────────────────────────────────────────

const BotIcon = () => (
  <svg width="20" height="20" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 14c-.83 0-1.5.67-1.5 1.5S6.67 17 7.5 17 9 16.33 9 15.5 8.33 14 7.5 14m9 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5M12 19c-2.09 0-4-.81-5.5-2.15A1.65 1.65 0 0 0 5 18.5V22h14v-3.5c0-.54-.26-1.02-.5-1.65C17 18.2 15.09 19 12 19z" />
  </svg>
)

const CheckCheck = () => (
  <svg width="16" height="16" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
    <polyline points="17 6 9 14" />
  </svg>
)

const AlertIcon = () => (
  <svg width="20" height="20" className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Indicador visual de que el bot está escribiendo.
 */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
        <BotIcon />
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none p-4 flex gap-1.5 items-center">
        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></div>
      </div>
    </div>
  )
}

/**
 * Burbuja de mensaje individual con soporte para Markdown y Math.
 */
function MessageBubble({ message, showAvatar }) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  return (
    <div className={`flex gap-3 max-w-[90%] lg:max-w-[80%] animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? 'flex-row-reverse ml-auto' : ''}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 flex-shrink-0">
          {showAvatar ? (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${isError ? 'bg-red-500/20 border border-red-500/50 shadow-red-500/10' : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'}`}>
              {isError ? <AlertIcon /> : <BotIcon />}
            </div>
          ) : null}
        </div>
      )}

      {/* Bubble Group */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          p-3 lg:p-4 rounded-2xl text-sm lg:text-base leading-relaxed break-words
          ${isUser ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20' :
            isError ? 'bg-red-500/10 border border-red-500/30 text-red-200 rounded-bl-none' :
              'bg-white/5 border border-white/10 text-white/90 rounded-bl-none'}
        `}>
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10">
            <ReactMarkdown
              remarkPlugins={[remarkMath, remarkGfm]}
              rehypePlugins={[rehypeKatex]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                code: ({ node, inline, className, children, ...props }) => (
                  inline
                    ? <code className="bg-white/10 px-1 rounded text-indigo-300" {...props}>{children}</code>
                    : <code className={className} {...props}>{children}</code>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 rounded-xl border border-white/10">
                    <table className="min-w-full divide-y divide-white/10 text-left">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
                th: ({ children }) => <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/60">{children}</th>,
                td: ({ children }) => <td className="px-4 py-3 text-sm border-t border-white/5">{children}</td>,
                tr: ({ children }) => <tr className="hover:bg-white/5 transition-colors">{children}</tr>
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>
          {message.isStreaming && <span className="inline-block w-0.5 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />}
        </div>

        {/* Meta */}
        <div className={`flex items-center gap-1.5 mt-1 px-1 text-[10px] text-white/30 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span>{message.time}</span>
          {isUser && <span className="text-indigo-400"><CheckCheck /></span>}
        </div>
      </div>
    </div>
  )
}

function WelcomeState({ botName, welcomeText }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-pulse">
          <div className="-rotate-12 scale-150 text-white">
            <BotIcon />
          </div>
        </div>
        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40 tracking-tight">
          {welcomeText ?? `¡Hola! Soy ${botName ?? 'tu asistente'}`}
        </h1>
        <p className="text-white/40 text-sm lg:text-base max-w-xs mx-auto">
          ¿En qué puedo ayudarte hoy? Estoy listo para responder tus preguntas.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {['💡 Ideas', '📝 Redacción', '🔍 Análisis', '💬 Charla'].map(chip => (
          <span key={chip} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-white/50 hover:bg-white/10 hover:text-white/80 transition-all cursor-default">
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * Componente que muestra la lista de mensajes con auto-scroll inteligente.
 */
export default function MessageDisplay({ messages = [], isLoading = false, botName, welcomeText }) {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)
  const isAtBottom = useRef(true)

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return

    const threshold = 50
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    
    // Si el usuario se aleja más de 50px del fondo, desactivamos el auto-scroll
    isAtBottom.current = distanceToBottom <= threshold
  }

  const prevLen = useRef(messages.length)

  // Efecto para cambios en mensajes (detectar nuevos mensajes del usuario)
  useEffect(() => {
    const newMsgs = messages.slice(prevLen.current)
    if (newMsgs.some(m => m.role === 'user')) {
      isAtBottom.current = true
      bottomRef.current?.scrollIntoView({ behavior: 'auto' })
    }
    prevLen.current = messages.length
  }, [messages])

  // ResizeObserver para seguir el streaming de forma fluida
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const observer = new ResizeObserver(() => {
      if (isAtBottom.current) {
        // Usamos scrollTop directamente para máxima fluidez y evitar conflictos
        container.scrollTop = container.scrollHeight
      }
    })

    // Observamos el primer hijo (el wrapper del contenido)
    const content = container.firstElementChild
    if (content) observer.observe(content)
    
    return () => observer.disconnect()
  }, [])

  const hasMessages = messages.length > 0

  return (
    <div
      className="flex-1 overflow-y-auto p-4 lg:p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      ref={containerRef}
      onScroll={handleScroll}
      role="list"
    >
      <div className="flex flex-col space-y-6 pb-2">
        {!hasMessages && !isLoading && (
          <WelcomeState botName={botName} welcomeText={welcomeText} />
        )}

        {messages.map((msg, idx) => {
          const prevSameRole = idx > 0 && messages[idx - 1].role === msg.role
          const showAvatar = !prevSameRole
          return (
            <MessageBubble key={msg.id} message={msg} showAvatar={showAvatar} />
          )
        })}

        {isLoading && (!messages.length || !messages[messages.length - 1].isStreaming) && (
          <TypingIndicator />
        )}

        <div ref={bottomRef} aria-hidden="true" className="h-px" />
      </div>
    </div>
  )
}
