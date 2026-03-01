import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { UKFlag, IrishFlag, FrenchFlag, ItalianFlag, GermanFlag } from "./LanguageFlags";
import { translations, Language } from "./translations";

interface FooterProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const languageOptions = [
  { code: "en" as Language, name: "English", Flag: UKFlag },
  { code: "ga" as Language, name: "Irish", Flag: IrishFlag },
  { code: "fr" as Language, name: "French", Flag: FrenchFlag },
  { code: "it" as Language, name: "Italian", Flag: ItalianFlag },
  { code: "de" as Language, name: "German", Flag: GermanFlag },
];

export default function Footer({ language, onLanguageChange }: FooterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];
  const currentLanguage = languageOptions.find(lang => lang.code === language) || languageOptions[0];

  return (
    <footer className="bg-white border-t border-[#919191] w-full">
      <div className="max-w-[1440px] mx-auto px-6 xl:px-12 py-8 relative">
        {/* Desktop Layout */}
        <div className="hidden xl:flex items-center justify-between">
          {/* Left - Contact */}
          <div className="flex flex-col gap-6">
            <a 
              href="mailto:hello@getswypd.com"
              className="font-['Goodly',sans-serif] font-semibold text-[#424242] text-base hover:text-[#1734ba] transition-colors"
            >
              {t.contact}
            </a>
          </div>

          {/* Center - Copyright */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <p className="font-['Goodly',sans-serif] font-bold text-[#424242] text-sm text-center whitespace-nowrap">
              {t.copyright}
            </p>
          </div>

          {/* Right - Language Selector */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 font-['Goodly',sans-serif] font-normal text-[#424242] text-base hover:text-[#1734ba] transition-colors border border-[#919191] rounded-md px-3 py-1.5"
              >
                <currentLanguage.Flag />
                {currentLanguage.name}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                  />
                  
                  {/* Dropdown - Opens upward */}
                  <div className="absolute bottom-full mb-2 right-0 bg-white border border-[#d9d9d9] rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setIsOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left font-['Goodly',sans-serif] text-base text-[#424242] hover:bg-[#f5f5f5] transition-colors flex items-center gap-3"
                      >
                        <lang.Flag />
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="xl:hidden flex flex-col items-center gap-6">
          {/* Contact */}
          <a 
            href="mailto:hello@getswypd.com"
            className="font-['Goodly',sans-serif] font-semibold text-[#424242] text-base hover:text-[#1734ba] transition-colors"
          >
            {t.contact}
          </a>
          
          {/* Copyright */}
          <p className="font-['Goodly',sans-serif] font-bold text-[#424242] text-sm text-center">
            {t.copyright}
          </p>

          {/* Language Selector */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 font-['Goodly',sans-serif] font-normal text-[#424242] text-base hover:text-[#1734ba] transition-colors border border-[#919191] rounded-md px-3 py-1.5"
              >
                <currentLanguage.Flag />
                {currentLanguage.name}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                  />
                  
                  {/* Dropdown - Opens upward on mobile too */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-[#d9d9d9] rounded-lg shadow-lg py-1 min-w-[160px] z-50">
                    {languageOptions.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          onLanguageChange(lang.code);
                          setIsOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left font-['Goodly',sans-serif] text-base text-[#424242] hover:bg-[#f5f5f5] transition-colors flex items-center gap-3"
                      >
                        <lang.Flag />
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}