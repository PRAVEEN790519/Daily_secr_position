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
        { name: "ICMS & COM Position", badge: "ICMS", code: "ICMS-01", desc: "Integrated Coaching Management System & Control Office Application status tracking." },
        { name: "FOIS (VSAT)", badge: "FOIS", code: "FOIS-02", desc: "Freight Operations Information System terminal connectivity and central host communications." },
        { name: "GM–CRB Hotline", badge: "HOTLINE", code: "HOT-03", desc: "Direct voice hotline linking General Manager to CRB." },
        { name: "Video Conferencing with Divisions", badge: "VC-D", code: "VC-04", desc: "Daily video conference link connecting HQ to divisional heads." },
        { name: "Railway Board Video Phones", badge: "VP-RB", code: "VPHONE-05", desc: "SIP-based video telephone terminals for Board communications." },
        { name: "CFTM Conference", badge: "CONF", code: "CONF-06", desc: "Conference circuit for Chief Freight Transportation Manager operations." },
        { name: "Rail Madad", badge: "MADAD", code: "MAD-07", desc: "Passenger grievance portal integration and telecom complaints hotline." }
      ]
    },
    {
      category: "Network & Internet",
      items: [
        { name: "Railnet / Internet", badge: "NET", code: "NET-08", desc: "SECR Railway Intranet and official broadband gateways." },
        { name: "Wi-Fi", badge: "WIFI", code: "WIFI-09", desc: "Public Wi-Fi access points at stations (RailWire)." },
        { name: "Google Wi-Fi", badge: "G-WIFI", code: "GWIFI-10", desc: "High-speed Google Wi-Fi station hotspots tracking." },
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

export default function Home() {
  const [selectedDivision, setSelectedDivision] = useState<string>("Bilaspur");
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState<boolean>(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [openDropdownCategory, setOpenDropdownCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [liveTime, setLiveTime] = useState<string>("");

  // Track operational logs updated by the user dynamically in state
  const [userLogs, setUserLogs] = useState<Record<string, string[]>>({});
  const [logInput, setLogInput] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fault Entry Form states (ICMS & COM Position)
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

  // Saved Logged Faults registry with dummy entries for Communication & Voice Circuits
  const [savedFaults, setSavedFaults] = useState<any[]>([
    {
      id: 1,
      circuitId: 1, // ICMS & COM Position
      division: "Bilaspur",
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

  // Close dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (divisionRef.current && !divisionRef.current.contains(event.target as Node)) {
        setDivisionDropdownOpen(false);
      }
      if (circuitRef.current && !circuitRef.current.contains(event.target as Node)) {
        setOpenDropdownCategory(null);
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
    setLogInput("");
    setSaveSuccess(false);
    if (circuit.category === "Exchange") {
      setExchangeName(circuit.name.endsWith("Exchange") ? circuit.name : `${circuit.name} Exchange`);
    }
    // Clear standard form inputs when switching circuits
    setFaultySection("");
    setCircuitFailed("");
    setFailureTime("");
    setRectificationTime("");
    setSelectedReasons([]);
    setCustomReason("");
    setRemarks("");
    setFormErrors({});

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
    if (!selectedCircuit || !logInput.trim()) return;

    const logKey = `${selectedDivision}_${selectedCircuit.id}`;
    const newLog = `${new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })} - ${logInput.trim()}`;

    setUserLogs((prev) => ({
      ...prev,
      [logKey]: [newLog, ...(prev[logKey] || [])],
    }));

    setLogInput("");
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
    if (!faultySection.trim()) errors.faultySection = "Faulty Section is required";
    if (!circuitFailed.trim()) errors.circuitFailed = "Failed Circuit Name is required";
    if (!failureTime) errors.failureTime = "Failure Date & Time is required";
    if (!rectificationTime) errors.rectificationTime = "Rectification Time is required";
    if (selectedReasons.length === 0) errors.reasons = "At least one failure reason is required";
    if (selectedReasons.includes("Other") && !customReason.trim()) {
      errors.customReason = "Custom failure reason is required";
    }

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
      faultySection: faultySection.trim(),
      circuitFailed: circuitFailed.trim(),
      failureTime: formatDate(failureTime),
      rectificationTime: formatDate(rectificationTime),
      duration: totalDuration,
      reasons: selectedReasons.map(r => r === "Other" ? `Other: ${customReason.trim()}` : r).join(", "),
      remarks: remarks.trim()
    };

    setSavedFaults(prev => [newFault, ...prev]);

    // Reset Form
    setFaultySection("");
    setCircuitFailed("");
    setFailureTime("");
    setRectificationTime("");
    setSelectedReasons([]);
    setCustomReason("");
    setRemarks("");
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
        exchangeName,
        faultName: faultName === "Other" ? `Other: ${customFaultName.trim()}` : faultName,
        failureTime: formatDate(exchFailureTime),
        rectificationTime: formatDate(exchRectificationTime),
        duration: exchTotalDuration,
        reasons: exchSelectedReasons.map(r => r === "Other" ? `Other: ${exchCustomReason.trim()}` : r).join(", "),
        remarks: exchRemarks.trim()
      };

      setSavedExchFaults(prev => [newExchFault, ...prev]);
      setExchSaving(false);

      // Reset form fields
      setExchangeName("");
      setFaultName("");
      setCustomFaultName("");
      setExchFailureTime("");
      setExchRectificationTime("");
      setExchSelectedReasons([]);
      setExchCustomReason("");
      setExchRemarks("");
      setExchFormSuccess(true);

      // Success alert stays active for 5 seconds
      setTimeout(() => setExchFormSuccess(false), 5000);
    }, 1200);
  };

  // Mock List of SECR Locations for Railnet
  const LOCATIONS_LIST = [
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

  // Filter locations based on search query
  const filteredLocations = useMemo(() => {
    if (!netLocSearchQuery.trim()) return LOCATIONS_LIST;
    return LOCATIONS_LIST.filter(loc => 
      loc.toLowerCase().includes(netLocSearchQuery.toLowerCase())
    );
  }, [netLocSearchQuery]);

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
    if (!netLocation) errors.netLocation = "Location is required";
    if (!netBandwidth.trim()) errors.netBandwidth = "Bandwidth is required";
    if (!netTestingTime) errors.netTestingTime = "Testing Time is required";
    if (!netFaultNature) errors.netFaultNature = "Nature of Fault is required";
    if (netFaultNature === "Other" && !netCustomFaultNature.trim()) {
      errors.netCustomFaultNature = "Fault details are required";
    }
    if (!netFailureTime) errors.netFailureTime = "Failure Date & Time is required";
    if (!netRectificationTime) errors.netRectificationTime = "Rectification Time is required";
    if (netSelectedReasons.length === 0) errors.reasons = "At least one failure reason is required";
    if (netSelectedReasons.includes("Other") && !netCustomReason.trim()) {
      errors.netCustomReason = "Custom failure reason is required";
    }

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
        location: netLocation,
        bandwidth: netBandwidth.trim(),
        testingTime: formatDate(netTestingTime),
        dnSpeed: netDnSpeed ? `${netDnSpeed} Mbps` : "-",
        upSpeed: netUpSpeed ? `${netUpSpeed} Mbps` : "-",
        faultNature: netFaultNature === "Other" ? `Other: ${netCustomFaultNature.trim()}` : netFaultNature,
        failureTime: formatDate(netFailureTime),
        rectificationTime: formatDate(netRectificationTime),
        duration: netTotalDuration,
        reasons: netSelectedReasons.map(r => r === "Other" ? `Other: ${netCustomReason.trim()}` : r).join(", "),
        remarks: netRemarks.trim()
      };

      setSavedNetRecords(prev => [newNetRecord, ...prev]);
      setNetSaving(false);

      // Reset form fields
      setNetLocation("");
      setNetBandwidth("");
      setNetTestingTime("");
      setNetDnSpeed("");
      setNetUpSpeed("");
      setNetFaultNature("");
      setNetCustomFaultNature("");
      setNetFailureTime("");
      setNetRectificationTime("");
      setNetSelectedReasons([]);
      setNetCustomReason("");
      setNetRemarks("");
      setNetFormSuccess(true);

      // Auto hide success banner after 5 seconds
      setTimeout(() => setNetFormSuccess(false), 5000);
    }, 1200);
  };

  // Handle Save Rail Madad Form
  const handleSaveMadadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

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
        balanceLast: madadBalanceLast,
        received: madadReceived,
        complied: madadComplied,
        netBalance: netBalanceCase,
        description: madadDescription.trim(),
        caseTime: formatDate(madadCaseTime),
        complianceDetails: madadComplianceDetails.trim(),
        complianceTime: formatDate(madadComplianceTime),
        remarks: madadRemarks.trim()
      };

      setSavedMadadRecords(prev => [newMadadRecord, ...prev]);
      setMadadSaving(false);

      // Reset form fields
      setMadadBalanceLast("");
      setMadadReceived("");
      setMadadComplied("");
      setMadadDescription("");
      setMadadCaseTime("");
      setMadadComplianceDetails("");
      setMadadComplianceTime("");
      setMadadRemarks("");
      setMadadFormSuccess(true);

      // Auto hide success banner after 5 seconds
      setTimeout(() => setMadadFormSuccess(false), 5000);
    }, 1200);
  };

  // Handle Save Railway Board Video Phone Test Form
  const handleSaveVpRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!vpPhodChamber) errors.vpPhodChamber = "PHOD Chamber is required";
    if (vpPhodChamber === "Other" && !vpCustomPhod.trim()) {
      errors.vpCustomPhod = "Custom chamber name is required";
    }
    if (!vpTestingTime) errors.vpTestingTime = "Tested with RB Date & Time is required";
    if (!vpVideoClarity) errors.vpVideoClarity = "Video Clarity is required";
    if (!vpAudioClarity) errors.vpAudioClarity = "Audio Clarity is required";

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
        phodChamber: vpPhodChamber === "Other" ? `Other: ${vpCustomPhod.trim()}` : vpPhodChamber,
        testingTime: formatDate(vpTestingTime),
        videoClarity: vpVideoClarity,
        audioClarity: vpAudioClarity,
        remarks: vpRemarks.trim()
      };

      setSavedVpRecords(prev => [newVpRecord, ...prev]);
      setVpSaving(false);

      // Reset form fields
      setVpPhodChamber("");
      setVpCustomPhod("");
      setVpTestingTime("");
      setVpVideoClarity("");
      setVpAudioClarity("");
      setVpRemarks("");
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
        sectionName: ccSectionName.trim(),
        kmNo: ccKmNo.trim(),
        cableTypes: ccCableTypes.map(c => c === "Other" ? `Other: ${ccCustomCableType.trim()}` : c).join(", "),
        cutByWhom: ccCutByWhom.map(c => c === "Other" ? `Other: ${ccCustomCutBy.trim()}` : c).join(", "),
        failureTime: formatDate(ccFailureTime),
        rectificationTime: formatDate(ccRectificationTime),
        duration: ccTotalDuration,
        reasonOfFailure: ccReasonOfFailure.trim(),
        remarks: ccRemarks.trim()
      };

      setSavedCcRecords(prev => [newCcRecord, ...prev]);
      setCcSaving(false);

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
      setCcFormSuccess(true);

      // Auto hide success banner after 5 seconds
      setTimeout(() => setCcFormSuccess(false), 5000);
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
            <span className="logo-sub">Telecom Department Operations</span>
          </div>
        </div>

        <div className="header-center">
          <h1>Daily SECR Position</h1>
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
        <aside className="left-panel">
          <h2 className="panel-title">Name of Circuit</h2>
          
          <div className="categories-dropdown-list" ref={circuitRef} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              "Communication & Voice Circuits",
              "Network & Internet",
              "Cable Infrastructure",
              "Display System",
              "Testing & Maintenance",
              "CCTV",
              "Exchange"
            ].map((catName, index) => {
              const isOpen = openDropdownCategory === catName;
              const filteredList = getFilteredCategoryCircuits(catName);
              const isSelectedInCat = selectedCircuit && selectedCircuit.category === catName;
              
              return (
                <div key={catName} className={`category-select-group ${isSelectedInCat ? "active-category" : ""}`}>
                  <button
                    type="button"
                    className={`category-heading-trigger ${isOpen ? "open" : ""} ${isSelectedInCat ? "selected" : ""}`}
                    onClick={() => handleToggleCategoryDropdown(catName)}
                    aria-label={`Toggle ${catName}`}
                  >
                    <span className="category-heading-text">
                      {index + 1}. {catName}
                    </span>
                    <span className="category-arrow">
                      {isOpen ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Show selected circuit details if closed and selected */}
                  {isSelectedInCat && !isOpen && (
                    <div className="category-selected-preview">
                      <span className="dot"></span>
                      <span>{selectedCircuit.name}</span>
                    </div>
                  )}

                  {isOpen && (
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
                                setOpenDropdownCategory(null);
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
        <main className="right-panel">
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
                  <h2>{selectedCircuit.name} - Fault Entry Form</h2>
                  <div className="workspace-meta">
                    <span>Code: {selectedCircuit.systemCode}</span>
                    <span className="meta-divider">|</span>
                    <span>Division: {selectedDivision}</span>
                  </div>
                </div>
                
                <div className="status-badge yellow">
                  <span className="dot"></span>
                  <span>Fault Console</span>
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
                <div className="form-group-row">
                  {/* Faulty Section */}
                  <div className="form-group">
                    <label htmlFor="faultySection" className="form-label">
                      Faulty Section <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="faultySection"
                      className={`form-input ${formErrors.faultySection ? "field-error-border" : ""}`}
                      placeholder="Enter faulty section name"
                      value={faultySection}
                      onChange={(e) => setFaultySection(e.target.value)}
                    />
                    {formErrors.faultySection && (
                      <span className="error-text">{formErrors.faultySection}</span>
                    )}
                  </div>

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
                      Total Duration (Calculated)
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
                          {[
                            "Cable Cut",
                            "Link Failure",
                            "Equipment Failure (STM)",
                            "Equipment Failure (MUX)",
                            "Equipment Failure (MUX Card)",
                            "Equipment Failure (Phone)",
                            "Power Failure",
                            "Configuration Issue",
                            "Other"
                          ].map((option) => (
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="save-button">
                    Save
                  </button>
                </div>
              </form>

              {/* Logged faults section */}
              <div className="logged-faults-section">
                <h3>Logged Fault Registry ({selectedDivision} Division)</h3>
                <div className="fault-record-list">
                  {filteredFaults.length > 0 ? (
                    filteredFaults.map((fault) => (
                        <div key={fault.id} className="fault-record">
                          <div className="fault-record-header">
                            <span className="fault-record-title">{fault.circuitFailed}</span>
                            <span className="fault-record-duration">{fault.duration}</span>
                          </div>
                          <div className="fault-record-grid">
                            <div className="fault-record-item">
                              <span className="fault-record-label">Section:</span>
                              <span className="fault-record-value">{fault.faultySection}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Reasons:</span>
                              <span className="fault-record-value">{fault.reasons}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Failure Time:</span>
                              <span className="fault-record-value">{fault.failureTime}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Rectification:</span>
                              <span className="fault-record-value">{fault.rectificationTime}</span>
                            </div>
                            {fault.remarks && (
                              <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                                <span className="fault-record-label">Remarks:</span>
                                <span className="fault-record-value">{fault.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: "16px", fontSize: "13px", color: "#6B7280", textAlign: "center", border: "1px dashed #D1D5DB", borderRadius: "6px" }}>
                      No faults registered for {selectedDivision} division today.
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace footer */}
              <div className="workspace-footer" style={{ marginTop: "12px" }}>
                <div className="footer-system">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>SECR-HQ Fault Console Link</span>
                </div>
                <span>Telecom Desk SECR HQ Bilaspur</span>
              </div>
            </div>
          ) : selectedCircuit.category === "Exchange" ? (
            /* Exchange Fault Entry Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Exchange Fault Entry Form</h2>
                  <div className="workspace-meta">
                    <span>Code: {selectedCircuit.systemCode}</span>
                    <span className="meta-divider">|</span>
                    <span>Division: {selectedDivision}</span>
                  </div>
                </div>
                
                <div className="status-badge yellow">
                  <span className="dot"></span>
                  <span>Exchange Console</span>
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
                      Total Duration (Calculated)
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
                            "Equipment Failure (MUX)",
                            "Equipment Failure (MUX Card)",
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

              {/* Logged faults section */}
              <div className="logged-faults-section">
                <h3>Logged Exchange Fault Registry ({selectedDivision} Division)</h3>
                <div className="fault-record-list">
                  {savedExchFaults.filter(f => f.division === selectedDivision).length > 0 ? (
                    savedExchFaults
                      .filter(f => f.division === selectedDivision)
                      .map((fault) => (
                        <div key={fault.id} className="fault-record">
                          <div className="fault-record-header">
                            <span className="fault-record-title">{fault.exchangeName} - {fault.faultName}</span>
                            <span className="fault-record-duration">{fault.duration}</span>
                          </div>
                          <div className="fault-record-grid">
                            <div className="fault-record-item">
                              <span className="fault-record-label">Reasons:</span>
                              <span className="fault-record-value">{fault.reasons}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Failure Time:</span>
                              <span className="fault-record-value">{fault.failureTime}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Rectification:</span>
                              <span className="fault-record-value">{fault.rectificationTime}</span>
                            </div>
                            {fault.remarks && (
                              <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                                <span className="fault-record-label">Remarks:</span>
                                <span className="fault-record-value">{fault.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: "16px", fontSize: "13px", color: "#6B7280", textAlign: "center", border: "1px dashed #D1D5DB", borderRadius: "6px" }}>
                      No exchange faults registered for {selectedDivision} division today.
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace footer */}
              <div className="workspace-footer" style={{ marginTop: "12px" }}>
                <div className="footer-system">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>SECR Exchange Monitoring Console Link</span>
                </div>
                <span>Telecom Desk SECR HQ Bilaspur</span>
              </div>
            </div>
          ) : selectedCircuit.name === "Railnet / Internet" ? (
            /* Railnet / Internet Monitoring Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Railnet / Internet Monitoring Form</h2>
                  <div className="workspace-meta">
                    <span>Code: {selectedCircuit.systemCode}</span>
                    <span className="meta-divider">|</span>
                    <span>Division: {selectedDivision}</span>
                  </div>
                </div>
                
                <div className="status-badge yellow">
                  <span className="dot"></span>
                  <span>Railnet Console</span>
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
                <div className="form-group-row">
                  {/* Location - Searchable Dropdown */}
                  <div className="form-group">
                    <label className="form-label">
                      Location <span className="required">*</span>
                    </label>
                    <div className="multiselect-container" ref={netLocRef}>
                      <button
                        type="button"
                        className={`multiselect-trigger ${netLocDropdownOpen ? "open" : ""}`}
                        onClick={() => setNetLocDropdownOpen(!netLocDropdownOpen)}
                      >
                        <span>{netLocation ? netLocation : "Select Location"}</span>
                      </button>
                      {netLocDropdownOpen && (
                        <div className="multiselect-menu">
                          {/* Search input inside Location dropdown */}
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
                              placeholder="Filter location..."
                              className="circuit-dropdown-search"
                              value={netLocSearchQuery}
                              onChange={(e) => setNetLocSearchQuery(e.target.value)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          {/* Location items */}
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
                      Testing Time <span className="required">*</span>
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
                    <label htmlFor="netTotalDuration" className="form-label">Total Duration (Calculated)</label>
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
                            "Equipment Failure (MUX)",
                            "Equipment Failure (MUX Card)",
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

              {/* Logged faults registry list */}
              <div className="logged-faults-section">
                <h3>Logged Railnet & Internet Registry ({selectedDivision} Division)</h3>
                <div className="fault-record-list">
                  {savedNetRecords.filter(f => f.division === selectedDivision).length > 0 ? (
                    savedNetRecords
                      .filter(f => f.division === selectedDivision)
                      .map((record) => (
                        <div key={record.id} className="fault-record">
                          <div className="fault-record-header">
                            <span className="fault-record-title">{record.location} - {record.faultNature}</span>
                            <span className="fault-record-duration">{record.duration}</span>
                          </div>
                          <div className="fault-record-grid">
                            <div className="fault-record-item">
                              <span className="fault-record-label">Bandwidth:</span>
                              <span className="fault-record-value">{record.bandwidth}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Speeds (Dn/Up):</span>
                              <span className="fault-record-value">{record.dnSpeed} / {record.upSpeed}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Testing Time:</span>
                              <span className="fault-record-value">{record.testingTime}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Reasons:</span>
                              <span className="fault-record-value">{record.reasons}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Failure Time:</span>
                              <span className="fault-record-value">{record.failureTime}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Rectification:</span>
                              <span className="fault-record-value">{record.rectificationTime}</span>
                            </div>
                            {record.remarks && (
                              <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                                <span className="fault-record-label">Remarks:</span>
                                <span className="fault-record-value">{record.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: "16px", fontSize: "13px", color: "#6B7280", textAlign: "center", border: "1px dashed #D1D5DB", borderRadius: "6px" }}>
                      No Railnet/Internet records registered for {selectedDivision} division today.
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace footer */}
              <div className="workspace-footer" style={{ marginTop: "12px" }}>
                <div className="footer-system">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>SECR Railnet Monitoring Link</span>
                </div>
                <span>Telecom Desk SECR HQ Bilaspur</span>
              </div>
            </div>
          ) : selectedCircuit.name === "Rail Madad" ? (
            /* Rail Madad Monitoring & Case Entry Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Rail Madad Case Entry Form</h2>
                  <div className="workspace-meta">
                    <span>Code: {selectedCircuit.systemCode}</span>
                    <span className="meta-divider">|</span>
                    <span>Division: {selectedDivision}</span>
                  </div>
                </div>
                
                <div className="status-badge yellow">
                  <span className="dot"></span>
                  <span>Rail Madad Console</span>
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
                </div>

                <div className="form-group-row">
                  {/* Case Complied On Date */}
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
                </div>

                <div className="form-group-row">
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

                {/* Remarks */}
                <div className="form-group full-width">
                  <label htmlFor="madadRemarks" className="form-label">Remarks</label>
                  <textarea
                    id="madadRemarks"
                    className="form-textarea"
                    style={{ height: "65px" }}
                    placeholder="Enter additional remarks or observations"
                    value={madadRemarks}
                    onChange={(e) => setMadadRemarks(e.target.value)}
                  />
                </div>

                {/* Save button with Loading State */}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

              {/* Logged cases registry section */}
              <div className="logged-faults-section">
                <h3>Logged Rail Madad Case Registry ({selectedDivision} Division)</h3>
                <div className="fault-record-list">
                  {savedMadadRecords.filter(r => r.division === selectedDivision).length > 0 ? (
                    savedMadadRecords
                      .filter(r => r.division === selectedDivision)
                      .map((record) => (
                        <div key={record.id} className="fault-record">
                          <div className="fault-record-header">
                            <span className="fault-record-title">Net Balance: {record.netBalance} cases</span>
                            <span className="fault-record-duration">
                              Last Bal: {record.balanceLast} | Recd: {record.received} | Comp: {record.complied}
                            </span>
                          </div>
                          <div className="fault-record-grid">
                            <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                              <span className="fault-record-label">Case Details:</span>
                              <span className="fault-record-value">{record.description} ({record.caseTime})</span>
                            </div>
                            <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                              <span className="fault-record-label">Compliance:</span>
                              <span className="fault-record-value">{record.complianceDetails} ({record.complianceTime})</span>
                            </div>
                            {record.remarks && (
                              <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                                <span className="fault-record-label">Remarks:</span>
                                <span className="fault-record-value">{record.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: "16px", fontSize: "13px", color: "#6B7280", textAlign: "center", border: "1px dashed #D1D5DB", borderRadius: "6px" }}>
                      No Rail Madad cases registered for {selectedDivision} division today.
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace footer */}
              <div className="workspace-footer" style={{ marginTop: "12px" }}>
                <div className="footer-system">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>SECR Rail Madad Integration Console Link</span>
                </div>
                <span>Telecom Desk SECR HQ Bilaspur</span>
              </div>
            </div>
          ) : selectedCircuit.name === "Railway Board Video Phones" ? (
            /* Railway Board Video Phone Test Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Railway Board Video Phone Test Form</h2>
                  <div className="workspace-meta">
                    <span>Code: {selectedCircuit.systemCode}</span>
                    <span className="meta-divider">|</span>
                    <span>Division: {selectedDivision}</span>
                  </div>
                </div>
                
                <div className="status-badge yellow">
                  <span className="dot"></span>
                  <span>Video Phone Console</span>
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

              {/* Logged Video Phone tests registry section */}
              <div className="logged-faults-section">
                <h3>Logged Video Phone Test Registry ({selectedDivision} Division)</h3>
                <div className="fault-record-list">
                  {savedVpRecords.filter(r => r.division === selectedDivision).length > 0 ? (
                    savedVpRecords
                      .filter(r => r.division === selectedDivision)
                      .map((record) => (
                        <div key={record.id} className="fault-record">
                          <div className="fault-record-header">
                            <span className="fault-record-title">Chamber: {record.phodChamber}</span>
                            <span className="fault-record-duration">Tested with RB</span>
                          </div>
                          <div className="fault-record-grid">
                            <div className="fault-record-item">
                              <span className="fault-record-label">Testing Time:</span>
                              <span className="fault-record-value">{record.testingTime}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Video Clarity:</span>
                              <span className="fault-record-value">{record.videoClarity}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Audio Clarity:</span>
                              <span className="fault-record-value">{record.audioClarity}</span>
                            </div>
                            {record.remarks && (
                              <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                                <span className="fault-record-label">Remarks:</span>
                                <span className="fault-record-value">{record.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: "16px", fontSize: "13px", color: "#6B7280", textAlign: "center", border: "1px dashed #D1D5DB", borderRadius: "6px" }}>
                      No Video Phone test logs registered for {selectedDivision} division today.
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace footer */}
              <div className="workspace-footer" style={{ marginTop: "12px" }}>
                <div className="footer-system">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>SECR Railway Board Video Phone console</span>
                </div>
                <span>Telecom Desk SECR HQ Bilaspur</span>
              </div>
            </div>
          ) : selectedCircuit.name === "Cable Cut (OFC & Quad)" ? (
            /* Cable Cut (OFC & Quad) Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>Cable Cut (OFC & Quad) Monitoring Form</h2>
                  <div className="workspace-meta">
                    <span>Code: {selectedCircuit.systemCode}</span>
                    <span className="meta-divider">|</span>
                    <span>Division: {selectedDivision}</span>
                  </div>
                </div>
                
                <div className="status-badge red">
                  <span className="dot"></span>
                  <span>Cable Cut Console</span>
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
                      Total Duration (Calculated)
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
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

              {/* Logged Cable Cuts registry section */}
              <div className="logged-faults-section">
                <h3>Logged Cable Cut Registry ({selectedDivision} Division)</h3>
                <div className="fault-record-list">
                  {savedCcRecords.filter(r => r.division === selectedDivision).length > 0 ? (
                    savedCcRecords
                      .filter(r => r.division === selectedDivision)
                      .map((record) => (
                        <div key={record.id} className="fault-record">
                          <div className="fault-record-header">
                            <span className="fault-record-title">{record.sectionName} (KM {record.kmNo})</span>
                            <span className="fault-record-duration">{record.duration}</span>
                          </div>
                          <div className="fault-record-grid">
                            <div className="fault-record-item">
                              <span className="fault-record-label">Cable Types:</span>
                              <span className="fault-record-value">{record.cableTypes}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Cut by Whom:</span>
                              <span className="fault-record-value">{record.cutByWhom}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Failure Time:</span>
                              <span className="fault-record-value">{record.failureTime}</span>
                            </div>
                            <div className="fault-record-item">
                              <span className="fault-record-label">Restoration (RT):</span>
                              <span className="fault-record-value">{record.rectificationTime}</span>
                            </div>
                            <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                              <span className="fault-record-label">Reason:</span>
                              <span className="fault-record-value">{record.reasonOfFailure}</span>
                            </div>
                            {record.remarks && (
                              <div className="fault-record-item" style={{ gridColumn: "span 2" }}>
                                <span className="fault-record-label">Remarks:</span>
                                <span className="fault-record-value">{record.remarks}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ padding: "16px", fontSize: "13px", color: "#6B7280", textAlign: "center", border: "1px dashed #D1D5DB", borderRadius: "6px" }}>
                      No Cable Cuts registered for {selectedDivision} division today.
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace footer */}
              <div className="workspace-footer" style={{ marginTop: "12px" }}>
                <div className="footer-system">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>SECR Cable Integrity and OTDR Monitoring console</span>
                </div>
                <span>Telecom Desk SECR HQ Bilaspur</span>
              </div>
            </div>
          ) : (
            /* Active Workspace View */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>{selectedCircuit.name}</h2>
                  <div className="workspace-meta">
                    <span>Code: {selectedCircuit.systemCode}</span>
                    <span className="meta-divider">|</span>
                    <span>Division: {selectedDivision}</span>
                    <span className="meta-divider">|</span>
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
                  <label htmlFor="log-text">Log New Telecom Position / Status Update</label>
                  <textarea
                    id="log-text"
                    placeholder="Enter today's status remarks, cable faults, insulation measurements, test results, etc."
                    className="status-textarea"
                    value={logInput}
                    onChange={(e) => setLogInput(e.target.value)}
                    required
                  />
                  <div className="save-row">
                    {saveSuccess ? (
                      <span className="save-success-msg">
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
                    ) : (
                      <span></span>
                    )}
                    <button type="submit" className="save-button">
                      Log Position
                    </button>
                  </div>
                </form>
              </div>

              {/* Workspace footer */}
              <div className="workspace-footer">
                <div className="footer-system">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  <span>Encrypted Link SECR-HQ/Div-Control</span>
                </div>
                <span>Telecom Desk SECR HQ Bilaspur</span>
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
