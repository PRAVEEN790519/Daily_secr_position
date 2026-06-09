import { useState } from "react";
import { Circuit } from "../../types";
import HierarchicalFields from "./HierarchicalFields";

interface LowInsulationFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function LowInsulationForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: LowInsulationFormProps) {
  const [liKmNo, setLiKmNo] = useState("");
  const [liCableType, setLiCableType] = useState("");
  const [liFaultsTime, setLiFaultsTime] = useState("");
  const [liRectifiedTime, setLiRectifiedTime] = useState("");
  const [liBalanceFaults, setLiBalanceFaults] = useState("");
  const [liActionPlan, setLiActionPlan] = useState("");
  const [liRemarks, setLiRemarks] = useState("");
  const [liFormErrors, setLiFormErrors] = useState<Record<string, string>>({});
  const [liFormSuccess, setLiFormSuccess] = useState(false);
  const [liSaving, setLiSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!liCableType.trim()) {
      errors.liCableType = "Type of Cable is required";
    }

    if (!liKmNo.trim()) errors.liKmNo = "KM Number is required";

    if (!liFaultsTime) {
      errors.liFaultsTime = "Total no. of Insulation Faults(Date & Time) is required";
    }

    if (!liBalanceFaults.trim()) {
      errors.liBalanceFaults = "Balance faults count is required";
    }

    if (!liActionPlan.trim()) {
      errors.liActionPlan = "Action Plan & TDC is required";
    }

    if (liFaultsTime && liRectifiedTime) {
      const start = new Date(liFaultsTime);
      const end = new Date(liRectifiedTime);
      if (end.getTime() < start.getTime()) {
        errors.liRectifiedTime = "Rectified Date & Time cannot be earlier than Faults Date & Time";
      }
    }

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (Object.keys(errors).length > 0) {
      setLiFormErrors(errors);
      return;
    }

    setLiFormErrors({});
    setLiSaving(true);

    setTimeout(() => {
      const formatDatetime = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hour}:${minute}`;
      };

      const newLiRecord = {
        id: Date.now(),
        division: selectedDivision,
        cableType: liCableType.trim(),
        kmNo: liKmNo.trim(),
        faultsTime: formatDatetime(liFaultsTime),
        rectifiedTime: formatDatetime(liRectifiedTime),
        balanceFaults: liBalanceFaults.trim(),
        actionPlan: liActionPlan.trim(),
        remarks: liRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation
      };

      onSave(newLiRecord);
      setLiSaving(false);

      setLiCableType("");
      setLiKmNo("");
      setLiFaultsTime("");
      setLiRectifiedTime("");
      setLiBalanceFaults("");
      setLiActionPlan("");
      setLiRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setLiFormSuccess(true);
      setTimeout(() => setLiFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const formatDatetime = (dateStr: string) => {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hour = String(d.getHours()).padStart(2, "0");
      const minute = String(d.getMinutes()).padStart(2, "0");
      return `${day}-${month}-${year} ${hour}:${minute}`;
    };
    const newLiRecord = {
      id: Date.now(),
      division: selectedDivision,
      cableType: "None",
      kmNo: "None",
      faultsTime: formatDatetime(nowStr),
      rectifiedTime: formatDatetime(nowStr),
      balanceFaults: "0",
      actionPlan: "None",
      remarks: "All cable insulation parameters are healthy. Zero leaks reported."
    };
    onSave(newLiRecord);
    setLiCableType("");
    setLiKmNo("");
    setLiFaultsTime("");
    setLiRectifiedTime("");
    setLiBalanceFaults("");
    setLiActionPlan("");
    setLiRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>Low Insulation</h2>
        </div>
      </div>

      {liFormSuccess && (
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
          <span>✅ Low Insulation Record Saved Successfully</span>
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
          errors={liFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="liKmNo" className="form-label">
              Km. No. <span className="required">*</span>
            </label>
            <input
              type="text"
              id="liKmNo"
              className={`form-input ${liFormErrors.liKmNo ? "field-error-border" : ""}`}
              placeholder="Example: KM 120/4"
              value={liKmNo}
              onChange={(e) => setLiKmNo(e.target.value)}
            />
            {liFormErrors.liKmNo && (
              <span className="error-text">{liFormErrors.liKmNo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="liCableType" className="form-label">
              Type of Cable <span className="required">*</span>
            </label>
            <input
              type="text"
              id="liCableType"
              className={`form-input ${liFormErrors.liCableType ? "field-error-border" : ""}`}
              placeholder="Example: 6 Quad Cable, 24 F OFC"
              value={liCableType}
              onChange={(e) => setLiCableType(e.target.value)}
            />
            {liFormErrors.liCableType && (
              <span className="error-text">{liFormErrors.liCableType}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="liFaultsTime" className="form-label">
              Total no. of Insulation Faults (Date & Time) <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="liFaultsTime"
              className={`form-input ${liFormErrors.liFaultsTime ? "field-error-border" : ""}`}
              value={liFaultsTime}
              onChange={(e) => setLiFaultsTime(e.target.value)}
            />
            {liFormErrors.liFaultsTime && (
              <span className="error-text">{liFormErrors.liFaultsTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="liRectifiedTime" className="form-label">
              Rectified Date & Time
            </label>
            <input
              type="datetime-local"
              id="liRectifiedTime"
              className={`form-input ${liFormErrors.liRectifiedTime ? "field-error-border" : ""}`}
              value={liRectifiedTime}
              onChange={(e) => setLiRectifiedTime(e.target.value)}
            />
            {liFormErrors.liRectifiedTime && (
              <span className="error-text">{liFormErrors.liRectifiedTime}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="liBalanceFaults" className="form-label">
              Balance Insulation Faults <span className="required">*</span>
            </label>
            <input
              type="text"
              id="liBalanceFaults"
              className={`form-input ${liFormErrors.liBalanceFaults ? "field-error-border" : ""}`}
              placeholder="Enter pending faults count"
              value={liBalanceFaults}
              onChange={(e) => setLiBalanceFaults(e.target.value)}
            />
            {liFormErrors.liBalanceFaults && (
              <span className="error-text">{liFormErrors.liBalanceFaults}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="liActionPlan" className="form-label">
              Action Plan / TDC <span className="required">*</span>
            </label>
            <input
              type="text"
              id="liActionPlan"
              className={`form-input ${liFormErrors.liActionPlan ? "field-error-border" : ""}`}
              placeholder="Specify restoration plan and target date"
              value={liActionPlan}
              onChange={(e) => setLiActionPlan(e.target.value)}
            />
            {liFormErrors.liActionPlan && (
              <span className="error-text">{liFormErrors.liActionPlan}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="liRemarks" className="form-label">Remarks</label>
          <textarea
            id="liRemarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter additional remarks or observations"
            value={liRemarks}
            onChange={(e) => setLiRemarks(e.target.value)}
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
            className={`save-button ${liSaving ? "save-button-loading" : ""}`}
            disabled={liSaving}
          >
            {liSaving ? (
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
