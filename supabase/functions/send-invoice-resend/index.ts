import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@^1.17.1"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

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

    // Fetch PDF from Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
    const fileName = `invoice-${invoiceData.invoice_number}.pdf`
    const { data: pdfData, error: pdfError } = await supabase.storage.from('invoices').download(fileName)
    if (pdfError || !pdfData) {
      return new Response(JSON.stringify({ success: false, error: 'PDF not found in storage.' }), { headers: corsHeaders, status: 404 })
    }
    // Convert PDF to base64
    const pdfArrayBuffer = await pdfData.arrayBuffer()
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfArrayBuffer)))

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
          <p><strong>Greetings:</strong> Greetings from Gusto Brands! Please find attached your invoice.</p>

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

    // Check if Resend API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    const fromEmail = "onboarding@resend.dev"

    if (!resendApiKey) {
      console.log('⚠️ Resend API key not configured. Logging invoice data instead:')
      console.log('📧 Invoice Data:', JSON.stringify(invoiceData, null, 2))
      console.log('📄 Invoice HTML:', invoiceHtml)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Resend API key not configured. Please set up RESEND_API_KEY environment variable in your Supabase dashboard.",
          invoiceData: invoiceData,
          invoiceHtml: invoiceHtml
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      )
    }

    // Send email using Resend API with PDF attachment
    try {
      console.log('📧 Sending email via Resend API with PDF attachment...')
      console.log('From Email:', fromEmail)
      console.log('To Email:', invoiceData.user_email)
      
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: invoiceData.user_email,
          subject: `Invoice #${invoiceData.invoice_number} - Gusto Brands`,
          html: invoiceHtml,
          attachments: [
            {
              filename: `invoice-${invoiceData.invoice_number}.pdf`,
              content: pdfBase64,
            }
          ]
        }),
      })

      const responseText = await response.text()
      console.log('📧 Resend API Response Status:', response.status)
      console.log('📧 Resend API Response:', responseText)

      if (!response.ok) {
        let errorMessage = `Resend API error: ${response.statusText}`
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = `Resend API error: ${errorData.message || response.statusText}`
        } catch (e) {
          // If response is not JSON, use the text as error message
          errorMessage = `Resend API error: ${responseText}`
        }
        throw new Error(errorMessage)
      }

      const result = JSON.parse(responseText)
      console.log('✅ Email sent successfully via Resend with PDF attachment:', result)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Invoice email sent successfully via Resend with PDF attachment",
          emailId: result.id 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      )

    } catch (apiError) {
      console.error('❌ Resend API Error:', apiError)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Email API Error: ${apiError.message}`,
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
