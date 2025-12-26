import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlowCard } from '@/components/magic/GlowCard'
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  X,
  Minimize2,
  Sparkles,
} from 'lucide-react'
import { chatWithAI, ChatMessage } from '@/lib/ai'
import { useToast } from '@/components/ui/use-toast'

export function AIChatWidget() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider ?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [messages, isOpen, isMinimized])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatWithAI([...messages, userMessage])
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response?.data?.content || response?.content || 'Désolé, je n\'ai pas pu générer de réponse.',
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error?.message || 'Impossible de communiquer avec l\'IA',
        variant: 'destructive',
      })
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleChat = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false)
    } else if (isOpen && !isMinimized) {
      setIsOpen(false)
    } else {
      setIsOpen(true)
      setIsMinimized(false)
    }
  }

  const minimizeChat = () => {
    setIsMinimized(true)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Bouton flottant */}
      {!isOpen && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={toggleChat}
            size="lg"
            className="h-16 w-16 rounded-full bg-primary shadow-lg hover:shadow-xl transition-shadow relative group"
          >
            <Sparkles className="h-6 w-6 absolute group-hover:animate-pulse" />
            <MessageSquare className="h-5 w-5 absolute opacity-80" />
          </Button>
        </motion.div>
      )}

      {/* Widget de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-96"
          >
            <GlowCard className="overflow-hidden">
              {/* Header - Toujours visible - Hauteur fixe */}
              <div className="flex items-center justify-between p-4 border-b bg-primary/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Chat IA</h3>
                    <p className="text-xs text-muted-foreground">En ligne</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!isMinimized && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={minimizeChat}
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleChat}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages - Hauteur fixe avec scroll */}
                  <div 
                    className="overflow-y-auto p-4 space-y-4 bg-background"
                    style={{ height: '440px' }}
                  >
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex gap-2 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 justify-start"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input - Toujours visible en bas - Hauteur fixe */}
                  <div className="p-4 border-t bg-background">
                    <div className="flex gap-2">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Tapez votre message..."
                        disabled={loading}
                        className="flex-1 text-sm"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        size="icon"
                        className="shrink-0"
                      >
                        {loading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </GlowCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}