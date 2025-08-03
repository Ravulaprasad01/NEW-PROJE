import { supabase } from './supabase';

export const setupDatabase = async () => {
  try {
    console.log('Setting up database...');

    // First, let's check if the table exists
    const { data: existingTables, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'inventory_requests');

    if (tableCheckError) {
      console.error('Error checking tables:', tableCheckError);
      return { success: false, error: tableCheckError.message };
    }

    if (existingTables && existingTables.length > 0) {
      console.log('Table already exists');
      return { success: true, message: 'Table already exists' };
    }

    // If table doesn't exist, we need to create it manually
    // For now, we'll return an error asking the user to create it manually
    return {
      success: false,
      error: 'Table does not exist. Please create it manually in the Supabase dashboard using the SQL provided in setup-database.sql'
    };

  } catch (error) {
    console.error('Setup error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const insertTestData = async () => {
  try {
    const testData = [
      {
        user_email: "test@example.com",
        user_name: "Test User",
        items: [
          {
            product_id: "PKI-20",
            product_name: "PKI-20",
            quantity: 1,
            unit_price: 17000,
            total_price: 17000,
          }
        ],
        total_amount: 17000,
        status: "pending",
      },
      {
        user_email: "john@example.com",
        user_name: "John Doe",
        items: [
          {
            product_id: "PKA-20",
            product_name: "PKA-20",
            quantity: 2,
            unit_price: 20000,
            total_price: 40000,
          }
        ],
        total_amount: 40000,
        status: "approved",
      }
    ];

    const { data, error } = await supabase
      .from('inventory_requests')
      .insert(testData)
      .select();

    if (error) {
      console.error('Insert test data error:', error);
      return { success: false, error: error.message };
    }

    console.log('Test data inserted successfully:', data);
    return { success: true, data };

  } catch (error) {
    console.error('Insert test data error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}; 