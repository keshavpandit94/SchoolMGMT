import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Parses cookies manually from the headers to avoid extra dependencies
const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    const value = decodeURI(parts.join('='));
    list[name] = value;
  });

  return list;
};

export const protect = async (req, res, next) => {
  let token = '';

  // 1. Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check cookies
  else if (req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies.token) {
      token = cookies.token;
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey12345!');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Check user role permissions
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' does not have permission to access this resource`,
      });
    }

    next();
  };
};
