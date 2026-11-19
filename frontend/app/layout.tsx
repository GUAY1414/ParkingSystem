import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuya meron pa? | Digital Parking",
  description: "Vehicle verification and parking management for Manila",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
