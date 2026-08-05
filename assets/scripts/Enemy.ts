import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact, Label } from 'cc';
import { GameManager } from './GameManager';
import { ValueCarrier } from './ValueCarrier';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property value: number = 1;

    onLoad() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onContact, this);
        }
        this.getComponentInChildren(Label).string = this.value.toString();
    }

    private onContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null) {
        if (otherCollider.node !== GameManager.instance.playerNode) return;
        AudioController.instance.playSound("Enemy");
        const playerVC = GameManager.instance.playerNode.getComponent(ValueCarrier);
        if (!playerVC) return;

        if (playerVC.value >= this.value) {
            this.scheduleOnce(() => {
                playerVC.add(this.value);
                this.node.active = false;
            }, 0);
        } else {
            GameManager.instance.onHealthLoss();
        }
    }

    onDestroy() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onContact, this);
        }
    }
}