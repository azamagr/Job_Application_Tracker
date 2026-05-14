const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User        = require('./models/User');
const Job         = require('./models/Job');
const Application = require('./models/Application');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB for seeding...');

  // Clear existing
  await Promise.all([User.deleteMany(), Job.deleteMany(), Application.deleteMany()]);

  // Create admin
  const admin = await User.create({
    firstName: 'Azam', lastName: 'Agr',
    email: 'azamghafoorreal@gmail.com', password: 'Azam$$0418', role: 'admin'
  });

  // Create sample users
  const users = await User.create([
    { firstName: 'Ali', lastName: 'Hassan', email: 'ali@example.com', password: 'user123',
      skills: ['React', 'Node.js', 'MongoDB'], careerPreferences: 'Hybrid' },
    { firstName: 'Sara', lastName: 'Khan', email: 'sara@example.com', password: 'user123',
      skills: ['Python', 'Data Science'], careerPreferences: 'Full-time remote' },
    { firstName: 'Bilal', lastName: 'Ahmed', email: 'bilal@example.com', password: 'user123',
      skills: ['Java', 'Spring Boot'], isActive: false },
  ]);

  // Create jobs (by admin)
  const jobs = await Job.create([
    { company: 'Google', title: 'Senior Software Engineer', category: 'Engineering',
      description: 'Build scalable distributed systems.', location: 'Remote', postedBy: admin._id, applicationCount: 124 },
    { company: 'Meta', title: 'Product Manager', category: 'Management',
      description: 'Lead cross-functional teams to ship great products.', location: 'Hybrid', postedBy: admin._id, applicationCount: 98 },
    { company: 'Arbisoft', title: 'React Developer', category: 'Engineering',
      description: 'Build modern React web applications for clients.', location: 'On-site – Lahore', postedBy: admin._id, applicationCount: 42 },
    { company: 'Systems Ltd', title: 'Data Scientist', category: 'Data Science',
      description: 'Analyze datasets and build ML models for enterprise clients.', location: 'Hybrid', postedBy: admin._id, applicationCount: 67 },
    { company: 'Stripe', title: 'Backend Engineer', category: 'Engineering',
      description: 'Work on payment infrastructure used by millions.', location: 'Remote', postedBy: admin._id, applicationCount: 55 },
  ]);

  // Create sample applications for Ali
  await Application.create([
    { user: users[0]._id, job: jobs[0]._id, company: 'Google', position: 'Senior Software Engineer',
      status: 'Interview', dateApplied: new Date('2026-04-10'), contactPerson: 'sarah.h@google.com' },
    { user: users[0]._id, job: jobs[1]._id, company: 'Meta', position: 'Product Manager',
      status: 'Applied', dateApplied: new Date('2026-04-15') },
    { user: users[0]._id, company: 'Amazon', position: 'SDE II',
      status: 'Screening', dateApplied: new Date('2026-04-20') },
    { user: users[0]._id, job: jobs[4]._id, company: 'Stripe', position: 'Backend Engineer',
      status: 'Offer', dateApplied: new Date('2026-05-01') },
    { user: users[0]._id, company: 'Microsoft', position: 'Cloud Architect',
      status: 'Rejected', dateApplied: new Date('2026-04-28') },
  ]);

  console.log('🌱 Seed data inserted!');
  console.log('');
  console.log('📋 Login credentials:');
  console.log('   Admin  → admin@jobtracker.com  / admin123');
  console.log('   User 1 → ali@example.com       / user123');
  console.log('   User 2 → sara@example.com      / user123');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });