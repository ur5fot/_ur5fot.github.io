/**
 * Created by Дима on 14.01.2017.
 */
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


    co(function*() {

        yield domContentLoaded();
        yield vkInit();
        // VK.callMethod("showSettingsBox", 0);
        // yield vk.event('onSettingsChanged');
        var newsfeedGet = yield vk.api('newsfeed.get', {count: 200, filters: 'post'});

        var hashtags = yield hashtagsSearch(newsfeedGet.response.items);
        console.log(hashtags);



    }).catch(onerror);

    function onerror(err) {
        console.error(err);
    }


})();

function hashtagsSearch(newsfeedGet) {
    var arrHashtags = [];

    newsfeedGet.forEach(function (item) {

        var txt = item.text,
            arrTxt = txt.split(''),
            flag = -1,
            hashtag = '';

        for (var i = 0; i < arrTxt.length; i++) {

            if (arrTxt[i] === '#') {
                flag = i
            }
            // console.log(flag);

            if (flag >= 0) {
                if (flag !== i && arrTxt[i] === '#') {
                    flag = i;
                    arrHashtags.push(hashtag);
                    hashtag = '';
                }
                if (arrTxt[i] === ' ' || arrTxt.length - 1 === i) {
                    arrHashtags.push(hashtag);
                    hashtag = '';
                    flag = -1

                }
            }

            if (flag >= 0) {
                hashtag =  hashtag + arrTxt[i]  + '';
                // console.log(arrTxt[i])
            }

        }


    });

    return arrHashtags

}

/*

 var feedRow,
 feedRowCount = 1,
 showMoreLink = document.getElementById('show_more_link'),
 wallmorelink = document.getElementById('wall_more_link'),
 adsLeft = document.getElementById('ads_left'),
 def = 0;

 function block() {
 setTimeout(function () {

 if (document.querySelectorAll('.feed_row').length > 0) {
 feedRow = document.querySelectorAll('.feed_row')
 } else if (document.querySelectorAll('.post').length > 0) {
 feedRow = document.querySelectorAll('.post')
 }
 if ( typeof feedRow  === 'object' ) {
 console.log(typeof feedRow);
 for (var i = feedRowCount - 1; i < feedRow.length; i++) {
 if (feedRow[i].querySelector('.wall_marked_as_ads')) {
 feedRow[i].style.display = 'none';
 }
 }
 feedRowCount = feedRow.length;
 }

 }.bind(block), 3000);

 }

 function _feedShowMore() {
 feed.showMore();
 block();
 }

 function _wallShowMore(count) {
 wall.showMore(10);
 block();
 }

 // console.log(feedRow);
 if (showMoreLink) {
 showMoreLink.setAttribute('onclick', 'return _feedShowMore();');
 }
 if (wallmorelink) {
 wallmorelink.setAttribute('onclick', '_wallShowMore(10);');
 }
 adsLeft.style.display = 'none';

 block();

 window.addEventListener('scroll', function (e) {
 var scrolled = window.pageYOffset || document.documentElement.scrollTop,
 hNews = window.pageYOffset || document.documentElement.scrollTop;
 if ((hNews - def) > 50) {
 if ( typeof feedRow  === 'object' ) {
 block();
 }
 }
 def = hNews
 });*/
/**
 * Created by Дима on 16.01.2017.
 */
