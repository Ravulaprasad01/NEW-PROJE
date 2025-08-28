import jsPDF from 'jspdf';

// IMPORTANT: REPLACE THIS PLACEHOLDER WITH THE ACTUAL BASE64 STRING OF A UNICODE FONT (e.g., NotoSans-Regular.ttf)
// You can convert your .ttf file to Base64 using online tools or command-line utilities.
const NOTO_SANS_REGULAR_BASE64 = 'AAEAAAAQAQAABAAAR0RFRsxnzpEAAAJYAAAGsEdQT1NtOb5RAALFxAAB2pBHU1VCvF1gtQABqMwAARz4T1MvMo4VhagAAAH4AAAAYFNUQVReYUMeAAABmAAAAF5jbWFw224/pQAAEqQAADgwZ2FzcAAAABAAAAEUAAAACGdseWb4U0pVAASgVAAE9wtoZWFkKLra/AAAAWAAAAA2aGheaQzuGxkAAAE8AAAAJGhtdHjCo7Q1AABK1AAARlxsb2NhKp+UWgAAkTAAAEZgbWF4cBG6AY4AAAEcAAAAIG5hbWVY6HfzAAAJCAAACZpwb3N0nKPP0wAA15AAANE7cHJlcGgGjIUAAAEMAAAAB7gB/4WwBI0AAAEAAf//AA8AAQAAEZcBEQAYAHsABgABAAAAAAAAAAAAAAAAAAQAAQABAAAELf7bAAALF/3M+6gK8gPoAAAAAAAAAAAAAAAAAAARlwABAAAAAgPXE4x+xV8PPPUAAwPoAAAAAN2A0+cAAAAA42PAPP3M/fkK8gQlAAAABgACAAEAAAAAAAEAAQAIAAMAAAAUAAMAAAAsAAJ3Z2h0AQAAAHdkdGgBAQABaXRhbAE/AAIAIgAWAAYAAwACAAIBQAAAAAAAAQAAAAEAAQAAATwASwAAAAMAAAACAAIBkAAAArwAAAAAAAQB3wGQAAMAAAKKAlgAAABLAooCWAAAAV4AMgFCAAACCwUCBAUEAgIE4AAC/0AAIB8IAAApABAAAEdPT0cAwAAA//8ELf7bAAAEZAGLAAABnwAAAAACGQLKAAAAIAAGAAEAAgBGAAAADgAAA6QADgAFADAAMAAwACIAGAACAAEGdQZ5AAAAAgAUAAYAAQILAAIACgAGAAECDAABAQYAAQAEAAEA/QACAI8AHwAhAAEAJAA9AAEARABdAAEAbABsAAEAfAB8AAEAggCYAAEAmgC4AAEAugFJAAEBVQFVAAEBVwH/AAECFgIWAAECHwIfAAECJQImAAMCOgI6AAECPAI/AAECQQJiAAECZQJqAAECbAJtAAMCbgJ+AAECgAR0AAEEfQR+AAEEgQSBAAEEhASEAAEEhgSHAAEEjASOAAEEkASVAAEEsASwAAMEsQUgAAEFIgX6AAEGFAYYAAEGHAYcAAEGKgYqAAMGLQYtAAEGMAZHAAEGSQZRAAEGVwZYAAEGWQZcAAMGXQZfAAEGZAZzAAEGdQZ5AAIGegguAAEIMgisAAEJGwkbAAEJlQmWAAEJpAmkAAEJpgmoAAEJqgmqAAEJrgmuAAEJsAm4AAEJvQm9AAEKZQplAAEKZgp+AAMKgAsyAAMLNAtOAAMLTwtPAAELUAtxAAMLcgt5AAELfAubAAELnAudAAMLoQumAAELqAuoAAELqwzwAAEM8g5pAAEOnw6gAAEOqA6oAAMOqw6wAAMOsQ60AAEOwA7BAAEOyg7NAAEO0A8DAAEPBg8PAAEPEQ8iAAEPJA8pAAEPKw8rAAMPLA8sAAEPLQ8vAAEPMw8xAAEPMw84AAEPOQ85AAMPOg87AAEPPg9EAAEPRQ9HAAMPSA9IAAEPSQ9JAAMPSg9RAAEPUw9TAAMPVA9UAAEPVQ9VAAMPVw9aAAEPWw9bAAMPXA9iAAEPYw9jAA';

export interface InvoiceData {
  user_name: string;
  user_email: string;
  invoice_number: string;
  total_amount: number;
  currency: string;
  currencySymbol: string;
  user_notes?: string;
  admin_comment?: string;
  due_date?: string | Date;
  items?: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    currency: string;
    currencySymbol: string;
  }>;
  delivery_name?: string;
  delivery_address_lines?: string[];
  delivery_email?: string;
  seller_name: string;
  seller_email: string;
  seller_address_lines: string[];
}

export class PDFInvoiceGenerator {
  static async generatePDF(invoiceData: InvoiceData): Promise<Blob> {
    try {
      console.log('Attempting to generate PDF with invoiceData:', invoiceData);
      // Create PDF using jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Add Noto Sans font
      // pdf.addFileToVFS('NotoSans-Regular.ttf', NOTO_SANS_REGULAR_BASE64);
      // pdf.addFont('NotoSans-Regular.ttf', 'NotoSans-Condensed-Regular', 'normal');
      pdf.setFont('helvetica');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      let yPosition = margin + 10; // Add an initial gap from the top
      
      
      yPosition += 10;

      // Company name (left) and invoice number (right, aligned)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(30, 64, 175);

      // Company name on the left (seller/distributor)
      pdf.text(String(invoiceData.seller_name || 'Gusto Brands Limited'), margin, yPosition, { align: 'left' });

      // Invoice number on the right, properly aligned to the right margin, with smaller font size
      const invoiceText = `INVOICE #${invoiceData.invoice_number}`;
      pdf.setFontSize(12); // Use a smaller font size for the invoice number
      pdf.text(invoiceText, pageWidth - margin, yPosition, { align: 'right' });

      yPosition += 2;

      // Seller address block below company name
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      
      // Remove top-of-page address under the company name; addresses are shown in the From/To blocks below
      // Render Office (seller) address directly under the company name
      const topOfficeAddressLines = (invoiceData.seller_address_lines && invoiceData.seller_address_lines.length > 0)
        ? invoiceData.seller_address_lines
        : [
            "Room B, LG2/F Kai Wong Commercial Building",
            "222 Queen's Road Central",
            "Hong Kong",
          ];
      topOfficeAddressLines.forEach((line, index) => {
        pdf.text(String(line), margin, yPosition + 5 + (index * 5), { align: 'left' });
      });

      yPosition += 10 + (topOfficeAddressLines.length * 5); // spacing after office address



      // Invoice details header (single row)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text('INVOICE DATE', margin, yPosition, { align: 'left' });
      pdf.text('DUE DATE', pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 4; // Decreased gap after headers

      // Add currency information below invoice number
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      // Display currency code and symbol directly, assuming custom font support
      // const currencyDisplay = `Currency: ${invoiceData.currency} (${invoiceData.currencySymbol})`;
      // pdf.text(currencyDisplay, pageWidth - margin, yPosition + 12, { align: 'right' });

      // yPosition += 14; // Removed this increment

      // Actual values in smaller font, darker color
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(30, 41, 59);
      pdf.text(
        new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        margin,
        yPosition, // Use new yPosition for dates
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
        yPosition, // Use new yPosition for dates
        { align: 'right' }
      );
      yPosition += 10; // Vertical spacing after dates block (adjusted)

      // Invoice number (right, blue)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(30, 64, 175);
      // pdf.text(`INVOICE #${invoiceData.invoice_number}`, pageWidth - margin - 60, yPosition - 8);

      // Company address (left) and Buyer/Delivery info (right) in one justified row
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);

      // Prepare left (From) and right (To) blocks BEFORE drawing header
      // Left: Office Address block removed to avoid duplication (shown under company name)
      const fromLines: Array<{ text: string; font: [string, 'bold' | 'normal']; color: [number, number, number] }> = [];

      // Right: Delivery
      const deliveryNameLines: Array<{ text: string; font: [string, 'bold' | 'normal']; color: [number, number, number] }> = [];
      if (invoiceData.delivery_name) {
        deliveryNameLines.push({ text: invoiceData.delivery_name, font: ['helvetica', 'bold'], color: [30, 41, 59] });
      }
      if (invoiceData.delivery_email) {
        deliveryNameLines.push({ text: String(invoiceData.delivery_email), font: ['helvetica', 'normal'], color: [30, 41, 59] });
      }
      if (invoiceData.delivery_address_lines && invoiceData.delivery_address_lines.length > 0) {
        invoiceData.delivery_address_lines.forEach(line => {
          deliveryNameLines.push({ text: line, font: ['helvetica', 'normal'], color: [30, 41, 59] });
        });
      }

      // From/To header (blue, bold, white text)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(30, 64, 175);

      // Table column widths
      const leftColWidth = (contentWidth / 2);
      const rightColWidth = (contentWidth / 2);

      // Draw header background and labels
      if (fromLines.length === 0) {
        // Single full-width header for Delivery only
        pdf.rect(margin, yPosition, contentWidth, 6, 'F');
        pdf.text('To (Delivery Address)', margin + 2, yPosition + 4, { align: 'left' });
      } else {
        pdf.rect(margin, yPosition, leftColWidth, 6, 'F');
        pdf.rect(margin + leftColWidth, yPosition, rightColWidth, 6, 'F');
        pdf.text('From (Office Address)', margin + 2, yPosition + 4, { align: 'left' });
        pdf.text('To (Delivery Address)', margin + leftColWidth + 2, yPosition + 4, { align: 'left' });
      }

      yPosition += 7;

      // Calculate max lines for row height
      const maxLines = Math.max(fromLines.length, deliveryNameLines.length);

      // Draw each line in the left and right columns
      for (let i = 0; i < maxLines; i++) {
        // Left column (From / Office) - render only if present
        if (fromLines.length > 0 && i < fromLines.length) {
          const line = fromLines[i];
          pdf.setFont(line.font[0] === 'helvetica' ? 'helvetica' : line.font[0], line.font[1]);
          pdf.setFontSize(10);
          // Ensure color is a tuple of three numbers
          if (Array.isArray(line.color) && line.color.length === 3) {
            pdf.setTextColor(line.color[0], line.color[1], line.color[2]);
          } else {
            pdf.setTextColor(0, 0, 0);
          }
          // Ensure text is a string
          pdf.text(String(line.text), margin + 2, yPosition + 5 + (i * 6), { align: 'left' });
        }

        // Right column (Delivery Name & Address)
        if (i < deliveryNameLines.length) {
          const line = deliveryNameLines[i];
          pdf.setFont(line.font[0] === 'helvetica' ? 'helvetica' : line.font[0], line.font[1]);
          pdf.setFontSize(10);
          // Ensure color is a tuple of three numbers
          if (Array.isArray(line.color) && line.color.length === 3) {
            pdf.setTextColor(line.color[0], line.color[1], line.color[2]);
          } else {
            pdf.setTextColor(0, 0, 0);
          }
          // Ensure text is a string
          const deliveryX = fromLines.length === 0 ? margin + 2 : margin + leftColWidth + 2;
          pdf.text(String(line.text), deliveryX, yPosition + 5 + (i * 6), { align: 'left' });
        }

        // yPosition += 6; // This increment is no longer needed per line in the loop
      }

      // Add a little extra space after the block
      yPosition += (maxLines * 6) + 2; // Adjust yPosition based on max lines and a small padding

      yPosition += 5;

      // Items table with borders
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(30, 64, 175);
      pdf.rect(margin, yPosition, contentWidth, 7, 'F');

      // Five-column layout: Code | Description | Qty | Unit Price | Total
      const gutter = 4; // tighter spacing
      const codeColWidth = 30;
      const qtyColWidth = 16;
      const priceColWidth = 26;
      const totalColWidth = 26;
      const descColWidth = contentWidth - (codeColWidth + qtyColWidth + priceColWidth + totalColWidth + (gutter * 4) + 5);

      const codeColX = margin + 5;
      const descColX = codeColX + codeColWidth + gutter;
      const qtyColX = descColX + descColWidth + gutter;
      const priceColX = qtyColX + qtyColWidth + gutter;
      const totalColX = priceColX + priceColWidth + gutter;


      yPosition += 6;
      pdf.text('Code', codeColX, yPosition, { align: 'left' });
      pdf.text('Item Description', descColX, yPosition, { align: 'left' });
      pdf.text('Qty', qtyColX + qtyColWidth - 2, yPosition, { align: 'right' });
      pdf.text('Unit Price', priceColX + priceColWidth - 2, yPosition, { align: 'right' });
      pdf.text('Total', totalColX + totalColWidth - 2, yPosition, { align: 'right' });
      yPosition += 4;
      pdf.setDrawColor(30, 64, 175);
      // pdf.setLineWidth(0.3);
      // pdf.line(margin, yPosition, margin + contentWidth, yPosition); // top border
      yPosition += 4;
      pdf.setFont('helvetica', 'normal');
      // Keep Code and Item Description at the same visual size; both can shrink-to-fit
      const codeBaseFontSize = 11.0;
      const descBaseFontSize = 12.5; // make item description more prominent
      const numBaseFontSize = 11.0;  // keep numeric columns consistent
      pdf.setFontSize(numBaseFontSize);
      pdf.setTextColor(30, 41, 59);
      const toNumber = (val: any): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const cleaned = val.replace(/[^0-9.\-]/g, '');
          const n = parseFloat(cleaned);
          return isNaN(n) ? 0 : n;
        }
        return 0;
      };

      let runningTotal = 0;
      invoiceData.items?.forEach((item, index) => {
        // Single-line description with per-row dynamic font shrinking to fit
        const description = String(item.product_name ?? '');
        const baseRowHeight = 14; // taller row to accommodate larger description font
        const computedRowHeight = baseRowHeight;

        // Check if we need a new page before adding this row (consider row height)
        if (yPosition + computedRowHeight > pageHeight - 80) { // Leave space for totals/footer
          pdf.addPage();
          yPosition = margin;

          // Re-draw table header on new page
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          pdf.setFillColor(30, 64, 175);
          pdf.rect(margin, yPosition, contentWidth, 7, 'F');

          yPosition += 5;
          pdf.text('Code', codeColX, yPosition, { align: 'left' });
          pdf.text('Item Description', descColX, yPosition, { align: 'left' });
          pdf.text('Qty', qtyColX + qtyColWidth - 2, yPosition, { align: 'right' });
          pdf.text('Unit Price', priceColX + priceColWidth - 2, yPosition, { align: 'right' });
          pdf.text('Total', totalColX + totalColWidth - 2, yPosition, { align: 'right' });
          yPosition += 8; // spacing below header for new page

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(bodyFontSize);
          pdf.setTextColor(30, 41, 59);
        }

        // Row background (zebra)
        if (index % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(margin, yPosition, contentWidth, computedRowHeight, 'F');
        }
        // Borders (tight to box)
        pdf.line(margin, yPosition, margin + contentWidth, yPosition); // row top
        pdf.line(margin, yPosition + computedRowHeight, margin + contentWidth, yPosition + computedRowHeight); // row bottom
        pdf.line(margin, yPosition, margin, yPosition + computedRowHeight); // left
        pdf.line(margin + contentWidth, yPosition, margin + contentWidth, yPosition + computedRowHeight); // right

        // Data (single-line, no wrapping)
        // Code: smaller base, shrink-to-fit in its column
        const codeText = String(item.product_id ?? '');
        let codeFontSize = codeBaseFontSize;
        const codeMaxWidth = codeColWidth - 2;
        pdf.setFontSize(codeFontSize);
        while (pdf.getTextWidth(codeText) > codeMaxWidth && codeFontSize > 6) {
          codeFontSize -= 0.3;
          pdf.setFontSize(codeFontSize);
        }
        pdf.text(codeText, codeColX, yPosition + 8, { align: 'left' });
        // Description: larger base, shrink-to-fit for column
        let descFontSize = descBaseFontSize;
        const maxWidth = descColWidth - 2;
        pdf.setFontSize(descFontSize);
        while (pdf.getTextWidth(description) > maxWidth && descFontSize > 6) {
          descFontSize -= 0.3;
          pdf.setFontSize(descFontSize);
        }
        pdf.text(description, descColX, yPosition + 8, { align: 'left' });
        // restore font size for numeric columns
        pdf.setFontSize(numBaseFontSize);
        const verticalCenter = yPosition + 8;
        pdf.text(String(item.quantity ?? 0), qtyColX + qtyColWidth - 2, verticalCenter, { align: 'right' });
        pdf.text(`${invoiceData.currency} ${Number(item.unit_price ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, priceColX + priceColWidth - 2, verticalCenter, { align: 'right' });
        const rowTotalNumeric = (() => {
          const raw = (item as any)?.total_price;
          const qty = toNumber((item as any)?.quantity ?? 0);
          const unit = toNumber((item as any)?.unit_price ?? 0);
          const num = raw != null && raw !== '' ? toNumber(raw) : NaN;
          const fallback = qty * unit;
          return !isNaN(num) && num > 0 ? num : fallback;
        })();
        pdf.text(`${invoiceData.currency} ${rowTotalNumeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, totalColX + totalColWidth - 2, verticalCenter, { align: 'right' });
        runningTotal += isNaN(rowTotalNumeric) ? 0 : rowTotalNumeric;

        yPosition += computedRowHeight;
      });
      // Table bottom border
      // pdf.line(margin, yPosition, margin + contentWidth, yPosition);
      yPosition += 10;

      // Check if we need a new page for total and footer
      if (yPosition > pageHeight - 60) { // Leave 60mm for total and footer
        pdf.addPage();
        yPosition = margin;
      }
      
      // Compute total from line items to avoid mismatches; fallback to provided total_amount
      const computedItemsTotal = runningTotal;
      const finalTotal = computedItemsTotal > 0 ? computedItemsTotal : Number(invoiceData.total_amount || 0);

      // Final Total (single, bold, distinct)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(30, 64, 175);
      pdf.setFillColor(240, 248, 255);
      pdf.rect(pageWidth - margin - 65, yPosition, 65, 12, 'F');
      pdf.text('TOTAL', pageWidth - margin - 60, yPosition + 8);
      pdf.text(`${invoiceData.currency} ${finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, pageWidth - margin - 5, yPosition + 8, { align: 'right' }); // Align right within the blue box
      yPosition += 18; // More spacing before footer

      // Thank you Footer at the bottom - lighter and smaller
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(100, 116, 139); // Lighter gray color
      pdf.text('Thank you for your business!', pageWidth / 2, yPosition + 2, { align: 'center' });
      yPosition += 18;

      // Always return a Blob
      const pdfBlob = pdf.output('blob');
      if (!(pdfBlob instanceof Blob)) {
        throw new Error('PDF generation failed: jsPDF did not return a Blob.');
      }
      return pdfBlob;
      
    } catch (error) {
      console.error('Error during PDF generation:', error);
      throw new Error('Failed to generate PDF. Please try again.');
    }
  }
} 