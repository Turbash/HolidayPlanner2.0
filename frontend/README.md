# Holiday Planner 2.0 Frontend

A modern React + Vite frontend for the Holiday Planner 2.0 project.

## Features

- Plan detailed holidays and get destination suggestions
- User authentication (JWT-based)
- Dashboard for managing saved trips
- Weather and places integration (WeatherAPI, Foursquare)
- Responsive, modern UI with Tailwind CSS
- Toast notifications and loading states

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- Backend API running (see backend README)

### Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment variables:**

   Create a `.env` file in this directory:

   ```
   VITE_BACKEND_URL=http://localhost:8000
   ```

   Set this to your deployed backend URL in production.

3. **Run the development server:**
   ```sh
   npm run dev
   ```

   The app will be available at [http://localhost:5173](http://localhost:5173) by default.

### Build for Production

```sh
npm run build
```

### Lint

```sh
npm run lint
```

## Project Structure

- `src/components/` - React components (Dashboard, TripDisplay, etc.)
- `src/contexts/` - React context providers (Auth)
- `src/utils/` - API utilities and helpers
- `src/App.jsx` - Main app routes and layout

## Environment Variables

| Variable           | Description                         |
|--------------------|-------------------------------------|
| VITE_BACKEND_URL   | Backend API base URL                |

## Deployment

- Build the frontend with `npm run build`.
- Deploy the `dist/` folder to your static hosting (Vercel, Netlify, etc.).
- Ensure `VITE_BACKEND_URL` points to your deployed backend.

## License

MIT

---
