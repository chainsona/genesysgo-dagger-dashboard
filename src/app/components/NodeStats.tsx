"use client";

import { Node } from "../types";
import { formatNumbers } from "../utils/string";

type NodeStat = {
  title: string;
  value: string | number;
  valuePct?: string;
};

type NodeStatsProps = {
  nodes: Node[];
};

export default function NodeStats(props: NodeStatsProps) {
  const { nodes } = props;

  const stats: NodeStat[] = [
    {
      title: "shdwNodes",
      value: nodes.filter((node: Node) => node.is_up).length,
    },
    {
      title: "Waiting shdwNodes",
      value: nodes.filter((node: Node) => node.status === "queued").length,
      valuePct: formatNumbers(
        (nodes.filter((node: Node) => node.status === "queued").length /
          nodes.length) *
          100
      ),
    },
    {
      title: "Offline shdwNodes",
      value: nodes.filter((node: Node) => !node.is_up).length,
      valuePct: formatNumbers(
        (nodes.filter((node: Node) => !node.is_up).length / nodes.length) * 100
      ),
    },
    {
      title: "Earned Rewards",
      value: nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
        .length,
      valuePct: formatNumbers(
        (nodes.filter((node: Node) => parseInt(node.total_rewards) > 0).length /
          nodes.length) *
          100
      ),
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

  return (
    <div className="flex flex-col sm:flex-row gap-8 justisfy-center overflow-hidden">
      {stats.map((stat, i) => (
        <div
          className="flex flex-col justify-between gap-4 p-4 bg-gray-950 rounded-xl w-full"
          key={i}
        >
          <div className="text-gray-400">{stat.title}</div>
          <div className="flex items-end justify-center gap-2">
            <div className="text-4xl font-bold text-center">{stat.value}</div>
            {!!stat.valuePct && stat.valuePct !== "NaN" && (
              <div className="text-sm font-bold text-center text-gray-400">
                {stat.valuePct}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
