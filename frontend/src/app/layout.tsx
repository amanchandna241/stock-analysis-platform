import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Alphiq | GenAI Stock Research & Mutual Funds Analytics Platform',
  description: 'Professional equity research and mutual fund analytics platform focusing on Indian Equities (NSE/BSE), Indian Mutual Funds (AMFI), and US Markets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0E14] text-gray-100 min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-[#1E2638] bg-[#0B0E14] py-8 text-center text-xs text-gray-400 space-y-2 px-4">
          <p className="max-w-5xl mx-auto leading-relaxed text-gray-500 text-[11px]">
            <strong className="text-gray-400">Statutory Regulatory Disclaimer:</strong> Alphiq is an AI-powered quantitative financial analytics and research tool intended solely for <strong>educational and informational purposes</strong>. Alphiq is <strong>not</strong> a SEBI-registered Investment Adviser (RIA) or Research Analyst (RA), nor is it regulated by SEBI/RBI to provide personalized financial or investment advice. Market data, ML forecasts, and AI recommendations do not constitute financial solicitations or buy/sell recommendations. Investments in securities are subject to market risks. Always consult a certified SEBI-registered financial advisor before making investment decisions.
          </p>
          <p className="text-gray-500 font-semibold pt-2">© 2026 Alphiq AI Research Engine. Grounded Financial Intelligence for NSE/BSE, AMFI & Global Markets.</p>
        </footer>
      </body>
    </html>
  );
}
