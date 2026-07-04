import { User } from '../models/User';

export const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@genesisbypreethy.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    return;
  }

  await User.create({
    name: 'System Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'superadmin',
    isVerified: true,
    isActive: true,
  });

  console.log(`✅ Seed admin created: ${adminEmail} / ${adminPassword}`);
};
