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
  due_date?: string | Date;
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
      
      // Thank you heading at the top
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(30, 64, 175);
      pdf.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Company name and invoice header
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 64, 175);
      pdf.text('Gusto Brands Limited', margin, yPosition);
      const invoiceText = 'INVOICE';
      const invoiceTextWidth = pdf.getTextWidth(invoiceText);
      pdf.text(invoiceText, pageWidth - margin - invoiceTextWidth, yPosition);
      yPosition += 8;

      // Invoice details header (single row)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('INVOICE DATE', margin, yPosition);
      pdf.text('DUE DATE', pageWidth / 2, yPosition);
      pdf.setTextColor(30, 41, 59);
      pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), margin, yPosition + 6);
      let dueDate: Date;
      if (invoiceData.due_date) {
        dueDate = typeof invoiceData.due_date === 'string' ? new Date(invoiceData.due_date) : invoiceData.due_date;
      } else {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
      }
      pdf.text(dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, yPosition + 6);
      yPosition += 14;

      // Invoice number (right, blue)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(30, 64, 175);
      pdf.text(`INVOICE #${invoiceData.invoice_number}`, pageWidth - margin - 60, yPosition - 8);

      // Blue bar under header
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 3, 'F');
      yPosition += 8;

      // Company address
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      pdf.text('Room B, LG2/F Kai Wong Commercial Building', margin, yPosition);
      yPosition += 5;
      pdf.text('222 Queen\'s Road Central', margin, yPosition);
      yPosition += 5;
      pdf.text('Hong Kong', margin, yPosition);
      yPosition += 10;

      // Buyer/Delivery info (side by side, single row)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 64, 175);
      pdf.text("Buyer's Name", margin + 5, yPosition);
      pdf.text('Delivery Name & Address', pageWidth / 2, yPosition);
      yPosition += 7;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      pdf.text(invoiceData.user_name, margin, yPosition);
      pdf.text(invoiceData.user_name, pageWidth / 2, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      pdf.text(invoiceData.user_email, margin, yPosition);
      pdf.text(invoiceData.user_email, pageWidth / 2, yPosition);
      yPosition += 5;
      pdf.text('City, Country', margin, yPosition);
      pdf.text('City, Country', pageWidth / 2, yPosition);
      yPosition += 12;

      // Items table with borders
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');
      const descColX = margin + 5;
      const qtyColX = margin + 120;
      const priceColX = margin + 140;
      const totalColX = margin + 170;
      yPosition += 6;
      pdf.text('Item Description', descColX, yPosition);
      pdf.text('Qty', qtyColX, yPosition);
      pdf.text('Unit Price', priceColX, yPosition);
      pdf.text('Total', totalColX, yPosition);
      yPosition += 4;
      pdf.setDrawColor(30, 64, 175);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, margin + contentWidth, yPosition); // top border
      yPosition += 4;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      invoiceData.items.forEach((item, index) => {
        // Row background
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPosition - 3, contentWidth, 8, 'F');
        }
        // Borders
        pdf.line(margin, yPosition - 3, margin + contentWidth, yPosition - 3); // row top
        pdf.line(margin, yPosition + 5, margin + contentWidth, yPosition + 5); // row bottom
        pdf.line(margin, yPosition - 3, margin, yPosition + 5); // left
        pdf.line(margin + contentWidth, yPosition - 3, margin + contentWidth, yPosition + 5); // right
        // Data
        pdf.text(item.product_name, descColX, yPosition + 3);
        pdf.text(item.quantity.toString(), qtyColX, yPosition + 3);
        pdf.text(`¥${item.unit_price.toLocaleString()}`, priceColX, yPosition + 3);
        pdf.text(`¥${item.total_price.toLocaleString()}`, totalColX, yPosition + 3);
        yPosition += 8;
      });
      // Table bottom border
      pdf.line(margin, yPosition, margin + contentWidth, yPosition);
      yPosition += 10;

      // Final Total (single, bold, distinct)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(30, 64, 175);
      pdf.setFillColor(240, 248, 255);
      pdf.rect(pageWidth - margin - 70, yPosition, 70, 14, 'F');
      pdf.text('TOTAL', pageWidth - margin - 65, yPosition + 10);
      pdf.text(`¥${invoiceData.total_amount.toLocaleString()}`, pageWidth - margin - 20, yPosition + 10, { align: 'right' });
      yPosition += 20;

      // Footer (optional)
      // ...
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }
} 