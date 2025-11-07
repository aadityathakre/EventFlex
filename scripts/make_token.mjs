import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.model.js';

dotenv.config();
(async()=>{
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ role: 'host' });
  if(!user){
    console.error('no host user found');
    process.exit(1);
  }
  console.log('hostId:', user._id.toString());
  console.log('token:', user.generateAccessToken());
  process.exit(0);
})();
