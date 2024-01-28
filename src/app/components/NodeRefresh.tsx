"use client";

import { Input } from "react-daisyui";
import { getLocalStorage } from "../utils/storage";

type NodeRefreshProps = {
  refresh: string;
  setRefresh: (sort: string) => void;
};

export default function NodeRefresh(props: NodeRefreshProps) {
  const { refresh, setRefresh } = props;

  return (
    <div className="flex flex-row text-right items-center gap-2">
      <div className="sm:w-28 text-gray-400 text text-center">
        Refresh (min)
      </div>
      <Input
        id="refresh"
        placeholder="Refresh interval (minutes)"
        className="w-20 px-4 py-2 bg-base-100 rounded-md bg-gray-900"
        value={getLocalStorage(window, "refresh") || refresh}
        type="number"
        min={1}
        onChange={() => {
          try {
            const minutes = (
              document.getElementById("refresh") as HTMLInputElement
            ).value;
            parseInt(minutes);
            localStorage.setItem("refresh", minutes);
            setRefresh(minutes);
          } catch (e) {
            return;
          }
        }}
      />
    </div>
  );
}
