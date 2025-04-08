import {Ubuntu } from "next/font/google";
import "./globals.css";

const geistSans = Ubuntu({ weight: "400", subsets: ["latin"] });
const geistMono = Ubuntu({ weight: "700", subsets: ["latin"] });

export const metadata = {
  title: "Financy",
  description: "Application web de gestion de budget personnel",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
