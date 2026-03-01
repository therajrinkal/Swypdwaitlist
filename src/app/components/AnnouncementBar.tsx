import { useState, useEffect } from "react";
import svgPaths from "../../imports/svg-9vzdvb3kls";
import { translations, Language } from "./translations";
import { projectId, publicAnonKey } from "/utils/supabase/info";

function SparkleIcon() {
  return (
    <div className="relative shrink-0 w-4 h-4">
      <svg className="absolute block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_sparkle)">
          <path d={svgPaths.p347dd300} fill="#FFB636" />
          <path d={svgPaths.p134ba580} fill="#FFD469" />
          <path d={svgPaths.p233d1500} fill="#FFE1AB" />
        </g>
        <defs>
          <clipPath id="clip0_sparkle">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

interface AnnouncementBarProps {
  language: Language;
}

export default function AnnouncementBar({ language }: AnnouncementBarProps) {
  const t = translations[language];
  const [latestUser, setLatestUser] = useState<{
    fullName: string;
    universityName: string;
  }>({ fullName: "Sarah M", universityName: "Stanford University" });

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2cd756cf/waitlist/latest`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setLatestUser(data);
        }
      } catch (error) {
        // Backend not connected yet - silently use default
      }
    };

    // Delay initial fetch to ensure server is ready
    const timeoutId = setTimeout(() => {
      fetchLatestUser();
    }, 1000);

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchLatestUser, 10000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  const staticAnnouncements = [
    "COMING SOON",
    "Liam.C (TCD) Joined",
    "Michael.S (University of Manchester) JOINED",
  ];

  const dynamicAnnouncement = `${latestUser.fullName} (${latestUser.universityName}) JOINED`;
  
  const announcements = [
    staticAnnouncements[0],
    dynamicAnnouncement,
    staticAnnouncements[1],
    staticAnnouncements[2],
  ];

  return (
    <div className="bg-black w-full overflow-hidden">
      <div className="flex items-center gap-6 sm:gap-8 md:gap-10 h-12 sm:h-14 animate-scroll">
        {/* Repeat announcements multiple times for seamless scrolling */}
        {[...announcements, ...announcements, ...announcements, ...announcements].map((text, index) => (
          <div key={index} className="flex gap-2 sm:gap-3 items-center shrink-0">
            <p className="font-['Funnel_Display',sans-serif] font-normal text-white text-sm sm:text-base uppercase whitespace-nowrap">
              {text}
            </p>
            <SparkleIcon />
          </div>
        ))}
      </div>
    </div>
  );
}