"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Category_1 = require("../models/Category");
dotenv_1.default.config();
const checkAndCreateCategories = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/luxy-db';
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        // Check existing categories
        const existingCategories = await Category_1.Category.find().select('name image status');
        console.log('\n📋 Current categories in database:');
        if (existingCategories.length === 0) {
            console.log('  No categories found');
        }
        else {
            existingCategories.forEach(cat => console.log(`  - ${cat.name}`));
        }
        // Define categories to ensure exist
        const categoriesToEnsure = [
            { name: 'Drinks', image: '/images/drinks.jpg' },
            { name: 'Sweet', image: '/images/sweet.jpg' }
        ];
        console.log('\n🔄 Ensuring categories exist...');
        for (const catData of categoriesToEnsure) {
            const exists = await Category_1.Category.findOne({ name: catData.name });
            if (!exists) {
                await Category_1.Category.create({
                    name: catData.name,
                    image: catData.image,
                    status: 'ACTIVE'
                });
                console.log(`✅ Created category: ${catData.name}`);
            }
            else {
                console.log(`ℹ️  Category already exists: ${catData.name}`);
            }
        }
        // Verify final state
        const finalCategories = await Category_1.Category.find().select('name');
        console.log('\n📋 Final categories:');
        finalCategories.forEach(cat => console.log(`  - ${cat.name}`));
        await mongoose_1.default.disconnect();
        console.log('\n✅ Script completed successfully');
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};
checkAndCreateCategories();
//# sourceMappingURL=setupCategories.js.map