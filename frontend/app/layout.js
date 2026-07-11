import { LanguageProvider } from "@/components/common/LanguageContext";
import "./globals.css";

export const metadata = {
  title: "Nivara | NGO Verification & Funding Platform",
  description: "Nivara connects verified NGOs with corporate CSR, foundations, and government grants through AI agent workflows.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LanguageProvider>
          <div id="nivara-root">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
