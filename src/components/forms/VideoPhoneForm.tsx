import { useState, useEffect } from "react";
import { Circuit } from "../../types";
import { formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface VideoPhoneFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function VideoPhoneForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: VideoPhoneFormProps) {
  const [icmsEntryNo, setIcmsEntryNo] = useState("");
  const [vpPhodChamber, setVpPhodChamber] = useState("");
  const [vpCustomPhod, setVpCustomPhod] = useState("");
  const [vpTestingTime, setVpTestingTime] = useState("");
  const [vpVideoClarity, setVpVideoClarity] = useState("");
  const [vpAudioClarity, setVpAudioClarity] = useState("");
  const [vpRemarks, setVpRemarks] = useState("");
  const [vpFormErrors, setVpFormErrors] = useState<Record<string, string>>({});
  const [vpFormSuccess, setVpFormSuccess] = useState(false);
  const [vpSaving, setVpSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }
    if (!vpPhodChamber) errors.vpPhodChamber = "PHOD Chamber is required";
    if (vpPhodChamber === "Other" && !vpCustomPhod.trim()) {
      errors.vpCustomPhod = "Custom chamber name is required";
    }
    if (!vpTestingTime) errors.vpTestingTime = "Tested with RB Date & Time is required";
    if (!vpVideoClarity) errors.vpVideoClarity = "Video Clarity is required";
    if (!vpAudioClarity) errors.vpAudioClarity = "Audio Clarity is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (Object.keys(errors).length > 0) {
      setVpFormErrors(errors);
      return;
    }

    setVpFormErrors({});
    setVpSaving(true);

    setTimeout(() => {
      const newVpRecord = {
        id: Date.now(),
        division: selectedDivision,
        icmsEntryNo: icmsEntryNo.trim(),
        phodChamber: vpPhodChamber === "Other" ? `Other: ${vpCustomPhod.trim()}` : vpPhodChamber,
        testingTime: formatDate(vpTestingTime),
        videoClarity: vpVideoClarity,
        audioClarity: vpAudioClarity,
        remarks: vpRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation
      };

      onSave(newVpRecord);
      setVpSaving(false);

      // Reset form fields
      setIcmsEntryNo("");
      setVpPhodChamber("");
      setVpCustomPhod("");
      setVpTestingTime("");
      setVpVideoClarity("");
      setVpAudioClarity("");
      setVpRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setVpFormSuccess(true);
      setTimeout(() => setVpFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newVpRecord = {
      id: Date.now(),
      division: selectedDivision,
      testingTime: formatDate(nowStr),
      phodChamber: "GM Chamber",
      videoClarity: "Perfect",
      audioClarity: "Perfect",
      remarks: "Tested successfully with RB. Status normal."
    };
    onSave(newVpRecord);
    setIcmsEntryNo("");
    setVpPhodChamber("");
    setVpCustomPhod("");
    setVpTestingTime("");
    setVpVideoClarity("");
    setVpAudioClarity("");
    setVpRemarks("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>Railway Board Video Phone Test</h2>
        </div>
      </div>

      {vpFormSuccess && (
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
          <span>✅ Railway Board Video Phone Test Saved Successfully</span>
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
          errors={vpFormErrors}
        />

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="vpIcmsEntryNo" className="form-label">
              ICMS Entry No./Docket No. <span className="required">*</span>
            </label>
            <input
              type="text"
              id="vpIcmsEntryNo"
              className={`form-input ${vpFormErrors.icmsEntryNo ? "field-error-border" : ""}`}
              placeholder="Enter ICMS entry number/docket number"
              value={icmsEntryNo}
              onChange={(e) => setIcmsEntryNo(e.target.value)}
            />
            {vpFormErrors.icmsEntryNo && (
              <span className="error-text">{vpFormErrors.icmsEntryNo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="vpPhodChamber" className="form-label">
              PHOD Chamber <span className="required">*</span>
            </label>
            <select
              id="vpPhodChamber"
              className={`form-input ${vpFormErrors.vpPhodChamber ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={vpPhodChamber}
              onChange={(e) => {
                setVpPhodChamber(e.target.value);
                if (e.target.value !== "Other") setVpCustomPhod("");
              }}
            >
              <option value="">Select PHOD Chamber</option>
              <option value="GM Chamber">GM Chamber</option>
              <option value="AGM Chamber">AGM Chamber</option>
              <option value="PCSTE Chamber">PCSTE Chamber</option>
              <option value="PCOM Chamber">PCOM Chamber</option>
              <option value="PCCM Chamber">PCCM Chamber</option>
              <option value="Other">Other</option>
            </select>
            {vpFormErrors.vpPhodChamber && (
              <span className="error-text">{vpFormErrors.vpPhodChamber}</span>
            )}
          </div>
        </div>

        {vpPhodChamber === "Other" && (
          <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <label htmlFor="vpCustomPhod" className="form-label">
              Custom PHOD Chamber <span className="required">*</span>
            </label>
            <input
              type="text"
              id="vpCustomPhod"
              className={`form-input ${vpFormErrors.vpCustomPhod ? "field-error-border" : ""}`}
              placeholder="Enter custom PHOD Chamber name"
              value={vpCustomPhod}
              onChange={(e) => setVpCustomPhod(e.target.value)}
            />
            {vpFormErrors.vpCustomPhod && (
              <span className="error-text">{vpFormErrors.vpCustomPhod}</span>
            )}
          </div>
        )}

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="vpTestingTime" className="form-label">
              Tested with RB Date & Time <span className="required">*</span>
            </label>
            <input
              type="datetime-local"
              id="vpTestingTime"
              className={`form-input ${vpFormErrors.vpTestingTime ? "field-error-border" : ""}`}
              value={vpTestingTime}
              onChange={(e) => setVpTestingTime(e.target.value)}
            />
            {vpFormErrors.vpTestingTime && (
              <span className="error-text">{vpFormErrors.vpTestingTime}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="vpVideoClarity" className="form-label">
              Video Clarity <span className="required">*</span>
            </label>
            <select
              id="vpVideoClarity"
              className={`form-input ${vpFormErrors.vpVideoClarity ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={vpVideoClarity}
              onChange={(e) => setVpVideoClarity(e.target.value)}
            >
              <option value="">Select Video Clarity</option>
              <option value="Perfect">Perfect</option>
              <option value="Jittery">Jittery</option>
              <option value="No Video">No Video</option>
              <option value="Intermittent Outage">Intermittent Outage</option>
            </select>
            {vpFormErrors.vpVideoClarity && (
              <span className="error-text">{vpFormErrors.vpVideoClarity}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="vpAudioClarity" className="form-label">
              Audio Clarity <span className="required">*</span>
            </label>
            <select
              id="vpAudioClarity"
              className={`form-input ${vpFormErrors.vpAudioClarity ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={vpAudioClarity}
              onChange={(e) => setVpAudioClarity(e.target.value)}
            >
              <option value="">Select Audio Clarity</option>
              <option value="Perfect">Perfect</option>
              <option value="Distorted">Distorted</option>
              <option value="Low Volume">Low Volume</option>
              <option value="No Audio">No Audio</option>
            </select>
            {vpFormErrors.vpAudioClarity && (
              <span className="error-text">{vpFormErrors.vpAudioClarity}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="vpRemarks" className="form-label">Remarks</label>
            <input
              type="text"
              id="vpRemarks"
              className="form-input"
              placeholder="Enter additional remarks or observations"
              value={vpRemarks}
              onChange={(e) => setVpRemarks(e.target.value)}
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
            className={`save-button ${vpSaving ? "save-button-loading" : ""}`}
            disabled={vpSaving}
          >
            {vpSaving ? (
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
