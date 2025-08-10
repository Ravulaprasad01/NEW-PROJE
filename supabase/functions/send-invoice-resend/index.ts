import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@^1.17.1"

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

    // Generate PDF attachment
    const pdfBytes = await createPDFAttachment(invoiceData)
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)))

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

// Helper function to create PDF attachment using pdf-lib
async function createPDFAttachment(invoiceData: InvoiceData): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
  const { width, height } = page.getSize()
  
  // Embed the standard font
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  // Set up colors to match the Excel format
  const darkBlue = rgb(0.12, 0.25, 0.69) // #1e40af
  const gray = rgb(0.39, 0.45, 0.55) // #64748b
  const darkGray = rgb(0.12, 0.16, 0.23) // #1e293b
  const lightBlue = rgb(0.94, 0.97, 1.0) // #f0f8ff
  const lightGray = rgb(0.97, 0.98, 0.99) // #f8fafc
  const white = rgb(1, 1, 1)
  
  const margin = 20
  let yPosition = height - margin
  
  // Header - Company name (left)
  page.drawText('Gusto Brands Limited', {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: darkBlue,
  })
  
  // INVOICE text (right)
  page.drawText('INVOICE', {
    x: width - margin - 50,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: darkBlue,
  })
  
  yPosition -= 8
  
  // Invoice number (right)
  page.drawText(`SI-${invoiceData.invoice_number}`, {
    x: width - margin - 60,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: darkBlue,
  })
  
  yPosition -= 8
  
  // Blue bar under header
  page.drawRectangle({
    x: margin,
    y: yPosition,
    width: width - (2 * margin),
    height: 3,
    color: darkBlue,
  })
  
  yPosition -= 8
  
  // Company address (left)
  page.drawText('Room B, LG2/F Kai Wong Commercial Building', {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: darkGray,
  })
  
  yPosition -= 5
  
  page.drawText('222 Queen\'s Road Central', {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: darkGray,
  })
  
  yPosition -= 5
  
  page.drawText('Hong Kong', {
    x: margin,
    y: yPosition,
    size: 10,
    font: font,
    color: darkGray,
  })
  
  yPosition -= 10
  
  // --- Remove Sales Order section entirely ---
  // Invoice Date (left)
  page.drawText('INVOICE DATE', {
    x: margin,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: gray,
  })
  page.drawText(new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), {
    x: margin,
    y: yPosition - 12,
    size: 10,
    font: font,
    color: darkGray,
  })
  // Invoice Number (right, bold, blue)
  page.drawText(`INVOICE #${invoiceData.invoice_number}`, {
    x: width - margin - 60,
    y: yPosition,
    size: 12,
    font: boldFont,
    color: darkBlue,
  })
  yPosition -= 22;
  // Due Date (right)
  page.drawText('DUE DATE', {
    x: width - margin - 60,
    y: yPosition,
    size: 10,
    font: boldFont,
    color: gray,
  })
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  page.drawText(dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), {
    x: width - margin - 60,
    y: yPosition - 12,
    size: 10,
    font: font,
    color: darkGray,
  })
  yPosition -= 22;
  // --- End Invoice Details ---

  // --- Table header improvements ---
  // Items table header
  page.drawRectangle({
    x: margin,
    y: yPosition,
    width: width - (2 * margin),
    height: 12,
    color: darkBlue,
  });
  yPosition -= 9;
  // Table headers
  page.drawText('Item Description', {
    x: margin + 5,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: white,
  });
  page.drawText('Qty', {
    x: margin + 120,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: white,
  });
  page.drawText('Unit Price', {
    x: margin + 140,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: white,
  });
  page.drawText('Total', {
    x: margin + 170,
    y: yPosition,
    size: 11,
    font: boldFont,
    color: white,
  });
  yPosition -= 12;
  // --- Totals section improvements ---
  page.drawRectangle({
    x: totalLabelX - 10,
    y: yPosition - 25,
    width: 110,
    height: 40,
    color: lightBlue,
  });
  page.drawText('SUBTOTAL', {
    x: totalLabelX,
    y: yPosition,
    size: 13,
    font: boldFont,
    color: darkBlue,
  });
  page.drawText(`¥${invoiceData.total_amount.toLocaleString()}`, {
    x: totalValueX,
    y: yPosition,
    size: 13,
    font: boldFont,
    color: darkBlue,
  });
  yPosition -= 18;
  page.drawText('TOTAL', {
    x: totalLabelX,
    y: yPosition,
    size: 15,
    font: boldFont,
    color: darkBlue,
  });
  page.drawText(`¥${invoiceData.total_amount.toLocaleString()}`, {
    x: totalValueX,
    y: yPosition,
    size: 15,
    font: boldFont,
    color: darkBlue,
  });
  // --- Footer ---
  yPosition = 30;
  page.drawText('Thank you for your business!', {
    x: width / 2 - 80,
    y: yPosition,
    size: 11,
    font: font,
    color: gray,
  });
  
  // Save the PDF
  return await pdfDoc.save()
}
