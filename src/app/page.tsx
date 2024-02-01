"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Progress } from "react-daisyui";
import { toast } from "react-toastify";

import NodeLimit from "./components/NodeLimit";
import NodeRefresh from "./components/NodeRefresh";
import NodeSort from "./components/NodeSort";
import NodeStats from "./components/NodeStats";
import NodeTable from "./components/NodeTable";

import { Node } from "./types";
import { formatNumbers, secondsToDhms } from "./utils/string";
import { set } from "@coral-xyz/anchor/dist/cjs/utils/features";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get("q") || "";
  const [limit, setLimit] = useState(
    parseInt(searchParams.get("limit") || "20")
  );
  const [page, setPage] = useState<number>(
    parseInt(searchParams.get("page") || "0")
  );
  const [network, setNetwork] = useState<any | null>(null);

  const getStorage = useCallback((key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }, []);

  const [filteredNodes, setFilteredNodes] = useState<Node[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [nodesInfo, setNodesInfo] = useState<any>({});
  const [refresh, setRefresh] = useState(getStorage("refresh") || "5");
  const [sort, setSort] = useState(getStorage("sort") || "rank-desc");

  const fetchNetwork = useCallback(() => {
    fetch("https://api.dagger-testnet.shdwdrive.com/rpc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "get_latest_bundlehash",
        params: [],
        id: 1,
      }),
    })
      .then((res) => res.json())
      .then((data) => setNetwork(data?.result?.get_latest_bundlehash))
      .catch((e: any) => {
        console.error(JSON.stringify(e));
      });
  }, []);

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
      )
      .catch((e: any) => {
        console.error(JSON.stringify(e));
      });
  }, []);

  const fetchNodesInfo = useCallback(() => {
    fetch("/api/nodes")
      .then((res) => res.json())
      .then((data) => {
        setNodesInfo(
          data.data.reduce((acc: any, node: any) => {
            acc[node.node_id] = node;
            return acc;
          }) || []
        );
      })
      .catch((e: any) => {
        console.error(JSON.stringify(e));
      });
  }, []);

  useEffect(() => {
    console.log("nodesInfo", nodesInfo);
  }, [nodesInfo]);

  useEffect(() => {
    fetchNetwork();
    fetchNodes();
    fetchNodesInfo();
  }, [fetchNetwork, fetchNodes, fetchNodesInfo]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchNodes();
    }, parseInt(refresh) * 60 * 1000);

    return () => {
      clearInterval(timer);
    };
  }, [fetchNodes, refresh]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchNetwork();
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [fetchNetwork]);

  const visibleNodes = useMemo(() => {
    return nodes
      .filter(
        (node: Node) =>
          keyword === "" ||
          node.node_id.toLowerCase().includes(keyword.toLowerCase()) ||
          keyword.toLowerCase().split(",").includes(node.node_id.toLowerCase())
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
      .splice(page * limit, limit);
  }, [limit, nodes, page, keyword, sort]);

  const setFilter = useCallback(
    (keyword: string) => {
      const args: string[] = [];
      if (keyword.trim() !== "") {
        args.push(`q=${keyword}`);
      }
      if (limit * page > nodes.length) {
        setPage(Math.ceil(nodes.length / limit));
      }
      args.push(`page=${page}`);
      args.push(`limit=${limit}`);
      router.push(`/?${args.join("&")}`);
    },
    [limit, page, router, nodes.length]
  );

  useEffect(() => {
    setFilter(keyword);
  }, [limit, keyword, setFilter]);

  return (
    <main className="dark flex flex-col min-h-screen w-full text-left overflow-x-auto p-8 gap-4">
      <div className="w-full flex flex-col gap-3 space-between pb-4 justify-center items-center">
        <div className="flex flex-col gap-2">
          <Link href="/">
            <div className="flex-grow text-2xl text-gray-200 text-center hover:underline">
              D.A.G.G.E.R. Testnet2 Dashboard
            </div>
          </Link>
          {network && (
            <div className="flex flex-col w-full text-gray-300 text-sm text-center font-semibold uppercase items-center justify-center gap-3">
              <div className="flex w-full text-gray-300 text-sm text-center font-semibold uppercase items-center justify-center gap-3">
                <div className="">Epoch: {formatNumbers(network.epoch, 0)}</div>
                <div className="relative overflow-hidden flex flex-col rounded-full overflow-hidden">
                  <Progress
                    className="w-32"
                    value={(network.bundle % 128) / 128}
                  />
                  <div className="absolute p-1 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs text-gray-300 font-semibold">
                    {network.bundle % 128} / 128
                  </div>
                </div>
                <div className="">
                  Bundle: {formatNumbers(network.bundle, 0)}
                </div>
              </div>
            </div>
          )}
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

      <NodeStats nodes={nodes} />

      <div className="flex flex-col md:flex-row w-full component-preview items-center justify-center gap-2 font-sans">
        <div className="w-full flex flex-row items-center gap-2">
          <Input
            id="search"
            placeholder="Search by node ID (comma separated)"
            className="w-full px-4 py-3 bg-base-100 rounded-md bg-gray-900"
            value={keyword}
            onChange={() => {
              const keyword = (
                document.getElementById("search") as HTMLInputElement
              ).value;
              setFilter(keyword);
            }}
          />
          <Button
            hidden={keyword.replace(/\s/g, "") === ""}
            onClick={() => {
              router.push("/");
            }}
          >
            Clear
          </Button>
        </div>
        <div className="w-full flex flex-col md:flex-row gap-2 grow">
          <div className="w-full flex gap-4">
            <NodeLimit limit={limit} setLimit={setLimit} />
            <NodeRefresh refresh={refresh} setRefresh={setRefresh} />
          </div>
          <NodeSort sort={sort} setSort={setSort} />
        </div>
      </div>

      <NodeTable
        nodes={visibleNodes}
        nodesInfo={nodesInfo}
        page={page}
        setPage={setPage}
        maxPage={Math.ceil(nodes.length / limit)}
      />

      <div className="flex flex-grow"></div>
    </main>
  );
}
