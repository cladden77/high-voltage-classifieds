'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Send, MessageCircle, Search, ArrowLeft, AlertCircle } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Database } from '@/lib/database.types'
import { useSearchParams } from 'next/navigation'

type MessageWithDetails = Database['public']['Tables']['messages']['Row'] & {
  sender: Database['public']['Tables']['users']['Row'] | null
  recipient: Database['public']['Tables']['users']['Row'] | null
  listing: Database['public']['Tables']['listings']['Row'] | null
}

type Conversation = {
  id: string
  otherUser: Database['public']['Tables']['users']['Row'] | null
  listing: Database['public']['Tables']['listings']['Row'] | null
  lastMessage: MessageWithDetails
  unreadCount: number
  totalMessages: number
}

function MessagesContent() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const searchParams = useSearchParams()

  const supabase = createClientSupabase()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (currentUser) {
      fetchConversations()
    }
  }, [currentUser])

  useEffect(() => {
    // Check for conversation parameter in URL
    const conversationParam = searchParams.get('conversation')
    if (conversationParam && conversations.length > 0) {
      setSelectedConversation(conversationParam)
    }
  }, [searchParams, conversations])

  useEffect(() => {
    if (selectedConversation && currentUser) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation, currentUser])

  const checkAuth = async () => {
    try {
      setError(null)
      const user = await getCurrentUser()
      if (!user) {
        window.location.href = '/auth/signin'
        return
      }

      setCurrentUser(user)
    } catch (error) {

      setError('Authentication failed. Please sign in again.')
      setTimeout(() => {
        window.location.href = '/auth/signin'
      }, 2000)
    }
  }

  const fetchConversations = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      setError(null)

      
      // First, get all messages involving the current user
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          listing_id,
          message_text,
          is_read,
          created_at
        `)
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })

      if (messageError) {
        throw new Error(`Database error: ${messageError.message}`)
      }



      if (!messageData || messageData.length === 0) {
        setConversations([])
        setLoading(false)
        return
      }

      // Get unique user IDs and listing IDs
      const userIds = new Set<string>()
      const listingIds = new Set<string>()
      
      messageData.forEach(msg => {
        userIds.add(msg.sender_id)
        userIds.add(msg.recipient_id)
        listingIds.add(msg.listing_id)
      })

      // Also fetch the sellers of the listings to ensure we have all users
      const { data: listingsData } = await supabase
        .from('listings')
        .select('id, seller_id')
        .in('id', Array.from(listingIds))

      if (listingsData) {
        listingsData.forEach(listing => {
          if (listing.seller_id) {
            userIds.add(listing.seller_id)
          }
        })
      }

      // Fetch users and listings separately
      const [usersResponse, listingsResponse] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .in('id', Array.from(userIds)),
        supabase
          .from('listings')
          .select('*')
          .in('id', Array.from(listingIds))
      ])

      if (usersResponse.error) {
        throw new Error(`Users fetch error: ${usersResponse.error.message}`)
      }

      if (listingsResponse.error) {
        throw new Error(`Listings fetch error: ${listingsResponse.error.message}`)
      }

      const usersMap = new Map((usersResponse.data || []).map(user => [user.id, user]))
      const listingsMap = new Map((listingsResponse.data || []).map(listing => [listing.id, listing]))

      // Group messages into conversations by listing
      const conversationMap = new Map<string, Conversation>()
      
      messageData.forEach((message) => {
        const conversationKey = message.listing_id
        const isCurrentUserSender = message.sender_id === currentUser.id
        const otherUserId = isCurrentUserSender ? message.recipient_id : message.sender_id
        
        const sender = usersMap.get(message.sender_id) || null
        const recipient = usersMap.get(message.recipient_id) || null
        const otherUser = usersMap.get(otherUserId) || null
        const listing = listingsMap.get(message.listing_id) || null

        const messageWithDetails: MessageWithDetails = {
          ...message,
          sender: sender,
          recipient: recipient,
          listing: listing,
        }

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            otherUser,
            listing,
            lastMessage: messageWithDetails,
            unreadCount: !message.is_read && !isCurrentUserSender ? 1 : 0,
            totalMessages: 1
          })
        } else {
          const conversation = conversationMap.get(conversationKey)!
          // Update unread count
          if (!message.is_read && !isCurrentUserSender) {
            conversation.unreadCount++
          }
          conversation.totalMessages++
          // Keep the most recent message as the last message
          if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
            conversation.lastMessage = messageWithDetails
          }
        }
      })

      const conversationsList = Array.from(conversationMap.values())

      setConversations(conversationsList)
    } catch (error: any) {

      setError(error?.message || 'Failed to load conversations. Please try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (listingId: string) => {
    if (!currentUser) return

    try {
      setError(null)


      // Get messages for this listing
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          listing_id,
          message_text,
          is_read,
          created_at
        `)
        .eq('listing_id', listingId)
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true })

      if (messageError) {
        throw messageError
      }

      if (!messageData || messageData.length === 0) {
        setMessages([])
        return
      }

      // Get user and listing data
      const userIds = new Set<string>()
      messageData.forEach(msg => {
        userIds.add(msg.sender_id)
        userIds.add(msg.recipient_id)
      })

      const [usersResponse, listingResponse] = await Promise.all([
        supabase
          .from('users')
          .select('*')
          .in('id', Array.from(userIds)),
        supabase
          .from('listings')
          .select('*')
          .eq('id', listingId)
          .single()
      ])

      if (usersResponse.error) throw usersResponse.error
      if (listingResponse.error) throw listingResponse.error

      const usersMap = new Map(usersResponse.data?.map(user => [user.id, user]) || [])

      const messagesWithDetails: MessageWithDetails[] = messageData.map(message => ({
        ...message,
        sender: usersMap.get(message.sender_id) || null,
        recipient: usersMap.get(message.recipient_id) || null,
        listing: listingResponse.data || null
      }))


      setMessages(messagesWithDetails)

      // Mark messages as read
      const unreadMessages = messageData.filter(msg => 
        !msg.is_read && msg.recipient_id === currentUser.id
      )

      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('listing_id', listingId)
          .eq('recipient_id', currentUser.id)
          .eq('is_read', false)

        // Refresh conversations to update unread counts
        fetchConversations()
      }

    } catch (error) {

      setError('Failed to load messages.')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser || sending) return

    try {
      setSending(true)
      setError(null)

      const conversation = conversations.find(c => c.id === selectedConversation)
      if (!conversation) {
        throw new Error('Conversation not found')
      }

      if (!conversation.otherUser?.id) {
        // Try to find the other user from the messages
        const conversationMessages = messages.filter(m => m.listing_id === selectedConversation)
        
        // Find the other user ID - it's the user who is NOT the current user
        let otherUserId: string | undefined
        
        if (conversationMessages.length > 0) {
          // Look for any message where the current user is either sender or recipient
          const firstMessage = conversationMessages[0]
          if (firstMessage.sender_id === currentUser.id) {
            // Current user is sender, so recipient is the other user
            otherUserId = firstMessage.recipient_id
          } else if (firstMessage.recipient_id === currentUser.id) {
            // Current user is recipient, so sender is the other user
            otherUserId = firstMessage.sender_id
          }
        }

        if (!otherUserId) {
          setError('Unable to determine recipient. Please refresh the page and try again.')
          return
        }

        const response = await fetch('/api/messages/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing_id: selectedConversation,
            message_text: newMessage.trim(),
            recipient_id: otherUserId
          })
        })

        const result = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(result?.error || `HTTP ${response.status}`)
        }

        setNewMessage('')
        
        // Refresh messages and conversations
        await Promise.all([
          fetchMessages(selectedConversation),
          fetchConversations()
        ])
        return
      }

      const response = await fetch('/api/messages/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: selectedConversation,
          message_text: newMessage.trim(),
          recipient_id: conversation.otherUser.id
        })
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result?.error || `HTTP ${response.status}`)
      }

      setNewMessage('')
      
      // Refresh messages and conversations
      await Promise.all([
        fetchMessages(selectedConversation),
        fetchConversations()
      ])

    } catch (error: any) {
      console.error('💥 Message send error:', error)
      setError(`Failed to send message: ${error.message || 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId)
    
    // Immediately clear the unread count in the UI for instant visual feedback
    setConversations(prevConversations => {
      const updatedConversations = prevConversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
      return updatedConversations
    })
    
    // Update URL without the conversation parameter
    const url = new URL(window.location.href)
    url.searchParams.delete('conversation')
    window.history.replaceState({}, '', url.toString())
    
    // Mark messages as read in the database
    if (currentUser) {
      try {
        const { count } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('listing_id', conversationId)
          .eq('recipient_id', currentUser.id)
          .eq('is_read', false)
        
        // If database update successful, refresh conversations to ensure consistency
        if (count && count > 0) {
          setTimeout(() => {
            fetchConversations()
          }, 500)
        }
      } catch (error) {
        // If database update fails, restore the unread count
        setConversations(prevConversations => {
          const restoredConversations = prevConversations.map(conv => {
            if (conv.id === conversationId) {
              // Find the original unread count from the current messages
              const unreadMessages = messages.filter(msg => 
                !msg.is_read && msg.recipient_id === currentUser.id
              )
              return { ...conv, unreadCount: unreadMessages.length }
            }
            return conv
          })
          return restoredConversations
        })
      }
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    const listingTitle = conversation.listing?.title?.toLowerCase() || ''
    const otherName = conversation.otherUser?.full_name?.toLowerCase() || conversation.otherUser?.email?.toLowerCase() || ''
    const q = searchTerm.toLowerCase()
    return listingTitle.includes(q) || otherName.includes(q)
  })

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Back to Dashboard Link */}
        {currentUser && (
          <div className="mb-6">
            <a 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-open-sans text-sm font-medium">Back to Dashboard</span>
            </a>
          </div>
        )}

        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Messages
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Communicate with buyers and sellers
          </p>
          {currentUser && (
            <p className="font-open-sans text-sm text-gray-400 mt-2">
              Logged in as: {currentUser.name} ({currentUser.role})
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="font-open-sans text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-[70vh] lg:h-[600px] flex">
          {/* Conversations List */}
          <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 lg:border-r border-gray-200 flex-col`}>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 lg:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-base lg:text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="font-open-sans text-gray-500">
                    {conversations.length === 0 ? 'No conversations yet' : 'No conversations match your search'}
                  </p>
                  {conversations.length === 0 && (
                    <p className="font-open-sans text-sm text-gray-400 mt-2">
                      Visit a listing and click "Message Seller" to start a conversation
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => selectConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-orange-50 lg:border-r-2 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-open-sans font-bold text-sm text-gray-900 truncate">
                          {conversation.otherUser?.full_name || conversation.otherUser?.email || 'Unknown User'}
                        </h3>
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-open-sans text-xs text-gray-500">
                            {(() => {
                               const date = new Date(conversation.lastMessage.created_at)
                              const now = new Date()
                              const diffTime = Math.abs(now.getTime() - date.getTime())
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                              
                              if (diffDays === 1) {
                                return 'Today'
                              } else if (diffDays === 2) {
                                return 'Yesterday'
                              } else if (diffDays <= 7) {
                                return date.toLocaleDateString('en-US', { weekday: 'short' })
                              } else {
                                return date.toLocaleDateString()
                              }
                            })()}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full transition-all duration-300 ease-in-out">
                              {conversation.unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="font-open-sans text-sm text-gray-600 mb-2 truncate">
                         Re: {conversation.listing?.title || 'Listing unavailable'}
                      </p>
                      <p className="font-open-sans text-sm text-gray-500 truncate">
                         {conversation.lastMessage?.message_text || ''}
                      </p>
                      <p className="font-open-sans text-xs text-gray-400 mt-1">
                        {conversation.totalMessages} message{conversation.totalMessages !== 1 ? 's' : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} w-full lg:w-2/3 flex-col`}>
            {selectedConversation ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-open-sans font-bold text-lg text-gray-900">
                        {(() => {
                          const conv = conversations.find(c => c.id === selectedConversation)
                          return conv?.otherUser?.full_name || conv?.otherUser?.email || 'Unknown User'
                        })()}
                      </h2>
                      <p className="font-open-sans text-sm text-gray-500">
                        Re: {(() => {
                          const conv = conversations.find(c => c.id === selectedConversation)
                          return conv?.listing?.title || 'Listing unavailable'
                        })()}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedConversation(null)
                        // Update URL without the conversation parameter
                        const url = new URL(window.location.href)
                        url.searchParams.delete('conversation')
                        window.history.replaceState({}, '', url.toString())
                      }}
                      className="lg:hidden p-2 text-gray-400 hover:text-gray-600 flex items-center gap-2"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      <span className="font-open-sans text-sm">Back</span>
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isCurrentUser = message.sender_id === currentUser?.id
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                              isCurrentUser
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className={`font-open-sans text-xs ${
                                isCurrentUser ? 'text-orange-100' : 'text-gray-500'
                              }`}>
                                {isCurrentUser ? 'You' : message.sender?.full_name || message.sender?.email || 'Unknown'}
                              </span>
                            </div>
                            <p className="font-open-sans text-sm whitespace-pre-wrap">
                              {message.message_text}
                            </p>
                            <p className={`font-open-sans text-xs mt-2 ${
                              isCurrentUser ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {(() => {
                                const date = new Date(message.created_at)
                                const now = new Date()
                                const diffTime = Math.abs(now.getTime() - date.getTime())
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                
                                if (diffDays === 1) {
                                  return `Today at ${date.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}`
                                } else if (diffDays === 2) {
                                  return `Yesterday at ${date.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}`
                                } else if (diffDays <= 7) {
                                  return `${date.toLocaleDateString('en-US', { weekday: 'short' })} at ${date.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}`
                                } else {
                                  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}`
                                }
                              })()}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={sending}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      {sending && (
                        <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="font-open-sans text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

// Loading component for Suspense fallback
function MessagesLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-16 bg-gray-200 rounded-lg w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Main page component with Suspense boundary
export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  )
} 