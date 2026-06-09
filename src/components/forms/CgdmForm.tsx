import { useState, useMemo } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface CgdmFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function CgdmForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: CgdmFormProps) {
  const [cgdmPfNo, setCgdmPfNo] = useState("");
  const [cgdmFaultyBoards, setCgdmFaultyBoards] = useState("");
  const [cgdmFailureTime, setCgdmFailureTime] = useState("");
  const [cgdmRectifiedTime, setCgdmRectifiedTime] = useState("");
  const [cgdmReasonOfFailure, setCgdmReasonOfFailure] = useState("");
  const [cgdmRemarks, setCgdmRemarks] = useState("");
  const [cgdmFormErrors, setCgdmFormErrors] = useState<Record<string, string>>({});
  const [cgdmFormSuccess, setCgdmFormSuccess] = useState(false);
  const [cgdmSaving, setCgdmSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const cgdmTotalDuration = useMemo(() => {
    return calculateDuration(cgdmFailureTime, cgdmRectifiedTime);
  }, [cgdmFailureTime, cgdmRectifiedTime]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!cgdmPfNo.trim()) errors.cgdmPfNo = "Platform Number is required";
    if (!cgdmFaultyBoards.trim()) {
      errors.cgdmFaultyBoards = "Number of faulty boards is required";
    } else {
      const val = parseInt(cgdmFaultyBoards, 10);
      if (isNaN(val) || val < 0) {
        errors.cgdmFaultyBoards = "Must be a valid positive number";
      }
    }
    if (!cgdmFailureTime) errors.cgdmFailureTime = "Failure Date & Time is required";
    if (!cgdmRectifiedTime) errors.cgdmRectifiedTime = "Rectification Time (RT) is required";
    if (!cgdmReasonOfFailure.trim()) errors.cgdmReasonOfFailure = "Reason of failure is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Faulty Station Name is required";

    if (cgdmFailureTime && cgdmRectifiedTime) {
      const start = new Date(cgdmFailureTime);
      const end = new Date(cgdmRectifiedTime);
      if (end.getTime() < start.getTime()) {
        errors.cgdmRectifiedTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setCgdmFormErrors(errors);
      return;
    }

    setCgdmFormErrors({});
    setCgdmSaving(true);

    setTimeout(() => {
      const newCgdmRecord = {
        id: Date.now(),
        division: selectedDivision,
        pfNo: cgdmPfNo.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation,
        faultyBoards: cgdmFaultyBoards.trim(),
        failureTime: formatDate(cgdmFailureTime),
        rectifiedTime: formatDate(cgdmRectifiedTime),
        duration: cgdmTotalDuration,
        reasonOfFailure: cgdmReasonOfFailure.trim(),
        remarks: cgdmRemarks.trim()
      };

      onSave(newCgdmRecord);
      setCgdmSaving(false);

      setCgdmPfNo("");
      setCgdmFaultyBoards("");
      setCgdmFailureTime("");
      setCgdmRectifiedTime("");
      setCgdmReasonOfFailure("");
      setCgdmRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setCgdmFormSuccess(true);
      setTimeout(() => setCgdmFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newCgdmRecord = {
      id: Date.now(),
      division: selectedDivision,
      pfNo: "None",
      majorSection: "All Sections OK",
      section: "All OK",
      stationLocation: "All displays normal.",
      faultyBoards: "0",
      failureTime: formatDate(nowStr),
      rectifiedTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasonOfFailure: "No display boards faults.",
      remarks: "Tested normal."
    };
    onSave(newCgdmRecord);
    setCgdmPfNo("");
    setCgdmFaultyBoards("");
    setCgdmFailureTime("");
    setCgdmRectifiedTime("");
    setCgdmReasonOfFailure("");
    setCgdmRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>CGDM Platform Displays</h2>
        </div>
      </div>

      {cgdmFormSuccess && (
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
          <span>✅ CGDM Platform Display Record Saved Successfully</span>
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
          errors={cgdmFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="cgdmPfNo" className="form-label">
              Platform No. <span className="required">*</span>
            </label>
            <input
              type="text"
              id="cgdmPfNo"
              className={`form-input ${cgdmFormErrors.cgdmPfNo ? "field-error-border" : ""}`}
              placeholder="Example: PF-1, PF-2"
              value={cgdmPfNo}
              onChange={(e) => setCgdmPfNo(e.target.value)}
            />
            {cgdmFormErrors.cgdmPfNo && (
              <span className="error-text">{cgdmFormErrors.cgdmPfNo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cgdmFaultyBoards" className="form-label">
              No. of Faulty guidance boards <span className="required">*</span>
            </label>
            <input
              type="text"
              id="cgdmFaultyBoards"
              className={`form-input ${cgdmFormErrors.cgdmFaultyBoards ? "field-error-border" : ""}`}
              placeholder="Enter count of faulty board units"
              value={cgdmFaultyBoards}
              onChange={(e) => setCgdmFaultyBoards(e.target.value)}
            />
            {cgdmFormErrors.cgdmFaultyBoards && (
              <span className="error-text">{cgdmFormErrors.cgdmFaultyBoards}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="cgdmFailureTime" className="form-label">
              Failure Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="cgdmFailureTime"
              className={`form-input ${cgdmFormErrors.cgdmFailureTime ? "field-error-border" : ""}`}
              value={cgdmFailureTime}
              onChange={(e) => setCgdmFailureTime(e.target.value)}
            />
            {cgdmFormErrors.cgdmFailureTime && (
              <span className="error-text">{cgdmFormErrors.cgdmFailureTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cgdmRectifiedTime" className="form-label">
              Rectification Time (RT) <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="cgdmRectifiedTime"
              className={`form-input ${cgdmFormErrors.cgdmRectifiedTime ? "field-error-border" : ""}`}
              value={cgdmRectifiedTime}
              onChange={(e) => setCgdmRectifiedTime(e.target.value)}
            />
            {cgdmFormErrors.cgdmRectifiedTime && (
              <span className="error-text">{cgdmFormErrors.cgdmRectifiedTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="cgdmTotalDuration" className="form-label">Duration of Failure</label>
            <input
              type="text"
              id="cgdmTotalDuration"
              className="form-input"
              value={cgdmTotalDuration}
              readOnly
              placeholder="XX Hrs XX Min"
            />
          </div>

          <div className="form-group">
            <label htmlFor="cgdmReasonOfFailure" className="form-label">
              Reason of Failure <span className="required">*</span>
            </label>
            <input
              type="text"
              id="cgdmReasonOfFailure"
              className={`form-input ${cgdmFormErrors.cgdmReasonOfFailure ? "field-error-border" : ""}`}
              placeholder="Enter cause of display board failure"
              value={cgdmReasonOfFailure}
              onChange={(e) => setCgdmReasonOfFailure(e.target.value)}
            />
            {cgdmFormErrors.cgdmReasonOfFailure && (
              <span className="error-text">{cgdmFormErrors.cgdmReasonOfFailure}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="cgdmRemarks" className="form-label">Remarks</label>
          <textarea
            id="cgdmRemarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter additional remarks or observations"
            value={cgdmRemarks}
            onChange={(e) => setCgdmRemarks(e.target.value)}
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
            className={`save-button ${cgdmSaving ? "save-button-loading" : ""}`}
            disabled={cgdmSaving}
          >
            {cgdmSaving ? (
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
