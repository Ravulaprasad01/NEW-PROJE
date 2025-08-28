import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Mail,
  Send,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase, InventoryRequest } from "@/lib/supabase";
import { emailService } from "@/lib/email-service";
import PDFDownloadButton from "./PDFDownloadButton";
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { PDFInvoiceGenerator } from '@/lib/pdf-generator';
import { getDistributorForItems } from '@/lib/distributors';
import { createClient } from '@supabase/supabase-js';

const EXCHANGE_RATES: { [key: string]: { [key: string]: number } } = {
  JPY: {
    USD: 0.0067, // 1 JPY = 0.0067 USD
    EUR: 0.0062, // 1 JPY = 0.0062 EUR
    GBP: 0.0053, // 1 JPY = 0.0053 GBP
    JPY: 1,
  },
  USD: {
    JPY: 149.25, // 1 USD = 149.25 JPY
    EUR: 0.93, // 1 USD = 0.93 EUR
    GBP: 0.79, // 1 USD = 0.79 GBP
    USD: 1,
  },
  EUR: {
    JPY: 160.48,
    USD: 1.07,
    GBP: 0.85,
    EUR: 1,
  },
  GBP: {
    JPY: 189.51,
    USD: 1.26,
    EUR: 1.18,
    GBP: 1,
  },
};

const getExchangeRate = (fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  return EXCHANGE_RATES[fromCurrency]?.[toCurrency] || 0;
};

const countries = [
  { name: "Japan", currency: "JPY", symbol: "¥" },
  { name: "United States", currency: "USD", symbol: "$" },
  { name: "Europe", currency: "EUR", symbol: "€" },
  { name: "United Kingdom", currency: "GBP", symbol: "£" },
  { name: "Afghanistan", currency: "AFN", symbol: "؋" },
  { name: "Armenia", currency: "AMD", symbol: "AMD" },
  { name: "Azerbaijan", currency: "AZN", symbol: "₼" },
  { name: "Bahrain", currency: "BHD", symbol: ".د.ب" },
  { name: "Bangladesh", currency: "BDT", symbol: "৳" },
  { name: "Bhutan", currency: "BTN", symbol: "Nu." },
  { name: "Brunei", currency: "BND", symbol: "$" },
  { name: "Cambodia", currency: "KHR", symbol: "៛" },
  { name: "China", currency: "CNY", symbol: "¥" },
  { name: "Cyprus", currency: "EUR", symbol: "€" },
  { name: "Georgia", currency: "GEL", symbol: "₾" },
  { name: "India", currency: "INR", symbol: "₹" },
  { name: "Indonesia", currency: "IDR", symbol: "Rp" },
  { name: "Iran", currency: "IRR", symbol: "﷼" },
  { name: "Iraq", currency: "IQD", symbol: "ع.د" },
  { name: "Israel", currency: "ILS", symbol: "₪" },
  { name: "Jordan", currency: "JOD", symbol: "د.ا" },
  { name: "Kazakhstan", currency: "KZT", symbol: "₸" },
  { name: "Kuwait", currency: "KWD", symbol: "د.ك" },
  { name: "Kyrgyzstan", currency: "KGS", symbol: "сom" },
  { name: "Laos", currency: "LAK", symbol: "₭" },
  { name: "Lebanon", currency: "LBP", symbol: "ل.ل" },
  { name: "Malaysia", currency: "MYR", symbol: "RM" },
  { name: "Maldives", currency: "MVR", symbol: ".ރ" },
  { name: "Mongolia", currency: "MNT", symbol: "₮" },
  { name: "Myanmar", currency: "MMK", symbol: "Ks" },
  { name: "Nepal", currency: "NPR", symbol: "₨" },
  { name: "North Korea", currency: "KPW", symbol: "₩" },
  { name: "Oman", currency: "OMR", symbol: "ر.ع." },
  { name: "Pakistan", currency: "PKR", symbol: "₨" },
  { name: "Palestine", currency: "ILS", symbol: "₪" },
  { name: "Philippines", currency: "PHP", symbol: "₱" },
  { name: "Qatar", currency: "QAR", symbol: "ر.ق" },
  { name: "Russia", currency: "RUB", symbol: "₽" },
  { name: "Saudi Arabia", currency: "SAR", symbol: "ر.س" },
  { name: "Singapore", currency: "SGD", symbol: "$" },
  { name: "South Korea", currency: "KRW", symbol: "₩" },
  { name: "Sri Lanka", currency: "LKR", symbol: "₨" },
  { name: "Syria", currency: "SYP", symbol: "£" },
  { name: "Taiwan", currency: "TWD", symbol: "NT$" },
  { name: "Tajikistan", currency: "TJS", symbol: "ЅМ" },
  { name: "Thailand", currency: "THB", symbol: "฿" },
  { name: "Timor-Leste", currency: "USD", symbol: "$" },
  { name: "Turkey", currency: "TRY", symbol: "₺" },
  { name: "Turkmenistan", currency: "TMT", symbol: "m" },
  { name: "United Arab Emirates", currency: "AED", symbol: "د.إ" },
  { name: "Uzbekistan", currency: "UZS", symbol: "лв" },
  { name: "Vietnam", currency: "VND", symbol: "₫" },
  { name: "Yemen", currency: "YER", symbol: "﷼" },
];

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  admin_comment: z.string().optional(), // Change to admin_comment
  due_date: z.date({ required_error: 'Due date is required' }),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const AdminDashboard = () => {
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      due_date: (() => { const d = new Date(); d.setDate(d.getDate() + 15); return d; })(),
    },
  });
  const dueDate = watch('due_date');

  useEffect(() => {
    fetchRequests();
    // Test Supabase connection and permissions
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection and permissions...');
      
      // Test basic connection
      const { data: testData, error: testError } = await supabase
        .from('inventory_requests')
        .select('id, status')
        .limit(1);
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
      } else {
        console.log('✅ Supabase connection test successful:', testData);
      }
      
      // Test update permissions (dry run)
      const { error: updateTestError } = await supabase
        .from('inventory_requests')
        .update({ status: 'pending' })
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID for testing
      
      if (updateTestError && updateTestError.code === 'PGRST116') {
        console.log('ℹ️ Update permissions test: RLS policy exists (expected)');
      } else if (updateTestError) {
        console.log('ℹ️ Update permissions test result:', updateTestError);
      }
      
    } catch (error) {
      console.error('❌ Supabase connection test error:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_requests')
        .select('*, items, delivery_name, delivery_address_lines') // Select all columns and the new summary
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log("Fetched requests data:", data);
      const processedRequests = data.map((req: InventoryRequest) => {
        let processedItems = req.items;
        if (typeof req.items === 'string') {
          try {
            processedItems = JSON.parse(req.items);
          } catch (parseError) {
            console.error(`Error parsing items for request ${req.id}:`, parseError);
            processedItems = []; // Fallback to empty array on parse error
          }
        }
        // Preserve pricing fields for PDF totals (unit_price/total_price/currency)
        return { ...req, items: processedItems as Array<{ product_id: string; product_name: string; quantity: number; unit_price?: number; total_price?: number; currency?: string; }> };
      });
      setRequests(processedRequests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: InventoryRequest['status']) => {
    setIsProcessing(true);
    try {
      console.log('🔄 Updating status for request:', requestId, 'to:', status);
      
      const { data, error } = await supabase
        .from('inventory_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select();

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Supabase update successful:', data);

      // Force refresh from database to ensure consistency
      await fetchRequests();
      
      // Debug: Check if the update actually persisted
      const { data: verifyData, error: verifyError } = await supabase
        .from('inventory_requests')
        .select('id, status, updated_at')
        .eq('id', requestId)
        .single();
      
      if (verifyError) {
        console.error('❌ Verification query failed:', verifyError);
      } else {
        console.log('🔍 Database verification:', verifyData);
        if (verifyData.status !== status) {
          console.warn('⚠️ Status mismatch! Database shows:', verifyData.status, 'Expected:', status);
        }
      }

      toast({
        title: "Status Updated",
        description: `Request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });

      // Send email notification to user
      const request = requests.find(r => r.id === requestId);
      if (request) {
        const emailSuccess = await emailService.sendStatusUpdate({
          user_name: request.user_name,
          user_email: request.user_email,
          items: request.items,
          total_amount: request.total_amount,
          request_id: request.id,
          status,
          user_notes: request.admin_notes,
        });
        
        if (!emailSuccess) {
          console.warn('⚠️ Status update email failed to send');
        }
      }

    } catch (error) {
      console.error('❌ Error updating status:', error);
      
      // Show detailed error message
      let errorMessage = "Failed to update request status.";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Revert local state on error
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: req.status } : req
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInvoiceSubmit = async (data: InvoiceFormData) => {
    console.log('handleInvoiceSubmit called with:', data);
    console.log('selectedRequest:', selectedRequest);
    
    if (!selectedRequest) {
      console.error('No selected request found!');
      toast({
        title: "Error",
        description: "No request selected. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('🔄 Updating request to completed status:', selectedRequest.id);
      
      const { data: updateData, error } = await supabase
        .from('inventory_requests')
        .update({ 
          status: 'completed',
          invoice_number: data.invoice_number,
          admin_comment: data.admin_comment, // Use admin_comment for admin's notes
          due_date: data.due_date.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id)
        .select();

      if (error) {
        console.error('❌ Supabase update error:', error);
        throw error;
      }

      console.log('✅ Supabase update successful:', updateData);

      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { 
                ...req, 
                status: 'completed',
                invoice_number: data.invoice_number,
                admin_comment: data.admin_comment, // Use admin_comment for local state
                due_date: data.due_date.toISOString(),
                updated_at: new Date().toISOString()
              } 
            : req
        )
      );

      await fetchRequests(); // Re-fetch all requests to ensure UI is up-to-date

      // Resolve distributor (office/delivery) from items
      const distributor = getDistributorForItems(selectedRequest.items || []);
      const hkOfficeLines = [
        "Room B, LG2/F Kai Wong Commercial Building",
        "222 Queen's Road Central",
        "Hong Kong",
      ];

      // Generate and upload PDF after DB update
      const pdfBlob = await PDFInvoiceGenerator.generatePDF({
        user_name: selectedRequest.user_name,
        user_email: selectedRequest.user_email,
        items: selectedRequest.items, // Use items
        total_amount: selectedRequest.total_amount,
        currency: selectedRequest.currency,
        currencySymbol: countries.find(c => c.currency === selectedRequest.currency)?.symbol || '¥',
        invoice_number: data.invoice_number,
        user_notes: selectedRequest.admin_notes, // Pass original user notes
        admin_comment: data.admin_comment, // Pass admin's new notes
        due_date: data.due_date,
        seller_name: distributor?.office.name || 'Gusto Brands Limited',
        seller_email: distributor?.office.email || 'irene.gustobrands@gmail.com',
        seller_address_lines: distributor?.office.lines || hkOfficeLines,
        // Pass the new address fields
        delivery_name: distributor?.delivery.name || 'Delivery Address',
        delivery_email: distributor?.delivery.email || undefined,
        delivery_address_lines: (distributor?.delivery.lines && distributor.delivery.lines.length > 0)
          ? distributor.delivery.lines
          : hkOfficeLines,
      });
      const sanitizedInvoiceNumber = data.invoice_number.replace(/\s/g, '-');
      const fileName = `invoice-${sanitizedInvoiceNumber}.pdf`;
      // Use service role key for storage operations to bypass RLS
      const serviceRoleSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { error: uploadError } = await serviceRoleSupabase.storage
        .from('invoices')
        .upload(fileName, pdfBlob, { upsert: true, contentType: 'application/pdf' });
      if (uploadError) {
        throw uploadError;
      }

      // Send invoice to user
      const emailSuccess = await emailService.sendInvoice({
        user_name: selectedRequest.user_name,
        user_email: selectedRequest.user_email,
        items: selectedRequest.items, // Use items for email
        total_amount: selectedRequest.total_amount,
        currency: selectedRequest.currency,
        currencySymbol: countries.find(c => c.currency === selectedRequest.currency)?.symbol || '¥',
        request_id: selectedRequest.id,
        status: 'completed',
        invoice_number: data.invoice_number,
        user_notes: selectedRequest.admin_notes,
        admin_comment: data.admin_comment,
        due_date: data.due_date.toISOString(),
      });

      if (emailSuccess) {
        toast({
          title: "Invoice Generated & Sent",
          description: "Invoice has been generated and sent to the customer successfully.",
        });
      } else {
        toast({
          title: "Invoice Generated",
          description: "Invoice was generated but failed to send email. Please check the console for details.",
          variant: "destructive",
        });
      }

      setSelectedRequest(null);
      reset();

    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };



  const getStatusBadge = (status: InventoryRequest['status']) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      completed: "default",
    } as const;

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      completed: FileText,
    };

    const Icon = icons[status];
    
    return (
      <Badge variant={variants[status]}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusCounts = () => {
    return requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Manage inventory requests and approvals</p>
        </div>
        <Button onClick={fetchRequests} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.pending || 0}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.approved || 0}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.rejected || 0}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{statusCounts.completed || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No inventory requests found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4" />
                          <span className="font-semibold">{request.user_name}</span>
                          <span className="text-muted-foreground">({request.user_email})</span>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          {(request.items || []).map((item, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium text-blue-600"></span> {item.product_name} x {item.quantity}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Currency: {countries.find(c => c.currency === request.currency)?.symbol || ''} {request.currency}</span>
                          <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                          {request.invoice_number && (
                            <span>Invoice: #{request.invoice_number}</span>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 mt-2 text-sm">
                          {request.user_notes && (
                            <div className="p-2 bg-muted rounded flex-1">
                              <strong>User Notes:</strong> {request.user_notes}
                            </div>
                          )}
                          {request.buyer_address_lines && request.buyer_address_lines.length > 0 && (
                            <div className="p-2 bg-muted rounded flex-1">
                              <strong>Buyer Address:</strong>
                              {request.buyer_address_lines.map((line, idx) => (
                                <p key={idx}>{line}</p>
                              ))}
                            </div>
                          )}
                          {request.delivery_name && (
                            <div className="p-2 bg-muted rounded flex-1">
                              <strong>Delivery Contact:</strong> {request.delivery_name}
                            </div>
                          )}
                          {request.delivery_address_lines && request.delivery_address_lines.length > 0 && (
                            <div className="p-2 bg-muted rounded flex-1">
                              <strong>Delivery Address:</strong>
                              {request.delivery_address_lines.map((line, idx) => (
                                <p key={idx}>{line}</p>
                              ))}
                            </div>
                          )}
                          {request.admin_comment && (
                            <div className="p-2 bg-muted rounded flex-1">
                              <strong>Admin Comment:</strong> {request.admin_comment}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(request.id, 'approved')}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(request.id, 'rejected')}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {request.status === 'approved' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Generate Invoice
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Generate Invoice</DialogTitle>
                                {selectedRequest && (
                                  <p className="text-sm text-muted-foreground">
                                    Generating invoice for: {selectedRequest.user_name} ({selectedRequest.user_email})
                                  </p>
                                )}
                              </DialogHeader>
                              <form onSubmit={handleSubmit(handleInvoiceSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="invoice_number">Invoice Number *</Label>
                                  <Input
                                    id="invoice_number"
                                    {...register("invoice_number")}
                                    placeholder="Enter invoice number"
                                  />
                                  {errors.invoice_number && (
                                    <Alert variant="destructive">
                                      <AlertDescription>{errors.invoice_number.message}</AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="admin_comment">Admin Notes (Optional)</Label>
                                  <Textarea
                                    id="admin_comment"
                                    {...register("admin_comment")}
                                    placeholder="Any additional notes..."
                                    rows={3}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="due_date">Due Date</Label>
                                  <div className="mb-4">
                                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                      <PopoverTrigger asChild>
                                        <button
                                          type="button"
                                          className="w-full bg-white border rounded-lg shadow px-4 py-2 text-left font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                          {dueDate ? dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Pick a date'}
                                        </button>
                                      </PopoverTrigger>
                                      <PopoverContent className="p-0 w-auto bg-white rounded-lg shadow border">
                                        <Calendar
                                          mode="single"
                                          selected={dueDate}
                                          onSelect={date => {
                                            setValue('due_date', date || new Date());
                                            setPopoverOpen(false);
                                          }}
                                          className="border-none"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    {errors.due_date && <span className="text-red-500 text-xs">{errors.due_date.message}</span>}
                                  </div>
                                </div>
                                
                                <Button
                                  type="submit"
                                  className="w-full"
                                  disabled={isProcessing}
                                >
                                  {isProcessing ? (
                                    "Generating Invoice..."
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4 mr-2" />
                                      Generate & Send Invoice
                                    </>
                                  )}
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {request.status === 'completed' && request.invoice_number && (
                          <PDFDownloadButton
                            invoiceData={{
                              user_name: request.user_name,
                              user_email: request.user_email,
                              invoice_number: request.invoice_number,
                              items: request.items, // Use items
                              total_amount: request.total_amount,
                              user_notes: request.admin_notes,
                              admin_comment: request.admin_comment,
                              currency: request.currency,
                              currencySymbol: countries.find(c => c.currency === request.currency)?.symbol || '¥',
                              // Derive distributor details for completed/download as well
                              seller_name: getDistributorForItems(request.items || [])?.office.name || 'Gusto Brands Limited',
                              seller_email: getDistributorForItems(request.items || [])?.office.email || 'irene.gustobrands@gmail.com',
                              seller_address_lines: getDistributorForItems(request.items || [])?.office.lines || [
                                "Room B, LG2/F Kai Wong Commercial Building",
                                "222 Queen's Road Central",
                                "Hong Kong",
                              ],
                              delivery_name: getDistributorForItems(request.items || [])?.delivery.name || 'Delivery Address',
                              delivery_email: getDistributorForItems(request.items || [])?.delivery.email || undefined,
                              delivery_address_lines: (getDistributorForItems(request.items || [])?.delivery.lines && getDistributorForItems(request.items || [])!.delivery.lines.length > 0)
                                ? getDistributorForItems(request.items || [])!.delivery.lines
                                : [
                                  "Room B, LG2/F Kai Wong Commercial Building",
                                  "222 Queen's Road Central",
                                  "Hong Kong",
                                ],
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard; 