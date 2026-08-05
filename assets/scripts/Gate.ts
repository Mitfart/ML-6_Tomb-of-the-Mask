import { _decorator, AnimationComponent, BoxCollider2D, Component, director } from 'cc';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('Gate')
export class Gate extends Component {
    @property totalStrings: number = 1;

    private _cutCount: number = 0;
    private _opened: boolean = false;

    public activate() {
        if (this._opened) return;
        this._cutCount++;
        if (this._cutCount >= this.totalStrings) {
            this._opened = true;
            director.emit('all-strings-cut', this.node);
            this.onAllStringsCut();
        }
    }

    protected onAllStringsCut() {
        AudioController.instance.playSound("Door");
        this.getComponent(AnimationComponent).play("gateOpenAnimation");
        this.getComponent(BoxCollider2D).enabled = false;
    }

    public reset() {
        this._cutCount = 0;
        this._opened = false;
    }
}