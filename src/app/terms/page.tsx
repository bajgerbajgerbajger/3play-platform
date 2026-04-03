import { MainLayout } from '@/components/layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-16">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Effective date: January 1, 2025</p>
        </div>

        <div className="space-y-10 text-zinc-300 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">1</span>
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using the 3Play streaming service (&quot;Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, do not use
              the Service. These Terms apply to all visitors, users, and others who access the Service.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">2</span>
              Service Description
            </h2>
            <p className="mb-3">
              3Play provides an on-demand streaming platform that allows subscribers to access movies,
              TV series, and other video content (&quot;Content&quot;) over the internet. Content availability
              may vary by subscription plan and geographic region.
            </p>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service (or any part of it)
              at any time with or without notice.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">3</span>
              User Accounts
            </h2>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>You must be at least 13 years old to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
              <li>You must provide accurate and complete registration information.</li>
              <li>You may not share your account credentials with others outside your plan&apos;s allowed profiles.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">4</span>
              Subscriptions &amp; Billing
            </h2>
            <p className="mb-3">
              Access to certain Content requires a paid subscription. By subscribing, you authorize us
              to charge your payment method on a recurring basis until you cancel.
            </p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Subscription fees are charged at the beginning of each billing cycle.</li>
              <li>You may cancel your subscription at any time; access continues until the end of the paid period.</li>
              <li>Refunds are not provided for partial billing periods, except where required by law.</li>
              <li>We reserve the right to change subscription prices with 30 days&apos; notice.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">5</span>
              Content &amp; Intellectual Property
            </h2>
            <p className="mb-3">
              All Content on the Service is protected by copyright, trademark, and other intellectual
              property laws. Your subscription grants you a limited, non-exclusive, non-transferable
              license to stream Content for personal, non-commercial use only.
            </p>
            <p>
              You may not download, copy, reproduce, distribute, transmit, broadcast, display, sell,
              license, or otherwise exploit any Content without prior written consent from 3Play or the
              applicable rights holder.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">6</span>
              Prohibited Uses
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Use the Service for any unlawful purpose or in violation of any regulations.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its related systems.</li>
              <li>Use automated tools (bots, scrapers, crawlers) to access the Service.</li>
              <li>Circumvent, disable, or interfere with security-related features of the Service.</li>
              <li>Upload or transmit viruses or any other malicious code.</li>
              <li>Impersonate any person or entity, or falsely state your affiliation with any person or entity.</li>
              <li>Use VPNs or proxies to access Content not available in your region.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">7</span>
              Termination
            </h2>
            <p className="mb-3">
              We reserve the right to suspend or terminate your account at our sole discretion, without
              notice, for conduct that we believe violates these Terms or is harmful to other users, us,
              third parties, or for any other reason.
            </p>
            <p>
              You may terminate your account at any time by contacting support. Upon termination, your
              right to use the Service immediately ceases.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">8</span>
              Disclaimer of Warranties
            </h2>
            <p>
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without any warranties
              of any kind, either express or implied, including but not limited to warranties of
              merchantability, fitness for a particular purpose, or non-infringement. We do not warrant
              that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">9</span>
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, 3Play and its officers, directors, employees,
              and agents shall not be liable for any indirect, incidental, special, consequential, or
              punitive damages — including loss of profits, data, or goodwill — arising out of or in
              connection with your use of the Service, even if we have been advised of the possibility
              of such damages.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">10</span>
              Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              jurisdiction in which 3Play operates, without regard to its conflict of law provisions.
              Any dispute arising from these Terms shall be resolved through binding arbitration or
              in a court of competent jurisdiction.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">11</span>
              Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. When we do, we will revise the effective
              date at the top of this page. Continued use of the Service after any changes constitutes
              your acceptance of the new Terms. We encourage you to review this page periodically.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-600/20 text-red-500 text-sm flex items-center justify-center font-bold shrink-0">12</span>
              Contact Us
            </h2>
            <p className="mb-3">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-1">
              <p className="text-white font-medium">3Play Support Team</p>
              <p className="text-zinc-400 text-sm">Email: legal@3play.app</p>
              <p className="text-zinc-400 text-sm">Response time: within 2 business days</p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800 flex flex-wrap gap-4">
          <a href="/privacy" className="text-red-500 hover:text-red-400 text-sm font-medium">
            Privacy Policy →
          </a>
          <a href="/help" className="text-zinc-400 hover:text-white text-sm">
            Help Center
          </a>
          <a href="/about" className="text-zinc-400 hover:text-white text-sm">
            About 3Play
          </a>
        </div>
      </div>
    </MainLayout>
  );
}
