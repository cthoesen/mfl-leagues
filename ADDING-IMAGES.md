# Adding Player Images to Homepage

## Quick Start

1. **Add your images** to `/public/images/shared/`:
   ```
   public/images/shared/
   ├── player-1.png
   ├── player-2.png
   ├── player-3.png
   └── player-4.png
   ```

2. **Name your files** exactly as shown above (or update the paths in `app/page.tsx`)

3. **Commit and deploy**:
   ```bash
   git add public/images/shared/
   git commit -m "Add player images to homepage"
   git push origin main
   ```

## Recommended Image Specifications

### Dimensions
- **Width:** 250-300px
- **Height:** 200-250px  
- **Aspect Ratio:** Square (1:1) or slightly portrait
- The images will be contained within a 200px tall container

### File Format
- **PNG** - Best for pixel art, transparent backgrounds
- **WebP** - Modern format, smallest file size
- **GIF** - For animated retro pixel art
- **JPG** - For photos or complex images

### File Size
- Keep each image **under 200KB** for fast loading
- Pixel art: 10-50KB (very small!)
- Illustrations: 50-150KB
- Photos: 100-200KB

### Optimization Tips
- Use online tools like [TinyPNG](https://tinypng.com/) to compress images
- For pixel art, save at actual pixel size then scale with CSS (crisper edges)
- Remove metadata and extra color profiles

## Customizing Image Paths

If you want to use different filenames or locations, edit `app/page.tsx`:

```typescript
{[
  { id: 1, image: '/images/shared/mahomes-pixel.png', alt: 'Patrick Mahomes' },
  { id: 2, image: '/images/shared/lamar-retro.png', alt: 'Lamar Jackson' },
  { id: 3, image: '/images/league-specific/kkl/team-logo.png', alt: 'KKL Logo' },
  { id: 4, image: '/images/shared/trophy-8bit.gif', alt: 'Trophy Animation' },
].map((slot, i) => (
  // ... rest of code
```

## Styling Tips

### Pixel Art (Retro Gaming Aesthetic)
For crisp 8-bit/16-bit style images:
```css
image-rendering: pixelated;
image-rendering: crisp-edges;
```

Add this to the `<img>` style in `app/page.tsx`:
```typescript
style={{
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  imageRendering: 'pixelated', // Add this for pixel art
}}
```

### Background Colors
The image containers have:
- Gradient background with purple/blue tones
- Cyan border that glows on hover
- Transparent backdrop filter

Images with transparency will blend nicely with the cyberpunk background.

## Examples of Good Images

**Pixel Art:**
- 8-bit or 16-bit style NFL player sprites
- Retro video game inspired characters
- Low-resolution pixel graphics (64x64, 128x128 scaled up)

**Cartoon/Illustration:**
- Vector-style player illustrations
- Comic book style art
- Bold, high-contrast designs

**Photos:**
- High-contrast player photos with removed backgrounds
- Action shots with transparent backgrounds
- Headshots with colored backgrounds that match your theme

## Image Placeholder Behavior

The code automatically:
- Shows placeholder text if image doesn't exist
- Hides placeholder and displays image once loaded
- Handles broken image links gracefully
- Maintains the card layout even if images fail

## Advanced: Different Images per League

You could even show different images based on which league the user is viewing:

```typescript
// Example: Different images for each league
const kklImages = ['/images/league-specific/kkl/player-1.png', ...];
const kdlImages = ['/images/league-specific/kdl/player-1.png', ...];
// Use conditional logic to select appropriate set
```

## Need Help?

- Can't decide on image size? Start with **250x250px square PNG**
- Want animations? Use **animated GIF** at the same dimensions
- Need pixel art tools? Try [Aseprite](https://www.aseprite.org/) or [Piskel](https://www.piskelapp.com/)
- Want to remove backgrounds? Use [Remove.bg](https://www.remove.bg/)

---

**Ready to add your images?** Drop them in `/public/images/shared/`, name them `player-1.png` through `player-4.png`, and deploy! 🏈
