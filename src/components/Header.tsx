import { UserProfile } from "../types";

interface HeaderProps {
  currentUser: UserProfile;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  selectedDivision: string;
  setSelectedDivision: (division: string) => void;
  divisionDropdownOpen: boolean;
  setDivisionDropdownOpen: (open: boolean) => void;
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
  divisionRef: React.RefObject<HTMLDivElement | null>;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
}

export default function Header({
  currentUser,
  activeNavTab,
  setActiveNavTab,
  selectedDivision,
  setSelectedDivision,
  divisionDropdownOpen,
  setDivisionDropdownOpen,
  userMenuOpen,
  setUserMenuOpen,
  handleLogout,
  divisionRef,
  userMenuRef,
}: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="secr-logo" title="South East Central Railway">SECR</div>
        <div className="logo-text">
          <span className="logo-title" style={{ fontWeight: 800, fontSize: "14px" }}>South East Central Railway</span>
          <span className="logo-sub" style={{ fontWeight: 700, textTransform: "none", fontSize: "11px", color: "var(--text-secondary)", marginTop: "1px" }}>Daily Telecom Position</span>
        </div>
      </div>

      <div className="header-center">
        <nav className="header-navbar">
          <button
            type="button"
            className={`nav-item ${activeNavTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveNavTab("dashboard")}
          >
            Dashboard
          </button>
          {currentUser.role === "testroom" && (
            <button
              type="button"
              className={`nav-item ${activeNavTab === "recordform" ? "active" : ""}`}
              onClick={() => setActiveNavTab("recordform")}
            >
              Daily Position
            </button>
          )}
          <button
            type="button"
            className={`nav-item ${activeNavTab === "history" ? "active" : ""}`}
            onClick={() => setActiveNavTab("history")}
          >
            History
          </button>
        </nav>
      </div>

      <div className="header-right" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {currentUser.role === "admin" ? (
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
                    }}
                  >
                    {division}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="division-badge-lock" title="Your division is locked to this role">
            <span className="dot active"></span>
            <span>{currentUser.division} Division</span>
          </div>
        )}

        <div className="user-profile-widget" ref={userMenuRef}>
          <button
            type="button"
            className="user-profile-trigger"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="avatar-circle">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-meta-info">
              <span className="user-name-text">{currentUser.username}</span>
              <span className="user-role-badge">
                {currentUser.role === "admin" ? "Admin" : "Test Room"}
              </span>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className={`chevron-icon ${userMenuOpen ? "open" : ""}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {userMenuOpen && (
            <div className="user-profile-menu">
              <div className="menu-header">
                <span className="menu-header-name">{currentUser.username}</span>
                <span className="menu-header-detail">
                  {currentUser.role === "admin"
                    ? "System Administrator"
                    : `${currentUser.division} Test Room User`}
                </span>
              </div>
              <div className="menu-divider"></div>
              <button
                type="button"
                className="menu-logout-btn"
                onClick={handleLogout}
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
