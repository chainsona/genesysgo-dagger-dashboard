"use client";

import { Button, Table } from "react-daisyui";

import TableRow from "./NodeRow";
import { Node } from "../types";

type NodeTableProps = {
  nodes: Node[];
  nodesInfo?: any;
  page: number;
  maxPage: number;
  sort: string;
  setPage: (page: number) => void;
  setSort: (sort: string) => void;
};

export default function NodeTable(props: NodeTableProps) {
  const { nodes, nodesInfo, maxPage, page, setPage } = props;

  return (
    <div className="overflow-hidden flex flex-col border border-base-100 rounded-xl ">
      <div className="overflow-auto">
        <Table className="w-full">
          <Table.Head
            className="sm:h-16 bg-[#1C2027]
            table-header-group text-lg text-center text-gray-300"
          >
            <span className="px-4">Rank</span>
            <span className="block">Node</span>
            <span className="">Availability</span>
            <span className="">Status</span>
            <span className="">Discord</span>
            <span className="flex flex-col">
              <span className="">Balance</span>
              <span className="text-xs">Staked</span>
            </span>
            <span className="flex flex-col">
              <span className="">Uptime</span>
              <span className="text-xs">Earning</span>
            </span>
            <span className="block pr-4 text-right">Rewards</span>
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
      </div>

      <div
        className="flex items-center justify-between gap-2
          bg-[#1C2027] px-4 py-2 text-gray-400 uppercase"
      >
        <Button
          className="px-4 py-3 hover:bg-gray-800 disabled:text-gray-600"
          onClick={() => setPage(0)}
          disabled={page <= 0}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 24 24"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.83594 12.0001L11.043 18.2072L12.4573 16.793L7.66436 12.0001L12.4573 7.20718L11.043 5.79297L4.83594 12.0001ZM10.4858 12.0001L16.6929 18.2072L18.1072 16.793L13.3143 12.0001L18.1072 7.20718L16.6929 5.79297L10.4858 12.0001Z"></path>
          </svg>
        </Button>
        <Button
          className="px-4 py-3 hover:bg-gray-800 disabled:text-gray-600"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page <= 0}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M217.9 256L345 129c9.4-9.4 9.4-24.6 0-33.9-9.4-9.4-24.6-9.3-34 0L167 239c-9.1 9.1-9.3 23.7-.7 33.1L310.9 417c4.7 4.7 10.9 7 17 7s12.3-2.3 17-7c9.4-9.4 9.4-24.6 0-33.9L217.9 256z"></path>
          </svg>
        </Button>
        <span className="w-28 px-4 text-center">
          {page + 1} / {maxPage}
        </span>
        <Button
          className="px-4 py-3 hover:bg-gray-800 disabled:text-gray-600"
          onClick={() => setPage(Math.min(maxPage, page + 1))}
          disabled={page === maxPage - 1}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M294.1 256L167 129c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.3 34 0L345 239c9.1 9.1 9.3 23.7.7 33.1L201.1 417c-4.7 4.7-10.9 7-17 7s-12.3-2.3-17-7c-9.4-9.4-9.4-24.6 0-33.9l127-127.1z"></path>
          </svg>
        </Button>
        <Button
          className="px-4 py-3 hover:bg-gray-800 disabled:text-gray-600"
          onClick={() => setPage(maxPage - 1)}
          disabled={page >= maxPage - 1}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 24 24"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.1643 12.0001L12.9572 5.79297L11.543 7.20718L16.3359 12.0001L11.543 16.793L12.9572 18.2072L19.1643 12.0001ZM13.5144 12.0001L7.30728 5.79297L5.89307 7.20718L10.686 12.0001L5.89307 16.793L7.30728 18.2072L13.5144 12.0001Z"></path>
          </svg>
        </Button>
      </div>
    </div>
  );
}
