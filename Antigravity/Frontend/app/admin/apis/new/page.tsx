'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/services/apiClient';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewApiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    endpointUrl: '',
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await apiClient.createApi(formData as any);
    
    if (response.success && response.data && (response.data as any).id) {
      if (file) {
        const uploadResponse = await apiClient.uploadApiDocs((response.data as any).id, file);
        if (!uploadResponse.success) {
          setError(`API created, but document upload failed: ${uploadResponse.error || 'Unknown error'}`);
          setLoading(false);
          return;
        }
      }
      router.push('/admin/apis');
      router.refresh();
    } else {
      setError(response.error || 'Failed to create API');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/apis">
          <Button variant="ghost" className="text-gray-400 hover:text-white px-2">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Add New API</h1>
          <p className="text-gray-400">Register a new API endpoint into the hub.</p>
        </div>
      </div>

      <Card className="bg-slate-800/40 border border-purple-500/10 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">API Name <span className="text-red-500">*</span></label>
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Payments API v2"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Endpoint URL <span className="text-red-500">*</span></label>
            <input
              required
              name="endpointUrl"
              value={formData.endpointUrl}
              onChange={handleChange}
              placeholder="e.g. https://api.tylersoft.com/v2/payments"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief overview of what this API does..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Documentation File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-400 hover:file:bg-purple-500/20"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/admin/apis">
              <Button type="button" variant="ghost" className="text-gray-400 hover:text-white">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register API'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
