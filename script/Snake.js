Snake = Class.create();
/*蛇的数据的类,只存蛇身和蛇头的坐标的数组*/
Snake.prototype = {
    initialize: function () {
        this.dir = 2;//方向向右
        this.snakeBody = new Array();//初始化蛇身数组
        this.iniSnake();
        
    },
    iniSnake:function()//在中间生成一个长度为3方向向右的蛇
    {
        this.snakeBody = new Array();
        this.snakeBody.push(new Point(30, 20));
        this.snakeBody.push(new Point(29, 20));
        this.snakeBody.push(new Point(28, 20));
        this.dir = 2
        
    },
    go: function() {//前进
        for (var i = this.snakeBody.length - 1; i > 0; i--)
        {
            this.snakeBody[i].x = this.snakeBody[i - 1].x;
            this.snakeBody[i].y = this.snakeBody[i - 1].y;
            this.snakeBody[i] = DIR.recurrent(this.snakeBody[i]);
        }
        this.snakeBody[0].x += DIR.Dirx[this.dir];
        this.snakeBody[0].y += DIR.Diry[this.dir];
        this.snakeBody[0] = DIR.recurrent(this.snakeBody[0]);
    },
    eat: function() {//吃
        var p = new Point();
        p.x = this.snakeBody[this.snakeBody.length - 1].x - DIR.Dirx[this.dir];
        p.y = this.snakeBody[this.snakeBody.length - 1].y - DIR.Diry[this.dir];
        this.snakeBody.push(p);
        this.go();
    },
    turn: function (dir) {//转弯
        this.dir = dir;
    },
    forward: function () {//范围蛇头前面的Point
        var p = new Point();
        p.x = this.snakeBody[0].x + DIR.Dirx[this.dir];
        p.y = this.snakeBody[0].y + DIR.Diry[this.dir];
        return p;
    },
    getTail: function () {//获得蛇尾，如果蛇尾在蛇身上，则返回null
        var tail = this.snakeBody[this.snakeBody.length - 1];
        for(var i=0;i<this.snakeBody.length-1;i++)
        {
            if(tail.x==this.snakeBody[i].x&&tail.y==this.snakeBody[i].y)
            {
                return null;
            }
        }
        var rtail = new Point();
        rtail.x = tail.x;
        rtail.y = tail.y;
        return rtail;
    }
}