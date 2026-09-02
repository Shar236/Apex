'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, getExampleNumber, type CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import { ChevronDown, Search, X, Check } from 'lucide-react';

const COUNTRY_NAMES: Record<string, string> = {
  AF:'Afghanistan',AL:'Albania',DZ:'Algeria',AS:'American Samoa',AD:'Andorra',AO:'Angola',AI:'Anguilla',AG:'Antigua and Barbuda',AR:'Argentina',AM:'Armenia',AW:'Aruba',AU:'Australia',AT:'Austria',AZ:'Azerbaijan',BS:'Bahamas',BH:'Bahrain',BD:'Bangladesh',BB:'Barbados',BY:'Belarus',BE:'Belgium',BZ:'Belize',BJ:'Benin',BM:'Bermuda',BT:'Bhutan',BO:'Bolivia',BA:'Bosnia and Herzegovina',BW:'Botswana',BR:'Brazil',BN:'Brunei',BG:'Bulgaria',BF:'Burkina Faso',BI:'Burundi',KH:'Cambodia',CM:'Cameroon',CA:'Canada',CV:'Cape Verde',KY:'Cayman Islands',CF:'Central African Republic',TD:'Chad',CL:'Chile',CN:'China',CO:'Colombia',KM:'Comoros',CG:'Congo',CD:'Congo (DRC)',CK:'Cook Islands',CR:'Costa Rica',CI:"Côte d'Ivoire",HR:'Croatia',CU:'Cuba',CW:'Curaçao',CY:'Cyprus',CZ:'Czechia',DK:'Denmark',DJ:'Djibouti',DM:'Dominica',DO:'Dominican Republic',EC:'Ecuador',EG:'Egypt',SV:'El Salvador',GQ:'Equatorial Guinea',ER:'Eritrea',EE:'Estonia',SZ:'Eswatini',ET:'Ethiopia',FJ:'Fiji',FI:'Finland',FR:'France',GF:'French Guiana',PF:'French Polynesia',GA:'Gabon',GM:'Gambia',GE:'Georgia',DE:'Germany',GH:'Ghana',GI:'Gibraltar',GR:'Greece',GL:'Greenland',GD:'Grenada',GP:'Guadeloupe',GU:'Guam',GT:'Guatemala',GG:'Guernsey',GN:'Guinea',GW:'Guinea-Bissau',GY:'Guyana',HT:'Haiti',HN:'Honduras',HK:'Hong Kong',HU:'Hungary',IS:'Iceland',IN:'India',ID:'Indonesia',IR:'Iran',IQ:'Iraq',IE:'Ireland',IM:'Isle of Man',IL:'Israel',IT:'Italy',JM:'Jamaica',JP:'Japan',JE:'Jersey',JO:'Jordan',KZ:'Kazakhstan',KE:'Kenya',KI:'Kiribati',KP:'North Korea',KR:'South Korea',KW:'Kuwait',KG:'Kyrgyzstan',LA:'Laos',LV:'Latvia',LB:'Lebanon',LS:'Lesotho',LR:'Liberia',LY:'Libya',LI:'Liechtenstein',LT:'Lithuania',LU:'Luxembourg',MO:'Macao',MG:'Madagascar',MW:'Malawi',MY:'Malaysia',MV:'Maldives',ML:'Mali',MT:'Malta',MH:'Marshall Islands',MQ:'Martinique',MR:'Mauritania',MU:'Mauritius',YT:'Mayotte',MX:'Mexico',FM:'Micronesia',MD:'Moldova',MC:'Monaco',MN:'Mongolia',ME:'Montenegro',MS:'Montserrat',MA:'Morocco',MZ:'Mozambique',MM:'Myanmar',NA:'Namibia',NR:'Nauru',NP:'Nepal',NL:'Netherlands',NC:'New Caledonia',NZ:'New Zealand',NI:'Nicaragua',NE:'Niger',NG:'Nigeria',NU:'Niue',NF:'Norfolk Island',MK:'North Macedonia',MP:'Northern Mariana Islands',NO:'Norway',OM:'Oman',PK:'Pakistan',PW:'Palau',PS:'Palestine',PA:'Panama',PG:'Papua New Guinea',PY:'Paraguay',PE:'Peru',PH:'Philippines',PL:'Poland',PT:'Portugal',PR:'Puerto Rico',QA:'Qatar',RE:'Réunion',RO:'Romania',RU:'Russia',RW:'Rwanda',BL:'Saint Barthélemy',SH:'Saint Helena',KN:'Saint Kitts and Nevis',LC:'Saint Lucia',MF:'Saint Martin',PM:'Saint Pierre and Miquelon',VC:'Saint Vincent and the Grenadines',WS:'Samoa',SM:'San Marino',ST:'São Tomé and Príncipe',SA:'Saudi Arabia',SN:'Senegal',RS:'Serbia',SC:'Seychelles',SL:'Sierra Leone',SG:'Singapore',SX:'Sint Maarten',SK:'Slovakia',SI:'Slovenia',SB:'Solomon Islands',SO:'Somalia',ZA:'South Africa',SS:'South Sudan',ES:'Spain',LK:'Sri Lanka',SD:'Sudan',SR:'Suriname',SE:'Sweden',CH:'Switzerland',SY:'Syria',TW:'Taiwan',TJ:'Tajikistan',TZ:'Tanzania',TH:'Thailand',TL:'Timor-Leste',TG:'Togo',TK:'Tokelau',TO:'Tonga',TT:'Trinidad and Tobago',TN:'Tunisia',TR:'Turkey',TM:'Turkmenistan',TC:'Turks and Caicos Islands',TV:'Tuvalu',UG:'Uganda',UA:'Ukraine',AE:'United Arab Emirates',GB:'United Kingdom',US:'United States',UY:'Uruguay',UZ:'Uzbekistan',VU:'Vanuatu',VA:'Vatican City',VE:'Venezuela',VN:'Vietnam',VG:'British Virgin Islands',VI:'U.S. Virgin Islands',WF:'Wallis and Futuna',EH:'Western Sahara',YE:'Yemen',ZM:'Zambia',ZW:'Zimbabwe',
};

const countryFlag = (code: string) => {
  if (!code || code.length !== 2) return '🌐';
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
};

const PRIORITY_COUNTRIES = ['IN', 'US', 'GB', 'CA', 'AU', 'AE', 'DE', 'FR', 'SG', 'NZ'];

interface CountryEntry {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
}

export function PhoneInput({
  value = '',
  country = 'IN',
  onChange,
  onCountryChange,
  disabled = false,
  error = null,
  id = 'phone-input',
}: {
  value?: string;
  country?: string;
  onChange?: (phone: string, country: string) => void;
  onCountryChange?: (country: string) => void;
  disabled?: boolean;
  error?: string | null;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(country || 'IN');
  const [localValue, setLocalValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const allCountries = useMemo<CountryEntry[]>(() => {
    const codes = getCountries();
    const list = codes
      .filter((c) => COUNTRY_NAMES[c])
      .map((c) => ({ code: c, name: COUNTRY_NAMES[c], callingCode: getCountryCallingCode(c), flag: countryFlag(c) }));

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

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return allCountries;
    const q = search.toLowerCase();
    return allCountries.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || `+${c.callingCode}`.includes(q));
  }, [allCountries, search]);

  // Parse the controlled E.164 `value` prop back into the national-number display
  // state (and, if the number carries a country, the selected country). This is a
  // formatting-sync effect with a try/catch and a country feedback dep — keeping
  // it as an effect is the correct, readable choice here.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (value) {
      try {
        const parsed = parsePhoneNumberFromString(value, selectedCountry as CountryCode);
        if (parsed) {
          setLocalValue(parsed.nationalNumber || value.replace(/^\+\d+/, ''));
          if (parsed.country) setSelectedCountry(parsed.country);
          return;
        }
      } catch {
        // fall through to manual strip below
      }
      const cc = getCountryCallingCode(selectedCountry as CountryCode);
      if (value.startsWith(`+${cc}`)) {
        setLocalValue(value.slice(cc.length + 1).trim());
      } else {
        setLocalValue(value.replace(/^\+/, ''));
      }
    } else {
      setLocalValue('');
    }
  }, [value, country, selectedCountry]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleCountrySelect = (c: CountryEntry) => {
    setSelectedCountry(c.code);
    onCountryChange?.(c.code);
    setIsOpen(false);
    setSearch('');
    if (localValue) {
      const fullNumber = `+${c.callingCode}${localValue.replace(/\D/g, '')}`;
      onChange?.(fullNumber, c.code);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s\-()]/g, '');
    setLocalValue(raw);
    const cc = getCountryCallingCode(selectedCountry as CountryCode);
    const digits = raw.replace(/\D/g, '');
    const fullNumber = digits ? `+${cc}${digits}` : '';
    onChange?.(fullNumber, selectedCountry);
  };

  const currentCountryData: CountryEntry = allCountries.find((c) => c.code === selectedCountry) || {
    code: selectedCountry,
    name: COUNTRY_NAMES[selectedCountry] || selectedCountry,
    callingCode: getCountryCallingCode(selectedCountry as CountryCode),
    flag: countryFlag(selectedCountry),
  };

  const placeholder = (() => {
    try {
      const ex = getExampleNumber(selectedCountry as CountryCode, examples);
      return ex ? ex.formatNational() : 'Phone number';
    } catch {
      return 'Phone number';
    }
  })();

  return (
    <div className="relative" id={id}>
      <div
        className={`flex items-stretch rounded-2xl border ${error ? 'border-rose-400 dark:border-rose-500' : 'border-line'} bg-surface-raised overflow-hidden focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-3 bg-surface-raised border-r border-line hover:bg-surface-sunken transition-colors shrink-0 min-w-25 cursor-pointer"
          aria-label="Select country"
          aria-expanded={isOpen}
        >
          <span className="text-lg leading-none">{currentCountryData.flag}</span>
          <span className="text-xs font-normal text-ink-muted whitespace-nowrap">+{currentCountryData.callingCode}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <input
          type="tel"
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-3 bg-transparent text-ink text-sm font-normal focus:outline-none min-w-0 placeholder:text-ink-muted"
          autoComplete="tel-national"
        />
      </div>

      {error && <p className="mt-1.5 text-xs font-normal text-rose-500">{error}</p>}

      {isOpen && (
        <div ref={dropdownRef} className="absolute top-full left-0 mt-2 w-full max-h-75 z-50 rounded-2xl bg-surface border border-line shadow-2xl overflow-hidden flex flex-col">
          <div className="p-2.5 border-b border-line shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-raised border border-line">
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="flex-1 bg-transparent text-xs font-normal text-ink focus:outline-none placeholder:text-neutral-400 min-w-0"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="p-0.5 cursor-pointer">
                  <X className="w-3 h-3 text-neutral-400" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredCountries.length === 0 && <div className="px-4 py-6 text-center text-xs font-normal text-neutral-400">No countries found</div>}
            {filteredCountries.map((c, i) => {
              const isSelected = c.code === selectedCountry;
              const isPriority = PRIORITY_COUNTRIES.includes(c.code);
              const prevIsPriority = i > 0 && PRIORITY_COUNTRIES.includes(filteredCountries[i - 1].code);
              const showDivider = !search && !isPriority && prevIsPriority;

              return (
                <Fragment key={c.code}>
                  {showDivider && <div className="h-px bg-line mx-3" />}
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-surface-raised transition-colors cursor-pointer ${isSelected ? 'bg-accent/8' : ''}`}
                  >
                    <span className="text-base leading-none shrink-0">{c.flag}</span>
                    <span className="text-xs font-normal text-ink flex-1 truncate">{c.name}</span>
                    <span className="text-[11px] font-normal text-ink-muted tabular-nums shrink-0">+{c.callingCode}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </button>
                </Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
