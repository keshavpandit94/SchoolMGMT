import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Staff from '../models/Staff.js';
import { sendOTPEmail } from '../config/nodemailer.js';
import { verifyFirebaseToken } from '../utils/firebaseVerifier.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey12345!', {
    expiresIn: '30d',
  });
};

// @desc    Setup initial Admin
// @route   POST /api/auth/setup-admin
// @access  Public
export const setupAdmin = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    const userCount = await User.countDocuments({});
    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin setup already completed. Please use normal login/registration.',
      });
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'Admin',
      phone,
      isVerified: true, // Auto verify initial admin
    });

    const token = generateToken(admin._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        isVerified: admin.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new user (Admin/Principal only)
// @route   POST /api/auth/register
// @access  Private (Admin, Principal)
export const registerUser = async (req, res, next) => {
  const { name, email, password, role, phone, department, designation, qualifications, subjectsTaught, roleDetails, shift } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create User record
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
      isVerified: false,
    });

    await user.save();

    // Create linked record depending on role
    if (role === 'Teacher') {
      const teacher = new Teacher({
        userId: user._id,
        department: department || 'General',
        designation: designation || 'Assistant Teacher',
        qualifications: qualifications || [],
        subjectsTaught: subjectsTaught || [],
      });
      await teacher.save();
    } else if (role === 'Staff') {
      const staff = new Staff({
        userId: user._id,
        department: department || 'Facilities',
        roleDetails: roleDetails || 'General Support staff',
        shift: shift || 'Morning',
      });
      await staff.save();
    }

    res.status(201).json({
      success: true,
      message: `${role} registered successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Step 1 of dual-factor login: Verify credentials and send OTP
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    let user = await User.findOne({ email });

    // Auto-bootstrap initial user as Admin if database has zero users
    const userCount = await User.countDocuments({});
    if (!user && userCount === 0) {
      user = await User.create({
        name: 'System Admin',
        email,
        password,
        role: 'Admin',
        isVerified: true,
      });
      console.log(`Auto-created initial Admin account: ${email}`);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email asynchronously in the background without blocking the HTTP response
    sendOTPEmail(user.email, otp).catch((err) =>
      console.error(`[Background Email Error] ${err.message}`)
    );

    return res.status(200).json({
      success: true,
      message: 'OTP sent to email. Please verify to complete login.',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Step 2 of dual-factor login: Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Please provide email and OTP code' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP fields and set verified
    user.otp = undefined;
    user.otpExpires = undefined;
    if (!user.isVerified) {
      user.isVerified = true;
    }
    await user.save();

    const token = generateToken(user._id);

    // Set HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Firebase Auth (Google OAuth & Mobile OTP token verification)
// @route   POST /api/auth/firebase
// @access  Public
export const firebaseLogin = async (req, res, next) => {
  const { token: idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, message: 'Firebase ID token is required' });
  }

  try {
    const decoded = await verifyFirebaseToken(idToken);

    // Check if user already exists
    let user = await User.findOne({ email: decoded.email });

    // Bootstrap first user as Admin if no users exist
    const userCount = await User.countDocuments({});
    if (!user && userCount === 0) {
      user = await User.create({
        name: decoded.name,
        email: decoded.email,
        role: 'Admin',
        firebaseUid: decoded.uid,
        isVerified: true,
      });
    }

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Your email is not registered in the school database. Please contact an Administrator.',
      });
    }

    // If user exists but firebaseUid is not linked, link it
    if (!user.firebaseUid) {
      user.firebaseUid = decoded.uid;
      user.isVerified = true;
      await user.save();
    }

    const jwtToken = generateToken(user._id);

    // Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
