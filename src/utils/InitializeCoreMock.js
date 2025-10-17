// Mock InitializeCore for react-native-web compatibility
// This file provides the necessary initialization for web environments

// Initialize core React Native functionality for web
if (typeof global !== 'undefined') {
  // Ensure global fetch is available
  if (!global.fetch) {
    global.fetch = require('whatwg-fetch');
  }
  
  // Initialize other core functionality as needed
  if (!global.Headers) {
    global.Headers = require('whatwg-fetch').Headers;
  }
  
  if (!global.Request) {
    global.Request = require('whatwg-fetch').Request;
  }
  
  if (!global.Response) {
    global.Response = require('whatwg-fetch').Response;
  }
}

// Export empty object to satisfy module requirements
module.exports = {};
