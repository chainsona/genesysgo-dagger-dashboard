export const dynamic = "force-dynamic"; // defaults to auto

import * as anchor from "@coral-xyz/anchor";
import { NextRequest } from "next/server";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { kv } from "@vercel/kv";

import { rpcEndpoint } from "@/app/config";

import idl from "@/app/utils/shdw_reward_staking_pool.idl.json";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const cached_staked = await kv.get(`${id}_shdw_stake`);
  if (cached_staked !== null) {
    return Response.json({ data: cached_staked });
  }

  console.debug("Cache miss, fetching from source:", id);

  const pubKey = new PublicKey(id);

  let e;
  let [address] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("user"),
      new PublicKey("EM2u3eTQgusA3vALZ1P6w6oZZBgRY3qvEraRKpor6kEy").toBuffer(),
      pubKey.toBuffer(),
    ],
    new PublicKey("AvqeyEDqW9jaBi7yrRA6AxJtLbMzRY9NX75HuPTMoS4i")
  );

  const provider = new anchor.AnchorProvider(
    new Connection(rpcEndpoint, {
      commitment: "processed",
    }),
    new anchor.Wallet(Keypair.generate()),
    // wallet,
    {
      commitment: "processed",
    }
  );
  const program = new anchor.Program(
    idl as anchor.Idl,
    "AvqeyEDqW9jaBi7yrRA6AxJtLbMzRY9NX75HuPTMoS4i",
    provider
  );

  try {
    e = await program.account.userState.fetch(address);
  } catch (e) {
    return Response.json({ error: e }, { status: 500 });
  }

  const staked = parseInt(String(e.activeStakeScaled)) / 1e18 / 1e9;

  await kv.set(`${id}_shdw_stake`, JSON.stringify(staked), {
    ex: 60,
  });

  return Response.json({
    data: staked,
  });
}
