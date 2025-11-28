import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "where are the bed bugs",
  description: "Crowd-sourced campus bug sightings with real-time location distribution."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://us.umami.is/script.js"
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_ID ?? ""}
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
