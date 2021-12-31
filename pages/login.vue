<template>
  <div class="px-3">
    <form @submit.prevent="userLogin">
      <div class="field">
        <label class="label has-text-warning-light">Dein Name</label>
        <div class="control">
          <input class="input is-white" type="text" placeholder="Nickname" v-model="login.name" />
        </div>
      </div>
      <div class="field is-grouped">
        <button class="button is-primary" type="submit">Submit</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
import {LoginData} from "~/user/Database";

export default defineComponent({
  data() {
    return {
      login: {
        name: '',
        password: 'password'
      } as LoginData
    }
  },
  methods: {
    async userLogin() {
      try {
        await this.$auth.loginWith('local', { data: this.login })
        location.replace("/")
      } catch (err) {
        console.log(err)
      }
    }
  }
})
</script>
