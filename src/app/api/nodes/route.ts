export const dynamic = "force-dynamic"; // defaults to auto

export async function GET() {
  const nodes = await fetch(
    "https://dashboard.shdwdrive.com/api/datasources/proxy/uid/d118a189-b6dc-49b1-a75a-b7a84377dc73"
  );
  const data = await nodes.json();
  return Response.json({ data });
}
