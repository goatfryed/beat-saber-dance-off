
export type Score = number

export interface ViewerScore {
  viewer: string
  score: Score
}

export interface Dance {
  dancer: string
  gameScore: Score|null
  viewerScore: ViewerScore[]
}

export interface DanceOff {
  admin: string
  currentDance: number|null
  dances: Dance[]
}

export const DanceOffDb: DanceOff = {
  admin: "Omar",
  currentDance: null,
  dances: [],
}

export function guardSelectedDancer(player: string|null): asserts player is string {
  if (player !== null) {
    throw new Error("no player selected")
  }
}

export function isScore(score: number): score is Score {
  return true;
}

function selectCurrentDance() {
  if (DanceOffDb.currentDance === null) throw new Error("no current dance")
  const currentDance = DanceOffDb.dances[DanceOffDb.currentDance];
  if (currentDance === undefined) throw new Error("no current dance");
  return currentDance
}

export function putViewerScore(score: ViewerScore) {
  const dance = selectCurrentDance();
  const currentScore = dance.viewerScore.find(it => it.viewer === score.viewer);
  if (currentScore !== undefined) {
    Object.assign( currentScore, score);
    return;
  }

  dance.viewerScore.push(score);
}
export function putGameScore(score: Score) {
  const dance = selectCurrentDance();
  dance.gameScore = score;
}

export function startDance(dancerId: string) {
  const danceRound = {
    dancer: dancerId, gameScore: null, viewerScore: []
  }
  DanceOffDb.currentDance = DanceOffDb.dances.push(danceRound) - 1;
}

export function closeCurrentDance() {
  DanceOffDb.currentDance = null;
}
