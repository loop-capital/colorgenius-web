#!/usr/bin/env python3
"""Update Prisma schema for camera capture data model."""

import re

with open('dashboard/prisma/schema.prisma', 'r') as f:
    content = f.read()

# 1. Replace the Photo model (lines 354-392 area)
old_photo = """model Photo {
  id                String   @id @default(uuid())

  formulation_id  String?
  formulation       Formulation? @relation(fields: [formulation_id], references: [id], onDelete: Cascade)

  client_id         String?
  client            Client?  @relation(fields: [client_id], references: [id], onDelete: SetNull)

  stylist_id        String?
  stylist           Stylist? @relation(fields: [stylist_id], references: [id])

  photo_type        String   @db.VarChar(20)
  photo_label       String?  @db.VarChar(50)

  // Storage
  original_url      String
  processed_url     String?
  thumbnail_url     String?

  // Metadata
  file_size_bytes   Int?
  width             Int?
  height            Int?
  format            String?  @db.VarChar(10)

  // Analysis results (if processed)
  analysis_results  Json?

  processing_status String   @default("pending") @db.VarChar(20)
  community_posts  CommunityPost[] @relation("CommunityPostPhotos")

  created_at        DateTime @default(now())

  @@index([formulation_id])
  @@index([client_id])
  @@index([photo_type])
  @@index([processing_status])
}"""

new_photo = """model Photo {
  id                String   @id @default(uuid())

  // PhotoSession relation (camera capture)
  sessionId         String?
  session           PhotoSession? @relation("PhotoSessionPhotos", fields: [sessionId], references: [id])

  // Existing relations (backward compatibility)
  formulation_id    String?
  formulation       Formulation? @relation(fields: [formulation_id], references: [id], onDelete: Cascade)

  client_id         String?
  client            Client?  @relation(fields: [client_id], references: [id], onDelete: SetNull)

  stylist_id        String?
  stylist           Stylist? @relation(fields: [stylist_id], references: [id])

  // Enhanced for camera capture
  angle             String   @db.VarChar(20) // "roots", "mid", "ends"
  url               String   // Storage URL (S3/Cloudflare R2)
  analysisStatus    String   @default("pending") @db.VarChar(20) // "pending", "processing", "completed", "failed"
  colorProfile      Json?    // Structured color data per hair section angle

  // Storage
  original_url      String
  processed_url     String?
  thumbnail_url     String?

  // Metadata
  file_size_bytes   Int?
  width             Int?
  height            Int?
  format            String?  @db.VarChar(10)

  // Analysis results (if processed)
  analysis_results  Json?

  processing_status String   @default("pending") @db.VarChar(20)
  community_posts  CommunityPost[] @relation("CommunityPostPhotos")

  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  @@index([formulation_id])
  @@index([client_id])
  @@index([sessionId])
  @@index([angle])
  @@index([analysisStatus])
  @@index([processing_status])
}"""

content = content.replace(old_photo, new_photo)

# 2. Append PhotoSession and AnalysisResult models at the end
content += """

// =====================================================
// CAMERA CAPTURE - Photo Sessions & Analysis
// Added for ColorGenius PWA camera functionality
// =====================================================

model PhotoSession {
  id                  String   @id @default(uuid())
  clientId            String?
  client              Client?  @relation(fields: [clientId], references: [id])
  stylistId           String?
  stylist             Stylist? @relation(fields: [stylistId], references: [id])
  hairType            String   @db.VarChar(50)  // e.g., "4c", "3b", "2a"
  porosityLevel       String   @db.VarChar(20)  // "low", "medium", "high"
  condition           String   @db.VarChar(50)   // "virgin", "colored", "damaged", etc.
  lightingConditions  String   @db.VarChar(50)  // "natural", "fluorescent", "led", etc.
  status              String   @default("active") @db.VarChar(20) // "active", "completed", "cancelled"
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  photos              Photo[]          @relation("PhotoSessionPhotos")
  analysisResults     AnalysisResult[] @relation("SessionAnalysisResults")

  @@index([clientId])
  @@index([stylistId])
  @@index([status])
  @@index([createdAt])
}

model AnalysisResult {
  id              String   @id @default(uuid())
  photoId         String?
  photo           Photo?   @relation(fields: [photoId], references: [id])
  sessionId       String?
  session         PhotoSession? @relation("SessionAnalysisResults", fields: [sessionId], references: [id])

  // Core color analysis
  dominantColor     String   @db.VarChar(7)   // Hex format #RRGGBB
  dominantColorName String   @db.VarChar(50)   // e.g., "Dark Brown", "Light Auburn"
  rgbR              Int
  rgbG              Int
  rgbB              Int

  // Underlying pigment analysis
  underlyingPigment   String  @db.VarChar(50)   // "Red", "Orange", "Yellow", etc.
  warmthCoolnessRatio Decimal @default(1.0)     // >1 = warm, <1 = cool

  // Hair condition metrics
  porosityEstimate  String   @db.VarChar(20)   // "low", "medium", "high"
  damageLevel       String   @db.VarChar(20)   // "none", "minimal", "moderate", "severe"
  cuticleVisibility  Int      @default(0)       // 0-100 scale

  // Confidence and quality metrics
  confidenceScore   Int      @default(80)       // 0-100
  lightingQuality   String   @db.VarChar(20)   // "poor", "fair", "good", "excellent"
  angleAccuracy     String   @db.VarChar(20)   // "poor", "fair", "good", "excellent"

  // Processing metadata
  processedAt       DateTime @default(now())
  modelVersion      String   @db.VarChar(50)   // AI model version used

  @@index([photoId])
  @@index([sessionId])
  @@index([dominantColor])
  @@index([confidenceScore])
}
"""

with open('dashboard/prisma/schema.prisma', 'w') as f:
    f.write(content)

print("Schema updated successfully!")