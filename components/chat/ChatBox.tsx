"use client"
import { searchUsers } from "@/app/actions/search"
import { createSupabaseBrowserClient } from "@utils/supabase/client"
import { RefreshCw, Send, WifiOff, User, Bell } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type FC, type ReactElement } from "react"
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import { Input } from "@components/ui/Input"
import { Button } from "@components/ui/Button"
import { useUser } from "@stackframe/stack"
import { Badge } from "@components/ui/Badge"
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/Avatar"
import { avatarPlaceholder } from "@utils/image.helpers"
import { firstLetterToUpper } from "@utils/string.helpers"
import { createChatMentionNotification } from "@utils/notification.service"

export type ChatMessage = {
  id?: string
  roomId: bigint | string
  userId: string
  userName: string
  message: string
  createdAt: string
  mentions?: MentionedUser[]
}

export type MentionedUser = {
  id: string
  userName: string
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
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createSupabaseBrowserClient() as SupabaseClient
  const isRemoteChangeRef = useRef(false) // Track if change is from remote source
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref for the save timeout
  const chatChannelRef = useRef<Channel | null>(null) // Store the channel references for reconnection
  const broadcastChannelRef = useRef<RealtimeChannel | null>(null) // Store the broadcast channel

  // User mention related states
  const [mentionedUsers, setMentionedUsers] = useState<MentionedUser[]>([])
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionSearchValue, setMentionSearchValue] = useState("")
  const [startMentionIndex, setStartMentionIndex] = useState(-1)
  const [searchResults, setSearchResults] = useState<{ id: string, userName: string, avatarUrl?: string | null }[]>([])
  const [roomUsers, setRoomUsers] = useState<{ id: string, userName: string }[]>([])

  // Search related states
  const [debouncedMentionValue, setDebouncedMentionValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Minimum characters required for search
  const MIN_SEARCH_LENGTH = 2

  // Notification related states
  const [notifications, setNotifications] = useState<{ id: string, message: string }[]>([])
  const [hasUnreadMention, setHasUnreadMention] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Function to check if a message mentions the current user
  const checkForUserMention = useCallback((message: ChatMessage) => {
    if (message.userId === userId) return false; // Don't notify for own messages

    const mentionRegex = new RegExp(`@${userName}\\b`, 'i');
    return mentionRegex.test(message.message);
  }, [userId, userName]);

  // Debounce the mention search value
  useEffect(() => {
    if (!mentionSearchValue) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      setDebouncedMentionValue(mentionSearchValue)
    }, 300)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [mentionSearchValue])

  // Perform the user search when the debounced value changes
  useEffect(() => {
    const performSearch = async () => {
      const trimmedSearch = debouncedMentionValue.trim()
      if (!trimmedSearch) {
        setSearchResults([])
        return
      }

      // Only search if the query is at least MIN_SEARCH_LENGTH characters
      if (trimmedSearch.length < MIN_SEARCH_LENGTH) {
        return
      }

      setIsSearching(true)
      try {
        // Use the server action to search for users
        const results = await searchUsers(debouncedMentionValue)

        // Additional client-side filtering to ensure results contain the search term
        const filteredResults = results.filter((result) => {
          const userName = (result.userName || "").toLowerCase()
          const email = (result.email || "").toLowerCase()
          const searchTerm = debouncedMentionValue.toLowerCase()

          return userName.includes(searchTerm) || email.includes(searchTerm)
        }).map(result => ({
          id: result.id,
          userName: result.userName || "Unknown",
          avatarUrl: result.userAvatarUrl
        }))

        setSearchResults(filteredResults)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedMentionValue])

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

      // Parse message content for mentions if any
      const parsedMessages = data?.map(msg => {
        // Try to parse mentions from message
        const mentions = parseMentionsFromMessage(msg.message);
        return {
          ...msg,
          mentions: mentions
        };
      }) || [];

      setMessages(parsedMessages)

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
            const message = payload.payload as ChatMessage;

            // Add the message directly to state with proper type assertion
            setMessages((prev) => [...prev, message])

            // Check if the current user is mentioned in this message
            // Either by direct username mention or by the message having mentions that include current user
            const isUsernameMentioned = message.message.includes(`@${userName}`);
            const isUserIdMentioned = message.mentions?.some(mention => mention.id === userId);

            if (isUsernameMentioned || isUserIdMentioned) {
              // Create a notification for the mention
              try {
                createChatMentionNotification(
                  message.userId,
                  userId,
                  roomId,
                  message.message
                );

                setHasUnreadMention(true);
                setNotifications(prev => [
                  ...prev,
                  {
                    id: `${Date.now()}`,
                    message: `You were mentioned by ${message.userName}`
                  }
                ]);

                // Play notification sound
                try {
                  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                  const oscillator = audioContext.createOscillator();
                  const gainNode = audioContext.createGain();

                  oscillator.type = 'sine';
                  oscillator.frequency.value = 880; // A5 note
                  gainNode.gain.value = 0.1;

                  oscillator.connect(gainNode);
                  gainNode.connect(audioContext.destination);

                  oscillator.start();
                  setTimeout(() => {
                    oscillator.stop();
                  }, 200);
                } catch (err) {
                  console.log('Audio not supported in this browser');
                }
              } catch (err) {
                console.error("Failed to create notification for mention:", err);
              }
            }
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

              // Parse mentions from message
              const mentions = parseMentionsFromMessage(payload.new.message);

              // Add message to state
              setMessages((prev) => {
                // Check if already exists first to avoid duplicates with broadcast
                const exists = prev.some(msg => msg.id === payload.new.id)
                if (exists) return prev
                return [...prev, { ...payload.new, mentions }]
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

  // Parse mentions from a message
  const parseMentionsFromMessage = (message: string): MentionedUser[] => {
    const mentions: MentionedUser[] = [];
    // Look for complete usernames that were previously added to mentionedUsers
    for (const user of mentionedUsers) {
      const mentionPattern = new RegExp(`@${user.userName}\\b`, 'g');
      if (mentionPattern.test(message)) {
        mentions.push({
          id: user.id,
          userName: user.userName
        });
      }
    }

    return mentions;
  };

  // Fetch active users in the room to use for mentions
  const fetchRoomUsers = useCallback(async () => {
    if (!roomId) return;

    try {
      // Fetch joined users for the room from your database/service
      const { data, error } = await supabase
        .from("Collab")
        .select("joined_users")
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Error fetching room users:", error);
        return;
      }

      if (data && data.joined_users) {
        // Assuming joined_users is an array of user objects
        setRoomUsers(data.joined_users);
      }
    } catch (err) {
      console.error("Error in fetchRoomUsers:", err);
    }
  }, [roomId, supabase]);

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

    // Fetch room users for mentions
    fetchRoomUsers();

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
  }, [setupSubscriptions, fetchRoomUsers])

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

      // Check for mentioned users in the message
      const userMentions = parseUsersFromMention(messageText);

      // Send notifications to mentioned users
      if (userMentions.length > 0) {
        // Process each mentioned user
        for (const mentionedUser of userMentions) {
          // Don't send notification to yourself
          if (mentionedUser.id !== userId) {
            try {
              await createChatMentionNotification(
                userId,
                mentionedUser.id,
                roomId,
                messageText
              );
              console.log(`Notification sent to ${mentionedUser.userName}`);
            } catch (err) {
              console.error(`Failed to send notification to ${mentionedUser.userName}:`, err);
            }
          }
        }
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
          payload: {
            ...newChatMessage,
            mentions: mentionedUsers
          },
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
        setMentionedUsers([]) // Clear mentioned users
      }
    } catch (err) {
      console.error("Failed to insert message:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to extract all mentioned users from a message
  const parseUsersFromMention = (message: string): MentionedUser[] => {
    // Get all mentioned users that we've tracked
    return mentionedUsers.filter(user => {
      const mentionPattern = new RegExp(`@${user.userName}\\b`, 'gi');
      return mentionPattern.test(message);
    });
  }

  // Handle message input change
  const handleMessageChange = (value: string) => {
    setNewMessage(value)

    // Check for mentions
    const lastAtIndex = value.lastIndexOf("@")
    if (lastAtIndex !== -1) {
      // Get everything after the @ symbol
      const afterAt = value.substring(lastAtIndex + 1)
      // If nothing after @ or we haven't pressed space after typing part of a name
      const isTypingMention = afterAt === "" || !afterAt.includes(" ");

      if (isTypingMention) {
        // Show suggestions when '@' is typed and we're in the process of writing a name
        setShowMentionSuggestions(true)
        setStartMentionIndex(lastAtIndex)

        // Get the search value after @ symbol
        setMentionSearchValue(afterAt)
      } else {
        // Hide suggestions if user has completed their mention (pressed space)
        setShowMentionSuggestions(false)
      }
    } else {
      // Hide suggestions if no @ symbol
      setShowMentionSuggestions(false)
    }
  }

  // Handle selecting a user for mention
  const handleSelectUser = (id: string, userName: string) => {
    // Add user to mentioned users list if not already included
    setMentionedUsers(prev => {
      // Check if this user is already mentioned
      const userExists = prev.some(user => user.id === id);
      if (!userExists) {
        console.log(`Adding ${userName} (${id}) to mentioned users`);
        return [...prev, { id, userName }];
      }
      return prev;
    });

    // Replace the @searchterm with @username in the input
    // Make sure we keep the entire username together even if it has spaces
    const beforeMention = newMessage.substring(0, startMentionIndex);
    const afterCurrentWord = newMessage.substring(startMentionIndex).indexOf(" ");
    const afterMention = afterCurrentWord > -1
      ? newMessage.substring(startMentionIndex + afterCurrentWord + 1)
      : "";

    // Ensure there's a space after the mention if there's more text
    const spaceAfter = afterMention.length > 0 && !afterMention.startsWith(" ") ? " " : "";
    setNewMessage(`${beforeMention}@${userName}${spaceAfter}${afterMention}`);

    // Hide suggestions
    setShowMentionSuggestions(false);
    setSearchResults([]);

    // Focus back on input
    inputRef.current?.focus();
  }

  // Format message text to highlight mentions
  const formatMessageWithMentions = (message: string): ReactElement => {
    const parts: Array<string | ReactElement> = [];
    let lastIndex = 0;

    // Process known mentioned users first
    for (const user of mentionedUsers) {
      const mentionPattern = new RegExp(`@${user.userName}\\b`, 'g');
      let match;

      while ((match = mentionPattern.exec(message)) !== null) {
        // Add text before the mention
        if (match.index > lastIndex) {
          parts.push(message.substring(lastIndex, match.index));
        }

        // Add the mention as a badge
        const isCurrentUser = user.userName.toLowerCase() === userName.toLowerCase();
        parts.push(
          <Badge
            key={`mention-${match.index}`}
            variant="secondary"
            className={`mx-1 px-2 py-0.5 inline-flex items-center ${isCurrentUser
              ? 'bg-yellow-600/40 text-yellow-200 animate-pulse'
              : 'bg-blue-600/30 text-blue-300'}`}
          >
            <span className="mr-0.5">@</span><span>{user.userName}</span>
          </Badge>
        );

        lastIndex = match.index + match[0].length;
      }
    }

    // Add remaining text after last mention
    if (lastIndex < message.length) {
      parts.push(message.substring(lastIndex));
    }

    return <>{parts}</>;
  };

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
      mentions: mentionedUsers
    }

    setMessages(prev => [...prev, optimisticMessage as ChatMessage])

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Send to database immediately
    updateMessageInDatabase(newMessage)
  }

  // When user views the chat, clear the unread status
  useEffect(() => {
    const handleScroll = () => {
      if (hasUnreadMention && chatContainerRef.current) {
        setHasUnreadMention(false);
      }
    };

    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [hasUnreadMention]);

  return (
    <div className="flex flex-col h-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-200">Chat</h3>
          {hasUnreadMention && (
            <Badge variant="secondary" className="bg-yellow-600/40 text-yellow-200 animate-pulse px-2 py-1">
              <Bell size={12} className="mr-1" /> Mentioned
            </Badge>
          )}
        </div>

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
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-3 space-y-3">
        {notifications.length > 0 && (
          <div className="sticky top-0 z-10 mb-2">
            {notifications.slice(-1).map(notification => (
              <div
                key={notification.id}
                className="bg-yellow-800/40 text-yellow-200 text-xs p-2 rounded flex items-center justify-between"
              >
                <span>{notification.message}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                >
                  <span className="sr-only">Dismiss</span>
                  <WifiOff size={10} />
                </Button>
              </div>
            ))}
          </div>
        )}

        {messages.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-3">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg.id || index}
              className={`flex ${msg.userId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${msg.userId === userId
                  ? 'bg-blue-700/60 text-white'
                  : checkForUserMention(msg)
                    ? 'bg-yellow-800/40 border border-yellow-700/50 text-gray-200'
                    : 'bg-gray-700 text-gray-200'
                  }`}
              >
                <div className="text-xs opacity-80 mb-1 flex items-center gap-1">
                  {msg.userId === userId ? 'You' : msg.userName}
                  {checkForUserMention(msg) && msg.userId !== userId && (
                    <Badge variant="secondary" className="bg-yellow-600/30 text-yellow-200 text-[9px] px-1">
                      Mentioned you
                    </Badge>
                  )}
                </div>
                <div className="break-words">
                  {formatMessageWithMentions(msg.message)}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
        <div className="flex flex-col">
          {/* User mention suggestions */}
          {showMentionSuggestions && (
            <div className="bg-gray-700 rounded-t-lg mb-1 max-h-[150px] overflow-y-auto shadow-lg border border-gray-600">
              {isSearching ? (
                <div className="px-3 py-2 text-gray-300 text-center">
                  <RefreshCw size={14} className="inline-block mr-2 animate-spin" />
                  Searching...
                </div>
              ) : mentionSearchValue.length < MIN_SEARCH_LENGTH ? (
                <div className="px-3 py-2 text-gray-300 text-center">
                  Type at least {MIN_SEARCH_LENGTH} characters to search users
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div
                    key={user.id}
                    className="px-3 py-2 hover:bg-gray-600 cursor-pointer text-sm text-gray-200 flex items-center gap-3"
                    onClick={() => handleSelectUser(user.id, user.userName)}
                  >
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={user.avatarUrl || avatarPlaceholder} />
                      <AvatarFallback>{firstLetterToUpper(user.userName)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate"><span className="opacity-70">@</span>{user.userName}</span>
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-gray-300 text-center">
                  No users found
                </div>
              )}
            </div>
          )}

          <div className="flex">
            <Input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Type a message... (Use @ to mention users)"
              className="flex-grow bg-gray-700 text-white rounded-l-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading || connectionStatus === 'disconnected'}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || isLoading || connectionStatus === 'disconnected'}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
