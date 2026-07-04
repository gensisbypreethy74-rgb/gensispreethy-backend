require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI;

console.log('Testing connection to MongoDB...');
console.log('URI:', mongoUri ? mongoUri.replace(/:([^@]+)@/, ':****@') : 'NOT SET');

if (!mongoUri) {
  console.error('❌ MONGODB_URI is not defined in .env file!');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout instead of 30 seconds
})
.then(() => {
  console.log('✅ SUCCESS: Successfully connected to MongoDB!');
  process.exit(0);
})
.catch((err) => {
  console.error('❌ CONNECTION ERROR:', err.message);
  console.log('\nCommon causes:');
  console.log('1. IP Whitelist: Check if your current IP address is whitelisted in MongoDB Atlas Network Access.');
  console.log('2. Credentials: Check if the username and password in MONGODB_URI are correct.');
  console.log('3. Network/Firewall: Check if your internet connection allows outgoing connections on port 27017.');
  process.exit(1);
});
