"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import ControlPanel from "./components/ControlPanel";
import Header from "./components/Header";
import NodeStats from "./components/NodeStats";
import NodeTable from "./components/NodeTable";

import { Node } from "./types";
import { secondsToDhms } from "./utils/string";

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
    }, 2000);

    return () => {
      clearInterval(timer);
    };
  }, [fetchNetwork]);

  const filteredNodes = useMemo(() => {
    return nodes.filter(
      (node: Node) =>
        keyword === "" ||
        node.node_id.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().split(",").includes(node.node_id.toLowerCase())
    );
  }, [keyword, nodes]);

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
  }, [keyword, limit, nodes, page, sort]);

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
    <main
      className="overflow-hidden min-h-screen w-full
      flex flex-col gap-4 pb-4 bg-[#1E1E1E] text-left"
    >
      <div className="z-10 fixed w-full bg-[#1E1E1E] pb-2">
        <Header />
      </div>

      <div className="flex flex-col gap-4 p-4 pt-20 pb-24">
        <NodeStats network={network} nodes={nodes} />

        <NodeTable
          maxPage={Math.ceil(
            (!!keyword ? visibleNodes.length : nodes.length) / limit
          )}
          nodes={visibleNodes}
          nodesInfo={nodesInfo}
          page={page}
          sort={sort}
          setPage={setPage}
          setSort={setSort}
        />
      </div>

      <div className="z-10 fixed bottom-4 left-6 right-6">
        <ControlPanel
          keyword={keyword}
          limit={limit}
          nodes={filteredNodes}
          refresh={refresh}
          sort={sort}
          setFilter={setFilter}
          setLimit={setLimit}
          setRefresh={setRefresh}
          setSort={setSort}
        />
      </div>
    </main>
  );
}
