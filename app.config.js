module.exports = {
  "expo": {
    "name": "JamStockAnalytics",
    "slug": "jamstockanalytics",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./public/logo.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./public/logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./public/logo.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./public/logo.png",
      "bundler": "metro",
      "output": "static",
      "build": {
        "babel": {
          "include": [
            "@babel/plugin-proposal-export-namespace-from"
          ]
        }
      }
    },
    "plugins": [
      "expo-router"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "545b242a-575b-4b76-b6c3-8db8cac9b1bb"
      }
    }
  }
};