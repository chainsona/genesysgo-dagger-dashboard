"use client";

import { Table } from "react-daisyui";

import TableRow from "./NodeRow";
import { Node } from "../types";

type NodeTableProps = {
  nodes: Node[];
  nodesInfo?: any;
  page: number;
  maxPage: number;
  setPage: (page: number) => void;
};

export default function NodeTable(props: NodeTableProps) {
  const { nodes, nodesInfo, maxPage, page, setPage } = props;

  return (
    <div className="flex flex-col border border-base-100 rounded-xl overflow-auto">
      <Table className="w-full">
        <Table.Head className="sm:h-16 text-center table-column sm:table-header-group	text-lg text-gray-300">
          <span className="px-4">Rank</span>
          <span className="block text-left">Node ID</span>
          <span className="">Availability</span>
          <span className="">Status</span>
          <span className="">Discord</span>
          <span className="flex flex-col">
            <span className="">Balance</span>
            <span className="text-xs">Staked</span>
          </span>
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
              nodeConfig={nodesInfo[node.node_id]}
            />
          ))}
        </Table.Body>
      </Table>

      <div className="flex items-center justify-end gap-2">
        <button
          className="px-4 py-3 hover:bg-gray-800"
          onClick={() => setPage(1)}
          disabled={page <= 0}
        >
          First
        </button>
        <button
          className="px-4 py-3 hover:bg-gray-800"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page <= 0}
        >
          Previous
        </button>
        <span className="w-28 px-4 text-center text-gray-300">
          {page + 1} / {maxPage}
        </span>
        <button
          className="px-4 py-3 hover:bg-gray-800"
          onClick={() => setPage(Math.min(maxPage, page + 1))}
          disabled={page === maxPage}
        >
          Next
        </button>
        <button
          className="px-4 py-3 hover:bg-gray-800"
          onClick={() => setPage(maxPage - 1)}
          disabled={page >= maxPage}
        >
          Last
        </button>
      </div>
    </div>
  );
}
