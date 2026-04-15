import React from 'react';
import { X, Heart, Shield, Zap } from 'lucide-react';

export default function AboutUs({ open, onClose, theme }) {
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

        <h1 className="text-xl font-semibold mb-6">About PrettyJSON</h1>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
          <section>
            <p className="text-base mb-4">
              PrettyJSON was built out of a simple necessity: developers need a fast, reliable, and secure way to read, format, and validate JSON data without worrying about their sensitive configuration files or API payloads being logged by third-party servers.
            </p>
            <p>
              While there are many JSON formatters on the internet, discovering that many of them send your pasted data to a backend server for processing was alarming. We set out to create a tool that does everything locally.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-lg border" style={{ borderColor: isLight ? '#e2e8f0' : '#334155', background: isLight ? '#f8fafc' : '#0f172a' }}>
              <Shield className="text-emerald-500 mb-2" size={24} />
              <h3 className="font-semibold mb-1" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>100% Private</h3>
              <p className="text-xs">All processing happens in your browser. No data leaves your machine.</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ borderColor: isLight ? '#e2e8f0' : '#334155', background: isLight ? '#f8fafc' : '#0f172a' }}>
              <Zap className="text-amber-500 mb-2" size={24} />
              <h3 className="font-semibold mb-1" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>Lightning Fast</h3>
              <p className="text-xs">Optimized for large files. Capable of handling megabytes of data instantly.</p>
            </div>
            <div className="p-4 rounded-lg border" style={{ borderColor: isLight ? '#e2e8f0' : '#334155', background: isLight ? '#f8fafc' : '#0f172a' }}>
              <Heart className="text-pink-500 mb-2" size={24} />
              <h3 className="font-semibold mb-1" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>Free Forever</h3>
              <p className="text-xs">Supported by unobtrusive ads so you never have to pay to use the tool.</p>
            </div>
          </div>

          <section>
            <h2 className="font-semibold text-base mb-1">Our Mission</h2>
            <p>
              Our mission is to provide the best developer experience for working with JSON data. We're constantly working on adding new features like smarter auto-repair, better side-by-side diffing, and advanced tree views.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
