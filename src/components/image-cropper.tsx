
'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// A helper function to create a new image element and load it.
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Needed for cross-origin images
    image.src = url;
  });

// A helper function to get the radian value from a degree
function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * This function was adapted from the official react-easy-crop documentation.
 * It correctly handles rotation, zoom, and cropping to produce a valid Blob.
 * @param {string} imageSrc - The source of the image to crop.
 * @param {Area} pixelCrop - The pixel-perfect crop area.
 * @param {number} rotation - The rotation angle in degrees.
 * @returns {Promise<Blob>}
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * maxSize;

  // Set canvas size to the safe area to prevent clipping during rotation
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Translate canvas context to a central location to rotate around the center
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Draw rotated image on canvas
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas size to the final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paste the cropped image data from the rotated canvas onto the final canvas
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );
  
  // Get the original MIME type from the data URL
  const mimeTypeMatch = imageSrc.match(/data:(image\/\w+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        reject(new Error('Could not create blob from canvas.'));
        return;
      }
      resolve(blob);
    }, mimeType);
  });
}


interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropFullComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error('Error cropping image:', e);
      // Optionally, show a toast notification to the user
    }
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>编辑头像</DialogTitle>
        </DialogHeader>
        <div className="relative flex-grow w-full bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropFullComplete}
          />
        </div>
        <div className="space-y-4 p-4">
            <div className="grid gap-2">
                <label className="text-sm">缩放</label>
                <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={(val) => setZoom(val[0])}
                />
            </div>
             <div className="grid gap-2">
                <label className="text-sm">旋转</label>
                <Slider
                    value={[rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={(val) => setRotation(val[0])}
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>取消</Button>
          <Button onClick={handleDone}>完成裁剪</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
