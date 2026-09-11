This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## MapLibre worker

The MAPID basemap uses MapLibre's ES module worker. `npm run dev` and
`npm run build` copy both `maplibre-gl-worker.mjs` and its relative dependency
`maplibre-gl-shared.mjs` from the installed package into `public/maplibre/`.
These generated files are ignored by Git and ESLint. Run
`node scripts/copy-maplibre-worker.mjs` first if invoking Next directly.

`app/components/Map.tsx` sets the static worker URL before creating the map.
Both `/maplibre/maplibre-gl-worker.mjs` and `/maplibre/maplibre-gl-shared.mjs`
must return HTTP 200 with a JavaScript MIME type. A missing file returns HTML
and prevents tile processing even when the MAPID style loads successfully.
Deploy `public/` along with the application, including when packaging a
standalone server. Switching to Webpack does not replace this setup.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
