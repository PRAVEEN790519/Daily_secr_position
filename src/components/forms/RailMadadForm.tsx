import { useState, useMemo } from "react";
import { Circuit } from "../../types";
import { formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface RailMadadFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function RailMadadForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: RailMadadFormProps) {
  const [icmsEntryNo, setIcmsEntryNo] = useState("");
  const [madadBalanceLast, setMadadBalanceLast] = useState("");
  const [madadReceived, setMadadReceived] = useState("");
  const [madadComplied, setMadadComplied] = useState("");
  const [madadDescription, setMadadDescription] = useState("");
  const [madadCaseTime, setMadadCaseTime] = useState("");
  const [madadComplianceDetails, setMadadComplianceDetails] = useState("");
  const [madadComplianceTime, setMadadComplianceTime] = useState("");
  const [madadRemarks, setMadadRemarks] = useState("");
  const [madadFormErrors, setMadadFormErrors] = useState<Record<string, string>>({});
  const [madadFormSuccess, setMadadFormSuccess] = useState(false);
  const [madadSaving, setMadadSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const netBalanceCase = useMemo(() => {
    const last = parseInt(madadBalanceLast) || 0;
    const recd = parseInt(madadReceived) || 0;
    const comp = parseInt(madadComplied) || 0;
    return last + recd - comp;
  }, [madadBalanceLast, madadReceived, madadComplied]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }
    if (!madadBalanceLast.trim() || isNaN(Number(madadBalanceLast)) || Number(madadBalanceLast) < 0) {
      errors.madadBalanceLast = "Balance Last must be a non-negative number";
    }
    if (!madadReceived.trim() || isNaN(Number(madadReceived)) || Number(madadReceived) < 0) {
      errors.madadReceived = "Cases Received must be a non-negative number";
    }
    if (!madadComplied.trim() || isNaN(Number(madadComplied)) || Number(madadComplied) < 0) {
      errors.madadComplied = "Cases Complied must be a non-negative number";
    }
    if (!madadDescription.trim()) errors.madadDescription = "Case Description is required";
    if (!madadCaseTime) errors.madadCaseTime = "Case Date & Time is required";
    if (!madadComplianceDetails.trim()) errors.madadComplianceDetails = "Compliance Details are required";
    if (!madadComplianceTime) errors.madadComplianceTime = "Compliance Date & Time is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (Object.keys(errors).length > 0) {
      setMadadFormErrors(errors);
      return;
    }

    setMadadFormErrors({});
    setMadadSaving(true);

    setTimeout(() => {
      const newMadadRecord = {
        id: Date.now(),
        division: selectedDivision,
        icmsEntryNo: icmsEntryNo.trim(),
        balanceLast: madadBalanceLast.trim(),
        received: madadReceived.trim(),
        complied: madadComplied.trim(),
        netBalance: netBalanceCase,
        description: madadDescription.trim(),
        caseTime: formatDate(madadCaseTime),
        complianceDetails: madadComplianceDetails.trim(),
        complianceTime: formatDate(madadComplianceTime),
        remarks: madadRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation
      };

      onSave(newMadadRecord);
      setMadadSaving(false);

      // Reset
      setIcmsEntryNo("");
      setMadadBalanceLast("");
      setMadadReceived("");
      setMadadComplied("");
      setMadadDescription("");
      setMadadCaseTime("");
      setMadadComplianceDetails("");
      setMadadComplianceTime("");
      setMadadRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setMadadFormSuccess(true);
      setTimeout(() => setMadadFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newMadadRecord = {
      id: Date.now(),
      division: selectedDivision,
      balanceLast: "0",
      received: "0",
      complied: "0",
      netBalance: 0,
      description: "No grievances received today.",
      caseTime: formatDate(nowStr),
      complianceDetails: "All previous complaints cleared.",
      complianceTime: formatDate(nowStr),
      remarks: "Zero pending items."
    };
    onSave(newMadadRecord);
    setIcmsEntryNo("");
    setMadadBalanceLast("");
    setMadadReceived("");
    setMadadComplied("");
    setMadadDescription("");
    setMadadCaseTime("");
    setMadadComplianceDetails("");
    setMadadComplianceTime("");
    setMadadRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>Rail Madad Case Entry</h2>
        </div>
      </div>

      {madadFormSuccess && (
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
          <span>✅ Rail Madad Case Record Saved Successfully</span>
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
          errors={madadFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="madadIcmsEntryNo" className="form-label">
              ICMS Entry No./Docket No. <span className="required">*</span>
            </label>
            <input
              type="text"
              id="madadIcmsEntryNo"
              className={`form-input ${madadFormErrors.icmsEntryNo ? "field-error-border" : ""}`}
              placeholder="Enter ICMS entry number/docket number"
              value={icmsEntryNo}
              onChange={(e) => setIcmsEntryNo(e.target.value)}
            />
            {madadFormErrors.icmsEntryNo && (
              <span className="error-text">{madadFormErrors.icmsEntryNo}</span>
            )}
          </div>
          <div className="form-group"></div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="madadCaseTime" className="form-label">
              Case Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="madadCaseTime"
              className={`form-input ${madadFormErrors.madadCaseTime ? "field-error-border" : ""}`}
              value={madadCaseTime}
              onChange={(e) => setMadadCaseTime(e.target.value)}
            />
            {madadFormErrors.madadCaseTime && (
              <span className="error-text">{madadFormErrors.madadCaseTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="madadBalanceLast" className="form-label">
              Case Balance Till Last Date <span className="required">*</span>
            </label>
            <input
              type="text"
              id="madadBalanceLast"
              className={`form-input ${madadFormErrors.madadBalanceLast ? "field-error-border" : ""}`}
              placeholder="Enter balance cases till last date"
              value={madadBalanceLast}
              onChange={(e) => setMadadBalanceLast(e.target.value)}
            />
            {madadFormErrors.madadBalanceLast && (
              <span className="error-text">{madadFormErrors.madadBalanceLast}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="madadReceived" className="form-label">
              Case Received on Date <span className="required">*</span>
            </label>
            <input
              type="text"
              id="madadReceived"
              className={`form-input ${madadFormErrors.madadReceived ? "field-error-border" : ""}`}
              placeholder="Enter cases received today"
              value={madadReceived}
              onChange={(e) => setMadadReceived(e.target.value)}
            />
            {madadFormErrors.madadReceived && (
              <span className="error-text">{madadFormErrors.madadReceived}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="madadComplied" className="form-label">
              Case complied On Date <span className="required">*</span>
            </label>
            <input
              type="text"
              id="madadComplied"
              className={`form-input ${madadFormErrors.madadComplied ? "field-error-border" : ""}`}
              placeholder="Enter cases complied today"
              value={madadComplied}
              onChange={(e) => setMadadComplied(e.target.value)}
            />
            {madadFormErrors.madadComplied && (
              <span className="error-text">{madadFormErrors.madadComplied}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="madadNetBalance" className="form-label">
              Net Balance Case On Date
            </label>
            <input
              type="text"
              id="madadNetBalance"
              className="form-input"
              value={netBalanceCase}
              readOnly
              placeholder="Calculated balance"
            />
          </div>

          <div className="form-group">
            <label htmlFor="madadDescription" className="form-label">
              Description Of Case <span className="required">*</span>
            </label>
            <textarea
              id="madadDescription"
              className={`form-textarea ${madadFormErrors.madadDescription ? "field-error-border" : ""}`}
              style={{ height: "42px" }}
              placeholder="Enter grievance description details with date & time"
              value={madadDescription}
              onChange={(e) => setMadadDescription(e.target.value)}
            />
            {madadFormErrors.madadDescription && (
              <span className="error-text">{madadFormErrors.madadDescription}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="madadComplianceDetails" className="form-label">
              S&T Compliance details <span className="required">*</span>
            </label>
            <textarea
              id="madadComplianceDetails"
              className={`form-textarea ${madadFormErrors.madadComplianceDetails ? "field-error-border" : ""}`}
              style={{ height: "42px" }}
              placeholder="Enter S&T action taken and compliance details"
              value={madadComplianceDetails}
              onChange={(e) => setMadadComplianceDetails(e.target.value)}
            />
            {madadFormErrors.madadComplianceDetails && (
              <span className="error-text">{madadFormErrors.madadComplianceDetails}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="madadComplianceTime" className="form-label">
              S&T Compliance Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="madadComplianceTime"
              className={`form-input ${madadFormErrors.madadComplianceTime ? "field-error-border" : ""}`}
              value={madadComplianceTime}
              onChange={(e) => setMadadComplianceTime(e.target.value)}
            />
            {madadFormErrors.madadComplianceTime && (
              <span className="error-text">{madadFormErrors.madadComplianceTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="madadRemarks" className="form-label">Remarks</label>
            <textarea
              id="madadRemarks"
              className="form-textarea"
              style={{ height: "42px" }}
              placeholder="Enter additional remarks or observations"
              value={madadRemarks}
              onChange={(e) => setMadadRemarks(e.target.value)}
            />
          </div>
          <div className="form-group"></div>
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
            className={`save-button ${madadSaving ? "save-button-loading" : ""}`}
            disabled={madadSaving}
          >
            {madadSaving ? (
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
