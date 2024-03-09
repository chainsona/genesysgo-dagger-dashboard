"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Progress } from "react-daisyui";

import { Node } from "../types";
import { formatNumbers } from "../utils/string";

type Network = {
  bundle: number;
  epoch: number;
};

type NodeStatsProps = {
  network: Network;
  nodes: Node[];
};

export default function NodeStats({ network, nodes }: NodeStatsProps) {
  const [versions, setVersions] = useState<any | null>(null);

  const fetchVersions = useCallback(() => {
    fetch("/api/nodes/versions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setVersions(data.data))
      .catch((e: any) => {
        console.error(JSON.stringify(e));
      });
  }, []);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions, nodes]);

  const stats: any = useMemo(() => {
    return {
      earned: nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
        .length,
      earning: nodes.filter((node: Node) => node.status === "top_150").length,
      nodes: nodes.length,
      offline: nodes.filter((node: Node) => !node.is_up).length,
      rewards: formatNumbers(
        nodes.reduce(
          (acc: number, node: Node) =>
            acc + parseInt(node.total_rewards) / 10 ** 9,
          0
        )
      ),
      upgraded: !versions ? "N/A" : versions[versions.length - 1].count,
      version: !versions ? "N/A" : versions[versions.length - 1].version,
      waiting: nodes.filter((node: Node) => node.status === "queued").length,
    };
  }, [nodes, versions]);

  return (
    <div className="overflow-hidden rounded-xl bg-[#1C2027]">
      <div className="flex flex-col gap-1 p-4 font-semibold text-gray-300">
        <div className="text-lg font-semibold uppercase">Network</div>

        <div className="flex items-end gap-2 text-gray-300">
          <span className="font-normal text-gray-400 uppercase">
            Last version
          </span>
          <span className=""> {stats.version}</span>
          <span className="text-xs text-gray-500">
            {stats.upgraded} (
            {formatNumbers((stats.upgraded / stats.nodes) * 100)}%)
          </span>
        </div>

        <div
          className="flex items-center gap-2 text-gray-300"
          title="Distributed SHDW"
        >
          <div className="font-normal text-gray-400 uppercase">Distributed</div>
          <div className="font-semibold">{stats.rewards}</div>
          <div className="h-3 w-3">
            <Image src="/shdw.png" alt="SHDW" height={16} width={16} />
          </div>
        </div>

        <div className="flex gap-2 text-xl text-gray-300">
          <div className="flex items-center gap-1">
            <div className="rounded-full h-3 w-3 bg-green-700"></div>
            <span className="flex gap-2 items-center">
              {stats.earning}{" "}
              <span className="hidden sm:block text-sm">EARNING</span>
            </span>
          </div>
          {" / "}
          <div className="flex items-center gap-1">
            <div className="rounded-full h-3 w-3 bg-blue-700"></div>
            <span className="flex gap-2 items-center">
              {stats.waiting}{" "}
              <span className="hidden sm:block text-sm">WAITING</span>
            </span>
          </div>
          {" / "}
          <div className="flex items-center gap-1">
            <div className="rounded-full h-3 w-3 bg-gray-500"></div>
            <span className="flex gap-2 items-center text-gray-500">
              {stats.offline}{" "}
              <span className="hidden sm:block text-sm">OFFLINE</span>
            </span>
          </div>
          {" / "}
          <span className="font-semibold">{stats.nodes}</span>
        </div>
      </div>

      {network && (
        <div className="w-full flex flex-col gap-1">
          <div
            className="w-full flex items-center justify-between gap-3 px-4
            text-gray-400 text-sm text-center font-normal uppercase"
          >
            <div className="">Epoch: {formatNumbers(network.epoch, 0)}</div>
            <div className="">{network.bundle % 128} / 128</div>
            <div className="">Bundle: {formatNumbers(network.bundle, 0)}</div>
          </div>

          <div className="relative overflow-hidden h-1">
            <Progress className="w-full" value={(network.bundle % 128) / 128} />
          </div>
        </div>
      )}
    </div>
  );
}
