/*-----------------Game Level Parameters--------------------*/
var OPTIMUMQUESTIONCOUNT =  [10, 10, 10, 10, 10];
var PICCOUNT =              [5, 7, 10, 13, 15];
var MINDIFIMG =             [3, 4, 4, 4, 5];
var MAXSAMEIMG =            [2, 3, 3, 4, 4];
var VERTICALIMGCOUNT =      [3, 3, 4, 4, 5];
var HORIZONTALIMGCOUNT =    [3, 4, 4, 5, 5];
var TTLIMAGECOUNT =         [16, 20, 25, 30, 36];
var LEVELSET =              [4, 5, 5, 6, 6];
var SETSIZE =               [4, 4, 5, 5, 6];
/*----------------------------------------------------------*/

/*-----------------Constants--------------------*/
var GAMEID = 64;
var GAMERESOURCE = "../js/resource/game/" + sessionStorage.getItem("langOption") + "/game64.min.json";
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

        // game parameters will be set
        optimumQuestionCount = OPTIMUMQUESTIONCOUNT[level - 1];
        picCount = PICCOUNT[(level - 1)];
        verticalImgCount = VERTICALIMGCOUNT[level - 1];
        horizontalImgCount = HORIZONTALIMGCOUNT[level - 1];
        maxSameImg = MAXSAMEIMG[level - 1];

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
            images[0].src = "../img/game/game64/0.png";
            images[0].addEventListener("load", imageLoaded);
            for (i = 1; i < TTLIMAGECOUNT[level - 1] + 1; i++) {
                images[i] = new Image();
                images[i].src = "../img/game/game64/level" + level + "/" + (i) + ".png";
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
    $("#timeInfo").html(TOTALTIME);

    initializeCheckAnswerSoundPlayers();
    initializeCountdownSoundPlayers();

    imgMtr = new Array(verticalImgCount);
    for (i = 0; i < verticalImgCount; i++) {
        imgMtr[i] = new Array(horizontalImgCount);
    }
    score = 0;
    unitTimer = 100 / TIMERMAX;
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
    $("#game").css("display", "none");

    // initially all div/img in the imgMtr are set to 0 (initialize)
    for (i = 0; i < verticalImgCount; i++) {
        for (j = 0; j < horizontalImgCount; j++) {
            imgMtr[i][j] = 0;
            $("#div" + i + j).empty();
            $("#div" + i + j).css("border-color", "rgba(0,0,0,0)");
            $("#div" + i + j).css("cursor", "auto");
        }
    }
    

    // if correct answered questions passes optimal number of questions, the number of images will increase
    if (correctCount >= (optimumQuestionCount / 2)) {
        picCount = PICCOUNT[(level - 1)] + 1;
    }

    var imgControl = [];         // a 1 dimensional array will keep track how often an image has been used (index = image id for simplicity)
    for (l = 0; l <= TTLIMAGECOUNT[level - 1]; l++) {    //it is initialized to 0 (no image used)
        imgControl[l] = 0;
    }

    // the set to be chosen from is randomly decided
    var levelSet = Math.floor(Math.random() * LEVELSET[level - 1]) + 1;
    var setSize = SETSIZE[level - 1];

    // correct image is randomly chosen from that set
    var answerImageId = Math.floor(Math.random() * setSize) + 1 + ((levelSet - 1) * setSize);

    // coordinates of the correct image
    answerX = Math.floor(Math.random() * horizontalImgCount);
    answerY = Math.floor(Math.random() * verticalImgCount);

    // correct image is placed in the matrix and the attributes are set
    $("#div" + answerY + answerX).empty();
    $("#div" + answerY + answerX).css("border-color", "rgba(0,0,0,0)");
    $("#div" + answerY + answerX).attr('onclick', 'checkAnswer(' + answerX + ',' + answerY + ')');
    $(images[answerImageId]).clone().appendTo("#div" + answerY + answerX).on("load", imgLoaded);
    $("#div" + answerY + answerX).css("cursor", "pointer");
    imgMtr[answerY][answerX] = answerImageId;
    
    var numberOfDifImg = 1;     // excludes the answer picture itself

    var imageId = Math.floor(Math.random() * setSize) + 1 + ((levelSet - 1) * setSize);    // imageId is initialized for first runthrough
    while (imageId == answerImageId) {
        imageId = Math.floor(Math.random() * setSize) + 1 + ((levelSet - 1) * setSize);    // has to be different than correct answer
    }

    imgControl[answerImageId] = 1;     // imgControl is updated with Id of image
                         
    for (j = picCount - 1 ; j > 0 ; j--) {  // this loop will run for each picture chosen and placed until all images are placed
       
        if (j == picCount - 1) {            // if its the first image, a new one will be added
            numberOfDifImg++;
            imgControl[imageId]++;          // imgControl is updated accordingly
        }
        else if (j == 1 || imgControl[imageId] == 1) {    // if there is only a last space left or the last picture has been used only once, use the same image to prevent uniqueness
            // no change in imageId                       // Note that if the last image used has been used as many times as its allowed (maxSameImg), and there is only one picture left, it will be forced to go +1 above the image limit
            imgControl[imageId]++;              // imgControl is updated accordingly
        }
        else if (numberOfDifImg >= setSize) {   // if the max limit of the img set has been reached, add a random picture
            imageId = Math.floor(Math.random() * setSize) + 1 + ((levelSet - 1) * setSize);

            while (imageId == answerImageId || imgControl[imageId] >= maxSameImg) {
                imageId = Math.floor(Math.random() * setSize) + 1 + ((levelSet - 1) * setSize);    // has to be different than correct answer
            }
            imgControl[imageId]++;
        }
        else {                              // else, decide by chance to add a new picture or use the same
            var chance = Math.random();

            if (Math.floor(j / 2) <= MINDIFIMG[level - 1] - numberOfDifImg || imgControl[imageId] >= maxSameImg) {
                chance = 0;                 // if the number of minimum pictures I still have to use is equal or lower than the minimum number of pictures I can use, or if the max limit usage of the same picture has been reached, chance is set to 1 to force an image change
            }


            if (chance >= 0.7 && imgControl[imageId] < maxSameImg) {           // by 30% chance (and limitation) add same image
                imgControl[imageId]++;
            }
            else {                                  //otherwise, change to a unique image

                while (imgControl[imageId]) {       // a while loop will make sure to chose a picture which has not been used before
                    imageId = Math.floor(Math.random() * setSize) + 1 + ((levelSet - 1) * setSize);
                }
                numberOfDifImg++;                   // numberOfDifImg and imgControl are updated accordingly
                imgControl[imageId]++;
            }
        }
        
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

//Countdown (got help)
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

//Click will be checked (got a little help)
var checkAnswer = function (x, y) {
    if (locked == false) {
        questionIndex++;
        locked = true;
        setInfoElementSize();
        alignInfoImages("#gameDiv");

        $("#middlePart").attr("disabled", true);

        if (x == answerX && y == answerY) {
            $("#div" + answerY + answerX).css("border-color", "#00cc00");
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
            $("#info img").eq(1).addClass("opaque");
            $("#div" + answerY + answerX).css("border-color", "#cc0000");
        }
        $("#info").css("display", "block");

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
