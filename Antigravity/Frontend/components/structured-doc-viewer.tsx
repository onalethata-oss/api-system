'use client';

import { Copy, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface StructuredDocViewerProps {
  jsonString?: string | null;
  fallbackText?: string;
  apiId?: number;
  hasRawDoc?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-slate-700 transition"
      title="Copy"
    >
      {copied ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    POST: 'bg-green-500/20 text-green-300 border-green-500/30',
    PUT: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    PATCH: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    DELETE: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return (
    <span className={cn('text-xs font-bold px-2 py-0.5 rounded border', colors[method.toUpperCase()] ?? 'bg-slate-700 text-gray-300 border-slate-600')}>
      {method.toUpperCase()}
    </span>
  );
}

export function StructuredDocViewer({ jsonString, fallbackText, apiId, hasRawDoc }: StructuredDocViewerProps) {
  // ── Parse JSON ────────────────────────────────────────────────────────
  let sections: any[] = [];
  if (jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      sections = Array.isArray(parsed) ? parsed : [];
    } catch {
      sections = [];
    }
  }

  // ── Empty / Fallback state ────────────────────────────────────────────
  if (sections.length === 0) {
    const handleDownload = () => {
      if (!apiId) return;
      const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
      const token = localStorage.getItem('authToken');
      fetch(`${base}/user/apis/${apiId}/docs`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `api-${apiId}-docs`;
          a.click();
          URL.revokeObjectURL(url);
        });
    };

    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 py-16">
        <div className="text-4xl">📄</div>
        <p className="text-sm text-center max-w-sm">
          {fallbackText ?? 'No structured documentation available.'}
        </p>
        {hasRawDoc && apiId && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 mt-2 text-sm bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-700 transition text-gray-300"
          >
            <Download size={14} />
            Download Original Document
          </button>
        )}
      </div>
    );
  }

  // ── Detect PDF endpoint schema: array of { title, method, endpoint, ... } ──
  const isPdfSchema = sections.length > 0 && 'method' in sections[0];

  if (isPdfSchema) {
    return (
      <div className="p-6 space-y-8 overflow-y-auto h-full">
        {sections.map((endpoint: any, i: number) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            {/* Endpoint header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-start gap-3">
              <MethodBadge method={endpoint.method ?? 'GET'} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-cyan-300 truncate">{endpoint.endpoint}</code>
                  <CopyButton text={endpoint.endpoint} />
                </div>
                {endpoint.title && <p className="text-sm font-semibold text-white mt-1">{endpoint.title}</p>}
              </div>
            </div>

            <div className="px-5 py-4 space-y-4">
              {endpoint.description && (
                <p className="text-sm text-gray-400 leading-relaxed">{endpoint.description}</p>
              )}

              {/* Parameters */}
              {endpoint.parameters?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parameters</p>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-900/80">
                        <tr>
                          {['Name', 'Type', 'Required', 'Description'].map(h => (
                            <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-slate-800">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {endpoint.parameters.map((p: any, pi: number) => (
                          <tr key={pi} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition">
                            <td className="px-3 py-2 font-mono text-purple-300 text-xs">{p.name}</td>
                            <td className="px-3 py-2 text-gray-400 text-xs">{p.type}</td>
                            <td className="px-3 py-2 text-xs">
                              <span className={p.required ? 'text-red-400' : 'text-gray-500'}>
                                {p.required ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-gray-400 text-xs">{p.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Examples */}
              {endpoint.examples?.length > 0 && endpoint.examples.map((ex: any, ei: number) => (
                <div key={ei}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {ex.label ?? `Example ${ei + 1}`}
                  </p>
                  <div className="relative rounded-lg overflow-hidden border border-slate-800">
                    <div className="absolute top-2 right-2 z-10">
                      <CopyButton text={typeof ex.code === 'string' ? ex.code : JSON.stringify(ex.code, null, 2)} />
                    </div>
                    <SyntaxHighlighter
                      language={ex.language ?? 'json'}
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.75rem' }}
                    >
                      {typeof ex.code === 'string' ? ex.code : JSON.stringify(ex.code, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── DOCX schema: array of { type, content, rows? } ───────────────────
  return (
    <div className="p-6 space-y-4 overflow-y-auto h-full">
      {sections.map((section: any, i: number) => {
        const { type, content, rows } = section;

        if (type === 'heading') {
          return (
            <h2 key={i} className="text-lg font-bold text-white border-b border-slate-800 pb-2 mt-6 first:mt-0">
              {content}
            </h2>
          );
        }

        if (type === 'code') {
          return (
            <div key={i} className="relative rounded-lg overflow-hidden border border-slate-800">
              <div className="absolute top-2 right-2 z-10">
                <CopyButton text={content} />
              </div>
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.75rem' }}
              >
                {content}
              </SyntaxHighlighter>
            </div>
          );
        }

        if (type === 'table' && Array.isArray(rows) && rows.length > 0) {
          const headers: string[] = rows[0];
          const body: string[][] = rows.slice(1);
          return (
            <div key={i} className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/80">
                  <tr>
                    {headers.map((h, hi) => (
                      <th key={hi} className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-slate-800">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((row, ri) => (
                    <tr key={ri} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-gray-300 text-xs">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // paragraph / text
        if (content) {
          return (
            <p key={i} className="text-sm text-gray-400 leading-relaxed">
              {content}
            </p>
          );
        }

        return null;
      })}
    </div>
  );
}
