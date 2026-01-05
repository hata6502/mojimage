const {
  APP_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  IMAGE_BUCKET_NAME,
  MONGODB_DATABASE,
  MONGODB_HOST,
  NODE_ENV,
  OPENAI_API_KEY,
  SESSION_SECRET,
} = process.env;

export const getAppURL = () => {
  if (!APP_URL) {
    throw new Error("APP_URL must be set");
  }
  return APP_URL;
};

export const getGoogleClientID = () => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID must be set");
  }
  return GOOGLE_CLIENT_ID;
};

export const getGoogleClientSecret = () => {
  if (!GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET must be set");
  }
  return GOOGLE_CLIENT_SECRET;
};

export const getImageBucketName = () => {
  if (!IMAGE_BUCKET_NAME) {
    throw new Error("IMAGE_BUCKET_NAME must be set");
  }
  return IMAGE_BUCKET_NAME;
};

export const getMongoDBURI = () => {
  if (!MONGODB_HOST || !MONGODB_DATABASE) {
    throw new Error("MONGODB_HOST and MONGODB_DATABASE must be set");
  }
  return `${MONGODB_HOST}/${MONGODB_DATABASE}`;
};

export const getNodeEnv = () => {
  if (NODE_ENV !== "development" && NODE_ENV !== "production") {
    throw new Error("NODE_ENV must be set to either development or production");
  }
  return NODE_ENV;
};

export const getOpenAIAPIKey = () => {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY must be set");
  }
  return OPENAI_API_KEY;
};

export const getSessionSecret = () => {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }
  return SESSION_SECRET;
};
