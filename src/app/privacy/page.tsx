import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="font-open-sans space-y-6">
            
            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  <strong>Account Information:</strong> When you create an account, we collect your name, email address, 
                  phone number, business information (for sellers), and other details you provide.
                </p>
                <p>
                  <strong>Listing Information:</strong> For sellers, we collect details about equipment listings including 
                  descriptions, images, pricing, and technical specifications.
                </p>
                <p>
                  <strong>Communication Data:</strong> We store messages sent through our platform to facilitate 
                  buyer-seller communication and provide customer support.
                </p>
                <p>
                  <strong>Usage Data:</strong> We collect information about how you interact with our platform, 
                  including pages visited, features used, and time spent on the site.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and maintain our platform services</li>
                  <li>Process transactions and facilitate communication</li>
                  <li>Send important updates and notifications</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                  <li>Provide customer support</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">3. Information Sharing</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  <strong>Between Users:</strong> We share necessary information between buyers and sellers to facilitate 
                  transactions, including contact details and listing information.
                </p>
                <p>
                  <strong>Service Providers:</strong> We share data with trusted third-party services including:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Payment processors (Stripe, PayPal)</li>
                  <li>Cloud storage providers (Supabase)</li>
                  <li>Email service providers</li>
                  <li>Analytics services</li>
                  <li>CRM platforms (HubSpot, Mailchimp)</li>
                </ul>
                <p>
                  <strong>Legal Requirements:</strong> We may disclose information when required by law or to protect 
                  our rights and the safety of our users.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">4. Data Storage and Security</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  We use industry-standard security measures to protect your information, including encryption, 
                  secure servers, and regular security audits.
                </p>
                <p>
                  Your data is stored securely with Supabase, which provides enterprise-grade security and 
                  compliance with international data protection standards.
                </p>
                <p>
                  While we implement robust security measures, no system is 100% secure. We encourage users 
                  to use strong passwords and keep their account credentials confidential.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">5. Your Rights and Choices</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  <strong>Access and Update:</strong> You can access and update your account information at any time 
                  through your account settings.
                </p>
                <p>
                  <strong>Data Deletion:</strong> You can request deletion of your account and associated data by 
                  contacting our support team.
                </p>
                <p>
                  <strong>Communication Preferences:</strong> You can opt out of non-essential communications 
                  while continuing to receive important account and transaction-related messages.
                </p>
                <p>
                  <strong>Data Portability:</strong> You can request a copy of your data in a machine-readable format.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to enhance your experience, remember your preferences, 
                and analyze platform usage. You can control cookie settings through your browser, though this 
                may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">7. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform integrates with third-party services like Google for authentication and various 
                payment processors. These services have their own privacy policies that govern how they handle your data.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform is designed for business use and is not intended for children under 18. 
                We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">9. International Users</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are accessing our platform from outside the United States, please note that your 
                information may be transferred to and processed in the United States, where our servers are located.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">10. Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of significant changes 
                through email or platform notifications. Your continued use of the platform constitutes acceptance 
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this privacy policy or our data practices, please contact us at{' '}
                <a href="mailto:privacy@highvoltageclassifieds.com" className="text-orange-500 hover:text-orange-600">
                  privacy@highvoltageclassifieds.com
                </a>
              </p>
            </section>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
} 