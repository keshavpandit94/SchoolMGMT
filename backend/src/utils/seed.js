import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Inventory from '../models/Inventory.js';

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_mgmt';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for database seeding...');

    // 1. Seed Admin User
    let admin = await User.findOne({ email: 'admin@school.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@school.com',
        password: 'password123',
        role: 'Admin',
        phone: '555-0100',
        isVerified: true,
      });
      console.log('✅ Admin user created: admin@school.com / password123');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // 2. Seed Teacher User & Profile
    let teacherUser = await User.findOne({ email: 'teacher@school.com' });
    if (!teacherUser) {
      teacherUser = await User.create({
        name: 'Sarah Jenkins',
        email: 'teacher@school.com',
        password: 'password123',
        role: 'Teacher',
        phone: '555-0101',
        isVerified: true,
      });

      await Teacher.create({
        userId: teacherUser._id,
        department: 'Science & Physics',
        designation: 'Senior Lecturer',
        qualifications: ['M.Sc Physics', 'B.Ed'],
        subjectsTaught: ['Physics', 'General Science'],
      });
      console.log('✅ Teacher user created: teacher@school.com / password123');
    } else {
      console.log('ℹ️ Teacher user already exists.');
    }

    // 3. Seed Sample Student
    const sampleStudent = await Student.findOne({ rollNumber: 'STU-1001' });
    if (!sampleStudent) {
      await Student.create({
        name: 'Alexander Pierce',
        rollNumber: 'STU-1001',
        class: 'Class 10',
        section: 'A',
        dateOfBirth: new Date('2009-04-15'),
        gender: 'Male',
        address: '742 Evergreen Terrace, Springfield',
        guardianName: 'Robert Pierce',
        guardianPhone: '555-0199',
        guardianEmail: 'robert.pierce@example.com',
        createdBy: admin._id,
      });
      console.log('✅ Sample Student STU-1001 created.');
    }

    // 4. Seed Sample Inventory Item
    const sampleItem = await Inventory.findOne({ itemName: 'Physics Lab Microscope' });
    if (!sampleItem) {
      await Inventory.create({
        itemName: 'Physics Lab Microscope',
        quantity: 12,
        category: 'Lab Equipment',
        condition: 'Good',
        location: 'Science Lab 201',
        assignedTo: 'Science Department',
        lastUpdatedBy: admin._id,
        logs: [
          {
            action: 'Created',
            message: 'Initial seed registration of lab microscopes',
            updatedBy: admin._id,
          },
        ],
      });
      console.log('✅ Sample Inventory Item created.');
    }

    console.log('\n🎉 Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  }
};

seedDB();
