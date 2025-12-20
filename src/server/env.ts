const { APP_URL, MONGODB_DATABASE, MONGODB_HOST, NODE_ENV, SESSION_SECRET } =
  process.env;

export const getAppURL = () => {
  if (!APP_URL) {
    throw new Error("APP_URL must be set");
  }
  return APP_URL;
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

export const getSessionSecret = () => {
  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set");
  }
  return SESSION_SECRET;
};
