import { Game_object } from "../game_object/base.js";

export class Player extends Game_object{
    //需要掌握场面上的消息
    constructor(root,info){
        super();

        this.root = root;
        this.id = info.id;
        this.x = info.x;
        this.y = info.y;
        this.width = info.width;
        this.height = info.height;
        this.color= info.color;
        this.attack = info.attack;

        this.direction = 1 ;
        //先用两个矩形代表两个角色
        //先定义速度
        this.vx = 0;
        this.vy = 0;

        //水平速度
        this.speedx = 400; 
        //跳跃速度 由于是向上跳 所以速度应该是-的
        this.speedy = -1000;
        //下落速度
        this.gravity = 50;

        this.ctx = this.root.game_map.ctx;
        this.pressed_keys = this.root.game_map.Controller.pressed_keys;
        //0：idle, 1:向前, 2:向后 , 3:跳跃 , 4：攻击 , 5： 被打, 6：死亡
        this.status = 3;
        this.animations = new Map();
        //计数器 表示当前记录了多少帧
        this.frame_current_cnt = 0;

        this.hp = 100;
        //血条
        this.$hp = this.root.$kof.find(`.kof-head-hp-${this.id}>div>div`);
        //实现血条减少时候的拖影效果
        this.$hp_div = this.root.$kof.find(`.kof-head-hp-${this.id}>div`);
    }
    
    start(){

    }

    update_move(){
        //只有在空中才会增加重力
        // if(this.status === 3){
        this.vy += this.gravity;
        
       
        //单位是ms 所以说需要除上1000
        this.x += this.vx * this.timedelta / 1000;
        this.y += this.vy * this.timedelta / 1000;

        let [a, b] = this.root.players;

        if(a != this) [a,b] = [b,a]; 

        let r1 ={
            x1: a.x,
            y1: a.y,
            x2: a.x + a.width,
            y2: a.y + a.height,
        }
        let r2 ={
            x1: b.x,
            y1: b.y,
            x2: b.x + b.width,
            y2: b.y + b.height,
        }
        //发生碰撞 取消操作
        if(this.is_collision( r1 , r2 )){
            a.x -= this.vx * this.timedelta / 1000 / 2;
            a.y -= this.vy * this.timedelta / 1000 / 2;
            b.x += this.vx * this.timedelta / 1000 / 2;
            b.y += this.vy * this.timedelta / 1000 / 2;
        }

        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            //表示人物跳到地面上
            if (this.status === 3) this.status = 0;
        }

        //防止出界
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x + this.width > this.root.game_map.$canvas.width()) {
            this.x = this.root.game_map.$canvas.width() - this.width;
        }
    }

    update_control(){

        // w:上 a:左 d：右 space：跳跃
        let w, a, d, space;
        //玩家1
        if (this.id === 0) {
            w = this.pressed_keys.has('w');
            a = this.pressed_keys.has('a');
            d = this.pressed_keys.has('d');
            space = this.pressed_keys.has(' ');
        } else {//玩家2
            w = this.pressed_keys.has('ArrowUp');
            a = this.pressed_keys.has('ArrowLeft');
            d = this.pressed_keys.has('ArrowRight');
            space = this.pressed_keys.has('Enter');
        }

         //静止或者移动状态
        if (this.status === 0 || this.status === 1) {
            //攻击
            if (space) {
                this.status = 4;
                this.vx = 0;
                //更新帧率
                this.frame_current_cnt = 0;
            } else if (w) {
                if (d) {
                    this.vx = this.speedx;
                } else if (a) {
                    this.vx = -this.speedx;
                } else {
                    this.vx = 0;
                }
                this.vy = this.speedy;
                this.status = 3;
                this.frame_current_cnt = 0;
            } else if (d) {//向右
                this.vx = this.speedx;
                this.status = 1;
            } else if (a) {//向左
                this.vx = -this.speedx;
                this.status = 1;
            } else {
                this.vx = 0;
                this.status = 0;
            }
        }
    }


    update_direction(){
        //人物死亡则不再改变方向
        if(this.status === 6 ) return;

        //先把两个玩家取出来
        let players = this.root.players;

        if(players[0] && players[1]){
            let me = this , you = players[ 1 - this.id] ;
            if( me.x < you.x) me.direction = 1;
            else me.direction = -1 ;
        }

    }
    //碰撞检测函数
    is_collision(r1,r2){
        //分开判断水平方向 竖直方向有没有交集
        if (Math.max(r1.x1, r2.x1) > Math.min(r1.x2, r2.x2))
            return false;
        if (Math.max(r1.y1, r2.y1) > Math.min(r1.y2, r2.y2))
            return false;
        return true;
    }

    is_attack(){
        //倒地不会被攻击
        if(this.status === 6 ) return;

        this.status = 5;
        this.frame_current_cnt = 0;

        //每次受到攻击 都会减少血量
        this.hp = Math.max(this.hp- this.attack,0);
        //血条渐变术
        this.$hp.animate({
            width: this.$hp.parent().width() * this.hp / 100
        },400);
        

        this.$hp_div.animate({
            width: this.$hp.parent().width() * this.hp / 100
        },700);
        //this.$hp.width(this.$hp.parent().width() * this.hp / 100);

        if(this.hp <= 0 ){
            this.status = 6;
            this.frame_current_cnt = 0;
            this.vx = 0;
        }
    }

    update_attack(){
        //攻击状态 可判断出攻击动作在16~20帧之间 取出中间值
        if(this.status === 4 && this.frame_current_cnt === 18){
            //取出角色
            let me = this, you = this.root.players[1 - this.id];
            let r1;
            if (this.direction > 0) {
                r1 = {
                    x1: me.x + 120,
                    y1: me.y + 40,
                    x2: me.x + 120 + 100,
                    y2: me.y + 40 + 20,
                };
            } else {
                r1 = {
                    x1: me.x + me.width - 120 - 100,
                    y1: me.y + 40,
                    x2: me.x + me.width - 120 - 100 + 100,
                    y2: me.y + 40 + 20,
                };
            }

            let r2 = {
                x1: you.x,
                y1: you.y,
                x2: you.x + you.width,
                y2: you.y + you.height
            };

            if (this.is_collision(r1, r2)) {
                you.is_attack();
            }
        }
    }

    update(){
        this.update_control();
        this.update_move();
        this.update_direction();
        this.update_attack();

        this.render();
    }

    render(){
        /* 

        //调试代码
        this.ctx.fillStyle = 'blue';
        this.ctx.fillRect( this.x,this.y,this.width,this.height);
        //估计一下攻击的位置
        if(this.direction > 0){
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(this.x + 120,this.y + 40 ,100,20);
        }else{
            this.ctx.fillStyle = 'red';
            //注意镜像
            this.ctx.fillRect(this.x + this.width - 120 - 100, this.y + 40 ,100,20);
        }
        
        */
        
        let status = this.status;

        //判断方向 改变状态
        if( this.status === 1 && this.direction * this.vx < 0){
            status = 2;
        }

        //传入当前状态
        let obj = this.animations.get(status);

        if(obj && obj.loaded){
            //正方向
            if(this.direction > 0){
                //循环渲染
            let k = parseInt(this.frame_current_cnt / obj.frame_rate ) % obj.frame_cnt;
            let image = obj.gif.frames[k].image;
            this.ctx.drawImage(image, this.x , this.y + obj.offset_y, image.width * obj.scale , image.height * obj.scale);
            }
            //反方向
            else{
                //先保存一下之前的参数
                this.ctx.save();
                //即x乘上-1  y坐标不变
                this.ctx.scale(-1,1);
                //因此需要朝负方向平移画布的宽度的距离
                this.ctx.translate(-this.root.game_map.$canvas.width(), 0);

                let k = parseInt(this.frame_current_cnt / obj.frame_rate ) % obj.frame_cnt;
                let image = obj.gif.frames[k].image;
                //对称方向镜像
                this.ctx.drawImage(image, this.root.game_map.$canvas.width()-this.x -this.width , this.y + obj.offset_y, image.width * obj.scale , image.height * obj.scale);
    

                //变化完坐标系再将其变化回来
                this.ctx.restore();
            }
            
        }

        
        // if(status === 4 || status === 5){
        //     //不加上判断会多一帧挥拳的动作
        //     if(this.frame_current_cnt == obj.frame_rate * (obj.frame_cnt - 1)){
        //         this.status = 0 ;
        //     }
        // } 

        if (status === 4 || status === 5 || status === 6) {
            if (this.frame_current_cnt == obj.frame_rate * (obj.frame_cnt - 1)) {
                //因为该操作室循环进行 --与后面的++ 能造成倒地不起的画面
                if (status === 6) {
                    this.frame_current_cnt--;
                } else {
                    this.status = 0; // 回归静止状态
                }
            }
        }

        //没写完一帧 需要更新
        this.frame_current_cnt ++;
    }
}