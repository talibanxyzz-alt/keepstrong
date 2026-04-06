# Supabase Storage Setup Guide

This guide will help you set up the storage bucket for progress photos.

> **Quick Setup**: Instead of following this guide manually, you can run the SQL migration file:
> 1. Create the bucket (Step 1 below)
> 2. Run `supabase/migrations/004_storage_policies.sql` in SQL Editor

## Step 1: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `progress-photos`
   - **Public bucket**: ✅ **Yes** (checked)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`

5. Click **Create bucket**

## Step 2: Set Up Row Level Security (RLS)

After creating the bucket, you need to set up RLS policies so users can only access their own photos.

### Method 1: Using SQL Editor (Recommended)

Go to **SQL Editor** in Supabase Dashboard and run this SQL:

```sql
-- Policy 1: Allow users to upload their own photos
CREATE POLICY "Users can upload their own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow users to view their own photos
CREATE POLICY "Users can view their own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'progress-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Allow users to update their own photos
CREATE POLICY "Users can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'progress-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'progress-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'progress-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Method 2: Using Storage UI (Alternative)

If you prefer using the UI:

1. In the Storage section, click on the **Policies** tab
2. Find **storage.objects** table
3. Click **New policy**
4. For each policy, use the **"For full customization"** option (custom policy template)

**Policy 1: Upload (INSERT)**
- **Policy name**: `Users can upload their own photos`
- **Policy command**: `INSERT`
- **Target roles**: Check `authenticated`
- **USING expression**: Leave empty (not needed for INSERT)
- **WITH CHECK expression**:
```sql
bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy 2: View (SELECT)**
- **Policy name**: `Users can view their own photos`
- **Policy command**: `SELECT`
- **Target roles**: Check `authenticated`
- **USING expression**:
```sql
bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text
```
- **WITH CHECK expression**: Leave empty (not needed for SELECT)

**Policy 3: Update (UPDATE)**
- **Policy name**: `Users can update their own photos`
- **Policy command**: `UPDATE`
- **Target roles**: Check `authenticated`
- **USING expression**:
```sql
bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text
```
- **WITH CHECK expression**:
```sql
bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy 4: Delete (DELETE)**
- **Policy name**: `Users can delete their own photos`
- **Policy command**: `DELETE`
- **Target roles**: Check `authenticated`
- **USING expression**:
```sql
bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text
```
- **WITH CHECK expression**: Leave empty (not needed for DELETE)

## Step 3: Verify Setup

### Test Upload

1. Run your app: `npm run dev`
2. Log in with a test account
3. Navigate to the Progress page
4. Try uploading a photo
5. Check that:
   - Upload succeeds
   - Photo appears in the grid
   - Photo is viewable
   - Other users cannot see this photo

### Check Storage in Dashboard

1. Go to Supabase Dashboard → Storage → progress-photos
2. You should see a folder structure like:
   ```
   progress-photos/
   └── {user_id}/
       └── {date}/
           ├── front.jpg
           ├── back.jpg
           ├── side_left.jpg
           └── side_right.jpg
   ```

## File Structure

Photos are organized as:
- **Bucket**: `progress-photos`
- **Path**: `{user_id}/{date}/{angle}.jpg`

Example:
```
progress-photos/
└── 550e8400-e29b-41d4-a716-446655440000/
    ├── 2026-02-02/
    │   ├── front.jpg
    │   ├── back.jpg
    │   ├── side_left.jpg
    │   └── side_right.jpg
    └── 2026-02-09/
        ├── front.jpg
        └── back.jpg
```

## Troubleshooting

### Upload Fails with "new row violates row-level security policy"

- **Cause**: RLS policies not set up correctly
- **Fix**: Double-check the policy definitions above

### Images Don't Display

- **Cause**: Bucket is not public
- **Fix**: Edit bucket settings and enable "Public bucket"

### "Storage bucket not found"

- **Cause**: Bucket name mismatch
- **Fix**: Ensure bucket is named exactly `progress-photos`

### File Size Errors

- **Cause**: File exceeds 5MB limit
- **Fix**: Compress image before upload or increase bucket limit

## Security Notes

- ✅ Users can only access photos in their own folder (`{user_id}/`)
- ✅ File paths use authenticated user ID, preventing unauthorized access
- ✅ Public bucket allows image display without signed URLs
- ✅ RLS policies prevent cross-user data access
- ⚠️ Images are publicly accessible if someone knows the exact URL
- 💡 For production, consider implementing signed URLs for extra security

## Alternative: Private Bucket with Signed URLs

If you prefer a private bucket:

1. Create bucket with **Public bucket: No**
2. Update `PhotoUpload.tsx` to generate signed URLs:

```typescript
// Replace getPublicUrl with createSignedUrl
const { data: urlData } = await supabase.storage
  .from("progress-photos")
  .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year

const photoUrl = urlData.signedUrl;
```

This is more secure but requires URL regeneration when they expire.

