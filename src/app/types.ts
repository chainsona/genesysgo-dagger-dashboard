type Node = {
  rank: number;
  node_id: string;
  is_discord_verified: boolean;
  is_up: boolean;
  status: string;
  uptime: string;
  uptimeStr: string;
  total_rewards: string;
};

type NodeInfo = {
  node_id: string;
  cpu: number;
  ram: number;
  storage: number;
  cpu_type: string;
  last_updated: string;
  wield_version: string;
  lat: number;
  lon: number;
  ip_addr: string;
};

export type { Node, NodeInfo };
