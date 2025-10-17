#!/usr/bin/env node

/**
 * Get Function Definition Script for JamStockAnalytics
 * 
 * This script connects to the Supabase database and retrieves
 * the complete function definition for a specified function.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const FUNCTION_NAME = process.argv[2] || 'upsert_user_profile';
const SCHEMA_NAME = process.argv[3] || 'public';

class FunctionDefinitionRetriever {
  constructor() {
    this.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      throw new Error('Missing required Supabase environment variables');
    }

    // Create service role client for admin operations
    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('articles')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      
      console.log('✅ Database connection successful\n');
      return true;
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  /**
   * Get function definition using pg_get_functiondef
   */
  async getFunctionDefinition(functionName, schemaName = 'public') {
    console.log(`🔍 Retrieving function definition for: ${schemaName}.${functionName}`);
    
    const query = `
      SELECT pg_get_functiondef(p.oid) AS definition 
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = $1 AND p.proname = $2;
    `;

    try {
      // Try using RPC first
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        sql_query: query,
        params: [schemaName, functionName]
      });

      if (error) {
        console.log('⚠️  RPC method failed, trying alternative approach...');
        return await this.getFunctionDefinitionAlternative(functionName, schemaName);
      }

      if (!data || data.length === 0) {
        throw new Error(`Function '${schemaName}.${functionName}' not found`);
      }

      return data[0].definition;
    } catch (error) {
      console.log('⚠️  Primary method failed, trying alternative...');
      return await this.getFunctionDefinitionAlternative(functionName, schemaName);
    }
  }

  /**
   * Alternative method to get function definition
   */
  async getFunctionDefinitionAlternative(functionName, schemaName = 'public') {
    // Try to get function info from information_schema
    const altQuery = `
      SELECT 
        routine_name,
        routine_definition,
        routine_type,
        data_type,
        routine_body,
        routine_comment
      FROM information_schema.routines 
      WHERE routine_schema = $1 
        AND routine_name = $2
        AND routine_type = 'FUNCTION';
    `;

    try {
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        sql_query: altQuery,
        params: [schemaName, functionName]
      });

      if (error) {
        throw new Error(`Alternative method failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error(`Function '${schemaName}.${functionName}' not found`);
      }

      const func = data[0];
      console.log('⚠️  Using alternative method - definition may be incomplete');
      
      return `
-- Function: ${func.routine_name}
-- Type: ${func.routine_type}
-- Return Type: ${func.data_type}
-- Body: ${func.routine_body}
-- Comment: ${func.routine_comment || 'No comment'}

-- Note: This is a partial definition. For complete CREATE FUNCTION statement,
-- you may need to access the database directly or use pg_get_functiondef.
`;
    } catch (error) {
      throw new Error(`Could not retrieve function definition: ${error.message}`);
    }
  }

  /**
   * List all available functions in the schema
   */
  async listFunctions(schemaName = 'public') {
    console.log(`📋 Listing all functions in schema: ${schemaName}`);
    
    const query = `
      SELECT 
        p.proname as function_name,
        pg_get_function_result(p.oid) as return_type,
        pg_get_function_arguments(p.oid) as arguments,
        p.prosrc as source_code
      FROM pg_proc p 
      JOIN pg_namespace n ON p.pronamespace = n.oid 
      WHERE n.nspname = $1
      ORDER BY p.proname;
    `;

    try {
      const { data, error } = await this.supabase.rpc('exec_sql', { 
        sql_query: query,
        params: [schemaName]
      });

      if (error) {
        console.log('⚠️  Could not list functions:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.log('⚠️  Could not list functions:', error.message);
      return [];
    }
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      console.log('🚀 Function Definition Retriever for JamStockAnalytics\n');
      
      // Test connection
      await this.testConnection();

      // Get function definition
      const definition = await this.getFunctionDefinition(FUNCTION_NAME, SCHEMA_NAME);
      
      console.log('='.repeat(80));
      console.log(`FUNCTION DEFINITION: ${SCHEMA_NAME}.${FUNCTION_NAME}`);
      console.log('='.repeat(80));
      console.log(definition);
      console.log('='.repeat(80));
      
      // If requested, also list all functions
      if (process.argv.includes('--list')) {
        console.log('\n📋 ALL FUNCTIONS IN SCHEMA:');
        const functions = await this.listFunctions(SCHEMA_NAME);
        
        if (functions.length === 0) {
          console.log('No functions found in the schema.');
        } else {
          functions.forEach((func, index) => {
            console.log(`\n${index + 1}. ${func.function_name}`);
            console.log(`   Return Type: ${func.return_type}`);
            console.log(`   Arguments: ${func.arguments || 'None'}`);
            if (func.source_code && func.source_code.length < 200) {
              console.log(`   Source: ${func.source_code.substring(0, 200)}...`);
            }
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      
      if (error.message.includes('not found')) {
        console.log('\n💡 Suggestions:');
        console.log('   1. Check if the function name is correct');
        console.log('   2. Verify the schema name');
        console.log('   3. Run with --list to see all available functions');
        console.log('   4. Make sure you have the necessary permissions');
      }
      
      process.exit(1);
    }
  }
}

// Main execution
async function main() {
  try {
    const retriever = new FunctionDefinitionRetriever();
    await retriever.run();
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Function Definition Retriever for JamStockAnalytics

Usage: node get-function-definition.js [function_name] [schema_name] [options]

Arguments:
  function_name    Name of the function to retrieve (default: upsert_user_profile)
  schema_name      Schema name (default: public)

Options:
  --list          Also list all functions in the schema
  --help, -h      Show this help message

Examples:
  node get-function-definition.js                           # Get upsert_user_profile
  node get-function-definition.js my_function               # Get my_function from public schema
  node get-function-definition.js my_function my_schema     # Get my_function from my_schema
  node get-function-definition.js --list                    # List all functions
  node get-function-definition.js my_function public --list # Get function and list all
`);
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { FunctionDefinitionRetriever };
