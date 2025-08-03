import jsPDF from 'jspdf';

export interface InvoiceData {
  user_name: string;
  user_email: string;
  invoice_number: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  admin_notes?: string;
}

export class PDFInvoiceGenerator {
  static async generatePDF(invoiceData: InvoiceData): Promise<Blob> {
    try {
      // Create PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      let yPosition = margin;
      
      // Set font styles
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 64, 175); // Dark blue
      
      // Header - Company name (left)
      pdf.text('Gusto Brands Limited', margin, yPosition);
      
      // INVOICE text (right)
      const invoiceText = 'INVOICE';
      const invoiceTextWidth = pdf.getTextWidth(invoiceText);
      pdf.text(invoiceText, pageWidth - margin - invoiceTextWidth, yPosition);
      
      yPosition += 8;
      
      // Invoice number (right)
      pdf.setFontSize(14);
      pdf.text(`SI-${invoiceData.invoice_number}`, pageWidth - margin - 60, yPosition);
      
      yPosition += 8;
      
      // Blue bar under header
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 3, 'F');
      yPosition += 8;
      
      // Company address (left)
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Room B, LG2/F Kai Wong Commercial Building', margin, yPosition);
      yPosition += 5;
      pdf.text('222 Queen\'s Road Central', margin, yPosition);
      yPosition += 5;
      pdf.text('Hong Kong', margin, yPosition);
      
      yPosition += 10;
      
      // Invoice details in two columns
      const leftColX = margin;
      const rightColX = pageWidth / 2;
      
      // Sales Order
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139); // Gray
      pdf.text('Sales Order #', leftColX, yPosition);
      yPosition += 5;
      pdf.setTextColor(30, 41, 59);
      pdf.text(`S${Math.floor(Math.random() * 1000000)}`, leftColX, yPosition);
      
      // Invoice Date
      yPosition -= 5;
      pdf.setTextColor(100, 116, 139);
      pdf.text('INVOICE DATE', rightColX, yPosition);
      yPosition += 5;
      pdf.setTextColor(30, 41, 59);
      pdf.text(new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), rightColX, yPosition);
      
      // Due Date
      yPosition += 8;
      pdf.setTextColor(100, 116, 139);
      pdf.text('DUE DATE', rightColX, yPosition);
      yPosition += 5;
      pdf.setTextColor(30, 41, 59);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      pdf.text(dueDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), rightColX, yPosition);
      
      yPosition += 15;
      
      // Buyer and Delivery section header
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      yPosition += 6;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Buyer\'s Name', margin + 5, yPosition);
      pdf.text('Delivery Name & Address', pageWidth / 2, yPosition);
      
      yPosition += 10;
      
      // Buyer details (left)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      pdf.text(invoiceData.user_name, margin, yPosition);
      yPosition += 5;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceData.user_email, margin, yPosition);
      yPosition += 5;
      pdf.text('City, Country', margin, yPosition);
      
      // Delivery details (right) - same as buyer for now
      yPosition -= 10;
      pdf.setFont('helvetica', 'bold');
      pdf.text(invoiceData.user_name, pageWidth / 2, yPosition);
      yPosition += 5;
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceData.user_email, pageWidth / 2, yPosition);
      yPosition += 5;
      pdf.text('City, Country', pageWidth / 2, yPosition);
      
      yPosition += 15;
      
      // Items table header
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      yPosition += 6;
      
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      
      // Table headers - match Excel format exactly
      const descColX = margin + 5;
      const qtyColX = margin + 120;
      const priceColX = margin + 140;
      const totalColX = margin + 170;
      
      pdf.text('Item Description', descColX, yPosition);
      pdf.text('Qty', qtyColX, yPosition);
      pdf.text('Unit Price', priceColX, yPosition);
      pdf.text('Total', totalColX, yPosition);
      
      yPosition += 10;
      
      // Items with alternating row colors
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(30, 41, 59);
      
      invoiceData.items.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252); // Light gray
          pdf.rect(margin, yPosition - 5, contentWidth, 8, 'F');
        }
        
        // Product description
        pdf.text(item.product_name, descColX, yPosition);
        
        // Quantity
        pdf.text(item.quantity.toString(), qtyColX, yPosition);
        
        // Unit price
        pdf.text(`¥${item.unit_price.toLocaleString()}`, priceColX, yPosition);
        
        // Total
        pdf.text(`¥${item.total_price.toLocaleString()}`, totalColX, yPosition);
        
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // Totals section
      const totalLabelX = pageWidth - margin - 80;
      const totalValueX = pageWidth - margin - 30;
      
      // Subtotal
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(30, 41, 59);
      pdf.text('SUBTOTAL', totalLabelX, yPosition);
      pdf.text(`¥${invoiceData.total_amount.toLocaleString()}`, totalValueX, yPosition);
      
      yPosition += 8;
      
      // Total
      pdf.text('TOTAL', totalLabelX, yPosition);
      pdf.text(`¥${invoiceData.total_amount.toLocaleString()}`, totalValueX, yPosition);
      
      // Light blue background for totals
      pdf.setFillColor(240, 248, 255);
      pdf.rect(totalLabelX - 5, yPosition - 15, 85, 20, 'F');
      
      // Redraw totals on background
      yPosition -= 8;
      pdf.setTextColor(30, 41, 59);
      pdf.text('SUBTOTAL', totalLabelX, yPosition);
      pdf.text(`¥${invoiceData.total_amount.toLocaleString()}`, totalValueX, yPosition);
      
      yPosition += 8;
      pdf.text('TOTAL', totalLabelX, yPosition);
      pdf.text(`¥${invoiceData.total_amount.toLocaleString()}`, totalValueX, yPosition);
      
      // Footer
      yPosition = 30;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
      
      // Convert PDF to Blob
      const pdfBlob = pdf.output('blob');
      return pdfBlob;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }
} 