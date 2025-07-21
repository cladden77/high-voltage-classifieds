'use client'

import React, { useState, useEffect } from 'react'
import { Send, MessageCircle, Search, ArrowLeft } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { Database } from '@/lib/database.types'

type MessageWithDetails = Database['public']['Tables']['messages']['Row'] & {
  sender: Database['public']['Tables']['users']['Row']
  recipient: Database['public']['Tables']['users']['Row']
  listings: Database['public']['Tables']['listings']['Row']
}

type Conversation = {
  id: string
  otherUser: Database['public']['Tables']['users']['Row']
  listing: Database['public']['Tables']['listings']['Row']
  lastMessage: MessageWithDetails
  unreadCount: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageWithDetails[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

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
    if (selectedConversation && currentUser) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation, currentUser])

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        window.location.href = '/auth/signin'
        return
      }
      setCurrentUser(user)
    } catch (error) {
      console.error('Error checking auth:', error)
      window.location.href = '/auth/signin'
    }
  }

  const fetchConversations = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      
      // Fetch messages where current user is sender or recipient
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name, email, role),
          recipient:recipient_id(id, full_name, email, role),
          listings:listing_id(id, title, price, category, location, seller_id)
        `)
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages into conversations by listing
      const conversationMap = new Map<string, Conversation>()
      
      data?.forEach((message) => {
        const conversationKey = `${message.listing_id}`
        const isCurrentUserSender = message.sender_id === currentUser.id
        const otherUser = isCurrentUserSender ? message.recipient : message.sender

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            otherUser: otherUser,
            listing: message.listings,
            lastMessage: message,
            unreadCount: !message.read && !isCurrentUserSender ? 1 : 0
          })
        }
      })

      setConversations(Array.from(conversationMap.values()))
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (listingId: string) => {
    if (!currentUser) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, full_name, email, role),
          recipient:recipient_id(id, full_name, email, role),
          listings:listing_id(id, title, price, category, location)
        `)
        .eq('listing_id', listingId)
        .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('listing_id', listingId)
        .eq('recipient_id', currentUser.id)
        .eq('read', false)

    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return

    try {
      const conversation = conversations.find(c => c.id === selectedConversation)
      if (!conversation) return

      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: conversation.otherUser.id,
          listing_id: selectedConversation,
          message_text: newMessage.trim(),
        })

      if (error) throw error

      setNewMessage('')
      fetchMessages(selectedConversation)
      fetchConversations() // Refresh to update last message

    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const filteredConversations = conversations.filter(conversation =>
    conversation.listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.otherUser.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Messages
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Communicate with buyers and sellers
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-[600px] flex">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  <p className="font-open-sans text-gray-500">No conversations yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-open-sans font-bold text-sm text-gray-900 truncate">
                          {conversation.otherUser.full_name || 'Unknown User'}
                        </h3>
                        <span className="font-open-sans text-xs text-gray-500">
                          {new Date(conversation.lastMessage.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-open-sans text-sm text-gray-600 mb-2 truncate">
                        Re: {conversation.listing.title}
                      </p>
                      <p className="font-open-sans text-sm text-gray-500 truncate">
                        {conversation.lastMessage.message_text}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <div className="mt-2">
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-open-sans font-bold text-lg text-gray-900">
                        {conversations.find(c => c.id === selectedConversation)?.otherUser.full_name || 'Unknown User'}
                      </h2>
                      <p className="font-open-sans text-sm text-gray-500">
                        Re: {conversations.find(c => c.id === selectedConversation)?.listing.title}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedConversation(null)}
                      className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
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
                          <p className="font-open-sans text-sm whitespace-pre-wrap">
                            {message.message_text}
                          </p>
                          <p className={`font-open-sans text-xs mt-2 ${
                            isCurrentUser ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
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
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Send className="h-4 w-4" />
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