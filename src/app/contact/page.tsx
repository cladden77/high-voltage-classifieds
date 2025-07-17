'use client'

import React, { useState } from 'react'
import { Phone, Mail, MapPin, Send, Clock } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Implement form submission
      console.log('Contact form submitted:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Thank you for your message! We\'ll get back to you soon.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error sending your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="font-open-sans text-lg text-gray-500 max-w-2xl mx-auto">
            Have questions about our platform or need help with a transaction? 
            We're here to help you succeed in the high voltage equipment marketplace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <h2 className="font-open-sans text-2xl font-bold text-gray-900 mb-6">
              Send us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-open-sans font-bold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label className="block font-open-sans font-bold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-open-sans font-bold text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div>
                  <label className="block font-open-sans font-bold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="listing">Listing Help</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-open-sans font-bold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-open-sans font-bold flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-6">
                Get in Touch
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-open-sans font-bold text-gray-900">Phone</p>
                    <p className="font-open-sans text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-open-sans font-bold text-gray-900">Email</p>
                    <p className="font-open-sans text-gray-600">support@highvoltageclassifieds.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-open-sans font-bold text-gray-900">Address</p>
                    <p className="font-open-sans text-gray-600">
                      123 Industrial Blvd<br />
                      Houston, TX 77001<br />
                      United States
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <p className="font-open-sans font-bold text-gray-900">Business Hours</p>
                    <p className="font-open-sans text-gray-600">
                      Monday - Friday: 8:00 AM - 6:00 PM CT<br />
                      Saturday: 9:00 AM - 2:00 PM CT<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-open-sans font-bold text-gray-900 mb-2">
                    How do I create a seller account?
                  </h4>
                  <p className="font-open-sans text-gray-600 text-sm">
                    Sign up with your business information and select "Seller" as your account type. 
                    We'll verify your business details before activating listing capabilities.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-open-sans font-bold text-gray-900 mb-2">
                    What payment methods do you accept?
                  </h4>
                  <p className="font-open-sans text-gray-600 text-sm">
                    We support Stripe and PayPal for secure transactions. 
                    All payments are processed securely with industry-standard encryption.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-open-sans font-bold text-gray-900 mb-2">
                    How do I verify equipment condition?
                  </h4>
                  <p className="font-open-sans text-gray-600 text-sm">
                    We recommend arranging an inspection before purchase. 
                    Our platform includes messaging tools to coordinate with sellers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 