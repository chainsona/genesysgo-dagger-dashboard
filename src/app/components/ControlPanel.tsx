"use client";

import { Button, Input } from "react-daisyui";
import NodeRefresh from "./NodeRefresh";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatNumbers } from "../utils/string";
import Image from "next/image";
import { Node } from "../types";
import NodeLimit from "./NodeLimit";
import NodeSort from "./NodeSort";

type ControlPanelProps = {
  keyword: string;
  limit: number;
  nodes: Node[];
  refresh: string;
  sort: string;
  setFilter: (keyword: string) => void;
  setLimit: (limit: number) => void;
  setRefresh: (refresh: string) => void;
  setSort: (sort: string) => void;
};

export default function ControlPanel({
  keyword,
  limit,
  nodes,
  refresh,
  sort,
  setFilter,
  setLimit,
  setRefresh,
  setSort,
}: ControlPanelProps) {
  const router = useRouter();

  const [currentControl, setCurrentControl] = useState<string | null>("false");

  return (
    <div
      className="overflow-hidden rounded-xl border-2 border-[#1C2027] flex flex-col gap-3
        bg-[#14161C] p-3"
    >
      {currentControl === "search" && (
        <div className="">
          {/* SEARCH */}
          <div className="rounded-xl w-full flex flex-row items-center gap-2 bg-[#1C2027] px-2">
            <Input
              id="search"
              placeholder="Search by node ID (id1,id2,...)"
              className="w-full px-4 py-3 rounded-md bg-transparent"
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
              className="text-gray-400"
              onClick={() => {
                router.push("/");
              }}
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                version="1.2"
                baseProfile="tiny"
                viewBox="0 0 24 24"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 4c-4.419 0-8 3.582-8 8s3.581 8 8 8 8-3.582 8-8-3.581-8-8-8zm3.707 10.293c.391.391.391 1.023 0 1.414-.195.195-.451.293-.707.293s-.512-.098-.707-.293l-2.293-2.293-2.293 2.293c-.195.195-.451.293-.707.293s-.512-.098-.707-.293c-.391-.391-.391-1.023 0-1.414l2.293-2.293-2.293-2.293c-.391-.391-.391-1.023 0-1.414s1.023-.391 1.414 0l2.293 2.293 2.293-2.293c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414l-2.293 2.293 2.293 2.293z"></path>
              </svg>
            </Button>
          </div>
        </div>
      )}

      {currentControl === "options" && (
        <div className="h-full flex gap-2">
          {/* OPTIONS */}
          <div className="w-40 h-full">
            <NodeRefresh refresh={refresh} setRefresh={setRefresh} />
          </div>
          <div className="w-full h-full">
            <NodeLimit limit={limit} setLimit={setLimit} />
          </div>
          <div className="hidden sm:flex">
            <NodeSort sort={sort} setSort={setSort} />
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3 text-gray-300">
        {/* NODES SUMMARY */}
        <div className="grow flex flex-col font-semibold uppercase">
          <div className="">{nodes.length} Nodes</div>
          <div className="flex items-center gap-1">
            <div className="text-gray-200">
              {formatNumbers(
                (nodes || []).reduce(
                  (acc: number, node: Node) => acc + Number(node.total_rewards),
                  0
                ) /
                  10 ** 9
              )}
            </div>
            <div className="h-3 w-3">
              <Image src="/shdw.png" alt="SHDW" height={16} width={16} />
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <Button
          className={`rounded-xl h-12 w-12 flex items-center justify-center
            ${
              currentControl === "search"
                ? "bg-gray-400 text-gray-900"
                : "bg-[#33343E] text-gray-300"
            }`}
          onClick={() => {
            setCurrentControl(currentControl !== "search" ? "search" : null);
          }}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M464 428 339.92 303.9a160.48 160.48 0 0 0 30.72-94.58C370.64 120.37 298.27 48 209.32 48S48 120.37 48 209.32s72.37 161.32 161.32 161.32a160.48 160.48 0 0 0 94.58-30.72L428 464zM209.32 319.69a110.38 110.38 0 1 1 110.37-110.37 110.5 110.5 0 0 1-110.37 110.37z"></path>
          </svg>
        </Button>

        {/* REFRESH */}
        <Button
          className={`rounded-xl h-12 w-12 flex items-center justify-center
            ${
              currentControl === "refresh"
                ? "bg-gray-400 text-gray-900"
                : "bg-[#33343E] text-gray-300"
            }`}
          onClick={() => {
            setCurrentControl(currentControl !== "options" ? "options" : null);
          }}
        >
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="20"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20 7h-9"></path>
            <path d="M14 17H5"></path>
            <circle cx="17" cy="17" r="3"></circle>
            <circle cx="7" cy="7" r="3"></circle>
          </svg>
        </Button>
      </div>
    </div>
  );
}
