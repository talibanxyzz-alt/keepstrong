"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { Camera, Upload, X, Check, ArrowLeftRight, Loader2 } from "lucide-react";
import { format, differenceInWeeks } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { PROGRESS_PHOTOS_BUCKET, progressPhotoPathFromUrl } from "@/lib/progress-photo-urls";

interface ProgressPhoto {
  id: string;
  user_id: string | null;
  photo_url: string;
  angle: "front" | "back" | "side_left" | "side_right" | null;
  taken_at: string | null;
  created_at: string | null;
}

interface PhotoUploadProps {
  userId: string;
  existingPhotos?: ProgressPhoto[];
}

type AngleType = "front" | "back" | "side_left" | "side_right";

const ANGLE_LABELS: Record<AngleType, string> = {
  front: "Front",
  back: "Back",
  side_left: "Side Left",
  side_right: "Side Right",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export default function PhotoUpload({ userId, existingPhotos = [] }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(existingPhotos);
  const [selectedAngle, setSelectedAngle] = useState<AngleType | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState<[string | null, string | null]>([null, null]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const router = useRouter();

  const fetchPhotos = useCallback(async () => {
    const client = createClient();
    const { data } = await client
      .from("progress_photos")
      .select("*")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false });

    if (!data?.length) {
      setPhotos([]);
      return;
    }

    const refreshed = await Promise.all(
      data.map(async (row) => {
        const url = row.photo_url;
        if (typeof url !== "string" || !url) {
          return row as ProgressPhoto;
        }
        const path = progressPhotoPathFromUrl(url);
        if (!path) {
          return row as ProgressPhoto;
        }
        const { data: signed, error } = await client.storage
          .from(PROGRESS_PHOTOS_BUCKET)
          .createSignedUrl(path, 3600);
        if (error || !signed?.signedUrl) {
          return row as ProgressPhoto;
        }
        return { ...row, photo_url: signed.signedUrl } as ProgressPhoto;
      })
    );
    setPhotos(refreshed);
  }, [userId]);

  useEffect(() => {
    void fetchPhotos();
  }, [fetchPhotos]);

  const handleAngleSelect = (angle: AngleType) => {
    setSelectedAngle(angle);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG or PNG image");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedAngle) return;

    setIsUploading(true);

    try {
      const timestamp = new Date().toISOString();
      const base =
        selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^-+|-+$/g, "") || "photo";
      const ext =
        selectedFile.name.split(".").pop()?.toLowerCase().match(/^(jpg|jpeg|png)$/)?.[0] ?? "jpg";
      const filePath = `${userId}/${Date.now()}-${selectedAngle}-${base.slice(0, 60)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(PROGRESS_PHOTOS_BUCKET)
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      const { data: signed, error: signError } = await supabase.storage
        .from(PROGRESS_PHOTOS_BUCKET)
        .createSignedUrl(filePath, 3600);

      if (signError || !signed?.signedUrl) {
        toast.error("Could not create a secure link for your photo. Please try again.");
        setIsUploading(false);
        return;
      }

      const { error: dbError } = await supabase.from("progress_photos").insert({
        user_id: userId,
        photo_url: signed.signedUrl,
        angle: selectedAngle,
        taken_at: timestamp,
      });

      if (dbError) {
        toast.error(`Failed to save photo: ${dbError.message}`);
        setIsUploading(false);
        return;
      }

      toast.success(`${ANGLE_LABELS[selectedAngle]} photo uploaded!`);

      setSelectedFile(null);
      setPreviewImage(null);
      setSelectedAngle(null);

      await fetchPhotos();
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setSelectedAngle(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePhotoClick = (photoUrl: string) => {
    if (compareMode) {
      // Add to comparison
      if (!comparePhotos[0]) {
        setComparePhotos([photoUrl, null]);
      } else if (!comparePhotos[1] && photoUrl !== comparePhotos[0]) {
        setComparePhotos([comparePhotos[0], photoUrl]);
      } else {
        // Reset if clicking a third photo
        setComparePhotos([photoUrl, null]);
      }
    } else {
      // View full size
      window.open(photoUrl, "_blank");
    }
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setComparePhotos([null, null]);
  };

  // Group photos by week
  const groupPhotosByWeek = () => {
    if (photos.length === 0) return [];

    const sorted = [...photos].sort(
      (a, b) => new Date(a.taken_at ?? a.id).getTime() - new Date(b.taken_at ?? b.id).getTime()
    );

    const firstPhotoDate = new Date(sorted[0].taken_at ?? sorted[0].id);
    const grouped: Record<number, ProgressPhoto[]> = {};

    sorted.forEach((photo) => {
      const weekNumber = differenceInWeeks(new Date(photo.taken_at ?? photo.id), firstPhotoDate);
      if (!grouped[weekNumber]) {
        grouped[weekNumber] = [];
      }
      grouped[weekNumber].push(photo);
    });

    return Object.entries(grouped).map(([week, weekPhotos]) => ({
      week: parseInt(week) + 1,
      photos: weekPhotos,
    }));
  };

  const groupedPhotos = groupPhotosByWeek();

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Preview Modal */}
      {previewImage && selectedAngle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-xl bg-surface p-6 shadow-2xl">
            <button
              onClick={handleCancelUpload}
              className="absolute right-4 top-4 rounded-md p-2 text-slate transition-colors hover:bg-cloud"
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-xl font-bold text-charcoal">
              Preview - {ANGLE_LABELS[selectedAngle]}
            </h2>

            <div className="relative mb-6 flex min-h-[200px] max-h-[500px] w-full justify-center overflow-hidden rounded-lg">
              <Image
                src={previewImage}
                alt="Preview"
                width={1200}
                height={900}
                unoptimized
                className="h-auto max-h-[500px] w-full object-contain"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelUpload}
                className="flex-1 rounded-md border border-line-strong px-4 py-3 font-medium text-charcoal transition-colors hover:bg-cloud"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    Upload Photo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {compareMode && comparePhotos[0] && comparePhotos[1] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl p-6">
            <button
              onClick={exitCompareMode}
              className="absolute right-8 top-8 z-10 rounded-full bg-surface p-3 text-charcoal shadow-lg transition-colors hover:bg-cloud"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="rounded-xl bg-surface p-6">
              <h2 className="mb-6 text-center text-2xl font-bold text-charcoal">
                Compare Progress
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="mb-2 text-center text-sm font-medium text-slate">Before</p>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                    <Image
                      src={comparePhotos[0]}
                      alt="Before"
                      fill
                      sizes="(max-width: 768px) 45vw, 400px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-center text-sm font-medium text-slate">After</p>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                    <Image
                      src={comparePhotos[1]}
                      alt="After"
                      fill
                      sizes="(max-width: 768px) 45vw, 400px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Buttons */}
      <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-charcoal">Take New Photos</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(Object.keys(ANGLE_LABELS) as AngleType[]).map((angle) => (
            <button
              key={angle}
              onClick={() => handleAngleSelect(angle)}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-dashed border-line-strong bg-cloud transition-all hover:border-primary hover:bg-surface hover:shadow-md"
            >
              <div className="flex h-full flex-col items-center justify-center p-4">
                <Camera className="mb-3 h-12 w-12 text-slate transition-colors group-hover:text-primary" />
                <span className="text-sm font-medium text-charcoal">
                  {ANGLE_LABELS[angle]}
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate">
          📸 Click to take or upload a photo • Max 5MB • JPEG or PNG
        </p>
      </div>

      {/* Compare Toggle */}
      {photos.length >= 2 && (
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-charcoal">Your Progress Photos</h3>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              compareMode
                ? "bg-primary text-white"
                : "border border-line-strong text-charcoal hover:bg-cloud"
            }`}
          >
            <ArrowLeftRight className="h-4 w-4" />
            {compareMode ? "Exit Compare" : "Compare Photos"}
          </button>
        </div>
      )}

      {compareMode && (
        <div className="mb-6 rounded-lg bg-primary/5 p-4">
          <p className="text-sm text-primary">
            {!comparePhotos[0]
              ? "👆 Select first photo"
              : !comparePhotos[1]
              ? "👆 Select second photo to compare"
              : "✓ Viewing comparison"}
          </p>
        </div>
      )}

      {/* Photo Grid */}
      {groupedPhotos.length > 0 ? (
        <div className="space-y-8">
          {groupedPhotos.reverse().map((group) => (
            <div key={group.week}>
              <h4 className="mb-4 text-base font-semibold text-charcoal">
                Week {group.week}{" "}
                <span className="text-sm font-normal text-slate">
                  ({format(new Date(group.photos[0].taken_at ?? group.photos[0].id), "MMM d, yyyy")})
                </span>
              </h4>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {group.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => handlePhotoClick(photo.photo_url)}
                    className={`group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl transition-all ${
                      compareMode
                        ? comparePhotos.includes(photo.photo_url)
                          ? "ring-4 ring-primary"
                          : "hover:ring-2 hover:ring-line-strong"
                        : "hover:scale-[1.03] hover:shadow-lg"
                    }`}
                  >
                    <Image
                      src={photo.photo_url}
                      alt={ANGLE_LABELS[photo.angle ?? "front"]}
                      fill
                      sizes="(max-width: 768px) 50vw, 200px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-sm font-semibold">
                        {ANGLE_LABELS[photo.angle ?? 'front']}
                      </p>
                      <p className="text-xs">
                        {format(new Date(photo.taken_at ?? photo.id), "MMM d, h:mma")}
                      </p>
                    </div>
                    {compareMode && comparePhotos.includes(photo.photo_url) && (
                      <div className="absolute right-2 top-2 rounded-full bg-primary p-2">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-12 text-center">
          <Upload className="mx-auto mb-4 h-16 w-16 text-slate" />
          <h4 className="mb-2 text-lg font-semibold text-charcoal">
            No Photos Yet
          </h4>
          <p className="text-sm text-slate">
            Take your first progress photos to track your transformation!
          </p>
        </div>
      )}
    </div>
  );
}

