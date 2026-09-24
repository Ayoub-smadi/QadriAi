import { LiveAvatarSession, SessionEvent, AgentEventsEnum } from "@heygen/liveavatar-web-sdk";
import { Loader2, Video } from "lucide-react";
import { useEffect, useRef, useState, type MutableRefObject } from "react";

type Props = { sessionRef: MutableRefObject<LiveAvatarSession | null>; onTranscript: (text: string) => void };

export function LiveAvatarPanel({ sessionRef, onTranscript }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("جاري تشغيل الأفاتار...");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let session: LiveAvatarSession | null = null;
    const start = async () => {
      try {
        const response = await fetch("/api/trpc/liveavatar.session?format=rest&operation=liveavatar.session", { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ json: {} }) });
        const payload = await response.json().catch(() => null);
        const data = payload?.user || payload?.[0]?.result?.data?.json || payload;
        if (!response.ok || data?.error || !data?.session_token) throw new Error(data?.error || data?.message || "تعذر بدء جلسة الأفاتار.");
        session = new LiveAvatarSession(data.session_token, { autoKeepAlive: true, voiceChat: { defaultMuted: true } });
        sessionRef.current = session;
        session.on(SessionEvent.SESSION_STATE_CHANGED, state => { if (active) setStatus(state === "CONNECTED" ? "متصل" : "جاري الاتصال..."); });
        session.on(SessionEvent.SESSION_STREAM_READY, () => { if (videoRef.current) session?.attach(videoRef.current); if (active) setStatus("متصل"); });
        session.on(AgentEventsEnum.AVATAR_TRANSCRIPTION, event => { if (active && event.text?.trim()) onTranscript(event.text.trim()); });
        await session.start();
      } catch (reason) { if (active) { setStatus("غير متصل"); setError(reason instanceof Error ? reason.message : "تعذر تشغيل الأفاتار."); } }
    };
    void start();
    return () => { active = false; sessionRef.current = null; void session?.stop().catch(() => undefined); };
  }, [onTranscript, sessionRef]);

  return <div className="flex w-[170px] shrink-0 flex-col items-center justify-center gap-2 rounded-xl bg-[#eef7f2] p-2" dir="rtl"><div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#dcece3] shadow-inner"><video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />{!error && <div className="absolute bottom-2 start-2 rounded-full bg-black/55 px-2 py-1 text-[10px] text-white"><span className="me-1 inline-block size-1.5 rounded-full bg-emerald-300" />{status}</div>}{!error && status !== "متصل" && <div className="absolute inset-0 grid place-items-center"><Loader2 className="size-6 animate-spin text-[#174d3b]" /></div>}{error && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2 text-center text-[11px] text-red-700"><Video className="size-5" />{error}</div>}</div><span className="text-center text-[11px] font-bold text-[#174d3b]">المساعد الافتراضي</span></div>;
}

export default LiveAvatarPanel;
