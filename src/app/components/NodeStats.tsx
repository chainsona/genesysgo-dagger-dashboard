"use client";

import { Node } from "../types";

type NodeStatsProps = {
  nodes: Node[];
};

export default function NodeStats(props: NodeStatsProps) {
  const { nodes } = props;

  return (
    <div className="flex flex-col sm:flex-row gap-8 items-center justisfy-center">
      <div className="flex flex-col p-4 bg-gray-950 rounded-xl w-full">
        <div className="text-gray-400">shdwNodes</div>
        <div className="text-4xl font-bold text-center">
          {nodes.filter((node: Node) => node.is_up).length}
        </div>
      </div>
      <div className="flex flex-col p-4 bg-gray-950 rounded-xl w-full">
        <div className="text-gray-400">Waiting shdwNodes</div>
        <div className="text-4xl font-bold text-center">
          {nodes.filter((node: Node) => node.status === "queued").length}
        </div>
      </div>
      <div className="flex flex-col p-4 bg-gray-950 rounded-xl w-full">
        <div className="text-gray-400">Offline shdwNodes</div>
        <div className="text-4xl font-bold text-center">
          {nodes.filter((node: Node) => !node.is_up).length}
        </div>
      </div>
      <div className="flex flex-col p-4 bg-gray-950 rounded-xl w-full">
        <div className="text-gray-400">Earned Rewards</div>
        <div className="text-4xl font-bold text-center">
          {
            nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
              .length
          }
        </div>
      </div>
    </div>
  );
}
