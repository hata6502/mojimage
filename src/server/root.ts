import type { RequestHandler } from "express";

export const getRoot: RequestHandler = async (req, res) => {
  if (req.user) {
    res.redirect(`users/${encodeURIComponent(String(req.user._id))}`);
    return;
  }

  res.redirect("auth/login/google");
};
