import { _decorator, Component, Collider2D, director, Label } from 'cc';
import { GameManager } from './GameManager';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('Door')
export class Door extends Component {
    @property requiredKeys: number = 1;

    private _opened: boolean = false;

    onLoad() {
        director.on('key-count-changed', this.onKeyCountChanged, this);
        this.node.getComponentInChildren(Label).string = "x" + this.requiredKeys;
    }

    onDisable() {
        director.off('key-count-changed', this.onKeyCountChanged, this);
    }

    private onKeyCountChanged(totalKeys: number) {
        if (!this._opened && totalKeys >= this.requiredKeys) {
            this.open();
            GameManager.instance.useKeys(totalKeys);
        }
    }

    private open() {
        AudioController.instance.playSound("Door");
        this._opened = true;
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.enabled = false;
        }
        this.scheduleOnce(() => {
            this.node.active = false;
        });
    }
}