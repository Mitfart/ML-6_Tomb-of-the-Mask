import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Label, Node } from 'cc';
import { GameManager } from './GameManager';
import { ValueCarrier } from './ValueCarrier';
const { ccclass, property } = _decorator;

@ccclass('Portal')
export class Portal extends Component {
    onLoad() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onContact, this);
        }
    }

    private onContact(selfCollider: Collider2D, otherCollider: Collider2D, _contact: IPhysics2DContact | null) {
        if (otherCollider.node !== GameManager.instance.playerNode) return;
        const playerVC = GameManager.instance.playerNode.getComponent(ValueCarrier);
        if (!playerVC) return;
        GameManager.instance.win();
    }

    onDestroy() {
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onContact, this);
        }
    }
}

