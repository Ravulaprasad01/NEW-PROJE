import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for products
const products = [
  { id: "PKI-20", name: "PKI-20", price: 17000, currency: "JPY" },
  { id: "PKA-20", name: "PKA-20", price: 20000, currency: "JPY" },
  { id: "GFH-12", name: "GFH-12", price: 10000, currency: "JPY" },
];

const PartnerPortalSection = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [orderItems, setOrderItems] = useState<{[key: string]: number}>({});
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const { toast } = useToast();

  // Note: In a real application, this would need Supabase integration for authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login validation
    if (loginForm.email && loginForm.password) {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the Partner Order Portal",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Please enter valid credentials",
        variant: "destructive",
      });
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity >= 0) {
      setOrderItems(prev => ({
        ...prev,
        [productId]: quantity
      }));
    }
  };

  const calculateTotal = () => {
    return Object.entries(orderItems).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const handleSubmitOrder = () => {
    const orderProducts = Object.entries(orderItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === productId);
        return { product, quantity };
      });

    if (orderProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product to your order",
        variant: "destructive",
      });
      return;
    }

    // Generate order number
    const orderNumber = `SO-${Date.now()}`;
    const newOrder = {
      orderNumber,
      date: new Date().toLocaleDateString(),
      products: orderProducts,
      total: calculateTotal(),
      status: "Pending"
    };

    setOrderHistory(prev => [newOrder, ...prev]);
    setOrderItems({});

    toast({
      title: "Order Submitted Successfully",
      description: `Order ${orderNumber} has been created and confirmation emails have been sent.`,
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginForm({ email: "", password: "" });
    setOrderItems({});
  };

  return (
    <section id="portal" className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-turquoise mb-4">
            Partner Order Portal
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Secure portal for our trusted partners to place orders and manage their account.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {!isLoggedIn ? (
            /* Login Form */
            <Card className="border-turquoise/20">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-turquoise/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-turquoise" />
                </div>
                <CardTitle className="text-2xl text-turquoise">Partner Login</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertDescription>
                    <strong>Note:</strong> This is a demo portal. Authentication and order processing would require backend integration with Supabase.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <Button type="submit" variant="turquoise" className="w-full">
                      Log In
                    </Button>
                    <div className="text-center space-y-2">
                      <Button variant="link" className="text-turquoise">
                        Create Account
                      </Button>
                      <br />
                      <Button variant="link" className="text-sm text-muted-foreground">
                        Forgot Password?
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            /* Order Portal */
            <div className="space-y-8">
              {/* Header with logout */}
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-primary">Welcome to Order Portal</h3>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>

              {/* Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-turquoise">Place New Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{product.name}</h4>
                          <p className="text-muted-foreground">{product.currency} {product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Label htmlFor={`qty-${product.id}`}>Quantity:</Label>
                          <Input
                            id={`qty-${product.id}`}
                            type="number"
                            min="0"
                            className="w-20"
                            value={orderItems[product.id] || 0}
                            onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total: JPY {calculateTotal().toLocaleString()}</span>
                      <Button variant="turquoise" onClick={handleSubmitOrder}>
                        Submit Order
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order History */}
              {orderHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-turquoise">Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orderHistory.map((order) => (
                        <div key={order.orderNumber} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{order.orderNumber}</h4>
                              <p className="text-sm text-muted-foreground">{order.date}</p>
                              <div className="mt-2">
                                {order.products.map(({ product, quantity }: any) => (
                                  <p key={product.id} className="text-sm">
                                    {product.name} x {quantity}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">JPY {order.total.toLocaleString()}</p>
                              <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                {order.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PartnerPortalSection;