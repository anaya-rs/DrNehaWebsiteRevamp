# S3 Media Storage Setup

This project can store gallery images, testimonial videos, and other uploaded
media in AWS S3 instead of on the server's local disk. Running on S3 is
recommended for production — it survives server restarts, is easier to back
up, and keeps large binaries out of your deployment artifacts.

Local-disk storage remains the default so nothing changes for development
setups. Flipping a single env var (`MEDIA_STORAGE=s3`) switches the whole
media pipeline over.

## How it works

Uploads go into a **private** S3 bucket. When the site needs to show an image
or video, the server mints a short-lived signed URL (default TTL: 1 hour) and
returns that to the browser. The browser then fetches the asset directly from
S3. This means:

- Nothing in the bucket is world-readable — no public bucket policies to
  manage.
- The same code path handles public gallery photos and private testimonial
  videos. There's no split between "public" and "private" prefixes to
  maintain.
- The signed-URL TTL is configurable via `AWS_SIGNED_URL_TTL`. The URL is
  re-minted on every read, so expiring URLs aren't user-visible — they just
  need to last long enough for the page to load and for the browser to fetch
  the asset.

The controller only touches S3 when `MEDIA_STORAGE=s3`. Rows created before
the switch keep their `storage='local'` value and continue to resolve from
the filesystem, so a migration can proceed row-by-row without downtime.

## 1. Create the S3 bucket

In the AWS console:

1. Go to **S3** → **Create bucket**.
2. Region: **Asia Pacific (Mumbai) — `ap-south-1`** (closest to the
   practice's users; match this to `AWS_REGION` below).
3. Keep **Block all public access** enabled. Uploads stay private and are
   served via signed URLs.
4. Object Ownership: **Bucket owner enforced** (ACLs disabled).
5. Versioning: enable it if you want soft-delete protection (recommended).
6. Name: e.g. `drneha-media` — make a note of this for `AWS_S3_BUCKET`.

### CORS

If the browser will fetch media from S3 directly (it will — that's the whole
point of signed URLs), add a CORS rule on the bucket:

```
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": ["https://your-production-domain", "http://localhost:5173"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Replace `your-production-domain` with the live site's origin.

## 2. Create an IAM user for the server

The server authenticates to S3 with an access key pair scoped **only** to
this bucket — never use console credentials for the server.

1. Go to **IAM** → **Users** → **Create user**.
2. Name: e.g. `drneha-media-s3`.
3. Do **not** give this user console access.
4. Attach a custom inline policy (below). Replace `drneha-media` with your
   bucket name.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketList",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::drneha-media"
    },
    {
      "Sid": "ObjectRW",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::drneha-media/*"
    }
  ]
}
```

5. Once the user exists, go to **Security credentials** → **Create access
   key** → **Application running outside AWS**.
6. Download the key ID and secret. These go into `.env` and should never be
   committed to git.

## 3. Configure the server

Edit `server/.env` (or your deployment's env):

```
MEDIA_STORAGE=s3
AWS_REGION=ap-south-1
AWS_S3_BUCKET=drneha-media
AWS_ACCESS_KEY_ID=AKIA…
AWS_SECRET_ACCESS_KEY=…
# Optional: scope all keys under a prefix if the bucket is shared
AWS_S3_PREFIX=drneha/
# How long (seconds) signed URLs stay valid. 3600 = 1 hour.
AWS_SIGNED_URL_TTL=3600
```

See `.env.example` for the full list.

## 4. Apply the database migration

```
cd server
npx prisma migrate deploy   # production
# or, in development:
npx prisma migrate dev
npx prisma generate
```

This adds three columns to `Media`:

- `originalKey` — S3 object key for the original file (nullable, only set
  for `storage='s3'` rows).
- `thumbnailKey` — S3 object key for the thumbnail (shares the original key
  for videos).
- `storage` — `'local'` or `'s3'`. Defaults to `'local'` so existing rows
  keep working.

## 5. Migrate existing local media to S3 (optional)

If the server has been running with local storage and there's media on disk,
run the one-off migration script:

```
cd server
# Dry run first — shows what would happen without touching S3 or the DB:
npx ts-node prisma/migrate-to-s3.ts --dry-run

# For real:
npx ts-node prisma/migrate-to-s3.ts

# If you want to keep the local files on disk as backup:
npx ts-node prisma/migrate-to-s3.ts --keep-local
```

The script:

- Walks every `Media` row where `storage='local'`.
- Uploads the original and thumbnail to S3 using the same key pattern new
  uploads use.
- Flips the row to `storage='s3'` and fills in the keys.
- Deletes the local files unless `--keep-local` is passed.
- Is idempotent — re-running it skips rows that are already on S3, and
  checks `HEAD` on the bucket before re-uploading.

Back up the DB before running it in production.

## 6. Verify

After the server restarts with `MEDIA_STORAGE=s3`:

1. Upload a new image through the admin gallery. Check the bucket — there
   should be a `media/<name>/original.jpg` and `media/<name>/thumbnail.jpg`
   pair.
2. Load the public gallery page. Images should render from an
   `…s3.ap-south-1.amazonaws.com/…?X-Amz-Signature=…` URL.
3. Delete a media item from admin. Confirm both keys disappear from the
   bucket.

## Rolling back

Set `MEDIA_STORAGE=local` and restart. Any `storage='s3'` rows will keep
trying to sign S3 URLs (which requires S3 credentials), so a full rollback
means either keeping the S3 credentials configured or reverse-migrating
rows back to the local filesystem — easiest is to leave the feature flag
on and simply stop uploading new media if you need to pause.
