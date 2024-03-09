"use client";

import { Select } from "react-daisyui";

type NodeSortProps = {
  sort: string;
  setSort: (sort: string) => void;
};

export default function NodeSort(props: NodeSortProps) {
  const { sort, setSort } = props;

  return (
    <div className="flex flex-row px-2 bg-[#1C2027] text-right items-center gap-2">
      <Select
        className="h-full bg-transparent px-4 py-2 rounded-md outline-none text-right sm:text-left"
        onChange={(event) => {
          setSort(event.target.value);
          localStorage.setItem("sort", event.target.value);
        }}
        value={sort}
      >
        <Select.Option value="rank-desc">Rank (first)</Select.Option>
        <Select.Option value="rank-asc">Rank (last)</Select.Option>
        <Select.Option value="rewards-desc">Rewards (higher)</Select.Option>
        <Select.Option value="rewards-asc">Rewards (lower)</Select.Option>
        <Select.Option value="uptime-desc">Uptime (higher)</Select.Option>
        <Select.Option value="uptime-asc">Uptime (lower)</Select.Option>
      </Select>
    </div>
  );
}
