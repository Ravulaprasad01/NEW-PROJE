import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { PDFInvoiceGenerator } from '@/lib/pdf-generator';
import { supabase } from '@/lib/supabase';

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
      const fileName = `invoice-${invoiceData.invoice_number}.pdf`;
      // Fetch the PDF from Supabase Storage
      const { data, error } = await supabase.storage
        .from('invoices')
        .download(fileName);
      if (error || !data) {
        console.error('Error fetching PDF from storage:', error);
        alert('PDF not found in storage. Please generate the invoice first.');
        return;
      }
      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      alert('Failed to download PDF. Please check the console for details.');
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