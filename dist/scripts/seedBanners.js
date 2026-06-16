"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Banner_1 = require("../models/Banner");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seedBanners = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/luxy-galleria';
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        // Clear old banners
        await Banner_1.Banner.deleteMany({});
        console.log('🗑️  Cleared old banners');
        // Create sample banners for Drinks & Sweets
        const banners = [
            {
                title: 'Refreshing Drinks Collection',
                description: 'Enjoy our premium selection of fresh and delicious drinks',
                image: 'https://images.unsplash.com/photo-1589985643985-33b5f0ee2a1d?w=1200&h=400&fit=crop',
                mobileImage: 'https://images.unsplash.com/photo-1589985643985-33b5f0ee2a1d?w=600&h=400&fit=crop',
                status: 'ACTIVE',
            },
            {
                title: 'Sweet Treats Galore',
                description: 'Indulge in our delectable selection of sweets and desserts',
                image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200&h=400&fit=crop',
                mobileImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop',
                status: 'ACTIVE',
            },
            {
                title: 'Special Combo Offers',
                description: 'Get the best deals on your favorite drinks and sweets',
                image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ffa?w=1200&h=400&fit=crop',
                mobileImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ffa?w=600&h=400&fit=crop',
                status: 'ACTIVE',
            },
        ];
        const createdBanners = await Banner_1.Banner.insertMany(banners);
        console.log(`📂 Created ${createdBanners.length} banners`);
        console.log('\n✅ Banner seeding completed successfully!');
        console.log('Banners created:');
        createdBanners.forEach((banner) => {
            console.log(`  - ${banner.title}`);
        });
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error seeding banners:', error);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
};
seedBanners();
//# sourceMappingURL=seedBanners.js.map