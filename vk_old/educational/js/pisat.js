$(function () {
    var form = $('.form'),
        soundTrue = $('#true'),
        soundFalse = $('#false');

    var pisat = $('#pisat');
    var rnd = 0,
        rndThat = 0;

    sound();
    count(rnd);
    $('#say').click(function (e) {
        sound(rnd);
    });
    pisat.submit(function (e) {
        if (rnd === +pisat.find('[name = result]').val()) {
            soundTrue.trigger('play');

            delResult();
            setTimeout(function () {
                sound();
                count(rnd);
            }, 2500);
        } else {
            delResult();
            soundFalse.trigger('play');
            setTimeout(function () {
                sound(rnd);
            }, 2500);
        }
        return false
    });

    form.find('[name = result]').blur(function (e) {
        form.find('[name = result]').focus()
    });
    function sound(t) {
        if (t) {
            rnd = t;
            $('#' + 's' + rnd).trigger('play');
        } else {
            rnd = randomInteger(1, 10);
            if (rnd === rndThat) {
                sound();
            }
            $('#' + 's' + rnd).trigger('play');
            rndThat = rnd;
        }
    }

    /* function sound(t) {
     rnd = t || randomInteger(1, 10);
     var that = '#' + 's' + rnd;
     //alert(that);
     //$('#' + 's' + rnd).trigger('play');
     $(that).get(0).play();
     }*/

    function count(n) {
        var count = $('#count'),
            hendelCount = $('#hendel-count'),
        items = '';
        count.html('');
        for (var i = 0; i < n; i++) {
            items += hendelCount.html();
        }
        count.append(items);
    }

    function delResult() {
        form.find('[name = result]').val('');
    }

    function randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1);
        rand = Math.round(rand);
        return rand;
    }
});