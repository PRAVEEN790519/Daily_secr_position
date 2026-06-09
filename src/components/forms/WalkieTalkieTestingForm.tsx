import { useState, useMemo } from "react";
import { Circuit } from "../../types";
import { formatDate } from "../../utils/dateTime";

interface WalkieTalkieTestingFormProps {
  selectedCircuit: Circuit;
  selectedDivision: string;
  onSave: (record: any) => void;
  moveToNextCircuit: () => void;
}

export default function WalkieTalkieTestingForm({
  selectedCircuit,
  selectedDivision,
  onSave,
  moveToNextCircuit,
}: WalkieTalkieTestingFormProps) {
  const [wtStationLobby, setWtStationLobby] = useState("");
  const [wtTotalToBeTested, setWtTotalToBeTested] = useState("");
  const [wtMakeModel, setWtMakeModel] = useState("");
  const [wtCustomMakeModel, setWtCustomMakeModel] = useState("");
  const [wtTestingDate, setWtTestingDate] = useState("");
  const [wtTotalTested, setWtTotalTested] = useState("");
  const [wtRemarks, setWtRemarks] = useState("");
  const [wtFormErrors, setWtFormErrors] = useState<Record<string, string>>({});
  const [wtFormSuccess, setWtFormSuccess] = useState(false);
  const [wtSaving, setWtSaving] = useState(false);

  const [wtSerialNo, setWtSerialNo] = useState("");
  const [wtFrequency, setWtFrequency] = useState("");
  const [wtOutputPower, setWtOutputPower] = useState("");
  const [wtBatteryVoltage, setWtBatteryVoltage] = useState("");
  const [wtBatteryCurrent, setWtBatteryCurrent] = useState("");
  const [wtAntenna, setWtAntenna] = useState("");

  const wtBalanceToTest = useMemo(() => {
    if (!wtTotalToBeTested || !wtTotalTested) return "";
    const toTest = parseInt(wtTotalToBeTested, 10);
    const tested = parseInt(wtTotalTested, 10);
    if (isNaN(toTest) || isNaN(tested)) return "";
    return Math.max(0, toTest - tested).toString();
  }, [wtTotalToBeTested, wtTotalTested]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!wtStationLobby.trim()) errors.wtStationLobby = "Station / Lobby is required";
    
    if (!wtTotalToBeTested.trim()) {
      errors.wtTotalToBeTested = "Total walkie-talkies to be tested is required";
    } else {
      const val = parseInt(wtTotalToBeTested, 10);
      if (isNaN(val) || val < 0) {
        errors.wtTotalToBeTested = "Must be a valid positive number";
      }
    }

    if (!wtTestingDate) {
      errors.wtTestingDate = "Date of testing is required";
    }

    if (!wtTotalTested.trim()) {
      errors.wtTotalTested = "Total walkie-talkies tested is required";
    } else {
      const val = parseInt(wtTotalTested, 10);
      if (isNaN(val) || val < 0) {
        errors.wtTotalTested = "Must be a valid positive number";
      } else {
        const toTestVal = parseInt(wtTotalToBeTested, 10);
        if (!isNaN(toTestVal) && val > toTestVal) {
          errors.wtTotalTested = "Total tested cannot exceed total to be tested";
        }
      }
    }

    if (!wtSerialNo.trim()) errors.wtSerialNo = "Walkie Talkie Serial No. is required";
    if (!wtFrequency.trim()) errors.wtFrequency = "Frequency Configuration is required";
    if (!wtOutputPower.trim()) errors.wtOutputPower = "Output TX Power is required";
    if (!wtBatteryVoltage.trim()) errors.wtBatteryVoltage = "Battery Voltage is required";
    if (!wtBatteryCurrent.trim()) errors.wtBatteryCurrent = "Battery Current is required";
    if (!wtAntenna) errors.wtAntenna = "Antenna status is required";

    if (!wtMakeModel) {
      errors.wtMakeModel = "Make / Model is required";
    } else if (wtMakeModel === "Other" && !wtCustomMakeModel.trim()) {
      errors.wtCustomMakeModel = "Custom Make / Model description is required";
    }

    if (Object.keys(errors).length > 0) {
      setWtFormErrors(errors);
      return;
    }

    setWtFormErrors({});
    setWtSaving(true);

    setTimeout(() => {
      const formatDateWt = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };

      const newWtRecord = {
        id: Date.now(),
        division: selectedDivision,
        stationLobby: wtStationLobby.trim(),
        totalToBeTested: wtTotalToBeTested.trim(),
        testingDate: formatDateWt(wtTestingDate),
        totalTested: wtTotalTested.trim(),
        balanceToTest: wtBalanceToTest,
        remarks: wtRemarks.trim(),
        serialNo: wtSerialNo.trim(),
        frequency: wtFrequency.trim(),
        outputPower: wtOutputPower.trim(),
        batteryVoltage: wtBatteryVoltage.trim(),
        batteryCurrent: wtBatteryCurrent.trim(),
        antenna: wtAntenna,
        makeModel: wtMakeModel === "Other" ? `Other: ${wtCustomMakeModel.trim()}` : wtMakeModel
      };

      onSave(newWtRecord);
      setWtSaving(false);

      setWtStationLobby("");
      setWtTotalToBeTested("");
      setWtTestingDate("");
      setWtTotalTested("");
      setWtRemarks("");
      setWtSerialNo("");
      setWtFrequency("");
      setWtOutputPower("");
      setWtBatteryVoltage("");
      setWtBatteryCurrent("");
      setWtAntenna("");
      setWtMakeModel("");
      setWtCustomMakeModel("");
      setWtFormSuccess(true);
      setTimeout(() => setWtFormSuccess(false), 5000);
    }, 1200);
  };

  const handleAllOk = () => {
    const nowStr = new Date().toISOString().slice(0, 10);
    const newWtRecord = {
      id: Date.now(),
      division: selectedDivision,
      stationLobby: "BSP Lobby",
      totalToBeTested: "10",
      totalTested: "10",
      balanceToTest: "0",
      testingDate: nowStr,
      makeModel: "Motorola GP338",
      serialNo: "ALL-OK-WT",
      frequency: "160.050 MHz",
      outputPower: "5.0 W",
      batteryVoltage: "7.4 V",
      batteryCurrent: "1.2 A",
      antenna: "Good",
      remarks: "All lobby walkie-talkie sets tested. Power, frequency, and battery specifications healthy."
    };
    onSave(newWtRecord);
    setWtStationLobby("");
    setWtTotalToBeTested("");
    setWtTestingDate("");
    setWtTotalTested("");
    setWtRemarks("");
    setWtSerialNo("");
    setWtFrequency("");
    setWtOutputPower("");
    setWtBatteryVoltage("");
    setWtBatteryCurrent("");
    setWtAntenna("");
    setWtMakeModel("");
    setWtCustomMakeModel("");
    moveToNextCircuit();
  };

  return (
    <div className="workspace-content">
      <div className="workspace-title-section">
        <div className="workspace-title-left">
          <h2>Walkie-Talkie Testing</h2>
        </div>
      </div>

      {wtFormSuccess && (
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
          <span>✅ Walkie-Talkie Testing Saved Successfully</span>
        </div>
      )}

      <form className="fault-form" onSubmit={handleSave}>
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtStationLobby" className="form-label">
              Station / Lobby <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtStationLobby"
              className={`form-input ${wtFormErrors.wtStationLobby ? "field-error-border" : ""}`}
              placeholder="Enter station or lobby name"
              value={wtStationLobby}
              onChange={(e) => setWtStationLobby(e.target.value)}
            />
            {wtFormErrors.wtStationLobby && (
              <span className="error-text">{wtFormErrors.wtStationLobby}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtMakeModel" className="form-label">
              Make / Model <span className="required">*</span>
            </label>
            <select
              id="wtMakeModel"
              className={`form-input ${wtFormErrors.wtMakeModel ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={wtMakeModel}
              onChange={(e) => {
                setWtMakeModel(e.target.value);
                if (e.target.value !== "Other") setWtCustomMakeModel("");
              }}
            >
              <option value="">Select Make/Model</option>
              <option value="Motorola GP338">Motorola GP338</option>
              <option value="Motorola XiR P3688">Motorola XiR P3688</option>
              <option value="Kenwood TK-2000">Kenwood TK-2000</option>
              <option value="Vertex VX-261">Vertex VX-261</option>
              <option value="Other">Other</option>
            </select>
            {wtFormErrors.wtMakeModel && (
              <span className="error-text">{wtFormErrors.wtMakeModel}</span>
            )}
          </div>
        </div>

        {wtMakeModel === "Other" && (
          <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
            <label htmlFor="wtCustomMakeModel" className="form-label">
              Custom Make / Model <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtCustomMakeModel"
              className={`form-input ${wtFormErrors.wtCustomMakeModel ? "field-error-border" : ""}`}
              placeholder="Specify walkie-talkie brand or model"
              value={wtCustomMakeModel}
              onChange={(e) => setWtCustomMakeModel(e.target.value)}
            />
            {wtFormErrors.wtCustomMakeModel && (
              <span className="error-text">{wtFormErrors.wtCustomMakeModel}</span>
            )}
          </div>
        )}

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtTotalToBeTested" className="form-label">
              Total Walkie-Talkies to be Tested <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtTotalToBeTested"
              className={`form-input ${wtFormErrors.wtTotalToBeTested ? "field-error-border" : ""}`}
              placeholder="Enter sets requiring test"
              value={wtTotalToBeTested}
              onChange={(e) => setWtTotalToBeTested(e.target.value)}
            />
            {wtFormErrors.wtTotalToBeTested && (
              <span className="error-text">{wtFormErrors.wtTotalToBeTested}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtTotalTested" className="form-label">
              Total Walkie-Talkies Tested <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtTotalTested"
              className={`form-input ${wtFormErrors.wtTotalTested ? "field-error-border" : ""}`}
              placeholder="Enter sets successfully tested"
              value={wtTotalTested}
              onChange={(e) => setWtTotalTested(e.target.value)}
            />
            {wtFormErrors.wtTotalTested && (
              <span className="error-text">{wtFormErrors.wtTotalTested}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtBalanceToTest" className="form-label">
              Balance Walkie-Talkies to be Tested
            </label>
            <input
              type="text"
              id="wtBalanceToTest"
              className="form-input"
              value={wtBalanceToTest}
              readOnly
              placeholder="Pending sets"
            />
          </div>

          <div className="form-group">
            <label htmlFor="wtTestingDate" className="form-label">
              Date of Testing <span className="required">*</span>
            </label>
            <input
              type="date"
              id="wtTestingDate"
              className={`form-input ${wtFormErrors.wtTestingDate ? "field-error-border" : ""}`}
              value={wtTestingDate}
              onChange={(e) => setWtTestingDate(e.target.value)}
            />
            {wtFormErrors.wtTestingDate && (
              <span className="error-text">{wtFormErrors.wtTestingDate}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtSerialNo" className="form-label">
              Walkie Talkie Serial No. <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtSerialNo"
              className={`form-input ${wtFormErrors.wtSerialNo ? "field-error-border" : ""}`}
              placeholder="Enter set serial number"
              value={wtSerialNo}
              onChange={(e) => setWtSerialNo(e.target.value)}
            />
            {wtFormErrors.wtSerialNo && (
              <span className="error-text">{wtFormErrors.wtSerialNo}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtFrequency" className="form-label">
              Frequency Configuration <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtFrequency"
              className={`form-input ${wtFormErrors.wtFrequency ? "field-error-border" : ""}`}
              placeholder="Example: 160.050 MHz"
              value={wtFrequency}
              onChange={(e) => setWtFrequency(e.target.value)}
            />
            {wtFormErrors.wtFrequency && (
              <span className="error-text">{wtFormErrors.wtFrequency}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtOutputPower" className="form-label">
              Output TX Power <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtOutputPower"
              className={`form-input ${wtFormErrors.wtOutputPower ? "field-error-border" : ""}`}
              placeholder="Example: 5.0 W"
              value={wtOutputPower}
              onChange={(e) => setWtOutputPower(e.target.value)}
            />
            {wtFormErrors.wtOutputPower && (
              <span className="error-text">{wtFormErrors.wtOutputPower}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtBatteryVoltage" className="form-label">
              Battery Voltage <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtBatteryVoltage"
              className={`form-input ${wtFormErrors.wtBatteryVoltage ? "field-error-border" : ""}`}
              placeholder="Example: 7.4 V"
              value={wtBatteryVoltage}
              onChange={(e) => setWtBatteryVoltage(e.target.value)}
            />
            {wtFormErrors.wtBatteryVoltage && (
              <span className="error-text">{wtFormErrors.wtBatteryVoltage}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="wtBatteryCurrent" className="form-label">
              Battery Current <span className="required">*</span>
            </label>
            <input
              type="text"
              id="wtBatteryCurrent"
              className={`form-input ${wtFormErrors.wtBatteryCurrent ? "field-error-border" : ""}`}
              placeholder="Example: 1.2 A"
              value={wtBatteryCurrent}
              onChange={(e) => setWtBatteryCurrent(e.target.value)}
            />
            {wtFormErrors.wtBatteryCurrent && (
              <span className="error-text">{wtFormErrors.wtBatteryCurrent}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="wtAntenna" className="form-label">
              Antenna Status <span className="required">*</span>
            </label>
            <select
              id="wtAntenna"
              className={`form-input ${wtFormErrors.wtAntenna ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={wtAntenna}
              onChange={(e) => setWtAntenna(e.target.value)}
            >
              <option value="">Select Antenna Status</option>
              <option value="Good">Good</option>
              <option value="Defective">Defective</option>
            </select>
            {wtFormErrors.wtAntenna && (
              <span className="error-text">{wtFormErrors.wtAntenna}</span>
            )}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="wtRemarks" className="form-label">Remarks</label>
          <textarea
            id="wtRemarks"
            className="form-textarea"
            style={{ height: "65px" }}
            placeholder="Enter additional remarks or observations"
            value={wtRemarks}
            onChange={(e) => setWtRemarks(e.target.value)}
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
            className={`save-button ${wtSaving ? "save-button-loading" : ""}`}
            disabled={wtSaving}
          >
            {wtSaving ? (
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
