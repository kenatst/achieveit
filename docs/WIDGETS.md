# Home Screen Widget Setup Guide

## Overview
Home screen widgets require native platform code (Swift for iOS, Kotlin for Android). This guide outlines the implementation approach for AchieveIt widgets.

## iOS Widget (WidgetKit)

### Prerequisites
- expo prebuild required
- Xcode 14+
- iOS 16+

### Recommended Approach
Use `@bacons/apple-targets` plugin:

```bash
npm install @bacons/apple-targets
```

### Widget Configuration (app.json)
```json
{
  "expo": {
    "extra": {
      "targets": {
        "widgets": {
          "type": "widget-extension",
          "bundleIdentifier": "com.achieveit.widget"
        }
      }
    }
  }
}
```

### Widget Data Sharing
Use App Groups to share data between the app and widget:

```swift
// In Swift widget
let userDefaults = UserDefaults(suiteName: "group.com.achieveit.shared")
let progress = userDefaults?.integer(forKey: "dailyProgress") ?? 0
```

### React Native Side - Sync Progress
```typescript
// utils/widgetSync.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function syncProgressToWidget() {
  // Get current progress
  const plans = await AsyncStorage.getItem('plans');
  const parsed = plans ? JSON.parse(plans) : [];
  
  // Calculate today's progress
  let completed = 0;
  let total = 0;
  // ... calculation logic
  
  // Send to native via native module
  // Requires custom native module implementation
}
```

---

## Android Widget (AppWidgetProvider)

### Prerequisites
- expo prebuild required
- Android SDK 21+

### Recommended Approach
Use `react-native-android-widget` package:

```bash
npm install react-native-android-widget
```

### Widget Configuration
Add to `app.json`:
```json
{
  "expo": {
    "plugins": [
      ["react-native-android-widget", {
        "widgets": [
          {
            "name": "AchieveItProgress",
            "label": "Today's Progress",
            "minWidth": "110dp",
            "minHeight": "40dp",
            "updatePeriodMillis": 3600000
          }
        ]
      }]
    ]
  }
}
```

---

## Widget Designs

### Small Widget (2x2)
- Progress circle (0-100%)
- "Today's Focus" label
- Tap to open Focus tab

### Medium Widget (4x2)
- Progress circle
- Next 2 tasks
- Routine streak count

### Large Widget (4x4)
- Progress circle
- All today's tasks with checkboxes
- Motivational quote

---

## Colors (Brand Consistent)
```swift
// iOS
let rustColor = Color(hex: "#D94528")
let sageColor = Color(hex: "#2A3B30")
let backgroundDark = Color(hex: "#121212")
let backgroundLight = Color(hex: "#FDFCF8")
```

---

## Implementation Steps

1. **Prebuild Expo App**
   ```bash
   npx expo prebuild
   ```

2. **iOS Widget**
   - Add Widget Extension target in Xcode
   - Configure App Group for data sharing
   - Create SwiftUI widget views
   - Register timeline provider

3. **Android Widget**
   - Configure widget in `AndroidManifest.xml`
   - Create widget layout XML
   - Implement AppWidgetProvider class
   - Set up background update service

4. **Data Sync**
   - Create native modules for both platforms
   - Sync progress data on app foreground/background
   - Schedule periodic widget updates

---

## Future Considerations
- Live Activities (iOS 16+)
- Interactive widgets (iOS 17+)
- Glance widgets (watchOS)
