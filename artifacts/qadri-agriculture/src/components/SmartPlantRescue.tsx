import { Camera, MessageCircle, SunMedium } from "lucide-react";

type SmartPlantRescueProps = {
  language: "ar" | "en";
};

export function SmartPlantRescue({ language }: SmartPlantRescueProps) {
  const isArabic = language === "ar";

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="window-rescue relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-[#d9d7bd] bg-[#fbfaf2] shadow-[0_24px_60px_rgba(72,73,39,.14)]"
      role="img"
      aria-label={
        isArabic
          ? "فتاة حزينة تصور نبتة ذابلة بهاتفها، يرد عليها روبوت بأن النبتة تحتاج إضاءة خفيفة، فتفتح الشبك وتعود النبتة خضراء وكبيرة وتفرح"
          : "A sad girl photographs a wilted plant, the robot says it needs soft light, she opens the window screen, and the plant grows green while she smiles"
      }
    >
      <div className="window-rescue__label">
        <span className="window-rescue__dot" />
        {isArabic ? "حكاية نبتة" : "A PLANT STORY"}
      </div>

      <svg
        className="window-rescue__scene"
        viewBox="0 0 400 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="window-rescue-wall" x1="0" y1="0" x2="400" y2="500" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8F7E9" />
            <stop offset="1" stopColor="#E8EDD6" />
          </linearGradient>
          <linearGradient id="window-rescue-sunbeam" x1="285" y1="115" x2="160" y2="390" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF4B7" stopOpacity=".72" />
            <stop offset="1" stopColor="#FFF4B7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="window-rescue-pot" x1="184" y1="347" x2="228" y2="407" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D99B65" />
            <stop offset="1" stopColor="#B96F47" />
          </linearGradient>
          <filter id="window-rescue-shadow" x="-30%" y="-30%" width="170%" height="190%">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#53613A" floodOpacity=".2" />
          </filter>
        </defs>

        <rect width="400" height="500" fill="url(#window-rescue-wall)" />
        <path d="M0 417C78 397 130 423 203 406C274 389 332 397 400 380V500H0V417Z" fill="#E1E8CF" />
        <path d="M15 91C61 59 97 67 121 104" stroke="#D4DBC1" strokeWidth="2" strokeLinecap="round" />
        <circle cx="48" cy="113" r="5" fill="#D4DBC1" />
        <circle cx="80" cy="89" r="3" fill="#D4DBC1" />

        <g className="window-rescue__window">
          <rect x="246" y="62" width="119" height="166" rx="15" fill="#B6D8D1" stroke="#879D77" strokeWidth="5" />
          <rect x="256" y="72" width="99" height="146" rx="9" fill="#DDF1DF" />
          <path d="M305 72V218M256 145H355" stroke="#879D77" strokeWidth="5" />
          <circle cx="332" cy="98" r="12" fill="#FFF0A6" opacity=".75" />
          <path className="window-rescue__sunbeam" d="M267 210L298 93L354 93L321 231L268 301L224 301L267 210Z" fill="url(#window-rescue-sunbeam)" />
          <g className="window-rescue__screen">
            <path d="M251 59H360M251 76H360M251 93H360M251 110H360M251 127H360M251 144H360M251 161H360M251 178H360M251 195H360M251 212H360" stroke="#A8AF8F" strokeWidth="7" opacity=".8" />
            <path d="M256 61V215M274 61V215M292 61V215M310 61V215M328 61V215M346 61V215" stroke="#C3C8A6" strokeWidth="2" opacity=".8" />
          </g>
        </g>

        <g className="window-rescue__plant">
          <ellipse cx="207" cy="420" rx="57" ry="13" fill="#879B62" opacity=".25" />
          <path d="M179 356H240L231 416C230 424 224 429 216 429H202C194 429 188 424 187 416L179 356Z" fill="url(#window-rescue-pot)" stroke="#9E6446" strokeWidth="3" />
          <path d="M173 357H246V372C246 377 242 381 237 381H182C177 381 173 377 173 372V357Z" fill="#EBB177" stroke="#A76948" strokeWidth="3" />

          <g className="window-rescue__sick-plant">
            <path d="M208 359C209 326 205 294 195 265" stroke="#9C8D4D" strokeWidth="8" strokeLinecap="round" />
            <path d="M205 312C181 289 162 291 146 309C164 328 184 330 207 323" fill="#C3B64F" />
            <path d="M203 288C226 269 244 269 261 281C245 301 225 306 203 299" fill="#D0C352" />
            <path d="M194 267C185 246 188 228 201 212C215 230 211 251 198 273" fill="#D5CA5A" />
          </g>

          <g className="window-rescue__healthy-plant">
            <path d="M208 359C208 313 215 269 226 219" stroke="#4E8D45" strokeWidth="9" strokeLinecap="round" />
            <path d="M215 306C245 276 270 274 294 286C276 315 250 327 215 320" fill="#63A94A" />
            <path d="M216 282C190 249 163 245 137 260C151 294 180 308 217 297" fill="#8BCB59" />
            <path d="M209 337C239 309 269 312 292 331C269 355 239 359 209 349" fill="#4A963F" />
            <path d="M225 225C216 196 225 173 246 153C264 182 255 211 232 232" fill="#A0D968" />
            <path d="M232 220C241 201 246 177 246 153" stroke="#DEF1A7" strokeWidth="3" strokeLinecap="round" />
          </g>
        </g>

        <g className="window-rescue__girl" filter="url(#window-rescue-shadow)">
          <image href="/assets/girl-full-body-trimmed.png" x="56" y="130" width="84" height="316" preserveAspectRatio="none" />
          <g className="window-rescue__phone">
            <rect x="149" y="274" width="35" height="62" rx="7" transform="rotate(16 149 274)" fill="#2D4050" stroke="#1E2C37" strokeWidth="3" />
            <rect x="155" y="282" width="23" height="42" rx="3" transform="rotate(16 155 282)" fill="#BBD7C0" />
            <circle cx="165" cy="292" r="4" fill="#F5F1C0" />
            <circle cx="168" cy="305" r="3" fill="#6B9A3C" />
            <circle cx="172" cy="316" r="3" fill="#6B9A3C" />
          </g>
        </g>

        <g className="window-rescue__phone-bubble">
          <path d="M211 107C211 92 222 81 237 81H335C350 81 361 92 361 107V154C361 169 350 180 335 180H272L248 196V180H237C222 180 211 169 211 154V107Z" fill="#FFFFFF" stroke="#D0DAB9" strokeWidth="3" />
          <image href="/assets/agriculture-robot.png" x="221" y="92" width="49" height="49" preserveAspectRatio="xMidYMid meet" />
          <path d="M281 107H338M281 121H326" stroke="#607B52" strokeWidth="4" strokeLinecap="round" />
          <path d="M281 143H336" stroke="#8BA66A" strokeWidth="4" strokeLinecap="round" />
          <path d="M281 157H316" stroke="#8BA66A" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g className="window-rescue__reply">
          <circle cx="284" cy="194" r="17" fill="#FFFFFF" stroke="#B4CB91" strokeWidth="3" />
          <path d="M276 194L281 199L292 187" stroke="#6E9D45" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>

      <div className="window-rescue__stage window-rescue__stage--sad">
        <span>{isArabic ? "ليش ذبلت؟" : "Why is it wilted?"}</span>
        <Camera className="size-4" />
      </div>
      <div className="window-rescue__stage window-rescue__stage--reply">
        <MessageCircle className="size-4" />
        <span>{isArabic ? "النبتة بحاجة لإضاءة خفيفة" : "It needs soft light"}</span>
      </div>
      <div className="window-rescue__stage window-rescue__stage--window">
        <SunMedium className="size-4" />
        <span>{isArabic ? "حاضر، بفتح الشبك" : "Opening the screen"}</span>
      </div>
      <div className="window-rescue__stage window-rescue__stage--happy">
        <span>{isArabic ? "رجعت أفضل" : "It is better now"}</span>
        <span className="window-rescue__heart" aria-hidden="true">♥</span>
      </div>

      <div className="window-rescue__caption">
        <span>{isArabic ? "نصيحة صغيرة صنعت فرقاً كبيراً" : "A small tip made a big difference"}</span>
        <span className="window-rescue__progress" />
      </div>
    </div>
  );
}