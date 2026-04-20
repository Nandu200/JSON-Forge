import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, MessageSquare } from 'lucide-react';

export default function ContactUs() {
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
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-sm mb-6" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
          Have a question, feedback, or found a bug? We'd love to hear from you.
        </p>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border flex items-start gap-4" style={{ borderColor: isLight ? '#e2e8f0' : '#334155', background: isLight ? '#f8fafc' : '#0f172a' }}>
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>Email Support</h3>
              <p className="text-sm mb-2" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
                For general inquiries, support, or partnership opportunities, please email us directly.
              </p>
              <a href="mailto:support@prettyjson.org" className="text-blue-500 hover:underline font-medium text-sm">
                support@prettyjson.org
              </a>
            </div>
          </div>

          <div className="p-4 rounded-lg border flex items-start gap-4" style={{ borderColor: isLight ? '#e2e8f0' : '#334155', background: isLight ? '#f8fafc' : '#0f172a' }}>
            <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>Feature Requests</h3>
              <p className="text-sm mb-2" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
                Missing a specific feature? Let us know what would make your workflow better and we might build it!
              </p>
              <a href="mailto:feedback@prettyjson.org?subject=Feature Request" className="text-emerald-500 hover:underline font-medium text-sm">
                Submit a Request
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-center" style={{ color: isLight ? '#94a3b8' : '#64748b' }}>
          We typically respond to all inquiries within 24-48 hours.
        </div>
      </div>
    </div>
  );
}
