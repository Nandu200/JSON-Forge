import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Heart, Shield, Zap } from 'lucide-react';

export default function AboutUs() {
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
        <h1 className="text-3xl font-bold mb-6">About PrettyJSON</h1>

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

          <section>
            <h2 className="font-semibold text-base mb-2">How PrettyJSON Works</h2>
            <p>
              When you paste or upload JSON into PrettyJSON, your browser's built-in JavaScript engine handles everything — parsing, formatting, validation, and rendering. The entire application is a single-page app built with React and served as static files from Cloudflare's global edge network. That means sub-50ms load times for most users worldwide, and zero server-side processing of your data.
            </p>
            <p className="mt-2">
              Under the hood, PrettyJSON uses a custom rendering pipeline optimized for large documents. Instead of rendering every node at once, we virtualize the tree and table views so only visible elements are in the DOM. This lets us handle files well above 5 MB without the browser slowing down.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">Why We Built This</h2>
            <p>
              The idea for PrettyJSON came from a frustrating discovery: many popular online JSON tools quietly send your pasted data to their servers for processing. If you're working with API keys, database credentials, or customer data, that's a serious privacy risk. We wanted a tool that's genuinely client-side — not "client-side with a telemetry endpoint" but truly offline-capable once loaded.
            </p>
            <p className="mt-2">
              We also wanted something that feels like a real desktop application. Most web-based formatters are bare-bones text boxes. PrettyJSON gives you tree navigation, table views, a full diff engine, JSONPath and JMESPath querying, export to multiple formats, and keyboard shortcuts — all in the browser.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-base mb-2">What's Next</h2>
            <p>
              We're actively developing new capabilities. On the roadmap: JSON Schema validation with inline error annotations, a visual schema editor, improved diff with merge support, collaborative sharing via encrypted links, and a browser extension for formatting JSON responses directly in DevTools. Have a feature request? <a href="/contact" className="text-blue-500 underline">Let us know</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
