-- Add S3 storage fields to Media. Existing rows default to storage='local'
-- and keep their filesystem-backed originalUrl/thumbnailUrl until migrated.

ALTER TABLE "Media" ADD COLUMN "originalKey"  TEXT;
ALTER TABLE "Media" ADD COLUMN "thumbnailKey" TEXT;
ALTER TABLE "Media" ADD COLUMN "storage"      TEXT NOT NULL DEFAULT 'local';
