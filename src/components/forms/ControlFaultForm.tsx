import { useState, useMemo, useEffect, useRef } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface ControlFaultFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function ControlFaultForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: ControlFaultFormProps) {
  const [icmsEntryNo, setIcmsEntryNo] = useState("");
  const [faultySection, setFaultySection] = useState("");
  const [circuitFailed, setCircuitFailed] = useState("");
  const [failureTime, setFailureTime] = useState("");
  const [rectificationTime, setRectificationTime] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [reasonsDropdownOpen, setReasonsDropdownOpen] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formSuccess, setFormSuccess] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const reasonsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (reasonsRef.current && !reasonsRef.current.contains(e.target as Node)) {
        setReasonsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const totalDuration = useMemo(() => {
    return calculateDuration(failureTime, rectificationTime);
  }, [failureTime, rectificationTime]);

  const isIcmsCom = selectedCircuit.name === "Control & ICMS Position";
  const isFoisVsat = selectedCircuit.name === "FOIS (VSAT)";
  const isHotline = selectedCircuit.name === "Hotline";
  const isVcDiv = selectedCircuit.name === "Video Conferencing with Divisions";
  const isCftmConf = selectedCircuit.name === "CFTM Conference";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }
    if (!isIcmsCom && !isFoisVsat && !isHotline && !isVcDiv && !isCftmConf && !faultySection.trim()) {
      errors.faultySection = "Faulty Section is required";
    }
    if (!circuitFailed.trim()) errors.circuitFailed = "Failed Circuit Name is required";
    if (!failureTime) errors.failureTime = "Failure Date & Time is required";
    if (!rectificationTime) errors.rectificationTime = "Rectification Time is required";
    if (selectedReasons.length === 0) errors.reasons = "At least one failure reason is required";
    if (selectedReasons.includes("Other") && !customReason.trim()) {
      errors.customReason = "Custom failure reason is required";
    }

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (failureTime && rectificationTime) {
      const start = new Date(failureTime);
      const end = new Date(rectificationTime);
      if (end.getTime() < start.getTime()) {
        errors.rectificationTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const newFault = {
      id: Date.now(),
      circuitId: selectedCircuit.id,
      division: selectedDivision,
      icmsEntryNo: icmsEntryNo.trim(),
      faultySection: (isIcmsCom || isFoisVsat || isHotline || isVcDiv || isCftmConf) ? "None" : faultySection.trim(),
      circuitFailed: circuitFailed.trim(),
      failureTime: formatDate(failureTime),
      rectificationTime: formatDate(rectificationTime),
      duration: totalDuration,
      reasons: selectedReasons.map(r => r === "Other" ? `Other: ${customReason.trim()}` : r).join(", "),
      remarks: remarks.trim(),
      majorSection: formMajorSection,
      section: formSection,
      stationLocation: formStationLocation
    };

    onSave(newFault);

    // Reset Form
    setIcmsEntryNo("");
    setFaultySection("");
    setCircuitFailed("");
    setFailureTime("");
    setRectificationTime("");
    setSelectedReasons([]);
    setCustomReason("");
    setRemarks("");
    setFormMajorSection("");
    setFormSection("");
    setFormStationLocation("");
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 4000);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newFault = {
      id: Date.now(),
      circuitId: selectedCircuit.id,
      division: selectedDivision,
      icmsEntryNo: selectedCircuit.name === "Control & ICMS Position" ? "None" : undefined,
      faultySection: "None",
      circuitFailed: selectedCircuit.name || "All Circuits OK",
      failureTime: formatDate(nowStr),
      rectificationTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasons: "Link Failure",
      remarks: "All circuits tested OK. No faults reported."
    };
    onSave(newFault);
    
    setIcmsEntryNo("");
    setFaultySection("");
    setCircuitFailed("");
    setFailureTime("");
    setRectificationTime("");
    setSelectedReasons([]);
    setCustomReason("");
    setRemarks("");
    moveToNextCircuit();
  };

  const reasonOptions = useMemo(() => {
    if (selectedCircuit.name === "Hotline") {
      return [
        "Control Failure",
        "Telephone Failure",
        "Cable Cut",
        "Link Failure",
        "Equipment Failure (STM)",
        "Equipment Failure (Phone)",
        "Power Failure",
        "Configuration Issue",
        "AddExchange",
        "Other"
      ];
    } else if (selectedCircuit.name === "Video Conferencing with Divisions") {
      return [
        "Control Failure",
        "Telephone Failure",
        "Cable Cut",
        "Link Failure",
        "Equipment Failure (STM)",
        "Equipment Failure (Phone)",
        "Power Failure",
        "Configuration Issue",
        "Router Failure",
        "Switch failure",
        "Other"
      ];
    } else if (selectedCircuit.name === "Control & ICMS Position" || selectedCircuit.name === "FOIS (VSAT)") {
      return [
        "Control Failure",
        "Telephone Failure",
        "Cable Cut",
        "Link Failure",
        "Equipment Failure (STM)",
        "Equipment Failure (MUX)",
        "Equipment Failure (Phone)",
        "Power Failure",
        "Configuration Issue",
        "Other"
      ];
    } else {
      return [
        "Control Failure",
        "Telephone Failure",
        "Cable Cut",
        "Link Failure",
        "Equipment Failure (STM)",
        "Equipment Failure (Phone)",
        "Power Failure",
        "Configuration Issue",
        "Other"
      ];
    }
  }, [selectedCircuit.name]);

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>{selectedCircuit.name}</h2>
        </div>
      </div>

      {formSuccess && (
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
          <span>✅ Saved Successfully</span>
        </div>
      )}

      <form className="fault-form" onSubmit={handleSave}>
        {isIcmsCom || isFoisVsat || isHotline || isVcDiv || isCftmConf ? (
          <>
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="icmsEntryNo" className="form-label">
                  ICMS Entry No./Docket No. <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="icmsEntryNo"
                  className={`form-input ${formErrors.icmsEntryNo ? "field-error-border" : ""}`}
                  placeholder="Enter ICMS entry number/docket number"
                  value={icmsEntryNo}
                  onChange={(e) => setIcmsEntryNo(e.target.value)}
                />
                {formErrors.icmsEntryNo && (
                  <span className="error-text">{formErrors.icmsEntryNo}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="formMajorSection" className="form-label">
                  Major Section <span className="required">*</span>
                </label>
                <select
                  id="formMajorSection"
                  className={`form-input ${formErrors.formMajorSection ? "field-error-border" : ""}`}
                  style={{ height: "42px", appearance: "auto" }}
                  value={formMajorSection}
                  onChange={(e) => setFormMajorSection(e.target.value)}
                >
                  <option value="">Select Major Section</option>
                  {["Bilaspur - Raigarh (BSP-RIG)", "Bilaspur - Katni (BSP-KTE)", "Champa - Korba (CPH-KRBA)"].map((mSec) => (
                    <option key={mSec} value={mSec}>{mSec}</option>
                  ))}
                </select>
                {formErrors.formMajorSection && (
                  <span className="error-text">{formErrors.formMajorSection}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="formSection" className="form-label">
                  Section <span className="required">*</span>
                </label>
                <select
                  id="formSection"
                  className={`form-input ${formErrors.formSection ? "field-error-border" : ""}`}
                  style={{ height: "42px", appearance: "auto" }}
                  value={formSection}
                  onChange={(e) => setFormSection(e.target.value)}
                  disabled={!formMajorSection}
                >
                  <option value="">Select Section</option>
                  {formMajorSection === "Bilaspur - Raigarh (BSP-RIG)" && (
                    <>
                      <option value="Bilaspur - Champa (BSP-CPH)">Bilaspur - Champa (BSP-CPH)</option>
                      <option value="Champa - Raigarh (CPH-RIG)">Champa - Raigarh (CPH-RIG)</option>
                    </>
                  )}
                  {formMajorSection === "Bilaspur - Katni (BSP-KTE)" && (
                    <>
                      <option value="Bilaspur - Anuppur (BSP-APR)">Bilaspur - Anuppur (BSP-APR)</option>
                      <option value="Anuppur - Shahdol (APR-SDL)">Anuppur - Shahdol (APR-SDL)</option>
                    </>
                  )}
                  {formMajorSection === "Champa - Korba (CPH-KRBA)" && (
                    <option value="Champa - Korba (CPH-KRBA)">Champa - Korba (CPH-KRBA)</option>
                  )}
                </select>
                {formErrors.formSection && (
                  <span className="error-text">{formErrors.formSection}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="formStationLocation" className="form-label">
                  Station/Location <span className="required">*</span>
                </label>
                <select
                  id="formStationLocation"
                  className={`form-input ${formErrors.formStationLocation ? "field-error-border" : ""}`}
                  style={{ height: "42px", appearance: "auto" }}
                  value={formStationLocation}
                  onChange={(e) => setFormStationLocation(e.target.value)}
                  disabled={!formMajorSection}
                >
                  <option value="">Select Station/Location</option>
                  {formSection === "Bilaspur - Champa (BSP-CPH)" && ["Bilaspur (BSP)", "Gadhwa Road (GTW)", "Akaltara (AKT)", "Naila (NIA)", "Champa Junction (CPH)"].map(s => <option key={s} value={s}>{s}</option>)}
                  {formSection === "Champa - Raigarh (CPH-RIG)" && ["Baradwar (BUA)", "Sakti (SKT)", "Kharsia (KHS)", "Raigarh (RIG)"].map(s => <option key={s} value={s}>{s}</option>)}
                  {formSection === "Bilaspur - Anuppur (BSP-APR)" && ["Pendra Road (PND)", "Jaithari (JTI)", "Anuppur Junction (APR)"].map(s => <option key={s} value={s}>{s}</option>)}
                  {formSection === "Anuppur - Shahdol (APR-SDL)" && ["Amlai (AAL)", "Burhar (BUH)", "Shahdol (SDL)"].map(s => <option key={s} value={s}>{s}</option>)}
                  {formSection === "Champa - Korba (CPH-KRBA)" && ["Korba (KRBA)", "Gevra Road (GAD)"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {formErrors.formStationLocation && (
                  <span className="error-text">{formErrors.formStationLocation}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="circuitFailed" className="form-label">
                  Name of Circuit Failed <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="circuitFailed"
                  className={`form-input ${formErrors.circuitFailed ? "field-error-border" : ""}`}
                  placeholder="Enter failed circuit name"
                  value={circuitFailed}
                  onChange={(e) => setCircuitFailed(e.target.value)}
                />
                {formErrors.circuitFailed && (
                  <span className="error-text">{formErrors.circuitFailed}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="failureTime" className="form-label">
                  Failure Date & Time <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="failureTime"
                  className={`form-input ${formErrors.failureTime ? "field-error-border" : ""}`}
                  value={failureTime}
                  onChange={(e) => setFailureTime(e.target.value)}
                />
                {formErrors.failureTime && (
                  <span className="error-text">{formErrors.failureTime}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="rectificationTime" className="form-label">
                  Rectification Time (RT) <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="rectificationTime"
                  className={`form-input ${formErrors.rectificationTime ? "field-error-border" : ""}`}
                  value={rectificationTime}
                  onChange={(e) => setRectificationTime(e.target.value)}
                />
                {formErrors.rectificationTime && (
                  <span className="error-text">{formErrors.rectificationTime}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="totalDuration" className="form-label">
                  Duration of Failure
                </label>
                <input
                  type="text"
                  id="totalDuration"
                  className="form-input"
                  value={totalDuration}
                  readOnly
                  placeholder="XX Hrs XX Min"
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">
                  Reason of Failure <span className="required">*</span>
                </label>
                <div className="multiselect-container" ref={reasonsRef}>
                  <button
                    type="button"
                    className={`multiselect-trigger ${reasonsDropdownOpen ? "open" : ""}`}
                    onClick={() => setReasonsDropdownOpen(!reasonsDropdownOpen)}
                  >
                    <span>
                      {selectedReasons.length === 0
                        ? "Select Reason(s)..."
                        : selectedReasons.join(", ")}
                    </span>
                  </button>
                  {reasonsDropdownOpen && (
                    <div className="multiselect-menu">
                      {reasonOptions.map((option) => (
                        <label key={option} className="multiselect-item">
                          <input
                            type="checkbox"
                            checked={selectedReasons.includes(option)}
                            onChange={() => {
                              if (selectedReasons.includes(option)) {
                                setSelectedReasons(selectedReasons.filter((r) => r !== option));
                              } else {
                                setSelectedReasons([...selectedReasons, option]);
                              }
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.reasons && (
                  <span className="error-text">{formErrors.reasons}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="remarks" className="form-label">Remarks</label>
                <input
                  type="text"
                  id="remarks"
                  className="form-input"
                  placeholder="Enter observations, action taken, or additional remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
          </>
        ) : (
          <>
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
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="icmsEntryNo" className="form-label">
                  ICMS Entry No./Docket No. <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="icmsEntryNo"
                  className={`form-input ${formErrors.icmsEntryNo ? "field-error-border" : ""}`}
                  placeholder="Enter ICMS entry number/docket number"
                  value={icmsEntryNo}
                  onChange={(e) => setIcmsEntryNo(e.target.value)}
                />
                {formErrors.icmsEntryNo && (
                  <span className="error-text">{formErrors.icmsEntryNo}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="faultySection" className="form-label">
                  {selectedCircuit.name === "FOIS (VSAT)"
                    ? "Location/station"
                    : selectedCircuit.name === "Hotline"
                    ? "Faulty Hotline Location"
                    : selectedCircuit.name === "Video Conferencing with Divisions"
                    ? "Faulty Location"
                    : "Faulty Section"} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="faultySection"
                  className={`form-input ${formErrors.faultySection ? "field-error-border" : ""}`}
                  placeholder={
                    selectedCircuit.name === "FOIS (VSAT)"
                      ? "Enter location/station name"
                      : selectedCircuit.name === "Hotline"
                      ? "Enter faulty hotline location"
                      : selectedCircuit.name === "Video Conferencing with Divisions"
                      ? "Enter faulty location"
                      : "Enter faulty section name"
                  }
                  value={faultySection}
                  onChange={(e) => setFaultySection(e.target.value)}
                />
                {formErrors.faultySection && (
                  <span className="error-text">{formErrors.faultySection}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="circuitFailed" className="form-label">
                  Name of Circuit Failed <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="circuitFailed"
                  className={`form-input ${formErrors.circuitFailed ? "field-error-border" : ""}`}
                  placeholder="Enter failed circuit name"
                  value={circuitFailed}
                  onChange={(e) => setCircuitFailed(e.target.value)}
                />
                {formErrors.circuitFailed && (
                  <span className="error-text">{formErrors.circuitFailed}</span>
                )}
              </div>
              <div className="form-group"></div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="failureTime" className="form-label">
                  Failure Date & Time <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="failureTime"
                  className={`form-input ${formErrors.failureTime ? "field-error-border" : ""}`}
                  value={failureTime}
                  onChange={(e) => setFailureTime(e.target.value)}
                />
                {formErrors.failureTime && (
                  <span className="error-text">{formErrors.failureTime}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="rectificationTime" className="form-label">
                  Rectification Time (RT) <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="rectificationTime"
                  className={`form-input ${formErrors.rectificationTime ? "field-error-border" : ""}`}
                  value={rectificationTime}
                  onChange={(e) => setRectificationTime(e.target.value)}
                />
                {formErrors.rectificationTime && (
                  <span className="error-text">{formErrors.rectificationTime}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="totalDuration" className="form-label">
                  Duration of Failure
                </label>
                <input
                  type="text"
                  id="totalDuration"
                  className="form-input"
                  value={totalDuration}
                  readOnly
                  placeholder="XX Hrs XX Min"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reason of Failure <span className="required">*</span>
                </label>
                <div className="multiselect-container" ref={reasonsRef}>
                  <button
                    type="button"
                    className={`multiselect-trigger ${reasonsDropdownOpen ? "open" : ""}`}
                    onClick={() => setReasonsDropdownOpen(!reasonsDropdownOpen)}
                  >
                    <span>
                      {selectedReasons.length === 0
                        ? "Select Reason(s)..."
                        : selectedReasons.join(", ")}
                    </span>
                  </button>
                  {reasonsDropdownOpen && (
                    <div className="multiselect-menu">
                      {reasonOptions.map((option) => (
                        <label key={option} className="multiselect-item">
                          <input
                            type="checkbox"
                            checked={selectedReasons.includes(option)}
                            onChange={() => {
                              if (selectedReasons.includes(option)) {
                                setSelectedReasons(selectedReasons.filter((r) => r !== option));
                              } else {
                                setSelectedReasons([...selectedReasons, option]);
                              }
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.reasons && (
                  <span className="error-text">{formErrors.reasons}</span>
                )}
              </div>
            </div>
          </>
        )}

        {selectedReasons.includes("Other") && (
          <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <label htmlFor="customReason" className="form-label">
              Other Reason <span className="required">*</span>
            </label>
            <input
              type="text"
              id="customReason"
              className={`form-input ${formErrors.customReason ? "field-error-border" : ""}`}
              placeholder="Enter custom failure reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
            {formErrors.customReason && (
              <span className="error-text">{formErrors.customReason}</span>
            )}
          </div>
        )}

        <div className="form-group full-width">
          <label htmlFor="remarks" className="form-label">Remarks</label>
          <textarea
            id="remarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter observations, action taken, or additional remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
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
          <button type="submit" className="save-button">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
