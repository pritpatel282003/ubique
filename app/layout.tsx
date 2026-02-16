import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ubique Fashion — Style Advice That Actually Helps",
  description:
    "Upload an outfit photo and get honest, actionable style advice. Like the honest friend you bring to the fitting room.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
