import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '웃소 대시보드',
  description: '웃소 팀의 YouTube 채널 분석 대시보드',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="min-h-screen">
          {/* 메인 콘텐츠 */}
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 