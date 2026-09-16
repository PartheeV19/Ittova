// ==========================================================================
// ITTOVA Initial Seed Database
// ==========================================================================

export const INITIAL_DB = {
  customers: [
    { 
      id: 'C-101', 
      name: 'Medha Servo Drives Private Limited', 
      entityType: 'Private Limited Company',
      cin: 'U31909TG1990PTC011234',
      pan: 'AABCM1234P',
      gst: '36AABCM1234P1Z4',
      address: 'Plot 21/A, R&D Enclave, Cherlapally, Hyderabad 500051', 
      factoryAddress: 'Sy No. 501, Phase-V, IDA Cherlapally, Medchal-Malkajgiri, Telangana 500051',
      deliveryAddress: 'Central Inward Stores, Gate No. 2, Medha Servo Campus, Cherlapally',
      signatoryName: 'K. V. Rama Rao',
      signatoryDesig: 'Director & Head of Procurement',
      signatoryPhone: '+91 98490 12345',
      signatoryEmail: 'ramarao@medhaservo.com',
      procName: 'N. Suresh Kumar',
      procEmail: 'procurement@medhaservo.com',
      procPhone: '+91 98491 88776',
      finName: 'P. Laxman Rao',
      finEmail: 'finance@medhaservo.com',
      finPhone: '+91 98492 55443',
      qcName: 'D. Srinivas',
      qcEmail: 'qa.inward@medhaservo.com',
      qcPhone: '+91 98493 22110',
      sector: 'Railways & Rolling Stock',
      product: 'Traction Converters, Auxiliary Power Units, TCMS Enclosures',
      turnover: '₹25 Cr – ₹100 Cr',
      bankName: 'State Bank of India',
      bankBranch: 'Industrial Finance Branch, Punjagutta, Hyderabad',
      bankAcc: '38472910548',
      bankType: 'Current Account',
      bankIfsc: 'SBIN0004123',
      phone: '+91 98490 12345', 
      email: 'procurement@medhaservo.com', 
      status: 'APPROVED',
      creditTier: '15 to 30 Day Credit',
      creditLimit: '₹ 50,00,000',
      reqCreditTier: '15 to 30 Day Credit',
      reqCreditLimit: '₹ 50,00,000',
      msmeType: 'Medium Enterprise',
      udyamNo: 'UDYAM-TS-02-0019842',
      attachedDocs: [
        'Certificate_of_Incorporation.pdf',
        'Company_PAN_Card.pdf',
        'GST_REG06_Certificate.pdf',
        'MoA_AoA_Executed.pdf',
        'Cancelled_Cheque_Attested.pdf',
        'Audited_Financials_FY24_FY25.pdf',
        'ITR_Acknowledgments_AY24_AY25.pdf',
        'GSTR_3B_1_Last_6_Months.pdf',
        'Bank_Statements_6_Months.pdf'
      ]
    }
  ],
  vendors: [
    { 
      id: 'V-201', 
      name: 'BNR Precision Engineering', 
      location: 'Cherlapally, Hyderabad', 
      phone: '+91 87654 32109', 
      email: 'orders@bnrprecision.com', 
      status: 'APPROVED', 
      rating: 5,
      auditScore: '96/100 (ISO 9001:2015)',
      machines: [
        { id: 'M-101', name: 'Trumpf TruLaser 3030 Fiber', process: 'CNC LASER CUTTING', size: '2000x4000 mm', rate: 2500, materials: 'MS, SS, Aluminum', axis: '2D Fiber Laser', status: 'Idle', audit: 'APPROVED' },
        { id: 'M-102', name: 'Amada HG 1303 Press Brake', process: 'CNC BENDING', size: '3000 mm (130T)', rate: 1200, materials: 'MS, SS', axis: '7-Axis CNC', status: 'Idle', audit: 'APPROVED' },
        { id: 'M-103', name: 'Haas VF-4SS 4-Axis VMC', process: 'CNC MILLING', size: '1270x508 mm', rate: 1800, materials: 'SS, Aluminum, Alloy Steel', axis: '4-Axis VMC', status: 'Under Load', audit: 'APPROVED' }
      ]
    },
    {
      id: 'V-202',
      name: 'Apex Precision Tools & Aerospace',
      location: 'Balanagar, Hyderabad',
      phone: '+91 76543 21098',
      email: 'contact@apexprecision.in',
      status: 'APPROVED',
      rating: 5,
      auditScore: '98/100 (AS9100D Certified)',
      machines: [
        { id: 'M-201', name: 'Mazak Integrex e-500H', process: 'CNC TURNING & MILLING', size: 'Ø820 x 3000 mm', rate: 3200, materials: 'Titanium, Inconel, SS 316', axis: '5-Axis Multi-Tasking', status: 'Idle', audit: 'APPROVED' }
      ]
    }
  ],
  staff: [
    { id: 'S-1', name: 'P. Sharma', role: 'PROCESS_VALIDATOR' },
    { id: 'S-2', name: 'V. Kumar', role: 'VENDOR_VALIDATOR' },
    { id: 'S-3', name: 'I. Reddy', role: 'INSPECTOR' },
    { id: 'S-4', name: 'L. Das', role: 'LOGISTICS' },
    { id: 'S-5', name: 'A. Rao', role: 'CUSTOMER_AUDIT' },
    { id: 'S-6', name: 'K. Singh', role: 'VENDOR_AUDIT' }
  ],
  projects: []
};
