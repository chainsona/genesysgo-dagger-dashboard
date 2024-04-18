"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";

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
    case "up":
      return "bg-green-900";
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
  const testnet2LaunchDate = 1705289977000;
  const testnet2EndDate = 1713290400000;

  const diff = Math.min(testnet2EndDate, Date.now()) - testnet2LaunchDate;
  const cappedUptime = uptime > diff ? diff : uptime;
  const relativeUptime = cappedUptime / diff;

  return relativeUptime;
}

type NodeListItemProps = {
  id: string;
  is_discord_verified: boolean;
  is_up: boolean;
  key: string;
  rank: number;
  status: string;
  total_rewards: string;
  uptime: number;
  uptimeStr: string;
  nodeConfig?: any;
};

export default function NodeListItem(props: NodeListItemProps) {
  const {
    is_discord_verified,
    is_up,
    id,
    rank,
    status,
    total_rewards,
    uptime,
    nodeConfig,
  } = props;
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
    <div
      key={id}
      className={`${
        is_up ? "" : "text-gray-400"
      } w-full flex flex-col p-4 gap-2 bg-[#1C2027] hover:bg-gray-900 text-gray-300`}
    >
      {/* NODE */}
      <div className="flex gap-3 justify-start">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {/* RANK */}
            <div className="w-24 flex items-center justify-start">
              <div
                className={`w-full rounded-lg h-12
                flex items-center justify-center
                ${statusColorHelper(
                  is_up ? status : "down"
                )} p-1 px-2 font-semibold`}
              >
                #{rank}
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-1">
              <div className="w-full flex items-center justify-between">
                {/* NODE ID */}
                <div className="flex text-gray-300 text-left items-center">
                  <Link
                    className="hover:underline"
                    href={`https://solana.fm/account/${id}`}
                    passHref
                    target="_blank"
                  >
                    <div className="">{ellipsis(id, 12)}</div>
                  </Link>{" "}
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
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        ></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </div>
                  </CopyToClipboard>
                </div>
              </div>

              <div className="w-full flex items-center justify-start gap-2">
                {/* AVAILABILITY */}
                <div className="uppercase text-sm font-semibold">
                  {is_up ? "Up" : "Down"}
                </div>

                {/* DISCORD */}
                <div className="flex items-center gap-2 text-sm text-gray-300">
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
                </div>
                {/* STATUS */}
                <div className="">
                  <div
                    className={`w-full rounded-full px-3 py-1 ${statusColorHelper(
                      status
                    )} font-semibold text-xs`}
                  >
                    {statusHelper(status)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-1 px-1">
        {/* SPECS */}
        {nodeConfig && (
          <div className="w-full flex flex-col gap-1 items-center text-gray-300">
            {/* CPU */}
            <div className="w-full flex flex-col gap-1 items-center text-sm font-semibold">
              <div className="w-full flex items-center gap-1 text-clip overflow-hidden">
                <div className="inline">
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
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                      ry="2"
                    ></rect>
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
                </div>
                {nodeConfig.cpu} Cores {nodeConfig.cpu_type}
              </div>
              <div className="w-full text-gray-400"></div>
            </div>

            <div className="w-full flex gap-1 items-center">
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

              {/* VERSION */}
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

        {/* UPTIME */}
        <div className="w-full flex flex-col gap-1 items-center">
          <div className="w-full flex gap-2 items-center">
            <span className="font-semibold text-sm">TOTAL UPTIME</span>
            <span className="">{secondsToDhms(uptime, true)}</span>
            <span className={`font-semibold text-xs text-gray-500`}>
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
              ({formatNumbers(getNormalizedUptime(uptime) * 100)}%)
            </span>
          </div>

          {eligibleUptime !== null ? (
            <div className="w-full flex gap-2 items-center">
              <span className="font-semibold text-sm">EARNING UPTIME</span>
              <span className="text-sm">{secondsToDhms(eligibleUptime)}</span>
              <span
                className={`font-semibold text-xs text-gray-500`}
                title="Percentage of uptime node was eligible for rewards during Testnet2."
              >
                ({formatNumbers(getNormalizedUptime(eligibleUptime) * 100)}%)
              </span>{" "}
              <span className={`flex items-center`}></span>
            </div>
          ) : (
            <></>
          )}
        </div>

        {/* BALANCE */}
        <div className="w-full flex gap-1 items-center text-gray-300">
          <div className="font-semibold uppercase">Balance</div>
          <div className="flex gap-1 items-center">
            <div className="">
              {formatNumbers((shdwBalance || 0) + (shdwStake || 0))}
            </div>
            <div className="h-3 w-3">
              <Image src="/shdw.png" alt="SHDW" height={16} width={16} />
            </div>
            {!!shdwStake && (
              <div className="text-gray-400 text-xs">
                {formatNumbers(shdwStake || 0)} STAKED
              </div>
            )}
          </div>
        </div>

        {/* TOTAL REWARDS */}
        <div className="flex items-center gap-1 text-gray-300">
          <div className="font-semibold uppercase">Rewards</div>
          <div className="">
            {formatNumbers(parseInt(total_rewards) / 10 ** 9)}
          </div>
          <div className="h-3 w-3">
            <Image src="/shdw.png" alt="SHDW" height={16} width={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
