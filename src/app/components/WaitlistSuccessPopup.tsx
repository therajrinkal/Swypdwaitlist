import { X, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import imgSwypdIcon from "figma:asset/31d467c2ea7bacd054a9698aae3e85b697e94a10.png";
import { translations, Language } from "./translations";

interface WaitlistSuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: number;
  referralLink: string;
  language: Language;
}

function RedditLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="14" fill="#FF4500"/>
      <path d="M22.3333 14.0001C22.3333 12.8955 21.4379 12.0001 20.3333 12.0001C19.7777 12.0001 19.2777 12.2223 18.9111 12.5779C17.4667 11.5779 15.5111 10.9334 13.3889 10.8668L14.2889 6.82234L17.1111 7.43345C17.1333 8.20012 17.7667 8.81123 18.5556 8.81123C19.3556 8.81123 20.0111 8.15568 20.0111 7.35568C20.0111 6.55568 19.3556 5.90012 18.5556 5.90012C17.9667 5.90012 17.4667 6.26679 17.2444 6.78901L14.1333 6.11123C14.0222 6.08901 13.9111 6.08901 13.8222 6.13345C13.7111 6.17789 13.6222 6.26679 13.6 6.38901L12.6 10.8668C10.4333 10.9112 8.44444 11.5557 6.97778 12.5779C6.61111 12.2223 6.13333 12.0001 5.55556 12.0001C4.45111 12.0001 3.55556 12.8955 3.55556 14.0001C3.55556 14.8223 4.02222 15.5334 4.7 15.889C4.67778 16.0668 4.66667 16.2446 4.66667 16.4223C4.66667 19.6001 8.82222 22.1779 14 22.1779C19.1778 22.1779 23.3333 19.6001 23.3333 16.4223C23.3333 16.2446 23.3222 16.0779 23.3 15.9001C23.9667 15.5445 24.4333 14.8445 24.4333 14.0223L22.3333 14.0001ZM9.33333 15.3334C9.33333 14.5334 9.98889 13.8779 10.7889 13.8779C11.5889 13.8779 12.2444 14.5334 12.2444 15.3334C12.2444 16.1334 11.5889 16.789 10.7889 16.789C9.98889 16.789 9.33333 16.1334 9.33333 15.3334ZM17.4 19.0668C16.3556 20.1112 14.3333 20.1779 14 20.1779C13.6667 20.1779 11.6444 20.1112 10.6 19.0668C10.4667 18.9334 10.4667 18.7112 10.6 18.5779C10.7333 18.4446 10.9556 18.4446 11.0889 18.5779C11.8 19.289 13.2889 19.4668 14 19.4668C14.7111 19.4668 16.2 19.289 16.9111 18.5779C17.0444 18.4446 17.2667 18.4446 17.4 18.5779C17.5333 18.7112 17.5333 18.9334 17.4 19.0668ZM17.2 16.789C16.4 16.789 15.7444 16.1334 15.7444 15.3334C15.7444 14.5334 16.4 13.8779 17.2 13.8779C18 13.8779 18.6556 14.5334 18.6556 15.3334C18.6556 16.1334 18 16.789 17.2 16.789Z" fill="white"/>
    </svg>
  );
}

export default function WaitlistSuccessPopup({
  isOpen,
  onClose,
  position,
  referralLink,
  language,
}: WaitlistSuccessPopupProps) {
  const [copied, setCopied] = useState(false);
  const t = translations[language];

  // Auto-reload website after 10 seconds when popup opens
  useEffect(() => {
    if (isOpen) {
      console.log("⏱️ Popup opened - will reload page in 10 seconds...");
      let countdown = 10;
      
      // Optional: Log countdown every second
      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          console.log(`⏱️ Reloading in ${countdown} seconds...`);
        }
      }, 1000);
      
      const timer = setTimeout(() => {
        console.log("🔄 Reloading page now...");
        window.location.reload();
      }, 10000); // 10 seconds

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      }; // Cleanup timers if popup closes early
    }
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleRedditShare = () => {
    window.open('https://www.reddit.com/r/Swypd/', '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Popup */}
        <div 
          className="bg-white rounded-2xl shadow-2xl max-w-[380px] w-full p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#6b6b6b] hover:text-[#191919] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <img alt="Swypd Icon" className="w-10 h-10" src={imgSwypdIcon} />
            <p className="font-['Goodly',sans-serif] font-semibold text-[#1c1c0d] text-2xl">Swypd</p>
          </div>

          {/* Title */}
          <h2 className="font-['Goodly',sans-serif] font-bold text-[#191919] text-xl mb-2 text-left">
            {t.popupTitle.replace('{position}', position.toString())}
          </h2>

          {/* Description */}
          <p className="font-['Goodly',sans-serif] font-normal text-[#6b6b6b] text-sm mb-6 text-left">
            {t.popupDescription}
          </p>

          {/* Reddit Share Button */}
          <button
            onClick={handleRedditShare}
            className="w-full bg-white border border-[#e0e0e0] hover:bg-[#f5f5f5] transition-colors rounded-lg py-3 px-4 flex items-center justify-center gap-3 mb-4"
          >
            <RedditLogo />
            <span className="font-['Goodly',sans-serif] font-semibold text-[#191919] text-base">
              reddit
            </span>
          </button>

          {/* Info Text */}
          <p className="font-['Goodly',sans-serif] font-normal text-[#6b6b6b] text-xs mb-4 text-left">
            {t.popupInfo || "If friends from your campus join, things move faster. Invite and Earn Rewards :"}
          </p>

          {/* Referral Link */}
          <div className="bg-[#1734ba] rounded-lg p-3 flex items-center justify-between gap-2">
            <span className="font-['Goodly',sans-serif] font-medium text-white text-sm truncate">
              {referralLink}
            </span>
            <button
              onClick={handleCopyLink}
              className="bg-white/20 hover:bg-white/30 transition-colors rounded-md p-2 shrink-0"
            >
              {copied ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}