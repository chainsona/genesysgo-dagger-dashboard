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

  const getStorage = (key: string) => {
    if (!window) return null;

    return localStorage.getItem(key);
  };

  return (
    <div className="w-full flex text-right items-center gap-2">
      <div className="w-48 text-gray-400 text text-center">Refresh (min)</div>
      <Input
        id="refresh"
        placeholder="Refresh interval (minutes)"
        className="w-full px-4 py-3 rounded-md bg-[#323232]"
        value={refresh}
        type="number"
        min={1}
        onChange={handleChange}
      />
    </div>
  );
}
