import { Circuit } from "../types";

interface SidebarProps {
  selectedCircuit: Circuit | null;
  onSelectCircuit: (circuit: Circuit) => void;
  showSidebarOnMobile: boolean;
  openDropdownCategory: string | null;
  onToggleCategoryDropdown: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getFilteredCategoryCircuits: (cat: string) => Circuit[];
  circuitRef: React.RefObject<HTMLDivElement | null>;
  circuitsDatabase: Circuit[];
}

export default function Sidebar({
  selectedCircuit,
  onSelectCircuit,
  showSidebarOnMobile,
  openDropdownCategory,
  onToggleCategoryDropdown,
  searchQuery,
  setSearchQuery,
  getFilteredCategoryCircuits,
  circuitRef,
  circuitsDatabase,
}: SidebarProps) {
  return (
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
        ].map((catName) => {
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
                    const circuit = circuitsDatabase.find(c => c.category === "Rail Madad");
                    if (circuit) {
                      onSelectCircuit(circuit);
                    }
                  } else {
                    onToggleCategoryDropdown(catName);
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

              {isSelectedInCat && !isOpen && catName !== "Rail Madad" && (
                <div className="category-selected-preview">
                  <span className="dot"></span>
                  <span>{selectedCircuit.name}</span>
                </div>
              )}

              {isOpen && catName !== "Rail Madad" && (
                <div className="circuit-dropdown-inline-box">
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

                  <div className="circuit-dropdown-list" style={{ maxHeight: "180px", overflowY: "auto" }}>
                    {filteredList.length > 0 ? (
                      filteredList.map((circuit) => (
                        <div
                          key={circuit.id}
                          className={`circuit-item ${selectedCircuit?.id === circuit.id ? "active" : ""}`}
                          onClick={() => {
                            onSelectCircuit(circuit);
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
  );
}
