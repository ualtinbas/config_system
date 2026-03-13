<template>
  <main class="login">
    <section class="forms">

        <form class="login" @submit.prevent="login">
            <img src="/codeway_logo.png" alt="Logo" />
            <br><br><br>
            <h2>Please Sign In</h2>
            <input
                type="email"
                placeholder="E-mail Address"
                v-model="login_form.email" />
            <input
                type="password"
                placeholder="Password"
                v-model="login_form.password" />
            <input
            type="submit"
            value="Sign In" />
            <router-link to="/register">I am not a registered user.</router-link>
            <br><br><br>
            <h3>Codeway Ⓒ 2026</h3>
        </form>

    </section>
  </main>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'

export default {
    setup () {
        const login_form = ref({});
        const store = useStore();

        const login = () => {
            store.dispatch('login', login_form.value);
        }

        return {
            login_form,
            login,
        }
    }
}
</script>

<style>
.forms {
    display: flex;
    min-height: 100vh;
}

form {
    flex: 1 1 0%;
    padding: 8rem 1rem 1rem;
}

form.login {
    color: darkblue;
    background-color: #1e1e2d;
    background-image: linear-gradient(
        to bottom right,
        rgba(30, 30, 41) 0%,
        rgba(30, 30, 37) 100%
    );
}

img {
    width: 20%;
}

h2 {
    color: #5d6b80;
    font-size: 2rem;
    margin-bottom: 2rem;
}

h3 {
    color: #65656552;
    font-size: 1rem;
    margin-bottom: 2rem;
}

input {
    appearance: none;
    border: none;
    outline: none;
    background: none;

    display: block;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    font-size: 1.5rem;
    margin-bottom: 2rem;
    padding: 0.5rem 0rem;
}

input:not([type="submit"]) {
    opacity: 0.8;
    transition: 0.4s;
}

input:focus:not([type="submit"]) {
    opacity: 1;
}

input::placeholder {
    color: inherit;
}

form.login input:not([type="submit"]) {
    color: #65656575;
    border-bottom: 2px solid #65656575;
}

form.login input[type="submit"] {
    background-color: rgb(0, 0, 156);
    color: #fff;
    font-weight: 700;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    cursor: pointer;
}
</style>