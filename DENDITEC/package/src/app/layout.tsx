import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import ScrollToTop from '@/components/shared/ScrollToTop'
import { ThemeProvider } from 'next-themes'
import NextTopLoader from 'nextjs-toploader';
import SessionProviderComp from '@/components/nextauth/SessionProvider'
import { AuthProvider } from '@/app/context/AuthContext'

const font = Bricolage_Grotesque({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'DenDiTec - Detección Inteligente de Enfermedades Orales',
  description: 'Sistema de inteligencia artificial para la detección temprana de enfermedades orales',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body className={`${font.className} bg-white dark:bg-black antialiased`}>
        <NextTopLoader color="#07be8a" />
        <SessionProviderComp>
          <AuthProvider>
            <ThemeProvider
              attribute='class'
              enableSystem={true}
              defaultTheme='light'>
              <Header />
              {children}
              <Footer />
              <ScrollToTop />
            </ThemeProvider>
          </AuthProvider>
        </SessionProviderComp>
      </body>
    </html>
  )
}
