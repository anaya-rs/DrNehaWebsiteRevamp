#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────
#  One-shot AWS setup for Dr. Neha's media storage.
#  Paste this whole file into AWS CloudShell and press Enter.
#  Safe to re-run — existing resources are detected and skipped.
# ─────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ─── EDIT THESE TWO LINES ────────────────────────────────────────────────
# Bucket names must be globally unique across all of AWS. If the name is
# taken the script will tell you — just change it and re-run.
BUCKET_NAME="drneha-media-prod"

# Your live site's origin. This is what the browser will load images from.
# If you don't have a production domain yet, leave it and edit later — you
# can update CORS without recreating anything.
PROD_ORIGIN="https://www.drnehasood.in"
PROD_ORIGIN_APEX="https://drnehasood.in"
# ─────────────────────────────────────────────────────────────────────────

REGION="ap-south-1"
DEV_ORIGIN="http://localhost:5173"
IAM_USER="drneha-media-s3"
POLICY_NAME="DrNehaMediaS3Access"

echo ""
echo "▶ Creating bucket: $BUCKET_NAME ($REGION)"
aws s3api create-bucket \
  --bucket "$BUCKET_NAME" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION" \
  >/dev/null 2>&1 || echo "  (already exists — continuing)"

echo "▶ Locking down public access"
aws s3api put-public-access-block \
  --bucket "$BUCKET_NAME" \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
  >/dev/null

echo "▶ Disabling ACLs (bucket owner enforced)"
aws s3api put-bucket-ownership-controls \
  --bucket "$BUCKET_NAME" \
  --ownership-controls "Rules=[{ObjectOwnership=BucketOwnerEnforced}]" \
  >/dev/null

echo "▶ Enabling versioning (soft-delete protection)"
aws s3api put-bucket-versioning \
  --bucket "$BUCKET_NAME" \
  --versioning-configuration Status=Enabled \
  >/dev/null

echo "▶ Configuring CORS for browser access"
cat > /tmp/cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["$PROD_ORIGIN", "$PROD_ORIGIN_APEX", "$DEV_ORIGIN"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF
aws s3api put-bucket-cors \
  --bucket "$BUCKET_NAME" \
  --cors-configuration file:///tmp/cors.json

echo "▶ Creating IAM policy document"
cat > /tmp/policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketList",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::$BUCKET_NAME"
    },
    {
      "Sid": "ObjectRW",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

echo "▶ Creating IAM user: $IAM_USER"
aws iam create-user --user-name "$IAM_USER" \
  >/dev/null 2>&1 || echo "  (already exists — continuing)"

echo "▶ Attaching bucket-scoped policy"
aws iam put-user-policy \
  --user-name "$IAM_USER" \
  --policy-name "$POLICY_NAME" \
  --policy-document file:///tmp/policy.json

echo "▶ Minting access key"
KEY_OUT=$(aws iam create-access-key --user-name "$IAM_USER")
KEY_ID=$(echo "$KEY_OUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['AccessKey']['AccessKeyId'])")
KEY_SECRET=$(echo "$KEY_OUT" | python3 -c "import sys,json; print(json.load(sys.stdin)['AccessKey']['SecretAccessKey'])")

rm -f /tmp/cors.json /tmp/policy.json

cat <<EOF

═══════════════════════════════════════════════════════════════════════
  Done. Copy the block below into server/.env on your production host.
═══════════════════════════════════════════════════════════════════════

MEDIA_STORAGE=s3
AWS_REGION=$REGION
AWS_S3_BUCKET=$BUCKET_NAME
AWS_ACCESS_KEY_ID=$KEY_ID
AWS_SECRET_ACCESS_KEY=$KEY_SECRET
AWS_SIGNED_URL_TTL=3600

═══════════════════════════════════════════════════════════════════════
  ⚠  Save the secret access key NOW — AWS will not show it again.
      If you lose it, run:  aws iam create-access-key --user-name $IAM_USER
      (and delete the old one).
═══════════════════════════════════════════════════════════════════════
EOF
