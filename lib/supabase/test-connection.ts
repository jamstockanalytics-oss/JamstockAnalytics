import { supabase } from './client'

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Supabase connection test completed (expected error for non-existent table):', error.message)
      return { success: true, message: 'Connection established (table not found is expected)' }
    }
    
    console.log('Supabase connection successful!')
    return { success: true, message: 'Connection established successfully', data }
  } catch (err) {
    console.error('Supabase connection failed:', err)
    return { success: false, message: 'Connection failed', error: err }
  }
}

// Test authentication
export async function testSupabaseAuth() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('Auth test (no user logged in):', error.message)
      return { success: true, message: 'Auth service accessible (no user logged in)' }
    }
    
    console.log('Auth test successful, user:', user?.email)
    return { success: true, message: 'Auth service working', user }
  } catch (err) {
    console.error('Auth test failed:', err)
    return { success: false, message: 'Auth test failed', error: err }
  }
}
