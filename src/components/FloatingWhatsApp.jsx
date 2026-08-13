import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp = () => {
  const handleClick = () => {
    const message = encodeURIComponent('Hi Apex Vouchers team! I would like to inquire about discounted PTE / GRE / TOEFL / Duolingo exam vouchers and fast code delivery.');
    window.open(`https://wa.me/919266808333?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <button
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl flex items-center justify-center border-2 border-white transition-all hover:scale-110 group cursor-pointer"
        aria-label="Contact Apex Vouchers Support on WhatsApp"
        title="Contact Apex Vouchers Support on WhatsApp (+91 9266808333)"
      >
        <MessageCircle className="w-8 h-8 fill-white text-[#25D366]" />
        
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-[#171717] text-white font-bold text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none border border-neutral-700">
          💬 Apex Support (+91 9266808333)
        </span>
      </button>
    </div>
  );
};
