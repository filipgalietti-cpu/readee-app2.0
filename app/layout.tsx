import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ProfileProvider } from "@/ProfileContext";
import { OnboardingGuard } from "@/OnboardingGuard";
import { DynamicBackground } from "./components/DynamicBackground";

export const metadata: Metadata = {
  title: "Readee",
  description: "Your reading companion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ProfileProvider>
          <DynamicBackground />
          <OnboardingGuard>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </OnboardingGuard>
        </ProfileProvider>
      </body>
    </html>
  );
}
