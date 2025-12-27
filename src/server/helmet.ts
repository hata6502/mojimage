import expressHelmet from "helmet";

import { getImageBucketName } from "./env.js";

export const helmet = expressHelmet({
  contentSecurityPolicy: {
    directives: {
      "connect-src": ["'self'", "https://c.bing.com", "https://*.clarity.ms"],
      "img-src": [
        "'self'",
        `https://storage.googleapis.com/${getImageBucketName()}/`,
      ],
      "script-src": ["'self'", "https://c.bing.com", "https://*.clarity.ms"],
    },
  },
});
