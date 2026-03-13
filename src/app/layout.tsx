import type { Metadata } from "next"
import "./globals.css"

// Note: Using system font fallbacks. Plus Jakarta Sans and Inter load via
// CSS variables (--font-jakarta, --font-inter) defined in globals.css.
// When Google Fonts are available (at runtime), next/font/google can be
// re-enabled for optimal self-hosting and zero layout shift.

export const metadata: Metadata = {
  title: "hitschies Publisher",
  description: "Social Media Planning Tool",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
