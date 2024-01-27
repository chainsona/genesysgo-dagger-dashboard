"use client";

import { useCallback, useEffect, useState } from "react";
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

function statusHelper(status: string) {
  // top_150
  // queued
  // not_eligible

  switch (status) {
    case "top_150":
      return "Top 150";
    case "queued":
      return "Queued";
    case "not_eligible":
      return "Not Eligible";
    default:
      return "Unknown";
  }
}

function backgroundColorHelper(status: string) {
  switch (status) {
    case "top_150":
      return "bg-green-950";
    case "queued":
      return "bg-sky-950";
    case "not_eligible":
      return "bg-red-900";
    default:
      return "bg-gray-950";
  }
}

type Node = {
  rank: number;
  node_id: string;
  is_discord_verified: boolean;
  is_up: boolean;
  status: string;
  uptime: string;
  uptimeStr: string;
  total_rewards: string;
};

export default function Home() {
  const getStorage = useCallback((key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }, []);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [search, setSearch] = useState(getStorage("search") || "");
  const [sort, setSort] = useState(getStorage("sort") || "uptime-desc");

  useEffect(() => {
    fetch("https://shdw-rewards-oracle.shdwdrive.com/node-leaderboard")
      .then((res) => res.json())
      .then((data) =>
        setNodes(
          [
            ...data.nodes
              .filter((node: Node) => node.status === "top_150")
              .sort((a: Node, b: Node) => Number(b.uptime) - Number(a.uptime)),
            ...data.nodes
              .filter((node: Node) => node.status === "queued")
              .sort((a: Node, b: Node) => Number(b.uptime) - Number(a.uptime)),
            ...data.nodes
              .filter(
                (node: Node) => !["top_150", "queued"].includes(node.status)
              )
              .sort((a: Node, b: Node) => Number(b.uptime) - Number(a.uptime)),
          ].map((node: Node, i: number) => {
            return {
              ...node,
              rank: i + 1,
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
            placeholder="Search by node ID (comma separated)"
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
            className="px-4 py-2 bg-base-100 rounded-md"
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

      <div className="p-4">Rank Top 150 nodes, queued then the rest by uptime.</div>

      <div className="flex w-full px-4">
        <Table className="w-full">
          <Table.Head>
            <span className="">Rank</span>
            <span className="">Node ID</span>
            <span className="">Status</span>
            <span className="">Discord Verified</span>
            <span className="">Up</span>
            <span className="">Uptime</span>
            <span className="">Total Rewards</span>
          </Table.Head>

          <Table.Body>
            {filteredNodes.map((node: Node) => (
              <Table.Row
                key={node.node_id}
                className={`${backgroundColorHelper(node.status)} py-2`}
                hover={true}
              >
                <span className="block text-right pr-4">{node.rank}</span>
                <span>{node.node_id}</span>
                <span>{statusHelper(node.status)}</span>
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
      </div>
    </main>
  );
}
