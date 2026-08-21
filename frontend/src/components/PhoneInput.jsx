import React, { useState, useRef, useEffect, useMemo } from 'react';
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { ChevronDown, Search, X, Check } from 'lucide-react';

// Country name mapping (ISO 3166-1 alpha-2 → name)
const COUNTRY_NAMES = {
  AF:'Afghanistan',AL:'Albania',DZ:'Algeria',AS:'American Samoa',AD:'Andorra',AO:'Angola',AI:'Anguilla',AG:'Antigua and Barbuda',AR:'Argentina',AM:'Armenia',AW:'Aruba',AU:'Australia',AT:'Austria',AZ:'Azerbaijan',BS:'Bahamas',BH:'Bahrain',BD:'Bangladesh',BB:'Barbados',BY:'Belarus',BE:'Belgium',BZ:'Belize',BJ:'Benin',BM:'Bermuda',BT:'Bhutan',BO:'Bolivia',BA:'Bosnia and Herzegovina',BW:'Botswana',BR:'Brazil',BN:'Brunei',BG:'Bulgaria',BF:'Burkina Faso',BI:'Burundi',KH:'Cambodia',CM:'Cameroon',CA:'Canada',CV:'Cape Verde',KY:'Cayman Islands',CF:'Central African Republic',TD:'Chad',CL:'Chile',CN:'China',CO:'Colombia',KM:'Comoros',CG:'Congo',CD:'Congo (DRC)',CK:'Cook Islands',CR:'Costa Rica',CI:"Côte d'Ivoire",HR:'Croatia',CU:'Cuba',CW:'Curaçao',CY:'Cyprus',CZ:'Czechia',DK:'Denmark',DJ:'Djibouti',DM:'Dominica',DO:'Dominican Republic',EC:'Ecuador',EG:'Egypt',SV:'El Salvador',GQ:'Equatorial Guinea',ER:'Eritrea',EE:'Estonia',SZ:'Eswatini',ET:'Ethiopia',FJ:'Fiji',FI:'Finland',FR:'France',GF:'French Guiana',PF:'French Polynesia',GA:'Gabon',GM:'Gambia',GE:'Georgia',DE:'Germany',GH:'Ghana',GI:'Gibraltar',GR:'Greece',GL:'Greenland',GD:'Grenada',GP:'Guadeloupe',GU:'Guam',GT:'Guatemala',GG:'Guernsey',GN:'Guinea',GW:'Guinea-Bissau',GY:'Guyana',HT:'Haiti',HN:'Honduras',HK:'Hong Kong',HU:'Hungary',IS:'Iceland',IN:'India',ID:'Indonesia',IR:'Iran',IQ:'Iraq',IE:'Ireland',IM:'Isle of Man',IL:'Israel',IT:'Italy',JM:'Jamaica',JP:'Japan',JE:'Jersey',JO:'Jordan',KZ:'Kazakhstan',KE:'Kenya',KI:'Kiribati',KP:'North Korea',KR:'South Korea',KW:'Kuwait',KG:'Kyrgyzstan',LA:'Laos',LV:'Latvia',LB:'Lebanon',LS:'Lesotho',LR:'Liberia',LY:'Libya',LI:'Liechtenstein',LT:'Lithuania',LU:'Luxembourg',MO:'Macao',MG:'Madagascar',MW:'Malawi',MY:'Malaysia',MV:'Maldives',ML:'Mali',MT:'Malta',MH:'Marshall Islands',MQ:'Martinique',MR:'Mauritania',MU:'Mauritius',YT:'Mayotte',MX:'Mexico',FM:'Micronesia',MD:'Moldova',MC:'Monaco',MN:'Mongolia',ME:'Montenegro',MS:'Montserrat',MA:'Morocco',MZ:'Mozambique',MM:'Myanmar',NA:'Namibia',NR:'Nauru',NP:'Nepal',NL:'Netherlands',NC:'New Caledonia',NZ:'New Zealand',NI:'Nicaragua',NE:'Niger',NG:'Nigeria',NU:'Niue',NF:'Norfolk Island',MK:'North Macedonia',MP:'Northern Mariana Islands',NO:'Norway',OM:'Oman',PK:'Pakistan',PW:'Palau',PS:'Palestine',PA:'Panama',PG:'Papua New Guinea',PY:'Paraguay',PE:'Peru',PH:'Philippines',PL:'Poland',PT:'Portugal',PR:'Puerto Rico',QA:'Qatar',RE:'Réunion',RO:'Romania',RU:'Russia',RW:'Rwanda',BL:'Saint Barthélemy',SH:'Saint Helena',KN:'Saint Kitts and Nevis',LC:'Saint Lucia',MF:'Saint Martin',PM:'Saint Pierre and Miquelon',VC:'Saint Vincent and the Grenadines',WS:'Samoa',SM:'San Marino',ST:'São Tomé and Príncipe',SA:'Saudi Arabia',SN:'Senegal',RS:'Serbia',SC:'Seychelles',SL:'Sierra Leone',SG:'Singapore',SX:'Sint Maarten',SK:'Slovakia',SI:'Slovenia',SB:'Solomon Islands',SO:'Somalia',ZA:'South Africa',SS:'South Sudan',ES:'Spain',LK:'Sri Lanka',SD:'Sudan',SR:'Suriname',SE:'Sweden',CH:'Switzerland',SY:'Syria',TW:'Taiwan',TJ:'Tajikistan',TZ:'Tanzania',TH:'Thailand',TL:'Timor-Leste',TG:'Togo',TK:'Tokelau',TO:'Tonga',TT:'Trinidad and Tobago',TN:'Tunisia',TR:'Turkey',TM:'Turkmenistan',TC:'Turks and Caicos Islands',TV:'Tuvalu',UG:'Uganda',UA:'Ukraine',AE:'United Arab Emirates',GB:'United Kingdom',US:'United States',UY:'Uruguay',UZ:'Uzbekistan',VU:'Vanuatu',VA:'Vatican City',VE:'Venezuela',VN:'Vietnam',VG:'British Virgin Islands',VI:'U.S. Virgin Islands',WF:'Wallis and Futuna',EH:'Western Sahara',YE:'Yemen',ZM:'Zambia',ZW:'Zimbabwe',
};

// Country → emoji flag
const countryFlag = (code) => {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
};

// Priority countries shown at top
const PRIORITY_COUNTRIES = ['IN', 'US', 'GB', 'CA', 'AU', 'AE', 'DE', 'FR', 'SG', 'NZ'];

export function PhoneInput({
  value = '',
  country = 'IN',
  onChange,
  onCountryChange,
  disabled = false,
  error = null,
  id = 'phone-input',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(country || 'IN');
  const [localValue, setLocalValue] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const triggerRef = useRef(null);

  // Build sorted country list
  const allCountries = useMemo(() => {
    const codes = getCountries();
    const list = codes
      .filter(c => COUNTRY_NAMES[c])
      .map(c => ({
        code: c,
        name: COUNTRY_NAMES[c],
        callingCode: getCountryCallingCode(c),
        flag: countryFlag(c),
      }));
    
    // Sort: priority countries first, then alphabetical
    list.sort((a, b) => {
      const aPri = PRIORITY_COUNTRIES.indexOf(a.code);
      const bPri = PRIORITY_COUNTRIES.indexOf(b.code);
      if (aPri !== -1 && bPri !== -1) return aPri - bPri;
      if (aPri !== -1) return -1;
      if (bPri !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, []);

  // Filter by search
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return allCountries;
    const q = search.toLowerCase();
    return allCountries.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      `+${c.callingCode}`.includes(q)
    );
  }, [allCountries, search]);

  // Keep the visible input synchronized with the canonical E.164 value.
  useEffect(() => {
    if (value) {
      try {
        const parsed = parsePhoneNumberFromString(value, selectedCountry);
        if (parsed) {
          setLocalValue(parsed.nationalNumber || value.replace(/^\+\d+/, ''));
          if (parsed.country) {
            setSelectedCountry(parsed.country);
          }
          return;
        }
      } catch {}
      // Fallback: strip calling code
      const cc = getCountryCallingCode(selectedCountry);
      if (value.startsWith(`+${cc}`)) {
        setLocalValue(value.slice(cc.length + 1).trim());
      } else {
        setLocalValue(value.replace(/^\+/, ''));
      }
    } else {
      setLocalValue('');
    }
  }, [value, country, selectedCountry]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !triggerRef.current?.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleCountrySelect = (c) => {
    setSelectedCountry(c.code);
    onCountryChange?.(c.code);
    setIsOpen(false);
    setSearch('');
    // Re-emit with new country
    if (localValue) {
      const fullNumber = `+${c.callingCode}${localValue.replace(/\D/g, '')}`;
      onChange?.(fullNumber, c.code);
    }
  };

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/[^\d\s\-()]/g, '');
    setLocalValue(raw);
    const cc = getCountryCallingCode(selectedCountry);
    const digits = raw.replace(/\D/g, '');
    const fullNumber = digits ? `+${cc}${digits}` : '';
    onChange?.(fullNumber, selectedCountry);
  };

  const currentCountryData = allCountries.find(c => c.code === selectedCountry) || {
    code: selectedCountry,
    name: COUNTRY_NAMES[selectedCountry] || selectedCountry,
    callingCode: getCountryCallingCode(selectedCountry),
    flag: countryFlag(selectedCountry),
  };

  const placeholder = (() => {
    try {
      const ex = getExampleNumber(selectedCountry, examples);
      return ex ? ex.formatNational() : 'Phone number';
    } catch {
      return 'Phone number';
    }
  })();

  return (
    <div className="relative" id={id}>
      <div className={`flex items-stretch rounded-2xl border ${error ? 'border-rose-400 dark:border-rose-500' : 'border-[#EAEAEA] dark:border-[#292929]'} bg-neutral-50 dark:bg-[#0E0E0E] overflow-hidden focus-within:border-[#FF005C] focus-within:ring-2 focus-within:ring-[#FF005C]/20 transition-all ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        {/* Country selector */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-3 bg-neutral-100 dark:bg-[#1A1A1A] border-r border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-200 dark:hover:bg-[#222] transition-colors flex-shrink-0 min-w-[100px]"
          aria-label="Select country"
          aria-expanded={isOpen}
        >
          <span className="text-lg leading-none">{currentCountryData.flag}</span>
          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 whitespace-nowrap">+{currentCountryData.callingCode}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Phone input */}
        <input
          type="tel"
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-3 bg-transparent text-neutral-900 dark:text-white text-sm font-bold focus:outline-none min-w-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          autoComplete="tel-national"
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-bold text-rose-500">{error}</p>
      )}

      {/* Country dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-full max-h-[300px] z-50 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Search */}
          <div className="p-2.5 border-b border-[#EAEAEA] dark:border-[#292929] flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
              <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="flex-1 bg-transparent text-xs font-bold text-neutral-900 dark:text-white focus:outline-none placeholder:text-neutral-400 min-w-0"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="p-0.5">
                  <X className="w-3 h-3 text-neutral-400" />
                </button>
              )}
            </div>
          </div>

          {/* Country list */}
          <div className="overflow-y-auto flex-1">
            {filteredCountries.length === 0 && (
              <div className="px-4 py-6 text-center text-xs font-bold text-neutral-400">No countries found</div>
            )}
            {filteredCountries.map((c, i) => {
              const isSelected = c.code === selectedCountry;
              const isPriority = PRIORITY_COUNTRIES.includes(c.code);
              const prevIsPriority = i > 0 && PRIORITY_COUNTRIES.includes(filteredCountries[i - 1].code);
              const showDivider = !search && isPriority === false && prevIsPriority === true;

              return (
                <React.Fragment key={c.code}>
                  {showDivider && (
                    <div className="h-px bg-[#EAEAEA] dark:bg-[#292929] mx-3" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] transition-colors ${isSelected ? 'bg-[#FFF0F5] dark:bg-[#2A0A17]' : ''}`}
                  >
                    <span className="text-base leading-none flex-shrink-0">{c.flag}</span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white flex-1 truncate">{c.name}</span>
                    <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 tabular-nums flex-shrink-0">+{c.callingCode}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FF005C] flex-shrink-0" />}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PhoneInput;
