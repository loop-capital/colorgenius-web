import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ColorGenius',
  description: 'AI-powered hair color formulation for beauty professionals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}