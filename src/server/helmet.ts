import expressHelmet from "helmet";

export const helmet = expressHelmet({
  contentSecurityPolicy: {
    directives: {
      "connect-src": ["'self'", "https://c.bing.com", "https://*.clarity.ms"],
      "script-src": ["'self'", "https://c.bing.com", "https://*.clarity.ms"],
    },
  },
});
