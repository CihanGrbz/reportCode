/*-----------------Game Level Parameters--------------------*/
var OPTIMUMQUESTIONCOUNT = [12, 14, 16, 18, 20];
var MAXANSWER = [15, 20, 30, 40, 50];
var MINANSWER = [0, -10, -20, -35, -50];
var BUTTONCOUNT = [4, 4, 4, 4, 4];
var OPERATORSET = [1, 1, 2, 3, 3];
var WRONGANSWERRANGE = [10, 8, 6, 5, 4];
/*----------------------------------------------------------*/

/*-----------------Constants--------------------*/
var GAMEID = 23;
var GAMERESOURCE = "../js/resource/game/" + sessionStorage.getItem("langOption") + "/game23.min.json";
var PROBABILITY = [1, 0];
var INCREMENTTIME = 250;
var TOTALTIME = 60;
var TIMERMOD = 4;
var TIMERMAX = 240;
var MAXIMGSIZE = 300;
var MAXBTNWIDTH = 95;
var MAXDIVSIZE = 200;
var MAXCOUNTDOWNFONTSIZE = 160;
var OPERATORS = ["+", "-", "x", "/"];
/*---------------------------------------------*/

var score = 0;
var accuracy = 0;
var speed = 0;
var correctCount = 0;
var optimumQuestionCount = 0;
var questionIndex = 0;
var maxAnswer = 0;
var minAnswer = 0;
var answer = 0;
var answerIndex = 0;
var prevAnswer = 0;
var prevAnswerIndex = 0;
var buttonCount = 0;
var operator = 0;
var operatorset = 0;
var wrongAnswerRange = 0;
var correct = 1;

var unitTimer = 0;
var unitScore = 0;
var widthTimer = 0;
var widthScore = 0;
var wrongSound = null;
var correctSound = null;
var gameInstruction = null;
var gameName = null;
var Timer = null;

var yonerge1 = null;
var yonerge2 = null;
var tickCount = 0;
var locked = false;
var timerIndex = 0;
var tmpIndex = 0;
var right = 0;
var ttlImageCount = null;
var folderName = null;
var timerIsActive = 0;
var gameScreen = 0;
var stopPlay = false;

document.ontouchmove = function (e) {
    e.preventDefault();
};

$(document).ready(function () {
    document.getElementById('container').style.display = "none";
    document.getElementById('loader').style.display = "block";
    window.addEventListener("resize", sizeChangedLocal);
    FastClick.attach(document.body);
    //parametreler set edilir
    setParameters();
    //oyun itemlari load edilir, images vs.
    preload();
});

//her sey hazir oyun baslatilabilir
var allReady = function () {
    //ilk deger atamalari yapilir
    init();
    //oyun baslamadan once geri sayim yapilir
    createQuestionBefore();
    //her sey hazir oyun acilir
    stopLoading();
};

//oyun baslamadan once geri sayim baslatilir
var createQuestionBefore = function () {
    $("#countdown").css('visibility', 'hidden');
    $("#countdown").css('display', 'block');

    counter = 5;
    gameScreen = 0;
    setComponentSize();

    timerCountDown = setInterval(function () { handleTimer(counter); }, 1000);
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        setTimeout(function () { startingSound.play(); }, 1500);
    }
};

//oyun baslamadan once geri sayim yapilir
function handleTimer() {
    $('#countdown').css("display", "none");
    $("#countdown").css('visibility', 'visible');
    if (counter == 0) {
        clearInterval(timerCountDown);
        gameScreen = 1;
        startGame();
    } else {
        if (counter > 2) {
            $('#countdown').html(counter - 2).fadeIn();
        }
        counter--;
    }
}

//geri sayým biter soru yaratilir
var startGame = function () {
    $('#countdown').css("display", "none");
    firstQuestion();
};

//her sey hazir oyun acilir
var stopLoading = function () {
    $("#info").css("display", "none");
    $("#loader").css("display", "none");
    $("#container").css("display", "block");

};

//parametreler set edilir
var setParameters = function () {
    //Get session parameters-------------------
    getMainParameters();
    getGameParameters();
    //-----------------------------------------

    //kullanicinin elle url i degistirmesi durumu ve kullanici adi, sifresi kontrol edilir
    if (gameSecurityCheck(userid, password, GAMEID, gameid, level, parent)) {

        gameInstruction = sessionStorage.getItem("gameinstruction");
        gameName = sessionStorage.getItem("gamename");

        //oyun sablonunda yer alan html elementleri set edilir
        $("#timeTitle").html(sessionStorage.getItem("timeTitle"));
        $("#scoreTitle").html(sessionStorage.getItem("scoreTitle"));
        $("#gameinstruction").html(gameInstruction);
        $("#gametitle").html(sessionStorage.getItem("gameInfoTitle"));
        $("#gameNameBanner").html(gameName);

        $("#pausedGameName").html(gameName);
        $("#pausedGameInstruction").html(gameInstruction);

        $("title").html(gameName);
        $("#continue1").html(sessionStorage.getItem("continueBtnText"));
        $("#again1").html(sessionStorage.getItem("againBtnText"));
        $("#exit1").html(sessionStorage.getItem("exitBtnText"));
        timerIsActive = sessionStorage.getItem("timerIsActive");

        //oyun seviye parametreleri set edilir
        optimumQuestionCount = OPTIMUMQUESTIONCOUNT[level - 1];
        maxAnswer = MAXANSWER[level - 1];
        minAnswer = MINANSWER[level - 1];
        buttonCount = BUTTONCOUNT[level - 1];
        operatorset = OPERATORSET[level - 1];
        wrongAnswerRange = WRONGANSWERRANGE[level - 1];

    } else {
        window.close();
    }
};

//oyun itemlari load edilir, images vs.
var preload = function () {

    //yonergeler jsondan okunur
    $.ajax({
        url: GAMERESOURCE,
        type: 'GET',
        contentType: "application/json",
        dataType: 'json',
        async: true,
        timeout: PRELOADTIMEOUT,
        success: function (data) {
            //yönerge yazýlýr
            yonerge1 = data.yonerge1;
            yonerge2 = data.yonerge2;
            $("#btnStartGame").html(data.btnStart);

            choicesHtml = "";   //the buttons are added dynamically
            for (i = 0; i < buttonCount ; i++) {
                choicesHtml += '<div id="btn' + i + '" class="btn-style" onclick="checkAnswer(' + i + ')"></div>';
            }
            $("#choicesDiv").html(choicesHtml);

            allReady();
        },
        error: function (result, status, err) {
            stopLoading();
            window.open("error", "_self", false);
        }
    });
};

//ilk deger atamalari yapilir
var init = function () {
    $("#game").css("display", "none");
    $(".footerText").css("visibility", "hidden");
    $("#scoreInfo").html("0");
    $("#timeInfo").html(TOTALTIME);

    initializeCheckAnswerSoundPlayers();
    initializeCountdownSoundPlayers();

    questionIndex = 0;
    correctCount = 0;
    score = 0;
    unitTimer = 100 / TIMERMAX;
    unitScore = 100 / optimumQuestionCount;
};

//ilk resimin gosterilmesi icin hazirlik
var firstQuestion = function () {
    $("#game").css("display", "block");
    prevAnswer = Math.floor((Math.random() * (maxAnswer - minAnswer)) + minAnswer);
    $("#questionDiv").html(prevAnswer);
    setVisibleFirstQuestion();
};

//ilk resim gosterilir
var setVisibleFirstQuestion = function () {
    $("#startGameDiv").css("display", "block");
    gameScreen = 1;
    setComponentSize();
    $(".footerText").html(yonerge1);
    $(".footerText").css("visibility", "visible");
    alignGameScreen();
    if (Number(timerIsActive)) {
        Timer = $.timer(updateTimer, INCREMENTTIME, true).once();
    } else {
        $("#timeInfo").html("--");
    }
};

//soru yaratilir
var createQuestion = function () {
    $("#info img").removeClass("opaque");
    $("#choicesDiv div").css("border-color", "rgba(0,0,0,0)");
    $("#choicesDiv div").css("background-color", "#5E3075");
    setTimeout(function () {
        locked = true;
        validOperation = false;

        while (!validOperation) {       // checking which operations are viable
            operation = Math.floor(Math.random() * (operatorset + 1));
            switch (operation) {
                case 0: // +
                    if (prevAnswer < maxAnswer) {
                        validOperation = true;
                    }
                    break;
                case 1: // -
                    if (prevAnswer > minAnswer) {
                        validOperation = true;
                    }
                    break;
                case 2: // x
                    if (prevAnswer > 0 && (prevAnswer * 2) < maxAnswer) {
                        validOperation = true;
                    }
                    break;
                case 3: // /
                    if (prevAnswer > 1) {
                        validOperation = true;
                    }
                    break;
                default:
                    validOperation = false;
            }
        }
        divisorSet = [];
        var question = 0;
        switch (operation) {    //the operation will be executed with a randomly chosen value and then stored
            case 0: // +
                question = Math.floor(Math.random() * (maxAnswer - prevAnswer)) + 1;
                answer = prevAnswer + question
                break;
            case 1: // -
                question = Math.floor(Math.random() * (prevAnswer - minAnswer)) + 1;
                answer = prevAnswer - question;
                break;
            case 2: // x
                question = Math.floor(Math.random() * Math.floor(((maxAnswer / prevAnswer) - 2))) + 2;
                answer = prevAnswer * question;
                break;
            case 3: // /
                for (i = 2; i <= prevAnswer; i++) {
                    if (prevAnswer % i == 0) {
                        divisorSet[divisorSet.length] = i;
                    }
                }
                question = divisorSet[Math.floor(Math.random() * divisorSet.length)];
                answer = prevAnswer / question;
                break;
            default:
        }
        if (correct == 0) {
            $("#questionDiv").html(prevAnswer + '&nbsp;<font color=\"darkorange\">' + OPERATORS[operation] + '</font>&nbsp;' + question + '&nbsp;=&nbsp;<font color=\"darkorange\">&nbsp;?&nbsp;</font>');
        }
        else {
            $("#questionDiv").html('...&nbsp;<font color=\"darkorange\">' + OPERATORS[operation] + '</font>&nbsp;' + question + '&nbsp;=&nbsp;<font color=\"darkorange\">&nbsp;?&nbsp;</font>');
        }

        answerIndex = Math.floor(Math.random() * buttonCount);  //the answer will be placed into one of the buttons
        $("#btn" + answerIndex).html(answer);


        var buttonAnswers = []
        buttonAnswers[0] = answer;                          //every other button will be filled with random values within the range
        for (i = 0; i < buttonCount; i++) {
            if (i != answerIndex) {
                var unique = false;
                var inRange = false;
                while (!unique || !inRange) {
                    wrongAnswer = Math.floor((Math.random() * (maxAnswer - minAnswer)) + minAnswer);
                    unique = true;
                    inRange = isInRange(answer, wrongAnswer, wrongAnswerRange);
                    for (j = 0; j < buttonAnswers.length; j++) {
                        if (wrongAnswer == buttonAnswers[j]) {
                            unique = false;
                        }
                    }
                }
                $("#btn" + i).html(wrongAnswer);
                buttonAnswers[buttonAnswers.length] = wrongAnswer;
            }
        }



        gameScreen = 2;
        setComponentSize();

        $("#startGameDiv").css("display", "none");
        $("#choicesDiv").css("display", "block");

        $("#middlePart").attr("disabled", false);
        $("#info").css("display", "none");
        locked = false;
        $(".footerText").html(yonerge2);
        $('#questionDiv div').addClass('enter');

        alignGameScreen();
    }, 300);

};

var isInRange = function (a, wa, war) {
    if (wa <= (a + war) && wa >= (a - war)) {
        return true;
    }
    else {
        return false;
    }
}

//html elementlerinin device boyutlarina gore dinamik olarak olceklenmesi
var setComponentSize = function () {
    alignGameScreen();
    deviceWidth = $(".gameContainer").width();
    deviceHeight = $(".gameContainer").height() - 10;

    if (gameScreen == 0) {
        fontSize = deviceWidth < deviceHeight ? 0.35 * deviceWidth : 0.3 * deviceHeight;
        if (fontSize > MAXCOUNTDOWNFONTSIZE) {
            fontSize = MAXCOUNTDOWNFONTSIZE;
        }
        marginTop = (deviceHeight - fontSize) / 2;
        $("#countdown").css("font-size", fontSize + "px");
        $("#countdown").css("line-height", fontSize + "px");
        $("#countdown").css("margin-top", marginTop + "px");
    } else {
        divSize = (deviceWidth < deviceHeight) ? 0.4 * deviceWidth : 0.5 * deviceHeight;
        if (divSize > MAXDIVSIZE) {
            divSize = MAXDIVSIZE;
        }

        $("#questionDiv").css("padding", (0.06 * deviceWidth) + "px 0");

        $(".exit").css("left", (0.5 * divSize) + "px");

        if (deviceWidth < deviceHeight) {
            //portrait
            if (deviceWidth < 1024) {
                fontSize = 0.13 * deviceWidth;
            }
            else {
                fontSize = 0.13 * 1024;
            }
            btnWidth = deviceWidth / (buttonCount + 2);
            $("#questionDiv").css("font-size", fontSize + "px");
            if (gameScreen == 1) {
                $("#startGameDiv").css("margin-top", (0.18 * deviceWidth) + "px");
            } else {
                $("#choicesDiv").css("margin-top", (0.18 * deviceWidth) + "px");
            }
        } else {
            //landscape
            btnWidth = deviceWidth / (buttonCount + 2);
            if (0.286 * btnWidth > 0.15 * deviceHeight) {
                btnWidth = 3.5 * 0.15 * deviceHeight;
            }
            if (deviceWidth < 1024) {
                fontSize = 0.10 * deviceWidth;
            }
            else {
                fontSize = 0.10 * 1024;
            }
            $("#questionDiv").css("font-size", fontSize + "px");
            if (gameScreen == 1) {
                $("#startGameDiv").css("margin-top", (0.12 * deviceHeight) + "px");
            } else {
                $("#choicesDiv").css("margin-top", (0.12 * deviceHeight) + "px");
            }
        }
        var marginSize = 0.04 * btnWidth;
        if (marginSize > 15) {
            marginSize = 15;
        }
        if (btnWidth > MAXBTNWIDTH) {
            btnWidth = MAXBTNWIDTH;
        }

        $(".btn-style").css("width", btnWidth + "px");
        $(".btn-style").css("height", btnWidth + "px");
        $(".btn-style").css("font-size", btnWidth * 0.63 + "px");
        $(".btn-style").css("margin", "0 " + marginSize + "px");
        $(".btn-style").css("padding", (marginSize * 0.55) + "px");

        $("#btnStartGame").css("width", (3.47 * btnWidth) + "px");

        if (deviceWidth < 1024) {
            $("#questionDiv").css("width", deviceWidth);
        } else {
            $("#questionDiv").css("width", "1024px");
        }
    }
    alignGameScreen();
};

//sure geri sayimi yapilir
var updateTimer = function () {
    tmpIndex++;
    if (tickCount < TOTALTIME) {

        tmpIndex %= TIMERMOD;
        timerIndex++;

        widthTimer = widthTimer + unitTimer;
        $("#timerBar").css("width", widthTimer + "%");

        if (tmpIndex == 0) {
            tickCount++;
            $("#timeInfo").html(TOTALTIME - tickCount);
        }
        if (tickCount == (TOTALTIME - 7) && stopPlay == false) {
            stoppingSound.play();
            stopPlay = true;
        }
    } else {
        finish();
    }
};

//kullanicini verdigi cevabin kontrol edilmesi
var checkAnswer = function (x) {
    if (locked == false) {
        questionIndex++;

        locked = true;

        setInfoElementSize();
        alignInfoImages("#questionDiv");

        $("#middlePart").attr("disabled", true);
        var timeout = 0;
        if (x == answerIndex) {
            $("#btn" + answerIndex).css("border-color", "rgba(0,255,0,1)");
            $("#info img").eq(0).addClass("opaque");
            correctCount++;
            correct = 1;
            if (sessionStorage.getItem("soundEnable") == "1") {
                correctSound.play();
            }
            score += unitScore;
            $("#scoreInfo").html(Math.round(score));

            if (widthScore < 100) {
                widthScore += unitScore;
                $("#scoreBarInner").css("width", widthScore + "%");
            }
            timeout = 250;

        } else {
            if (sessionStorage.getItem("soundEnable") == "1") {
                wrongSound.play();
            }
            $("#btn" + answerIndex).css("background-color", "#cb0000");
            $("#info img").eq(1).addClass("opaque");
            correct = 0;
            timeout = 1000;
        }
        $("#info").css("display", "block");
        prevAnswer = answer;
        setTimeout(function () { createQuestion(); }, timeout);

    }
};

//device boyutu degisti
var sizeChangedLocal = function () {
    sizeChanged();
    setComponentSize();
};

//pause dugmesine basildi
var togglefunc = function () {
    if (Timer !== null) {
        if (Timer.isActive) {
            if (stopPlay == true) {
                stoppingSound.stop();
            }
            Timer.pause();
            locked = true;
            $(".window").css("display", "block");
            $("#toggle1 img").attr("src", "../img/game/play.png");
            $("#paused").css("display", "block");
            alignPausedBox();
        } else if (Timer.reset) {
            Timer.play(true);
            locked = false;
            $(".window").css("display", "none");
            $("#toggle1 img").attr("src", "../img/game/pause.png");
            $("#paused").css("display", "none");
        }
        else {
            Timer.play(true);
            locked = false;
            $(".window").css("display", "none");
            $("#toggle1 img").attr("src", "../img/game/pause.png");
            $("#paused").css("display", "none");
        }
    }
};

//oyun bitmeden kapatildi
var finishWithoutSave = function () {
    if (Timer !== null) {
        Timer.stop();
    }
    sessionStorage.setItem("finishedGameId", GAMEID);
    closeGame(parent);
};

//oyun bitti
var finish = function () {
    document.getElementById('container').style.display = "none";
    document.getElementById('loader').style.display = "block";

    if (Timer !== null) {
        Timer.stop();
    }

    //score, accuracy, speed hesabi
    score = Math.round(score);
    accuracy = calculateScore(correctCount, questionIndex);
    speed = calculateSpeed(questionIndex, tickCount);

    sessionStorage.setItem("score", score);
    sessionStorage.setItem("accuracy", accuracy);
    sessionStorage.setItem("speed", speed);

    //score, accuracy, speed bilgileri servis uzerinden db ye yazilir
    if (userid !== null) {
        writeScore(userid, password, gameid, level, score, accuracy, speed);
    }

    sessionStorage.setItem("finishedGameId", GAMEID);

    return;
};