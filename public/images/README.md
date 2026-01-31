# Images Directory

## Structure

- **shared/** - Images used across multiple leagues (logos, common backgrounds, etc.)
- **league-specific/** - Images unique to each league
  - **kkl/** - Keepers & Kommissioners League images
  - **kdl/** - Keeper Dynasty League images
  - **mmh/** - Monday Morning Hangover images
  - **bsb/** - Best Season of Baseball images

## Usage in MFL

Reference images using full URLs:

```html
<img src="https://mfl-leagues.com/images/shared/logo.png" alt="League Logo">
```

Or in CSS:

```css
background-image: url('https://mfl-leagues.com/images/league-specific/kkl/background.jpg');
```

## File Formats

Supported formats:
- `.jpg` / `.jpeg` - Photos and complex images
- `.png` - Logos and images requiring transparency
- `.gif` - Animated images (use sparingly)
- `.svg` - Vector graphics (best for logos and icons)

## Best Practices

- Optimize images for web (compress before uploading)
- Use descriptive filenames
- Keep file sizes reasonable for faster page loads
