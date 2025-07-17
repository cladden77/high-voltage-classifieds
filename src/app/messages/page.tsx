'use client'

import React, { useState, useEffect } from 'react'
import { Send, MessageCircle, Search } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { createClientSupabase } from '@/lib/supabase'
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

  const supabase = createClientSupabase()

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      // TODO: Filter by current user when auth is implemented
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(*),
          recipient:users!recipient_id(*),
          listings(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group messages into conversations
      const conversationMap = new Map<string, Conversation>()
      
      data?.forEach((message) => {
        const conversationKey = `${message.listing_id}`
        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            otherUser: message.sender, // TODO: Logic to determine other user
            listing: message.listings,
            lastMessage: message,
            unreadCount: message.read ? 0 : 1
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

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(*),
          recipient:users!recipient_id(*),
          listings(*)
        `)
        .eq('listing_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      // TODO: Add actual user IDs when auth is implemented
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: 'current-user-id', // TODO: Replace with actual user ID
          recipient_id: 'other-user-id', // TODO: Replace with actual recipient ID
          listing_id: selectedConversation,
          message_text: newMessage.trim(),
          read: false
        })

      if (error) throw error

      setNewMessage('')
      fetchMessages(selectedConversation)
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.listing.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
              <div className="bg-gray-200 rounded-lg"></div>
              <div className="lg:col-span-2 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
        <Footer />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
          {/* Conversations List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto h-80">
              {filteredConversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-open-sans text-gray-500">No conversations yet</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-open-sans font-bold text-sm text-gray-600">
                          {conversation.otherUser.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-open-sans font-bold text-sm text-gray-900 truncate">
                            {conversation.otherUser.name || 'Unknown User'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="font-open-sans text-xs text-gray-500 truncate mb-1">
                          {conversation.listing.title}
                        </p>
                        <p className="font-open-sans text-xs text-gray-400 truncate">
                          {conversation.lastMessage.message_text}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-200">
                  {(() => {
                    const conversation = conversations.find(c => c.id === selectedConversation)
                    return conversation ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="font-open-sans font-bold text-sm text-gray-600">
                            {conversation.otherUser.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-open-sans font-bold text-gray-900">
                            {conversation.otherUser.name || 'Unknown User'}
                          </p>
                          <p className="font-open-sans text-sm text-gray-500">
                            About: {conversation.listing.title}
                          </p>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === 'current-user-id' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender_id === 'current-user-id'
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="font-open-sans text-sm">{message.message_text}</p>
                        <p className={`font-open-sans text-xs mt-1 ${
                          message.sender_id === 'current-user-id' ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white p-2 rounded-lg"
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
                  <p className="font-open-sans text-gray-500">Select a conversation to start messaging</p>
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