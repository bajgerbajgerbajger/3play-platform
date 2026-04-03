# 3Play

A modern, full-stack video streaming platform built with Next.js 16, TypeScript, Tailwind CSS, and SQLite.

## Features

- **User Authentication**: Secure login/registration with email/password (NextAuth.js)
- **Content Manager**: Admin dashboard to upload and manage movies/series
- **Video Streaming**: Upload and stream video content directly
- **Genre Management**: Organize content with dynamic genres
- **Responsive UI**: Modern, dark-themed interface built with Shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# The project is pre-configured for SQLite
```

3. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Reset and Seed the database
npx prisma db push --force-reset
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Admin Credentials

- **Email**: `admin@3play.com`
- **Password**: `admin123`

## Project Structure

- `prisma/`: Database schema and seed script (SQLite)
- `src/app/admin/`: Admin dashboard for content management
- `src/app/api/`: Backend API routes (Auth, Upload, Content)
- `src/components/`: Reusable React components
- `public/uploads/`: Local storage for uploaded media (created on first upload)

## Maintenance

To clear the platform data and reset to a clean state:
```bash
npx prisma db push --force-reset
npm run db:seed
```


- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/movies` - Get movies
- `GET /api/series` - Get series
- `POST /api/progress` - Update watch progress
- `GET /api/watch/[...slug]` - Get watch data

## Features Coming Soon

- [ ] Admin dashboard
- [ ] Content upload system
- [ ] Real-time notifications
- [ ] Recommendation engine
- [ ] Mobile app
- [ ] Offline viewing
- [ ] Multi-language support

## License

MIT License - see LICENSE file for details.
# 3Play-
