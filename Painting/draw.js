var can = document.getElementById('myCanvas');
var ctx = can.getContext('2d');
var more = document.getElementsByClassName('more');
var HEIGHT = can.height;
var WIDTH = can.width;
var panStatus = {
    color: '#000',
    size : 5,
    earser : 5
};

function getPan() {
    var x, y;

    document.addEventListener('touchstart', function (e) {
        if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
        x = e.touches[0].pageX;
        y = e.touches[0].pageY;
        ctx.beginPath();
        ctx.save();
        ctx.moveTo(x, y);
        //ctx.arc(x,y,size,0,2*Math.PI);
        //ctx.stroke();
        //ctx.fill();
    });
    document.addEventListener("touchmove", function (e) {
        if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
        var size = panStatus.size,
            color = panStatus.color,
            earser = panStatus.earser;
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        x = e.touches[0].pageX;
        y = e.touches[0].pageY;
        ctx.lineTo(x, y);
        ctx.stroke();
    });
    document.addEventListener("touchend", function (e) {
        if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
        ctx.closePath();
    });
}
function showList(){
    document.addEventListener('touchstart',function(e){
        var ele = e.target;
        if (ele.className.indexOf('item') > -1){
            for(var i=0; i<more.length; i++){
                more[i].style.display = 'none';
            }
            var thisItem = ele.getAttribute('data-item');
            for(var i=0; i<more.length; i++){
                var tmpItem = more[i].getAttribute('data-item');
                if(tmpItem === thisItem){
                    more[i].style.display = 'block';
                    break;
                }
            }
        }else{
            for(var i=0; i<more.length; i++){
                more[i].style.display = 'none';
            }
        }
    });
}
function getSt(){
    document.addEventListener('touchstart',function(e){
        var tar = e.target;
        //清空画布
        if(tar.id === 'reset'){
            ctx.clearRect(0,0,WIDTH,HEIGHT);
        }
        if (tar.className.indexOf('st')>-1){
            var st = tar.getAttribute('data-style');
            var p = tar.parentNode.getAttribute('data-item');
            panStatus[p] = st;
            if(p === 'earser') {
                panStatus.color = 'beige';
            }
            for(var i=0; i<more.length; i++){
                more[i].style.display = 'none';
            }
            console.log(panStatus)
        }
    });
}

window.onload = function(){
    getPan();
    showList();
    getSt();
}
