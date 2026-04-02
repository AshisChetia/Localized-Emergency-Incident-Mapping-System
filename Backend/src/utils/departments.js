// ─────────────────────────────────────────
// utils/departments.js
// Hierarchical department structure for India
// Authorities select both major dept + sub-dept
// ─────────────────────────────────────────

export const DEPARTMENTS = {
  "Municipal Services": {
    id: "municipal_services",
    label: "Municipal Services",
    subDepartments: [
      { id: "sanitation", label: "Sanitation & Waste Management" },
      { id: "water_supply", label: "Water Supply" },
      { id: "street_maintenance", label: "Street Maintenance & Repairs" },
      { id: "parks_gardens", label: "Parks & Public Gardens" },
    ],
  },
  "Public Works & Infrastructure": {
    id: "public_works",
    label: "Public Works & Infrastructure",
    subDepartments: [
      { id: "roads", label: "Roads & Highways" },
      { id: "bridges", label: "Bridges & Overpasses" },
      { id: "drainage", label: "Drainage Systems" },
      { id: "public_buildings", label: "Public Buildings & Structures" },
    ],
  },
  "Utilities Administration": {
    id: "utilities",
    label: "Utilities Administration",
    subDepartments: [
      { id: "electricity", label: "Electricity Distribution" },
      { id: "water_sewage", label: "Water & Sewage Management" },
      { id: "gas", label: "Gas Distribution" },
      { id: "utilities_maintenance", label: "Utilities Maintenance" },
    ],
  },
};

// Get all major departments
export const getMajorDepartments = () => {
  return Object.values(DEPARTMENTS).map((dept) => ({
    id: dept.id,
    label: dept.label,
  }));
};

// Get sub-departments for a major department
export const getSubDepartments = (majorDeptId) => {
  const dept = Object.values(DEPARTMENTS).find((d) => d.id === majorDeptId);
  return dept ? dept.subDepartments : [];
};

// Validate major + sub department combination
export const isValidDepartmentCombination = (majorDeptId, subDeptId) => {
  const dept = Object.values(DEPARTMENTS).find((d) => d.id === majorDeptId);
  if (!dept) return false;
  return dept.subDepartments.some((sub) => sub.id === subDeptId);
};

// Get department label from ID
export const getDepartmentLabel = (majorDeptId, subDeptId) => {
  const dept = Object.values(DEPARTMENTS).find((d) => d.id === majorDeptId);
  if (!dept) return null;
  
  const subDept = dept.subDepartments.find((sub) => sub.id === subDeptId);
  return subDept ? `${dept.label} > ${subDept.label}` : null;
};

export default DEPARTMENTS;
