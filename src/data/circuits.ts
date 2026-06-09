import { Circuit, DivisionStatus, DetailRow } from "../types";

// 7 categories with 35+ circuits populated programmatically with realistic data
export const generateCircuitDatabase = (): Circuit[] => {
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
        { name: "PRS/UTS", badge: "PRS/UTS", code: "PRSUTS-11", desc: "Passenger Reservation System & Unreserved Ticketing System network terminals." }
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

export const CIRCUITS_DATABASE = generateCircuitDatabase();

export const isStandardFaultCircuit = (circuit: Circuit) => {
  return (
    circuit.category === "Communication & Voice Circuits" &&
    circuit.name !== "Rail Madad" &&
    circuit.name !== "Railway Board Video Phones"
  );
};

export const HIERARCHICAL_DATA: Record<string, {
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
