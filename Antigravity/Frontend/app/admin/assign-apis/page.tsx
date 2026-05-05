'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Trash2, Download, ArrowUpDown, Link as LinkIcon, Users, Edit, Eye, Search } from 'lucide-react';
import { apiClient } from '@/lib/services/apiClient';
import { DataTable } from '@/components/ui/data-table';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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

export default function AssignApisPage() {
  const [assignmentsData, setAssignmentsData] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [apisData, setApisData] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState<string>('');
  const [assignApiId, setAssignApiId] = useState<string>('');

  const [viewAssignment, setViewAssignment] = useState<any | null>(null);
  
  const [editAssignment, setEditAssignment] = useState<any | null>(null);
  const [editNewApiId, setEditNewApiId] = useState<string>('');

  const [deleteAssignment, setDeleteAssignment] = useState<any | null>(null);

  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignRes, usersRes, apisRes] = await Promise.all([
        apiClient.getAssignments(),
        apiClient.getUsers(),
        apiClient.getAdminAPIs()
      ]);

      if (assignRes.success && assignRes.data) {
        setAssignmentsData(Array.isArray(assignRes.data) ? assignRes.data : []);
      }

      if (usersRes.success && usersRes.data) {
        setUsersList(Array.isArray(usersRes.data) ? usersRes.data : []);
      }

      if (apisRes.success && apisRes.data) {
        setApisData(Array.isArray(apisRes.data) ? apisRes.data : []);
      }
    } catch (e) {
      setError('Failed to fetch data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadAssignmentsPDF = () => {
    const doc = new jsPDF();
    doc.text('API Assignments Report', 14, 15);
    
    const tableColumn = ["User Name", "Email", "API Name", "Assigned By", "Assigned At"];
    const tableRows = assignmentsData.map(a => [
      a.userName,
      a.userEmail,
      a.apiName,
      a.assignedBy,
      formatDate(a.assignedAt)
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('api_assignments_report.pdf');
  };

  const handleAssignSave = async () => {
    if (!assignUserId || !assignApiId) return;
    setSaving(true);
    const response = await apiClient.assignApi(assignUserId, assignApiId);
    if (response.success) {
      setAssignModalOpen(false);
      setAssignUserId('');
      setAssignApiId('');
      fetchData();
    } else {
      alert(response.error || 'Failed to assign API');
    }
    setSaving(false);
  };

  const handleEditSave = async () => {
    if (!editAssignment || !editNewApiId) return;
    setSaving(true);
    // Revoke old, Assign new
    const revokeRes = await apiClient.revokeApi(editAssignment.userId, editAssignment.apiId);
    if (revokeRes.success) {
      const assignRes = await apiClient.assignApi(editAssignment.userId, editNewApiId);
      if (assignRes.success) {
        setEditAssignment(null);
        setEditNewApiId('');
        fetchData();
      } else {
        alert(assignRes.error || 'Failed to assign new API');
      }
    } else {
      alert(revokeRes.error || 'Failed to revoke old API');
    }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAssignment) return;
    setSaving(true);
    const response = await apiClient.revokeApi(deleteAssignment.userId, deleteAssignment.apiId);
    if (response.success) {
      setDeleteAssignment(null);
      fetchData();
    } else {
      alert(response.error || 'Failed to revoke API access');
    }
    setSaving(false);
  };

  const filteredAssignments = useMemo(() => {
    if (!searchQuery.trim()) return assignmentsData;
    const query = searchQuery.toLowerCase();
    return assignmentsData.filter((a: any) => 
      a.userName?.toLowerCase().includes(query) || 
      a.apiName?.toLowerCase().includes(query) ||
      a.userEmail?.toLowerCase().includes(query)
    );
  }, [assignmentsData, searchQuery]);

  const assignmentColumns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'userName',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="text-gray-400 hover:text-white px-0">
          User <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 text-white font-medium">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-xs">
            {row.original.userName ? row.original.userName.substring(0, 2).toUpperCase() : '?'}
          </div>
          <div>
            <div>{row.original.userName}</div>
            <div className="text-xs text-gray-500 font-normal">{row.original.userEmail}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'apiName',
      header: 'API Access',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <LinkIcon size={14} className="text-purple-400" />
          <span className="text-gray-300">{row.original.apiName}</span>
        </div>
      ),
    },
    {
      accessorKey: 'assignedBy',
      header: 'Assigned By',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.assignedBy}</div>,
    },
    {
      accessorKey: 'assignedAt',
      header: 'Assigned At',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{formatDate(row.original.assignedAt)}</div>,
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.original.active !== false; // Default true
        return (
          <div className="flex items-center">
            <button
              onClick={async () => {
                const res = await apiClient.toggleAssignment(row.original.id, !isActive);
                if (res.success) {
                  fetchData();
                } else {
                  alert(res.error || 'Failed to toggle status');
                }
              }}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                isActive ? 'bg-green-500' : 'bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-2 text-xs font-medium ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
              {isActive ? 'Active' : 'Suspended'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0" onClick={() => setViewAssignment(row.original)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 h-8 w-8 p-0" onClick={() => {
            setEditAssignment(row.original);
            setEditNewApiId(row.original.apiId.toString());
          }}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-8 w-8 p-0" onClick={() => setDeleteAssignment(row.original)}>
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
          <h1 className="text-3xl font-bold text-white mb-2">Assign APIs</h1>
          <p className="text-gray-400">Manage which users have access to specific APIs.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleDownloadAssignmentsPDF} variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-2 px-4 h-9">
            <Download size={16} />
            Download as PDF
          </Button>
          <Button onClick={() => setAssignModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-4 h-9">
            <Users size={16} />
            Assign API
          </Button>
        </div>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search assignments by user name, email, or API name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-slate-800 focus:border-purple-500 sm:text-sm transition-colors"
        />
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
            <DataTable columns={assignmentColumns} data={filteredAssignments} />
          )}
        </div>
      </Card>

      {/* Assign API Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="bg-slate-900 border border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Assign API to User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label>Select User</Label>
              <select 
                value={assignUserId} 
                onChange={(e) => setAssignUserId(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="" disabled>Select a User</option>
                {usersList.filter((u: any) => u.role === 'USER').map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Select API</Label>
              <select 
                value={assignApiId} 
                onChange={(e) => setAssignApiId(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="" disabled>Select an API</option>
                {apisData.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.endpointUrl})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignSave} disabled={saving || !assignUserId || !assignApiId} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewAssignment} onOpenChange={(open) => !open && setViewAssignment(null)}>
        <DialogContent className="bg-slate-900 border border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label className="text-gray-400">User</Label>
              <div className="text-white mt-1">{viewAssignment?.userName} ({viewAssignment?.userEmail})</div>
            </div>
            <div>
              <Label className="text-gray-400">API</Label>
              <div className="text-white mt-1 font-medium text-purple-400">{viewAssignment?.apiName}</div>
              <div className="text-gray-400 text-sm">{viewAssignment?.endpointUrl}</div>
            </div>
            <div>
              <Label className="text-gray-400">Assigned By</Label>
              <div className="text-white mt-1">{viewAssignment?.assignedBy}</div>
            </div>
            <div>
              <Label className="text-gray-400">Assigned At</Label>
              <div className="text-white mt-1">{formatDate(viewAssignment?.assignedAt)}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editAssignment} onOpenChange={(open) => !open && setEditAssignment(null)}>
        <DialogContent className="bg-slate-900 border border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label className="text-gray-400">User</Label>
              <div className="text-white mt-1 bg-slate-800/50 px-3 py-2 rounded-md border border-slate-700 cursor-not-allowed">
                {editAssignment?.userName} ({editAssignment?.userEmail})
              </div>
              <p className="text-xs text-gray-500 mt-1">User cannot be changed. Delete this assignment to reassign to a different user.</p>
            </div>
            <div>
              <Label>Select New API</Label>
              <select 
                value={editNewApiId} 
                onChange={(e) => setEditNewApiId(e.target.value)}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                {apisData.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.endpointUrl})</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditAssignment(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving || !editNewApiId} className="bg-purple-600 hover:bg-purple-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteAssignment} onOpenChange={(open) => !open && setDeleteAssignment(null)}>
        <DialogContent className="bg-slate-900 border border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Revoke Access?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 my-4">
            Are you sure you want to revoke <strong>{deleteAssignment?.userName}</strong>'s access to the <strong>{deleteAssignment?.apiName}</strong> API?
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteAssignment(null)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
