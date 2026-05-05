'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle, Edit, Trash2, Eye, Download, Package, ArrowUpDown } from 'lucide-react';
import { apiClient } from '@/lib/services/apiClient';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export default function AllApisPage() {
  const [apisData, setApisData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewApi, setViewApi] = useState<any | null>(null);
  const [editApi, setEditApi] = useState<any | null>(null);
  const [deleteApiId, setDeleteApiId] = useState<number | null>(null);
  
  const [editFormData, setEditFormData] = useState({ name: '', endpointUrl: '', description: '' });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const { user, loading: authLoading } = useAuth();

  const fetchData = async () => {
    if (authLoading || user?.role !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    try {
      const apisRes = await apiClient.getAdminAPIs();

      if (apisRes.success && apisRes.data) {
        const rawApis = Array.isArray(apisRes.data) ? apisRes.data : [];
        const versions = ['v2.1', 'v1.4', 'v2.0', 'v1.3', 'v1.0'];
        const categories = ['Users', 'Payments', 'Orders', 'Inventory', 'System'];
        const statuses = ['Published', 'Published', 'Published', 'Draft', 'Published'];

        const enrichedApis = rawApis.map((api: any, i: number) => ({
          ...api,
          version: versions[i % versions.length],
          category: categories[i % categories.length],
          status: statuses[i % statuses.length],
        }));
        setApisData(enrichedApis);
      }
    } catch (e) {
      setError('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      fetchData();
    } else if (!authLoading && user?.role !== 'ADMIN') {
      setError('You do not have permission to view this page.');
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('API Management Report', 14, 15);
    
    const tableColumn = ["API Name", "Endpoint URL", "Status", "Updated At"];
    const tableRows = apisData.map(api => [
      api.name,
      api.endpointUrl,
      api.status,
      formatDate(api.createdAt)
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('api_report.pdf');
  };

  const handleEditSave = async () => {
    if (!editApi) return;
    setSaving(true);
    const response = await apiClient.updateApi(editApi.id, editFormData);
    if (response.success) {
      if (editFile) {
        await apiClient.uploadApiDocs(editApi.id, editFile);
      }
      setEditApi(null);
      fetchData();
    } else {
      alert(response.error || 'Failed to update API');
    }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteApiId) return;
    setSaving(true);
    const response = await apiClient.deleteApi(deleteApiId);
    if (response.success) {
      setDeleteApiId(null);
      fetchData();
    } else {
      alert(response.error || 'Failed to delete API');
    }
    setSaving(false);
  };

  const apiColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="text-gray-400 hover:text-white px-0">
          API Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 text-white font-medium">
          <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Package size={16} className="text-purple-400" />
          </div>
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'endpointUrl',
      header: 'Endpoint URL',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.endpointUrl}</div>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={row.original.status === 'Published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Updated At',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{formatDate(row.original.createdAt)}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0" onClick={() => setViewApi(row.original)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 h-8 w-8 p-0" onClick={() => {
            setEditApi(row.original);
            setEditFormData({ name: row.original.name, endpointUrl: row.original.endpointUrl, description: row.original.description || '' });
            setEditFile(null);
          }}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-8 w-8 p-0" onClick={() => setDeleteApiId(row.original.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">API Management</h1>
          <p className="text-gray-400">View and manage all registered APIs.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleDownloadPDF} variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-2 px-6">
            <Download size={18} />
            Download as PDF
          </Button>
          <Link href="/admin/apis/new">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2 px-6">
              <Plus size={18} />
              Add New API
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-slate-800/40 border border-purple-500/10 overflow-hidden">
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 p-12 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          ) : (
            <DataTable columns={apiColumns} data={apisData} />
          )}
        </div>
      </Card>

      {/* View Modal */}
      <Dialog open={!!viewApi} onOpenChange={(open) => !open && setViewApi(null)}>
        <DialogContent className="bg-slate-900 border border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewApi?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label className="text-gray-400">Endpoint URL</Label>
              <div className="text-white mt-1 break-all">{viewApi?.endpointUrl}</div>
            </div>
            <div>
              <Label className="text-gray-400">Description</Label>
              <div className="text-white mt-1">{viewApi?.description || 'No description provided.'}</div>
            </div>
            {viewApi?.documentation && (
              <div>
                <Label className="text-gray-400">Documentation File</Label>
                <div className="mt-1">
                  <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080/api'}/admin/apis/${viewApi.id}/docs`} target="_blank" className="text-purple-400 underline" rel="noreferrer">
                    Download Documentation
                  </a>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editApi} onOpenChange={(open) => !open && setEditApi(null)}>
        <DialogContent className="bg-slate-900 border border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit API</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label>API Name</Label>
              <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label>Endpoint URL</Label>
              <Input value={editFormData.endpointUrl} onChange={(e) => setEditFormData({ ...editFormData, endpointUrl: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editFormData.description} onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label>Replace Documentation (Optional)</Label>
              <Input type="file" onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="bg-slate-800 border-slate-700 text-gray-400 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditApi(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteApiId} onOpenChange={(open) => !open && setDeleteApiId(null)}>
        <DialogContent className="bg-slate-900 border border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Delete API?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 my-4">Are you sure you want to delete this API? This action cannot be undone. All user assignments for this API will also be revoked.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteApiId(null)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete API'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
