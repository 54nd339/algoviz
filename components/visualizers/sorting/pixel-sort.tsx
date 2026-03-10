"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Pause, Play, RotateCcw, Upload } from "lucide-react";

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from "@/components/ui";
import {
  createSampleImageDataUrl,
  runPixelSort as runPixelSortUtil,
  type SortMode,
} from "@/lib/algorithms/sorting/pixel-sort-utils";
import { cn } from "@/lib/utils";

export function PixelSort() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(
    null,
  );
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sortMode, setSortMode] = useState<SortMode>("brightness");
  const [speed, setSpeed] = useState(5);
  const playingRef = useRef(false);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const loadImage = useCallback((src: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const maxW = 400;
      const scale = img.width > maxW ? maxW / img.width : 1;
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);

      canvas.width = w;
      canvas.height = h;
      setWidth(w);
      setHeight(h);

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h);
      setOriginalImageData(
        new ImageData(new Uint8ClampedArray(data.data), w, h),
      );
      setImageLoaded(true);
      setProgress(0);
    };
    img.src = src;
  }, []);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => loadImage(reader.result as string);
      reader.readAsDataURL(file);
    },
    [loadImage],
  );

  const handleLoadSample = useCallback(() => {
    loadImage(createSampleImageDataUrl());
  }, [loadImage]);

  const runPixelSort = useCallback(async () => {
    if (!canvasRef.current || !originalImageData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const rowsPerFrame = Math.max(1, speed);

    setPlaying(true);
    playingRef.current = true;

    await runPixelSortUtil(
      ctx,
      originalImageData,
      width,
      height,
      sortMode,
      rowsPerFrame,
      setProgress,
      () => playingRef.current,
    );

    setPlaying(false);
  }, [originalImageData, width, height, sortMode, speed]);

  const handleReset = useCallback(() => {
    setPlaying(false);
    playingRef.current = false;
    if (canvasRef.current && originalImageData) {
      const ctx = canvasRef.current.getContext("2d")!;
      ctx.putImageData(originalImageData, 0, 0);
      setProgress(0);
    }
  }, [originalImageData]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `pixel-sort-${sortMode}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, [sortMode]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-1.5"
        >
          <Upload size={14} />
          Upload Image
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLoadSample}>
          Sample Image
        </Button>

        <Select
          value={sortMode}
          onValueChange={(v) => setSortMode(v as SortMode)}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brightness">Brightness</SelectItem>
            <SelectItem value="hue">Hue</SelectItem>
            <SelectItem value="saturation">Saturation</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-text-muted">
            Batch: {speed}
          </span>
          <Slider
            value={[speed]}
            min={1}
            max={20}
            step={1}
            onValueChange={([v]) => setSpeed(v)}
            className="w-16"
            aria-label="Rows per frame"
          />
        </div>

        {imageLoaded && (
          <>
            <Button
              variant={playing ? "outline" : "accent"}
              size="sm"
              onClick={
                playing
                  ? () => {
                      setPlaying(false);
                      playingRef.current = false;
                    }
                  : runPixelSort
              }
              className="gap-1.5"
            >
              {playing ? <Pause size={14} /> : <Play size={14} />}
              {playing ? "Stop" : "Sort Pixels"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download size={14} />
              PNG
            </Button>
          </>
        )}

        {progress > 0 && (
          <span className="font-mono text-[10px] text-accent-green">
            {progress}%
          </span>
        )}
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Pixel sort canvas"
          className={cn(
            "rounded-lg border border-border bg-bg-primary/50",
            !imageLoaded && "h-48 w-full",
          )}
        />
      </div>

      {!imageLoaded && (
        <p className="text-center font-mono text-xs text-text-muted">
          Upload an image or load a sample to start pixel sorting
        </p>
      )}
    </div>
  );
}
