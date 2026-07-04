"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
const User_1 = require("../models/User");
const seedAdmin = async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@genesisbypreethy.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const existingAdmin = await User_1.User.findOne({ email: adminEmail });
    if (existingAdmin) {
        return;
    }
    await User_1.User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin',
        isVerified: true,
        isActive: true,
    });
    console.log(`✅ Seed admin created: ${adminEmail} / ${adminPassword}`);
};
exports.seedAdmin = seedAdmin;
//# sourceMappingURL=seedAdmin.js.map