document.getElementsByTagName('html')[0].style.fontSize = window.innerWidth / 6.4 + 'px';
var gameWrap = document.getElementById('game-main');
var btn = parseInt(decodeURI(getQueryString("btn")));
selectLevel();


var column = [];
window.itemIndex = 0;
window.set = 0;
window.number = 0;
window.firstTime = null;
window.lastTime = null;
var itemArr = [];

var startTime = new Date();

var oUl = document.getElementsByClassName('lines');
var oItem = document.getElementById('item');
var alertDie = document.getElementById('die');
var alertWin = document.getElementById('win');
var mask = document.getElementById('mask');
var btnReturn = document.getElementsByClassName('return');
var btnReplay = document.getElementsByClassName('replay');
var btnNext = document.getElementsByClassName('next')[0];
var oContent = document.getElementById('content');
var oShowTime = document.getElementById('show-time');
var oMaxTime = document.getElementById('max-time');


alertDie.className = 'floatConfirm fail hidden';
mask.className = 'float-mask hidden';
alertWin.className = 'floatConfirm success hidden';


if (btn === 0) {
    //生成安仔位置列表
    itemArr[0] = [];
    itemArr[1] = [];
    itemArr[2] = [];

    //生成台阶对象
    column[0] = new Column(1, 2, 70, 40); //数量，高度差，最大高度，速度
    column[1] = new Column(4, 3, 80, 20);
    column[2] = new Column(1, 3, 70, 20);
    //生成台阶DOM
    oUl[0].innerHTML = column[0].generateColumn();
    oUl[1].innerHTML = column[1].generateColumn();
    oUl[2].innerHTML = column[2].generateColumn();
    //让台阶动起来
    column[0].move(oUl[0], startTime, itemArr, 0, oItem, column, false, oShowTime);
    column[1].move(oUl[1], startTime, itemArr, 1, oItem, column, true, oShowTime);
    column[2].move(oUl[2], startTime, itemArr, 2, oItem, column, false, oShowTime);
    
    btnNext.onclick = function() {
        location.assign('gamePage.html?btn=1');
    };
    oMaxTime.innerHTML = '2秒内通关成功';
}
if (btn === 1) {
    itemArr[0] = [];
    itemArr[1] = [];
    itemArr[2] = [];


    column[0] = new Column(1, 2, 70, 40); //数量，高度差，最大高度，速度
    column[1] = new Column(9, 3, 80, 20);
    column[2] = new Column(1, 3, 70, 20);
    
    oUl[0].innerHTML = column[0].generateColumn();
    oUl[1].innerHTML = column[1].generateColumn();
    oUl[2].innerHTML = column[2].generateColumn();
    
    column[0].move(oUl[0], startTime, itemArr, 0, oItem, column, false, oShowTime);
    column[1].move(oUl[1], startTime, itemArr, 1, oItem, column, true, oShowTime);
    column[2].move(oUl[2], startTime, itemArr, 2, oItem, column, false, oShowTime);
    btnNext.onclick = function() {
        location.assign('gamePage.html?btn=2');
    };
    oMaxTime.innerHTML = '2秒内通关成功';
}
if (btn === 2) {
    itemArr[0] = [];
    itemArr[1] = [];
    itemArr[2] = [];
    itemArr[3] = [];
    itemArr[4] = [];

    column[0] = new Column(1, 2, 70, 40); //数量，高度差，最大高度，速度
    column[1] = new Column(4, 3, 80, 30);
    column[2] = new Column(6, 3.5, 70, 15);
    column[3] = new Column(5, 2, 90, 10);
    column[4] = new Column(1, 3, 70, 20);

    oUl[0].innerHTML = column[0].generateColumn();
    oUl[1].innerHTML = column[1].generateColumn();
    oUl[2].innerHTML = column[2].generateColumn();
    oUl[3].innerHTML = column[3].generateColumn();
    oUl[4].innerHTML = column[4].generateColumn();


    column[0].move(oUl[0], startTime, itemArr, 0, oItem, column, false, oShowTime);
    column[1].move(oUl[1], startTime, itemArr, 1, oItem, column, true, oShowTime);
    column[2].move(oUl[2], startTime, itemArr, 2, oItem, column, true, oShowTime);
    column[3].move(oUl[3], startTime, itemArr, 3, oItem, column, true, oShowTime);
    column[4].move(oUl[4], startTime, itemArr, 4, oItem, column, false, oShowTime);

    btnNext.style.display = 'hidden';
    oMaxTime.innerHTML = '7秒内通关成功';
}

// 为弹窗按钮设置响应事件
for (var i = 0; i < btnReturn.length; i++) {
    btnReturn[i].onclick = function() {
        location.assign('mainPage.html');
    };
}
for (var i = 0; i < btnReplay.length; i++) {
    btnReplay[i].onclick = function() {
        location.reload();
    };
}
//根据选择的关卡生成UL标签
function selectLevel() {
    var num = 0;
    if (btn === 0 || btn === 1) {
        num = 3;
    } else if (btn == 2) {
        num = 5;
    }
    for (var i = 0; i < num; i++) {
        var node = document.createElement('ul');
        node.className = 'lines';
        gameWrap.appendChild(node);
    }
}

//从URL里面获得选关参数
function getQueryString(name) {

    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) return unescape(r[2]);
    return null;
}
// 通关失败函数
function die(content) {
    lastTime = Date.now();
    if (content) {
        oContent.innerHTML = content;
    }
    alertDie.className = 'floatConfirm fail';
    mask.className = 'float-mask';
}
//通关成功函数，判定超时阈值，超时显示通关失败
function win() {
    var maxTime = [2000, 2000, 7000];
    lastTime = Date.now();
    var timeUsed = lastTime - firstTime;
    if (timeUsed < maxTime[btn]) {
        alertWin.className = 'floatConfirm success';
    } else {
        die('超时了。。。。');
    }

}

