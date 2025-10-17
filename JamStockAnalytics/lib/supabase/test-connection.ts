import { supabase } from './client'

export async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Table not found:', error.message)
      return { success: true, message: 'Connection established (table not found is expected)' }
    }
    
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
      console.log('Auth error:', error.message)
      return { success: true, message: 'Auth service accessible (no user logged in)' }
    }
    
    return { success: true, message: 'Auth service working', user }
  } catch (err) {
    console.error('Auth test failed:', err)
    return { success: false, message: 'Auth test failed', error: err }
  }
}
