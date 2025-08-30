# Google Calendar Integration Setup Guide

## Prerequisites
1. Google Account
2. Google Cloud Console access

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for the project

## Step 2: Enable Google Calendar API

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback` (for development)
   - `https://yourdomain.com/auth/google/callback` (for production)
5. Click "Create"
6. Note down your Client ID and Client Secret

## Step 4: Configure Environment Variables

Create a `.env` file in your project root with the following:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
JWT_SECRET=your-jwt-secret-here
```

## Step 5: Test the Integration

1. Start your server: `npm start`
2. Go to `/mock-interview`
3. Click "Connect Google Calendar"
4. Authorize the application
5. Try accepting an interview request

## Features

Once connected, the system will:
- ✅ Create Google Calendar events automatically
- ✅ Generate Google Meet links for interviews
- ✅ Send calendar invites to both participants
- ✅ Add reminders and notifications

## Troubleshooting

### Common Issues:

1. **"Google Calendar not connected" error**
   - Make sure you've completed the OAuth flow
   - Check that your credentials are correct
   - Verify the redirect URI matches exactly

2. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Google Cloud Console matches your .env file
   - Check for trailing slashes or protocol mismatches

3. **Calendar events not created**
   - Verify the Google Calendar API is enabled
   - Check that the user has granted calendar permissions
   - Look for errors in the server console

### Fallback System

If Google Calendar integration fails, the system will:
- Use a generated Meet link as fallback
- Still allow interviews to proceed
- Log the error for debugging

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production
- Regularly rotate your OAuth credentials
- Implement proper token storage in production (database instead of memory)
