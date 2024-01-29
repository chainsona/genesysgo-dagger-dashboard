"use client";

import { Node } from "../types";
import { formatNumbers } from "../utils/string";

type NodeStatsProps = {
  nodes: Node[];
};

export default function NodeStats(props: NodeStatsProps) {
  const { nodes } = props;

  const stats = [
    {
      title: "shdwNodes",
      value: nodes.filter((node: Node) => node.is_up).length,
    },
    {
      title: "Waiting shdwNodes",
      value: nodes.filter((node: Node) => node.status === "queued").length,
    },
    {
      title: "Offline shdwNodes",
      value: nodes.filter((node: Node) => !node.is_up).length,
    },
    {
      title: "Earned Rewards",
      value: nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
        .length,
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
    <div className="flex flex-col sm:flex-row gap-8 justisfy-center">
      {stats.map((stat, i) => (
        <div
          className="flex flex-col gap-4 p-4 bg-gray-950 rounded-xl w-full"
          key={i}
        >
          <div className="text-gray-400">{stat.title}</div>
          <div className="text-4xl font-bold text-center">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
