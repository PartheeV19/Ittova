import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DB } from '../data/initialDb';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => {
    try {
      const saved = localStorage.getItem('ITTOX_DB');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.vendors || parsed.vendors.length === 0) {
          parsed.vendors = INITIAL_DB.vendors;
        }
        if (!parsed.customers || parsed.customers.length === 0) {
          parsed.customers = INITIAL_DB.customers;
        }
        if (!parsed.projects || parsed.projects.length === 0) {
          parsed.projects = INITIAL_DB.projects;
        }
        return parsed;
      }
      return INITIAL_DB;
    } catch {
      return INITIAL_DB;
    }
  });

  const [currentView, setCurrentViewState] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (['home', 'login', 'customer', 'vendor', 'supplier', 'staff', 'admin'].includes(hash)) {
        return hash === 'supplier' ? 'vendor' : hash;
      }
    }
    return 'home';
  });

  const setCurrentView = (view, replace = true) => {
    const normalizedView = view === 'supplier' ? 'vendor' : view;
    setCurrentViewState(normalizedView);
    if (typeof window !== 'undefined') {
      const targetHash = '#' + normalizedView;
      if (window.location.hash !== targetHash) {
        if (replace) {
          window.history.replaceState({ view: normalizedView }, '', targetHash);
        } else {
          window.history.pushState({ view: normalizedView }, '', targetHash);
        }
      }
    }
  };

  const navigateBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1 && window.location.hash && window.location.hash !== '#home') {
        window.history.back();
      } else {
        setCurrentView('home');
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialView = window.location.hash.replace(/^#\/?/, '') || 'home';
      window.history.replaceState({ view: initialView }, '', '#' + initialView);

      const handlePopState = (e) => {
        const nextView = e.state?.view || window.location.hash.replace(/^#\/?/, '') || 'home';
        setCurrentViewState(nextView === 'supplier' ? 'vendor' : nextView);
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const [toasts, setToasts] = useState([]);
  const [cadModal, setCadModal] = useState(null);

  // Role-based auth
  const [currentUser, setCurrentUser] = useState(null); // { role, id, name, subRole }

  // Starting gate visitor intake profile
  const [visitorProfile, setVisitorProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ITOVA_VISITOR');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const getVisitorRoute = (profile) => {
    const role = profile?.role || '';
    if (role.includes('Buyer') || role.includes('OEM')) return 'customer';
    if (
      role.includes('Manufacturing') ||
      role.includes('Machine Shop') ||
      role.includes('Raw Material') ||
      role.includes('Inspection') ||
      role.includes('Vendor')
    ) return 'vendor';
    return 'home';
  };

  const saveVisitorProfile = (profile) => {
    setVisitorProfile(profile);
    try {
      localStorage.setItem('ITOVA_VISITOR', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    setCurrentView(getVisitorRoute(profile));
  };

  const clearVisitorProfile = () => {
    setVisitorProfile(null);
    try {
      localStorage.removeItem('ITOVA_VISITOR');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('home');
    showToast('Visitor session reset. Please re-enter basic details.');
  };

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ITTOX_DB', JSON.stringify(db));
  }, [db]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const getUID = (prefix) => {
    return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const resetDatabase = () => {
    setDb(JSON.parse(JSON.stringify(INITIAL_DB)));
    setSelectedCustomerId('');
    setSelectedVendorId('');
    setSelectedStaffId('');
    showToast('Application database reset to initial seed state.');
  };

  // --- Auth ---
  const login = (user) => {
    setCurrentUser(user);
    // Auto-select the user's own account in their portal
    if (user.role === 'customer' && user.id) setSelectedCustomerId(user.id);
    if (user.role === 'supplier' && user.id) setSelectedVendorId(user.id);
    if (user.role === 'staff' && user.id) setSelectedStaffId(user.id);
    if (user.role === 'admin') setIsAdminLoggedIn(true);
    // Route to their portal
    const viewMap = { customer: 'customer', supplier: 'vendor', staff: 'staff', admin: 'admin' };
    setCurrentView(viewMap[user.role] || 'home');
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedCustomerId('');
    setSelectedVendorId('');
    setSelectedStaffId('');
    setIsAdminLoggedIn(false);
    setCurrentView('home');
  };

  // --- Customer Actions ---
  const addCustomer = (customerData) => {
    const newId = getUID('C');
    const newCust = {
      id: newId,
      status: 'PENDING',
      creditTier: 'Under Audit Review',
      creditLimit: 'Pending Sanction',
      ...customerData
    };
    setDb(prev => ({
      ...prev,
      customers: [...prev.customers, newCust]
    }));
    setSelectedCustomerId(newId);
    showToast(`Application submitted for ${customerData.name}! (ID: ${newId})`);
    return newId;
  };

  const approveCustomer = (cid, approvedTier, approvedLimit) => {
    setDb(prev => ({
      ...prev,
      customers: prev.customers.map(c => 
        c.id === cid ? { ...c, status: 'APPROVED', creditTier: approvedTier, creditLimit: approvedLimit } : c
      )
    }));
    showToast(`Customer account approved with ${approvedTier}!`);
  };

  // --- Drawing Release & Quoting Actions ---
  const submitDrawings = (cid, radius = 50) => {
    const pid = getUID('PRJ');

    // Build quotes dynamically from registered vendors if available, or clean generic audited facilities
    const availableVendors = db.vendors.length > 0 
      ? db.vendors.map(v => ({ id: v.id, label: `${v.id} (${v.name})` }))
      : [
          { id: 'FAC-01', label: 'Audited Facility [Cherlapally Hub]' },
          { id: 'FAC-02', label: 'Audited Facility [Balanagar Hub]' }
        ];

    const v1 = availableVendors[0] || { id: 'FAC-01', label: 'Audited Machining Hub' };
    const v2 = availableVendors[1] || availableVendors[0];

    const simDrawings = [
      { 
        dwgNo: 'DWG-A101', 
        proc: 'CNC LASER CUTTING, CNC MILLING', 
        qty: 25, 
        material: 'Mild Steel', 
        rawScope: 'Vendor', 
        mfgScope: 'Vendor', 
        finScope: 'Vendor',
        processes: [
          { stageId: 1, name: 'CNC LASER CUTTING', topVendors: [v1.label], quotes: [{ vid: v1.label, cost: 12500, time: 3 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' },
          { stageId: 2, name: 'CNC MILLING', topVendors: [v1.label, v2.label], quotes: [{ vid: v1.label, cost: 28000, time: 5 }, { vid: v2.label, cost: 31000, time: 4 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' }
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
          { stageId: 1, name: 'CNC LASER CUTTING', topVendors: [v1.label], quotes: [{ vid: v1.label, cost: 18000, time: 2 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' },
          { stageId: 2, name: 'CNC BENDING', topVendors: [v1.label], quotes: [{ vid: v1.label, cost: 14000, time: 3 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' }
        ]
      }
    ];

    const newProject = {
      id: pid,
      cust: cid,
      status: 'AI_EXTRACTED_PENDING_VAL',
      searchLoc: 'Hyderabad',
      searchRad: radius,
      files: 'DWG-A101.pdf, DWG-B202.pdf',
      bom: 'Master_BOM.xlsx',
      drawings: simDrawings,
      createdAt: new Date().toISOString()
    };

    setDb(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));

    showToast(`Engineering drawings uploaded! AI DFM analysis complete. Assigned project ${pid}.`);
    return pid;
  };

  const updateProjectScope = (pid, dIdx, pIdx, field, val) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== pid) return p;
        const newDrawings = JSON.parse(JSON.stringify(p.drawings));
        newDrawings[dIdx].processes[pIdx][field] = val;
        // Downstream lock: if stage 1 mfg changes, stage 2 raw is locked
        if (field === 'mfgScope' && pIdx === 0 && newDrawings[dIdx].processes.length > 1) {
          newDrawings[dIdx].processes[1]['rawScope'] = val;
        }
        return { ...p, drawings: newDrawings };
      })
    }));
  };

  const confirmScopes = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'AI_VENDOR_SEARCH_PENDING' } : p)
    }));
    showToast('Process scopes confirmed! Dispatched for Supplier Machine Matching.');
  };

  const confirmCustomerVendorQuotes = (pid, selections) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => {
        if (p.id !== pid) return p;
        const newDrawings = JSON.parse(JSON.stringify(p.drawings));
        newDrawings.forEach((d, dIdx) => d.processes.forEach((proc, pIdx) => {
          const key = `${dIdx}_${pIdx}`;
          if (selections[key]) proc.selectedVendor = selections[key];
        }));
        return { ...p, status: 'CUST_SELECTED_VEND_PENDING', drawings: newDrawings };
      })
    }));
    showToast('Supplier selections confirmed! Transferred to Vendor Validator for PO release.');
  };

  const approveCustomerDelivery = (pid, deliveryAddress) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? {
        ...p,
        custDeliveryAddress: deliveryAddress || 'Central Customer Inward Receiving Dock',
        status: 'PENDING_LOGISTICS_FEE'
      } : p)
    }));
    showToast('Delivery approved! Transferred to Logistics for freight computation.');
  };

  const payCustomerFinal = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? {
        ...p,
        custPaymentStatus: 'PAID',
        status: 'PAYMENT_COMPLETED_PENDING_DISPATCH'
      } : p)
    }));
    showToast('Final invoice payment confirmed! Order released for shipping.');
  };

  // --- Staff Portal Workflow Actions ---
  const assignPV = (pid, staffId) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, assignedProcVal: staffId, status: 'PROCESS_VAL_ASSIGNED' } : p)
    }));
    showToast(`Project ${pid} assigned to Process Validator.`);
  };

  const approvePVSpecs = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'CUSTOMER_SCOPE_PENDING' } : p)
    }));
    showToast(`Project ${pid} process specs verified. Sent to Customer for Scoping!`);
  };

  const assignVV = (pid, staffId, newStatus) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, assignedVendVal: staffId, status: newStatus } : p)
    }));
    showToast(`Project ${pid} assigned to Vendor Validator.`);
  };

  const approveVVAIRouting = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'PENDING_VENDOR_QUOTES' } : p)
    }));
    showToast('Machine matches authorized! RFQs dispatched to supplier network.');
  };

  const approveQuotesWithFee = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'CUSTOMER_FINAL_SELECTION' } : p)
    }));
    showToast('Quotes audited with +5% margin. Released to customer matrix!');
  };

  const authorizePORelease = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'PO_SENT_TO_VENDOR' } : p)
    }));
    showToast('Production POs dispatched to suppliers!');
  };

  // --- Supplier Network Actions ---
  const addVendor = (vendorData) => {
    const newId = getUID('V');
    const newVend = {
      id: newId,
      status: 'PENDING',
      rating: 5,
      auditScore: 'Pending Physical Audit',
      ...vendorData
    };
    setDb(prev => ({
      ...prev,
      vendors: [...prev.vendors, newVend]
    }));
    setSelectedVendorId(newId);
    showToast(`Facility registration submitted for ${vendorData.name}! (ID: ${newId})`);
    return newId;
  };

  const approveVendor = (vid, score) => {
    setDb(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => v.id === vid ? {
        ...v,
        status: 'APPROVED',
        auditScore: score || '95/100 (ISO 9001:2015)'
      } : v)
    }));
    showToast(`Supplier facility approved and activated!`);
  };

  const acceptVendorPO = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'PO_ACCEPTED_VENDOR' } : p)
    }));
    showToast(`PO accepted for Project ${pid}! Production underway.`);
  };

  const requestVendorDispatch = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'DISPATCH_REQUESTED' } : p)
    }));
    showToast(`Production complete for ${pid}! Logistics pickup scheduled.`);
  };

  // --- Logistics & Inspection ---
  const acceptLogisticsPickup = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'LOGISTICS_ACCEPTED' } : p)
    }));
    showToast(`Pickup accepted for Project ${pid}. Truck dispatched.`);
  };

  const receiveMaterialWarehouse = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'PENDING_INSPECTION' } : p)
    }));
    showToast(`Material received at ITTOX Central Warehouse! Queued for QC.`);
  };

  const assignInspector = (pid, staffId) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, assignedInspector: staffId, status: 'INSPECTOR_ASSIGNED' } : p)
    }));
    showToast(`Project ${pid} assigned to QC Inspector.`);
  };

  const submitQCReport = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, status: 'PENDING_CUST_DELIVERY_APPROVAL' } : p)
    }));
    showToast(`Inspection PASSED! Dimensional conformance report issued.`);
  };

  const requestFreightFee = (pid, fee = 4500) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? {
        ...p,
        logisticsFee: fee,
        status: 'PENDING_CUST_PAYMENT'
      } : p)
    }));
    showToast(`Freight fee appended. Final invoice generated for customer.`);
  };

  const dispatchToCustomer = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? {
        ...p,
        status: 'DISPATCHED_TO_CUST',
        custPaymentStatus: 'PAID'
      } : p)
    }));
    showToast(`Project ${pid} dispatched to customer! Order fulfilled.`);
  };

  const payVendor = (pid) => {
    setDb(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === pid ? { ...p, vendorPaymentStatus: 'PAID' } : p)
    }));
    showToast(`Vendor payout for Project ${pid} authorized!`);
  };

  return (
    <AppContext.Provider value={{
      db,
      currentUser,
      login,
      logout,
      currentView,
      setCurrentView,
      navigateBack,
      toasts,
      showToast,
      cadModal,
      setCadModal,
      selectedCustomerId,
      setSelectedCustomerId,
      selectedVendorId,
      setSelectedVendorId,
      selectedStaffId,
      setSelectedStaffId,
      isAdminLoggedIn,
      setIsAdminLoggedIn,
      resetDatabase,
      addCustomer,
      approveCustomer,
      submitDrawings,
      updateProjectScope,
      confirmScopes,
      confirmCustomerVendorQuotes,
      approveCustomerDelivery,
      payCustomerFinal,
      assignPV,
      approvePVSpecs,
      assignVV,
      approveVVAIRouting,
      approveQuotesWithFee,
      authorizePORelease,
      addVendor,
      approveVendor,
      acceptVendorPO,
      requestVendorDispatch,
      acceptLogisticsPickup,
      receiveMaterialWarehouse,
      assignInspector,
      submitQCReport,
      requestFreightFee,
      dispatchToCustomer,
      payVendor,
      visitorProfile,
      saveVisitorProfile,
      clearVisitorProfile
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
