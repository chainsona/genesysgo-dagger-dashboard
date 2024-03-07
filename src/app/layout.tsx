import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
import UiLayout from "./components/UiLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D.A.G.G.E.R. Testnet2 Dashboard",
  description: "Dashboard for the SHDW Incentivized Testnet V2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <UiLayout>{children}</UiLayout>
        <Analytics />
      </body>
    </html>
  );
}
