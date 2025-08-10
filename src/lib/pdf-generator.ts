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
      // Heading: Thank you
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.setTextColor(30, 64, 175);
      pdf.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
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

      yPosition += 8;

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

      // Blue bar under header
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 3, 'F');
      yPosition += 8;

      // Company address (left) and Buyer/Delivery info (right) in one justified row
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);

      // "FROM - TO -" row: Company address (FROM) on left, Buyer info (TO) on right, in the same row

      // Define FROM and TO labels
      const fromLabel = 'FROM';
      const toLabel = 'TO';

      // Company address lines
      const leftBlockLines = [
        'Room B, LG2/F Kai Wong Commercial Building',
        "222 Queen's Road Central",
        'Hong Kong'
      ];

      // Buyer info lines
      const rightBlockLines = [
        { text: invoiceData.user_name, font: ['helvetica', 'bold'], color: [30, 41, 59] },
        { text: invoiceData.user_email, font: ['helvetica', 'normal'], color: [30, 41, 59] }
      ];

      // Calculate vertical space needed (max of left/right block lines)
      const blockLineCount = Math.max(leftBlockLines.length, rightBlockLines.length);

      // X positions
      const leftBlockX = margin;
      const rightBlockX = pageWidth - margin;
      const midX = pageWidth / 2;

      // Draw FROM and TO labels in blue, bold, on the same row
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 64, 175);
      pdf.text(fromLabel, leftBlockX, yPosition, { align: 'left' });
      pdf.text(toLabel, rightBlockX, yPosition, { align: 'right' });

      yPosition += 5;

      // Draw left (FROM) and right (TO) blocks line by line, in the same row
      for (let i = 0; i < blockLineCount; i++) {
        // Left block (company address)
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(30, 41, 59);
        if (i < leftBlockLines.length) {
          pdf.text(leftBlockLines[i], leftBlockX, yPosition, { align: 'left' });
        }

        // Right block (buyer info)
        if (i < rightBlockLines.length) {
          const line = rightBlockLines[i];
          pdf.setFont(line.font[0], line.font[1]);
          pdf.setFontSize(10);
          // Fix for TS: color is [number, number, number]
          pdf.setTextColor(
            Array.isArray(line.color) && line.color.length === 3
              ? line.color[0] : 0,
            Array.isArray(line.color) && line.color.length === 3
              ? line.color[1] : 0,
            Array.isArray(line.color) && line.color.length === 3
              ? line.color[2] : 0
          );
          pdf.text(line.text, rightBlockX, yPosition, { align: 'right' });
        }

        yPosition += 5;
      }

      // Add a little extra space after the block
      yPosition += 7;

      // Move yPosition down for next section (max of left/right block height)
      yPosition += Math.max(10, rightBlockLines.length * 5) + 7;

      // Items table with borders
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 8, 'F');

      // Adjusted column widths for better fit
      // Description column is now smaller to allow "Total" heading to fit
      const descColWidth = 75;
      const qtyColWidth = 20;
      const priceColWidth = 35;
      const totalColWidth = 35;

      const descColX = margin + 5;
      const qtyColX = descColX + descColWidth;
      const priceColX = qtyColX + qtyColWidth;
      const totalColX = priceColX + priceColWidth;

      yPosition += 6;
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
        pdf.text(item.product_name, descColX, yPosition + 3, { maxWidth: descColWidth - 2 });
        pdf.text(item.quantity.toString(), qtyColX, yPosition + 3, { align: 'left' });
        pdf.text(`¥${item.unit_price.toLocaleString()}`, priceColX, yPosition + 3, { align: 'left' });
        pdf.text(`¥${item.total_price.toLocaleString()}`, totalColX, yPosition + 3, { align: 'left' });
        yPosition += 8;
      });
      // Table bottom border
      // pdf.line(margin, yPosition, margin + contentWidth, yPosition);
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