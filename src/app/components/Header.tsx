"use client";

import { Roboto_Condensed } from "next/font/google";

import Link from "next/link";
import { toast } from "react-toastify";
import Image from "next/image";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

type HeaderProps = {};

export default function Header({}: HeaderProps) {
  return (
    <div className="w-full flex p-4 items-center justify-between">
      <div className="flex flex-col gap-1">
        <div
          className={`${robotoCondensed.className} font-bold text-xl text-gray-300 uppercase`}
        >
          D.A.G.G.E.R. Dashboard
        </div>
      </div>

      <div className="flex items-center gap-4 text-lg">
        <Link href="https://testnet.shdwdrive.com/" passHref target="_blank">
          <div className="text-gray-400 hover:underline text-center">
            <div className="">
              <Image src="/shdw.png" alt="SHDW" height={20} width={20} />
            </div>
          </div>
        </Link>
        <Link href="https://x.com/chainsona" passHref target="_blank">
          <div className="text-gray-300 hover:underline font-semibold text-3xl text-center">
            𝕏
          </div>
        </Link>
        <div
          className="bg-gray-800 hover:bg-green-900 hover:cursor-pointer p-2 text-gray-300 font-semibold text-sm text-center uppercase"
          onClick={() => {
            navigator.clipboard.writeText("chainsona.sol");
            toast("Address chainsona.sol copied!");
          }}
        >
          TIP
        </div>
      </div>
    </div>
  );
}
