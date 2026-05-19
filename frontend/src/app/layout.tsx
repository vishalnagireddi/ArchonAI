import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "ArchonAI | AI System Design Generator",
  description: "Generate comprehensive, production-grade system architectures, API designs, data models, and Mermaid.js topology diagrams dynamically using AI.",
  keywords: ["system design", "software engineer", "interview prep", "architecture", "mermaid diagrams", "fastapi", "nextjs"],
  authors: [{ name: "ArchonAI team" }]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased h-screen w-screen overflow-hidden flex bg-[#0d0d0c]">
        {/* Left Navigation Sidebar */}
        <Sidebar />
        
        {/* Main Content Area (right side, scrolls independently) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="max-w-5xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

