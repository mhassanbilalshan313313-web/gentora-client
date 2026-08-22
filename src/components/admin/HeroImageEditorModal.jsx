import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Crop,
  Sparkles,
} from 'lucide-react';

const HeroImageEditorModal = ({
  isOpen,
  imageSrc,
  onClose,
  onSave,
  slideTitle = 'Hero Banner Image',
}) => {
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9', '21:9', 'free'
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Reset controls when a new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1.0);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setPan({ x: 0, y: 0 });
      setAspectRatio('16:9');
    }
  }, [isOpen, imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Handle Drag / Pan Operations (Mouse & Touch)
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPan({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateCw = () => setRotation((prev) => (prev + 90) % 360);
  const handleRotateCcw = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleReset = () => {
    setZoom(1.0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPan({ x: 0, y: 0 });
  };

  // Generate processed cropped banner image file from HTML5 Canvas
  const handleApplyCrop = async () => {
    if (!imageRef.current) return;
    try {
      setProcessing(true);
      const img = imageRef.current;

      // Determine output canvas size based on aspect ratio
      let targetWidth = 1920;
      let targetHeight = 1080; // 16:9 default

      if (aspectRatio === '21:9') {
        targetHeight = 822; // 21:9 ratio
      } else if (aspectRatio === 'free') {
        targetWidth = img.naturalWidth || 1920;
        targetHeight = img.naturalHeight || 1080;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas 2d context');

      // Clear canvas with dark slate background fallback
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.save();

      // Translate to canvas center for rotation & scaling
      ctx.translate(targetWidth / 2, targetHeight / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Apply zoom & pan offsets
      const isRotated90 = rotation === 90 || rotation === 270;
      const imgW = isRotated90 ? img.naturalHeight : img.naturalWidth;
      const imgH = isRotated90 ? img.naturalWidth : img.naturalHeight;

      // Compute cover scaling ratio
      const scaleW = targetWidth / imgW;
      const scaleH = targetHeight / imgH;
      const baseScale = Math.max(scaleW, scaleH) * zoom;

      const drawW = img.naturalWidth * baseScale;
      const drawH = img.naturalHeight * baseScale;

      // Draw transformed image onto canvas
      ctx.drawImage(
        img,
        -drawW / 2 + pan.x * (targetWidth / 600),
        -drawH / 2 + pan.y * (targetHeight / 340),
        drawW,
        drawH
      );

      ctx.restore();

      // Convert canvas to JPEG Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert('Failed to generate cropped image.');
            setProcessing(false);
            return;
          }
          const editedFile = new File([blob], `hero-banner-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          onSave(editedFile);
          setProcessing(false);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Image crop export error:', err);
      alert('Error saving image edit: ' + err.message);
      setProcessing(false);
    }
  };

  // Aspect ratio crop frame container dimensions class
  const getCropAspectClass = () => {
    if (aspectRatio === '21:9') return 'aspect-[21/9] max-w-4xl';
    if (aspectRatio === 'free') return 'aspect-[16/9] max-w-4xl';
    return 'aspect-[16/9] max-w-3xl'; // 16:9 default
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gentora-emerald/20 text-gentora-emerald rounded-lg">
              <Crop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                <span>Hero Banner Image Editor</span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30 uppercase">
                  Live Preview
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                Editing: {slideTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Aspect Ratio Preset Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-gentora-gold" /> Aspect Ratio Framing:
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  aspectRatio === '16:9'
                    ? 'bg-gentora-emerald text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                16:9 Widescreen (Standard)
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('21:9')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  aspectRatio === '21:9'
                    ? 'bg-gentora-emerald text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                21:9 Ultrawide Banner
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('free')}
                className={`px-3 py-1.5 rounded-lg font-bold transition text-xs ${
                  aspectRatio === 'free'
                    ? 'bg-gentora-emerald text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Freeform Crop
              </button>
            </div>
          </div>

          {/* Interactive Live Canvas Viewport */}
          <div className="flex justify-center bg-slate-950/80 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
            <div
              ref={containerRef}
              className={`relative w-full ${getCropAspectClass()} overflow-hidden rounded-xl border-2 border-dashed border-gentora-gold/60 shadow-2xl bg-slate-900 cursor-grab active:cursor-grabbing select-none group`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            >
              {/* Image Transform Target */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${
                    flipH ? -1 : 1
                  }) scaleY(${flipV ? -1 : 1})`,
                  transformOrigin: 'center center',
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Banner Source"
                  className="max-w-none w-full h-full object-cover pointer-events-none"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Crop Grid Overlay Rule of Thirds */}
              <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3 opacity-40 group-hover:opacity-80 transition duration-300">
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-r border-b border-white/20"></div>
                <div className="border-b border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div className="border-r border-white/20"></div>
                <div></div>
              </div>

              {/* Drag Hint Tag */}
              <div className="absolute bottom-3 left-3 bg-slate-950/70 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md pointer-events-none">
                ✋ Drag to Pan | Slider to Zoom
              </div>
            </div>
          </div>

          {/* Controls Toolbar: Zoom, Rotate, Flip & Reset */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Zoom Controls */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-4 h-4 text-gentora-gold" /> Zoom Level:
                  </span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <ZoomOut className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-gentora-emerald cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Rotate & Flip Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleRotateCcw}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                  title="Rotate 90° Counter-Clockwise"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-90°</span>
                </button>

                <button
                  type="button"
                  onClick={handleRotateCw}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                  title="Rotate 90° Clockwise"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90°</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlipH(!flipH)}
                  className={`px-3 py-2 font-bold rounded-xl border transition flex items-center gap-1.5 ${
                    flipH
                      ? 'bg-gentora-emerald text-white border-emerald-500'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFlipV(!flipV)}
                  className={`px-3 py-2 font-bold rounded-xl border transition flex items-center gap-1.5 ${
                    flipV
                      ? 'bg-gentora-emerald text-white border-emerald-500'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                  title="Reset to Original"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApplyCrop}
            disabled={processing}
            className="px-6 py-2.5 bg-gentora-emerald hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center gap-2"
          >
            {processing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Crop...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Apply & Save Banner Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroImageEditorModal;
