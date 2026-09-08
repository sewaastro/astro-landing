'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface UploaderMediaItem {
  mediaId: string;
  url: string;
  isDefault: boolean;
}

interface MediaUploaderProps {
  media: UploaderMediaItem[];
  onChange: (media: UploaderMediaItem[]) => void;
  onUpload: (file: File) => Promise<{ mediaId: string; url: string }>;
  onDelete: (mediaId: string) => Promise<void>;
}

export function MediaUploader({ media, onChange, onUpload, onDelete }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setError('');

    const uploaded: UploaderMediaItem[] = [];
    const failed: string[] = [];
    const hadNoneBefore = media.length === 0;

    for (let i = 0; i < files.length; i++) {
      setUploadProgress({ done: i, total: files.length });
      try {
        const { mediaId, url } = await onUpload(files[i]);
        uploaded.push({ mediaId, url, isDefault: hadNoneBefore && uploaded.length === 0 });
      } catch {
        failed.push(files[i].name);
      }
    }

    setUploadProgress(null);
    if (uploaded.length > 0) onChange([...media, ...uploaded]);
    if (failed.length > 0) setError(`Failed to upload: ${failed.join(', ')}`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleRemove(mediaId: string) {
    const wasDefault = media.find(m => m.mediaId === mediaId)?.isDefault ?? false;
    try {
      await onDelete(mediaId);
    } catch {
      // best-effort — still remove from the form
    }
    const next = media.filter(m => m.mediaId !== mediaId);
    if (wasDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
    onChange(next);
  }

  function handleSetDefault(mediaId: string) {
    onChange(media.map(m => ({ ...m, isDefault: m.mediaId === mediaId })));
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= media.length) return;
    const next = [...media];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {media.map((item, index) => (
            <div
              key={item.mediaId}
              className="relative overflow-hidden rounded-md border border-neutral-200"
            >
              <Image
                src={item.url}
                alt="Remedy media"
                width={160}
                height={120}
                className="h-24 w-full object-cover"
              />
              {item.isDefault && (
                <span className="absolute left-1 top-1 rounded bg-amber-100 px-1.5 py-0.5 font-mukta text-[10px] font-medium text-amber-800">
                  Default
                </span>
              )}
              <div className="flex items-center justify-between gap-1 bg-white/90 px-1 py-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="Move left"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDefault(item.mediaId)}
                  disabled={item.isDefault}
                  className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="Set as default"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === media.length - 1}
                  className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="Move right"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.mediaId)}
                  className="rounded p-1 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="font-mukta"
        disabled={uploadProgress !== null}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadProgress
          ? `Uploading ${uploadProgress.done + 1} of ${uploadProgress.total}…`
          : 'Add images'}
      </Button>

      {error && <p className="font-mukta text-sm text-red-500">{error}</p>}
    </div>
  );
}
