'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Download, Mail, Phone, CheckCircle2, AlertTriangle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Th, Td, Empty, FormCard, Label, TextArea } from '@/components/admin/admin-ui';

interface PTERow {
  _id: string;
  requestId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  examType?: string;
  preferredCity?: string;
  preferredTestCentre?: string;
  preferredDate?: string;
  preferredTime?: string;
  alternativeDate?: string;
  message?: string;
  status?: string;
  adminNotes?: string;
  activityHistory?: Array<{ timestamp?: string; action?: string; notes?: string; adminEmail?: string }>;
  createdAt?: string;
  confirmationDetails?: {
    bookingReference?: string;
    confirmedCentre?: string;
    confirmedDate?: string;
    confirmedTime?: string;
    importantInstructions?: string;
  };
}

const PTE_BOOKING_STATUSES = ['New', 'Contacted', 'Processing', 'Booking In Progress', 'Waiting for Customer', 'Booking Confirmed', 'Completed', 'Cancelled', 'Rejected'];
const PTE_EXAM_TYPES = ['PTE Academic', 'PTE Core', 'PTE Academic UKVI'];

function PTEStatusPill({ status }: { status?: string }) {
  const tintMap: Record<string, string> = {
    New: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40',
    Contacted: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
    Processing: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/40',
    'Booking In Progress': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/40',
    'Waiting for Customer': 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900/40',
    'Booking Confirmed': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
    Cancelled: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
  };
  const s = String(status || 'New');
  return <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black whitespace-nowrap ${tintMap[s] || tintMap.New}`}>{s}</span>;
}

const fmtPTEDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

export function PTEBookingsAdmin() {
  const [rows, setRows] = useState<PTERow[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [examType, setExamType] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PTERow | null>(null);
  const [statusDraft, setStatusDraft] = useState('');
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [confirmedCentre, setConfirmedCentre] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTime, setConfirmedTime] = useState('');
  const [instructions, setInstructions] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (examType) params.examType = examType;
    if (search) params.search = search;
    const res = await adminApi.pteBookings(params);
    setRows((res.data as PTERow[]) || []);
    setLoading(false);
  }, [status, examType, search]);

  useEffect(() => {
    const t = setTimeout(refresh, 300);
    return () => clearTimeout(t);
  }, [refresh]);

  const openDetail = (row: PTERow) => {
    setSelected(row);
    setStatusDraft(row.status || '');
    setNotesDraft(row.adminNotes || '');
    setBookingRef(row.confirmationDetails?.bookingReference || '');
    setConfirmedCentre(row.confirmationDetails?.confirmedCentre || '');
    setConfirmedDate(row.confirmationDetails?.confirmedDate ? new Date(row.confirmationDetails.confirmedDate).toISOString().slice(0, 10) : '');
    setConfirmedTime(row.confirmationDetails?.confirmedTime || '');
    setInstructions(row.confirmationDetails?.importantInstructions || '');
    setShowConfirmModal(false);
  };

  const closeDetail = () => {
    setSelected(null);
    setShowConfirmModal(false);
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSaving(true);
    const payload: Record<string, unknown> = { status: statusDraft, adminNotes: notesDraft };
    if (statusDraft === 'Booking Confirmed') {
      payload.confirmationDetails = {
        bookingReference: bookingRef,
        confirmedCentre,
        confirmedDate: confirmedDate || null,
        confirmedTime,
        importantInstructions: instructions,
      };
    }
    const res = await adminApi.updatePTEBooking(selected._id, payload);
    setSaving(false);
    if (res.success) {
      closeDetail();
      refresh();
    } else {
      alert((res.message as string) || 'Failed to update request');
    }
  };

  const quickStatus = async (row: PTERow, newStatus: string) => {
    const res = await adminApi.updatePTEBooking(row._id, { status: newStatus });
    if (res.success) refresh();
    else alert(res.message);
  };

  const handleExport = async () => {
    setExporting(true);
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (examType) params.examType = examType;
    if (search) params.search = search;
    await adminApi.downloadExport('pte-bookings', false, params);
    setExporting(false);
  };

  const totalCount = rows.length;
  const newCount = rows.filter((r) => r.status === 'New').length;
  const inProgressCount = rows.filter((r) => ['Processing', 'Booking In Progress'].includes(r.status || '')).length;
  const waitingCustomerCount = rows.filter((r) => r.status === 'Waiting for Customer').length;
  const confirmedCount = rows.filter((r) => ['Booking Confirmed', 'Completed'].includes(r.status || '')).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">PTE Booking Requests</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">
            Review customer PTE booking assistance requests, contact them, update timelines, and dispatch official confirmation details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={handleExport} disabled={exporting} className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50">
            <Download className="w-4 h-4 text-brand-pink" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
          <button type="button" onClick={refresh} className="p-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-xs font-black transition-colors shadow-sm" title="Refresh list">
            <RefreshCw className={`w-4 h-4 text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Requests', count: totalCount, tint: '#6C3CE0' },
          { label: 'New Unassigned', count: newCount, tint: '#0284C7' },
          { label: 'In Progress', count: inProgressCount, tint: '#8B5CF6' },
          { label: 'Waiting for Customer', count: waitingCustomerCount, tint: '#EA580C' },
          { label: 'Confirmed / Done', count: confirmedCount, tint: '#10B981' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">{kpi.label}</div>
            <div className="font-heading font-black text-2xl mt-1" style={{ color: kpi.tint }}>{kpi.count}</div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-55 px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input placeholder="Search request ID, name, email, phone, city..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-full" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={examType} onChange={(e) => setExamType(e.target.value)} className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
            <option value="">All Exam Types</option>
            {PTE_EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold">
            <option value="">All Statuses</option>
            {PTE_BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {selected && (
        <FormCard title={`Request ${selected.requestId}`} onClose={closeDetail} onSave={saveDetail}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <Label>Customer Contact</Label>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-2.5 text-xs font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-900 dark:text-white font-black text-sm">{selected.fullName}</span>
                    <span className="text-[10px] font-mono font-bold text-neutral-400">{selected.requestId}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-200/60 dark:border-[#252525]">
                    <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:text-brand-pink">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{selected.email}</span>
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 hover:text-brand-pink">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{selected.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/${String(selected.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selected.fullName}, this is Apex Vouchers regarding your PTE Booking Assistance request (${selected.requestId}).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <Label>Exam & Slot Preferences</Label>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-2 text-xs font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Exam:</span>
                    <span className="font-black text-brand-pink">{selected.examType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">City:</span>
                    <span className="text-neutral-900 dark:text-white">{selected.preferredCity}</span>
                  </div>
                  {selected.preferredTestCentre && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Centre:</span>
                      <span className="text-neutral-900 dark:text-white">{selected.preferredTestCentre}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Date:</span>
                    <span className="text-neutral-900 dark:text-white">{fmtPTEDate(selected.preferredDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Preferred Time:</span>
                    <span className="text-neutral-900 dark:text-white">{selected.preferredTime || 'Any Time'}</span>
                  </div>
                  {selected.alternativeDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Alt Date:</span>
                      <span className="text-neutral-900 dark:text-white">{fmtPTEDate(selected.alternativeDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {selected.message && (
                <div>
                  <Label>Customer Notes</Label>
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-medium text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">{selected.message}</div>
                </div>
              )}

              <div>
                <Label>Request Activity History</Label>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-3 max-h-48 overflow-y-auto">
                  {selected.activityHistory?.length ? (
                    selected.activityHistory.map((act, i) => (
                      <div key={i} className="text-[11px] font-bold border-l-2 border-brand-pink pl-2.5 py-0.5 space-y-0.5">
                        <div className="flex items-center justify-between text-neutral-400">
                          <span>{act.timestamp ? new Date(act.timestamp).toLocaleString() : ''}</span>
                          <span className="text-[10px] text-neutral-500">{act.adminEmail?.split('@')[0]}</span>
                        </div>
                        <div className="text-neutral-900 dark:text-white font-black">{act.action}</div>
                        {act.notes && <div className="text-neutral-500 font-medium">{act.notes}</div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-[11px] font-bold text-neutral-400">● Request Submitted on {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div>
                <Label>Request Status</Label>
                <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink">
                  {PTE_BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {['Contacted', 'Processing', 'Booking In Progress', 'Waiting for Customer', 'Booking Confirmed', 'Completed', 'Cancelled', 'Rejected'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusDraft(st)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                      statusDraft === st ? 'bg-brand-pink text-white border-brand-pink' : 'bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-600 dark:text-neutral-300 border-[#EAEAEA] dark:border-[#292929]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {statusDraft === 'Booking Confirmed' && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Confirmation Details for Candidate</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">These details will be included in the official status update email dispatched to the customer.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">Pearson Booking Reference / Candidate ID</label>
                      <input type="text" placeholder="e.g. PTE-89218274" value={bookingRef} onChange={(e) => setBookingRef(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">Confirmed Test Centre Name & Address</label>
                      <input type="text" placeholder="e.g. Pearson Professional Centres-Bangalore" value={confirmedCentre} onChange={(e) => setConfirmedCentre(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-bold outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">Confirmed Exam Date</label>
                      <input type="date" value={confirmedDate} onChange={(e) => setConfirmedDate(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-bold outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">Confirmed Time Slot</label>
                      <input type="text" placeholder="e.g. 09:30 AM IST" value={confirmedTime} onChange={(e) => setConfirmedTime(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-bold outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-neutral-500 mb-1">Important Candidate Instructions</label>
                    <textarea rows={2} placeholder="e.g. Please carry original valid passport and arrive 30 minutes before exam time." value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#121212] border border-emerald-300 dark:border-emerald-800 text-xs font-medium outline-none" />
                  </div>
                </div>
              )}

              <TextArea label="Admin Internal Notes (tracked in request history)" value={notesDraft} onChange={setNotesDraft} rows={4} />

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Only mark &quot;Booking Confirmed&quot; once the appointment is finalized through official Pearson channels.</span>
              </div>

              <div className="text-[11px] font-bold text-neutral-400">Originally Submitted: {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}</div>
            </div>
          </div>
        </FormCard>
      )}

      <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-bold">
            <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
              <tr>
                <Th>Request ID & Name</Th>
                <Th>Contact</Th>
                <Th>Exam Type</Th>
                <Th>City / Centre</Th>
                <Th>Preferred Slot</Th>
                <Th>Status</Th>
                <Th>Submitted</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="p-4"><div className="h-8 bg-neutral-100 dark:bg-[#292929] rounded animate-pulse" /></td></tr>}
              {!loading && rows.map((b) => (
                <tr key={b._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#1A1A1A]">
                  <Td className="whitespace-nowrap font-black">
                    <div className="font-mono text-[11px] text-brand-pink">{b.requestId}</div>
                    <div className="text-neutral-900 dark:text-white">{b.fullName}</div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div>{b.email}</div>
                    <div className="text-[10px] text-neutral-400">{b.phone}</div>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#222] text-neutral-800 dark:text-neutral-200 text-[10px] font-black">{b.examType}</span>
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div>{b.preferredCity}</div>
                    {b.preferredTestCentre && <div className="text-[10px] text-neutral-400">{b.preferredTestCentre}</div>}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <div>{fmtPTEDate(b.preferredDate)}</div>
                    <div className="text-[10px] text-neutral-400">{b.preferredTime || 'Any Time'}</div>
                  </Td>
                  <Td><PTEStatusPill status={b.status} /></Td>
                  <Td className="whitespace-nowrap text-neutral-400">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}</Td>
                  <Td className="whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button onClick={() => openDetail(b)} className="px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-brand-pink border border-brand-pink/30 text-[10px] font-black hover:bg-brand-pink hover:text-white transition-colors">
                        View Details
                      </button>
                      {b.status === 'New' && (
                        <button onClick={() => quickStatus(b, 'Contacted')} className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[10px] font-black">
                          Mark Contacted
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <Empty title="No PTE booking requests found" desc="Try changing your search terms or filter criteria." />}
      </div>
    </div>
  );
}
