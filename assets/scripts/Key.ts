import { _decorator, Component } from 'cc';
import { GameManager } from './GameManager';
const { ccclass } = _decorator;

@ccclass('Key')
export class Key extends Component {
    collect() {
        GameManager.instance.addKey(1);
        this.scheduleOnce(() => {
            this.node.destroy();
        });
    }
}