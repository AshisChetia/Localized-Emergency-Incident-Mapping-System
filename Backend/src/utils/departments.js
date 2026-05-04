// ─────────────────────────────────────────
// utils/departments.js
// Simplified Department structure for LEIMS
// ─────────────────────────────────────────

export const MASTER_DEPARTMENTS = [
  { id: "pwd", label: "Public Works Department (PWD)" },
  { id: "water_supply", label: "Water Supply Department" },
  { id: "electricity", label: "Electricity Department" },
  { id: "garbage_management", label: "Garbage Management" }
];

export const isValidDepartment = (deptId) => {
  return MASTER_DEPARTMENTS.some(d => d.id === deptId);
};

export const getDepartmentLabel = (deptId) => {
  const dept = MASTER_DEPARTMENTS.find(d => d.id === deptId);
  return dept ? dept.label : null;
};

export default MASTER_DEPARTMENTS;
