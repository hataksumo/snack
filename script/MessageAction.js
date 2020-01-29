MessageAction = Class.create();
/*
MessageAction:
负责接收翻译派发来自用户的消息，如按下键盘操作键，点击开始、暂停、帮助、积分榜 按钮。
以及系统的一个事件，goInterval。
该类只能直接操作游戏外部控件的，并不能对playPanel直接操作
*/


MessageAction.prototype = {

    initialize: function () {
        this.gameState = "prepare"; //{"pause","on","over","prepare"};
        this.btnStartOrCease = $("btnStartOrCease");//开始或停止按键
        this.btnPauseOrGoOn = $("btnPauseOrGoOn");//暂停或继续按键
        this.btnRank = $("btnRank");//排行榜按键，回来做个JSP版的
        this.btnHelp = $("btnHelp");//帮助按键，暂未实现功能
        this.playPanel = $("playPanel");//游戏的画板
        this.rdEasy = $("rdEasy");//简单的radioButton
        this.rdNorm = $("rdNorm");//中等的radioButton
        this.rdHard = $("rdHard");//困难的radioButton
        this.rdDifficults = [this.rdEasy, this.rdNorm, this.rdHard];//radioButton的数组，便于操作
        this.lblScore = $("lblScore");//得分的Span
        this.lblThroughWall = $("lblThroughWall");//穿墙宝物的Span
        this.lblThroughBody = $("lblThroughBody");//穿身宝物的Span
        this._kDown = BindAsEventListener(this, this.KeyMessage);//keyDown事件
        this.pivot = new Pivot();//游戏内核类
        this.intervals = [800, 400, 200, 100 ];//时间间隔
        this.intervalID;//interval的线程ID
        addEventHandler(this.btnStartOrCease, "click", BindAsEventListener(this, this.StartOrCease));//为开始和停止添加mouseClick事件
        addEventHandler(this.btnPauseOrGoOn, "click", BindAsEventListener(this, this.PauseOrGoOn));//为暂停和继续添加mouseClick事件
        this.iniGame();//初始化游戏界面
    },
    iniGame:function(){
        this.gameState = "prepare";//游戏处于准备开始状态
        this.btnStartOrCease.value = "开始";
        this.btnStartOrCease.disabled = false;
        this.btnPauseOrGoOn.value = "暂停";
        this.btnPauseOrGoOn.disabled = true;
        this.btnRank.disabled = false;
        this.btnHelp.disabled = false;
        this.lblScore.innerText = "0";
        this.lblThroughWall.innerText = "0";
        this.lblThroughBody.innerText = "0";
        for(var i=0;i<this.rdDifficults.length;i++)
        {
            this.rdDifficults[i].disabled = false;
        }
        this.rdEasy.checked = true;
        this.gameState = "prepare";
        this.pivot.resetGame();//让游戏内部数据初始化

    },
    startGameDisable: function () {//开始游戏时一些控件的disabled的处理
        this.btnRank.disabled = true;
        this.btnHelp.disabled = true;
        for (var i = 0; i < this.rdDifficults.length; i++) {
            this.rdDifficults[i].disabled = true;
        }
    },
    pauseGameDisable: function () {//暂停游戏时一些控件的disabled的处理
        this.btnRank.disabled = false;
        this.btnHelp.disabled = false;
        for (var i = 0; i < this.rdDifficults.length; i++) {
            this.rdDifficults[i].disabled = true;
        }
    },
    StartOrCease: function () {//开始或停止按钮的方法
        if (this.gameState == "prepare")//如果游戏处于准备状态
        {
            var difficult = this.getIniDifficult();
            this.pivot.iniGame(difficult);//初始化游戏，生成蛇身并绘制
            this.GoOnEventPro();//启动相关的监听器
            this.btnPauseOrGoOn.disabled = false;
            this.startGameDisable();
            this.gameState = "on";
            this.btnStartOrCease.value = "停止";
        }
        else if(this.gameState == "on")
        {
            this.GameOver();//游戏结束
            this.gameState = "prepare";
        }
        
        
    },
    PauseOrGoOn: function () {//暂停或继续
        if(this.gameState == "on")//当游戏正在进行
        {
            this.gameState = "pause";
            this.btnPauseOrGoOn.value = "继续";
            this.pauseGameDisable();
            this.PauseEventPro();
        }
        else if(this.gameState == "pause")//当游戏处于暂停
        {
            this.gameState = "on";
            this.btnPauseOrGoOn.value = "暂停";
            this.startGameDisable();
            this.GoOnEventPro();
        }
    },
    Help: function () {
        alert("还未实现，期待下个版本");
    },
    GoInterVal: function () {//过一个时钟周期，让蛇自动移动
        /*这里的this指的是window
           调用pivot的go方法,并把它返回的结果消息交给callBackMessage函数处理*/
        this.msgAction.callBackMessage(this.msgAction.pivot.go(-1));
    },
    KeyMessage:function(){//游戏按键的消息处理函数
        switch(window.event.keyCode)
        {
            case 37:
            case 65:
                this.GoLeft();
                break;
            case 38:
            case 87:
                this.GoUp();
                break;
            case 39:
            case 68:
                this.GoRight();
                break;
            case 40:
            case 83:
                this.GoDown();
                break;
        }
    },
    GoLeft: function () {//向左
        this.callBackMessage(this.pivot.go(0));
    },
    GoUp: function () {//向上
        this.callBackMessage(this.pivot.go(1));
    },
    GoRight: function () {//向右
        this.callBackMessage(this.pivot.go(2));
    },
    GoDown: function (){//向下
        this.callBackMessage(this.pivot.go(3));
    },
    GameOver: function () {//游戏结束
        this.iniGame();
        this.PauseEventPro();
        this.pivot.resetGame();
        alert("gameOver");
    },
    PauseEventPro: function () {//暂停或停止游戏
        removeEventHandler(document, "keydown", this._kDown);//移除键盘事件监听器
        window.clearInterval(this.intervalID);//移除interval线程
        this.intervalID = null;
    },
    GoOnEventPro: function () {//继续或开始游戏
        addEventHandler(document, "keydown", this._kDown);//添加键盘事件监听器
        this.intervalID = window.setInterval(this.GoInterVal, this.intervals[this.pivot.difLevel]);//添加interval线程
    },
    RaiseDifficult: function () {//提升难度是，外部界面的处理
        for (var i = 0; i < this.rdDifficults.length; i++) {//让所有的raidoButton不被选择
            this.rdDifficults[i].checked = false;
        }
        if (this.pivot.difLevel < this.rdDifficults.length) {//如果没有进入超级模式，则让相应的radioButton被选择
            this.rdDifficults[this.pivot.difLevel].checked = true;
        }
        if(this.intervals.length>this.pivot.difLevel)//这一句只是以防万一
        {
            window.clearInterval(this.intervalID);
            this.intervalID = window.setInterval(this.GoInterVal, this.intervals[this.pivot.difLevel]);
        }
    },
    getIniDifficult: function () {//获得用户选择的难度
        if(this.rdEasy.checked){
            return 0;
        }
        else if(this.rdNorm.checked){
            return 1;
        }
        else if(this.rdHard.checked){
            return 2;
        }
        else{
            return 0;
        }
    },
    callBackMessage: function (msg) {//处理由pibot传回的消息
        if (msg == "illegal")
        {
            return;
        }
        else if(msg == "gameOver")
        {
            this.GameOver();
            return;
        }
        else if(msg == "raiseLevel")
        {
            this.RaiseDifficult();
        }
        this.lblScore.innerText = this.pivot.score.toString();
        this.lblThroughBody.innerText = this.pivot.throughBody.toString();
        this.lblThroughWall.innerText = this.pivot.throughWall.toString();    
    }
    
};