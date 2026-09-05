'use client';

import { FormEvent, useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { contactApi } from '@/lib/api';
import { Button } from '@/components/ui';

const CATEGORIES = [
  'Voucher Purchase',
  'Voucher Code',
  'Payment Issue',
  'Booking Assistance',
  'Refund / Cancellation',
  'Technical Issue',
  'General Question',
  'Other',
];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  orderId: '',
  subject: '',
  category: 'General Question',
  message: '',
};

export function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (status === 'error') setStatus('idle');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please complete your name, email, subject, and message.');
      setStatus('error');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    const response = await contactApi.submit({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      orderId: form.orderId.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });

    if (!response.success) {
      setError(response.message || 'We could not send your message. Please try again.');
      setStatus('error');
      return;
    }

    setForm(initialForm);
    setStatus('success');
  };

  const fieldClass = 'w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10';
  const labelClass = 'mb-1.5 block text-xs font-medium text-ink';

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-7" noValidate>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Full Name *</span>
          <input className={fieldClass} value={form.name} onChange={(event) => update('name', event.target.value)} required autoComplete="name" />
        </label>
        <label>
          <span className={labelClass}>Email Address *</span>
          <input className={fieldClass} type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required autoComplete="email" />
        </label>
        <label>
          <span className={labelClass}>Phone Number <span className="font-normal text-ink-muted">(optional)</span></span>
          <input className={fieldClass} type="tel" value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" />
        </label>
        <label>
          <span className={labelClass}>Order ID <span className="font-normal text-ink-muted">(optional)</span></span>
          <input className={fieldClass} value={form.orderId} onChange={(event) => update('orderId', event.target.value)} />
        </label>
        <label>
          <span className={labelClass}>Subject *</span>
          <input className={fieldClass} value={form.subject} onChange={(event) => update('subject', event.target.value)} required />
        </label>
        <label>
          <span className={labelClass}>Reason / Category</span>
          <select className={fieldClass} value={form.category} onChange={(event) => update('category', event.target.value)}>
            {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>Message *</span>
          <textarea className={`${fieldClass} min-h-36 resize-y`} value={form.message} onChange={(event) => update('message', event.target.value)} required />
        </label>
      </div>

      {status === 'success' && (
        <div role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-success/25 bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Thanks for contacting Apex Vouchers. We&apos;ve received your message and will get back to you shortly.</span>
        </div>
      )}
      {status === 'error' && (
        <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button type="submit" variant="primary" size="md" disabled={status === 'submitting'}>
          <Send className="h-4 w-4" />
          {status === 'submitting' ? 'Sending…' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
}