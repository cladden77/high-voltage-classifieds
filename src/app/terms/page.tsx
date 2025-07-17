import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="font-staatliches text-[54px] leading-[48px] tracking-[-1.2px] text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="font-open-sans text-lg text-gray-500">
            Last updated: January 1, 2024
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <div className="font-open-sans space-y-6">
            
            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using High Voltage Classifieds ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">2. Platform Description</h2>
              <p className="text-gray-700 leading-relaxed">
                High Voltage Classifieds is a marketplace platform that connects buyers and sellers of high voltage electrical equipment. 
                We facilitate transactions but are not a party to the actual sale agreements between users.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">3. User Accounts</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  <strong>Buyer Accounts:</strong> Open to any individual or business interested in purchasing equipment.
                </p>
                <p>
                  <strong>Seller Accounts:</strong> Limited to verified businesses only. All seller accounts are subject to verification and approval.
                </p>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">4. Listing Guidelines</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">Sellers must provide accurate information about equipment including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Truthful condition descriptions</li>
                  <li>Accurate technical specifications</li>
                  <li>Clear, representative photographs</li>
                  <li>Honest pricing</li>
                  <li>Compliance with all applicable safety standards</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">5. Prohibited Activities</h2>
              <div className="text-gray-700 leading-relaxed">
                <p className="mb-4">Users may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Post false or misleading information</li>
                  <li>Engage in fraudulent activities</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Sell stolen or illegally obtained equipment</li>
                  <li>Use the platform for spam or unauthorized marketing</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">6. Payment and Transactions</h2>
              <div className="text-gray-700 leading-relaxed space-y-4">
                <p>
                  All payments are processed through secure third-party payment processors (Stripe and PayPal). 
                  We do not store payment information on our servers.
                </p>
                <p>
                  Buyers and sellers are responsible for completing transactions according to the terms they agree upon. 
                  High Voltage Classifieds is not responsible for disputes between parties.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                High Voltage Classifieds provides the platform "as is" without warranties of any kind. 
                We are not liable for any damages arising from the use of our platform or transactions between users. 
                Users assume full responsibility for verifying equipment condition and suitability for their purposes.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">8. Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the platform, 
                to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">9. Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
                Your continued use of the platform constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="font-staatliches text-2xl text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@highvoltageclassifieds.com" className="text-orange-500 hover:text-orange-600">
                  legal@highvoltageclassifieds.com
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