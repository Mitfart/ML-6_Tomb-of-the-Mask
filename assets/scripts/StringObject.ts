import { _decorator, Component, Node, Graphics, BoxCollider2D, RigidBody2D, Contact2DType, IPhysics2DContact, Vec3, tween, Color } from 'cc';
import { GameManager } from './GameManager';
import { CharacterMovement } from './CharacterMovement';
import { Gate } from './Gate';
import { Wire } from './Wire';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

@ccclass('StringObject')
export class StringObject extends Component {
    @property(Node) anchorA: Node = null!;
    @property(Node) anchorB: Node = null!;
    @property(Node) lineNode: Node = null!;
    @property(Wire) targetWire: Wire = null!;
    @property(Gate) targetGate: Gate = null!;
    @property lineColor: Color = new Color(255, 255, 255, 255);
    @property lineWidth: number = 2;
    @property splitDuration: number = 0.2;
    @property wireDuration: number = 2;

    private _graphics: Graphics = null!;
    private _collider: BoxCollider2D = null!;
    private _cut: boolean = false;
    private _length: number = 0;

    onLoad() {
        if (!this.lineNode) {
            console.error("StringObject: lineNode not assigned");
            return;
        }
        this._graphics = this.lineNode.getComponent(Graphics);
        this._collider = this.lineNode.getComponent(BoxCollider2D);
        if (!this._graphics || !this._collider) {
            console.error("StringObject: lineNode needs Graphics and BoxCollider2D");
            return;
        }
        this._collider.sensor = true;
        this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    start() {
        this.drawString();
    }

    private drawString() {
        if (!this.anchorA || !this.anchorB) return;
        const worldA = this.anchorA.worldPosition;
        const worldB = this.anchorB.worldPosition;
        const mid = new Vec3((worldA.x + worldB.x) / 2, (worldA.y + worldB.y) / 2, 0);
        const dx = worldB.x - worldA.x;
        const dy = worldB.y - worldA.y;
        this._length = Math.sqrt(dx * dx + dy * dy);
        const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
        this.lineNode.worldPosition = mid;
        this.lineNode.angle = angleDeg;
        this._graphics.clear();
        this._graphics.lineWidth = this.lineWidth;
        this._graphics.strokeColor = this.lineColor;
        this._graphics.moveTo(-this._length / 2, 0);
        this._graphics.lineTo(this._length / 2, 0);
        this._graphics.stroke();
        this._collider.size.width = this._length;
        this._collider.size.height = 0.1;
    }

    private onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        if (this._cut) return;
        const playerNode = GameManager.instance?.playerNode;
        if (!playerNode || otherCollider.node !== playerNode) return;
        const playerMovement = playerNode.getComponent(CharacterMovement);
        if (!playerMovement || !playerMovement.isMoving) return;
        this._cut = true;

        if (this.targetGate) {
            this.targetWire.activate(this.wireDuration);
            this.scheduleOnce(() => {
                this.targetGate.activate();
            }, this.wireDuration);
        }

        AudioController.instance.playSound("String");
        this.cutString(contact);
    }

    private cutString(contact: IPhysics2DContact | null) {
        this._collider.enabled = false;
        this._graphics.clear();

        let cutPointWorld: Vec3;
        if (contact) {
            const manifold = contact.getWorldManifold();
            if (manifold.points.length > 0) {
                cutPointWorld = new Vec3(manifold.points[0].x, manifold.points[0].y, 0);
            } else {
                cutPointWorld = GameManager.instance.playerNode.worldPosition.clone();
            }
        } else {
            cutPointWorld = GameManager.instance.playerNode.worldPosition.clone();
        }

        this.createRecoilPiece(this.anchorA.worldPosition, cutPointWorld);
        this.createRecoilPiece(this.anchorB.worldPosition, cutPointWorld);
    }

    private createRecoilPiece(anchorWorldPos: Vec3, cutWorldPos: Vec3) {
        const pieceNode = new Node('RecoilPiece');
        this.node.addChild(pieceNode);
        pieceNode.worldPosition = anchorWorldPos;

        const dir = new Vec3(cutWorldPos.x - anchorWorldPos.x, cutWorldPos.y - anchorWorldPos.y, 0);
        const fullLength = dir.length();
        if (fullLength < 0.01) {
            pieceNode.destroy();
            return;
        }
        pieceNode.angle = Math.atan2(dir.y, dir.x) * (180 / Math.PI);

        const graphics = pieceNode.addComponent(Graphics);
        graphics.lineWidth = this.lineWidth;

        const proxy = { t: 1.0, alpha: this.lineColor.a };
        tween(proxy)
            .to(this.splitDuration, { t: 0, alpha: 0 }, {
                easing: 'cubicInOut',
                onUpdate: () => {
                    graphics.clear();
                    const currentLength = fullLength * proxy.t;
                    const bulge = currentLength * 0.3; 
                    const steps = 20;
                    graphics.strokeColor = new Color(this.lineColor.r, this.lineColor.g, this.lineColor.b, proxy.alpha);
                    graphics.moveTo(0, 0);
                    for (let i = 1; i <= steps; i++) {
                        const s = i / steps;
                        const invS = 1 - s;
                        const x = invS * invS * 0 + 2 * invS * s * (currentLength * 0.5) + s * s * currentLength;
                        const y = invS * invS * 0 + 2 * invS * s * bulge + s * s * 0;
                        graphics.lineTo(x, y);
                    }
                    graphics.stroke();
                }
            })
            .call(() => pieceNode.destroy())
            .start();
    }

    onDestroy() {
        if (this._collider) {
            this._collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }
}