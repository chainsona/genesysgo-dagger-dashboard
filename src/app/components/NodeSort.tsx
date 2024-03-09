"use client";

import { Select } from "react-daisyui";

type NodeSortProps = {
  sort: string;
  setSort: (sort: string) => void;
};

export default function NodeSort(props: NodeSortProps) {
  const { sort, setSort } = props;

  return (
    <Select
      className="h-8 px-2 py-1 rounded-md bg-[#323232] text-right outline-none"
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
  );
}
