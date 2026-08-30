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

export const EXAM_TYPE_OPTIONS = [
  { id: 'PTE Academic', slug: 'pte-academic', label: 'PTE Academic', badge: 'MOST POPULAR', tint: '#005A9C', desc: 'For university study admissions, student visas & professional registrations worldwide (Australia, UK, USA, Canada, NZ).' },
  { id: 'PTE Core', slug: 'pte-core', label: 'PTE Core', badge: 'CANADA PR', tint: '#FF005C', desc: 'Approved by IRCC for Canadian Permanent Residency (PR), Express Entry, Provincial Nominees, and Citizenship pathways.' },
  { id: 'PTE Academic UKVI', slug: 'pte-ukvi', label: 'PTE Academic UKVI', badge: 'UK VISA (SELT)', tint: '#6C3CE0', desc: 'Secure English Language Test (SELT) approved by the UK Home Office for UK work, study, and family visa applications.' },
];

export const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Any Time'];

export const BEFORE_YOU_BOOK_CHECKLIST = [
  'Valid passport or accepted government photo ID — name must exactly match your test registration',
  'Correct spelling of your full legal name as per your ID',
  'Accurate date of birth',
  'An email address you check regularly',
  'A mobile number reachable on WhatsApp',
  'Your confirmed test type — PTE Academic, PTE Core, or PTE Academic UKVI',
  'Your preferred test centre and city',
  'Your preferred date and time, plus a backup option',
  'Your personal myPTE account, created directly on pearsonpte.com',
];

export const BOOKING_MISTAKES = [
  { title: 'Wrong Test Type', desc: 'Booking PTE Academic when your university or immigration route actually requires PTE Core or PTE Academic UKVI — or vice-versa.' },
  { title: 'Incorrect Personal Details', desc: 'Name or date of birth that doesn\'t exactly match your ID. This can delay or invalidate your appointment.' },
  { title: 'Last-Minute Booking', desc: 'Waiting too long means your preferred date, time or centre may no longer be available.' },
  { title: 'Not Reviewing Final Details', desc: 'Confirming a booking without double-checking the centre, date and time shown at the end.' },
  { title: 'Ignoring Reschedule Rules', desc: 'Not checking Pearson\'s official rescheduling and cancellation policy before requesting a late change.' },
];

export const FAQ_LIST = [
  { q: 'What is PTE Exam Booking Assistance?', a: 'PTE Exam Booking Assistance is a dedicated guidance service by Apex Vouchers. Our team helps you understand the different PTE exam types, select your preferred city and centre, review date options, and navigate the official booking process without confusion.' },
  { q: 'Which PTE tests can you help with?', a: 'We provide booking assistance for all three official Pearson PTE variants: PTE Academic (study and general visas), PTE Core (Canadian Express Entry and PR pathways), and PTE Academic UKVI (UK Home Office SELT visa applications).' },
  { q: 'Can you help me choose the correct PTE test?', a: 'Yes, we provide objective guidance on the differences between PTE Academic, PTE Core, and PTE Academic UKVI. However, the ultimate requirement must always be confirmed with your specific university, employer, or immigration authority.' },
  { q: 'Can you guarantee my preferred slot, test centre, or date?', a: 'No. Test slots and appointments are managed directly within Pearson\'s official test centre network. An appointment is only confirmed when the official Pearson booking process succeeds and issues an official Pearson booking confirmation.' },
  { q: 'Can I request a preferred city and test centre?', a: 'Yes! In the booking assistance form, you can specify your preferred city, test centre, preferred exam date, and time preference. You can also provide alternative dates in case your primary choice is full.' },
  { q: 'What if my preferred date or test centre is unavailable?', a: 'If your primary slot is full, our team will review the alternative dates or nearby test centres you provided, or contact you directly with the closest official availability to help you schedule without delay.' },
  { q: 'Do I need my own Pearson account?', a: 'Yes. You should create and maintain your personal myPTE account on Pearson\'s official portal (pearsonpte.com) to access your official test confirmation, admit card, and scorecard.' },
  { q: 'Should I give Apex Vouchers my Pearson password or OTP?', a: 'Never. Apex Vouchers will NEVER ask you for your Pearson account password, myPTE password, OTP, UPI PIN, or bank card PIN. You always retain complete control and ownership of your personal credentials.' },
  { q: 'Can I book PTE Academic UKVI for the UK?', a: 'Yes, we assist with PTE Academic UKVI requests, which are specifically required for certain UK Home Office visa routes requiring a Secure English Language Test (SELT).' },
  { q: 'Can I book PTE Core for Canada Express Entry?', a: 'Yes. PTE Core is accepted by Immigration, Refugees and Citizenship Canada (IRCC) for Express Entry, Provincial Nominee Programs (PNP), and Canadian Citizenship.' },
  { q: 'How do I know when my exam booking is confirmed?', a: 'Your appointment is officially confirmed only when you receive an official Pearson Booking Confirmation email containing your official appointment details, centre address, and Pearson candidate reference.' },
  { q: 'Can I use a discounted PTE voucher with your booking assistance?', a: 'Yes. Apex Vouchers sells genuine discounted vouchers for PTE Academic and PTE Core that you apply directly at the Pearson checkout step when you book. You can browse and purchase a voucher separately from our voucher shop, then use our booking assistance for guidance on the rest of the process.' },
  { q: 'Can I reschedule or cancel my PTE exam?', a: 'Rescheduling and cancellation are handled entirely through Pearson\'s official policy on pearsonpte.com. We recommend checking the latest official terms and deadlines before requesting any change, especially close to your test date.' },
  { q: 'How much does booking assistance cost?', a: 'Booking assistance is currently available as a dedicated support service from Apex Vouchers. If you also purchase an official discounted exam voucher from us, you can apply the voucher during your official checkout to save on exam fees.' },
];
