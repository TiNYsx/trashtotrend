// setup-db.cjs - Run this script to set up the database
// Usage: node scripts/setup-db.cjs

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database credentials from .env.local
const config = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '8br6JD9D6:*ADpk', // Decoded from 8br6JD9D6%3A%2ADpk
  database: 'from_trash_to_trend'
};

async function setup() {
  let client;
  
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    client = new Client(config);
    await client.connect();
    console.log('✅ Connected!\n');

    // Read and execute schema
    console.log('📦 Creating tables...');
    const schemaPath = path.join(__dirname, '001-create-tables.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('✅ Tables created!\n');

    // Read and execute seed data
    console.log('🌱 Seeding data...');
    const seedPath = path.join(__dirname, '002-seed-data.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    await client.query(seed);
    console.log('✅ Data seeded!\n');

    // Run schema updates (003)
    console.log('🔄 Running schema updates...');
    const updatePath = path.join(__dirname, '003-update-quiz-survey-schema.sql');
    const update = fs.readFileSync(updatePath, 'utf8');
    await client.query(update);
    console.log('✅ Schema updated!\n');

    // Create booths and related tables (004)
    console.log('🏪 Creating booths and related tables...');
    const boothsPath = path.join(__dirname, '004-create-booths-and-related-tables.sql');
    const booths = fs.readFileSync(boothsPath, 'utf8');
    await client.query(booths);
    console.log('✅ Booths and related tables created!\n');

    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check if the password is correct');
    console.log('3. Try connecting via pgAdmin to verify credentials');
    process.exit(1);
  } finally {
    if (client) await client.end();
  }
}

setup();
