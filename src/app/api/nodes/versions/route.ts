export const dynamic = "force-dynamic"; // defaults to auto
import { kv } from "@vercel/kv";

export async function GET() {
  const cached_versions = await kv.get("dagger_versions");

  if (cached_versions) {
    return Response.json({ data: cached_versions });
  }

  console.debug("Cache miss, fetching from source");

  const versionRes = await fetch(
    "https://dashboard.shdwdrive.com/api/datasources/proxy/uid/ab139ce3-a132-4981-afad-bcaeb7c5b453"
  );
  const versionData = await versionRes.json();

  const versions = versionData.map((d: any) => {
    return {
      count: parseInt(d.count),
      version: d.wield_version,
    };
  });

  await kv.set("dagger_versions", JSON.stringify(versions), {
    ex: 60,
  });

  return Response.json({ data: versions });
}
