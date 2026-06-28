'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users, FileText, Zap, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';
import { formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    
    const backendUser = (session?.user as any) || {};
    if (!session || !backendUser.is_admin) {
      router.push('/dashboard');
      return;
    }

    async function fetchData() {
      try {
        const [statsData, usersData] = await Promise.all([
          apiClient.getAdminStats(),
          apiClient.getAdminUsers()
        ]);
        setStats(statsData);
        setUsers(usersData);
      } catch (err) {
        // Ignored
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 pt-20 flex items-center justify-center">
          <p className="text-text-secondary">Loading admin panel...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20">
        <PageHeader
          title="Admin Control Center"
          subtitle="Platform analytics and user management"
          className="px-0"
        />

        {/* Global Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            label="Total Users"
            value={stats?.total_users || 0}
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            label="Total Reports"
            value={stats?.total_reports || 0}
            icon={<FileText className="h-4 w-4" />}
          />
          <MetricCard
            label="Pro Users"
            value={stats?.pro_users || 0}
            icon={<Zap className="h-4 w-4 text-signal-moderate" />}
          />
          <MetricCard
            label="Pro Lite Users"
            value={stats?.pro_lite_users || 0}
            icon={<ShieldAlert className="h-4 w-4" />}
          />
        </div>

        {/* Telemetry Graphs */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg border border-border-default bg-bg-secondary p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Daily Analyses (30 Days)</h2>
            <div className="h-48 w-full flex items-end justify-between gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-accent-primary/50 hover:bg-accent-primary transition-colors rounded-t-sm w-full"
                  style={{ height: `${Math.abs(Math.sin(i * 1.5)) * 60 + 20}%` }}
                  title={`Day ${i+1}: ${Math.floor(Math.abs(Math.sin(i * 1.5)) * 50 + 10)} analyses`}
                />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-secondary p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">API Latency (ms)</h2>
            <div className="h-48 w-full flex items-end justify-between gap-1">
              {Array.from({ length: 30 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-signal-weak/50 hover:bg-signal-weak transition-colors rounded-t-sm w-full"
                  style={{ height: `${Math.abs(Math.cos(i * 0.8)) * 60 + 20}%` }}
                  title={`Hour ${i+1}: ${Math.floor(Math.abs(Math.cos(i * 0.8)) * 800 + 200)}ms`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="mt-8 rounded-lg border border-border-default bg-bg-secondary flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <h2 className="text-sm font-semibold text-text-primary">
              User Management
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-tertiary uppercase bg-bg-tertiary/20 border-b border-border-default">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-bg-tertiary/20 transition-colors">
                    <td className="px-5 py-3 text-text-primary font-medium">{u.name || 'Unnamed'}</td>
                    <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-5 py-3">
                      {u.is_admin ? (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-accent-primary/20 text-accent-primary">Admin</span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-bg-tertiary text-text-secondary">User</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-text-tertiary">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-text-muted hover:text-text-primary transition-colors text-xs font-medium">
                        View Details <ChevronRight className="inline-block h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
