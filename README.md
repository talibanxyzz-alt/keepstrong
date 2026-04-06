# GLP-1 Fitness Tracker

A comprehensive fitness tracking application designed for people using GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound) to support their weight loss and muscle-building journey.

## 🎯 Features

### Core Features
- **Protein Tracking**: Log meals and track daily protein intake with quick-add buttons
- **Workout Programs**: Structured workout programs (Beginner, Intermediate, Advanced)
- **Active Workout Sessions**: Real-time workout tracking with exercise sets, rest timers
- **Progress Tracking**: Weight logs, progress photos, strength gains, weekly trends
- **GLP-1 Support**: Track medication type, start date, and dose
- **Settings**: Manage profile, protein targets, preferences

### Premium Features
- AI-powered meal suggestions
- Custom workout builder
- Video exercise library
- Body composition tracking
- Personal coaching (monthly)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **Storage**: Supabase Storage (progress photos)
- **Payments**: Stripe (subscriptions)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd glp_1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (use test keys for development)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CORE_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run database migrations in Supabase SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_add_current_program.sql`
   - `supabase/migrations/003_add_subscription_fields.sql`

5. Set up Supabase Storage:
   - Create bucket `progress-photos` (public, 5MB limit)
   - Run `supabase/migrations/004_storage_policies.sql` in SQL Editor
   - See `docs/STORAGE_SETUP.md` for detailed instructions

6. Seed workout programs:
```bash
npm run seed:workouts
```

7. Start the development server:
```bash
npm run dev
```

8. (Optional) Start Stripe webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Visit http://localhost:3000

## ⚡ Performance Optimization

This app is optimized for speed and efficiency:

- **🖼️ Image Optimization**: Automatic WebP/AVIF conversion, lazy loading, and compression
- **⚡ Code Splitting**: Dynamic imports for charts and heavy components
- **🔄 Smart Caching**: SWR for data fetching with stale-while-revalidate strategy
- **🗄️ Database Indexes**: Optimized queries with proper indexing
- **📊 Performance Monitoring**: Real-time tracking of Core Web Vitals

See [Performance Documentation](docs/PERFORMANCE_OPTIMIZATION.md) for full details.

### Performance Targets
- **Lighthouse Score**: >90
- **Time to Interactive**: <3s
- **First Contentful Paint**: <1.5s
- **Bundle Size**: <200KB (main chunk)

### Quick Performance Commands
```bash
# Run Lighthouse audit
npm run lighthouse

# Analyze bundle size
npm run analyze

# Apply database indexes
# Run in Supabase SQL Editor: supabase/migrations/005_performance_indexes.sql
```

## 📖 Documentation

### Performance
- **[Performance Optimization Guide](docs/PERFORMANCE_OPTIMIZATION.md)**: Complete performance optimization documentation
- **[Performance Quick Reference](docs/PERFORMANCE_QUICK_REFERENCE.md)**: Quick commands and code snippets
- **[Performance Examples](docs/PERFORMANCE_EXAMPLES.md)**: Practical implementation examples
- **[Performance Checklist](docs/PERFORMANCE_CHECKLIST.md)**: Pre-deployment checklist

### Stripe Integration
- **[Stripe Setup Guide](docs/STRIPE_SETUP.md)**: Complete guide to setting up Stripe subscriptions
- **[Stripe Usage Examples](docs/STRIPE_USAGE_EXAMPLES.md)**: Code examples for subscription features
- **[Stripe Quick Reference](docs/STRIPE_QUICK_REFERENCE.md)**: Quick reference for common tasks
- **[Storage Setup](docs/STORAGE_SETUP.md)**: Supabase Storage configuration for progress photos
- **[Seed Scripts](scripts/README.md)**: Documentation for database seeding scripts
- **[Skeleton Components](components/ui/SKELETONS_README.md)**: Loading state components
- **[Toast System](components/ui/TOAST_README.md)**: Custom toast notifications
- **[Empty States](components/ui/EMPTY_STATES_README.md)**: Empty state components

## 🏗️ Project Structure

```
/app
  /api
    /stripe          # Stripe API routes
  /auth              # Login/signup pages
  /dashboard         # Main dashboard
    /protein         # Detailed protein tracker
  /onboarding        # New user onboarding flow
  /pricing           # Subscription pricing page
  /progress          # Progress tracking
  /settings          # User settings
  /workouts
    /active          # Active workout session
    /programs        # Workout program selection

/components
  /features          # Feature-specific components
  /layout            # Layout components (nav, etc)
  /ui                # Reusable UI components

/lib
  /stripe            # Stripe configuration
  /supabase          # Supabase clients
  /utils             # Utility functions

/supabase
  /migrations        # Database migrations

/scripts             # Database seed scripts

/types               # TypeScript types
```

## 🚀 Deployment

### Prerequisites
- Vercel account (or other Next.js hosting)
- Supabase project (production)
- Stripe account (live mode)

### Steps

1. **Verify locally before deploy** (TypeScript, ESLint, unit tests, production build):

```bash
npm run predeploy
```

Optional — include Playwright **production smoke** against localhost (starts dev server automatically unless `PLAYWRIGHT_SKIP_WEBSERVER=1`):

```bash
npm run predeploy:e2e
```

2. **Deploy to Vercel**:
```bash
vercel deploy
```

3. **Set Environment Variables** in Vercel:
   - All variables from `.env.local`
   - Use production keys for Supabase and Stripe

4. **Set up Production Webhooks**:
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
   - Copy webhook secret to Vercel environment variables

5. **Update Supabase**:
   - Run migrations on production database
   - Set up RLS policies
   - Create storage bucket

6. **Test Production**:
   - Sign up with real email
   - Complete onboarding
   - Test subscription flow (use Stripe test mode first)
   - Verify webhooks are working

## 📊 Subscription Plans

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | Basic protein tracking, manual workout logging, weight tracking, basic progress photos |
| **Core** | $19/mo | Everything in Free + structured workout programs, advanced nutrition insights, weekly reports, priority support |
| **Premium** | $29/mo | Everything in Core + AI meal suggestions, custom workout builder, video library, body composition tracking, monthly coaching |

## 🧪 Testing

### Test User Flow
1. Sign up at `/auth/signup`
2. Complete onboarding at `/onboarding`
3. Log protein at `/dashboard`
4. Choose a workout program at `/workouts/programs`
5. Start a workout at `/workouts/active`
6. Track progress at `/progress`
7. Upload progress photos
8. Log weight
9. View settings at `/settings`

### Test Stripe (Development)
1. Go to `/pricing`
2. Click "Subscribe to Core"
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify subscription in database
6. Test customer portal from settings

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests if applicable
5. Submit a pull request

## 📝 License

[Your License Here]

## 🐛 Known Issues

- None currently

## 🔮 Roadmap

- [ ] Mobile app (React Native)
- [ ] Apple Health / Google Fit integration
- [ ] Meal planning calendar
- [ ] Social features (friends, challenges)
- [ ] Recipe database
- [ ] Video exercise demonstrations
- [ ] AI form checker
- [ ] Nutrition scanner (barcode/photo)
- [ ] Export data (PDF reports)
- [ ] Dark mode
- [ ] Multi-language support

## 💬 Support

For support, email [your-email] or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Supabase](https://supabase.com)
- Payments by [Stripe](https://stripe.com)
- Icons by [Lucide](https://lucide.dev)
