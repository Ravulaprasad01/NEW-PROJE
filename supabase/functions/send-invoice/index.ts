import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvoiceData {
  user_name: string
  user_email: string
  invoice_number: string
  items: Array<{
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
  total_amount: number
  admin_notes?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { invoiceData } = await req.json()

    // Create invoice HTML
    const invoiceHtml = `
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
    `

    // Check if SMTP credentials are configured
    const smtpHost = Deno.env.get("SMTP_HOST")
    const smtpPort = Deno.env.get("SMTP_PORT")
    const smtpUsername = Deno.env.get("SMTP_USERNAME")
    const smtpPassword = Deno.env.get("SMTP_PASSWORD")
    const fromEmail = Deno.env.get("FROM_EMAIL")

    console.log('🔍 SMTP Configuration Check:')
    console.log('SMTP_HOST:', smtpHost ? '✅ Set' : '❌ Missing')
    console.log('SMTP_PORT:', smtpPort ? '✅ Set' : '❌ Missing')
    console.log('SMTP_USERNAME:', smtpUsername ? '✅ Set' : '❌ Missing')
    console.log('SMTP_PASSWORD:', smtpPassword ? '✅ Set' : '❌ Missing')
    console.log('FROM_EMAIL:', fromEmail ? '✅ Set' : '❌ Missing')

    if (!smtpHost || !smtpPort || !smtpUsername || !smtpPassword || !fromEmail || 
        smtpHost.trim() === '' || smtpPort.trim() === '' || smtpUsername.trim() === '' || 
        smtpPassword.trim() === '' || fromEmail.trim() === '') {
      console.log('⚠️ SMTP credentials not configured or empty. Logging invoice data instead:')
      console.log('📧 Invoice Data:', JSON.stringify(invoiceData, null, 2))
      console.log('📄 Invoice HTML:', invoiceHtml)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "SMTP credentials not configured. Please set up SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, and FROM_EMAIL environment variables in your Supabase dashboard.",
          invoiceData: invoiceData,
          invoiceHtml: invoiceHtml
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      )
    }

    // Send email using SMTP
    const client = new SmtpClient()
    
    try {
      console.log('🔗 Connecting to SMTP server...')
      console.log('Host:', smtpHost)
      console.log('Port:', smtpPort)
      console.log('Username:', smtpUsername)
      console.log('From Email:', fromEmail)
      
      // Use a simpler connection approach for better Gmail compatibility
      await client.connectTLS({
        hostname: smtpHost,
        port: parseInt(smtpPort),
        username: smtpUsername,
        password: smtpPassword,
      })

      console.log('✅ SMTP connection established successfully')

      await client.send({
        from: fromEmail,
        to: invoiceData.user_email,
        subject: `Invoice #${invoiceData.invoice_number} - Gusto Brands`,
        content: invoiceHtml,
        html: invoiceHtml,
      })

      await client.close()
      console.log('✅ Invoice email sent successfully to:', invoiceData.user_email)

      return new Response(
        JSON.stringify({ success: true, message: "Invoice email sent successfully" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      )

    } catch (smtpError) {
      console.error('❌ SMTP Error Details:', {
        message: smtpError.message,
        name: smtpError.name,
        stack: smtpError.stack
      })
      
      try {
        await client.close()
      } catch (closeError) {
        console.error('❌ Error closing SMTP connection:', closeError)
      }
      
      // Return a more helpful error message
      const errorMessage = smtpError.message.includes('bufio') 
        ? 'Gmail SMTP connection issue. This might be due to Gmail security settings or app password configuration.'
        : smtpError.message
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `SMTP Error: ${errorMessage}`,
          details: {
            host: smtpHost,
            port: smtpPort,
            username: smtpUsername,
            fromEmail: fromEmail,
            toEmail: invoiceData.user_email,
            suggestion: 'Try checking your Gmail App Password settings or use a different email provider'
          },
          invoiceData: invoiceData,
          invoiceHtml: invoiceHtml
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500 
        }
      )
    }

  } catch (error) {
    console.error('❌ General Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    )
  }
}) 