/*-----------------Game Level Parameters--------------------*/
var OPTIMUMQUESTIONCOUNT =  [10, 10, 10, 10, 10];
var BUTTONCOUNT =           [4, 4, 4, 4, 4];        
var MINQUESTIONCOUNT =      [7, 7, 7, 7, 7];            //the number of Patterns that will be given on screen (including the ? on screen). note that the default for double patterns is set to 7
var DOUBLEPATTERN =         [0, 0, 0, 1, 1];            //doublePattern works as a True(1) or False(0) system
var PATTERNMAXPLUS =        [3, 4, 5, 6, 20];           //this is the highest + or - pattern that should be chosen. should be HIGHER than the min
var PATTERNMINPLUS =        [1, 1, 2, 3, 4];            //this is the least + or - pattern that should be chosen. should be LESS than the max 
var PATTERNMAXMULT =        [0, 0, 0, 2, 5];            //maxMult is either 0 (no multiplication in that level) OR higher than 1 (otherwise a pattern of x1 or /1 can be chosen)
var MAXRANGE =              [20, 30, 80, 150, 500];
var WRONGANSWERRANGE =      [14, 11, 8, 6, 6];          //wrong answer range should be higher than the button count, otherwise all possible answers will be used while buttons remain empty -> infinite loop
/*----------------------------------------------------------*/

/*-----------------Constants--------------------*/
var GAMEID = 65;
var GAMERESOURCE = "../js/resource/game/" + sessionStorage.getItem("langOption") + "/game65.min.json";
var PROBABILITY = [1, 0];
var INCREMENTTIME = 250;
var TOTALTIME = 60;
var TIMERMOD = 4;
var TIMERMAX = 240;
var MAXBTNWIDTH = 85;
var MAXDIVSIZE = 100;
var MAXCOUNTDOWNFONTSIZE = 160;
var PATTERNOPERATION = ["+", "*"];
/*---------------------------------------------*/

var score = 0;
var accuracy = 0;
var speed = 0;
var correctCount = 0;
var optimumQuestionCount = 0;
var questionIndex = 0;
var buttonCount = 0;
var minQuestionCount = 0;
var ptrnIndex = 0;
var answer = 0;
var answerIndex = 0;
var patternStyle = 0;
var patternMaxPlus = 0;
var patternMinPlus = 0;
var patternMaxMult = 0;
var maxRange = 0;
var wrongAnswerRange = 0;
var doublePattern = 0;

var unitTimer = 0;
var unitScore = 0;
var widthTimer = 0;
var widthScore = 0;
var wrongSound = null;
var correctSound = null;
var gameInstruction = null;
var gameName = null;
var Timer = null;

var yonerge = null;
var tickCount = 0;
var locked = false;
var timerIndex = 0;
var tmpIndex = 0;
var right = 0;
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
    $(".footerText").html(yonerge);
    $(".footerText").css("visibility", "visible");
    $("#game").css("display", "block");
    createQuestion();
    if (Number(timerIsActive)) {
        Timer = $.timer(updateTimer, INCREMENTTIME, true).once();
    } else {
        $("#timeInfo").html("--");
    }
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
        buttonCount = BUTTONCOUNT[level - 1];
        minQuestionCount = MINQUESTIONCOUNT[level - 1];
        patternMaxPlus = PATTERNMAXPLUS[level - 1];
        patternMinPlus = PATTERNMINPLUS[level - 1];
        patternMaxMult = PATTERNMAXMULT[level - 1];
        maxRange = MAXRANGE[level - 1];
        wrongAnswerRange = WRONGANSWERRANGE[level - 1];
        doublePattern = DOUBLEPATTERN[level - 1];

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
            yonerge = data.yonerge;
            $("#btnStartGame").html(data.btnStart);

            choicesHtml = "";
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

//soru yaratilir
var createQuestion = function () {
    setComponentSize();
    alignGameScreen();
    $("#info img").removeClass("opaque");
    $("#choicesDiv div").css("border-color", "rgba(0,0,0,0)");
    $("#choicesDiv div").css("background-color", "#5E3075");
    setTimeout(function () {
        locked = true;
        
        patternCount = minQuestionCount;

        patternArray = [];
        var reverse = Math.floor(Math.random() * 2);
        var chance = 1;
        var chanceDouble = 0;
        var start = 0;
        var patternStyle = 0;
        var maxStart = 0;

        if (patternMaxMult) {
            chance = Math.floor(Math.random() * 2);
        }
        if (doublePattern) {
            chanceDouble = Math.floor(Math.random() * 2);
        }
        if (chanceDouble) {
            patternCount = 4;
        }
        if (chance) { //pattern for addition
            patternStyle = Math.floor(Math.random() * (patternMaxPlus - patternMinPlus)) + patternMinPlus;
            maxStart = (maxRange - (patternCount * patternStyle));
            while (maxStart < 0) {
                patternStyle = Math.floor(Math.random() * (patternMaxPlus - patternMinPlus)) + patternMinPlus;
                maxStart = (maxRange - (patternCount * patternStyle));
            }
            start = Math.floor(Math.random() * maxStart) + 1;
            for (i = 0; i < patternCount; i++) {
                patternArray[i] = start;
                start += patternStyle;
            }
        }
        else { // pattern for multiplication
            patternStyle = Math.floor(Math.random() * (patternMaxMult - 1)) + 2;
            for (maxStart = 0; (maxStart + 1) * Math.pow(patternStyle, (patternCount - 1)) < maxRange; maxStart++) { }
            while (maxStart == 0) {
                patternStyle = Math.floor(Math.random() * (patternMaxMult - 1)) + 2;
                for (maxStart = 0; (maxStart + 1) * Math.pow(patternStyle, (patternCount - 1)) < maxRange; maxStart++) { }
            }
            start = Math.floor(Math.random() * maxStart) + 1;
            for (i = 0; i < patternCount; i++) {
                patternArray[i] = start;
                start *= patternStyle;
            }
        }
        if (chanceDouble) {     //if by chance it will do a double pattern, it will create a second array with a pattern
            patternArray2 = [];
            if (patternMaxMult) {
                chance = Math.floor(Math.random() * 2);
            }
            if (chance) { //pattern for addition
                patternStyle = Math.floor(Math.random() * (patternMaxPlus - patternMinPlus)) + patternMinPlus;
                maxStart = (maxRange - (patternCount * patternStyle));
                while (maxStart < 0) {
                    patternStyle = Math.floor(Math.random() * (patternMaxPlus - patternMinPlus)) + patternMinPlus;
                    maxStart = (maxRange - (patternCount * patternStyle));
                }
                start = Math.floor(Math.random() * maxStart) + 1;
                for (i = 0; i < patternCount; i++) {
                    patternArray2[i] = start;
                    start += patternStyle;
                }
            }
            else { // pattern for multiplication
                patternStyle = Math.floor(Math.random() * (patternMaxMult - 1)) + 2;
                for (maxStart = 0; (maxStart + 1) * Math.pow(patternStyle, (patternCount-1)) < maxRange; maxStart++) { }
                while (maxStart == 0) {
                    patternStyle = Math.floor(Math.random() * (patternMaxMult - 1)) + 2;
                    for (maxStart = 0; (maxStart + 1) * Math.pow(patternStyle, (patternCount - 1)) < maxRange; maxStart++) { }
                }
                start = Math.floor(Math.random() * maxStart) + 1;
                for (i = 0; i < patternCount; i++) {
                    patternArray2[i] = start;
                    start *= patternStyle;
                }
            }

            var newArray = [];      //the 2 arrays will then be merged into one
            patternCount = 7;
            for (i = 0; i < patternCount ; i++) {
                if (i % 2) {
                    newArray[i] = patternArray2.shift();
                }
                else {
                    newArray[i] = patternArray.shift();
                }
            }
            
            for (i = 0; i < patternCount; i++) {    //for simplicity of the rest of the code, the final array is transfered back into the first array
                patternArray[i] = newArray[i];
            }
            
        }

        if (reverse) {                  //reversing the array will result a + pattern to be a - and a * to be a / without any complications
            patternArray.reverse();
        }

        var answerIndexPtrn = Math.floor(Math.random() * patternCount);     // the place the ? will be shown is chosen randomly
        if (chanceDouble) {
            while (answerIndexPtrn % 2) {
                answerIndexPtrn = Math.floor(Math.random() * patternCount); // if its a doublepattern, only the 1st, 3rd, 5th or 7th will have a ? in it
            }
        }
        answer = patternArray[answerIndexPtrn];

        patternHtml = "";                                       //the div is created dynamically using the array with the pattern
        for (i = 0; i < patternCount ; i++) {
            if (i == answerIndexPtrn) {
                patternHtml += '<div id="ptrn' + i + '" class="ptrn-style" >?</div>';
            }
            else {
                patternHtml += '<div id="ptrn' + i + '" class="ptrn-style">' + patternArray[i] + '</div>';
            }
        }
        $("#questionDiv").html(patternHtml);
        $("#ptrn" + answerIndexPtrn).css("color", "darkorange");

        answerIndex = Math.floor(Math.random() * buttonCount);
        var buttonAnswers = [];     //buttonAnswers will keep track of used answers so there are no duplicates in the buttons
        buttonAnswers[0] = answer;                   //the answer is placed into one of the buttons
        $("#btn" + answerIndex).html(answer);        
        for (i = 0; i < buttonCount; i++) {          //every other button will be filled with random values within the range
            if (i != answerIndex) {
                var unique = false;
                var inRange = false;
                while (!unique || !inRange) {
                    wrongAnswer = Math.floor(Math.random() * wrongAnswerRange * 2) + answer - wrongAnswerRange;
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

        gameScreen = 1;
        setComponentSize();

        $("#choicesDiv").css("display", "block");
        $("#questionDiv").css("display", "block");
        $("#middlePart").attr("disabled", false);
        $("#info").css("display", "none");
        locked = false;

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
        divSize = (deviceWidth < deviceHeight) ? 0.2 * deviceWidth : 0.5 * deviceHeight;
        if (divSize > MAXDIVSIZE) {
            divSize = MAXDIVSIZE;
        }
        $("#questionDiv").css("height", divSize);
        $("#questionDiv div").css("width", divSize);
        $("#questionDiv div").css("height", divSize);
        $("#questionDiv div").css("left", (-0.5 * divSize) + "px");
        $("#questionDiv div").css("margin", (0.04 * divSize) + "px");
        $("#questionDiv div").css("font-size", (0.63 * divSize) + "px");

        if (deviceWidth < deviceHeight) {
            //portrait
            btnWidth = 0.19 * deviceWidth;
            $("#choicesDiv").css("margin-top", (0.18 * deviceWidth) + "px");
            //$("#questionDiv").css("margin-top", (0.18 * deviceWidth) + "px");

        } else {
            //landscape
            btnWidth = 0.46 * deviceWidth;
            if (0.286 * btnWidth > 0.15 * deviceHeight) {
                btnWidth = 3.5 * 0.15 * deviceHeight;
            }
            $("#choicesDiv").css("margin-top", (0.1 * deviceHeight) + "px");

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
            if (sessionStorage.getItem("soundEnable") == "1") {
                correctSound.play();
            }
            score += unitScore;
            $("#scoreInfo").html(Math.round(score));

            if (widthScore < 100) {
                widthScore += unitScore;
                $("#scoreBarInner").css("width", widthScore + "%");
            }
            timeout = 500;

        } else {
            if (sessionStorage.getItem("soundEnable") == "1") {
                wrongSound.play();
            }
            $("#btn" + answerIndex).css("border-color", "rgba(255,0,0,1)");
            $("#info img").eq(1).addClass("opaque");
            timeout = 500;
        }
        $("#info").css("display", "block");
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