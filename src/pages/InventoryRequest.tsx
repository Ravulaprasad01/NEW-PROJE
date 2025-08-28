import Header from "@/components/Header";
import InventoryRequestForm from "@/components/InventoryRequestForm";

const InventoryRequestPage = () => {
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