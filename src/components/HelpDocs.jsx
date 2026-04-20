import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen, Layers, Wrench, GitCompare, Search, Download, Keyboard, Shield, HelpCircle } from 'lucide-react';

const sections = [
  {
    id: 'getting-started',
    icon: BookOpen,
    title: 'Getting Started',
    content: (
      <>
        <p>Welcome to PrettyJSON! Here's how to get up and running in under a minute.</p>
        <h4>Step 1 — Load Your Data</h4>
        <p>You have three ways to bring JSON into the editor:</p>
        <ul>
          <li><strong>Paste directly</strong> — click the editor and hit <code>Ctrl+V</code> (or <code>⌘+V</code> on Mac). It auto-formats on paste.</li>
          <li><strong>Upload a file</strong> — click the Upload button, or just drag a <code>.json</code> file from your desktop into the panel.</li>
          <li><strong>Open a shared link</strong> — if someone sent you a PrettyJSON URL, open it and the data loads by itself.</li>
        </ul>
        <h4>Step 2 — Work With It</h4>
        <p>Once your data shows up in the editor, you can:</p>
        <ol>
          <li>Hit <strong>Format</strong> to indent everything cleanly, or <strong>Min</strong> to squash it into one line.</li>
          <li>Flip between <strong>Text</strong>, <strong>Tree</strong>, and <strong>Table</strong> views using the tabs. Each one suits a different task (see "Editor Modes" below).</li>
          <li>Use the search bar to hunt for specific keys or values. Press <code>Enter</code> to hop through matches.</li>
        </ol>
        <h4>Step 3 — Save or Share</h4>
        <p>When you're done, use the export button to download your JSON, copy it to clipboard, or convert it to CSV. Hit <strong>Share</strong> to generate a link you can send to anyone.</p>
        <h4>What Can I Paste?</h4>
        <ul>
          <li>Any valid JSON — objects, arrays, strings, numbers, booleans, null</li>
          <li>Minified or unformatted JSON (we'll clean it up for you)</li>
          <li>Broken JSON with small errors — click "Auto Repair" when the error bar pops up</li>
          <li>Files up to 10 MB in size</li>
        </ul>
      </>
    ),
  },
  {
    id: 'modes',
    icon: Layers,
    title: 'Editor Modes',
    content: (
      <>
        <p>The tabs above the editor let you switch between three views. Your data stays the same — only the way it's displayed changes.</p>
        <h4>Text Mode</h4>
        <p>The default view. It shows your JSON as raw text with syntax coloring and line numbers, much like a code editor. Use this when you want to:</p>
        <ul>
          <li>See the exact characters — every comma, quote, and bracket</li>
          <li>Make precise edits by typing directly into the text</li>
          <li>Run search-and-replace across the whole document</li>
          <li>Format or minify with a single click</li>
        </ul>
        <p>The status bar along the bottom shows your cursor position, total key count, nesting depth, and file size.</p>

        <h4>Tree Mode</h4>
        <p>Shows your JSON as a collapsible tree of nodes. Click the arrows to expand or collapse any section. This works best when you need to:</p>
        <ul>
          <li>Navigate large, deeply nested documents without getting lost</li>
          <li>Locate a specific key by searching — matching nodes expand on their own</li>
          <li>Edit individual values inline (click any value to change it)</li>
          <li>Run JSONPath or JMESPath queries to filter data</li>
        </ul>

        <h4>Table Mode</h4>
        <p>If your JSON is an array of objects (like a list of users or products), Table mode lays it out as a spreadsheet-style grid. Each object becomes a row, and each key becomes a column header. You can click any column to sort the data.</p>
      </>
    ),
  },
  {
    id: 'format-minify',
    icon: Wrench,
    title: 'Format, Minify & Repair',
    content: (
      <>
        <h4>Formatting</h4>
        <p>Hit the <strong>Format</strong> button (or press <code>Ctrl+Shift+F</code>) to add clean indentation and line breaks. This turns a wall of text into something readable. PrettyJSON uses 2-space indentation.</p>

        <h4>Minifying</h4>
        <p>The <strong>Min</strong> button (or <code>Ctrl+M</code>) does the opposite — it strips all whitespace and newlines to produce the smallest valid JSON string. Handy when pasting into a config file, API tool, or database field.</p>

        <h4>Auto Repair</h4>
        <p>When your JSON has errors, a red bar shows up at the bottom explaining what went wrong. You get two options:</p>
        <ul>
          <li><strong>Auto Repair</strong> — tries to fix the problem for you. It handles a wide range of issues:</li>
        </ul>
        <div style={{ paddingLeft: '1.25rem' }}>
          <ul>
            <li>Trailing commas after the last item</li>
            <li>Single quotes instead of the required double quotes</li>
            <li>Property names without quotes (JavaScript-style objects)</li>
            <li>Comments — both <code>//</code> and <code>/* */</code></li>
            <li>Unclosed brackets, braces, or strings</li>
            <li>JSONP wrappers like <code>callback(&#123;...&#125;)</code></li>
            <li>MongoDB types like <code>ObjectId("...")</code></li>
            <li>Concatenated JSON objects (newline-delimited JSON)</li>
          </ul>
        </div>
        <ul>
          <li><strong>Show me</strong> — jumps your cursor straight to the error location so you can fix it by hand.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'search',
    icon: Search,
    title: 'Search, Replace & Query',
    content: (
      <>
        <h4>Basic Search</h4>
        <p>The search bar sits below the toolbar. Start typing and every match gets found right away. A counter shows something like "3 of 17" so you know where you are.</p>
        <ul>
          <li>Press <code>Enter</code> to jump to the next match, <code>Shift+Enter</code> for the previous one.</li>
          <li>Toggle the <code>Aa</code> button for case-sensitive matching.</li>
          <li>In Text mode, matches show up highlighted in yellow. The current match has a brighter outline so it stands out.</li>
          <li>In Tree mode, matching nodes expand automatically and get highlighted.</li>
        </ul>

        <h4>Replace</h4>
        <p>Click the expand arrow next to the search bar to open the replace field. Replace one match at a time or hit "Replace All" to swap every occurrence in one shot.</p>

        <h4>Query Modes (Tree View Only)</h4>
        <p>In Tree mode, toggle buttons in the search bar let you pick a query language:</p>
        <ul>
          <li><strong>Path</strong> — type a dot-separated path like <code>user.address.city</code> to jump right to that part of the tree.</li>
          <li><strong>JSONPath</strong> — use expressions like <code>$.store.book[?(@.price &lt; 10)].title</code> to select specific nodes. Perfect for complex filtering.</li>
          <li><strong>JMESPath</strong> — a clean query syntax popular in AWS tools. Example: <code>people[?age &gt; 30].name</code> gives you names of people over 30.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'compare-diff',
    icon: GitCompare,
    title: 'Compare & Diff',
    content: (
      <>
        <h4>How to Compare Two Documents</h4>
        <ol>
          <li>Click <strong>Compare</strong> in the top toolbar. Two panels open side by side.</li>
          <li>Paste (or upload) one JSON in the left panel and another in the right panel.</li>
          <li>Click the <strong>Diff</strong> button to switch to the comparison view.</li>
        </ol>

        <h4>Reading the Diff Output</h4>
        <p>The diff view shows a line-by-line comparison with color coding:</p>
        <ul>
          <li className="text-emerald-500"><strong>Green</strong> — lines added (present in right, missing in left)</li>
          <li className="text-amber-500"><strong>Yellow</strong> — lines modified (exist in both but changed)</li>
          <li className="text-red-500"><strong>Red</strong> — lines removed (present in left, missing in right)</li>
        </ul>
        <p>You can also switch to the <strong>Tree</strong> tab inside the diff view to see a structural comparison. This ignores whitespace and focuses on actual data changes at the key/value level.</p>

        <h4>Tips</h4>
        <ul>
          <li>Format both documents before comparing — it makes the line diff much cleaner.</li>
          <li>The diff works best when the two documents share a similar structure. Completely different ones will mostly show additions and deletions.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'export',
    icon: Download,
    title: 'Export & Share',
    content: (
      <>
        <h4>Exporting Your Data</h4>
        <p>Click the export icon in the panel toolbar and you'll see these options:</p>
        <ul>
          <li><strong>Copy formatted</strong> — puts the nicely indented JSON on your clipboard.</li>
          <li><strong>Copy minified</strong> — copies a compacted version with no extra whitespace.</li>
          <li><strong>Download .json</strong> — saves the file straight to your computer.</li>
          <li><strong>Export CSV</strong> — if your data is an array of objects, this turns it into a CSV you can open in Excel or Google Sheets.</li>
        </ul>

        <h4>Sharing a Link</h4>
        <p>Click <strong>Share</strong> in the top toolbar. PrettyJSON compresses your JSON and tucks it into the URL. Copy the link and send it to whoever needs it — the data loads automatically on their end.</p>
        <p>A few things worth knowing:</p>
        <ul>
          <li>The data sits entirely in the URL (after the <code>#</code>). Nothing gets uploaded to any server.</li>
          <li>Works best with small documents (under ~5 KB). Bigger ones may bump into the browser's URL length limit.</li>
          <li>Anyone with the link can see the data, so don't share anything sensitive this way.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'shortcuts',
    icon: Keyboard,
    title: 'Keyboard Shortcuts',
    content: (
      <>
        <p>These shortcuts work when the editor panel is focused. Press <code>Ctrl+K</code> anytime to see the full overlay.</p>
        <div className="shortcuts-table">
          <table>
            <thead>
              <tr><th>What it does</th><th>Windows / Linux</th><th>Mac</th></tr>
            </thead>
            <tbody>
              <tr><td>Format (pretty print)</td><td><code>Ctrl+Shift+F</code></td><td><code>⌘+Shift+F</code></td></tr>
              <tr><td>Minify (compact)</td><td><code>Ctrl+M</code></td><td><code>⌘+M</code></td></tr>
              <tr><td>Copy to clipboard</td><td><code>Ctrl+Shift+C</code></td><td><code>⌘+Shift+C</code></td></tr>
              <tr><td>Undo last change</td><td><code>Ctrl+Z</code></td><td><code>⌘+Z</code></td></tr>
              <tr><td>Redo last change</td><td><code>Ctrl+Shift+Z</code></td><td><code>⌘+Shift+Z</code></td></tr>
              <tr><td>Open search bar</td><td><code>Ctrl+F</code></td><td><code>⌘+F</code></td></tr>
              <tr><td>Show shortcuts overlay</td><td><code>Ctrl+K</code></td><td><code>⌘+K</code></td></tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Privacy & Security',
    content: (
      <>
        <p>We built PrettyJSON with a strict "your data stays on your machine" approach. Here's what that means in practice:</p>
        <ul>
          <li><strong>Everything runs in your browser.</strong> When you paste JSON, your browser's JavaScript engine handles the parsing, formatting, and validation. No server is involved. You can disconnect from the internet after the page loads and everything still works.</li>
          <li><strong>We don't collect your data.</strong> There's no database, no analytics on your JSON content, and no way for us to see what you paste. The only network requests the site makes are for loading the page and displaying ads.</li>
          <li><strong>No sign-up required.</strong> No accounts, no cookies tracking your editing sessions, no login walls.</li>
          <li><strong>Auto-save stays local.</strong> Your last document is saved in your browser's localStorage to prevent accidental data loss. That data never leaves your device.</li>
          <li><strong>HTTPS everywhere.</strong> The whole site runs over a secure connection.</li>
        </ul>
        <p>For the full legal details, check out our Privacy Policy — the link is in the footer.</p>
      </>
    ),
  },
  {
    id: 'faq',
    icon: HelpCircle,
    title: 'Troubleshooting & Tips',
    content: (
      <>
        <div className="faq-item">
          <h4>My JSON won't parse. What should I check?</h4>
          <p>Look at the red error bar at the bottom — it tells you the exact line and column where things went wrong. The usual suspects are trailing commas, single quotes, and unquoted keys. Hit "Auto Repair" and it'll usually sort itself out. If that doesn't work, click "Show me" to jump right to the problem spot.</p>
        </div>

        <div className="faq-item">
          <h4>The editor feels sluggish with my file. Any advice?</h4>
          <p>For big files (several MB), stick with Text mode — it's the lightest on your browser. Tree mode builds an interactive DOM element for every single node, which gets heavy once you pass 100K+ keys. If you only need part of the data, use a JMESPath query to trim it down first, then switch to Tree.</p>
        </div>

        <div className="faq-item">
          <h4>Can I edit values directly in Tree mode?</h4>
          <p>Absolutely. Click on any value in the tree to edit it inline. Once you finish, the text panel updates automatically to reflect the change. This works for keys too — click on a key name to rename it.</p>
        </div>

        <div className="faq-item">
          <h4>I accidentally cleared my data. Can I get it back?</h4>
          <p>Press <code>Ctrl+Z</code> (or <code>⌘+Z</code> on Mac) to undo. PrettyJSON keeps a full undo history for your session. You can also redo with <code>Ctrl+Shift+Z</code>. If you refreshed the page, your last document should be restored from localStorage automatically.</p>
        </div>

        <div className="faq-item">
          <h4>Can I use this for non-JSON data like XML or YAML?</h4>
          <p>PrettyJSON is built specifically for JSON. It won't parse XML, YAML, or TOML. That said, the auto-repair feature can handle some edge cases — it'll convert JavaScript objects (without double quotes) and JSONP wrappers into valid JSON for you.</p>
        </div>

        <div className="faq-item">
          <h4>Does the CSV export handle nested objects?</h4>
          <p>Partially. Flat arrays of objects work perfectly — each key becomes a column. For nested objects, the values get turned into JSON strings in the CSV cells. If you want a fully flat CSV, use a JMESPath query to flatten the structure first, then export.</p>
        </div>

        <div className="faq-item">
          <h4>When should I use Path vs. JSONPath vs. JMESPath?</h4>
          <p><strong>Path</strong> is the simplest — just type something like <code>users.0.name</code> and it takes you there. <strong>JSONPath</strong> adds wildcards and filters (e.g., <code>$..book[?(@.price&lt;10)]</code>), which is great for plucking out specific items from complex structures. <strong>JMESPath</strong> has cleaner syntax for projections and multi-select, and it's widely used in AWS CLI. Start with Path and reach for the others when you need more muscle.</p>
        </div>

        <div className="faq-item">
          <h4>How do I format just part of my JSON?</h4>
          <p>Currently, the Format button applies to the entire document. If you only need a section formatted, copy that section into a new browser tab with PrettyJSON, format it there, and paste it back. Alternatively, use Tree mode to navigate to the section you care about — it's already neatly structured there.</p>
        </div>
      </>
    ),
  },
];

export default function HelpDocs() {
  const { theme } = useOutletContext();
  const [expandedSection, setExpandedSection] = useState('getting-started');
  const isLight = theme === 'light';

  const toggleSection = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-16 font-sans">
      <div
        className="relative w-full rounded-xl border flex flex-col"
        style={{
          background: isLight ? '#ffffff' : '#1e293b',
          borderColor: isLight ? '#e2e8f0' : '#334155',
          color: isLight ? '#0f172a' : '#f1f5f9',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: isLight ? '#e2e8f0' : '#334155' }}>
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-blue-500" />
            <h1 className="text-lg font-semibold">Documentation & Help</h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              const isExpanded = expandedSection === section.id;
              return (
                <div key={section.id} className="rounded-lg border overflow-hidden"
                  style={{ borderColor: isLight ? '#e2e8f0' : '#334155' }}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      isExpanded
                        ? (isLight ? 'bg-blue-50' : 'bg-blue-600/10')
                        : (isLight ? 'hover:bg-slate-50' : 'hover:bg-white/[0.03]')
                    }`}
                  >
                    <Icon size={16} className={isExpanded ? 'text-blue-500' : (isLight ? 'text-slate-400' : 'text-slate-500')} />
                    <span className={`flex-1 text-sm font-medium ${isExpanded ? 'text-blue-600 dark:text-blue-400' : ''}`}
                      style={isExpanded ? { color: isLight ? '#2563eb' : '#60a5fa' } : {}}>
                      {section.title}
                    </span>
                    {isExpanded
                      ? <ChevronDown size={14} className="text-blue-500" />
                      : <ChevronRight size={14} style={{ color: isLight ? '#94a3b8' : '#475569' }} />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 text-sm leading-relaxed help-content"
                      style={{ color: isLight ? '#334155' : '#cbd5e1' }}>
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t text-center text-xs flex-shrink-0"
          style={{ borderColor: isLight ? '#e2e8f0' : '#334155', color: isLight ? '#94a3b8' : '#475569' }}>
          PrettyJSON — Free Online JSON Formatter &amp; Editor &middot; prettyjson.org
        </div>
      </div>
    </div>
  );
}
