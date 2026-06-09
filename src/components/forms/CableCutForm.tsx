import { useState, useMemo, useEffect, useRef } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface CableCutFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function CableCutForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: CableCutFormProps) {
  const [ccKmNo, setCcKmNo] = useState("");
  const [ccCableTypes, setCcCableTypes] = useState<string[]>([]);
  const [ccCableTypesOpen, setCcCableTypesOpen] = useState(false);
  const [ccCutByWhom, setCcCutByWhom] = useState<string[]>([]);
  const [ccCutByWhomOpen, setCcCutByWhomOpen] = useState(false);
  const [ccFailureTime, setCcFailureTime] = useState("");
  const [ccRectificationTime, setCcRectificationTime] = useState("");
  const [ccCustomCableType, setCcCustomCableType] = useState("");
  const [ccCustomCutBy, setCcCustomCutBy] = useState("");
  const [ccReasonOfFailure, setCcReasonOfFailure] = useState("");
  const [ccRemarks, setCcRemarks] = useState("");
  const [ccFormErrors, setCcFormErrors] = useState<Record<string, string>>({});
  const [ccFormSuccess, setCcFormSuccess] = useState(false);
  const [ccSaving, setCcSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const ccCableTypesRef = useRef<HTMLDivElement>(null);
  const ccCutByWhomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ccCableTypesRef.current && !ccCableTypesRef.current.contains(e.target as Node)) {
        setCcCableTypesOpen(false);
      }
      if (ccCutByWhomRef.current && !ccCutByWhomRef.current.contains(e.target as Node)) {
        setCcCutByWhomOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const ccTotalDuration = useMemo(() => {
    return calculateDuration(ccFailureTime, ccRectificationTime);
  }, [ccFailureTime, ccRectificationTime]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!ccKmNo.trim()) errors.ccKmNo = "KM Number is required";
    if (ccCableTypes.length === 0) errors.ccCableTypes = "At least one cable type is required";
    if (ccCableTypes.includes("Other") && !ccCustomCableType.trim()) {
      errors.ccCustomCableType = "Custom cable type details are required";
    }
    if (ccCutByWhom.length === 0) errors.ccCutByWhom = "At least one entity is required";
    if (ccCutByWhom.includes("Other") && !ccCustomCutBy.trim()) {
      errors.ccCustomCutBy = "Details on who cut the cable are required";
    }
    if (!ccFailureTime) errors.ccFailureTime = "Failure Date & Time is required";
    if (!ccRectificationTime) errors.ccRectificationTime = "Rectification Time (RT) is required";
    if (!ccReasonOfFailure.trim()) errors.ccReasonOfFailure = "Reason of failure is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (ccFailureTime && ccRectificationTime) {
      const start = new Date(ccFailureTime);
      const end = new Date(ccRectificationTime);
      if (end.getTime() < start.getTime()) {
        errors.ccRectificationTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setCcFormErrors(errors);
      return;
    }

    setCcFormErrors({});
    setCcSaving(true);

    setTimeout(() => {
      const newCcRecord = {
        id: Date.now(),
        division: selectedDivision,
        kmNo: ccKmNo.trim(),
        cableTypes: ccCableTypes.map(c => c === "Other" ? `Other: ${ccCustomCableType.trim()}` : c).join(", "),
        cutByWhom: ccCutByWhom.map(c => c === "Other" ? `Other: ${ccCustomCutBy.trim()}` : c).join(", "),
        failureTime: formatDate(ccFailureTime),
        rectificationTime: formatDate(ccRectificationTime),
        duration: ccTotalDuration,
        reasonOfFailure: ccReasonOfFailure.trim(),
        remarks: ccRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation
      };

      onSave(newCcRecord);
      setCcSaving(false);

      setCcKmNo("");
      setCcCableTypes([]);
      setCcCustomCableType("");
      setCcCutByWhom([]);
      setCcCustomCutBy("");
      setCcFailureTime("");
      setCcRectificationTime("");
      setCcReasonOfFailure("");
      setCcRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setCcFormSuccess(true);
      setTimeout(() => setCcFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newCcRecord = {
      id: Date.now(),
      division: selectedDivision,
      kmNo: "None",
      cableTypes: "None",
      cutByWhom: "None",
      failureTime: formatDate(nowStr),
      rectificationTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasonOfFailure: "No cable cuts reported.",
      remarks: "All paths clear and working normally."
    };
    onSave(newCcRecord);
    setCcKmNo("");
    setCcCableTypes([]);
    setCcCustomCableType("");
    setCcCutByWhom([]);
    setCcCustomCutBy("");
    setCcFailureTime("");
    setCcRectificationTime("");
    setCcReasonOfFailure("");
    setCcRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>Cable Cut (OFC & Quad)</h2>
        </div>
      </div>

      {ccFormSuccess && (
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
          <span>✅ Cable Cut Record Saved Successfully</span>
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
          errors={ccFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="ccKmNo" className="form-label">
              Km. No. <span className="required">*</span>
            </label>
            <input
              type="text"
              id="ccKmNo"
              className={`form-input ${ccFormErrors.ccKmNo ? "field-error-border" : ""}`}
              placeholder="Example: KM 120/4"
              value={ccKmNo}
              onChange={(e) => setCcKmNo(e.target.value)}
            />
            {ccFormErrors.ccKmNo && (
              <span className="error-text">{ccFormErrors.ccKmNo}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              Cable Type <span className="required">*</span>
            </label>
            <div className="multiselect-container" ref={ccCableTypesRef}>
              <button
                type="button"
                className={`multiselect-trigger ${ccCableTypesOpen ? "open" : ""}`}
                onClick={() => setCcCableTypesOpen(!ccCableTypesOpen)}
              >
                <span>
                  {ccCableTypes.length === 0
                    ? "Select Cable Type(s)..."
                    : ccCableTypes.join(", ")}
                </span>
              </button>
              {ccCableTypesOpen && (
                <div className="multiselect-menu">
                  {["24 F OFC", "6 Quad", "4 Quad", "Other"].map((option) => (
                    <label key={option} className="multiselect-item">
                      <input
                        type="checkbox"
                        checked={ccCableTypes.includes(option)}
                        onChange={() => {
                          if (ccCableTypes.includes(option)) {
                            setCcCableTypes(ccCableTypes.filter((c) => c !== option));
                          } else {
                            setCcCableTypes([...ccCableTypes, option]);
                          }
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {ccFormErrors.ccCableTypes && (
              <span className="error-text">{ccFormErrors.ccCableTypes}</span>
            )}
          </div>
        </div>

        {ccCableTypes.includes("Other") && (
          <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <label htmlFor="ccCustomCableType" className="form-label">
              Custom Cable Type <span className="required">*</span>
            </label>
            <input
              type="text"
              id="ccCustomCableType"
              className={`form-input ${ccFormErrors.ccCustomCableType ? "field-error-border" : ""}`}
              placeholder="Enter custom cable type details"
              value={ccCustomCableType}
              onChange={(e) => setCcCustomCableType(e.target.value)}
            />
            {ccFormErrors.ccCustomCableType && (
              <span className="error-text">{ccFormErrors.ccCustomCableType}</span>
            )}
          </div>
        )}

        <div className="form-group-row">
          <div className="form-group">
            <label className="form-label">
              Cable Cut by Whom <span className="required">*</span>
            </label>
            <div className="multiselect-container" ref={ccCutByWhomRef}>
              <button
                type="button"
                className={`multiselect-trigger ${ccCutByWhomOpen ? "open" : ""}`}
                onClick={() => setCcCutByWhomOpen(!ccCutByWhomOpen)}
              >
                <span>
                  {ccCutByWhom.length === 0
                    ? "Select Agency/Entity..."
                    : ccCutByWhom.join(", ")}
                </span>
              </button>
              {ccCutByWhomOpen && (
                <div className="multiselect-menu">
                  {["RVNL", "NHAI", "Private Agency", "S&T Contractor", "Electrical Dept", "Other"].map((option) => (
                    <label key={option} className="multiselect-item">
                      <input
                        type="checkbox"
                        checked={ccCutByWhom.includes(option)}
                        onChange={() => {
                          if (ccCutByWhom.includes(option)) {
                            setCcCutByWhom(ccCutByWhom.filter((c) => c !== option));
                          } else {
                            setCcCutByWhom([...ccCutByWhom, option]);
                          }
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {ccFormErrors.ccCutByWhom && (
              <span className="error-text">{ccFormErrors.ccCutByWhom}</span>
            )}
          </div>

          {ccCutByWhom.includes("Other") ? (
            <div className="form-group" style={{ animation: "fadeIn 0.15s ease-out" }}>
              <label htmlFor="ccCustomCutBy" className="form-label">
                Custom Cut Agency <span className="required">*</span>
              </label>
              <input
                type="text"
                id="ccCustomCutBy"
                className={`form-input ${ccFormErrors.ccCustomCutBy ? "field-error-border" : ""}`}
                placeholder="Specify agency"
                value={ccCustomCutBy}
                onChange={(e) => setCcCustomCutBy(e.target.value)}
              />
              {ccFormErrors.ccCustomCutBy && (
                <span className="error-text">{ccFormErrors.ccCustomCutBy}</span>
              )}
            </div>
          ) : (
            <div className="form-group"></div>
          )}
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="ccFailureTime" className="form-label">
              Failure Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="ccFailureTime"
              className={`form-input ${ccFormErrors.ccFailureTime ? "field-error-border" : ""}`}
              value={ccFailureTime}
              onChange={(e) => setCcFailureTime(e.target.value)}
            />
            {ccFormErrors.ccFailureTime && (
              <span className="error-text">{ccFormErrors.ccFailureTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="ccRectificationTime" className="form-label">
              Rectification Time (RT) <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="ccRectificationTime"
              className={`form-input ${ccFormErrors.ccRectificationTime ? "field-error-border" : ""}`}
              value={ccRectificationTime}
              onChange={(e) => setCcRectificationTime(e.target.value)}
            />
            {ccFormErrors.ccRectificationTime && (
              <span className="error-text">{ccFormErrors.ccRectificationTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="ccTotalDuration" className="form-label">Duration of Failure</label>
            <input
              type="text"
              id="ccTotalDuration"
              className="form-input"
              value={ccTotalDuration}
              readOnly
              placeholder="XX Hrs XX Min"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ccReasonOfFailure" className="form-label">
              Reason of Failure <span className="required">*</span>
            </label>
            <input
              type="text"
              id="ccReasonOfFailure"
              className={`form-input ${ccFormErrors.ccReasonOfFailure ? "field-error-border" : ""}`}
              placeholder="Enter cause of cable cut"
              value={ccReasonOfFailure}
              onChange={(e) => setCcReasonOfFailure(e.target.value)}
            />
            {ccFormErrors.ccReasonOfFailure && (
              <span className="error-text">{ccFormErrors.ccReasonOfFailure}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="ccRemarks" className="form-label">Remarks</label>
          <textarea
            id="ccRemarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter additional remarks or observations"
            value={ccRemarks}
            onChange={(e) => setCcRemarks(e.target.value)}
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
            className={`save-button ${ccSaving ? "save-button-loading" : ""}`}
            disabled={ccSaving}
          >
            {ccSaving ? (
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
