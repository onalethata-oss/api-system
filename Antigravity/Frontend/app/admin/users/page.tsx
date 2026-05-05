'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Edit, Trash2, Eye, Download, ArrowUpDown, Package, Link as LinkIcon, UserPlus } from 'lucide-react';
import { apiClient } from '@/lib/services/apiClient';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/AuthContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ColumnDef } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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

export default function AllUsersPage() {
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewUser, setViewUser] = useState<any | null>(null);
  const [userApis, setUserApis] = useState<any[]>([]);
  const [loadingUserApis, setLoadingUserApis] = useState(false);

  const [editUser, setEditUser] = useState<any | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '' });
  const [saving, setSaving] = useState(false);

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: '', email: '', password: '', role: 'USER' });

  const { user, loading: authLoading } = useAuth();

  const fetchUsers = async () => {
    if (authLoading || user?.role !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getUsers();
      if (response.success && response.data) {
        const rawUsers = Array.isArray(response.data) ? response.data : [];
        const assignmentsRes = await apiClient.getAssignments();
        const assignments = assignmentsRes.success && assignmentsRes.data ? assignmentsRes.data : [];

        const enrichedUsers = rawUsers.map((u: any, i: number) => {
          const apiCount = assignments.filter((a: any) => a.userId === u.id).length;
          return {
            ...u,
            apiCount: apiCount,
            roleMock: u.role === 'ADMIN' ? 'Admin' : (u.role === 'USER' ? (i % 2 === 0 ? 'Developer' : 'Viewer') : u.role)
          };
        });
        setUsersData(enrichedUsers);
      } else {
        setError(response.error ?? 'Failed to load users');
      }
    } catch (e) {
      setError('Failed to load users');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'ADMIN') {
      fetchUsers();
    } else if (!authLoading && user?.role !== 'ADMIN') {
      setError('You do not have permission to view this page.');
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleViewUser = async (user: any) => {
    setViewUser(user);
    setLoadingUserApis(true);
    setUserApis([]);
    const response = await apiClient.getUserAssignedApis(user.id);
    if (response.success && response.data) {
      setUserApis(Array.isArray(response.data) ? response.data : []);
    }
    setLoadingUserApis(false);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('User Management Report', 14, 15);
    
    const tableColumn = ["Name", "Email", "Role", "API Access", "Status", "Joined At"];
    const tableRows = usersData.map(u => [
      u.name,
      u.email,
      u.roleMock,
      `${u.apiCount} APIs`,
      u.active ? 'Active' : 'Inactive',
      formatDate(u.createdAt)
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('users_report.pdf');
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    setSaving(true);
    const response = await apiClient.updateUser(editUser.id, editFormData);
    if (response.success) {
      setEditUser(null);
      fetchUsers();
    } else {
      alert(response.error || 'Failed to update User');
    }
    setSaving(false);
  };

  const handleCreateSave = async () => {
    if (!createFormData.name || !createFormData.email || !createFormData.password) {
      alert("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    const response = await apiClient.createUser(createFormData);
    if (response.success) {
      setCreateUserOpen(false);
      setCreateFormData({ name: '', email: '', password: '', role: 'USER' });
      fetchUsers();
    } else {
      alert(response.error || 'Failed to create User');
    }
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;
    setSaving(true);
    const response = await apiClient.deleteUser(deleteUserId);
    if (response.success) {
      setDeleteUserId(null);
      fetchUsers();
    } else {
      alert(response.error || 'Failed to delete User');
    }
    setSaving(false);
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="text-gray-400 hover:text-white px-0">
          User <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex items-center gap-3 text-white font-medium">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg">
              {u.name ? u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?'}
            </div>
            {u.name ?? '—'}
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.email ?? '—'}</div>,
    },
    {
      accessorKey: 'roleMock',
      header: 'Role',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.roleMock}</div>,
    },
    {
      accessorKey: 'apiCount',
      header: 'API Access',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{row.original.apiCount} APIs</div>,
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.original.active;
        return (
          <Badge className={active ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}>
            {active ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined At',
      cell: ({ row }) => <div className="text-gray-400 text-sm">{formatDate(row.original.createdAt)}</div>,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0" onClick={() => handleViewUser(row.original)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300 h-8 w-8 p-0" onClick={() => {
            setEditUser(row.original);
            setEditFormData({ name: row.original.name, email: row.original.email, role: row.original.role });
          }}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 h-8 w-8 p-0" onClick={() => setDeleteUserId(row.original.id)}>
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
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">View and manage system users and their roles.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setCreateUserOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6">
            <UserPlus size={18} />
            Add New User
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 gap-2 px-6">
            <Download size={18} />
            Download as PDF
          </Button>
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
            <DataTable columns={columns} data={usersData} />
          )}
        </div>
      </Card>

      {/* View Modal */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="bg-slate-900 border border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{viewUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 my-4">
            <div>
              <Label className="text-gray-400">Email</Label>
              <div className="text-white mt-1 break-all">{viewUser?.email}</div>
            </div>
            <div>
              <Label className="text-gray-400">Role</Label>
              <div className="text-white mt-1">{viewUser?.roleMock}</div>
            </div>
            <div>
              <Label className="text-gray-400">Status</Label>
              <div className="text-white mt-1">{viewUser?.active ? 'Active' : 'Inactive'}</div>
            </div>
            <div>
              <Label className="text-gray-400">Joined At</Label>
              <div className="text-white mt-1">{formatDate(viewUser?.createdAt)}</div>
            </div>
          </div>
          
          <div className="mt-6 border-t border-slate-700 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4">Assigned APIs</h4>
            {loadingUserApis ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              </div>
            ) : userApis.length === 0 ? (
              <div className="text-gray-400 text-sm italic">This user has no assigned APIs.</div>
            ) : (
              <div className="space-y-3">
                {userApis.map(api => (
                  <div key={api.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Package size={16} className="text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{api.name}</div>
                        <div className="text-xs text-gray-400">{api.endpointUrl}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="bg-slate-900 border border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label>Name</Label>
              <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            </div>
            <div>
              <Label>Role (ADMIN / USER)</Label>
              <Input value={editFormData.role} onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent className="bg-slate-900 border border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Delete User?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 my-4">Are you sure you want to delete this user? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteUserId(null)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="bg-slate-900 border border-blue-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <div>
              <Label>Name</Label>
              <Input 
                value={createFormData.name} 
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })} 
                className="bg-slate-800 border-slate-700 text-white mt-1" 
                placeholder="Full Name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                value={createFormData.email} 
                onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })} 
                className="bg-slate-800 border-slate-700 text-white mt-1" 
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input 
                type="password"
                value={createFormData.password} 
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })} 
                className="bg-slate-800 border-slate-700 text-white mt-1" 
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>Role</Label>
              <select 
                value={createFormData.role} 
                onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="USER">User (Developer/Viewer)</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateUserOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
