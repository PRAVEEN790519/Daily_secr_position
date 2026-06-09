"use client";

import { useState, useEffect, useMemo, useRef } from "react";

// Types
import { UserProfile, Circuit, DivisionStatus } from "../types";

// Data
import { CIRCUITS_DATABASE, HIERARCHICAL_DATA, isStandardFaultCircuit } from "../data/circuits";

// Utilities
import { calculateDuration, formatDate } from "../utils/dateTime";

// Layout & View Components
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DashboardView from "../components/DashboardView";
import HistoryView from "../components/HistoryView";

// Form Components
import ControlFaultForm from "../components/forms/ControlFaultForm";
import ExchangeForm from "../components/forms/ExchangeForm";
import RailnetForm from "../components/forms/RailnetForm";
import RailMadadForm from "../components/forms/RailMadadForm";
import VideoPhoneForm from "../components/forms/VideoPhoneForm";
import CableCutForm from "../components/forms/CableCutForm";
import WalkieTalkieTestingForm from "../components/forms/WalkieTalkieTestingForm";
import WalkieTalkieRepairingForm from "../components/forms/WalkieTalkieRepairingForm";
import LowInsulationForm from "../components/forms/LowInsulationForm";
import TemporaryJointsForm from "../components/forms/TemporaryJointsForm";
import CgdmForm from "../components/forms/CgdmForm";
import TibForm from "../components/forms/TibForm";
import CctvForm from "../components/forms/CctvForm";
import PrsUtsForm from "../components/forms/PrsUtsForm";
import WifiForm from "../components/forms/WifiForm";
import GeneralStatusForm from "../components/forms/GeneralStatusForm";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authUsername, setAuthUsername] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authMobileNumber, setAuthMobileNumber] = useState<string>("");
  const [authOtpCode, setAuthOtpCode] = useState<string>("");
  const [otpSentCode, setOtpSentCode] = useState<string>("");
  const [otpMode, setOtpMode] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<"user" | "admin">("user");
  const [isSignupMode, setIsSignupMode] = useState<boolean>(false);
  const [signupMobile, setSignupMobile] = useState<string>("");
  const [signupName, setSignupName] = useState<string>("");
  const [signupDivision, setSignupDivision] = useState<string>("Bilaspur");
  const [signupRole, setSignupRole] = useState<"admin" | "testroom">("testroom");
  const [signupPassword, setSignupPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string>("");
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [activeNavTab, setActiveNavTab] = useState<string>("recordform");
  const [selectedDivision, setSelectedDivision] = useState<string>("Bilaspur");
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState<boolean>(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState<boolean>(true);
  const [openDropdownCategory, setOpenDropdownCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Refs for closing dropdowns on click outside
  const divisionRef = useRef<HTMLDivElement>(null);
  const circuitRef = useRef<HTMLDivElement>(null);

  // Core layout state hook controllers
  useEffect(() => {
    let savedUsers: Record<string, any> = {};
    try {
      savedUsers = JSON.parse(localStorage.getItem("secr_users") || "{}");
    } catch (e) {
      savedUsers = {};
    }

    const defaultUsers = {
      "admin": { username: "admin", password: "password", role: "admin" },
      "bilaspur_tr": { username: "bilaspur_tr", password: "password", role: "testroom", division: "Bilaspur" },
      "raipur_tr": { username: "raipur_tr", password: "password", role: "testroom", division: "Raipur" },
      "nagpur_tr": { username: "nagpur_tr", password: "password", role: "testroom", division: "Nagpur" },
      "9793975397": { username: "Bilaspur Test Room", role: "testroom", division: "Bilaspur", mobile: "9793975397" },
      "9876543211": { username: "Raipur Test Room", role: "testroom", division: "Raipur", mobile: "9876543211" },
      "9876543212": { username: "Nagpur Test Room", role: "testroom", division: "Nagpur", mobile: "9876543212" }
    };

    let updated = false;
    Object.entries(defaultUsers).forEach(([key, udata]) => {
      if (!savedUsers[key]) {
        savedUsers[key] = udata;
        updated = true;
      }
    });

    if (updated || !localStorage.getItem("secr_users")) {
      localStorage.setItem("secr_users", JSON.stringify(savedUsers));
    }

    const savedUser = localStorage.getItem("secr_current_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as UserProfile;
        setCurrentUser(parsed);
        if (parsed.role === "testroom" && parsed.division) {
          setSelectedDivision(parsed.division);
        }
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.role === "testroom" && currentUser.division) {
      setSelectedDivision(currentUser.division);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        setActiveNavTab("dashboard");
      } else if (currentUser.role === "testroom") {
        setActiveNavTab("recordform");
      }
    } else {
      setActiveNavTab("recordform");
    }
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutsideMenu = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (divisionRef.current && !divisionRef.current.contains(event.target as Node)) {
        setDivisionDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  // Shared state variables for the generic status fallback form
  const [formMajorSection, setFormMajorSection] = useState<string>("");
  const [formSection, setFormSection] = useState<string>("");
  const [formStationLocation, setFormStationLocation] = useState<string>("");
  const [userLogs, setUserLogs] = useState<Record<string, string[]>>({});
  const [logInput, setLogInput] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dynamic values helper for generic status form
  const activeStatus = useMemo(() => {
    if (!selectedCircuit) return undefined;
    return selectedCircuit.divisionData[selectedDivision];
  }, [selectedCircuit, selectedDivision]);

  const displayLogs = useMemo(() => {
    if (!selectedCircuit || !activeStatus) return [];
    const logKey = `${selectedDivision}_${selectedCircuit.id}`;
    const dynamicLogs = userLogs[logKey] || [];
    return [...dynamicLogs, ...activeStatus.recentLogs];
  }, [selectedCircuit, selectedDivision, activeStatus, userLogs]);

  // Registries of logged positions
  const [savedFaults, setSavedFaults] = useState<any[]>([
    {
      id: 1,
      circuitId: 1,
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
      circuitId: 2,
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
      circuitId: 7,
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
      circuitId: 4,
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

  const [savedExchFaults, setSavedExchFaults] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      exchangeName: "Bilaspur Exchange",
      faultName: "Link Failure",
      failureTime: "02-06-2026 08:15",
      rectificationTime: "02-06-2026 09:45",
      duration: "1 Hrs 30 Min",
      reasons: "Power Card Fault",
      remarks: "Power card replaced in rack 3."
    }
  ]);

  const [savedNetRecords, setSavedNetRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      bandwidth: "1 Gbps",
      testingTime: "02-06-2026 10:00",
      dnSpeed: "940.50",
      upSpeed: "910.20",
      faultNature: "Normal",
      remarks: "Routine speed checks completed."
    }
  ]);

  const [savedMadadRecords, setSavedMadadRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      balanceLast: "2",
      received: "4",
      complied: "5",
      netBalance: 1,
      description: "Delayed ticket refund complaint, terminal network lag",
      caseTime: "02-06-2026 11:00",
      complianceDetails: "Resolved, speed optimized",
      complianceTime: "02-06-2026 11:30",
      remarks: "Complaints closed in Rail Madad Portal."
    }
  ]);

  const [savedVpRecords, setSavedVpRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      phodChamber: "PCE",
      testingTime: "02-06-2026 10:15",
      videoClarity: "Excellent",
      audioClarity: "Excellent",
      remarks: "Satisfactory test run."
    }
  ]);

  const [savedCcRecords, setSavedCcRecords] = useState<any[]>([
    {
      id: 1,
      division: "Raipur",
      kmNo: "114/2",
      cableTypes: "Quad Cable",
      cutByWhom: "Private Contractor",
      failureTime: "02-06-2026 07:30",
      rectificationTime: "02-06-2026 13:45",
      duration: "6 Hrs 15 Min",
      reasonOfFailure: "Third-party excavation without permission",
      remarks: "Temporary joint made to restore block circuit."
    }
  ]);

  const [savedWtRecords, setSavedWtRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      stationLobby: "BSP Lobby",
      totalToBeTested: "25",
      makeModel: "Kenwood TK-2000",
      testingDate: "02-06-2026",
      totalTested: "25",
      remarks: "All 25 VHF units tested OK."
    }
  ]);

  const [savedWtrRecords, setSavedWtrRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      date: "02-06-2026",
      openingBalance: "14",
      receivedFromUser: "6",
      sentToFirm: "5",
      repairedFromFirm: "8",
      returnedToUser: "9",
      faultTypes: "Speaker Muted",
      repairStatus: "Repaired",
      proposedCondemnation: "2",
      condemned: "0",
      totalCondemnedYear: "8",
      actionTaken: "Repaired and dispatched",
      remarks: "Stock updated."
    }
  ]);

  const [savedLiRecords, setSavedLiRecords] = useState<any[]>([
    {
      id: 1,
      division: "Nagpur",
      kmNo: "982/4",
      cableType: "OFC",
      faultsTime: "02-06-2026 09:10",
      rectifiedTime: "02-06-2026 12:40",
      duration: "3 Hrs 30 Min",
      balanceFaults: "0",
      actionPlan: "Permanent splicing completed",
      remarks: "Attenuation normalized."
    }
  ]);

  const [savedTjRecords, setSavedTjRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      sectionYardName: "BSP Yard",
      kmNo: "720/12",
      cableType: "Quad Cable",
      totalJoints: "3",
      jointsTime: "02-06-2026 10:15",
      rectified: "Yes",
      rectifiedTime: "02-06-2026 12:15",
      tdc: "02-06-2026 13:00",
      actionPlan: "Cable joint replacement done",
      remarks: "Permanently jointed."
    }
  ]);

  const [savedCgdmRecords, setSavedCgdmRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      pfNo: "Platform 2",
      faultyBoards: "4",
      failureTime: "02-06-2026 08:00",
      rectifiedTime: "02-06-2026 10:30",
      duration: "2 Hrs 30 Min",
      reasonOfFailure: "Power Supply failure",
      remarks: "SMPS card replaced."
    }
  ]);

  const [savedTibRecords, setSavedTibRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      noOfFaulty: "2",
      failureTime: "02-06-2026 09:00",
      rectifiedTime: "02-06-2026 11:20",
      duration: "2 Hrs 20 Min",
      reasonOfFailure: "Controller hanging issue",
      remarks: "Hardware reset applied."
    }
  ]);

  const [savedCctvmRecords, setSavedCctvmRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      totalNotWorkingLocation: "Plat 1 Outer",
      warRoomFailed: "No",
      failureTime: "02-06-2026 14:00",
      rectifiedTime: "02-06-2026 15:45",
      duration: "1 Hrs 45 Min",
      reasonOfFailure: "PoE Switch port dead",
      remarks: "Patch cord moved to port 8."
    }
  ]);

  const [savedCctvsRecords, setSavedCctvsRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      totalNotWorkingLocation: "Bilaspur Station Lobby",
      warRoomFailed: "No",
      failureTime: "02-06-2026 10:15",
      rectifiedTime: "02-06-2026 11:45",
      duration: "1 Hrs 30 Min",
      reasonOfFailure: "IP camera offline due to loose contact",
      remarks: "Connector re-crimped."
    }
  ]);

  const [savedPuRecords, setSavedPuRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      systemType: "PRS",
      natureOfFault: "Dumb terminal screen blank",
      failureTime: "02-06-2026 08:30",
      rectifiedTime: "02-06-2026 09:15",
      duration: "0 Hrs 45 Min",
      reasonOfFailure: "VGA cable fault",
      remarks: "Cable replaced."
    }
  ]);

  const [savedWifiRecords, setSavedWifiRecords] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      failureTime: "02-06-2026 11:10",
      rectifiedTime: "02-06-2026 12:45",
      duration: "1 Hrs 35 Min",
      reasonOfFailure: "RailWire fiber link cutoff",
      remarks: "Splice team restored core fiber link."
    }
  ]);

  // Combined operations history logger
  const allSavedHistory = useMemo(() => {
    const history: any[] = [];

    // 1. Standard faults
    savedFaults.forEach(f => {
      const circ = CIRCUITS_DATABASE.find(c => c.id === f.circuitId);
      history.push({
        id: `FLT-${f.id}`,
        timestamp: f.failureTime || f.timestamp || "N/A",
        division: f.division,
        category: circ?.category || "Communication & Voice",
        circuitName: circ?.name || f.circuitFailed || "Voice Circuit",
        status: f.rectificationTime ? "Rectified" : "Active Outage",
        details: `Failed: ${f.circuitFailed || "N/A"}. Reason: ${f.reasons || "N/A"}. Duration: ${f.duration || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 2. Exchange faults
    savedExchFaults.forEach(f => {
      history.push({
        id: `EXC-${f.id}`,
        timestamp: f.failureTime || "N/A",
        division: f.division,
        category: "Exchange",
        circuitName: f.exchangeName || "Exchange",
        status: f.rectificationTime ? "Rectified" : "Active Outage",
        details: `Fault: ${f.faultName || "N/A"}. Reason: ${f.reasons || "N/A"}. Duration: ${f.duration || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 3. Railnet / Internet
    savedNetRecords.forEach(f => {
      history.push({
        id: `NET-${f.id}`,
        timestamp: f.testingTime || f.failureTime || "N/A",
        division: f.division,
        category: "Network & Internet",
        circuitName: "Railnet / Internet",
        status: "Tested",
        details: `Bandwidth: ${f.bandwidth || "N/A"}. Speed Dn/Up: ${f.dnSpeed || "N/A"}/${f.upSpeed || "N/A"} Mbps. Nature: ${f.faultNature || "Normal"}. Duration: ${f.duration || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 4. Rail Madad
    savedMadadRecords.forEach(f => {
      history.push({
        id: `MAD-${f.id}`,
        timestamp: f.caseTime || "N/A",
        division: f.division,
        category: "Rail Madad",
        circuitName: "Rail Madad Portal",
        status: "Logged",
        details: `Prev Bal: ${f.balanceLast || "0"}, Recd: ${f.received || "0"}, Complied: ${f.complied || "0"}. Net Bal: ${f.netBalance || "0"}. Description: ${f.description || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 5. Video Phone
    savedVpRecords.forEach(f => {
      history.push({
        id: `VP-${f.id}`,
        timestamp: f.testingTime || "N/A",
        division: f.division,
        category: "Communication & Voice",
        circuitName: "Railway Board Video Phone",
        status: "Tested",
        details: `PHOD Chamber: ${f.phodChamber || "N/A"}. Video Clarity: ${f.videoClarity || "N/A"}. Audio Clarity: ${f.audioClarity || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 6. Cable Cuts
    savedCcRecords.forEach(f => {
      history.push({
        id: `CUT-${f.id}`,
        timestamp: f.failureTime || "N/A",
        division: f.division,
        category: "Cable Infrastructure",
        circuitName: "Cable Cut",
        status: f.rectificationTime ? "Rectified" : "Active Outage",
        details: `KM: ${f.kmNo || "N/A"}. Cables: ${f.cableTypes || "N/A"}. Cut By: ${f.cutByWhom || "N/A"}. Duration: ${f.duration || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 7. VHF Walkie Talkie Testing
    savedWtRecords.forEach(f => {
      history.push({
        id: `WTT-${f.id}`,
        timestamp: f.testingDate || "N/A",
        division: f.division,
        category: "Testing & Maintenance",
        circuitName: "Walkie-Talkie Testing",
        status: "Tested",
        details: `Lobby: ${f.stationLobby || "N/A"}. Tested: ${f.totalTested || "0"}/${f.totalToBeTested || "0"}. Model: ${f.makeModel || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 8. Walkie Talkie Repairing
    savedWtrRecords.forEach(f => {
      history.push({
        id: `WTR-${f.id}`,
        timestamp: f.date || "N/A",
        division: f.division,
        category: "Testing & Maintenance",
        circuitName: "Walkie-Talkie Repairing",
        status: "Updated",
        details: `Open Bal: ${f.openingBalance || "0"}, Recd: ${f.receivedFromUser || "0"}, Repaired: ${f.repairedFromFirm || "0"}, Returned: ${f.returnedToUser || "0"}`,
        remarks: f.remarks
      });
    });

    // 9. Low Insulation
    savedLiRecords.forEach(f => {
      history.push({
        id: `LIN-${f.id}`,
        timestamp: f.faultsTime || "N/A",
        division: f.division,
        category: "Cable Infrastructure",
        circuitName: "Low Insulation",
        status: f.rectifiedTime ? "Rectified" : "Active Outage",
        details: `KM: ${f.kmNo || "N/A"}. Cable: ${f.cableType || "N/A"}. Balance Faults: ${f.balanceFaults || "0"}`,
        remarks: f.remarks
      });
    });

    // 10. Temporary Joints
    savedTjRecords.forEach(f => {
      history.push({
        id: `JNT-${f.id}`,
        timestamp: f.jointsTime || "N/A",
        division: f.division,
        category: "Cable Infrastructure",
        circuitName: "Temporary Joints",
        status: f.rectifiedTime ? "Rectified" : "Awaiting Splice",
        details: `Yard: ${f.sectionYardName || "N/A"}. KM: ${f.kmNo || "N/A"}. Joints Count: ${f.totalJoints || "0"}. TDC: ${f.tdc || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 11. CGDM
    savedCgdmRecords.forEach(f => {
      history.push({
        id: `CGD-${f.id}`,
        timestamp: f.failureTime || "N/A",
        division: f.division,
        category: "Display System",
        circuitName: "CGDM",
        status: f.rectifiedTime ? "Rectified" : "Active Outage",
        details: `Platform: ${f.pfNo || "N/A"}. Faulty Boards: ${f.faultyBoards || "0"}. Reason: ${f.reasonOfFailure || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 12. TIB
    savedTibRecords.forEach(f => {
      history.push({
        id: `TIB-${f.id}`,
        timestamp: f.failureTime || "N/A",
        division: f.division,
        category: "Display System",
        circuitName: "TIB",
        status: f.rectifiedTime ? "Rectified" : "Active Outage",
        details: `Faulty Count: ${f.noOfFaulty || "0"}. Reason: ${f.reasonOfFailure || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 13. CCTV Monitoring
    savedCctvmRecords.forEach(f => {
      history.push({
        id: `CVM-${f.id}`,
        timestamp: f.failureTime || "N/A",
        division: f.division,
        category: "CCTV",
        circuitName: "CCTV Monitoring",
        status: f.rectifiedTime ? "Rectified" : "Active Outage",
        details: `Location: ${f.totalNotWorkingLocation || "N/A"}. War Room Fails: ${f.warRoomFailed || "No"}`,
        remarks: f.remarks
      });
    });

    // 14. CCTV Maintenance
    savedCctvsRecords.forEach(f => {
      history.push({
        id: `CVS-${f.id}`,
        timestamp: f.failureTime || "N/A",
        division: f.division,
        category: "CCTV",
        circuitName: "CCTV Maintenance",
        status: f.rectifiedTime ? "Rectified" : "Active Outage",
        details: `Location: ${f.totalNotWorkingLocation || "N/A"}. War Room Fails: ${f.warRoomFailed || "No"}`,
        remarks: f.remarks
      });
    });

    // 15. PRS/UTS
    savedPuRecords.forEach(f => {
      history.push({
        id: `PRU-${f.id}`,
        timestamp: f.failureTime || "N/A",
        division: f.division,
        category: "Network & Internet",
        circuitName: `PRS/UTS (${f.systemType || "PRS"})`,
        status: f.rectifiedTime ? "Rectified" : "Active Outage",
        details: `Fault: ${f.natureOfFault || "N/A"}. Reason: ${f.reasonOfFailure || "N/A"}`,
        remarks: f.remarks
      });
    });

    // 16. Wi-Fi
    savedWifiRecords.forEach(f => {
      history.push({
        id: `WFI-${f.id}`,
        timestamp: f.failureTime || "N/A",
        division: f.division,
        category: "Network & Internet",
        circuitName: "Wi-Fi AP",
        status: f.rectifiedTime ? "Rectified" : "Active Outage",
        details: `Reason: ${f.reasonOfFailure || "N/A"}. Duration: ${f.duration || "N/A"}`,
        remarks: f.remarks
      });
    });

    // Sort by descending order of ID
    return history.sort((a, b) => b.id.localeCompare(a.id));
  }, [
    savedFaults,
    savedExchFaults,
    savedNetRecords,
    savedMadadRecords,
    savedVpRecords,
    savedCcRecords,
    savedWtRecords,
    savedWtrRecords,
    savedLiRecords,
    savedTjRecords,
    savedCgdmRecords,
    savedTibRecords,
    savedCctvmRecords,
    savedCctvsRecords,
    savedPuRecords,
    savedWifiRecords
  ]);

  // Auth form submit triggers
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");

    const savedUsersStr = localStorage.getItem("secr_users") || "{}";
    let savedUsers: Record<string, any> = {};
    try {
      savedUsers = JSON.parse(savedUsersStr);
    } catch (err) {
      savedUsers = {};
    }

    if (authTab === "user") {
      if (!otpMode) {
        const cleanMobile = authMobileNumber.trim();
        if (!/^\d{10}$/.test(cleanMobile)) {
          setAuthError("Please enter a valid 10-digit mobile number.");
          return;
        }

        const generatedOtp = "1234";
        setOtpSentCode(generatedOtp);
        setOtpMode(true);
        setAuthSuccessMsg(`OTP sent successfully: Code is ${generatedOtp}`);
      } else {
        if (authOtpCode !== otpSentCode && authOtpCode !== "1234") {
          setAuthError("Invalid OTP code. Please enter 1234.");
          return;
        }

        const cleanMobile = authMobileNumber.trim();
        let userRecord = savedUsers[cleanMobile];

        if (!userRecord) {
          const defaultMobiles: Record<string, any> = {
            "9876543210": { username: "Bilaspur Test Room", role: "testroom", division: "Bilaspur", mobile: "9876543210" },
            "9876543211": { username: "Raipur Test Room", role: "testroom", division: "Raipur", mobile: "9876543211" },
            "9876543212": { username: "Nagpur Test Room", role: "testroom", division: "Nagpur", mobile: "9876543212" }
          };
          userRecord = defaultMobiles[cleanMobile];
          if (userRecord) {
            savedUsers[cleanMobile] = userRecord;
            try {
              localStorage.setItem("secr_users", JSON.stringify(savedUsers));
            } catch (err) {
              console.warn("Storage sync failed", err);
            }
          }
        }

        if (!userRecord) {
          setAuthError("Mobile number is not registered. Please sign up first.");
          return;
        }

        const userProfile: UserProfile = {
          username: userRecord.username,
          role: "testroom",
          division: userRecord.division
        };

        try {
          localStorage.setItem("secr_current_user", JSON.stringify(userProfile));
        } catch (err) {
          console.warn("Session save failed", err);
        }
        setCurrentUser(userProfile);
        if (userProfile.division) {
          setSelectedDivision(userProfile.division);
        }

        setAuthMobileNumber("");
        setAuthOtpCode("");
        setOtpSentCode("");
        setOtpMode(false);
        setAuthSuccessMsg("");
      }
    } else {
      const cleanUsername = authUsername.trim();
      const normalizedUsername = cleanUsername.toLowerCase();
      let userRecord = savedUsers[normalizedUsername];

      if (!userRecord && normalizedUsername === "admin") {
        userRecord = { username: "admin", password: "password", role: "admin" };
        savedUsers[normalizedUsername] = userRecord;
        try {
          localStorage.setItem("secr_users", JSON.stringify(savedUsers));
        } catch (err) {
          console.warn("Storage sync failed", err);
        }
      }

      if (!userRecord || userRecord.password !== authPassword) {
        setAuthError("Invalid username or password.");
        return;
      }

      const userProfile: UserProfile = {
        username: userRecord.username,
        role: "admin"
      };

      try {
        localStorage.setItem("secr_current_user", JSON.stringify(userProfile));
      } catch (err) {
        console.warn("Session save failed", err);
      }
      setCurrentUser(userProfile);

      setAuthUsername("");
      setAuthPassword("");
      setAuthError("");
      setAuthSuccessMsg("");
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMsg("");

    const savedUsersStr = localStorage.getItem("secr_users") || "{}";
    let savedUsers: Record<string, any> = {};
    try {
      savedUsers = JSON.parse(savedUsersStr);
    } catch (err) {
      savedUsers = {};
    }

    if (signupRole === "testroom") {
      const cleanMobile = signupMobile.trim();
      const cleanName = signupName.trim();

      if (!cleanName) {
        setAuthError("Please enter your full name.");
        return;
      }
      if (!/^\d{10}$/.test(cleanMobile)) {
        setAuthError("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (savedUsers[cleanMobile]) {
        setAuthError("Mobile number is already registered.");
        return;
      }

      const newUser = {
        username: cleanName,
        role: "testroom",
        division: signupDivision,
        mobile: cleanMobile
      };

      savedUsers[cleanMobile] = newUser;
      localStorage.setItem("secr_users", JSON.stringify(savedUsers));

      const userProfile: UserProfile = {
        username: cleanName,
        role: "testroom",
        division: signupDivision
      };
      localStorage.setItem("secr_current_user", JSON.stringify(userProfile));
      setCurrentUser(userProfile);
      setSelectedDivision(signupDivision);

      setSignupName("");
      setSignupMobile("");
      setIsSignupMode(false);
    } else {
      const cleanName = signupName.trim();
      const normalizedName = cleanName.toLowerCase();

      if (!cleanName) {
        setAuthError("Please enter username.");
        return;
      }
      if (!signupPassword) {
        setAuthError("Please enter password.");
        return;
      }
      if (savedUsers[normalizedName]) {
        setAuthError("Username already exists.");
        return;
      }

      const newUser = {
        username: cleanName,
        password: signupPassword,
        role: "admin"
      };

      savedUsers[normalizedName] = newUser;
      localStorage.setItem("secr_users", JSON.stringify(savedUsers));

      const userProfile: UserProfile = {
        username: cleanName,
        role: "admin"
      };
      localStorage.setItem("secr_current_user", JSON.stringify(userProfile));
      setCurrentUser(userProfile);

      setSignupName("");
      setSignupPassword("");
      setIsSignupMode(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("secr_current_user");
    setCurrentUser(null);
    setUserMenuOpen(false);
    setAuthMobileNumber("");
    setAuthOtpCode("");
    setOtpMode(false);
    setAuthUsername("");
    setAuthPassword("");
    setAuthError("");
    setAuthSuccessMsg("");
    setActiveNavTab("recordform");
  };

  // Accelerator helpers
  const moveToNextCircuit = () => {
    if (!selectedCircuit) return;
    const currentIndex = CIRCUITS_DATABASE.findIndex((c) => c.id === selectedCircuit.id);
    if (currentIndex !== -1 && currentIndex < CIRCUITS_DATABASE.length - 1) {
      setSelectedCircuit(CIRCUITS_DATABASE[currentIndex + 1]);
      setShowSidebarOnMobile(false);
    } else {
      // End of list, clear selection or loop back
      setSelectedCircuit(null);
      setShowSidebarOnMobile(true);
    }
  };

  // Generic Status Form Handlers
  const handleSaveGenericLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCircuit || !logInput.trim()) return;

    const errors: Record<string, string> = {};
    if (!formMajorSection) errors.formMajorSection = "Major Section is required";
    if (!formSection) errors.formSection = "Section is required";
    if (!formStationLocation) errors.formStationLocation = "Station/Location is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const logKey = `${selectedDivision}_${selectedCircuit.id}`;
    const timestampStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const logDetails = `Today, ${timestampStr} - [${formStationLocation}] ${logInput.trim()}`;

    setUserLogs((prev) => ({
      ...prev,
      [logKey]: [logDetails, ...(prev[logKey] || [])],
    }));

    // Reset log box & fields
    setLogInput("");
    setFormMajorSection("");
    setFormSection("");
    setFormStationLocation("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAllOkGenericLog = () => {
    if (!selectedCircuit) return;
    const logKey = `${selectedDivision}_${selectedCircuit.id}`;
    const timestampStr = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const logDetails = `${timestampStr} - All systems functioning normally. Insulation parameters healthy. Walkie-Talkies verified. No outages or cable cuts reported.`;

    setUserLogs((prev) => ({
      ...prev,
      [logKey]: [logDetails, ...(prev[logKey] || [])],
    }));

    setLogInput("");
    setFormMajorSection("");
    setFormSection("");
    setFormStationLocation("");
    moveToNextCircuit();
  };

  // Sidebar navigation helpers
  const handleSelectCircuit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setShowSidebarOnMobile(false);
  };

  const handleToggleCategoryDropdown = (catName: string) => {
    setOpenDropdownCategory(openDropdownCategory === catName ? null : catName);
  };

  const getFilteredCategoryCircuits = (catName: string) => {
    const list = CIRCUITS_DATABASE.filter(c => c.category === catName);
    if (!searchQuery.trim()) return list;
    return list.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.badge.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  if (!currentUser) {
    return (
      <div className="auth-overlay">
        <div className="auth-card-container">
          <div className="auth-glass-card">
            <div className="auth-card-brand">
              <svg className="auth-brand-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9h18" strokeLinecap="round" />
                <path d="M12 3C7.5 3 4.5 6 3 9" strokeLinecap="round" />
                <path d="M12 3C16.5 3 19.5 6 21 9" strokeLinecap="round" />
                <rect x="5" y="11" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" />
                <rect x="9" y="11" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" />
                <rect x="13" y="11" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" />
                <rect x="17" y="11" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" />
                <path d="M2 19h20" strokeLinecap="round" />
                <path d="M1 21h22" strokeLinecap="round" />
              </svg>
              <span className="auth-brand-text">SECR TELECOM</span>
            </div>

            <p className="auth-card-subtitle">Log in to your account</p>

            <div className="auth-pill-switch">
              <button
                type="button"
                className={`pill-option user ${authTab === "user" ? "active" : ""}`}
                onClick={() => {
                  setAuthTab("user");
                  setAuthError("");
                  setAuthSuccessMsg("");
                  setOtpMode(false);
                  setIsSignupMode(false);
                }}
              >
                USER
              </button>
              <button
                type="button"
                className={`pill-option admin ${authTab === "admin" ? "active" : ""}`}
                onClick={() => {
                  setAuthTab("admin");
                  setAuthError("");
                  setAuthSuccessMsg("");
                  setOtpMode(false);
                  setIsSignupMode(false);
                }}
              >
                ADMIN
              </button>
            </div>

            {authError && <div className="auth-msg-banner error">{authError}</div>}
            {authSuccessMsg && <div className="auth-msg-banner success">{authSuccessMsg}</div>}

            {isSignupMode ? (
              <form onSubmit={handleSignupSubmit} className="auth-underlined-form">
                <div className="form-title-row">
                  <h3>Sign Up for Access</h3>
                </div>

                <div className="auth-field-group">
                  <label>Role</label>
                  <select
                    className="auth-underlined-select"
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as "admin" | "testroom")}
                  >
                    <option value="testroom">Test Room User</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>

                <div className="auth-field-group">
                  <label>{signupRole === "testroom" ? "FULL NAME" : "USERNAME"}</label>
                  <input
                    type="text"
                    className="auth-underlined-input"
                    placeholder={signupRole === "testroom" ? "Enter your name" : "Enter admin username"}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>

                {signupRole === "testroom" ? (
                  <>
                    <div className="auth-field-group">
                      <label>REGISTERED MOBILE NUMBER</label>
                      <input
                        type="text"
                        maxLength={10}
                        className="auth-underlined-input"
                        placeholder="Enter 10-digit number"
                        value={signupMobile}
                        onChange={(e) => setSignupMobile(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>

                    <div className="auth-field-group">
                      <label>ASSIGNED DIVISION</label>
                      <select
                        className="auth-underlined-select"
                        value={signupDivision}
                        onChange={(e) => setSignupDivision(e.target.value)}
                      >
                        <option value="Bilaspur">Bilaspur Division</option>
                        <option value="Raipur">Raipur Division</option>
                        <option value="Nagpur">Nagpur Division</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="auth-field-group">
                    <label>PASSWORD</label>
                    <input
                      type="password"
                      className="auth-underlined-input"
                      placeholder="Enter password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <button type="submit" className="auth-blue-pill-btn">
                  <span>Sign Up</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>

                <div className="auth-footer-toggle">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignupMode(false);
                      setAuthError("");
                      setAuthSuccessMsg("");
                    }}
                  >
                    LOG IN
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} className="auth-underlined-form">
                {authTab === "user" ? (
                  <>
                    {!otpMode ? (
                      <>
                        <div className="auth-field-group">
                          <label>REGISTERED MOBILE NUMBER</label>
                          <input
                            type="text"
                            maxLength={10}
                            className="auth-underlined-input"
                            placeholder="Enter 10-digit number"
                            value={authMobileNumber}
                            onChange={(e) => setAuthMobileNumber(e.target.value.replace(/\D/g, ""))}
                            required
                          />
                        </div>

                        <button type="submit" className="auth-blue-pill-btn">
                          <span>Get OTP</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="auth-field-group">
                          <label>ENTER 4-DIGIT OTP</label>
                          <input
                            type="text"
                            maxLength={4}
                            className="auth-underlined-input"
                            placeholder="Enter 4-digit code"
                            value={authOtpCode}
                            onChange={(e) => setAuthOtpCode(e.target.value.replace(/\D/g, ""))}
                            required
                          />
                        </div>

                        <div className="auth-field-hint" style={{ fontSize: "11px", color: "#64748b", marginTop: "-6px" }}>
                          Enter `1234` to verify OTP instantly.
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                          <button
                            type="button"
                            className="auth-blue-pill-btn"
                            style={{ flex: 1, backgroundColor: "rgba(15, 23, 42, 0.04)", border: "1px solid rgba(15, 23, 42, 0.08)", color: "#475569" }}
                            onClick={() => {
                              setOtpMode(false);
                              setAuthError("");
                              setAuthSuccessMsg("");
                            }}
                          >
                            Back
                          </button>
                          <button type="submit" className="auth-blue-pill-btn" style={{ flex: 1.5 }}>
                            <span>Verify OTP</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                        </div>
                      </>
                    )}

                    <div className="auth-footer-toggle">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignupMode(true);
                          setAuthError("");
                          setAuthSuccessMsg("");
                        }}
                      >
                        SIGN UP
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="auth-field-group">
                      <label>USERNAME</label>
                      <input
                        type="text"
                        className="auth-underlined-input"
                        placeholder="Enter admin username"
                        value={authUsername}
                        onChange={(e) => setAuthUsername(e.target.value)}
                        required
                      />
                    </div>

                    <div className="auth-field-group">
                      <label>PASSWORD</label>
                      <input
                        type="password"
                        className="auth-underlined-input"
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button type="submit" className="auth-blue-pill-btn">
                      <span>Login</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                      </svg>
                    </button>
                  </>
                )}
              </form>
            )}
          </div>

          <div className="auth-badge-footer">
            <div className="badge-title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M3 9h18" />
                <path d="M12 3C7.5 3 4.5 6 3 9" />
                <path d="M12 3C16.5 3 19.5 6 21 9" />
                <rect x="5" y="11" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" />
                <rect x="9" y="11" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" />
                <rect x="13" y="11" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" />
                <rect x="17" y="11" width="2" height="7" rx="0.5" fill="currentColor" stroke="none" />
                <path d="M2 19h20" />
                <path d="M1 21h22" />
              </svg>
              <span>AUTHORIZED PERSONNEL ONLY</span>
            </div>
            <p>
              By logging in, you agree that your session activity, device details, and location will be logged for security and auditing purposes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER SECTION */}
      <Header
        currentUser={currentUser}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        divisionDropdownOpen={divisionDropdownOpen}
        setDivisionDropdownOpen={setDivisionDropdownOpen}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        handleLogout={handleLogout}
        divisionRef={divisionRef}
        userMenuRef={userMenuRef}
      />

      {/* MAIN CONTENT SECTION */}
      <div className="dashboard-content">
        {activeNavTab === "recordform" ? (
          <>
            <Sidebar
              selectedCircuit={selectedCircuit}
              onSelectCircuit={handleSelectCircuit}
              showSidebarOnMobile={showSidebarOnMobile}
              openDropdownCategory={openDropdownCategory}
              onToggleCategoryDropdown={handleToggleCategoryDropdown}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              getFilteredCategoryCircuits={getFilteredCategoryCircuits}
              circuitRef={circuitRef}
              circuitsDatabase={CIRCUITS_DATABASE}
            />

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
                <div className="empty-state">
                  <p>Select a Circuit from the left panel to view details.</p>
                </div>
              ) : isStandardFaultCircuit(selectedCircuit) ? (
                <ControlFaultForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newFault) => setSavedFaults((prev) => [newFault, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.category === "Exchange" ? (
                <ExchangeForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newFault) => setSavedExchFaults((prev) => [newFault, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Railnet / Internet" ? (
                <RailnetForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedNetRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Rail Madad" ? (
                <RailMadadForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedMadadRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Railway Board Video Phones" ? (
                <VideoPhoneForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedVpRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Cable Cut (OFC & Quad)" ? (
                <CableCutForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedCcRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Walkie-Talkie Testing" ? (
                <WalkieTalkieTestingForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedWtRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Walkie-Talkie Repairing" ? (
                <WalkieTalkieRepairingForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedWtrRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Low Insulation" ? (
                <LowInsulationForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedLiRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Temporary Joints" ? (
                <TemporaryJointsForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedTjRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "CGDM" ? (
                <CgdmForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedCgdmRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "TIB" ? (
                <TibForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedTibRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.category === "CCTV" ? (
                <CctvForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => {
                    if (selectedCircuit.name === "CCTV Monitoring") {
                      setSavedCctvmRecords((prev) => [newRecord, ...prev]);
                    } else {
                      setSavedCctvsRecords((prev) => [newRecord, ...prev]);
                    }
                  }}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "PRS/UTS" ? (
                <PrsUtsForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedPuRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : selectedCircuit.name === "Wi-Fi" ? (
                <WifiForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  onSave={(newRecord) => setSavedWifiRecords((prev) => [newRecord, ...prev])}
                  moveToNextCircuit={moveToNextCircuit}
                />
              ) : (
                <GeneralStatusForm
                  selectedCircuit={selectedCircuit}
                  selectedDivision={selectedDivision}
                  activeStatus={activeStatus}
                  displayLogs={displayLogs}
                  formErrors={formErrors}
                  logInput={logInput}
                  setLogInput={setLogInput}
                  saveSuccess={saveSuccess}
                  onSaveLog={handleSaveGenericLog}
                  onAllOkLog={handleAllOkGenericLog}
                  formMajorSection={formMajorSection}
                  setFormMajorSection={setFormMajorSection}
                  formSection={formSection}
                  setFormSection={setFormSection}
                  formStationLocation={formStationLocation}
                  setFormStationLocation={setFormStationLocation}
                />
              )}
            </main>
          </>
        ) : activeNavTab === "dashboard" ? (
          <DashboardView />
        ) : (
          <HistoryView allSavedHistory={allSavedHistory} />
        )}
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
