# Netlify Deployment Guide

This project is configured for deployment on Netlify. Follow these steps to deploy:

## Setup

1. Push your repository to GitHub
2. Sign up for Netlify (if you haven't already): https://app.netlify.com/signup
3. Click "Add new site" > "Import an existing project"
4. Select your GitHub repository
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Environment Variables

You need to set the following environment variables in the Netlify dashboard:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

To set environment variables:
1. Go to Site settings > Environment variables
2. Add each variable and its value
3. Trigger a new deploy after setting variables

## Continuous Deployment

Netlify will automatically deploy your site when you push changes to your GitHub repository. The configuration in `netlify.toml` handles routing and build settings.

## Custom Domain

To connect a custom domain:
1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the verification and DNS configuration steps

## Troubleshooting

If you encounter deployment issues:
1. Check the deploy logs in the Netlify dashboard
2. Verify your environment variables are set correctly
3. Ensure your build command is working locally with `npm run build` 