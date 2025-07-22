import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <article className="prose prose-lg prose-gray mx-auto">
            <header className="mb-8">
              <h1 className="font-staatliches text-4xl md:text-5xl text-gray-900 mb-4 text-center">
                Terms & Conditions
              </h1>
              <p className="text-sm text-gray-500 text-center font-open-sans">
                Last Updated: July 22, 2025
              </p>
            </header>

            <div className="space-y-8 font-open-sans">
              <section>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Welcome to High Voltage Classifieds ("Platform", "we", "our", or "us"). These Terms and Conditions ("Terms") govern your use of our website located at highvoltageclassifieds.com and all related services.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  By accessing or using our Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Eligibility
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  To create a seller account, you must be a registered business operating in the transformer, power, or electrical supply industries. Buyers must be at least 18 years old to create an account or purchase items.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Accounts
                </h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-6">
                  <li>Sellers must provide accurate business details and comply with local regulations.</li>
                  <li>Buyers may browse without registering, but must create an account to favorite listings, message sellers, or make purchases.</li>
                  <li>You are responsible for safeguarding your login credentials.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Listings and Content
                </h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-6">
                  <li>Sellers may post listings for surplus equipment, parts, and other relevant items.</li>
                  <li>All listings must be truthful, accurate, and comply with applicable laws.</li>
                  <li>We reserve the right to remove any listing that violates our policies or is reported as fraudulent.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Purchases and Payments
                </h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-6">
                  <li>Buyers can purchase listed items via Stripe or PayPal using credit/debit cards or linked accounts.</li>
                  <li>All transactions are handled by third-party payment processors. We do not store payment information.</li>
                  <li>Sellers are responsible for shipping, fulfillment, and customer support for their listings.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Messaging
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Buyers and sellers may communicate via in-app messaging. No spamming, harassment, or off-platform solicitation is allowed.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Prohibited Conduct
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You agree not to:
                </p>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-6">
                  <li>Post unlawful, deceptive, or misleading listings</li>
                  <li>Infringe on any third-party intellectual property</li>
                  <li>Attempt to hack, scrape, or overload the platform</li>
                  <li>Use the platform for personal (non-business) sales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Account Termination
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or delete any account that violates these Terms or our community guidelines.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Disclaimers
                </h2>
                <ul className="space-y-2 text-gray-700 leading-relaxed list-disc pl-6">
                  <li>High Voltage Classifieds does not own or inspect any items listed on the platform.</li>
                  <li>We do not guarantee the accuracy of listings, nor the conduct of buyers or sellers.</li>
                  <li>All transactions are at your own risk.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  To the fullest extent permitted by law, High Voltage Classifieds shall not be liable for any damages, including loss of profits, resulting from your use of the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms at any time. Continued use of the platform after changes are posted constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Contact
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions, please contact us at{' '}
                  <a 
                    href="mailto:support@highvoltageclassifieds.com"
                    className="text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    support@highvoltageclassifieds.com
                  </a>
                </p>
              </section>
            </div>

            <footer className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center font-open-sans">
                These terms are effective as of the date listed above and supersede all prior agreements.
              </p>
            </footer>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
} 