import React, { useState } from 'react';
import { ArrowRight, Globe, CheckCircle2, ChevronRight, X, Building2 } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';

export const StudyDestinations = () => {
  const { setActiveTab } = useVoucher();
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countries = [
    {
      id: 'australia',
      name: 'Australia',
      flag: '🇦🇺',
      banner: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80',
      pteRequirement: 'PTE Academic 58 - 65 Overall',
      ieltsRequirement: 'IELTS 6.5 (No band < 6.0)',
      topUnis: ['University of Melbourne', 'University of Sydney', 'UNSW Sydney', 'Monash University'],
      keyPerks: ['Post-study work visa up to 4-5 years', 'PTE accepted by 100% of Australian universities & Dept of Home Affairs', 'High quality of life & PR points pathways']
    },
    {
      id: 'uk',
      name: 'United Kingdom',
      flag: '🇬🇧',
      banner: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80',
      pteRequirement: 'PTE Academic 59 - 69 Overall',
      ieltsRequirement: 'IELTS 6.5 - 7.0 Band',
      topUnis: ['Imperial College London', 'UCL', 'University of Edinburgh', 'King\'s College London'],
      keyPerks: ['1-Year Master\'s degree programs', '2-Year Graduate Route Post-Study Visa', '99% of UK universities accept PTE & IELTS']
    },
    {
      id: 'usa',
      name: 'United States',
      flag: '🇺🇸',
      banner: 'https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=600&auto=format&fit=crop&q=80',
      pteRequirement: 'PTE Academic 68+ / TOEFL 90+ / GRE 310+',
      ieltsRequirement: 'IELTS 7.0 Band',
      topUnis: ['Harvard University', 'Stanford University', 'MIT', 'Columbia University'],
      keyPerks: ['3-Year STEM OPT extension for eligible STEM courses', 'Largest global tech & finance career market', 'Over 1,200 US institutions accept PTE Academic']
    },
    {
      id: 'canada',
      name: 'Canada',
      flag: '🇨🇦',
      banner: 'https://images.unsplash.com/photo-1517935703635-27c5696e2465?w=600&auto=format&fit=crop&q=80',
      pteRequirement: 'PTE Core (IRCC Approved for PR) & PTE Academic',
      ieltsRequirement: 'IELTS General / Academic 6.5',
      topUnis: ['University of Toronto', 'UBC', 'McGill University', 'University of Waterloo'],
      keyPerks: ['Express Entry & SDS visa processing', 'PTE Core accepted for Canada PR applications', 'Up to 3-Year Post-Graduation Work Permit (PGWP)']
    },
    {
      id: 'germany',
      name: 'Germany',
      flag: '🇩🇪',
      banner: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&auto=format&fit=crop&q=80',
      pteRequirement: 'PTE 62+ / IELTS 6.5 / GRE 315+',
      ieltsRequirement: 'IELTS 6.5 Overall',
      topUnis: ['TUM (Technical University of Munich)', 'LMU Munich', 'RWTH Aachen University'],
      keyPerks: ['Tuition-FREE education at public universities', 'Strong engineering, automotive & tech sector', '18-Month Job Seeking Visa after graduation']
    },
    {
      id: 'new-zealand',
      name: 'New Zealand',
      flag: '🇳🇿',
      banner: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&auto=format&fit=crop&q=80',
      pteRequirement: 'PTE Academic 58 Overall',
      ieltsRequirement: 'IELTS 6.5 Band',
      topUnis: ['University of Auckland', 'University of Otago', 'Victoria University of Wellington'],
      keyPerks: ['100% acceptance of PTE for all student & resident visas', 'Post-study work rights up to 3 years', 'High quality safety & student lifestyle']
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-linear-to-b from-slate-50 via-blue-50/40 to-slate-50 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (Exact like EduVouchers reference) */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-100/80 px-3.5 py-1.5 rounded-full border border-blue-200">
            STUDY DESTINATIONS
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-3">
            Explore Colleges <span className="text-blue-600">by Country</span>
          </h2>
          <p className="text-slate-500 font-medium text-base mt-2">
            Pick a destination to view top institutions, courses, and official PTE/GRE/TOEFL score cutoffs.
          </p>
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {countries.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCountry(c)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Country Flag Image Banner */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={c.banner}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <span className="text-3xl shadow-sm">{c.flag}</span>
                  <h3 className="font-heading font-extrabold text-2xl text-white tracking-tight">
                    {c.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                    <span>Exam Cutoff:</span>
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{c.pteRequirement.split('/')[0]}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Institutions:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.topUnis.slice(0, 3).map((uni, idx) => (
                        <span key={idx} className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {uni}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs font-extrabold text-blue-600 group-hover:text-blue-700">
                  <span>View Details & Score Cutoffs</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Country Detail Modal */}
      {selectedCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-y-auto max-h-[90vh] space-y-6">
            
            <button
              onClick={() => setSelectedCountry(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedCountry.flag}</span>
              <div>
                <h3 className="font-heading font-extrabold text-2xl text-slate-900">
                  Study in {selectedCountry.name}
                </h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                  Official Exam & Visa Rules 2026
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700">PTE Score Needed:</span>
                <span className="font-black text-blue-700">{selectedCountry.pteRequirement}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-blue-100">
                <span className="font-bold text-slate-700">IELTS Score Needed:</span>
                <span className="font-bold text-slate-900">{selectedCountry.ieltsRequirement}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Top Recognized Universities:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCountry.topUnis.map((uni, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{uni}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-heading font-extrabold text-sm text-slate-900">Key Student Perks & Visa Benefits:</h4>
              <ul className="space-y-2">
                {selectedCountry.keyPerks.map((perk, idx) => (
                  <li key={idx} className="text-xs font-medium text-slate-600 flex items-start gap-2">
                    <span className="text-blue-600 font-bold">✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCountry(null);
                  setActiveTab('shop');
                }}
                className="w-full btn-primary !py-3 !text-sm"
              >
                Buy {selectedCountry.name} Exam Voucher
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
