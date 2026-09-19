// ==========================================================================
// ITTOVA Initial Seed Database
// Clean schema aligned with ITTOX ITOVA platform specifications
// ==========================================================================

export const INITIAL_DB = {
  customers: [],
  vendors: [],
  staff: [
    { id: 'S-1', name: 'P. Sharma', role: 'PROCESS_VALIDATOR', title: 'Process Verification Engineer' },
    { id: 'S-2', name: 'V. Kumar', role: 'VENDOR_AUDIT', title: 'Vendor Audit Officer' },
    { id: 'S-3', name: 'I. Reddy', role: 'INSPECTOR', title: 'IGI & QC Inspection Specialist' },
    { id: 'S-4', name: 'L. Das', role: 'LOGISTICS', title: 'Logistics Coordinator' },
    { id: 'S-5', name: 'A. Rao', role: 'CUSTOMER_AUDIT', title: 'Customer KYC & Credit Auditor' },
    { id: 'S-6', name: 'S. Verma', role: 'STORES', title: 'Stores & Intake Officer' }
  ],
  projects: []
};
