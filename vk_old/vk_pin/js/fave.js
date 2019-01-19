/**
 * Created by Дима on 14.01.2017.
 */
(function () {
    function domContentLoaded() {
        return new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve))
    }

    function vkInit() {
        VK.init({
            apiId: 5832516
        });
    }

    function delay(value) {
        return new Promise(resolve => setTimeout(resolve, value));
    }

    //VK.Auth.login
    var vk = {
        api: function (method, options) {
            var _this = this;
            return new Promise((resolve, reject) => {
                VK.Api.call(method, options, function (data) {
                        if (data.response) {
                            resolve(data)
                        } else {
                            reject(onerror(data))
                        }
                    }
                );
            })

        },
        apiAuth: function (options) {
            var _this = this;
            return new Promise((resolve, reject) => {
                VK.Auth.login(options, function (data) {
                        if (data.response) {
                            resolve(data)
                        } else {
                            reject(onerror(data))
                        }
                    }
                );
            })

        },
        event: function (name) {
            return new Promise(resolve => {
                VK.addCallback(name, function f(location) {
                    resolve(location)
                });
            })
        }
    };

    function helper(Selectors, data) {
        var template = Handlebars.compile($(Selectors).html());
        return template(data)
    }

    function load(url) {
        /*[
         'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js',
         'https://vk.com/js/api/xd_connection.js?2'
         ].*/

        if (typeof url === 'string') {
            return new Promise(res => {
                var script = document.createElement('script');
                script.onload = function () {
                    res()
                };
                script.src = url;
                document.head.appendChild(script);
            })
        } else if (typeof  url === 'object') {
            url.forEach(function (item) {
                var script = document.createElement('script');
                script.onload = function () {
                };
                document.head.appendChild(script);
                script.src = item;
            })

        }


    }

    domContentLoaded()
        .then(function () {
            return new Promise(res => {
                var script = document.createElement('script');
                script.onload = function () {
                    res()
                };
                script.src = 'https://vk.com/js/api/openapi.js?137';
                document.head.appendChild(script);
            })
        })
        .then(function () {
            alert('ddd');
            /*VK.init({
                apiId: 5832516
            });*/
        });
        // .then(vk.apiAuth(1));
        // .then(vk.api('users.get'))
        // .then(vk.api('storage.set', {key: 'fave', user_id: 12947807}))
        // .then(function (key) {
        //     console.log('-----key------', key);
        // })



})();
