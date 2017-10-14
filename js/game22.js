/*-----------------Game Level Parameters--------------------*/
var OPTIMUMQUESTIONCOUNT = [4, 4, 4, 4, 4];
var QUESTIONCOUNT = [5, 5, 5, 5, 5];
var MINPICCOUNT = [3, 3, 4, 4, 5];
var MAXPICCOUNT = [9, 12, 16, 20, 24];
var VERTICALIMGCOUNT = [3, 3, 4, 4, 5];
var HORIZONTALIMGCOUNT = [3, 4, 4, 5, 5];
var TTLIMAGECOUNT = [16, 16, 18, 20, 24];
var MINCORRECTOPTION = [2, 2, 3, 3, 3];
var MINWRONGOPTION = [1, 2, 3, 4, 5];
/*----------------------------------------------------------*/

/*-----------------Constants--------------------*/
var GAMEID = 22;
var GAMERESOURCE = "../js/resource/game/" + sessionStorage.getItem("langOption") + "/game22.min.json";
var INCREMENTTIME = 250;
var TOTALTIME = 60;
var TIMERMOD = 4;
var TIMERMAX = 240;

var MAXIMGSIZE = 120;
var MAXCOUNTDOWNFONTSIZE = 160;
/*---------------------------------------------*/

var score = 0;
var accuracy = 0;
var speed = 0;
var correctCount = 0;
var optimumQuestionCount = 0;
var questionCount = 0;
var questionIndex = 0;

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
var imgMtr = [];
var imageWidth = 66;
var imageHeight = 66;
var locked = false;
var paused = false;
var picCount = 0;
var timerIndex = 0;
var tmpIndex = 0;
var timerIsActive = 0;
var horizontalImgCount = 0;
var verticalImgCount = 0;
var maxSameImg = 0;
var imgControl = [];         // a global 1 dimensional array will keep track if an image has been clicked (index = image id for simplicity)
var ttlimgcount = 0;
var minCorrectOption = 0;
var minWrongOption = 0;
var correct = 0;

var deviceWidth = 0;
var deviceHeight = 0;
var imgSize = 0;
var boxSize = 0;
var borderSize = 0;
var marginSize = 0;
var gameScreen = 0;
var stopPlay = false;

document.ontouchmove = function (e) {
    e.preventDefault();
};

$(document).ready(function () { //while the page is loaded, loader will show
    document.getElementById('container').style.display = "none";
    document.getElementById('loader').style.display = "block";
    window.addEventListener("resize", sizeChangedLocal);
    FastClick.attach(document.body);
    // parameters will be set
    setParameters();
    // game items will be loaded and set
    preload();
});

// everything is set game can start
var allReady = function () {
    // first initializations will be done
    init();
    // countdown will start
    createQuestionBefore();
    // game will load up
    stopLoading();
};

// a countdown will be shown before game starts
var createQuestionBefore = function () {
    $("#countdown").css('visibility', 'hidden');
    $("#countdown").css('display', 'block');

    counter = 5;
    gameScreen = 0;
    setImgSize();

    timerCountDown = setInterval(function () { handleTimer(counter); }, 1000);
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        setTimeout(function () { startingSound.play(); }, 1500);
    }
};

// a countdown will start before game starts
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

// countdown stops, question will be created
var startGame = function () {
    $('#countdown').css("display", "none");
    createQuestion();
    if (Number(timerIsActive)) {
        Timer = $.timer(updateTimer, INCREMENTTIME, true).once();
    } else {
        $("#timeInfo").html("--");
    }
};

// everything is set, game will start
var stopLoading = function () {
    $("#loader").css("display", "none");
    $("#container").css("display", "block");
    setImgSize();
};

// game parameters will be set (got help)
var setParameters = function () {
    // get session parameters-------------------
    getMainParameters();
    getGameParameters();
    //-----------------------------------------

    // if the user changed the url manually, user id and password will be checked
    if (gameSecurityCheck(userid, password, GAMEID, gameid, level, parent)) {

        gameInstruction = sessionStorage.getItem("gameinstruction");
        gameName = sessionStorage.getItem("gamename");

        // the elements for the html will be set
        $("#timeTitle").html(sessionStorage.getItem("questionIndexTitle"));
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

        // game parameters will be set
        optimumQuestionCount = OPTIMUMQUESTIONCOUNT[level - 1];
        questionCount = QUESTIONCOUNT[level - 1];
        picCount = MINPICCOUNT[(level - 1)];
        verticalImgCount = VERTICALIMGCOUNT[level - 1];
        horizontalImgCount = HORIZONTALIMGCOUNT[level - 1];
        ttlimgcount = TTLIMAGECOUNT[level - 1];
        minCorrectOption = MINCORRECTOPTION[level - 1];
        minWrongOption = MINWRONGOPTION[level - 1];

    } else {
        window.close();
    }
};

// game items will be loaded (images, json etc) (got little help)
var preload = function () {
    var imageCount = TTLIMAGECOUNT[level - 1] + 1;
    function imageLoaded() {        //if all images have been loaded, the game is set to play
        imageCount--;
        if (imageCount <= 0) {
            allReady();
        }
    }

    // data will be read from .json file
    $.ajax({
        url: GAMERESOURCE,
        type: 'GET',
        contentType: "application/json",
        dataType: 'json',
        async: true,
        timeout: PRELOADTIMEOUT,
        success: function (data) {
            // instruction will be shown
            instruction = data.yonerge;
            $(".footerText").html(instruction);

            // images are loaded
            images = new Array(TTLIMAGECOUNT[level - 1]);
            images[0] = new Image();
            images[0].src = "../img/game/game22/0.png";
            images[0].addEventListener("load", imageLoaded);
            for (i = 1; i < TTLIMAGECOUNT[level - 1] + 1; i++) {
                images[i] = new Image();
                images[i].src = "../img/game/game22/level" + level + "/" + (i) + ".png";
                images[i].addEventListener("load", imageLoaded);
            }

            // the div matrix for the images are created dynamically and added to the html
            htmlStr = "";
            for (i = 0; i < verticalImgCount; i++) {
                htmlStr += "<div>";
                for (j = 0; j < horizontalImgCount; j++) {
                    htmlStr += '<div class="parts" id="div' + i + j + '"></div>';
                }
                htmlStr += "</div>";
            }
            $("#middlePart").html(htmlStr);
        },
        error: function (result, status, err) { //if json could not be loaded, error will be shown
            alert();
            stopLoading();
            window.open("error", "_self", false);
        }
    });
};

// first initializations are made (got help)
var init = function () {
    $("#game").css("display", "none");
    $(".footerText").css("visibility", "hidden");
    $("#scoreInfo").html("0");
    $("#timeInfo").html("- / -");

    initializeCheckAnswerSoundPlayers();
    initializeCountdownSoundPlayers();

    imgMtr = new Array(verticalImgCount);
    for (i = 0; i < verticalImgCount; i++) {
        imgMtr[i] = new Array(horizontalImgCount);
    }
    for (l = 0; l <= ttlimgcount; l++) {    //imgControl is initialized to 0 (no image used)
        imgControl[l] = 0;
    }
    score = 0;
    unitTimer = 100 / questionCount;
    unitScore = 100 / optimumQuestionCount;

    maxImgCount = (verticalImgCount > horizontalImgCount) ? verticalImgCount : horizontalImgCount;

};

// question will be created
var createQuestion = function () {
    // will check that correct number of images are loaded
    var loadedImgCount = verticalImgCount * horizontalImgCount;
    function imgLoaded() {
        loadedImgCount--;
        if (loadedImgCount <= 0) {
            setVisible();
        }
    }
    if (Timer !== null) {
        Timer.pause();
    }
    locked = true;
    widthTimer = widthTimer + unitTimer;
    $("#timerBar").css("width", widthTimer + "%");
    $("#game").css("display", "none");
    $("#timeInfo").html((questionIndex + 1) + " / " + questionCount);

    if (correctCount >= ttlimgcount) { //if for one reason or another there are no pictures left, terminate the game
        finish();
    }



    // initially all div/img in the imgMtr are set to 0 (initialize)
    for (i = 0; i < verticalImgCount; i++) {
        for (j = 0; j < horizontalImgCount; j++) {
            imgMtr[i][j] = 0;
            $("#div" + i + j).empty();
            $("#div" + i + j).css("border-color", "rgba(0,0,0,0)");
            $("#div" + i + j).css("cursor", "auto");
        }
    }

    // if correct answered questions passes a third of optimal number of questions, the number of images will increase each round
    if (correct) {
        if (picCount < MAXPICCOUNT[level - 1]) {
            picCount++;
        }
        else {
            picCount = MAXPICCOUNT[level - 1];
        }
    }

    var wrongImageCount = correctCount;
    var correctImageCount = ttlimgcount - correctCount;
    var usedCorrectImage = 0;
    var usedWrongImage = 0;

    var imgLevelUsage = [];
    for (l = 0; l <= ttlimgcount; l++) {    //imgLevelControl will check if a unique picture is used, and its initialized to 0 (no image used)
        imgLevelUsage[l] = 0;
    }

    var imageId = Math.floor(Math.random() * ttlimgcount) + 1;    // imageId is initialized for first runthrough

    for (j = picCount  ; j > 0 ; j--) {  // this loop will run for each picture chosen and placed until all images are placed

        if (j <= minCorrectOption && usedCorrectImage <= minCorrectOption && correctImageCount > 0) {  //force to chose a clickable (not before clicked) image if i have no space more left to use and i have not used correct options
            imageId = Math.floor(Math.random() * ttlimgcount) + 1;
            while (imgLevelUsage[imageId] || imgControl[imageId]) {
                imageId = Math.floor(Math.random() * ttlimgcount) + 1;
            }
            usedCorrectImage++;
            correctImageCount--;
        }
        else {
            var chance = Math.random();     //Else, a chance factor is set to decide whether to choose a correct (clickable) or wrong (clicked before) answer

            if (usedWrongImage < minWrongOption || correctImageCount <= 0) {    //if there are no correct images or if there are less wrong options than the minimum defined, chance will be set to 1 in order to force a wrong answer
                chance = 1;
            }

            if (chance > 0.1 && wrongImageCount > 0) {      //by chance (or by manipulation) and if there are available wrong images, a wrong image will be added
                imageId = Math.floor(Math.random() * ttlimgcount) + 1;
                while (imgLevelUsage[imageId] || !imgControl[imageId]) {
                    imageId = Math.floor(Math.random() * ttlimgcount) + 1;
                }
                usedWrongImage++;
                wrongImageCount--;
            }
            else {
                imageId = Math.floor(Math.random() * ttlimgcount) + 1;  //otherwise, another new clickable answer will be added
                while (imgLevelUsage[imageId] || imgControl[imageId]) {
                    imageId = Math.floor(Math.random() * ttlimgcount) + 1;
                }
                usedCorrectImage++;
                correctImageCount--;
            }
        }

        imgLevelUsage[imageId] = 1; //the imgLevelUasge will be updated accordingly to keep track of used images during the run






        // the chosen image will be placed into a free space in the matrix
        x = Math.floor(Math.random() * horizontalImgCount);
        y = Math.floor(Math.random() * verticalImgCount);
        while (imgMtr[y][x] !== 0) {
            x = Math.floor(Math.random() * horizontalImgCount);
            y = Math.floor(Math.random() * verticalImgCount);
        }
        imgMtr[y][x] = imageId;

        // attributes are set for the image
        $("#div" + y + x).attr('onclick', 'checkAnswer(' + x + ',' + y + ')');
        $("#div" + y + x).css("cursor", "pointer");
        $(images[imageId]).clone().appendTo("#div" + y + x).on("load", imgLoaded);
    }

    // for empty matrix cells, an enmpty image will be placed
    for (i = 0; i < verticalImgCount; i++) {
        for (j = 0; j < horizontalImgCount; j++) {
            if (imgMtr[i][j] == 0) {
                $("#div" + i + j).empty();
                $("#div" + i + j).css("border-color", "rgba(0,0,0,0)");
                $("#div" + i + j).attr('onclick', '');
                $(images[0]).clone().appendTo("#div" + i + j).on("load", imgLoaded);
            }
        }
    }
};

//The question is now ready, can be set to visible (got help)
var setVisible = function () {
    setImgSize();
    $("#middlePart").attr("disabled", false);

    $("#info img").removeClass("opaque");
    $("#info").css("display", "none");

    $("#game").css("display", "block");
    $(".footerText").css("visibility", "visible");
    if (!paused) {
        if (Timer !== null) {
            Timer.play(true);
        }
        locked = false;
    }
    alignGameScreen();
};

//The HTML elements will be set dynamically according to device (got help)
var setImgSize = function () {
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
        borderSize = $(".parts").css("border-width").substring(0, 1);

        if (deviceWidth < deviceHeight) {
            imgSize = (0.95 * deviceWidth / horizontalImgCount < 0.65 * deviceHeight / verticalImgCount) ? 0.95 * deviceWidth / horizontalImgCount : 0.65 * deviceHeight / verticalImgCount;
        } else {
            imgSize = (0.95 * deviceWidth / horizontalImgCount < 0.75 * deviceHeight / verticalImgCount) ? 0.95 * deviceWidth / horizontalImgCount : 0.75 * deviceHeight / verticalImgCount;
        }
        marginSize = (0.05 * imgSize);
        $(".parts").css("margin", marginSize + "px");
        imgSize -= 2 * borderSize;
        imgSize -= 2 * marginSize;
        if (imgSize > MAXIMGSIZE) {
            imgSize = MAXIMGSIZE;
        }
        $(".parts").css("width", (imgSize + 2 * borderSize) + "px");
        $(".parts").css("height", (imgSize + 2 * borderSize) + "px");
        $(".parts img").css("width", imgSize + "px");
        $(".parts img").css("height", imgSize + "px");

        if (deviceWidth < deviceHeight || (deviceWidth == 1024 && deviceHeight > 800)) {
            $("#middlePart").css("margin-top", (imgSize) + "px");
        } else {
            $("#middlePart").css("margin-top", (0.25 * imgSize) + "px");
        }
    }
    alignGameScreen();
};


//Click will be checked (got a little help)
var checkAnswer = function (x, y) {
    if (locked == false) {
        questionIndex++;
        locked = true;
        setInfoElementSize();
        alignInfoImages("#gameDiv");

        $("#middlePart").attr("disabled", true);

        if (imgControl[imgMtr[y][x]] == 0) {
            imgControl[imgMtr[y][x]] = 1;
            correct = 1;
            $("#div" + y + x).css("border-color", "#00cc00");
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
        } else {
            if (sessionStorage.getItem("soundEnable") == "1") {
                wrongSound.play();
            }
            correct = 0;
            $("#info img").eq(1).addClass("opaque");
            $("#div" + y + x).css("border-color", "#cc0000");
        }
        $("#info").css("display", "block");

        if (questionIndex >= questionCount) {
            setTimeout(function () {
                finish();
            }, 1500);
        }

        setTimeout(function () {
            createQuestion();
        }, 1500);

    }
};

//Device size changed (copy-pasted)
var sizeChangedLocal = function () {
    sizeChanged();
    setImgSize();
};

//Pause menu activated (copy-pasted)
var togglefunc = function () {
    if (Timer !== null) {
        if (Timer.isActive) {
            if (stopPlay == true) {
                stoppingSound.stop();
            }
            Timer.pause();
            paused = true;
            locked = true;
            $(".window").css("display", "block");
            $("#toggle1 img").attr("src", "../img/game/play.png");
            $("#paused").css("display", "block");
            alignPausedBox();
        } else if (Timer.reset) {
            Timer.play(true);
            paused = false;
            locked = false;
            $(".window").css("display", "none");
            $("#toggle1 img").attr("src", "../img/game/pause.png");
            $("#paused").css("display", "none");
        }
        else {
            Timer.play(true);
            paused = false;
            locked = false;
            $(".window").css("display", "none");
            $("#toggle1 img").attr("src", "../img/game/pause.png");
            $("#paused").css("display", "none");
        }
    }
};

//Game closed before finishing (copy-pasted)
var finishWithoutSave = function () {
    if (Timer !== null) {
        Timer.stop();
    }
    sessionStorage.setItem("finishedGameId", GAMEID);
    closeGame(parent);
};

//Game finished (got help)
var finish = function () {
    document.getElementById('container').style.display = "none";
    document.getElementById('loader').style.display = "block";

    if (Timer !== null) {
        Timer.stop();
    }

    //Score, accuracy and speed calculation
    score = Math.round(score);
    accuracy = calculateScore(correctCount, questionIndex);
    speed = calculateSpeed(questionIndex, tickCount);

    sessionStorage.setItem("score", score);
    sessionStorage.setItem("accuracy", accuracy);
    sessionStorage.setItem("speed", speed);

    //Score, accuracy and speed will be written on db file
    if (userid !== null) {
        writeScore(userid, password, gameid, level, score, accuracy, speed);
    }

    sessionStorage.setItem("finishedGameId", GAMEID);

    return;
};
