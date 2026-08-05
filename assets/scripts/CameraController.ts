import { _decorator, Component, Vec3, Tween, Vec2, UITransform } from 'cc';
import { AnimUtils } from './AnimUtils';
import { Room } from './Room';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    private static _instance: CameraController = null!;

    @property moveToRoom: boolean = false;

    private _activeTween: Tween<any> | null = null;
    private _currentPos: Vec3 = new Vec3(0, 0, 1000);
    private _moving: boolean = false;

    static get instance(): CameraController {
        return this._instance;
    }

    onLoad() {
        if (CameraController._instance) {
            this.node.destroy();
            return;
        }
        CameraController._instance = this;
    }

    start() {
        if (this.moveToRoom) {
            this._currentPos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(Room.currentRoom.node.worldPosition);
        }
    }

    update() {
        if (this._moving) {
            return;
        }
        this.node.setPosition(this._currentPos);
    }

    moveTo(targetWorldPos: Vec3, duration: number) {
        this._moving = true;
        if (this._activeTween) {
            this._activeTween.stop();
            this._activeTween = null;
        }
        AnimUtils.animateWorldPosition(this.node, targetWorldPos, duration, () => {
            this._activeTween = null;
            let pos = this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(targetWorldPos);
            this._currentPos = new Vec3(pos.x, pos.y, 1000);
            this._moving = false;
        }, 'linear');
    }

    reset() {
        this._currentPos = new Vec3(0, 0, 1000);
    }
}