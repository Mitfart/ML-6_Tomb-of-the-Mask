import { _decorator, Component, Node, director, Vec3, BoxCollider2D, AnimationComponent } from 'cc';
import { AnimUtils } from './AnimUtils';
import { GameManager } from './GameManager';
import { CharacterMovement } from './CharacterMovement';
import { AudioController } from './AudioController';

const { ccclass, property } = _decorator;

@ccclass('RoomRotator')
export class RoomRotator extends Component {
    private static _instance: RoomRotator = null!;

    @property(Node) roomNode: Node = null!;
    @property(Node) gate: Node = null!;
    @property rotationDuration: number = 0.5;
    @property rotationAngle: number = 90;

    private _isRotating: boolean = false;

    get isRotating(): boolean {
        return this._isRotating;
    }

    static get instance(): RoomRotator {
        return this._instance;
    }

    onLoad() {
        if (RoomRotator._instance) {
            this.node.destroy();
            return;
        }
        RoomRotator._instance = this;
        director.addPersistRootNode(this.node);
    }

    rotateClockwise() {
        this.rotateBy(-this.rotationAngle);
    }

    rotateCounterClockwise() {
        this.rotateBy(this.rotationAngle);
    }

    private rotateBy(angle: number) {
        if (!this.roomNode || this._isRotating) return;

        this.roomNode.getChildByName("Tutor").active = false;

        if (this.roomNode.getChildByName("ExitCollider").getComponent(BoxCollider2D).enabled == false) {
            this.roomNode.getChildByName("ExitCollider").getComponent(BoxCollider2D).enabled = true;
        }

        this._isRotating = true;
        let player = GameManager.instance.playerNode;
        let parent = player.parent;
        let worldPos = player.worldPosition.clone();
        player.setParent(this.roomNode);
        player.setWorldPosition(worldPos);
        const targetAngle = this.roomNode.eulerAngles.z + angle;
        const prevAngle = this.roomNode.eulerAngles.z;

        AudioController.instance.playSound("Rotate");
        AnimUtils.animateRotation2D(this.roomNode, targetAngle, this.rotationDuration, () => {
            this._isRotating = false;
            worldPos = player.worldPosition.clone();
            let playerAngle = player.eulerAngles.z;
            player.setParent(parent);
            player.setWorldPosition(worldPos);
            player.eulerAngles = new Vec3(player.eulerAngles.x, player.eulerAngles.y, playerAngle + angle);

            if (((targetAngle % 360) + 360) % 360 - 270 == 0) {
                RoomRotator.instance.gate.getComponent(BoxCollider2D).enabled = false;
                RoomRotator.instance.gate.getComponent(AnimationComponent).play("gateOpenAnimation");

            }
            else if (((prevAngle % 360) + 360) % 360 - 270 == 0) {
                RoomRotator.instance.gate.getComponent(BoxCollider2D).enabled = true;
                RoomRotator.instance.gate.getComponent(AnimationComponent).play("gateCloseAnimation");
            }
            const movement = player.getComponent(CharacterMovement);
            if (movement) {
                movement.clearLastWallNormal();
            }
        });
    }
}