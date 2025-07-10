# Firebase Setup Instructions

## Current Status
The Firebase project `quiz-app-59968` needs to be properly configured for authentication.

## Required Steps in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `quiz-app-59968`

### Enable Authentication Methods

1. Go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click enable and save
   - **Google**: 
     - Click enable
     - Add your project's public-facing name
     - Choose support email
     - Save

### Configure Authorized Domains

1. In **Authentication** → **Settings** → **Authorized domains**
2. Add these domains:
   - `localhost` (for development)
   - Your production domain (when you deploy)

### Google OAuth Setup (if using Google Sign-in)

1. Go to **Authentication** → **Sign-in method** → **Google**
2. Download the configuration
3. Make sure Web client ID is properly configured

## Current Configuration

The app is configured with these Firebase project settings:
- Project ID: `quiz-app-59968`
- Auth Domain: `quiz-app-59968.firebaseapp.com`

## Troubleshooting

If you get `auth/configuration-not-found`:
1. Verify the project exists in Firebase Console
2. Check that Authentication is enabled
3. Ensure Email/Password provider is enabled
4. For Google Sign-in, ensure Google provider is enabled with proper OAuth setup

## Testing

1. Start with Email/Password authentication (more reliable)
2. Add Google Sign-in after basic auth is working
