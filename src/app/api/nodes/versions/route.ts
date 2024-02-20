export const dynamic = "force-dynamic"; // defaults to auto

export async function GET() {
  const versionsToCheck = [];

  const fromMinor = 8;
  const minorVersions = 2;
  const buildVersions = 10;
  for (let minor = 0; minor < minorVersions; minor++) {
    for (let build = 0; build < buildVersions; build++) {
      versionsToCheck.push(`0.${fromMinor + minor}.${build}`);
    }
  }

  const res = await fetch(
    "https://dashboard.shdwdrive.com/api/ds/query?ds_type=loki&requestId=Q108_1",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queries: versionsToCheck.map((v) => {
          return {
            datasource: {
              type: "loki",
              uid: "a70b7855-0233-40db-8ae1-ddd2e18dc418",
            },
            editorMode: "builder",
            expr: `{label=\"node_count_version_${v}` + '"} |= ``',
            queryType: "range",
            refId: v,
            maxLines: 1,
            legendFormat: "",
            datasourceId: 1,
            intervalMs: 15000,
            maxDataPoints: 1,
          };
        }),
        from: `${Date.now() - 3600000}`,
        to: `${Date.now()}`,
      }),
    }
  );
  const data = await res.json();

  const versions = [];
  for (const version of versionsToCheck) {
    const d = data.results[version].frames[0].data.values[2]?.[0];
    if (!d) {
      continue;
    }
    versions.push({
      version: version,
      count: d.split(": ")[1],
    });
  }

  return Response.json({ data: versions });
}
