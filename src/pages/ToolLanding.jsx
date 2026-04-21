import React from 'react';
import { useOutletContext } from 'react-router-dom';
import JsonFormatter from './JsonFormatter';

// Reusable SEO footer for landing pages
function SeoSection({ title, children, isLight }) {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>{title}</h2>
      <div className="space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

function LandingWrapper({ h1, seoContent }) {
  const { theme } = useOutletContext();
  const isLight = theme === 'light';

  return (
    <>
      <JsonFormatter hideSeoFooter />
      <div className="w-full border-t font-sans" style={{ background: isLight ? '#ffffff' : '#0f172a', borderColor: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#334155' : '#cbd5e1' }}>
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
          <h1 className="text-3xl font-bold" style={{ color: isLight ? '#0f172a' : '#f8fafc' }}>{h1}</h1>
          {seoContent(isLight)}
        </div>
      </div>
    </>
  );
}

// --- JSON Validator Landing Page ---
export function JsonValidatorPage() {
  return (
    <LandingWrapper
      h1="Free Online JSON Validator & Lint Checker"
      seoContent={(isLight) => (
        <>
          <SeoSection title="What Is JSON Validation?" isLight={isLight}>
            <p>JSON validation checks whether a piece of text conforms to the JSON specification defined in <a href="https://datatracker.ietf.org/doc/html/rfc8259" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">RFC 8259</a>. A valid JSON document must follow strict rules: double-quoted strings, no trailing commas, no comments, and a limited set of data types (string, number, boolean, null, object, array).</p>
            <p>PrettyJSON validates your JSON <strong>instantly as you type</strong>. The error bar at the bottom tells you exactly what went wrong and where — the line number, the character position, and a human-readable explanation. No server round-trips, no waiting.</p>
          </SeoSection>

          <SeoSection title="Common JSON Errors This Validator Catches" isLight={isLight}>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Trailing commas</strong> — <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">{`{"a": 1,}`}</code> is invalid. The comma after the last item must go.</li>
              <li><strong>Single quotes</strong> — JSON requires double quotes. <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">{'name'}</code> is not valid.</li>
              <li><strong>Unquoted keys</strong> — <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">{`{name: "value"}`}</code> is JavaScript, not JSON.</li>
              <li><strong>Comments</strong> — Neither <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">//</code> nor <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">/* */</code> are allowed in JSON.</li>
              <li><strong>Missing brackets</strong> — Unclosed <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">{`{`}</code> or <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">[</code> cause parse failures.</li>
              <li><strong>Invalid escape sequences</strong> — Only specific backslash sequences like <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">\n</code>, <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">\t</code>, and <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">\u</code> are permitted.</li>
            </ul>
          </SeoSection>

          <SeoSection title="Why Use PrettyJSON as Your JSON Lint Tool?" isLight={isLight}>
            <p>Unlike server-based validators, PrettyJSON runs entirely in your browser. Your API keys, tokens, and configuration data never leave your machine. Paste your JSON, see the errors immediately, and click <strong>Auto Repair</strong> to fix most issues automatically — trailing commas, single quotes, unquoted keys, comments, and more.</p>
            <p>Works with files up to 10 MB and supports advanced features like JSONPath queries, tree view, and side-by-side diff — all free, all private.</p>
          </SeoSection>
        </>
      )}
    />
  );
}

// --- JSON Beautifier Landing Page ---
export function JsonBeautifierPage() {
  return (
    <LandingWrapper
      h1="Free Online JSON Beautifier & Pretty Printer"
      seoContent={(isLight) => (
        <>
          <SeoSection title="What Does a JSON Beautifier Do?" isLight={isLight}>
            <p>A JSON beautifier (also called a pretty printer) takes compact or minified JSON and adds consistent indentation, line breaks, and spacing to make it human-readable. PrettyJSON uses 2-space indentation by default, which is the most common convention in JavaScript and TypeScript projects.</p>
            <p>This is especially useful when you're debugging API responses, reading configuration files, or reviewing data exported from databases. Minified JSON saves bandwidth but is nearly impossible to read — beautifying it transforms a wall of text into a clean, structured document.</p>
          </SeoSection>

          <SeoSection title="How to Beautify JSON" isLight={isLight}>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Paste your JSON</strong> into the editor above, or drag and drop a <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">.json</code> file.</li>
              <li><strong>Click the Format button</strong> (or press <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">Ctrl+Shift+F</code>). Your JSON is instantly beautified with clean indentation.</li>
              <li><strong>Copy the result</strong> or export it as a file. You can also switch to Tree or Table view for visual exploration.</li>
            </ol>
          </SeoSection>

          <SeoSection title="Beautify vs. Minify" isLight={isLight}>
            <p><strong>Beautifying</strong> adds whitespace for readability — useful during development, debugging, and code review. <strong>Minifying</strong> strips all unnecessary whitespace to produce the smallest possible payload — useful for production configs, API requests, and storage. PrettyJSON does both with a single click.</p>
          </SeoSection>
        </>
      )}
    />
  );
}

// --- JSON Viewer Landing Page ---
export function JsonViewerPage() {
  return (
    <LandingWrapper
      h1="Free Online JSON Viewer & Tree Explorer"
      seoContent={(isLight) => (
        <>
          <SeoSection title="Browse JSON as an Interactive Tree" isLight={isLight}>
            <p>PrettyJSON's Tree view transforms raw JSON into a collapsible, navigable tree. Click any node to expand or collapse it. Hover over a key to see its full JSONPath. Click a value to edit it inline. This is the fastest way to explore deeply nested documents without scrolling through thousands of lines of text.</p>
            <p>The tree view handles objects, arrays, strings, numbers, booleans, and null values — with color-coded types so you can scan the structure at a glance. Nested objects can be expanded level by level, or you can use the expand-all shortcut to open everything at once.</p>
          </SeoSection>

          <SeoSection title="Table View for Arrays" isLight={isLight}>
            <p>When your JSON is an array of objects (like a list of users, products, or log entries), Table view automatically lays it out as a sortable spreadsheet. Each object becomes a row, and each key becomes a column header. Click any column to sort ascending or descending — no formulas, no setup.</p>
          </SeoSection>

          <SeoSection title="Search & Filter Large Files" isLight={isLight}>
            <p>Use the built-in search bar to find keys or values anywhere in the document. Matches are highlighted in real time, and you can jump between them with Enter. For more powerful filtering, switch to JSONPath or JMESPath mode to write queries that extract exactly the data you need from complex structures.</p>
          </SeoSection>
        </>
      )}
    />
  );
}

// --- JSON Diff / Compare Landing Page ---
export function JsonDiffPage() {
  return (
    <LandingWrapper
      h1="Free Online JSON Diff & Compare Tool"
      seoContent={(isLight) => (
        <>
          <SeoSection title="Compare Two JSON Documents Side by Side" isLight={isLight}>
            <p>PrettyJSON's diff mode lets you paste two JSON documents into separate panels and instantly see what changed. Additions are highlighted in green, deletions in red, and modifications show both the old and new values. This works on objects, arrays, and deeply nested structures — not just flat text comparison.</p>
            <p>This is invaluable when you're comparing API responses between environments, reviewing configuration changes before deployment, or debugging why a payload looks different from what you expected.</p>
          </SeoSection>

          <SeoSection title="How JSON Diff Works" isLight={isLight}>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Open the diff layout</strong> by clicking the Compare button in the toolbar. The editor splits into two side-by-side panels.</li>
              <li><strong>Paste your original JSON</strong> into the left panel and the <strong>modified version</strong> into the right panel.</li>
              <li><strong>View the differences</strong> highlighted inline. Added keys, removed keys, and changed values are all color-coded.</li>
            </ol>
          </SeoSection>

          <SeoSection title="When to Use JSON Compare" isLight={isLight}>
            <p>JSON diff is essential for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Comparing API responses between staging and production</li>
              <li>Reviewing Terraform or CloudFormation state file changes</li>
              <li>Debugging differences in database exports</li>
              <li>Validating that a transformation or migration preserved data correctly</li>
              <li>Code review — checking that config changes match expectations</li>
            </ul>
          </SeoSection>
        </>
      )}
    />
  );
}

// --- JSON to CSV Landing Page ---
export function JsonToCsvPage() {
  return (
    <LandingWrapper
      h1="Free Online JSON to CSV Converter"
      seoContent={(isLight) => (
        <>
          <SeoSection title="Convert JSON Arrays to CSV" isLight={isLight}>
            <p>PrettyJSON can export JSON arrays directly to CSV format for use in Excel, Google Sheets, or any spreadsheet application. If your JSON is an array of objects with consistent keys, each object becomes a row and each key becomes a column header. Nested values are flattened into dot-notation paths.</p>
            <p>This is useful when you need to share API data with non-technical team members, import records into a database, or create charts and pivot tables from JSON data sources.</p>
          </SeoSection>

          <SeoSection title="How to Convert JSON to CSV" isLight={isLight}>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Paste your JSON array</strong> into the editor above. It should be an array of objects like <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">[{`{"name": "Alice", "age": 30}`}, ...]</code>.</li>
              <li><strong>Click the Export button</strong> in the toolbar and select <strong>CSV</strong>.</li>
              <li><strong>Download the file</strong> or copy it to your clipboard. Open it in Excel or Google Sheets to work with the data as a table.</li>
            </ol>
          </SeoSection>

          <SeoSection title="Handling Nested JSON in CSV" isLight={isLight}>
            <p>Flat JSON converts cleanly to CSV, but real-world data often has nested objects and arrays. PrettyJSON flattens these automatically — <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">address.city</code> becomes a column header, and array items are joined with commas. If you need more control, use the Table view to preview how the data will look before exporting.</p>
          </SeoSection>
        </>
      )}
    />
  );
}

// --- JSON Minifier Landing Page ---
export function JsonMinifierPage() {
  return (
    <LandingWrapper
      h1="Free Online JSON Minifier & Compressor"
      seoContent={(isLight) => (
        <>
          <SeoSection title="What Is JSON Minification?" isLight={isLight}>
            <p>JSON minification removes all unnecessary whitespace — spaces, tabs, and newlines — from a JSON document to produce the smallest possible output. The data stays identical; only the formatting changes. A beautified 50 KB config file might shrink to 15 KB after minification.</p>
            <p>This matters for production environments where every kilobyte counts: smaller API payloads mean faster network transfers, reduced bandwidth costs, and quicker page loads.</p>
          </SeoSection>

          <SeoSection title="How to Minify JSON" isLight={isLight}>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Paste your JSON</strong> into the editor above.</li>
              <li><strong>Click Min</strong> (or press <code className="px-1 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 font-mono">Ctrl+M</code>). All whitespace is stripped instantly.</li>
              <li><strong>Copy the minified output</strong> for use in production configs, API calls, or database storage.</li>
            </ol>
          </SeoSection>

          <SeoSection title="When to Minify vs. Beautify" isLight={isLight}>
            <p>Use <strong>minification</strong> when the JSON is consumed by machines — API requests, config files deployed to servers, data stored in databases, or payloads sent over the network. Use <strong>beautification</strong> when humans need to read it — debugging, code review, documentation, or logging. PrettyJSON lets you switch between both with one click.</p>
          </SeoSection>
        </>
      )}
    />
  );
}

// --- JSON Editor Landing Page ---
export function JsonEditorPage() {
  return (
    <LandingWrapper
      h1="Free Online JSON Editor"
      seoContent={(isLight) => (
        <>
          <SeoSection title="Edit JSON Directly in Your Browser" isLight={isLight}>
            <p>PrettyJSON is a full-featured JSON editor that runs entirely in your browser. Type directly in the text editor for precise control, or switch to Tree view to click and edit individual values without worrying about syntax. Every change is validated in real time — errors appear instantly in the status bar.</p>
            <p>The editor supports undo/redo (Ctrl+Z / Ctrl+Shift+Z), search and replace, auto-indentation, and syntax highlighting. It handles files up to 10 MB without lag thanks to optimized rendering.</p>
          </SeoSection>

          <SeoSection title="Key Editing Features" isLight={isLight}>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Inline tree editing</strong> — Click any value in Tree view to change it. The JSON updates automatically.</li>
              <li><strong>Auto-repair</strong> — Pasted invalid JSON? Click Auto Repair to fix trailing commas, single quotes, missing brackets, and more.</li>
              <li><strong>Search & replace</strong> — Find and replace across the entire document with regex support.</li>
              <li><strong>Format on paste</strong> — Drop in messy JSON and it auto-beautifies.</li>
              <li><strong>Local auto-save</strong> — Your work is saved in the browser so you don't lose data on accidental page close.</li>
            </ul>
          </SeoSection>

          <SeoSection title="No Account Required" isLight={isLight}>
            <p>PrettyJSON requires no sign-up, no login, and no installation. Open the page, paste your JSON, and start editing. Your data stays on your machine — nothing is ever sent to a server.</p>
          </SeoSection>
        </>
      )}
    />
  );
}
