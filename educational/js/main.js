$(function () {
    var sum = $('#sum'),
        form = $('.form'),
        soundTrue = $('#true'),
        soundFalse = $('#false');

    setVAl();

    sum.submit(function (e) {
        var result = +form.find('[name = first]').val() + +form.find('[name = last]').val(),
            otvet = +form.find('[name = result]').val();
        if (result === otvet) {
            //alert('верно');
            soundTrue.trigger('play');
            delResult();
            setVAl();
        } else {
            //alert('Не верно');
            soundFalse.trigger('play');
            delResult();
        }
        //form.find('[name = result]').focus();
        return false;
    });
    var pisat = $('#pisat');
    var rnd = 0,
        rndThat = 0;
    //pisat.ready(function () {
    if (pisat) {
        sound();
        pisat.submit(function (e) {
            if (rnd === +pisat.find('[name = result]').val()) {
                soundTrue.trigger('play');
                delResult();
                setTimeout(sound, 2500);

            } else {
                delResult();
                soundFalse.trigger('play');
                setTimeout(function () {
                    sound(rnd)
                }, 2500);
            }
            return false
        });
    }
    //});

    form.find('[name = result]').blur(function (e) {
        form.find('[name = result]').focus()
    });
    /* function sound(t) {
     if (t) {
     rnd = t;
     $('#' + rnd).trigger('play');
     } else {
     rnd = randomInteger(1, 10);
     if (rnd === rndThat) {
     sound();
     }
     $('#' + rnd).trigger('play');
     rndThat = rnd;
     }
     }*/
    function sound(t) {
        rnd = t || randomInteger(1, 5);
        $('#' + rnd).trigger('play');
    }

    function setVAl() {
        form.find('[name = first]').val(randomInteger(1, 5));
        form.find('[name = last]').val(randomInteger(1, 5));
    }

    function delResult() {
        form.find('[name = result]').val('');
    }

    function randomInteger(min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1);
        rand = Math.round(rand);
        return +rand;
    }
});