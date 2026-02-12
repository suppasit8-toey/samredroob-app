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

## 4. Admin Account Setup (How to Login)

The Admin Portal is secured and does not allow public sign-ups. You must manually create an admin user in Supabase.

1.  **Go to Supabase Dashboard**:
    - Open your project in [Supabase](https://supabase.com/dashboard).
    - Go to **Authentication** > **Users**.

2.  **Add User**:
    - Click **Add User** (top right).
    - Enter the **Email** and **Password** you want to use for the admin login.
    - Check "Auto Confirm User?" (so you don't need to verify email).
    - Click **Invited User** or **Add User**.

3.  **Login**:
    - Go to your admin login page (e.g., `http://localhost:3000/admin/login`).
    - Enter the email and password you just created.
    - Click **Sign In**.

> **Note**: For production security, ensure you disable "Enable Signups" in **Authentication** > **Providers** > **Email** if you don't want public users to register (though our UI hides the sign-up link).
