interface HistoryItem {
  id: string;
  timestamp: string;
  division: string;
  category: string;
  circuitName: string;
  status: string;
  details: string;
  remarks?: string;
}

interface HistoryViewProps {
  allSavedHistory: HistoryItem[];
}

export default function HistoryView({ allSavedHistory }: HistoryViewProps) {
  return (
    <div className="history-view-panel" style={{ width: "100%", padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 800, textTransform: "uppercase", color: "var(--text-color)" }}>
          SECR Telecom Operations Log Registry
        </h2>
        <span className="badge normal" style={{ padding: "6px 12px", borderRadius: "12px", fontWeight: "700" }}>
          Total Entries: {allSavedHistory.length}
        </span>
      </div>

      {/* Logs Table Card */}
      <div className="detail-card" style={{ padding: "0", overflow: "hidden" }}>
        {allSavedHistory.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", margin: 0 }}>
              <thead>
                <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>ID</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>Timestamp</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>Division</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>Circuit Category</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>Circuit/System</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>Status</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>Log details</th>
                  <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", borderBottom: "1px solid #E2E8F0" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {allSavedHistory.map((h, i) => (
                  <tr key={h.id} style={{ borderBottom: i === allSavedHistory.length - 1 ? "none" : "1px solid #E2E8F0" }}>
                    <td style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#2563EB" }}>{h.id}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#4B5563" }}>{h.timestamp}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: "#4B5563" }}>{h.division}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#6B7280" }}>{h.category}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "700", color: "#1F2937" }}>{h.circuitName}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px" }}>
                      <span className={`badge ${h.status === "Rectified" || h.status === "Tested" ? "normal" : "critical"}`} style={{ padding: "2px 6px", fontSize: "10px" }}>
                        {h.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#4B5563", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={h.details}>{h.details}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", color: "#4B5563", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={h.remarks}>{h.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>
            No historical records or logs found in division.
          </div>
        )}
      </div>
    </div>
  );
}
