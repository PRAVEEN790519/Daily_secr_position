import { useState, useMemo } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface CctvFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function CctvForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: CctvFormProps) {
  const [cctvTotalNotWorkingLocation, setCctvTotalNotWorkingLocation] = useState("");
  const [cctvWarRoomFailed, setCctvWarRoomFailed] = useState("");
  const [cctvFailureTime, setCctvFailureTime] = useState("");
  const [cctvRectifiedTime, setCctvRectifiedTime] = useState("");
  const [cctvReasonOfFailure, setCctvReasonOfFailure] = useState("");
  const [cctvRemarks, setCctvRemarks] = useState("");
  const [cctvFormErrors, setCctvFormErrors] = useState<Record<string, string>>({});
  const [cctvFormSuccess, setCctvFormSuccess] = useState(false);
  const [cctvSaving, setCctvSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState(""); // Needed for type binding if HierarchicalFields has it, though cctv form JSX excludes it

  const cctvTotalDuration = useMemo(() => {
    return calculateDuration(cctvFailureTime, cctvRectifiedTime);
  }, [cctvFailureTime, cctvRectifiedTime]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!cctvTotalNotWorkingLocation.trim()) {
      errors.cctvTotalNotWorkingLocation = "Total CCTV / Not Working CCTV (NOS) (Location) is required";
    }
    if (!cctvWarRoomFailed) {
      errors.cctvWarRoomFailed = "Live Feed To War Room Failed status is required";
    }
    if (!cctvFailureTime) errors.cctvFailureTime = "Failure Date & Time is required";
    if (!cctvRectifiedTime) errors.cctvRectifiedTime = "Rectification Time (RT) is required";
    if (!cctvReasonOfFailure.trim()) errors.cctvReasonOfFailure = "Reason of failure is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";

    if (cctvFailureTime && cctvRectifiedTime) {
      const start = new Date(cctvFailureTime);
      const end = new Date(cctvRectifiedTime);
      if (end.getTime() < start.getTime()) {
        errors.cctvRectifiedTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setCctvFormErrors(errors);
      return;
    }

    setCctvFormErrors({});
    setCctvSaving(true);

    setTimeout(() => {
      const newRecord = {
        id: Date.now(),
        division: selectedDivision,
        majorSection: formMajorSection,
        section: formSection,
        totalNotWorkingLocation: cctvTotalNotWorkingLocation.trim(),
        warRoomFailed: cctvWarRoomFailed,
        failureTime: formatDate(cctvFailureTime),
        rectifiedTime: formatDate(cctvRectifiedTime),
        duration: cctvTotalDuration,
        reasonOfFailure: cctvReasonOfFailure.trim(),
        remarks: cctvRemarks.trim()
      };

      onSave(newRecord);
      setCctvSaving(false);

      setCctvTotalNotWorkingLocation("");
      setCctvWarRoomFailed("");
      setCctvFailureTime("");
      setCctvRectifiedTime("");
      setCctvReasonOfFailure("");
      setCctvRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setCctvFormSuccess(true);
      setTimeout(() => setCctvFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newRecord = {
      id: Date.now(),
      division: selectedDivision,
      majorSection: "All Sections OK",
      section: "All OK",
      totalNotWorkingLocation: "None",
      warRoomFailed: "No",
      failureTime: formatDate(nowStr),
      rectifiedTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasonOfFailure: "All cameras functioning normally.",
      remarks: "Tested feed to War Room successfully."
    };
    onSave(newRecord);
    setCctvTotalNotWorkingLocation("");
    setCctvWarRoomFailed("");
    setCctvFailureTime("");
    setCctvRectifiedTime("");
    setCctvReasonOfFailure("");
    setCctvRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>{selectedCircuit.name}</h2>
        </div>
      </div>

      {cctvFormSuccess && (
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
          <span>✅ {selectedCircuit.name} Record Saved Successfully</span>
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
          excludeStationLocation={true}
          errors={cctvFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="cctvTotalNotWorkingLocation" className="form-label">
              Total CCTV / Not Working CCTV (NOS) (Location) <span className="required">*</span>
            </label>
            <input
              type="text"
              id="cctvTotalNotWorkingLocation"
              className={`form-input ${cctvFormErrors.cctvTotalNotWorkingLocation ? "field-error-border" : ""}`}
              placeholder="Example: BSP Platform 1 (2 Nos)"
              value={cctvTotalNotWorkingLocation}
              onChange={(e) => setCctvTotalNotWorkingLocation(e.target.value)}
            />
            {cctvFormErrors.cctvTotalNotWorkingLocation && (
              <span className="error-text">{cctvFormErrors.cctvTotalNotWorkingLocation}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cctvWarRoomFailed" className="form-label">
              Live Feed To War Room Failed <span className="required">*</span>
            </label>
            <select
              id="cctvWarRoomFailed"
              className={`form-input ${cctvFormErrors.cctvWarRoomFailed ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={cctvWarRoomFailed}
              onChange={(e) => setCctvWarRoomFailed(e.target.value)}
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {cctvFormErrors.cctvWarRoomFailed && (
              <span className="error-text">{cctvFormErrors.cctvWarRoomFailed}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="cctvFailureTime" className="form-label">
              Failure Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="cctvFailureTime"
              className={`form-input ${cctvFormErrors.cctvFailureTime ? "field-error-border" : ""}`}
              value={cctvFailureTime}
              onChange={(e) => setCctvFailureTime(e.target.value)}
            />
            {cctvFormErrors.cctvFailureTime && (
              <span className="error-text">{cctvFormErrors.cctvFailureTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cctvRectifiedTime" className="form-label">
              Rectification Time (RT) <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="cctvRectifiedTime"
              className={`form-input ${cctvFormErrors.cctvRectifiedTime ? "field-error-border" : ""}`}
              value={cctvRectifiedTime}
              onChange={(e) => setCctvRectifiedTime(e.target.value)}
            />
            {cctvFormErrors.cctvRectifiedTime && (
              <span className="error-text">{cctvFormErrors.cctvRectifiedTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="cctvTotalDuration" className="form-label">Duration of Failure</label>
            <input
              type="text"
              id="cctvTotalDuration"
              className="form-input"
              value={cctvTotalDuration}
              readOnly
              placeholder="XX Hrs XX Min"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cctvReasonOfFailure" className="form-label">
              Reason of Failure <span className="required">*</span>
            </label>
            <input
              type="text"
              id="cctvReasonOfFailure"
              className={`form-input ${cctvFormErrors.cctvReasonOfFailure ? "field-error-border" : ""}`}
              placeholder="Enter cause of CCTV feed failure"
              value={cctvReasonOfFailure}
              onChange={(e) => setCctvReasonOfFailure(e.target.value)}
            />
            {cctvFormErrors.cctvReasonOfFailure && (
              <span className="error-text">{cctvFormErrors.cctvReasonOfFailure}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="cctvRemarks" className="form-label">Remarks</label>
          <textarea
            id="cctvRemarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter observations or details on repair action"
            value={cctvRemarks}
            onChange={(e) => setCctvRemarks(e.target.value)}
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
            className={`save-button ${cctvSaving ? "save-button-loading" : ""}`}
            disabled={cctvSaving}
          >
            {cctvSaving ? (
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
