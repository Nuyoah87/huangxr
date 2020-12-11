function Game(tr, td, mineNum) {
    this.td = td;
    this.tr = tr;
    this.mineNum = mineNum; 
    this.surplusMine = 0; //剩余雷数
    this.mineInfo = []; //用于接收随机生成的雷的信息
    this.tdsArr = [] 
    this.isPlay = false; 
    this.openClass = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
    this.gameBox = document.getElementById("gameBox");
    this.table = document.createElement("table"); //生成table标签
    this.footerNum = document.getElementById("surplusMine"); //剩余炸弹数量显示框

}

Game.prototype.creatDom = function() { //创建游戏区域，在玩家第一次点击游戏区域的时候执行
    this.table.oncontextmenu = function() { return false }; //清除默认右键单机事件
    for (var i = 0; i < this.gameBox.children.length; i++) { //为防止重新开始游戏时，重复生成多个table，在添加之前先删除之前的
        var childNod = this.gameBox.children[i];
        this.gameBox.removeChild(childNod);
    }

    for (var i = 0; i < this.tr; i++) {
        var tr = document.createElement("tr");
        this.tdsArr[i] = []; //为每一行生成一个数组

        for (var j = 0; j < this.td; j++) {
            var td = document.createElement("td");
            tr.appendChild(td); //将生成的td插入到tr中
            this.tdsArr[i][j] = td;
            td.info = { //info属性包括了单元格的所有信息，很重要
                type: "number", //格子类型，用于判断是否时炸弹
                x: i, //行
                y: j, //列
                value: 0, //当该格子周围有炸弹时显示该数值，生成炸弹的时候会++
                isOpen: false, //判断该单元格是否被打开
                isFlag: false //判断是否有标记flag
            }
        }
        this.table.appendChild(tr); //见tr插入到table中
    }
    this.gameBox.appendChild(this.table);
}

Game.prototype.creatMine = function(event, target) { //生成炸弹，该方法会在用户第一次点击棋盘的时候执行一次

    var This = this;
    for (var i = 0; true; i++) { //随机生成炸弹，生成扎当数与设定扎当书mineNum相同时终止循环
        var randomX = Math.floor(Math.random() * this.tr), //随机生成炸弹的行数
            randomY = Math.floor(Math.random() * this.td); //随机生成炸弹的列数
        //   console.log(randomX + " " + randomY)
        if (target.info.x != randomX || target.info.y != randomY) { //保证第一次点击的时候不是炸弹
            if (this.tdsArr[randomX][randomY].info.type != "mine") { //保证每次生成的雷的位置不重复

                this.tdsArr[randomX][randomY].info.type = "mine"; //单元格更改属性为雷
                this.surplusMine++; //生成雷的数量+1
                this.mineInfo.push(this.tdsArr[randomX][randomY]); //将生成的雷的信息存放到this变量中，方便后续使用

            }
            if (this.surplusMine >= this.mineNum) { //当生成的炸弹数量等于设定的数量后跳出循环
                break;
            }
        }
    }

    //为每个炸弹周围的方格添加数字
    for (var i = 0; i < this.mineInfo.length; i++) {
        var around = this.getAround(this.mineInfo[i], This); //获取每个炸弹的周围方格
        //   console.log(this.getAround(this.mineInfo[i], This))

        for (var j = 0; j < around.length; j++) { //将周围每个方格的value++
            around[j].info.value += 1;
        }
    }


}

Game.prototype.getAround = function(thisCell, This) { //获取某个方格的周围非炸弹方格，需要传递一个单元格dom元素，Game的this
    var x = thisCell.info.x, //行
        y = thisCell.info.y, //列
        result = [];
    //   x-1,y-1       x-1,y       x-1,y+1
    //   x,y-1         x,y         x,y+1
    //   x+1,y-1       x+1y        x+1,y+1
    for (var j = x - 1; j <= x + 1; j++) {
        for (var k = y - 1; k <= y + 1; k++) {
            if ( //游戏区域的边界，行数x和列数y不能为负数，且不能超过设定的行数和列数
                j < 0 ||
                k < 0 ||
                j > (This.tr - 1) ||
                k > (This.td - 1) ||
                //同时跳过自身和周边是雷的方格
                This.tdsArr[j][k].info.type == "mine" ||
                (j == x && k == y)

            ) {
                continue; //满足上述条件是则跳过当此循环；
            } else {
                result.push(This.tdsArr[j][k]) //将符合的单元格push到result中返回
            }
        }
    }
    return result;
}

Game.prototype.lifeMouse = function(event, target) { //左键点击事件
    var This = this; //用变量的方式将Game的this传递到函数中
    var noOpen = 0; //没有被打开的格子数量
    if (!target.info.isFlag) { //表示该必须没有被右键标记才能鼠标左击
        if (target.info.type == "number") { //是数字时,则可视化

            function getAllZero(target, This) { //递归函数
                //   console.log(target.info)
                if (target.info.isFlag) { //当这个单元格之前有被标记过flag时，则将剩余炸弹数+1
                    This.surplusMine += 1;
                    target.info.isFlag = false; //单元格被打开后初始化flag
                }
                if (target.info.value == 0) { //等于格子的value等于0的时候

                    target.className = This.openClass[target.info.value]; //可视化

                    target.info.isOpen = true; //表示该单元格被打开

                    var thisAround = This.getAround(target, This); //获取该单元格周围的格子信息

                    for (var i = 0; i < thisAround.length; i++) {
                        //   console.log(thisAround[i].info.isOpen)
                        if (!thisAround[i].info.isOpen) { //递归的条件，当格子的open为true时不执行

                            getAllZero(thisAround[i], This) //执行递归
                        }

                    }

                } else {
                    target.innerHTML = target.info.value;
                    target.className = This.openClass[target.info.value]; //可视化
                    target.info.isOpen = true; //表示单元格被打开
                    target.info.isFlag = false; //单元格被打开后初始化flag

                }
            }

            getAllZero(target, This); 
            for (var i = 0; i < this.tr; i++) {
                for (var j = 0; j < this.tr; j++) {
                    if (this.tdsArr[i][j].info.isOpen == false) {
                        noOpen++;
                    }
                }

            }
            
            if (noOpen == this.mineNum) {
                console.log(noOpen)
                this.gameWin();
            }

        } else { 
            this.gameOver(target)
        }
    }
}

Game.prototype.rightMouse = function(target) { 
    if (!target.info.isOpen) {
        if (!target.info.isFlag) { 
            target.className = "targetFlag"; 
            target.info.isFlag = true; 
            this.surplusMine -= 1; 
            
        } else { 
            target.className = ""; 
            target.info.isFlag = false;
            this.surplusMine += 1;
           

        }

        var isWin = true;
        if (this.surplusMine == 0) { 
            for (var i = 0; i < this.mineInfo.length; i++) {
                console.log(this.mineInfo[i].info.isFlag)
                if (!this.mineInfo[i].info.isFlag) { 
                    isWin = false;
                    this.gameOver(target, 1);
                    break;
                }
            }
            isWin ? this.gameWin(1) : 0; 
        }


        //   if (this.surplusMine == 0) { //标记完所有flag时，遍历所有单元格
        //       for (var i; i < this.tr; i++) {
        //           for (var j; j < this.td; j++) {
        //             if()
        //           }

        //       }
        //   }
    }
}

Game.prototype.gameOver = function(target, code) { 
    //   console.log(this.mineInfo)
    var mineInfoLen = this.mineInfo.length;
    for (var i = 0; i < mineInfoLen; i++) { 
        this.mineInfo[i].className = "mine";
    }
    this.table.onmousedown = false; 

    if (code) {
        alert("旗帜用完了，没有排除所有雷，游戏结束")
    } else {
        target.className = "targetMine"; 
        alert("很遗憾，你被炸弹炸死了，游戏结束")
    }

}

Game.prototype.gameWin = function(code) { 
    if (code) {
        alert("你成功标记所有地雷，游戏通过")
    } else {
        alert("你找到了所有安全区域，游戏通过")
    }
    this.table.onmousedown = false;


}

Game.prototype.play = function() {
    var This = this; 
    this.table.onmousedown = function(event) {
        event = event || window.event; 
        target = event.target || event.srcElement 

        if (!this.isPlay) {
            this.isPlay = true;
            This.creatMine(event, target);
        }

        if (event.button == 0) { 
            This.lifeMouse(event, target);

        } else if (event.button == 2) { 
            This.rightMouse(target)
        }
        This.footerNum.innerHTML = This.surplusMine; 
    }
}

Game.prototype.tablePos = function() { 
    var width = this.table.offsetWidth,
        height = this.table.offsetHeight;
    //   console.log(this.table.offsetWidth)
    this.table.style.width = width + "px  ";
    this.table.style.height = height + "px  "


}


function addEvent(elem, type, handle) { 
    if (elem.addEventListener) { 
        elem.addEventListener(type, handle, false);
    } else if (elem.attachEvent) { 
        elem.attachEvent("on" + type, function() {
            handle.call(elem);
        })
    } else { 
        elem["on" + type] = handle;
    }
}

Game.prototype.setDegree = function() { 
    var button = document.getElementsByTagName("button");

    addEvent(button[0], "click", function() { 
        var game = new Game(15, 15, 15);
        game.creatDom();
        game.play();
        game.tablePos();
    });

    addEvent(button[1], "click", function() { //一般
        var game = new Game(20, 20, 50);
        game.creatDom();
        game.play();
        game.tablePos();
    });

    addEvent(button[2], "click", function() { //困难
        var game = new Game(30, 30, 125);
        game.creatDom();
        game.play();
        game.tablePos();
    });


}

var game = new Game(15, 15, 15);
game.creatDom();
game.play();
game.tablePos();
game.setDegree()
