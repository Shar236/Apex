'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Pill, Th, Td, Empty } from '@/components/admin/admin-ui';

interface UserRow {
  _id: string;
  name?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  status?: string;
  orderCount?: number;
  voucherCount?: number;
  createdAt?: string;
}

export function UsersAdmin() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.users(search ? { search } : {});
    setRows((res.data as UserRow[]) || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [refresh]);

  const toggle = async (u: UserRow) => {
    const next = u.status === 'active' ? 'disabled' : 'active';
    await adminApi.setUserStatus(u._id, next);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Customer Management</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Search registered customers, inspect order histories, and toggle account access.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929]">
          <Search className="w-4 h-4 text-neutral-400" />
          <input placeholder="Search name / email / phone" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-60" />
        </div>
      </div>

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Customer</Th>
                <Th>Phone</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th className="text-right">Orders</Th>
                <Th className="text-right">Vouchers</Th>
                <Th>Joined</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map((u) => (
                <tr key={u._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td>
                    <div className="font-black text-sm">{u.name}</div>
                    <div className="text-[10px] text-neutral-400">{u.email}</div>
                  </Td>
                  <Td>{u.phone || '—'}</Td>
                  <Td>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${u.role === 'admin' ? 'bg-brand-pink/10 text-brand-pink border-brand-pink/20' : 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'}`}>
                      {u.role}
                    </span>
                  </Td>
                  <Td><Pill text={u.status || '—'} tint={u.status === 'active' ? 'emerald' : 'rose'} /></Td>
                  <Td className="text-right tabular-nums">{u.orderCount || 0}</Td>
                  <Td className="text-right tabular-nums">{u.voucherCount || 0}</Td>
                  <Td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</Td>
                  <Td>
                    <button onClick={() => toggle(u)} className="px-3 py-1.5 rounded-xl border text-[10px] font-black border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
                      {u.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No customers" />}
      </div>
    </div>
  );
}
