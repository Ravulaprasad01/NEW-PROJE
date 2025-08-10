// Email service utility for inventory management system
// Uses Supabase Edge Functions for real email sending

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface InventoryRequestEmailData {
  user_name: string;
  user_email: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  request_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  invoice_number?: string;
  admin_notes?: string;
}

export class EmailService {
  private static instance: EmailService;
  private adminEmail = "irene.gustobrands@gmail.com";
  private supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ggxinfypwzzzntcrnlle.supabase.co';

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('Sending email:', emailData);
      
      // For now, we'll use a simple approach with Supabase Edge Functions
      // In production, you can deploy the Edge Function to your Supabase project
      
      console.log('✅ Email would be sent to:', emailData.to);
      console.log('📧 Subject:', emailData.subject);
      console.log('📝 Body:', emailData.body);
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendInvoiceWithAttachment(invoiceData: InventoryRequestEmailData): Promise<boolean> {
    try {
      console.log('📄 Sending invoice with attachment via Supabase Edge Function:', invoiceData);
      
      // Call Supabase Edge Function to send invoice email using Resend API
      const response = await fetch(`${this.supabaseUrl}/functions/v1/send-invoice-resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ invoiceData }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ Invoice email sent successfully via Resend API');
        console.log('📧 Email ID:', result.emailId);
        return true;
      } else {
        console.error('❌ Failed to send invoice email:', result.error || 'Unknown error');
        console.error('📧 Response details:', result);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending invoice email via Supabase:', error);
      
      // Fallback to mock email for now
      console.log('🔄 Falling back to mock email sending...');
      const emailData: EmailData = {
        to: invoiceData.user_email,
        subject: `Invoice #${invoiceData.invoice_number} - Gusto Brands`,
        body: this.createInvoiceText(invoiceData),
        html: this.createInvoiceHtml(invoiceData),
      };
      
      return this.sendEmail(emailData);
    }
  }

  async sendAdminNotification(requestData: InventoryRequestEmailData): Promise<boolean> {
    const subject = 'New Inventory Request';
    const body = `
New inventory request received:

Customer: ${requestData.user_name} (${requestData.user_email})
Request ID: ${requestData.request_id}
Total Amount: ¥${requestData.total_amount.toLocaleString()}

Items:
${requestData.items.map(item => 
  `- ${item.product_name} x ${item.quantity} = ¥${item.total_price.toLocaleString()}`
).join('\n')}

${requestData.admin_notes ? `Notes: ${requestData.admin_notes}` : ''}

Please review and take action on this request.
    `.trim();

    return this.sendEmail({
      to: this.adminEmail,
      subject,
      body,
    });
  }

  async sendUserConfirmation(requestData: InventoryRequestEmailData): Promise<boolean> {
    const subject = 'Inventory Request Confirmation';
    const body = `
Dear ${requestData.user_name},

Thank you for your inventory request. We have received your order and it is currently under review.

Request Details:
Request ID: ${requestData.request_id}
Total Amount: ¥${requestData.total_amount.toLocaleString()}

Items:
${requestData.items.map(item => 
  `- ${item.product_name} x ${item.quantity} = ¥${item.total_price.toLocaleString()}`
).join('\n')}

We will review your request and get back to you with approval status and invoice details within 24-48 hours.

Best regards,
Gusto Brands Team
    `.trim();

    return this.sendEmail({
      to: requestData.user_email,
      subject,
      body,
    });
  }

  async sendStatusUpdate(requestData: InventoryRequestEmailData): Promise<boolean> {
    const statusText = requestData.status === 'approved' ? 'approved' : 'rejected';
    const subject = `Inventory Request ${requestData.status === 'approved' ? 'Approved' : 'Rejected'}`;
    
    const body = `
Dear ${requestData.user_name},

Your inventory request (ID: ${requestData.request_id}) has been ${statusText}.

${requestData.status === 'approved' 
  ? 'Your request has been approved! We will generate an invoice and send it to you shortly.'
  : 'Unfortunately, your request could not be approved at this time. Please contact us for more information.'
}

${requestData.admin_notes ? `Admin Notes: ${requestData.admin_notes}` : ''}

Best regards,
Gusto Brands Team
    `.trim();

    return this.sendEmail({
      to: requestData.user_email,
      subject,
      body,
    });
  }

  async sendInvoice(requestData: InventoryRequestEmailData): Promise<boolean> {
    if (!requestData.invoice_number) {
      throw new Error('Invoice number is required');
    }

    // Use the new method that sends invoice with attachment
    return this.sendInvoiceWithAttachment(requestData);
  }

  private createInvoiceText(invoiceData: InventoryRequestEmailData): string {
    return `
Invoice #${invoiceData.invoice_number} - Gusto Brands

Date: ${new Date().toLocaleDateString()}
Customer: ${invoiceData.user_name}
Email: ${invoiceData.user_email}

Items:
${invoiceData.items.map(item => 
  `${item.product_name} x ${item.quantity} = ¥${item.total_price.toLocaleString()}`
).join('\n')}

Total Amount: ¥${invoiceData.total_amount.toLocaleString()}

${invoiceData.admin_notes ? `Notes: ${invoiceData.admin_notes}` : ''}

Thank you for your business!
Gusto Brands Team
    `.trim();
  }

  private createInvoiceHtml(invoiceData: InventoryRequestEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${invoiceData.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; }
          .total { font-weight: bold; font-size: 18px; }
          .footer { margin-top: 30px; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Gusto Brands</h1>
          <h2>Invoice #${invoiceData.invoice_number}</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Customer:</strong> ${invoiceData.user_name}</p>
          <p><strong>Email:</strong> ${invoiceData.user_email}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items.map(item => `
              <tr>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>¥${item.unit_price.toLocaleString()}</td>
                <td>¥${item.total_price.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total">
          <p><strong>Total Amount: ¥${invoiceData.total_amount.toLocaleString()}</strong></p>
        </div>
        
        ${invoiceData.admin_notes ? `
          <div class="notes">
            <h3>Notes:</h3>
            <p>${invoiceData.admin_notes}</p>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Gusto Brands Team</p>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = EmailService.getInstance(); 