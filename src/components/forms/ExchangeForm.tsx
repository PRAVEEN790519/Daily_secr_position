import { useState, useMemo, useEffect, useRef } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface ExchangeFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

const EXCHANGES_LIST = [
  "Bilaspur Exchange",
  "Raipur Exchange",
  "Nagpur Exchange",
  "Durg Exchange",
  "Gondia Exchange",
  "Champa Exchange",
  "Korba Exchange",
  "Dongargarh Exchange",
  "Rajnandgaon Exchange",
  "Bhatapara Exchange",
  "Anuppur Exchange",
  "Shahdol Exchange"
];

export default function ExchangeForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: ExchangeFormProps) {
  const [icmsEntryNo, setIcmsEntryNo] = useState("");
  const [exchangeName, setExchangeName] = useState("");
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState("");
  const [exchangeDropdownOpen, setExchangeDropdownOpen] = useState(false);
  const [faultName, setFaultName] = useState("");
  const [customFaultName, setCustomFaultName] = useState("");
  const [exchFailureTime, setExchFailureTime] = useState("");
  const [exchRectificationTime, setExchRectificationTime] = useState("");
  const [exchSelectedReasons, setExchSelectedReasons] = useState<string[]>([]);
  const [exchReasonsDropdownOpen, setExchReasonsDropdownOpen] = useState(false);
  const [exchCustomReason, setExchCustomReason] = useState("");
  const [exchRemarks, setExchRemarks] = useState("");
  const [exchFormErrors, setExchFormErrors] = useState<Record<string, string>>({});
  const [exchFormSuccess, setExchFormSuccess] = useState(false);
  const [exchSaving, setExchSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const exchangeRef = useRef<HTMLDivElement>(null);
  const exchReasonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exchangeRef.current && !exchangeRef.current.contains(e.target as Node)) {
        setExchangeDropdownOpen(false);
      }
      if (exchReasonsRef.current && !exchReasonsRef.current.contains(e.target as Node)) {
        setExchReasonsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredExchanges = useMemo(() => {
    if (!exchangeSearchQuery.trim()) return EXCHANGES_LIST;
    return EXCHANGES_LIST.filter(exch => 
      exch.toLowerCase().includes(exchangeSearchQuery.toLowerCase())
    );
  }, [exchangeSearchQuery]);

  const exchTotalDuration = useMemo(() => {
    return calculateDuration(exchFailureTime, exchRectificationTime);
  }, [exchFailureTime, exchRectificationTime]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }
    if (!exchangeName) errors.exchangeName = "Exchange Name is required";
    if (!faultName) errors.faultName = "Fault Name is required";
    if (faultName === "Other" && !customFaultName.trim()) {
      errors.customFaultName = "Custom Fault Name is required";
    }
    if (!exchFailureTime) errors.exchFailureTime = "Failure Date & Time is required";
    if (!exchRectificationTime) errors.exchRectificationTime = "Rectification Time is required";
    if (exchSelectedReasons.length === 0) errors.reasons = "At least one failure reason is required";
    if (exchSelectedReasons.includes("Other") && !exchCustomReason.trim()) {
      errors.exchCustomReason = "Custom failure reason is required";
    }

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (exchFailureTime && exchRectificationTime) {
      const start = new Date(exchFailureTime);
      const end = new Date(exchRectificationTime);
      if (end.getTime() < start.getTime()) {
        errors.exchRectificationTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setExchFormErrors(errors);
      return;
    }

    setExchFormErrors({});
    setExchSaving(true);

    setTimeout(() => {
      const newExchFault = {
        id: Date.now(),
        division: selectedDivision,
        icmsEntryNo: icmsEntryNo.trim(),
        exchangeName,
        faultName: faultName === "Other" ? `Other: ${customFaultName.trim()}` : faultName,
        failureTime: formatDate(exchFailureTime),
        rectificationTime: formatDate(exchRectificationTime),
        duration: exchTotalDuration,
        reasons: exchSelectedReasons.map(r => r === "Other" ? `Other: ${exchCustomReason.trim()}` : r).join(", "),
        remarks: exchRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation
      };

      onSave(newExchFault);
      setExchSaving(false);

      // Reset form fields
      setIcmsEntryNo("");
      setExchangeName("");
      setFaultName("");
      setCustomFaultName("");
      setExchFailureTime("");
      setExchRectificationTime("");
      setExchSelectedReasons([]);
      setExchCustomReason("");
      setExchRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setExchFormSuccess(true);
      setTimeout(() => setExchFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newExchFault = {
      id: Date.now(),
      division: selectedDivision,
      exchangeName: selectedCircuit.name || "BSP Exchange",
      faultName: "None",
      failureTime: formatDate(nowStr),
      rectificationTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasons: "Link Failure",
      remarks: "All exchange systems functioning normally."
    };
    onSave(newExchFault);
    
    setExchangeName("");
    setFaultName("");
    setCustomFaultName("");
    setExchFailureTime("");
    setExchRectificationTime("");
    setExchSelectedReasons([]);
    setExchCustomReason("");
    setExchRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>{exchangeName || "Exchange System"}</h2>
        </div>
      </div>

      {exchFormSuccess && (
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
          <span>✅ Exchange Fault Record Saved Successfully</span>
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
          errors={exchFormErrors}
        />
        
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="exchIcmsEntryNo" className="form-label">
              ICMS Entry No./Docket No. <span className="required">*</span>
            </label>
            <input
              type="text"
              id="exchIcmsEntryNo"
              className={`form-input ${exchFormErrors.icmsEntryNo ? "field-error-border" : ""}`}
              placeholder="Enter ICMS entry number/docket number"
              value={icmsEntryNo}
              onChange={(e) => setIcmsEntryNo(e.target.value)}
            />
            {exchFormErrors.icmsEntryNo && (
              <span className="error-text">{exchFormErrors.icmsEntryNo}</span>
            )}
          </div>
          <div className="form-group"></div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label className="form-label">
              Name of Exchange <span className="required">*</span>
            </label>
            <div className="multiselect-container" ref={exchangeRef}>
              <button
                type="button"
                className={`multiselect-trigger ${exchangeDropdownOpen ? "open" : ""}`}
                onClick={() => setExchangeDropdownOpen(!exchangeDropdownOpen)}
              >
                <span>{exchangeName ? exchangeName : "Select Exchange Name"}</span>
              </button>
              {exchangeDropdownOpen && (
                <div className="multiselect-menu">
                  <div className="circuit-dropdown-search-wrapper" style={{ position: "relative" }}>
                    <span className="circuit-dropdown-search-icon">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Filter exchange..."
                      className="circuit-dropdown-search"
                      value={exchangeSearchQuery}
                      onChange={(e) => setExchangeSearchQuery(e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div style={{ maxHeight: "170px", overflowY: "auto" }}>
                    {filteredExchanges.length > 0 ? (
                      filteredExchanges.map((exch) => (
                        <div
                          key={exch}
                          className="dropdown-item"
                          style={{
                            padding: "8px 12px",
                            fontSize: "13.5px",
                            backgroundColor: exchangeName === exch ? "#EFF6FF" : "transparent",
                            color: exchangeName === exch ? "var(--primary-color)" : "var(--text-color)"
                          }}
                          onClick={() => {
                            setExchangeName(exch);
                            setExchangeDropdownOpen(false);
                            setExchangeSearchQuery("");
                          }}
                        >
                          {exch}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: "10px", fontSize: "12.5px", color: "#6B7280", textAlign: "center" }}>
                        No exchanges found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {exchFormErrors.exchangeName && (
              <span className="error-text">{exchFormErrors.exchangeName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="faultName" className="form-label">
              Name of Fault <span className="required">*</span>
            </label>
            <select
              id="faultName"
              className={`form-input ${exchFormErrors.faultName ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={faultName}
              onChange={(e) => {
                setFaultName(e.target.value);
                if (e.target.value !== "Other") setCustomFaultName("");
              }}
            >
              <option value="">Select Fault Type</option>
              <option value="Link Failure">Link Failure</option>
              <option value="Card Failure">Card Failure</option>
              <option value="Other">Other</option>
            </select>
            {exchFormErrors.faultName && (
              <span className="error-text">{exchFormErrors.faultName}</span>
            )}
          </div>
        </div>

        {faultName === "Other" && (
          <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <label htmlFor="customFaultName" className="form-label">
              Custom Fault Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="customFaultName"
              className={`form-input ${exchFormErrors.customFaultName ? "field-error-border" : ""}`}
              placeholder="Enter fault name manually"
              value={customFaultName}
              onChange={(e) => setCustomFaultName(e.target.value)}
            />
            {exchFormErrors.customFaultName && (
              <span className="error-text">{exchFormErrors.customFaultName}</span>
            )}
          </div>
        )}

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="exchFailureTime" className="form-label">
              Failure Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="exchFailureTime"
              className={`form-input ${exchFormErrors.exchFailureTime ? "field-error-border" : ""}`}
              value={exchFailureTime}
              onChange={(e) => setExchFailureTime(e.target.value)}
            />
            {exchFormErrors.exchFailureTime && (
              <span className="error-text">{exchFormErrors.exchFailureTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="exchRectificationTime" className="form-label">
              Rectification Time (RT) <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="exchRectificationTime"
              className={`form-input ${exchFormErrors.exchRectificationTime ? "field-error-border" : ""}`}
              value={exchRectificationTime}
              onChange={(e) => setExchRectificationTime(e.target.value)}
            />
            {exchFormErrors.exchRectificationTime && (
              <span className="error-text">{exchFormErrors.exchRectificationTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="exchTotalDuration" className="form-label">
              Duration of Failure
            </label>
            <input
              type="text"
              id="exchTotalDuration"
              className="form-input"
              value={exchTotalDuration}
              readOnly
              placeholder="XX Hrs XX Min"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Reason of Failure <span className="required">*</span>
            </label>
            <div className="multiselect-container" ref={exchReasonsRef}>
              <button
                type="button"
                className={`multiselect-trigger ${exchReasonsDropdownOpen ? "open" : ""}`}
                onClick={() => setExchReasonsDropdownOpen(!exchReasonsDropdownOpen)}
              >
                <span>
                  {exchSelectedReasons.length === 0
                    ? "Select Reason(s)..."
                    : exchSelectedReasons.join(", ")}
                </span>
              </button>
              {exchReasonsDropdownOpen && (
                <div className="multiselect-menu">
                  {[
                    "Cable Cut",
                    "Link Failure",
                    "Equipment Failure (STM)",
                    "Equipment Failure (Phone)",
                    "Power Failure",
                    "Hardware Failure",
                    "Software Failure",
                    "Configuration Issue",
                    "Other"
                  ].map((option) => (
                    <label key={option} className="multiselect-item">
                      <input
                        type="checkbox"
                        checked={exchSelectedReasons.includes(option)}
                        onChange={() => {
                          if (exchSelectedReasons.includes(option)) {
                            setExchSelectedReasons(exchSelectedReasons.filter((r) => r !== option));
                          } else {
                            setExchSelectedReasons([...exchSelectedReasons, option]);
                          }
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {exchFormErrors.reasons && (
              <span className="error-text">{exchFormErrors.reasons}</span>
            )}
          </div>
        </div>

        {exchSelectedReasons.includes("Other") && (
          <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <label htmlFor="exchCustomReason" className="form-label">
              Other Reason <span className="required">*</span>
            </label>
            <input
              type="text"
              id="exchCustomReason"
              className={`form-input ${exchFormErrors.exchCustomReason ? "field-error-border" : ""}`}
              placeholder="Enter custom failure reason"
              value={exchCustomReason}
              onChange={(e) => setExchCustomReason(e.target.value)}
            />
            {exchFormErrors.exchCustomReason && (
              <span className="error-text">{exchFormErrors.exchCustomReason}</span>
            )}
          </div>
        )}

        <div className="form-group full-width">
          <label htmlFor="exchRemarks" className="form-label">Remarks</label>
          <textarea
            id="exchRemarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter observations, troubleshooting details, action taken, or additional remarks"
            value={exchRemarks}
            onChange={(e) => setExchRemarks(e.target.value)}
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
            className={`save-button ${exchSaving ? "save-button-loading" : ""}`}
            disabled={exchSaving}
          >
            {exchSaving ? (
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
