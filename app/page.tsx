"use client";

import { useState, useRef, useCallback } from "react";

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

/* ─── Main Page ───────────────────────────────────────── */

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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
  const handleCameraClick = () => cameraInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <main className="min-h-dvh flex flex-col items-center px-5 pb-16 bg-[var(--clr-bg)] font-[var(--font-body)]">

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
          /* ── Preview State ─── */
          <div className="text-center">
            <div className="rounded-[14px] overflow-hidden mb-5 max-h-80">
              <img
                src={uploadedFile}
                alt="Uploaded outfit"
                className="w-full h-auto max-h-80 object-contain block"
              />
            </div>
            <p className="text-sm text-[var(--clr-text-sec)] mb-4">
              Looking good! Ready for style advice?
            </p>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-[13px] text-[var(--clr-accent)] bg-transparent border-none cursor-pointer font-medium underline underline-offset-[3px]"
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

            {/* Hidden camera input */}
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
