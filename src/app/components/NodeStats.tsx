"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Node } from "../types";
import { formatNumbers } from "../utils/string";

type NodeStat = {
  title: string;
  value: string | number;
  note?: string;
};

type NodeStatsProps = {
  nodes: Node[];
};

export default function NodeStats(props: NodeStatsProps) {
  const { nodes } = props;
  const [versions, setVersions] = useState<any | null>(null);

  const fetchVersions = useCallback(() => {
    fetch("/api/nodes/versions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setVersions(data.data))
      .catch((e: any) => {
        console.error(JSON.stringify(e));
      });
  }, []);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions, nodes]);

  const stats: NodeStat[] = useMemo(() => {
    return [
      {
        title: "shdwNodes",
        value: nodes.length,
      },
      {
        title: !versions
          ? "Wield version"
          : "Wield version " + versions[versions.length - 1].version,
        value: !versions ? "N/A" : versions[versions.length - 1].count,
        note: !versions
          ? "N/A"
          : formatNumbers(
              (versions[versions.length - 1].count / nodes.length) * 100
            ) + "%",
      },
      {
        title: "Waiting shdwNodes",
        value: nodes.filter((node: Node) => node.status === "queued").length,
        note:
          formatNumbers(
            (nodes.filter((node: Node) => node.status === "queued").length /
              nodes.length) *
              100
          ) + "%",
      },
      {
        title: "Offline shdwNodes",
        value: nodes.filter((node: Node) => !node.is_up).length,
        note:
          formatNumbers(
            (nodes.filter((node: Node) => !node.is_up).length / nodes.length) *
              100
          ) + "%",
      },
      {
        title: "Earned Rewards",
        value: nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
          .length,
        note:
          formatNumbers(
            (nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
              .length /
              nodes.length) *
              100
          ) + "%",
      },
      {
        title: "Distributed Rewards",
        value: formatNumbers(
          nodes.reduce(
            (acc: number, node: Node) =>
              acc + parseInt(node.total_rewards) / 10 ** 9,
            0
          )
        ),
      },
    ];
  }, [nodes, versions]);

  return (
    <div className="flex flex-col sm:flex-row gap-8 justisfy-center overflow-hidden">
      {stats.map((stat, i) => (
        <div
          className="flex flex-col justify-between gap-4 p-4 bg-gray-950 rounded-xl w-full"
          key={i}
        >
          <div className="text-gray-400">{stat.title}</div>
          <div className="flex items-end justify-center gap-2">
            <div className="text-2xl font-bold text-center">{stat.value}</div>
            {!!stat.note && stat.note !== "NaN" && (
              <div className="text-sm font-bold text-center text-gray-400">
                {stat.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
