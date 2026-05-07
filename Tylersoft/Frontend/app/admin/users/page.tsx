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
          <div className="flex items-center gap-4 text-foreground font-bold">
            <div className="w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center text-primary text-xs font-black shrink-0 shadow-sm">
              {u.name ? u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?'}
            </div>
            <span className="uppercase tracking-tighter italic">{u.name ?? '—'}</span>
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
          <Badge className={active
            ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 font-black uppercase italic tracking-widest px-3 py-1'
            : 'bg-rose-50 text-rose-700 border-2 border-rose-100 font-black uppercase italic tracking-widest px-3 py-1'}>
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
          <Button variant="outline" size="sm" className="text-blue-600 border-slate-300 hover:bg-slate-100 h-7 w-7 p-0" onClick={() => handleViewUser(row.original)}>
            <Eye size={14} />
          </Button>
          <Button variant="outline" size="sm" className="text-emerald-600 border-slate-300 hover:bg-slate-100 h-7 w-7 p-0" onClick={() => {
            setEditUser(row.original);
            setEditFormData({ name: row.original.name, email: row.original.email, role: row.original.role });
          }}>
            <Edit size={14} />
          </Button>
          <Button variant="outline" size="sm" className="text-rose-600 border-slate-300 hover:bg-slate-100 h-7 w-7 p-0" onClick={() => setDeleteUserId(row.original.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-foreground mb-2 uppercase tracking-tighter italic">User Management</h1>
          <p className="text-muted-foreground font-medium">View and manage system users and their roles.</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={() => setCreateUserOpen(true)} className="bg-primary hover:opacity-90 text-white font-black px-5 h-10 rounded-xl uppercase tracking-widest italic shadow-lg shadow-primary/20">
            <UserPlus size={18} className="mr-2" />
            Add New User
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="border-2 border-border text-muted-foreground font-black px-5 h-10 rounded-xl uppercase tracking-widest italic">
            <Download size={18} className="mr-2" />
            Download as PDF
          </Button>
        </div>
      </div>

      <Card className="bg-card border-2 border-border overflow-hidden rounded-[2.5rem] shadow-xl">
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
        <DialogContent className="bg-card border-2 border-border text-foreground max-w-2xl p-8 rounded-3xl shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic text-primary">{viewUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6 my-6">
            <div className="bg-background p-5 rounded-2xl border-2 border-border/50">
              <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 block">Email</Label>
              <div className="text-foreground font-bold break-all">{viewUser?.email}</div>
            </div>
            <div className="bg-background p-5 rounded-2xl border-2 border-border/50">
              <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 block">Assigned Role</Label>
              <div className="text-foreground font-bold italic uppercase">{viewUser?.roleMock}</div>
            </div>
            <div className="bg-background p-5 rounded-2xl border-2 border-border/50">
              <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 block">Operational Status</Label>
              <div className="text-foreground font-bold">{viewUser?.active ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="bg-background p-5 rounded-2xl border-2 border-border/50">
              <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 block">Provisioned Date</Label>
              <div className="text-foreground font-bold">{formatDate(viewUser?.createdAt)}</div>
            </div>
          </div>

          <div className="mt-8 border-t-2 border-border/50 pt-8">
            <h4 className="text-lg font-black text-foreground uppercase tracking-tighter italic mb-6">Assigned APIs</h4>
            {loadingUserApis ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : userApis.length === 0 ? (
              <div className="bg-background p-6 rounded-2xl border-2 border-border/50 text-muted-foreground/60 text-sm italic text-center">No active resource assignments discovered.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userApis.map(api => (
                  <div key={api.id} className="bg-card border-2 border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border-2 border-border/50">
                      <Package size={18} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-foreground uppercase tracking-tight truncate">{api.name}</div>
                      <div className="text-[10px] text-muted-foreground/60 font-mono truncate">{api.endpointUrl}</div>
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
        <DialogContent className="bg-card border-2 border-border text-foreground max-w-md w-full p-0 overflow-hidden rounded-[2.5rem]">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Display Name</Label>
                <Input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="bg-background border-2 border-border text-foreground h-12 rounded-xl focus:border-primary font-bold" />
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Identity Email</Label>
                <Input value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="bg-background border-2 border-border text-foreground h-12 rounded-xl focus:border-primary font-bold" />
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">System Role</Label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full bg-background border-2 border-border rounded-xl px-5 py-3 text-foreground font-bold focus:outline-none focus:border-primary appearance-none"
                >
                  <option value="USER">Standard User</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-background border-t-2 border-border gap-3">
            <Button variant="outline" onClick={() => setEditUser(null)} className="border-2 border-border font-bold px-5 h-10 rounded-xl hover:bg-card">Cancel</Button>
            <Button onClick={handleEditSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 h-10 rounded-xl uppercase italic tracking-widest">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <DialogContent className="bg-card border-2 border-rose-500/20 text-foreground max-w-md w-full p-8 rounded-3xl shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight text-rose-600 italic">Delete User?</DialogTitle>
          </DialogHeader>
          <div className="bg-rose-500/5 border-2 border-rose-500/10 p-6 rounded-2xl mb-8">
            <p className="text-foreground/80 leading-relaxed font-medium">
              Are you sure you want to delete this user? This action is <strong className="text-rose-600 uppercase italic">irreversible</strong>. All resource access will be terminated.
            </p>
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setDeleteUserId(null)} className="border-2 border-border font-bold px-5 h-10 rounded-xl hover:bg-background">Cancel</Button>
            <Button onClick={handleDeleteConfirm} disabled={saving} className="bg-rose-600 hover:bg-rose-700 text-white font-black px-6 h-10 rounded-xl uppercase italic tracking-widest shadow-lg shadow-rose-600/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="bg-card border-2 border-border text-foreground max-w-md w-full p-0 overflow-hidden rounded-[2.5rem]">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Add New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Legal Name</Label>
                <Input
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="bg-background border-2 border-border text-foreground h-12 rounded-xl focus:border-primary font-bold"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Enterprise Email</Label>
                <Input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="bg-background border-2 border-border text-foreground h-12 rounded-xl focus:border-primary font-bold"
                  placeholder="identity@tylersoft.com"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Initial Access Secret</Label>
                <Input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className="bg-background border-2 border-border text-foreground h-12 rounded-xl focus:border-primary font-bold"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 block">Assigned Clearance</Label>
                <select
                  value={createFormData.role}
                  onChange={(e) => setCreateFormData({ ...createFormData, role: e.target.value })}
                  className="w-full bg-background border-2 border-border rounded-xl px-5 py-3 text-foreground font-bold focus:outline-none focus:border-primary appearance-none"
                >
                  <option value="USER">Standard Operator (Developer)</option>
                  <option value="ADMIN">System Administrator (Full Access)</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-background border-t-2 border-border gap-3">
            <Button variant="outline" onClick={() => setCreateUserOpen(false)} className="border-2 border-border font-bold px-5 h-10 rounded-xl hover:bg-card">Cancel</Button>
            <Button onClick={handleCreateSave} disabled={saving} className="bg-primary hover:opacity-90 text-white font-black px-5 h-10 rounded-xl uppercase italic tracking-widest shadow-lg shadow-primary/20">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
