# Mentora - Educational Content Platform

Mentora is a React Native application that aggregates educational content from multiple sources (YouTube, Udemy, Coursera, Khan Academy) and provides a modern UI for users to browse, watch, and manage educational content.

## Features

- **Content Aggregation**: Browse educational content from multiple sources
- **Modern Video Player**: Watch videos with a custom player with advanced controls
- **Personal Library**: Save videos for later viewing
- **Watch History**: Track your learning progress
- **Categories**: Browse content by category
- **Search**: Find specific educational content
- **User Profiles**: Manage your account and preferences
- **Authentication**: Secure sign-up and login

## Tech Stack

- **Frontend**: React Native, Expo
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **APIs**: YouTube Data API, Udemy API, Coursera API
- **State Management**: React Hooks
- **Styling**: React Native StyleSheet

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account
- YouTube API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/mentora.git
cd mentora
```

### 2. Install dependencies

   ```bash
   npm install
   ```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
# YouTube API Configuration
YOUTUBE_API_KEY=your_youtube_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Set up Supabase

1. Create a new project on [Supabase](https://supabase.com/)
2. Go to the SQL Editor and run the SQL script in `supabase/schema.sql`
3. Copy your Supabase URL and anon key to the `.env` file

### 5. Run the application

```bash
npm start
```

This will start the Expo development server. You can then:
- Scan the QR code with the Expo Go app on your iOS device
- Scan the QR code with the Expo Go app on your Android device
- Press 'a' to open on an Android emulator
- Press 'i' to open on an iOS simulator
- Press 'w' to open in a web browser

## Project Structure

- `app/`: Main application code
  - `(tabs)/`: Tab-based navigation screens
  - `video/`: Video player screen
- `components/`: Reusable UI components
- `services/`: API and data services
  - `content-aggregator.ts`: Aggregates content from multiple sources
  - `content-service.ts`: Manages user content (saved videos, watch history)
  - `youtube-api.ts`: YouTube API integration
  - `supabase-client.ts`: Supabase client initialization
  - `supabase-service.ts`: Supabase database operations
- `assets/`: Images, fonts, and other static assets
- `supabase/`: Supabase configuration and SQL scripts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Supabase](https://supabase.com/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
