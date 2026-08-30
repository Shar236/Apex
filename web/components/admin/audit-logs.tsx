'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Th, Td, Empty } from '@/components/admin/admin-ui';

interface AuditRow {
  _id: string;
  createdAt?: string;
  adminEmail?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}

export function AuditLogsAdmin() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.auditLogs();
    setRows((res.data as AuditRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Admin Audit Trail</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Track every price edit, product creation, status change, and voucher operation.</p>
        </div>
        <button onClick={refresh} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-xs shadow-sm hover:border-brand-pink">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Timestamp</Th>
                <Th>Admin</Th>
                <Th>Action</Th>
                <Th>Resource</Th>
                <Th>Details / Diffs</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map((log) => (
                <tr key={log._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td className="whitespace-nowrap text-neutral-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</Td>
                  <Td className="whitespace-nowrap font-black">{log.adminEmail}</Td>
                  <Td><span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] font-mono text-[10px] font-black">{log.action}</span></Td>
                  <Td className="whitespace-nowrap">{log.resourceType} {log.resourceId ? `#${log.resourceId.slice(-6)}` : ''}</Td>
                  <Td className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">{JSON.stringify(log.details || {})}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No audit logs recorded yet" desc="Admin actions will appear here automatically." />}
      </div>
    </div>
  );
}
