"use client";

import { Select } from "react-daisyui";

type NodeLimitProps = {
  limit: number;
  setLimit: (limit: number) => void;
};

export default function NodeLimit(props: NodeLimitProps) {
  const { limit, setLimit } = props;

  return (
    <div className="w-full flex flex-row text-right items-center gap-2">
      <Select
        className="w-full px-4 py-2 bg-base-100 rounded-md bg-gray-900"
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
