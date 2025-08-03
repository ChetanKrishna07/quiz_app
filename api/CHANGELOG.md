# Quiz App API Changes - Document Scoring Refactor

## Overview
Refactored the scoring system to simplify the architecture by moving all topic scores to users only, while documents now store just topics.

## 🚀 Key Benefits
- ✅ **Single Source of Truth**: All scores now live with users only
- ✅ **Auto-Topic Management**: New topics automatically added to user scores  
- ✅ **Cleaner Architecture**: No duplicate scoring data between documents and users
- ✅ **Better Data Consistency**: Eliminates sync issues between document/user scores
- ✅ **Enhanced API Responses**: Documents return with merged user scores for topics

## What Changed

### Documents 
- **Before**: Documents stored both `topics` AND `topic_scores`
- **After**: Documents only store `topics` (list of strings)
- **Result**: Cleaner document structure, no duplicate scoring data

### Users
- **Before**: Users had `topic_scores` 
- **After**: Users still have `topic_scores` (unchanged)
- **Result**: Single source of truth for all scoring

### Document Retrieval
- **Before**: Documents returned with their own scores
- **After**: Documents return with `topics_with_scores` that merges:
  - Document topics + User scores for those topics
- **Result**: You get both the topics and the user's proficiency scores together

## New Features

### Auto-Add Topics to User Scores
- When creating/updating documents with new topics
- System automatically adds missing topics to user scores with default value `0.0`
- Creates user if they don't exist yet
- **Benefit**: No manual topic management needed

## API Changes

### ✅ **Updated Endpoints**

| Endpoint | Change | Description |
|----------|--------|-------------|
| `POST /documents` | Modified | Now takes `topics` instead of `topic_scores` |
| `GET /documents` | Enhanced | Returns `topics_with_scores` (topics + user scores) |
| `GET /documents/{id}` | Enhanced | Returns `topics_with_scores` (topics + user scores) |
| `PUT /documents/{id}/topics` | New | Update document topics (replaces `/scores` endpoint) |

### ❌ **Removed Endpoints**
- `PUT /documents/{id}/scores` - No longer needed (scores are in users only)

### 📊 **New Response Format Example**

**Before:**
```json
{
  "title": "Math Study Guide",
  "topics": ["Algebra", "Geometry"],
  "topic_scores": [{"Algebra": 8.5}, {"Geometry": 7.2}]
}
```

**After:**
```json
{
  "title": "Math Study Guide", 
  "topics": ["Algebra", "Geometry"],
  "topics_with_scores": [
    {"topic": "Algebra", "user_score": 8.5},
    {"topic": "Geometry", "user_score": 7.2}
  ]
}
```

## Database Migration
- **Documents**: Remove `topic_scores` field, keep `topics` field
- **Users**: No changes needed
- **Benefit**: Reduced data redundancy and single source of truth for scores

## Benefits
1. **Simplified Architecture**: No duplicate scoring data
2. **Single Source of Truth**: All scores live with users
3. **Auto-Topic Management**: New topics automatically added to user scores
4. **Better Data Consistency**: No sync issues between document/user scores
5. **Cleaner API**: Documents focused on content, users focused on scoring

---
*This refactor maintains all existing functionality while providing a cleaner, more maintainable architecture.*