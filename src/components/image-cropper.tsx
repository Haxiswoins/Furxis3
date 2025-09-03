
'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import type { CroppedAreaPixels } from '@/types';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number[]) => {
    setZoom(newZoom[0]);
  }, []);

   const onRotationChange = useCallback((newRotation: number[]) => {
    setRotation(newRotation[0]);
  }, []);

  const onCropFullComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = async (): Promise<Blob> => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx || !croppedAreaPixels) {
      throw new Error('Failed to create canvas context or missing crop data');
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

    ctx.drawImage(
      image,
      0,
      0
    );

    const data = ctx.getImageData(
        croppedAreaPixels.x * scaleX,
        croppedAreaPixels.y * scaleY,
        croppedAreaPixels.width * scaleX,
        croppedAreaPixels.height * scaleY
    );
    
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.putImageData(data, 0, 0);

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error('Canvas is empty');
                return reject(new Error('Canvas is empty'));
            }
            resolve(blob);
        }, 'image/png');
    });
  };

  const handleDone = async () => {
    try {
      const croppedImageBlob = await getCroppedImg();
      onCropComplete(croppedImageBlob);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>编辑头像</DialogTitle>
        </DialogHeader>
        <div className="relative h-96 w-full bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            onCropChange={onCropChange}
            onZoomChange={(newZoom) => setZoom(newZoom)}
            onRotationChange={(newRotation) => setRotation(newRotation)}
            onCropComplete={onCropFullComplete}
          />
        </div>
        <div className="space-y-4 p-4">
            <div>
                <label className="text-sm">缩放</label>
                <Slider
                    value={[zoom]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={onZoomChange}
                />
            </div>
             <div>
                <label className="text-sm">旋转</label>
                <Slider
                    value={[rotation]}
                    min={0}
                    max={360}
                    step={1}
                    onValueChange={onRotationChange}
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
