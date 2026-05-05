'use client';

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { SiteHeader } from "@/components/site-header";
import { DocSidebar, UserApiRow } from "@/components/doc-sidebar";
import { StructuredDocViewer } from "@/components/structured-doc-viewer";
import { Spinner } from "@/components/ui/spinner";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/services/apiClient";
import { FileText, Code2 } from "lucide-react";

// PdfViewer uses DOMMatrix (browser-only) — must skip SSR
const PdfViewer = dynamic(
  () => import("@/components/pdf-viewer").then(m => m.PdfViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

type ActiveTab = 'docs' | 'pdf';

export default function UserDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  // ── API list state ───────────────────────────────────────────────────
  const [assignedApis, setAssignedApis] = useState<UserApiRow[]>([]);
  const [listLoading, setListLoading]   = useState(true);
  const [listError, setListError]       = useState<string | null>(null);

  // ── Selected document state ──────────────────────────────────────────
  const [activeApiId, setActiveApiId]   = useState<number | null>(null);
  const [activeTab, setActiveTab]       = useState<ActiveTab>('docs');

  // ── PDF blob state ───────────────────────────────────────────────────
  const [pdfBlobUrl, setPdfBlobUrl]     = useState<string | null>(null);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const [pdfError, setPdfError]         = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const pdfUrlRef = useState<string | null>(null); // We keep the state for rendering, but we'll use a ref-like approach for cleanup

  // ── Auth guard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else if (user.role === 'ADMIN') {
        router.replace("/admin");
      }
    }
  }, [authLoading, user, router]);

  // ── Fetch assigned APIs ──────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== 'USER') {
      setListLoading(false);
      return;
    }
    const load = async () => {
      setListLoading(true);
      setListError(null);
      const res = await apiClient.getUserAPIs();
      if (res.success && res.data) {
        setAssignedApis(Array.isArray(res.data) ? res.data : []);
      } else {
        setListError(res.error ?? 'Failed to load your assigned APIs');
      }
      setListLoading(false);
    };
    load();
  }, [user]);

  // ── Load PDF blob for the selected API ───────────────────────────────
  const loadPdf = useCallback(async (apiId: number) => {
    // Revoke old URL if it exists
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
    
    setPdfLoading(true);
    setPdfBlobUrl(null);
    setPdfError(null);

    try {
      const base  = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '');
      const token = localStorage.getItem('authToken');
      const res   = await fetch(`${base}/user/apis/${apiId}/docs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const newUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(newUrl);
    } catch (e: any) {
      setPdfError(e.message || 'Failed to load document');
    } finally {
      setPdfLoading(false);
    }
  }, [pdfBlobUrl]); // We still need this dependency to revoke the PREVIOUS one

  // ── Handle API selection ──────────────────────────────────────────────
  const handleNavigate = useCallback((id: number | 'getting-started') => {
    setSidebarOpen(false);
    if (id === 'getting-started' || typeof id !== 'number') {
      setActiveApiId(null);
      setPdfBlobUrl(null);
      setPdfError(null);
      return;
    }
    setActiveApiId(id);
    setActiveTab('docs'); // default to API Docs tab on selection
    loadPdf(id);          // preload PDF in background
  }, [loadPdf]);

  // ── Cleanup blob URLs on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => { if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl); };
  }, [pdfBlobUrl]);

  if (authLoading || listLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!user) return null;

  const selectedApi = assignedApis.find(a => a.id === activeApiId) ?? null;
  const hasParsed   = !!(selectedApi?.parsedDocumentation);
  const hasRawDoc   = !!(selectedApi?.documentation);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onLogout={() => { logout(); router.replace('/login'); }}
        userName={user.name}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Left sidebar (API list) ──────────────────────────────────── */}
        <DocSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          apis={assignedApis}
          activeDocId={activeApiId ?? 'getting-started'}
          onNavigate={handleNavigate}
        />

        {/* ── Main content area ────────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden flex flex-col bg-slate-900/20">

          {listError ? (
            <div className="p-6">
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">{listError}</div>
            </div>

          ) : !activeApiId ? (
            /* ── Getting started ─────────────────────────────────────── */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md px-6">
                <div className="text-5xl mb-6">📄</div>
                <h1 className="text-2xl font-bold text-white mb-3">Select an API</h1>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Choose an API from the sidebar to explore its documentation and original PDF.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8 text-left">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-purple-400 mb-1">API Reference</p>
                    <p className="text-xs text-gray-500">Structured endpoints, parameters, and examples extracted automatically</p>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-blue-400 mb-1">Original PDF</p>
                    <p className="text-xs text-gray-500">View the source document exactly as uploaded, with full fidelity</p>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* ── Document viewer with tabs ───────────────────────────── */
            <div className="flex-1 overflow-hidden flex flex-col">

              {/* Title + Tab bar */}
              <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-sm font-bold text-white">{selectedApi?.name}</h1>
                    {selectedApi?.description && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-lg">{selectedApi.description}</p>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('docs')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      activeTab === 'docs'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Code2 size={12} />
                    API Reference
                  </button>
                  <button
                    onClick={() => setActiveTab('pdf')}
                    disabled={!hasRawDoc}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      activeTab === 'pdf'
                        ? 'bg-purple-600 text-white'
                        : hasRawDoc
                          ? 'text-gray-400 hover:text-white hover:bg-slate-800'
                          : 'text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <FileText size={12} />
                    PDF Document
                    {!hasRawDoc && <span className="text-[10px] text-gray-600 ml-1">(none)</span>}
                  </button>
                </div>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-hidden">

                {/* ── API Reference tab ───────────────────────────────── */}
                {activeTab === 'docs' && (
                  <StructuredDocViewer
                    jsonString={selectedApi?.parsedDocumentation}
                    fallbackText={
                      hasRawDoc
                        ? 'Structured documentation was not generated for this API. Switch to the PDF tab to view the original document.'
                        : 'No documentation has been uploaded for this API yet.'
                    }
                    apiId={activeApiId}
                    hasRawDoc={hasRawDoc}
                  />
                )}

                {/* ── PDF Document tab ────────────────────────────────── */}
                {activeTab === 'pdf' && (
                  <div className="h-full overflow-hidden">
                    {pdfLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Loading {selectedApi?.name}…</span>
                      </div>

                    ) : pdfError ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
                        <p className="text-sm text-red-400">⚠ {pdfError}</p>
                        <button
                          onClick={() => activeApiId && loadPdf(activeApiId)}
                          className="text-xs bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-700 transition text-gray-300"
                        >
                          Retry
                        </button>
                      </div>

                    ) : pdfBlobUrl ? (
                      <PdfViewer
                        blobUrl={pdfBlobUrl}
                        title={selectedApi?.name}
                      />
                    ) : null}
                  </div>
                )}

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}