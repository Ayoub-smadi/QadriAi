import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2, Mic, Paperclip, Send, Square, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

export type ChatAttachment = {
  type: "image" | "audio";
  dataUrl: string;
  mimeType: string;
  name: string;
};

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  attachments?: ChatAttachment[];
};

export type AIChatBoxProps = {
  messages: Message[];
  onSendMessage: (content: string, attachments?: ChatAttachment[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  height?: string | number;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
};

const MAX_ATTACHMENTS = 3;
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_AUDIO_BYTES = 16 * 1024 * 1024;

function AssistantLogo({ className }: { className: string }) {
  return <img src="/assets/qadri-bot-logo.png" alt="" aria-hidden="true" className={cn("object-contain", className)} />;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذر قراءة الملف."));
    reader.readAsDataURL(file);
  });
}

export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className,
  height = "600px",
  emptyStateMessage = "Start a conversation with AI",
  suggestedPrompts,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const displayMessages = messages.filter(message => message.role !== "system");

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLDivElement | null;
    if (viewport) requestAnimationFrame(() => viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" }));
  }, [messages, isLoading]);

  useEffect(() => () => {
    recordingStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const addFiles = async (files: FileList | File[]) => {
    setMediaError("");
    const available = MAX_ATTACHMENTS - attachments.length;
    if (available <= 0) {
      setMediaError("يمكنك إرفاق 3 ملفات كحد أقصى مع السؤال.");
      return;
    }
    const selected = Array.from(files).slice(0, available);
    const next: ChatAttachment[] = [];
    for (const file of selected) {
      const mediaType = file.type.toLowerCase().split(";", 1)[0];
      const isImage = mediaType.startsWith("image/");
      const isAudio = mediaType.startsWith("audio/");
      if (!isImage && !isAudio) {
        setMediaError("أرفق صورة أو تسجيلًا صوتيًا فقط.");
        continue;
      }
      if (isImage && !["image/jpeg", "image/png", "image/webp"].includes(mediaType)) {
        setMediaError("صور JPG أو PNG أو WebP فقط.");
        continue;
      }
      if (isAudio && !["audio/webm", "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/m4a"].includes(mediaType)) {
        setMediaError("تسجيلات WebM أو MP3 أو WAV أو M4A فقط.");
        continue;
      }
      const limit = isImage ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES;
      if (file.size > limit) {
        setMediaError(isImage ? "حجم الصورة يجب أن يكون أقل من 4 ميغابايت." : "حجم التسجيل يجب أن يكون أقل من 16 ميغابايت.");
        continue;
      }
      next.push({ type: isImage ? "image" : "audio", dataUrl: await readFileAsDataUrl(file), mimeType: mediaType, name: file.name });
    }
    setAttachments(previous => [...previous, ...next].slice(0, MAX_ATTACHMENTS));
  };

  const startRecording = async () => {
    setMediaError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMediaError("تسجيل الصوت غير مدعوم في هذا المتصفح. ارفع ملفًا صوتيًا بدلًا من ذلك.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        await addFiles([file]);
        stream.getTracks().forEach(track => track.stop());
        recordingStreamRef.current = null;
      };
      recordingStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      recorder.start();
    } catch {
      setMediaError("لم أستطع الوصول إلى الميكروفون. اسمح بالوصول أو ارفع تسجيلًا صوتيًا.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if ((!content && !attachments.length) || isLoading || isRecording) return;
    onSendMessage(content || "أرفقت صورة أو تسجيلًا صوتيًا. حلّل المرفق وأجبني.", attachments.length ? attachments : undefined);
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm", className)} style={{ height }}>
      <div ref={scrollAreaRef} className="min-h-0 flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 p-4 text-muted-foreground">
            <div className="flex flex-col items-center gap-3 text-center"><AssistantLogo className="size-12 opacity-30" /><p className="text-sm">{emptyStateMessage}</p><p className="max-w-md text-xs leading-5">{"اسأل بالنص، أرفق صورة، أو سجّل صوتك وسأحلّل ما ترسله."}</p></div>
            {suggestedPrompts?.length ? <div className="flex max-w-2xl flex-wrap justify-center gap-2">{suggestedPrompts.map(prompt => <button key={prompt} type="button" onClick={() => onSendMessage(prompt)} disabled={isLoading} className="rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent disabled:opacity-50">{prompt}</button>)}</div> : null}
          </div>
        ) : <ScrollArea className="h-full"><div className="flex flex-col space-y-4 p-4">{displayMessages.map((message, index) => <div key={`${message.role}-${index}`} className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
          {message.role === "assistant" && <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 p-1"><AssistantLogo className="size-full" /></div>}
          <div className={cn("max-w-[84%] rounded-2xl px-4 py-3", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
            {message.attachments?.length ? <div className="mb-2 grid gap-2">{message.attachments.map(attachment => attachment.type === "image" ? <img key={attachment.name} src={attachment.dataUrl} alt={attachment.name} className="max-h-52 max-w-full rounded-xl object-contain" /> : <audio key={attachment.name} controls src={attachment.dataUrl} className="max-w-full" />)}</div> : null}
            {message.role === "assistant" ? <div className="prose prose-sm max-w-none dark:prose-invert"><Streamdown>{message.content}</Streamdown></div> : <p className="whitespace-pre-wrap text-sm">{message.content}</p>}
          </div>
          {message.role === "user" && <div className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-secondary"><User className="size-4 text-secondary-foreground" /></div>}
        </div>)}{isLoading && <div className="flex items-start gap-3"><div className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 p-1"><AssistantLogo className="size-full" /></div><div className="rounded-2xl bg-muted px-4 py-3"><Loader2 className="size-4 animate-spin text-muted-foreground" /></div></div>}</div></ScrollArea>}
      </div>
      <form onSubmit={submit} className="border-t bg-background/50 p-3 sm:p-4">
        {attachments.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{attachments.map((attachment, index) => <div key={`${attachment.name}-${index}`} className="relative flex items-center gap-2 rounded-xl border bg-card p-1.5 text-xs"><span className="max-w-40 truncate">{attachment.type === "image" ? <ImagePlus className="me-1 inline size-3.5" /> : <Mic className="me-1 inline size-3.5" />}{attachment.name}</span><button type="button" onClick={() => setAttachments(previous => previous.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label="حذف المرفق"><X className="size-3.5" /></button></div>)}</div>}
        {mediaError && <p className="mb-2 text-xs font-medium text-destructive">{mediaError}</p>}
        <div className="flex items-end gap-2">
          <Textarea ref={undefined} value={input} onChange={event => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="min-h-10 max-h-32 flex-1 resize-none" rows={1} />
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,audio/*" multiple className="hidden" onChange={event => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} />
          <Button type="button" variant="ghost" size="icon" disabled={isLoading || isRecording || attachments.length >= MAX_ATTACHMENTS} onClick={() => fileInputRef.current?.click()} title="إرفاق صورة أو صوت"><Paperclip className="size-4" /></Button>
          <Button type="button" variant={isRecording ? "destructive" : "ghost"} size="icon" disabled={isLoading} onClick={isRecording ? stopRecording : startRecording} title={isRecording ? "إيقاف التسجيل" : "تسجيل صوت"}>{isRecording ? <Square className="size-4" /> : <Mic className="size-4" />}</Button>
          <Button type="submit" size="icon" disabled={(!input.trim() && !attachments.length) || isLoading || isRecording} className="size-10 shrink-0">{isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</Button>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">{isRecording ? "جاري التسجيل… اضغط زر الإيقاف عند الانتهاء." : "يمكنك الضغط على Enter للإرسال وShift+Enter لسطر جديد."}</p>
      </form>
    </div>
  );
}

export default AIChatBox;
