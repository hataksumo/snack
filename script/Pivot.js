var Pivot = Class.create();
/*
这个类负责处理游戏内部逻辑，并指挥Snake类和PaintPanel类协同工作

在这里说下游戏规则：
有80%的几率随机出食物,10%的几率随机出穿身宝物,%10的几率随机出穿墙宝物
黄色是食物，红色是穿墙宝物，蓝色是穿身宝物，黑色是墙
但生成食物和宝物时，系统会根据蛇头和保护间的曼哈顿距离（x坐标的绝对值+y坐标的绝对值)*10生成一个曼哈顿值
每走一步，曼哈顿值将减1，当办哈顿值为0时，那个食物或宝物将变成墙(墙可以通过穿墙宝物销掉),并重新生成食物
当游戏到达1000分，3000分，7000分时，会自动提升难度
初级800ms,中级400ms,高级200ms,超级100ms.(当用户看见所有难度选项全没被选择时，哈哈，就进入了超级状态，感受疯狂吧 )
*/
Pivot.prototype = {
    initialize: function () {
        this.score = 0;//得分
        this.throughBody = 0;//穿身宝物
        this.throughWall = 0;//穿墙宝物
        this.difLevel = 0;//难度

        this.panelGrids = new Array(60);//游戏面板的二维数组
        /*0是空，1是蛇身，2是蛇头，3是食物，4是穿身，5是穿墙，-1是墙*/
        this.EMPTY = 0;
        this.SNAKEBODY = 1;
        this.SNAKEHEAD = 2;
        this.FOOD = 3;
        this.THROUGHBODY = 4;
        this.THROUGHWALL = 5;
        this.WALL = -1;
        this.SCORES = [100, 200, 400, 700];//不同难度下，吃一个食物所加的分数
        this.SCORELEVELS = [1000, 3000, 7000];//提升难度所需要的分段
        /*初始化panelGrids*/
        for (var i = 0; i < 60; i++) {
            this.panelGrids[i] = new Array(40);
            for (var j = 0; j < 40; j++)
                this.panelGrids[i][j] = this.EMPTY;
        }
        this.snake = new Snake();//蛇的类
        this.paintPanel = new PaintPanel();//绘制面板的类

        /************下面的一些全是为了随机食物和宝物的变量*****************/
        this.MAXRANG = DIR.MaxWidth * DIR.MaxHeight;//为随机食物坐标用的变量
        this.manhattan = 0;//曼哈顿 当它减到0时，食物或宝物将变成墙
        this.ManhattanFactor = 10;//曼哈顿因子 
        this.probabilities = [80, 9, 11];//食物，穿墙，穿身
        this._foodIndex = 0;//指的是probabilities[0]是食物
        this._throughWall = 1;//指的是probabilities[1]是穿墙宝物
        this._throughBody = 2;//指的是probabilities[2]是穿身宝物
        this.gx = 0;//产生食物或宝物的x坐标
        this.gy = 0;//产生食物或宝物的y坐标
        /******************************************************************/

        this.paintPanel.iniPaint();//调用paintPanel还原面板
    },
    iniGame: function (dif) {//初始化游戏
        var i, j;
        this.score = 0;
        this.throughBody = 0;
        this.throughWall = 0;
        this.difLevel = dif;
        //让所有格子全为空
        for (i = 0; i < DIR.MaxWidth; i++) {
            for (j = 0; j < DIR.MaxHeight; j++)
                this.panelGrids[i][j] = this.EMPTY;
        }
        this.paintPanel.iniPaint();//绘制面板的初始状态
        this.snake.iniSnake();//初始化蛇
        //绘制初始蛇的状态
        for (i = 1; i < this.snake.snakeBody.length; i++)
        {
            this.paintPanel.paintSnakeBody(this.snake.snakeBody[i].x, this.snake.snakeBody[i].y);
            this.panelGrids[this.snake.snakeBody[i].x][this.snake.snakeBody[i].y] = this.SNAKEBODY;
        }
        this.paintPanel.paintHead(this.snake.snakeBody[0].x, this.snake.snakeBody[0].y);
        this.panelGrids[this.snake.snakeBody[0].x][this.snake.snakeBody[0].y] = this.SNAKEHEAD;
        this.reGenerate();//随机生成食物或宝物
    },
    resetGame: function()//重新开始游戏
    {
        for (i = 0; i < DIR.MaxWidth; i++) 
            for (j = 0; j < DIR.MaxHeight; j++)
                this.panelGrids[i][j] = this.EMPTY;
        this.paintPanel.iniPaint();
        this.score = 0;
        this.throughBody = 0;
        this.throughWall = 0;
        this.difLeval = 0;
    },
    go:function(dir)//移动一下蛇
    {
        if(dir!=-1)//dir=-1时，表示是系统的interval发出的消息
        {
            if (Math.abs(dir - this.snake.dir) == 2)
                return "illegal";
            this.snake.dir = dir;
        }
        var foward = this.snake.forward();//蛇头前面一个格子的坐标
        this.manhattan--;//曼哈顿--
        if (this.manhattan == 0) {//当曼哈顿=0时，食物变墙
            this.panelGrids[this.gx][this.gy] = this.WALL;
            this.paintPanel.paintWall(this.gx, this.gy);
            this.reGenerate();
        }
        if(foward.x>=DIR.MaxWidth||foward.x<0||foward.y>=DIR.MaxHeight||foward.y<0)//当越界时
        {
            if (this.throughWall <= 0)//如果没穿墙宝物
            {
                return "gameOver";//游戏结束
            }
            else
            {
                this.throughWall--;//使用穿墙宝物
                return this.advance(foward);//前进
            }
        }
        else
        {
            return this.advance(foward);//前进
        }
    },
    advance: function (foward)//前进的方法
    {
        var peek = DIR.recurrent(foward);//前一个格子的坐标，考虑穿墙后的状态
        var lastTail = this.snake.getTail();//蛇尾
        switch (this.panelGrids[peek.x][peek.y]) {//peek这个格子的状态
            case this.EMPTY://空
                this.goPaint(lastTail);//擦出蛇尾，绘制蛇头,感觉这个方法应该写在snake里,囧~~~
                break;
            case this.SNAKEBODY:
            case this.SNAKEHEAD://碰到蛇身了
                if (this.throughBody <= 0) {//如果没有穿身宝物
                    return "gameOver";//游戏结束
                }
                else {
                    this.throughBody--;//使用穿身宝物
                    this.goPaint(lastTail);
                }
                break;
            case this.FOOD://食物
                this.score += this.SCORES[this.difLevel];//加分
                this.eatPaint();//绘制
                this.reGenerate();//再产生食物
                break;
            case this.THROUGHBODY://穿身宝物
                this.throughBody++;
                this.goPaint(lastTail);//前进绘制
                this.reGenerate();
                break;
            case this.THROUGHWALL://穿墙宝物
                this.throughWall++;
                this.goPaint(lastTail);
                this.reGenerate();
                break;
            case this.WALL://如果前面是墙
                if (this.throughWall <= 0) {
                    return "gameOver";
                }
                else {
                    this.throughWall--;
                    this.goPaint(lastTail);
                }
                break;
        }
        if(this.testScore())
        {
            return "raiseLevel";
        }
        else
        {
            return "norm";
        }
    },
    goPaint:function(lastTail)//前进绘制
    {
        this.panelGrids[this.snake.snakeBody[0].x][this.snake.snakeBody[0].y] = this.SNAKEBODY;//蛇头边蛇身
        this.snake.go();//蛇的数据层前进
        this.panelGrids[this.snake.snakeBody[0].x][this.snake.snakeBody[0].y] = this.SNAKEHEAD;//设置新的蛇头
        this.paintPanel.paintHead(this.snake.snakeBody[0].x, this.snake.snakeBody[0].y, this.snake.dir);//绘制蛇头
        this.paintPanel.paintSnakeBody(this.snake.snakeBody[1].x, this.snake.snakeBody[1].y);//蛇身覆盖掉原来的蛇头
        if (lastTail != null)//考虑到蛇尾处于蛇身中的情况
        {
            this.paintPanel.paintEmpty(lastTail.x, lastTail.y);//擦出蛇尾
            this.panelGrids[lastTail.x][lastTail.y] = this.EMPTY;//数据层擦出蛇尾
        }
    },
    eatPaint:function()//吃的绘制
    {
        this.panelGrids[this.snake.snakeBody[0].x][this.snake.snakeBody[0].y] = this.SNAKEBODY;//蛇头变蛇身
        this.snake.eat();//蛇的数据层吃
        this.panelGrids[this.snake.snakeBody[0].x][this.snake.snakeBody[0].y] = this.SNAKEHEAD;//数据层设置新的蛇头
        this.paintPanel.paintHead(this.snake.snakeBody[0].x, this.snake.snakeBody[0].y, this.snake.dir);//画蛇头
        this.paintPanel.paintSnakeBody(this.snake.snakeBody[1].x, this.snake.snakeBody[1].y);//画蛇身
    },
    reGenerate:function()//随机生成食物或宝物
    {
        var rand;
        var gx, gy;
        do {//当生成的坐标，在panelGrids中不为空，就再生成一遍
            rand = GetRandomNum(0, this.MAXRANG - 1)
            gx= rand % DIR.MaxWidth;

            gy = (rand - gx) / DIR.MaxWidth;
        }while(this.panelGrids[gx][gy]!=this.EMPTY);
        var grand = Math.random() * 100;//一个随机数，表示到底生成食物，还是穿身宝物，还是穿墙宝物

        /*下面的代码有很大的重复性，我偷懒复制粘贴的，不想细细思考了*/
        grand -= this.probabilities[this._foodIndex];//减去食物的概率因子
        if(grand<0)//如果小于0了，表示生成的数在0~80内，下同
        {
            this.panelGrids[gx][gy] = this.FOOD;//设置食物
            this.paintPanel.paintFood(gx, gy);//绘制食物
            this.setManhattan(gx, gy);//设置曼哈顿
            return;
        }
        grand -= this.probabilities[this._throughWall];
        if(grand<0)
        {
            this.panelGrids[gx][gy] = this.THROUGHWALL;
            this.paintPanel.paintThroughWall(gx, gy);
            this.setManhattan(gx, gy);
            return;
        }
        grand -= this.probabilities[this._throughBody];
        if(grand<0)
        {
            this.panelGrids[gx][gy] = this.THROUGHBODY;
            this.paintPanel.paintThroughBody(gx, gy);
            this.setManhattan(gx, gy);
            return;
        }
        
        
    },
    setManhattan: function (gx, gy) {//设置曼哈顿
        //曼哈顿=生成食物或宝物的x,y坐标分别与当前蛇头x,y坐标差的绝对值的和
        this.manhattan = Math.abs(this.snake.snakeBody[0].x - gx) + Math.abs(this.snake.snakeBody[0].y - gy) * this.ManhattanFactor;
        this.gx = gx;
        this.gy = gy;
        //alert("manhattan=" + this.manhattan);
    },
    testScore:function()//看看当前分数是不是要提升难度
    {
        if (this.difLevel ==0 && this.score >= this.SCORELEVELS[0])
        {
            this.difLevel++;
            return true;
        }
        if(this.difLevel ==1 && this.score >= this.SCORELEVELS[1])
        {
            this.difLevel++;
            return true;
        }
        if(this.difLevel == 2 && this.score >= this.SCORELEVELS[2])
        {
            this.difLevel++;
            return true;
        }
        return false;
    }
};