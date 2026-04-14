/**
 * PDFPreview Component
 * Displays PDF pages using PDF.js
 */

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up PDF.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFPreviewProps {
  pdfBuffer?: ArrayBuffer;
  onPageChange?: (pageNumber: number) => void;
  onPageCountChange?: (count: number) => void;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({
  pdfBuffer,
  onPageChange,
  onPageCountChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(false);

  // Render PDF page
  useEffect(() => {
    if (!pdfBuffer || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        setLoading(true);
        const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
        setPageCount(pdf.numPages);
        onPageCountChange?.(pdf.numPages);

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
          canvas,
        } as any).promise;

        onPageChange?.(pageNumber);
      } catch (error) {
        console.error('Error rendering PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    renderPage();
  }, [pdfBuffer, pageNumber, scale, onPageChange, onPageCountChange]);

  const handlePreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, pageCount));
  };

  const handleZoomIn = () => {
    setScale((prev) => prev + 0.2);
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  if (!pdfBuffer) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <p className="text-gray-500">Nenhum PDF carregado</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePreviousPage}
            disabled={pageNumber === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm font-medium">
            Página {pageNumber} de {pageCount}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNextPage}
            disabled={pageNumber === pageCount}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut size={16} />
          </Button>
          <span className="text-sm font-medium w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleZoomIn}
          >
            <ZoomIn size={16} />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50">
            <p className="text-gray-600">Renderizando...</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="border border-gray-300 shadow-lg"
        />
      </div>
    </div>
  );
};
