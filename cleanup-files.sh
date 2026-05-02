#!/bin/bash
# File cleanup script for Che workspace
# Implements file lifecycle management policies

WORKSPACE="/home/jason/.openclaw/workspaces/che"
LOG_FILE="$WORKSPACE/temp/logs/cleanup-$(date +%Y-%m-%d).log"

echo "=== File Cleanup Started: $(date) ===" >> "$LOG_FILE"

# Research file lifecycle
echo "Processing research files..." >> "$LOG_FILE"

# Move completed research to archive (older than 30 days)
find "$WORKSPACE/research/completed" -name "*.md" -type f -mtime +30 -exec mv {} "$WORKSPACE/research/archive/" \; -exec echo "Moved to archive: {}" >> "$LOG_FILE" \;

# Delete archived research (older than 90 days)
find "$WORKSPACE/research/archive" -name "*.md" -type f -mtime +90 -exec rm {} \; -exec echo "Deleted from archive: {}" >> "$LOG_FILE" \;

# Memory file lifecycle
echo "Processing memory files..." >> "$LOG_FILE"

# Archive old daily logs (older than 90 days)
find "$WORKSPACE/memory/daily" -name "2026-*.md" -type f -mtime +90 -exec mv {} "$WORKSPACE/memory/long-term/" \; -exec echo "Archived to long-term: {}" >> "$LOG_FILE" \;

# Delete temporary memory files (older than 7 days)
find "$WORKSPACE/memory/temp" -name "*.md" -type f -mtime +7 -exec rm {} \; -exec echo "Deleted temp memory: {}" >> "$LOG_FILE" \;

# Temporary file lifecycle
echo "Processing temporary files..." >> "$LOG_FILE"

# Delete scratch files (older than 1 day)
find "$WORKSPACE/temp/scratch" -type f -mtime +1 -exec rm {} \; -exec echo "Deleted scratch: {}" >> "$LOG_FILE" \;

# Delete cache files (older than 30 days)
find "$WORKSPACE/temp/cache" -type f -mtime +30 -exec rm {} \; -exec echo "Deleted cache: {}" >> "$LOG_FILE" \;

# Note: Log files are kept for 90 days, so no cleanup needed here

echo "=== File Cleanup Completed: $(date) ===" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
