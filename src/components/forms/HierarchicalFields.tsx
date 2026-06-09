import { HIERARCHICAL_DATA } from "../../data/circuits";

interface HierarchicalFieldsProps {
  selectedDivision: string;
  formMajorSection: string;
  setFormMajorSection: (val: string) => void;
  formSection: string;
  setFormSection: (val: string) => void;
  formStationLocation: string;
  setFormStationLocation: (val: string) => void;
  errors: Record<string, string>;
  excludeStationLocation?: boolean;
  excludeSectionYard?: boolean; // For temporary joints where we don't render standard section/station
}

export default function HierarchicalFields({
  selectedDivision,
  formMajorSection,
  setFormMajorSection,
  formSection,
  setFormSection,
  formStationLocation,
  setFormStationLocation,
  errors,
  excludeStationLocation = false,
  excludeSectionYard = false,
}: HierarchicalFieldsProps) {
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

  if (excludeSectionYard) {
    return null;
  }

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

      {!excludeStationLocation && (
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
      )}
    </>
  );
}
