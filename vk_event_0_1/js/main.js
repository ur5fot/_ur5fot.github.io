/**
 * Created by Дима on 29.12.2016.
 */
'use strict';

(function () {
    function domContentLoaded() {
        return new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve))
    }

    function vkInit() {
        return new Promise(function (resolve, reject) {
            VK.init(function () {
                resolve();
                // console.log(data)
            }, function (err) {
                console.log('VK.init ошибка');
                reject(onerror(err))
            }, '5.60');
        })
    }

    function delay(value) {
        return new Promise(resolve => setTimeout(resolve, value));
    }

    //Model

    function addMethods(Class, methods) {
        for (var key in methods)  Class.prototype[key] = methods[key];
        return Class;
    }

    function inherit(Child, Parend) {
        Child.prototype = Object.create(Parend.prototype);
        Child.prototype.constructor = Child;
        return Child;
    }

    var eventMixin = {

        /**
         * Подписка на событие
         * Использование:
         *  menu.on('select', function(item) { ... }
         */
        on: function (eventName, handler) {
            if (!this._eventHandlers) this._eventHandlers = {};
            if (!this._eventHandlers[eventName]) {
                this._eventHandlers[eventName] = [];
            }
            this._eventHandlers[eventName].push(handler);
        },

        /**
         * Прекращение подписки
         *  menu.off('select',  handler)
         */
        off: function (eventName, handler) {
            var handlers = this._eventHandlers && this._eventHandlers[eventName];
            if (!handlers) return;
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i] == handler) {
                    handlers.splice(i--, 1);
                }
            }
        },

        /**
         * Генерация события с передачей данных
         *  this.trigger('select', item);
         */
        trigger: function (eventName /*, ... */) {

            if (!this._eventHandlers || !this._eventHandlers[eventName]) {
                return; // обработчиков для события нет
            }

            // вызвать обработчики
            var handlers = this._eventHandlers[eventName];
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].apply(this, [].slice.call(arguments, 1));
            }
            return

        }
    };

    function Vk() {
        this.val = {};
    }

    addMethods(Vk, eventMixin);
    addMethods(Vk, {
        filter: function (options) {
            var arrCache = {},
                fromArr = options.fromArr.arr,
                fromName = options.fromArr.name + '',
                fromVal = +options.fromArr.val,
                inArr = options.inArr.arr,
                inName = options.inArr.name + '',
                inVal = options.inArr.val,
                that = this;

            for (var i = 0; i < fromArr.length; i++) {
                if (fromArr[i][fromName] === fromVal) {
                    arrCache[inName] = [];
                    for (let key in fromArr[i])  arrCache[key] = fromArr[i][key];
                    arrCache[inName] = inVal.slice();
                    inArr.push(arrCache);
                    return arrCache
                }
            }
        },
        getDateRu: function (dateEventSec) {
            var months = ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
                dateEvent = new Date(dateEventSec),
                fullYearEvent = dateEvent.getFullYear(),
                monthEvent = dateEvent.getMonth(),
                numberEvent = dateEvent.getDate(),
                date = new Date(),
                fullYear = date.getFullYear(),
                month = date.getMonth(),
                number = date.getDate(),
                dateRu = '';
            if (fullYearEvent === fullYear && monthEvent === month && numberEvent === number) {
                dateRu = 'Сегодня'
            } else if (fullYearEvent === fullYear) {
                dateRu = numberEvent + ' ' + months[monthEvent]
            } else {
                dateRu = numberEvent + ' ' + months[monthEvent] + ' ' + fullYearEvent + 'г'
            }
            return dateRu
        },

    });
    function Friends() {
        Vk.apply(this, arguments);
    }

    inherit(Friends, Vk);

    addMethods(Friends, {
        get: function (options) {
            var that = this;
            return new Promise((resolve, reject) => {
                VK.api("friends.get", options, function (friends) {
                        if (friends.response) {
                            // console.log('friendsGet ok', friends);
                            that.val = friends.response;
                            that.trigger('friendsGet', friends);
                            resolve(friends)
                        } else {
                            reject(onerror(friends))
                        }
                    }
                );
            });
        }
    });

    var friends = new Friends();

    function Groups() {
        Vk.apply(this, arguments);
        this.val.items = [];
        this.events = {};
        this.events.items = []
    }

    inherit(Groups, Vk);
    addMethods(Groups, {
        get: function (optins, id) {
            if (id) {
                optins.user_id = id
            }
            var that = this;
            return new Promise(function (resolve, reject) {
                VK.api("groups.get", optins, function (groups) {
                        if (groups.response) {
                            /* var friendGroups = that.filter({
                             fromArr: {
                             arr: friends.val.items,
                             name: 'id',
                             val: id
                             },
                             inArr: {
                             arr: that.val.items,
                             name: 'groups',
                             val: groups.response.items
                             }
                             });*/
                            // console.log('группы + друга that.val', that.val);
                            resolve(groups);

                        } else {
                            reject(onerror(groups));
                        }
                    }
                );
            })
        },
        getEvent: function (date, groups, id) {
            // var groups =  this.get(friends.response.items[i].id, { extended: 1, fields: 'start_date' });
            var userEvents = {};
            userEvents = [];
            // if (!groups.response) {
            //     return groups
            // }
            var that = this;
            groups.response.items.forEach(function (item, j, arr) {
                // console.log('группа друга', item.type);
                if (item.type === 'event') {
                    if (item.start_date > date / 1000) {
                        // console.log('будущее событие ', item);
                        userEvents.push(item);
                    }
                }
            });
            if (userEvents.length > 0) {
                var friendEvents = that.filter({
                    fromArr: {
                        arr: friends.val.items,
                        name: 'id',
                        val: id
                    },
                    inArr: {
                        arr: that.events.items,
                        name: 'events',
                        val: userEvents
                    }
                });
                friendEvents.events.forEach(function (item) {
                    item.start_date_ru = that.getDateRu(item.start_date * 1000);
                });
                friendEvents.events.sort(function (a, b) {
                    return a.start_date - b.start_date
                });
                that.trigger('addEvents', friendEvents);
            }
            return userEvents;
        },
        getById: function (optins, group_id) {
            if (group_id) {
                optins.group_id = group_id
            }
            var that = this;
            return new Promise(function (resolve, reject) {
                VK.api("groups.getById", optins, function (group) {
                        if (group.response) {
                            resolve(group);
                        } else {
                            reject(onerror(group));
                        }
                    }
                );
            })
        }
    });
    var groups = new Groups;

    co(function*() {
        yield domContentLoaded();
        yield vkInit();
        //, count: 30
        var friendsCo = yield friends.get({order: 'hints', fields: ' domain,  city, photo_50, online'});
        var eventsArrs = [],
            date = new Date();
        for (let i = 0; i < friendsCo.response.items.length; i++) {
            try {
                let id = friendsCo.response.items[i].id;
                yield delay(334);
                console.log('-', i + " " + friendsCo.response.items[i].first_name + ' ' + friendsCo.response.items[i].last_name);
                groups.trigger('next', i + 1);
                var groupsCo = yield groups.get({extended: 1, fields: 'start_date'}, id);
                yield groups.getEvent(date, groupsCo, id);
            } catch (err) {
                onerror(err);
            }
        }
    }).catch(onerror);

    function onerror(err) {
        console.error(err);
    }

    // Views

    function VkViews() {
        this.domElems = [];
    }

    addMethods(VkViews, {
        helper: function (Selectors, data) {
            var template = Handlebars.compile($(Selectors).html());
            return template(data)
        }

    });


    function FriendsEvents() {
        VkViews.apply(this, arguments);
        this.x = 0;
        this.y = 0;
        this.timeHover = 0;
    }

    inherit(FriendsEvents, VkViews);
    var friendsEvents = new FriendsEvents;
    var setIN;
    groups.on('addEvents', function (userEvents) {
        var html = friendsEvents.helper('#resultEvent', userEvents);

        console.log('userEvents', userEvents);


        var one = 0;

        var selt = $(html).find('.event-list > h3').mousemove(function (e) {
                var eventPopup = $(this).find('.event-popup');

                if (!friendsEvents.timeHover && !friendsEvents.x && !friendsEvents.y) {


                } else if (Math.floor(e.timeStamp - friendsEvents.timeHover) > 300) {

                    console.log(( e.pageX) + '&&' + ( e.pageY));
                    if (!e.pageX && !e.pageY) {
                        e.pageX =  friendsEvents.x;
                        e.pageY = friendsEvents.y;
                    }
                    if (Math.floor(Math.abs(friendsEvents.x - e.pageX)) < 5 && Math.floor(Math.abs(friendsEvents.y - e.pageY)) < 5) {
                        if (!one) {
                            one = 1;
                            eventPopup.css({left: (e.pageX  + 10) + 'px'});

                            if (($(window).height() - $(this).offset().top) < (eventPopup.height() + 40)) {
                                eventPopup.css({top: 'auto', bottom: '17px'});

                            } else {

                                eventPopup.css({top: '', bottom: ''});


                            }
                        }
                        eventPopup.css('display', '');


                    }
                    friendsEvents.x = e.pageX;
                    friendsEvents.y = e.pageY;
                    friendsEvents.timeHover = e.timeStamp;

                    /*var groupId = $(this).attr('group_id'),
                     eventPopup = $(this).find('.event-popup'),
                     nowX = 0,
                     nowY = 0;
                     // var x = 0, y = 0, timeHover = new Date();


                     nowX = e.pageX;
                     nowY = e.pageY;
                     if (Math.abs(x - nowX) < 2 && Math.abs(y - nowY) < 2 && Math.abs(e.timeStamp - +timeHover) > 333) {
                     /!*console.log('hover', e.pageX);
                     groups.getById({fields: 'city'}, groupId).then(function (res) {
                     console.log(res)
                     })*!/

                     eventPopup.show();

                     if (($(window).height() - $(this).offset().top) < (eventPopup.height())) {
                     // x = e.pageX;
                     // y = e.pageY;
                     eventPopup.css({top: 'auto', bottom: '17px', display: 'block'})
                     } else {
                     // eventPopup.css({top: '', bottom: '', display: 'block'})
                     }

                     } else {
                     eventPopup.hide()
                     }
                     x = nowX;
                     y = nowY;
                     timeHover = e.timeStamp;
                     // delay(333).then(function () {


                     // });
                     // console.log($(window).height());*/

                }

            }
        ).mouseout(function (e) {

        }).hover(function (e) {
            friendsEvents.timeHover = e.timeStamp;
            friendsEvents.x = e.pageX;
            friendsEvents.y = e.pageY;
            one = 0;
            $(this).find('.event-popup').css('display', 'none');
            setIN = setInterval(function () {
                $(this).trigger('mousemove');
            }.bind(this), 333)
        }, function () {
            friendsEvents.timeHover = 0;
            friendsEvents.x = 0;
            friendsEvents.y = 0;
            clearInterval(setIN);
            $(this).find('.event-popup').css('display', '');
        }).end();


        friendsEvents.domElems.add(selt);
        $(result).after(selt);
    });

    groups.on('groupsGet', function (i, arrCache) {

    });

    groups.on('next', function (i) {
        var loading = document.querySelector('.loading'),
            loadingSpan = loading.querySelector('span'),
            prelodResult = document.getElementById('prelod-result');
        loadingSpan.innerHTML = Math.round((i / friends.val.count) * 100);
        if (i === friends.val.count) {
            prelodResult.classList.add('hidden');
            loading.innerHTML = 'Готово'
        }
    });

    domContentLoaded().then(function () {
        var applicationPopup = document.getElementById('application-popup'),
            application = document.querySelector('.application a');
        application.addEventListener('click', function (e) {
        });
        var counterApplication = 0;
        $('body').click(function (e) {
            var t = e.target;
            if (application === t) {
                applicationPopup.classList.toggle('visibly');
                e.preventDefault();
                counterApplication = 1
            } else if (counterApplication) {
                applicationPopup.classList.remove('visibly');
                counterApplication = 0
            }

            /*co(function *() {
             var group = yield groups.getById({group_id:'88618972', fields:'city'});
             console.log(group)
             }).catch(onerror);*/
        });

        friendsEvents.domElems = $('.friend-event');

        // friendsEvents.domElems.find('.event-list').hover(function (e) {
        //     console.log(this)
        //
        // });
    })


})();


