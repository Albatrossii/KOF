import {Game_object} from '../game_object/base.js';
import { Controller } from '../controller/base.js';

export class GameMap extends Game_object{
    constructor(root){
        super();
        //root中有一个kof
        this.root = root;
        //为了使canvas能够读取到输入 前提是使其能够聚焦 加上tabindex=0属性
        this.$canvas = $('<canvas width="1280" height="720" tabindex=0></canvas>');
        //绘制2d画面
        this.ctx = this.$canvas[0].getContext('2d');
        this.root.$kof.append(this.$canvas);
        this.$canvas.focus();

        this.Controller = new Controller(this.$canvas);
        this.root.$kof.append($(
        `<div class="kof-head">
            <div class="kof-head-hp-0"> <div> <div></div> </div> </div>
            <div class="kof-head-timer">60</div>
            <div class="kof-head-hp-1"> <div> <div></div> </div> </div>
        </div>`));
        
        this.time_left = 60000;  //ms
        this.$timer = this.root.$kof.find(".kof-head>.kof-head-timer");
    }

     //初始执行一次
     start() {
        

    }
    //每一帧执行一次（除了第一帧以外）每一帧都需要清空一次 
    update() {
        this.time_left -= this.timedelta;
        if(this.time_left < 0) {
            this.time_left = 0 ;
            //两个玩家都没有赢
            let [a,b] = this.root.players;

            if(a.status !== 6 && b.status !== 6){
                a.status = b.status = 6;
                
                //清空速度和帧率
                a.frame_current_cnt = b.frame_current_cnt = 0;
                a.vx = b.vx = 0;
            }
        }
        this.$timer.text(parseInt(this.time_left / 1000));

        this.render();
    }
    
    //渲染函数
    render(){
        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
        // this.ctx.fillstyle = 'black';
        // this.ctx.fillRect(0,0,this.$canvas.width(),this.$canvas.height());
    }
}