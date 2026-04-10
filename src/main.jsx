import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

console.log('%cPrettyJSON', 'color: #3b82f6; font-size: 18px; font-weight: bold; text-shadow: 0 0 10px rgba(59,130,246,0.5);');
console.log('%cAdvanced JSON Formatter & Visualizer', 'color: #64748b; font-size: 12px; font-style: italic;');
console.log('%cFeatures: Tree View • Table View • Diff • Auto-Repair • Format', 'color: #94a3b8; font-size: 11px;');
console.log('');

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
