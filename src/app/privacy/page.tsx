import { MainLayout } from '@/components/layout/MainLayout';

export default function PrivacyPage() {
  const lastUpdated = 'January 1, 2026';

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        {/* Header */}
        <div className="mb-10 pb-6 border-b border-zinc-800">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-zinc-300 leading-relaxed">

          {/* Intro */}
          <section>
            <p>
              Welcome to <span className="text-white font-semibold">3Play</span>. We respect your privacy and are
              committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our streaming platform.
            </p>
            <p className="mt-3">
              By using 3Play, you agree to the collection and use of information in accordance with this policy.
              If you do not agree, please discontinue use of our services.
            </p>
          </section>

          {/* 1. Data We Collect */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect several types of information for various purposes:</p>
            <div className="space-y-4 pl-4 border-l-2 border-zinc-800">
              <div>
                <h3 className="text-white font-semibold mb-1">Account Information</h3>
                <p className="text-sm">
                  When you create an account, we collect your name, email address, and password (stored in
                  hashed form). You may optionally provide a profile avatar.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Usage Data</h3>
                <p className="text-sm">
                  We automatically collect data about how you interact with our platform — including watch
                  history, search queries, playback progress, device type, browser type, and IP address.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Payment Information</h3>
                <p className="text-sm">
                  Payment details are processed securely through Stripe. We do not store your full card number,
                  CVV, or banking details on our servers.
                </p>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Cookies & Tracking</h3>
                <p className="text-sm">
                  We use cookies and similar tracking technologies to maintain your session, remember preferences,
                  and improve our recommendations engine.
                </p>
              </div>
            </div>
          </section>

          {/* 2. How We Use Data */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>To provide, operate, and maintain our streaming service</li>
              <li>To create and manage your account and subscription</li>
              <li>To personalize content recommendations based on your viewing history</li>
              <li>To process payments and manage billing records</li>
              <li>To send service-related notifications (new episodes, billing updates, etc.)</li>
              <li>To detect and prevent fraudulent or unauthorized activity</li>
              <li>To analyze platform usage and improve our features</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* 3. Data Sharing */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Sharing Your Information</h2>
            <p className="mb-3">
              We do <span className="text-white font-semibold">not</span> sell your personal information.
              We may share data with trusted third parties only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <span className="text-white font-medium">Service Providers:</span> Partners like Stripe (payments),
                hosting providers, and analytics services that help us operate the platform.
              </li>
              <li>
                <span className="text-white font-medium">Legal Requirements:</span> When required by law, court
                order, or government authority.
              </li>
              <li>
                <span className="text-white font-medium">Business Transfers:</span> In the event of a merger,
                acquisition, or asset sale, user data may be transferred as part of the transaction.
              </li>
            </ul>
          </section>

          {/* 4. Data Retention */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide services.
              Watch history and usage data may be retained for up to 2 years for recommendation purposes.
              You can request deletion of your account and associated data at any time by contacting us.
            </p>
          </section>

          {/* 5. Security */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard security measures including encryption in transit (TLS/HTTPS),
              hashed password storage (bcrypt), and access controls. However, no method of transmission over
              the Internet is 100% secure. We encourage you to use a strong, unique password for your account.
            </p>
          </section>

          {/* 6. Your Rights */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability — receive a copy of your data in a structured format</li>
              <li>Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="mt-3 text-sm">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@3play.com" className="text-red-400 hover:text-red-300">
                privacy@3play.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          {/* 7. Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Children&apos;s Privacy</h2>
            <p>
              3Play is not intended for children under the age of 13. We do not knowingly collect personal
              information from children under 13. If you believe a child has provided us with personal data,
              please contact us immediately and we will delete the information.
            </p>
          </section>

          {/* 8. Cookies */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Cookies Policy</h2>
            <p className="mb-3">
              We use the following types of cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <span className="text-white font-medium">Essential Cookies:</span> Required for authentication
                and core platform functionality.
              </li>
              <li>
                <span className="text-white font-medium">Preference Cookies:</span> Remember your settings like
                language, playback preferences, and theme.
              </li>
              <li>
                <span className="text-white font-medium">Analytics Cookies:</span> Help us understand how users
                interact with the platform so we can improve it.
              </li>
            </ul>
            <p className="mt-3 text-sm">
              You can disable cookies in your browser settings, though some features may not function correctly.
            </p>
          </section>

          {/* 9. Changes */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the
              &ldquo;Last updated&rdquo; date at the top of this page and, where appropriate, notify you by
              email or via an in-app notification. Continued use of the platform after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Contact Us</h2>
            <p className="mb-2">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out:
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 text-sm space-y-1">
              <p className="text-white font-semibold">3Play Support</p>
              <p>
                Email:{' '}
                <a href="mailto:privacy@3play.com" className="text-red-400 hover:text-red-300">
                  privacy@3play.com
                </a>
              </p>
              <p>
                Help Center:{' '}
                <a href="/help" className="text-red-400 hover:text-red-300">
                  3play.com/help
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </MainLayout>
  );
}
