# BXARCHI Deployment Guide

## Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps and offers a generous free tier.

### Steps:

1. **Create a Vercel account**
   - Go to https://vercel.com
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

3. **Import project to Vercel**
   - Click "Add New Project" in Vercel dashboard
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

4. **Add Environment Variables**
   - In Vercel project settings, go to "Environment Variables"
   - Add all your Firebase config variables:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
     NEXT_PUBLIC_FIREBASE_PROJECT_ID
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
     NEXT_PUBLIC_FIREBASE_APP_ID
     ```

5. **Deploy**
   - Click "Deploy"
   - Your app will be live at: `your-project.vercel.app`
   - You can add a custom domain later

### Auto-Deploy:
Every time you push to GitHub, Vercel automatically redeploys!

---

## Option 2: Netlify

Another great free option with similar features.

### Steps:

1. **Create Netlify account**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Connect repository**
   - Click "Add new site" → "Import an existing project"
   - Choose your GitHub repo

3. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Framework: Next.js

4. **Environment variables**
   - Add the same Firebase variables as above

5. **Deploy**
   - Click "Deploy site"
   - Live at: `your-site.netlify.app`

---

## Option 3: Firebase Hosting

Since you're already using Firebase, you can host there too.

### Steps:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to: `out`
   - Configure as single-page app: Yes
   - Don't overwrite files

4. **Update package.json**
   Add export script:
   ```json
   "scripts": {
     "export": "next build && next export"
   }
   ```

5. **Build and deploy**
   ```bash
   npm run export
   firebase deploy --only hosting
   ```

---

## Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All Firebase environment variables are set
- [ ] Firestore security rules are deployed
- [ ] Firebase Authentication is configured
- [ ] All features work locally
- [ ] No console errors
- [ ] Images are optimized
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)

---

## Custom Domain

After deployment, you can add a custom domain:

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify:
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS

---

## Continuous Deployment

All three platforms support automatic deployment:
- Push to `main` branch → Auto-deploy
- Push to other branches → Preview deployments

---

## Cost

- **Vercel Free Tier**: Unlimited personal projects, 100GB bandwidth
- **Netlify Free Tier**: 100GB bandwidth, 300 build minutes
- **Firebase Hosting**: 10GB storage, 360MB/day transfer (free tier)

All are free for small to medium projects!

---

## Recommended: Vercel

For BXARCHI, I recommend **Vercel** because:
- ✅ Built for Next.js
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Instant deployments
- ✅ Preview deployments for PRs
- ✅ Free SSL certificates
- ✅ Generous free tier

---

## Quick Deploy to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import repository
4. Add environment variables
5. Click Deploy
6. Done! 🎉

Your app will be live in ~2 minutes!
