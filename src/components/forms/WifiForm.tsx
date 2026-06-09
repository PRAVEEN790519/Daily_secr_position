import { useState, useMemo } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface WifiFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function WifiForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: WifiFormProps) {
  const [wifiFailureTime, setWifiFailureTime] = useState("");
  const [wifiRectifiedTime, setWifiRectifiedTime] = useState("");
  const [wifiReasonOfFailure, setWifiReasonOfFailure] = useState("");
  const [wifiRemarks, setWifiRemarks] = useState("");
  const [wifiFormErrors, setWifiFormErrors] = useState<Record<string, string>>({});
  const [wifiFormSuccess, setWifiFormSuccess] = useState(false);
  const [wifiSaving, setWifiSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const wifiTotalDuration = useMemo(() => {
    return calculateDuration(wifiFailureTime, wifiRectifiedTime);
  }, [wifiFailureTime, wifiRectifiedTime]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Location of faulty access point is required";
    if (!wifiFailureTime) errors.wifiFailureTime = "Failure Date & Time is required";
    if (!wifiRectifiedTime) errors.wifiRectifiedTime = "Rectification Time is required";
    if (!wifiReasonOfFailure.trim()) errors.wifiReasonOfFailure = "Reason of failure is required";

    if (wifiFailureTime && wifiRectifiedTime) {
      const start = new Date(wifiFailureTime);
      const end = new Date(wifiRectifiedTime);
      if (end.getTime() < start.getTime()) {
        errors.wifiRectifiedTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setWifiFormErrors(errors);
      return;
    }

    setWifiFormErrors({});
    setWifiSaving(true);

    setTimeout(() => {
      const newWifiRecord = {
        id: Date.now(),
        division: selectedDivision,
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation,
        failureTime: formatDate(wifiFailureTime),
        rectifiedTime: formatDate(wifiRectifiedTime),
        duration: wifiTotalDuration,
        reasonOfFailure: wifiReasonOfFailure.trim(),
        remarks: wifiRemarks.trim()
      };

      onSave(newWifiRecord);
      setWifiSaving(false);

      setWifiFailureTime("");
      setWifiRectifiedTime("");
      setWifiReasonOfFailure("");
      setWifiRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setWifiFormSuccess(true);

      setTimeout(() => setWifiFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newWifiRecord = {
      id: Date.now(),
      division: selectedDivision,
      majorSection: "All Sections OK",
      section: "All OK",
      stationLocation: "All access points functioning normally.",
      failureTime: formatDate(nowStr),
      rectifiedTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasonOfFailure: "No failures reported.",
      remarks: "All systems healthy."
    };
    onSave(newWifiRecord);
    setWifiFailureTime("");
    setWifiRectifiedTime("");
    setWifiReasonOfFailure("");
    setWifiRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>Wi-Fi AP Outages</h2>
        </div>
      </div>

      {wifiFormSuccess && (
        <div className="alert-banner">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>✅ Wi-Fi Record Saved Successfully</span>
        </div>
      )}

      <form className="fault-form" onSubmit={handleSave}>
        <HierarchicalFields
          selectedDivision={selectedDivision}
          formMajorSection={formMajorSection}
          setFormMajorSection={setFormMajorSection}
          formSection={formSection}
          setFormSection={setFormSection}
          formStationLocation={formStationLocation}
          setFormStationLocation={setFormStationLocation}
          errors={wifiFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wifiFailureTime" className="form-label">
              Failure Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="wifiFailureTime"
              className={`form-input ${wifiFormErrors.wifiFailureTime ? "field-error-border" : ""}`}
              value={wifiFailureTime}
              onChange={(e) => setWifiFailureTime(e.target.value)}
            />
            {wifiFormErrors.wifiFailureTime && (
              <span className="error-text">{wifiFormErrors.wifiFailureTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wifiRectifiedTime" className="form-label">
              Rectification Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="wifiRectifiedTime"
              className={`form-input ${wifiFormErrors.wifiRectifiedTime ? "field-error-border" : ""}`}
              value={wifiRectifiedTime}
              onChange={(e) => setWifiRectifiedTime(e.target.value)}
            />
            {wifiFormErrors.wifiRectifiedTime && (
              <span className="error-text">{wifiFormErrors.wifiRectifiedTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wifiDuration" className="form-label">
              Total Duration (Hrs. Min.)
            </label>
            <input
              type="text"
              id="wifiDuration"
              className="form-input"
              value={wifiTotalDuration}
              readOnly
              placeholder="XX Hrs XX Min"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wifiReason" className="form-label">
              Reason of failure <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wifiReason"
              className={`form-input ${wifiFormErrors.wifiReasonOfFailure ? "field-error-border" : ""}`}
              placeholder="Enter reason of failure"
              value={wifiReasonOfFailure}
              onChange={(e) => setWifiReasonOfFailure(e.target.value)}
            />
            {wifiFormErrors.wifiReasonOfFailure && (
              <span className="error-text">{wifiFormErrors.wifiReasonOfFailure}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="wifiRemarks" className="form-label">Remarks</label>
          <input
            type="text"
            id="wifiRemarks"
            className="form-input"
            placeholder="Enter observations or restoration details"
            value={wifiRemarks}
            onChange={(e) => setWifiRemarks(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            className="all-ok-button"
            onClick={handleAllOk}
          >
            All OK
          </button>
          <button 
            type="submit" 
            className={`save-button ${wifiSaving ? "save-button-loading" : ""}`}
            disabled={wifiSaving}
          >
            {wifiSaving ? (
              <>
                <span className="spinner"></span>
                <span>Saving...</span>
              </>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
