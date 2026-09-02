import { Camera, CheckCircle2, ScanSearch, Sprout } from "lucide-react";

type SmartPlantRescueProps = {
  language: "ar" | "en";
};

export function SmartPlantRescue({ language }: SmartPlantRescueProps) {
  const isArabic = language === "ar";

  return (
    <div
      className="smart-plant-rescue relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[#35530e]/10 bg-[#edf4df] shadow-[0_24px_60px_rgba(42,62,18,.18)]"
      role="img"
      aria-label={
        isArabic
          ? "روبوت ذكي يشخّص نبتة ذابلة ثم يضيف السماد فتنمو وتخضر"
          : "A smart robot diagnoses a wilted plant, adds fertilizer, and helps it grow green"
      }
    >
      <div className="rescue-glow rescue-glow--top" />
      <div className="rescue-glow rescue-glow--bottom" />
      <div className="rescue-grid" />

      <div className="absolute inset-x-5 top-5 z-10 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1.5 text-[11px] font-bold text-[#496c1d] shadow-sm backdrop-blur">
          <span className="size-1.5 animate-pulse rounded-full bg-[#7baa37]" />
          {isArabic ? "فيديو توضيحي" : "Explainer video"}
        </span>
        <span className="grid size-9 place-items-center rounded-xl border border-white/80 bg-white/75 text-[#557b23] shadow-sm backdrop-blur">
          <Camera className="size-4" />
        </span>
      </div>

      <svg
        className="absolute inset-[7%_4%_9%] h-[84%] w-[92%]"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rescue-window" x1="0" y1="0" x2="400" y2="500">
            <stop stopColor="#F9FCF2" />
            <stop offset="1" stopColor="#D7E8BC" />
          </linearGradient>
          <linearGradient id="rescue-robot" x1="138" y1="320" x2="278" y2="440">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#D5E5C2" />
          </linearGradient>
          <filter id="rescue-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#3B5B18" floodOpacity=".18" />
          </filter>
        </defs>

        <rect x="24" y="18" width="352" height="438" rx="34" fill="url(#rescue-window)" opacity=".9" />
        <path d="M24 352C90 318 117 360 178 340C250 317 295 331 376 292V456H24V352Z" fill="#C7DCA5" opacity=".64" />
        <path d="M24 384C102 354 152 395 211 369C268 344 318 362 376 332V456H24V384Z" fill="#A9C77A" opacity=".42" />

        <g className="rescue-diagnostic-beam">
          <rect x="58" y="102" width="284" height="204" rx="24" fill="#B3D970" opacity=".14" />
          <path d="M62 216H338" stroke="#8BB744" strokeWidth="3" strokeDasharray="9 10" opacity=".88" />
        </g>

        <g className="rescue-plant rescue-plant--sick" filter="url(#rescue-shadow)">
          <path d="M202 341C203 292 195 239 174 198" stroke="#8C9837" strokeWidth="10" strokeLinecap="round" />
          <path d="M202 281C226 253 254 247 287 258C260 290 233 300 202 288" fill="#D2C94D" />
          <path d="M180 235C151 213 127 210 96 225C116 255 145 264 181 247" fill="#C8C14A" />
          <path d="M198 320C224 300 250 302 276 319C253 339 227 345 198 332" fill="#B5AF3E" />
          <path d="M166 278C144 264 120 269 100 290C126 308 148 307 171 291" fill="#D8D05B" />
          <path d="M170 195C160 168 164 146 181 125C200 148 200 172 181 202" fill="#D8CD54" />
        </g>

        <g className="rescue-plant rescue-plant--healthy" filter="url(#rescue-shadow)">
          <path d="M202 341C202 278 204 224 217 168" stroke="#4F7B25" strokeWidth="10" strokeLinecap="round" />
          <path d="M207 272C235 230 275 222 318 239C294 279 258 295 207 285" fill="#67A633" />
          <path d="M210 236C179 196 144 187 103 206C120 252 158 270 210 252" fill="#8FC344" />
          <path d="M204 320C240 282 282 281 322 306C290 342 249 352 204 338" fill="#4E8D2B" />
          <path d="M195 288C164 257 128 260 93 288C125 324 161 326 198 306" fill="#75B338" />
          <path d="M216 178C202 135 215 99 245 70C270 112 257 153 227 187" fill="#9BD04A" />
          <path d="M224 167C239 139 250 112 245 70" stroke="#D1EC83" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        </g>

        <g className="rescue-fertilizer">
          <circle cx="157" cy="343" r="7" fill="#C58C47" />
          <circle cx="178" cy="356" r="5" fill="#B77B3C" />
          <circle cx="228" cy="350" r="6" fill="#D09B55" />
          <circle cx="250" cy="339" r="4" fill="#B77B3C" />
          <path d="M278 331C300 320 312 308 322 289" stroke="#B47A3E" strokeWidth="5" strokeLinecap="round" strokeDasharray="3 11" />
          <path d="M281 331C304 331 320 336 333 351" stroke="#B47A3E" strokeWidth="5" strokeLinecap="round" strokeDasharray="3 11" />
        </g>

        <g className="rescue-pot" filter="url(#rescue-shadow)">
          <path d="M142 332H260L245 411C242 425 231 434 217 434H185C171 434 160 425 157 411L142 332Z" fill="#B56D3F" />
          <path d="M151 344H251" stroke="#E2A166" strokeWidth="8" strokeLinecap="round" opacity=".65" />
          <path d="M158 370H247" stroke="#8E4E31" strokeWidth="5" strokeLinecap="round" opacity=".35" />
        </g>

        <g className="rescue-robot" filter="url(#rescue-shadow)">
          <path d="M110 407H304" stroke="#5E7F35" strokeWidth="8" strokeLinecap="round" opacity=".32" />
          <circle cx="151" cy="407" r="20" fill="#42631D" />
          <circle cx="264" cy="407" r="20" fill="#42631D" />
          <circle cx="151" cy="407" r="8" fill="#B4CE72" />
          <circle cx="264" cy="407" r="8" fill="#B4CE72" />
          <rect x="126" y="319" width="164" height="94" rx="32" fill="url(#rescue-robot)" stroke="#799A4A" strokeWidth="4" />
          <rect x="151" y="279" width="114" height="77" rx="28" fill="#F8FBF2" stroke="#799A4A" strokeWidth="4" />
          <circle cx="190" cy="316" r="12" fill="#35530E" />
          <circle cx="228" cy="316" r="12" fill="#35530E" />
          <circle cx="194" cy="312" r="4" fill="#DDF4A5" />
          <circle cx="232" cy="312" r="4" fill="#DDF4A5" />
          <path d="M199 337C209 345 221 345 231 337" stroke="#668D33" strokeWidth="4" strokeLinecap="round" />
          <path d="M208 279V260" stroke="#668D33" strokeWidth="5" strokeLinecap="round" />
          <circle cx="208" cy="251" r="10" fill="#A7CC62" stroke="#5E8130" strokeWidth="4" />
          <rect x="182" y="364" width="51" height="18" rx="9" fill="#D2E5BA" />
          <path d="M270 367C304 361 316 342 318 322" stroke="#6C8F38" strokeWidth="9" strokeLinecap="round" />
          <circle cx="319" cy="315" r="13" fill="#E3F0D0" stroke="#6C8F38" strokeWidth="5" />
          <path d="M318 315L330 305" stroke="#6C8F38" strokeWidth="5" strokeLinecap="round" />
        </g>

        <g className="rescue-camera">
          <circle cx="330" cy="302" r="28" fill="#FFFFFF" opacity=".84" />
          <circle cx="330" cy="302" r="14" fill="#35530E" />
          <circle cx="334" cy="298" r="5" fill="#DDF4A5" />
        </g>
      </svg>

      <div className="rescue-status rescue-status--scan">
        <ScanSearch className="size-4" />
        <span>{isArabic ? "تشخيص النبتة..." : "Scanning plant..."}</span>
      </div>
      <div className="rescue-status rescue-status--fertilizer">
        <Sprout className="size-4" />
        <span>{isArabic ? "سماد مناسب للتربة" : "Fertilizer matched"}</span>
      </div>
      <div className="rescue-status rescue-status--growth">
        <CheckCircle2 className="size-4" />
        <span>{isArabic ? "نمو أخضر جديد" : "Fresh green growth"}</span>
      </div>

      <div className="absolute inset-x-5 bottom-5 z-10 rounded-2xl border border-white/80 bg-white/82 p-3 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-3 text-[11px] font-bold text-[#35530e]">
          <span>{isArabic ? "من الذبول إلى الحياة" : "From wilted to thriving"}</span>
          <span className="flex items-center gap-1 text-[#70953a]">
            <span className="size-1.5 animate-pulse rounded-full bg-[#8EB64A]" />
            AI
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#DCE9C7]">
          <span className="rescue-progress block h-full rounded-full bg-[#76A93A]" />
        </div>
      </div>
    </div>
  );
}