import imgPhoneMockup from "figma:asset/9ad54df633f697062707012c5b3066ddc114ded6.png";
import imgSwypdIcon2 from "figma:asset/31d467c2ea7bacd054a9698aae3e85b697e94a10.png";
import { translations, Language } from "./translations";

interface HeroSectionProps {
  language: Language;
}

export default function HeroSection({ language }: HeroSectionProps) {
  const t = translations[language];

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden">
      {/* Icon at top */}
      <div className="absolute top-8 xl:top-12 left-1/2 -translate-x-1/2 w-[40px] h-[40px] xl:w-[50px] xl:h-[50px] z-10">
        <img alt="Swypd Icon" className="w-full h-full object-contain" src={imgSwypdIcon2} />
      </div>

      {/* Main heading */}
      <div className="absolute top-[90px] xl:top-[120px] left-0 right-0 px-6 xl:px-8 z-10">
        <div className="max-w-[407px] mx-auto">
          <h1 className="font-['Goodly',sans-serif] text-[24px] xl:text-[32px] text-center leading-[1.2]">
            <span className="text-[#a8a8a8] font-semibold">{t.heroText1}</span>
            <span className="text-black font-bold">{t.heroText2}</span>
          </h1>
        </div>
      </div>

      {/* Phone mockup image - Fixed dimensions */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 xl:pt-20">
        <div className="w-[300px] h-[307px] xl:w-[445px] xl:h-[455px]">
          <img 
            alt="Swypd App Mockup" 
            className="w-full h-full object-contain" 
            src={imgPhoneMockup} 
          />
        </div>
      </div>
    </div>
  );
}