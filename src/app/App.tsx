import { useState, useEffect } from "react";
import AnnouncementBar from "./components/AnnouncementBar";
import HeroSection from "./components/HeroSection";
import WaitlistForm from "./components/WaitlistForm";
import Footer from "./components/Footer";
import { Language } from "./components/translations";
import faviconImg from "figma:asset/d8d9687c7f689a2c473b378042aaab946c12fda9.png";

// Function to detect language based on browser locale
function detectLanguage(): Language {
  // Get browser language
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const langCode = browserLang.toLowerCase();

  // Map language codes to our supported languages
  // French (France, Belgium, Switzerland, Canada, etc.)
  if (langCode.startsWith("fr")) {
    return "fr";
  }
  
  // German (Germany, Austria, Switzerland, etc.)
  if (langCode.startsWith("de")) {
    return "de";
  }
  
  // Italian (Italy, Switzerland, etc.)
  if (langCode.startsWith("it")) {
    return "it";
  }
  
  // Irish (Ireland)
  if (langCode.startsWith("ga") || langCode === "en-ie") {
    return "ga";
  }
  
  // Default to English for all other languages
  return "en";
}

export default function App() {
  const [language, setLanguage] = useState<Language>("en");

  // Set document title and favicon
  useEffect(() => {
    document.title = "Swypd | The Verified Student Only Social Network";
    
    // Set favicon
    const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = faviconImg;
    document.head.appendChild(link);

    // Also set apple-touch-icon for mobile
    const appleTouchIcon: HTMLLinkElement = document.querySelector("link[rel~='apple-touch-icon']") || document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = faviconImg;
    document.head.appendChild(appleTouchIcon);
  }, []);

  // Auto-detect language on mount
  useEffect(() => {
    const detectedLang = detectLanguage();
    setLanguage(detectedLang);
    console.log(`Auto-detected language: ${detectedLang} (Browser: ${navigator.language})`);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Announcement Bar */}
      <AnnouncementBar language={language} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col xl:flex-row w-full">
        {/* Left Side - Hero Section */}
        <div className="w-full xl:w-1/2 h-[600px] xl:h-auto xl:min-h-[calc(100vh-56px)] border-b xl:border-b-0 xl:border-r border-[#919191]">
          <HeroSection language={language} />
        </div>

        {/* Right Side - Waitlist Form */}
        <div className="w-full xl:w-1/2 h-auto xl:min-h-[calc(100vh-56px)]">
          <WaitlistForm language={language} />
        </div>
      </main>

      {/* Footer */}
      <Footer language={language} onLanguageChange={setLanguage} />
    </div>
  );
}