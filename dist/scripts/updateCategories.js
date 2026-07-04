"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const Category_1 = require("../models/Category");
dotenv_1.default.config();
const updateCategories = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/luxy-db';
        await mongoose_1.default.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        // Update categories
        const updates = [
            { old: 'darkcholate', new: 'Drinks' },
            { old: 'prime', new: 'Sweet' }
        ];
        for (const update of updates) {
            const result = await Category_1.Category.updateMany({ name: new RegExp('^' + update.old + '$', 'i') }, { name: update.new });
            if (result.modifiedCount > 0) {
                console.log(`✅ Updated ${result.modifiedCount} category from "${update.old}" to "${update.new}"`);
            }
            else {
                console.log(`ℹ️  No categories found with name "${update.old}"`);
            }
        }
        // Verify the updates
        const allCategories = await Category_1.Category.find().select('name');
        console.log('\n📋 All categories after update:');
        allCategories.forEach(cat => console.log(`  - ${cat.name}`));
        await mongoose_1.default.disconnect();
        console.log('\n✅ Script completed successfully');
    }
    catch (error) {
        console.error('❌ Error updating categories:', error);
        process.exit(1);
    }
};
updateCategories();
//# sourceMappingURL=updateCategories.js.map