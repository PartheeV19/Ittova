import { resolveSession, sessionCookieOptions, SESSION_COOKIE_NAME } from '../auth/session.js';

// Attaches req.user if a valid session cookie is present. Does NOT reject
// the request on its own -- pair with requireAuth or requireRole below.
export async function attachUser(request, response, next) {
  const rawToken = request.cookies?.[SESSION_COOKIE_NAME];
  if (rawToken) {
    request.user = await resolveSession(rawToken);
    if (request.user && typeof response.cookie === 'function') {
      response.cookie(SESSION_COOKIE_NAME, rawToken, sessionCookieOptions());
    }
  } else {
    request.user = null;
  }
  next();
}

export function requireAuth(request, response, next) {
  if (!request.user) {
    return response.status(401).json({ error: 'Sign in required.' });
  }
  next();
}

export function requireRole(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({ error: 'Sign in required.' });
    }
    if (!allowedRoles.includes(request.user.role)) {
      return response.status(403).json({ error: 'Not permitted for this role.' });
    }
    next();
  };
}
