"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button, Input, Select, Table } from "react-daisyui";
import { toast } from "react-toastify";

import TableRow from "./components/TableRow";
import { secondsToDhms } from "./utils/string";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";

  const getStorage = useCallback((key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }, []);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
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
        <Link href="/">
          <div className="flex-grow text-2xl text-gray-200 text-center hover:underline">
            D.A.G.G.E.R. Testnet2 Dashboard
          </div>
        </Link>

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
          <div className="flex flex-row gap-2 text-gray-400 text-center items-center">
            <div className="">
              Tip <span>chainsona.sol</span>
            </div>
            <div
              className="hover: cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText("chainsona.sol");
                toast("Copied to clipboard!");
              }}
            >
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </div>
          </div>
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
                router.push(`/?q=${keyword.replace(/\s/g, "")}`);
              }}
            />
            <Button
              hidden={search.replace(/\s/g, "") === ""}
              onClick={() => {
                router.push("/");
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

      <div className="flex border border-base-100 rounded-xl overflow-auto">
        <Table className="w-full">
          <Table.Head className="sm:h-16 text-center table-column sm:table-header-group	text-lg text-gray-300">
            <span className="px-4">Rank</span>
            <span className="block text-left">Node ID</span>
            <span className="">Status</span>
            <span className="">Discord</span>
            <span className="">Availability</span>
            <span className="flex flex-col">
              <span className="">Uptime</span>
              <span className="text-xs">Earned</span>
            </span>
            <span className="block pr-4 text-right">Total Rewards</span>
          </Table.Head>

          <Table.Body>
            {filteredNodes.map((node: Node) => (
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

      <div className="flex flex-grow"></div>
    </main>
  );
}
