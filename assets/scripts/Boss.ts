import { _decorator, Component, Collider2D, Contact2DType, IPhysics2DContact, Label } from 'cc';
import { GameManager } from './GameManager';
import { ValueCarrier } from './ValueCarrier';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('Boss')
export class Boss extends Component {
    @property value: number = 5;

    onLoad() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onContact, this);
        }
        this.getComponentInChildren(Label).string = this.value.toString();
    }

    private onContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null) {
        if (otherCollider.node !== GameManager.instance.playerNode) return;
        const playerVC = GameManager.instance.playerNode.getComponent(ValueCarrier);
        if (!playerVC) return;

        if (playerVC.value >= this.value) {
            playerVC.add(this.value);
            this.scheduleOnce(() => {
                this.node.destroy();
                this.node.active = false;
                //GameManager.instance.win();
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