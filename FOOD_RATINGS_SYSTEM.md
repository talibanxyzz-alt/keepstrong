# 🍽️ Food Tolerance Rating System

## Overview

A **community-driven food rating system** designed specifically for GLP-1 medication users to share which foods they tolerate well (or poorly) while on medications like Ozempic, Wegovy, Mounjaro, etc.

---

## 🎯 Purpose

GLP-1 medications often cause:
- **Nausea** from fatty or greasy foods
- **Early satiety** (feeling full quickly)
- **Food aversions** (foods they once loved become unappealing)
- **Digestive sensitivity**

This system helps users:
- ✅ **Discover** which foods are well-tolerated by others
- ✅ **Avoid** foods that commonly cause issues
- ✅ **Share** their experiences to help the community
- ✅ **Track** their personal food tolerance over time

---

## 📊 Database Schema

### Table: `food_tolerance_votes`

```sql
CREATE TABLE food_tolerance_votes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  food_name TEXT NOT NULL,
  tolerated BOOLEAN NOT NULL,  -- true = 👍, false = 👎
  notes TEXT,                   -- Optional user notes
  voted_at TIMESTAMP,
  
  UNIQUE(user_id, food_name)    -- One vote per user per food
);
```

**Key Features:**
- **One vote per food:** Users can only vote once per food (but can update)
- **Notes field:** Optional context ("Made me nauseous", "Perfect!")
- **Timestamped:** Track when votes were submitted
- **Cascade delete:** Votes deleted when user is deleted

### View: `food_tolerance_ratings`

```sql
CREATE VIEW food_tolerance_ratings AS
SELECT 
  food_name,
  COUNT(*) as total_votes,
  COUNT(*) FILTER (WHERE tolerated = true) as upvotes,
  COUNT(*) FILTER (WHERE tolerated = false) as downvotes,
  ROUND((upvotes::NUMERIC / COUNT(*)::NUMERIC) * 100) as tolerance_percentage,
  MAX(voted_at) as last_voted_at
FROM food_tolerance_votes
GROUP BY food_name
HAVING COUNT(*) >= 3;  -- Minimum 3 votes for statistical significance
```

**Key Features:**
- **Aggregated statistics:** Calculates percentages automatically
- **Minimum threshold:** Only shows foods with 3+ votes
- **Sorted by relevance:** Most voted foods appear first

### Indexes

```sql
-- Fast food name lookups
CREATE INDEX idx_food_tolerance_votes_food_name 
  ON food_tolerance_votes(food_name);

-- Fast user lookups
CREATE INDEX idx_food_tolerance_votes_user_id 
  ON food_tolerance_votes(user_id);

-- Recent votes
CREATE INDEX idx_food_tolerance_votes_voted_at 
  ON food_tolerance_votes(voted_at DESC);
```

---

## 🔒 Security (RLS Policies)

### Policy 1: Public Read
```sql
-- All users can see all votes (community benefit)
CREATE POLICY "Food votes are publicly readable"
  ON food_tolerance_votes
  FOR SELECT
  USING (true);
```

### Policy 2: Insert Own Votes
```sql
-- Users can only vote as themselves
CREATE POLICY "Users can vote on foods"
  ON food_tolerance_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Policy 3: Update Own Votes
```sql
-- Users can change their mind
CREATE POLICY "Users can change their votes"
  ON food_tolerance_votes
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### Policy 4: Delete Own Votes
```sql
-- Users can remove their votes
CREATE POLICY "Users can delete their votes"
  ON food_tolerance_votes
  FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 🌱 Seed Data (13 Foods)

Based on **medical guidance** from:
- UCHealth GLP-1 Nutrition Guide
- Cleveland Clinic Ozempic Food Guidelines
- Mayo Clinic GLP-1 Dietary Recommendations

### Well-Tolerated Foods (80-100%)

| Food | Votes | Tolerance | Why Well-Tolerated |
|------|-------|-----------|-------------------|
| **Scrambled Eggs** | 5/5 | 100% | Soft, high protein, low fat |
| **Protein Shake** | 5/5 | 100% | Liquid, easy to sip slowly |
| **Salmon** | 4/4 | 100% | Soft, flaky, omega-3 rich |
| **Greek Yogurt** | 4/5 | 80% | High protein, smooth, probiotic |
| **Chicken Breast (grilled)** | 4/5 | 80% | Lean protein (avoid if dry) |
| **Cottage Cheese** | 3/4 | 75% | High protein, no chewing |

### Moderately Tolerated Foods (40-60%)

| Food | Votes | Tolerance | Notes |
|------|-------|-----------|-------|
| **Turkey Sandwich** | 2/4 | 50% | Use thin bread, can feel heavy |
| **Protein Bar** | 2/4 | 50% | Convenient but dense |

### Poorly Tolerated Foods (0-25%)

| Food | Votes | Tolerance | Why Problematic |
|------|-------|-----------|----------------|
| **Fried Chicken** | 1/5 | 20% | High fat, greasy, causes nausea |
| **Steak** | 1/4 | 25% | Tough to chew, high fat cuts |
| **Pizza** | 1/4 | 25% | Greasy cheese, heavy carbs |
| **Fast Food Burger** | 0/4 | 0% | High fat, processed, heavy |
| **Ice Cream** | 0/3 | 0% | High fat, dairy, sugar |

---

## 🛠️ Utility Functions

### Location: `/lib/utils/food-ratings.ts`

#### Core Functions

```typescript
// Fetch all ratings
getAllFoodRatings(supabase): Promise<FoodRating[]>

// Get top-rated foods
getTopRatedFoods(supabase, limit): Promise<FoodRating[]>

// Get poorly-rated foods
getPoorlyRatedFoods(supabase, limit): Promise<FoodRating[]>

// Search by name
searchFoodRatings(supabase, searchTerm): Promise<FoodRating[]>

// Get specific food rating
getFoodRating(supabase, foodName): Promise<FoodRating | null>
```

#### User Voting Functions

```typescript
// Check if user voted
hasUserVoted(supabase, userId, foodName): Promise<boolean>

// Get user's vote
getUserVote(supabase, userId, foodName): Promise<FoodVote | null>

// Submit/update vote
submitVote(supabase, userId, foodName, tolerated, notes?): Promise<Result>

// Delete vote
deleteVote(supabase, userId, foodName): Promise<Result>

// Get all user votes
getUserVotes(supabase, userId): Promise<FoodVote[]>

// Get user vote statistics
getUserVoteStats(supabase, userId): Promise<Stats>
```

#### Recommendation Functions

```typescript
// Get foods user should try (highly rated, not yet voted)
getRecommendedFoods(supabase, userId, limit): Promise<FoodRating[]>
```

#### Display Helper Functions

```typescript
// Get tolerance level ('excellent' | 'good' | 'moderate' | 'poor' | 'avoid')
getToleranceLevel(percentage): ToleranceLevel

// Get color class ('text-green-600 bg-green-50')
getToleranceColor(level): string

// Get icon ('👍👍', '👍', '🤷', '👎', '🚫')
getToleranceIcon(level): string

// Get label ('Excellent Tolerance')
getToleranceLabel(level): string

// Format percentage ('85%')
formatTolerancePercentage(percentage): string

// Get vote distribution ('5 👍  •  1 👎  •  6 total')
getVoteDistributionText(rating): string
```

---

## 🎨 UI Component Ideas

### 1. Food Directory Page (`/app/foods/page.tsx`)

```
┌────────────────────────────────────────────────┐
│ Food Tolerance Guide                           │
│ [Search: "chicken"                      ] 🔍   │
│                                                │
│ Tabs: [All] [Well-Tolerated] [Avoid]          │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ 👍👍 Scrambled Eggs            100%      │  │
│ │ 5 votes  •  Community favorite           │  │
│ │ [Tolerated ✓] [Not Tolerated] [Details] │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ 👍 Greek Yogurt                  80%     │  │
│ │ 5 votes  •  4 👍  1 👎                   │  │
│ │ [Tolerated] [Not Tolerated ✓] [Details] │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ 🚫 Fast Food Burger               0%     │  │
│ │ 4 votes  •  Avoid on GLP-1               │  │
│ │ [Tolerated] [Not Tolerated ✓] [Details] │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### 2. Food Detail Modal

```
┌────────────────────────────────────────────────┐
│ Scrambled Eggs                         [✕]    │
│                                                │
│ 👍👍 100% Well-Tolerated                       │
│ 5 votes  •  5 👍  0 👎                         │
│                                                │
│ Why it works:                                  │
│ • Soft texture, easy to swallow                │
│ • High protein (12g per 2 eggs)                │
│ • Low fat when cooked with minimal oil         │
│ • Recommended by GLP-1 dietitians              │
│                                                │
│ Tips:                                          │
│ • Cook slowly on low heat                      │
│ • Add a splash of milk for creaminess          │
│ • Avoid overcooking (rubbery = harder)         │
│                                                │
│ Your Experience:                               │
│ [👍 Tolerated] [👎 Not Tolerated]             │
│                                                │
│ Optional notes:                                │
│ [________________________]                     │
│                                                │
│ [Submit Vote]                                  │
└────────────────────────────────────────────────┘
```

### 3. Inline Rating (Protein Logger)

```
┌────────────────────────────────────────────────┐
│ Log Protein                                    │
│                                                │
│ Food: [Scrambled Eggs           ] 🔽          │
│       👍👍 100% well-tolerated (5 votes)       │
│                                                │
│ Protein: [12] g                                │
│                                                │
│ How did you tolerate this?                     │
│ [👍 Well] [👎 Poorly] [Skip]                  │
│                                                │
│ [Log Meal]                                     │
└────────────────────────────────────────────────┘
```

### 4. Recommended Foods Widget (Dashboard)

```
┌────────────────────────────────────────────────┐
│ 💡 Try These Foods                             │
│ Based on community ratings                     │
│                                                │
│ • Protein Shake (100% tolerance, 5 votes)      │
│ • Salmon (100% tolerance, 4 votes)             │
│ • Greek Yogurt (80% tolerance, 5 votes)        │
│                                                │
│ [View All Foods →]                             │
└────────────────────────────────────────────────┘
```

### 5. User's Food Journal (`/app/foods/my-votes`)

```
┌────────────────────────────────────────────────┐
│ My Food Votes                                  │
│                                                │
│ Your voting stats: 12 foods rated              │
│ 8 👍  •  4 👎                                  │
│                                                │
│ Foods You Tolerate Well:                       │
│ • Scrambled Eggs (voted 2 days ago)            │
│ • Protein Shake (voted 5 days ago)             │
│ • Chicken Breast (voted 1 week ago)            │
│                                                │
│ Foods You Avoid:                               │
│ • Fried Chicken (made me nauseous)             │
│ • Fast Food Burger (too greasy)                │
│                                                │
│ [Rate More Foods]                              │
└────────────────────────────────────────────────┘
```

---

## 📱 Integration Points

### 1. Protein Logger
- Show rating badge next to food name
- Prompt to vote after logging ("How did you tolerate this?")

### 2. Dashboard
- Widget: "Foods to try" (recommended)
- Widget: "Foods to avoid" (poorly rated)

### 3. Settings
- Toggle: "Show food tolerance ratings" (on/off)
- Link: "Manage my food votes"

### 4. Navigation
- New tab: "Foods" (between "Food" and "Lift")
- Badge: Show if user has <5 votes (encourage participation)

---

## 🎯 Tolerance Levels

| Percentage | Level | Color | Icon | Description |
|-----------|-------|-------|------|-------------|
| 80-100% | Excellent | Green | 👍👍 | Community favorite |
| 60-79% | Good | Light Green | 👍 | Well-tolerated |
| 40-59% | Moderate | Yellow | 🤷 | Mixed results |
| 20-39% | Poor | Orange | 👎 | Often problematic |
| 0-19% | Avoid | Red | 🚫 | Commonly causes issues |

---

## 🧪 Testing Scenarios

### Scenario 1: New User Discovers Foods
```
User logs in → Sees "Foods" tab → Browses ratings
Finds "Protein Shake" (100% tolerance)
Clicks "Tolerated" → Vote recorded
Dashboard now shows personalized recommendations
```

### Scenario 2: User Logs Meal + Votes
```
User logs "Fried Chicken" → 25g protein
App shows: "⚠️ Only 20% tolerate this food"
User clicks "👎 Poorly Tolerated"
Adds note: "Made me feel sick"
Vote saved, rating updated to 0/5 = 0%
```

### Scenario 3: User Changes Mind
```
User initially voted 👍 on "Steak"
After second try, feels differently
Goes to My Votes → Clicks "Steak"
Changes vote to 👎
Rating updates automatically
```

### Scenario 4: Search for Alternatives
```
User searches "protein"
Sees: Protein Shake (100%), Protein Bar (50%)
Avoids bar, tries shake
Logs shake, votes 👍
Gets more shake recommendations
```

---

## 📊 Analytics Queries

### Most Controversial Foods (50/50 split)
```sql
SELECT food_name, upvotes, downvotes, tolerance_percentage
FROM food_tolerance_ratings
WHERE tolerance_percentage BETWEEN 40 AND 60
ORDER BY total_votes DESC;
```

### Foods Needing More Votes
```sql
SELECT food_name, COUNT(*) as votes
FROM food_tolerance_votes
GROUP BY food_name
HAVING COUNT(*) < 3
ORDER BY votes DESC;
```

### User Participation Rate
```sql
SELECT 
  COUNT(DISTINCT user_id) as active_voters,
  COUNT(*) as total_votes,
  AVG(votes_per_user) as avg_votes_per_user
FROM (
  SELECT user_id, COUNT(*) as votes_per_user
  FROM food_tolerance_votes
  GROUP BY user_id
) subquery;
```

### Trending Foods (Most Votes Last 7 Days)
```sql
SELECT food_name, COUNT(*) as recent_votes
FROM food_tolerance_votes
WHERE voted_at >= NOW() - INTERVAL '7 days'
GROUP BY food_name
ORDER BY recent_votes DESC
LIMIT 10;
```

---

## 🚀 Migration Instructions

### 1. Run Migration
```bash
# From project root
supabase migration up

# Or manually in Supabase Dashboard:
# Copy contents of /supabase/migrations/008_food_ratings.sql
# Paste into SQL Editor
# Run
```

### 2. Verify Tables
```sql
-- Check table exists
SELECT * FROM food_tolerance_votes LIMIT 5;

-- Check view works
SELECT * FROM food_tolerance_ratings;

-- Should see 13 seed foods with ratings
```

### 3. Test Voting
```sql
-- Insert test vote
INSERT INTO food_tolerance_votes (user_id, food_name, tolerated)
VALUES ('YOUR_USER_ID', 'Test Food', true);

-- Check rating updated
SELECT * FROM food_tolerance_ratings WHERE food_name = 'Test Food';
```

---

## ✅ Implementation Checklist

### Database:
- [x] Migration file created
- [x] Table schema defined
- [x] View created
- [x] Indexes added
- [x] RLS policies set
- [x] Seed data inserted
- [ ] Migration run in database

### Utilities:
- [x] Core query functions
- [x] Voting functions
- [x] Display helpers
- [x] Recommendation logic

### UI Components (TODO):
- [ ] Food directory page
- [ ] Food detail modal
- [ ] Voting buttons
- [ ] Rating badges
- [ ] Search functionality
- [ ] My votes page
- [ ] Recommended foods widget

### Integrations (TODO):
- [ ] Add to protein logger
- [ ] Add to dashboard
- [ ] Add to navigation
- [ ] Add to settings

### Testing (TODO):
- [ ] Unit tests for utilities
- [ ] Integration tests for voting
- [ ] E2E tests for UI
- [ ] Load testing (many votes)

---

## 🎉 Success Metrics

### Engagement:
- **Target:** 50% of users vote on at least 3 foods within first week
- **Measure:** `SELECT COUNT(DISTINCT user_id) FROM food_tolerance_votes`

### Data Quality:
- **Target:** 50+ foods with 10+ votes each within 3 months
- **Measure:** `SELECT COUNT(*) FROM food_tolerance_ratings WHERE total_votes >= 10`

### Community Growth:
- **Target:** 100+ total votes per week
- **Measure:** Weekly vote count trend

### User Satisfaction:
- **Target:** Users report "helpful" in feedback
- **Measure:** Survey + retention rate

---

## 🔮 Future Enhancements

### Phase 2:
- [ ] AI-powered food suggestions based on personal history
- [ ] Filters: vegetarian, vegan, gluten-free, dairy-free
- [ ] Food categories: breakfast, lunch, dinner, snacks
- [ ] Photo uploads for foods
- [ ] Nutrition info integration

### Phase 3:
- [ ] Correlation analysis (tolerance vs. GLP-1 dose)
- [ ] Personalized recommendations based on medication
- [ ] Social features (follow users with similar tolerance)
- [ ] Export food journal as PDF

### Phase 4:
- [ ] Integration with meal planning
- [ ] Recipe suggestions using well-tolerated foods
- [ ] Grocery list generation
- [ ] Restaurant menu ratings

---

## 📖 Medical References

1. **UCHealth:** "GLP-1 Nutrition Guide for Weight Loss"
2. **Cleveland Clinic:** "What to Eat While Taking Ozempic"
3. **Mayo Clinic:** "GLP-1 Agonists: Food and Nutrition Guidelines"
4. **American Society for Nutrition:** "Dietary Patterns and GLP-1 Medications"

---

## ✅ Status

**Database:** ✅ Ready to migrate  
**Utilities:** ✅ Complete  
**Documentation:** ✅ Complete  
**UI:** ⏳ Not started  
**Testing:** ⏳ Pending migration  

---

**Ready to migrate!** Run the migration and start building the UI components.

