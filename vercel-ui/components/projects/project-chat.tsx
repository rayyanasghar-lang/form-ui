"use client"

import { useState, useRef, useEffect } from "react"
import { Send, User, Bot, Paperclip, MoreHorizontal, Smile, X, Loader2, ClipboardList, MessageSquare } from "lucide-react"
import { sendProjectMessageAction } from "@/app/actions/project-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { ProjectLogs } from "./project-logs"

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
  chatLogs?: any[] // Logs data for the Logs tab
}


export function ProjectChat({ 
  className, 
  projectId, 
  projectName, 
  collapsed = false, 
  onCollapsedChange, 
  initialMessages = [],
  chatLogs = []
}: ProjectChatProps) {
  const [inputValue, setInputValue] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState<"chat" | "logs">("chat")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Transform API chat logs to internal Message format
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    if (initialMessages) {
       // Helper to unescape common HTML entities
       const unescape = (str: string) => {
         return str
           .replace(/&lt;/g, '<')
           .replace(/&gt;/g, '>')
           .replace(/&amp;/g, '&')
           .replace(/&quot;/g, '"')
           .replace(/&#39;/g, "'")
           .replace(/&apos;/g, "'");
       }

       // Convert API logs to Message interface
       const formattedMessages: Message[] = initialMessages.map(log => {
          let body = String(log.body || log.message || log.content || "").trim()
          if (!body && log.subtype) body = String(log.subtype)
          
          // Unescape if it looks like it has entities
          if (body.includes("&lt;")) body = unescape(body)
          
          let author = "Unknown"
          const authorRaw = log.author
          if (typeof authorRaw === 'string') {
              author = authorRaw
          } else if (Array.isArray(authorRaw) && authorRaw.length > 1) {
              author = String(authorRaw[1])
          } else if (authorRaw && typeof authorRaw === 'object') {
              author = String(authorRaw.name || authorRaw.display_name || "Unknown")
          }

          const authorLower = author.toLowerCase()
          
          // Regex for the portal header added by Odoo - very aggressive matching
          const portalHeaderRegex = /<p><strong>.*?\(via Portal\):<\/strong><\/p>|<strong>.*?\(via Portal\):<\/strong>/gi
          const hasPortalHeader = portalHeaderRegex.test(body)
          
          const isPortal = authorLower.includes("public user") || 
                           authorLower.includes("frontend user") || 
                           authorLower.includes("public") ||
                           authorLower.includes("portal") ||
                           body.includes("(via Portal):") ||
                           hasPortalHeader
          
          let sender: "user" | "system" | "other" = (log.tracking?.length > 0 || log.subtype === "Stage Changed") ? "system" : "other"
          
          if (isPortal) {
              sender = "user"
              author = "You"
              // Remove the redundant portal header from the body
              body = body.replace(portalHeaderRegex, "").trim()
              
              // Clean up redundant wrappers
              body = body.replace(/^<p><\/p>\s*/i, "").trim()
              if (body.startsWith("<p>") && body.endsWith("</p>")) {
                  // If it's the only thing left, we keep it, otherwise we might have triple nested <p>
              }
          } else if (authorLower === "you" || authorLower === "me") {
              sender = "user"
          }
          
          // Force UTC parsing to fix the 5-hour offset (Odoo sends UTC strings without Z)
          let dateStr = String(log.date)
          if (dateStr.includes(" ") && !dateStr.includes("Z") && !dateStr.includes("T")) {
              dateStr = dateStr.replace(" ", "T") + "Z"
          }
          
          return {
            id: log.id.toString(),
            content: body || "(No content)",
            sender: sender,
            timestamp: new Date(dateStr),
            user: {
               name: author
            }
          }
       }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
       
       setMessages(formattedMessages)
    }
  }, [initialMessages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || isSending) return

    setIsSending(true)
    const currentMessage = inputValue
    setInputValue("")

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      content: currentMessage,
      sender: "user",
      timestamp: new Date(),
      user: { name: "You" }
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      const result = await sendProjectMessageAction(projectId, currentMessage)
      if (!result.success) {
        // Rollback or show error
        setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
        console.error("Failed to send message:", result.error)
      }
      // The polling will pick up the real message and replace the optimistic one 
      // since formattedMessages will have the real ID from Odoo.
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
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
      {/* Header with Tabs */}
      <div className="border-b border-border shrink-0 bg-card/80 backdrop-blur-sm">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("chat")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === "chat" 
                  ? "bg-primary text-white shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-white/60"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeTab === "logs" 
                  ? "bg-primary text-white shadow-sm" 
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-white/60"
              )}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              <span>Logs</span>
            </button>
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
      </div>

      {/* Chat Tab Content */}
      {activeTab === "chat" && (
        <>
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
                        <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                     </div>
                  </div>
                )
              }

              return (
                <div key={msg.id} className={cn("flex gap-3 max-w-[90%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                  <Avatar className="h-8 w-8 border border-zinc-100 shrink-0">
                    <AvatarFallback className={cn("text-[10px] font-bold", isMe ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-600")}>
                        {msg.user?.name?.charAt(0) || <User className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("space-y-1", isMe ? "items-end flex flex-col" : "")}>
                    <div className="flex items-center gap-2">
                        {!isMe && <span className="text-[10px] font-bold text-zinc-700">{msg.user?.name}</span>}
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
                        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: msg.content }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Logs Tab Content */}
      {activeTab === "logs" && (
        <ProjectLogs logs={chatLogs} />
      )}

      {/* Input Area - Only show on Chat tab */}
      {activeTab === "chat" && (
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
                  disabled={isSending}
                  className="border-none shadow-none focus-visible:ring-0 px-2 py-6 text-sm bg-transparent min-h-[44px]"
              />
              <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isSending}
                  className="h-9 w-9 bg-primary hover:bg-primary/90 text-white rounded-lg shrink-0 p-0 shadow-md shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
          </form>
          <p className="text-[10px] text-center text-zinc-400 mt-2">
              Press <kbd className="font-sans">Enter</kbd> to send
          </p>
        </div>
      )}
    </div>
  )
}
