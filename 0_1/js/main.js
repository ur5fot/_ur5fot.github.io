document.addEventListener('DOMContentLoaded', function () {
    VK.init(function () {
        friendsGet();
    }, function () {
        console.log('Ошибка VK')
    }, '5.45');
});

function friendsGet() {
    VK.api("friends.get", {
        fields: ' domain,  city, photo_50, online'
        , order: 'hints'
    }, function (data) {
        console.log(data);

        //записует значение ключа пеорозовывая в сторку объект
        function storageSet(_key, _value, _func) {
            var arr = [];
            if (_value) {
                for (var i = 0; i < _value.length; i++) {
                    arr.push(_value[i].join(':'));
                }
                VK.api('storage.set', {key: _key, value: arr.join(',')}, function (data) {
                    if (data.response === 1) {
                        _func()
                    }
                });
            } else if (_value === '') {
                VK.api('storage.set', {key: _key, value: ''}, function (data) {
                    if (data.response) {
                        console.log('delete  ' + _key)
                    }
                });
            }

        }

        // вызов storage VK по ключу  и перадает результат ключа, переоброзоать строку в масив с объектами в фунцию _func
        function storageGet(_key, _func) {
            VK.api('storage.get', {key: _key}, function (data) {
                var arr = [];
                if (data.response) {
                    var arrData = data.response.split(',');
                    for (var i = 0; i < arrData.length; i++) {
                        var chat = arrData[i].split(':');
                        arr.push(chat)
                    }
                    _func(arr);
                } else if (data.response === '') {
                    _func(arr);
                }
            });
        }


        var main = document.getElementById('main'),
            result = document.querySelector('.result'),
            loading = document.querySelector('.loading'),
            prelod = document.querySelector('#prelod'),
            topFixed = document.querySelector('.top-fixed');


        var friendsEvents = {};
        friendsEvents.menuSearch = {};
        friendsEvents.menuSearch.ignoreList = {};
        friendsEvents.menuSearch.ignoreList.count = 0;
        friendsEvents.menuSearch.ignoreList.items = [];

        friendsEvents.menuSearch.btnSearch = 'Поиск';

        friendsEvents.result = [];

        if (data.response) {
            storageGet('ignoreList', function (arr) {
                console.log(arr);
                var friends = data.response.items;
                if (arr) {
                    friendsEvents.menuSearch.ignoreList.count = arr.length;
                    for (var i = 0; i < arr.length; i++) {
                        friendsEvents.menuSearch.ignoreList.items.push({
                            id: arr[i][0],
                            domain: arr[i][1],
                            name: arr[i][2]
                        })
                    }
                }
                prelod.classList.add('hidden');
                var menuSearchTemplate = Handlebars.compile(document.getElementById('menu-search').innerHTML);

                main.insertAdjacentHTML('afterBegin', menuSearchTemplate(friendsEvents.menuSearch));

                var btnSearch = document.querySelector('.btn-search'),
                    summary = document.querySelector('.summary'),
                    ignoreCount = document.querySelector('.ignoreCount'),
                    closed = document.querySelectorAll('.closed'),
                    loadingCount = document.querySelector('.loading-count'),

                    _nclickBtnSearch = 0;

                var ignoreList = document.querySelector('.ignore-list'),
                    ignoreListItems = document.querySelectorAll('.ignore-list a');

                btnSearch.addEventListener('click', function () {
                    if (!_nclickBtnSearch) {
                        _nclickBtnSearch = 1;
                    } else {
                        _nclickBtnSearch = 0;
                    }
                    if (_nclickBtnSearch) {
                        result.innerHTML = '';
                        friendsEvents.menuSearch.btnSearch = 'Остановить';
                        btnSearch.innerHTML = friendsEvents.menuSearch.btnSearch;
                        //console.log(friendsEvents.menuSearch.btnSearch);
                        var dat = new Date(),
                            groups = [],
                            _time = 0,
                            i = 0,
                            getFlag = 0,
                            ignoreFlag = 0;
                        //_for = 0;

                        topFixed.classList.add('visibly');
                        prelod.classList.remove('hidden');
                        console.log(friendsEvents.menuSearch.ignoreList.items);

                        var timeId = setTimeout(function searchEvent() {
                            console.log(i + " : " + friends[i].id);
                             getFlag = 0;
                            var interest = Math.round(i / friends.length * 100);
                            loading.innerHTML = 'Поиск: ' + interest + '%';

                            if (find(+friendsEvents.menuSearch.ignoreList.items, +friends[i].id) === -1) {
                                getFlag = 1;
                                VK.api("groups.get", {
                                    user_id: friends[i].id,
                                    extended: 1,
                                    fields: 'finish_date, start_date'
                                }, function (dataGroups) {
                                    if (dataGroups.response) {
                                        var groups = dataGroups.response.items,
                                            _event = [],
                                            _user = {};
                                        for (var p = 0; p < groups.length; p++) {

                                            if (groups[p].type === 'event' && +groups[p].finish_date > (dat / 1000)) {
                                                _event.push({
                                                    name: groups[p].name,
                                                    screen_name: groups[p].screen_name
                                                });
                                            }

                                        }
                                        if (_event.length > 0) {

                                            _user.domain = friends[i].domain;
                                            _user.first_name = friends[i].first_name;
                                            _user.last_name = friends[i].last_name;
                                            if (friends[i].online) {
                                                _user.online = 'online';
                                            } else {
                                                _user.online = '';
                                            }
                                            _user.photo_50 = friends[i].photo_50;
                                            _user.city = friends[i].city ? friends[i].city.title : '';
                                            _user.id = friends[i].id;
                                            _user.events = _event;
                                            friendsEvents.result.push(_user);
                                            var resultTemplate = Handlebars.compile(document.getElementById('resultEvent').innerHTML);
                                            result.insertAdjacentHTML('beforeEnd', resultTemplate(_user));
                                            console.log(_user);
                                        }

                                    } else {
                                        console.log(dataGroups.error.error_msg);


                                    }
                                    getFlag = 2;
                                });
                            } else {
                                getFlag = 3;
                            }

                            //time(getFlag, function () {
                            var subTimeId = setTimeout(function time() {
                                if (getFlag > 1) {
                                    i++;
                                    if (i < friends.length && _nclickBtnSearch) {
                                        if (getFlag === 2) {
                                            timeId = setTimeout(searchEvent(), 350)
                                        } else if (getFlag === 3) {
                                            timeId = setTimeout(searchEvent(), 50)
                                        }
                                    } else {
                                        resetSearch();
                                        return
                                    }
                                } else {
                                    subTimeId = setTimeout(time, 350)
                                }
                            }, 4);


                            //})


                        }, 350);

                    }

                });

                function time(flag, func) {
                    if (flag) {
                        func();
                    } else {
                        setTimeout(time, 100)
                    }
                }

                function find(arr, value) {
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i].id === value) {
                            return +i;
                        }
                    }
                    return -1;
                }

                function resetSearch() {
                    _nclickBtnSearch = 0;
                    friendsEvents.menuSearch.btnSearch = 'Поиск';
                    btnSearch.innerHTML = friendsEvents.menuSearch.btnSearch;
                    loadingCount.innerHTML = '0%';
                    topFixed.classList.remove('visibly');
                    prelod.classList.add('hidden');
                }

                if (ignoreList) {
                    ignoreList.addEventListener('click', function (e) {

                        var t = e.target;
                        var friendEvents = result.querySelectorAll('.friend-event');
                        if (t.hasAttributes('friendsId')) {
                            e.preventDefault();
                            storageGet('ignoreList', function (arr) {
                                for (var i = 0; i < arr.length; i++) {
                                    if (+arr[i][0] === +t.getAttribute('friendsId')) {
                                        arr.splice(i, 1);
                                        storageSet('ignoreList', arr, function () {
                                            ignoreCount.innerHTML = arr.length;
                                            friendsEvents.menuSearch.ignoreList.count = arr.length;
                                            for (var k = 0; k < friendsEvents.menuSearch.ignoreList.items.length; k++) {
                                                if (+friendsEvents.menuSearch.ignoreList.items[k].id === +t.getAttribute('friendsId')) {
                                                    friendsEvents.menuSearch.ignoreList.items.splice(k, 1);
                                                    //console.log(friendsEvents.menuSearch.ignoreList.items)
                                                }
                                            }
                                            for (var j = 0; j < friendEvents.length; j++) {
                                                if (+friendEvents[j].getAttribute('friendsId') === +t.getAttribute('friendsId')) {
                                                    friendEvents[j].style.display = '';
                                                }
                                            }
                                            t.parentNode.style.display = 'none';
                                        });
                                    }
                                }

                            });
                        }
                    });
                }
                result.addEventListener('click', function (e) {
                    var t = e.target;
                    if (t.hasAttribute('closed')) {
                        var _parent = t.parentNode;
                        e.preventDefault();
                        storageGet('ignoreList', function (resultArr) {
                            var ignoreListItemsAdd = {},
                                summ = [],
                                flag = 0;

                            for (var i = 0; i < friendsEvents.result.length; i++) {
                                if (+friendsEvents.result[i].id === +_parent.getAttribute('friendsId')) {
                                    ignoreListItemsAdd = {
                                        id: friendsEvents.result[i].id,
                                        domain: friendsEvents.result[i].domain,
                                        name: friendsEvents.result[i].first_name + " " + friendsEvents.result[i].last_name
                                    };
                                    resultArr.push([
                                        friendsEvents.result[i].id,
                                        friendsEvents.result[i].domain,
                                        friendsEvents.result[i].first_name + " " + friendsEvents.result[i].last_name
                                    ]);
                                    break
                                }
                            }


                            var ignoreLis = document.querySelector('.ignore-list');
                            storageSet('ignoreList', resultArr, function () {
                                ignoreCount.innerHTML = resultArr.length;

                                _parent.style.display = 'none';

                                for (var i = 0; i < ignoreListItems.length; i++) {
                                    if (+ignoreListItems[i].getAttribute('friendsId') === +_parent.getAttribute('friendsId')) {
                                        ignoreListItems[i].parentNode.style.display = '';
                                        //flag = 1;
                                    }
                                }
                                friendsEvents.menuSearch.ignoreList.items.push(ignoreListItemsAdd);
                                var ignoreListAddTemplate = Handlebars.compile(document.getElementById('menu-search-item').innerHTML);
                                ignoreLis.insertAdjacentHTML('afterBegin', ignoreListAddTemplate(ignoreListItemsAdd))

                            });
                        });
                    }
                });
            });
        }

    });
}


function groupsFor() {
    _time = 0;
    _for = 0;
    VK.api("groups.get", {
        user_id: friends[i].id,
        extended: 1,
        fields: 'finish_date, start_date, place'
    }, function (dataGroups) {
        if (dataGroups.response) {
            var groups = dataGroups.response.items,
                _groups = 0;
            var userEvent = {};
            userEvent.events = [];
            for (var p = 0; p < groups.length; p++) {

                if (groups[p].type === 'event' && +groups[p].finish_date > (dat / 1000)) {
                    var _event = {
                        name: groups[p].name,
                        screen_name: groups[p].screen_name
                    };
                    userEvent.events.push(_event);
                }

            }
            if (userEvent.events.length > 0) {
                userEvent.domain = friends[i].domain;
                userEvent.first_name = friends[i].first_name;
                userEvent.last_name = friends[i].last_name;
                if (friends[i].online) {
                    userEvent.online = 'online';
                } else {
                    userEvent.online = '';
                }
                userEvent.photo_50 = friends[i].photo_50;
                userEvent.city = friends[i].city ? friends[i].city.title : '';
                userEvent.id = friends[i].id;

                if (ignoreListArr1) {
                    for (var j = 0; j < ignoreListArr1.length; j++) {
                        if (+ignoreListArr1[j][0] === friends[i].id) {
                            userEvent.hidden = 'hidden';
                            break
                        }
                    }
                }


                var resultTemplate = Handlebars.compile(document.getElementById('resultEvent').innerHTML);


                result.insertAdjacentHTML('beforeEnd', resultTemplate(userEvent));

                console.log(userEvent);
            }
            if (p >= groups.length) {
                _time = 1;
            }
        } else {
            _time = 1;
        }


        var interest = Math.round((i + 1) / friends.length * 100);
        loading.innerHTML = 'Поиск: ' + interest + '%';

        console.log(i);

        i++;
        if (!_nclickBtnSearch) {
            btnSearch.innerHTML = 'Поиск';
            loading.innerHTML = 'Поиск: ' + '0' + '%';
            topFixed.classList.remove('visibly');
            //for (var jj = 0; j < closed.length; jj++) {
            //    closed[jj].classList.remove('hidden');
            //
            //}
        }

    });

    //setTimeout(function time() {
    //
    //    if (i < friends.length && _nclickBtnSearch) {
    //        if (!_time) {
    //            setTimeout(time, 100)
    //        } else {
    //            var flag = 0;
    //            for (var ii = 0; ii < ignoreListItems.length; ii++) {
    //                if (+ignoreListItems[ii].getAttribute('friendsid') === +friends[i].id) {
    //                    flag = 1;
    //                    break
    //                }
    //            }
    //            if (flag === 1) {
    //                i++;
    //                _nclickBtnSearch = 1;
    //                //console.log(i);
    //                time();
    //
    //            } else {
    //                setTimeout(groupsFor, 334);
    //            }
    //        }
    //    } else {
    //        _nclickBtnSearch = 0;
    //        btnSearch.innerHTML = 'Поиск';
    //        loading.innerHTML = 'Поиск: ' + '0' + '%';
    //        topFixed.classList.remove('visibly');
    //        prelodResult.classList.remove('visibly');
    //        //for (var j = 0; j < closed.length; j++) {
    //        //    closed[j].classList.remove('hidden');
    //        //}
    //    }
    //}, 4);

}