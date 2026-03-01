import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import svgPaths from "../../imports/svg-9vzdvb3kls";
import imgSwypdIcon2 from "figma:asset/31d467c2ea7bacd054a9698aae3e85b697e94a10.png";
import { translations, Language } from "./translations";
import WaitlistSuccessPopup from "./WaitlistSuccessPopup";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface WaitlistFormProps {
  language: Language;
}

function LiveIndicator({ text }: { text: string }) {
  return (
    <div className="bg-[rgba(28,52,186,0.08)] flex gap-1.5 items-center justify-center px-2 py-1.5 rounded-[4px]">
      <div className="flex items-center justify-center">
        <div className="bg-[#1734ba] rounded-full w-2 h-2 animate-pulse" />
      </div>
      <p className="font-['Goodly',sans-serif] font-medium text-[#1734ba] text-sm leading-none">
        {text}
      </p>
    </div>
  );
}

function SecurityIcon() {
  return (
    <div className="bg-[#1734ba] rounded-full w-8 h-8 flex items-center justify-center relative overflow-hidden shrink-0">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 16.2343 22.0947">
        <path clipRule="evenodd" d={svgPaths.p3787000} fill="white" fillRule="evenodd" />
        <path clipRule="evenodd" d={svgPaths.p2f81d180} fill="#8FBFFA" fillRule="evenodd" />
      </svg>
    </div>
  );
}

export default function WaitlistForm({ language }: WaitlistFormProps) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    fullName: "",
    universityName: "",
    universityEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [waitlistData, setWaitlistData] = useState<{
    position: number;
    referralLink: string;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [waitlistCount, setWaitlistCount] = useState(20000);

  // Fetch current waitlist count on mount
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2cd756cf/waitlist/count`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setWaitlistCount(data.count);
        }
      } catch (error) {
        // Backend not connected yet - use default count
        // Don't log error to avoid console spam
      }
    };

    // Delay initial fetch to ensure server is ready
    const timeoutId = setTimeout(() => {
      fetchCount();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Basic validation
    if (!formData.fullName || !formData.universityName || !formData.universityEmail) {
      setError(t.form.error);
      setIsSubmitting(false);
      return;
    }

    // Email validation
    if (!formData.universityEmail.includes("@")) {
      setError(t.form.error);
      setIsSubmitting(false);
      return;
    }

    // Block personal email domains (gmail, hotmail, outlook, yahoo, bing, etc.)
    const emailDomain = formData.universityEmail.toLowerCase().split("@")[1];
    const blockedDomains = [
      "gmail.com",
      "googlemail.com",
      "hotmail.com",
      "hotmail.co.uk",
      "hotmail.fr",
      "hotmail.de",
      "hotmail.it",
      "outlook.com",
      "outlook.fr",
      "outlook.de",
      "outlook.it",
      "live.com",
      "live.fr",
      "live.de",
      "live.it",
      "yahoo.com",
      "yahoo.fr",
      "yahoo.de",
      "yahoo.it",
      "yahoo.co.uk",
      "ymail.com",
      "bing.com",
      "msn.com",
      "aol.com",
      "icloud.com",
      "me.com",
      "protonmail.com",
      "proton.me",
      "mail.com",
      "zoho.com",
    ];

    if (blockedDomains.includes(emailDomain)) {
      setError(t.form.personalEmail);
      setIsSubmitting(false);
      return;
    }

    try {
      // Try to connect to backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2cd756cf/waitlist/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Waitlist submission successful:", data);
        setWaitlistData({
          position: data.position,
          referralLink: data.referralLink,
        });
        setShowPopup(true);
        setFormData({ fullName: "", universityName: "", universityEmail: "" });
        // Update the count on the page immediately
        setWaitlistCount(data.position);
        console.log(`📊 Waitlist count updated to: ${data.position}`);
      } else {
        const errorData = await response.json();
        console.error("❌ Backend error:", errorData);
        
        // Check if it's a duplicate email error
        if (errorData.error && errorData.error.includes("already on the waitlist")) {
          setError(t.form.duplicateEmail);
        } else {
          setError(errorData.error || t.form.error);
        }
      }
    } catch (error) {
      console.error("❌ Backend connection failed, using demo mode:", error);
      
      // Demo mode - check for duplicates in localStorage
      try {
        const existing = localStorage.getItem("waitlist_submissions");
        const submissions = existing ? JSON.parse(existing) : [];
        
        // Check if email already exists
        const isDuplicate = submissions.some(
          (sub: any) => sub.universityEmail.toLowerCase() === formData.universityEmail.toLowerCase()
        );
        
        if (isDuplicate) {
          console.log("❌ Duplicate email found in demo mode");
          setError(t.form.duplicateEmail);
          setIsSubmitting(false);
          return;
        }
      } catch (e) {
        console.error("Failed to check localStorage:", e);
      }
      
      // Demo mode - show success popup without backend
      const demoReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const demoReferralLink = `https://getswypd.com?ref=${demoReferralCode}`;
      const newPosition = waitlistCount + 1;
      
      console.log("🎭 Demo mode activated - position:", newPosition);
      
      setWaitlistData({
        position: newPosition,
        referralLink: demoReferralLink,
      });
      setShowPopup(true);
      setFormData({ fullName: "", universityName: "", universityEmail: "" });
      // Update the count on the page immediately
      setWaitlistCount(newPosition);
      console.log(`📊 Demo count updated to: ${newPosition}`);
      
      // Store in localStorage as backup
      const savedData = {
        fullName: formData.fullName,
        universityName: formData.universityName,
        universityEmail: formData.universityEmail,
        referralCode: demoReferralCode,
        timestamp: new Date().toISOString(),
      };
      
      try {
        const existing = localStorage.getItem("waitlist_submissions");
        const submissions = existing ? JSON.parse(existing) : [];
        submissions.push(savedData);
        localStorage.setItem("waitlist_submissions", JSON.stringify(submissions));
      } catch (e) {
        console.error("Failed to save to localStorage:", e);
      }
    }

    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-center px-6 xl:px-8 py-12">
      <div className="w-full max-w-[546px] flex flex-col gap-12">
        {/* Stats Section */}
        <div className="flex flex-col gap-12">
          {/* Top Stats Row */}
          <div className="flex flex-col gap-4 xl:gap-0 xl:flex-row xl:items-center">
            {/* Mobile: Stats in one row */}
            <div className="flex items-center justify-center gap-4 xl:hidden">
              {/* Live & Waitlist */}
              <div className="flex items-center gap-3 shrink-0">
                <LiveIndicator text={t.live} />
                <div className="font-['Goodly',sans-serif] text-lg leading-tight text-center">
                  <p className="font-extrabold text-[#1734ba]">{waitlistCount.toLocaleString()}</p>
                  <p className="font-normal text-[#191919]">{t.waitlist}</p>
                </div>
              </div>

              {/* Security */}
              <div className="flex items-center gap-3 shrink-0">
                <SecurityIcon />
                <div className="font-['Goodly',sans-serif] text-lg leading-tight text-center">
                  <p className="font-extrabold text-[#1734ba]">100%</p>
                  <p className="font-normal text-[#191919] whitespace-nowrap">{t.secure}</p>
                </div>
              </div>
            </div>

            {/* Desktop: Stats separated */}
            <div className="hidden xl:flex xl:items-center xl:gap-6">
              {/* Live & Waitlist */}
              <div className="flex items-center gap-4 shrink-0">
                <LiveIndicator text={t.live} />
                <div className="font-['Goodly',sans-serif] text-lg leading-tight">
                  <p className="font-extrabold text-[#1734ba]">{waitlistCount.toLocaleString()}</p>
                  <p className="font-normal text-[#191919]">{t.waitlist}</p>
                </div>
              </div>

              {/* Security */}
              <div className="flex items-center gap-3 shrink-0">
                <SecurityIcon />
                <div className="font-['Goodly',sans-serif] text-lg leading-tight">
                  <p className="font-extrabold text-[#1734ba]">100%</p>
                  <p className="font-normal text-[#191919] whitespace-nowrap">{t.secure}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="bg-[#d9d9d9] w-[1.5px] h-[46px] shrink-0" />

              {/* Tagline */}
              <p className="font-['Goodly',sans-serif] font-medium text-[#1734ba] text-[15px] max-w-[193px] leading-[1.3]">
                {t.tagline}
              </p>
            </div>

            {/* Mobile Tagline */}
            <p className="font-['Goodly',sans-serif] font-medium text-[#1734ba] text-xl leading-[1.3] text-center xl:hidden">
              {t.tagline}
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-9">
            {/* Input Fields */}
            <div className="flex flex-col gap-[18px]">
              {/* Name and University */}
              <div className="flex flex-col gap-3.5">
                <input
                  type="text"
                  name="fullName"
                  placeholder={t.fullName}
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#fafafa] border border-[rgba(0,0,0,0.12)] rounded-lg px-4 py-4 font-['Goodly',sans-serif] text-base text-black placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#1734ba] focus:ring-2 focus:ring-[#1734ba]/20 transition-all cursor-text"
                  required
                  autoComplete="name"
                  disabled={isSubmitting}
                />
                <input
                  type="text"
                  name="universityName"
                  placeholder={t.universityName}
                  value={formData.universityName}
                  onChange={handleChange}
                  className="w-full bg-[#fafafa] border border-[rgba(0,0,0,0.12)] rounded-lg px-4 py-4 font-['Goodly',sans-serif] text-base text-black placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#1734ba] focus:ring-2 focus:ring-[#1734ba]/20 transition-all cursor-text"
                  required
                  autoComplete="organization"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <input
                type="email"
                name="universityEmail"
                placeholder={t.universityEmail}
                value={formData.universityEmail}
                onChange={handleChange}
                className="w-full bg-[#fafafa] border border-[rgba(0,0,0,0.12)] rounded-lg px-4 py-4 font-['Goodly',sans-serif] text-base text-black placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#1734ba] focus:ring-2 focus:ring-[#1734ba]/20 transition-all cursor-text"
                required
                autoComplete="email"
                disabled={isSubmitting}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1734ba] hover:bg-[#0f2390] active:bg-[#0a1660] disabled:bg-[#6b6b6b] transition-colors h-[52px] rounded-lg flex items-center justify-center gap-2 px-4"
            >
              <span className="font-['Goodly',sans-serif] font-medium text-white text-base whitespace-nowrap">
                {isSubmitting ? "Submitting..." : t.joinWaitlist}
              </span>
              {!isSubmitting && <ArrowRight className="w-5 h-5 text-white shrink-0" />}
            </button>

            {/* Error Message */}
            {error && (
              <p className="font-['Goodly',sans-serif] text-red-500 text-sm text-center">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <img alt="Swypd Icon" className="w-10 h-10" src={imgSwypdIcon2} />
          <p className="font-['Goodly',sans-serif] font-semibold text-[#1c1c0d] text-2xl">Swypd</p>
        </div>
      </div>

      {/* Success Popup */}
      {waitlistData && (
        <WaitlistSuccessPopup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          position={waitlistData.position}
          referralLink={waitlistData.referralLink}
          language={language}
        />
      )}
    </div>
  );
}