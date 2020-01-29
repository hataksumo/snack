Point = Class.create();//Point类

Point.prototype = {
    initialize: function (x, y) {
        this.x = x;
        this.y = y;
    }
}

var DIR = {//静态类，存有一些公用的字段和方法
        MaxWidth : 60,//棋盘的最大宽度
        MaxHeight : 40,//棋盘的最大高度
        Dirx : [-1, 0, 1, 0],//x方向
        Diry : [0, -1, 0, 1],//y方向
        Left : 0,//向左
        Up : 1,//向上
        Right : 2,//向右
        Down: 3,//向下
        recurrent: function (p) {//返回穿墙后的坐标 
            var np = new Point();
        if(p instanceof Point)
        {
            np.x = p.x;
            np.y = p.y;
            if (np.x == this.MaxWidth)
                np.x = 0;
            if (np.x == -1)
                np.x = this.MaxWidth - 1;
            if (np.y == this.MaxHeight)
                np.y = 0;
            if (np.y == -1)
                np.y = this.MaxHeight - 1;
        }
        return np;
    }
}
function GetRandomNum(Min, Max) {//获得一个随机数
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}
