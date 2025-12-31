import expressHelmet from "helmet";

import { getImageBucketName } from "./env.js";

export const helmet = ({ embed }: { embed: boolean }) => {
  const imageBucketURL = `https://storage.googleapis.com/${encodeURIComponent(getImageBucketName())}/`;

  return expressHelmet({
    contentSecurityPolicy: {
      directives: {
        "connect-src": [
          "'self'",
          "https://c.bing.com",
          "https://*.clarity.ms",
          imageBucketURL,
        ],
        "frame-ancestors": [embed ? "*" : "'self'"],
        "img-src": ["'self'", imageBucketURL],
        "script-src": ["'self'", "https://c.bing.com", "https://*.clarity.ms"],
      },
    },
  });
};
