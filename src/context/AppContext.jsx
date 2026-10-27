import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

const AppContext = createContext();
// In dev, Vite proxies '/api' to localhost:3001 (see vite.config.js) --
// that proxy does not exist in a production build. Once deployed, set
// VITE_API_URL (in Vercel's project env vars) to your deployed backend's
// full origin, e.g. https://api.your-domain.com -- leave unset for local dev.
const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api/v1`;

// Thin fetch wrapper: JSON in, JSON out, session cookie always sent, and a
// non-2xx response throws with the server's error message so callers can
// showToast(error.message) directly.
async function apiFetch(path, { method = 'GET', body, headers } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    // No JSON body (e.g. 204) -- fine.
  }

  if (!response.ok) {
    const error = new Error(payload?.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

// Puts `own` (the signed-in user's own record, which role-scoped list
// endpoints may omit -- e.g. a pending vendor isn't in the public list) at
// the front of `list`, replacing any duplicate by id.
function mergeOwn(list, own) {
  if (!own) return list;
  return [own, ...list.filter((item) => item.id !== own.id)];
}

export function AppProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();

  const [db, setDb] = useState({ customers: [], vendors: [], projects: [], staff: [] });
  const [dbLoading, setDbLoading] = useState(false);

  const currentView = ({
    '/': 'home',
    '/home': 'home',
    '/login': 'login',
    '/change-role': 'change-role',
    '/customer': 'customer',
    '/vendor': 'vendor',
    '/supplier': 'vendor',
    '/staff': 'staff',
    '/admin': 'admin',
    '/finance': 'finance_partner',
    '/materials': 'material_partner'
  }[location.pathname] || (location.pathname.startsWith('/account/') ? 'account' : 'home'));

  const setCurrentView = (view, replace = false) => {
    const normalizedView = view === 'supplier' ? 'vendor' : view;
    navigate(`/${normalizedView}`, { replace });
  };

  const openMyAccount = (profileId = currentUser?.id) => {
    if (profileId) navigate(`/account/${encodeURIComponent(profileId)}`);
  };

  const navigateBack = () => {
    if (location.key === 'default' || (navigationType === 'POP' && location.pathname === '/home')) {
      navigate('/home', { replace: true });
    } else {
      navigate(-1);
    }
  };

  const [toasts, setToasts] = useState([]);
  const [cadModal, setCadModal] = useState(null);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // --- Auth: session comes from an httpOnly cookie, not localStorage -------
  const [currentUser, setCurrentUser] = useState(null); // { accountId, role, id, publicId, name, status }
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const logoutRef = useRef(null);

  // Wraps an API call, showing a toast on failure instead of throwing into
  // a component event handler. Returns null on failure so callers can bail.
  const runAction = useCallback(async (fn, failureMessage) => {
    try {
      return await fn();
    } catch (error) {
      if (error?.status === 401 && currentUser) {
        logoutRef.current?.('Session expired due to inactivity. Please sign in again.');
        return null;
      }
      showToast(error.message || failureMessage || 'Something went wrong.');
      return null;
    }
  }, [currentUser]);

  // Looks up the signed-in account's own profile row so we have an id/name
  // to show, beyond the bare accountId/role the session gives us.
  const loadOwnProfile = useCallback(async (role) => {
    try {
      if (role === 'customer') return await apiFetch('/customers/me');
      if (role === 'supplier') return await apiFetch('/vendors/me');
      if (['staff', 'admin'].includes(role)) return await apiFetch('/staff/me');
    } catch {
      return null; // No profile yet -- e.g. mid-signup, before the wizard finishes.
    }
    return null;
  }, []);

  const loadAccountPage = useCallback((profileId) =>
    apiFetch(`/accounts/${encodeURIComponent(profileId)}`), []);

  const formatNameFromEmail = (email = '') => {
    const raw = (email || '').replace(/@.*$/, '').replace(/[^a-zA-Z]/g, ' ').trim();
    if (!raw) return '';
    return raw.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const getStoredVisitor = () => {
    try {
      const raw = localStorage.getItem('ITOVA_VISITOR');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // Starting gate visitor intake profile -- pre-auth, so this can stay local.
  const [visitorProfile, setVisitorProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('ITOVA_VISITOR');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const saveVisitorProfile = (profile) => {
    setVisitorProfile(profile);
    try {
      localStorage.setItem('ITOVA_VISITOR', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    setCurrentView('home', true);
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

  const applySession = useCallback(async (session) => {
    if (!session) {
      setCurrentUser(null);
      setIsAdminLoggedIn(false);
      return;
    }
    const profile = await loadOwnProfile(session.role);
    const storedVisitor = getStoredVisitor();
    const cleanEmail = (session.email || '').replace(/@phone\.ittova\.internal$/, '');
    const emailName = formatNameFromEmail(cleanEmail);

    const resolvedName = session.profileData?.fullName
      || profile?.name
      || visitorProfile?.name
      || storedVisitor?.name
      || session.profileData?.company
      || visitorProfile?.company
      || storedVisitor?.company
      || emailName
      || cleanEmail
      || 'User';

    const resolvedParticipantRole = session.profileData?.participantRole
      || visitorProfile?.role
      || storedVisitor?.role
      || '';

    const resolvedCompany = session.profileData?.company
      || visitorProfile?.company
      || storedVisitor?.company
      || '';

    const user = {
      accountId: session.accountId,
      role: session.role,
      id: profile?.id || session.publicId || '',
      publicId: session.publicId || profile?.id || '',
      name: resolvedName,
      participantRole: resolvedParticipantRole,
      company: resolvedCompany,
      email: cleanEmail
    };

    setCurrentUser(user);
    if (user.role === 'customer' && user.id) setSelectedCustomerId(user.id);
    if (user.role === 'supplier' && user.id) setSelectedVendorId(user.id);
    if (user.role === 'staff' && user.id) setSelectedStaffId(user.id);
    if (user.role === 'admin') setIsAdminLoggedIn(true);

    // If backend profile_data was missing fullName or participantRole, sync the local details to backend
    if ((!session.profileData?.fullName && resolvedName) || (!session.profileData?.participantRole && resolvedParticipantRole)) {
      apiFetch('/auth/profile', {
        method: 'PATCH',
        body: {
          fullName: resolvedName,
          company: resolvedCompany,
          participantRole: resolvedParticipantRole
        }
      }).catch(() => {});
    }

    try { localStorage.setItem('ITOVA_LAST_ACTIVE', String(Date.now())); } catch { /* ignore */ }

    return user;
  }, [loadOwnProfile, visitorProfile]);

  // Restore an existing session on load (page refresh, new tab, etc.).
  useEffect(() => {
    (async () => {
      try {
        const lastActiveStr = localStorage.getItem('ITOVA_LAST_ACTIVE');
        const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
        const ONE_HOUR = 60 * 60 * 1000;
        if (lastActive && Date.now() - lastActive >= ONE_HOUR) {
          await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
          setCurrentUser(null);
          try { localStorage.removeItem('ITOVA_LAST_ACTIVE'); } catch { /* ignore */ }
          showToast('Previous session expired after 1 hour of inactivity.');
          return;
        }

        const session = await apiFetch('/auth/me');
        await applySession(session);
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthChecked(true);
      }
    })();
  }, [applySession]);

  // --- Data loading -----------------------------------------------------
  // Replaces the old localStorage sync: pulls whatever this role is allowed
  // to see from the API. Every mutating action below calls this again
  // afterwards instead of hand-patching local state, so `db` always reflects
  // what the server actually has.
  const refreshAll = useCallback(async () => {
    if (!currentUser) {
      setDb({ customers: [], vendors: [], projects: [], staff: [] });
      return;
    }
    setDbLoading(true);
    try {
      const isStaff = ['staff', 'admin'].includes(currentUser.role);
      const [projects, vendors, customers, staff] = await Promise.all([
        apiFetch('/projects'),
        apiFetch('/vendors'),
        isStaff ? apiFetch('/customers') : Promise.resolve([]),
        isStaff ? apiFetch('/staff') : Promise.resolve([])
      ]);

      let ownCustomer = null;
      let ownVendor = null;
      if (currentUser.role === 'customer') ownCustomer = await loadOwnProfile('customer');
      if (currentUser.role === 'supplier') ownVendor = await loadOwnProfile('supplier');

      setDb({
        projects,
        vendors: mergeOwn(vendors, ownVendor),
        customers: isStaff ? customers : mergeOwn([], ownCustomer),
        staff
      });
    } catch (error) {
      showToast(error.message || 'Failed to load data from the server.');
    } finally {
      setDbLoading(false);
    }
  }, [currentUser, loadOwnProfile]);

  useEffect(() => { if (authChecked) refreshAll(); }, [authChecked, refreshAll]);



  const resetDatabase = () => {
    refreshAll();
    showToast('Reloaded live data from the server.');
  };

  // --- Auth actions ----------------------------------------------------
  // These are the primitives LoginScreen needs to call directly (next step);
  // `login`/`logout` stay for any call site not yet migrated off the old
  // demo-picker shape.
  const requestOtp = (contact, purpose = 'signup') =>
    runAction(() => apiFetch('/auth/otp/request', { method: 'POST', body: { contact, purpose } }));

  // One shared challenge, delivered to both destinations. Do not issue two
  // independent OTP requests: those would generate different codes.
  const requestSharedOtp = (email, phone) => runAction(async () => {
    const result = await apiFetch('/auth/otp/request', {
      method: 'POST',
      body: { contact: email, email, phone, purpose: 'signup', deliveryChannels: ['email', 'sms'] }
    });
    // In dev mode SMS may not be configured — fall back to email-only silently.
    if (!result?.acceptedTo?.includes(email)) {
      throw new Error('Email delivery is not configured. Please check your RESEND_API_KEY and OTP_EMAIL_FROM settings.');
    }
    return result;
  });

  const verifyOtp = (contact, code, role, { onVerified, purpose = 'signup', profile } = {}) =>
    runAction(async () => {
      const result = await apiFetch('/auth/otp/verify', { method: 'POST', body: { contact, code, ...(role ? { role } : {}), purpose, profile } });
      if (onVerified) onVerified();
      if (purpose === 'signup') {
        setCurrentView('login', true);
        showToast('Account created. Please sign in with your registered contact.');
        return result;
      }

      const session = result;
      const user = await applySession(session);
      setCurrentView('home', true);
      return user;
    }, 'Invalid or expired code.');

  const passwordLogin = (email, password) =>
    runAction(async () => {
      const session = await apiFetch('/auth/login', { method: 'POST', body: { email, password } });
      const user = await applySession(session);
      setCurrentView('home', true);
      return user;
    }, 'Invalid credentials.');

  const getRoleChangeStatus = () =>
    runAction(() => apiFetch('/auth/role-change/status'), 'Could not load role change availability.');

  const requestRoleChangeOtp = (targetRole) =>
    runAction(() => apiFetch('/auth/role-change/request', { method: 'POST', body: { targetRole } }), 'Could not send the role change code.');

  const changeAccountRole = (targetRole, code) =>
    runAction(async () => {
      const session = await apiFetch('/auth/role-change/verify', { method: 'POST', body: { targetRole, code } });
      const user = await applySession(session);
      if (user.role !== 'customer') setSelectedCustomerId('');
      if (user.role !== 'supplier') setSelectedVendorId('');
      return user;
    }, 'Could not change your role.');

  // Legacy shape used by not-yet-migrated call sites: sets local state only,
  // without a real backend session. Kept so the app still renders while
  // LoginScreen is rewired to requestOtp/verifyOtp/passwordLogin.
  const login = (user) => {
    setCurrentUser(user);
    if (user.role === 'customer' && user.id) setSelectedCustomerId(user.id);
    if (user.role === 'supplier' && user.id) setSelectedVendorId(user.id);
    if (user.role === 'staff' && user.id) setSelectedStaffId(user.id);
    if (user.role === 'admin') setIsAdminLoggedIn(true);
    setCurrentView('home', true);
  };

  const logout = useCallback((reason) => {
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    setCurrentUser(null);
    setSelectedCustomerId('');
    setSelectedVendorId('');
    setSelectedStaffId('');
    setIsAdminLoggedIn(false);
    // Clear the visitor profile so the StartingGate shows fresh
    setVisitorProfile(null);
    try {
      localStorage.removeItem('ITOVA_VISITOR');
      localStorage.removeItem('ITOVA_LAST_ACTIVE');
    } catch { /* ignore */ }
    setCurrentView('home');
    if (reason && typeof reason === 'string') {
      showToast(reason);
    }
  }, []);

  logoutRef.current = logout;

  // --- Inactivity Timeout (1 hour) ----------------------------------------
  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

    const recordActivity = () => {
      try {
        localStorage.setItem('ITOVA_LAST_ACTIVE', String(Date.now()));
      } catch { /* ignore */ }
    };

    recordActivity();

    const checkInactivity = () => {
      try {
        const lastActiveStr = localStorage.getItem('ITOVA_LAST_ACTIVE');
        const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : Date.now();
        if (Date.now() - lastActive >= INACTIVITY_TIMEOUT_MS) {
          logout('You have been logged out due to 1 hour of inactivity.');
        }
      } catch { /* ignore */ }
    };

    let lastThrottled = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottled > 10000) {
        lastThrottled = now;
        recordActivity();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    window.addEventListener('focus', checkInactivity);
    document.addEventListener('visibilitychange', checkInactivity);

    const timer = setInterval(checkInactivity, 30000); // Check every 30 seconds

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      window.removeEventListener('focus', checkInactivity);
      document.removeEventListener('visibilitychange', checkInactivity);
      clearInterval(timer);
    };
  }, [currentUser, logout]);

  // --- Customer actions ---------------------------------------------------
  const addCustomer = (customerData) =>
    runAction(async () => {
      const created = await apiFetch('/customers', { method: 'POST', body: customerData });
      setSelectedCustomerId(created.id);
      setCurrentUser((prev) => (prev ? { ...prev, id: created.id, name: created.name } : prev));
      await refreshAll();
      showToast(`Application submitted for ${created.name}! (ID: ${created.id})`);
      return created.id;
    }, 'Could not submit the customer application.');

  const approveCustomer = (cid, approvedTier, approvedLimit) =>
    runAction(async () => {
      await apiFetch(`/customers/${cid}/approve`, { method: 'PATCH', body: { creditTier: approvedTier, creditLimit: approvedLimit } });
      await refreshAll();
      showToast(`Customer account approved with ${approvedTier}!`);
    }, 'Could not approve the customer.');

  // --- Drawing release & quoting -------------------------------------------
  const submitDrawings = (cid, radius = 50, customPayload = null) =>
    runAction(async () => {
      let payload;

      if (customPayload && Array.isArray(customPayload.drawings) && customPayload.drawings.length > 0) {
        payload = {
          searchLoc: customPayload.searchLoc || 'Hyderabad',
          searchRad: radius,
          files: customPayload.files || customPayload.drawings.map(d => d.dwgNo).join(', '),
          bom: customPayload.bom || 'Bill_of_Materials.xlsx',
          drawings: customPayload.drawings
        };
      } else {
        const availableVendors = db.vendors.length > 0
          ? db.vendors.map(v => ({ id: v.id, label: `${v.id} (${v.name})` }))
          : [
              { id: 'FAC-01', label: 'Audited Facility [Cherlapally Hub]' },
              { id: 'FAC-02', label: 'Audited Facility [Balanagar Hub]' }
            ];
        const v1 = availableVendors[0] || { id: 'FAC-01', label: 'Audited Machining Hub' };
        const v2 = availableVendors[1] || availableVendors[0];

        const drawings = [
          {
            dwgNo: 'DWG-A101', proc: 'CNC LASER CUTTING, CNC MILLING', qty: 25, material: 'Mild Steel',
            rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor',
            processes: [
              { stageId: 1, name: 'CNC LASER CUTTING', topVendors: [v1.label], quotes: [{ vid: v1.label, cost: 12500, time: 3 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' },
              { stageId: 2, name: 'CNC MILLING', topVendors: [v1.label, v2.label], quotes: [{ vid: v1.label, cost: 28000, time: 5 }, { vid: v2.label, cost: 31000, time: 4 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' }
            ]
          },
          {
            dwgNo: 'DWG-B202', proc: 'CNC LASER CUTTING, CNC BENDING', qty: 50, material: 'Aluminum 6061-T6',
            rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor',
            processes: [
              { stageId: 1, name: 'CNC LASER CUTTING', topVendors: [v1.label], quotes: [{ vid: v1.label, cost: 18000, time: 2 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' },
              { stageId: 2, name: 'CNC BENDING', topVendors: [v1.label], quotes: [{ vid: v1.label, cost: 14000, time: 3 }], selectedVendor: null, prodStatus: 'Pending', rawScope: 'Vendor', mfgScope: 'Vendor', finScope: 'Vendor' }
            ]
          }
        ];

        payload = {
          searchLoc: 'Hyderabad',
          searchRad: radius,
          files: 'DWG-A101.pdf, DWG-B202.pdf',
          bom: 'Master_BOM.xlsx',
          drawings
        };
      }

      const created = await apiFetch('/projects', {
        method: 'POST',
        body: payload
      });
      await refreshAll();
      showToast(`Engineering drawings uploaded! AI DFM analysis complete. Assigned project ${created.id}.`);
      return created.id;
    }, 'Could not submit drawings.');

  const updateProjectScope = (pid, dIdx, pIdx, field, val) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/scope`, { method: 'PATCH', body: { dIdx, pIdx, field, value: val } });
      await refreshAll();
    }, 'Could not update the process scope.');

  const confirmScopes = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/confirm-scopes`, { method: 'POST' });
      await refreshAll();
      showToast('Process scopes confirmed! Dispatched for Supplier Machine Matching.');
    }, 'Could not confirm scopes.');

  const confirmCustomerVendorQuotes = (pid, selections) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/select-vendors`, { method: 'POST', body: { selections } });
      await refreshAll();
      showToast('Supplier selections confirmed! Transferred to Vendor Validator for PO release.');
    }, 'Could not confirm vendor selections.');

  const approveCustomerDelivery = (pid, deliveryAddress) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/approve-delivery`, { method: 'POST', body: { deliveryAddress } });
      await refreshAll();
      showToast('Delivery approved! Transferred to Logistics for freight computation.');
    }, 'Could not approve delivery.');

  const payCustomerFinal = (pid, paymentDetails = {}) =>
    runAction(async () => {
      const res = await apiFetch(`/projects/${pid}/pay`, { method: 'POST', body: paymentDetails });
      await refreshAll();
      const receiptNo = res.paymentReceipt?.receiptId || '';
      showToast(`Final invoice payment confirmed (${receiptNo || 'Cleared'})! Order released for shipping.`);
      return res;
    }, 'Payment could not be recorded.');

  // --- Staff portal workflow ------------------------------------------------
  const assignPV = (pid, staffId) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/assign-pv`, { method: 'POST', body: { staffId } });
      await refreshAll();
      showToast(`Project ${pid} assigned to Process Validator.`);
    }, 'Could not assign the Process Validator.');

  const approvePVSpecs = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/approve-pv-specs`, { method: 'POST' });
      await refreshAll();
      showToast(`Project ${pid} process specs verified. Sent to Customer for Scoping!`);
    }, 'Could not approve process specs.');

  const assignVV = (pid, staffId, newStatus) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/assign-vv`, { method: 'POST', body: { staffId, newStatus } });
      await refreshAll();
      showToast(`Project ${pid} assigned to Vendor Validator.`);
    }, 'Could not assign the Vendor Validator.');

  const approveVVAIRouting = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/approve-vv-routing`, { method: 'POST' });
      await refreshAll();
      showToast('Machine matches authorized! RFQs dispatched to supplier network.');
    }, 'Could not authorize routing.');

  const approveQuotesWithFee = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/approve-quotes-fee`, { method: 'POST' });
      await refreshAll();
      showToast('Quotes audited with +5% margin. Released to customer matrix!');
    }, 'Could not release quotes.');

  const authorizePORelease = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/authorize-po`, { method: 'POST' });
      await refreshAll();
      showToast('Production POs dispatched to suppliers!');
    }, 'Could not authorize the PO.');

  // --- Supplier network ---------------------------------------------------
  const addVendor = (vendorData) =>
    runAction(async () => {
      const created = await apiFetch('/vendors', { method: 'POST', body: vendorData });
      setSelectedVendorId(created.id);
      setCurrentUser((prev) => (prev ? { ...prev, id: created.id, name: created.name } : prev));
      await refreshAll();
      showToast(`Facility registration submitted for ${created.name}! (ID: ${created.id})`);
      return created.id;
    }, 'Could not submit the facility registration.');

  const approveVendor = (vid, score) =>
    runAction(async () => {
      await apiFetch(`/vendors/${vid}/approve`, { method: 'PATCH', body: { auditScore: score } });
      await refreshAll();
      showToast('Supplier facility approved and activated!');
    }, 'Could not approve the vendor.');

  const acceptVendorPO = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/accept-po`, { method: 'POST' });
      await refreshAll();
      showToast(`PO accepted for Project ${pid}! Production underway.`);
    }, 'Could not accept the PO.');

  const requestVendorDispatch = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/request-dispatch`, { method: 'POST' });
      await refreshAll();
      showToast(`Production complete for ${pid}! Logistics pickup scheduled.`);
    }, 'Could not request dispatch.');

  const submitVendorQuote = (pid, vendorId, quoteDetails = {}) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/vendor-quote`, { method: 'POST', body: quoteDetails });
      await refreshAll();
      const vendor = db.vendors.find(v => v.id === vendorId);
      showToast(`Bid submitted${vendor ? ` by ${vendor.name}` : ''} for Project ${pid}.`);
    }, 'Could not submit the bid.');

  const addVendorMachine = (vendorId, machine) =>
    runAction(async () => {
      await apiFetch(`/vendors/${vendorId}/machines`, { method: 'POST', body: machine });
      await refreshAll();
      showToast(`Machine ${machine.name} registered and saved.`);
    }, 'Could not register the machine.');

  // --- Logistics & inspection ----------------------------------------------
  const acceptLogisticsPickup = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/accept-pickup`, { method: 'POST' });
      await refreshAll();
      showToast(`Pickup accepted for Project ${pid}. Truck dispatched.`);
    }, 'Could not accept pickup.');

  const receiveMaterialWarehouse = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/receive-warehouse`, { method: 'POST' });
      await refreshAll();
      showToast('Material received at ITTOX Central Warehouse! Queued for QC.');
    }, 'Could not record warehouse receipt.');

  const assignInspector = (pid, staffId) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/assign-inspector`, { method: 'POST', body: { staffId } });
      await refreshAll();
      showToast(`Project ${pid} assigned to QC Inspector.`);
    }, 'Could not assign an inspector.');

  const submitQCReport = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/submit-qc-report`, { method: 'POST' });
      await refreshAll();
      showToast('Inspection PASSED! Dimensional conformance report issued.');
    }, 'Could not submit the QC report.');

  const requestFreightFee = (pid, fee = 4500) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/request-freight-fee`, { method: 'POST', body: { fee } });
      await refreshAll();
      showToast('Freight fee appended. Final invoice generated for customer.');
    }, 'Could not request the freight fee.');

  const dispatchToCustomer = (pid) =>
    runAction(async () => {
      await apiFetch(`/projects/${pid}/dispatch`, { method: 'POST' });
      await refreshAll();
      showToast(`Project ${pid} dispatched to customer! Order fulfilled.`);
    }, 'Could not dispatch the order.');

  const payVendor = (pid, payoutDetails = {}) =>
    runAction(async () => {
      const res = await apiFetch(`/projects/${pid}/pay-vendor`, { method: 'POST', body: payoutDetails });
      await refreshAll();
      const utr = res.vendorPayoutReceipt?.utrNumber || '';
      showToast(`Vendor payout for Project ${pid} authorized! (UTR: ${utr || 'Settled'})`);
      return res;
    }, 'Could not authorize the payout.');

  return (
    <AppContext.Provider value={{
      db,
      dbLoading,
      currentUser,
      openMyAccount,
      loadAccountPage,
      authChecked,
      login,
      logout,
      requestOtp,
      requestSharedOtp,
      verifyOtp,
      passwordLogin,
      getRoleChangeStatus,
      requestRoleChangeOtp,
      changeAccountRole,
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
      submitVendorQuote,
      addVendorMachine,
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
