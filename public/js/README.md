# JavaScript Directory

## Structure

- **common/** - Shared scripts used across all leagues
- **league-specific/** - Scripts unique to individual leagues

## Usage in MFL

Include scripts in your Home Page Messages using script tags:

```html
<script src="https://mfl-leagues.com/js/common/your-script.js"></script>
```

Or for league-specific scripts:

```html
<script src="https://mfl-leagues.com/js/league-specific/kkl-custom.js"></script>
```

## Important Notes

- Keep scripts modular and well-commented
- Ensure scripts don't conflict with MFL's existing JavaScript
- Test scripts in development before deploying to production leagues
