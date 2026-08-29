import React, { useState } from 'react';
import { MessageSquare, X, Send, ShieldCheck, User, Sparkles } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { ApexLogo } from './ApexLogo';

export const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hi there! 👋 Welcome to Apex Vouchers support. How can I help you save on your PTE, GRE, or TOEFL exam today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const { setActiveTab } = useVoucher();

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let botReply = "Thanks for asking! All our exam vouchers are 100% genuine and delivered instantly to your Email & WhatsApp in 10 seconds. You can click 'Browse Vouchers' to select your exam.";
      
      const textLower = userMsg.text.toLowerCase();
      if (textLower.includes('pte')) {
        botReply = "Our PTE Academic voucher is priced at ₹15,499 (Market price ₹18,900) - you save ₹3,401 instantly! Would you like to buy one now?";
      } else if (textLower.includes('gre') || textLower.includes('toefl')) {
        botReply = "ETS GRE & TOEFL vouchers come with an instant ₹4,001 discount! Delivered directly with full institutional validity.";
      } else if (textLower.includes('refund') || textLower.includes('cancel')) {
        botReply = "We offer a 100% Money-Back Guarantee within 7 days if the voucher code is unredeemed. You can request a 1-click refund from your User Dashboard.";
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botReply }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-[#111111] dark:bg-[#161616] text-white shadow-xl flex items-center justify-center border border-brand-pink/40 hover:border-brand-pink transition-all hover:scale-105 group"
          title="Open Live Chat Assistant"
        >
          <MessageSquare className="w-5 h-5 text-brand-pink" />
        </button>
      ) : (
        <div className="w-80 sm:w-96 bg-white dark:bg-[#161616] rounded-3xl shadow-2xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden flex flex-col h-120 animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Chat Header */}
          <div className="bg-[#111111] dark:bg-[#06070B] text-white p-4 flex items-center justify-between border-b border-[#292929]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <ApexLogo className="h-5" whiteText={true} />
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-neutral-300">Live Support</span>
            </div>

            <button onClick={() => setIsOpen(false)} className="p-1 text-neutral-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFF0F5]/30 dark:bg-[#06070B]/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl font-medium leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-brand-pink text-white rounded-br-none'
                      : 'bg-white dark:bg-[#262626] text-neutral-900 dark:text-white border border-[#EAEAEA] dark:border-[#292929] rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#161616] border-t border-[#EAEAEA] dark:border-[#292929] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question about vouchers..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#06070B] border border-[#EAEAEA] dark:border-[#292929] text-xs font-semibold text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-brand-pink"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl btn-pink text-white flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
