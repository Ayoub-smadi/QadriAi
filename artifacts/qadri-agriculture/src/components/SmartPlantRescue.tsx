type SmartPlantRescueProps = {
  language: "ar" | "en";
};

export function SmartPlantRescue({ language }: SmartPlantRescueProps) {
  const isArabic = language === "ar";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="smart-plant-rescue relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[#b5c795]/25 bg-[#152319] shadow-[0_28px_70px_rgba(24,43,21,.25)]"
      role="img"
      aria-label={
        isArabic
          ? "روبوت ميداني ذكي يمسح نبتة ذابلة ويشخّصها ثم يضيف السماد فتستعيد نموها — A field scout scans a wilted plant, diagnoses it, and applies fertilizer so it grows green"
          : "A field scout scans a wilted plant, diagnoses it, and applies fertilizer so it grows green — روبوت ميداني ذكي يمسح نبتة ذابلة ويشخّصها ثم يضيف السماد فتستعيد نموها"
      }
    >
      <div className="rescue-glow rescue-glow--top" aria-hidden="true" />
      <div className="rescue-glow rescue-glow--bottom" aria-hidden="true" />
      <div className="rescue-grid" aria-hidden="true" />

      <div className="rescue-topbar">
        <span className="rescue-kicker">
          <span className="rescue-kicker__dot" />
          {isArabic ? "كشاف الحقل" : "FIELD SCOUT"}
        </span>
        <span className="rescue-live">
          <span className="rescue-live__pulse" />
          {isArabic ? "دورة مباشرة" : "LIVE LOOP"}
        </span>
      </div>

      <div className="rescue-sequence" aria-hidden="true">
        <div className="rescue-sequence__line" />
        <span className="rescue-step rescue-step--scan">
          <b>01</b>
          <span>{isArabic ? "امسح" : "SCAN"}</span>
        </span>
        <span className="rescue-step rescue-step--treat">
          <b>02</b>
          <span>{isArabic ? "عالج" : "TREAT"}</span>
        </span>
        <span className="rescue-step rescue-step--grow">
          <b>03</b>
          <span>{isArabic ? "أنمِ" : "GROW"}</span>
        </span>
      </div>

      <svg
        className="rescue-scene"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rescue-sky" x1="46" y1="24" x2="330" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#314B32" />
            <stop offset=".58" stopColor="#203A2A" />
            <stop offset="1" stopColor="#172A20" />
           </linearGradient>
          <linearGradient id="rescue-ground" x1="205" y1="296" x2="205" y2="468" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6C8246" />
            <stop offset=".38" stopColor="#4C6538" />
            <stop offset="1" stopColor="#263E2A" />
          </linearGradient>
          <linearGradient id="rescue-rover" x1="62" y1="337" x2="165" y2="414" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E9E6D2" />
            <stop offset=".52" stopColor="#C9D0AF" />
            <stop offset="1" stopColor="#889A6C" />
          </linearGradient>
          <linearGradient id="rescue-visor" x1="73" y1="325" x2="142" y2="352" gradientUnits="userSpaceOnUse">
            <stop stopColor="#172C29" />
            <stop offset=".52" stopColor="#2E5D50" />
            <stop offset="1" stopColor="#79B27B" />
          </linearGradient>
          <radialGradient id="rescue-sun" cx="0" cy="0" r="1" gradientTransform="translate(292 92) rotate(118) scale(88)">
            <stop stopColor="#DCE6A4" stopOpacity=".9" />
            <stop offset="1" stopColor="#DCE6A4" stopOpacity="0" />
          </radialGradient>
          <filter id="rescue-shadow" x="-30%" y="-30%" width="170%" height="190%">
            <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#102218" floodOpacity=".38" />
          </filter>
          <filter id="rescue-soft-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#102218" floodOpacity=".26" />
          </filter>
        </defs>

        <rect x="15" y="16" width="370" height="468" rx="36" fill="url(#rescue-sky)" />
        <circle cx="292" cy="94" r="92" fill="url(#rescue-sun)" />
        <path d="M15 282C78 256 122 286 172 274C228 261 284 231 385 246V484H15V282Z" fill="url(#rescue-ground)" />
        <path d="M15 336C83 305 127 342 185 320C255 294 307 311 385 282V484H15V336Z" fill="#314B31" opacity=".74" />
        <path d="M15 390C86 365 126 392 193 368C259 345 313 367 385 335V484H15V390Z" fill="#1F3628" opacity=".84" />
        <path d="M38 282H362M54 310H346M28 438H372" stroke="#A3B67B" strokeOpacity=".14" strokeDasharray="2 11" />
        <path d="M48 58H103M297 58H352M48 58V90M352 58V90M48 213V245M352 213V245" stroke="#C6D7A0" strokeOpacity=".4" strokeWidth="1.5" />

        <g className="rescue-scan-zone">
          <rect x="90" y="91" width="222" height="203" rx="22" fill="#B5D68A" fillOpacity=".05" stroke="#C8E597" strokeOpacity=".38" strokeDasharray="5 8" />
          <path d="M93 188H309" stroke="#D8F2A5" strokeOpacity=".72" strokeWidth="2" strokeDasharray="6 9" />
          <path d="M108 112H137M108 112V139M292 112H263M292 112V139M108 275H137M108 275V248M292 275H263M292 275V248" stroke="#D8F2A5" strokeWidth="3" strokeLinecap="round" />
          <path className="rescue-scan-sweep" d="M95 112H307" stroke="#DAF3A7" strokeWidth="5" strokeLinecap="round" />
          <circle className="rescue-scan-ring" cx="205" cy="210" r="52" stroke="#C5E47E" strokeWidth="2" strokeDasharray="4 7" />
        </g>

        <g className="rescue-plant rescue-plant--sick" filter="url(#rescue-soft-shadow)">
          <path d="M205 353C205 305 196 255 177 216" stroke="#9C943A" strokeWidth="9" strokeLinecap="round" />
          <path d="M204 295C228 267 255 260 283 270C261 300 233 310 204 303" fill="#BDB743" />
          <path d="M183 256C155 232 127 231 103 247C121 273 149 282 183 270" fill="#D0C94F" />
          <path d="M202 333C228 313 253 315 276 331C251 351 226 355 202 345" fill="#AFA739" />
          <path d="M173 304C150 289 126 294 106 313C130 330 153 330 176 317" fill="#C5BE46" />
          <path d="M175 215C167 187 171 163 188 143C205 167 201 193 182 222" fill="#D6CC58" />
        </g>

        <g className="rescue-plant rescue-plant--healthy" filter="url(#rescue-soft-shadow)">
          <path d="M205 355C205 286 207 226 220 159" stroke="#60933D" strokeWidth="10" strokeLinecap="round" />
          <path d="M209 283C240 239 276 233 313 250C292 286 258 303 209 295" fill="#65A843" />
          <path d="M211 249C180 211 145 202 110 221C126 260 163 278 211 263" fill="#86C552" />
          <path d="M205 331C240 292 281 292 318 316C288 350 247 359 205 347" fill="#4E913D" />
          <path d="M196 305C164 272 130 276 98 304C128 338 164 341 199 322" fill="#73B747" />
          <path d="M220 169C206 127 220 91 247 62C271 104 258 146 229 180" fill="#A1D95C" />
          <path d="M226 159C240 131 248 101 247 62" stroke="#D9F0A1" strokeWidth="4" strokeLinecap="round" opacity=".82" />
        </g>

        <g className="rescue-soil" aria-hidden="true">
          <ellipse cx="204" cy="367" rx="81" ry="17" fill="#13261C" fillOpacity=".64" />
          <ellipse cx="204" cy="358" rx="67" ry="13" fill="#A77A48" />
          <path d="M149 361C170 351 188 366 204 357C221 348 241 359 260 355" stroke="#D2A36B" strokeOpacity=".65" strokeWidth="3" strokeLinecap="round" />
          <circle cx="163" cy="370" r="3" fill="#D6A36A" />
          <circle cx="242" cy="369" r="3" fill="#C38A50" />
        </g>

        <g className="rescue-fertilizer-burst">
          <path d="M197 300C188 315 180 326 170 337M201 300C201 317 203 328 204 340M205 300C216 314 226 324 239 335" stroke="#E7BE69" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 10" />
          <circle cx="194" cy="309" r="5" fill="#F0CC78" />
          <circle cx="218" cy="318" r="4" fill="#DDA957" />
          <circle cx="181" cy="326" r="3" fill="#F0CC78" />
        </g>

        <g className="rescue-rover" filter="url(#rescue-shadow)">
          <path d="M42 425H199" stroke="#0D2018" strokeOpacity=".55" strokeWidth="11" strokeLinecap="round" />
          <rect x="46" y="382" width="142" height="51" rx="23" fill="#182C24" stroke="#789060" strokeWidth="3" />
          <circle cx="74" cy="408" r="20" fill="#203A2E" stroke="#B1C28C" strokeWidth="4" />
          <circle cx="124" cy="408" r="20" fill="#203A2E" stroke="#B1C28C" strokeWidth="4" />
          <circle cx="174" cy="408" r="20" fill="#203A2E" stroke="#B1C28C" strokeWidth="4" />
          <path d="M59 398L90 418M109 398L140 418M159 398L190 418" stroke="#6A835D" strokeWidth="4" strokeLinecap="round" />
          <circle cx="74" cy="408" r="6" fill="#D6E28D" />
          <circle cx="124" cy="408" r="6" fill="#D6E28D" />
          <circle cx="174" cy="408" r="6" fill="#D6E28D" />

          <rect x="55" y="324" width="139" height="84" rx="25" fill="url(#rescue-rover)" stroke="#B6C49A" strokeWidth="3" />
          <path d="M69 369H181" stroke="#7D9366" strokeWidth="2" strokeOpacity=".6" />
          <rect x="68" y="331" width="105" height="31" rx="15.5" fill="url(#rescue-visor)" stroke="#A9D090" strokeWidth="3" />
          <path d="M80 347H157" stroke="#C4F1A1" strokeWidth="2" strokeDasharray="2 7" opacity=".75" />
          <circle cx="89" cy="347" r="4" fill="#DDF5B0" />
          <circle cx="158" cy="347" r="4" fill="#DDF5B0" />
          <path d="M94 386H145" stroke="#506C4F" strokeWidth="4" strokeLinecap="round" />
          <circle cx="156" cy="386" r="7" fill="#E4B968" />
          <path d="M156 382V390M152 386H160" stroke="#513D28" strokeWidth="1.5" strokeLinecap="round" />

          <path d="M105 324V306" stroke="#9FB989" strokeWidth="4" strokeLinecap="round" />
          <circle cx="105" cy="299" r="9" fill="#D3E59B" stroke="#789A63" strokeWidth="3" />
          <circle cx="102" cy="296" r="2.5" fill="#355C45" />

          <path className="rescue-treatment-arm" d="M181 350C204 349 198 326 205 307C209 295 218 289 228 288" stroke="#D0D6B9" strokeWidth="10" strokeLinecap="round" />
          <path d="M181 350C204 349 198 326 205 307C209 295 218 289 228 288" stroke="#768B63" strokeWidth="3" strokeLinecap="round" />
          <circle cx="204" cy="307" r="8" fill="#E0E5C9" stroke="#71895E" strokeWidth="3" />
          <path d="M226 287L239 280L239 294L226 289Z" fill="#E9C66F" stroke="#AF7D3E" strokeWidth="2" />
          <path d="M239 286L247 286" stroke="#F3D894" strokeWidth="3" strokeLinecap="round" />
        </g>

        <g className="rescue-diagnosis-callout" filter="url(#rescue-soft-shadow)">
          <path d="M274 179H341C350 179 357 186 357 195V225C357 234 350 241 341 241H302L286 253V241H274C265 241 258 234 258 225V195C258 186 265 179 274 179Z" fill="#EDF1D8" />
          <circle cx="279" cy="205" r="7" fill="#C2A15B" />
          <path d="M277 205L279 207L283 202" stroke="#263C2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M294 198H339M294 208H331M294 218H319" stroke="#607850" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>

      <div className="rescue-status rescue-status--scan">
        <span className="rescue-status__number">01</span>
        <span>
          <strong>{isArabic ? "جاري المسح" : "Scanning"}</strong>
          <em>{isArabic ? "رطوبة منخفضة" : "Low moisture"}</em>
        </span>
      </div>
      <div className="rescue-status rescue-status--fertilizer">
        <span className="rescue-status__number">02</span>
        <span>
          <strong>{isArabic ? "وصفة السماد جاهزة" : "Treatment ready"}</strong>
          <em>{isArabic ? "مغذيات متوازنة" : "Balanced nutrients"}</em>
        </span>
      </div>
      <div className="rescue-status rescue-status--growth">
        <span className="rescue-status__number">03</span>
        <span>
          <strong>{isArabic ? "نمو أخضر جديد" : "New green growth"}</strong>
          <em>{isArabic ? "النبات يستعيد عافيته" : "Plant is recovering"}</em>
        </span>
      </div>

      <div className="rescue-footer">
        <div className="rescue-footer__copy">
          <span className="rescue-footer__eyebrow">{isArabic ? "بروتوكول الإنقاذ" : "RESCUE PROTOCOL"}</span>
          <strong>{isArabic ? "من الذبول إلى الاخضرار" : "Wilted to thriving"}</strong>
        </div>
        <span className="rescue-footer__ai">
          <span className="rescue-footer__ai-dot" />
          AI
          </span>
        <div className="rescue-progress-track">
          <span className="rescue-progress" />
        </div>
      </div>
    </div>
  );
}