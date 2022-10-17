import { Player } from "./base.js";
import {GIF} from '/static/js/utils/gif.js'

export class Mai extends Player {
    constructor(root , info){
        super(root , info);

        this.init_animations();
    }

    //初始化动画 定义图片
    init_animations(){

        let outer = this;
        let offsets = [32 , 10, 30, -140, -10, 0, -50];

        for(let i=0 ; i < 7 ; i++ ){
            let gif = GIF();
            //格式化数字 应该使用左上方波浪线
            gif.load(`/static/images/player/mai/${i}.gif`);

            this.animations.set(i,{
                gif: gif ,
                //总帧数
                frame_cnt : 0,
                //每frame_rate过渡一次 不然走得太快
                frame_rate: 5,
                //竖直方向偏移量
                offset_y : offsets[i],
                //时候加载完成
                loaded : false,
                //放大多少倍
                scale:2,
                
            });

            //加载图片
            gif.onload = function(){
                let obj = outer.animations.get(i);
                obj.frame_cnt = gif.frames.length;
                obj.loaded = true;

                //如果是跳跃状态 需要改变帧率
                if( i === 3){
                    obj.frame_rate = 4;
                }
            };
        }
    }
}

 