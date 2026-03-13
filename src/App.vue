<template>
  <router-view/>
</template>

<script>
import { onBeforeMount, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  setup() {
    const store = useStore()

    store.dispatch('createDocument')

    store.dispatch('fetchDocuments')
    const documents = computed(() => store.getters.getDocuments)

    store.dispatch('updateDocument', { id: 'documentId', data: { name: "Updated Name" } })

    store.dispatch('deleteDocument', 'documentId')

    onBeforeMount(() => {
      store.dispatch('fetchUser')
    })
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
