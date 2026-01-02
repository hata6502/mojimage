import expressHelmet from "helmet";

import { getImageBucketName } from "./env.js";

export const helmet = ({
  corp,
  embed,
}: {
  corp: "cross-origin" | "same-origin";
  embed: boolean;
}) => {
  const imageBucketURL = `https://storage.googleapis.com/${encodeURIComponent(getImageBucketName())}/`;

  return expressHelmet({
    crossOriginResourcePolicy: { policy: corp },
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
