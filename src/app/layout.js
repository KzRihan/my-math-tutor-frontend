import { Urbanist, Exo_2 } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import ToastProvider from "@/components/providers/ToastProvider";

// Urbanist for body text
const urbanist = Urbanist({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-urbanist",
  display: "swap",
});

// Exo 2 for display/headings
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-exo-2",
  display: "swap",
});

export const metadata = {
  title: "MathTutor AI - Your Personal AI Mathematics Tutor",
  description: "Master mathematics with AI-powered guidance. Snap problems, get Socratic hints, and learn step-by-step from Grade 1 to College.",
  keywords: ["math tutor", "AI education", "mathematics learning", "online tutoring", "calculus", "algebra"],
  openGraph: {
    title: "MathTutor AI - Your Personal AI Mathematics Tutor",
    description: "Master mathematics with AI-powered guidance. Snap problems, get Socratic hints, and learn step-by-step.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${urbanist.variable} ${exo2.variable} antialiased`}
        suppressHydrationWarning
      >
        <ReduxProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

