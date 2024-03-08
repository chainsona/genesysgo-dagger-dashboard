"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Node } from "../types";
import { formatNumbers } from "../utils/string";
import { Progress } from "react-daisyui";
import Image from "next/image";

type Network = {
  epoch: number;
  bundle: number;
};

type NodeStat = {
  title: string;
  value: string | number;
  note?: string;
};

type NodeStatsProps = {
  nodes: Node[];
  network: Network;
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
      nodes: nodes.length,
      earning: nodes.filter((node: Node) => node.status === "top_150").length,
      version: !versions ? "N/A" : versions[versions.length - 1].version,
      upgraded: !versions ? "N/A" : versions[versions.length - 1].count,
      waiting: nodes.filter((node: Node) => node.status === "queued").length,
      offline: nodes.filter((node: Node) => !node.is_up).length,
      earned: nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
        .length,
      rewards: formatNumbers(
        nodes.reduce(
          (acc: number, node: Node) =>
            acc + parseInt(node.total_rewards) / 10 ** 9,
          0
        )
      ),
    };

    // return [
    //   {
    //     title: "shdwNodes",
    //     value: nodes.length,
    //   },
    //   {
    //     title: !versions
    //       ? "shdwNode version"
    //       : "shdwNode version " + versions[versions.length - 1].version,
    //     value: !versions ? "N/A" : versions[versions.length - 1].count,
    //     note: !versions
    //       ? "N/A"
    //       : formatNumbers(
    //           (versions[versions.length - 1].count / nodes.length) * 100
    //         ) + "%",
    //   },
    //   {
    //     title: "Waiting shdwNodes",
    //     value: nodes.filter((node: Node) => node.status === "queued").length,
    //     note:
    //       formatNumbers(
    //         (nodes.filter((node: Node) => node.status === "queued").length /
    //           nodes.length) *
    //           100
    //       ) + "%",
    //   },
    //   {
    //     title: "Offline shdwNodes",
    //     value: nodes.filter((node: Node) => !node.is_up).length,
    //     note:
    //       formatNumbers(
    //         (nodes.filter((node: Node) => !node.is_up).length / nodes.length) *
    //           100
    //       ) + "%",
    //   },
    //   {
    //     title: "Earned Rewards",
    //     value: nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
    //       .length,
    //     note:
    //       formatNumbers(
    //         (nodes.filter((node: Node) => parseInt(node.total_rewards) > 0)
    //           .length /
    //           nodes.length) *
    //           100
    //       ) + "%",
    //   },
    //   {
    //     title: "Distributed Rewards",
    //     value: formatNumbers(
    //       nodes.reduce(
    //         (acc: number, node: Node) =>
    //           acc + parseInt(node.total_rewards) / 10 ** 9,
    //         0
    //       )
    //     ),
    //   },
    // ];
  }, [nodes, versions]);

  return (
    <div className="overflow-hidden rounded-xl bg-[#1C2027]">
      <div className="flex flex-col gap-4 p-4 text-gray-300">
        <div className="flex justify-between items-start">
          <div className="">
            <div className="text-xl font-semibold">Shdw Nodes</div>
            <div className="text-lg text-gray-400 font-semibold">
              Version {stats.version}{" "}
              <span className="text-xs text-gray-500">
                {stats.upgraded} (
                {formatNumbers((stats.upgraded / stats.nodes) * 100)}%)
              </span>
              <span className="text-gray-400">{}</span>
            </div>
          </div>

          <div
            className="flex items-center gap-1 text-gray-400"
            title="Distributed SHDW"
          >
            <div className="">
              <Image src="/shdw.png" alt="SHDW" height={16} width={16} />
            </div>
            <div className="text-lg font-semibold">{stats.rewards}</div>
          </div>
        </div>

        <div className="flex gap-2 text-xl text-gray-300">
          <div className="flex items-center gap-1">
            <div className="rounded-full h-3 w-3 bg-green-700"></div>
            <span className="">
              {stats.earning}{" "}
              <span className="hidden sm:block text-sm">EARNING</span>
            </span>
          </div>
          {" / "}
          <div className="flex items-center gap-1">
            <div className="rounded-full h-3 w-3 bg-blue-700"></div>
            <span className="">
              {stats.waiting}{" "}
              <span className="hidden sm:blocktext-sm">WAITING</span>
            </span>
          </div>
          {" / "}
          <span className="font-semibold text-gray-400">{stats.offline}</span>
          {" / "}
          <span className="font-semibold">{stats.nodes}</span>
        </div>
      </div>

      {network && (
        <div className="w-full flex flex-col gap-1">
          <div
            className="w-full flex items-center justify-between gap-3 px-4
            text-gray-400 text-sm text-center font-semibold uppercase"
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
