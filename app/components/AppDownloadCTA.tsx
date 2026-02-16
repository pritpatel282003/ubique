"use client";

const IOS_LINK = "https://apps.apple.com/us/app/ubique-fashion-style-advisor/id6553972786";
const ANDROID_LINK = "https://play.google.com/store/apps/details?id=com.ubique";

function CloseX() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

export default function AppDownloadCTA({ onClose }: { onClose: () => void }) {
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 9000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(6px)",
                }}
            />

            {/* Modal Card */}
            <div
                className="anim-scale"
                style={{
                    position: "relative",
                    background: "#fff",
                    borderRadius: 24,
                    padding: "36px 28px 28px",
                    maxWidth: 380,
                    width: "100%",
                    textAlign: "center",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                }}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "1px solid #e8e8e8",
                        background: "#fff",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                    }}
                >
                    <CloseX />
                </button>

                {/* UBIQUE branding */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{
                        fontFamily: "var(--font-brand)",
                        fontSize: 18,
                        fontWeight: 600,
                        letterSpacing: "0.35em",
                        textTransform: "uppercase" as const,
                        color: "#1a1a1a",
                    }}>
                        UBIQUE
                    </div>
                    <div style={{
                        fontFamily: "var(--font-brand)",
                        fontSize: 9,
                        fontWeight: 500,
                        letterSpacing: "0.45em",
                        textTransform: "uppercase" as const,
                        color: "#9a9a9a",
                    }}>
                        FASHION
                    </div>
                </div>

                {/* Heading */}
                <h2 style={{
                    fontSize: 22,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    color: "#1a1a1a",
                    margin: "0 0 10px",
                }}>
                    Save your preferences<br />and continue in the app
                </h2>

                {/* Subtitle */}
                <p style={{
                    fontSize: 14,
                    color: "#888",
                    lineHeight: 1.6,
                    margin: "0 0 24px",
                }}>
                    Get personalised styling advice anytime, keep your wardrobe history, and unlock more features.
                </p>

                {/* Download for iPhone */}
                <a
                    href={IOS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        width: "100%",
                        padding: "16px 24px",
                        borderRadius: 60,
                        background: "#1a1a1a",
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: 600,
                        textDecoration: "none",
                        marginBottom: 12,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                    }}
                >
                    <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor">
                        <path d="M15.07 12.95c-.03-2.79 2.28-4.14 2.38-4.21-1.3-1.9-3.32-2.16-4.04-2.19-1.72-.17-3.36 1.01-4.23 1.01-.87 0-2.22-.99-3.65-.96-1.88.03-3.61 1.09-4.58 2.78-1.95 3.39-.5 8.41 1.4 11.16.93 1.34 2.04 2.85 3.49 2.8 1.4-.06 1.93-.91 3.63-.91 1.69 0 2.18.91 3.66.88 1.51-.03 2.48-1.37 3.4-2.72 1.07-1.56 1.51-3.07 1.54-3.15-.03-.01-2.95-1.13-2.98-4.49zM12.25 4.6c.77-.94 1.29-2.24 1.15-3.54-1.11.05-2.45.74-3.25 1.67-.71.82-1.34 2.14-1.17 3.4 1.24.1 2.5-.63 3.27-1.53z" />
                    </svg>
                    Download for iPhone
                </a>

                {/* Download for Android */}
                <a
                    href={ANDROID_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        width: "100%",
                        padding: "16px 24px",
                        borderRadius: 60,
                        background: "#fff",
                        color: "#1a1a1a",
                        fontSize: 16,
                        fontWeight: 600,
                        textDecoration: "none",
                        marginBottom: 20,
                        border: "1.5px solid #e0e0e0",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                    }}
                >
                    <svg width="20" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M3.61 1.814L13.793 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .61-.92z" fill="#4285F4" />
                        <path d="M17.114 8.68L5.442.86 14.86 10.93 17.114 8.68z" fill="#EA4335" />
                        <path d="M20.683 10.346l-3.17-1.847L14.86 12l2.653 3.5 3.17-1.846c.89-.52.89-1.788 0-2.308z" fill="#FBBC04" />
                        <path d="M5.442 23.14l11.672-7.82L14.86 13.07 5.442 23.14z" fill="#34A853" />
                    </svg>
                    Download for Android
                </a>

                {/* Maybe later */}
                <button
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#999",
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                    }}
                >
                    Maybe later
                </button>
            </div>
        </div>
    );
}
