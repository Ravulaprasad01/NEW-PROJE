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

const invoiceSchema = z.object({
  invoice_number: z.string().min(1, "Invoice number is required"),
  admin_notes: z.string().optional(),
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
      due_date: (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d; })(),
    },
  });
  const dueDate = watch('due_date');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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
      const { error } = await supabase
        .from('inventory_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status, updated_at: new Date().toISOString() } : req
        )
      );

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
          admin_notes: request.admin_notes,
        });
        
        if (!emailSuccess) {
          console.warn('⚠️ Status update email failed to send');
        }
      }

    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status.",
        variant: "destructive",
      });
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
      const { error } = await supabase
        .from('inventory_requests')
        .update({ 
          status: 'completed',
          invoice_number: data.invoice_number,
          admin_notes: data.admin_notes,
          due_date: data.due_date.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Update local state
      setRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { 
                ...req, 
                status: 'completed',
                invoice_number: data.invoice_number,
                admin_notes: data.admin_notes,
                due_date: data.due_date.toISOString(),
                updated_at: new Date().toISOString()
              } 
            : req
        )
      );

      // Generate and upload PDF after DB update
      const pdfBlob = await PDFInvoiceGenerator.generatePDF({
        user_name: selectedRequest.user_name,
        user_email: selectedRequest.user_email,
        items: selectedRequest.items,
        total_amount: selectedRequest.total_amount,
        invoice_number: data.invoice_number,
        admin_notes: data.admin_notes,
        due_date: data.due_date,
      });
      const fileName = `invoice-${data.invoice_number}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(fileName, pdfBlob, { upsert: true, contentType: 'application/pdf' });
      if (uploadError) {
        throw uploadError;
      }

      // Send invoice to user
      const emailSuccess = await emailService.sendInvoice({
        user_name: selectedRequest.user_name,
        user_email: selectedRequest.user_email,
        items: selectedRequest.items,
        total_amount: selectedRequest.total_amount,
        request_id: selectedRequest.id,
        status: 'completed',
        invoice_number: data.invoice_number,
        admin_notes: data.admin_notes,
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
                          {request.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.product_name} x {item.quantity} = ¥{item.total_price.toLocaleString()}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Total: ¥{request.total_amount.toLocaleString()}</span>
                          <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                          {request.invoice_number && (
                            <span>Invoice: #{request.invoice_number}</span>
                          )}
                        </div>

                        {request.admin_notes && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Notes:</strong> {request.admin_notes}
                          </div>
                        )}
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
                                  <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                                  <Textarea
                                    id="admin_notes"
                                    {...register("admin_notes")}
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
                              items: request.items,
                              total_amount: request.total_amount,
                              admin_notes: request.admin_notes,
                              due_date: request.due_date,
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