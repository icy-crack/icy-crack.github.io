(function(window, undefined) {
    var curvesCanvas = document.querySelector(".bezier-control .default-bezier");
    var canvasList = curvesCanvas.getElementsByTagName("canvas");
    var canvasArr = Array.prototype.slice.call(canvasList, 0);
    var compareCanvas = document.querySelector('.drag .compare-canvas');
    var codeExport = document.querySelector('.code-area');

    /**
     * size/padding:
     *      根据用户自定义的值设置curveCanvas的参数
     * compSize/compPadding:
     *      根据用户自定义的值设置compareCanvas的参数
     */
    var size = curvesCanvas.getAttribute("data-size") - 0 || 80, padding = curvesCanvas.getAttribute("data-padding") - 0 || 10;
    var compSize = compareCanvas.getAttribute("data-size") - 0 || 50, compPadding = (compareCanvas.width - compSize) / 2 || 5;

    /**
     * storeSetting：
     *      预设值：easePoint -- ease
     *             linearPoint -- linear
     *             ....
     *      comparePoint：和当前被select的预设值同步，类似ctrlPointPreview
     * @type {{easePoint: {cp1: {pointX: number, pointY: number}, cp2: {pointX: number, pointY: number}, cp3: {pointX: number, pointY: number}, cp4: {pointX: number, pointY: number}, size: number, padding: number, transition: string}, linearPoint: {cp1: {pointX: number, pointY: number}, cp2: {pointX: number, pointY: number}, cp3: {pointX: number, pointY: number}, cp4: {pointX: number, pointY: number}, size: number, padding: number, transition: string}, easeInPoint: {cp1: {pointX: number, pointY: number}, cp2: {pointX: number, pointY: number}, cp3: {pointX: number, pointY: number}, cp4: {pointX: number, pointY: number}, size: number, padding: number, transition: string}, easeOutPoint: {cp1: {pointX: number, pointY: number}, cp2: {pointX: number, pointY: number}, cp3: {pointX: number, pointY: number}, cp4: {pointX: number, pointY: number}, size: number, padding: number, transition: string}, easeInOutPoint: {cp1: {pointX: number, pointY: number}, cp2: {pointX: number, pointY: number}, cp3: {pointX: number, pointY: number}, cp4: {pointX: number, pointY: number}, size: number, padding: number, transition: string}, comparePoint: {cp1: {pointX: number, pointY: number}, cp2: {}, cp3: {}, cp4: {pointX: number, pointY: number}, size: number, padding: number}}}
     */
    var storeSetting = {
        easePoint: {
            cp1: {pointX: padding, pointY: size + padding},
            cp2: {pointX: size * 0.25 + padding, pointY: size * 0.9 + padding},
            cp3: {pointX: size * 0.25 + padding, pointY: padding},
            cp4: {pointX: size + padding, pointY: padding},
            size: size,
            padding: padding,
            transition: "cubic-bezier(0.25, 0.1, 0.25, 1.0)"
        },
        linearPoint: {
            cp1: {pointX: padding, pointY: size + padding},
            cp2: {pointX: padding, pointY: size + padding},
            cp3: {pointX: size + padding, pointY: padding},
            cp4: {pointX: size + padding, pointY: padding},
            size: size,
            padding: padding,
            transition: "cubic-bezier(0, 0, 1.0, 1.0)"
        },
        easeInPoint: {
            cp1: {pointX: padding, pointY: size + padding},
            cp2: {pointX: size * 0.42 + padding, pointY: size + padding},
            cp3: {pointX: size + padding, pointY: padding},
            cp4: {pointX: size + padding, pointY: padding},
            size: size,
            padding: padding,
            transition: "cubic-bezier(0.42, 0, 1.0, 1.0)"
        },
        easeOutPoint: {
            cp1: {pointX: padding, pointY: size + padding},
            cp2: {pointX: padding, pointY: size + padding},
            cp3: {pointX: size * 0.58 + padding, pointY: padding},
            cp4: {pointX: size + padding, pointY: padding},
            size: size,
            padding: padding,
            transition: "cubic-bezier(0, 0, 0.58, 1.0)"
        },
        easeInOutPoint: {
            cp1: {pointX: padding, pointY: size + padding},
            cp2: {pointX: size * 0.42 + padding, pointY: size + padding},
            cp3: {pointX: size * 0.58 + padding, pointY: padding},
            cp4: {pointX: size + padding, pointY: padding},
            size: size,
            padding: padding,
            transition: "cubic-bezier(0.42, 0, 0.58, 1.0)"
        },
        comparePoint: {
            cp1: {pointX: compPadding, pointY: compSize + compPadding},
            cp2: {},
            cp3: {},
            cp4: {pointX: compSize + compPadding, pointY: compPadding},
            size: compSize,
            padding: compPadding
        }
    };

    /**
     * renderSettings：
     *      初始化函数，用于最初绘制预设值
     * @param canvasArr
     */
    function renderSettings(canvasArr) {
        canvasArr.forEach(function (item) {
            //获取自定义属性data-type
            var type = item.getAttribute('data-type');
            //获取预设贝塞尔函数的控制信息
            var selectedPoint = storeSetting[type + 'Point'];
            //如果当前canvas是选中的，则执行handleSelected，否则简单的绘制贝塞尔函数
            if (item.className.indexOf("selected") > -1) {
                handleSelected(selectedPoint, item);
            } else {
                previewCtrl.drawBezier(item, selectedPoint, false, "#000");
            }
            //显示贝塞尔函数的名称
            item.nextElementSibling.innerHTML = type;
        });
    }

    /**
     * handleSelected：
     *      绘制被选中的贝塞尔函数预设值
     * @param selectedPoint
     *      贝塞尔函数控制点对象
     * @param target
     *      相应的画布对象
     */
    function handleSelected(selectedPoint, target){
        //判断当前画布对象是否已经设置了selected，如果没有则设置
        if (target.className.indexOf("selected") == -1) {
            target.classList.add("selected");
        }
        //绘制curveCanvas中的贝塞尔函数
        previewCtrl.drawBezier(target, selectedPoint, false, "#fff");
        //同步comparePoint中的控制点
        previewCtrl.getPreviewPoint(selectedPoint.cp2, 2, selectedPoint, storeSetting.comparePoint);
        previewCtrl.getPreviewPoint(selectedPoint.cp3, 3, selectedPoint, storeSetting.comparePoint);
        //同步compareCanvas中的贝塞尔函数
        previewCtrl.drawBezier(compareCanvas, storeSetting.comparePoint, "#00bfa5", "#fff");
        //将选中的贝塞尔函数应用到compareCanvas上
        compareCanvas.style.transitionTimingFunction = selectedPoint.transition;
        //设置transition代码
        codeExport.innerHTML = "{\n  -webkit-transition: all " + previewCtrl.durationTime() + "s " + selectedPoint.transition +";"
            + "\n  -moz-transform: all " + previewCtrl.durationTime() + "s " + selectedPoint.transition +";"
            + "\n  -ms-transform: all " + previewCtrl.durationTime() + "s " + selectedPoint.transition +";"
            + "\n  -o-transform: all " + previewCtrl.durationTime() + "s " + selectedPoint.transition +";"
            + "\n  transform: all " + previewCtrl.durationTime() + "s " + selectedPoint.transition +";\n}";
    }

    /**
     * eventHandler：
     *      为canvas添加selected事件。
     *      为canvas添加删除事件处理程序
     * @param event
     */
    function eventHandler(event) {
        var target = event.target;
        var type, selectedPoint;
        var item;
        //处理如果点击的是canvas，则设置当前的canvas为selected
        if (target.nodeName.toLowerCase() == "canvas") {
            for (var i = 0; i < canvasList.length; i++) {
                item = canvasList[i];
                type = item.getAttribute('data-type');
                selectedPoint = storeSetting[type + 'Point'];
                if (item.className.indexOf("selected") > -1) {
                    //删除原先被选中的canvas的selected类
                    item.classList.remove("selected");
                    //重绘canvas
                    previewCtrl.drawBezier(item, selectedPoint, false, "#000");
                } else if (target.getAttribute('data-type') == type) {
                    //重绘当前选中的canvas和compareCanvas
                    handleSelected(selectedPoint, target);
                }
            }
            //如果当前点击的是delete按钮，则删除当前的setting
        } else if (target.className.indexOf("delete") > -1) {
            var deleteItem = target.parentNode;
            //第一步判断待删除的canvas是否被选中
            var selected = target.nextElementSibling.className.indexOf("selected");
            var type = target.nextElementSibling.getAttribute("data-type");
            //第二步删除待删除的元素
            curvesCanvas.removeChild(deleteItem);
            //第三步如果当前删除的canvas是选中的，则重新设置第一个setting为选中
            if (selected > -1) {
                var newType = canvasList[0].getAttribute("data-type");
                handleSelected(storeSetting[newType + "Point"], canvasList[0]);
            }
            //从storeSetting中删除相应的setting
            delete storeSetting[type + "Point"];
        }
    }

    /**
     * 初始化函数
     */
    function initSettings(){
        renderSettings(canvasArr);
        curvesCanvas.addEventListener("click", eventHandler, false);
    }

    initSettings();

    //引出storeSetting对象
    window.storeSetting = storeSetting;
})(window, undefined);