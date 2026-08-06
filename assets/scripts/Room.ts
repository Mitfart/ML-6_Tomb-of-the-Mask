import { _decorator, Component, Node, Collider2D, Contact2DType, IPhysics2DContact, Vec2, Vec3, PhysicsSystem2D, ERaycast2DType, BoxCollider2D, animation, AnimationComponent, Color, UIOpacity } from 'cc';
import { GameManager } from './GameManager';
import { CharacterMovement } from './CharacterMovement';
import { CameraController } from './CameraController';
import { RoomRotator } from './RoomRotator';
import { AudioController } from './AudioController';
import { ColorUtils } from './ColorUtils';
import { pulseHighlight } from './HighlightUtils';
const { ccclass, property } = _decorator;

@ccclass('Room')
export class Room extends Component {
    @property(Node) nextRoom: Node = null!;
    @property firstRoom: boolean = false;
    @property(Color) wallsColor: Color = new Color(0, 0, 0, 255);

    private static _currentRoom: Room = null;

    onLoad() {
        if (this.firstRoom) {
            Room._currentRoom = this;
        }

        const collider = this.node.getChildByName("ExitCollider")?.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onTrigger, this);
        }
        const enterCollicde = this.node.getChildByName("EnterCollider")?.getComponent(Collider2D);
        if (enterCollicde) {
            enterCollicde.on(Contact2DType.BEGIN_CONTACT, this.onEnter, this);
        }

        ColorUtils.setSpriteColorRecursively(this.node.getChildByName("Walls"), this.wallsColor);
    }

    private onEnter(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const otherNode = otherCollider.node;
        if (otherNode !== GameManager.instance.playerNode) return;

        const enterCollicde = this.node.getChildByName("EnterCollider")?.getComponent(Collider2D);
        enterCollicde.off(Contact2DType.BEGIN_CONTACT, this.onEnter, this);

        // Items 3+4: on entering Room2, highlight the parts to connect (Tunnel) twice,
        // then the lever twice
        if (this.node.name === "Room2") {
            this.scheduleOnce(() => {
                const tunnel = this.node.getChildByName("Tunnel");
                if (tunnel) {
                    pulseHighlight(tunnel, 2, () => {
                        const lever = this.node.getChildByName("Lever");
                        if (lever) {
                            pulseHighlight(lever, 2);
                        }
                    });
                }
            }, 0.5);
        }

        if (Room.currentRoom.node.name == "Room3") {
            GameManager.instance.rooms[3].getChildByName("Walls").getChildByName("FinalTunnel").getComponent(UIOpacity).opacity = 255;
        }
        if (Room.currentRoom.node.name == "Room4") {
            GameManager.instance.playerNode.getChildByName("Label").active = true;
        }

        let gate = Room.currentRoom.node.getChildByName("Gate")
        gate.getComponent(BoxCollider2D).enabled = true;
        gate.getComponent(AnimationComponent).play("gateCloseAnimation");
    }

    private onTrigger(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const otherNode = otherCollider.node;
        if (otherNode !== GameManager.instance.playerNode) return;


        if (Room._currentRoom === this) {
            Room._currentRoom = null;
            if (this.nextRoom) {
                AudioController.instance.playSound("Win");
                this.startCameraPan(otherNode);
                Room._currentRoom = this.nextRoom.getComponent(Room);
                //if (Room.currentRoom.node.name == "Room2") {
                //    GameManager.instance.rooms[2].active = true;
                //}
                //if (Room.currentRoom.node.name == "Room3") {
                //    GameManager.instance.rooms[0].active = false;
                //    GameManager.instance.rooms[3].active = true;
                //}
            }
        }
    }

    private startCameraPan(playerNode: Node) {
        const playerMovement = playerNode.getComponent(CharacterMovement);
        const playerCollider = playerNode.getComponent(Collider2D);
        if (!playerMovement || !playerCollider) return;

        const moveDir = playerMovement.moveDirection;
        if (!moveDir || (moveDir.x === 0 && moveDir.y === 0)) return;

        const speed = playerMovement.speed * 4;
        const from = playerNode.worldPosition;

        const rayEnd = new Vec2(from.x + moveDir.x * 10000, from.y + moveDir.y * 10000);
        const results = PhysicsSystem2D.instance.raycast(new Vec2(from.x, from.y),rayEnd,  ERaycast2DType.All);

        let hitPoint = rayEnd;
        for (const result of results) {
            const hitNode = result.collider.node;
            if (hitNode === playerNode) continue;
            if (this.isPartOfCurrentRoom(hitNode)) continue;
            hitPoint = result.point;
            break;
        }

        const halfSize = this.getPlayerHalfExtent(playerCollider, moveDir);
        const rawDistance = Vec2.distance(new Vec2(from.x, from.y), hitPoint);
        const adjustedDistance = Math.max(0, rawDistance - halfSize);

        const playerTravelTime = adjustedDistance / speed;
        CameraController.instance.moveTo(this.nextRoom.getChildByName("CameraPoint").worldPosition, playerTravelTime);
    }

    private isPartOfCurrentRoom(node: Node): boolean {
        let current = node;
        while (current) {
            if (current === this.node) return true;
            current = current.parent;
        }
        return false;
    }

    private getPlayerHalfExtent(collider: Collider2D, direction: Vec2): number {
        const aabb = collider.worldAABB;

        const width = aabb.xMax - aabb.xMin;
        const height = aabb.yMax - aabb.yMin;

        if (Math.abs(direction.x) > 0.9) {
            return width / 2;
        }
        else {
            return height / 2;
        }
    }

    static get currentRoom(): Room {
        return this._currentRoom;
    }
}