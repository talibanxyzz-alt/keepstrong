# Landing Page Documentation

The marketing landing page for KeepStrong - designed to convert visitors into users.

## Overview

The landing page is optimized for people taking GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound) who want to preserve muscle while losing weight.

## Page Structure

### 1. Navigation (Fixed)
- **Logo**: KeepStrong with Activity icon
- **Links**: Pricing, Sign In, Start Free button
- **Sticky**: Remains visible on scroll with backdrop blur

### 2. Hero Section (Asymmetric Layout)
**Left Side:**
- Before/after comparison visual
- Placeholder grid showing transformation
- Social proof: "Sarah J. - 6 months on Ozempic"

**Right Side:**
- **Headline**: "Don't Lose Muscle on Ozempic" (7xl, bold)
- **Subheadline**: "Science-backed program to stay strong while you lose weight" (2xl)
- **CTA Button**: "Start Free Trial" (primary, with arrow)
- **Social Proof**: "Join 2,847 people preserving muscle"

### 3. Problem Section
**Goal**: Create urgency and awareness

**Content:**
- User testimonial quote (large, italic)
- Shocking stat: "40-60% of weight loss can be muscle"
- CTA: "Learn How to Prevent This"

**Design:**
- White card for testimonial
- Large numbers for stat (7xl font)
- Gradient background

### 4. Solution Section (3 Features)
**Goal**: Show the simple solution

**Features:**
1. **Track Protein**
   - Icon: Target (green)
   - Description: Hit daily protein target
   
2. **Train Smart**
   - Icon: Dumbbell (blue)
   - Description: Resistance training 3x/week
   
3. **Monitor Progress**
   - Icon: TrendingUp (amber)
   - Description: Track weight and strength

**Design:**
- 3-column grid (responsive)
- Hover effects with shadow
- Gradient backgrounds

### 5. How It Works (3 Steps)
**Goal**: Show simplicity

**Steps:**
1. Enter your stats → Personalized protein target
2. Track daily protein → Quick-add logging
3. Follow workout program → 30-45 min, 3x/week

**Design:**
- Numbered circles (1, 2, 3)
- White cards on gray background
- Final line: "That's it. Simple."

### 6. Social Proof (Before/After Grid)
**Goal**: Build trust with real results

**Content:**
- 4 transformation cards
- Each shows: Weight lost, Muscle preserved %
- User name and timeline

**Design:**
- 4-column grid (responsive to 2 cols mobile)
- Placeholder images (gray boxes)
- Green text for muscle preserved

### 7. Pricing Section
**Goal**: Present clear value proposition

**Content:**
- "Most Popular" badge
- $19/month pricing
- 7-day free trial
- 6 feature checkmarks
- No credit card required note

**Design:**
- Single centered card
- Large pricing ($19 in 6xl)
- Success checkmarks for features
- Primary CTA button

### 8. FAQ Section (Accordion)
**Goal**: Address objections

**Questions:**
1. Do I need to be on GLP-1?
2. Will this really help keep muscle?
3. I've never worked out before. Is this for me?
4. How much time per day?
5. What if I miss days?
6. Can I cancel anytime?

**Design:**
- Expandable cards
- ChevronDown/Up icons
- Clean gray background

### 9. Final CTA Section
**Goal**: Convert with urgency

**Content:**
- Big headline: "Stay Strong While You Lose Weight"
- Social proof: 2,847 people
- Large CTA: "Start Free Trial"
- Trust signals: 7-day trial, no CC, cancel anytime

**Design:**
- Full-width gradient (primary to blue)
- White text
- Oversized button with hover scale

### 10. Footer
**Content:**
- Logo and tagline
- Product links (Pricing, Sign Up, Sign In)
- Support links (Help, Privacy, Terms)
- Copyright notice

## SEO Optimization

### Meta Tags (in `page.tsx`)
```typescript
title: 'KeepStrong - Muscle Preservation for GLP-1 Users'
description: 'Science-backed program to preserve muscle while losing weight on Ozempic, Wegovy, Mounjaro'
keywords: ['GLP-1', 'Ozempic', 'Wegovy', 'muscle preservation', 'protein tracking']
```

### Open Graph
- Optimized for social sharing
- Twitter card support
- Custom OG image (to be added at `/public/og-image.jpg`)

### Structured Data (Recommended)
Consider adding JSON-LD for:
- Organization
- Product
- FAQPage

## Design System

### Colors
- **Primary**: `#0C4A6E` (ocean blue)
- **Success**: `#059669` (emerald)
- **Warning**: `#D97706` (amber)
- **Charcoal**: `#1F2937` (text)
- **Slate**: `#64748B` (secondary text)
- **Cloud**: `#F1F5F9` (backgrounds)

### Typography
- **Headlines**: 4xl to 7xl, bold
- **Body**: xl to 2xl for hero, lg for sections
- **Font**: Inter (system font stack)

### Spacing
- **Sections**: py-16 md:py-24 (64-96px)
- **Content max-width**: 7xl (1280px)
- **Cards**: p-6 to p-12

### Shadows
- **Cards**: shadow-lg to shadow-2xl
- **Hover**: shadow-xl with scale-105

## Responsive Design

### Breakpoints
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

### Mobile Optimizations
- Hero: Stack vertically, image first
- Features: 1 column
- Social proof: 2 columns
- FAQ: Full width accordions
- CTA buttons: Full width on mobile

## Performance

### Static Generation
- Page is fully static (no API calls)
- Fast initial load
- Can be exported for CDN

### Images (To Add)
Place these in `/public/`:
- `/og-image.jpg` - Social sharing (1200x630)
- `/hero-before-after.jpg` - Hero section
- `/transformation-1.jpg` through `/transformation-4.jpg`

### Optimization
- Client component only for interactivity (FAQ accordion)
- Server component for metadata
- Lazy load images (when added)

## A/B Testing Suggestions

### Headline Variations
- "Don't Lose Muscle on Ozempic"
- "Preserve Muscle While Losing Weight"
- "Stop Losing Muscle on GLP-1"

### CTA Variations
- "Start Free Trial"
- "Get Started Free"
- "Try KeepStrong Free"

### Social Proof Numbers
Update regularly:
- Current: 2,847 users
- Track and update monthly

## Conversion Optimization

### Above the Fold
- Clear value proposition
- Visual proof (before/after)
- Single clear CTA

### Trust Signals
- User count (2,847 people)
- Testimonials
- Money-back guarantee
- No credit card required

### Scarcity/Urgency
- "Join 2,847 people" (social proof)
- "7-day free trial" (limited time to try)
- "40-60% muscle loss" (fear of missing out)

## Analytics Tracking (To Implement)

### Key Events
- Page view
- CTA clicks (each section)
- FAQ opens
- Sign up initiated
- Trial started

### Goals
- Primary: Sign ups
- Secondary: Pricing page views
- Tertiary: FAQ engagement

## Future Enhancements

### Phase 2
- [ ] Real transformation photos
- [ ] Video testimonials
- [ ] Interactive BMI/protein calculator
- [ ] Live chat widget
- [ ] Blog content integration

### Phase 3
- [ ] A/B testing framework
- [ ] Personalized headlines (based on referring medication)
- [ ] Exit-intent popup
- [ ] Retargeting pixel
- [ ] Email capture for newsletter

## Content Updates

### Regular Updates (Monthly)
- [ ] User count (2,847 → update)
- [ ] Testimonials (rotate new ones)
- [ ] Transformation photos (add new success stories)

### Seasonal Updates (Quarterly)
- [ ] Hero copy (test variations)
- [ ] Pricing (if changed)
- [ ] Feature list (as product evolves)

## Technical Notes

### Files
- `/app/page.tsx` - Metadata and wrapper
- `/app/LandingPage.tsx` - Main landing page component

### Dependencies
- No external libraries (uses Lucide icons from existing setup)
- Pure CSS (Tailwind)
- Minimal JavaScript (only for FAQ accordion)

### Deployment
```bash
# Test locally
npm run dev

# Build for production
npm run build

# Export as static (optional)
npm run build && npm run export
```

## Maintenance

### Weekly
- [ ] Check broken links
- [ ] Monitor conversion rate
- [ ] Review analytics

### Monthly
- [ ] Update user count
- [ ] Add new testimonials
- [ ] Update FAQ based on support questions

### Quarterly
- [ ] Refresh imagery
- [ ] Update copy based on A/B tests
- [ ] Review SEO rankings

