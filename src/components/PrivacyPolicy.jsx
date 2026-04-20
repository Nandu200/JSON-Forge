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
              PrettyJSON itself uses the following local storage items on your device:
            </p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><code className="text-xs font-mono">prettyjson_cookie_consent</code> — stores your cookie consent preference (accepted or declined)</li>
              <li><code className="text-xs font-mono">prettyjson_theme</code> — stores your light/dark mode preference</li>
              <li><code className="text-xs font-mono">prettyjson_autosave</code> — stores your most recent JSON document locally so you don't lose work on page refresh</li>
            </ul>
            <p className="mt-2">
              We use Google AdSense to display advertisements. Google and its advertising partners may use cookies
              to serve ads based on your prior visits to this website or other websites. These cookies enable Google
              and its partners to provide you with ads based on your interests.
            </p>
            <p className="mt-2">
              You can opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-blue-500 underline"
              >
                Google Ads Settings
              </a>. You may also visit{' '}
              <a
                href="https://policies.google.com/technologies/ads"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-blue-500 underline"
              >
                Google's advertising policies
              </a>{' '}
              to learn more about how Google uses cookies for advertising.
            </p>
            <p className="mt-2">
              We implement Google Consent Mode v2, which means personalized advertising is only enabled
              after you accept cookies through our consent banner. If you decline, only non-personalized ads
              may be shown.
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
            <h2 className="font-semibold text-base mb-1">7. Your Rights Under GDPR (EEA/UK Visitors)</h2>
            <p>
              If you are located in the European Economic Area or the United Kingdom, you have certain rights
              under the General Data Protection Regulation (GDPR), including:
            </p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li><strong>Right of access</strong> — you can request information about what data we hold about you</li>
              <li><strong>Right to erasure</strong> — you can ask us to delete your data</li>
              <li><strong>Right to restrict processing</strong> — you can ask us to limit how we use your data</li>
              <li><strong>Right to data portability</strong> — you can request your data in a machine-readable format</li>
              <li><strong>Right to object</strong> — you can object to us processing your data for certain purposes</li>
            </ul>
            <p className="mt-2">
              Since PrettyJSON does not collect or store personal data on our servers, most of these rights are
              automatically satisfied. For cookies set by Google AdSense, you can manage your preferences using
              our cookie consent banner or by visiting your{' '}
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer nofollow" className="text-blue-500 underline">
                Google Ads Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">8. Your Rights Under CCPA (California Visitors)</h2>
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) gives you the right to:
            </p>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Know what personal information is being collected about you</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of the sale of your personal information</li>
              <li>Not be discriminated against for exercising your CCPA rights</li>
            </ul>
            <p className="mt-2">
              PrettyJSON does not sell personal information. We do not collect personal data beyond what is
              described in this policy. Third-party advertising cookies can be managed through our consent banner.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">9. Changes</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be reflected on this page
              with an updated date.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">10. Contact</h2>
            <p>
              If you have questions about this privacy policy, please email us at{' '}
              <a href="mailto:support@prettyjson.org" className="text-blue-500 underline">support@prettyjson.org</a>{' '}
              or visit our{' '}
              <a href="/contact" className="text-blue-500 underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
