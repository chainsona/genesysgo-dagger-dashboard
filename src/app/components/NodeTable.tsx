"use client";

import { Table } from "react-daisyui";

import TableRow from "./NodeRow";
import { Node } from "../types";

type NodeTableProps = {
  nodes: Node[];
};

export default function NodeTable(props: NodeTableProps) {
  const { nodes } = props;

  return (
    <div className="flex border border-base-100 rounded-xl overflow-auto">
      <Table className="w-full">
        <Table.Head className="sm:h-16 text-center table-column sm:table-header-group	text-lg text-gray-300">
          <span className="px-4">Rank</span>
          <span className="block text-left">Node ID</span>
          <span className="">Availability</span>
          <span className="">Status</span>
          <span className="">Discord</span>
          <span className="flex flex-col">
            <span className="">Uptime</span>
            <span className="text-xs">Earned</span>
          </span>
          <span className="block pr-4 text-right">Total Rewards</span>
        </Table.Head>

        <Table.Body>
          {nodes.map((node: Node) => (
            <TableRow
              id={node.node_id}
              is_discord_verified={node.is_discord_verified}
              is_up={node.is_up}
              key={node.node_id}
              rank={node.rank}
              status={node.status}
              total_rewards={node.total_rewards}
              uptime={parseInt(node.uptime)}
              uptimeStr={node.uptimeStr}
            />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
}
