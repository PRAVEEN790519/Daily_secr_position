import { useState, useMemo, useEffect, useRef } from "react";
import { Circuit } from "../../types";
import HierarchicalFields from "./HierarchicalFields";

interface WalkieTalkieRepairingFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function WalkieTalkieRepairingForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: WalkieTalkieRepairingFormProps) {
  const [wtrDate, setWtrDate] = useState("");
  const [wtrOpeningBalance, setWtrOpeningBalance] = useState("");
  const [wtrReceivedFromUser, setWtrReceivedFromUser] = useState("");
  const [wtrSentToFirm, setWtrSentToFirm] = useState("");
  const [wtrRepairedFromFirm, setWtrRepairedFromFirm] = useState("");
  const [wtrReturnedToUser, setWtrReturnedToUser] = useState("");
  const [wtrFaultTypes, setWtrFaultTypes] = useState<string[]>([]);
  const [wtrFaultTypesOpen, setWtrFaultTypesOpen] = useState(false);
  const [wtrCustomFault, setWtrCustomFault] = useState("");
  const [wtrRepairStatus, setWtrRepairStatus] = useState("");
  const [wtrProposedCondemnation, setWtrProposedCondemnation] = useState("");
  const [wtrCondemned, setWtrCondemned] = useState("");
  const [wtrTotalCondemnedYear, setWtrTotalCondemnedYear] = useState("");
  const [wtrActionTaken, setWtrActionTaken] = useState("");
  const [wtrRemarks, setWtrRemarks] = useState("");
  const [wtrFormErrors, setWtrFormErrors] = useState<Record<string, string>>({});
  const [wtrFormSuccess, setWtrFormSuccess] = useState(false);
  const [wtrSaving, setWtrSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const wtrFaultTypesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (wtrFaultTypesRef.current && !wtrFaultTypesRef.current.contains(e.target as Node)) {
        setWtrFaultTypesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const wtrPendingRepair = useMemo(() => {
    const ob = parseInt(wtrOpeningBalance, 10);
    const recv = parseInt(wtrReceivedFromUser, 10);
    const ret = parseInt(wtrReturnedToUser, 10);
    const cond = parseInt(wtrCondemned, 10);
    if (isNaN(ob) || isNaN(recv) || isNaN(ret) || isNaN(cond)) return "";
    return Math.max(0, ob + recv - ret - cond).toString();
  }, [wtrOpeningBalance, wtrReceivedFromUser, wtrReturnedToUser, wtrCondemned]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!wtrDate) errors.wtrDate = "Date is required";

    const validateNonNegative = (val: string, fieldName: string) => {
      if (!val.trim()) {
        errors[fieldName] = "This field is required";
      } else {
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 0) {
          errors[fieldName] = "Must be a valid positive number or 0";
        }
      }
    };

    validateNonNegative(wtrOpeningBalance, "wtrOpeningBalance");
    validateNonNegative(wtrReceivedFromUser, "wtrReceivedFromUser");
    validateNonNegative(wtrSentToFirm, "wtrSentToFirm");
    validateNonNegative(wtrRepairedFromFirm, "wtrRepairedFromFirm");
    validateNonNegative(wtrReturnedToUser, "wtrReturnedToUser");
    validateNonNegative(wtrProposedCondemnation, "wtrProposedCondemnation");
    validateNonNegative(wtrCondemned, "wtrCondemned");
    validateNonNegative(wtrTotalCondemnedYear, "wtrTotalCondemnedYear");

    if (wtrFaultTypes.length === 0) {
      errors.wtrFaultTypes = "Select at least one fault type";
    } else if (wtrFaultTypes.includes("Other") && !wtrCustomFault.trim()) {
      errors.wtrCustomFault = "Fault description is required when 'Other' is selected";
    }

    if (!wtrRepairStatus) {
      errors.wtrRepairStatus = "Repair Status is required";
    }

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    const ob = parseInt(wtrOpeningBalance, 10) || 0;
    const recv = parseInt(wtrReceivedFromUser, 10) || 0;
    const ret = parseInt(wtrReturnedToUser, 10) || 0;
    const cond = parseInt(wtrCondemned, 10) || 0;
    if (ob >= 0 && recv >= 0 && ret >= 0 && cond >= 0) {
      if (ret + cond > ob + recv) {
        errors.wtrReturnedToUser = "Returned sets + Condemned sets cannot exceed total defective sets (Opening + Received)";
      }
    }

    if (Object.keys(errors).length > 0) {
      setWtrFormErrors(errors);
      return;
    }

    setWtrFormErrors({});
    setWtrSaving(true);

    setTimeout(() => {
      const formatDateWtr = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };

      const newWtrRecord = {
        id: Date.now(),
        division: selectedDivision,
        date: formatDateWtr(wtrDate),
        openingBalance: wtrOpeningBalance.trim(),
        receivedFromUser: wtrReceivedFromUser.trim(),
        sentToFirm: wtrSentToFirm.trim(),
        repairedFromFirm: wtrRepairedFromFirm.trim(),
        returnedToUser: wtrReturnedToUser.trim(),
        faultTypes: wtrFaultTypes.map(f => f === "Other" ? `Other: ${wtrCustomFault.trim()}` : f).join(", "),
        repairStatus: wtrRepairStatus,
        proposedCondemnation: wtrProposedCondemnation.trim(),
        condemned: wtrCondemned.trim(),
        totalCondemnedYear: wtrTotalCondemnedYear.trim(),
        actionTaken: wtrActionTaken.trim(),
        pendingRepair: wtrPendingRepair,
        remarks: wtrRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation
      };

      onSave(newWtrRecord);
      setWtrSaving(false);

      // Reset form fields
      setWtrDate("");
      setWtrOpeningBalance("");
      setWtrReceivedFromUser("");
      setWtrSentToFirm("");
      setWtrRepairedFromFirm("");
      setWtrReturnedToUser("");
      setWtrFaultTypes([]);
      setWtrCustomFault("");
      setWtrRepairStatus("");
      setWtrProposedCondemnation("");
      setWtrCondemned("");
      setWtrTotalCondemnedYear("");
      setWtrActionTaken("");
      setWtrRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setWtrFormSuccess(true);
      setTimeout(() => setWtrFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 10);
    const newWtrRecord = {
      id: Date.now(),
      division: selectedDivision,
      date: nowStr,
      openingBalance: "0",
      receivedFromUser: "0",
      sentToFirm: "0",
      repairedFromFirm: "0",
      returnedToUser: "0",
      faultTypes: "None",
      repairStatus: "Completed",
      proposedCondemnation: "0",
      condemned: "0",
      totalCondemnedYear: "0",
      actionTaken: "None",
      pendingRepair: "0",
      remarks: "All walkie-talkie sets functional. No pending sets in repair queue."
    };
    onSave(newWtrRecord);
    setWtrDate("");
    setWtrOpeningBalance("");
    setWtrReceivedFromUser("");
    setWtrSentToFirm("");
    setWtrRepairedFromFirm("");
    setWtrReturnedToUser("");
    setWtrFaultTypes([]);
    setWtrCustomFault("");
    setWtrRepairStatus("");
    setWtrProposedCondemnation("");
    setWtrCondemned("");
    setWtrTotalCondemnedYear("");
    setWtrActionTaken("");
    setWtrRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>Walkie-Talkie Repairing</h2>
        </div>
      </div>

      {wtrFormSuccess && (
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
          <span>✅ Walkie-Talkie Repairing Saved Successfully</span>
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
          errors={wtrFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtrDate" className="form-label">
              Date <span className="required">*</span>
            </label>
            <input
              type="date"
              id="wtrDate"
              className={`form-input ${wtrFormErrors.wtrDate ? "field-error-border" : ""}`}
              value={wtrDate}
              onChange={(e) => setWtrDate(e.target.value)}
            />
            {wtrFormErrors.wtrDate && (
              <span className="error-text">{wtrFormErrors.wtrDate}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtrOpeningBalance" className="form-label">
              Opening Balance Defective Sets <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrOpeningBalance"
              className={`form-input ${wtrFormErrors.wtrOpeningBalance ? "field-error-border" : ""}`}
              placeholder="Enter Opening Balance sets"
              value={wtrOpeningBalance}
              onChange={(e) => setWtrOpeningBalance(e.target.value)}
            />
            {wtrFormErrors.wtrOpeningBalance && (
              <span className="error-text">{wtrFormErrors.wtrOpeningBalance}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtrReceivedFromUser" className="form-label">
              Defective Sets Received from User <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrReceivedFromUser"
              className={`form-input ${wtrFormErrors.wtrReceivedFromUser ? "field-error-border" : ""}`}
              placeholder="Enter sets received"
              value={wtrReceivedFromUser}
              onChange={(e) => setWtrReceivedFromUser(e.target.value)}
            />
            {wtrFormErrors.wtrReceivedFromUser && (
              <span className="error-text">{wtrFormErrors.wtrReceivedFromUser}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtrSentToFirm" className="form-label">
              Defective Sets Sent to Firm <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrSentToFirm"
              className={`form-input ${wtrFormErrors.wtrSentToFirm ? "field-error-border" : ""}`}
              placeholder="Enter sets sent to repair firm"
              value={wtrSentToFirm}
              onChange={(e) => setWtrSentToFirm(e.target.value)}
            />
            {wtrFormErrors.wtrSentToFirm && (
              <span className="error-text">{wtrFormErrors.wtrSentToFirm}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtrRepairedFromFirm" className="form-label">
              Repaired Sets Received from Firm <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrRepairedFromFirm"
              className={`form-input ${wtrFormErrors.wtrRepairedFromFirm ? "field-error-border" : ""}`}
              placeholder="Enter sets repaired"
              value={wtrRepairedFromFirm}
              onChange={(e) => setWtrRepairedFromFirm(e.target.value)}
            />
            {wtrFormErrors.wtrRepairedFromFirm && (
              <span className="error-text">{wtrFormErrors.wtrRepairedFromFirm}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtrReturnedToUser" className="form-label">
              Repaired Sets Returned to User <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrReturnedToUser"
              className={`form-input ${wtrFormErrors.wtrReturnedToUser ? "field-error-border" : ""}`}
              placeholder="Enter sets returned to stations"
              value={wtrReturnedToUser}
              onChange={(e) => setWtrReturnedToUser(e.target.value)}
            />
            {wtrFormErrors.wtrReturnedToUser && (
              <span className="error-text">{wtrFormErrors.wtrReturnedToUser}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label className="form-label">
              Nature of Faults <span className="required">*</span>
            </label>
            <div className="multiselect-container" ref={wtrFaultTypesRef}>
              <button
                type="button"
                className={`multiselect-trigger ${wtrFaultTypesOpen ? "open" : ""}`}
                onClick={() => setWtrFaultTypesOpen(!wtrFaultTypesOpen)}
              >
                <span>
                  {wtrFaultTypes.length === 0
                    ? "Select Fault Type(s)..."
                    : wtrFaultTypes.join(", ")}
                </span>
              </button>
              {wtrFaultTypesOpen && (
                <div className="multiselect-menu">
                  {["Battery Drain", "No TX/RX", "Display Fault", "Antenna Broken", "Knob Damaged", "Other"].map((option) => (
                    <label key={option} className="multiselect-item">
                      <input
                        type="checkbox"
                        checked={wtrFaultTypes.includes(option)}
                        onChange={() => {
                          if (wtrFaultTypes.includes(option)) {
                            setWtrFaultTypes(wtrFaultTypes.filter((f) => f !== option));
                          } else {
                            setWtrFaultTypes([...wtrFaultTypes, option]);
                          }
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {wtrFormErrors.wtrFaultTypes && (
              <span className="error-text">{wtrFormErrors.wtrFaultTypes}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtrRepairStatus" className="form-label">
              Repair Status <span className="required">*</span>
            </label>
            <select
              id="wtrRepairStatus"
              className={`form-input ${wtrFormErrors.wtrRepairStatus ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={wtrRepairStatus}
              onChange={(e) => setWtrRepairStatus(e.target.value)}
            >
              <option value="">Select Repair Status</option>
              <option value="Under Diagnostics">Under Diagnostics</option>
              <option value="Sent to Firm">Sent to Firm</option>
              <option value="Awaiting Spares">Awaiting Spares</option>
              <option value="Repaired">Repaired</option>
              <option value="Unrepairable / Condemnation proposed">Unrepairable / Condemnation proposed</option>
            </select>
            {wtrFormErrors.wtrRepairStatus && (
              <span className="error-text">{wtrFormErrors.wtrRepairStatus}</span>
            )}
          </div>
        </div>

        {wtrFaultTypes.includes("Other") && (
          <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <label htmlFor="wtrCustomFault" className="form-label">
              Custom Fault Description <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrCustomFault"
              className={`form-input ${wtrFormErrors.wtrCustomFault ? "field-error-border" : ""}`}
              placeholder="Enter defective sets issues manually"
              value={wtrCustomFault}
              onChange={(e) => setWtrCustomFault(e.target.value)}
            />
            {wtrFormErrors.wtrCustomFault && (
              <span className="error-text">{wtrFormErrors.wtrCustomFault}</span>
            )}
          </div>
        )}

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtrProposedCondemnation" className="form-label">
              Proposed Condemnation (Defective sets) <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrProposedCondemnation"
              className={`form-input ${wtrFormErrors.wtrProposedCondemnation ? "field-error-border" : ""}`}
              placeholder="Enter count proposed for condemnation"
              value={wtrProposedCondemnation}
              onChange={(e) => setWtrProposedCondemnation(e.target.value)}
            />
            {wtrFormErrors.wtrProposedCondemnation && (
              <span className="error-text">{wtrFormErrors.wtrProposedCondemnation}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtrCondemned" className="form-label">
              Condemned Sets <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrCondemned"
              className={`form-input ${wtrFormErrors.wtrCondemned ? "field-error-border" : ""}`}
              placeholder="Enter sets officially condemned"
              value={wtrCondemned}
              onChange={(e) => setWtrCondemned(e.target.value)}
            />
            {wtrFormErrors.wtrCondemned && (
              <span className="error-text">{wtrFormErrors.wtrCondemned}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtrTotalCondemnedYear" className="form-label">
              Total Condemned Sets (Current Year) <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtrTotalCondemnedYear"
              className={`form-input ${wtrFormErrors.wtrTotalCondemnedYear ? "field-error-border" : ""}`}
              placeholder="Enter year cumulative condemned sets"
              value={wtrTotalCondemnedYear}
              onChange={(e) => setWtrTotalCondemnedYear(e.target.value)}
            />
            {wtrFormErrors.wtrTotalCondemnedYear && (
              <span className="error-text">{wtrFormErrors.wtrTotalCondemnedYear}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtrPendingRepair" className="form-label">Pending Repair sets (Calculated)</label>
            <input
              type="text"
              id="wtrPendingRepair"
              className="form-input"
              value={wtrPendingRepair}
              readOnly
              placeholder="Calculated queue sets"
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtrActionTaken" className="form-label">Action Taken</label>
            <input
              type="text"
              id="wtrActionTaken"
              className="form-input"
              placeholder="Enter action taken details"
              value={wtrActionTaken}
              onChange={(e) => setWtrActionTaken(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="wtrRemarks" className="form-label">Remarks</label>
            <input
              type="text"
              id="wtrRemarks"
              className="form-input"
              placeholder="Enter additional remarks or observations"
              value={wtrRemarks}
              onChange={(e) => setWtrRemarks(e.target.value)}
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
            className={`save-button ${wtrSaving ? "save-button-loading" : ""}`}
            disabled={wtrSaving}
          >
            {wtrSaving ? (
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
