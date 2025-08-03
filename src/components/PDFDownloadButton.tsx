import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { PDFInvoiceGenerator } from '@/lib/pdf-generator';

interface PDFDownloadButtonProps {
  invoiceData: {
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
  };
  className?: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ invoiceData, className }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const pdfBlob = await PDFInvoiceGenerator.generatePDF(invoiceData);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceData.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      variant="outline"
      size="sm"
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  );
};

export default PDFDownloadButton; 