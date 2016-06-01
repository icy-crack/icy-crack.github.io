var can1;
var can2;

var ctx1;
var ctx2;

var lastTime;
var deltaTime;

var canWidth;
var canHeight;

var bgPic = new Image();

var ane;
var fruit;
var mom;
var baby;

var mx, my;  //鼠标

var babyTail = [];
var babyEye = [];
var babyBody = [];

var momTail = [];
var momEye = [];
var momBodyOrange = [];
var momBodyBlue = [];

var data;

var wave;
var halo;

var dust;
var dustPic = [];

document.body.onload = game;
function game(){
    init();
    lastTime = Date.now();
    deltaTime = 0;
    gameLoop();

}

function init(){

    //初始化绘图画布
    can1 = document.getElementById('canvas1');   //fishes, dust, UI
    can2 = document.getElementById('canvas2');    //bk ane, fruits
    ctx1 = can1.getContext('2d');
    ctx2 = can2.getContext('2d');

    can1.addEventListener('mousemove',onmouseMove,false);

    canWidth = can1.width;
    canHeight = can1.height;

    bgPic.src = "src/background.jpg";

    ane = new aneObj();
    ane.init();

    fruit = new fruitObj();
    fruit.init();

    mom = new momObj();
    mom.init();

    baby = new babyObj();
    baby.init();

    mx = canWidth * 0.5;
    my = canHeight * 0.5;

    //小鱼序列帧
    for(var i=0; i<8; i++){
        babyTail[i] = new Image();
        babyTail[i].src = 'src/babyTail' + i +'.png';
    }
    for(var i=0; i<2; i++){
        babyEye[i] = new Image();
        babyEye[i].src =  'src/babyEye' + i +'.png';
    }
    for(var i=0; i<20; i++){
        babyBody[i] = new Image();
        babyBody[i].src = 'src/babyFade' + i +'.png';
    }
    //大鱼序列帧
    for(var i=0; i<8; i++){
        momTail[i] = new Image();
        momTail[i].src = 'src/bigTail' + i +'.png';
    }
    for(var i=0; i<2; i++){
        momEye[i] = new Image();
        momEye[i].src =  'src/bigEye' + i +'.png';
    }
    for(var i=0; i<8; i++){
        momBodyOrange[i] = new Image();
        momBodyBlue[i] = new Image();
        momBodyOrange[i].src = 'src/bigSwim' + i +'.png';
        momBodyBlue[i].src = 'src/bigSwimBlue' + i +'.png';
    }

    data = new dataObj();
    ctx1.font = '30px Verdana';
    ctx1.textAlign = 'center';

    wave = new waveObj();
    wave.init();

    halo = new haloObj();
    halo.init();

    for (var i=0; i<7; i++){
        dustPic[i] = new Image();
        dustPic[i].src = 'src/dust'+i+'.png';
    }
    dust = new dustObj();
    dust.init();

}

function gameLoop(){
    window.requestAnimFrame(gameLoop);
    var now = Date.now();
    deltaTime = now-lastTime;
    lastTime = now;
    if(deltaTime> 50) {
        deltaTime = 50;
    }
    drawBackground();
    ane.draw();
    fruitMonitor();
    fruit.draw();

    ctx1.clearRect(0, 0, canWidth, canHeight);
    mom.draw();

    baby.draw();
    data.draw();

    momFruitCollision();
    momBabyCollision();

    wave.draw();
    halo.draw();

    dust.draw();

}

function onmouseMove(e){
    if (!data.gameover){
        if(e.offsetX || e.layerX){
            mx = e.offsetX == undefined ? e.layerX : e.offsetX;
            my = e.offsetY == undefined ? e.layerY : e.offsetY;
        }
    }
}