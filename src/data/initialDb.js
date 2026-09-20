// ==========================================================================
// ITTOVA Initial Seed Database
// Clean schema aligned with ITTOX ITOVA platform specifications
// ==========================================================================

export const INITIAL_DB = {
  customers: [
    {
      id: 'C-101',
      name: 'Bharat Heavy Dynamics Ltd.',
      location: 'Balanagar Industrial Corridor, Hyderabad',
      phone: '+91 99887 76655',
      email: 'procurement@bharatdynamics.com',
      status: 'APPROVED',
      creditTier: 'Tier 1 - 30 Days Credit',
      creditLimit: '₹50,00,000',
      cin: 'U29299TG2015PLC099881',
      gst: '36AAACB1234F1Z5'
    }
  ],
  vendors: [
    {
      id: 'V-101',
      name: 'Apex Precision Aerospace & CNC Works',
      location: 'Cherlapally Industrial Estate, Phase II, Hyderabad',
      phone: '+91 98765 43210',
      email: 'production@apexprecision.in',
      status: 'APPROVED',
      auditScore: '96/100 (ISO 9001:2015 & AS9100D)',
      rating: 4.9,
      machines: [
        {
          id: 'M-101',
          name: 'Haas VF-4SS Super Speed',
          process: 'CNC MILLING',
          size: '1270 × 508 × 635 mm',
          axis: '4-Axis VMC (12,000 RPM)',
          materials: 'Aluminum 6061-T6, Tool Steel, SS 304',
          rate: 2200,
          status: 'Idle',
          audit: 'APPROVED'
        },
        {
          id: 'M-102',
          name: 'Doosan Puma GT2600',
          process: 'CNC TURNING',
          size: 'Ø410 × 650 mm',
          axis: '2-Axis CNC Turning',
          materials: 'Alloy Steel, Brass, Titanium',
          rate: 1650,
          status: 'Idle',
          audit: 'APPROVED'
        },
        {
          id: 'M-103',
          name: 'Trumpf TruLaser 3030 Fiber',
          process: 'CNC LASER CUTTING',
          size: '3000 × 1500 mm',
          axis: '6 kW Solid-State Fiber',
          materials: 'MS (up to 25mm), SS (up to 20mm)',
          rate: 2800,
          status: 'Idle',
          audit: 'APPROVED'
        },
        {
          id: 'M-104',
          name: 'Amada HFE 130-4 Press Brake',
          process: 'CNC BENDING',
          size: '4000 mm × 130 Ton',
          axis: '7-Axis CNC Crowning',
          materials: 'MS (up to 12mm), SS (up to 8mm), Aluminum',
          rate: 1400,
          status: 'Idle',
          audit: 'APPROVED'
        }
      ]
    }
  ],
  staff: [
    { id: 'S-1', name: 'P. Sharma', role: 'PROCESS_VALIDATOR', title: 'Process Verification Engineer' },
    { id: 'S-2', name: 'V. Kumar', role: 'VENDOR_AUDIT', title: 'Vendor Audit Officer' },
    { id: 'S-3', name: 'I. Reddy', role: 'INSPECTOR', title: 'IGI & QC Inspection Specialist' },
    { id: 'S-4', name: 'L. Das', role: 'LOGISTICS', title: 'Logistics Coordinator' },
    { id: 'S-5', name: 'A. Rao', role: 'CUSTOMER_AUDIT', title: 'Customer KYC & Credit Auditor' },
    { id: 'S-6', name: 'S. Verma', role: 'STORES', title: 'Stores & Intake Officer' },
    { id: 'S-7', name: 'R. Nair', role: 'VENDOR_VALIDATOR', title: 'Vendor Validator & PO Authorization Officer' }
  ],
  projects: [
    {
      id: 'PRJ-1082',
      cust: 'C-101',
      status: 'PO_SENT_TO_VENDOR',
      searchLoc: 'Hyderabad',
      searchRad: 50,
      files: 'DWG-A101.pdf, DWG-B202.pdf',
      bom: 'Master_BOM.xlsx',
      createdAt: '2026-09-18T10:30:00Z',
      drawings: [
        {
          dwgNo: 'DWG-A101',
          proc: 'CNC LASER CUTTING, CNC MILLING',
          qty: 25,
          material: 'Mild Steel IS 2062',
          rawScope: 'Vendor',
          mfgScope: 'Vendor',
          finScope: 'Vendor',
          processes: [
            {
              stageId: 1,
              name: 'CNC LASER CUTTING',
              topVendors: ['V-101 (Apex Precision Aerospace & CNC Works)'],
              quotes: [{ vid: 'V-101 (Apex Precision Aerospace & CNC Works)', cost: 12500, time: 3 }],
              selectedVendor: 'V-101 (Apex Precision Aerospace & CNC Works)',
              prodStatus: 'Pending Machine Setup',
              rawScope: 'Vendor',
              mfgScope: 'Vendor',
              finScope: 'Vendor'
            },
            {
              stageId: 2,
              name: 'CNC MILLING',
              topVendors: ['V-101 (Apex Precision Aerospace & CNC Works)'],
              quotes: [{ vid: 'V-101 (Apex Precision Aerospace & CNC Works)', cost: 28000, time: 5 }],
              selectedVendor: 'V-101 (Apex Precision Aerospace & CNC Works)',
              prodStatus: 'Pending Machine Setup',
              rawScope: 'Vendor',
              mfgScope: 'Vendor',
              finScope: 'Vendor'
            }
          ]
        },
        {
          dwgNo: 'DWG-B202',
          proc: 'CNC LASER CUTTING, CNC BENDING',
          qty: 50,
          material: 'Aluminum 6061-T6',
          rawScope: 'Vendor',
          mfgScope: 'Vendor',
          finScope: 'Vendor',
          processes: [
            {
              stageId: 1,
              name: 'CNC LASER CUTTING',
              topVendors: ['V-101 (Apex Precision Aerospace & CNC Works)'],
              quotes: [{ vid: 'V-101 (Apex Precision Aerospace & CNC Works)', cost: 18000, time: 2 }],
              selectedVendor: 'V-101 (Apex Precision Aerospace & CNC Works)',
              prodStatus: 'Pending Machine Setup',
              rawScope: 'Vendor',
              mfgScope: 'Vendor',
              finScope: 'Vendor'
            },
            {
              stageId: 2,
              name: 'CNC BENDING',
              topVendors: ['V-101 (Apex Precision Aerospace & CNC Works)'],
              quotes: [{ vid: 'V-101 (Apex Precision Aerospace & CNC Works)', cost: 14000, time: 3 }],
              selectedVendor: 'V-101 (Apex Precision Aerospace & CNC Works)',
              prodStatus: 'Pending Machine Setup',
              rawScope: 'Vendor',
              mfgScope: 'Vendor',
              finScope: 'Vendor'
            }
          ]
        }
      ]
    }
  ]
};
