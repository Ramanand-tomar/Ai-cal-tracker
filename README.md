# Calorify AI 🥗🚀

### *The Intelligent Weight Loss & Fitness Companion*

Calorify AI is a high-performance, AI-integrated mobile application built with **React Native** and **Expo**. It empowers users to achieve their fitness goals through intelligent calorie tracking, automated nutrition insights, and a sleek, data-driven interface.

---

## 🌟 Key Features

### 🤖 Generative AI Integration
- **Daily Insights**: Leverages Google Gemini AI to analyze your eating and exercise habits, providing personalized motivational nudges and health tips.
- **Smart Suggestions**: AI-generated food alternatives and workout adjustments based on your progress.

### 🍎 Nutrition & Food Logging
- **Vast Database**: Powered by the **FatSecret API**, offering access to thousands of food items and brand-name products.
- **Custom Entries**: Manual calorie and macro logging for homemade meals.
- **Macronutrient Breakdown**: Real-time tracking of Protein, Carbs, and Fats.

### 🏋️ Comprehensive Fitness Tracking
- **Intensity-Based Logging**: Workouts are calculated based on intensity levels (Low, Moderate, High) to provide accurate calorie burn estimates.
- **Cardio & Strength**: Support for various exercise types with dedicated calculation logic.

### 💧 Hydration Management
- **Visual Tracker**: Interactive water log with glass-by-glass increments.
- **Goal Setting**: Personalized daily water intake goals.

### 📊 Advanced Analytics Dashboard
- **Progress Tracking**: Weekly views of calories burned vs. consumed.
- **Daily Streak**: Visual motivational system to keep consistency high.
- **Trend Charts**: Interactive line and bar charts (LineChart, BarChart) for water and calorie trends.

---

## 🏗️ Project Structure

```text
AI-Cal-Tracker/
├── app/                  # File-based routing (Expo Router)
│   ├── (auth)/           # Authentication screens (Sign-in, Sign-up)
│   ├── (main)/           # Core app features (Analytics, Home, Log Food, Profile)
│   ├── (onboarding)/     # User setup and personalization flow
│   └── _layout.tsx       # Root layout & context providers
├── components/           # Reusable UI components
│   ├── analytics/        # Specialized charts and bento grid components
│   ├── profile/          # Profile-related settings components
│   └── ui/               # Base UI elements (buttons, inputs, cards)
├── config/               # API & Service initializations
│   ├── firebaseConfig.ts # Firebase/Firestore setup
│   └── geminiConfig.ts   # Google AI initialization
├── constants/            # Theme colors, spacing, and Clerk keys
├── context/              # Global state (Theme, User Profile)
├── hooks/                # Custom React hooks (Notifications, User Sync)
├── services/             # External API service wrappers
├── utils/                # Helper functions (Calorie math, OAuth, formatting)
├── eas.json              # EAS Build configuration
└── app.json              # Expo configuration
```

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Expo SDK 54](https://expo.dev/) |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Auth** | [Clerk Expo](https://clerk.com/) |
| **Database** | [Firebase Firestore](https://firebase.google.com/) |
| **AI** | [Google Gemini AI 1.5](https://ai.google.dev/) |
| **Styling** | [NativeWind (Tailwind)](https://www.nativewind.dev/) |
| **Animations** | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| **Icons** | [Hugeicons](https://hugeicons.com/) |

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **Watchman** (for macOS/Linux users)
- **Expo Go** application installed on your phone.

### 2. Environment Configuration
Create a `.env` in the root directory:
```env
# Get these from Clerk Dashboard
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Google AI
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...

# FatSecret API (OAuth 1.0)
EXPO_PUBLIC_FATSECRET_CLIENT_ID=...
EXPO_PUBLIC_FATSECRET_CLIENT_SECRET=...

# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
# ... etc
```

### 3. Local Development
```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

### 4. EAS Build (Android APK)
The project is optimized for EAS builds. To create a preview APK:
```bash
eas build -p android --profile preview
```

---

## 🛡️ Production Security Checklist

- [ ] **EAS Secrets**: Move keys from `.env` to EAS secrets for distribution builds.
- [ ] **Firestore Rules**: Deploy `firestore.rules` to restrict data access to authenticated owners.
- [ ] **Gemini Safety**: Configure safety filters in `geminiConfig.ts`.

---

## 🤝 Contribution
This is a private project. For inquiries, contact the developer.

---

*Made with ❤️ for a healthier lifestyle.*
