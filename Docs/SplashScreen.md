# CtrlSketch Splash Screen Documentation

## Overview

The splash screen is displayed when the application starts, showing the CtrlSketch logo with animations, the application version, and license information. It automatically fades out after a set duration.

![Splash Screen Example](../ImageReference/Splash%20Logo.png)

## Features

- Animated logo with pulsing effect
- Animated elements (circle pulse and sparkles)
- Version number display (pulled from package.json)
- License number display
- Automatic fade-out after configurable duration
- Can be shown again through Help > About menu

## Implementation Details

The splash screen is implemented as a Vue component (`SplashScreen.vue`) and integrated into the main application (`App.vue`).

### Files

- `src/components/SplashScreen.vue` - The splash screen component
- `src/App.vue` - Integration with the main application
- `public/assets/splash-logo.png` - The logo image
- `src/styles/main.css` - CSS animations

## Updating Version and License Information

### Updating the Version Number

The version number is pulled directly from your `package.json` file.

#### Option 1: Update package.json (Recommended)

1. Open your `package.json` file
2. Change the "version" field to your desired version number:

```json
{
  "name": "my-canvas-app",
  "version": "1.0.0",  // Change this line
  "scripts": {
    // ...
  }
}
```

This is the recommended approach because:
- It follows standard versioning practices
- The version is maintained in a single place
- It will be consistent across your entire application
- It's automatically updated when you build your app

#### Option 2: Override the version in App.vue

If you want to set a specific version that's different from your package.json (not recommended for production, but useful for testing):

```javascript
// In App.vue data section
data() {
  return {
    // ...
    appVersion: '2.0.0-beta', // Override package.json version
    // ...
  };
}
```

### Updating the License Number

You can update the license number in App.vue:

```javascript
// In App.vue data section
data() {
  return {
    // ...
    licenseNumber: 'CS-2023-0001', // Update this with your actual license number
    // ...
  };
}
```

For a more sophisticated approach, you could implement a license management system that loads the license from:
- A configuration file
- Local storage
- A server API
- An environment variable

## Customizing the Splash Screen

### Duration

You can change how long the splash screen displays by modifying the `duration` prop in App.vue:

```html
<SplashScreen 
  v-if="showSplashScreen" 
  :version="appVersion" 
  :license-number="licenseNumber"
  :duration="10000"  <!-- Change this value (in milliseconds) -->
  @splash-complete="showSplashScreen = false"
/>
```

### Animations

The animations are defined in `src/styles/main.css`. You can modify these animations to change the visual effects:

```css
@keyframes pulse {
  0% { transform: scale(0.98); opacity: 0.8; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(0.98); opacity: 0.8; }
}

/* Other animations... */
```

### Logo

To change the logo:

1. Replace the file at `public/assets/splash-logo.png` with your new logo
2. Make sure to keep the same filename, or update the path in `SplashScreen.vue`

## Manually Showing the Splash Screen

The splash screen can be shown again by calling the `toggleSplashScreen` method in App.vue. This is currently connected to the Help > About menu option.

```javascript
// In App.vue
methods: {
  toggleSplashScreen() {
    this.showSplashScreen = true;
    // The splash screen will automatically hide itself after the duration
  }
}
```

You can call this method from anywhere in your application to show the splash screen again.