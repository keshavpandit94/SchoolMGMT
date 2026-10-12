/**
 * Nodemailer Email Service Entrypoint
 * Re-exports the transactional email functions
 */
export {
  getTransporter,
  verifyTransporter,
  sendOTPEmail,
  default,
} from './nodemailer.js';
