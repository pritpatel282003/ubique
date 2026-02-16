"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import AppDownloadCTA from "./components/AppDownloadCTA";

/* ─── Icons ───────────────────────────────────────────── */

function UploadIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
    </svg>
  );
}

function FlipCameraIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
      <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
      <polyline points="16 3 19 6 16 9" />
      <polyline points="8 21 5 18 8 15" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

/* ─── Chat Types ──────────────────────────────────────── */

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const QUICK_QUESTIONS = [
  "Does this suit me?",
  "What should I change?",
  "Rate this outfit 1-10",
  "What shoes would go with this?",
];

const FIRST_PROMO_AFTER = 1;   // show modal after 1st exchange
const REPROMO_AFTER = 3;       // reshow 3 exchanges after dismiss
const MAX_FREE_EXCHANGES = 3;  // disable chat after this many

/* ─── Camera Modal ────────────────────────────────────── */

function CameraModal({
  onCapture,
  onClose,
}: {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (facing: "user" | "environment") => {
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setIsReady(false);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch {
      setError("Unable to access camera. Please allow camera permissions and try again.");
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFlip = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror the image if using front camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    // Stop stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    onCapture(dataUrl);
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Hidden canvas for snapshot */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {error ? (
        <div style={{ color: "#fff", textAlign: "center", padding: "2rem" }}>
          <p style={{ marginBottom: "1.5rem", fontSize: "15px", lineHeight: 1.6 }}>{error}</p>
          <button
            onClick={handleClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              padding: "12px 28px",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            Go back
          </button>
        </div>
      ) : (
        <>
          {/* Video feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: facingMode === "user" ? "scaleX(-1)" : "none",
            }}
          />

          {/* Loading overlay */}
          {!isReady && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.7)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid rgba(255,255,255,0.2)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Top bar — close button */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: "env(safe-area-inset-top, 12px) 16px 12px 16px",
              display: "flex",
              justifyContent: "flex-start",
              background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
            }}
          >
            <button
              onClick={handleClose}
              aria-label="Close camera"
              style={{
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)",
                border: "none",
                borderRadius: "50%",
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
                marginTop: 8,
              }}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Bottom controls */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: "max(env(safe-area-inset-bottom, 20px), 20px)",
              paddingTop: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "36px",
              background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
            }}
          >
            {/* Flip camera */}
            <button
              onClick={handleFlip}
              aria-label="Switch camera"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "50%",
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#fff",
              }}
            >
              <FlipCameraIcon />
            </button>

            {/* Shutter button */}
            <button
              onClick={handleCapture}
              disabled={!isReady}
              aria-label="Take photo"
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: "4px solid #fff",
                background: isReady ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                cursor: isReady ? "pointer" : "default",
                position: "relative",
                transition: "transform 0.15s ease",
              }}
              onPointerDown={(e) => {
                if (isReady) (e.currentTarget.style.transform = "scale(0.9)");
              }}
              onPointerUp={(e) => {
                (e.currentTarget.style.transform = "scale(1)");
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 6,
                  borderRadius: "50%",
                  background: "#fff",
                  opacity: isReady ? 1 : 0.3,
                  transition: "opacity 0.2s",
                }}
              />
            </button>

            {/* Spacer to balance layout */}
            <div style={{ width: 50, height: 50 }} />
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [showPromo, setShowPromo] = useState(false);
  const [dismissedAtCount, setDismissedAtCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleDismissPromo = useCallback(() => {
    setShowPromo(false);
    setDismissedAtCount(exchangeCount);
  }, [exchangeCount]);

  const chatDisabled = exchangeCount >= MAX_FREE_EXCHANGES;

  const askQuestion = useCallback(async (q: string) => {
    if (!uploadedFile || !q.trim() || isAsking || chatDisabled) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: q.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAsking(true);
    setQuestion("");

    // Build history from existing messages
    const history = messages
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadedFile,
          question: q.trim(),
          history: history.length > 0 ? history : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Something went wrong" }));
        const errMsg: ChatMessage = {
          id: Date.now().toString() + "_err",
          role: "assistant",
          content: err.error || "The fashion gods are unavailable. Try again! 😅",
        };
        setMessages((prev) => [...prev, errMsg]);
      } else {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: Date.now().toString() + "_ai",
          role: "assistant",
          content: data.reply,
        };
        setMessages((prev) => [...prev, aiMsg]);

        const newCount = exchangeCount + 1;
        setExchangeCount(newCount);

        // Show app download modal at the right times
        if (newCount === FIRST_PROMO_AFTER || (dismissedAtCount !== null && newCount >= dismissedAtCount + REPROMO_AFTER)) {
          setTimeout(() => setShowPromo(true), 600);
        }
      }
    } catch {
      const errMsg: ChatMessage = {
        id: Date.now().toString() + "_err",
        role: "assistant",
        content: "Network error — even the WiFi doesn't want to cooperate. 💀",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsAsking(false);
    }
  }, [uploadedFile, isAsking, messages, exchangeCount, dismissedAtCount, chatDisabled]);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith("image/")) {
      console.log("📸 File info:", { name: file.name, size: file.size, type: file.type });
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        console.log("📸 Base64 data URL:", base64Data);
        setUploadedFile(base64Data);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleCameraClick = () => {
    if (navigator.mediaDevices && "getUserMedia" in navigator.mediaDevices) {
      setShowCamera(true);
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    console.log("📸 Camera capture Base64 data URL:", dataUrl);
    setShowCamera(false);
    setUploadedFile(dataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <main className="min-h-dvh flex flex-col items-center px-5 pb-16 bg-[var(--clr-bg)] font-[var(--font-body)]">

      {/* ── Camera Modal ──────────────────────── */}
      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* ── App Download Modal ─────────────────── */}
      {showPromo && <AppDownloadCTA onClose={handleDismissPromo} />}

      {/* ── Brand Header ──────────────────────────────── */}
      <header className="text-center mt-[clamp(40px,8vh,80px)] mb-3 anim-fade-up">
        <div className="font-[var(--font-brand)] text-[clamp(20px,3vw,26px)] font-semibold tracking-[0.38em] uppercase text-[var(--clr-text)]">
          UBIQUE
        </div>
        <div className="font-[var(--font-brand)] text-[10px] font-medium tracking-[0.45em] uppercase text-[var(--clr-text-tri)]">
          FASHION
        </div>
      </header>

      {/* ── Hero Text ─────────────────────────────────── */}
      <section className="text-center max-w-[480px] mb-9 anim-fade-up [animation-delay:0.1s]">
        <h1 className="text-[30px] font-semibold leading-tight text-[var(--clr-text)] mb-4 tracking-tight">
          Style advice that actually helps
        </h1>
        <p className="text-[clamp(15px,2vw,17px)] text-[var(--clr-text-sec)] leading-relaxed w-full mx-auto">
          Upload an outfit photo and I&apos;ll tell you exactly what to change
          — like the honest friend you bring to the fitting room.
        </p>
      </section>

      {/* ── Upload Card ───────────────────────────────── */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          w-full max-w-[460px] bg-[var(--clr-surface)] rounded-[20px] card-upload
          px-[clamp(24px,4vw,36px)] py-[clamp(28px,4vw,40px)]
          mb-10 
          
          ${isDragging ? "dragging" : ""}
        `}
      >
        {/* Top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-[3px] card-accent-bar opacity-40" />

        {uploadedFile ? (
          /* ── Preview + Chat State ─── */
          <div>
            <div className="rounded-[14px] overflow-hidden mb-5 max-h-60">
              <img
                src={uploadedFile}
                alt="Uploaded outfit"
                className="w-full h-auto max-h-60 object-contain block"
              />
            </div>

            {/* Chat Messages Thread */}
            {messages.length > 0 && (
              <div
                className="mb-4 overflow-y-auto"
                style={{
                  maxHeight: 320,
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0,0,0,0.1) transparent",
                }}
              >
                <div className="flex flex-col gap-3">
                  {messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isUser ? "justify-end" : "justify-start"} anim-fade-up`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser
                            ? "bg-[#8410CA] text-white rounded-br-md"
                            : "bg-[var(--clr-bg)] text-[var(--clr-text)] border border-[var(--clr-border)] rounded-bl-md"
                            }`}
                        >
                          {!isUser && (
                            <span className="text-xs font-semibold text-[var(--clr-accent)] block mb-1">
                              Ubique AI
                            </span>
                          )}
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {isAsking && (
                    <div className="flex justify-start anim-fade">
                      <div className="bg-[var(--clr-bg)] border border-[var(--clr-border)] rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1.5 items-center">
                          <div className="w-2 h-2 rounded-full bg-[var(--clr-text-tri)]" style={{ animation: "pulse 1.2s ease infinite" }} />
                          <div className="w-2 h-2 rounded-full bg-[var(--clr-text-tri)]" style={{ animation: "pulse 1.2s ease 0.2s infinite" }} />
                          <div className="w-2 h-2 rounded-full bg-[var(--clr-text-tri)]" style={{ animation: "pulse 1.2s ease 0.4s infinite" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </div>
            )}

            {/* Quick question chips (show only when no messages yet and chat not disabled) */}
            {messages.length === 0 && !chatDisabled && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => askQuestion(q)}
                    disabled={isAsking}
                    className="text-[12px] px-3 py-1.5 rounded-full border border-[var(--clr-border)] text-[var(--clr-text-sec)] bg-transparent cursor-pointer font-[var(--font-body)] hover:border-[var(--clr-accent)] hover:text-[var(--clr-accent)] hover:bg-[var(--clr-accent-light)] transition-all duration-150 disabled:opacity-50 disabled:cursor-default"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Chat input OR disabled CTA */}
            {chatDisabled ? (
              <div className="text-center py-3 px-4 rounded-2xl mb-4 anim-fade-up" style={{ background: "rgba(132,16,202,0.06)", border: "1px solid rgba(132,16,202,0.15)" }}>
                <p className="text-sm font-semibold text-[var(--clr-text)] mb-1">
                  You&apos;ve used your free styling advice!
                </p>
                <p className="text-xs text-[var(--clr-text-sec)] mb-3">
                  Download the app for unlimited fashion chats.
                </p>
                <button
                  onClick={() => setShowPromo(true)}
                  className="px-5 py-2 rounded-full bg-[#8410CA] text-white text-sm font-semibold border-none cursor-pointer hover:bg-[#6d00cc] transition-colors"
                >
                  Get the App
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      askQuestion(question);
                    }
                  }}
                  placeholder={messages.length === 0 ? "Ask about your outfit..." : "Ask a follow-up..."}
                  disabled={isAsking}
                  className="flex-1 px-4 py-3 rounded-full border border-[var(--clr-border)] bg-[var(--clr-bg)] text-[var(--clr-text)] text-sm font-[var(--font-body)] outline-none placeholder:text-[var(--clr-text-tri)] focus:border-[var(--clr-accent)] transition-colors disabled:opacity-50"
                  id="chat-input"
                />
                <button
                  onClick={() => askQuestion(question)}
                  disabled={isAsking || !question.trim()}
                  className="w-11 h-11 rounded-full bg-[#8410CA] text-white border-none cursor-pointer flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:bg-[#6d00cc] disabled:opacity-40 disabled:cursor-default"
                  aria-label="Send question"
                  id="send-btn"
                >
                  {isAsking ? (
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => { setUploadedFile(null); setQuestion(""); setMessages([]); setExchangeCount(0); }}
              className="text-[13px] text-[var(--clr-accent)] bg-transparent border-none cursor-pointer font-medium underline underline-offset-[3px] block mx-auto"
            >
              Upload a different photo
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-[clamp(18px,2.5vw,22px)] font-semibold text-center mb-1.5 text-[var(--clr-text)]">
              Try it on your outfit
            </h2>
            <p className="text-sm text-[var(--clr-text-sec)] text-center mb-[clamp(20px,3vw,28px)]">
              Mirror selfie, shopping screenshot, or a look you like.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />

            {/* Hidden camera input (fallback for mobile) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
              id="camera-capture"
            />

            {/* Upload photo */}
            <button
              id="upload-photo-btn"
              onClick={handleUploadClick}
              className="bg-[#8410CA] w-full flex items-center justify-center gap-2.5 py-[15px] px-6 text-base font-semibold text-white border-none rounded-full cursor-pointer mb-3 font-[var(--font-body)] tracking-[0.01em]"
            >
              <UploadIcon />
              Upload photo
            </button>

            {/* Take photo */}
            <button
              id="take-photo-btn"
              onClick={handleCameraClick}
              className="btn-outline w-full flex items-center justify-center gap-2.5 py-3.5 px-6 text-[15px] font-medium text-[var(--clr-text)] bg-transparent border-[1.5px] border-[var(--clr-border)] rounded-full cursor-pointer mb-5 font-[var(--font-body)]"
            >
              <CameraIcon />
              Take photo
            </button>

            {/* Privacy */}
            <p className="flex items-center justify-center gap-1.5 text-[13px] text-[var(--clr-text-tri)] text-center">
              <LockIcon />
              Private — only used to give you advice.
            </p>
          </>
        )}
      </div>

      {/* ── Feature Bullets ───────────────────────────── */}
      <section className="max-w-[460px] w-full mb-10 anim-fade-up [animation-delay:0.4s]">
        <ul className="list-disc pl-5 flex flex-col gap-2.5 marker:text-[var(--clr-text-tri)]">
          {[
            "What\u2019s working (and what isn\u2019t)",
            "What to swap instead",
            "How to make it feel more you",
          ].map((text, i) => (
            <li
              key={i}
              className="text-[15px] text-[var(--clr-text)]"
            >
              <span className=" text-[13px] text-[var(--clr-text-tri)] text-center">{text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Social Proof ──────────────────────────────── */}
      <p className="text-sm text-[var(--clr-text-tri)] text-center italic max-w-[480px] leading-relaxed anim-fade [animation-delay:0.7s]">
        People usually upload just to test it. They end up screenshotting the
        advice.
      </p>
    </main>
  );
}
