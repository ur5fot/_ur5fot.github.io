/**
 * Created by Дима on 10.05.2017.
 */
/**
 * Created by Дима on 14.01.2017.
 */
$(function () {
    function domContentLoaded() {
        return new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve))
    }

    function vkInit() {
        return new Promise(function (resolve, reject) {
            VK.init(function (data) {
                resolve(data);
                console.log('VK.init OK')
            }, function (err) {
                console.log('VK.init ошибка');
                reject(onerror(err))
            }, '5.62');
        })
    }

    function delay(value) {
        return new Promise(resolve => setTimeout(resolve, value));
    }


    var vk = {
        api: function (method, options) {
            var _this = this;
            return new Promise((resolve, reject) => {
                    VK.api(method, options, function (data) {
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

    co(function*() {
        yield domContentLoaded();
        yield vkInit();
        VK.callMethod("showSettingsBox", 0);
        yield vk.event('onSettingsChanged');

        var usersGet = yield vk.api('groups.getMembers', {
            group_id: 1644838,
            fields: ' sex, bdate, city, country,   photo_200, lists, domain, has_mobile, contacts, connections, site, education, universities, schools, can_post, can_see_all_posts, can_see_audio, can_write_private_message, status, last_seen, common_count, relation, relatives'
        });
        console.log('usersGet', usersGet);




    }).catch(onerror);

    function onerror(err) {
        console.error(err);
    }


});


