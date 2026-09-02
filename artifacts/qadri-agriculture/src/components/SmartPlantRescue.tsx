import { CircleCheck, ScanLine, Sprout } from "lucide-react";

type SmartPlantRescueProps = {
  language: "ar" | "en";
};

export function SmartPlantRescue({ language }: SmartPlantRescueProps) {
  const isArabic = language === "ar";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="simple-plant-rescue relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[#c8d6ae] bg-[#f6f8ee] shadow-[0_24px_60px_rgba(53,83,14,.14)]"
      role="img"
      aria-label={
        isArabic
          ? "روبوت حارس يفحص نبتة ذابلة ويضيف السماد حتى تنمو خضراء"
          : "A small guardian robot scans a wilted plant, adds fertilizer, and helps it grow green"
      }
    >
      <div className="simple-rescue-orbit simple-rescue-orbit--one" />
      <div className="simple-rescue-orbit simple-rescue-orbit--two" />

      <div className="absolute inset-x-6 top-6 z-10 flex items-center justify-between">
        <span className="simple-rescue-brand">
          <span className="simple-rescue-brand__dot" />
          QADRI AI
        </span>
        <span className="simple-rescue-leaf" aria-hidden="true">
          <Sprout className="size-4" />
        </span>
      </div>

      <svg
        className="simple-rescue-scene"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="simple-rescue-backdrop" cx="0" cy="0" r="1" gradientTransform="translate(202 220) rotate(90) scale(190)">
            <stop stopColor="#F9FBEF" />
            <stop offset="1" stopColor="#DDEAC5" />
          </radialGradient>
          <linearGradient id="simple-rescue-robot" x1="116" y1="312" x2="258" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#DDE9CA" />
          </linearGradient>
          <filter id="simple-rescue-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="14" stdDeviation="11" floodColor="#35530E" floodOpacity=".16" />
          </filter>
        </defs>

        <circle cx="200" cy="237" r="172" fill="url(#simple-rescue-backdrop)" />
        <path d="M45 382C111 351 147 377 200 358C254 339 298 357 355 334" stroke="#B2CC87" strokeWidth="3" strokeLinecap="round" opacity=".7" />
        <path d="M70 406C130 380 164 405 211 389C260 373 294 390 335 374" stroke="#C8DDAA" strokeWidth="3" strokeLinecap="round" opacity=".8" />
        <ellipse cx="201" cy="415" rx="110" ry="20" fill="#A7C27C" opacity=".26" />

        <g className="simple-rescue-scan">
          <path d="M112 154H143M112 154V184M288 154H257M288 154V184M112 310H143M112 310V280M288 310H257M288 310V280" stroke="#6B9A3C" strokeWidth="4" strokeLinecap="round" />
          <path className="simple-rescue-scan-line" d="M113 168H287" stroke="#7DAE49" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g className="simple-rescue-plant simple-rescue-plant--sick" filter="url(#simple-rescue-shadow)">
          <path d="M204 354C204 298 197 244 179 205" stroke="#A39B4A" strokeWidth="9" strokeLinecap="round" />
          <path d="M199 279C226 250 254 249 281 263C259 291 231 300 199 290" fill="#C5BB4D" />
          <path d="M184 250C157 226 129 228 105 246C122 271 150 280 184 266" fill="#D2C853" />
          <path d="M202 324C228 306 252 311 274 329C250 346 226 349 202 340" fill="#B1A73F" />
          <path d="M177 211C168 185 172 163 188 143C205 166 200 191 182 218" fill="#D5CB5A" />
        </g>

        <g className="simple-rescue-plant simple-rescue-plant--healthy" filter="url(#simple-rescue-shadow)">
          <path d="M204 355C204 290 208 226 220 157" stroke="#4F8A39" strokeWidth="10" strokeLinecap="round" />
          <path d="M209 282C239 240 274 234 309 250C289 284 257 300 209 293" fill="#62A642" />
          <path d="M211 248C180 211 146 205 111 225C128 261 163 279 211 263" fill="#83C34F" />
          <path d="M204 331C238 294 278 294 313 316C285 348 246 357 204 347" fill="#4D9138" />
          <path d="M197 304C166 273 132 278 101 307C130 338 164 341 200 322" fill="#72B748" />
          <path d="M220 166C207 126 220 92 247 64C270 105 258 145 229 178" fill="#9CD75B" />
          <path d="M227 157C240 129 247 99 247 64" stroke="#DDF2A6" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g className="simple-rescue-soil">
          <ellipse cx="204" cy="358" rx="65" ry="13" fill="#A8784B" />
          <path d="M157 360C175 352 190 365 204 357C220 348 237 360 253 355" stroke="#D3A06B" strokeWidth="3" strokeLinecap="round" opacity=".75" />
          <circle cx="172" cy="367" r="3" fill="#C88D59" />
          <circle cx="238" cy="366" r="3" fill="#C88D59" />
        </g>

        <g className="simple-rescue-fertilizer">
          <circle cx="193" cy="313" r="5" fill="#D69B4D" />
          <circle cx="207" cy="325" r="4" fill="#C98942" />
          <circle cx="222" cy="314" r="5" fill="#E4B460" />
          <path d="M204 301V335M190 307L176 332M218 307L235 331" stroke="#D69B4D" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" />
        </g>

        <g className="simple-rescue-robot" filter="url(#simple-rescue-shadow)">
          <rect x="101" y="376" width="174" height="28" rx="14" fill="#35530E" opacity=".18" />
          <rect x="113" y="349" width="151" height="65" rx="27" fill="url(#simple-rescue-robot)" stroke="#799A55" strokeWidth="3" />
          <rect x="137" y="312" width="104" height="63" rx="25" fill="#FBFDF5" stroke="#799A55" strokeWidth="3" />
          <rect x="151" y="329" width="76" height="23" rx="11.5" fill="#294A39" />
          <circle cx="173" cy="340.5" r="5" fill="#BDE27B" />
          <circle cx="204" cy="340.5" r="5" fill="#BDE27B" />
          <circle cx="175" cy="339" r="1.5" fill="#FFFFFF" />
          <circle cx="206" cy="339" r="1.5" fill="#FFFFFF" />
          <path d="M165 391H212" stroke="#9EB885" strokeWidth="4" strokeLinecap="round" />
          <path d="M186 312V292" stroke="#789A55" strokeWidth="4" strokeLinecap="round" />
          <circle cx="186" cy="284" r="9" fill="#D7EDB1" stroke="#789A55" strokeWidth="3" />
          <circle cx="186" cy="284" r="3" fill="#6B9A3C" />
          <path d="M122 414V426M251 414V426" stroke="#547A38" strokeWidth="8" strokeLinecap="round" />
          <circle cx="121" cy="430" r="10" fill="#35530E" />
          <circle cx="252" cy="430" r="10" fill="#35530E" />
          <path className="simple-rescue-arm" d="M243 362C272 360 278 334 272 306C270 296 277 288 288 286" stroke="#D4E1C1" strokeWidth="10" strokeLinecap="round" />
          <path d="M243 362C272 360 278 334 272 306C270 296 277 288 288 286" stroke="#789A55" strokeWidth="3" strokeLinecap="round" />
          <path d="M285 279L301 274L297 293L284 289Z" fill="#E9B968" stroke="#A56C32" strokeWidth="2" />
          <path d="M300 283L308 283" stroke="#F3D58E" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>

      <div className="simple-rescue-message simple-rescue-message--scan">
        <ScanLine className="size-4" />
        <span>{isArabic ? "أفحص النبتة" : "Scanning plant"}</span>
      </div>
      <div className="simple-rescue-message simple-rescue-message--treat">
        <Sprout className="size-4" />
        <span>{isArabic ? "أضيف ما تحتاجه" : "Adding what it needs"}</span>
      </div>
      <div className="simple-rescue-message simple-rescue-message--grow">
        <CircleCheck className="size-4" />
        <span>{isArabic ? "عادت للنمو" : "Growing again"}</span>
      </div>

      <div className="simple-rescue-caption">
        <span>{isArabic ? "من الذبول إلى الحياة" : "From wilted to alive"}</span>
        <div className="simple-rescue-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}