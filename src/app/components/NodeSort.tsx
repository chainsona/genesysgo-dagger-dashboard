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
      className="w-full md:w-64 px-4 py-2 rounded-md bg-[#1C2027]"
      onChange={(event) => {
        setSort(event.target.value);
        localStorage.setItem("sort", event.target.value);
      }}
      value={sort}
    >
      <Select.Option value="rank-desc">Rank (first to last)</Select.Option>
      <Select.Option value="rank-asc">Rank (last to first)</Select.Option>
      <Select.Option value="rewards-desc">
        Rewards (higher to lower)
      </Select.Option>
      <Select.Option value="rewards-asc">
        Rewards (lower to higher)
      </Select.Option>
      <Select.Option value="uptime-desc">
        Uptime (higher to lower)
      </Select.Option>
      <Select.Option value="uptime-asc">Uptime (lower to higher)</Select.Option>
    </Select>
  );
}
