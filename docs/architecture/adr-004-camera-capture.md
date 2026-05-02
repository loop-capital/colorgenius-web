# ADR-004: Camera Capture Data Model & API Contract

## Status
Proposed

## Context
ColorGenius PWA camera capture needs backend architecture for image processing and hair analysis. The system must handle photo sessions with multiple angles (roots, mid, ends), trigger AI analysis, and generate accurate formulations.

## Decision
We will implement a comprehensive data model and API contract for camera capture functionality including:
1. PhotoSession and Photo tables with proper relationships
2. AnalysisResult table for detailed color science data
3. RESTful API endpoints for session management, photo upload, and analysis
4. Color profile JSON structure for consistent data exchange
5. Performance specifications for salon use

## Consequences

### Positive
- Clear separation of concerns between session management and photo analysis
- Scalable architecture supporting concurrent users
- Standardized API contract for frontend integration
- Extensible design for future enhancements
- Performance targets suitable for salon environment

### Negative
- Increased complexity in initial implementation
- Requires coordination between backend and frontend teams
- Additional storage requirements for processed images and analysis results

## Implementation Plan

### 1. Database Schema Updates
Add the following models to Prisma schema:
- PhotoSession
- Photo (enhanced from existing)
- AnalysisResult

### 2. API Endpoints
Implement the following REST endpoints:
- POST /api/sessions - Create photo session
- POST /api/photos/upload - Upload photo (presigned URL)
- POST /api/photos/:id/analyze - Trigger AI analysis
- GET /api/photos/:id/analysis - Get analysis results
- POST /api/sessions/:id/complete - Finalize session, generate formulation

### 3. Color Extraction Pipeline
Define standardized JSON structures for:
- Color profile data per hair section
- Analysis results including dominant color, underlying pigment, porosity, damage
- Confidence scoring mechanisms

### 4. Performance Specifications
- Image upload: <3s for 2MB photo
- Analysis response: <5s for complete 3-angle session  
- Concurrent users: 20 (Tiche's team at Pleij Salon)

## Related Documents
- SOUL.md - ColorGenius platform overview
- Existing Prisma schema in dashboard/prisma/schema.prisma
- Frontend component requirements for colorgenius-dev

## Next Steps
1. Update Prisma schema with new models
2. Generate and apply database migrations
3. Implement API route handlers
4. Create frontend types and hooks for integration
5. Set up image processing pipeline (S3/R2 + AI service)
6. Write unit and integration tests