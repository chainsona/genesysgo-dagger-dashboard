export const dynamic = "force-dynamic"; // defaults to auto

export async function GET() {
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

  return Response.json({ data: versions });
}
