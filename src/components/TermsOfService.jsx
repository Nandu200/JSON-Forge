import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

export default function TermsOfService() {
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
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm mb-2" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
          Last updated: April 13, 2026
        </p>

        <div className="space-y-4 text-sm leading-relaxed" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
          <section>
            <h2 className="font-semibold text-base mb-1">1. Acceptance of Terms</h2>
            <p>
              By accessing and using PrettyJSON (prettyjson.org), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">2. Use of the Site</h2>
            <p>
              PrettyJSON is provided as a free utility for developers. You agree to use the site only for lawful purposes and in a way that doesn't infringe the rights of, restrict or inhibit anyone else's use of the site.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">3. Privacy and Data Security</h2>
            <p>
              We process your JSON data entirely within your local browser. We do not transmit or store your JSON data on our servers. For more information, please review our{' '}
              <Link to="/privacy" className="text-blue-500 underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">4. Intellectual Property</h2>
            <p>
              The PrettyJSON name, logo, design, and all original content on this website are the intellectual property of PrettyJSON. You may not reproduce, distribute, or create derivative works from our branding or site design without prior written permission. The JSON data you paste into PrettyJSON remains entirely yours — we claim no ownership over user-submitted content.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">5. Disclaimer of Warranties</h2>
            <p>
              The service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">6. Limitation of Liability</h2>
            <p>
              We shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, good-will, or other intangible losses, resulting from your use of the site.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">7. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless PrettyJSON and its operators from any claims, damages, losses, or expenses (including reasonable legal fees) arising out of or related to your use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">8. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable law, without regard to conflict-of-law principles. Any disputes arising from these terms or use of the service shall be resolved in the courts of the jurisdiction where PrettyJSON operates.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">9. Severability</h2>
            <p>
              If any provision of these terms is found to be unenforceable or invalid by a court, the remaining provisions shall continue in full force and effect. The unenforceable provision will be modified to the minimum extent necessary to make it enforceable.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the site after any such changes constitutes your acceptance of the new Terms of Service. We encourage you to review this page periodically.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
