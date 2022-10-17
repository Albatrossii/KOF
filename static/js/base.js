import {GameMap} from '/static/js/game_map/base.js';
import {Kyo} from '/static/js/player/kyo.js';
import {Mai} from '/static/js/player/mai.js';

class KOF {
    constructor(id){
        // jquery id选择器
        this.$kof = $('#'+ id);

        this.game_map = new GameMap(this);
        this.players = [
            new Kyo(this,{
                id:0,
                x: 300,
                y: 0,
                width: 120,
                height: 200,
                color: 'blue',
                attack:50,
            }),
            new Mai(this,{
                id: 1,
                x: 900,
                y: 0,
                width: 120,
                height: 200,
                color: 'red',
                attack:30,
            })
        ]

    }
}

export {
    KOF
}