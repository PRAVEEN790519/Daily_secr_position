export default function DashboardView() {
  return (
    <div className="dashboard-view-panel" style={{ width: "100%", padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
      <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontStyle: "italic" }}>
        Dashboard content will be configured here.
      </div>
    </div>
  );
}
