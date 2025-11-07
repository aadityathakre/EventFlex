import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Pool from '../src/models/Pool.model.js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set in .env. Aborting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.DB_NAME || undefined });

    console.log('Connected to MongoDB, scanning pools...');

    // Find pools missing venue.city or missing date
    const missingVenue = await Pool.find({ $or: [ { 'venue': { $exists: false } }, { 'venue.city': { $exists: false } }, { 'venue.city': null }, { 'venue.city': '' } ] }).lean().limit(100);
    const missingDate = await Pool.find({ $or: [ { date: { $exists: false } }, { date: null } ] }).lean().limit(100);

    console.log(`Pools missing venue.city (sample up to 100): ${missingVenue.length}`);
    missingVenue.forEach(p => console.log(`- id: ${p._id.toString()}, name: ${p.name || p.pool_name || '<untitled>'}`));

    console.log(`\nPools missing date (sample up to 100): ${missingDate.length}`);
    missingDate.forEach(p => console.log(`- id: ${p._id.toString()}, name: ${p.name || p.pool_name || '<untitled>'}`));

    // Combined count
    const missingEitherCount = await Pool.countDocuments({ $or: [ { 'venue.city': { $exists: false } }, { 'venue.city': null }, { 'venue.city': '' }, { date: { $exists: false } }, { date: null } ] });
    console.log(`\nTotal pools missing either venue.city or date: ${missingEitherCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error scanning pools', err);
    process.exit(1);
  }
}

main();
