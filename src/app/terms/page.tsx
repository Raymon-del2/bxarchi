'use client';

import Navbar from '@/components/layout/Navbar';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: November 5, 2025</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using BXARCHI, you accept and agree to be bound by the terms and provisions 
              of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create an account with us, you must provide accurate and complete information. 
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Maintaining the security of your account</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Content Guidelines</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When publishing content on BXARCHI, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Own or have the rights to the content you publish</li>
              <li>Not publish content that infringes on others&apos; rights</li>
              <li>Not publish illegal, harmful, or offensive content</li>
              <li>Not engage in spam or misleading practices</li>
              <li>Respect other users and their content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Your Content:</strong> You retain all rights to the content you publish. By publishing 
              on BXARCHI, you grant us a license to display, distribute, and promote your content on our platform.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Our Platform:</strong> The BXARCHI platform, including its design, features, and code, 
              is protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the platform for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the platform</li>
              <li>Collect user information without consent</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Upload viruses or malicious code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content Moderation</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to remove any content that violates these terms or is otherwise objectionable. 
              We may also suspend or terminate accounts that repeatedly violate our policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              BXARCHI is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the service 
              will be uninterrupted, secure, or error-free. We are not responsible for the content published 
              by users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, BXARCHI shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages resulting from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your account at any time for violations of these terms. You may 
              also delete your account at any time. Upon termination, your right to use the platform will 
              immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes. Continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms shall be governed by and construed in accordance with applicable laws, without 
              regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-indigo-600 mt-2">Raymond@</p>
          </section>
        </div>
      </div>
    </div>
  );
}
