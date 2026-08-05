import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RestartableObject')
export class RestartableObject extends Component {

    onLoad() {
        director.on('restart', this.onRestart, this);
    }

    onDestroy() {
        director.off('restart', this.onRestart, this);
    }

    onRestart() {
        this.scheduleOnce(() => {
            this.node.active = true;
        }, 0);
    }
}

