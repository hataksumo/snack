PaintPanel = Class.create();
/*
负责画板绘制的类，把二维数组中的坐标转化为真实的坐标并绘制
*/
PaintPanel.prototype = {
    initialize: function () {
        this.playPanel = $("playPanel");//canvas
        this.context = this.playPanel.getContext("2d");//绘制用的context
        this.clrSnakeBody = "green";//蛇身
        this.clrWall = "black";//墙
        this.clrEmpty = "gray";//空
        this.clrFood = "yellow";//食物
        this.clrThroughBody = "blue";//穿身宝物
        this.clrThroughWall = "red";//穿墙宝物
        this.clrHead = "#663300";//蛇头
        this.clrHeadBorder = "#993300";//蛇头的边框
    },
    iniPaint: function () {
        var playPanel = $("playPanel");
        var i;
        if (playPanel.getContext) {
            var context = playPanel.getContext("2d");
            context.fillStyle = this.clrEmpty;
            context.fillRect(0, 0, DIR.MaxWidth * 11, DIR.MaxHeight * 11);//用底色填充

            context.strokeStyle = "black";
            context.lineWidth = "1px";
            context.beginPath();
            for (i = 1; i < 60; i++) {
                //context.fillRect(i * 11, 0, 1, 439);
                context.moveTo(i * 11, 0);
                context.lineTo(i * 11, 439);
            }
            for (i = 1; i < 40; i++) {
                context.moveTo(0, i * 11);
                context.lineTo(659, i * 11);
                //context.fillRect(0, i * 11, 659, 1);
            }
            context.stroke();
            //context.fillRect(x * 11, y * 11, 10, 10);
        }
    },
    paintSnakeBody: function (x, y) {//画蛇身
        this.context.strokeStyle = "black";
        this.context.fillStyle = this.clrSnakeBody;
        this.context.fillRect(x * 11 + 1, y * 11 + 1, 9, 9);   
    },
    paintHead: function (x, y, dir) {//画蛇头
        this.context.strokeStyle = "black";
        this.context.fillStyle = this.clrHead;
        this.context.fillRect(x * 11 + 1, y * 11 + 1, 9, 9);

    },
    paintWall:function(x,y)//画墙
    {
        this.context.strokeStyle = "black";
        this.context.fillStyle = this.clrWall;
        this.context.fillRect(x * 11 + 1, y * 11 + 1, 9, 9);
        //alert("paint wall");
    },
    paintEmpty:function(x,y)//画空
    {
        this.context.strokeStyle = "black";
        this.context.fillStyle = this.clrEmpty;
        this.context.fillRect(x * 11 +1 , y * 11+1 , 9, 9);
    },
    paintFood:function(x,y)//画食物
    {
        this.context.strokeStyle = "black";
        this.context.fillStyle = this.clrFood;
        this.context.fillRect(x * 11+1 , y * 11+1 , 9, 9);
    },
    paintThroughBody:function(x,y)//画穿身宝物
    {
        this.context.strokeStyle = "black";
        this.context.fillStyle = this.clrThroughBody;
        this.context.fillRect(x * 11+1 , y * 11+1 , 9, 9);
    },
    paintThroughWall:function(x,y)//画穿墙宝物
    {
        this.context.strokeStyle = "black";
        this.context.fillStyle = this.clrThroughWall;
        this.context.fillRect(x * 11+1 , y * 11+1 , 9, 9);

    }
}
