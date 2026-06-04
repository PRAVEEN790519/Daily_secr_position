"use client";

import { useState, useEffect, useMemo, useRef } from "react";

// Types
interface DetailRow {
  label: string;
  value: string;
}

interface DivisionStatus {
  status: "normal" | "degraded" | "critical";
  lastUpdated: string;
  details: DetailRow[];
  recentLogs: string[];
}

interface Circuit {
  id: number;
  name: string;
  badge: string;
  systemCode: string;
  description: string;
  divisionData: Record<string, DivisionStatus>;
  category: string;
}

// 7 categories with 35+ circuits populated programmatically with realistic data
const generateCircuitDatabase = (): Circuit[] => {
  const categories = [
    {
      category: "Communication & Voice Circuits",
      items: [
        { name: "Control & ICMS Position", badge: "CFTF", code: "ICMS-01", desc: "Integrated Coaching Management System & Control Office Application status tracking." },
        { name: "FOIS (VSAT)", badge: "FOIS", code: "FOIS-02", desc: "Freight Operations Information System terminal connectivity and central host communications." },
        { name: "Hotline", badge: "HOTLINE", code: "HOT-03", desc: "Direct voice hotline linking General Manager to CRB." },
        { name: "Video Conferencing with Divisions", badge: "VC-D", code: "VC-04", desc: "Daily video conference link connecting HQ to divisional heads." },
        { name: "Railway Board Video Phones", badge: "VP-RB", code: "VPHONE-05", desc: "SIP-based video telephone terminals for Board communications." },
        { name: "CFTM Conference", badge: "CONF", code: "CONF-06", desc: "Conference circuit for Chief Freight Transportation Manager operations." }
      ]
    },
    {
      category: "Network & Internet",
      items: [
        { name: "Railnet / Internet", badge: "NET", code: "NET-08", desc: "SECR Railway Intranet and official broadband gateways." },
        { name: "Wi-Fi", badge: "WIFI", code: "WIFI-09", desc: "Public Wi-Fi access points at stations (RailWire)." },
        { name: "UTS", badge: "UTS", code: "UTS-11", desc: "Unreserved Ticketing System network terminals." },
        { name: "PRS", badge: "PRS", code: "PRS-12", desc: "Passenger Reservation System ticketing gateways." }
      ]
    },
    {
      category: "Cable Infrastructure",
      items: [
        { name: "Cable Cut (OFC & Quad)", badge: "CUT", code: "CUT-13", desc: "Real-time track monitoring of optical fiber and copper quad media cuts." },
        { name: "Temporary Joints", badge: "JOINT", code: "JNT-14", desc: "Temporary splice closures awaiting permanent block jointing." },
        { name: "Low Insulation", badge: "INS", code: "INS-15", desc: "Insulation resistance values monitoring for signaling/block quad pairs." }
      ]
    },
    {
      category: "Display System",
      items: [
        { name: "CGDM", badge: "CGDM", code: "CGDM-16", desc: "Coach Guidance Display System showing coach layouts on platforms." },
        { name: "TIB", badge: "TIB", code: "TIB-17", desc: "Train Indication Boards displaying arrival and departure timings." }
      ]
    },
    {
      category: "Testing & Maintenance",
      items: [
        { name: "Walkie-Talkie Testing", badge: "VHF-T", code: "VHFT-18", desc: "VHF hand-held transceiver frequency and power test logs." },
        { name: "Walkie-Talkie Repairing", badge: "VHF-R", code: "VHFR-19", desc: "Workshop maintenance records and battery cell replacements." }
      ]
    },
    {
      category: "CCTV",
      items: [
        { name: "CCTV Monitoring", badge: "CCTV-M", code: "CCTVM-20", desc: "Video surveillance cameras live status feeds at platforms." },
        { name: "CCTV Maintenance", badge: "CCTV-S", code: "CCTVS-21", desc: "NVR storage check, camera cleaning, and PoE switch repairs." }
      ]
    },
    {
      category: "Exchange",
      items: [
        { name: "BSP", badge: "EX-BSP", code: "EX-01", desc: "Bilaspur main electronic telephone exchange switchboard." },
        { name: "Div HQ", badge: "EX-HQ", code: "EX-02", desc: "Divisional Headquarters telecom exchange system." },
        { name: "Div (for Zone)", badge: "EX-DIV", code: "EX-03", desc: "Divisional trunk lines connecting to zonal network." },
        { name: "Loco Shed (BSP)", badge: "EX-LOC", code: "EX-04", desc: "Loco shed dedicated internal exchange lines." },
        { name: "RIG", badge: "EX-RIG", code: "EX-05", desc: "Raigarh station local railway exchange." },
        { name: "APG", badge: "EX-APG", code: "EX-06", desc: "Anuppur local railway exchange." },
        { name: "SDL", badge: "EX-SDL", code: "EX-07", desc: "Shahdol railway telephone exchange." },
        { name: "MDGR", badge: "EX-MDGR", code: "EX-08", desc: "Manendragarh exchange terminal." },
        { name: "BSRI", badge: "EX-BSRI", code: "EX-09", desc: "Bishrampur exchange unit." },
        { name: "CPH", badge: "EX-CPH", code: "EX-10", desc: "Champa junction local exchange." },
        { name: "KRBA", badge: "EX-KRBA", code: "EX-11", desc: "Korba industrial branch exchange." },
        { name: "BRJN", badge: "EX-BRJN", code: "EX-12", desc: "Brajrajnagar station exchange." },
        { name: "PND", badge: "EX-PND", code: "EX-13", desc: "Pendra Road local railway exchange." },
        { name: "UMR", badge: "EX-UMR", code: "EX-14", desc: "Umaria railway telephone exchange." },
        { name: "BRS", badge: "EX-BRS", code: "EX-15", desc: "Birsinghpur exchange lines." }
      ]
    },
    {
      category: "Rail Madad",
      items: [
        { name: "Rail Madad", badge: "MADAD", code: "MAD-07", desc: "Passenger grievance portal integration and telecom complaints hotline." }
      ]
    }
  ];

  let currentId = 1;
  const db: Circuit[] = [];

  for (const cat of categories) {
    for (const item of cat.items) {
      const divisionData: Record<string, DivisionStatus> = {};
      
      for (const division of ["Bilaspur", "Raipur", "Nagpur"]) {
        let status: "normal" | "degraded" | "critical" = "normal";
        
        // Inject mock states
        if (division === "Nagpur" && (item.name === "Low Insulation" || item.name === "Railnet / Internet")) {
          status = "degraded";
        } else if (division === "Raipur" && item.name === "Cable Cut (OFC & Quad)") {
          status = "critical";
        } else if (division === "Bilaspur" && item.name === "Temporary Joints") {
          status = "degraded";
        } else if (division === "Raipur" && item.name === "CCTV Monitoring") {
          status = "degraded";
        }

        let details: DetailRow[] = [];
        let recentLogs: string[] = [];

        // Category-specific details
        if (cat.category === "Exchange") {
          details = [
            { label: "SIP Registration", value: status === "critical" ? "OFFLINE" : "REGISTERED" },
            { label: "Active Analog Lines", value: status === "normal" ? "94 / 96 Lines" : "82 / 96 Lines" },
            { label: "VoIP Trunk Status", value: status === "critical" ? "FAILED" : "HEALTHY" },
            { label: "MDF Card Uptime", value: "18 Days" }
          ];
          recentLogs = [
            `Today, 09:15 AM - Routine MDF cleaning completed at ${item.name} exchange.`,
            `Yesterday - Uptime and channel sync check verified by Section Engineer.`
          ];
        } else if (cat.category === "Network & Internet") {
          details = [
            { label: "Link Speed (Dn/Up)", value: "500 / 500 Mbps" },
            { label: "Gateway Status", value: status === "normal" ? "ONLINE" : "DEGRADED" },
            { label: "IP Pool Usage", value: "68% Utilized" },
            { label: "Latency to HQ", value: "14 ms" }
          ];
          recentLogs = [
            `Today, 10:00 AM - Router memory usage cleared. Network throughput normal.`,
            `Yesterday - Checked load-balancer policies. Redundant link is standby.`
          ];
        } else if (cat.category === "Cable Infrastructure") {
          details = [
            { label: "Active Fault Alerts", value: status === "normal" ? "0 Alerts" : "1 Alert Active" },
            { label: "OTDR Status", value: status === "normal" ? "Clear" : "Fault Localized" },
            { label: "Line Impedance", value: status === "normal" ? "5.4 Mega-Ohms" : "0.3 Mega-Ohms" },
            { label: "Section Patrolled", value: "Checked Today" }
          ];
          recentLogs = [
            `Today, 11:00 AM - Patrolling supervisor submitted clearance logs.`,
            `Yesterday - Attenuation testing logged: average loss 0.18 dB/km.`
          ];
        } else {
          details = [
            { label: "System Status", value: status === "normal" ? "ONLINE" : status === "degraded" ? "DEGRADED" : "OUTAGE" },
            { label: "Primary Uplink", value: "OFC Core 4" },
            { label: "Active Node Count", value: "12 Terminals" },
            { label: "Packet Loss Rate", value: "0.0%" }
          ];
          recentLogs = [
            `Today, 08:30 AM - Shift switchover checks passed successfully.`,
            `Yesterday - System ping status logged: 100% packets returned.`
          ];
        }

        divisionData[division] = {
          status,
          lastUpdated: "Today, 11:30 AM",
          details,
          recentLogs
        };
      }

      db.push({
        id: currentId++,
        name: item.name,
        badge: item.badge,
        systemCode: `SECR/TEL/${item.code}`,
        description: item.desc,
        divisionData,
        category: cat.category
      });
    }
  }

  return db;
};

const CIRCUITS_DATABASE = generateCircuitDatabase();

const isStandardFaultCircuit = (circuit: Circuit) => {
  return (
    circuit.category === "Communication & Voice Circuits" &&
    circuit.name !== "Rail Madad" &&
    circuit.name !== "Railway Board Video Phones"
  );
};

const HIERARCHICAL_DATA: Record<string, {
  majorSections: Record<string, {
    sections: Record<string, string[]>
  }>
}> = {
  "Bilaspur": {
    majorSections: {
      "Bilaspur - Raigarh (BSP-RIG)": {
        sections: {
          "Bilaspur - Champa (BSP-CPH)": ["Bilaspur (BSP)", "Gadhwa Road (GTW)", "Akaltara (AKT)", "Naila (NIA)", "Champa Junction (CPH)"],
          "Champa - Raigarh (CPH-RIG)": ["Baradwar (BUA)", "Sakti (SKT)", "Kharsia (KHS)", "Raigarh (RIG)"]
        }
      },
      "Bilaspur - Katni (BSP-KTE)": {
        sections: {
          "Bilaspur - Anuppur (BSP-APR)": ["Pendra Road (PND)", "Jaithari (JTI)", "Anuppur Junction (APR)"],
          "Anuppur - Shahdol (APR-SDL)": ["Amlai (AAL)", "Burhar (BUH)", "Shahdol (SDL)"]
        }
      },
      "Champa - Korba (CPH-KRBA)": {
        sections: {
          "Champa - Korba (CPH-KRBA)": ["Korba (KRBA)", "Gevra Road (GAD)"]
        }
      }
    }
  },
  "Raipur": {
    majorSections: {
      "Raipur - Dongargarh (R-DGG)": {
        sections: {
          "Raipur - Durg": ["Raipur (R)", "Bhilai (BPHB)", "Durg (DURG)"],
          "Durg - Dongargarh": ["Dongargarh (DGG)"]
        }
      },
      "Raipur - Bhatapara (R-BYT)": {
        sections: {
          "Raipur - Bhatapara": ["Tilda (TLD)", "Bhatapara (BYT)"]
        }
      }
    }
  },
  "Nagpur": {
    majorSections: {
      "Gondia - Nagpur (G-NGP)": {
        sections: {
          "Gondia - Bhandara Road": ["Gondia (G)", "Bhandara Road (BRD)"],
          "Bhandara Road - Nagpur": ["Nagpur (NGP)"]
        }
      },
      "Gondia - Balaghat (G-BTC)": {
        sections: {
          "Gondia - Balaghat": ["Balaghat (BTC)"]
        }
      }
    }
  }
};

export default function Home() {
  const [selectedDivision, setSelectedDivision] = useState<string>("Bilaspur");
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState<boolean>(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState<boolean>(true);
  const [openDropdownCategory, setOpenDropdownCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [liveTime, setLiveTime] = useState<string>("");

  // States for hierarchical Major Section, Section, Station/Location
  const [formMajorSection, setFormMajorSection] = useState<string>("");
  const [formSection, setFormSection] = useState<string>("");
  const [formStationLocation, setFormStationLocation] = useState<string>("");

  const handleMajorSectionChange = (val: string) => {
    setFormMajorSection(val);
    setFormSection("");
    setFormStationLocation("");
  };

  const handleSectionChange = (val: string) => {
    setFormSection(val);
    setFormStationLocation("");
  };

  const handleStationLocationChange = (val: string) => {
    setFormStationLocation(val);
    if (val && formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection]) {
      const sectionsObj = HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections;
      for (const [secName, stations] of Object.entries(sectionsObj)) {
        if (stations.includes(val)) {
          setFormSection(secName);
          break;
        }
      }
    }
  };

  // Helper to render hierarchical fields in forms
  const renderHierarchicalFields = (errors: Record<string, string>) => {
    return (
      <>
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="formMajorSection" className="form-label">
              Major Section <span className="required">*</span>
            </label>
            <select
              id="formMajorSection"
              className={`form-input ${errors.formMajorSection ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={formMajorSection}
              onChange={(e) => handleMajorSectionChange(e.target.value)}
            >
              <option value="">Select Major Section</option>
              {selectedDivision && HIERARCHICAL_DATA[selectedDivision] && Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections).map((mSec) => (
                <option key={mSec} value={mSec}>{mSec}</option>
              ))}
            </select>
            {errors.formMajorSection && (
              <span className="error-text">{errors.formMajorSection}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="formSection" className="form-label">
              Section <span className="required">*</span>
            </label>
            <select
              id="formSection"
              className={`form-input ${errors.formSection ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={formSection}
              onChange={(e) => handleSectionChange(e.target.value)}
              disabled={!formMajorSection}
            >
              <option value="">Select Section</option>
              {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && 
                Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections).map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))
              }
            </select>
            {errors.formSection && (
              <span className="error-text">{errors.formSection}</span>
            )}
          </div>
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="formStationLocation" className="form-label">
              Station/Location <span className="required">*</span>
            </label>
            <select
              id="formStationLocation"
              className={`form-input ${errors.formStationLocation ? "field-error-border" : ""}`}
              style={{ height: "42px", appearance: "auto" }}
              value={formStationLocation}
              onChange={(e) => handleStationLocationChange(e.target.value)}
              disabled={!formMajorSection}
            >
              <option value="">Select Station/Location</option>
              {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && (() => {
                const sectionsObj = HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections;
                if (formSection) {
                  return sectionsObj[formSection]?.map((stn) => (
                    <option key={stn} value={stn}>{stn}</option>
                  ));
                } else {
                  return Object.values(sectionsObj).flat().map((stn) => (
                    <option key={stn} value={stn}>{stn}</option>
                  ));
                }
              })()}
            </select>
            {errors.formStationLocation && (
              <span className="error-text">{errors.formStationLocation}</span>
            )}
          </div>
          <div className="form-group"></div>
        </div>
      </>
    );
  };



  // Track operational logs updated by the user dynamically in state
  const [userLogs, setUserLogs] = useState<Record<string, string[]>>({});
  const [logInput, setLogInput] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fault Entry Form states (Control & ICMS Position)
  const [icmsEntryNo, setIcmsEntryNo] = useState<string>("");
  const [faultySection, setFaultySection] = useState<string>("");
  const [circuitFailed, setCircuitFailed] = useState<string>("");
  const [failureTime, setFailureTime] = useState<string>("");
  const [rectificationTime, setRectificationTime] = useState<string>("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [reasonsDropdownOpen, setReasonsDropdownOpen] = useState<boolean>(false);
  const [customReason, setCustomReason] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [faultFormSuccess, setFaultFormSuccess] = useState<boolean>(false);

  // Exchange Fault Entry Form states
  const [exchangeName, setExchangeName] = useState<string>("");
  const [exchangeSearchQuery, setExchangeSearchQuery] = useState<string>("");
  const [exchangeDropdownOpen, setExchangeDropdownOpen] = useState<boolean>(false);
  const [faultName, setFaultName] = useState<string>("");
  const [customFaultName, setCustomFaultName] = useState<string>("");
  const [exchFailureTime, setExchFailureTime] = useState<string>("");
  const [exchRectificationTime, setExchRectificationTime] = useState<string>("");
  const [exchSelectedReasons, setExchSelectedReasons] = useState<string[]>([]);
  const [exchReasonsDropdownOpen, setExchReasonsDropdownOpen] = useState<boolean>(false);
  const [exchCustomReason, setExchCustomReason] = useState<string>("");
  const [exchRemarks, setExchRemarks] = useState<string>("");
  const [exchFormErrors, setExchFormErrors] = useState<Record<string, string>>({});
  const [exchFormSuccess, setExchFormSuccess] = useState<boolean>(false);
  const [exchSaving, setExchSaving] = useState<boolean>(false);

  // Railnet / Internet Monitoring Form states
  const [netLocation, setNetLocation] = useState<string>("");
  const [netLocSearchQuery, setNetLocSearchQuery] = useState<string>("");
  const [netLocDropdownOpen, setNetLocDropdownOpen] = useState<boolean>(false);
  const [netBandwidth, setNetBandwidth] = useState<string>("");
  const [netTestingTime, setNetTestingTime] = useState<string>("");
  const [netDnSpeed, setNetDnSpeed] = useState<string>("");
  const [netUpSpeed, setNetUpSpeed] = useState<string>("");
  const [netFaultNature, setNetFaultNature] = useState<string>("");
  const [netCustomFaultNature, setNetCustomFaultNature] = useState<string>("");
  const [netAuditReport, setNetAuditReport] = useState<string>("");
  const [netAttachment, setNetAttachment] = useState<File | null>(null);
  const [netActiveTab, setNetActiveTab] = useState<"divisional" | "hq">("divisional");
  const [netFailureTime, setNetFailureTime] = useState<string>("");
  const [netRectificationTime, setNetRectificationTime] = useState<string>("");
  const [netSelectedReasons, setNetSelectedReasons] = useState<string[]>([]);
  const [netReasonsDropdownOpen, setNetReasonsDropdownOpen] = useState<boolean>(false);
  const [netCustomReason, setNetCustomReason] = useState<string>("");
  const [netRemarks, setNetRemarks] = useState<string>("");
  const [netFormErrors, setNetFormErrors] = useState<Record<string, string>>({});
  const [netFormSuccess, setNetFormSuccess] = useState<boolean>(false);
  const [netSaving, setNetSaving] = useState<boolean>(false);
  
  // Rail Madad form states
  const [madadBalanceLast, setMadadBalanceLast] = useState<string>("");
  const [madadReceived, setMadadReceived] = useState<string>("");
  const [madadComplied, setMadadComplied] = useState<string>("");
  const [madadDescription, setMadadDescription] = useState<string>("");
  const [madadCaseTime, setMadadCaseTime] = useState<string>("");
  const [madadComplianceDetails, setMadadComplianceDetails] = useState<string>("");
  const [madadComplianceTime, setMadadComplianceTime] = useState<string>("");
  const [madadRemarks, setMadadRemarks] = useState<string>("");
  const [madadFormErrors, setMadadFormErrors] = useState<Record<string, string>>({});
  const [madadFormSuccess, setMadadFormSuccess] = useState<boolean>(false);
  const [madadSaving, setMadadSaving] = useState<boolean>(false);

  // Railway Board Video Phone form states
  const [vpPhodChamber, setVpPhodChamber] = useState<string>("");
  const [vpCustomPhod, setVpCustomPhod] = useState<string>("");
  const [vpTestingTime, setVpTestingTime] = useState<string>("");
  const [vpVideoClarity, setVpVideoClarity] = useState<string>("");
  const [vpAudioClarity, setVpAudioClarity] = useState<string>("");
  const [vpRemarks, setVpRemarks] = useState<string>("");
  const [vpFormErrors, setVpFormErrors] = useState<Record<string, string>>({});
  const [vpFormSuccess, setVpFormSuccess] = useState<boolean>(false);
  const [vpSaving, setVpSaving] = useState<boolean>(false);

  // Cable Cut form states
  const [ccSectionName, setCcSectionName] = useState<string>("");
  const [ccKmNo, setCcKmNo] = useState<string>("");
  const [ccCableTypes, setCcCableTypes] = useState<string[]>([]);
  const [ccCableTypesOpen, setCcCableTypesOpen] = useState<boolean>(false);
  const [ccCutByWhom, setCcCutByWhom] = useState<string[]>([]);
  const [ccCutByWhomOpen, setCcCutByWhomOpen] = useState<boolean>(false);
  const [ccFailureTime, setCcFailureTime] = useState<string>("");
  const [ccRectificationTime, setCcRectificationTime] = useState<string>("");
  const [ccCustomCableType, setCcCustomCableType] = useState<string>("");
  const [ccCustomCutBy, setCcCustomCutBy] = useState<string>("");
  const [ccReasonOfFailure, setCcReasonOfFailure] = useState<string>("");
  const [ccRemarks, setCcRemarks] = useState<string>("");
  const [ccFormErrors, setCcFormErrors] = useState<Record<string, string>>({});
  const [ccFormSuccess, setCcFormSuccess] = useState<boolean>(false);
  const [ccSaving, setCcSaving] = useState<boolean>(false);

  // Walkie-Talkie Testing form states
  const [wtStationLobby, setWtStationLobby] = useState<string>("");
  const [wtTotalToBeTested, setWtTotalToBeTested] = useState<string>("");
  const [wtMakeModel, setWtMakeModel] = useState<string>("");
  const [wtCustomMakeModel, setWtCustomMakeModel] = useState<string>("");
  const [wtTestingDate, setWtTestingDate] = useState<string>("");
  const [wtTotalTested, setWtTotalTested] = useState<string>("");
  const [wtRemarks, setWtRemarks] = useState<string>("");
  const [wtFormErrors, setWtFormErrors] = useState<Record<string, string>>({});
  const [wtFormSuccess, setWtFormSuccess] = useState<boolean>(false);
  const [wtSaving, setWtSaving] = useState<boolean>(false);
  
  // New parameters
  const [wtSerialNo, setWtSerialNo] = useState<string>("");
  const [wtFrequency, setWtFrequency] = useState<string>("");
  const [wtOutputPower, setWtOutputPower] = useState<string>("");
  const [wtBatteryVoltage, setWtBatteryVoltage] = useState<string>("");
  const [wtBatteryCurrent, setWtBatteryCurrent] = useState<string>("");
  const [wtAntenna, setWtAntenna] = useState<string>("");

  // Walkie-Talkie Repairing form states
  const [wtrDate, setWtrDate] = useState<string>("");
  const [wtrOpeningBalance, setWtrOpeningBalance] = useState<string>("");
  const [wtrReceivedFromUser, setWtrReceivedFromUser] = useState<string>("");
  const [wtrSentToFirm, setWtrSentToFirm] = useState<string>("");
  const [wtrRepairedFromFirm, setWtrRepairedFromFirm] = useState<string>("");
  const [wtrReturnedToUser, setWtrReturnedToUser] = useState<string>("");
  const [wtrFaultTypes, setWtrFaultTypes] = useState<string[]>([]);
  const [wtrFaultTypesOpen, setWtrFaultTypesOpen] = useState<boolean>(false);
  const [wtrCustomFault, setWtrCustomFault] = useState<string>("");
  const [wtrRepairStatus, setWtrRepairStatus] = useState<string>("");
  const [wtrProposedCondemnation, setWtrProposedCondemnation] = useState<string>("");
  const [wtrCondemned, setWtrCondemned] = useState<string>("");
  const [wtrTotalCondemnedYear, setWtrTotalCondemnedYear] = useState<string>("");
  const [wtrActionTaken, setWtrActionTaken] = useState<string>("");
  const [wtrRemarks, setWtrRemarks] = useState<string>("");
  const [wtrFormErrors, setWtrFormErrors] = useState<Record<string, string>>({});
  const [wtrFormSuccess, setWtrFormSuccess] = useState<boolean>(false);
  const [wtrSaving, setWtrSaving] = useState<boolean>(false);

  // Low Insulation form states
  const [liSectionName, setLiSectionName] = useState<string>("");
  const [liKmNo, setLiKmNo] = useState<string>("");
  const [liTotalFaults, setLiTotalFaults] = useState<string>("");
  const [liFaultTime, setLiFaultTime] = useState<string>("");
  const [liRectified, setLiRectified] = useState<string>("");
  const [liRectifiedTime, setLiRectifiedTime] = useState<string>("");
  const [liActionPlan, setLiActionPlan] = useState<string>("");
  const [liTdc, setLiTdc] = useState<string>("");
  const [liRemarks, setLiRemarks] = useState<string>("");
  const [liFormErrors, setLiFormErrors] = useState<Record<string, string>>({});
  const [liFormSuccess, setLiFormSuccess] = useState<boolean>(false);
  const [liSaving, setLiSaving] = useState<boolean>(false);

  // Refs to handle click outside for dropdowns
  const divisionRef = useRef<HTMLDivElement>(null);
  const circuitRef = useRef<HTMLDivElement>(null);
  const reasonsRef = useRef<HTMLDivElement>(null);
  const exchangeRef = useRef<HTMLDivElement>(null);
  const exchReasonsRef = useRef<HTMLDivElement>(null);
  const netLocRef = useRef<HTMLDivElement>(null);
  const netReasonsRef = useRef<HTMLDivElement>(null);
  const ccCableTypesRef = useRef<HTMLDivElement>(null);
  const ccCutByWhomRef = useRef<HTMLDivElement>(null);
  const wtrFaultTypesRef = useRef<HTMLDivElement>(null);

  // Saved Logged Faults registry with dummy entries for Communication & Voice Circuits
  const [savedFaults, setSavedFaults] = useState<any[]>([
    {
      id: 1,
      circuitId: 1, // Control & ICMS Position
      division: "Bilaspur",
      icmsEntryNo: "ICMS-2026-00412",
      faultySection: "BSP-CPH Section",
      circuitFailed: "ICMS Link Primary",
      failureTime: "02-06-2026 09:30",
      rectificationTime: "02-06-2026 11:15",
      duration: "1 Hrs 45 Min",
      reasons: "Equipment Failure (STM)",
      remarks: "STM unit card reset at Champa exchange."
    },
    {
      id: 2,
      circuitId: 2, // FOIS (VSAT)
      division: "Bilaspur",
      faultySection: "BSP-PND Section",
      circuitFailed: "FOIS VSAT Link",
      failureTime: "02-06-2026 10:00",
      rectificationTime: "02-06-2026 12:30",
      duration: "2 Hrs 30 Min",
      reasons: "Link Failure",
      remarks: "Bypass switch toggled to restore connection."
    },
    {
      id: 3,
      circuitId: 7, // Rail Madad
      division: "Raipur",
      faultySection: "Raipur Control",
      circuitFailed: "Rail Madad Hotline",
      failureTime: "02-06-2026 11:00",
      rectificationTime: "02-06-2026 11:45",
      duration: "0 Hrs 45 Min",
      reasons: "Power Failure",
      remarks: "UPS power card replaced."
    },
    {
      id: 4,
      circuitId: 4, // Video Conferencing with Divisions
      division: "Nagpur",
      faultySection: "NGP-HQ Conference Room",
      circuitFailed: "Nagpur VC Main Codec",
      failureTime: "02-06-2026 15:00",
      rectificationTime: "02-06-2026 16:20",
      duration: "1 Hrs 20 Min",
      reasons: "Equipment Failure (STM)",
      remarks: "Zonal VC link test verified post firmware update."
    }
  ]);

  // Saved Logged Exchange Faults
  const [savedExchFaults, setSavedExchFaults] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      exchangeName: "Bilaspur Exchange",
      faultName: "Link Failure",
      failureTime: "02-06-2026 08:15",
      rectificationTime: "02-06-2026 09:45",
      duration: "1 Hrs 30 Min",
      reasons: "Link Failure, Cable Cut",
      remarks: "Primary fiber link cut restored by RailTel team."
    }
  ]);

  // Saved Logged Railnet Faults
  const [savedNetRecords, setSavedNetRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      location: "Bilaspur HQ",
      bandwidth: "1 Gbps",
      testingTime: "02-06-2026 10:15",
      dnSpeed: "910",
      upSpeed: "880",
      faultNature: "Slow Internet",
      failureTime: "02-06-2026 09:00",
      rectificationTime: "02-06-2026 10:30",
      duration: "1 Hrs 30 Min",
      reasons: "OFC Fault",
      remarks: "Splicing corrected on lead-in fiber loop."
    }
  ]);

  // Saved Logged Rail Madad Cases
  const [savedMadadRecords, setSavedMadadRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      balanceLast: "2",
      received: "5",
      complied: "4",
      netBalance: 3,
      description: "Grievance #88291 - Passenger reported Wi-Fi outage in coach S3 of BSP-Raipur train.",
      caseTime: "02-06-2026 09:30",
      complianceDetails: "AP reset in train and signal strength verified at Bilaspur station platform.",
      complianceTime: "02-06-2026 10:15",
      remarks: "Closed successfully with passenger confirmation."
    }
  ]);

  // Saved Logged Railway Board Video Phone Tests
  const [savedVpRecords, setSavedVpRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      phodChamber: "PCSTE",
      testingTime: "02-06-2026 11:30",
      videoClarity: "Excellent",
      audioClarity: "Excellent",
      remarks: "Tested successfully with Railway Board console officer."
    }
  ]);

  // Saved Logged Cable Cuts
  const [savedCcRecords, setSavedCcRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      sectionName: "BSP-CPH Section",
      kmNo: "712/14",
      cableTypes: "OFC (24 Core), 6 Quad Cable",
      cutByWhom: "NHAI Contractor (JCB Digging)",
      failureTime: "02-06-2026 09:30",
      rectificationTime: "02-06-2026 15:45",
      duration: "6 Hrs 15 Min",
      reasonOfFailure: "Excavation without S&T permission",
      remarks: "Splicing of 24 Core OFC and jointing of quad cable completed."
    }
  ]);

  // Saved Logged Walkie-Talkie Tests
  const [savedWtRecords, setSavedWtRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      stationLobby: "Bilaspur Lobby",
      totalToBeTested: "50",
      makeModel: "Motorola",
      testingDate: "2026-06-02",
      totalTested: "45",
      balanceToTest: "5",
      remarks: "Weekly testing done. 5 sets under repair at Bilaspur S&T workshop."
    }
  ]);

  // Saved Logged Walkie-Talkie Repairing Records
  const [savedWtrRecords, setSavedWtrRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      date: "2026-06-02",
      openingBalance: "15",
      receivedFromUser: "8",
      sentToFirm: "5",
      repairedFromFirm: "4",
      returnedToUser: "6",
      faultTypes: "Battery Fault, PTT Switch Fault",
      repairStatus: "Under Repair",
      proposedCondemnation: "2",
      condemned: "1",
      totalCondemnedYear: "12",
      actionTaken: "Tested charger bases. Faulty cells isolated and sent to firm.",
      pendingRepair: "16",
      remarks: "Sufficient battery cells available in buffer."
    }
  ]);

  // Saved Logged Low Insulation Records
  const [savedLiRecords, setSavedLiRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      sectionName: "CPH-RIG Section",
      kmNo: "732/18",
      totalFaults: "6",
      faultTime: "2026-06-02 08:30",
      rectified: "4",
      rectifiedTime: "2026-06-02 17:00",
      balanceFaults: "2",
      actionPlan: "Megger testing of quad pairs, replacement of joint kits.",
      tdc: "2026-06-10",
      remarks: "4 pairs rectified. Remaining 2 pairs are spare."
    }
  ]);

  // Close dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (divisionRef.current && !divisionRef.current.contains(event.target as Node)) {
        setDivisionDropdownOpen(false);
      }
      if (reasonsRef.current && !reasonsRef.current.contains(event.target as Node)) {
        setReasonsDropdownOpen(false);
      }
      if (exchangeRef.current && !exchangeRef.current.contains(event.target as Node)) {
        setExchangeDropdownOpen(false);
      }
      if (exchReasonsRef.current && !exchReasonsRef.current.contains(event.target as Node)) {
        setExchReasonsDropdownOpen(false);
      }
      if (netLocRef.current && !netLocRef.current.contains(event.target as Node)) {
        setNetLocDropdownOpen(false);
      }
      if (netReasonsRef.current && !netReasonsRef.current.contains(event.target as Node)) {
        setNetReasonsDropdownOpen(false);
      }
      if (ccCableTypesRef.current && !ccCableTypesRef.current.contains(event.target as Node)) {
        setCcCableTypesOpen(false);
      }
      if (ccCutByWhomRef.current && !ccCutByWhomRef.current.contains(event.target as Node)) {
        setCcCutByWhomOpen(false);
      }
      if (wtrFaultTypesRef.current && !wtrFaultTypesRef.current.contains(event.target as Node)) {
        setWtrFaultTypesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set initial client-side clock time and keep it updated
  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setLiveTime(date.toLocaleString("en-US", options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle category dropdown and clear search
  const handleToggleCategoryDropdown = (category: string) => {
    setSearchQuery("");
    setOpenDropdownCategory((prev) => (prev === category ? null : category));
  };

  // Get circuits filtered by category and search query
  const getFilteredCategoryCircuits = (categoryName: string) => {
    const circuitsInCategory = CIRCUITS_DATABASE.filter(c => c.category === categoryName);
    if (!searchQuery.trim()) return circuitsInCategory;
    return circuitsInCategory.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Handle circuit selection
  const handleSelectCircuit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setShowSidebarOnMobile(false);
    setLogInput("");
    setSaveSuccess(false);
    if (circuit.category === "Exchange") {
      setExchangeName(circuit.name.endsWith("Exchange") ? circuit.name : `${circuit.name} Exchange`);
    }
    // Clear standard form inputs when switching circuits
    setIcmsEntryNo("");
    setFaultySection("");
    setCircuitFailed("");
    setFailureTime("");
    setRectificationTime("");
    setSelectedReasons([]);
    setCustomReason("");
    setRemarks("");
    setFormErrors({});

    // Reset hierarchical fields
    if (circuit.name === "Railnet / Internet" && netActiveTab === "hq") {
      setFormMajorSection("Bilaspur HQ");
      setFormSection("HQ Internet Maintenance");
      setFormStationLocation("SECR HQ (Bilaspur)");
    } else {
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
    }

    // Clear Exchange states when switching circuits
    if (circuit.category === "Exchange") {
      setExchangeName(circuit.name.endsWith("Exchange") ? circuit.name : `${circuit.name} Exchange`);
    } else {
      setExchangeName("");
    }
    setFaultName("");
    setCustomFaultName("");
    setExchFailureTime("");
    setExchRectificationTime("");
    setExchSelectedReasons([]);
    setExchCustomReason("");
    setExchRemarks("");
    setExchFormErrors({});
    setExchFormSuccess(false);
    setExchSaving(false);

    // Clear Railnet states when switching circuits
    if (circuit.name === "Railnet / Internet" && netActiveTab === "hq") {
      setNetLocation("Bilaspur HQ");
    } else {
      setNetLocation("");
    }
    setNetBandwidth("");
    setNetTestingTime("");
    setNetDnSpeed("");
    setNetUpSpeed("");
    setNetFaultNature("");
    setNetCustomFaultNature("");
    setNetAuditReport("");
    setNetFailureTime("");
    setNetRectificationTime("");
    setNetSelectedReasons([]);
    setNetCustomReason("");
    setNetRemarks("");
    setNetFormErrors({});
    setNetFormSuccess(false);
    setNetSaving(false);

    // Clear Rail Madad form inputs when switching circuits
    setMadadBalanceLast("");
    setMadadReceived("");
    setMadadComplied("");
    setMadadDescription("");
    setMadadCaseTime("");
    setMadadComplianceDetails("");
    setMadadComplianceTime("");
    setMadadRemarks("");
    setMadadFormErrors({});
    setMadadFormSuccess(false);
    setMadadSaving(false);

    // Clear Video Phone states when switching circuits
    setVpPhodChamber("");
    setVpCustomPhod("");
    setVpTestingTime("");
    setVpVideoClarity("");
    setVpAudioClarity("");
    setVpRemarks("");
    setVpFormErrors({});
    setVpFormSuccess(false);
    setVpSaving(false);

    // Clear Cable Cut states when switching circuits
    setCcSectionName("");
    setCcKmNo("");
    setCcCableTypes([]);
    setCcCableTypesOpen(false);
    setCcCutByWhom([]);
    setCcCutByWhomOpen(false);
    setCcFailureTime("");
    setCcRectificationTime("");
    setCcCustomCableType("");
    setCcCustomCutBy("");
    setCcReasonOfFailure("");
    setCcRemarks("");
    setCcFormErrors({});
    setCcFormSuccess(false);
    setCcSaving(false);

    // Clear Walkie-Talkie Testing states when switching circuits
    setWtStationLobby("");
    setWtTotalToBeTested("");
    setWtMakeModel("");
    setWtCustomMakeModel("");
    setWtTestingDate("");
    setWtTotalTested("");
    setWtRemarks("");
    setWtSerialNo("");
    setWtFrequency("");
    setWtOutputPower("");
    setWtBatteryVoltage("");
    setWtBatteryCurrent("");
    setWtAntenna("");
    setWtFormErrors({});
    setWtFormSuccess(false);
    setWtSaving(false);

    // Clear Walkie-Talkie Repairing states when switching circuits
    setWtrDate("");
    setWtrOpeningBalance("");
    setWtrReceivedFromUser("");
    setWtrSentToFirm("");
    setWtrRepairedFromFirm("");
    setWtrReturnedToUser("");
    setWtrFaultTypes([]);
    setWtrFaultTypesOpen(false);
    setWtrCustomFault("");
    setWtrRepairStatus("");
    setWtrProposedCondemnation("");
    setWtrCondemned("");
    setWtrTotalCondemnedYear("");
    setWtrActionTaken("");
    setWtrRemarks("");
    setWtrFormErrors({});
    setWtrFormSuccess(false);
    setWtrSaving(false);

    // Clear Low Insulation states when switching circuits
    setLiSectionName("");
    setLiKmNo("");
    setLiTotalFaults("");
    setLiFaultTime("");
    setLiRectified("");
    setLiRectifiedTime("");
    setLiActionPlan("");
    setLiTdc("");
    setLiRemarks("");
    setLiFormErrors({});
    setLiFormSuccess(false);
    setLiSaving(false);
  };

  // Switch to the next circuit in the list when All OK is triggered
  const moveToNextCircuit = () => {
    if (!selectedCircuit) return;
    const currentIndex = CIRCUITS_DATABASE.findIndex((c) => c.id === selectedCircuit.id);
    if (currentIndex !== -1 && currentIndex < CIRCUITS_DATABASE.length - 1) {
      const nextCircuit = CIRCUITS_DATABASE[currentIndex + 1];
      handleSelectCircuit(nextCircuit);
      setOpenDropdownCategory(nextCircuit.category);
    }
  };


  // Get active status details for the current selection
  const activeStatus = useMemo(() => {
    if (!selectedCircuit) return null;
    return selectedCircuit.divisionData[selectedDivision];
  }, [selectedCircuit, selectedDivision]);

  // Filter standard faults by selected division and selected circuit ID
  const filteredFaults = useMemo(() => {
    if (!selectedCircuit) return [];
    return savedFaults.filter(
      (f) => f.circuitId === selectedCircuit.id && f.division === selectedDivision
    );
  }, [savedFaults, selectedCircuit, selectedDivision]);

  // Rail Madad Net Balance Case Auto-calculation
  const netBalanceCase = useMemo(() => {
    const last = parseInt(madadBalanceLast, 10) || 0;
    const rec = parseInt(madadReceived, 10) || 0;
    const comp = parseInt(madadComplied, 10) || 0;
    return last + rec - comp;
  }, [madadBalanceLast, madadReceived, madadComplied]);

  // Combine static and dynamic logs
  const displayLogs = useMemo(() => {
    if (!selectedCircuit || !activeStatus) return [];
    const logKey = `${selectedDivision}_${selectedCircuit.id}`;
    const dynamicLogs = userLogs[logKey] || [];
    return [...dynamicLogs, ...activeStatus.recentLogs];
  }, [selectedCircuit, selectedDivision, activeStatus, userLogs]);

  // Save new log entry
  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    if (!selectedCircuit || !logInput.trim()) return;

    const logKey = `${selectedDivision}_${selectedCircuit.id}`;
    const newLog = `${new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })} - [${formMajorSection} / ${formSection} / ${formStationLocation}] - ${logInput.trim()}`;

    setUserLogs((prev) => ({
      ...prev,
      [logKey]: [newLog, ...(prev[logKey] || [])],
    }));

    setLogInput("");
    setFormMajorSection("");
    setFormSection("");
    setFormStationLocation("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Auto-calculated duration
  const totalDuration = useMemo(() => {
    if (!failureTime || !rectificationTime) return "";
    const start = new Date(failureTime);
    const end = new Date(rectificationTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
    
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return "RT is earlier than Failure Time";
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    
    return `${hrs} Hrs ${mins} Min`;
  }, [failureTime, rectificationTime]);

  // Handle Save Fault Submit
  const handleSaveFault = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const isIcmsCom = selectedCircuit?.name === "Control & ICMS Position";
    const isFoisVsat = selectedCircuit?.name === "FOIS (VSAT)";
    const isHotline = selectedCircuit?.name === "Hotline";
    const isVcDiv = selectedCircuit?.name === "Video Conferencing with Divisions";
    const isCftmConf = selectedCircuit?.name === "CFTM Conference";
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

    // Formatting date helper: DD-MM-YYYY HH:MM
    const formatDate = (dateStr: string) => {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hour = String(d.getHours()).padStart(2, "0");
      const minute = String(d.getMinutes()).padStart(2, "0");
      return `${day}-${month}-${year} ${hour}:${minute}`;
    };

    const newFault = {
      id: Date.now(),
      circuitId: selectedCircuit?.id,
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

    setSavedFaults(prev => [newFault, ...prev]);

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
    setFaultFormSuccess(true);
    setTimeout(() => setFaultFormSuccess(false), 4000);
  };

  // Mock List of SECR Telephone Exchanges
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

  // Filter exchanges based on search query
  const filteredExchanges = useMemo(() => {
    if (!exchangeSearchQuery.trim()) return EXCHANGES_LIST;
    return EXCHANGES_LIST.filter(exch => 
      exch.toLowerCase().includes(exchangeSearchQuery.toLowerCase())
    );
  }, [exchangeSearchQuery]);

  // Exchange Fault Auto-calculated duration
  const exchTotalDuration = useMemo(() => {
    if (!exchFailureTime || !exchRectificationTime) return "";
    const start = new Date(exchFailureTime);
    const end = new Date(exchRectificationTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
    
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return "RT is earlier than Failure Time";
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    
    return `${hrs} Hrs ${mins} Min`;
  }, [exchFailureTime, exchRectificationTime]);

  // Handle Save Exchange Fault Form
  const handleSaveExchFault = (e: React.FormEvent) => {
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

    // Simulate loading state (1.2 seconds) before success
    setTimeout(() => {
      // Date formatter
      const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hour}:${minute}`;
      };

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

      setSavedExchFaults(prev => [newExchFault, ...prev]);
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

      // Success alert stays active for 5 seconds
      setTimeout(() => setExchFormSuccess(false), 5000);
    }, 1200);
  };

  // Mock List of SECR Locations for Railnet
  // Mock List of SECR Locations for Railnet
  const LOCATIONS_LIST = useMemo(() => {
    const list = [
      "Bilaspur HQ",
      "Raipur Division",
      "Nagpur Division",
      "Durg Station",
      "Gondia Station",
      "Dongargarh Station",
      "Champa Station",
      "Korba Station",
      "Anuppur Station",
      "Shahdol Station",
      "Usalapur Station",
      "Bhatapara Station"
    ];
    if (selectedCircuit?.name === "Railnet / Internet") {
      list.push("Others");
    }
    return list;
  }, [selectedCircuit]);

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!netLocSearchQuery.trim()) return LOCATIONS_LIST;
    return LOCATIONS_LIST.filter(loc => 
      loc.toLowerCase().includes(netLocSearchQuery.toLowerCase())
    );
  }, [netLocSearchQuery, LOCATIONS_LIST]);

  // Railnet Auto-calculated duration
  const netTotalDuration = useMemo(() => {
    if (!netFailureTime || !netRectificationTime) return "";
    const start = new Date(netFailureTime);
    const end = new Date(netRectificationTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
    
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return "RT is earlier than Failure Time";
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    
    return `${hrs} Hrs ${mins} Min`;
  }, [netFailureTime, netRectificationTime]);

  // Handle Save Railnet Form
  const handleSaveNetRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }
    if (!netLocation) {
      errors.netLocation = selectedCircuit?.name === "Railnet / Internet"
        ? "Location/Station is required"
        : "Location is required";
    }
    if (!netBandwidth.trim()) errors.netBandwidth = "Bandwidth is required";
    if (!netTestingTime) {
      errors.netTestingTime = selectedCircuit?.name === "Railnet / Internet"
        ? "Last Testing Time is required"
        : "Testing Time is required";
    }
    if (!netFaultNature) errors.netFaultNature = "Nature of Fault is required";
    if (netFaultNature === "Other" && !netCustomFaultNature.trim()) {
      errors.netCustomFaultNature = "Fault details are required";
    }
    if (selectedCircuit?.name === "Railnet / Internet" && !netAuditReport.trim()) {
      errors.netAuditReport = "Audit Report is required";
    }
    if (!netFailureTime) errors.netFailureTime = "Failure Date & Time is required";
    if (!netRectificationTime) errors.netRectificationTime = "Rectification Time is required";
    if (netSelectedReasons.length === 0) errors.reasons = "At least one failure reason is required";
    if (netSelectedReasons.includes("Other") && !netCustomReason.trim()) {
      errors.netCustomReason = "Custom failure reason is required";
    }

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    // Number validations
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

    // Simulate loading state (1.2 seconds)
    setTimeout(() => {
      // Date formatter: DD-MM-YYYY HH:MM
      const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hour}:${minute}`;
      };

      const newNetRecord = {
        id: Date.now(),
        division: selectedDivision,
        icmsEntryNo: icmsEntryNo.trim(),
        location: netLocation,
        bandwidth: netBandwidth.trim(),
        testingTime: formatDate(netTestingTime),
        dnSpeed: netDnSpeed ? `${netDnSpeed} Mbps` : "-",
        upSpeed: netUpSpeed ? `${netUpSpeed} Mbps` : "-",
        faultNature: netFaultNature === "Other" ? `Other: ${netCustomFaultNature.trim()}` : netFaultNature,
        auditReport: selectedCircuit?.name === "Railnet / Internet" ? netAuditReport.trim() : undefined,
        attachmentName: netAttachment ? netAttachment.name : undefined,
        failureTime: formatDate(netFailureTime),
        rectificationTime: formatDate(netRectificationTime),
        duration: netTotalDuration,
        reasons: netSelectedReasons.map(r => r === "Other" ? `Other: ${netCustomReason.trim()}` : r).join(", "),
        remarks: netRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation
      };

      setSavedNetRecords(prev => [newNetRecord, ...prev]);
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
        setNetLocation("Bilaspur HQ");
      } else {
        setNetLocation("");
        setFormMajorSection("");
        setFormSection("");
        setFormStationLocation("");
      }
      setNetFormSuccess(true);

      // Auto hide success banner after 5 seconds
      setTimeout(() => setNetFormSuccess(false), 5000);
    }, 1200);
  };

  // Handle Save Rail Madad Form
  const handleSaveMadadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }

    if (!madadBalanceLast.trim()) {
      errors.madadBalanceLast = "Case Balance Till Last Date is required";
    } else if (isNaN(Number(madadBalanceLast))) {
      errors.madadBalanceLast = "Must be a numeric value";
    }

    if (!madadReceived.trim()) {
      errors.madadReceived = "Case Received on Date is required";
    } else if (isNaN(Number(madadReceived))) {
      errors.madadReceived = "Must be a numeric value";
    }

    if (!madadComplied.trim()) {
      errors.madadComplied = "Case complied On Date is required";
    } else if (isNaN(Number(madadComplied))) {
      errors.madadComplied = "Must be a numeric value";
    }

    if (!madadDescription.trim()) errors.madadDescription = "Description of Case is required";
    if (!madadCaseTime) errors.madadCaseTime = "Case Date & Time is required";

    if (!madadComplianceDetails.trim()) errors.madadComplianceDetails = "S&T Compliance Details are required";
    if (!madadComplianceTime) errors.madadComplianceTime = "S&T Compliance Date & Time is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (Object.keys(errors).length > 0) {
      setMadadFormErrors(errors);
      return;
    }

    setMadadFormErrors({});
    setMadadSaving(true);

    // Simulate loading state (1.2 seconds)
    setTimeout(() => {
      // Date formatter: DD-MM-YYYY HH:MM
      const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hour}:${minute}`;
      };

      const newMadadRecord = {
        id: Date.now(),
        division: selectedDivision,
        icmsEntryNo: icmsEntryNo.trim(),
        balanceLast: madadBalanceLast,
        received: madadReceived,
        complied: madadComplied,
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

      setSavedMadadRecords(prev => [newMadadRecord, ...prev]);
      setMadadSaving(false);

      // Reset form fields
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

      // Auto hide success banner after 5 seconds
      setTimeout(() => setMadadFormSuccess(false), 5000);
    }, 1200);
  };

  // Handle Save Railway Board Video Phone Test Form
  const handleSaveVpRecord = (e: React.FormEvent) => {
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

    // Simulate loading state (1.2 seconds)
    setTimeout(() => {
      // Date formatter: DD-MM-YYYY HH:MM
      const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hour}:${minute}`;
      };

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

      setSavedVpRecords(prev => [newVpRecord, ...prev]);
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

      // Auto hide success banner after 5 seconds
      setTimeout(() => setVpFormSuccess(false), 5000);
    }, 1200);
  };

  // Cable Cut Auto-calculated duration
  const ccTotalDuration = useMemo(() => {
    if (!ccFailureTime || !ccRectificationTime) return "";
    const start = new Date(ccFailureTime);
    const end = new Date(ccRectificationTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";
    
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return "RT is earlier than Failure Time";
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hrs = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    
    return `${hrs} Hrs ${mins} Min`;
  }, [ccFailureTime, ccRectificationTime]);

  // Handle Save Cable Cut Form
  const handleSaveCcRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }

    if (!ccSectionName.trim()) errors.ccSectionName = "Section name is required";
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

    // Simulate loading state (1.2 seconds)
    setTimeout(() => {
      // Date formatter: DD-MM-YYYY HH:MM
      const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hour}:${minute}`;
      };

      const newCcRecord = {
        id: Date.now(),
        division: selectedDivision,
        icmsEntryNo: icmsEntryNo.trim(),
        sectionName: ccSectionName.trim(),
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

      setSavedCcRecords(prev => [newCcRecord, ...prev]);
      setCcSaving(false);

      setIcmsEntryNo("");
      setCcSectionName("");
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

      // Auto hide success banner after 5 seconds
      setTimeout(() => setCcFormSuccess(false), 5000);
    }, 1200);
  };

  // Walkie-Talkie Testing Auto-calculated balance
  const wtBalanceToTest = useMemo(() => {
    if (!wtTotalToBeTested || !wtTotalTested) return "";
    const toTest = parseInt(wtTotalToBeTested, 10);
    const tested = parseInt(wtTotalTested, 10);
    if (isNaN(toTest) || isNaN(tested)) return "";
    return Math.max(0, toTest - tested).toString();
  }, [wtTotalToBeTested, wtTotalTested]);

  // Handle Save Walkie-Talkie Testing Form
  const handleSaveWtRecord = (e: React.FormEvent) => {
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

    // Simulate loading state (1.2 seconds)
    setTimeout(() => {
      // Date formatter for display: YYYY-MM-DD
      const formatDate = (dateStr: string) => {
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
        testingDate: formatDate(wtTestingDate),
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

      setSavedWtRecords(prev => [newWtRecord, ...prev]);
      setWtSaving(false);

      // Reset form fields
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

      // Auto hide success banner after 5 seconds
      setTimeout(() => setWtFormSuccess(false), 5000);
    }, 1200);
  };

  // Walkie-Talkie Repairing Auto-calculated Pending Repair Sets
  const wtrPendingRepair = useMemo(() => {
    const ob = parseInt(wtrOpeningBalance, 10);
    const recv = parseInt(wtrReceivedFromUser, 10);
    const ret = parseInt(wtrReturnedToUser, 10);
    const cond = parseInt(wtrCondemned, 10);
    if (isNaN(ob) || isNaN(recv) || isNaN(ret) || isNaN(cond)) return "";
    return Math.max(0, ob + recv - ret - cond).toString();
  }, [wtrOpeningBalance, wtrReceivedFromUser, wtrReturnedToUser, wtrCondemned]);

  // Handle Save Walkie-Talkie Repairing Form
  const handleSaveWtrRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }

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

    // Logic consistency: Returned + Condemned <= Opening + Received
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

    // Simulate loading state (1.2 seconds)
    setTimeout(() => {
      const formatDate = (dateStr: string) => {
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
        icmsEntryNo: icmsEntryNo.trim(),
        date: formatDate(wtrDate),
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

      setSavedWtrRecords(prev => [newWtrRecord, ...prev]);
      setWtrSaving(false);

      // Reset form fields
      setIcmsEntryNo("");
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

      // Auto hide success banner after 5 seconds
      setTimeout(() => setWtrFormSuccess(false), 5000);
    }, 1200);
  };

  // Low Insulation Auto-calculated Balance faults
  const liBalanceFaults = useMemo(() => {
    if (!liTotalFaults || !liRectified) return "";
    const total = parseInt(liTotalFaults, 10);
    const rect = parseInt(liRectified, 10);
    if (isNaN(total) || isNaN(rect)) return "";
    return Math.max(0, total - rect).toString();
  }, [liTotalFaults, liRectified]);

  // Handle Save Low Insulation Form
  const handleSaveLiRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!icmsEntryNo.trim()) {
      errors.icmsEntryNo = "ICMS Entry No./Docket No. is required";
    }

    if (!liSectionName.trim()) errors.liSectionName = "Section name is required";
    if (!liKmNo.trim()) errors.liKmNo = "KM Number is required";

    if (!liTotalFaults.trim()) {
      errors.liTotalFaults = "Total number of insulation faults is required";
    } else {
      const val = parseInt(liTotalFaults, 10);
      if (isNaN(val) || val < 0) {
        errors.liTotalFaults = "Must be a valid positive number";
      }
    }

    if (!liFaultTime) {
      errors.liFaultTime = "Fault Date & Time is required";
    }

    if (!liRectified.trim()) {
      errors.liRectified = "Rectified faults count is required";
    } else {
      const val = parseInt(liRectified, 10);
      if (isNaN(val) || val < 0) {
        errors.liRectified = "Must be a valid positive number";
      } else {
        const totalVal = parseInt(liTotalFaults, 10);
        if (!isNaN(totalVal) && val > totalVal) {
          errors.liRectified = "Rectified faults cannot exceed total faults";
        }
      }
    }

    if (liRectified && parseInt(liRectified, 10) > 0 && !liRectifiedTime) {
      errors.liRectifiedTime = "Rectified Date & Time is required when some faults are rectified";
    }

    if (liFaultTime && liRectifiedTime) {
      const start = new Date(liFaultTime);
      const end = new Date(liRectifiedTime);
      if (end.getTime() < start.getTime()) {
        errors.liRectifiedTime = "Rectified Date & Time cannot be earlier than Fault Date & Time";
      }
    }

    if (!liActionPlan.trim()) errors.liActionPlan = "Action Plan is required";
    if (!liTdc) errors.liTdc = "Target Date of Completion (TDC) is required";

    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (Object.keys(errors).length > 0) {
      setLiFormErrors(errors);
      return;
    }

    setLiFormErrors({});
    setLiSaving(true);

    // Simulate loading state (1.2 seconds)
    setTimeout(() => {
      // Formatter for datetime picker: DD-MM-YYYY HH:MM
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

      // Formatter for date picker: YYYY-MM-DD
      const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };

      const newLiRecord = {
        id: Date.now(),
        division: selectedDivision,
        icmsEntryNo: icmsEntryNo.trim(),
        sectionName: liSectionName.trim(),
        kmNo: liKmNo.trim(),
        totalFaults: liTotalFaults.trim(),
        faultTime: formatDatetime(liFaultTime),
        rectified: liRectified.trim(),
        rectifiedTime: formatDatetime(liRectifiedTime),
        balanceFaults: liBalanceFaults,
        actionPlan: liActionPlan.trim(),
        tdc: formatDate(liTdc),
        remarks: liRemarks.trim(),
        majorSection: formMajorSection,
        section: formSection,
        stationLocation: formStationLocation
      };

      setSavedLiRecords(prev => [newLiRecord, ...prev]);
      setLiSaving(false);

      // Reset form fields
      setIcmsEntryNo("");
      setLiSectionName("");
      setLiKmNo("");
      setLiTotalFaults("");
      setLiFaultTime("");
      setLiRectified("");
      setLiRectifiedTime("");
      setLiActionPlan("");
      setLiTdc("");
      setLiRemarks("");
      setFormMajorSection("");
      setFormSection("");
      setFormStationLocation("");
      setLiFormSuccess(true);

      // Auto hide success banner after 5 seconds
      setTimeout(() => setLiFormSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="dashboard-container">
      {/* HEADER SECTION */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="secr-logo" title="South East Central Railway">SECR</div>
          <div className="logo-text">
            <span className="logo-title">South East Central Railway</span>
            {/* <span className="logo-sub">Telecom Department Operations</span> */}
          </div>
        </div>

        <div className="header-center">
          <h1>Daily Telecom Position</h1>
        </div>

        <div className="header-right">
          {/* Live System Time */}
          <div className="header-clock" title="System Time">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>{liveTime || "02 Jun 2026 01:53:14 PM"}</span>
          </div>

          {/* Division Dropdown */}
          <div className="select-wrapper" ref={divisionRef}>
            <button
              className={`dropdown-trigger ${divisionDropdownOpen ? "open" : ""}`}
              onClick={() => setDivisionDropdownOpen(!divisionDropdownOpen)}
              aria-label="Select Division"
            >
              <span>{selectedDivision} Division</span>
            </button>
            {divisionDropdownOpen && (
              <div className="dropdown-menu">
                {["Bilaspur", "Raipur", "Nagpur"].map((division) => (
                  <div
                    key={division}
                    className={`dropdown-item ${selectedDivision === division ? "active" : ""}`}
                    onClick={() => {
                      setSelectedDivision(division);
                      setDivisionDropdownOpen(false);
                      setSaveSuccess(false);
                      setFormMajorSection("");
                      setFormSection("");
                      setFormStationLocation("");
                    }}
                  >
                    {division}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT SECTION */}
      <div className="dashboard-content">
        {/* LEFT PANEL */}
        <aside className={`left-panel ${(!selectedCircuit || showSidebarOnMobile) ? "mobile-show" : "mobile-hide"}`}>
          <h2 className="panel-title">Name of Circuit</h2>
          
          <div className="categories-dropdown-list" ref={circuitRef} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              "Communication & Voice Circuits",
              "Network & Internet",
              "Cable Infrastructure",
              "Display System",
              "Testing & Maintenance",
              "CCTV",
              "Exchange",
              "Rail Madad"
            ].map((catName, index) => {
              const isOpen = openDropdownCategory === catName;
              const filteredList = getFilteredCategoryCircuits(catName);
              const isSelectedInCat = selectedCircuit && selectedCircuit.category === catName;
              
              return (
                <div key={catName} className={`category-select-group ${isSelectedInCat ? "active-category" : ""}`}>
                  <button
                    type="button"
                    className={`category-heading-trigger ${isOpen && catName !== "Rail Madad" ? "open" : ""} ${isSelectedInCat ? "selected" : ""}`}
                    onClick={() => {
                      if (catName === "Rail Madad") {
                        const circuit = CIRCUITS_DATABASE.find(c => c.category === "Rail Madad");
                        if (circuit) {
                          handleSelectCircuit(circuit);
                        }
                      } else {
                        handleToggleCategoryDropdown(catName);
                      }
                    }}
                    aria-label={catName === "Rail Madad" ? "Select Rail Madad" : `Toggle ${catName}`}
                  >
                    <span className="category-heading-text">
                      {catName}
                    </span>
                    {catName !== "Rail Madad" && (
                      <span className="category-arrow">
                        {isOpen ? "▲" : "▼"}
                      </span>
                    )}
                  </button>

                  {/* Show selected circuit details if closed and selected */}
                  {isSelectedInCat && !isOpen && catName !== "Rail Madad" && (
                    <div className="category-selected-preview">
                      <span className="dot"></span>
                      <span>{selectedCircuit.name}</span>
                    </div>
                  )}

                  {isOpen && catName !== "Rail Madad" && (
                    <div className="circuit-dropdown-inline-box">
                      {/* Search input inside dropdown for searching category items */}
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
                          placeholder="Search circuit..."
                          className="circuit-dropdown-search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Search ${catName}`}
                        />
                      </div>

                      {/* Scrollable list inside dropdown */}
                      <div className="circuit-dropdown-list" style={{ maxHeight: "180px", overflowY: "auto" }}>
                        {filteredList.length > 0 ? (
                          filteredList.map((circuit) => (
                            <div
                              key={circuit.id}
                              className={`circuit-item ${selectedCircuit?.id === circuit.id ? "active" : ""}`}
                              onClick={() => {
                                handleSelectCircuit(circuit);
                              }}
                            >
                              <span>{circuit.name}</span>
                              <span className="circuit-badge">{circuit.badge}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "12px", fontSize: "12px", color: "#6B7280", textAlign: "center" }}>
                            No circuits found.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className={`right-panel ${(selectedCircuit && !showSidebarOnMobile) ? "mobile-show" : "mobile-hide"}`}>
          {selectedCircuit && (
            <div className="mobile-back-container">
              <button
                type="button"
                className="mobile-back-button"
                onClick={() => setShowSidebarOnMobile(true)}
                aria-label="Back to Circuit List"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span>View Circuit List</span>
              </button>
            </div>
          )}
          {!selectedCircuit ? (
            /* Empty State Placeholder View */
            <div className="empty-state">
              <p>Select a Circuit from the left panel to view details.</p>
            </div>
          ) : isStandardFaultCircuit(selectedCircuit) ? (
            /* Standard Fault Entry Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>{selectedCircuit.name}</h2>
                </div>
              </div>

              {/* Success Notification Alert */}
              {faultFormSuccess && (
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

              {/* Fault Entry Form */}
              <form className="fault-form" onSubmit={handleSaveFault}>
                {selectedCircuit?.name === "Control & ICMS Position" || selectedCircuit?.name === "FOIS (VSAT)" || selectedCircuit?.name === "Hotline" || selectedCircuit?.name === "Video Conferencing with Divisions" || selectedCircuit?.name === "CFTM Conference" ? (
                  <>
                    {/* Row 1: ICMS Entry No. & Major Section */}
                    <div className="form-group-row">
                      {/* ICMS Entry No./Docket No. */}
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

                      {/* Major Section */}
                      <div className="form-group">
                        <label htmlFor="formMajorSection" className="form-label">
                          Major Section <span className="required">*</span>
                        </label>
                        <select
                          id="formMajorSection"
                          className={`form-input ${formErrors.formMajorSection ? "field-error-border" : ""}`}
                          style={{ height: "42px", appearance: "auto" }}
                          value={formMajorSection}
                          onChange={(e) => handleMajorSectionChange(e.target.value)}
                        >
                           <option value="">Select Major Section</option>
                           {selectedDivision && HIERARCHICAL_DATA[selectedDivision] && Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections).map((mSec) => (
                             <option key={mSec} value={mSec}>{mSec}</option>
                           ))}
                         </select>
                         {formErrors.formMajorSection && (
                           <span className="error-text">{formErrors.formMajorSection}</span>
                         )}
                       </div>
                     </div>
 
                     {/* Row 2: Section & Station/Location */}
                     <div className="form-group-row">
                       {/* Section */}
                       <div className="form-group">
                         <label htmlFor="formSection" className="form-label">
                           Section <span className="required">*</span>
                         </label>
                         <select
                           id="formSection"
                           className={`form-input ${formErrors.formSection ? "field-error-border" : ""}`}
                           style={{ height: "42px", appearance: "auto" }}
                           value={formSection}
                           onChange={(e) => handleSectionChange(e.target.value)}
                          disabled={!formMajorSection}
                        >
                          <option value="">Select Section</option>
                          {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && 
                            Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections).map((sec) => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))
                          }
                        </select>
                        {formErrors.formSection && (
                          <span className="error-text">{formErrors.formSection}</span>
                        )}
                      </div>

                      {/* Station/Location */}
                      <div className="form-group">
                        <label htmlFor="formStationLocation" className="form-label">
                          Station/Location <span className="required">*</span>
                        </label>
                        <select
                          id="formStationLocation"
                          className={`form-input ${formErrors.formStationLocation ? "field-error-border" : ""}`}
                          style={{ height: "42px", appearance: "auto" }}
                          value={formStationLocation}
                          onChange={(e) => handleStationLocationChange(e.target.value)}
                          disabled={!formMajorSection}
                        >
                          <option value="">Select Station/Location</option>
                          {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && (() => {
                            const sectionsObj = HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections;
                            if (formSection) {
                              return sectionsObj[formSection]?.map((stn) => (
                                <option key={stn} value={stn}>{stn}</option>
                              ));
                            } else {
                              return Object.values(sectionsObj).flat().map((stn) => (
                                <option key={stn} value={stn}>{stn}</option>
                              ));
                            }
                          })()}
                        </select>
                        {formErrors.formStationLocation && (
                          <span className="error-text">{formErrors.formStationLocation}</span>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Name of Circuit Failed & Failure Date & Time */}
                    <div className="form-group-row">
                      {/* Name of Circuit Failed */}
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

                      {/* Failure Date & Time */}
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

                    {/* Row 4: Rectification Time & Duration of Failure */}
                    <div className="form-group-row">
                      {/* Rectification Time (RT) */}
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

                      {/* Duration of Failure */}
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

                    {/* Row 5: Reason of Failure & spacer */}
                    <div className="form-group-row">
                      {/* Reason of Failure */}
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
                              {(selectedCircuit?.name === "Hotline"
                                ? [
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
                                  ]
                                : selectedCircuit?.name === "Video Conferencing with Divisions"
                                ? [
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
                                  ]
                                : selectedCircuit?.name === "Control & ICMS Position" || selectedCircuit?.name === "FOIS (VSAT)"
                                ? [
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
                                  ]
                                : [
                                    "Control Failure",
                                    "Telephone Failure",
                                    "Cable Cut",
                                    "Link Failure",
                                    "Equipment Failure (STM)",
                                    "Equipment Failure (Phone)",
                                    "Power Failure",
                                    "Configuration Issue",
                                    "Other"
                                  ]
                              ).map((option) => (
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

                      <div className="form-group"></div>
                    </div>
                  </>
                ) : (
                  <>
                    {renderHierarchicalFields(formErrors)}
                    <div className="form-group-row">
                      {/* ICMS Entry No./Docket No. */}
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

                      {/* Faulty Station/ Section / Location/station */}
                      <div className="form-group">
                        <label htmlFor="faultySection" className="form-label">
                          {selectedCircuit?.name === "FOIS (VSAT)"
                            ? "Location/station"
                            : selectedCircuit?.name === "Hotline"
                            ? "Faulty Hotline Location"
                            : selectedCircuit?.name === "Video Conferencing with Divisions"
                            ? "Faulty Location"
                            : "Faulty Section"} <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="faultySection"
                          className={`form-input ${formErrors.faultySection ? "field-error-border" : ""}`}
                          placeholder={
                            selectedCircuit?.name === "FOIS (VSAT)"
                              ? "Enter location/station name"
                              : selectedCircuit?.name === "Hotline"
                              ? "Enter faulty hotline location"
                              : selectedCircuit?.name === "Video Conferencing with Divisions"
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

                    {/* Name of Circuit Failed */}
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
                      {/* Placeholder space to maintain clean alignment */}
                      <div className="form-group"></div>
                    </div>

                    <div className="form-group-row">
                      {/* Failure Date & Time */}
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

                      {/* Rectification Time (RT) */}
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
                      {/* Total Duration (Read Only) */}
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

                      {/* Reason of Failure */}
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
                              {(selectedCircuit?.name === "Hotline"
                                ? [
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
                                  ]
                                : selectedCircuit?.name === "Video Conferencing with Divisions"
                                ? [
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
                                  ]
                                : (selectedCircuit?.name === "Control & ICMS Position" || selectedCircuit?.name === "FOIS (VSAT)")
                                ? [
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
                                  ]
                                : [
                                    "Control Failure",
                                    "Telephone Failure",
                                    "Cable Cut",
                                    "Link Failure",
                                    "Equipment Failure (STM)",
                                    "Equipment Failure (Phone)",
                                    "Power Failure",
                                    "Configuration Issue",
                                    "Other"
                                  ]
                              ).map((option) => (
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

                {/* Other Custom Reason input */}
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

                {/* Remarks */}
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

                {/* Save button */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const nowStr = new Date().toISOString().slice(0, 16);
                      const formatDate = (dateStr: string) => {
                        const d = new Date(dateStr);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        const hour = String(d.getHours()).padStart(2, "0");
                        const minute = String(d.getMinutes()).padStart(2, "0");
                        return `${day}-${month}-${year} ${hour}:${minute}`;
                      };
                      const newFault = {
                        id: Date.now(),
                        circuitId: selectedCircuit?.id,
                        division: selectedDivision,
                        icmsEntryNo: selectedCircuit?.name === "Control & ICMS Position" ? "None" : undefined,
                        faultySection: "None",
                        circuitFailed: selectedCircuit?.name || "All Circuits OK",
                        failureTime: formatDate(nowStr),
                        rectificationTime: formatDate(nowStr),
                        duration: "0 Hrs 0 Min",
                        reasons: "Link Failure",
                        remarks: "All circuits tested OK. No faults reported."
                      };
                      setSavedFaults(prev => [newFault, ...prev]);
                      setIcmsEntryNo("");
                      setFaultySection("");
                      setCircuitFailed("");
                      setFailureTime("");
                      setRectificationTime("");
                      setSelectedReasons([]);
                      setCustomReason("");
                      setRemarks("");
                      moveToNextCircuit();
                    }}
                  >
                    All OK
                  </button>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </form>




            </div>
          ) : selectedCircuit.category === "Exchange" ? (
            /* Exchange Fault Entry Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>{exchangeName}</h2>
                </div>
              </div>

              {/* Success Notification Alert */}
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

              {/* Exchange Fault Entry Form */}
              <form className="fault-form" onSubmit={handleSaveExchFault}>
                {renderHierarchicalFields(exchFormErrors)}
                <div className="form-group-row">
                  {/* ICMS Entry No./Docket No. */}
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
                  {/* Placeholder space to maintain clean alignment */}
                  <div className="form-group"></div>
                </div>

                <div className="form-group-row">
                  {/* Name of Exchange - Custom Searchable Dropdown */}
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
                          {/* Search bar inside Exchange dropdown */}
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
                          {/* Exchange items */}
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

                  {/* Name of Fault */}
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

                {/* Custom Fault Name (shown when Name of Fault is Other) */}
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
                  {/* Failure Date & Time */}
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

                  {/* Rectification Time (RT) */}
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
                  {/* Total Duration (Read Only) */}
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

                  {/* Reason of Failure */}
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

                {/* Other Custom Reason input */}
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

                {/* Remarks */}
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

                {/* Save button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const nowStr = new Date().toISOString().slice(0, 16);
                      const formatDate = (dateStr: string) => {
                        const d = new Date(dateStr);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        const hour = String(d.getHours()).padStart(2, "0");
                        const minute = String(d.getMinutes()).padStart(2, "0");
                        return `${day}-${month}-${year} ${hour}:${minute}`;
                      };
                      const newExchFault = {
                        id: Date.now(),
                        division: selectedDivision,
                        exchangeName: selectedCircuit?.name || "BSP Exchange",
                        faultName: "None",
                        failureTime: formatDate(nowStr),
                        rectificationTime: formatDate(nowStr),
                        duration: "0 Hrs 0 Min",
                        reasons: "Link Failure",
                        remarks: "All exchange systems functioning normally."
                      };
                      setSavedExchFaults(prev => [newExchFault, ...prev]);
                      setExchangeName("");
                      setFaultName("");
                      setCustomFaultName("");
                      setExchFailureTime("");
                      setExchRectificationTime("");
                      setExchSelectedReasons([]);
                      setExchCustomReason("");
                      setExchRemarks("");
                      moveToNextCircuit();
                    }}
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
          ) : selectedCircuit.name === "Railnet / Internet" ? (
            /* Railnet / Internet Monitoring Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
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
                      setNetLocation("");
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
                      setNetLocation("Bilaspur HQ");
                    }}
                  >
                    HQ Maintenance
                  </button>
                </div>
              </div>

              {/* Success Notification Alert */}
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

              {/* Railnet / Internet Monitoring Form */}
              <form className="fault-form" onSubmit={handleSaveNetRecord}>
                {netActiveTab !== "hq" && (
                  <>
                    <div className="form-group-row">
                      {/* Major Section */}
                      <div className="form-group">
                        <label htmlFor="formMajorSection" className="form-label">
                          Major Section <span className="required">*</span>
                        </label>
                        <select
                          id="formMajorSection"
                          className={`form-input ${netFormErrors.formMajorSection ? "field-error-border" : ""}`}
                          style={{ height: "42px", appearance: "auto" }}
                          value={formMajorSection}
                          onChange={(e) => handleMajorSectionChange(e.target.value)}
                        >
                          <option value="">Select Major Section</option>
                          {selectedDivision && HIERARCHICAL_DATA[selectedDivision] && Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections).map((mSec) => (
                            <option key={mSec} value={mSec}>{mSec}</option>
                          ))}
                        </select>
                        {netFormErrors.formMajorSection && (
                          <span className="error-text">{netFormErrors.formMajorSection}</span>
                        )}
                      </div>

                      {/* Section */}
                      <div className="form-group">
                        <label htmlFor="formSection" className="form-label">
                          Section <span className="required">*</span>
                        </label>
                        <select
                          id="formSection"
                          className={`form-input ${netFormErrors.formSection ? "field-error-border" : ""}`}
                          style={{ height: "42px", appearance: "auto" }}
                          value={formSection}
                          onChange={(e) => handleSectionChange(e.target.value)}
                          disabled={!formMajorSection}
                        >
                          <option value="">Select Section</option>
                          {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && 
                            Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections).map((sec) => (
                              <option key={sec} value={sec}>{sec}</option>
                            ))
                          }
                        </select>
                        {netFormErrors.formSection && (
                          <span className="error-text">{netFormErrors.formSection}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-group-row">
                      {/* Station/Location */}
                      <div className="form-group">
                        <label htmlFor="formStationLocation" className="form-label">
                          Station/Location <span className="required">*</span>
                        </label>
                        <select
                          id="formStationLocation"
                          className={`form-input ${netFormErrors.formStationLocation ? "field-error-border" : ""}`}
                          style={{ height: "42px", appearance: "auto" }}
                          value={formStationLocation}
                          onChange={(e) => handleStationLocationChange(e.target.value)}
                          disabled={!formMajorSection}
                        >
                          <option value="">Select Station/Location</option>
                          {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && (() => {
                            const sectionsObj = HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections;
                            if (formSection) {
                              return sectionsObj[formSection]?.map((stn) => (
                                <option key={stn} value={stn}>{stn}</option>
                              ));
                            } else {
                              return Object.values(sectionsObj).flat().map((stn) => (
                                <option key={stn} value={stn}>{stn}</option>
                              ));
                            }
                          })()}
                        </select>
                        {netFormErrors.formStationLocation && (
                          <span className="error-text">{netFormErrors.formStationLocation}</span>
                        )}
                      </div>

                      {/* Location/Station (Searchable Dropdown) */}
                      <div className="form-group">
                        <label className="form-label">
                          {selectedCircuit?.name === "Railnet / Internet" ? "Location/Station" : "Location"} <span className="required">*</span>
                        </label>
                        <div className="multiselect-container" ref={netLocRef}>
                          <button
                            type="button"
                            className={`multiselect-trigger ${netLocDropdownOpen ? "open" : ""}`}
                            onClick={() => setNetLocDropdownOpen(!netLocDropdownOpen)}
                          >
                            <span>{netLocation ? netLocation : selectedCircuit?.name === "Railnet / Internet" ? "Select Location/Station" : "Select Location"}</span>
                          </button>
                          {netLocDropdownOpen && (
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
                                  placeholder={selectedCircuit?.name === "Railnet / Internet" ? "Filter location/station..." : "Filter location..."}
                                  className="circuit-dropdown-search"
                                  value={netLocSearchQuery}
                                  onChange={(e) => setNetLocSearchQuery(e.target.value)}
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div style={{ maxHeight: "170px", overflowY: "auto" }}>
                                {filteredLocations.length > 0 ? (
                                  filteredLocations.map((loc) => (
                                    <div
                                      key={loc}
                                      className="dropdown-item"
                                      style={{
                                        padding: "8px 12px",
                                        fontSize: "13.5px",
                                        backgroundColor: netLocation === loc ? "#EFF6FF" : "transparent",
                                        color: netLocation === loc ? "var(--primary-color)" : "var(--text-color)"
                                      }}
                                      onClick={() => {
                                        setNetLocation(loc);
                                        setNetLocDropdownOpen(false);
                                        setNetLocSearchQuery("");
                                      }}
                                    >
                                      {loc}
                                    </div>
                                  ))
                                ) : (
                                  <div style={{ padding: "10px", fontSize: "12.5px", color: "#6B7280", textAlign: "center" }}>
                                    No locations found.
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {netFormErrors.netLocation && (
                          <span className="error-text">{netFormErrors.netLocation}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="form-group-row">
                  {/* ICMS Entry No./Docket No. */}
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

                  {/* Bandwidth */}
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
                  {/* Testing Time */}
                  <div className="form-group">
                    <label htmlFor="netTestingTime" className="form-label">
                      {selectedCircuit?.name === "Railnet / Internet" ? "Last Testing Time" : "Testing Time"} <span className="required">*</span>
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

                  {/* Nature of Fault */}
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

                {/* Custom Nature of Fault textbox */}
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

                {/* Audit Report & Attach File row (only for Railnet / Internet) */}
                {selectedCircuit?.name === "Railnet / Internet" && (
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
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = "#e5e7eb";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                          </svg>
                          Choose File
                        </button>
                        <span style={{ fontSize: "13px", color: netAttachment ? "#1e293b" : "#64748b", fontWeight: netAttachment ? "500" : "normal", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px" }}>
                          {netAttachment ? netAttachment.name : "No file attached"}
                        </span>
                        {netAttachment && (
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              padding: "4px"
                            }}
                            onClick={() => setNetAttachment(null)}
                            title="Remove file"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group-row">
                  {/* Download Link Speed */}
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

                  {/* Upload Link Speed */}
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
                  {/* Failure Date & Time */}
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

                  {/* Rectification Time (RT) */}
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
                  {/* Total Duration (Read Only) */}
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

                  {/* Reason of Failure */}
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

                {/* Other Custom Reason input */}
                {netSelectedReasons.includes("Other") && (
                  <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                    <label htmlFor="netCustomReason" className="form-label">
                      Other Reason <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="netCustomReason"
                      className={`form-input ${netFormErrors.netCustomReason ? "field-error-border" : ""}`}
                      placeholder="Enter custom reason manually"
                      value={netCustomReason}
                      onChange={(e) => setNetCustomReason(e.target.value)}
                    />
                    {netFormErrors.netCustomReason && (
                      <span className="error-text">{netFormErrors.netCustomReason}</span>
                    )}
                  </div>
                )}

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="netRemarks" className="form-label">Remarks</label>
                  <textarea
                    id="netRemarks"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Enter observations, testing results, troubleshooting details, corrective action taken, or additional remarks"
                    value={netRemarks}
                    onChange={(e) => setNetRemarks(e.target.value)}
                  />
                </div>

                {/* Save button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const nowStr = new Date().toISOString().slice(0, 16);
                      const formatDate = (dateStr: string) => {
                        const d = new Date(dateStr);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        const hour = String(d.getHours()).padStart(2, "0");
                        const minute = String(d.getMinutes()).padStart(2, "0");
                        return `${day}-${month}-${year} ${hour}:${minute}`;
                      };
                      const newNetRecord = {
                        id: Date.now(),
                        division: selectedDivision,
                        location: "Bilaspur HQ",
                        bandwidth: "100 Mbps",
                        testingTime: formatDate(nowStr),
                        dnSpeed: "100 Mbps",
                        upSpeed: "100 Mbps",
                        faultNature: "None",
                        auditReport: selectedCircuit?.name === "Railnet / Internet" ? "None" : undefined,
                        failureTime: formatDate(nowStr),
                        rectificationTime: formatDate(nowStr),
                        duration: "0 Hrs 0 Min",
                        reasons: "Link Failure",
                        remarks: "All link parameters healthy. Zero packet loss."
                      };
                      setSavedNetRecords(prev => [newNetRecord, ...prev]);
                      setNetLocation("");
                      setNetBandwidth("");
                      setNetTestingTime("");
                      setNetDnSpeed("");
                      setNetUpSpeed("");
                      setNetFaultNature("");
                      setNetCustomFaultNature("");
                      setNetAuditReport("");
                      setNetFailureTime("");
                      setNetRectificationTime("");
                      setNetSelectedReasons([]);
                      setNetCustomReason("");
                      setNetRemarks("");
                      moveToNextCircuit();
                    }}
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
          ) : selectedCircuit.name === "Rail Madad" ? (
            /* Rail Madad Monitoring & Case Entry Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Rail Madad Case Entry</h2>
                </div>
              </div>

              {/* Success Notification Alert */}
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

              {/* Rail Madad Case Entry Form */}
              <form className="fault-form" onSubmit={handleSaveMadadRecord}>
                <div className="form-group-row">
                  {/* Major Section */}
                  <div className="form-group">
                    <label htmlFor="formMajorSection" className="form-label">
                      Major Section <span className="required">*</span>
                    </label>
                    <select
                      id="formMajorSection"
                      className={`form-input ${madadFormErrors.formMajorSection ? "field-error-border" : ""}`}
                      style={{ height: "42px", appearance: "auto" }}
                      value={formMajorSection}
                      onChange={(e) => handleMajorSectionChange(e.target.value)}
                    >
                      <option value="">Select Major Section</option>
                      {selectedDivision && HIERARCHICAL_DATA[selectedDivision] && Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections).map((mSec) => (
                        <option key={mSec} value={mSec}>{mSec}</option>
                      ))}
                    </select>
                    {madadFormErrors.formMajorSection && (
                      <span className="error-text">{madadFormErrors.formMajorSection}</span>
                    )}
                  </div>

                  {/* Section */}
                  <div className="form-group">
                    <label htmlFor="formSection" className="form-label">
                      Section <span className="required">*</span>
                    </label>
                    <select
                      id="formSection"
                      className={`form-input ${madadFormErrors.formSection ? "field-error-border" : ""}`}
                      style={{ height: "42px", appearance: "auto" }}
                      value={formSection}
                      onChange={(e) => handleSectionChange(e.target.value)}
                      disabled={!formMajorSection}
                    >
                      <option value="">Select Section</option>
                      {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && 
                        Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections).map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))
                      }
                    </select>
                    {madadFormErrors.formSection && (
                      <span className="error-text">{madadFormErrors.formSection}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Station/Location */}
                  <div className="form-group">
                    <label htmlFor="formStationLocation" className="form-label">
                      Station/Location <span className="required">*</span>
                    </label>
                    <select
                      id="formStationLocation"
                      className={`form-input ${madadFormErrors.formStationLocation ? "field-error-border" : ""}`}
                      style={{ height: "42px", appearance: "auto" }}
                      value={formStationLocation}
                      onChange={(e) => handleStationLocationChange(e.target.value)}
                      disabled={!formMajorSection}
                    >
                      <option value="">Select Station/Location</option>
                      {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && (() => {
                        const sectionsObj = HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections;
                        if (formSection) {
                          return sectionsObj[formSection]?.map((stn) => (
                            <option key={stn} value={stn}>{stn}</option>
                          ));
                        } else {
                          return Object.values(sectionsObj).flat().map((stn) => (
                            <option key={stn} value={stn}>{stn}</option>
                          ));
                        }
                      })()}
                    </select>
                    {madadFormErrors.formStationLocation && (
                      <span className="error-text">{madadFormErrors.formStationLocation}</span>
                    )}
                  </div>

                  {/* ICMS Entry No./Docket No. */}
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
                </div>

                <div className="form-group-row">
                  {/* Case Date & Time */}
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

                  {/* Case Balance Till Last Date */}
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
                  {/* Case Received on Date */}
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

                  {/* Case complied On Date */}
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
                  {/* Net Balance Case On Date (Calculated, read-only) */}
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

                  {/* Description Of Case */}
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
                  {/* S&T Compliance Details */}
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

                  {/* S&T Compliance Date & Time */}
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
                  {/* Remarks */}
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

                  {/* Empty spacer to align Remarks nicely with 2-column layout */}
                  <div className="form-group"></div>
                </div>

                {/* Save button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const nowStr = new Date().toISOString().slice(0, 16);
                      const formatDate = (dateStr: string) => {
                        const d = new Date(dateStr);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        const hour = String(d.getHours()).padStart(2, "0");
                        const minute = String(d.getMinutes()).padStart(2, "0");
                        return `${day}-${month}-${year} ${hour}:${minute}`;
                      };
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
                      setSavedMadadRecords(prev => [newMadadRecord, ...prev]);
                      setMadadBalanceLast("");
                      setMadadReceived("");
                      setMadadComplied("");
                      setMadadDescription("");
                      setMadadCaseTime("");
                      setMadadComplianceDetails("");
                      setMadadComplianceTime("");
                      setMadadRemarks("");
                      moveToNextCircuit();
                    }}
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
          ) : selectedCircuit.name === "Railway Board Video Phones" ? (
            /* Railway Board Video Phone Test Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Railway Board Video Phone Test</h2>
                </div>
              </div>

              {/* Success Notification Alert */}
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

              {/* Video Phone Test Form */}
              <form className="fault-form" onSubmit={handleSaveVpRecord}>
                {/* Row 1: ICMS Entry No. & Major Section */}
                <div className="form-group-row">
                  {/* ICMS Entry No./Docket No. */}
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

                  {/* Major Section */}
                  <div className="form-group">
                    <label htmlFor="formMajorSection" className="form-label">
                      Major Section <span className="required">*</span>
                    </label>
                    <select
                      id="formMajorSection"
                      className={`form-input ${vpFormErrors.formMajorSection ? "field-error-border" : ""}`}
                      style={{ height: "42px", appearance: "auto" }}
                      value={formMajorSection}
                      onChange={(e) => handleMajorSectionChange(e.target.value)}
                    >
                      <option value="">Select Major Section</option>
                      {selectedDivision && HIERARCHICAL_DATA[selectedDivision] && Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections).map((mSec) => (
                        <option key={mSec} value={mSec}>{mSec}</option>
                      ))}
                    </select>
                    {vpFormErrors.formMajorSection && (
                      <span className="error-text">{vpFormErrors.formMajorSection}</span>
                    )}
                  </div>
                </div>

                {/* Row 2: Section & Station/Location */}
                <div className="form-group-row">
                  {/* Section */}
                  <div className="form-group">
                    <label htmlFor="formSection" className="form-label">
                      Section <span className="required">*</span>
                    </label>
                    <select
                      id="formSection"
                      className={`form-input ${vpFormErrors.formSection ? "field-error-border" : ""}`}
                      style={{ height: "42px", appearance: "auto" }}
                      value={formSection}
                      onChange={(e) => handleSectionChange(e.target.value)}
                      disabled={!formMajorSection}
                    >
                      <option value="">Select Section</option>
                      {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && 
                        Object.keys(HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections).map((sec) => (
                          <option key={sec} value={sec}>{sec}</option>
                        ))
                      }
                    </select>
                    {vpFormErrors.formSection && (
                      <span className="error-text">{vpFormErrors.formSection}</span>
                    )}
                  </div>

                  {/* Station/Location */}
                  <div className="form-group">
                    <label htmlFor="formStationLocation" className="form-label">
                      Station/Location <span className="required">*</span>
                    </label>
                    <select
                      id="formStationLocation"
                      className={`form-input ${vpFormErrors.formStationLocation ? "field-error-border" : ""}`}
                      style={{ height: "42px", appearance: "auto" }}
                      value={formStationLocation}
                      onChange={(e) => handleStationLocationChange(e.target.value)}
                      disabled={!formMajorSection}
                    >
                      <option value="">Select Station/Location</option>
                      {formMajorSection && selectedDivision && HIERARCHICAL_DATA[selectedDivision]?.majorSections[formMajorSection] && (() => {
                        const sectionsObj = HIERARCHICAL_DATA[selectedDivision].majorSections[formMajorSection].sections;
                        if (formSection) {
                          return sectionsObj[formSection]?.map((stn) => (
                            <option key={stn} value={stn}>{stn}</option>
                          ));
                        } else {
                          return Object.values(sectionsObj).flat().map((stn) => (
                            <option key={stn} value={stn}>{stn}</option>
                          ));
                        }
                      })()}
                    </select>
                    {vpFormErrors.formStationLocation && (
                      <span className="error-text">{vpFormErrors.formStationLocation}</span>
                    )}
                  </div>
                </div>

                {/* Row 3: PHOD Chamber & Testing Time */}
                <div className="form-group-row">
                  {/* Video Phone in Chamber of PHOD */}
                  <div className="form-group">
                    <label htmlFor="vpPhodChamber" className="form-label">
                      Video Phone in Chamber of PHOD <span className="required">*</span>
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
                      {["PCSTE", "PCE", "PCEE", "PCCM", "PCME", "PCOM", "PCPO", "PCMM", "PCMD", "PFA", "DCCM", "PCSO", "PCSC", "Other"].map((chamber) => (
                        <option key={chamber} value={chamber}>{chamber}</option>
                      ))}
                    </select>
                    {vpFormErrors.vpPhodChamber && (
                      <span className="error-text">{vpFormErrors.vpPhodChamber}</span>
                    )}
                  </div>

                  {/* Tested with RB Date & Time */}
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
                </div>

                {/* Manual Custom PHOD Chamber name (shown when PHOD Chamber is Other) */}
                {vpPhodChamber === "Other" && (
                  <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                    <label htmlFor="vpCustomPhod" className="form-label">
                      Custom Chamber / Region Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="vpCustomPhod"
                      className={`form-input ${vpFormErrors.vpCustomPhod ? "field-error-border" : ""}`}
                      placeholder="Enter PHOD chamber or other region manually"
                      value={vpCustomPhod}
                      onChange={(e) => setVpCustomPhod(e.target.value)}
                    />
                    {vpFormErrors.vpCustomPhod && (
                      <span className="error-text">{vpFormErrors.vpCustomPhod}</span>
                    )}
                  </div>
                )}

                {/* Row 4: Video Clarity & Audio Clarity */}
                <div className="form-group-row">
                  {/* Video Clarity */}
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
                      <option value="">Select Video Quality</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Satisfactory">Satisfactory</option>
                      <option value="Poor">Poor</option>
                      <option value="No Video">No Video</option>
                    </select>
                    {vpFormErrors.vpVideoClarity && (
                      <span className="error-text">{vpFormErrors.vpVideoClarity}</span>
                    )}
                  </div>

                  {/* Audio Clarity */}
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
                      <option value="">Select Audio Quality</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Satisfactory">Satisfactory</option>
                      <option value="Poor">Poor</option>
                      <option value="No Audio">No Audio</option>
                    </select>
                    {vpFormErrors.vpAudioClarity && (
                      <span className="error-text">{vpFormErrors.vpAudioClarity}</span>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="vpRemarks" className="form-label">Remarks</label>
                  <textarea
                    id="vpRemarks"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Enter additional remarks or observations"
                    value={vpRemarks}
                    onChange={(e) => setVpRemarks(e.target.value)}
                  />
                </div>

                {/* Save button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const nowStr = new Date().toISOString().slice(0, 16);
                      const formatDate = (dateStr: string) => {
                        const d = new Date(dateStr);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        const hour = String(d.getHours()).padStart(2, "0");
                        const minute = String(d.getMinutes()).padStart(2, "0");
                        return `${day}-${month}-${year} ${hour}:${minute}`;
                      };
                      const newVpRecord = {
                        id: Date.now(),
                        division: selectedDivision,
                        phodChamber: "PCSTE",
                        testingTime: formatDate(nowStr),
                        videoClarity: "Excellent",
                        audioClarity: "Excellent",
                        remarks: "SIP trunk status checked. Audio and video quality tested normal."
                      };
                      setSavedVpRecords(prev => [newVpRecord, ...prev]);
                      setVpPhodChamber("");
                      setVpCustomPhod("");
                      setVpTestingTime("");
                      setVpVideoClarity("");
                      setVpAudioClarity("");
                      setVpRemarks("");
                      moveToNextCircuit();
                    }}
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
          ) : selectedCircuit.name === "Cable Cut (OFC & Quad)" ? (
            /* Cable Cut (OFC & Quad) Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Cable Cut (OFC & Quad)</h2>
                </div>
              </div>

              {/* Success Notification Alert */}
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

              {/* Cable Cut Entry Form */}
              <form className="fault-form" onSubmit={handleSaveCcRecord}>
                {renderHierarchicalFields(ccFormErrors)}
                <div className="form-group-row">
                  {/* ICMS Entry No./Docket No. */}
                  <div className="form-group">
                    <label htmlFor="ccIcmsEntryNo" className="form-label">
                      ICMS Entry No./Docket No. <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="ccIcmsEntryNo"
                      className={`form-input ${ccFormErrors.icmsEntryNo ? "field-error-border" : ""}`}
                      placeholder="Enter ICMS entry number/docket number"
                      value={icmsEntryNo}
                      onChange={(e) => setIcmsEntryNo(e.target.value)}
                    />
                    {ccFormErrors.icmsEntryNo && (
                      <span className="error-text">{ccFormErrors.icmsEntryNo}</span>
                    )}
                  </div>
                  {/* Placeholder space to maintain clean alignment */}
                  <div className="form-group"></div>
                </div>

                <div className="form-group-row">
                  {/* Section name */}
                  <div className="form-group">
                    <label htmlFor="ccSectionName" className="form-label">
                      Section Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="ccSectionName"
                      className={`form-input ${ccFormErrors.ccSectionName ? "field-error-border" : ""}`}
                      placeholder="Enter section name (e.g. BSP-CPH Section)"
                      value={ccSectionName}
                      onChange={(e) => setCcSectionName(e.target.value)}
                    />
                    {ccFormErrors.ccSectionName && (
                      <span className="error-text">{ccFormErrors.ccSectionName}</span>
                    )}
                  </div>

                  {/* Km.No */}
                  <div className="form-group">
                    <label htmlFor="ccKmNo" className="form-label">
                      Km.No <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="ccKmNo"
                      className={`form-input ${ccFormErrors.ccKmNo ? "field-error-border" : ""}`}
                      placeholder="Enter Kilometer number (e.g. 712/14)"
                      value={ccKmNo}
                      onChange={(e) => setCcKmNo(e.target.value)}
                    />
                    {ccFormErrors.ccKmNo && (
                      <span className="error-text">{ccFormErrors.ccKmNo}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Cable Type - Multi select */}
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
                          {[
                            "OFC (24 Core)",
                            "OFC (6 Core)",
                            "6 Quad Cable",
                            "4 Quad Cable",
                            "Signaling Cable",
                            "Power Cable",
                            "Other"
                          ].map((option) => (
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

                  {/* Cable Cut by Whom - Multi select */}
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
                            ? "Select Excavator(s)..."
                            : ccCutByWhom.join(", ")}
                        </span>
                      </button>
                      {ccCutByWhomOpen && (
                        <div className="multiselect-menu">
                          {[
                            "Railway Contractor",
                            "NHAI Contractor",
                            "Piped Water Supplier",
                            "Gas Pipeline Excavator",
                            "Telecom Operator (Private)",
                            "Electricity Board (State)",
                            "Villagers / Digging",
                            "Theft / Sabotage",
                            "Other"
                          ].map((option) => (
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
                </div>

                {/* Custom Cable Type manual input */}
                {ccCableTypes.includes("Other") && (
                  <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                    <label htmlFor="ccCustomCableType" className="form-label">
                      Other Cable Type <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="ccCustomCableType"
                      className={`form-input ${ccFormErrors.ccCustomCableType ? "field-error-border" : ""}`}
                      placeholder="Enter custom cable type description"
                      value={ccCustomCableType}
                      onChange={(e) => setCcCustomCableType(e.target.value)}
                    />
                    {ccFormErrors.ccCustomCableType && (
                      <span className="error-text">{ccFormErrors.ccCustomCableType}</span>
                    )}
                  </div>
                )}

                {/* Custom Cable Cut By manual input */}
                {ccCutByWhom.includes("Other") && (
                  <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                    <label htmlFor="ccCustomCutBy" className="form-label">
                      Other Agency / Cut by Whom <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="ccCustomCutBy"
                      className={`form-input ${ccFormErrors.ccCustomCutBy ? "field-error-border" : ""}`}
                      placeholder="Enter agency name manually"
                      value={ccCustomCutBy}
                      onChange={(e) => setCcCustomCutBy(e.target.value)}
                    />
                    {ccFormErrors.ccCustomCutBy && (
                      <span className="error-text">{ccFormErrors.ccCustomCutBy}</span>
                    )}
                  </div>
                )}

                <div className="form-group-row">
                  {/* Failure Date & Time */}
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

                  {/* Rectification Time (RT) */}
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
                  {/* Total duration (calculated, read-only) */}
                  <div className="form-group">
                    <label htmlFor="ccDuration" className="form-label">
                      Duration of Failure
                    </label>
                    <input
                      type="text"
                      id="ccDuration"
                      className="form-input"
                      value={ccTotalDuration}
                      readOnly
                      placeholder="XX Hrs XX Min"
                    />
                  </div>

                  {/* Reason of failure */}
                  <div className="form-group">
                    <label htmlFor="ccReason" className="form-label">
                      Reason of Failure <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="ccReason"
                      className={`form-input ${ccFormErrors.ccReasonOfFailure ? "field-error-border" : ""}`}
                      placeholder="Enter reason of cable cut (e.g. JCB digging)"
                      value={ccReasonOfFailure}
                      onChange={(e) => setCcReasonOfFailure(e.target.value)}
                    />
                    {ccFormErrors.ccReasonOfFailure && (
                      <span className="error-text">{ccFormErrors.ccReasonOfFailure}</span>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="ccRemarks" className="form-label">Remarks</label>
                  <textarea
                    id="ccRemarks"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Enter observations, joint type, or restoration remarks"
                    value={ccRemarks}
                    onChange={(e) => setCcRemarks(e.target.value)}
                  />
                </div>

                {/* Save button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const nowStr = new Date().toISOString().slice(0, 16);
                      const formatDate = (dateStr: string) => {
                        const d = new Date(dateStr);
                        const day = String(d.getDate()).padStart(2, "0");
                        const month = String(d.getMonth() + 1).padStart(2, "0");
                        const year = d.getFullYear();
                        const hour = String(d.getHours()).padStart(2, "0");
                        const minute = String(d.getMinutes()).padStart(2, "0");
                        return `${day}-${month}-${year} ${hour}:${minute}`;
                      };
                      const newCcRecord = {
                        id: Date.now(),
                        division: selectedDivision,
                        sectionName: "All Sections OK",
                        kmNo: "None",
                        cableTypes: "OFC (24 Core)",
                        cutByWhom: "Railway Contractor",
                        failureTime: formatDate(nowStr),
                        rectificationTime: formatDate(nowStr),
                        duration: "0 Hrs 0 Min",
                        reasonOfFailure: "No cable cuts reported.",
                        remarks: "All cable infrastructure normal."
                      };
                      setSavedCcRecords(prev => [newCcRecord, ...prev]);
                      setCcSectionName("");
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
                    }}
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
          ) : selectedCircuit.name === "Walkie-Talkie Testing" ? (
            /* Walkie-Talkie Testing Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Walkie-Talkie Testing</h2>
                </div>
              </div>

              {/* Success Notification Alert */}
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
                  <span>✅ Walkie-Talkie Testing Record Saved Successfully</span>
                </div>
              )}

              {/* Walkie-Talkie Testing Form */}
              <form className="fault-form" onSubmit={handleSaveWtRecord}>
                {/* Row 1: Station / Lobby & Make / Model */}
                <div className="form-group-row">
                  {/* Station / Lobby */}
                  <div className="form-group">
                    <label htmlFor="wtStationLobby" className="form-label">
                      Station / Lobby <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtStationLobby"
                      className={`form-input ${wtFormErrors.wtStationLobby ? "field-error-border" : ""}`}
                      placeholder="Enter Station or Lobby name (e.g. BSP Lobby)"
                      value={wtStationLobby}
                      onChange={(e) => setWtStationLobby(e.target.value)}
                    />
                    {wtFormErrors.wtStationLobby && (
                      <span className="error-text">{wtFormErrors.wtStationLobby}</span>
                    )}
                  </div>

                  {/* Make / Model */}
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
                      {["Motorola", "Sanchar", "Alnico", "RD Solution", "Convey", "Other"].map((make) => (
                        <option key={make} value={make}>{make}</option>
                      ))}
                    </select>
                    {wtFormErrors.wtMakeModel && (
                      <span className="error-text">{wtFormErrors.wtMakeModel}</span>
                    )}
                  </div>
                </div>

                {/* Custom Make/Model Input (Shown when 'Other' is selected) */}
                {wtMakeModel === "Other" && (
                  <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                    <label htmlFor="wtCustomMakeModel" className="form-label">
                      Other Make / Model Details <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtCustomMakeModel"
                      className={`form-input ${wtFormErrors.wtCustomMakeModel ? "field-error-border" : ""}`}
                      placeholder="Specify custom manufacturer/model name manually"
                      value={wtCustomMakeModel}
                      onChange={(e) => setWtCustomMakeModel(e.target.value)}
                    />
                    {wtFormErrors.wtCustomMakeModel && (
                      <span className="error-text">{wtFormErrors.wtCustomMakeModel}</span>
                    )}
                  </div>
                )}

                {/* Row 2: Walkie Talkie Serial No. & Frequency Configuration -MHZ */}
                <div className="form-group-row">
                  {/* Walkie Talkie Serial No. */}
                  <div className="form-group">
                    <label htmlFor="wtSerialNo" className="form-label">
                      Walkie Talkie Serial No. <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtSerialNo"
                      className={`form-input ${wtFormErrors.wtSerialNo ? "field-error-border" : ""}`}
                      placeholder="Enter Walkie Talkie serial number"
                      value={wtSerialNo}
                      onChange={(e) => setWtSerialNo(e.target.value)}
                    />
                    {wtFormErrors.wtSerialNo && (
                      <span className="error-text">{wtFormErrors.wtSerialNo}</span>
                    )}
                  </div>

                  {/* Frequency Configuration -MHZ */}
                  <div className="form-group">
                    <label htmlFor="wtFrequency" className="form-label">
                      Frequency Configuration -MHZ <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtFrequency"
                      className={`form-input ${wtFormErrors.wtFrequency ? "field-error-border" : ""}`}
                      placeholder="Enter frequency (e.g. 150.5 MHz)"
                      value={wtFrequency}
                      onChange={(e) => setWtFrequency(e.target.value)}
                    />
                    {wtFormErrors.wtFrequency && (
                      <span className="error-text">{wtFormErrors.wtFrequency}</span>
                    )}
                  </div>
                </div>

                {/* Row 3: Output TX Power & Battery Voltage */}
                <div className="form-group-row">
                  {/* Output TX Power */}
                  <div className="form-group">
                    <label htmlFor="wtOutputPower" className="form-label">
                      Output TX Power <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtOutputPower"
                      className={`form-input ${wtFormErrors.wtOutputPower ? "field-error-border" : ""}`}
                      placeholder="Enter output power (e.g. 5W)"
                      value={wtOutputPower}
                      onChange={(e) => setWtOutputPower(e.target.value)}
                    />
                    {wtFormErrors.wtOutputPower && (
                      <span className="error-text">{wtFormErrors.wtOutputPower}</span>
                    )}
                  </div>

                  {/* Battery Voltage */}
                  <div className="form-group">
                    <label htmlFor="wtBatteryVoltage" className="form-label">
                      Battery Voltage <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtBatteryVoltage"
                      className={`form-input ${wtFormErrors.wtBatteryVoltage ? "field-error-border" : ""}`}
                      placeholder="Enter battery voltage (e.g. 7.4V)"
                      value={wtBatteryVoltage}
                      onChange={(e) => setWtBatteryVoltage(e.target.value)}
                    />
                    {wtFormErrors.wtBatteryVoltage && (
                      <span className="error-text">{wtFormErrors.wtBatteryVoltage}</span>
                    )}
                  </div>
                </div>

                {/* Row 4: Battery Current & Antenna */}
                <div className="form-group-row">
                  {/* Battery Current */}
                  <div className="form-group">
                    <label htmlFor="wtBatteryCurrent" className="form-label">
                      Battery Current <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtBatteryCurrent"
                      className={`form-input ${wtFormErrors.wtBatteryCurrent ? "field-error-border" : ""}`}
                      placeholder="Enter battery current (e.g. 1.5A)"
                      value={wtBatteryCurrent}
                      onChange={(e) => setWtBatteryCurrent(e.target.value)}
                    />
                    {wtFormErrors.wtBatteryCurrent && (
                      <span className="error-text">{wtFormErrors.wtBatteryCurrent}</span>
                    )}
                  </div>

                  {/* Antenna */}
                  <div className="form-group">
                    <label htmlFor="wtAntenna" className="form-label">
                      Antenna <span className="required">*</span>
                    </label>
                    <select
                      id="wtAntenna"
                      className={`form-input ${wtFormErrors.wtAntenna ? "field-error-border" : ""}`}
                      style={{ height: "42px", appearance: "auto" }}
                      value={wtAntenna}
                      onChange={(e) => setWtAntenna(e.target.value)}
                    >
                      <option value="">Select Antenna status</option>
                      <option value="OK">OK</option>
                      <option value="Broken">Broken</option>
                    </select>
                    {wtFormErrors.wtAntenna && (
                      <span className="error-text">{wtFormErrors.wtAntenna}</span>
                    )}
                  </div>
                </div>

                {/* Row 5: Date of Testing & Total walkie-talkies to be tested */}
                <div className="form-group-row">
                  {/* Date of testing */}
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

                  {/* Total to be tested */}
                  <div className="form-group">
                    <label htmlFor="wtTotalToBeTested" className="form-label">
                      Total walkie-talkies to be tested <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtTotalToBeTested"
                      min="0"
                      className={`form-input ${wtFormErrors.wtTotalToBeTested ? "field-error-border" : ""}`}
                      placeholder="Total count to be tested"
                      value={wtTotalToBeTested}
                      onChange={(e) => setWtTotalToBeTested(e.target.value)}
                    />
                    {wtFormErrors.wtTotalToBeTested && (
                      <span className="error-text">{wtFormErrors.wtTotalToBeTested}</span>
                    )}
                  </div>
                </div>

                {/* Row 6: Total walkie-talkies tested & Balance walkie-talkies to be tested (Calculated) */}
                <div className="form-group-row">
                  {/* Total tested */}
                  <div className="form-group">
                    <label htmlFor="wtTotalTested" className="form-label">
                      Total walkie-talkies tested <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtTotalTested"
                      min="0"
                      className={`form-input ${wtFormErrors.wtTotalTested ? "field-error-border" : ""}`}
                      placeholder="Total count tested"
                      value={wtTotalTested}
                      onChange={(e) => setWtTotalTested(e.target.value)}
                    />
                    {wtFormErrors.wtTotalTested && (
                      <span className="error-text">{wtFormErrors.wtTotalTested}</span>
                    )}
                  </div>

                  {/* Balance number of walkie-talkies to be tested */}
                  <div className="form-group">
                    <label htmlFor="wtBalanceToTest" className="form-label">
                      Balance walkie-talkies to be tested (Calculated)
                    </label>
                    <input
                      type="text"
                      id="wtBalanceToTest"
                      className="form-input"
                      value={wtBalanceToTest}
                      readOnly
                      placeholder="0"
                      style={{ backgroundColor: "#F3F4F6" }}
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="wtRemarks" className="form-label">Remarks</label>
                  <textarea
                    id="wtRemarks"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Enter any additional details, issues faced, or test observations"
                    value={wtRemarks}
                    onChange={(e) => setWtRemarks(e.target.value)}
                  />
                </div>

                {/* Submit button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      const newWtRecord = {
                        id: Date.now(),
                        division: selectedDivision,
                        stationLobby: "All Stations",
                        totalToBeTested: "50",
                        testingDate: todayStr,
                        totalTested: "50",
                        balanceToTest: "0",
                        remarks: "All walkie-talkies tested and found OK.",
                        serialNo: "WT-ALL-OK",
                        frequency: "150.5",
                        outputPower: "5W",
                        batteryVoltage: "7.4V",
                        batteryCurrent: "1.5A",
                        antenna: "OK",
                        makeModel: "Motorola"
                      };
                      setSavedWtRecords(prev => [newWtRecord, ...prev]);
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
                    }}
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
          ) : selectedCircuit.name === "Walkie-Talkie Repairing" ? (
            /* Walkie-Talkie Repairing Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Walkie-Talkie Repairing</h2>
                </div>
              </div>

              {/* Success Notification Alert */}
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
                  <span>✅ Walkie-Talkie Repairing Record Saved Successfully</span>
                </div>
              )}

              {/* Walkie-Talkie Repairing Form */}
              <form className="fault-form" onSubmit={handleSaveWtrRecord}>
                {renderHierarchicalFields(wtrFormErrors)}
                <div className="form-group-row">
                  {/* ICMS Entry No./Docket No. */}
                  <div className="form-group">
                    <label htmlFor="wtrIcmsEntryNo" className="form-label">
                      ICMS Entry No./Docket No. <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtrIcmsEntryNo"
                      className={`form-input ${wtrFormErrors.icmsEntryNo ? "field-error-border" : ""}`}
                      placeholder="Enter ICMS entry number/docket number"
                      value={icmsEntryNo}
                      onChange={(e) => setIcmsEntryNo(e.target.value)}
                    />
                    {wtrFormErrors.icmsEntryNo && (
                      <span className="error-text">{wtrFormErrors.icmsEntryNo}</span>
                    )}
                  </div>
                  {/* Placeholder space to maintain clean alignment */}
                  <div className="form-group"></div>
                </div>

                <div className="form-group-row">
                  {/* Date */}
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

                  {/* Opening Balance of Defective Sets */}
                  <div className="form-group">
                    <label htmlFor="wtrOpeningBalance" className="form-label">
                      Opening Balance of Defective Sets <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtrOpeningBalance"
                      min="0"
                      className={`form-input ${wtrFormErrors.wtrOpeningBalance ? "field-error-border" : ""}`}
                      placeholder="Enter opening balance"
                      value={wtrOpeningBalance}
                      onChange={(e) => setWtrOpeningBalance(e.target.value)}
                    />
                    {wtrFormErrors.wtrOpeningBalance && (
                      <span className="error-text">{wtrFormErrors.wtrOpeningBalance}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Defective Sets Received from User Department */}
                  <div className="form-group">
                    <label htmlFor="wtrReceivedFromUser" className="form-label">
                      Defective Sets Received from User Dept <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtrReceivedFromUser"
                      min="0"
                      className={`form-input ${wtrFormErrors.wtrReceivedFromUser ? "field-error-border" : ""}`}
                      placeholder="Received from user department"
                      value={wtrReceivedFromUser}
                      onChange={(e) => setWtrReceivedFromUser(e.target.value)}
                    />
                    {wtrFormErrors.wtrReceivedFromUser && (
                      <span className="error-text">{wtrFormErrors.wtrReceivedFromUser}</span>
                    )}
                  </div>

                  {/* Sets Sent to Firm for Repair */}
                  <div className="form-group">
                    <label htmlFor="wtrSentToFirm" className="form-label">
                      Sets Sent to Firm for Repair <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtrSentToFirm"
                      min="0"
                      className={`form-input ${wtrFormErrors.wtrSentToFirm ? "field-error-border" : ""}`}
                      placeholder="Sent to firm for repair"
                      value={wtrSentToFirm}
                      onChange={(e) => setWtrSentToFirm(e.target.value)}
                    />
                    {wtrFormErrors.wtrSentToFirm && (
                      <span className="error-text">{wtrFormErrors.wtrSentToFirm}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Repaired Sets Received from Firm */}
                  <div className="form-group">
                    <label htmlFor="wtrRepairedFromFirm" className="form-label">
                      Repaired Sets Received from Firm <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtrRepairedFromFirm"
                      min="0"
                      className={`form-input ${wtrFormErrors.wtrRepairedFromFirm ? "field-error-border" : ""}`}
                      placeholder="Repaired sets received from firm"
                      value={wtrRepairedFromFirm}
                      onChange={(e) => setWtrRepairedFromFirm(e.target.value)}
                    />
                    {wtrFormErrors.wtrRepairedFromFirm && (
                      <span className="error-text">{wtrFormErrors.wtrRepairedFromFirm}</span>
                    )}
                  </div>

                  {/* Sets Returned to User Department */}
                  <div className="form-group">
                    <label htmlFor="wtrReturnedToUser" className="form-label">
                      Sets Returned to User Department <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtrReturnedToUser"
                      min="0"
                      className={`form-input ${wtrFormErrors.wtrReturnedToUser ? "field-error-border" : ""}`}
                      placeholder="Returned to user department"
                      value={wtrReturnedToUser}
                      onChange={(e) => setWtrReturnedToUser(e.target.value)}
                    />
                    {wtrFormErrors.wtrReturnedToUser && (
                      <span className="error-text">{wtrFormErrors.wtrReturnedToUser}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Pending Repair Sets (Auto calculated, read-only) */}
                  <div className="form-group">
                    <label htmlFor="wtrPendingRepair" className="form-label">
                      Pending Repair Sets (Calculated)
                    </label>
                    <input
                      type="text"
                      id="wtrPendingRepair"
                      className="form-input"
                      value={wtrPendingRepair}
                      readOnly
                      placeholder="0"
                      style={{ backgroundColor: "#F3F4F6" }}
                    />
                  </div>

                  {/* Sets Proposed for Condemnation */}
                  <div className="form-group">
                    <label htmlFor="wtrProposedCondemnation" className="form-label">
                      Sets Proposed for Condemnation <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtrProposedCondemnation"
                      min="0"
                      className={`form-input ${wtrFormErrors.wtrProposedCondemnation ? "field-error-border" : ""}`}
                      placeholder="Proposed for condemnation"
                      value={wtrProposedCondemnation}
                      onChange={(e) => setWtrProposedCondemnation(e.target.value)}
                    />
                    {wtrFormErrors.wtrProposedCondemnation && (
                      <span className="error-text">{wtrFormErrors.wtrProposedCondemnation}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Sets Condemned */}
                  <div className="form-group">
                    <label htmlFor="wtrCondemned" className="form-label">
                      Sets Condemned <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtrCondemned"
                      min="0"
                      className={`form-input ${wtrFormErrors.wtrCondemned ? "field-error-border" : ""}`}
                      placeholder="Sets condemned"
                      value={wtrCondemned}
                      onChange={(e) => setWtrCondemned(e.target.value)}
                    />
                    {wtrFormErrors.wtrCondemned && (
                      <span className="error-text">{wtrFormErrors.wtrCondemned}</span>
                    )}
                  </div>

                  {/* Total Sets Condemned This Year */}
                  <div className="form-group">
                    <label htmlFor="wtrTotalCondemnedYear" className="form-label">
                      Total Sets Condemned This Year <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="wtrTotalCondemnedYear"
                      min="0"
                      className={`form-input ${wtrFormErrors.wtrTotalCondemnedYear ? "field-error-border" : ""}`}
                      placeholder="Total condemned this year"
                      value={wtrTotalCondemnedYear}
                      onChange={(e) => setWtrTotalCondemnedYear(e.target.value)}
                    />
                    {wtrFormErrors.wtrTotalCondemnedYear && (
                      <span className="error-text">{wtrFormErrors.wtrTotalCondemnedYear}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Fault Type - Multi select dropdown */}
                  <div className="form-group">
                    <label className="form-label">
                      Fault Type <span className="required">*</span>
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
                          {[
                            "Battery Fault",
                            "Antenna Fault",
                            "Speaker Fault",
                            "Microphone Fault",
                            "PTT Switch Fault",
                            "Charging Fault",
                            "Display Fault",
                            "Software Fault",
                            "Physical Damage",
                            "Other"
                          ].map((option) => (
                            <label key={option} className="multiselect-item">
                              <input
                                type="checkbox"
                                checked={wtrFaultTypes.includes(option)}
                                onChange={() => {
                                  if (wtrFaultTypes.includes(option)) {
                                    setWtrFaultTypes(wtrFaultTypes.filter((c) => c !== option));
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

                  {/* Repair Status */}
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
                      <option value="">Select Status</option>
                      {["Pending", "Sent for Repair", "Under Repair", "Repaired", "Returned to User", "Condemned"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    {wtrFormErrors.wtrRepairStatus && (
                      <span className="error-text">{wtrFormErrors.wtrRepairStatus}</span>
                    )}
                  </div>
                </div>

                {/* Conditional Text input for Other Fault description */}
                {wtrFaultTypes.includes("Other") && (
                  <div className="form-group full-width" style={{ animation: "fadeIn 0.15s ease-out" }}>
                    <label htmlFor="wtrCustomFault" className="form-label">
                      Other Fault Description <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="wtrCustomFault"
                      className={`form-input ${wtrFormErrors.wtrCustomFault ? "field-error-border" : ""}`}
                      placeholder="Specify other fault description manually"
                      value={wtrCustomFault}
                      onChange={(e) => setWtrCustomFault(e.target.value)}
                    />
                    {wtrFormErrors.wtrCustomFault && (
                      <span className="error-text">{wtrFormErrors.wtrCustomFault}</span>
                    )}
                  </div>
                )}

                {/* Action Taken */}
                <div className="form-group full-width">
                  <label htmlFor="wtrActionTaken" className="form-label">Action Taken</label>
                  <textarea
                    id="wtrActionTaken"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Describe action taken to repair defective sets"
                    value={wtrActionTaken}
                    onChange={(e) => setWtrActionTaken(e.target.value)}
                  />
                </div>

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="wtrRemarks" className="form-label">Remarks</label>
                  <textarea
                    id="wtrRemarks"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Enter any additional observations or comments"
                    value={wtrRemarks}
                    onChange={(e) => setWtrRemarks(e.target.value)}
                  />
                </div>

                {/* Save button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const todayStr = new Date().toISOString().slice(0, 10);
                      const newWtrRecord = {
                        id: Date.now(),
                        division: selectedDivision,
                        date: todayStr,
                        openingBalance: "0",
                        receivedFromUser: "0",
                        sentToFirm: "0",
                        repairedFromFirm: "0",
                        returnedToUser: "0",
                        faultTypes: "Battery Fault",
                        repairStatus: "Returned to User",
                        proposedCondemnation: "0",
                        condemned: "0",
                        totalCondemnedYear: "0",
                        actionTaken: "No pending repairs. All defective sets restored.",
                        pendingRepair: "0",
                        remarks: "All OK."
                      };
                      setSavedWtrRecords(prev => [newWtrRecord, ...prev]);
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
                    }}
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
          ) : selectedCircuit.name === "Low Insulation" ? (
            /* Low Insulation Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Low Insulation</h2>
                </div>
              </div>

              {/* Success Notification Alert */}
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

              {/* Low Insulation Form */}
              <form className="fault-form" onSubmit={handleSaveLiRecord}>
                {renderHierarchicalFields(liFormErrors)}
                <div className="form-group-row">
                  {/* ICMS Entry No./Docket No. */}
                  <div className="form-group">
                    <label htmlFor="liIcmsEntryNo" className="form-label">
                      ICMS Entry No./Docket No. <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="liIcmsEntryNo"
                      className={`form-input ${liFormErrors.icmsEntryNo ? "field-error-border" : ""}`}
                      placeholder="Enter ICMS entry number/docket number"
                      value={icmsEntryNo}
                      onChange={(e) => setIcmsEntryNo(e.target.value)}
                    />
                    {liFormErrors.icmsEntryNo && (
                      <span className="error-text">{liFormErrors.icmsEntryNo}</span>
                    )}
                  </div>
                  {/* Placeholder space to maintain clean alignment */}
                  <div className="form-group"></div>
                </div>

                <div className="form-group-row">
                  {/* Section name */}
                  <div className="form-group">
                    <label htmlFor="liSectionName" className="form-label">
                      Section Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="liSectionName"
                      className={`form-input ${liFormErrors.liSectionName ? "field-error-border" : ""}`}
                      placeholder="Enter section name (e.g. CPH-RIG Section)"
                      value={liSectionName}
                      onChange={(e) => setLiSectionName(e.target.value)}
                    />
                    {liFormErrors.liSectionName && (
                      <span className="error-text">{liFormErrors.liSectionName}</span>
                    )}
                  </div>

                  {/* Km.No */}
                  <div className="form-group">
                    <label htmlFor="liKmNo" className="form-label">
                      Km.No <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="liKmNo"
                      className={`form-input ${liFormErrors.liKmNo ? "field-error-border" : ""}`}
                      placeholder="Enter Kilometer number (e.g. 732/18)"
                      value={liKmNo}
                      onChange={(e) => setLiKmNo(e.target.value)}
                    />
                    {liFormErrors.liKmNo && (
                      <span className="error-text">{liFormErrors.liKmNo}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Total no. of insulation Fault */}
                  <div className="form-group">
                    <label htmlFor="liTotalFaults" className="form-label">
                      Total no. of Insulation Faults <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="liTotalFaults"
                      min="0"
                      className={`form-input ${liFormErrors.liTotalFaults ? "field-error-border" : ""}`}
                      placeholder="Total count of insulation faults"
                      value={liTotalFaults}
                      onChange={(e) => setLiTotalFaults(e.target.value)}
                    />
                    {liFormErrors.liTotalFaults && (
                      <span className="error-text">{liFormErrors.liTotalFaults}</span>
                    )}
                  </div>

                  {/* Fault Date & Time */}
                  <div className="form-group">
                    <label htmlFor="liFaultTime" className="form-label">
                      Fault Date & Time <span className="required">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      id="liFaultTime"
                      className={`form-input ${liFormErrors.liFaultTime ? "field-error-border" : ""}`}
                      value={liFaultTime}
                      onChange={(e) => setLiFaultTime(e.target.value)}
                    />
                    {liFormErrors.liFaultTime && (
                      <span className="error-text">{liFormErrors.liFaultTime}</span>
                    )}
                  </div>
                </div>

                <div className="form-group-row">
                  {/* Low Insulation Rectified */}
                  <div className="form-group">
                    <label htmlFor="liRectified" className="form-label">
                      Low Insulation Rectified <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      id="liRectified"
                      min="0"
                      className={`form-input ${liFormErrors.liRectified ? "field-error-border" : ""}`}
                      placeholder="Rectified faults count"
                      value={liRectified}
                      onChange={(e) => setLiRectified(e.target.value)}
                    />
                    {liFormErrors.liRectified && (
                      <span className="error-text">{liFormErrors.liRectified}</span>
                    )}
                  </div>

                  {/* Low Insulation Rectified Date & Time */}
                  <div className="form-group">
                    <label htmlFor="liRectifiedTime" className="form-label">
                      Low Insulation Rectified Date & Time
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
                  {/* Balance low insulation fault to be rectified */}
                  <div className="form-group">
                    <label htmlFor="liBalanceFaults" className="form-label">
                      Balance low insulation faults to be rectified (Calculated)
                    </label>
                    <input
                      type="text"
                      id="liBalanceFaults"
                      className="form-input"
                      value={liBalanceFaults}
                      readOnly
                      placeholder="0"
                      style={{ backgroundColor: "#F3F4F6" }}
                    />
                  </div>

                  {/* Target Date of Completion (TDC) */}
                  <div className="form-group">
                    <label htmlFor="liTdc" className="form-label">
                      Target Date of Completion (TDC) <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="liTdc"
                      className={`form-input ${liFormErrors.liTdc ? "field-error-border" : ""}`}
                      value={liTdc}
                      onChange={(e) => setLiTdc(e.target.value)}
                    />
                    {liFormErrors.liTdc && (
                      <span className="error-text">{liFormErrors.liTdc}</span>
                    )}
                  </div>
                </div>

                {/* Action Plan */}
                <div className="form-group full-width">
                  <label htmlFor="liActionPlan" className="form-label">
                    Action Plan to Rectify Low Insulation <span className="required">*</span>
                  </label>
                  <textarea
                    id="liActionPlan"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Enter action plan (e.g. cable meggering, conductor pair shifting, joint card replacements)"
                    value={liActionPlan}
                    onChange={(e) => setLiActionPlan(e.target.value)}
                  />
                  {liFormErrors.liActionPlan && (
                    <span className="error-text">{liFormErrors.liActionPlan}</span>
                  )}
                </div>

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="liRemarks" className="form-label">Remarks</label>
                  <textarea
                    id="liRemarks"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Enter observations, cable quad details, or testing measurements"
                    value={liRemarks}
                    onChange={(e) => setLiRemarks(e.target.value)}
                  />
                </div>

                {/* Save button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                  <button
                    type="button"
                    className="all-ok-button"
                    onClick={() => {
                      const nowStr = new Date().toISOString().slice(0, 16);
                      const todayStr = new Date().toISOString().slice(0, 10);
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
                      const newLiRecord = {
                        id: Date.now(),
                        division: selectedDivision,
                        sectionName: "All Sections",
                        kmNo: "None",
                        totalFaults: "0",
                        faultTime: formatDatetime(nowStr),
                        rectified: "0",
                        rectifiedTime: formatDatetime(nowStr),
                        balanceFaults: "0",
                        actionPlan: "No low insulation faults found. Regular megger testing and monitoring.",
                        tdc: formatDate(todayStr),
                        remarks: "All OK."
                      };
                      setSavedLiRecords(prev => [newLiRecord, ...prev]);
                      setLiSectionName("");
                      setLiKmNo("");
                      setLiTotalFaults("");
                      setLiFaultTime("");
                      setLiRectified("");
                      setLiRectifiedTime("");
                      setLiActionPlan("");
                      setLiTdc("");
                      setLiRemarks("");
                      moveToNextCircuit();
                    }}
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
          ) : (
            /* Active Workspace View */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>{selectedCircuit.name}</h2>
                  <div className="workspace-meta">
                    <span>As of: {activeStatus?.lastUpdated}</span>
                  </div>
                </div>

                {/* Dynamic Status Badge */}
                {activeStatus && (
                  <div className={`status-badge ${
                    activeStatus.status === "normal"
                      ? "green"
                      : activeStatus.status === "degraded"
                      ? "yellow"
                      : "red"
                  }`}>
                    <span className="dot"></span>
                    <span>
                      {activeStatus.status === "normal"
                        ? "Normal"
                        : activeStatus.status === "degraded"
                        ? "Degraded"
                        : "Outage"}
                    </span>
                  </div>
                )}
              </div>

              {/* Description card */}
              <div className="detail-card" style={{ gap: "6px" }}>
                <span className="detail-card-title">System Description</span>
                <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.5 }}>
                  {selectedCircuit.description}
                </p>
              </div>

              {/* Operational details and Logs split grid */}
              <div className="detail-grid">
                {/* Telecom Status detail cards */}
                <div className="detail-card">
                  <span className="detail-card-title">Circuit Details & Parameters</span>
                  {activeStatus?.details.map((detail, index) => (
                    <div key={index} className="info-row">
                      <span className="info-label">{detail.label}</span>
                      <span className="info-value">{detail.value}</span>
                    </div>
                  ))}
                </div>

                {/* Operations checklist & recent activities log card */}
                <div className="detail-card">
                  <span className="detail-card-title">Recent Activity Logs</span>
                  <div
                    className="no-scrollbar"
                    style={{
                      maxHeight: "160px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px"
                    }}
                  >
                    {displayLogs.length > 0 ? (
                      displayLogs.map((log, index) => (
                        <div
                          key={index}
                          style={{
                            fontSize: "13px",
                            lineHeight: "1.4",
                            color: "#4B5563",
                            paddingLeft: "10px",
                            borderLeft: "2px solid #E5E7EB"
                          }}
                        >
                          {log}
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: "13px", color: "#9CA3AF" }}>No logs recorded.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Daily Log entry form */}
              <div className="detail-card">
                <form className="status-editor-container" onSubmit={handleSaveLog}>
                  {renderHierarchicalFields(formErrors)}
                  <label htmlFor="log-text">Log New Telecom Position / Status Update</label>
                  <textarea
                    id="log-text"
                    placeholder="Enter today's status remarks, cable faults, insulation measurements, test results, etc."
                    className="status-textarea"
                    value={logInput}
                    onChange={(e) => setLogInput(e.target.value)}
                    required
                  />
                  <div className="save-row" style={{ justifyContent: "flex-end", gap: "12px" }}>
                    {saveSuccess && (
                      <span className="save-success-msg" style={{ marginRight: "auto" }}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Update saved to daily position
                      </span>
                    )}
                    <button
                      type="button"
                      className="all-ok-button"
                      onClick={() => {
                        if (!selectedCircuit) return;
                        const logKey = `${selectedDivision}_${selectedCircuit.id}`;
                        const newLog = `${new Date().toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })} - All systems functioning normally. Insulation parameters healthy. Walkie-Talkies verified. No outages or cable cuts reported.`;
                        setUserLogs((prev) => ({
                          ...prev,
                          [logKey]: [newLog, ...(prev[logKey] || [])],
                        }));
                        setLogInput("");
                        moveToNextCircuit();
                      }}
                    >
                      All OK
                    </button>
                    <button type="submit" className="save-button">
                      Log Position
                    </button>
                  </div>
                </form>
              </div>


            </div>
          )}
        </main>
      </div>

      {/* FOOTER SECTION */}
      <footer className="container-footer">
        <span>© 2026 South East Central Railway - Telecom Department</span>
        <span>
          Operational Console | Powered by <a href="https://railtelindia.com" target="_blank" rel="noopener noreferrer">RailTel</a>
        </span>
      </footer>
    </div>
  );
}
