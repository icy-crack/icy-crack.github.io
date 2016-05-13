(function(window, undefined) {
    var bezierWrapper = document.querySelector(".bezier-control .function"),
        bezierCanvas = bezierWrapper.querySelector('.bezier-canvas'),
        point1 = bezierWrapper.querySelector('.point-1'),
        point2 = bezierWrapper.querySelector('.point-2');
    var dragWrapper = document.querySelector(".bezier-control .bar"),
        dragCanvas = dragWrapper.querySelector('.duration-bar'),
        dragPoint = dragWrapper.querySelector('.duration'),
        previewCanvas = dragWrapper.querySelector('.preview-canvas'),
        compareCanvas = dragWrapper.querySelector('.compare-canvas'),
        button = dragWrapper.querySelector('.start-preview'),
        save = dragWrapper.querySelector('.save-setting');
    var curvesCanvas = document.querySelector(".bezier-control .default-bezier");
    var codeExport = document.querySelector('.code-area');
    var btnSuccess = document.querySelector('.success');
    var btnCancel = document.querySelector('.cancel');
    var inputName = document.querySelector('.modal-body');

    /**
     * previewCtrl对象，用于控制贝塞尔曲线变化及不同canvas之间同步
     * @type {{setCoordsPoint, setDurationInfo, mouseDown, mouseUp, mouseMove, drawBezier, getPreviewPoint, saveBezier, durationTime, init}}
     */
    var previewCtrl = (function () {
        /**
         * ctrlPoint对象：
         *      三次贝塞尔函数的控制点[cp1, cp2, cp3, cp4，其中cp2,cp3为控制点]。
         *      size：坐标系的大小，默认值：150
         *      padding: 距离canvas边缘的空隙，默认值：50
         * ctrlPointPreview对象：
         *      三次贝塞尔函数的控制点[为ctrlPoint对象的副本，控制preview canvas上的贝塞尔曲线]
         *      属性和ctrlPoint对象相同
         * linePoint对象：
         *      滑动块的控制点
         *      start：滑动条的起始位置，默认[50, 50]
         *      end：滑动条的终止位置，默认[250，50]
         *      duration：滑动块的默认位置，默认[100， 50]，即1/4处
         *      padding：滑动条距离边缘的空隙
         *      durationTime：duration的长度，默认50
         *      size：滑动条的长度，默认200
         *
         */
        var ctrlPoint = {
                cp1: {
                    pointX: 50,
                    pointY: 200
                },
                cp2: {
                    pointX: 170,
                    pointY: 170
                },
                cp3: {
                    pointX: 110,
                    pointY: 110
                },
                cp4: {
                    pointX: 200,
                    pointY: 50
                },
                size: 150,
                padding: 50
            },
            ctrlPointPreview = {
                cp1: {
                    pointX: 5,
                    pointY: 55
                },
                cp2: {
                    pointX: 45,
                    pointY: 45
                },
                cp3: {
                    pointX: 25,
                    pointY: 25
                },
                cp4: {
                    pointX: 55,
                    pointY: 5
                },
                size: 50,
                padding: 5
            },
            linePoint = {
                start: {
                    pointX: 50,
                    pointY: 50
                },
                duration: {
                    pointX: 100,
                    pointY: 50
                },
                end: {
                    pointX: 250,
                    pointY: 50
                },
                padding: 50,
                durationTime: 50,
                size: 200
            };
        /**
         * dragTarget：
         *      记录正在被拖动的元素，适用于贝塞尔函数的控制点和滑动条上的滑动块
         * diffX、diffY：
         *      记录鼠标和被拖动元素左边缘的偏移量，用于校正鼠标位置
         * cubicText：
         *      贝塞尔函数的参数字符串，如(0.42, 0, 0.58, 0)
         * durationTime：
         *      当前的duration时间值，如2.5s，用于更新code-area中的time-duration值
         *      该变量最后被引出，在外部使用
         */
        var dragTarget = null;
        var diffX, diffY, cubicText, durationTime;

        /**
         * getPreviewPoint：
         *      根据 [贝塞尔函数控制坐标bezierCanvas] 或者 [设定值的控制坐标curveCanvas]
         *      来计算 previewCanvas 和 compareCanvas的控制坐标值
         *      计算方法：
         *          (a - a.padding) / a.size = (b - b.padding) / b.size [1]
         * @param oneCtrlPoint
         *      传入控制点1[CP2]或者控制点2[CP3]
         * @param selector
         *      传入的控制点的编号，2或者3
         * @param ctrlP
         *      可选，参照的ctrlPoint对象[来自bezierCanvas或者curveCanvas]
         * @param ctrlPre
         *      可选，需要被修改的ctrlPointPreview对象[来自previewCanvas或者compareCanvas]
         */
        function getPreviewPoint(oneCtrlPoint, selector, ctrlP, ctrlPre) {
            //判断是否传入了ctrlP、ctrlPre，如果没有，则使用默认值ctrlPoint、ctrlPointPreview
            var control = ctrlP || ctrlPoint, preview = ctrlPre || ctrlPointPreview;
            //计算[bezierCanvas和previewCanvas的尺寸比] 或者 [curveCanvas和compareCanvas的尺寸比]
            var ratio = control.size / preview.size;
            //根据公式[1]计算preview或者compare中的控制点坐标
            preview['cp' + selector] = {
                pointX: (oneCtrlPoint.pointX - control.padding) / ratio + preview.padding,
                pointY: (oneCtrlPoint.pointY - control.padding) / ratio + preview.padding
            };
        }

        /**
         * drawBezier：
         *      绘制贝塞尔函数
         * @param canvas
         *      待绘制的canvas对象[DOM对象]
         * @param ctrlPoint
         *      贝塞尔函数的控制点对象
         * @param fillColor
         *      可选参数，填充颜色，如果在curveCanvas中这个参数为null，此时采用clearRect来清空画布
         * @param strokeColor
         *      描边颜色
         * @param text
         *      可选参数，绘制文本内容，只有在bezierCanvas里这个值才有效，其他情况都应该保持null
         */
        function drawBezier(canvas, ctrlPoint, fillColor, strokeColor, text) {
            //获取绘图上下文
            var context = canvas.getContext('2d');
            /*
             * fillColor != null，则用fillColor来填充画布，用于清空画布
             * fillColor == null，则用clearRect来清空画布
             */
            if (fillColor) {
                context.fillStyle = fillColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                var w = canvas.width, h = canvas.height;
                context.clearRect(0, 0, w, h);
            }

            context.strokeStyle = strokeColor;
            context.lineWidth = 3;

            //绘制贝塞尔曲线
            context.beginPath();
            context.moveTo(ctrlPoint.cp1.pointX, ctrlPoint.cp1.pointY);
            context.bezierCurveTo(ctrlPoint.cp2.pointX, ctrlPoint.cp2.pointY, ctrlPoint.cp3.pointX,
                ctrlPoint.cp3.pointY, ctrlPoint.cp4.pointX, ctrlPoint.cp4.pointY);
            context.stroke();
            context.closePath();

            //绘制控制点
            context.beginPath();
            context.fillStyle = strokeColor;
            context.arc(ctrlPoint.cp2.pointX, ctrlPoint.cp2.pointY, 2, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
            context.arc(ctrlPoint.cp3.pointX, ctrlPoint.cp3.pointY, 2, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
            context.fill();
            context.closePath();

            //绘制贝塞尔曲线起点和终点到控制点的直线
            context.beginPath();
            context.lineWidth = 1;
            context.moveTo(ctrlPoint.cp4.pointX, ctrlPoint.cp4.pointY);
            context.lineTo(ctrlPoint.cp3.pointX, ctrlPoint.cp3.pointY);
            context.moveTo(ctrlPoint.cp1.pointX, ctrlPoint.cp1.pointY);
            context.lineTo(ctrlPoint.cp2.pointX, ctrlPoint.cp2.pointY);
            context.stroke();
            context.closePath();

            //当text有值时，绘制文本和坐标轴、刻度等
            if (text != null) {
                //绘制坐标轴
                context.beginPath();
                context.lineWidth = 2;
                context.strokeStyle = "rgb(120, 91, 119)";
                //绘制x轴
                context.moveTo(ctrlPoint.cp1.pointX, ctrlPoint.cp1.pointY);
                context.lineTo(ctrlPoint.cp4.pointX, ctrlPoint.cp1.pointY);
                //绘制y轴
                context.moveTo(ctrlPoint.cp1.pointX, ctrlPoint.cp1.pointY);
                context.lineTo(ctrlPoint.cp1.pointX, ctrlPoint.cp4.pointY);
                context.stroke();
                context.closePath();

                //绘制贝塞尔函数基准线，即cubic-bezier(0, 0, 1, 1)
                context.beginPath();
                context.lineWidth = 6;
                context.strokeStyle = "rgba(120, 91, 119, .2)";
                context.moveTo(ctrlPoint.cp1.pointX, ctrlPoint.cp1.pointY);
                context.lineTo(ctrlPoint.cp4.pointX, ctrlPoint.cp4.pointY);
                context.stroke();
                context.closePath();

                //绘制文本
                context.fillStyle = "rgb(120, 91, 119)";
                context.font = "15px courier";
                context.fillText("Cubic-Bezier", 30, 230);
                context.fillText("Cubic-Bezier", 30, 230);
                context.fillText("Cubic-Bezier", 30, 230);
                context.fillText(text, 50, 250);
                context.fillText(text, 50, 250);
                context.fillText(text, 50, 250);

                //绘制坐标刻度
                context.fillText("0", 40, 210);
                context.fillText("1", 195, 210);
                context.fillText("1", 40, 55);
            }
        }

        /**
         * drawDurationBar：
         *      绘制滑动条和滑动块
         * @param canvas
         *      用于绘制的canvas对象
         * @param linePoint
         *      控制条和控制块的信息
         * @param fillColor
         *      填充颜色
         * @param outStroke
         *      滑动条背景色
         * @param innerStroke
         *      滑动条前景色
         * @param text
         *      滑动条文本信息
         */
        function drawDurationBar(canvas, linePoint, fillColor, outStroke, innerStroke, text) {
            //获取绘制上下文
            var context = canvas.getContext('2d');
            //获取完整的文本信息
            var totalText = "Duration: " + text + "s";

            //清空画布
            context.fillStyle = fillColor;
            context.strokeStyle = outStroke;
            context.fillRect(0, 0, canvas.width, canvas.height);

            //绘制滑动条
            context.beginPath();
            context.lineWidth = 5;
            context.lineCap = "round";
            context.moveTo(linePoint.start.pointX, linePoint.start.pointY);
            context.lineTo(linePoint.end.pointX, linePoint.end.pointY);
            context.stroke();
            context.closePath();

            //绘制已经拖动的滑动条
            context.beginPath();
            context.strokeStyle = innerStroke;
            context.moveTo(linePoint.start.pointX, linePoint.start.pointY);
            context.lineTo(linePoint.duration.pointX, linePoint.duration.pointY);
            context.stroke();
            context.closePath();

            //绘制文本
            context.fillStyle = innerStroke;
            context.font = "20px courier";
            context.fillText(totalText, 50, 80);
        }

        /**
         * drawScreen：
         *      重绘函数，调用所有的绘制函数，重绘贝塞尔函数和滑动条
         * @param ctrlPoint
         *      bezierCanvas的控制点对象
         * @param ctrlPointPreview
         *      previewCanvas的控制点对象
         * @param linePoint
         *      dragCanvas的滑动信息对象
         */
        function drawScreen(ctrlPoint, ctrlPointPreview, linePoint) {
            //获得CSS中transition-function 贝塞尔函数的归一化参数数组，例如[0.42, 0, 0.58, 1]
            var cubicBezier = [
                ((ctrlPoint.cp2.pointX - ctrlPoint.padding) / ctrlPoint.size).toFixed(2),
                ((ctrlPoint.padding + ctrlPoint.size - ctrlPoint.cp2.pointY) / 150).toFixed(2),
                ((ctrlPoint.cp3.pointX - ctrlPoint.padding ) / ctrlPoint.size).toFixed(2),
                ((ctrlPoint.padding + ctrlPoint.size - ctrlPoint.cp3.pointY) / ctrlPoint.size).toFixed(2)
            ];
            //获取CSS参数transition-duration，根据已滑动的长度计算
            durationTime = (linePoint.durationTime / linePoint.size * 10).toFixed(1);
            //获得贝塞尔函数归一化参数的字符串
            cubicText = "(" + cubicBezier.join(',') + ")";
            //设置previewCanvas的transition属性
            previewCanvas.style.transition = "all " + durationTime + "s cubic-bezier" + cubicText;
            //设置compareCanvas的transition-duration属性
            compareCanvas.style.transitionDuration = durationTime + "s";
            //实时更新code-area区域中的time-duration值
            codeExport.innerHTML = codeExport.innerHTML.replace(/(\d+\.\d+)s/g, durationTime + "s");


            //重绘bezierCanvas
            drawBezier(bezierCanvas, ctrlPoint, "#fff", "#000", cubicText);
            //同步重绘previewCanvas
            drawBezier(previewCanvas, ctrlPointPreview, "#ff4081", "#fff");
            //重绘滑动条
            drawDurationBar(dragCanvas, linePoint, "#fff", "#000", "#ff4081", durationTime);
        }

        function initCtrlPoint() {
            point1.style.left = ctrlPoint.cp2.pointX - 5 + bezierCanvas.offsetLeft + "px";
            point2.style.left = ctrlPoint.cp3.pointX - 5 + bezierCanvas.offsetLeft + "px";
            dragPoint.style.left = linePoint.duration.pointX - 10 + dragCanvas.offsetLeft + "px";
        }
        return {
            /**
             * 配置函数，根据用户自定义参数来覆盖默认值
             * setCoordsPoint:
             *      自定义贝塞尔函数的控制点
             * setDurationInfo：
             *      自定义滑动条信息
             */
            setCoordsPoint: function(point1, point2){
                //如果point1和point2存在，则覆盖默认值
                ctrlPoint = point1 || ctrlPoint;
                ctrlPointPreview = point2 || ctrlPointPreview;
                //根据ctrlPoint的控制点来设置ctrlPointPreview的控制点，因为两者始终同步
                getPreviewPoint(ctrlPoint.cp2, 2);
                getPreviewPoint(ctrlPoint.cp3, 3);
            },
            setDurationInfo: function(durationInfo){
                //如果durationInfo存在，则覆盖默认值
                linePoint = durationInfo || linePoint;
            },
            /**
             * mouseDown、mouseUp、mouseMove：
             *      分别为mousedown/mouseup/mousemove的事件处理函数
             * @param event
             */
            mouseDown: function (event) {
                //判断是否在可拖动元素上
                if (event.target.className.indexOf("drag") > -1) {
                    //获取拖动对象
                    dragTarget = event.target;
                    //计算鼠标位置的校正值
                    diffX = event.clientX - dragTarget.offsetLeft;
                    diffY = event.clientY - dragTarget.offsetTop;
                }
            },
            mouseUp: function (event) {
                //清空拖动元素，防止在鼠标松开后拖动对象仍然被mousemove事件处理程序处理
                dragTarget = null;
            },
            mouseMove: function (event) {
                //和mouseUp的dragTarget对应
                if (dragTarget !== null) {
                    var tempX = event.clientX - diffX,
                        tempY = event.clientY - diffY;
                    if (dragTarget.className.indexOf("point-") > -1) {
                        //控制拖动范围，使用了固定值[需要修改]
                        if (tempX >= 195 + bezierCanvas.offsetLeft) {
                            tempX = 195 + bezierCanvas.offsetLeft;
                        }
                        if (tempY >= 195) {
                            tempY = 195;
                        }
                        if (tempX <= 45 + bezierCanvas.offsetLeft) {
                            tempX = 45 + bezierCanvas.offsetLeft;
                        }
                        if (tempY <= 45) {
                            tempY = 45;
                        }
                        //设置拖动元素的新位置
                        dragTarget.style.top = tempY + "px";
                        dragTarget.style.left = tempX + "px";
                        //根据拖动元素修改控制对象的值，并同步previewCanvas
                        if (dragTarget.className.indexOf("point-2") > -1) {
                            ctrlPoint.cp3.pointX = tempX + 5 - bezierCanvas.offsetLeft;
                            ctrlPoint.cp3.pointY = tempY + 5;
                            getPreviewPoint(ctrlPoint.cp3, 3);
                        } else if (dragTarget.className.indexOf("point-1") > -1) {
                            ctrlPoint.cp2.pointX = tempX + 5 - bezierCanvas.offsetLeft;
                            ctrlPoint.cp2.pointY = tempY + 5;
                            getPreviewPoint(ctrlPoint.cp2, 2);
                        }
                    } else if (dragTarget.className.indexOf("duration") > -1) {
                        //控制拖动范围，使用了固定值[需要修改]
                        if (tempX <= 40 + dragCanvas.offsetLeft) {
                            tempX = 40 + dragCanvas.offsetLeft;
                        }
                        if (tempX >= 240 + dragCanvas.offsetLeft) {
                            tempX = 240 + dragCanvas.offsetLeft;
                        }
                        dragTarget.style.left = tempX + "px";
                        linePoint.duration.pointX = tempX + 10 - dragCanvas.offsetLeft;
                        linePoint.durationTime = linePoint.duration.pointX - linePoint.padding;
                    }
                    //重绘屏幕
                    drawScreen(ctrlPoint, ctrlPointPreview, linePoint);
                }
            },
            //引出drawBezier函数，供curveCanvas和compareCanvas使用
            drawBezier: drawBezier,
            //引出getPreviewPoint函数，供compareCanvas根据curveCanvas计算控制点
            getPreviewPoint: getPreviewPoint,
            //保存自定义贝塞尔函数，获得相应curveCanvas的控制点对象
            saveBezier: function(canvas){
                //预设padding：10
                var padding = 10;
                //获得坐标系的尺寸
                var size = (canvas.width - padding * 2);
                //创建除控制点以外的其他属性的控制对象
                var savePoint = {
                    cp1: {pointX: padding, pointY: padding + size},
                    cp2: {},
                    cp3: {},
                    cp4: {pointX: padding + size, pointY: padding},
                    size: size,
                    padding: padding,
                    transition: "cubic-bezier" + cubicText
                };
                //获得控制点坐标
                getPreviewPoint(ctrlPoint.cp2, 2, ctrlPoint, savePoint);
                getPreviewPoint(ctrlPoint.cp3, 3, ctrlPoint, savePoint);
                return savePoint;
            },
            //引出durationTime，用于code-area获取durationTime
            durationTime: function(){
                return durationTime;
            },
            //初始化屏幕
            init: function () {
                drawScreen(ctrlPoint, ctrlPointPreview, linePoint);
            },
            initCtrlPoint: initCtrlPoint
        }
    })();

    /**
     * getCoordsInfo：
     *      获得用户自定义的控制点对象
     * @param canvas
     *      画布对象
     * @param ctrlPoint1
     *      贝塞尔函数控制点1
     * @param ctrlPoint2
     *      贝塞尔函数控制点2
     * @returns {{cp1: {pointX: number, pointY: number}, cp2: (*|{}), cp3: (*|{}), cp4: {pointX: number, pointY: number}, size: number, padding: number}}
     */
    function getCoordsInfo(canvas, ctrlPoint1, ctrlPoint2) {
        //获得画布大小
        var totalWidth = canvas.width;
        //获取用户设置的坐标系大小
        var coordSize = canvas.getAttribute('data-size');
        //计算坐标系两边的空隙
        var padding = (totalWidth - coordSize) / 2;
        //返回控制点对象
        return {
            cp1: {
                pointX: padding,
                pointY: padding + ( coordSize - 0 )
            },
            cp2: ctrlPoint1 || {},
            cp3: ctrlPoint2 || {},
            cp4: {
                pointX: padding + (coordSize - 0),
                pointY: padding
            },
            size: coordSize - 0,
            padding: padding
        }
    }

    /**
     * getDurationInfo：
     *      获得用户自定义的滑动块信息
     * @param canvas
     * @returns {{start: {pointX: number, pointY: number}, duration: {pointX: number, pointY: number}, end: {pointX: number, pointY: number}, padding: number, durationTime: (linePoint.duration|{pointX, pointY}|duration|Number), size: *}}
     */
    function getDurationInfo(canvas) {
        //获得画布尺寸
        var totalWidth = canvas.width;
        //获得用户自定义参数，包括滑动条长度，duration默认值
        var durationSize = canvas.dataset;
        //根据滑动条长度data-size计算空隙
        var padding = (totalWidth - durationSize.size) / 2;
        //返回滑动块信息对象
        return {
            start: {
                pointX: padding,
                pointY: padding
            },
            duration: {
                pointX: durationSize.duration - 0 + padding,
                pointY: padding
            },
            end: {
                pointX: durationSize.size - 0 + padding,
                pointY: padding
            },
            padding: padding,
            durationTime: durationSize.duration,
            size: durationSize.size
        }
    }

    /**
     * getInitParams:
     *      获得用户的自定义参数
     */
    function getInitParams(){
        //获取用户自定义的两个控制点的坐标
        var ctrlPoint1 = {pointX: point1.dataset.x, pointY: point1.dataset.y},
            ctrlPoint2 = {pointX: point2.dataset.x, pointY: point2.dataset.y};

        //获取用户自定义的坐标系大小
        var coordsInfo = getCoordsInfo(bezierCanvas, ctrlPoint1, ctrlPoint2);
        var coordsInfoPreview = getCoordsInfo(previewCanvas);
        //覆盖默认值
        previewCtrl.setCoordsPoint(coordsInfo, coordsInfoPreview);

        //获取用户自定义的duration参数
        var duration = getDurationInfo(dragCanvas);
        //覆盖默认值
        previewCtrl.setDurationInfo(duration);
    }

    /**
     * initEventHandler：
     *      初始化事件处理程序
     */
    function initEventHandler() {
        var modal = document.querySelector(".modal");
        var modalBody = modal.firstElementChild;
        //事件委托，绑定鼠标的一系列事件处理函数
        document.addEventListener('mousedown', previewCtrl.mouseDown);
        document.addEventListener('mousemove', previewCtrl.mouseMove);
        document.addEventListener('mouseup', previewCtrl.mouseUp);

        //预览按钮的事件处理程序
        button.addEventListener('click', function (event) {
            if (previewCanvas.className.indexOf('running') > -1) {
                previewCanvas.classList.remove('running');
                compareCanvas.classList.remove('running');
            } else {
                previewCanvas.classList.add('running');
                compareCanvas.classList.add('running');
            }
        });

        //保存自定义贝塞尔函数的事件处理程序
        save.addEventListener('click', function(event) {
            //提示用户输入保存的名称
            modal.classList.remove("hidden");
        });

        btnCancel.addEventListener("click", function(event){
            if (modalBody.firstElementChild.className.indexOf("hint") > -1) {
                modalBody.removeChild(modalBody.firstElementChild);
            }
            modal.className += " hidden";
        });

        btnSuccess.addEventListener("click", function(event){
            var name = "";
            //在curveCanvas中创建待保存的元素
            var wrapper = document.createElement('div');
            var canvas = document.createElement('canvas');
            var text = document.createElement('span');
            var deleteIcon = document.createElement('span');
            var type;
            var selectedPoint;

            if (modalBody.firstElementChild.className.indexOf("hint") > -1) {
                modalBody.removeChild(modalBody.firstElementChild);
            }

            if (inputName.value.trim()) {
                name = inputName.value.trim();
                inputName.value = "";
                modal.className += " hidden";
                wrapper.className = "default-item";
                canvas.className = "pre-setting";
                canvas.width = 100;
                canvas.height = 100;
                //获得相应curveCanvas的控制点对象
                selectedPoint = previewCtrl.saveBezier(canvas);
                canvas.setAttribute("data-type", name);
                //将新添加的贝塞尔函数控制对象添加到存储对象storeSetting中
                storeSetting[name + "Point"] = selectedPoint;
                //设置新保存的贝塞尔函数名
                text.innerHTML = name;
                text.className = "bezier-name";
                //设置删除按钮
                deleteIcon.innerHTML = "&times;";
                deleteIcon.className = "delete";
                wrapper.appendChild(deleteIcon);
                wrapper.appendChild(canvas);
                wrapper.appendChild(text);
                curvesCanvas.appendChild(wrapper);
                //在curveCanvas上绘制新保存的贝塞尔函数
                previewCtrl.drawBezier(canvas, selectedPoint, false, '#000');
            } else {
                var hint = document.createElement("p");
                hint.className = "hint";
                hint.innerHTML = "* Please Input at least One Letter Before Submitting!!!";
                hint.style.textAlign = "center";
                hint.style.color = "#ff4081";
                hint.style.fontSize = ".8rem";
                modalBody.insertBefore(hint, modalBody.firstElementChild);
            }
        });

        window.addEventListener("resize", function(){
            previewCtrl.initCtrlPoint();
        })
    }

    /**
     * 初始化函数
     */
    function initPlugin() {
        initEventHandler();
        getInitParams();
        previewCtrl.init();
        previewCtrl.initCtrlPoint();
    }
    initPlugin();
    //引出previewCtrl对象
    window.previewCtrl = previewCtrl;
})(window);