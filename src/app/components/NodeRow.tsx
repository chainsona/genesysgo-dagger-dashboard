"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Table } from "react-daisyui";
import { toast } from "react-toastify";

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
  if (value >= 95) {
    return "bg-purple-700";
  } else if (value >= 90) {
    return "bg-green-700";
  } else if (value >= 75) {
    return "bg-orange-700";
  } else if (value >= 50) {
    return "bg-yellow-600";
  } else {
    return "bg-red-900";
  }
}

function getNormalizedUptime(uptime: number) {
  // Not using the official launch date because some nodes were launched before
  // const testnet2LaunchDate = new Date("2024-01-16T18:00:00.000Z").getTime();

  // Using the actual launch date of the testnet from higher uptime
  const testnet2LaunchDate = 1705289977000;

  const diff = Date.now() - testnet2LaunchDate;
  const cappedUptime = uptime > diff ? diff : uptime;
  const relativeUptime = cappedUptime / diff;

  return relativeUptime;
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
    if (!window) return null;

    return localStorage.getItem(key);
  }, []);

  const setStorage = useCallback((key: string, value: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  }, []);

  const fetchNodesStats = useCallback(async () => {
    if (uptime === 0) return 0;

    let assetId = getStorage(id);
    if (!assetId) {
      try {
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
      } catch (e: any) {
        console.error(JSON.stringify(e));
      }
    }

    if (!assetId) return 0;

    setStorage(id, assetId);

    fetch("https://shdw-rewards-oracle.shdwdrive.com/stats?assetId=" + assetId)
      .then((res) => res.json())
      .then((data) => {
        setEligibleUptime(
          parseInt(data?.nodeStats?.total_eligible_uptime) || 0
        );
      })
      .catch((e: any) => {
        console.error(JSON.stringify(e));
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
      } md:h-20 text-center flex sm:table-cell flex-col sm:table-row items-center justify-center py-4 sm=py-0 gap-1 sm:gap-0 hover:bg-gray-900`}
    >
      <span className="block text-center pr-4 text-lg">#{rank}</span>

      <span className="">
        <span className="hidden sm:flex text-left items-center">
          {id}
          <CopyToClipboard text={id}>
            <div className="pl-2 hover: cursor-pointer">
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
          </CopyToClipboard>
        </span>
        <span className="sm:hidden flex text-left items-center">
          {ellipsis(id, 16)}{" "}
          <CopyToClipboard text={id}>
            <div
              className="pl-2 hover: cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(id);
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
          </CopyToClipboard>
        </span>
      </span>

      <span className="uppercase text-sm font-semibold">
        {is_up ? "Up" : "Down"}
      </span>

      <span className="px-4">
        <span
          className={`${backgroundColorHelper(
            status
          )} px-4 sm:px-6 py-1 sm:py-2 rounded-full uppercase text-xs sm:text-sm font-semibold w-64`}
        >
          {statusHelper(status)}
        </span>
      </span>

      <span className="flex text-center items-center gap-2">
        <div className="sm:hidden">
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 640 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
          </svg>
        </div>
        {is_discord_verified ? "Verified" : "Unverified"}
      </span>

      <span className="flex flex-col gap-1 items-center justify-center px-4">
        <div className="flex gap-2 items-center">
          <span className="">{secondsToDhms(uptime, true)}</span>
          <span
            className={`block ${backgroundColorPctHelper(
              getNormalizedUptime(uptime) * 100
            )} px-2 text-sm rounded-full flex gap-2 items-center`}
          >
            {getNormalizedUptime(uptime) >= 0.95 ? (
              <Link
                href="https://docs.shdwdrive.com/token/rewards#operatorss"
                passHref
                target="_blank"
              >
                <div
                  className=""
                  title="Node qualifies for additional rewards for uptime >=2,096 hours (approx. 95% of Testnet2)."
                >
                  <Image src="/shdw.png" alt="SHDW" height={12} width={12} />
                </div>
              </Link>
            ) : (
              ""
            )}
            {formatNumbers(getNormalizedUptime(uptime) * 100)}%{" "}
          </span>
        </div>

        {eligibleUptime !== null ? (
          <div className="flex gap-2 items-center">
            <span className="text-sm">{secondsToDhms(eligibleUptime)}</span>

            <span className={`flex items-center`}>
              <span
                className={`block ${backgroundColorPctHelper(
                  getNormalizedUptime(eligibleUptime) * 100
                )} px-2 text-sm rounded-full flex gap-2 items-center`}
                title="Percentage of uptime node was eligible for rewards during Testnet2."
              >
                {formatNumbers(getNormalizedUptime(eligibleUptime) * 100)}%
              </span>
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
