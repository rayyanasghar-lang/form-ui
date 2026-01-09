"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, Paperclip, MoreHorizontal, Smile, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  sender: "user" | "system" | "other"
  timestamp: Date
  user?: {
    name: string
    avatar?: string
  }
}

interface ProjectChatProps {
  className?: string
  projectId: string
  projectName: string
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  initialMessages?: any[] // Using any[] for flexibility with API response mapping
}

export function ProjectChat({ className, projectId, projectName, collapsed = false, onCollapsedChange, initialMessages = [] }: ProjectChatProps) {
  const [inputValue, setInputValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Transform API chat logs to internal Message format if needed, or stick to provided structure
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
       // Convert API logs to Message interface
       const formattedMessages: Message[] = initialMessages.map(log => ({
          id: log.id.toString(),
          content: log.subtype === "Stage Changed" 
            ? log.tracking?.[0]?.description || log.body
            : log.body || log.subtype, // Fallback to subtype if body is empty (common in notifications)
          sender: "system" as const, // API logs are mostly system/notifications for now
          timestamp: new Date(log.date),
          user: {
             name: log.author
          }
       })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
       
       setMessages(formattedMessages)
    }
  }, [initialMessages])

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      user: {
        name: "You"
      }
    }

    setMessages([...messages, newMessage])
    setInputValue("")
    
    // Simulate automated response
    setTimeout(() => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            content: "This is an automated demo response.",
            sender: "system",
            timestamp: new Date()
        }])
    }, 1000)
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div 
        className={cn(
            "flex flex-col h-full bg-card border-l border-border transition-all duration-300 ease-in-out relative", 
            collapsed ? 'w-0 overflow-hidden opacity-0 border-l-0' : 'w-96',
            className
        )}
    >
      {/* Header */}
      <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-card/80 backdrop-blur-sm">
        <div>
          <h3 className="font-bold text-zinc-900 text-sm">Project Communications</h3>
          <p className="text-[10px] text-zinc-500 font-medium">#{projectId.slice(0, 8)}</p>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onCollapsedChange?.(true)}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-600 hover:bg-black/5"
        >
           <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {messages.map((msg, index) => {
          const isSystem = msg.sender === "system"
          const isMe = msg.sender === "user"

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                 <div className="bg-zinc-50 border border-zinc-100 rounded-full px-4 py-1.5 text-[10px] text-zinc-500 font-medium flex items-center gap-2">
                    <Bot className="h-3 w-3" />
                    {msg.content}
                 </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className={cn("flex gap-3 max-w-[90%]", isMe ? "ml-auto flex-row-reverse" : "")}>
              <Avatar className="h-8 w-8 border border-zinc-100 shrink-0">
                <AvatarFallback className={cn("text-[10px] font-bold", isMe ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-600")}>
                    {msg.user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={cn("space-y-1", isMe ? "items-end flex flex-col" : "")}>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-zinc-700">{msg.user?.name}</span>
                    <span className="text-[9px] text-zinc-400">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div 
                    className={cn(
                        "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border", 
                        isMe 
                            ? "bg-primary text-white border-primary/20 rounded-tr-sm" 
                            : "bg-white text-zinc-600 border-zinc-100 rounded-tl-sm"
                    )}
                >
                    {msg.content}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-muted/30 shrink-0">
        <form 
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 bg-card rounded-xl border border-border p-1.5 focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/30 transition-all shadow-sm"
        >
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-600 rounded-lg shrink-0">
                <Paperclip className="h-4 w-4" />
            </Button>
            <Input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="border-none shadow-none focus-visible:ring-0 px-2 py-6 text-sm bg-transparent min-h-[44px]"
            />
            <Button 
                type="submit" 
                disabled={!inputValue.trim()}
                className="h-9 w-9 bg-primary hover:bg-primary/90 text-white rounded-lg shrink-0 p-0 shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
            >
                <div className="sr-only">Send</div>
                <Send className="h-4 w-4" />
            </Button>
        </form>
        <p className="text-[10px] text-center text-zinc-400 mt-2">
            Press <kbd className="font-sans">Enter</kbd> to send
        </p>
      </div>
    </div>
  )
}
