export const dynamic = "force-dynamic"; // defaults to auto

import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { NextRequest } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { kv } from "@vercel/kv";

import { rpcEndpoint } from "@/app/config";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const cached_balance = await kv.get(`${id}_balance`);
  if (cached_balance !== null) {
    return Response.json({ data: cached_balance });
  }

  console.debug("Cache miss, fetching from source:", id);

  let data = {
    address: id,
    balance: -1,
  };

  try {
    const connection = new Connection(rpcEndpoint, "confirmed");

    // Get token accounts
    const tokenAccountsResponse =
      await connection.getParsedTokenAccountsByOwner(new PublicKey(id), {
        programId: TOKEN_PROGRAM_ID,
      });
    const tokenAccounts = tokenAccountsResponse.value;

    const tokens = tokenAccounts.reduce((acc: any, tokenAccount: any) => {
      acc[tokenAccount.account.data.parsed.info.mint] = {
        account: tokenAccount.pubkey,
        address: tokenAccount.account.data.parsed.info.mint,
        amount: tokenAccount.account.data.parsed.info.tokenAmount.amount,
        decimals: tokenAccount.account.data.parsed.info.tokenAmount.decimals,
      };
      return acc;
    }, {});

    const shdwToken = tokens["SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y"];
    if (!shdwToken) return Response.json({ data: 0 });

    data = {
      address: id,
      balance: shdwToken.amount / 10 ** shdwToken.decimals,
    };
  } catch (e: any) {
    console.error(JSON.stringify(e));
    return Response.json({ error: e }, { status: 500 });
  }

  await kv.set(`${id}_balance`, JSON.stringify(data.balance), {
    ex: 60,
  });

  return Response.json({
    data: data.balance,
  });
}
