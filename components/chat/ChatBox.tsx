"use client"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { RefreshCw, Send, WifiOff } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type FC, type ReactElement } from "react"
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import { Input } from "@components/ui/Input"
import { Button } from "@components/ui/Button"

export type ChatMessage = {
  id?: string
  roomId: bigint | string
  userId: string
  userName: string
  message: string
  createdAt: string
}

interface ChatBoxProps {
  roomId: string
  userId: string
  userName: string
}

// Type for a channel with an unsubscribe method
interface Channel {
  unsubscribe: () => void
}

export const ChatBox: FC<ChatBoxProps> = ({ roomId, userId, userName }): ReactElement => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')
  const [reconnecting, setReconnecting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createSupabaseBrowserClient() as SupabaseClient
  const isRemoteChangeRef = useRef(false) // Track if change is from remote source
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref for the save timeout
  const chatChannelRef = useRef<Channel | null>(null) // Store the channel references for reconnection
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null) // Store the broadcast channel

  // Set up all real-time subscriptions
  const setupSubscriptions = useCallback(async () => {
    if (!roomId) return

    setConnectionStatus('connecting')
    console.log("Setting up realtime subscription for chat messages")

    try {
      // Fetch initial messages
      const { data, error } = await supabase
        .from("CollabChat")
        .select("*")
        .eq("roomId", roomId)
        .order("createdAt", { ascending: true })
        .limit(100)

      if (error) {
        console.error("Error fetching chat messages:", error)
        setConnectionStatus('disconnected')
        return
      }

      console.log("Fetched chat messages:", data)
      setMessages(data || [])

      // Create a broadcast channel for real-time messages
      // Type definition for the broadcast channel
      const broadcastChannel = supabase.channel(`chat-room:${roomId}`, {
        config: {
          broadcast: {
            self: false, // Don't send messages to yourself
          },
        },
      })

      // Use a typed listener for the broadcast events
      // This approach uses type assertion to safely handle the broadcast channel
      type BroadcastPayload = {
        payload?: ChatMessage;
      }
      
      type BroadcastListener = {
        on: (event: string, filter: object, callback: (payload: BroadcastPayload) => void) => BroadcastListener;
        subscribe: (callback: (status: string) => void) => void;
      }
      
      // Cast to the typed interface to make TypeScript happy
      const typedChannel = broadcastChannel as unknown as BroadcastListener
      
      // Listen for broadcasted messages
      typedChannel.on(
        'broadcast', 
        { event: 'chat_message' }, 
        (payload: { payload?: ChatMessage }) => {
          console.log("Received broadcasted chat message:", payload)
          if (payload.payload && payload.payload.userId !== userId) {
            // Add the message directly to state with proper type assertion
            setMessages((prev) => [...prev, payload.payload as ChatMessage])
          }
        }
      )
        .subscribe((status: string) => {
          console.log("Chat broadcast channel status:", status)
          // Update connection status based on subscription status
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected')
            setReconnecting(false)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setConnectionStatus('disconnected')
          } else {
            setConnectionStatus('connecting')
          }
        })

      // Store channel reference for later cleanup/reconnection
      broadcastChannelRef.current = broadcastChannel

      // Subscribe to changes on the CollabChat table
      const chatChannel = supabase
        .channel("table-db-changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "CollabChat",
            filter: `roomId=eq.${roomId}`,
          },
          (payload: { new: ChatMessage }) => {
            console.log("Database change received for chat:", payload)

            // Only update if the message was sent by another user
            if (payload.new && payload.new.userId !== userId) {
              console.log("Applying remote message from user:", payload.new.userId)

              // Set flag to indicate this is a remote change
              isRemoteChangeRef.current = true

              // Add message to state
              setMessages((prev) => {
                // Check if already exists first to avoid duplicates with broadcast
                const exists = prev.some(msg => msg.id === payload.new.id)
                if (exists) return prev
                return [...prev, payload.new]
              })
            }
          },
        )
        .subscribe((status: string) => {
          console.log("Chat table subscription status:", status)

          // Update connection status based on database subscription
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected')
            setReconnecting(false)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            setConnectionStatus('disconnected')
          }
        })

      // Store channel reference for later cleanup/reconnection
      chatChannelRef.current = chatChannel

      // Prepare cleanup function
      const cleanup = () => {
        console.log("Cleaning up chat realtime subscriptions")
        chatChannel.unsubscribe()
        broadcastChannel.unsubscribe()
      }

      return cleanup
    } catch (err) {
      console.error("Error setting up subscriptions:", err)
      setConnectionStatus('disconnected')
      return undefined
    }
  }, [roomId, supabase, userId])

  // Handle reconnection
  const handleReconnect = useCallback(async () => {
    setReconnecting(true)

    // Clean up existing subscriptions if any
    if (chatChannelRef.current) {
      chatChannelRef.current.unsubscribe()
      chatChannelRef.current = null
    }

    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.unsubscribe()
      broadcastChannelRef.current = null
    }

    // Set up subscriptions again
    await setupSubscriptions()
  }, [setupSubscriptions])

  // Initial setup of subscriptions
  useEffect(() => {
    const cleanupFn = setupSubscriptions()

    // Cleanup subscriptions on unmount
    return () => {
      if (cleanupFn && typeof cleanupFn.then === 'function') {
        // Handle the promise returned by setupSubscriptions
        cleanupFn.then((cleanup: (() => void) | undefined) => {
          if (cleanup && typeof cleanup === 'function') {
            cleanup()
          }
        }).catch(err => {
          console.error("Error during cleanup:", err)
        })
      }

      // Clear any pending timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [setupSubscriptions])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    // Only scroll if we have a ref
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length])

  // Send message to database
  const updateMessageInDatabase = async (messageText: string) => {
    if (!messageText.trim() || !roomId || !userId) return

    try {
      // Skip if this is a remote change being applied
      if (isRemoteChangeRef.current) {
        console.log("Skipping save for remote change")
        isRemoteChangeRef.current = false
        return
      }

      console.log("Saving message to database")
      setIsLoading(true)

      // Convert roomId to BigInt
      const roomIdBigInt = BigInt(roomId)

      // Create the message object
      const newChatMessage = {
        roomId: roomIdBigInt.toString(),
        userId,
        userName,
        message: messageText.trim(),
        createdAt: new Date().toISOString(),
      }

      // Broadcast message to the channel for real-time updates
      try {
        const broadcastChannel = supabase.channel(`chat-room:${roomId}`)
        // Use the same type definition for sending messages
        type BroadcastPayload = {
          type: string;
          event: string;
          payload: ChatMessage;
        }
        
        type BroadcastSender = {
          send: (payload: BroadcastPayload) => Promise<void>;
        }
        
        // Cast to the sender interface
        const typedSender = broadcastChannel as unknown as BroadcastSender
        
        // Send the message through the typed interface
        await typedSender.send({
          type: 'broadcast',
          event: 'chat_message',
          payload: newChatMessage,
        })
        console.log("Message broadcasted successfully")
      } catch (broadcastErr) {
        console.error("Failed to broadcast message:", broadcastErr)
      }

      // Insert into database
      const { error } = await supabase
        .from("CollabChat")
        .insert(newChatMessage)

      if (error) {
        console.error("Error inserting chat message:", error)
      } else {
        console.log("Message saved successfully")
        setNewMessage("") // Clear input on success
      }
    } catch (err) {
      console.error("Failed to insert message:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle message input change
  const handleMessageChange = (value: string) => {
    setNewMessage(value)
  }

  // Handle message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    // Add message to UI immediately (optimistic update)
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      roomId,
      userId,
      userName,
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, optimisticMessage as ChatMessage])

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Send to database immediately
    updateMessageInDatabase(newMessage)
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-medium text-gray-200">Chat</h3>
        
        {/* Connection status indicator */}
        {connectionStatus === 'disconnected' && (
          <Button 
            type="button"
            onClick={handleReconnect}
            disabled={reconnecting}
            className="flex items-center px-2 py-1 text-xs rounded bg-red-800/40 hover:bg-red-700/50 text-red-200 transition-colors"
            title="Connection lost. Click to reconnect"
          >
            {reconnecting ? (
              <>
                <RefreshCw size={14} className="animate-spin mr-1" /> 
                <span>Reconnecting...</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="mr-1" /> 
                <span>Reconnect</span>
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Messages container */}
      <div className="flex-grow overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-3">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.userId === userId 
                    ? 'bg-blue-700/60 text-white' 
                    : 'bg-gray-700 text-gray-200'
                }`}
              >
                <div className="text-xs opacity-80 mb-1">
                  {msg.userId === userId ? 'You' : msg.userName}
                </div>
                <p className="break-words">{msg.message}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
        <div className="flex">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow bg-gray-700 text-white rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || connectionStatus === 'disconnected'}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isLoading || connectionStatus === 'disconnected'}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  )
}
