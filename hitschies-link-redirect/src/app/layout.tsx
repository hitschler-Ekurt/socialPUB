import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "hitschies Link Service",
  description: "Short link redirect service for hitschies",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
