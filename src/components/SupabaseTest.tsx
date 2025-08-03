import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { setupDatabase, insertTestData } from "@/lib/supabase-setup";

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...");
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<any[]>([]);
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    checkEnvironmentVariables();
    testConnection();
  }, []);

  const checkEnvironmentVariables = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setEnvVars({ url, key: key ? `${key.substring(0, 20)}...` : 'Not set' });
    
    console.log('Environment variables:');
    console.log('VITE_SUPABASE_URL:', url);
    console.log('VITE_SUPABASE_ANON_KEY:', key ? `${key.substring(0, 20)}...` : 'Not set');
  };

  const testConnection = async () => {
    try {
      setConnectionStatus("Testing connection...");
      setError(null);

      // Test 1: Check if we can connect to Supabase
      const { data, error: connectionError } = await supabase
        .from('inventory_requests')
        .select('*')
        .limit(1);

      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        
        // If table doesn't exist, try to create it
        if (connectionError.message.includes('relation "inventory_requests" does not exist')) {
          setConnectionStatus("Table doesn't exist. Creating table...");
          await createTable();
          return;
        }
        
        setError(`Connection failed: ${connectionError.message}`);
        setConnectionStatus("Connection failed");
        return;
      }

      setConnectionStatus("Connection successful!");
      setTestData(data || []);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setConnectionStatus("Connection failed");
    }
  };

  const createTable = async () => {
    try {
      setConnectionStatus("Checking database setup...");
      setError(null);

      const result = await setupDatabase();
      
      if (result.success) {
        setConnectionStatus("Database setup complete!");
        setTestData([]);
      } else {
        setError(result.error);
        setConnectionStatus("Database setup failed");
      }

    } catch (err) {
      console.error('Unexpected error during setup:', err);
      setError(`Setup failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setConnectionStatus("Setup failed");
    }
  };

  const testInsert = async () => {
    try {
      setConnectionStatus("Testing insert...");
      setError(null);

      const testRequest = {
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
      };

      const { data, error: insertError } = await supabase
        .from('inventory_requests')
        .insert([testRequest])
        .select();

      if (insertError) {
        console.error('Insert error:', insertError);
        setError(`Insert failed: ${insertError.message}`);
        setConnectionStatus("Insert failed");
        return;
      }

      setConnectionStatus("Insert successful!");
      setTestData(data || []);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setConnectionStatus("Insert failed");
    }
  };

  const testFetch = async () => {
    try {
      setConnectionStatus("Testing fetch...");
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('inventory_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        setError(`Fetch failed: ${fetchError.message}`);
        setConnectionStatus("Fetch failed");
        return;
      }

      setConnectionStatus("Fetch successful!");
      setTestData(data || []);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setConnectionStatus("Fetch failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test & Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={testConnection}>Test Connection</Button>
            <Button onClick={createTable} variant="outline">Check Setup</Button>
            <Button onClick={testInsert} variant="outline">Test Insert</Button>
            <Button onClick={testFetch} variant="outline">Test Fetch</Button>
            <Button onClick={checkEnvironmentVariables} variant="outline">Check Env Vars</Button>
          </div>

          <div className="space-y-4">
            <div>
              <p><strong>Status:</strong> {connectionStatus}</p>
            </div>

            <div>
              <p><strong>Environment Variables:</strong></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div>
                  <Badge variant="outline">URL: {envVars.url || 'Not set'}</Badge>
                </div>
                <div>
                  <Badge variant="outline">Key: {envVars.key || 'Not set'}</Badge>
                </div>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {testData.length > 0 && (
              <div>
                <p><strong>Test Data ({testData.length} records):</strong></p>
                <pre className="bg-muted p-2 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(testData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseTest; 