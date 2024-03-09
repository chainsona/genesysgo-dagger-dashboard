"use client";

import { Select } from "react-daisyui";

type NodeLimitProps = {
  limit: number;
  setLimit: (limit: number) => void;
};

export default function NodeLimit(props: NodeLimitProps) {
  const { limit, setLimit } = props;

  return (
    <div className="flex flex-row items-center justify-end gap-2 px-2 bg-[#1C2027] text-right">
      <Select
        className="h-full bg-transparent px-4 py-3 rounded-md outline-none"
        onChange={(event) => {
          setLimit(parseInt(event.target.value));
        }}
        value={limit}
      >
        <Select.Option value="10">10 / page</Select.Option>
        <Select.Option value="20">20 / page</Select.Option>
        <Select.Option value="50">50 / page</Select.Option>
        <Select.Option value="100">100 / page</Select.Option>
        <Select.Option value="150">150 / page</Select.Option>
      </Select>
    </div>
  );
}
