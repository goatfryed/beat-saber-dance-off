<template>
  <div class="buttons has-addons">
    <template v-for="score in scores" >
      <button
          :key="score.value"
          :class="
            [
              'button',
              score.value === selected ? 'is-warning' : 'is-white'
            ]
          "
          @click="$emit('score', score.value)"
      >{{score.label}}</button>
    </template>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
import {mapScoreToText} from "~/dance-off/util";

export default defineComponent({
  props: {
    selected: {
      type: Number,
      default: null,
    },
  },
  data() {
    const scores = new Array(7).fill(null)
      .map((_,value) => ({value, label: mapScoreToText(value)}))
    return {
      scores,
    }
  }
})
</script>
