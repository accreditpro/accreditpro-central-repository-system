import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileText,
  AlertCircle,
  Loader2,
  Download,
} from 'lucide-react';

// Dynamically import mammoth (it's a large library)
let mammothInstance: any = null;
async function getMammoth() {
  if (!mammothInstance) {
    mammothInstance = await import('mammoth');
  }
  return mammothInstance;
}

// ============================================================
// PROPS
// ============================================================

export interface DocxViewerProps {
  /** Data URL or remote URL of the .docx file */
  src: string;
  /** Original file name (for download fallback) */
  fileName?: string;
  /** Additional CSS classes */
  className?: string;
  /** Initial zoom level as percentage (default: 100) */
  defaultZoom?: number;
  /** Minimum zoom percentage (default: 50) */
  minZoom?: number;
  /** Maximum zoom percentage (default: 200) */
  maxZoom?: number;
  /** Zoom step increment (default: 25) */
  zoomStep?: number;
  /** Whether to show controls (default: true) */
  showControls?: boolean;
  /** Visual variant */
  variant?: 'default' | 'minimal';
  /** Called when converted HTML content is ready */
  onContentLoaded?: (html: string) => void;
  /** Called when an error occurs */
  onError?: (error: Error) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export function DocxViewer({
  src,
  fileName = 'document.docx',
  className,
  defaultZoom = 100,
  minZoom = 50,
  maxZoom = 200,
  zoomStep = 25,
  showControls = true,
  variant = 'default',
  onContentLoaded,
  onError,
}: DocxViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(defaultZoom);
  const [warnings, setWarnings] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Convert docx to HTML when src changes
  useEffect(() => {
    let cancelled = false;

    async function convert() {
      if (!src) return;
      
      setIsLoading(true);
      setError(null);
      setHtmlContent(null);
      setWarnings([]);

      try {
        const mammoth = await getMammoth();
        
        // Fetch the data URL as ArrayBuffer
        const response = await fetch(src);
        if (!response.ok) throw new Error(`Failed to fetch document: ${response.statusText}`);
        const arrayBuffer = await response.arrayBuffer();

        // Convert to HTML
        const result = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            styleMap: [
              "p[style-name='Title'] => h1:fresh",
              "p[style-name='Subtitle'] => h2:fresh",
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Heading 4'] => h4:fresh",
              "r[style-name='Strong'] => strong",
              "r[style-name='Emphasis'] => em",
            ],
          }
        );

        if (!cancelled) {
          setHtmlContent(result.value);
          if (result.messages?.length > 0) {
            setWarnings(
              result.messages
                .filter((m: any) => m.type === 'warning')
                .map((m: any) => m.message)
            );
          }
          onContentLoaded?.(result.value);
        }
      } catch (err: any) {
        if (!cancelled) {
          const message = err?.message || 'Failed to convert document';
          setError(message);
          onError?.(err instanceof Error ? err : new Error(message));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    convert();
    return () => { cancelled = true; };
  }, [src, onContentLoaded, onError]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(maxZoom, prev + zoomStep));
  }, [maxZoom, zoomStep]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(minZoom, prev - zoomStep));
  }, [minZoom, zoomStep]);

  const handleResetZoom = useCallback(() => {
    setZoom(defaultZoom);
  }, [defaultZoom]);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = src;
    link.download = fileName;
    link.click();
  }, [src, fileName]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-[300px] gap-3',
          variant === 'default' && 'bg-muted/30 rounded-xl',
          className,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Converting document...</p>
        <p className="text-[10px] text-muted-foreground/70">{fileName}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-[300px] gap-3 p-6 text-center',
          variant === 'default' && 'bg-muted/30 rounded-xl',
          className,
        )}
      >
        <AlertCircle className="h-10 w-10 text-destructive/60" />
        <div>
          <p className="text-sm font-medium text-destructive">Failed to load document</p>
          <p className="text-xs text-muted-foreground mt-1">{error}</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Download instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden',
        variant === 'default' && 'bg-muted/30 rounded-xl',
        className,
      )}
    >
      {/* Controls toolbar */}
      {showControls && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-background/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
              {fileName}
            </span>
            <Badge variant="outline" className="text-[8px] font-mono bg-blue-500/5 text-blue-600 border-blue-200/50">
              DOCX
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={handleZoomOut}
              disabled={zoom <= minZoom}
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] font-medium tabular-nums min-w-[3rem] text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={handleZoomIn}
              disabled={zoom >= maxZoom}
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <div className="w-px h-5 bg-border/50 mx-0.5" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={handleResetZoom}
              title="Reset zoom"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Conversion warnings */}
      {warnings.length > 0 && (
        <div className="px-3 py-1.5 bg-amber-500/5 border-b border-amber-500/10">
          <p className="text-[9px] text-amber-600/70 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {warnings.length} conversion warning{warnings.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Document content area */}
      <div className="flex-1 overflow-auto">
        <div
          ref={contentRef}
          className="mx-auto transition-transform duration-200"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            maxWidth: zoom > 100 ? 'none' : '100%',
          }}
        >
          {htmlContent && (
            <div
              className={cn(
                'docx-content prose prose-sm max-w-none p-6',
                'prose-headings:font-semibold prose-headings:text-foreground',
                'prose-p:text-muted-foreground prose-p:leading-relaxed',
                'prose-table:border-collapse prose-table:w-full',
                'prose-th:bg-muted/50 prose-th:text-left prose-th:px-3 prose-th:py-2 prose-th:text-xs prose-th:font-semibold',
                'prose-td:px-3 prose-td:py-2 prose-td:text-sm prose-td:border-b prose-td:border-border/50',
                'prose-img:rounded-lg prose-img:shadow-sm',
                'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                'prose-li:text-muted-foreground',
                'prose-strong:text-foreground',
              )}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DocxViewer;
