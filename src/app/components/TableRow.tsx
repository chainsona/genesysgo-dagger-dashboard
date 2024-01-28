"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { Table } from "react-daisyui";

import { formatNumbers, secondsToDhms } from "../utils/string";

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
      return "Earning";
    case "queued":
      return "Waiting";
    case "not_eligible":
      return "N/A";
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
    case "down":
      return "bg-gray-900";
    case "not_eligible":
      return "bg-red-900";
    default:
      return "bg-gray-950";
  }
}

function backgroundColorPctHelper(value: number) {
  if (value >= 90) {
    return "bg-green-700";
  } else if (value >= 75) {
    return "bg-orange-700";
  } else if (value >= 50) {
    return "bg-yellow-600";
  } else {
    return "bg-red-900";
  }
}

type TableRowProps = {
  id: string;
  is_discord_verified: boolean;
  is_up: boolean;
  key: string;
  rank: number;
  status: string;
  total_rewards: string;
  uptime: number;
  uptimeStr: string;
};

export default function TableRow(props: TableRowProps) {
  const {
    is_discord_verified,
    is_up,
    id,
    rank,
    status,
    total_rewards,
    uptime,
    uptimeStr,
  } = props;
  const [eligibleUptime, setEligibleUptime] = useState<number | null>(null);

  const getStorage = useCallback((key: string) => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  }, []);

  const setStorage = useCallback((key: string, value: string) => {
    if (typeof window !== "undefined") {
      return localStorage.setItem(key, value);
    }
  }, []);

  const fetchNodesStats = useCallback(async () => {
    if (uptime === 0) return 0;

    let assetId = getStorage(id);
    if (!assetId) {
      const res = await fetch(
        "https://mainnet.helius-rpc.com/?api-key=f92585e2-eb5d-4383-a634-3eb1de97e63b",

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "my-id",
            method: "searchAssets",
            params: {
              ownerAddress: id,
              grouping: [
                "collection",
                "5Jh2dkw5gimhPMkGYadWsNW837MgUxUo5wrNoNTwcV2c",
              ],
              burnt: false,
              page: 1,
              limit: 1000,
            },
          }),
        }
      );
      const data = await res.json();
      const asset = data?.result?.items[0];
      if (!asset) return 0;

      assetId = asset.id;
    }

    if (!assetId) return 0;

    setStorage(id, assetId);

    fetch("https://shdw-rewards-oracle.shdwdrive.com/stats?assetId=" + assetId)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setEligibleUptime(
          parseInt(data?.nodeStats?.total_eligible_uptime) || 0
        );
      });
  }, [getStorage, setStorage, setEligibleUptime, id, uptime]);

  useEffect(() => {
    fetchNodesStats();
  }, [fetchNodesStats, uptime]);

  return (
    <Table.Row
      key={id}
      className={`${backgroundColorHelper(is_up ? "up" : "down")} ${
        is_up ? "" : "text-gray-400"
      } md:h-14 text-center flex sm:table-cell flex-col sm:table-row items-center justify-center py-4 sm=py-0 gap-1 sm:gap-0 hover:bg-gray-900`}
    >
      <span className="block text-center pr-4 text-lg">#{rank}</span>
      <span className="">
        <span className="hidden sm:flex text-left items-center">{id}</span>
        <span className="sm:hidden flex text-left items-center">
          {ellipsis(id, 16)}{" "}
        </span>
      </span>
      <span className="">
        <span
          className={`${backgroundColorHelper(
            status
          )} px-6 py-1 rounded-full uppercase text-xs font-semibold w-64`}
        >
          {statusHelper(status)}
        </span>
      </span>
      <span className="block text-center">
        {is_discord_verified ? "Verified" : "Unverified"}
      </span>
      <span className="">{is_up ? "Up" : "Down"}</span>
      <span className="flex flex-col gap-1 items-center justify-center">
        <span className="">{secondsToDhms(uptime, true)}</span>
        {eligibleUptime !== null ? (
          <div className="flex gap-2">
            <span className="text-sm">{secondsToDhms(eligibleUptime)}</span>

            <span
              className={`${backgroundColorPctHelper(
                (eligibleUptime / uptime) * 100
              )} px-2 text-sm rounded-full`}
            >
              {formatNumbers((eligibleUptime / uptime) * 100)}%
            </span>
          </div>
        ) : (
          <></>
        )}
      </span>
      <span className="flex gap-2 px-4  text-right items-center justify-end">
        <div className="">
          {formatNumbers(parseInt(total_rewards) / 10 ** 9)}
        </div>
        <div className="">
          <Image src="/shdw.png" alt="SHDW" height={16} width={16} />
        </div>
      </span>
    </Table.Row>
  );
}
