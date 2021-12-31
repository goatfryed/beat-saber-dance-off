<template>
  <div class="host has-text-white">
    <div class="navigation">
      <span>Schön, dass du dabei bist</span>
      <button class="button is-rounded is-success" @click.prevent="logout">
        <span class="icon mr-0">
          <i class="fas fa-user"></i>
        </span>
        {{$auth.user.name}}
      </button>
    </div>
    <template v-if="currentDancer !== null">
      <div>
        <h3 class="subtitle has-text-white mb-1 mt-3 ">Jetzt tanzt {{ currentDancer.name }}</h3>
        <div class="has-text-primary">
          Dein Score: <select-score :selected="currentDance.userScore" @score="handleViewerScore" />
        </div>
        <template v-if="isAdmin">
          <div class="has-text-info">
            Game Score: <select-score :selected="currentDance.gameScore" @score="handleGameScore" />
          </div>
          <div v-if="currentDance.gameScore !== null" class="mt-1">
            <button class="button is-danger" @click="closeDance()">Schließe Wertung</button>
          </div>
        </template>
      </div>
    </template>
    <div class="contestants">
      <h3 class="subtitle has-text-info mb-1 mt-3">Runde {{ this.currentRound }}</h3>
      <ol>
        <li v-for="(dancer) in settledDancers" :key="dancer.id" class="mb-1" :value="dancer.rank + 1">
          <span
            :class="
              dancer.isDancing ? 'has-text-success' :
                dancer.rank % 2 === (settledDancers.length % 2) ? 'has-text-primary' : 'has-text-info'
            "
          >
            <template v-if="isAdmin">
              <button
                v-if="!dancer.isDancing"
                class="button is-primary"
                @click="startDance(dancer.id)"
              >Dance!</button>
            </template>
            {{ dancer.id }}
            {{ dancer.danceCount > 0 ? `(${dancer.score})` : "" }}
            <span v-if="isAdmin">[{{ dancer.danceCount }}]</span>
          </span>
        </li>
        <template v-if="currentDancerData !== null">
          <hr class="has-background-info my-2" />
          <li  class="mb-1" value="0">
          <span class="has-text-success">
            <span class="icon mr-0 dancer-icon">
              💃🕺
            </span>
            {{ currentDancerData.id }}
            {{ currentDancerData.danceCount > 0 ? `(${currentDancerData.score})` : "" }}
          </span>
          </li>
        </template>
        <template v-if="pendingDancers.length > 0">
          <hr class="has-background-info my-2" />
          <li v-for="(dancer,idx) in pendingDancers" :key="dancer.id" class="mb-1" value="0">
          <span
            :class="
              dancer.isDancing ? 'has-text-success' :
                idx % 2 === 0 ? 'has-text-primary' : 'has-text-info'
            "
          >
            <template v-if="isAdmin">
              <button
                v-if="!dancer.isDancing"
                class="button is-primary"
                @click="startDance(dancer.id)"
              >Dance!</button>
            </template>
            {{ dancer.id }}
            {{ dancer.danceCount > 0 ? `(${dancer.score})` : "" }}
            <span v-if="isAdmin">[{{ dancer.danceCount }}]</span>
          </span>
          </li>
        </template>
      </ol>
    </div>
    <div v-if="isAdmin">
      <button class="button is-danger" @click="reset">Reset</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.host {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.icon.dancer-icon {
  width: initial;
}

.navigation {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.3em;
}

.contestants {
  width: fit-content;
  ol {
    li {
      list-style-type: decimal;
      list-style-position: inside;
      > span {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0.3em;
      }
    }
  }
}
</style>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
import SelectScore from "~/components/SelectScore.vue";
import {Dance, DanceOff} from "~/dance-off/Database";
import {UserProfile} from "~/user/Database";
import {VIEWER_SCORE_RATIO} from "~/dance-off/config";
import {mapScoreToText} from "~/dance-off/util";

const REFRESH_DANCE_OFF_INTERVAL_MS = 1500;
const REFRESH_DANCERS_INTERVAL_MS = 10000;

interface Dancer {
  id: string
  isDancing: boolean
  danceCount: number
  gameScoreAvg: number,
  viewerScoreAvg: number,
  scoreAvg: number,
  score: string
}

function sum(a: number|null, b: number|null) { return (a ?? 0) + (b ?? 0) }
function avg(vals: (number|null)[]) {
  return vals.reduce<number>(sum, 0) / Math.max(vals.length,1);
}

function compareDancers(a: Dancer, b: Dancer) {
  const diff = a.scoreAvg - b.scoreAvg;
  if (diff === 0) return a.id.localeCompare(b.id);
  return diff;
}

function comparePrecision(a: number, b: number, precision: number) {
  return Math.round(a * precision) - Math.round(b * precision)
}

export default defineComponent({
  components: {SelectScore},
  data() {
    return {
      danceOff: null as DanceOff|null,
      dancerProfiles: [] as UserProfile[],
      refreshDanceOffJob: -1,
      refreshDancersJob: -1,
    }
  },
  computed: {
    currentDance(): Dance & {userScore: number|null}|null {
      if (this.danceOff === null) return null;
      if (this.danceOff.currentDance === null) return null;
      const dance = this.danceOff.dances[this.danceOff.currentDance] ?? null;
      if (dance === null) return null;
      const userScore = dance.viewerScore.find(it => it.viewer === this.$auth.user.id)?.score ?? null;
      return {
        ...dance,
        userScore,
      }
    },
    currentDancer(): UserProfile|null {
      const dance = this.currentDance;
      if (dance === null) return null;
      return this.dancerProfiles.find(it => it.id === dance.dancer) ?? null;
    },
    currentDancerId(): string|null {
      return this.currentDancer?.id ?? null;
    },
    currentDancerData(): Dancer|null {
        return this.dancers.find( it => it.id === this.currentDancerId) ?? null;
    },
    isAdmin(): boolean {
      return this.danceOff?.admin === this.$auth.user.id

    },
    dancers(): Dancer[] {
      const allDances = this.danceOff?.dances ?? [];
      const dancers = this.dancerProfiles.map(it => {
        const dancesOfDancer = allDances
          .filter((_,key) => key !== this.danceOff?.currentDance )
          .filter(dance => dance.dancer === it.id)
        ;

        const gameScoreAvg = avg(dancesOfDancer.map(it => it.gameScore));
        const viewerScoreAvg = avg(
          dancesOfDancer.map( it => avg(it.viewerScore.map(score => score.score)))
        );
        const scoreAvg = viewerScoreAvg * VIEWER_SCORE_RATIO + gameScoreAvg * (1 - VIEWER_SCORE_RATIO);

        return {
          id: it.id,
          isDancing: this.currentDancerId === it.id,
          dances: dancesOfDancer,
          danceCount: dancesOfDancer.length,
          gameScoreAvg,
          viewerScoreAvg,
          scoreAvg,
          score: mapScoreToText(scoreAvg),
        }
      });
      return dancers.sort( (a,b) => {
        if (a.id === b.id) return 0;
        if (a.danceCount !== b.danceCount) return a.danceCount - b.danceCount;
        if (this.currentDancerId === a.id) return -1;
        if (this.currentDancerId === b.id) return 1;
        const diff = a.scoreAvg - b.scoreAvg;
        if (diff === 0) return a.id.localeCompare(b.id);
        return diff;
      });
    },
    currentRound(): number {
      const rounds = this.dancers.map(it => it.danceCount).reduce((max, curr) => Math.max(max,curr), 0);
      return  Math.max(rounds,1);
    },
    pendingDancers(): Dancer[] {
      const currentRound = this.currentRound
      return this.dancers.filter( it => it.danceCount < currentRound)
        .filter(it => it.id !== this.currentDancerId)
        .sort(compareDancers);
    },
    settledDancers(): (Dancer & {rank: number})[] {
      const currentRound = this.currentRound
      const dancers =  this.dancers.filter( it => it.danceCount >= currentRound)
        .filter(it => it.id !== this.currentDancerId)
        .sort(compareDancers)
        .map(it => ({...it, rank: 0}));
      let prevDancer = null;
      for (const dancer of dancers) {
        if (prevDancer !== null) {
          dancer.rank = comparePrecision(prevDancer.scoreAvg, dancer.scoreAvg, 1000) === 0 ?
            prevDancer.rank : prevDancer.rank + 1;
        }
        prevDancer = dancer;
      }
      return dancers.sort((a,b) => a.rank - b.rank)
    },
  },
  created() {
    this.refreshDanceOff();
    this.refreshDancers();
  },
  mounted() {
    this.refreshDanceOffJob = window.setInterval(this.refreshDanceOff, REFRESH_DANCE_OFF_INTERVAL_MS);
    this.refreshDancersJob = window.setInterval(this.refreshDancers, REFRESH_DANCERS_INTERVAL_MS);
  },
  beforeDestroy() {
    window.clearInterval(this.refreshDanceOffJob);
    window.clearInterval(this.refreshDancersJob);
  },
  methods: {
    async refreshDancers() {
      this.dancerProfiles = await this.$axios.$get("/api/dance-off/dancers", { progress: false });
    },
    async refreshDanceOff() {
      this.danceOff = await this.$axios.$get("/api/dance-off/", { progress: false });
    },
    async handleViewerScore(score: number) {
      await this.$axios.$put("/api/dance-off/dance/score/viewer", { score });
      await this.refreshDanceOff();
    },
    async handleGameScore(score: number) {
      await this.$axios.$put("/api/dance-off/dance/score/game", { score });
      await this.refreshDanceOff();
    },
    async logout() {
      await this.$auth.logout();
      location.replace("/login");
    },
    async startDance(id: string) {
      await this.$axios.$post("/api/dance-off/dance/start", { dancer: id })
      await this.refreshDanceOff();
    },
    async closeDance() {
      await this.$axios.$post("/api/dance-off/dance/close");
      await this.refreshDanceOff();
    },
    async reset() {
      await this.$axios.$post("/api/dance-off/");
      await this.refreshDanceOff();
    }
  }
})
</script>
