import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X,
  Maximize2, Minimize2, RotateCw, PanelLeftClose, PanelLeft,
  Maximize, AlignHorizontalJustifyCenter, Loader2,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';

// Bundle worker locally instead of CDN
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PDFViewerProps {
  filePath: string;
  className?: string;
  initialPage?: number;
  isModal?: boolean;
  onClose?: () => void;
  title?: string;
  onLoadSuccess?: (numPages: number) => void;
}

type FitMode = 'custom' | 'fit-width' | 'fit-page';

// Loading spinner component
const LoadingSpinner = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

const PDFViewer = ({
  filePath, className, initialPage = 1, isModal = false, onClose, title,
  onLoadSuccess: onLoadSuccessProp,
}: PDFViewerProps) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(isModal);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [fitMode, setFitMode] = useState<FitMode>('custom');
  const [pageInputValue, setPageInputValue] = useState(String(initialPage));
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isMouseOverToolbar = useRef(false);
  const pageDimensions = useRef({ width: 0, height: 0, ready: false });
  const currentScaleRef = useRef(scale);

  const normalizedPath = filePath.replace(/\\/g, '/');

  useEffect(() => { currentScaleRef.current = scale; }, [scale]);

  const resetToolbarTimeout = useCallback(() => {
    if (toolbarTimeoutRef.current) clearTimeout(toolbarTimeoutRef.current);
    setShowToolbar(true);
    toolbarTimeoutRef.current = setTimeout(() => {
      if (!isMouseOverToolbar.current) setShowToolbar(false);
    }, 3000);
  }, []);

  useEffect(() => {
    resetToolbarTimeout();
    return () => { if (toolbarTimeoutRef.current) clearTimeout(toolbarTimeoutRef.current); };
  }, [resetToolbarTimeout]);

  useEffect(() => {
    const updateSize = () => {
      if (contentRef.current) {
        const { width, height } = contentRef.current.getBoundingClientRect();
        setContainerSize({ width: width - 48, height: height - 48 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);

  useEffect(() => {
    if (fitMode === 'custom' || !pageDimensions.current.ready) return;
    const { width: pageW, height: pageH } = pageDimensions.current;
    const { width: containerW, height: containerH } = containerSize;
    if (!pageW || !pageH || !containerW || !containerH) return;
    const newScale = fitMode === 'fit-width'
      ? containerW / pageW
      : Math.min(containerW / pageW, containerH / pageH);
    setScale(Math.max(0.5, Math.min(3, newScale)));
  }, [fitMode, containerSize]);

  const onDocumentLoadSuccess = useCallback(({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setError(null);
    setIsLoading(false);
    onLoadSuccessProp?.(pages);
  }, [onLoadSuccessProp]);

  const onPageLoadSuccess = useCallback(({ width, height }: { width: number; height: number }) => {
    if (!pageDimensions.current.ready) {
      pageDimensions.current = { width: width / currentScaleRef.current, height: height / currentScaleRef.current, ready: true };
    }
  }, []);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, numPages || 1));
    if (validPage !== pageNumber) {
      pageDimensions.current.ready = false;
      setPageNumber(validPage);
      setPageInputValue(String(validPage));
    }
  }, [numPages, pageNumber]);

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInputValue, 10);
    if (!isNaN(page)) goToPage(page);
    else setPageInputValue(String(pageNumber));
  };

  const zoomIn = () => { setFitMode('custom'); setScale(s => Math.min(s + 0.25, 3)); };
  const zoomOut = () => { setFitMode('custom'); setScale(s => Math.max(s - 0.25, 0.5)); };
  const toggleFit = (mode: FitMode) => setFitMode(f => f === mode ? 'custom' : mode);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = normalizedPath;
    link.download = normalizedPath.split('/').pop() || 'document.pdf';
    link.click();
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft': goToPage(pageNumber - 1); break;
      case 'ArrowRight': goToPage(pageNumber + 1); break;
      case 'Escape': if (isFullscreen && onClose) onClose(); break;
      case '+': case '=': zoomIn(); break;
      case '-': zoomOut(); break;
    }
  }, [pageNumber, isFullscreen, onClose, goToPage]);

  return (
    <div
      className={cn(
        'flex flex-col bg-background rounded-xl overflow-hidden',
        isFullscreen ? 'fixed inset-0 z-50' : 'border border-border/50 shadow-card',
        className
      )}
      onKeyDown={handleKeyDown}
      onMouseMove={resetToolbarTimeout}
      tabIndex={0}
      role="application"
      aria-label="PDF Viewer"
    >
      {/* Toolbar */}
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2 bg-card/90 backdrop-blur-md border-b border-border/50 transition-all duration-300',
          showToolbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        )}
        onMouseEnter={() => { isMouseOverToolbar.current = true; setShowToolbar(true); }}
        onMouseLeave={() => { isMouseOverToolbar.current = false; resetToolbarTimeout(); }}
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setShowThumbnails(s => !s)} className="h-8 w-8">
            {showThumbnails ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
          </Button>
          {title && <span className="text-sm font-medium truncate max-w-[150px] hidden sm:block">{title}</span>}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <input
              type="text"
              value={pageInputValue}
              onChange={e => setPageInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePageInputSubmit()}
              onBlur={handlePageInputSubmit}
              className="w-12 h-7 text-center text-sm bg-muted/50 border border-border/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-muted-foreground">/ {numPages || '...'}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= numPages} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={zoomOut} disabled={scale <= 0.5} className="h-8 w-8"><ZoomOut className="h-4 w-4" /></Button>
          <span className="text-xs text-muted-foreground min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={zoomIn} disabled={scale >= 3} className="h-8 w-8"><ZoomIn className="h-4 w-4" /></Button>
          <div className="w-px h-5 bg-border/50 mx-1 hidden sm:block" />
          <Button variant={fitMode === 'fit-width' ? 'secondary' : 'ghost'} size="icon" onClick={() => toggleFit('fit-width')} className="h-8 w-8 hidden sm:flex" title="Fit to width">
            <AlignHorizontalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button variant={fitMode === 'fit-page' ? 'secondary' : 'ghost'} size="icon" onClick={() => toggleFit('fit-page')} className="h-8 w-8 hidden sm:flex" title="Fit to page">
            <Maximize className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border/50 mx-1 hidden sm:block" />
          <Button variant="ghost" size="icon" onClick={() => setRotation(r => (r + 90) % 360)} className="h-8 w-8"><RotateCw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} className="h-8 w-8"><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(f => !f)} className="h-8 w-8">
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {isFullscreen && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 ml-1"><X className="h-4 w-4" /></Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Thumbnails Sidebar */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 z-10 bg-card/95 backdrop-blur-sm border-r border-border/50 overflow-y-auto transition-all duration-300',
          showThumbnails ? 'w-36 sm:w-44 opacity-100' : 'w-0 opacity-0 -translate-x-full'
        )}>
          {showThumbnails && numPages > 0 && (
            <div className="p-2 space-y-2">
              <Document file={normalizedPath} loading={null}>
                {Array.from({ length: numPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => goToPage(i + 1)}
                    className={cn(
                      'w-full rounded-lg overflow-hidden transition-all relative',
                      pageNumber === i + 1 ? 'ring-2 ring-primary shadow-md' : 'hover:ring-2 hover:ring-primary/50 opacity-70 hover:opacity-100'
                    )}
                  >
                    <Page pageNumber={i + 1} width={128} renderTextLayer={false} renderAnnotationLayer={false}
                      loading={<div className="h-40 bg-muted/50 animate-pulse flex items-center justify-center"><span className="text-xs text-muted-foreground">{i + 1}</span></div>}
                    />
                    <div className={cn('absolute bottom-0 inset-x-0 py-1 text-xs font-medium text-center',
                      pageNumber === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-black/60 text-white'
                    )}>{i + 1}</div>
                  </button>
                ))}
              </Document>
            </div>
          )}
        </div>

        {/* PDF Content */}
        <div ref={contentRef} className={cn('w-full h-full overflow-auto flex items-start justify-center p-6', isFullscreen ? 'bg-muted/30' : 'bg-muted/20')}>
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <X className="h-12 w-12 text-destructive opacity-50 mb-2" />
              <p className="text-sm text-muted-foreground">Unable to load PDF</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{error}</p>
            </div>
          ) : (
            <Document
              file={normalizedPath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err: Error) => { setError(err.message || 'Failed to load PDF'); setIsLoading(false); }}
              loading={<LoadingSpinner text="Loading PDF document..." />}
            >
              {isLoading ? (
                <LoadingSpinner text="Preparing document..." />
              ) : (
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  onLoadSuccess={onPageLoadSuccess}
                  loading={<LoadingSpinner text={`Loading page ${pageNumber}...`} />}
                  className="shadow-lg rounded-lg overflow-hidden transition-transform duration-200"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              )}
            </Document>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
