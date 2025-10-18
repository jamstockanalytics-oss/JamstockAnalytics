// Sentry instrumentation file
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://f8312b32c85290431b67ed1c190f25fa@o4510211367632896.ingest.us.sentry.io/4510211418030080",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
