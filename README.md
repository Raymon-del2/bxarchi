# BXARCHI - Book Publishing & Review Platform

A modern web platform where authors can publish their books and readers can discover, review, and comment on them.

## Features

- 📝 **Easy Book Publishing** - Write and publish your books with a simple, intuitive editor
- 💬 **Reader Engagement** - Get feedback through comments and reviews
- 🔍 **Book Discovery** - Browse and search through a growing collection of books
- 👤 **User Profiles** - Create your author or reader profile
- ⭐ **Rating System** - Rate and review books
- 📚 **Personal Library** - Organize your favorite books

## Tech Stack

- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Set up Firebase:
   - Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
   - Create a Firebase project
   - Enable Authentication (Email/Password and Google)
   - Copy your Firebase config

4. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then add your Firebase configuration to `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
BXARCHI/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (dashboard)/  # Dashboard pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── ui/          # UI components
│   │   ├── layout/      # Layout components
│   │   └── shared/      # Shared components
│   ├── lib/             # Utility functions
│   └── types/           # TypeScript types
├── public/              # Static files
└── prisma/              # Database schema
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
