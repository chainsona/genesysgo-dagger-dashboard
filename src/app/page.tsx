"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button, Input, Select, Table } from "react-daisyui";

function secondsToDhms(seconds: number) {
  seconds = Number(seconds) / 1000;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d} days ${h} hours ${m} minutes`;
}

function formatRewards(rewards: string) {
  return `${(Number(rewards) / 10 ** 9).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function ellipsis(str: string, max: number) {
  if (str.length <= max) {
    return str;
  }

  const mid = Math.floor(max / 2);
  return str.slice(0, mid) + "..." + str.slice(str.length - mid);
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
  const [search, setSearch] = useState(
    (getStorage("search") || "").replace(/\s/g, "")
  );
  const [sort, setSort] = useState(getStorage("sort") || "rank-desc");
  const [refresh, setRefresh] = useState(getStorage("refresh") || "5");

  const fetchNodes = useCallback(() => {
    fetch("https://shdw-rewards-oracle.shdwdrive.com/node-leaderboard")
      .then((res) => res.json())
      .then((data) =>
        setNodes(
          data.nodes.map((node: Node, i: number) => {
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
    fetchNodes();
    const timer = setInterval(() => {
      fetchNodes();
    }, parseInt(refresh) * 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [fetchNodes, refresh]);

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
            case "rank-desc":
              return Number(a.rank) - Number(b.rank);
            case "rewards-asc":
              return Number(a.total_rewards) - Number(b.total_rewards);
            case "rewards-desc":
              return Number(b.total_rewards) - Number(a.total_rewards);
            case "uptime-desc":
              return Number(b.uptime) - Number(a.uptime);
            case "uptime-asc":
              return Number(a.uptime) - Number(b.uptime);
            default:
            case "rank-asc":
              return Number(b.rank) - Number(a.rank);
          }
        })
    );
  }, [search, nodes, sort]);

  return (
    <main className="dark flex flex-col min-h-screen w-full text-left overflow-x-auto p-8 gap-4">
      <div className="w-full flex flex-col gap-3 space-between pb-4 justify-center items-center">
        <div className="flex-grow text-2xl text-gray-200 text-center">
          D.A.G.G.E.R. Testnet2 Dashboard
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-lg">
          <Link href="https://testnet.shdwdrive.com/" passHref target="_blank">
            <div className="text-gray-400 hover:underline text-center">
              Official website
            </div>
          </Link>
          <Link href="https://x.com/chainsona" passHref target="_blank">
            <div className="text-gray-400 hover:underline text-center">
              Follow me on 𝕏
            </div>
          </Link>
        </div>
      </div>

      <div className="flex flex-row w-full component-preview items-center justify-center gap-2 font-sans">
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="w-full flex flex-row items-center gap-2">
            <Input
              id="search"
              placeholder="Search by node ID (comma separated)"
              className="w-full px-4 py-2 bg-base-100 rounded-md bg-gray-900"
              value={search}
              onChange={() => {
                const keyword = (
                  document.getElementById("search") as HTMLInputElement
                ).value;
                setSearch(keyword.replace(/\s/g, ""));
                localStorage.setItem("search", keyword);
              }}
            />
            <Button
              hidden={search === ""}
              onClick={() => {
                setSearch("");
                localStorage.removeItem("search");
              }}
            >
              Clear
            </Button>
          </div>

          <div className="flex flex-row gap-4">
            <div className="flex flex-row text-right items-center gap-2">
              <div className="sm:w-28 text-gray-400 text text-center">
                Refresh (min)
              </div>
              <Input
                id="refresh"
                placeholder="Refresh interval (minutes)"
                className="w-20 px-4 py-2 bg-base-100 rounded-md bg-gray-900"
                value={getStorage("refresh") || refresh}
                type="number"
                min={1}
                onChange={() => {
                  try {
                    const minutes = (
                      document.getElementById("refresh") as HTMLInputElement
                    ).value;
                    parseInt(minutes);
                    localStorage.setItem("refresh", minutes);
                    setRefresh(minutes);
                  } catch (e) {
                    return;
                  }
                }}
              />
            </div>

            <Select
              className="w-full sm:w-64 px-4 py-2 bg-base-100 rounded-md bg-gray-900"
              onChange={(event) => {
                setSort(event.target.value);
                localStorage.setItem("sort", event.target.value);
              }}
              value={sort}
            >
              <Select.Option value="rank-desc">
                Rank (first to last)
              </Select.Option>
              <Select.Option value="rank-asc">
                Rank (last to first)
              </Select.Option>
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
      </div>

      <div className="text-gray-400 text-sm">
        ⚠️ Ranking Top 150 nodes, queued then the rest by uptime.
      </div>

      <div className="flex border border-base-100 rounded-xl overflow-auto">
        <Table className="w-full">
          <Table.Head className="sm:h-16 text-center table-column sm:table-header-group	text-lg text-gray-300">
            <span className="px-4">Rank</span>
            <span className="block text-left">Node ID</span>
            <span className="">Status</span>
            <span className="">Discord</span>
            <span className="">Availability</span>
            <span className="">Uptime</span>
            <span className="block pr-4 text-right">Total Rewards</span>
          </Table.Head>

          <Table.Body>
            {filteredNodes.map((node: Node) => (
              <Table.Row
                key={node.node_id}
                className={`${backgroundColorHelper(
                  node.status
                )} md:h-14 text-center flex sm:table-cell flex-col sm:table-row items-center justify-center py-4 sm=py-0 gap-1 sm:gap-0 hover:bg-gray-950`}
                hover={true}
              >
                <span className="block text-center pr-4 text-lg">
                  #{node.rank}
                </span>
                <span className="hidden sm:flex text-left items-center">
                  {node.node_id}
                </span>
                <span className="sm:hidden flex text-left items-center">
                  {ellipsis(node.node_id, 16)}{" "}
                </span>
                <span className="">{statusHelper(node.status)}</span>
                <span className="block text-center">
                  {node.is_discord_verified ? "Verified" : "Unverified"}
                </span>
                <span className="">{node.is_up ? "Up" : "Down"}</span>
                <span className="">{node.uptimeStr}</span>
                <span className="block pr-4 text-right">
                  {formatRewards(node.total_rewards)}
                </span>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="flex flex-grow"></div>
    </main>
  );
}
