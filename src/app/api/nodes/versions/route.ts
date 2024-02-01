export const dynamic = "force-dynamic"; // defaults to auto

export async function GET() {
  const versionMatrix = [
    { refId: "1", version: "0.7.0" },
    { refId: "2", version: "0.7.1" },
    { refId: "3", version: "0.8.0" },
    { refId: "4", version: "0.8.1" },
    { refId: "5", version: "0.8.2" },
    { refId: "6", version: "0.8.3" },
    { refId: "7", version: "0.9.0" },
  ];

  const res = await fetch(
    "https://dashboard.shdwdrive.com/api/ds/query?ds_type=loki&requestId=Q108_1",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queries: versionMatrix.map((data) => {
          return {
            datasource: {
              type: "loki",
              uid: "a70b7855-0233-40db-8ae1-ddd2e18dc418",
            },
            editorMode: "builder",
            expr: `{label=\"node_count_version_${data.version}` + '"} |= ``',
            queryType: "range",
            refId: data.refId,
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

  const result = versionMatrix.map((data) => {
    return {
      refId: data.refId,
      version: data.version,
      count: data.refId === "E" ? 0 : data.refId === "D" ? 1 : 2,
    };
  });

  const versions = [];
  for (const matrix of versionMatrix) {
    const d = data.results[matrix.refId].frames[0].data.values[2]?.[0];
    if (!d) {
      continue;
    }
    versions.push({
      version: matrix.version,
      count: d.split(": ")[1],
    });
  }

  return Response.json({ data: versions });
}
