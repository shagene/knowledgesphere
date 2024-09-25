import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import "@/app/globals.css";
import { QuizStoreInitializer } from "@/components/quiz-store-initializer";
import { Footer } from "@/components/footer";
import ReactQueryProvider from "@/components/ReactQueryProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "KnowledgeSphere",
  description: "Created by Steven Hagene",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <QuizStoreInitializer />
          <Navigation />
          {children}
          <Footer />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
