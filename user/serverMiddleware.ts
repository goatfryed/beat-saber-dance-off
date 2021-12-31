import bodyParser from "body-parser";
import express from "express"
import {loginAsUser, LoginData} from "./Database";
import {authGuard} from "./authGuardMiddleware";

const app = express();

app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const {body} = req;
  if (!("name" in body)) return res.sendStatus(400)
  const user = loginAsUser(body as LoginData)

  res.json(user)
})

app.post('/logout', (_req, res) => {
  return res.sendStatus(200)
})

app.get( "/me", authGuard, (_req, res) => {
  return res.json( res.locals.user.profile )
} )

app.all('*', (_, res) => res.sendStatus(404))

export default app;
