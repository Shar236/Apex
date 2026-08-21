import React, { useState } from 'react';
import { Clock, ArrowRight, X } from 'lucide-react';

export const ExamGuides = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const featuredArticle = {
    id: 'featured',
    category: 'IELTS',
    title: 'IELTS Score for Canada: The 8-7-7-7 Rule for PR 2026',
    excerpt: 'The IELTS score for Canada is not just about your overall band. IRCC converts each IELTS skill score into CLB levels. Here is the full breakdown.',
    readTime: '6 min read',
    date: 'Aug 10, 2026',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80',
    content: `
      ### Understanding the 8-7-7-7 IELTS Rule for Canada PR

      If you are planning to immigrate to Canada under the Federal Skilled Worker Program (FSWP) through Express Entry, achieving Canadian Language Benchmark (CLB) Level 9 is the single biggest booster for your CRS score.

      #### What is the 8-7-7-7 Rule?
      The famous 8-7-7-7 score corresponds to:
      - **Listening**: 8.0 Band
      - **Reading**: 7.0 Band
      - **Writing**: 7.0 Band
      - **Speaking**: 7.0 Band

      #### Why CLB 9 Matters
      When you achieve CLB 9 (8-7-7-7), you unlock maximum points under Skill Transferability factors. A candidate under 30 years with CLB 9 gains an extra **50+ CRS points** automatically!

      #### PTE Core Alternative
      Did you know? IRCC now accepts **PTE Core** for Canada PR! The PTE Core score equivalent for CLB 9 is:
      - Listening: 84 - 88
      - Reading: 78 - 87
      - Writing: 88 - 89
      - Speaking: 84 - 88

      You can book your **PTE Core Voucher** on Apex Vouchers for just ₹15,200 (Market price ₹18,900) and save ₹3,700 instantly!
    `
  };

  const articlesList = [
    {
      id: '1',
      category: 'IELTS',
      title: 'IELTS Score for USA 2026: What 5.5 to 8.0 Bands Mean for Admission?',
      excerpt: 'Find the right IELTS score for USA applications across top public state universities.',
      readTime: '4 min read'
    },
    {
      id: '2',
      category: 'IELTS',
      title: 'IELTS Score for UK 2026: Which Band Do You Need?',
      excerpt: 'This guide breaks down the IELTS score for UK undergraduate and postgraduate applications.',
      readTime: '5 min read'
    },
    {
      id: '3',
      category: 'DUOLINGO',
      title: 'Duolingo English Test Syllabus 2026: All 13 Tasks & Timings',
      excerpt: 'Check the full Duolingo English Test syllabus guide 2026 with production subscore tips.',
      readTime: '7 min read'
    },
    {
      id: '4',
      category: 'IELTS',
      title: 'IELTS Band Score Chart 2026: Meaning + Free Calculator',
      excerpt: 'Confused by 6.5 vs 7.0? Here is the full IELTS band score chart and scoring formula.',
      readTime: '4 min read'
    },
    {
      id: '5',
      category: 'TOEFL',
      title: 'TOEFL Dates & Test Centres in India 2026 (Live List)',
      excerpt: 'Plan your TOEFL 2026 test in India with details on exam dates and center locations.',
      readTime: '3 min read'
    },
    {
      id: '6',
      category: 'PTE',
      title: 'PTE Academic Score for Australia PR & University Cutoffs 2026',
      excerpt: 'Complete score guide for Australian student visas and skilled independent 189/190 visas.',
      readTime: '6 min read'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0A0A0A] border-b border-[#EAEAEA] dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-brand-pink/20">
            STUDENTS DIARY & GUIDES
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight mt-3">
            Students Diary & Exam Guides
          </h2>
          <p className="text-neutral-500 dark:text-[#B5B5B5] font-medium text-sm sm:text-base mt-2">
            Guides on PTE, GRE, TOEFL, IELTS, admissions, and education loans written specifically for Indian students.
          </p>
        </div>

        {/* 2-Column Diary Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Featured Hero Card */}
          <div className="lg:col-span-6 flex">
            <div className="relative bg-[#161616] rounded-3xl overflow-hidden shadow-xl flex flex-col justify-end text-white p-6 sm:p-8 w-full group border border-[#292929]">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />

              <div className="relative z-10 space-y-3">
                <span className="px-3 py-1 rounded-md bg-brand-pink text-white font-extrabold text-xs tracking-wider uppercase inline-block">
                  {featuredArticle.category}
                </span>

                <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-snug">
                  {featuredArticle.title}
                </h3>

                <p className="text-neutral-300 text-sm font-medium line-clamp-3">
                  {featuredArticle.excerpt}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedArticle(featuredArticle)}
                    className="btn-pink !py-3 !px-6 !text-xs !rounded-xl"
                  >
                    <span>Read Blog</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Article List Items */}
          <div className="lg:col-span-6 space-y-3 flex flex-col justify-between">
            {articlesList.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#161616] hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink transition-all cursor-pointer group flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-brand-pink uppercase tracking-widest">
                    {art.category}
                  </span>
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white group-hover:text-brand-pink transition-colors leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-neutral-500 dark:text-[#B5B5B5] text-xs font-medium line-clamp-1">
                    {art.excerpt}
                  </p>
                </div>

                <div className="shrink-0 text-neutral-400 group-hover:text-brand-pink transition-colors pt-1">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#161616] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAEAEA] dark:border-[#292929] relative overflow-y-auto max-h-[90vh] space-y-5">
            
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-md bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-xs font-extrabold uppercase">
                {selectedArticle.category}
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-neutral-900 dark:text-white leading-snug">
                {selectedArticle.title}
              </h3>
              <p className="text-xs text-neutral-400 font-bold flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedArticle.readTime || '5 min read'} • Published by Apex Student Desk</span>
              </p>
            </div>

            <div className="prose text-neutral-700 dark:text-[#B5B5B5] text-sm leading-relaxed space-y-4 pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <p>{selectedArticle.excerpt}</p>
              <p>
                Preparing for standardized language exams requires a clear understanding of university entry criteria, band scoring formulas, and official testing dates.
              </p>
              <p>
                When booking your test, always check if your target university requires specific subscore minimums (e.g. minimum 6.0 in Writing for UK universities or CLB 9 for Canada PR).
              </p>
              <div className="bg-[#FFF0F5] dark:bg-[#2A0A17] p-4 rounded-2xl border border-brand-pink/20">
                <p className="font-extrabold text-brand-pink text-xs uppercase tracking-wider mb-1">💡 Apex Saver Tip:</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-200 font-semibold">
                  Always use official Apex Exam Vouchers to save up to ₹4,000 on your test registration fee. All codes are 100% genuine and delivered instantly to your email.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
              <button
                onClick={() => setSelectedArticle(null)}
                className="w-full btn-pink !py-3 !text-sm"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
