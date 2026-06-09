import { Circuit, DivisionStatus } from "../../types";
import HierarchicalFields from "./HierarchicalFields";

interface GeneralStatusFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  activeStatus: DivisionStatus | undefined;
  displayLogs: string[];
  formErrors: Record<string, string>;
  logInput: string;
  setLogInput: (val: string) => void;
  saveSuccess: boolean;
  onSaveLog: (e: React.FormEvent) => void;
  onAllOkLog: () => void;
  formMajorSection: string;
  setFormMajorSection: (val: string) => void;
  formSection: string;
  setFormSection: (val: string) => void;
  formStationLocation: string;
  setFormStationLocation: (val: string) => void;
}

export default function GeneralStatusForm({
  selectedCircuit,
  selectedDivision,
  activeStatus,
  displayLogs,
  formErrors,
  logInput,
  setLogInput,
  saveSuccess,
  onSaveLog,
  onAllOkLog,
  formMajorSection,
  setFormMajorSection,
  formSection,
  setFormSection,
  formStationLocation,
  setFormStationLocation,
}: GeneralStatusFormProps) {
  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>{selectedCircuit.name}</h2>
          <div className="workspace-meta">
            <span>As of: {activeStatus?.lastUpdated}</span>
          </div>
        </div>

        {activeStatus && (
          <div className={`status-badge ${
            activeStatus.status === "normal"
              ? "green"
              : activeStatus.status === "degraded"
              ? "yellow"
              : "red"
          }`}>
            <span className="dot"></span>
            <span>
              {activeStatus.status === "normal"
                ? "Normal"
                : activeStatus.status === "degraded"
                ? "Degraded"
                : "Outage"}
            </span>
          </div>
        )}
      </div>

      <div className="detail-card" style={{ gap: "6px" }}>
        <span className="detail-card-title">System Description</span>
        <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.5 }}>
          {selectedCircuit.description}
        </p>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <span className="detail-card-title">Circuit Details & Parameters</span>
          {activeStatus?.details.map((detail, index) => (
            <div key={index} className="info-row">
              <span className="info-label">{detail.label}</span>
              <span className="info-value">{detail.value}</span>
            </div>
          ))}
        </div>

        <div className="detail-card">
          <span className="detail-card-title">Recent Activity Logs</span>
          <div
            className="no-scrollbar"
            style={{
              maxHeight: "160px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            {displayLogs.length > 0 ? (
              displayLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.4",
                    color: "#4B5563",
                    paddingLeft: "10px",
                    borderLeft: "2px solid #E5E7EB"
                  }}
                >
                  {log}
                </div>
              ))
            ) : (
              <span style={{ fontSize: "13px", color: "#9CA3AF" }}>No logs recorded.</span>
            )}
          </div>
        </div>
      </div>

      <div className="detail-card">
        <form className="status-editor-container" onSubmit={onSaveLog}>
          <HierarchicalFields
            selectedDivision={selectedDivision}
            formMajorSection={formMajorSection}
            setFormMajorSection={setFormMajorSection}
            formSection={formSection}
            setFormSection={setFormSection}
            formStationLocation={formStationLocation}
            setFormStationLocation={setFormStationLocation}
            errors={formErrors}
          />
          <label htmlFor="log-text">Log New Telecom Position / Status Update</label>
          <textarea
            id="log-text"
            placeholder="Enter today's status remarks, cable faults, insulation measurements, test results, etc."
            className="status-textarea"
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            required
          />
          <div className="save-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
            {saveSuccess && (
              <span className="save-success-msg" style={{ marginRight: "auto" }}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Update saved to daily position
              </span>
            )}
            <button
              type="button"
              className="all-ok-button"
              onClick={onAllOkLog}
            >
              All OK
            </button>
            <button type="submit" className="save-button">
              Log Position
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
