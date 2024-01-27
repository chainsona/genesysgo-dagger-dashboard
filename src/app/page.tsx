"use client";

import { useEffect, useState } from "react";
import { Input, Select, Table } from "react-daisyui";

// {
//   "node_id": "BQofKZeR1UsU2tx27oexqzC3R3rmF5eaETRbfbEHLuat",
//   "is_discord_verified": true,
//   "is_up": true,
//   "status": "top_150",
//   "uptime": "1022428506",
//   "total_rewards": "229596397182"
//   },

// Convert seconds to days hours minutes
function secondsToDhms(seconds: number) {
  seconds = Number(seconds) / 1000;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d} days ${h} hours ${m} minutes`;
}

// format rewards
function formatRewards(rewards: string) {
  return `${(Number(rewards) / 10 ** 9).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type Node = {
  node_id: string;
  is_discord_verified: boolean;
  is_up: boolean;
  status: string;
  uptime: string;
  uptimeStr: string;
  total_rewards: string;
};

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [search, setSearch] = useState(localStorage.getItem("search") || "");
  const [sort, setSort] = useState(
    localStorage.getItem("sort") || "uptime-desc"
  );

  useEffect(() => {
    fetch("https://shdw-rewards-oracle.shdwdrive.com/node-leaderboard")
      .then((res) => res.json())
      .then((data) =>
        setNodes(
          data.nodes.map((node: Node) => {
            return {
              ...node,
              uptimeStr: secondsToDhms(parseInt(node.uptime)),
            };
          }) || []
        )
      );
  }, []);

  useEffect(() => {
    setFilteredNodes(
      nodes
        .filter(
          (node: Node) =>
            search === "" ||
            node.node_id.toLowerCase().includes(search.toLowerCase()) ||
            search.toLowerCase().split(",").includes(node.node_id.toLowerCase())
        )
        .sort((a: Node, b: Node) => {
          switch (sort) {
            case "rewards-asc":
              return Number(a.total_rewards) - Number(b.total_rewards);
            case "rewards-desc":
              return Number(b.total_rewards) - Number(a.total_rewards);
            case "uptime-desc":
              return Number(b.uptime) - Number(a.uptime);
            case "uptime-asc":
              return Number(a.uptime) - Number(b.uptime);
            default:
              return 0;
          }
        })
    );
  }, [search, nodes, sort]);

  return (
    <main className="flex flex-col w-full text-left overflow-x-auto">
      <div className="flex w-full component-preview p-4 items-center justify-center gap-2 font-sans">
        <div className="w-full flex flex-row gap-4">
          <Input
            id="search"
            className="w-full px-4 py-2 bg-base-100 rounded-md"
            value={search}
            onChange={() => {
              setSearch(
                (document.getElementById("search") as HTMLInputElement).value
              );
              localStorage.setItem(
                "search",
                (document.getElementById("search") as HTMLInputElement).value
              );
            }}
          />
          <Select
            className="w-48 px-4 py-2 bg-base-100 rounded-md"
            onChange={(event) => {
              setSort(event.target.value);
              localStorage.setItem("sort", event.target.value);
            }}
            value={sort}
          >
            <Select.Option value="rewards-desc">
              Rewards (higher to lower)
            </Select.Option>
            <Select.Option value="rewards-asc">
              Rewards (lower to higher)
            </Select.Option>
            <Select.Option value="uptime-desc">
              Uptime (higher to lower)
            </Select.Option>
            <Select.Option value="uptime-asc">
              Uptime (lower to higher)
            </Select.Option>
          </Select>
        </div>
      </div>

      <Table>
        <Table.Head>
          <span />
          <span>Node ID</span>
          <span>Discord Verified</span>
          <span>Active</span>
          <span>Uptime</span>
          <span>Total Rewards</span>
        </Table.Head>

        <Table.Body>
          {filteredNodes.map((node: Node, i: number) => (
            <Table.Row key={node.node_id}>
              <span className="block text-right pr-4">{`#${i + 1}`}</span>
              <span>{node.node_id}</span>
              <span>{node.is_discord_verified ? "Yes" : "No"}</span>
              <span>{node.is_up ? "Yes" : "No"}</span>
              <span>{node.uptimeStr}</span>
              <span className="text-right">
                {formatRewards(node.total_rewards)}
              </span>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </main>
  );
}
