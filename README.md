# Anaya Sharma — Portfolio

Built with React + Vite. Deployed on Vercel.

## Setup

```bash
npm install
npm run dev
```

## Adding your photo

1. Drop your photo (e.g. `anaya.jpg`) into the `public/` folder
2. In `src/components/Hero.jsx`, the `PHOTO_URL` is already set to `/anaya.jpg`
3. That's it — Vite/Vercel serves everything in `public/` at the root URL

## Deploying to Vercel

1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Framework preset: **Vite** (auto-detected)
4. Click Deploy

You'll get a `yourname.vercel.app` URL instantly. Connect a custom domain in Vercel's dashboard for free.

## Customising

- **Colors** → `src/index.css` (CSS variables at the top)
- **Resume link** → `src/components/Hero.jsx` — replace `/Anaya_Sharma_Resume.pdf` with your actual file (drop it in `public/`)
- **Projects** → `src/components/Projects.jsx` — update GitHub links
- **Contact links** → `src/components/Contact.jsx`

## Fonts used

- **Fraunces** — display / headings (Google Fonts)
- **Instrument Serif** — accent italic
- **DM Sans** — body text

## Structure

```
src/
  components/
    CustomCursor.jsx   ← laggy follow cursor + hover state
    Navbar.jsx         ← sticky, blur on scroll, mobile hamburger
    Hero.jsx           ← ID card + parallax headline
    Marquee.jsx        ← infinite ticker strip
    Experience.jsx     ← timeline cards
    Skills.jsx         ← grouped chip grid
    Projects.jsx       ← expandable project cards
    Contact.jsx        ← dark section + link list
    Footer.jsx
  App.jsx
  index.css            ← global tokens, scroll reveal, animations
```
