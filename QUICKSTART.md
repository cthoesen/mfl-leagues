# Quick Start Guide - MFL Leagues Website

## 🎉 Your Next.js Project is Ready!

The project has been created with the following structure optimized for hosting MyFantasyLeague.com assets.

## 📂 What's Included

### Core Files
- **next.config.js** - Configured for static export (perfect for asset hosting)
- **package.json** - All dependencies defined
- **vercel.json** - Optimized caching headers for your assets
- **tsconfig.json** - TypeScript configuration

### Directory Structure
```
public/
├── css/          # Your leagues.css will go here
├── js/
│   ├── common/   # Shared JavaScript
│   └── league-specific/  # Per-league scripts
├── images/
│   ├── shared/   # Common images
│   └── league-specific/
│       ├── kkl/  # Keepers & Kommissioners League
│       ├── kdl/  # Keeper Dynasty League
│       ├── mmh/  # Monday Morning Hangover
│       └── bsb/  # Best Season of Baseball
└── html/
    └── snippets/ # Reusable HTML components
```

### Documentation
- **README.md** - Complete project documentation
- **DEPLOYMENT.md** - Step-by-step deployment checklist
- **public/*/README.md** - Usage guides for each asset type

## ⚡ Immediate Next Steps

### 1. Upload to GitHub (5 minutes)

```bash
# Navigate to your project folder
cd /path/to/mfl-leagues

# Initialize git (if you haven't already)
git init
git add .
git commit -m "Initial project setup"

# Connect to your GitHub repository
git remote add origin https://github.com/cthoesen/mfl-leagues.git
git branch -M main
git push -u origin main
```

### 2. Add Your Existing Assets (5 minutes)

```bash
# Copy your current leagues.css
cp /path/to/your/leagues.css public/css/

# Copy any existing scripts
cp /path/to/your/scripts/* public/js/common/

# Copy images
cp /path/to/your/images/* public/images/shared/

# Commit your assets
git add public/
git commit -m "Add league assets"
git push origin main
```

### 3. Deploy to Vercel (10 minutes)

#### Via Dashboard (Easiest):
1. Go to https://vercel.com/new
2. Import your GitHub repository `cthoesen/mfl-leagues`
3. Vercel auto-detects Next.js - just click "Deploy"
4. Add your domain `mfl-leagues.com` in project settings → Domains
5. Done! Your site will be live at https://mfl-leagues.com

#### Via CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 4. Link Assets in MFL (5 minutes)

Once deployed, update your MFL leagues:

**CSS**: Add to MFL Custom CSS settings:
```
https://mfl-leagues.com/css/leagues.css
```

**JavaScript**: Add to Home Page Messages:
```html
<script src="https://mfl-leagues.com/js/common/your-script.js"></script>
```

**Images**: Reference in HTML/CSS:
```html
<img src="https://mfl-leagues.com/images/shared/logo.png">
```

## 🔧 Local Development (Optional)

To preview changes before deploying:

```bash
# Install dependencies (first time only)
npm install

# Run development server
npm run dev

# Visit http://localhost:3000
```

## 📚 Key Features

✅ **Static Export** - Pure HTML/CSS/JS output (no server needed)
✅ **Automatic Deployments** - Push to GitHub = instant deploy
✅ **Optimized Caching** - Smart cache headers for fast loading
✅ **Organized Structure** - Clear separation by asset type and league
✅ **MFL Compatible** - Follows all MFL restrictions and best practices
✅ **Version Control** - Full Git history of all changes

## 🎯 Asset URLs After Deployment

Your assets will be accessible at:

- CSS: `https://mfl-leagues.com/css/leagues.css`
- JS: `https://mfl-leagues.com/js/common/script.js`
- Images: `https://mfl-leagues.com/images/shared/logo.png`
- League-specific: `https://mfl-leagues.com/images/league-specific/kkl/banner.jpg`

## 💡 Pro Tips

1. **Cache Busting**: When updating CSS/JS, add `?v=2` to force MFL to reload:
   ```
   https://mfl-leagues.com/css/leagues.css?v=2
   ```

2. **Test Locally**: Always run `npm run dev` to preview changes before deploying

3. **Commit Often**: Small, frequent commits make it easier to track changes

4. **Use READMEs**: Each directory has a README.md with specific usage instructions

## 🆘 Need Help?

- Check **DEPLOYMENT.md** for detailed step-by-step instructions
- Review **README.md** for complete documentation
- Vercel has excellent docs at https://vercel.com/docs
- MFL help center: https://home.myfantasyleague.com/help

## 🚀 You're All Set!

Your project is configured and ready to deploy. The entire setup should take about 30 minutes from start to finish.

**Next step**: Upload to GitHub and deploy to Vercel following the steps above!
