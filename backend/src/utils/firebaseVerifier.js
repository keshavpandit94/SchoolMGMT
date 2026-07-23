import jwt from 'jsonwebtoken';

// Cache for Google's public certificates
let cachedCerts = {};
let lastFetchTime = 0;

const fetchGoogleCerts = async () => {
  const now = Date.now();
  // Cache for 6 hours
  if (Object.keys(cachedCerts).length > 0 && now - lastFetchTime < 6 * 60 * 60 * 1000) {
    return cachedCerts;
  }

  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    const certs = await res.json();
    cachedCerts = certs;
    lastFetchTime = now;
    return certs;
  } catch (error) {
    console.error('Error fetching Firebase public certificates:', error.message);
    return cachedCerts;
  }
};

export const verifyFirebaseToken = async (idToken) => {
  // Developer convenience: Bypass verification for a designated mock token
  if (idToken === 'mock-firebase-token-admin' || idToken === 'mock-firebase-token-teacher') {
    return {
      uid: idToken === 'mock-firebase-token-admin' ? 'mock-firebase-admin-uid' : 'mock-firebase-teacher-uid',
      email: idToken === 'mock-firebase-token-admin' ? 'mock-admin@school.com' : 'mock-teacher@school.com',
      name: idToken === 'mock-firebase-token-admin' ? 'Mock Admin Firebase' : 'Mock Teacher Firebase',
      firebaseVerified: true,
    };
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'school-mgmt-firebase-id';

    // Decode without verifying signature first to retrieve header 'kid'
    const decodedToken = jwt.decode(idToken, { complete: true });
    if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
      throw new Error('Invalid Firebase token structure');
    }

    const kid = decodedToken.header.kid;
    const certs = await fetchGoogleCerts();
    const certificate = certs[kid];

    if (!certificate) {
      throw new Error('Firebase public key certificate not found for kid');
    }

    // Verify token with Google's PEM certificate (RS256 algorithm)
    const claims = jwt.verify(idToken, certificate, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    });

    return {
      uid: claims.sub,
      email: claims.email,
      name: claims.name || claims.email?.split('@')[0],
      firebaseVerified: true,
    };
  } catch (error) {
    console.error('Firebase token validation failed:', error.message);
    throw new Error(`Firebase token validation failed: ${error.message}`);
  }
};
