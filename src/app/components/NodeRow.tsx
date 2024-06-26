"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Table } from "react-daisyui";
import { toast } from "react-toastify";

import { NodeInfo } from "../types";
import { formatNumbers, secondsToDhms } from "../utils/string";

import { rpcEndpoint } from "../config";

function ellipsis(str: string, max: number) {
  if (str.length <= max) {
    return str;
  }

  const mid = Math.floor(max / 2);
  return str.slice(0, mid) + "..." + str.slice(str.length - mid);
}

function statusHelper(status: string) {
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

function statusColorHelper(status: string) {
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

function percentageColorHelper(value: number) {
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
  const testnet2LaunchDate = 1705289977000; // 2024-01-16T18:00:00.000Z
  const testnet2EndDate = 1713290400000; // 2024-02-16T18:00:00.000Z

  const diff = Math.min(testnet2EndDate, Date.now()) - testnet2LaunchDate;
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
  nodeConfig?: NodeInfo;
};

export default function TableRow({
  is_discord_verified,
  is_up,
  id,
  rank,
  status,
  total_rewards,
  uptime,
  nodeConfig,
}: TableRowProps) {
  const [eligibleUptime, setEligibleUptime] = useState<number | null>(null);
  const [shdwBalance, setShdwBalance] = useState<number | null>(null);
  const [shdwStake, setShdwStake] = useState<number | null>(null);

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
        const res = await fetch(rpcEndpoint, {
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
        });
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

  const fetchShdwBalance = useCallback(async () => {
    try {
      const balance = await fetch(`/api/balances?id=${id}`);
      const data = await balance.json();

      setShdwBalance(data.data || 0);
    } catch (e: any) {
      console.error(JSON.stringify(e));
    }
  }, [id]);

  const fetchShdwStake = useCallback(async () => {
    const stakedRes = await fetch(`/api/balances/staked?id=${id}`);
    const stakedData = await stakedRes.json();

    setShdwStake(stakedData.data || 0);
  }, []);

  useEffect(() => {
    fetchNodesStats();
    fetchShdwBalance();
    fetchShdwStake();
  }, [fetchNodesStats, fetchShdwBalance, fetchShdwStake, uptime]);

  return (
    <Table.Row
      key={id}
      className={`md:h-20 flex sm:table-cell flex-col sm:table-row
        items-center justify-center gap-1 py-4 sm=py-0
        bg-[#1C2027] hover:bg-gray-900 text-center text-gray-300`}
    >
      {/* RANK */}
      {/* <span className="block text-center pr-4 text-lg">#{rank}</span> */}
      <div className="w-24 flex items-center justify-center">
        <div
          className={`rounded-lg h-12
        flex items-center justify-center
        ${statusColorHelper(is_up ? status : "down")} p-1 px-4 font-semibold`}
        >
          #{rank}
        </div>
      </div>

      <div className="flex flex-col gap-1 items-center">
        {/* NODE ID */}
        <div className="items-center">
          <div className="hidden sm:flex text-left items-center">
            <Link
              className="hover:underline"
              href={`https://solana.fm/account/${id}`}
              passHref
              target="_blank"
            >
              {id}
            </Link>
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
          </div>
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
        </div>

        {/* NODE CONFIG */}
        {nodeConfig && (
          <div className="flex flex-col 2xl:flex-row gap-1 items-center text-gray-400">
            {/* CPU */}
            <div className="flex gap-1 items-center">
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
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <line x1="9" y1="1" x2="9" y2="4"></line>
                <line x1="15" y1="1" x2="15" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="23"></line>
                <line x1="15" y1="20" x2="15" y2="23"></line>
                <line x1="20" y1="9" x2="23" y2="9"></line>
                <line x1="20" y1="14" x2="23" y2="14"></line>
                <line x1="1" y1="9" x2="4" y2="9"></line>
                <line x1="1" y1="14" x2="4" y2="14"></line>
              </svg>
              <div className="text-sm font-semibold">{nodeConfig.cpu_type}</div>
              <div className="text-sm font-semibold">
                {nodeConfig.cpu} Cores
              </div>
            </div>

            <div className="flex gap-1 items-center">
              {/* RAM */}
              <div className="flex gap-1 items-center">
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
                  <path d="M6 19v-3"></path>
                  <path d="M10 19v-3"></path>
                  <path d="M14 19v-3"></path>
                  <path d="M18 19v-3"></path>
                  <path d="M8 11V9"></path>
                  <path d="M16 11V9"></path>
                  <path d="M12 11V9"></path>
                  <path d="M2 15h20"></path>
                  <path d="M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.1a2 2 0 0 0 0 3.837V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.1a2 2 0 0 0 0-3.837Z"></path>
                </svg>
                <div className="text-sm font-semibold">
                  {Math.floor(nodeConfig.ram / 1000000)}GB
                </div>
              </div>

              {/* DISK */}
              <div className="flex gap-1 items-center">
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
                  <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                </svg>
                <div className="text-sm font-semibold">
                  {Math.floor(nodeConfig.storage / 1000000)}GB
                </div>
              </div>

              {/* SHDW NODE CLIENT */}
              <div className="flex gap-1 items-center">
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
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M3 5m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z"></path>
                  <path d="M6 8h.01"></path>
                  <path d="M9 8h.01"></path>
                </svg>
                <div className="text-sm font-semibold">
                  {nodeConfig.version}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AVAILABILITY */}
      <span className="uppercase text-sm font-semibold">
        {is_up ? "Up" : "Down"}
      </span>

      {/* STATUS */}
      <div className="w-32 px-4">
        <div
          className={`w-full ${statusColorHelper(
            status
          )} px-4 sm:px-6 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold`}
        >
          {statusHelper(status)}
        </div>
      </div>

      {/* DISCORD */}
      <span className="flex text-center items-center gap-2">
        <div className="sm:hidden">
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
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

      {/* BALANCE */}
      <span className="flex flex-col gap-2 px-4 text-right items-center justify-end">
        <div className="flex gap-2 items-center">
          <div className="">
            {formatNumbers((shdwBalance || 0) + (shdwStake || 0))}
          </div>
          {/* <div className="">
            <Image src="/shdw.png" alt="SHDW" height={16} width={16} />
          </div> */}
        </div>

        <span className="text-sm text-gray-400">
          {formatNumbers(shdwStake || 0)}
        </span>
      </span>

      {/* UPTIME */}
      <div className="w-52 flex flex-col gap-1 items-center justify-center px-4">
        <div className="flex gap-2 items-center">
          <span className="">{secondsToDhms(uptime, true)}</span>
          <span className={`font-semibold text-xs text-gray-500`}>
            ({formatNumbers(getNormalizedUptime(uptime) * 100)}%)
          </span>
        </div>

        {eligibleUptime !== null ? (
          <div className="flex gap-2 justify-center items-center">
            <span className="text-sm text-gray-400">
              {secondsToDhms(eligibleUptime)}
            </span>

            <span className={`flex items-center`}>
              <span
                className={`font-semibold text-xs text-gray-500`}
                title="Percentage of uptime node was eligible for rewards during Testnet2."
              >
                ({formatNumbers(getNormalizedUptime(eligibleUptime) * 100)}%)
              </span>
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>

      {/* TOTAL REWARDS */}
      <span className="flex gap-2 px-4 text-right items-center justify-end">
        <div className="">
          {formatNumbers(parseInt(total_rewards) / 10 ** 9)}
        </div>
        {/* <div className="">
          <Image src="/shdw.png" alt="SHDW" height={16} width={16} />
        </div> */}
      </span>
    </Table.Row>
  );
}
