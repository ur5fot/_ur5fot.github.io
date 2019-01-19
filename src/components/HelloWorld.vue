<template>
    <div class="hello">
        <h1>Full Stack веб разработчик</h1>

         <h3>Мои странички:</h3>
        <ul>
            <li><a href="https://www.linkedin.com/in/ur5fot/" target="_blank"
                   rel="noopener">linkedin</a></li>
            <li><a href="https://www.work.ua/resumes/3145909/" target="_blank"
                   rel="noopener">work.ua</a></li>
        </ul>

    </div>
</template>

<script>
    export default {
        name: 'HelloWorld',
        props: {
            msg: String
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h3 {
        margin : 40px 0 0;
    }

    ul {
        list-style-type : none;
        padding         : 0;
    }

    li {
        display : inline-block;
        margin  : 0 10px;
    }

    a {
        color : #42b983;
    }

</style>
