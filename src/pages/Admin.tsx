import { useState, useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import AdminLogin from "@/components/AdminLogin";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = () => {
      const authenticated = localStorage.getItem('adminAuthenticated');
      const loginTime = localStorage.getItem('adminLoginTime');
      
      if (authenticated && loginTime) {
        // Check if login is still valid (24 hours)
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setIsAuthenticated(true);
        } else {
          // Session expired
          localStorage.removeItem('adminAuthenticated');
          localStorage.removeItem('adminLoginTime');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (success: boolean) => {
    setIsAuthenticated(success);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminLoginTime');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header with Logout */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gusto Brands Admin</h1>
            <p className="text-sm text-gray-600">Inventory Management System</p>
          </div>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      
      <AdminDashboard />
    </div>
  );
};

export default AdminPage; 