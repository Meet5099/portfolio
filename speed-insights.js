// Vercel Speed Insights initialization
import { injectSpeedInsights } from 'https://unpkg.com/@vercel/speed-insights@2.0.0/dist/index.mjs';

// Initialize Speed Insights
injectSpeedInsights({
  debug: false, // Set to true to enable debug logging in development
});
