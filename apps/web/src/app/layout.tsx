import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PPC Demo v1 — I1',
  description: 'Pharma Project Control Demo v1 scaffold',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
