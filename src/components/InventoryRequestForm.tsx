import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Package, ShoppingCart, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, InventoryRequest, Product } from "@/lib/supabase";
import { emailService } from "@/lib/email-service";

const requestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  message: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

// Available products
const availableProducts: Product[] = [
  {
    id: "PKA0020KYSSDPKK",
    name: "20kg Planet Pet CP Chicken & Turkey",
    price: 17000,
    currency: "JPY",
    description: "20kg Planet Pet CP Chicken & Turkey",
    available_quantity: 100,
  },
  {
    id: "PKI0020KYSSDPKK",
    name: "20kg Planet Pet CP Lamb, Sweet Potato & Apple",
    price: 20000,
    currency: "JPY",
    description: "20kg Planet Pet CP Lamb, Sweet Potato & Apple",
    available_quantity: 100,
  },
  {
    id: "SFI0012KPPSXZZZ",
    name: "12kg Superfood 65 Scottish Salmon Small Breed Dog",
    price: 11000,
    currency: "JPY",
    description: "12kg Superfood 65 Scottish Salmon Small Breed Dog",
    available_quantity: 100,
  },
  {
    id: "GFJ0012KUPSXZZZ",
    name: "12kg GF Duck with Sweet Potato & Orange",
    price: 10000,
    currency: "JPY",
    description: "12kg GF Duck with Sweet Potato & Orange",
    available_quantity: 100,
  },
  {
    id: "GFE0012KPPSDZZZ",
    name: "12kg Light GF Trout with Salmon & Asparagus",
    price: 10500,
    currency: "JPY",
    description: "12kg Light GF Trout with Salmon & Asparagus",
    available_quantity: 100,
  },
  {
    id: "TGE0012KPPSDZZZ",
    name: "12kg Light GF Turkey with Sweet Potato, Cranberry",
    price: 10500,
    currency: "JPY",
    description: "12kg Light GF Turkey with Sweet Potato, Cranberry",
    available_quantity: 100,
  },
  {
    id: "NGE0006KUPSXZZZ",
    name: "6kg Small Breed Lamb Sweet Potato & Mint",
    price: 6000,
    currency: "JPY",
    description: "6kg Small Breed Lamb Sweet Potato & Mint",
    available_quantity: 100,
  },
  {
    id: "SFM0012KPPSXZZZ",
    name: "12kg Superfood 65 Free Range Turkey SmBrd Senior",
    price: 10500,
    currency: "JPY",
    description: "12kg Superfood 65 Free Range Turkey SmBrd Senior",
    available_quantity: 100,
  },
  {
    id: "DGF0006KUPSXZZZ",
    name: "6kg Small Breed GF Duck with Sweet Potato & Orange",
    price: 5500,
    currency: "JPY",
    description: "6kg Small Breed GF Duck with Sweet Potato & Orange",
    available_quantity: 100,
  },
  {
    id: "SFL0012KPPSXZZZ",
    name: "12kg Superfood 65 British Grass Fed Lamb Adult Dog",
    price: 11500,
    currency: "JPY",
    description: "12kg Superfood 65 British Grass Fed Lamb Adult Dog",
    available_quantity: 100,
  },
  {
    id: "CCT0005KPPSXZZZ",
    name: "5kg Connoisseur Cat Adult Turkey & Chicken",
    price: 6000,
    currency: "JPY",
    description: "5kg Connoisseur Cat Adult Turkey & Chicken",
    available_quantity: 100,
  },
  {
    id: "TDP0K070PPIXZZZ",
    name: "25 x70g. Dental Treat",
    price: 10500,
    currency: "JPY",
    description: "25 x70g. Dental Treat",
    available_quantity: 100,
  },
  {
    id: "XGC0K070PPIXZZZ",
    name: "25 x70g. Calming Treat",
    price: 10500,
    currency: "JPY",
    description: "25 x70g. Calming Treat",
    available_quantity: 100,
  },
  {
    id: "XGF0K070PPIXZZZ",
    name: "25 x70g Immune Treat",
    price: 10500,
    currency: "JPY",
    description: "25 x70g Immune Treat",
    available_quantity: 100,
  },
  {
    id: "NGEPPFAUS",
    name: "20kg   CP Lamb, Sweet Potato & Apple",
    price: 9000,
    currency: "JPY",
    description: "20kg   CP Lamb, Sweet Potato & Apple",
    available_quantity: 100,
  },
  {
    id: "KCPFLambCat",
    name: "12.5kg  NZ Grass Fed Lamb Cat",
    price: 9000,
    currency: "JPY",
    description: "12.5kg  NZ Grass Fed Lamb Cat",
    available_quantity: 100,
  },
  {
    id: "KCPFBeefCat",
    name: "12.5kg  NZ Grass Fed Beef Cat",
    price: 9000,
    currency: "JPY",
    description: "12.5kg  NZ Grass Fed Beef Cat",
    available_quantity: 100,
  },
];

const InventoryRequestForm = () => {
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
  });

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity >= 0) {
      setSelectedItems(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const calculateTotal = () => {
    return Object.entries(selectedItems).reduce((total, [productId, quantity]) => {
      const product = availableProducts.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const getSelectedItems = () => {
    return Object.entries(selectedItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = availableProducts.find(p => p.id === productId);
        return {
          product_id: productId,
          product_name: product?.name || "",
          quantity,
          unit_price: product?.price || 0,
          total_price: (product?.price || 0) * quantity,
        };
      });
  };

  const onSubmit = async (data: RequestFormData) => {
    const items = getSelectedItems();
    
    if (items.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one product to request.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create inventory request
      const request: Omit<InventoryRequest, 'id' | 'created_at' | 'updated_at'> = {
        user_email: data.email,
        user_name: data.name,
        items,
        total_amount: calculateTotal(),
        status: 'pending',
        admin_notes: data.message,
      };

      const { data: insertedRequest, error } = await supabase
        .from('inventory_requests')
        .insert([request])
        .select()
        .single();

      if (error) throw error;

      // Send email notifications
      const [adminEmailSuccess, userEmailSuccess] = await Promise.all([
        emailService.sendAdminNotification({
          user_name: data.name,
          user_email: data.email,
          items: items,
          total_amount: calculateTotal(),
          request_id: insertedRequest.id,
          status: 'pending',
          admin_notes: data.message,
        }),
        emailService.sendUserConfirmation({
          user_name: data.name,
          user_email: data.email,
          items: items,
          total_amount: calculateTotal(),
          request_id: insertedRequest.id,
          status: 'pending',
          admin_notes: data.message,
        })
      ]);

      if (adminEmailSuccess && userEmailSuccess) {
        toast({
          title: "Request Submitted Successfully",
          description: "Your inventory request has been sent to our team. You will receive an email confirmation shortly.",
        });
      } else {
        toast({
          title: "Request Submitted",
          description: "Your request was submitted but some email notifications failed to send. Please check your email or contact support.",
          variant: "destructive",
        });
      }

      // Reset form
      reset();
      setSelectedItems({});

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Inventory Request Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.name.message}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.email.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Select Products</Label>
              <div className="grid gap-4">
                {availableProducts.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="font-semibold">{product.name}</span>
                            <Badge variant="secondary">{product.id}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.description} 
                          </p>
                          <p className="text-sm font-medium mt-1">
                            ¥{product.price.toLocaleString()} per unit
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, (selectedItems[product.id] || 0) - 1)}
                            disabled={(selectedItems[product.id] || 0) <= 0}
                          >
                            -
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {selectedItems[product.id] || 0}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(product.id, (selectedItems[product.id] || 0) + 1)}
                            disabled={(selectedItems[product.id] || 0) >= product.available_quantity}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            {Object.keys(selectedItems).some(key => selectedItems[key] > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getSelectedItems().map((item) => (
                      <div key={item.product_id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-sm text-muted-foreground ml-2">({item.product_id})</span>
                        </div>
                        <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                        <span className="font-medium">¥{item.total_price.toLocaleString()}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total</span>
                      <span>¥{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Additional Message (Optional)</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Any additional information or special requirements..."
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Submitting Request..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Inventory Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryRequestForm; 