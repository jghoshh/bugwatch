import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bugwatch Campus Tracker",
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
        {children}
      </body>
    </html>
  );
}
