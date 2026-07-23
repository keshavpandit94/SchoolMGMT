import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, server } from '../src/server.js';
import User from '../src/models/User.js';

// Close server after all tests if it was started
afterAll((done) => {
  if (server && server.listening) {
    server.close(done);
  } else {
    done();
  }
});

// Stub Mongoose User model methods directly for ES Modules runtime compatibility
User.countDocuments = jest.fn();
User.create = jest.fn();
User.findOne = jest.fn();

describe('Auth Endpoints Mocked Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/setup-admin', () => {
    it('should create initial Admin user if no users exist', async () => {
      // Mock User.countDocuments to return 0
      User.countDocuments.mockResolvedValue(0);
      
      // Mock User.create to return a simulated admin object
      const mockAdmin = {
        _id: 'mockadminid123',
        name: 'Super Admin',
        email: 'admin@school.com',
        role: 'Admin',
        phone: '1234567890',
        isVerified: true,
      };
      User.create.mockResolvedValue(mockAdmin);

      const response = await request(app)
        .post('/api/auth/setup-admin')
        .send({
          name: 'Super Admin',
          email: 'admin@school.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('Admin');
      expect(response.body.token).toBeDefined();
    });

    it('should fail if users already exist', async () => {
      // Mock User.countDocuments to return 1
      User.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/auth/setup-admin')
        .send({
          name: 'Another Admin',
          email: 'admin2@school.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already completed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return error if missing email or password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@school.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
