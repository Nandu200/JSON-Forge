import React from 'react';
import { X } from 'lucide-react';

export default function TermsOfService({ open, onClose, theme }) {
  if (!open) return null;
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border p-6 m-4"
        style={{
          background: isLight ? '#ffffff' : '#1e293b',
          borderColor: isLight ? '#e2e8f0' : '#334155',
          color: isLight ? '#0f172a' : '#f1f5f9',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all ${
            isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-white/10 text-slate-400'
          }`}
        >
          <X size={16} />
        </button>

        <h1 className="text-xl font-semibold mb-4">Terms of Service</h1>
        <p className="text-sm mb-2" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              We process your JSON data entirely within your local browser. We do not transmit or store your JSON data on our servers. For more information, please review our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">4. Disclaimer of Warranties</h2>
            <p>
              The service is provided on an "AS IS" and "AS AVAILABLE" basis. We disclaim all warranties of any kind, whether express or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">5. Limitation of Liability</h2>
            <p>
              We shall not be liable for any indirect, incidental, special, consequential or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, good-will, or other intangible losses, resulting from your use of the site.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-1">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the site after any such changes constitutes your acceptance of the new Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
