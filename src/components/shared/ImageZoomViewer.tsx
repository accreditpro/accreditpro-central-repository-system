import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Hand,
} from 'lucide-react';

// ============================================================
// PROPS
// ============================================================

export interface ImageZoomViewerProps {
  /** Image source URL (data URL or remote URL) */
  src: string;
  /** Alt text for the image */
  alt?: string;
  /** Additional CSS classes for the wrapper */
  className?: string;
  /** Initial zoom level as percentage (default: 100) */
  defaultZoom?: number;
  /** Minimum zoom percentage (default: 25) */
  minZoom?: number;
  /** Maximum zoom percentage (default: 400) */
  maxZoom?: number;
  /** Zoom step increment in percentage (default: 25) */
  zoomStep?: number;
  /** Whether to show the floating zoom controls (default: true) */
  showControls?: boolean;
  /** Whether to show the "fit to container" button */
  showFitButton?: boolean;
  /** Whether to show the fullscreen toggle button */
  showFullscreenButton?: boolean;
  /** Callback when zoom changes */
  onZoomChange?: (zoom: number) => void;
  /** Visual style variant */
  variant?: 'default' | 'minimal';
}

// ============================================================
// COMPONENT
// ============================================================

export function ImageZoomViewer({
  src,
  alt = '',
  className,
  defaultZoom = 100,
  minZoom = 25,
  maxZoom = 400,
  zoomStep = 25,
  showControls = true,
  showFitButton = true,
  showFullscreenButton = false,
  onZoomChange,
  variant = 'default',
}: ImageZoomViewerProps) {
  const [zoom, setZoom] = useState(defaultZoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const zoomIndicatorTimer = useRef<ReturnType<typeof setTimeout>>();

  // Store latest props + zoom in refs for use in event listeners without stale closures
  const configRef = useRef({ minZoom, maxZoom, zoomStep, defaultZoom, onZoomChange });
  configRef.current = { minZoom, maxZoom, zoomStep, defaultZoom, onZoomChange };
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  // Reset when src changes
  useEffect(() => {
    setZoom(defaultZoom);
    setTranslate({ x: 0, y: 0 });
    setImageLoaded(false);
    setShowZoomIndicator(false);
  }, [src, defaultZoom]);

  // --- Zoom helper (reads from ref to avoid stale closures) ---
  const changeZoom = useCallback((direction: 1 | -1) => {
    const { minZoom: min, maxZoom: max, zoomStep: step, onZoomChange: cb } = configRef.current;
    setZoom(prev => {
      const next = Math.min(max, Math.max(min, prev + direction * step));
      cb?.(next);
      return next;
    });
    // Show zoom indicator briefly
    setShowZoomIndicator(true);
    clearTimeout(zoomIndicatorTimer.current);
    zoomIndicatorTimer.current = setTimeout(() => setShowZoomIndicator(false), 1500);
  }, []);

  const handleZoomIn = useCallback(() => changeZoom(1), [changeZoom]);
  const handleZoomOut = useCallback(() => changeZoom(-1), [changeZoom]);

  const handleResetZoom = useCallback(() => {
    const { defaultZoom: dz, onZoomChange: cb } = configRef.current;
    setZoom(dz);
    setTranslate({ x: 0, y: 0 });
    cb?.(dz);
    setShowZoomIndicator(true);
    clearTimeout(zoomIndicatorTimer.current);
    zoomIndicatorTimer.current = setTimeout(() => setShowZoomIndicator(false), 1500);
  }, []);

  // --- Mouse wheel zoom with non-passive listener ---
  // Only zooms when already zoomed in (>100%), otherwise lets page scroll through
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only capture wheel when zoomed in — let page scroll at 100%
      if (zoomRef.current <= 100) return;
      e.preventDefault();
      changeZoom(e.deltaY < 0 ? 1 : -1);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [changeZoom]);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Plus (Zoom in)
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        changeZoom(1);
      }
      // Ctrl+Minus (Zoom out)
      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        changeZoom(-1);
      }
      // Ctrl+0 (Reset zoom)
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeZoom, handleResetZoom]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearTimeout(zoomIndicatorTimer.current);
  }, []);

  // --- Drag-to-pan handlers ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 100) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  }, [zoom, translate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  const handleMouseLeave = useCallback(() => setIsDragging(false), []);

  const isZoomedIn = zoom > 100;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex overflow-auto select-none',
        // Center the image when zoomed out (< 100%), top-left when at natural size or larger for scrolling
        zoom < 100 ? 'items-center justify-center' : 'items-start justify-start',
        variant === 'default' && 'bg-muted/30 rounded-xl',
        className,
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: isDragging ? 'grabbing' : isZoomedIn ? 'grab' : 'default',
      }}
    >
      {/* Loading state */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
            <span className="text-[10px] text-muted-foreground">Loading image...</span>
          </div>
        </div>
      )}

      {/* Image */}
      <motion.img
        ref={imageRef}
        src={src}
        alt={alt}
        draggable={false}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(true)}
        className={cn(
          'transition-transform duration-200 ease-out',
          // At zoom < 100%, constrain image to fit within container
          // At zoom >= 100%, let image render at natural size and scroll
          zoom < 100 && 'max-w-full max-h-full object-contain',
          imageLoaded ? 'opacity-100' : 'opacity-0',
        )}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center center',
        }}
      />

      {/* Controls overlay */}
      {showControls && (
        <div
          className={cn(
            'absolute z-10 transition-all duration-200',
            variant === 'minimal'
              ? 'bottom-2 right-2'
              : 'top-3 right-3 flex items-center gap-1',
          )}
        >
          <div
            className={cn(
              'flex items-center gap-1',
              variant === 'default'
                ? 'bg-background/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-border/40'
                : 'bg-background/90 backdrop-blur-sm rounded-lg p-0.5 shadow-sm border border-border/30',
            )}
          >
            {/* Zoom out */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                variant === 'default' ? 'h-7 w-7 rounded-md' : 'h-6 w-6 rounded-md',
              )}
              onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
              disabled={zoom <= minZoom}
              title={`Zoom out (${zoom <= minZoom ? 'min' : 'Ctrl+-'})`}
            >
              <ZoomOut className={cn(variant === 'default' ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
            </Button>

            {/* Zoom percentage */}
            <span
              className={cn(
                'font-medium tabular-nums text-center min-w-[3rem]',
                variant === 'default' ? 'text-[10px]' : 'text-[9px]',
              )}
            >
              {zoom}%
            </span>

            {/* Zoom in */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                variant === 'default' ? 'h-7 w-7 rounded-md' : 'h-6 w-6 rounded-md',
              )}
              onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
              disabled={zoom >= maxZoom}
              title={`Zoom in (${zoom >= maxZoom ? 'max' : 'Ctrl++'})`}
            >
              <ZoomIn className={cn(variant === 'default' ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
            </Button>

            {/* Separator */}
            <div className="w-px h-5 bg-border/50 mx-0.5" />

            {/* Reset zoom */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                variant === 'default' ? 'h-7 w-7 rounded-md' : 'h-6 w-6 rounded-md',
              )}
              onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
              title="Reset zoom (Ctrl+0)"
            >
              <RotateCw className={cn(variant === 'default' ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
            </Button>

            {/* Fit to view */}
            {showFitButton && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  variant === 'default' ? 'h-7 w-7 rounded-md' : 'h-6 w-6 rounded-md',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetZoom();
                }}
                title="Fit to view"
              >
                <Maximize2 className={cn(variant === 'default' ? 'h-3.5 w-3.5' : 'h-3 w-3')} />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Pan indicator — shows while actively dragging */}
      <AnimatePresence>
        {isDragging && isZoomedIn && (
          <motion.div
            key="pan-indicator"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <div className="flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1 shadow-sm border border-border/40">
              <Hand className="h-3 w-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground font-medium">Dragging to pan</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom level indicator — fades in briefly on zoom change */}
      <AnimatePresence>
        {showZoomIndicator && !isDragging && (
          <motion.div
            key="zoom-indicator"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          >
            <div className="rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1 shadow-sm border border-border/40">
              <span className="text-[9px] text-muted-foreground font-medium">{zoom}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ImageZoomViewer;
