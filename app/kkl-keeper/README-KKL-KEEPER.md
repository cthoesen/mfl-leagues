# KKL Keeper Manager - Next.js Setup

This is the Knuckleheads Keeper League (KKL) Keeper Manager app, converted from Astro to Next.js.

## File Structure

```
your-nextjs-project/
├── app/
│   ├── api/
│   │   └── kkl-league-data/
│   │       └── route.ts          # API endpoint for fetching MFL data
│   └── kkl-keeper/
│       ├── layout.tsx             # Layout with Google Fonts
│       └── page.tsx               # Main page component
└── components/
    └── KKLKeeperApp.tsx           # Main React component
```

## Setup Instructions

### 1. Create the API Route
Create the file: `app/api/kkl-league-data/route.ts`
- Copy the contents from `route.ts`

### 2. Create the Component
Create the file: `components/KKLKeeperApp.tsx`
- Copy the contents from `KKLKeeperApp.tsx`

### 3. Create the Page
Create the directory: `app/kkl-keeper/`
Create the files:
- `app/kkl-keeper/page.tsx` (copy from `page.tsx`)
- `app/kkl-keeper/layout.tsx` (copy from `layout.tsx`)

### 4. Add Link to Homepage

Add this to your homepage (app/page.tsx or wherever your main navigation is):

```tsx
import Link from 'next/link';

// In your component:
<Link 
  href="/kkl-keeper"
  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
>
  <Trophy className="w-5 h-5" />
  KKL Keeper Manager
</Link>
```

Or as a card:

```tsx
<Link href="/kkl-keeper" className="block">
  <div className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105">
    <div className="flex items-center gap-3 mb-2">
      <Trophy className="w-8 h-8 text-purple-400" />
      <h3 className="text-xl font-bold text-purple-100">KKL Keeper Manager</h3>
    </div>
    <p className="text-purple-300/60 text-sm">
      Plan your 2026 keeper selections for the Knuckleheads Keeper League
    </p>
  </div>
</Link>
```

## Features

✅ Live data fetching from MyFantasyLeague.com
✅ Real-time keeper eligibility calculations
✅ Purple/blue cyberpunk theme
✅ Responsive design
✅ Search and filter functionality
✅ Stats dashboard
✅ Keeper rules reference

## KKL Keeper Rules

1. **Maximum Duration**: 3 years total
2. **Years Calculation**: Current years - 1 for next season
3. **Draft Slot**:
   - Regular players: Move up 2 rounds
   - Rookies (R): Stay in same round
   - Undrafted/FA: Count as 12th round
4. **Ineligible**:
   - Rounds 1-3 draftees
   - Players with 0 years remaining

## Access

Once deployed, the app will be available at:
`https://yourdomain.com/kkl-keeper`

## Notes

- API caches data for 5 minutes (`revalidate: 300`)
- All references changed from "KeeperApp" to "KKLKeeperApp"
- Maintains the same functionality as the Astro version
- Uses TypeScript for better type safety
