(function () {
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
        var dateFullYear = new Date().getFullYear();
        var date = new Date();
        yield domContentLoaded();
        yield vkInit();
        VK.callMethod('showSettingsBox', 262146);
        yield vk.event('onSettingsChanged');


        $('#exCsv').submit(co.wrap(function *(e) {

            e.preventDefault();

            $(this).find('button').html('идет экспорт');

            var beforeCsv = $('#before-csv').val();

            var objCsv = Papa.parse(beforeCsv, {
                delimiter: ";",	// auto-detect
                newline: "",	// auto-detect
                quoteChar: '"',
                header: true,
                dynamicTyping: false,
                preview: 0,
                encoding: "",
                worker: false,
                comments: false,
                step: undefined,
                complete: undefined,
                error: undefined,
                download: false,
                skipEmptyLines: false,
                chunk: undefined,
                fastMode: undefined,
                beforeFirstChunk: undefined,
                withCredentials: undefined
            });

            console.log(objCsv);

            var bitrixData = [];

            for (var i = 0; i < objCsv.data.length; i++) {
                var id = 0;
                if (objCsv.data[i]["Контакт ВКонтакте "]) {
                    id = objCsv.data[i]["Контакт ВКонтакте "].slice(5);
                    var d = yield vk.api('users.get', {
                        user_ids: id,
                        fields: '  photo_200, photo_400, photo_50, photo_100'
                    });

                    console.log(d);

                    objCsv.data[i]["Фотография"] = d.response["0"].photo_200 || d.response["0"].photo_400 || d.response["0"].photo_50 || d.response["0"].photo_100 || ''
                }

                yield delay(333);
            }


            console.log(objCsv.data);

            $('#after-csv').html(Papa.unparse(objCsv.data, {
                         quotes: false,
                         quoteChar: '"',
                         delimiter: ";",
                         header: true,
                         newline: "\r\n"
                         }));

            /*        var users = yield vk.api('users.get', {
             user_ids: usersId.response.items.join(', '),
             fields: ' verified, sex, bdate, city, country, home_town, photo_200, photo_400, domain, has_mobile, contacts, site, education, universities, schools, status, followers_count, common_count, occupation, nickname, relatives, relation, personal, connections, exports, wall_comments, activities, interests, music, movies, tv, books, games, about, quotes, can_post, can_write_private_message, can_send_friend_request, is_favorite, is_hidden_from_feed, timezone, screen_name, maiden_name,  career, military, blacklisted, blacklisted_by_me'
             });

             console.log('users', users);

             var bitrixData = [];
             //bitrixData.response = [];
             //var item = {};

             users.response.forEach(function (d) {

             //var user = users ;

             var bdate = d.bdate || '01.01.1900';

             var obj_1 = {
             'Имя': d.first_name || '',
             'Отчество': '',
             'Фамилия': d.last_name || '',
             'Дата рождения': (bdate.split('.').length > 2) ? d.bdate : d.bdate + '.1900',
             'Фотография': d.photo_200 || '',
             'Компания': d.career ? d.career.company : '',
             'Ответственный': '',
             'Адрес': '',
             'Улица': '',
             'Квартира': '',
             'Город': d.city ? d.city.title : '',
             'Район': '',
             'Область': '',
             'Индекс': '',
             'Страна': d.country ? d.country.title : '',
             'Рабочий телефон': '',
             'Мобильный телефон': '',
             'Номер факса': '',
             'Домашний телефон': d.home_phone || '',
             'Номер пейджера': '',
             'Другой телефон': '',
             'Корпоративный сайт': '',
             'Личная страница': d.site || '',
             'Страница Facebook': d.facebook || '',
             'Страница ВКонтакте ': d.domain || '',
             'Страница LiveJournal': d.livejournal || '',
             'Микроблог Twitter': d.twitter || '',
             'Другой сайт': '',
             'Рабочий e-mail': '',
             'Частный e-mail': '',
             'Другой e-mail': '',
             'Контакт Facebook': '',
             'Контакт Telegram': '',
             'Контакт ВКонтакте': 'write' + d.id,
             'Контакт Skype': '',
             'Контакт Viber': '',
             'Комментарии Instagram': '',
             'Контакт Битрикс24.Network': '',
             'Онлайн-чат': '',
             'Контакт Открытая линия': '',
             'Контакт ICQ': '',
             'Контакт MSN/Live!': '',
             'Контакт Jabber': '',
             'Другой контакт': '',
             'Должность': '',
             'Комментарий': '',
             'Тип контакта': '',
             'Источник': 'vk.com',
             'Дополнительно об источнике': '',
             'Экспорт': 'да',
             'Доступен для всех': 'да'

             };

             bitrixData.push(obj);
             });


             $('#json').html(Papa.unparse(bitrixData, {
             quotes: false,
             quoteChar: '"',
             delimiter: ";",
             header: true,
             newline: "\r\n"
             }));

             $('#exCsv').find('button').html('повторить экспорт');

             //<button id=button1 onclick=CopyToClipboard("json")>Скопировать</button>
             $('#wrap-btn').html('скопируйте и сохраниет в файле')
             */
        }));


    }).catch(onerror);

    function onerror(err) {
        console.error(err);
    }


})();
