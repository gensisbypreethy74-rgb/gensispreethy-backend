import { User } from '../models/User';

export const seedAdmin = async () => {
  const existingAdmin = await User.findOne({ role: { $in: ['admin', 'superadmin'] } });

  if (existingAdmin) {
    return;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@luxygalleria.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';

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
