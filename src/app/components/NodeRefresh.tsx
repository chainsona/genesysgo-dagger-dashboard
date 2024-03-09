"use client";

import { Input } from "react-daisyui";

type NodeRefreshProps = {
  refresh: string;
  setRefresh: (sort: string) => void;
};

export default function NodeRefresh(props: NodeRefreshProps) {
  const { refresh, setRefresh } = props;

  const handleChange = (e: any) => {
    if (typeof window !== "undefined") {
      try {
        const minutes = (document.getElementById("refresh") as HTMLInputElement)
          .value;
        parseInt(minutes);
        localStorage.setItem("refresh", minutes);
        setRefresh(minutes);
      } catch (err: any) {
        console.error(JSON.stringify(err));
        return;
      }
    }
  };

  return (
    <div className="w-full flex text-right items-center md:justify-end gap-2">
      <div className="w-36 text-gray-400 text-sm text-center">
        Refresh (min)
      </div>
      <Input
        id="refresh"
        placeholder="Refresh interval (minutes)"
        className="w-full md:w-20 px-4 py-3 rounded-md bg-[#1C2027] text-gray-300"
        value={refresh}
        type="number"
        min={1}
        onChange={handleChange}
      />
    </div>
  );
}
