#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Simple script to test MongoDB connectivity and basic operations
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DatabaseService = require('../services/database');

async function testMongoDB() {
  console.log('🧪 Testing MongoDB Connection...\n');
  
  try {
    // Test connection
    console.log('1. Testing connection...');
    await DatabaseService.connect();
    console.log('✅ Connection successful\n');
    
    // Test health check
    console.log('2. Testing health check...');
    const health = await DatabaseService.healthCheck();
    console.log('✅ Health check passed');
    console.log(`   Status: ${health.status}`);
    console.log(`   Database: ${health.database}`);
    console.log(`   Host: ${health.host}:${health.port}\n`);
    
    // Test database stats
    console.log('3. Testing database stats...');
    const dbStats = await DatabaseService.getDatabaseStats();
    if (dbStats) {
      console.log('✅ Database stats retrieved');
      console.log(`   Collections: ${dbStats.collections}`);
      console.log(`   Documents: ${dbStats.objects}`);
      console.log(`   Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.log('⚠️  No database stats available');
    }
    console.log();
    
    // Test basic CRUD operations
    console.log('4. Testing basic operations...');
    await testBasicOperations();
    console.log('✅ Basic operations test passed\n');
    
    console.log('🎉 All MongoDB tests passed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await DatabaseService.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

async function testBasicOperations() {
  try {
    // Test creating a simple test document
    const testCollection = mongoose.connection.db.collection('test');
    
    // Insert a test document
    const testDoc = {
      name: 'MongoDB Test',
      timestamp: new Date(),
      message: 'This is a test document for MongoDB connectivity'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`   ✅ Insert test passed (ID: ${insertResult.insertedId})`);
    
    // Find the document
    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    if (foundDoc) {
      console.log('   ✅ Find test passed');
    } else {
      throw new Error('Document not found');
    }
    
    // Update the document
    const updateResult = await testCollection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { message: 'Updated test document' } }
    );
    if (updateResult.modifiedCount > 0) {
      console.log('   ✅ Update test passed');
    } else {
      throw new Error('Update failed');
    }
    
    // Delete the test document
    const deleteResult = await testCollection.deleteOne({ _id: insertResult.insertedId });
    if (deleteResult.deletedCount > 0) {
      console.log('   ✅ Delete test passed');
    } else {
      throw new Error('Delete failed');
    }
    
  } catch (error) {
    console.error('❌ Basic operations test failed:', error.message);
    throw error;
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testMongoDB().catch(console.error);
}

module.exports = { testMongoDB };
