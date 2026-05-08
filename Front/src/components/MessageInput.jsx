import { useState, useRef, useEffect } from 'react'

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

const ChevronUpIcon = () => (
  <svg width="16" height="16" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
)

const SparklesIcon = () => (
  <svg width="16" height="16" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

export default function MessageInput({
  onSend,
  onChunk,
  onResponse,
  apiUrl = '/api/chat',
  apiHeaders = {},
  buildBody,
  isLoading = false,
  placeholder = 'Escribe tu mensaje...',
  selectedModel = null,
  setSelectedModel = () => {},
  models = [],
}) {
  const [text, setText] = useState('')
  const [internalLoading, setInternalLoading] = useState(false)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const textareaRef = useRef(null)
  const abortControllerRef = useRef(null)
  const pickerRef = useRef(null)

  const currentModel = models.find(m => m.id === selectedModel) || models[0]

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
      const body = buildBody 
        ? buildBody(trimmed) 
        : { message: trimmed, model: selectedModel }
      
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

  // Cerrar picker al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="p-4 lg:p-6 lg:pt-0 w-full max-w-4xl mx-auto">
      <div className={`
        relative flex flex-col w-full bg-[#1e2136]/50 border border-white/10 rounded-2xl 
        transition-all duration-300 shadow-2xl backdrop-blur-xl
        focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10
        ${loading ? 'opacity-80' : ''}
      `}>
        
        {/* Model Picker Dropup */}
        <div className="flex items-center px-4 pt-3 gap-2" ref={pickerRef}>
          <div className="relative">
            <button
              onClick={() => !loading && setIsPickerOpen(!isPickerOpen)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${isPickerOpen ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}
                ${loading ? 'cursor-not-allowed opacity-50' : ''}
              `}
            >
              <span className="text-sm">{currentModel?.icon}</span>
              <span>{currentModel?.name}</span>
              <div className={`transition-transform duration-200 ${isPickerOpen ? 'rotate-180' : ''}`}>
                <ChevronUpIcon />
              </div>
            </button>

            {isPickerOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1e2136] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 backdrop-blur-2xl">
                <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                  <SparklesIcon />
                  Seleccionar Modelo
                </div>
                {models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsPickerOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                      ${selectedModel === model.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <span className="text-lg">{model.icon}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{model.name}</span>
                      <span className="text-[10px] opacity-50 truncate max-w-[180px]">{model.id}</span>
                    </div>
                    {selectedModel === model.id && (
                      <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={loading ? 'El asistente está pensando...' : placeholder}
          className="w-full bg-transparent text-white px-4 py-4 pr-16 resize-none min-h-[56px] max-h-[200px] outline-none placeholder:text-white/20 text-sm lg:text-base font-medium"
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
