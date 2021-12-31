import express from "express";
import {findUserByToken} from "./Database";

export function authGuard(req: express.Request, res: express.Response, next: Function) {
  const authentication = req.header('Authorization');
  if (!authentication || !authentication.startsWith('Bearer ')) {
    return res.status(401).json("Bearer token not provided");
  }

  const token = authentication.substr(7);
  const user = findUserByToken(token)
  if (user === null) {
    return res.status(401).json("Unknown bearer token")
  }
  res.locals.user = user;

  next();
}
