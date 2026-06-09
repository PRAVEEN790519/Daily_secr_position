import { useState, useMemo, useEffect, useRef } from "react";
import { Circuit } from "../../types";
import { calculateDuration, formatDate } from "../../utils/dateTime";
import HierarchicalFields from "./HierarchicalFields";

interface RailnetFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function RailnetForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: RailnetFormProps) {
  const [icmsEntryNo, setIcmsEntryNo] = useState("");
  const [netBandwidth, setNetBandwidth] = useState("");
  const [netTestingTime, setNetTestingTime] = useState("");
  const [netDnSpeed, setNetDnSpeed] = useState("");
  const [netUpSpeed, setNetUpSpeed] = useState("");
  const [netFaultNature, setNetFaultNature] = useState("");
  const [netCustomFaultNature, setNetCustomFaultNature] = useState("");
  const [netAuditReport, setNetAuditReport] = useState("");
  const [netAttachment, setNetAttachment] = useState<File | null>(null);
  const [netActiveTab, setNetActiveTab] = useState<"divisional" | "hq">("divisional");
  const [netFailureTime, setNetFailureTime] = useState("");
  const [netRectificationTime, setNetRectificationTime] = useState("");
  const [netSelectedReasons, setNetSelectedReasons] = useState<string[]>([]);
  const [netReasonsDropdownOpen, setNetReasonsDropdownOpen] = useState(false);
  const [netCustomReason, setNetCustomReason] = useState("");
  const [netRemarks, setNetRemarks] = useState("");
  const [netFormErrors, setNetFormErrors] = useState<Record<string, string>>({});
  const [netFormSuccess, setNetFormSuccess] = useState(false);
  const [netSaving, setNetSaving] = useState(false);

  const [formMajorSection, setFormMajorSection] = useState("");
  const [formSection, setFormSection] = useState("");
  const [formStationLocation, setFormStationLocation] = useState("");

  const netReasonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (netReasonsRef.current && !netReasonsRef.current.contains(e.target as Node)) {
        setNetReasonsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const netTotalDuration = useMemo(() => {
    return calculateDuration(netFailureTime, netRectificationTime);
  }, [netFailureTime, netRectificationTime]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }
    if (!netBandwidth.trim()) errors.netBandwidth = "Bandwidth is required";
    if (!netTestingTime) {
      errors.netTestingTime = "Testing Time is required";
    }
    if (!netFaultNature) errors.netFaultNature = "Nature of Fault is required";
    if (netFaultNature === "Other" && !netCustomFaultNature.trim()) {
      errors.netCustomFaultNature = "Fault details are required";
    }
    if (!netAuditReport.trim()) {
      errors.netAuditReport = "Audit Report is required";
    }
    if (!netFailureTime) errors.netFailureTime = "Failure Date & Time is required";
    if (!netRectificationTime) errors.netRectificationTime = "Rectification Time is required";
    if (netSelectedReasons.length === 0) errors.reasons = "At least one failure reason is required";
    if (netSelectedReasons.includes("Other") && !netCustomReason.trim()) {
      errors.netCustomReason = "Custom failure reason is required";
    }

    if (netActiveTab !== "hq") {
      if (!formMajorSection) errors.formMajorSection = "Major Section is required";
      if (!formSection) errors.formSection = "Section is required";
      if (!formStationLocation) errors.formStationLocation = "Station/Location is required";
    }

    if (netDnSpeed && isNaN(Number(netDnSpeed))) {
      errors.netDnSpeed = "Download Link Speed must be numeric";
    }
    if (netUpSpeed && isNaN(Number(netUpSpeed))) {
      errors.netUpSpeed = "Upload Link Speed must be numeric";
    }

    if (netFailureTime && netRectificationTime) {
      const start = new Date(netFailureTime);
      const end = new Date(netRectificationTime);
      if (end.getTime() < start.getTime()) {
        errors.netRectificationTime = "Rectification Time cannot be earlier than Failure Time";
      }
    }

    if (Object.keys(errors).length > 0) {
      setNetFormErrors(errors);
      return;
    }

    setNetFormErrors({});
    setNetSaving(true);

    setTimeout(() => {
      const newNetRecord = {
        id: Date.now(),
        division: selectedDivision,
        icmsEntryNo: icmsEntryNo.trim(),
        location: netActiveTab === "hq" ? "Bilaspur HQ" : formStationLocation,
        bandwidth: netBandwidth.trim(),
        testingTime: formatDate(netTestingTime),
        dnSpeed: netDnSpeed ? `${netDnSpeed} Mbps` : "-",
        upSpeed: netUpSpeed ? `${netUpSpeed} Mbps` : "-",
        faultNature: netFaultNature === "Other" ? `Other: ${netCustomFaultNature.trim()}` : netFaultNature,
        auditReport: netAuditReport.trim(),
        attachmentName: netAttachment ? netAttachment.name : undefined,
        failureTime: formatDate(netFailureTime),
        rectificationTime: formatDate(netRectificationTime),
        duration: netTotalDuration,
        reasons: netSelectedReasons.map(r => r === "Other" ? `Other: ${netCustomReason.trim()}` : r).join(", "),
        remarks: netRemarks.trim(),
        majorSection: netActiveTab === "hq" ? "Bilaspur HQ" : formMajorSection,
        section: netActiveTab === "hq" ? "HQ Internet Maintenance" : formSection,
        stationLocation: netActiveTab === "hq" ? "SECR HQ (Bilaspur)" : formStationLocation
      };

      onSave(newNetRecord);
      setNetSaving(false);

      // Reset form fields
      setIcmsEntryNo("");
      setNetBandwidth("");
      setNetTestingTime("");
      setNetDnSpeed("");
      setNetUpSpeed("");
      setNetFaultNature("");
      setNetCustomFaultNature("");
      setNetAuditReport("");
      setNetAttachment(null);
      setNetFailureTime("");
      setNetRectificationTime("");
      setNetSelectedReasons([]);
      setNetCustomReason("");
      setNetRemarks("");
      if (netActiveTab === "hq") {
        setFormMajorSection("Bilaspur HQ");
        setFormSection("HQ Internet Maintenance");
        setFormStationLocation("SECR HQ (Bilaspur)");
      } else {
        setFormMajorSection("");
        setFormSection("");
        setFormStationLocation("");
      }
      setNetFormSuccess(true);
      setTimeout(() => setNetFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 16);
    const newWifiRecord = {
      id: Date.now(),
      division: selectedDivision,
      majorSection: "All Sections OK",
      section: "All OK",
      stationLocation: "All access points functioning normally.",
      failureTime: formatDate(nowStr),
      rectifiedTime: formatDate(nowStr),
      duration: "0 Hrs 0 Min",
      reasonOfFailure: "No failures reported.",
      remarks: "All systems healthy."
    };
    onSave(newWifiRecord);
    setWifiFailureTime("");
    setWifiRectifiedTime("");
    setWifiReasonOfFailure("");
    setWifiRemarks("");
    moveToNextCircuit();
  };

  const [wifiFailureTime, setWifiFailureTime] = useState("");
  const [wifiRectifiedTime, setWifiRectifiedTime] = useState("");
  const [wifiReasonOfFailure, setWifiReasonOfFailure] = useState("");
  const [wifiRemarks, setWifiRemarks] = useState("");

  return (
    <div className="workspace-content">
      <div className="workspace-title-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="workspace-title-left">
          <h2>Railnet / Internet</h2>
        </div>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: netActiveTab === 'divisional' ? '#ffffff' : 'transparent',
              color: netActiveTab === 'divisional' ? 'var(--primary-color)' : '#64748b',
              boxShadow: netActiveTab === 'divisional' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
            onClick={() => {
              setNetActiveTab('divisional');
              setFormMajorSection("");
              setFormSection("");
              setFormStationLocation("");
            }}
          >
            Divisional Maintenance
          </button>
          <button
            type="button"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '500',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: netActiveTab === 'hq' ? '#ffffff' : 'transparent',
              color: netActiveTab === 'hq' ? 'var(--primary-color)' : '#64748b',
              boxShadow: netActiveTab === 'hq' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
            onClick={() => {
              setNetActiveTab('hq');
              setFormMajorSection("Bilaspur HQ");
              setFormSection("HQ Internet Maintenance");
              setFormStationLocation("SECR HQ (Bilaspur)");
            }}
          >
            HQ Maintenance
          </button>
        </div>
      </div>

      {netFormSuccess && (
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
          <span>✅ Railnet / Internet Record Saved Successfully</span>
        </div>
      )}

      <form className="fault-form" onSubmit={handleSave}>
        {netActiveTab !== "hq" ? (
          <>
            <HierarchicalFields
              selectedDivision={selectedDivision}
              formMajorSection={formMajorSection}
              setFormMajorSection={setFormMajorSection}
              formSection={formSection}
              setFormSection={setFormSection}
              formStationLocation={formStationLocation}
              setFormStationLocation={setFormStationLocation}
              errors={netFormErrors}
            />

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netIcmsEntryNo" className="form-label">
                  ICMS Entry No./Docket No. <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netIcmsEntryNo"
                  className={`form-input ${netFormErrors.icmsEntryNo ? "field-error-border" : ""}`}
                  placeholder="Enter ICMS entry number/docket number"
                  value={icmsEntryNo}
                  onChange={(e) => setIcmsEntryNo(e.target.value)}
                />
                {netFormErrors.icmsEntryNo && (
                  <span className="error-text">{netFormErrors.icmsEntryNo}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="netBandwidth" className="form-label">
                  Bandwidth <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netBandwidth"
                  className={`form-input ${netFormErrors.netBandwidth ? "field-error-border" : ""}`}
                  placeholder="Example: 100 Mbps, 1 Gbps"
                  value={netBandwidth}
                  onChange={(e) => setNetBandwidth(e.target.value)}
                />
                {netFormErrors.netBandwidth && (
                  <span className="error-text">{netFormErrors.netBandwidth}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netTestingTime" className="form-label">
                  Last Testing Time <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="netTestingTime"
                  className={`form-input ${netFormErrors.netTestingTime ? "field-error-border" : ""}`}
                  value={netTestingTime}
                  onChange={(e) => setNetTestingTime(e.target.value)}
                />
                {netFormErrors.netTestingTime && (
                  <span className="error-text">{netFormErrors.netTestingTime}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="netFaultNature" className="form-label">
                  Nature of Fault <span className="required">*</span>
                </label>
                <select
                  id="netFaultNature"
                  className={`form-input ${netFormErrors.netFaultNature ? "field-error-border" : ""}`}
                  style={{ height: "42px", appearance: "auto" }}
                  value={netFaultNature}
                  onChange={(e) => {
                    setNetFaultNature(e.target.value);
                    if (e.target.value !== "Other") setNetCustomFaultNature("");
                  }}
                >
                  <option value="">Select Nature of Fault</option>
                  <option value="Slow Internet">Slow Internet</option>
                  <option value="No Connectivity">No Connectivity</option>
                  <option value="Packet Loss">Packet Loss</option>
                  <option value="High Latency">High Latency</option>
                  <option value="Link Down">Link Down</option>
                  <option value="Frequent Disconnection">Frequent Disconnection</option>
                  <option value="Bandwidth Degradation">Bandwidth Degradation</option>
                  <option value="Equipment Failure">Equipment Failure</option>
                  <option value="Other">Other</option>
                </select>
                {netFormErrors.netFaultNature && (
                  <span className="error-text">{netFormErrors.netFaultNature}</span>
                )}
              </div>
            </div>

            {netFaultNature === "Other" && (
              <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                <label htmlFor="netCustomFaultNature" className="form-label">
                  Other Nature of Fault <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netCustomFaultNature"
                  className={`form-input ${netFormErrors.netCustomFaultNature ? "field-error-border" : ""}`}
                  placeholder="Enter fault details"
                  value={netCustomFaultNature}
                  onChange={(e) => setNetCustomFaultNature(e.target.value)}
                />
                {netFormErrors.netCustomFaultNature && (
                  <span className="error-text">{netFormErrors.netCustomFaultNature}</span>
                )}
              </div>
            )}

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netAuditReport" className="form-label">
                  Audit Report <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netAuditReport"
                  className={`form-input ${netFormErrors.netAuditReport ? "field-error-border" : ""}`}
                  placeholder="Enter Audit Report details"
                  value={netAuditReport}
                  onChange={(e) => setNetAuditReport(e.target.value)}
                />
                {netFormErrors.netAuditReport && (
                  <span className="error-text">{netFormErrors.netAuditReport}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Attach File / Report
                </label>
                <div className="file-upload-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center', height: '42px' }}>
                  <input
                    type="file"
                    id="netFileAttachment"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNetAttachment(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="all-ok-button"
                    style={{
                      margin: 0,
                      padding: "10px 16px",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "500",
                      transition: "all 0.2s"
                    }}
                    onClick={() => document.getElementById("netFileAttachment")?.click()}
                  >
                    Choose File
                  </button>
                  <span style={{ fontSize: "13px", color: netAttachment ? "#1e293b" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                    {netAttachment ? netAttachment.name : "No file attached"}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netDnSpeed" className="form-label">Download Link Speed (Mbps)</label>
                <input
                  type="text"
                  id="netDnSpeed"
                  className={`form-input ${netFormErrors.netDnSpeed ? "field-error-border" : ""}`}
                  placeholder="Enter Download Link Speed"
                  value={netDnSpeed}
                  onChange={(e) => setNetDnSpeed(e.target.value)}
                />
                {netFormErrors.netDnSpeed && (
                  <span className="error-text">{netFormErrors.netDnSpeed}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="netUpSpeed" className="form-label">Upload Link Speed (Mbps)</label>
                <input
                  type="text"
                  id="netUpSpeed"
                  className={`form-input ${netFormErrors.netUpSpeed ? "field-error-border" : ""}`}
                  placeholder="Enter Upload Link Speed"
                  value={netUpSpeed}
                  onChange={(e) => setNetUpSpeed(e.target.value)}
                />
                {netFormErrors.netUpSpeed && (
                  <span className="error-text">{netFormErrors.netUpSpeed}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netFailureTime" className="form-label">
                  Failure Date & Time <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="netFailureTime"
                  className={`form-input ${netFormErrors.netFailureTime ? "field-error-border" : ""}`}
                  value={netFailureTime}
                  onChange={(e) => setNetFailureTime(e.target.value)}
                />
                {netFormErrors.netFailureTime && (
                  <span className="error-text">{netFormErrors.netFailureTime}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="netRectificationTime" className="form-label">
                  Rectification Time (RT) <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="netRectificationTime"
                  className={`form-input ${netFormErrors.netRectificationTime ? "field-error-border" : ""}`}
                  value={netRectificationTime}
                  onChange={(e) => setNetRectificationTime(e.target.value)}
                />
                {netFormErrors.netRectificationTime && (
                  <span className="error-text">{netFormErrors.netRectificationTime}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netTotalDuration" className="form-label">Duration of Failure</label>
                <input
                  type="text"
                  id="netTotalDuration"
                  className="form-input"
                  value={netTotalDuration}
                  readOnly
                  placeholder="XX Hrs XX Min"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reason of Failure <span className="required">*</span>
                </label>
                <div className="multiselect-container" ref={netReasonsRef}>
                  <button
                    type="button"
                    className={`multiselect-trigger ${netReasonsDropdownOpen ? "open" : ""}`}
                    onClick={() => setNetReasonsDropdownOpen(!netReasonsDropdownOpen)}
                  >
                    <span>
                      {netSelectedReasons.length === 0
                        ? "Select Reason(s)..."
                        : netSelectedReasons.join(", ")}
                    </span>
                  </button>
                  {netReasonsDropdownOpen && (
                    <div className="multiselect-menu">
                      {[
                        "Cable Cut",
                        "Link Failure",
                        "Equipment Failure (STM)",
                        "Equipment Failure (Phone)",
                        "Router Failure",
                        "Switch Failure",
                        "OFC Fault",
                        "Power Failure",
                        "Configuration Issue",
                        "ISP Issue",
                        "Other"
                      ].map((option) => (
                        <label key={option} className="multiselect-item">
                          <input
                            type="checkbox"
                            checked={netSelectedReasons.includes(option)}
                            onChange={() => {
                              if (netSelectedReasons.includes(option)) {
                                setNetSelectedReasons(netSelectedReasons.filter((r) => r !== option));
                              } else {
                                setNetSelectedReasons([...netSelectedReasons, option]);
                              }
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {netFormErrors.reasons && (
                  <span className="error-text">{netFormErrors.reasons}</span>
                )}
              </div>
            </div>

            {netSelectedReasons.includes("Other") && (
              <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                <label htmlFor="netCustomReason" className="form-label">
                  Other Reason <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netCustomReason"
                  className={`form-input ${netFormErrors.netCustomReason ? "field-error-border" : ""}`}
                  placeholder="Enter custom failure reason"
                  value={netCustomReason}
                  onChange={(e) => setNetCustomReason(e.target.value)}
                />
                {netFormErrors.netCustomReason && (
                  <span className="error-text">{netFormErrors.netCustomReason}</span>
                )}
              </div>
            )}

            <div className="form-group full-width">
              <label htmlFor="netRemarks" className="form-label">Remarks</label>
              <textarea
                id="netRemarks"
                className="form-textarea"
                style={{ height: "65px" }}
                placeholder="Enter observations, troubleshooting details, action taken, or additional remarks"
                value={netRemarks}
                onChange={(e) => setNetRemarks(e.target.value)}
              />
            </div>
          </>
        ) : (
          /* HQ maintenance layout */
          <>
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netIcmsEntryNo" className="form-label">
                  ICMS Entry No./Docket No. <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netIcmsEntryNo"
                  className={`form-input ${netFormErrors.icmsEntryNo ? "field-error-border" : ""}`}
                  placeholder="Enter ICMS entry number/docket number"
                  value={icmsEntryNo}
                  onChange={(e) => setIcmsEntryNo(e.target.value)}
                />
                {netFormErrors.icmsEntryNo && (
                  <span className="error-text">{netFormErrors.icmsEntryNo}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="netBandwidth" className="form-label">
                  Bandwidth <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netBandwidth"
                  className={`form-input ${netFormErrors.netBandwidth ? "field-error-border" : ""}`}
                  placeholder="Example: 100 Mbps, 1 Gbps"
                  value={netBandwidth}
                  onChange={(e) => setNetBandwidth(e.target.value)}
                />
                {netFormErrors.netBandwidth && (
                  <span className="error-text">{netFormErrors.netBandwidth}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netTestingTime" className="form-label">
                  Last Testing Time <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="netTestingTime"
                  className={`form-input ${netFormErrors.netTestingTime ? "field-error-border" : ""}`}
                  value={netTestingTime}
                  onChange={(e) => setNetTestingTime(e.target.value)}
                />
                {netFormErrors.netTestingTime && (
                  <span className="error-text">{netFormErrors.netTestingTime}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="netFaultNature" className="form-label">
                  Nature of Fault <span className="required">*</span>
                </label>
                <select
                  id="netFaultNature"
                  className={`form-input ${netFormErrors.netFaultNature ? "field-error-border" : ""}`}
                  style={{ height: "42px", appearance: "auto" }}
                  value={netFaultNature}
                  onChange={(e) => {
                    setNetFaultNature(e.target.value);
                    if (e.target.value !== "Other") setNetCustomFaultNature("");
                  }}
                >
                  <option value="">Select Nature of Fault</option>
                  <option value="Slow Internet">Slow Internet</option>
                  <option value="No Connectivity">No Connectivity</option>
                  <option value="Packet Loss">Packet Loss</option>
                  <option value="High Latency">High Latency</option>
                  <option value="Link Down">Link Down</option>
                  <option value="Frequent Disconnection">Frequent Disconnection</option>
                  <option value="Bandwidth Degradation">Bandwidth Degradation</option>
                  <option value="Equipment Failure">Equipment Failure</option>
                  <option value="Other">Other</option>
                </select>
                {netFormErrors.netFaultNature && (
                  <span className="error-text">{netFormErrors.netFaultNature}</span>
                )}
              </div>
            </div>

            {netFaultNature === "Other" && (
              <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                <label htmlFor="netCustomFaultNature" className="form-label">
                  Other Nature of Fault <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netCustomFaultNature"
                  className={`form-input ${netFormErrors.netCustomFaultNature ? "field-error-border" : ""}`}
                  placeholder="Enter fault details"
                  value={netCustomFaultNature}
                  onChange={(e) => setNetCustomFaultNature(e.target.value)}
                />
                {netFormErrors.netCustomFaultNature && (
                  <span className="error-text">{netFormErrors.netCustomFaultNature}</span>
                )}
              </div>
            )}

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netAuditReport" className="form-label">
                  Audit Report <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netAuditReport"
                  className={`form-input ${netFormErrors.netAuditReport ? "field-error-border" : ""}`}
                  placeholder="Enter Audit Report details"
                  value={netAuditReport}
                  onChange={(e) => setNetAuditReport(e.target.value)}
                />
                {netFormErrors.netAuditReport && (
                  <span className="error-text">{netFormErrors.netAuditReport}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Attach File / Report
                </label>
                <div className="file-upload-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center', height: '42px' }}>
                  <input
                    type="file"
                    id="netFileAttachment"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNetAttachment(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="all-ok-button"
                    style={{
                      margin: 0,
                      padding: "10px 16px",
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: "500",
                      transition: "all 0.2s"
                    }}
                    onClick={() => document.getElementById("netFileAttachment")?.click()}
                  >
                    Choose File
                  </button>
                  <span style={{ fontSize: "13px", color: netAttachment ? "#1e293b" : "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                    {netAttachment ? netAttachment.name : "No file attached"}
                  </span>
                </div>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netDnSpeed" className="form-label">Download Link Speed (Mbps)</label>
                <input
                  type="text"
                  id="netDnSpeed"
                  className={`form-input ${netFormErrors.netDnSpeed ? "field-error-border" : ""}`}
                  placeholder="Enter Download Link Speed"
                  value={netDnSpeed}
                  onChange={(e) => setNetDnSpeed(e.target.value)}
                />
                {netFormErrors.netDnSpeed && (
                  <span className="error-text">{netFormErrors.netDnSpeed}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="netUpSpeed" className="form-label">Upload Link Speed (Mbps)</label>
                <input
                  type="text"
                  id="netUpSpeed"
                  className={`form-input ${netFormErrors.netUpSpeed ? "field-error-border" : ""}`}
                  placeholder="Enter Upload Link Speed"
                  value={netUpSpeed}
                  onChange={(e) => setNetUpSpeed(e.target.value)}
                />
                {netFormErrors.netUpSpeed && (
                  <span className="error-text">{netFormErrors.netUpSpeed}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netFailureTime" className="form-label">
                  Failure Date & Time <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="netFailureTime"
                  className={`form-input ${netFormErrors.netFailureTime ? "field-error-border" : ""}`}
                  value={netFailureTime}
                  onChange={(e) => setNetFailureTime(e.target.value)}
                />
                {netFormErrors.netFailureTime && (
                  <span className="error-text">{netFormErrors.netFailureTime}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="netRectificationTime" className="form-label">
                  Rectification Time (RT) <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="netRectificationTime"
                  className={`form-input ${netFormErrors.netRectificationTime ? "field-error-border" : ""}`}
                  value={netRectificationTime}
                  onChange={(e) => setNetRectificationTime(e.target.value)}
                />
                {netFormErrors.netRectificationTime && (
                  <span className="error-text">{netFormErrors.netRectificationTime}</span>
                )}
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="netTotalDuration" className="form-label">Duration of Failure</label>
                <input
                  type="text"
                  id="netTotalDuration"
                  className="form-input"
                  value={netTotalDuration}
                  readOnly
                  placeholder="XX Hrs XX Min"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reason of Failure <span className="required">*</span>
                </label>
                <div className="multiselect-container" ref={netReasonsRef}>
                  <button
                    type="button"
                    className={`multiselect-trigger ${netReasonsDropdownOpen ? "open" : ""}`}
                    onClick={() => setNetReasonsDropdownOpen(!netReasonsDropdownOpen)}
                  >
                    <span>
                      {netSelectedReasons.length === 0
                        ? "Select Reason(s)..."
                        : netSelectedReasons.join(", ")}
                    </span>
                  </button>
                  {netReasonsDropdownOpen && (
                    <div className="multiselect-menu">
                      {[
                        "Cable Cut",
                        "Link Failure",
                        "Equipment Failure (STM)",
                        "Equipment Failure (Phone)",
                        "Router Failure",
                        "Switch Failure",
                        "OFC Fault",
                        "Power Failure",
                        "Configuration Issue",
                        "ISP Issue",
                        "Other"
                      ].map((option) => (
                        <label key={option} className="multiselect-item">
                          <input
                            type="checkbox"
                            checked={netSelectedReasons.includes(option)}
                            onChange={() => {
                              if (netSelectedReasons.includes(option)) {
                                setNetSelectedReasons(netSelectedReasons.filter((r) => r !== option));
                              } else {
                                setNetSelectedReasons([...netSelectedReasons, option]);
                              }
                            }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {netFormErrors.reasons && (
                  <span className="error-text">{netFormErrors.reasons}</span>
                )}
              </div>
            </div>

            {netSelectedReasons.includes("Other") && (
              <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                <label htmlFor="netCustomReason" className="form-label">
                  Other Reason <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="netCustomReason"
                  className={`form-input ${netFormErrors.netCustomReason ? "field-error-border" : ""}`}
                  placeholder="Enter custom failure reason"
                  value={netCustomReason}
                  onChange={(e) => setNetCustomReason(e.target.value)}
                />
                {netFormErrors.netCustomReason && (
                  <span className="error-text">{netFormErrors.netCustomReason}</span>
                )}
              </div>
            )}

            <div className="form-group full-width">
              <label htmlFor="netRemarks" className="form-label">Remarks</label>
              <textarea
                id="netRemarks"
                className="form-textarea"
                style={{ height: "65px" }}
                placeholder="Enter observations, troubleshooting details, action taken, or additional remarks"
                value={netRemarks}
                onChange={(e) => setNetRemarks(e.target.value)}
              />
            </div>
          </>
        )}

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
            className={`save-button ${netSaving ? "save-button-loading" : ""}`}
            disabled={netSaving}
          >
            {netSaving ? (
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
