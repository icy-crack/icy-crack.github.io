/*台阶模块 传参（台阶个数、台阶之间变化高度、台阶最高高度、台阶的变化速度）
 */
function Column(num, maxChange, maxHeight, speed) {
    this.num = num;//台阶个数
    this.maxChange = maxChange; //调整台阶之间的高度
    this.maxHeight = maxHeight; //调整台阶的最高高度
    this.speed = speed; //台阶的变化速度
    this.change = [];
    this.final = 0;
}

/*用于在DOM中生成台阶的函数*/
Column.prototype.generateColumn = function() {
    var stml = '';
    for (var i = 0; i < this.num; i++) {
        stml += '<li></li>';
        this.change[i] = this.num;
    }
    return stml;
};


/*台阶移动的函数，同时监控安仔的运动事件控制安仔的移动
传参（台阶父DOM、运动开始时间、存储安仔运动数组、父节点的组别、安仔DOM,父节点数组，控制器）
控制器：如果为true，控制运动的台阶
       如果为false，控制起点和终点台阶*/
Column.prototype.move = function(parentNode, startTime, itemArr, parentNum, itemNode, parentColumn, controller, timeNode) {

    var This = this;
    var px = window.innerWidth / 640;
    setInterval(function() {
        var timeChange = Date.now()- startTime;
        for (var i = 0; i < This.num; i++) {
            //如果为两端台阶则固定高度，否则变化
            if (controller) {
                var change = (timeChange - This.speed * i * This.num) / This.speed % This.maxHeight;
                if (change < (This.maxHeight / 2)) {
                    This.change[i] =(1 / (This.maxHeight / 2)) * This.maxChange * change;
                } else {
                    This.change[i] =This.maxChange - (1 / (This.maxHeight / 2)) * This.maxChange * (change - (This.maxHeight / 2));
                }
            } else {
                This.change[i] = 2;
            }
            //台阶变化的DOM显示
            parentNode.children[i].style.height = This.change[i] * This.maxHeight* px+ 'px'; //柱子高度变化DOM操作
            
            //判断安仔所在的组并记录和改变安仔的DOM位置
            if (set == parentNum) {
                itemArr[parentNum][i] = This.change[i] * This.maxHeight; //小人位置
                itemNode.style.bottom = itemArr[parentNum][itemIndex]* px + 'px'; //小人节点DOM操作
                itemNode.style.left = 35 * (itemIndex + number)* px + 'px';
            }
            
            //计时器的DOM显示
            if (firstTime !== null && lastTime === null) {
                timeNode.innerHTML = parseInt((Date.now() - firstTime) / 1000) + '.' + parseInt((Date.now() - firstTime) / 10 % 100) + '秒';
            }
        }
        
        // 判断安仔的跳转状态
        if (set == parentNum) {
            if (itemIndex == This.num - 1) {
                jumpOutLine();
            } else {
                jumpInLine();
            }
            ifEnd();
        }
        
        //安仔跳转到最后一个节点的时候，判断终点操作
        function ifEnd() {
            if (set == parentColumn.length - 1) {
                This.final++;
                if (This.final === 1) {
                    lastTime = Date.now();
                    win();
                }

            }
        }
        
        // 同一父节点安仔跳转DOM操作
        function jumpInLine() {
            document.onclick = function() {

                if (itemArr[set][itemIndex] > This.change[itemIndex + 1] * This.maxHeight) {
                    itemIndex++;
                } else if (set == parentNum && itemArr[set][itemIndex] < This.change[itemIndex + 1] * This.maxHeight) {
                    die();
                }
            };
        }
        
        // 两个不同父节点DOM的安仔跳转操作
        function jumpOutLine() {
            document.onclick = function() {
                if (set === 0 && itemIndex === 0) {
                    firstTime = Date.now();
                }
                if (itemArr[set][itemIndex] > parentColumn[parentNum + 1].change[0] * parentColumn[parentNum + 1].maxHeight) {
                    itemIndex = 0;
                    number += This.num;
                    set++;
                    console.log(itemIndex);
                } else if (itemArr[set][itemIndex] < parentColumn[parentNum + 1].change[0] * parentColumn[parentNum + 1].maxHeight) {
                    die();
                }
            };
        }

    }, This.speed);

};