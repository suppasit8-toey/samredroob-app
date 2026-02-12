# 🚀 Deployment Guide for SAMREDROOB

This guide will help you deploy your Next.js application to Vercel.

## 1. Push to GitHub

Since you have already initialized the local Git repository, follow these steps:

1.  **Create a New Repository on GitHub**:
    - Go to [https://github.com/new](https://github.com/new).
    - Name it `samredroob-app` (or your preferred name).
    - Do **NOT** initialize with README, .gitignore, or License (we already have them).
    - Click **Create repository**.

2.  **Push your code**:
    - Copy the commands under "**…or push an existing repository from the command line**".
    - Run them in your terminal (VS Code):
      ```bash
      git remote add origin https://github.com/<YOUR_USERNAME>/samredroob-app.git
      git branch -M main
      git push -u origin main
      ```

## 2. Deploy on Vercel

1.  **Import Project**:
    - Go to [Vercel Dashboard](https://vercel.com/dashboard).
    - Click **Add New...** > **Project**.
    - Select your GitHub repository (`samredroob-app`).
    - Click **Import**.

2.  **Configure Environment Variables**:
    - In the **Configure Project** screen, find the **Environment Variables** section.
    - Add the following variables (Copy from your `.env.local` file):
      - `NEXT_PUBLIC_SUPABASE_URL`
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
      - `NEXT_PUBLIC_CLOUDINARY_API_KEY`

3.  **Deploy**:
    - Click **Deploy**.
    - Wait for the build to finish.
    - 🎉 Your site is live!

## 3. Verify

- Visit the provided Vercel URL.
- Test the Products page to ensure it loads data from Supabase.
- Test the Calculator.
