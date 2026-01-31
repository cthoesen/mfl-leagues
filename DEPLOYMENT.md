# Deployment Checklist

Follow these steps to get your MFL Leagues site live on Vercel.

## ✅ Pre-Deployment Checklist

- [ ] Domain `mfl-leagues.com` purchased and configured in Vercel
- [ ] GitHub repository created at `cthoesen/mfl-leagues`
- [ ] All assets ready to upload (CSS, JS, images, HTML snippets)

## 📦 Step 1: Prepare Your Repository

### 1.1 Initialize Git (if not already done)

```bash
cd /path/to/mfl-leagues
git init
git add .
git commit -m "Initial project setup"
```

### 1.2 Connect to GitHub

```bash
git remote add origin https://github.com/cthoesen/mfl-leagues.git
git branch -M main
git push -u origin main
```

## 🎨 Step 2: Add Your Assets

### 2.1 Add CSS

```bash
# Copy your leagues.css file
cp /path/to/your/leagues.css public/css/
```

### 2.2 Add JavaScript

```bash
# Copy scripts to appropriate directories
cp /path/to/common-script.js public/js/common/
cp /path/to/kkl-script.js public/js/league-specific/
```

### 2.3 Add Images

```bash
# Copy images
cp /path/to/shared-logo.png public/images/shared/
cp /path/to/kkl-banner.jpg public/images/league-specific/kkl/
# Repeat for kdl, mmh, bsb as needed
```

### 2.4 Add HTML Snippets

```bash
# Copy HTML snippets
cp /path/to/header.html public/html/snippets/
```

### 2.5 Commit Your Assets

```bash
git add public/
git commit -m "Add league assets"
git push origin main
```

## 🚀 Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Log in to your account

2. **Import Repository**:
   - Click "Import Project"
   - Select "Import Git Repository"
   - Choose `cthoesen/mfl-leagues` from your GitHub repos
   - Click "Import"

3. **Configure Project**:
   - **Project Name**: `mfl-leagues` (or your preference)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `next build` (auto-filled)
   - **Output Directory**: `out` (auto-filled due to static export)
   - Click "Deploy"

4. **Wait for Deployment**:
   - Vercel will build your site (takes ~1-2 minutes)
   - You'll see a success message with a preview URL

5. **Add Custom Domain**:
   - In project settings, go to "Domains"
   - Add `mfl-leagues.com` and `www.mfl-leagues.com`
   - Since you purchased through Vercel, DNS should auto-configure
   - Wait for SSL certificate to provision (~5 minutes)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# - Link to existing project or create new one
# - Confirm settings
```

## 🔍 Step 4: Verify Deployment

### 4.1 Check Asset URLs

Open these URLs in your browser to verify assets are accessible:

```
https://mfl-leagues.com/css/leagues.css
https://mfl-leagues.com/js/common/[your-script].js
https://mfl-leagues.com/images/shared/[your-image].png
```

### 4.2 Test the Homepage

Visit `https://mfl-leagues.com` to see your asset repository homepage.

## 🏈 Step 5: Integrate with MyFantasyLeague

### 5.1 Add CSS to MFL

1. Log in to MyFantasyLeague.com
2. Go to league setup
3. Find "Custom CSS" or "League Stylesheet" settings
4. Add this URL:
   ```
   https://mfl-leagues.com/css/leagues.css
   ```
5. Save changes

### 5.2 Add JavaScript to Home Page Messages

1. Go to "Home Page Messages" in MFL
2. Select a message slot (1-20)
3. Switch to HTML mode (if using WYSIWYG editor)
4. Add your script tags:
   ```html
   <script src="https://mfl-leagues.com/js/common/your-script.js"></script>
   ```
5. Save message

### 5.3 Test in Browser

1. Visit your MFL league page
2. Open browser DevTools (F12)
3. Check Console for errors
4. Verify styles are applied
5. Test JavaScript functionality

## 🔄 Step 6: Future Updates

### Making Changes

```bash
# Edit files locally
vim public/css/leagues.css

# Test locally
npm run dev

# Commit and push
git add public/css/leagues.css
git commit -m "Update league styles"
git push origin main

# Vercel auto-deploys in ~1 minute
```

### Force Cache Refresh in MFL

If MFL caches old assets, append a version parameter:

```
https://mfl-leagues.com/css/leagues.css?v=2
```

Increment `v=2` to `v=3`, `v=4`, etc. with each update.

## ✨ Success Criteria

Your deployment is successful when:

- [ ] All asset URLs return 200 OK status
- [ ] Custom CSS displays correctly in MFL leagues
- [ ] JavaScript executes without console errors  
- [ ] Images load properly
- [ ] Changes pushed to GitHub auto-deploy to Vercel
- [ ] All 4 leagues (KKL, KDL, MMH, BSB) render correctly

## 🆘 Troubleshooting

### Assets Return 404

- Verify files are in `public/` directory
- Check file names (case-sensitive!)
- Ensure paths don't start with `/public/` (use `/css/` not `/public/css/`)

### Deployment Fails

- Check Vercel deployment logs
- Verify `next.config.js` has `output: 'export'`
- Ensure no syntax errors in your files

### CSS Not Applying in MFL

- Clear browser cache
- Use cache-busting parameter `?v=X`
- Check browser console for loading errors
- Verify CSS URL is saved in MFL settings

### Domain Not Working

- Check DNS settings in Vercel
- Wait up to 24 hours for DNS propagation
- Verify SSL certificate is issued

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs  
- **MFL Help**: https://home.myfantasyleague.com/help
- **GitHub Issues**: https://github.com/cthoesen/mfl-leagues/issues

---

**Ready to deploy?** Start with Step 1 and work your way through. Each step should take just a few minutes!
