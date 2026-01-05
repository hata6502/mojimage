import express from "express";
import { ObjectId } from "mongodb";
import type { WithId } from "mongodb";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { getAppURL, getGoogleClientID, getGoogleClientSecret } from "./env.js";
import { federatedCredentialCollection } from "./federated-credential.js";
import { mongoClient } from "./mongodb.js";
import { userCollection } from "./user.js";
import type { UserDocument } from "./user.js";

declare global {
  namespace Express {
    interface User extends WithId<UserDocument> {}
  }
}

export const authRouter = express.Router({ strict: true });

passport.serializeUser<string>((user, done) => {
  try {
    done(null, String(user._id));
  } catch (exception) {
    done(exception);
  }
});

passport.deserializeUser<string>(async (id, done) => {
  try {
    done(null, await userCollection.findOne({ _id: new ObjectId(id) }));
  } catch (exception) {
    done(exception);
  }
});

const googleStrategy = new GoogleStrategy(
  {
    clientID: getGoogleClientID(),
    clientSecret: getGoogleClientSecret(),
    callbackURL: String(new URL("auth/oauth2/redirect/google", getAppURL())),
    scope: ["email", "profile"],
    state: true,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      if (!profile.emails || profile.emails.every((email) => !email.verified)) {
        throw new Error("No email found");
      }
      const emails = profile.emails;

      const federatedCredential = await federatedCredentialCollection.findOne({
        provider: "https://accounts.google.com",
        subject: profile.id,
      });

      const userID = await mongoClient.withSession((session) =>
        session.withTransaction(async (session) => {
          const user = {
            emails,
            name: profile.displayName,
            photos: profile.photos,
          };

          if (federatedCredential) {
            await userCollection.updateOne(
              { _id: federatedCredential.userID },
              { $set: user },
              { session },
            );

            return federatedCredential.userID;
          } else {
            const userInsertOneResult = await userCollection.insertOne(user, {
              session,
            });

            await federatedCredentialCollection.insertOne(
              {
                provider: "https://accounts.google.com",
                subject: profile.id,
                userID: userInsertOneResult.insertedId,
              },
              { session },
            );

            return userInsertOneResult.insertedId;
          }
        }),
      );

      const user = await userCollection.findOne({ _id: userID });
      if (!user) {
        throw new Error("User not found");
      }
      done(null, user);
    } catch (exception) {
      done(exception);
    }
  },
);
passport.use(googleStrategy);

authRouter.get("/login/google", passport.authenticate("google"));

authRouter.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/",
  }),
);
