import jsPDF from 'jspdf';

export interface InvoiceData {
  user_name: string;
  user_email: string;
  invoice_number: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  total_amount: number;
  admin_notes?: string;
  due_date?: string | Date;
  buyer_address_lines?: string[];
  delivery_name?: string;
  delivery_address_lines?: string[];
  seller_name: string;
  seller_email: string;
  seller_address_lines: string[];
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
      
      
      yPosition += 10;

      // Company name (left) and invoice number (right, aligned)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 64, 175);

      // Company name on the left
      pdf.text('Gusto Brands Limited', margin, yPosition, { align: 'left' });

      // Invoice number on the right, properly aligned to the right margin, with smaller font size
      const invoiceText = `INVOICE #${invoiceData.invoice_number}`;
      pdf.setFontSize(12); // Use a smaller font size for the invoice number
      pdf.text(invoiceText, pageWidth - margin, yPosition, { align: 'right' });

      yPosition += 2;

      // Seller address block below company name
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      
      // Hardcoded seller address lines
      const sellerAddressLines = [
        'Room B, LG2/F Kai Wong Commercial Building',
        '222 Queen\'s Road Central',
        'Hong Kong'
      ];
      
      sellerAddressLines.forEach((line, index) => {
        pdf.text(line, margin, yPosition + 10 + (index * 5), { align: 'left' });
      });
      
      yPosition += 35; // Move down to make space for address block



      // Invoice details header (single row)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('INVOICE DATE', margin, yPosition, { align: 'left' });
      pdf.text('DUE DATE', pageWidth - margin, yPosition, { align: 'right' });

      // Actual values in smaller font, darker color
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.text(
        new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        margin,
        yPosition + 6,
        { align: 'left' }
      );
      let dueDate: Date;
      if (invoiceData.due_date) {
        dueDate = typeof invoiceData.due_date === 'string' ? new Date(invoiceData.due_date) : invoiceData.due_date;
      } else {
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
      }
      pdf.text(
        dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        pageWidth - margin,
        yPosition + 6,
        { align: 'right' }
      );
      yPosition += 14;

      // Invoice number (right, blue)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(30, 64, 175);
      // pdf.text(`INVOICE #${invoiceData.invoice_number}`, pageWidth - margin - 60, yPosition - 8);

      // Company address (left) and Buyer/Delivery info (right) in one justified row
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);

      // Buyer's Name & Delivery Name and Address table header (blue, bold, white text)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(30, 64, 175);

      // Table column widths
      const leftColWidth = (contentWidth / 2);
      const rightColWidth = (contentWidth / 2);

      // Draw header background
      pdf.rect(margin, yPosition, leftColWidth, 7, 'F');
      pdf.rect(margin + leftColWidth, yPosition, rightColWidth, 7, 'F');

      // Draw header text
      pdf.text("Buyer's Name", margin + 2, yPosition + 5, { align: 'left' });
      pdf.text('Delivery Name & Address', margin + leftColWidth + 2, yPosition + 5, { align: 'left' });

      yPosition += 8;

      // Prepare left (Buyer's Name) and right (Delivery Name & Address) blocks
      // Use bold for company name, normal for address lines

      // Buyer's Name block (left) - use name and email from form
      const buyerNameLines = [
        { text: invoiceData.user_name, font: ['helvetica', 'bold'], color: [30, 41, 59] },
        { text: invoiceData.user_email, font: ['helvetica', 'normal'], color: [30, 41, 59] }
      ];

      // Delivery Name & Address block (right) - hardcoded
      const deliveryNameLines = [
        { text: "Planet Pet KK", font: ['helvetica', 'bold'], color: [30, 41, 59] },
        { text: "1-6-40 Nishiasada", font: ['helvetica', 'normal'], color: [30, 41, 59] },
        { text: "Hamamatsu City", font: ['helvetica', 'normal'], color: [30, 41, 59] },
        { text: "Japan 43208045", font: ['helvetica', 'normal'], color: [30, 41, 59] }
      ];

      // Calculate max lines for row height
      const maxLines = Math.max(buyerNameLines.length, deliveryNameLines.length);

      // Draw each line in the left and right columns
      for (let i = 0; i < maxLines; i++) {
        // Left column (Buyer's Name)
        if (i < buyerNameLines.length) {
          const line = buyerNameLines[i];
          pdf.setFont(line.font[0], line.font[1]);
          pdf.setFontSize(10);
          // Ensure color is a tuple of three numbers
          if (Array.isArray(line.color) && line.color.length === 3) {
            pdf.setTextColor(line.color[0], line.color[1], line.color[2]);
          } else {
            pdf.setTextColor(0, 0, 0);
          }
          // Ensure text is a string
          pdf.text(String(line.text), margin + 2, yPosition + 5, { align: 'left' });
        }

        // Right column (Delivery Name & Address)
        if (i < deliveryNameLines.length) {
          const line = deliveryNameLines[i];
          pdf.setFont(line.font[0], line.font[1]);
          pdf.setFontSize(10);
          // Ensure color is a tuple of three numbers
          if (Array.isArray(line.color) && line.color.length === 3) {
            pdf.setTextColor(line.color[0], line.color[1], line.color[2]);
          } else {
            pdf.setTextColor(0, 0, 0);
          }
          // Ensure text is a string
          pdf.text(String(line.text), margin + leftColWidth + 2, yPosition + 5, { align: 'left' });
        }

        yPosition += 6;
      }

      // Add a little extra space after the block
      yPosition += 2;

      yPosition += 5;

      // Items table with borders
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');

      // Adjusted column widths for better fit, with broader code and description columns
      const codeColWidth = 35;
      const descColWidth = 65;
      const qtyColWidth = 15;
      const priceColWidth = 25;
      const totalColWidth = 25;

      const codeColX = margin + 5;
      const descColX = codeColX + codeColWidth;
      const qtyColX = descColX + descColWidth;
      const priceColX = qtyColX + qtyColWidth;
      const totalColX = priceColX + priceColWidth;

      yPosition += 6;
      pdf.text('Code', codeColX, yPosition);
      pdf.text('Item Description', descColX, yPosition);
      pdf.text('Qty', qtyColX, yPosition);
      pdf.text('Unit Price', priceColX, yPosition);
      pdf.text('Total', totalColX, yPosition);
      yPosition += 4;
      pdf.setDrawColor(30, 64, 175);
      // pdf.setLineWidth(0.3);
      // pdf.line(margin, yPosition, margin + contentWidth, yPosition); // top border
      yPosition += 4;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      invoiceData.items.forEach((item, index) => {
        // Check if we need a new page before adding this row
        if (yPosition > pageHeight - 80) { // Leave 80mm for total and footer
          pdf.addPage();
          yPosition = margin;
          
          // Re-draw table header on new page
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.setFillColor(30, 64, 175);
          pdf.rect(margin, yPosition, contentWidth, 8, 'F');
          
          yPosition += 6;
          pdf.text('Code', codeColX, yPosition);
          pdf.text('Item Description', descColX, yPosition);
          pdf.text('Qty', qtyColX, yPosition);
          pdf.text('Unit Price', priceColX, yPosition);
          pdf.text('Total', totalColX, yPosition);
          yPosition += 4;
          yPosition += 4;
          
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(30, 41, 59);
        }
        
        // Row background
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPosition - 3, contentWidth, 18, 'F');
        }
        // Borders
        pdf.line(margin, yPosition - 3, margin + contentWidth, yPosition - 3); // row top
        pdf.line(margin, yPosition + 15, margin + contentWidth, yPosition + 15); // row bottom
        pdf.line(margin, yPosition - 3, margin, yPosition + 15); // left
        pdf.line(margin + contentWidth, yPosition - 3, margin + contentWidth, yPosition + 15); // right
        // Data
        pdf.text(item.product_id, codeColX, yPosition + 9, { maxWidth: codeColWidth - 2 });
        pdf.text(item.product_name, descColX, yPosition + 9, { maxWidth: descColWidth - 2 });
        pdf.text(item.quantity.toString(), qtyColX, yPosition + 9, { align: 'left' });
        pdf.text(`¥${item.unit_price.toLocaleString()}`, priceColX, yPosition + 9, { align: 'left' });
        pdf.text(`¥${item.total_price.toLocaleString()}`, totalColX, yPosition + 9, { align: 'left' });
        yPosition += 18;
      });
      // Table bottom border
      // pdf.line(margin, yPosition, margin + contentWidth, yPosition);
      yPosition += 10;

      // Check if we need a new page for total and footer
      if (yPosition > pageHeight - 60) { // Leave 60mm for total and footer
        pdf.addPage();
        yPosition = margin;
      }
      
      // Final Total (single, bold, distinct)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(30, 64, 175);
      pdf.setFillColor(240, 248, 255);
      pdf.rect(pageWidth - margin - 70, yPosition, 70, 14, 'F');
      pdf.text('TOTAL', pageWidth - margin - 65, yPosition + 10);
      pdf.text(`¥${invoiceData.total_amount.toLocaleString()}`, pageWidth - margin - 20, yPosition + 10, { align: 'right' });
      yPosition += 20;

      // Thank you Footer at the bottom - lighter and smaller
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(100, 116, 139); // Lighter gray color
      pdf.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Always return a Blob
      const pdfBlob = pdf.output('blob');
      if (!(pdfBlob instanceof Blob)) {
        throw new Error('PDF generation failed: jsPDF did not return a Blob.');
      }
      return pdfBlob;
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }
} 