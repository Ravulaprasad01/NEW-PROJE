import Header from "@/components/Header";
import InventoryRequestForm from "@/components/InventoryRequestForm";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const InventoryRequestPage = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      login();
      // Optionally navigate away or show a message if login modal is not sufficient
      // For now, the login modal will appear, and the user will remain on this page.
      // Once logged in, the user state will update, and they can proceed.
    }
  }, [user, loading, login, navigate]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p>Loading or redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Inventory Request</h1>
            <p className="text-muted-foreground text-lg">
              Submit your inventory request and we'll get back to you with approval and invoice details.
            </p>
          </div>
          <InventoryRequestForm />
        </div>
      </main>
    </div>
  );
};

export default InventoryRequestPage; 