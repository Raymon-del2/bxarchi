# Install dependencies
npm install

# Install TypeScript types for React and Node
npm install --save-dev @types/react @types/react-dom @types/node

# Create necessary directories
mkdir -p src/app/api/auth/[...nextauth]
mkdir -p src/components

# Create a basic next-auth configuration
@'
import NextAuth from 'next-auth';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Configure authentication providers here
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
};

export default NextAuth(authOptions);
'@ | Out-File -FilePath "src/pages/api/auth/[...nextauth].ts" -Encoding utf8

Write-Host "Setup complete! Run 'npm run dev' to start the development server."
