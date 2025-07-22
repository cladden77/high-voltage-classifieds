'use client'

import React, { useState } from 'react'
import { Phone, Mail, MapPin, Send, Clock, ExternalLink } from 'lucide-react'
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
          {/* HubSpot Form Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-open-sans text-2xl font-bold text-gray-900">
                Get in Touch
              </h2>
              <ExternalLink className="h-5 w-5 text-orange-500" />
            </div>
            
            {/* HubSpot Form Placeholder */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <ExternalLink className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-open-sans text-lg font-bold text-gray-900 mb-2">
                  HubSpot Contact Form
                </h3>
                <p className="font-open-sans text-sm text-gray-600 mb-4">
                  Embed your HubSpot form here for better lead tracking and CRM integration.
                </p>
                <div className="bg-white border-2 border-dashed border-orange-300 rounded-lg p-8">
                  <div className="text-center">
                    <div className="font-mono text-sm text-gray-500 mb-4">
                      {'<!-- HubSpot Form Embed Code -->'}
                    </div>
                    <div className="bg-gray-100 rounded p-4 font-mono text-xs text-gray-600">
                      {`<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>`}<br/>
                      {`<script>`}<br/>
                      {`  hbspt.forms.create({`}<br/>
                      {`    region: "na1",`}<br/>
                      {`    portalId: "YOUR_PORTAL_ID",`}<br/>
                      {`    formId: "YOUR_FORM_ID"`}<br/>
                      {`  });`}<br/>
                      {`</script>`}
                    </div>
                    <p className="font-open-sans text-xs text-gray-500 mt-3">
                      Replace with your actual HubSpot portal ID and form ID
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fallback Form Instructions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-open-sans font-bold text-gray-900 mb-2">
                Form Integration Instructions:
              </h4>
              <ul className="font-open-sans text-sm text-gray-600 space-y-1">
                <li>• Log into your HubSpot account</li>
                <li>• Navigate to Marketing → Lead Capture → Forms</li>
                <li>• Create or select your contact form</li>
                <li>• Copy the embed code from the "Embed" tab</li>
                <li>• Replace the placeholder code above</li>
              </ul>
            </div>

            {/* Alternative: Keep existing form as backup */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="font-open-sans text-lg font-bold text-gray-900 mb-4">
                Alternative Contact Form
              </h3>
              <p className="font-open-sans text-sm text-gray-600 mb-4">
                Use this backup form while setting up your HubSpot integration:
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Your name"
                  />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="your@email.com"
                  />
                </div>
                
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Subject"
                />
                
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="Your message..."
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-open-sans font-bold flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="font-open-sans text-xl font-bold text-gray-900 mb-6">
                Contact Information
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

                <div>
                  <h4 className="font-open-sans font-bold text-gray-900 mb-2">
                    How can I track my leads and inquiries?
                  </h4>
                  <p className="font-open-sans text-gray-600 text-sm">
                    With our HubSpot integration, all form submissions and customer interactions 
                    are automatically tracked in your CRM for better lead management.
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