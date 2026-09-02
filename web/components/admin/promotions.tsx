'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Copy } from 'lucide-react';
import { adminApi, formatPrice } from '@/lib/api';
import { Pill, Th, Td, Empty, FormCard, Field, Label, TextArea, Check } from '@/components/admin/admin-ui';

interface PromoRow {
  _id: string;
  name?: string;
  code?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  minimumOrderAmount?: number;
  maximumDiscount?: number | null;
  startAt?: string;
  endAt?: string;
  active?: boolean;
  usageCount?: number;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  firstOrderOnly?: boolean;
}

const defaultDraft = {
  name: '', code: '', description: '', discountType: 'percentage', discountValue: 0,
  minimumOrderAmount: 0, maximumDiscount: null, startAt: new Date().toISOString().slice(0, 10),
  endAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  active: true, usageLimit: null, perUserLimit: 1, firstOrderOnly: false,
};

export function PromotionsAdmin() {
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PromoRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>(defaultDraft);

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.promotions();
    setRows((res.data as PromoRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Data-fetch on mount; `refresh` flips a loading flag before its awaited
    // fetch (accepted data-fetching-in-effect pattern, no server loader here).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setDraft(defaultDraft);
  };

  const save = async () => {
    if (!draft.name || !draft.code || (draft.discountValue as number) <= 0) {
      alert('Name, code, and discount value are required.');
      return;
    }
    const payload = {
      ...draft,
      discountValue: Number(draft.discountValue) || 0,
      minimumOrderAmount: Number(draft.minimumOrderAmount) || 0,
      maximumDiscount: draft.maximumDiscount ? Number(draft.maximumDiscount) : null,
      usageLimit: draft.usageLimit ? Number(draft.usageLimit) : null,
      perUserLimit: draft.perUserLimit ? Number(draft.perUserLimit) : null,
      startAt: new Date(draft.startAt as string),
      endAt: new Date(draft.endAt as string),
    };
    const res = creating ? await adminApi.createPromotion(payload) : await adminApi.updatePromotion(editing?._id || '', payload);
    if (res.success) {
      setCreating(false);
      setEditing(null);
      refresh();
    } else alert((res.message as string) || 'Failed to save promotion');
  };

  const remove = async (p: PromoRow) => {
    if (!confirm(`Delete promotion ${p.name}?`)) return;
    const res = await adminApi.deletePromotion(p._id);
    if (res.success) refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Promotions & Event Discounts</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Manage promotional campaigns, storewide vouchers, and discount rules.</p>
        </div>
        <button onClick={startCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-pink text-white font-black text-xs shadow-lg">
          <Plus className="w-4 h-4" /> New Promotion
        </button>
      </div>

      {(creating || editing) && (
        <FormCard title={creating ? 'Create Promotion' : 'Edit Promotion'} onClose={() => { setCreating(false); setEditing(null); }} onSave={save}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Promotion Name *" value={draft.name as string} onChange={(v) => setDraft({ ...draft, name: v })} />
            <Field label="Promo Code *" value={draft.code as string} onChange={(v) => setDraft({ ...draft, code: String(v).toUpperCase() })} />
            <div>
              <Label>Discount Type</Label>
              <select value={draft.discountType as string} onChange={(e) => setDraft({ ...draft, discountType: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <Field label={`Discount Value * (${draft.discountType === 'percentage' ? '%' : '₹'})`} type="number" value={draft.discountValue as number} onChange={(v) => setDraft({ ...draft, discountValue: v })} />
            <Field label="Minimum Order Amount (₹)" type="number" value={draft.minimumOrderAmount as number} onChange={(v) => setDraft({ ...draft, minimumOrderAmount: v })} />
            <Field label="Maximum Discount (₹, optional)" type="number" value={(draft.maximumDiscount as number | null) ?? ''} onChange={(v) => setDraft({ ...draft, maximumDiscount: v || null })} />
            <Field label="Start Date" type="date" value={String(draft.startAt || '').slice(0, 10)} onChange={(v) => setDraft({ ...draft, startAt: v })} />
            <Field label="End Date" type="date" value={String(draft.endAt || '').slice(0, 10)} onChange={(v) => setDraft({ ...draft, endAt: v })} />
            <Field label="Global Usage Limit (optional)" type="number" value={(draft.usageLimit as number | null) ?? ''} onChange={(v) => setDraft({ ...draft, usageLimit: v || null })} />
            <Field label="Per-User Limit (optional)" type="number" value={(draft.perUserLimit as number | null) ?? ''} onChange={(v) => setDraft({ ...draft, perUserLimit: v || null })} />
            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <Check label="Active" checked={!!draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
              <Check label="First-order only" checked={!!draft.firstOrderOnly} onChange={(v) => setDraft({ ...draft, firstOrderOnly: v })} />
            </div>
            <div className="md:col-span-2">
              <TextArea label="Description (optional)" value={(draft.description as string) || ''} onChange={(v) => setDraft({ ...draft, description: v })} />
            </div>
          </div>
        </FormCard>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Campaign</Th>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th>Valid Dates</Th>
                <Th>Usage</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map((p) => (
                <tr key={p._id} className="border-t border-[#EAEAEA] dark:border-[#292929]">
                  <Td>
                    <div className="font-black text-sm">{p.name}</div>
                    <div className="text-[10px] text-neutral-400 max-w-xs truncate">{p.description}</div>
                  </Td>
                  <Td className="font-mono whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink border border-brand-pink/20 font-black">
                      {p.code}
                      <button onClick={() => navigator.clipboard?.writeText(p.code || '')} className="ml-1"><Copy className="w-3 h-3" /></button>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {p.discountType === 'percentage' ? `${p.discountValue}%` : formatPrice(p.discountValue)}
                    {p.maximumDiscount ? <span className="text-[10px] ml-1 text-neutral-400">Max {formatPrice(p.maximumDiscount)}</span> : null}
                  </Td>
                  <Td className="whitespace-nowrap text-neutral-500">
                    {p.startAt ? new Date(p.startAt).toLocaleDateString() : '—'} → {p.endAt ? new Date(p.endAt).toLocaleDateString() : '—'}
                  </Td>
                  <Td>{p.usageCount}{p.usageLimit ? ` / ${p.usageLimit}` : ''}</Td>
                  <Td>{p.active ? <Pill text="Active" /> : <Pill text="Inactive" tint="neutral" />}</Td>
                  <Td className="text-right whitespace-nowrap">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => { setEditing(p); setCreating(false); setDraft({ ...p, startAt: String(p.startAt).slice(0, 10), endAt: String(p.endAt).slice(0, 10) }); }}
                        className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(p)} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No active promotions" desc="Create your first discount campaign." />}
      </div>
    </div>
  );
}
