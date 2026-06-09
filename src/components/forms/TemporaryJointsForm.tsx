import { useState, useMemo } from "react";
import { Circuit } from "../../types";
import HierarchicalFields from "./HierarchicalFields";

interface TemporaryJointsFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function TemporaryJointsForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: TemporaryJointsFormProps) {
  const [tjSectionYardName, setTjSectionYardName] = useState("");
  const [tjKmNo, setTjKmNo] = useState("");
  const [tjCableType, setTjCableType] = useState("");
  const [tjTotalJoints, setTjTotalJoints] = useState("");
  const [tjJointsTime, setTjJointsTime] = useState("");
  const [tjRectified, setTjRectified] = useState("");
  const [tjRectifiedTime, setTjRectifiedTime] = useState("");
  const [tjTdc, setTjTdc] = useState("");
  const [tjActionPlan, setTjActionPlan] = useState("");
  const [tjRemarks, setTjRemarks] = useState("");
  const [tjFormErrors, setTjFormErrors] = useState<Record<string, string>>({});
  const [tjFormSuccess, setTjFormSuccess] = useState(false);
  const [tjSaving, setTjSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState(""); // Excluded from JSX but needed for type binding

  const tjBalanceJoints = useMemo(() => {
    if (!tjTotalJoints || !tjRectified) return "";
    const total = parseInt(tjTotalJoints, 10);
    const rect = parseInt(tjRectified, 10);
    if (isNaN(total) || isNaN(rect)) return "";
    return Math.max(0, total - rect).toString();
  }, [tjTotalJoints, tjRectified]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!tjSectionYardName.trim()) errors.tjSectionYardName = "Section/Yard Name is required";
    if (!tjKmNo.trim()) errors.tjKmNo = "KM Number is required";
    if (!tjCableType.trim()) errors.tjCableType = "Type of Cable is required";

    if (!tjTotalJoints.trim()) {
      errors.tjTotalJoints = "Total number of temporary joints is required";
    } else {
      const val = parseInt(tjTotalJoints, 10);
      if (isNaN(val) || val < 0) {
        errors.tjTotalJoints = "Must be a valid positive number";
      }
    }

    if (!tjJointsTime) {
      errors.tjJointsTime = "Joints Date & Time is required";
    }

    if (!tjRectified.trim()) {
      errors.tjRectified = "Rectified joints count is required";
    } else {
      const val = parseInt(tjRectified, 10);
      if (isNaN(val) || val < 0) {
        errors.tjRectified = "Must be a valid positive number";
      } else {
        const totalVal = parseInt(tjTotalJoints, 10);
        if (!isNaN(totalVal) && val > totalVal) {
          errors.tjRectified = "Rectified joints cannot exceed total joints";
        }
      }
    }

    if (tjRectified && parseInt(tjRectified, 10) > 0 && !tjRectifiedTime) {
      errors.tjRectifiedTime = "Rectified Date & Time is required when some joints are rectified";
    }

    if (tjJointsTime && tjRectifiedTime) {
      const start = new Date(tjJointsTime);
      const end = new Date(tjRectifiedTime);
      if (end.getTime() < start.getTime()) {
        errors.tjRectifiedTime = "Rectified Date & Time cannot be earlier than Joints Date & Time";
      }
    }

    if (!tjActionPlan.trim()) errors.tjActionPlan = "Action Plan is required";
    if (!tjTdc) errors.tjTdc = "Target Date of Completion (TDC) is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";

    if (Object.keys(errors).length > 0) {
      setTjFormErrors(errors);
      return;
    }

    setTjFormErrors({});
    setTjSaving(true);

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

      const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };

      const newTjRecord = {
        id: Date.now(),
        division: selectedDivision,
        sectionYardName: tjSectionYardName.trim(),
        kmNo: tjKmNo.trim(),
        cableType: tjCableType.trim(),
        totalJoints: tjTotalJoints.trim(),
        jointsTime: formatDatetime(tjJointsTime),
        rectified: tjRectified.trim(),
        rectifiedTime: formatDatetime(tjRectifiedTime),
        balanceJoints: tjBalanceJoints,
        actionPlan: tjActionPlan.trim(),
        tdc: formatDate(tjTdc),
        remarks: tjRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection
      };

      onSave(newTjRecord);
      setTjSaving(false);

      // Reset form fields
      setTjSectionYardName("");
      setTjKmNo("");
      setTjCableType("");
      setTjTotalJoints("");
      setTjJointsTime("");
      setTjRectified("");
      setTjRectifiedTime("");
      setTjActionPlan("");
      setTjTdc("");
      setTjRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setTjFormSuccess(true);
      setTimeout(() => setTjFormSuccess(false), 5000);
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
    const newTjRecord = {
      id: Date.now(),
      division: selectedDivision,
      sectionYardName: "None",
      kmNo: "None",
      cableType: "None",
      totalJoints: "0",
      jointsTime: formatDatetime(nowStr),
      rectified: "0",
      rectifiedTime: formatDatetime(nowStr),
      balanceJoints: "0",
      actionPlan: "None",
      tdc: nowStr.slice(0, 10),
      remarks: "No temporary splice joints reported on cable lines. All media joints permanently spliced."
    };
    onSave(newTjRecord);
    setTjSectionYardName("");
    setTjKmNo("");
    setTjCableType("");
    setTjTotalJoints("");
    setTjJointsTime("");
    setTjRectified("");
    setTjRectifiedTime("");
    setTjActionPlan("");
    setTjTdc("");
    setTjRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>Temporary Joints</h2>
        </div>
      </div>

      {tjFormSuccess && (
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
          <span>✅ Temporary Joints Record Saved Successfully</span>
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
          errors={tjFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="tjSectionYardName" className="form-label">
              Section/Yard Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tjSectionYardName"
              className={`form-input ${tjFormErrors.tjSectionYardName ? "field-error-border" : ""}`}
              placeholder="Enter section or yard name"
              value={tjSectionYardName}
              onChange={(e) => setTjSectionYardName(e.target.value)}
            />
            {tjFormErrors.tjSectionYardName && (
              <span className="error-text">{tjFormErrors.tjSectionYardName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tjKmNo" className="form-label">
              Km. No. <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tjKmNo"
              className={`form-input ${tjFormErrors.tjKmNo ? "field-error-border" : ""}`}
              placeholder="Example: KM 120/4"
              value={tjKmNo}
              onChange={(e) => setTjKmNo(e.target.value)}
            />
            {tjFormErrors.tjKmNo && (
              <span className="error-text">{tjFormErrors.tjKmNo}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="tjCableType" className="form-label">
              Type of Cable <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tjCableType"
              className={`form-input ${tjFormErrors.tjCableType ? "field-error-border" : ""}`}
              placeholder="Example: 6 Quad Cable, 24 F OFC"
              value={tjCableType}
              onChange={(e) => setTjCableType(e.target.value)}
            />
            {tjFormErrors.tjCableType && (
              <span className="error-text">{tjFormErrors.tjCableType}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tjTotalJoints" className="form-label">
              Total Temporary Joints <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tjTotalJoints"
              className={`form-input ${tjFormErrors.tjTotalJoints ? "field-error-border" : ""}`}
              placeholder="Enter total temporary joints"
              value={tjTotalJoints}
              onChange={(e) => setTjTotalJoints(e.target.value)}
            />
            {tjFormErrors.tjTotalJoints && (
              <span className="error-text">{tjFormErrors.tjTotalJoints}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="tjJointsTime" className="form-label">
              Joints Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="tjJointsTime"
              className={`form-input ${tjFormErrors.tjJointsTime ? "field-error-border" : ""}`}
              value={tjJointsTime}
              onChange={(e) => setTjJointsTime(e.target.value)}
            />
            {tjFormErrors.tjJointsTime && (
              <span className="error-text">{tjFormErrors.tjJointsTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tjRectified" className="form-label">
              Rectified Joints <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tjRectified"
              className={`form-input ${tjFormErrors.tjRectified ? "field-error-border" : ""}`}
              placeholder="Enter rectified joints count"
              value={tjRectified}
              onChange={(e) => setTjRectified(e.target.value)}
            />
            {tjFormErrors.tjRectified && (
              <span className="error-text">{tjFormErrors.tjRectified}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="tjRectifiedTime" className="form-label">
              Rectified Date & Time
            </label>
            <input
              type="datetime-local"
              id="tjRectifiedTime"
              className={`form-input ${tjFormErrors.tjRectifiedTime ? "field-error-border" : ""}`}
              value={tjRectifiedTime}
              onChange={(e) => setTjRectifiedTime(e.target.value)}
            />
            {tjFormErrors.tjRectifiedTime && (
              <span className="error-text">{tjFormErrors.tjRectifiedTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tjBalanceJoints" className="form-label">Balance Joints (Calculated)</label>
            <input
              type="text"
              id="tjBalanceJoints"
              className="form-input"
              value={tjBalanceJoints}
              readOnly
              placeholder="Calculated balance"
            />
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="tjTdc" className="form-label">
              Target Date of Completion (TDC) <span className="required">*</span>
            </label>
            <input
              type="date"
              id="tjTdc"
              className={`form-input ${tjFormErrors.tjTdc ? "field-error-border" : ""}`}
              value={tjTdc}
              onChange={(e) => setTjTdc(e.target.value)}
            />
            {tjFormErrors.tjTdc && (
              <span className="error-text">{tjFormErrors.tjTdc}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tjActionPlan" className="form-label">
              Action Plan <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tjActionPlan"
              className={`form-input ${tjFormErrors.tjActionPlan ? "field-error-border" : ""}`}
              placeholder="Enter restoration action details"
              value={tjActionPlan}
              onChange={(e) => setTjActionPlan(e.target.value)}
            />
            {tjFormErrors.tjActionPlan && (
              <span className="error-text">{tjFormErrors.tjActionPlan}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="tjRemarks" className="form-label">Remarks</label>
          <textarea
            id="tjRemarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter additional remarks or observations"
            value={tjRemarks}
            onChange={(e) => setTjRemarks(e.target.value)}
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
            className={`save-button ${tjSaving ? "save-button-loading" : ""}`}
            disabled={tjSaving}
          >
            {tjSaving ? (
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
