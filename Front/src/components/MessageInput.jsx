import { useState, useRef } from 'react'

// ─── Icons (Tailwind Optimized) ────────────────────────────────────────────────

const PaperclipIcon = () => (
  <svg width="20" height="20" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
)

const SendIcon = () => (
  <svg width="20" height="20" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
)

const StopIcon = () => (
  <svg width="20" height="20" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
)

/**
 * Componente de entrada de mensajes con auto-ajuste de altura y soporte para streaming.
 */
export default function MessageInput({
  onSend,
  onChunk,
  onResponse,
  apiUrl = '/api/chat',
  apiHeaders = {},
  buildBody,
  isLoading = false,
  placeholder = 'Escribe tu mensaje...',
}) {
  const [text, setText] = useState('')
  const [internalLoading, setInternalLoading] = useState(false)
  const textareaRef = useRef(null)
  const abortControllerRef = useRef(null)

  const loading = isLoading || internalLoading
  const canSend = text.trim().length > 0 && !loading

  const handleChange = (e) => {
    setText(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }

  const handleSubmit = async () => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    onSend?.(trimmed)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    setInternalLoading(true)
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const body = buildBody ? buildBody(trimmed) : JSON.stringify({ message: trimmed })
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiHeaders },
        body: typeof body === 'string' ? body : JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        onChunk?.(chunk)
      }
      onResponse?.(fullText)
    } catch (err) {
      if (err.name === 'AbortError') onResponse?.(null, 'Generación detenida.')
      else onResponse?.(null, 'Error de conexión, intente nuevamente.')
    } finally {
      setInternalLoading(false)
      abortControllerRef.current = null
    }
  }

  return (
    <div className="p-4 lg:p-6 lg:pt-0 w-full max-w-4xl mx-auto">
      <div className={`
        relative flex flex-col w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden
        transition-all duration-200 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10
        ${loading ? 'opacity-80' : ''}
      `}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'El asistente está pensando...' : placeholder}
          className="w-full bg-transparent text-white px-4 py-4 pr-16 resize-none min-h-[56px] max-h-[200px] outline-none placeholder:text-white/20 text-sm lg:text-base"
          disabled={loading}
        />
        
        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          {loading ? (
            <button
              onClick={handleStop}
              className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors active:scale-95"
              title="Detener"
            >
              <StopIcon />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className={`
                p-2.5 rounded-xl transition-all active:scale-95
                ${canSend 
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/5 text-white/20 cursor-not-allowed'}
              `}
            >
              <SendIcon />
            </button>
          )}
        </div>
      </div>
      
      <p className="mt-2 text-center text-[10px] text-white/20 hidden lg:block">
        Presiona <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">Enter</kbd> para enviar · <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">Shift + Enter</kbd> para nueva línea
      </p>
    </div>
  )
}
