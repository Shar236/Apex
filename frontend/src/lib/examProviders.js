/**
 * Centralized Exam Providers Configuration
 * 
 * Provides verified metadata, official website destinations, and guidelines for supported
 * exam types. Provider branding is used solely for service identification and guidance.
 * Apex Vouchers operates as an independent voucher and booking assistance provider.
 */

export const EXAM_PROVIDERS = {
  pearson: {
    id: 'pearson',
    name: 'Pearson PTE',
    providerName: 'Pearson PLC',
    website: 'https://www.pearsonpte.com',
    availabilityUrl: 'https://www.pearsonpte.com/test-centers-and-fees',
    termsUrl: 'https://www.pearsonpte.com/terms-and-conditions',
    brandColor: '#000048',
    accentColor: '#005A9C',
    exams: [
      {
        id: 'pte-academic',
        slug: 'pte-academic',
        name: 'PTE Academic',
        badge: 'MOST POPULAR',
        badgeColor: '#005A9C',
        tagline: 'Study & Work Visas Worldwide',
        purpose: 'Recognized by 3,500+ universities and colleges globally including UK, Australia, USA, Canada, and New Zealand.',
        acceptedBy: 'Universities, Colleges, Study Visa & Global Immigration Pathways',
        officialUrl: 'https://www.pearsonpte.com/pte-academic',
      },
      {
        id: 'pte-core',
        slug: 'pte-core',
        name: 'PTE Core',
        badge: 'CANADA PR',
        badgeColor: '#FF005C',
        tagline: 'Canadian Immigration & Citizenship',
        purpose: 'Approved by Immigration, Refugees and Citizenship Canada (IRCC) for Express Entry, Provincial Nominees, and Citizenship.',
        acceptedBy: 'IRCC Canada Express Entry, PR, Work Permit & Citizenship',
        officialUrl: 'https://www.pearsonpte.com/pte-core',
      },
      {
        id: 'pte-ukvi',
        slug: 'pte-ukvi',
        name: 'PTE Academic UKVI',
        badge: 'UK VISA (SELT)',
        badgeColor: '#6C3CE0',
        tagline: 'UK Visas & Immigration SELT',
        purpose: 'Secure English Language Test (SELT) approved by the UK Home Office for Student Visas, Work Visas, and Settlement routes.',
        acceptedBy: 'UK Home Office, UKVI Work Visas, Study Visas & Family Visas',
        officialUrl: 'https://www.pearsonpte.com/pte-academic-ukvi',
      },
    ],
  },
  etsGre: {
    id: 'etsGre',
    name: 'GRE® by ETS',
    providerName: 'Educational Testing Service (ETS)',
    website: 'https://www.ets.org/gre',
    brandColor: '#1A162B',
    accentColor: '#6C3CE0',
    description: 'Accepted by graduate and business schools worldwide for master’s, MBA, specialized master’s, and doctoral programs.',
  },
  etsToefl: {
    id: 'etsToefl',
    name: 'TOEFL iBT® by ETS',
    providerName: 'Educational Testing Service (ETS)',
    website: 'https://www.ets.org/toefl',
    brandColor: '#0F1B2D',
    accentColor: '#004B87',
    description: 'Accepted by 12,000+ universities in 160+ countries for academic admissions and visa processing.',
  },
  ielts: {
    id: 'ielts',
    name: 'IELTS',
    providerName: 'British Council / IDP / Cambridge',
    website: 'https://www.ielts.org',
    brandColor: '#E31837',
    accentColor: '#E31837',
    description: 'Accepted by over 11,500 organizations worldwide including universities, employers, and immigration bodies.',
  },
};

export const PTE_INDIAN_CITIES = [
  { name: 'Delhi NCR', state: 'Delhi / Haryana / UP', prominent: true },
  { name: 'Chandigarh', state: 'Punjab / Haryana', prominent: true },
  { name: 'Mumbai', state: 'Maharashtra', prominent: true },
  { name: 'Bangalore', state: 'Karnataka', prominent: true },
  { name: 'Hyderabad', state: 'Telangana', prominent: true },
  { name: 'Chennai', state: 'Tamil Nadu', prominent: true },
  { name: 'Pune', state: 'Maharashtra', prominent: true },
  { name: 'Kolkata', state: 'West Bengal', prominent: true },
  { name: 'Ahmedabad', state: 'Gujarat', prominent: true },
  { name: 'Jaipur', state: 'Rajasthan', prominent: true },
  { name: 'Amritsar', state: 'Punjab', prominent: true },
  { name: 'Ludhiana', state: 'Punjab', prominent: true },
  { name: 'Jalandhar', state: 'Punjab', prominent: false },
  { name: 'Lucknow', state: 'Uttar Pradesh', prominent: false },
  { name: 'Kochi', state: 'Kerala', prominent: false },
  { name: 'Coimbatore', state: 'Tamil Nadu', prominent: false },
  { name: 'Nagpur', state: 'Maharashtra', prominent: false },
  { name: 'Indore', state: 'Madhya Pradesh', prominent: false },
  { name: 'Vadodara', state: 'Gujarat', prominent: false },
  { name: 'Surat', state: 'Gujarat', prominent: false },
  { name: 'Bhopal', state: 'Madhya Pradesh', prominent: false },
  { name: 'Patna', state: 'Bihar', prominent: false },
];
