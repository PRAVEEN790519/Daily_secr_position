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
}

// 17 Circuit categories with rich operational mock data for each division
const CIRCUITS_DATABASE: Circuit[] = [
  {
    id: 1,
    name: "ICMS & COM Position",
    badge: "ICMS",
    systemCode: "SECR/TEL/ICMS-01",
    description: "Integrated Coaching Management System & Control Office Application status tracking.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 11:30 AM",
        details: [
          { label: "ICMS Server Status", value: "ONLINE (Primary)" },
          { label: "COM Network Latency", value: "24 ms (Excellent)" },
          { label: "Active Terminal Count", value: "14 Nodes Connected" },
          { label: "Backup Uplink Route", value: "Secondary OFC (Standby)" }
        ],
        recentLogs: [
          "11:30 AM - Routine ping checks completed. Packet loss: 0%.",
          "09:15 AM - Backup channel automatic switchover test successful."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 10:45 AM",
        details: [
          { label: "ICMS Server Status", value: "ONLINE (Primary)" },
          { label: "COM Network Latency", value: "32 ms (Good)" },
          { label: "Active Terminal Count", value: "9 Nodes Connected" },
          { label: "Backup Uplink Route", value: "Secondary OFC (Standby)" }
        ],
        recentLogs: [
          "10:45 AM - System sync check passed with HQ server.",
          "08:00 AM - Shift change login reports normal functionality across terminals."
        ]
      },
      Nagpur: {
        status: "degraded",
        lastUpdated: "Today, 12:15 PM",
        details: [
          { label: "ICMS Server Status", value: "ONLINE (Alternate Path)" },
          { label: "COM Network Latency", value: "95 ms (High)" },
          { label: "Active Terminal Count", value: "8 Nodes Connected" },
          { label: "Backup Uplink Route", value: "Active (Primary OFC Link Outage)" }
        ],
        recentLogs: [
          "12:15 PM - High latency observed due to alternate routing via Gondia ring.",
          "10:30 AM - Primary link down. Auto-switched to alternate media. Section engineer notified."
        ]
      }
    }
  },
  {
    id: 2,
    name: "FOIS",
    badge: "FOIS",
    systemCode: "SECR/TEL/FOIS-02",
    description: "Freight Operations Information System terminal connectivity and central host communications.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 12:40 PM",
        details: [
          { label: "FOIS Terminal Server", value: "ONLINE" },
          { label: "CRIS Host Link Status", value: "CONNECTED" },
          { label: "Loading Points Checked", value: "18/18 Operational" },
          { label: "Packet Loss Rate", value: "0.01%" }
        ],
        recentLogs: [
          "12:40 PM - CRIS main server communication verified. Sync complete.",
          "07:30 AM - Loading point terminal at BSP yard rebooted during shift change."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 11:50 AM",
        details: [
          { label: "FOIS Terminal Server", value: "ONLINE" },
          { label: "CRIS Host Link Status", value: "CONNECTED" },
          { label: "Loading Points Checked", value: "12/12 Operational" },
          { label: "Packet Loss Rate", value: "0.00%" }
        ],
        recentLogs: [
          "11:50 AM - All terminals operating normally. Zero pending complaints.",
          "08:20 AM - Daily network throughput checks passed."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 10:10 AM",
        details: [
          { label: "FOIS Terminal Server", value: "ONLINE" },
          { label: "CRIS Host Link Status", value: "CONNECTED" },
          { label: "Loading Points Checked", value: "11/11 Operational" },
          { label: "Packet Loss Rate", value: "0.05%" }
        ],
        recentLogs: [
          "10:10 AM - Connectivity test completed for MIB yard terminals. Status OK.",
          "06:45 AM - Switchport reset in server rack resolved temporary login delay."
        ]
      }
    }
  },
  {
    id: 3,
    name: "Exchange",
    badge: "EXCH",
    systemCode: "SECR/TEL/EXCH-03",
    description: "Railway Telephone Exchange lines, SIP servers, and VoIP channels monitoring.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:10 PM",
        details: [
          { label: "SIP Main Server Status", value: "ONLINE" },
          { label: "Analog Lines Active", value: "242 / 250 Lines" },
          { label: "VoIP Channels Healthy", value: "99.2% Channels Available" },
          { label: "Primary ISDN PRI Link", value: "ACTIVE" }
        ],
        recentLogs: [
          "01:10 PM - PRI line signaling checked. Response within thresholds.",
          "09:00 AM - Routine maintenance on MDF terminal block completed."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 12:30 PM",
        details: [
          { label: "SIP Main Server Status", value: "ONLINE" },
          { label: "Analog Lines Active", value: "181 / 185 Lines" },
          { label: "VoIP Channels Healthy", value: "100% Channels Available" },
          { label: "Primary ISDN PRI Link", value: "ACTIVE" }
        ],
        recentLogs: [
          "12:30 PM - SIP registration queries processed. No failures.",
          "08:00 AM - Shift logging confirmed full operational capability."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 01:05 PM",
        details: [
          { label: "SIP Main Server Status", value: "ONLINE" },
          { label: "Analog Lines Active", value: "114 / 120 Lines" },
          { label: "VoIP Channels Healthy", value: "98.5% Channels Available" },
          { label: "Primary ISDN PRI Link", value: "ACTIVE (Alternate Path)" }
        ],
        recentLogs: [
          "01:05 PM - Main exchanges dial test passed successfully.",
          "10:45 AM - Secondary PRI channel noise level resolved after cable re-termination."
        ]
      }
    }
  },
  {
    id: 4,
    name: "CCTV",
    badge: "VSS",
    systemCode: "SECR/TEL/CCTV-04",
    description: "Station Video Surveillance System (VSS) cameras and Network Video Recorder (NVR) storage.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:20 PM",
        details: [
          { label: "Total Cameras Configured", value: "124 Cameras" },
          { label: "Active Operational Cameras", value: "122 Active" },
          { label: "NVR Storage Status", value: "ONLINE (28/30 Days Retained)" },
          { label: "System Frame Rate Status", value: "Stable 25fps" }
        ],
        recentLogs: [
          "01:20 PM - 2 cameras on Platform 3 reported fuzzy feed. Lens cleaned.",
          "09:10 AM - Backup storage server array rebuild check: completed successfully."
        ]
      },
      Raipur: {
        status: "degraded",
        lastUpdated: "Today, 12:45 PM",
        details: [
          { label: "Total Cameras Configured", value: "85 Cameras" },
          { label: "Active Operational Cameras", value: "79 Active (6 Offline)" },
          { label: "NVR Storage Status", value: "ONLINE (29/30 Days Retained)" },
          { label: "Offline Locations", value: "PF 2 East End, Waiting Hall 1" }
        ],
        recentLogs: [
          "12:45 PM - PoE switch at PF 2 East End power cycled. 2 cameras restored.",
          "10:00 AM - 4 cameras offline reported at Raipur main entrance due to cable work."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 01:00 PM",
        details: [
          { label: "Total Cameras Configured", value: "96 Cameras" },
          { label: "Active Operational Cameras", value: "94 Active" },
          { label: "NVR Storage Status", value: "ONLINE (24/30 Days Retained)" },
          { label: "VSS Server Temperature", value: "22°C (Optimal)" }
        ],
        recentLogs: [
          "01:00 PM - Routine system health report generated.",
          "08:15 AM - Camera alignment adjusted at ticketing hall lobby."
        ]
      }
    }
  },
  {
    id: 5,
    name: "Railnet / Internet",
    badge: "NET",
    systemCode: "SECR/TEL/NET-05",
    description: "Railway Intranet (RailNet) and broadband internet gateways routing operational traffic.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:30 PM",
        details: [
          { label: "Primary Gateway Link", value: "ACTIVE (RailTel 1 Gbps)" },
          { label: "Secondary Backup Link", value: "STANDBY (Healthy)" },
          { label: "IP Pool Utilization", value: "92% Allocated" },
          { label: "DNS Resolution Time", value: "8 ms" }
        ],
        recentLogs: [
          "01:30 PM - Gateway traffic monitoring shows normal utilization levels.",
          "06:00 AM - Monthly bandwidth quota refresh applied automatically."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 01:15 PM",
        details: [
          { label: "Primary Gateway Link", value: "ACTIVE (RailTel 500 Mbps)" },
          { label: "Secondary Backup Link", value: "ACTIVE (Load Balanced)" },
          { label: "IP Pool Utilization", value: "71% Allocated" },
          { label: "DNS Resolution Time", value: "11 ms" }
        ],
        recentLogs: [
          "01:15 PM - Active routing table verified. Load balancing operational.",
          "08:30 AM - Firewall rules updated to block unauthorized protocols."
        ]
      },
      Nagpur: {
        status: "degraded",
        lastUpdated: "Today, 01:25 PM",
        details: [
          { label: "Primary Gateway Link", value: "ACTIVE (RailTel 500 Mbps)" },
          { label: "Secondary Backup Link", value: "OFFLINE (Link Error)" },
          { label: "IP Pool Utilization", value: "83% Allocated" },
          { label: "Gateway Status Alert", value: "No redundancy active" }
        ],
        recentLogs: [
          "01:25 PM - Alternate ISP link reported fiber cut in local loop. RailTel notified.",
          "11:00 AM - Secondary firewall unit rebooted for firmware inspection."
        ]
      }
    }
  },
  {
    id: 6,
    name: "CGDB",
    badge: "CGDB",
    systemCode: "SECR/TEL/CGDB-06",
    description: "Coach Guidance Display Boards at platforms displaying coach sequences.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 12:55 PM",
        details: [
          { label: "Platform Boards Status", value: "Platform 1-8 ONLINE" },
          { label: "Central Controller Link", value: "ACTIVE" },
          { label: "Display Nodes Verified", value: "123 / 128 Active" },
          { label: "Sync Latency Status", value: "Normal (<1.5s)" }
        ],
        recentLogs: [
          "12:55 PM - Coach sequence sync checked for Train 12833. Update successful.",
          "10:15 AM - PF 4 display board node 14 replaced due to LED panel fade."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 11:20 AM",
        details: [
          { label: "Platform Boards Status", value: "Platform 1-6 ONLINE" },
          { label: "Central Controller Link", value: "ACTIVE" },
          { label: "Display Nodes Verified", value: "96 / 96 Active" },
          { label: "Sync Latency Status", value: "Normal (<1.0s)" }
        ],
        recentLogs: [
          "11:20 AM - Integration test with national train database successful.",
          "08:45 AM - Morning test text broadcast on all screens completed."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 12:40 PM",
        details: [
          { label: "Platform Boards Status", value: "Platform 1-4 ONLINE" },
          { label: "Central Controller Link", value: "ACTIVE" },
          { label: "Display Nodes Verified", value: "59 / 64 Active" },
          { label: "Sync Latency Status", value: "Normal (<1.8s)" }
        ],
        recentLogs: [
          "12:40 PM - Comm loop check completed. Offline panels scheduled for repair.",
          "09:30 AM - Controller IP address remapped to avoid local gateway conflicts."
        ]
      }
    }
  },
  {
    id: 7,
    name: "TIB",
    badge: "TIB",
    systemCode: "SECR/TEL/TIB-07",
    description: "Train Indication Boards (PIDS) displaying train arrival/departure status.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:00 PM",
        details: [
          { label: "Main Station Display Board", value: "ONLINE" },
          { label: "PIDS Central Server Link", value: "ACTIVE" },
          { label: "Display Panels Sync", value: "SYNCED (100%)" },
          { label: "Manual Override Panel", value: "READY" }
        ],
        recentLogs: [
          "01:00 PM - Routine NTP time sync completed across all indication systems.",
          "09:15 AM - Station main board luminance adjusted for day viewing."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 12:00 PM",
        details: [
          { label: "Main Station Display Board", value: "ONLINE" },
          { label: "PIDS Central Server Link", value: "ACTIVE" },
          { label: "Display Panels Sync", value: "SYNCED (100%)" },
          { label: "Manual Override Panel", value: "READY" }
        ],
        recentLogs: [
          "12:00 PM - Data stream verified from divisional control charts.",
          "07:30 AM - System reboot for daily configuration refresh completed."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 01:10 PM",
        details: [
          { label: "Main Station Display Board", value: "ONLINE" },
          { label: "PIDS Central Server Link", value: "ACTIVE" },
          { label: "Display Panels Sync", value: "SYNCED (100%)" },
          { label: "Manual Override Panel", value: "READY" }
        ],
        recentLogs: [
          "01:10 PM - Live feed from NTES checked and running.",
          "09:40 AM - Terminal controller chassis cleaned and fan checked."
        ]
      }
    }
  },
  {
    id: 8,
    name: "Wi-Fi",
    badge: "WIFI",
    systemCode: "SECR/TEL/WIFI-08",
    description: "Station Public Wi-Fi access points and user session load tracking (RailWire).",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:35 PM",
        details: [
          { label: "Total Access Points", value: "48 APs Online" },
          { label: "Active Connected Users", value: "1,242 Users" },
          { label: "Average Session Speed", value: "12.4 Mbps" },
          { label: "DHCP Lease Pool Status", value: "15% Free (Optimal)" }
        ],
        recentLogs: [
          "01:35 PM - Bandwidth usage metrics peak checked at Platform 1 & 2.",
          "11:15 AM - 1 access point near VIP lounge rebooted due to high association count."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 01:10 PM",
        details: [
          { label: "Total Access Points", value: "32 APs Online" },
          { label: "Active Connected Users", value: "818 Users" },
          { label: "Average Session Speed", value: "15.1 Mbps" },
          { label: "DHCP Lease Pool Status", value: "38% Free" }
        ],
        recentLogs: [
          "01:10 PM - Public portal login logs normal auth success rates.",
          "08:30 AM - Wireless signal spectrum scan indicates clean channels."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 12:50 PM",
        details: [
          { label: "Total Access Points", value: "36 APs Online" },
          { label: "Active Connected Users", value: "904 Users" },
          { label: "Average Session Speed", value: "10.8 Mbps" },
          { label: "DHCP Lease Pool Status", value: "30% Free" }
        ],
        recentLogs: [
          "12:50 PM - User session duration limits verified with RailTel RADIUS server.",
          "09:10 AM - Local AP coverage mapping checked at passenger waiting halls."
        ]
      }
    }
  },
  {
    id: 9,
    name: "UTS / PRS",
    badge: "TKT",
    systemCode: "SECR/TEL/UTS-09",
    description: "Passenger reservation and ticketing systems communication networks status.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:25 PM",
        details: [
          { label: "UTS Thin Client Network", value: "ONLINE" },
          { label: "PRS Central Link Status", value: "CONNECTED (Active)" },
          { label: "Operational UTS Counters", value: "12 Counters Active" },
          { label: "Operational PRS Counters", value: "8 Counters Active" }
        ],
        recentLogs: [
          "01:25 PM - Ticket printing transaction latency verified (<200ms).",
          "08:00 AM - Morning PRS terminal configurations activated without issues."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 01:10 PM",
        details: [
          { label: "UTS Thin Client Network", value: "ONLINE" },
          { label: "PRS Central Link Status", value: "CONNECTED (Active)" },
          { label: "Operational UTS Counters", value: "8 Counters Active" },
          { label: "Operational PRS Counters", value: "6 Counters Active" }
        ],
        recentLogs: [
          "01:10 PM - System heartbeat monitored. Network path stable.",
          "08:00 AM - Shift switchover diagnostics completed successfully."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 12:45 PM",
        details: [
          { label: "UTS Thin Client Network", value: "ONLINE" },
          { label: "PRS Central Link Status", value: "CONNECTED (Active)" },
          { label: "Operational UTS Counters", value: "6 Counters Active" },
          { label: "Operational PRS Counters", value: "4 Counters Active" }
        ],
        recentLogs: [
          "12:45 PM - Checked secondary backup VSAT link. Standby mode active.",
          "08:15 AM - Terminal hardware testing at NGP booking office cleared."
        ]
      }
    }
  },
  {
    id: 10,
    name: "Cable Cut (OFC & Quad)",
    badge: "OFC",
    systemCode: "SECR/TEL/CUT-10",
    description: "Real-time tracking of Optical Fiber Cable and Quad telecom medium cuts and disruptions.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:30 PM",
        details: [
          { label: "Outstanding Cable Cuts", value: "0 Active Cuts" },
          { label: "OFC Ring Status", value: "Fully Protected Ring" },
          { label: "OTDR Status Check", value: "Normal (Clear)" },
          { label: "Quad Medium Status", value: "Healthy" }
        ],
        recentLogs: [
          "01:30 PM - Continuous loop test reports normal attenuation levels.",
          "09:00 AM - Patrolling reports submitted for Champa-Gevra Road section. All secure."
        ]
      },
      Raipur: {
        status: "critical",
        lastUpdated: "Today, 01:40 PM",
        details: [
          { label: "Outstanding Cable Cuts", value: "1 Active Cut" },
          { label: "Cut Location Location", value: "KM 142/6 (R-URD Section)" },
          { label: "Restoration Status", value: "Splicing in Progress" },
          { label: "Traffic Status", value: "Diverted to alternate ring (No disruption)" }
        ],
        recentLogs: [
          "01:40 PM - Jointing team has reached the site. Splicing started on 24-core fiber.",
          "12:15 PM - Fiber cut alarm triggered on Raipur-Urad section. OTDR localized cut at KM 142/6."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 01:10 PM",
        details: [
          { label: "Outstanding Cable Cuts", value: "0 Active Cuts" },
          { label: "OFC Ring Status", value: "Fully Protected Ring" },
          { label: "OTDR Status Check", value: "Normal (Clear)" },
          { label: "Quad Medium Status", value: "Healthy" }
        ],
        recentLogs: [
          "01:10 PM - Loop testing checks resolved without alarms.",
          "08:30 AM - Section engineer confirms complete clearance of third-party track excavation zone."
        ]
      }
    }
  },
  {
    id: 11,
    name: "Temporary Joints",
    badge: "JOINT",
    systemCode: "SECR/TEL/JNT-11",
    description: "Tracking temporary joints in OFC network requiring permanent splicing block.",
    divisionData: {
      Bilaspur: {
        status: "degraded",
        lastUpdated: "Today, 11:00 AM",
        details: [
          { label: "Active Temporary Joints", value: "4 Joints Registered" },
          { label: "Joint Locations", value: "KM 42/2, KM 118/4, KM 192/1, KM 204/8" },
          { label: "Permanency Schedule", value: "Awaiting Next Scheduled Block" },
          { label: "Average Joint Loss", value: "0.22 dB (Acceptable)" }
        ],
        recentLogs: [
          "11:00 AM - Checked joint status at KM 42/2. Enclosure sealed and dry.",
          "09:30 AM - Block request submitted for permanent splicing on Gevra Road route."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 10:15 AM",
        details: [
          { label: "Active Temporary Joints", value: "2 Joints Registered" },
          { label: "Joint Locations", value: "KM 88/1, KM 112/5" },
          { label: "Permanency Schedule", value: "Scheduled within 10 days" },
          { label: "Average Joint Loss", value: "0.15 dB" }
        ],
        recentLogs: [
          "10:15 AM - Visual patrol checks confirm joint protection boxes intact.",
          "08:45 AM - Joint permanency plan drafted for upcoming line maintenance."
        ]
      },
      Nagpur: {
        status: "degraded",
        lastUpdated: "Today, 12:45 PM",
        details: [
          { label: "Active Temporary Joints", value: "6 Joints Registered" },
          { label: "Joint Locations", value: "Quad sections (Various)" },
          { label: "Permanency Schedule", value: "Awaiting Quad-to-OFC conversion" },
          { label: "Average Joint Loss", value: "0.31 dB (High)" }
        ],
        recentLogs: [
          "12:45 PM - Joint loss at NGP-KAV section checked. Remapped line to fiber core 8.",
          "10:00 AM - Section supervisor recommends complete enclosure replacement at KM 22."
        ]
      }
    }
  },
  {
    id: 12,
    name: "Low Insulation",
    badge: "INS",
    systemCode: "SECR/TEL/INS-12",
    description: "Insulation monitoring of Quad Cables to prevent cross-talk and channel noise.",
    divisionData: {
      Bilaspur: {
        status: "degraded",
        lastUpdated: "Today, 01:25 PM",
        details: [
          { label: "Low Insulation Alarms", value: "2 Active Alarms" },
          { label: "Affected Sections", value: "BSP-USL Section, BYT-HN Section" },
          { label: "Measured Impedance", value: "0.4 Mega-Ohms (Threshold: 1.0)" },
          { label: "Action Status", value: "Megger testing scheduled today" }
        ],
        recentLogs: [
          "01:25 PM - Megger readings logged for BSP-USL. Joint condensation suspected.",
          "10:30 AM - Alarm flagged on quad pair 4 (Block circuit bypass)."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 11:00 AM",
        details: [
          { label: "Low Insulation Alarms", value: "0 Active Alarms" },
          { label: "Affected Sections", value: "None" },
          { label: "Measured Impedance", value: "All sections > 5.0 Mega-Ohms" },
          { label: "Action Status", value: "Standard compliance maintained" }
        ],
        recentLogs: [
          "11:00 AM - Routine insulation resistance checks completed. All channels healthy.",
          "07:30 AM - Log reports show zero static noise complaints."
        ]
      },
      Nagpur: {
        status: "degraded",
        lastUpdated: "Today, 01:40 PM",
        details: [
          { label: "Low Insulation Alarms", value: "3 Active Alarms" },
          { label: "Affected Sections", value: "NGP-KAV, NGP-ITR, ITR-KP Sections" },
          { label: "Measured Impedance", value: "0.3 Mega-Ohms (Degraded)" },
          { label: "Action Status", value: "Joint inspections planned" }
        ],
        recentLogs: [
          "01:40 PM - High humidity is affecting the NGP-ITR quad joints. Inspection team dispatched.",
          "11:00 AM - Routine testing flagged low insulation value on gate telephone circuit."
        ]
      }
    }
  },
  {
    id: 13,
    name: "Walkie-Talkie Testing",
    badge: "VHF-T",
    systemCode: "SECR/TEL/VHF-13",
    description: "Daily operational checks and battery monitoring of VHF Walkie-Talkies.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:15 PM",
        details: [
          { label: "Units Tested Today", value: "45 Walkie-Talkies" },
          { label: "Found Fit For Service", value: "45 Units (100% Fit)" },
          { label: "Batteries Replaced", value: "2 Units (Routine)" },
          { label: "Frequency Deviation Status", value: "Within limit (0.005%)" }
        ],
        recentLogs: [
          "01:15 PM - Station master and yard staff sets checked and certified OK.",
          "08:00 AM - Morning shift testing completed. Total 45 walkie-talkies verified."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 12:45 PM",
        details: [
          { label: "Units Tested Today", value: "32 Walkie-Talkies" },
          { label: "Found Fit For Service", value: "31 Units (1 Unit faulty)" },
          { label: "Batteries Replaced", value: "1 Unit" },
          { label: "Faulty Unit ID", value: "WT/RPR/421 (Low TX output)" }
        ],
        recentLogs: [
          "12:45 PM - Unit WT/RPR/421 sent to divisional workshop for repair.",
          "08:15 AM - Operational VHF sync test completed with station controls."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 01:00 PM",
        details: [
          { label: "Units Tested Today", value: "38 Walkie-Talkies" },
          { label: "Found Fit For Service", value: "38 Units" },
          { label: "Batteries Replaced", value: "3 Units" },
          { label: "Frequency Deviation Status", value: "Within limit" }
        ],
        recentLogs: [
          "01:00 PM - Shift testing for loco pilots and guards completed. All OK.",
          "09:10 AM - Standby battery bank charge level verified."
        ]
      }
    }
  },
  {
    id: 14,
    name: "Walkie-Talkie Repairing",
    badge: "VHF-R",
    systemCode: "SECR/TEL/VHF-14",
    description: "Tracking repairs, spare parts inventory, and turnaround times in telecom workshops.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:25 PM",
        details: [
          { label: "Units In Workshop", value: "6 Walkie-Talkies" },
          { label: "Repaired Today", value: "2 Units" },
          { label: "Pending Spare Parts", value: "4 Units (On Order)" },
          { label: "Average Turnaround Time", value: "3.2 Days" }
        ],
        recentLogs: [
          "01:25 PM - 2 sets with audio distortion repaired (speaker module replaced).",
          "11:15 AM - Spares requisition list sent to stores department."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 11:30 AM",
        details: [
          { label: "Units In Workshop", value: "4 Walkie-Talkies" },
          { label: "Repaired Today", value: "1 Unit" },
          { label: "Pending Spare Parts", value: "3 Units" },
          { label: "Average Turnaround Time", value: "4.1 Days" }
        ],
        recentLogs: [
          "11:30 AM - Unit WT/RPR/421 registered in workshop system.",
          "09:00 AM - Diagnostic testing on transmitter modules completed."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 12:20 PM",
        details: [
          { label: "Units In Workshop", value: "8 Walkie-Talkies" },
          { label: "Repaired Today", value: "3 Units" },
          { label: "Pending Spare Parts", value: "5 Units" },
          { label: "Average Turnaround Time", value: "3.8 Days" }
        ],
        recentLogs: [
          "12:20 PM - 3 walkie-talkies returned to service with new battery latch mechanisms.",
          "10:45 AM - Circuit board cleaning and soldering of antenna terminals completed."
        ]
      }
    }
  },
  {
    id: 15,
    name: "Rail Madad",
    badge: "MADAD",
    systemCode: "SECR/TEL/MAD-15",
    description: "Operational status and complaint resolution monitoring for passenger portal (Rail Madad).",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 01:30 PM",
        details: [
          { label: "Active Open Complaints", value: "0 Complaints" },
          { label: "Average Resolution Time", value: "12 Minutes" },
          { label: "HQ Portal Integration", value: "CONNECTED" },
          { label: "Daily Total Resolved", value: "14 Complaints" }
        ],
        recentLogs: [
          "01:30 PM - Zero pending complaints logged in dashboard.",
          "11:45 AM - Telecom complaint at BSP VIP waiting room resolved within 8 minutes."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 01:25 PM",
        details: [
          { label: "Active Open Complaints", value: "1 Complaint" },
          { label: "Average Resolution Time", value: "18 Minutes" },
          { label: "HQ Portal Integration", value: "CONNECTED" },
          { label: "Pending Issue", value: "Wi-Fi login issue reported at RPR PF 1" }
        ],
        recentLogs: [
          "01:25 PM - Wi-Fi AP login failure complaint received. Support team investigating.",
          "10:15 AM - Station phone line complaint resolved at booking counter."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 01:10 PM",
        details: [
          { label: "Active Open Complaints", value: "0 Complaints" },
          { label: "Average Resolution Time", value: "15 Minutes" },
          { label: "HQ Portal Integration", value: "CONNECTED" },
          { label: "Daily Total Resolved", value: "9 Complaints" }
        ],
        recentLogs: [
          "01:10 PM - Rail Madad queue checked. Status: clear.",
          "08:30 AM - Network node socket replaced at ticketing hall to fix ticket machine disconnect."
        ]
      }
    }
  },
  {
    id: 16,
    name: "Video Conferencing Test with Divisions",
    badge: "VC-D",
    systemCode: "SECR/TEL/VC-16",
    description: "Daily checks and signal diagnostics of videoconferencing links from HQ to Divisions.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 11:15 AM",
        details: [
          { label: "HQ to BSP VC Link", value: "TESTED OK" },
          { label: "Packet Loss Rate", value: "0.1% (Excellent)" },
          { label: "Audio Reception Quality", value: "Clear & Stable" },
          { label: "Video Reception Quality", value: "HD 1080p (Stable)" }
        ],
        recentLogs: [
          "11:15 AM - Morning video call test with BSP Divisional Telecom Office passed.",
          "09:30 AM - MCU system sync and port routing validated."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 11:20 AM",
        details: [
          { label: "HQ to R VC Link", value: "TESTED OK" },
          { label: "Packet Loss Rate", value: "0.2% (Good)" },
          { label: "Audio Reception Quality", value: "Clear" },
          { label: "Video Reception Quality", value: "HD 1080p (Stable)" }
        ],
        recentLogs: [
          "11:20 AM - Connection test completed with Raipur Telecom Control. Resolution 1080p.",
          "09:35 AM - Router policy check for voice/video packets validated."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 11:25 AM",
        details: [
          { label: "HQ to NGP VC Link", value: "TESTED OK" },
          { label: "Packet Loss Rate", value: "0.5% (Acceptable)" },
          { label: "Audio Reception Quality", value: "Normal (Slight latency)" },
          { label: "Video Reception Quality", value: "HD 720p (Stable)" }
        ],
        recentLogs: [
          "11:25 AM - Connection test completed. 720p stream active due to routing via alternate ring.",
          "09:40 AM - Codec system rebooted to refresh cache."
        ]
      }
    }
  },
  {
    id: 17,
    name: "Railway Board Video Phone Test",
    badge: "VP-RB",
    systemCode: "SECR/TEL/VPHONE-17",
    description: "Integrated Video Phone terminal communication tests linking SECR to Railway Board.",
    divisionData: {
      Bilaspur: {
        status: "normal",
        lastUpdated: "Today, 10:30 AM",
        details: [
          { label: "Terminal Status Check", value: "ONLINE" },
          { label: "Direct Dialing Extension", value: "38920" },
          { label: "Link Margin Score", value: "99.8% (Optimal)" },
          { label: "SIP Registration Status", value: "Registered with RB Call Manager" }
        ],
        recentLogs: [
          "10:30 AM - Direct loop dial test with RB Telecom desk completed. Link OK.",
          "08:30 AM - Video call hardware diagnostics: success."
        ]
      },
      Raipur: {
        status: "normal",
        lastUpdated: "Today, 10:35 AM",
        details: [
          { label: "Terminal Status Check", value: "ONLINE" },
          { label: "Direct Dialing Extension", value: "38921" },
          { label: "Link Margin Score", value: "99.5%" },
          { label: "SIP Registration Status", value: "Registered with RB Call Manager" }
        ],
        recentLogs: [
          "10:35 AM - Dial tone and link routing checks passed.",
          "08:40 AM - Echo cancellation levels adjusted on handset."
        ]
      },
      Nagpur: {
        status: "normal",
        lastUpdated: "Today, 10:40 AM",
        details: [
          { label: "Terminal Status Check", value: "ONLINE" },
          { label: "Direct Dialing Extension", value: "38922" },
          { label: "Link Margin Score", value: "99.2%" },
          { label: "SIP Registration Status", value: "Registered with RB Call Manager" }
        ],
        recentLogs: [
          "10:40 AM - Audio-video loop test completed successfully.",
          "08:45 AM - Device uptime stats checked: 14 days without reset."
        ]
      }
    }
  }
];

export default function Home() {
  const [selectedDivision, setSelectedDivision] = useState<string>("Bilaspur");
  const [divisionDropdownOpen, setDivisionDropdownOpen] = useState<boolean>(false);
  const [selectedCircuit, setSelectedCircuit] = useState<Circuit | null>(null);
  const [circuitDropdownOpen, setCircuitDropdownOpen] = useState<boolean>(false);
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

  // Refs to handle click outside for dropdowns
  const divisionRef = useRef<HTMLDivElement>(null);
  const circuitRef = useRef<HTMLDivElement>(null);
  const reasonsRef = useRef<HTMLDivElement>(null);
  const exchangeRef = useRef<HTMLDivElement>(null);
  const exchReasonsRef = useRef<HTMLDivElement>(null);
  const netLocRef = useRef<HTMLDivElement>(null);
  const netReasonsRef = useRef<HTMLDivElement>(null);

  // Saved Logged Faults registry with dummy entry
  const [savedFaults, setSavedFaults] = useState<any[]>([
    {
      id: 1,
      division: "Bilaspur",
      faultySection: "BSP-CPH Section",
      circuitFailed: "ICMS Link Primary",
      failureTime: "02-06-2026 09:30",
      rectificationTime: "02-06-2026 11:15",
      duration: "1 Hrs 45 Min",
      reasons: "Equipment Failure (STM)",
      remarks: "STM unit card reset at Champa exchange."
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

  // Close dropdowns on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (divisionRef.current && !divisionRef.current.contains(event.target as Node)) {
        setDivisionDropdownOpen(false);
      }
      if (circuitRef.current && !circuitRef.current.contains(event.target as Node)) {
        setCircuitDropdownOpen(false);
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

  // Filter circuit list based on search query
  const filteredCircuits = useMemo(() => {
    if (!searchQuery.trim()) return CIRCUITS_DATABASE;
    return CIRCUITS_DATABASE.filter((circuit) =>
      circuit.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle circuit selection
  const handleSelectCircuit = (circuit: Circuit) => {
    setSelectedCircuit(circuit);
    setLogInput("");
    setSaveSuccess(false);
  };

  // Get active status details for the current selection
  const activeStatus = useMemo(() => {
    if (!selectedCircuit) return null;
    return selectedCircuit.divisionData[selectedDivision];
  }, [selectedCircuit, selectedDivision]);

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
          
          <div className="circuit-select-wrapper" ref={circuitRef}>
            <button
              className={`circuit-trigger ${circuitDropdownOpen ? "open" : ""}`}
              onClick={() => setCircuitDropdownOpen(!circuitDropdownOpen)}
              aria-label="Select Circuit"
            >
              <span>{selectedCircuit ? selectedCircuit.name : "Select a Circuit..."}</span>
            </button>
            
            {circuitDropdownOpen && (
              <div className="circuit-dropdown-menu">
                {/* Search input field inside dropdown */}
                <div className="circuit-dropdown-search-wrapper" style={{ position: "relative" }}>
                  <span className="circuit-dropdown-search-icon">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
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
                    aria-label="Search circuits"
                  />
                </div>

                {/* Scrollable list inside dropdown */}
                <div className="circuit-dropdown-list">
                  {filteredCircuits.length > 0 ? (
                    filteredCircuits.map((circuit) => (
                      <div
                        key={circuit.id}
                        className={`circuit-item ${selectedCircuit?.id === circuit.id ? "active" : ""}`}
                        onClick={() => {
                          handleSelectCircuit(circuit);
                          setCircuitDropdownOpen(false);
                        }}
                      >
                        <span>{circuit.name}</span>
                        <span className="circuit-badge">{circuit.badge}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: "12px", fontSize: "12.5px", color: "#6B7280", textAlign: "center" }}>
                      No circuits found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT PANEL */}
        <main className="right-panel">
          {!selectedCircuit ? (
            /* Empty State Placeholder View */
            <div className="empty-state">
              <p>Select a Circuit from the left panel to view details.</p>
            </div>
          ) : selectedCircuit.name === "ICMS & COM Position" ? (
            /* ICMS & COM Position - Fault Entry Form Workspace */
            <div className="workspace-content">
              {/* Workspace Title bar */}
              <div className="workspace-title-section">
                <div className="workspace-title-left">
                  <h2>ICMS & COM Position - Fault Entry Form</h2>
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
                  {savedFaults.filter(f => f.division === selectedDivision).length > 0 ? (
                    savedFaults
                      .filter(f => f.division === selectedDivision)
                      .map((fault) => (
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
          ) : selectedCircuit.name === "Exchange" ? (
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
