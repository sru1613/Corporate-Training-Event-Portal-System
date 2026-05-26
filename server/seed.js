/**
 * Seed Script - Creates initial admin user
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@corporateportal.com' });
    if (existing) {
      console.log('⚠️  Admin already exists: admin@corporateportal.com');
    } else {
      const admin = await User.create({
        name: 'System Administrator',
        email: 'admin@corporateportal.com',
        password: 'Admin@123',
        role: 'admin',
        department: 'IT',
        designation: 'System Admin',
        employeeId: 'EMP001',
        isActive: true,
      });
      console.log('✅ Admin created:', admin.email);
    }

    // Create sample trainer
    const trainerExists = await User.findOne({ email: 'trainer@corporateportal.com' });
    if (!trainerExists) {
      await User.create({
        name: ' Krishna Trainer',
        email: 'trainer@corporateportal.com',
        password: 'Trainer@123',
        role: 'trainer',
        department: 'L&D',
        designation: 'Senior Trainer',
        employeeId: 'EMP002',
        isActive: true,
      });
      console.log('✅ Trainer created: trainer@corporateportal.com');
    }

    // Create sample employee
    const empExists = await User.findOne({ email: 'employee@corporateportal.com' });
    if (!empExists) {
      await User.create({
        name: 'Ram Employee',
        email: 'employee@corporateportal.com',
        password: 'Employee@123',
        role: 'employee',
        department: 'Engineering',
        designation: 'Software Engineer',
        employeeId: 'EMP003',
        isActive: true,
      });
      console.log('✅ Employee created: employee@corporateportal.com');
    }

    console.log('\n🎉 Seed complete! Demo accounts:');
    console.log('   Admin:    admin@corporateportal.com    / Admin@123');
    console.log('   Trainer:  trainer@corporateportal.com  / Trainer@123');
    console.log('   Employee: employee@corporateportal.com / Employee@123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
