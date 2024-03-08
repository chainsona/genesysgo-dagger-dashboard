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
import Header from "./components/Header";

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
    <main className="dark flex flex-col min-h-screen max-h-screen w-full text-left overflow-x-auto gap-4">
      <Header />

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
        maxPage={Math.ceil(
          (!!keyword ? visibleNodes.length : nodes.length) / limit
        )}
      />

      <div className="flex flex-grow"></div>
    </main>
  );
}
