import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Stick Planner',
  description: 'Planificación para hockey. Desarrollado por Hako Studio.',
  applicationName: 'Stick Planner',
  authors: [{ name: 'Hako Studio', url: 'https://www.instagram.com/hako.std/' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased flex flex-col min-h-screen">
        <div className="flex-1">
          {children}
        </div>
        {/* <footer className="py-4 text-center border-t border-border/20 bg-background/50">
          <a 
            href="https://www.instagram.com/hako.std/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Aplicación web diseñada y desarrollada por Hako Studio
          </a>
        </footer> */}
        <Analytics />
      </body>
    </html>
  )
}
