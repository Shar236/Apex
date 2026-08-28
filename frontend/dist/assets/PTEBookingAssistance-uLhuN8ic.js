import{b as l,j as e}from"./react-vendor-dgf6YXb3.js";import{u as d,a as r,c,i as p}from"./index-5pRg0Pxm.js";import{G as x,n as m,t as g,A as b,u as h,v as u,H as f}from"./icons-BE1kcQTV.js";import"./vendor-BD0gtMdv.js";const k=[{examType:"PTE Academic",slug:"pte-academic",badge:"MOST BOOKED",icon:x,tint:"#005A9C",desc:"For study visas & university admissions worldwide. We help you find the right test centre and date.",illustration:"/pte-academic-illustration.jpg",illustrationAlt:"Student studying at desk with books, laptop and coffee cup",accentFrom:"#EEF6FF",accentTo:"#FFFFFF",accentFromDark:"#081525",accentToDark:"#161616",borderLight:"#005A9C28",borderDark:"#005A9C55",btnGrad:"linear-gradient(135deg,#0074cc,#005A9C)",btnHoverGrad:"linear-gradient(135deg,#0080e0,#0065b0)"},{examType:"PTE Core",slug:"pte-core",badge:"CANADA PR",icon:m,tint:"#FF005C",desc:"IRCC-approved test for Canada Express Entry & PR pathways. Get assistance booking your preferred slot.",illustration:"/pte-core-illustration.jpg",illustrationAlt:"Relaxed student sitting in armchair using laptop with plant nearby",accentFrom:"#FFF0F5",accentTo:"#FFFFFF",accentFromDark:"#280912",accentToDark:"#161616",borderLight:"#FF005C28",borderDark:"#FF005C55",btnGrad:"linear-gradient(135deg,#ff1a6e,#FF005C)",btnHoverGrad:"linear-gradient(135deg,#ff2d7e,#e00052)"},{examType:"PTE Academic UKVI",slug:"pte-ukvi",badge:"UK VISA (SELT)",icon:g,tint:"#6C3CE0",desc:"For UK visa & immigration applications. Our team helps coordinate your official booking request.",illustration:"/pte-ukvi-illustration.jpg",illustrationAlt:"Student at laptop with email, stars and confirmation document floating around",accentFrom:"#F4F0FF",accentTo:"#FFFFFF",accentFromDark:"#130A28",accentToDark:"#161616",borderLight:"#6C3CE028",borderDark:"#6C3CE055",btnGrad:"linear-gradient(135deg,#7c4df0,#6C3CE0)",btnHoverGrad:"linear-gradient(135deg,#8b5df5,#7a47f0)"}],F=[{icon:h,text:"We help you find available dates & centres"},{icon:u,text:"Real support team, not an automated booking bot"},{icon:f,text:"Follow-up by email, WhatsApp & phone"}],N=()=>{const{setActiveTab:s}=d(),i=l(),o=t=>{s("exam-booking"),i(`/exam-booking?exam=${t}`)};return e.jsxs("section",{id:"pte-booking-assistance",className:"py-16 sm:py-24 bg-[#FAFAFA] dark:bg-[#0D0D0D] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300",children:[e.jsx("style",{children:`
        .pte-card {
          border-radius: 22px;
          border-width: 1.5px;
          border-style: solid;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition:
            transform 0.32s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.32s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
        }
        .pte-card:hover {
          transform: translateY(-7px);
          box-shadow: 0 22px 52px -10px rgba(0,0,0,0.14), 0 8px 20px -4px rgba(0,0,0,0.07);
        }
        .pte-card:hover .pte-illus img {
          transform: translateY(-6px) scale(1.03);
        }

        /* Dark-mode card backgrounds — read from CSS custom properties set via inline style */
        .dark .pte-card {
          background: var(--card-bg-dark) !important;
          border-color: var(--card-border-dark) !important;
        }

        .pte-illus {
          width: 100%;
          height: 178px;
          border-radius: 12px;
          overflow: hidden;
          background: #f5f2ec;
          flex-shrink: 0;
          margin-bottom: 14px;
        }
        .pte-illus img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: transform 0.38s cubic-bezier(0.34,1.56,0.64,1);
        }

        .pte-corner {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .pte-corner-br {
          bottom: -20px; right: -20px;
          width: 100px; height: 100px;
          opacity: 0.07;
        }
        .pte-corner-tl {
          top: -14px; left: -14px;
          width: 64px; height: 64px;
          opacity: 0.05;
        }

        .pte-cta-btn {
          width: 100%;
          padding: 13px 20px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.01em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #fff;
          border: none;
          cursor: pointer;
          outline: none;
          transition:
            transform 0.2s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 0.2s ease,
            filter 0.2s ease;
          margin-top: auto;
        }
        .pte-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px -4px rgba(0,0,0,0.28);
          filter: brightness(1.08);
        }
        .pte-cta-btn:active { transform: translateY(0); }

        @media (max-width: 640px) {
          .pte-illus { height: 155px; }
        }
      `}),e.jsxs("div",{className:"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",children:[e.jsxs("div",{className:"text-center max-w-3xl mx-auto mb-12",children:[e.jsxs("div",{className:"inline-flex items-center gap-2 mb-2",children:[e.jsx("span",{className:"text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929]",children:"NEED HELP BOOKING PTE?"}),e.jsx("span",{className:"text-[#000048] dark:text-white",children:e.jsx(r,{className:"h-4",inverted:!1})})]}),e.jsxs("h2",{className:"font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mt-1",children:["PTE Exam"," ",e.jsx("span",{className:"bg-gradient-to-r from-[#FF005C] to-[#D9004C] bg-clip-text text-transparent",children:"Booking Assistance"})]}),e.jsx("p",{className:"text-slate-600 dark:text-slate-400 font-medium text-base mt-3",children:"Not sure how to book your PTE slot? Tell us your preferred exam, city and date — our team will personally help you get it scheduled. This is booking assistance, not an automated Pearson booking service."})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-6 mb-10",children:k.map(t=>{const a=t.icon;return e.jsxs("div",{className:"pte-card p-5","data-slug":t.slug,style:{"--card-bg-light":`linear-gradient(150deg, ${t.accentFrom} 0%, ${t.accentTo} 55%)`,"--card-bg-dark":`linear-gradient(150deg, ${t.accentFromDark} 0%, ${t.accentToDark} 55%)`,"--card-border-light":t.borderLight,"--card-border-dark":t.borderDark,background:`linear-gradient(150deg, ${t.accentFrom} 0%, ${t.accentTo} 55%)`,borderColor:t.borderLight},children:[e.jsx("div",{className:"pte-corner pte-corner-br",style:{background:t.tint}}),e.jsx("div",{className:"pte-corner pte-corner-tl",style:{background:t.tint}}),e.jsxs("div",{className:"flex items-center justify-between mb-3 relative z-10",children:[e.jsx("span",{className:"text-[9.5px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full text-white shadow-sm",style:{backgroundColor:t.tint},children:t.badge}),e.jsx("span",{className:"text-[#000048] dark:text-white",children:e.jsx(r,{className:"h-3.5",inverted:!1})})]}),e.jsx("div",{className:"pte-illus",children:e.jsx("img",{src:p(t.illustration,{width:600}),srcSet:c(t.illustration,[300,480,600])||void 0,sizes:"(max-width: 640px) 90vw, 380px",alt:t.illustrationAlt,width:1200,height:896,loading:"lazy",decoding:"async"})}),e.jsx("div",{className:"w-12 h-12 rounded-2xl mb-3 border flex items-center justify-center flex-shrink-0",style:{backgroundColor:`${t.tint}14`,borderColor:`${t.tint}33`},children:e.jsx(a,{className:"w-6 h-6",style:{color:t.tint},strokeWidth:2})}),e.jsxs("div",{className:"space-y-1.5 mb-5 relative z-10 flex-1",children:[e.jsx("h3",{className:"font-heading font-black text-xl leading-snug text-[#0F172A] dark:text-white",children:t.examType}),e.jsx("p",{className:"text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400",children:t.desc})]}),e.jsxs("button",{type:"button",onClick:()=>o(t.slug),className:"pte-cta-btn",style:{background:t.btnGrad},children:[e.jsx("span",{children:"Get Booking Assistance"}),e.jsx(b,{className:"w-4 h-4"})]})]},t.slug)})}),e.jsx("div",{className:"flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 border-t border-slate-200/80 dark:border-[#292929]",children:F.map((t,a)=>{const n=t.icon;return e.jsxs("div",{className:"flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400",children:[e.jsx(n,{className:"w-4 h-4 text-brand-pink",strokeWidth:2.5}),e.jsx("span",{children:t.text})]},a)})})]})]})};export{N as PTEBookingAssistance,N as default};
