/**
 * Created by ur5fot on 21.01.16.
 */

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
            } else if(_value === ''){
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
                if (data.response) {
                    var arrData = data.response.split(','),
                        arr = [];
                    for (var i = 0; i < arrData.length; i++) {
                        var chat = arrData[i].split(':');
                        arr.push(chat)
                    }
                    _func(arr);
                }
            });
        }

        var main = document.getElementById('main'),
            result = document.querySelector('.result'),
            loading = document.querySelector('.loading'),
            prelodMenu = document.querySelector('#prelod-menu'),
            topFixed = document.querySelector('.top-fixed');

        if (data.response) {
            storageGet('ignoreList', function (arr) {
                    console.log(arr);
                    var menuSearchTemplate = Handlebars.compile(document.getElementById('menu-search').innerHTML);
                    var friends = data.response.items,
                        menuSearch = {},
                        _sex = {};
                    menuSearch.city = [];
                    menuSearch.sex = [];
                    menuSearch.ignoreList = [];
                    //console.log(storageGet('333'));
                    //localStorage.ignor = '';
                    if (arr) {
                        menuSearch.ignoreCount = arr.length;
                        for (var i = 0; i < arr.length; i++) {
                            menuSearch.ignoreList.push({
                                id: arr[i][0],
                                domain: arr[i][1],
                                name: arr[i][2]
                            })
                        }
                    } else {
                        menuSearch.ignoreCount = 0;
                    }

                    prelodMenu.remove();
                    main.insertAdjacentHTML('afterBegin', menuSearchTemplate(menuSearch));

                    console.log(menuSearch.ignoreList);

                    var btnSearch = document.querySelector('.btn-search'),
                        summary = document.querySelector('.summary'),
                        prelodResult = document.getElementById('prelod-result'),
                        ignoreCount = document.querySelector('#ignoreCount'),
                        closed = document.querySelectorAll('.closed'),

                        _nclickBtnSearch = 0;

                    btnSearch.addEventListener('click', function () {
                            if (!_nclickBtnSearch) {
                                _nclickBtnSearch = 1;
                            } else {
                                _nclickBtnSearch = 0;
                            }
                            if (_nclickBtnSearch) {
                                result.innerHTML = '';
                                btnSearch.innerHTML = 'Остановить';


                                var dat = new Date(),
                                    i = 0,
                                    groups = [],
                                    _time = 0,
                                    _for = 0,
                                    userEvent = {};


                                topFixed.classList.add('visibly');
                                prelodResult.classList.add('visibly');
                                //for (var j = 0; j < closed.length; j++) {
                                //    closed[j].classList.add('hidden');
                                //}


                                setTimeout(function groupsFor() {
                                    _time = 0;
                                    _for = 0;
                                    storageGet('ignoreList', function (ignoreListArr1) {
                                        VK.api("groups.get", {
                                            user_id: friends[i].id,
                                            extended: 1,
                                            fields: 'finish_date, start_date, place'
                                        }, function (dataGroups) {
                                            if (dataGroups.response) {


                                                var groups = dataGroups.response.items,
                                                    _groups = 0;
                                                //console.log(groups);
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
                                    });
                                    setTimeout(function time() {

                                        if (i < friends.length && _nclickBtnSearch) {
                                            if (!_time) {
                                                setTimeout(time, 100)
                                            } else {
                                                var flag = 0;
                                                for (var ii = 0; ii < ignoreListItems.length; ii++) {
                                                    if (+ignoreListItems[ii].getAttribute('friendsid') === +friends[i].id) {
                                                        flag = 1;
                                                        break
                                                    }
                                                }
                                                if (flag === 1) {
                                                    i++;
                                                    _nclickBtnSearch = 1;
                                                    //console.log(i);
                                                    time();

                                                } else {
                                                    setTimeout(groupsFor, 334);
                                                }
                                            }
                                        } else {
                                            _nclickBtnSearch = 0;
                                            btnSearch.innerHTML = 'Поиск';
                                            loading.innerHTML = 'Поиск: ' + '0' + '%';
                                            topFixed.classList.remove('visibly');
                                            prelodResult.classList.remove('visibly');
                                            //for (var j = 0; j < closed.length; j++) {
                                            //    closed[j].classList.remove('hidden');
                                            //}
                                        }
                                    }, 4);

                                }, 334);

                            }


                        }
                    );
                    var ignoreList = document.getElementById('ignore-list'),
                        ignoreListItems = document.querySelectorAll('#ignore-list a');

                    //summary.addEventListener('click', function () {
                    //    //localStorage.ignor = ''
                    //});
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
                                            console.log(arr);
                                            storageSet('ignoreList', arr, function () {
                                                ignoreCount.innerHTML = arr.length;
                                                for (var j = 0; j < friendEvents.length; j++) {
                                                    if (+friendEvents[j].getAttribute('friendsid') === +t.getAttribute('friendsId')) {
                                                        friendEvents[j].style.display = '';
                                                        friendEvents[j].classList.remove('hidden');
                                                        break
                                                    }
                                                }
                                                t.parentNode.style.display = 'none';
                                            });

                                            break
                                        }
                                    }

                                });
                            }
                        });
                    }

                }
            );
        }


//storageSet('ignoreList', '');
        result.addEventListener('click', function (e) {
            var t = e.target;
            if (t.hasAttribute('closed')) {
                var _parent = t.parentNode;
                e.preventDefault();
                storageGet('ignoreList', function (resultArr) {
                    var _arr = [],
                        summ = [],
                        flag = 0;
                    var dataUser = [_parent.getAttribute('friendsId'), _parent.getAttribute('friendsDomain'), _parent.getAttribute('friendsname')];
                    if (resultArr) {
                        resultArr.push(dataUser);
                        summ = resultArr;
                    } else {
                        _arr.push(dataUser);
                        summ = _arr;
                    }

                    var ignoreLis = document.getElementById('ignore-list');
                    storageSet('ignoreList', summ, function () {
                        ignoreCount.innerHTML = summ.length;

                        _parent.style.display = 'none';

                        for (var i = 0; i < ignoreListItems.length; i++) {
                            if (+ignoreListItems[i].getAttribute('friendsid') === +_parent.getAttribute('friendsId')) {
                                ignoreListItems[i].parentNode.style.display = '';
                                flag = 1;
                                break
                            }
                        }

                        if (!flag) {
                            var ignoreListItemsAdd = {
                                id: _parent.getAttribute('friendsId'),
                                domain: _parent.getAttribute('friendsDomain'),
                                name: _parent.getAttribute('friendsname')
                            };
                            var ignoreListAddTemplate = Handlebars.compile(document.getElementById('menu-search-item').innerHTML);
                            ignoreLis.insertAdjacentHTML('afterBegin', ignoreListAddTemplate(ignoreListItemsAdd))
                        }
                    });
                });
            }
        });
    })
    ;
}


function timeFor(length, delay, func) {
    var i = 0;
    setTimeout(function _For() {
        func();
        if (i < length) {
            setTimeout(_For, delay);
        }
        i++;
    }, delay)
}