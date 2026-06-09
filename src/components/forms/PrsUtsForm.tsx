import { useState, useMemo } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface PrsUtsFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function PrsUtsForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: PrsUtsFormProps) {
  const [puSystemType, setPuSystemType] = useState("");
  const [puNatureOfFault, setPuNatureOfFault] = useState("");
  const [puCustomNatureOfFault, setPuCustomNatureOfFault] = useState("");
  const [puFailureTime, setPuFailureTime] = useState("");
  const [puRectifiedTime, setPuRectifiedTime] = useState("");
  const [puReasonOfFailure, setPuReasonOfFailure] = useState("");
  const [puRemarks, setPuRemarks] = useState("");
  const [puFormErrors, setPuFormErrors] = useState<Record<string, string>>({});
  const [puFormSuccess, setPuFormSuccess] = useState(false);
  const [puSaving, setPuSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const puTotalDuration = useMemo(() => {
    return calculateDuration(puFailureTime, puRectifiedTime);
  }, [puFailureTime, puRectifiedTime]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!puSystemType) {
      errors.puSystemType = "System Type (PRS/UTS) is required";
    }
    if (!puNatureOfFault) {
      errors.puNatureOfFault = "Nature of fault is required";
    }
    if (puNatureOfFault === "Other" && !puCustomNatureOfFault.trim()) {
      errors.puCustomNatureOfFault = "Custom nature of fault description is required";
    }
    if (!puFailureTime) errors.puFailureTime = "Failure Date & Time is required";
    if (!puRectifiedTime) errors.puRectifiedTime = "Rectification Time (RT) is required";
    if (!puReasonOfFailure.trim()) errors.puReasonOfFailure = "Reason of failure is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (puFailureTime && puRectifiedTime) {
      const start = new Date(puFailureTime);
      const end = new Date(puRectifiedTime);
      if (end.getTime() < start.getTime()) {
        errors.puRectifiedTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setPuFormErrors(errors);
      return;
    }

    setPuFormErrors({});
    setPuSaving(true);

    setTimeout(() => {
      const newPuRecord = {
        id: Date.now(),
        division: selectedDivision,
        systemType: puSystemType,
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation,
        natureOfFault: puNatureOfFault === "Other" ? puCustomNatureOfFault.trim() : puNatureOfFault,
        failureTime: formatDate(puFailureTime),
        rectifiedTime: formatDate(puRectifiedTime),
        duration: puTotalDuration,
        reasonOfFailure: puReasonOfFailure.trim(),
        remarks: puRemarks.trim()
      };

      onSave(newPuRecord);
      setPuSaving(false);

      setPuSystemType("");
      setPuNatureOfFault("");
      setPuCustomNatureOfFault("");
      setPuFailureTime("");
      setPuRectifiedTime("");
      setPuReasonOfFailure("");
      setPuRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setPuFormSuccess(true);
      setTimeout(() => setPuFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newPuRecord = {
      id: Date.now(),
      division: selectedDivision,
      systemType: "PRS & UTS",
      majorSection: "All Sections OK",
      section: "All OK",
      stationLocation: "All reservation terminals healthy.",
      natureOfFault: "None",
      failureTime: formatDate(nowStr),
      rectifiedTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasonOfFailure: "No transaction system errors.",
      remarks: "Commercial channels tested functional."
    };
    onSave(newPuRecord);
    setPuSystemType("");
    setPuNatureOfFault("");
    setPuCustomNatureOfFault("");
    setPuFailureTime("");
    setPuRectifiedTime("");
    setPuReasonOfFailure("");
    setPuRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>PRS / UTS Reservation Networks</h2>
        </div>
      </div>

      {puFormSuccess && (
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
          <span>✅ PRS/UTS Record Saved Successfully</span>
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
          errors={puFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="puSystemType" className="form-label">
              System Type (PRS/UTS) <span className="required">*</span>
            </label>
            <select
              id="puSystemType"
              className={`form-input ${puFormErrors.puSystemType ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={puSystemType}
              onChange={(e) => setPuSystemType(e.target.value)}
            >
              <option value="">Select System Type</option>
              <option value="PRS">PRS (Passenger Reservation System)</option>
              <option value="UTS">UTS (Unreserved Ticketing System)</option>
              <option value="PRS & UTS Both">PRS & UTS Both</option>
            </select>
            {puFormErrors.puSystemType && (
              <span className="error-text">{puFormErrors.puSystemType}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="puNatureOfFault" className="form-label">
              Nature of Fault <span className="required">*</span>
            </label>
            <select
              id="puNatureOfFault"
              className={`form-input ${puFormErrors.puNatureOfFault ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={puNatureOfFault}
              onChange={(e) => {
                setPuNatureOfFault(e.target.value);
                if (e.target.value !== "Other") setPuCustomNatureOfFault("");
              }}
            >
              <option value="">Select Nature of Fault</option>
              <option value="Link Failure">Link Failure (Channel Down)</option>
              <option value="Hardware Failure">Terminal Hardware Failure</option>
              <option value="Thin Client Issues">Thin Client Issues</option>
              <option value="Ticket Printer Fault">Ticket Printer Fault</option>
              <option value="UTS Server Communication Error">Server Communication Error</option>
              <option value="Other">Other</option>
            </select>
            {puFormErrors.puNatureOfFault && (
              <span className="error-text">{puFormErrors.puNatureOfFault}</span>
            )}
          </div>
        </div>

        {puNatureOfFault === "Other" && (
          <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <label htmlFor="puCustomNatureOfFault" className="form-label">
              Other Nature of Fault <span className="required">*</span>
            </label>
            <input
              type="text"
              id="puCustomNatureOfFault"
              className={`form-input ${puFormErrors.puCustomNatureOfFault ? "field-error-border" : ""}`}
              placeholder="Enter fault nature details"
              value={puCustomNatureOfFault}
              onChange={(e) => setPuCustomNatureOfFault(e.target.value)}
            />
            {puFormErrors.puCustomNatureOfFault && (
              <span className="error-text">{puFormErrors.puCustomNatureOfFault}</span>
            )}
          </div>
        )}

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="puFailureTime" className="form-label">
              Failure Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="puFailureTime"
              className={`form-input ${puFormErrors.puFailureTime ? "field-error-border" : ""}`}
              value={puFailureTime}
              onChange={(e) => setPuFailureTime(e.target.value)}
            />
            {puFormErrors.puFailureTime && (
              <span className="error-text">{puFormErrors.puFailureTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="puRectifiedTime" className="form-label">
              Rectification Time (RT) <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="puRectifiedTime"
              className={`form-input ${puFormErrors.puRectifiedTime ? "field-error-border" : ""}`}
              value={puRectifiedTime}
              onChange={(e) => setPuRectifiedTime(e.target.value)}
            />
            {puFormErrors.puRectifiedTime && (
              <span className="error-text">{puFormErrors.puRectifiedTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="puTotalDuration" className="form-label">Duration of Failure</label>
            <input
              type="text"
              id="puTotalDuration"
              className="form-input"
              value={puTotalDuration}
              readOnly
              placeholder="XX Hrs XX Min"
            />
          </div>

          <div className="form-group">
            <label htmlFor="puReasonOfFailure" className="form-label">
              Reason of Failure <span className="required">*</span>
            </label>
            <input
              type="text"
              id="puReasonOfFailure"
              className={`form-input ${puFormErrors.puReasonOfFailure ? "field-error-border" : ""}`}
              placeholder="Enter cause of ticketing network failure"
              value={puReasonOfFailure}
              onChange={(e) => setPuReasonOfFailure(e.target.value)}
            />
            {puFormErrors.puReasonOfFailure && (
              <span className="error-text">{puFormErrors.puReasonOfFailure}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="puRemarks" className="form-label">Remarks</label>
          <textarea
            id="puRemarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter additional remarks or observations"
            value={puRemarks}
            onChange={(e) => setPuRemarks(e.target.value)}
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
            className={`save-button ${puSaving ? "save-button-loading" : ""}`}
            disabled={puSaving}
          >
            {puSaving ? (
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
