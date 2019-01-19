<template>
    <div id="app">
        <img class="avatar" src="./assets/logo.png">
      
        <HelloWorld />
    </div>
</template>

<script>
    import HelloWorld from './components/HelloWorld.vue'

    export default {
        name: 'app',
        components: {
            HelloWorld
        }
    }
</script>

<style lang="scss">
    body {
        background : #2c3e50;
        color      : #eee;
    }

    #app {
        font-family             : 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing  : antialiased;
        -moz-osx-font-smoothing : grayscale;
        text-align              : center;

        /*margin-top: 60px;*/
        .avatar{
            border-radius : 50%;
        }
    }
</style>
