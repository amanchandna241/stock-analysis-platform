import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata = {
  title: 'Apex Equity Research | Production AI Stock & Mutual Funds Platform',
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
        <footer className="border-t border-[#1E2638] bg-[#0B0E14] py-6 text-center text-xs text-gray-500">
          <p>© 2026 Apex Equity Research Engine. Grounded Financial Intelligence for NSE/BSE, AMFI & Global Markets.</p>
        </footer>
      </body>
    </html>
  );
}
