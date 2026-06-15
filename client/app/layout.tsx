import './globals.css';
import { GeistSans } from 'geist/font/sans';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Corsair Hackathon',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable}`} suppressHydrationWarning>
      <body className="bg-base text-primary font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
