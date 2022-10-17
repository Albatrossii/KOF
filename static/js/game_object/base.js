//将所有元素低于存储起来
let GAME_OBJECTS = [];

//定义一个所有元素的基类
class Game_object{
    constructor(    ) {
        //每次创建都将元素放入数组中
        GAME_OBJECTS.push(this);
        //存储当前帧与上一帧的时间间隔
        this.timedelta = 0 ;
        //当前角色是否是否执行过start函数
        this.has_call_start = false;
    }

    //初始执行一次
    start() {
        

    }
    //每一帧执行一次（除了第一帧以外）
    update() {

    }
    //删除当前对象
    destroy() {
        for(let  i in GAME_OBJECTS){
            if(GAME_OBJECTS[i] === this){
                //调用销毁函数则代表要将该对象从GAME_OBJECTS中去掉
                GAME_OBJECTS.splice(i,1);
                break;
            }
        }
    }
}
//需要记录上一帧的执行时间
let last_timestamp ;
//调用requestAnimationFrame函数 在此之间需要先写一个函数 
//使其每秒递归执行60次func 以实现动画的目的
let GAME_OBJECTS_FRAME = (timestamp) => {
    for(let obj of GAME_OBJECTS){
        if(!obj.has_call_start){
            obj.start();
            obj.has_call_start = true;
        }else{
            //更新时间间隔
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    last_timestamp = timestamp;
    //递归套娃
    requestAnimationFrame(GAME_OBJECTS_FRAME);
}

//别忘记调用执行该函数
requestAnimationFrame(GAME_OBJECTS_FRAME);

export{
    Game_object
}