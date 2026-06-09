export interface DetailRow {
  label: string;
  value: string;
}

export interface DivisionStatus {
  status: "normal" | "degraded" | "critical";
  lastUpdated: string;
  details: DetailRow[];
  recentLogs: string[];
}

export interface Circuit {
  id: number;
  name: string;
  badge: string;
  systemCode: string;
  description: string;
  divisionData: Record<string, DivisionStatus>;
  category: string;
}

export interface UserProfile {
  username: string;
  role: "admin" | "testroom";
  division?: string;
}
