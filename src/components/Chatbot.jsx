import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, HelpCircle } from 'lucide-react'
import axios from '../utils/axios'
import { manualSections } from '../data/manualSections.jsx'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm your AI assistant. I can help you with questions about the Procurement Application. Ask me anything!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Search through manual sections for relevant content; returns matches with excerpt (for UI) and full text (for RAG)
  const searchManual = (query) => {
    const queryLower = query.toLowerCase()
    const results = []

    manualSections.forEach(section => {
      const sectionText = extractTextFromJSX(section.content)
      const titleMatch = section.title.toLowerCase().includes(queryLower)
      const contentMatch = sectionText.toLowerCase().includes(queryLower)

      if (titleMatch || contentMatch) {
        results.push({
          section: section.title,
          sectionId: section.id,
          excerpt: getExcerpt(sectionText, queryLower, 150),
          fullText: sectionText
        })
      }
    })

    return results
  }

  // Build RAG chunks from manual search results (top N sections with full text for backend)
  const buildRAGChunks = (manualResults, maxChunks = 5) => {
    return manualResults.slice(0, maxChunks).map(r => ({
      section_title: r.section,
      text: r.fullText || r.excerpt || ''
    }))
  }

  // Simple text extraction from JSX (for demo purposes)
  const extractTextFromJSX = (jsxContent) => {
    if (typeof jsxContent === 'string') {
      return jsxContent
    }
    // For JSX elements, extract text recursively
    if (jsxContent && jsxContent.props) {
      if (jsxContent.props.children) {
        if (typeof jsxContent.props.children === 'string') {
          return jsxContent.props.children
        }
        if (Array.isArray(jsxContent.props.children)) {
          return jsxContent.props.children
            .map(child => extractTextFromJSX(child))
            .join(' ')
        }
      }
    }
    return ''
  }

  const getExcerpt = (text, query, length) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text.substring(0, length) + '...'
    
    const start = Math.max(0, index - length / 2)
    const end = Math.min(text.length, index + query.length + length / 2)
    return '...' + text.substring(start, end) + '...'
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Search manual sections and build RAG chunks for backend
      const manualResults = searchManual(input.trim())
      const chunks = buildRAGChunks(manualResults)

      // Call backend help endpoint (with RAG chunks when available)
      const response = await axios.post('/api/v1/ai/help', {
        query: input.trim(),
        chunks: chunks.length > 0 ? chunks : undefined
      })

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.answer || "I'm here to help! Check the User Manual for detailed information.",
        timestamp: new Date(),
        suggestions: response.data.suggestions || [],
        manualResults: manualResults.slice(0, 3) // Top 3 results
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error getting help:', error)
      
      // Fallback: search manual locally
      const manualResults = searchManual(input.trim())
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: manualResults.length > 0
          ? `I found ${manualResults.length} relevant section(s) in the User Manual. Check the suggestions below for more details.`
          : "I couldn't find specific information about that. Please check the User Manual or try rephrasing your question.",
        timestamp: new Date(),
        manualResults: manualResults.slice(0, 3)
      }

      setMessages(prev => [...prev, botMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    setIsOpen(true)
    setTimeout(() => {
      handleSend()
    }, 100)
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
          aria-label="Open chatbot"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-primary-600 dark:bg-primary-700 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <HelpCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                <p className="text-xs text-white/80">Help & Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close chatbot"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Manual Results */}
                  {message.manualResults && message.manualResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold opacity-80 mb-2">Relevant Manual Sections:</p>
                      {message.manualResults.map((result, idx) => (
                        <a
                          key={idx}
                          href={`/user-manual#${result.sectionId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs p-2 bg-white/10 dark:bg-gray-600 rounded-lg hover:bg-white/20 dark:hover:bg-gray-500 transition-colors"
                        >
                          <div className="font-medium">{result.section}</div>
                          <div className="text-xs opacity-80 mt-1 line-clamp-2">{result.excerpt}</div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-semibold opacity-80 mb-2">Suggested Questions:</p>
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs p-2 bg-white/10 dark:bg-gray-600 rounded-lg hover:bg-white/20 dark:hover:bg-gray-500 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                disabled={loading}
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Powered by AI • <a href="/user-manual" className="text-primary-600 dark:text-primary-400 hover:underline">View Full Manual</a>
            </p>
          </div>
        </div>
      )}
    </>
  )
}
