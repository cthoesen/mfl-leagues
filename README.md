# MFL Leagues Asset Repository

A Next.js-based static website hosting custom CSS, JavaScript, images, and HTML snippets for MyFantasyLeague.com leagues.

## 🏈 Leagues

This repository serves assets for four fantasy football leagues:
- **KKL** - Knuckleheads Keeper League
- **KDL** - Knuckleheads Dynasty League
- **MMH** - Monday Morning Hangover
- **BSB** - Blood, Sweat, and Beers

## 📁 Project Structure

```
mfl-leagues/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Homepage
├── public/                       # Static assets (publicly accessible)
│   ├── css/                     # Stylesheets
│   │   └── leagues.css          # Master CSS for all leagues
│   ├── js/                      # JavaScript files
│   │   ├── common/              # Shared scripts
│   │   └── league-specific/     # League-specific scripts
│   ├── images/                  # Image assets
│   │   ├── shared/              # Shared across leagues
│   │   └── league-specific/     # Individual league images
│   │       ├── kkl/
│   │       ├── kdl/
│   │       ├── mmh/
│   │       └── bsb/
│   └── html/                    # HTML snippets
│       └── snippets/            # Reusable components
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- A Vercel account (free tier works great)

### Local Development

1. **Clone the repository** (or initialize if starting fresh):
   ```bash
   git clone https://github.com/cthoesen/mfl-leagues.git
   cd mfl-leagues
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **View the site**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Adding Your Assets

1. **Add your CSS file**:
   - Place `*.css` in `public/css/`
   - File will be accessible at `https://mfl-leagues.com/css/*leagues*.css`

2. **Add JavaScript files**:
   - Shared scripts → `public/js/common/`
   - League-specific → `public/js/league-specific/`

3. **Add images**:
   - Shared images → `public/images/shared/`
   - League-specific → `public/images/league-specific/[league-code]/`

4. **Add HTML snippets**:
   - Place in `public/html/snippets/`

## 🌐 Deploying to Vercel

### First-Time Setup

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository `cthoesen/mfl-leagues`
   - Vercel will auto-detect Next.js settings

3. **Configure your domain**:
   - In Vercel project settings, go to "Domains"
   - Add your domain: `mfl-leagues.com`
   - Vercel will provide DNS instructions
   - Your domain should already be connected since you purchased it through Vercel

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your site
   - Your site will be live at `https://mfl-leagues.com`

### Automatic Deployments

Once connected, Vercel will automatically:
- Deploy when you push to the `main` branch
- Create preview deployments for pull requests
- Build and optimize your static site

### Manual Deployment via CLI (Optional)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

## 🔗 Using Assets in MyFantasyLeague.com

### Linking CSS

In MFL's Custom CSS settings:
```
https://mfl-leagues.com/css/leagues.css
```

### Including JavaScript

In Home Page Messages, add:
```html
<script src="https://mfl-leagues.com/js/common/your-script.js"></script>
```

### Embedding Images

```html
<img src="https://mfl-leagues.com/images/shared/logo.png" alt="League Logo">
```

Or in CSS:
```css
background-image: url('https://mfl-leagues.com/images/league-specific/kkl/background.jpg');
```

### HTML Snippets

Copy content from `public/html/snippets/` and paste into MFL's Home Page Messages.

**Remember**: MFL restricts `<html>`, `<body>`, and `<textarea>` tags.

## 📝 MFL Integration Notes

### CSS Strategy

The master `leagues.css` uses body IDs for league-specific styling:

```css
/* Shared styles for all leagues */
.some-class {
  /* styles */
}

/* KKL-specific styles */
#body-kkl .some-class {
  /* KKL overrides */
}

/* Since you can't target body directly, use: */
body:has(#body-kkl) {
  background-image: url('...');
}
```

### Home Page Messages

MFL provides 20 customizable message slots (1-20). Each message:
- Can contain HTML, CSS, and JavaScript
- Limited to 256kb per message
- Cannot use `<html>`, `<body>`, or `<textarea>` tags
- Supports WYSIWYG editor or raw HTML

## 🛠️ Maintenance

### Updating Assets

1. **Edit files locally** in the `public/` directory
2. **Test changes**:
   ```bash
   npm run dev
   ```
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Update league styles"
   git push origin main
   ```
4. **Vercel auto-deploys** - changes live in ~1 minute

### Cache Busting

If MFL caches old assets, add a version query parameter:
```
https://mfl-leagues.com/css/leagues.css?v=2
```

## 🔧 Troubleshooting

### Assets Not Loading

1. Check file paths (case-sensitive!)
2. Verify files are in `public/` directory
3. Check browser console for errors
4. Try cache-busting with `?v=X` parameter

### Deployment Issues

1. Check Vercel deployment logs
2. Ensure `output: 'export'` is in `next.config.js`
3. Verify all asset paths are relative

### MFL Integration Issues

1. Verify no restricted tags (`<html>`, `<body>`, `<textarea>`)
2. Check message size (must be < 256kb)
3. Test in MFL's WYSIWYG editor first

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MyFantasyLeague Help](https://home.myfantasyleague.com/)
- [GitHub Repository](https://github.com/cthoesen/mfl-leagues)

## 📄 License

Private repository for personal use.

---

**Questions or issues?** Check the Vercel deployment logs or review MFL's custom page documentation.
