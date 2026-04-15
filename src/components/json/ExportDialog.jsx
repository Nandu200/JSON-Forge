import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Download,
  FileJson,
  Table2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { exportToJSON, exportToCSV, convertToCSV } from '@/utils/schemaValidation';

function CsvPreview({ jsonData, isLight }) {
  const csvLines = useMemo(() => {
    const csv = convertToCSV(jsonData);
    const lines = csv.split('\n');
    return { preview: lines.slice(0, 5).join('\n'), hasMore: lines.length > 5 };
  }, [jsonData]);

  return (
    <div className="space-y-2">
      <span className={`text-[10px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
        CSV Preview (first 5 lines):
      </span>
      <div className={`p-3 rounded border overflow-x-auto ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#080910] border-white/[0.06]'
      }`}>
        <pre className={`text-[9px] font-mono whitespace-pre ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          {csvLines.preview}{csvLines.hasMore && '\n...'}
        </pre>
      </div>
    </div>
  );
}

export default function ExportDialog({
  jsonData,
  jsonValue,
  currentView,
  theme,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonFilename, setJsonFilename] = useState('data.json');
  const [csvFilename, setCsvFilename] = useState('data.csv');
  const [exportSuccess, setExportSuccess] = useState(null);

  const isLight = theme === 'light';

  const handleExportJSON = useCallback(() => {
    if (!jsonData) return;
    exportToJSON(jsonData, jsonFilename);
    setExportSuccess('json');
    setTimeout(() => setExportSuccess(null), 2000);
  }, [jsonData, jsonFilename]);

  const handleExportCSV = useCallback(() => {
    if (!jsonData) return;
    exportToCSV(jsonData, csvFilename);
    setExportSuccess('csv');
    setTimeout(() => setExportSuccess(null), 2000);
  }, [jsonData, csvFilename]);

  const canExportJSON = jsonData !== null && jsonData !== undefined;
  const canExportCSV = canExportJSON;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className={`flex items-center gap-1.5 px-2.5 h-6 text-[10px] font-mono rounded border transition-all ${
            isLight
              ? 'bg-black/[0.04] text-slate-600 border-black/[0.08] hover:bg-black/[0.08]'
              : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:bg-white/[0.06]'
          }`}
          title="Export data"
        >
          <Download size={11} />
          Export
        </button>
      </DialogTrigger>

      <DialogContent
        className={`max-w-md ${isLight ? 'bg-white' : 'bg-[#0a0c12]'}`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-sm font-semibold flex items-center gap-2 ${
              isLight ? 'text-slate-800' : 'text-white'
            }`}
          >
            <Download size={16} className="text-blue-400" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Export as JSON */}
          <div
            className={`p-4 rounded-lg border ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <FileJson size={16} className="text-blue-400" />
              <span
                className={`text-[12px] font-medium ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                Export as JSON
              </span>
            </div>

            <p
              className={`text-[11px] mb-3 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Download the current JSON data as a formatted .json file.
            </p>

            <div className="flex items-center gap-2">
              <Input
                value={jsonFilename}
                onChange={(e) => setJsonFilename(e.target.value)}
                placeholder="filename.json"
                className={`h-8 text-[11px] font-mono ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-[#080910] border-white/[0.08]'
                }`}
              />
              <Button
                onClick={handleExportJSON}
                disabled={!canExportJSON}
                className="h-8 px-3 text-[11px] font-mono bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              >
                {exportSuccess === 'json' ? (
                  <>
                    <CheckCircle2 size={12} className="mr-1.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Download size={12} className="mr-1.5" />
                    Download
                  </>
                )}
              </Button>
            </div>

            {!canExportJSON && (
              <div
                className={`flex items-center gap-1.5 mt-2 text-[10px] ${
                  isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                <AlertCircle size={11} />
                No valid JSON data to export
              </div>
            )}
          </div>

          {/* Export as CSV */}
          <div
            className={`p-4 rounded-lg border ${
              isLight ? 'border-slate-200 bg-slate-50' : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Table2 size={16} className="text-emerald-400" />
              <span
                className={`text-[12px] font-medium ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}
              >
                Export as CSV
              </span>
            </div>

            <p
              className={`text-[11px] mb-3 ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Download the current view data as a .csv file for spreadsheet applications.
            </p>

            <div className="flex items-center gap-2">
              <Input
                value={csvFilename}
                onChange={(e) => setCsvFilename(e.target.value)}
                placeholder="filename.csv"
                className={`h-8 text-[11px] font-mono ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-[#080910] border-white/[0.08]'
                }`}
              />
              <Button
                onClick={handleExportCSV}
                disabled={!canExportCSV}
                className="h-8 px-3 text-[11px] font-mono bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"
              >
                {exportSuccess === 'csv' ? (
                  <>
                    <CheckCircle2 size={12} className="mr-1.5" />
                    Saved
                  </>
                ) : (
                  <>
                    <Download size={12} className="mr-1.5" />
                    Download
                  </>
                )}
              </Button>
            </div>

            {!canExportCSV && (
              <div
                className={`flex items-center gap-1.5 mt-2 text-[10px] ${
                  isLight ? 'text-amber-600' : 'text-amber-400'
                }`}
              >
                <AlertCircle size={11} />
                No valid JSON data to export
              </div>
            )}
          </div>

          {/* CSV Preview */}
          {canExportCSV && (
            <CsvPreview jsonData={jsonData} isLight={isLight} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
