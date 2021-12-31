import bodyParser from "body-parser";
import express from "express"
import {authGuard} from "../user/authGuardMiddleware";
import {getAllUsers, User} from "../user/Database";
import {DanceOffDb, isScore, startDance, putViewerScore, putGameScore, closeCurrentDance} from "./Database";

type Response = express.Response<Object, {user: User}>

const app = express();

app.use(authGuard)
app.use(bodyParser.json());

app.get('/', (_req, res) => {
  return res.json(DanceOffDb)
})
app.post('/', (_req, res) => {
  DanceOffDb.currentDance = null;
  DanceOffDb.dances = [];
  return res.sendStatus(204)
})
app.get('/dancers', (_req, res) => {
  return res.json(getAllUsers())
})

app.put('/dance/score/viewer', (req, res: Response) => {
  const score = req.body.score;
  if (!isScore(score)) {
    return res.sendStatus(400)
  }
  try {
    const viewer = res.locals.user.id;
    putViewerScore({viewer, score});
    return res.sendStatus(204);
  } catch (err: any) {
    return res.status(400).send(err.message);
  }
})

app.put('/dance/score/game', (req, res: Response) => {
  const score = req.body.score;
  if (!isScore(score)) {
    return res.sendStatus(400)
  }
  try {
    putGameScore(score);
    return res.sendStatus(204);
  } catch (err: any) {
    return res.status(400).send(err.message);
  }
})

app.post('/dance/start', (req, res) => {
  try {
    startDance(req.body.dancer);
    return res.sendStatus(204);
  } catch (err: any) {
    return res.status(400).send(err.message)
  }
})

app.post('/dance/close', (_req, res) => {
  try {
    closeCurrentDance();
    return res.sendStatus(204)
  } catch (err: any) {
    return res.status(400).send(err.message)
  }
})

app.all('*', (_, res) => res.sendStatus(404))

export default app;
