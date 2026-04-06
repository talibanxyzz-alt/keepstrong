'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, Calendar, X, Info, Loader2, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { localDateString } from '@/lib/utils/localDate';

interface Photo {
  id: string;
  user_id: string | null;
  front_url: string | null;
  side_url: string | null;
  back_url: string | null;
  flex_url: string | null;
  taken_at: string | null;
  notes: string | null;
}

type AngleKey = 'front' | 'side' | 'back' | 'flex';

const ANGLES: { key: AngleKey; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'side',  label: 'Side'  },
  { key: 'back',  label: 'Back'  },
  { key: 'flex',  label: 'Flex'  },
];

export default function PhotosClient({
  photos: initialPhotos,
  userId,
}: {
  photos: Photo[];
  userId: string;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Upload form state
  const [selectedFiles, setSelectedFiles] = useState<Record<AngleKey, File | null>>({
    front: null, side: null, back: null, flex: null,
  });
  const [previews, setPreviews] = useState<Record<AngleKey, string | null>>({
    front: null, side: null, back: null, flex: null,
  });
  const [notes, setNotes] = useState('');
  const [takenAt, setTakenAt] = useState(() => localDateString());

  const frontRef = useRef<HTMLInputElement>(null);
  const sideRef  = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);
  const flexRef  = useRef<HTMLInputElement>(null);
  const fileRefs: Record<AngleKey, React.RefObject<HTMLInputElement | null>> = {
    front: frontRef, side: sideRef, back: backRef, flex: flexRef,
  };

  const handleFileSelect = (angle: AngleKey, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [angle]: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviews(prev => ({ ...prev, [angle]: reader.result as string }));
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [angle]: null }));
      const ref = fileRefs[angle];
      if (ref.current) ref.current.value = '';
    }
  };

  const resetUploadForm = () => {
    setSelectedFiles({ front: null, side: null, back: null, flex: null });
    setPreviews({ front: null, side: null, back: null, flex: null });
    setNotes('');
    setTakenAt(localDateString());
    [frontRef, sideRef, backRef, flexRef].forEach(r => {
      if (r.current) r.current.value = '';
    });
  };

  const handleUpload = async () => {
    const hasFile = Object.values(selectedFiles).some(Boolean);
    if (!hasFile) {
      toast.error('Please select at least one photo');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      if (selectedFiles.front) formData.append('front', selectedFiles.front);
      if (selectedFiles.side)  formData.append('side',  selectedFiles.side);
      if (selectedFiles.back)  formData.append('back',  selectedFiles.back);
      if (selectedFiles.flex)  formData.append('flex',  selectedFiles.flex);
      if (notes.trim()) formData.append('notes', notes.trim());
      formData.append('taken_at', takenAt);

      const res = await fetch('/api/photos/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Upload failed');

      setPhotos(prev => [result.photo, ...prev]);
      setShowUploadModal(false);
      resetUploadForm();
      toast.success('Photos uploaded successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPhoto) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/photos/${selectedPhoto.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setPhotos(prev => prev.filter(p => p.id !== selectedPhoto.id));
      setSelectedPhoto(null);
      setShowDeleteConfirm(false);
      toast.success('Photo set deleted');
    } catch {
      toast.error('Failed to delete photos');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  const formatMonthYear = (year: string, month: string) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const groupPhotosByMonth = (photos: Photo[]) => {
    const groups: Record<string, Photo[]> = {};
    photos.forEach((photo) => {
      const date = new Date(photo.taken_at ?? '1970-01-01');
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(photo);
    });
    return groups;
  };

  const photoGroups = groupPhotosByMonth(photos);
  const hasPhotos = photos.length > 0;
  const hasSelectedFiles = Object.values(selectedFiles).some(Boolean);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal mb-1">Progress Photos</h1>
          <p className="text-slate">
            {photos.length} photo {photos.length === 1 ? 'set' : 'sets'}
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium text-sm"
        >
          <Upload className="w-5 h-5" />
          Upload Photos
        </button>
      </div>

      {/* Empty State */}
      {!hasPhotos && (
        <div className="bg-surface rounded-lg border border-dashed border-line-strong">
          <div className="p-12 text-center">
            <Camera className="w-8 h-8 text-slate/50 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-charcoal mb-2">No progress photos yet</h2>
            <p className="text-sm text-slate mb-6 max-w-md mx-auto">
              Track your transformation by taking progress photos every 2–4 weeks from 4 angles.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload First Photos
            </button>
          </div>

          <div className="border-t border-line px-6 py-5">
            <h3 className="font-medium text-charcoal mb-2 text-sm">Photo Tips</h3>
            <ul className="space-y-1.5 text-sm text-slate">
              {[
                'Take photos at the same time of day (morning is best)',
                'Use the same lighting and location each time',
                'Take photos every 2–4 weeks for best tracking',
                '4 angles: Front, Side, Back, and Flex',
                'Wear similar clothing for consistency',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="text-slate/50">—</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Photo Timeline */}
      {hasPhotos && (
        <div className="space-y-8">
          {Object.entries(photoGroups)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([monthKey, monthPhotos]) => {
              const [year, month] = monthKey.split('-');
              return (
                <div key={monthKey}>
                  <div className="flex items-center gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-slate/60" />
                    <h2 className="text-lg font-semibold text-charcoal">
                      {formatMonthYear(year, month)}
                    </h2>
                    <div className="flex-1 h-px bg-line" />
                    <span className="text-sm text-slate">
                      {monthPhotos.length} {monthPhotos.length === 1 ? 'set' : 'sets'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {monthPhotos.map((photo) => {
                      const photoCount = [photo.front_url, photo.side_url, photo.back_url, photo.flex_url].filter(Boolean).length;
                      return (
                        <div
                          key={photo.id}
                          className="bg-surface rounded-lg border border-line overflow-hidden cursor-pointer hover:border-line-strong transition-colors group"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <div className="grid grid-cols-2 gap-0.5 bg-line aspect-square">
                            {ANGLES.map(({ key, label }) => {
                              const url = photo[`${key}_url` as keyof Photo] as string | null;
                              return url ? (
                                <div key={key} className="relative bg-cloud overflow-hidden">
                                  <Image src={url} alt={`${label} view`} fill className="object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">{label}</div>
                                </div>
                              ) : (
                                <div key={key} className="bg-cloud flex items-center justify-center">
                                  <Camera className="w-8 h-8 text-slate/50" />
                                </div>
                              );
                            })}
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-medium text-charcoal mb-1">{formatDate(photo.taken_at)}</p>
                            <p className="text-xs text-slate mb-2">{photoCount} {photoCount === 1 ? 'photo' : 'photos'}</p>
                            {photo.notes && <p className="text-sm text-slate line-clamp-2">{photo.notes}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold text-charcoal">Upload Progress Photos</h3>
              <button
                onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                disabled={uploading}
                className="p-2 hover:bg-cloud rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-6 h-6 text-slate" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">Date</label>
                <input
                  type="date"
                  value={takenAt}
                  max={localDateString()}
                  onChange={e => setTakenAt(e.target.value)}
                  className="w-full px-3 py-2 border border-line-strong rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Photo slots */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-3">
                  Photos <span className="text-slate/60 font-normal">(at least one required)</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {ANGLES.map(({ key, label }) => (
                    <div key={key}>
                      <p className="text-xs font-medium text-slate uppercase tracking-wide mb-1.5">{label}</p>
                      {previews[key] ? (
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cloud group">
                          <Image
                            src={previews[key]!}
                            alt={label}
                            fill
                            unoptimized
                            sizes="(max-width: 768px) 50vw, 200px"
                            className="object-cover"
                          />
                          <button
                            onClick={() => handleFileSelect(key, null)}
                            className="absolute top-2 right-2 p-1 bg-danger text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-charcoal text-white text-xs rounded">
                            Ready
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileRefs[key].current?.click()}
                          className="w-full aspect-[3/4] border-2 border-dashed border-line rounded-lg flex flex-col items-center justify-center gap-2 hover:border-line-strong hover:bg-cloud transition-colors"
                        >
                          <Plus className="w-6 h-6 text-slate/60" />
                          <span className="text-xs text-slate">Add {label}</span>
                        </button>
                      )}
                      <input
                        ref={fileRefs[key] as React.RefObject<HTMLInputElement>}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => handleFileSelect(key, e.target.files?.[0] ?? null)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1">
                  Notes <span className="text-slate/60 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="How are you feeling? Any observations..."
                  rows={3}
                  className="w-full px-3 py-2 border border-line-strong rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-line-strong text-charcoal rounded-lg hover:bg-cloud transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !hasSelectedFiles}
                  className="flex-1 px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Upload</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && !showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-surface rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-surface border-b border-line px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-semibold text-charcoal">{formatDate(selectedPhoto.taken_at)}</h3>
                {selectedPhoto.notes && <p className="text-slate mt-1 text-sm">{selectedPhoto.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-danger hover:bg-danger-muted rounded-lg transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 hover:bg-cloud rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-slate" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ANGLES.map(({ key, label }) => {
                  const url = selectedPhoto[`${key}_url` as keyof Photo] as string | null;
                  return url ? (
                    <div key={key} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-cloud">
                      <Image src={url} alt={`${label} view`} fill className="object-cover" />
                      <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/70 text-white text-sm rounded font-medium">
                        {label}
                      </div>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-2">Delete photo set?</h3>
            <p className="text-slate text-sm mb-6">
              This will permanently delete all photos from {formatDate(selectedPhoto.taken_at)}. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-line-strong text-charcoal rounded-lg hover:bg-cloud disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
