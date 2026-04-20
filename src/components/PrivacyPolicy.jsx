import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function PrivacyPolicy() {
  const { theme } = useOutletContext();
  const isLight = theme === 'light';

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-16 font-sans">
      <div
        className="relative w-full rounded-xl border p-8"
        style={{
          background: isLight ? '#ffffff' : '#1e293b',
          borderColor: isLight ? '#e2e8f0' : '#334155',
          color: isLight ? '#0f172a' : '#f1f5f9',
        }}
      >
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm mb-2" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
          Last updated: April 13, 2026
        </p>

        <div className="space-y-4 text-sm leading-relaxed" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
          <section>
            <h2 className="font-semibold text-base mb-1">1. Overview</h2>
            <p>
              PrettyJSON ("we", "our", "the site") is a free online JSON formatting and validation tool
              available at prettyjson.org. We respect your privacy and are committed to protecting it.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">2. Data We Collect</h2>
            <p>
              <strong>We do not collect, store, or transmit any JSON data you paste or upload.</strong> All
              processing happens entirely in your browser. No data is sent to any server.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">3. Cookies & Advertising</h2>
            <p>
              We use Google AdSense to display advertisements. Google and its partners may use cookies
              to serve ads based on your prior visits to this or other websites. You can opt out of
              personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-blue-500 underline"
              >
                Google Ads Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">4. Third-Party Services</h2>
            <p>
              We use the following third-party services:
            </p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><strong>Google AdSense</strong> — for serving advertisements</li>
              <li><strong>Google Fonts</strong> — for loading web fonts</li>
            </ul>
            <p className="mt-1">
              These services may collect anonymous usage data as described in their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">5. Data Security</h2>
            <p>
              Since we do not collect or store any user data, there is no personal data at risk.
              Your JSON data never leaves your browser.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">6. Children's Privacy</h2>
            <p>
              Our site is a general-purpose developer tool and is not directed at children under 13.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">7. Changes</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be reflected on this page
              with an updated date.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">8. Contact</h2>
            <p>
              If you have questions about this privacy policy, please reach out via the contact
              information on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
