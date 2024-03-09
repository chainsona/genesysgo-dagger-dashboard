import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";
import UiLayout from "./components/UiLayout";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
  title: "ShdwDrive D.A.G.G.E.R. Dashboard",
  description: "Dashboard for the ShdwDrive D.A.G.G.E.R. Testnet2 by GenesysGo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={roboto.className}>
        <UiLayout>{children}</UiLayout>
        <Analytics />
      </body>
    </html>
  );
}
