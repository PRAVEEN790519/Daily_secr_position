import { useState, useMemo } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface TibFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function TibForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: TibFormProps) {
  const [tibNoOfFaulty, setTibNoOfFaulty] = useState("");
  const [tibFailureTime, setTibFailureTime] = useState("");
  const [tibRectifiedTime, setTibRectifiedTime] = useState("");
  const [tibReasonOfFailure, setTibReasonOfFailure] = useState("");
  const [tibRemarks, setTibRemarks] = useState("");
  const [tibFormErrors, setTibFormErrors] = useState<Record<string, string>>({});
  const [tibFormSuccess, setTibFormSuccess] = useState(false);
  const [tibSaving, setTibSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const tibTotalDuration = useMemo(() => {
    return calculateDuration(tibFailureTime, tibRectifiedTime);
  }, [tibFailureTime, tibRectifiedTime]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!tibNoOfFaulty.trim()) {
      errors.tibNoOfFaulty = "Number of faulty TIB boards is required";
    } else {
      const val = parseInt(tibNoOfFaulty, 10);
      if (isNaN(val) || val < 0) {
        errors.tibNoOfFaulty = "Must be a valid positive number";
      }
    }
    if (!tibFailureTime) errors.tibFailureTime = "Failure Date & Time is required";
    if (!tibRectifiedTime) errors.tibRectifiedTime = "Rectification Time (RT) is required";
    if (!tibReasonOfFailure.trim()) errors.tibReasonOfFailure = "Reason of failure is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Location of faulty TIB is required";

    if (tibFailureTime && tibRectifiedTime) {
      const start = new Date(tibFailureTime);
      const end = new Date(tibRectifiedTime);
      if (end.getTime() < start.getTime()) {
        errors.tibRectifiedTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setTibFormErrors(errors);
      return;
    }

    setTibFormErrors({});
    setTibSaving(true);

    setTimeout(() => {
      const newTibRecord = {
        id: Date.now(),
        division: selectedDivision,
        noOfFaulty: tibNoOfFaulty.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation,
        failureTime: formatDate(tibFailureTime),
        rectifiedTime: formatDate(tibRectifiedTime),
        duration: tibTotalDuration,
        reasonOfFailure: tibReasonOfFailure.trim(),
        remarks: tibRemarks.trim()
      };

      onSave(newTibRecord);
      setTibSaving(false);

      setTibNoOfFaulty("");
      setTibFailureTime("");
      setTibRectifiedTime("");
      setTibReasonOfFailure("");
      setTibRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setTibFormSuccess(true);
      setTimeout(() => setTibFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newTibRecord = {
      id: Date.now(),
      division: selectedDivision,
      majorSection: "All Sections OK",
      section: "All OK",
      stationLocation: "All displays normal.",
      noOfFaulty: "0",
      failureTime: formatDate(nowStr),
      rectifiedTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasonOfFailure: "No train indicator board failures.",
      remarks: "Status tested normal."
    };
    onSave(newTibRecord);
    setTibNoOfFaulty("");
    setTibFailureTime("");
    setTibRectifiedTime("");
    setTibReasonOfFailure("");
    setTibRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>TIB Train Indication Boards</h2>
        </div>
      </div>

      {tibFormSuccess && (
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
          <span>✅ TIB Display Record Saved Successfully</span>
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
          errors={tibFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="tibNoOfFaulty" className="form-label">
              No. of Faulty boards <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tibNoOfFaulty"
              className={`form-input ${tibFormErrors.tibNoOfFaulty ? "field-error-border" : ""}`}
              placeholder="Enter count of faulty board units"
              value={tibNoOfFaulty}
              onChange={(e) => setTibNoOfFaulty(e.target.value)}
            />
            {tibFormErrors.tibNoOfFaulty && (
              <span className="error-text">{tibFormErrors.tibNoOfFaulty}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tibFailureTime" className="form-label">
              Failure Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="tibFailureTime"
              className={`form-input ${tibFormErrors.tibFailureTime ? "field-error-border" : ""}`}
              value={tibFailureTime}
              onChange={(e) => setTibFailureTime(e.target.value)}
            />
            {tibFormErrors.tibFailureTime && (
              <span className="error-text">{tibFormErrors.tibFailureTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="tibRectifiedTime" className="form-label">
              Rectification Time (RT) <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="tibRectifiedTime"
              className={`form-input ${tibFormErrors.tibRectifiedTime ? "field-error-border" : ""}`}
              value={tibRectifiedTime}
              onChange={(e) => setTibRectifiedTime(e.target.value)}
            />
            {tibFormErrors.tibRectifiedTime && (
              <span className="error-text">{tibFormErrors.tibRectifiedTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tibTotalDuration" className="form-label">Duration of Failure</label>
            <input
              type="text"
              id="tibTotalDuration"
              className="form-input"
              value={tibTotalDuration}
              readOnly
              placeholder="XX Hrs XX Min"
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="tibReasonOfFailure" className="form-label">
              Reason of Failure <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tibReasonOfFailure"
              className={`form-input ${tibFormErrors.tibReasonOfFailure ? "field-error-border" : ""}`}
              placeholder="Enter cause of TIB board failure"
              value={tibReasonOfFailure}
              onChange={(e) => setTibReasonOfFailure(e.target.value)}
            />
            {tibFormErrors.tibReasonOfFailure && (
              <span className="error-text">{tibFormErrors.tibReasonOfFailure}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tibRemarks" className="form-label">Remarks</label>
            <input
              type="text"
              id="tibRemarks"
              className="form-input"
              placeholder="Enter additional remarks or observations"
              value={tibRemarks}
              onChange={(e) => setTibRemarks(e.target.value)}
            />
          </div>
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
            className={`save-button ${tibSaving ? "save-button-loading" : ""}`}
            disabled={tibSaving}
          >
            {tibSaving ? (
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
