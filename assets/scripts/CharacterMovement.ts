import { _decorator, Component, Node, RigidBody2D, Collider2D, Contact2DType, IPhysics2DContact, Vec2, Vec3, director, v2, PhysicsSystem2D, ERaycast2DType } from 'cc';
import { RoomRotator } from './RoomRotator';
import { GameManager } from './GameManager';
import { Room } from './Room';
import { AudioController } from './AudioController';
const { ccclass, property } = _decorator;

enum MoveState {
    IDLE,
    MOVING
}

@ccclass('CharacterMovement')
export class CharacterMovement extends Component {
    @property speed: number = 500;
    @property(Vec2) initialPosition: Vec2 = new Vec2(450, -420);
    @property rememberPosition: boolean = false;
    @property wallGroupIndex: number = 4;
    @property gemGroupIndex: number = 8;
    @property keyGroupIndex: number = 16;
    @property spikesGroupIndex: number = 32;
    @property cwGroupIndex: number = 64;
    @property ccwGroupIndex: number = 128;
    @property minWallDistance: number = 60;
    @property(Node) levelLabel: Node = null!;
    @property(Vec2) levelLabelOffset: Vec2 = new Vec2(0, 70);

    private _rigidBody: RigidBody2D = null!;
    private _state: MoveState = MoveState.IDLE;
    private _stopLock: boolean = false;
    private _inputBlockCount: number = 0;
    private _moveDirection: Vec2 = new Vec2();
    private _lastStopTime: number = 0;
    private _lastWallNormal: Vec2 = new Vec2();
    private _hasWallNormal: boolean = false;
    private _hitInvisible: boolean = false;

    private _tempVelocity: Vec2 = new Vec2();

    public get moveDirection(): Vec2 {
        return this._moveDirection;
    }

    onLoad() {
        if (this.rememberPosition == false) {
            this.node.setPosition(this.initialPosition.x, this.initialPosition.y);
        }

        this._rigidBody = this.getComponent(RigidBody2D)!;
        director.on('swipe', this.onSwipe, this);

        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onDestroy() {
        director.off('swipe', this.onSwipe, this);
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    private onSwipe(direction: Vec2) {
        if (this._inputBlockCount || this._state !== MoveState.IDLE) return;
        if (Date.now() - this._lastStopTime < 50) return;
        if (RoomRotator.instance.isRotating) return;

        if (this._hasWallNormal && Vec2.dot(direction, this._lastWallNormal) < -0.9) return;

        if (this.isWallTooClose(direction)) return;

        if (Room.currentRoom.name !== "Room2") {
            const tutor = Room.currentRoom.node.getChildByName("Tutor");
            if (tutor) {
                tutor.active = false;
            }
        }

        this._state = MoveState.MOVING;
        this._moveDirection.set(direction);

        AudioController.instance.playSound("Move");

        this.rotate(direction);
        this.node.getChildByName("Sprite").active = false;
        this.node.getChildByName("Light").active = true;

        this._rigidBody.linearVelocity = v2(direction.x * this.speed, direction.y * this.speed);
    }

    private isWallTooClose(direction: Vec2): boolean {
        const playerCollider = this.getComponent(Collider2D);
        if (!playerCollider) return false;

        const origin = this.node.worldPosition;
        const rayEnd = new Vec2(origin.x + direction.x * 10000, origin.y + direction.y * 10000);

        const results = PhysicsSystem2D.instance.raycast(
            new Vec2(origin.x, origin.y),
            rayEnd,
            ERaycast2DType.All
        );

        let hitPoint: Vec2 | null = null;
        for (const result of results) {
            const node = result.collider.node;
            if (node === this.node) continue;
            if (result.collider.group === this.wallGroupIndex) {
                hitPoint = result.point;
                break;
            }
        }
        if (!hitPoint) return false;

        const halfSize = this.getPlayerHalfExtent(playerCollider, direction);
        const distance = Vec2.distance(new Vec2(origin.x, origin.y), hitPoint);
        return distance <= halfSize + this.minWallDistance;
    }

    private getPlayerHalfExtent(collider: Collider2D, direction: Vec2): number {
        const aabb = collider.worldAABB;
        const width = aabb.xMax - aabb.xMin;
        const height = aabb.yMax - aabb.yMin;
        return Math.abs(direction.x) > 0.9 ? width / 2 : height / 2;
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this._state !== MoveState.MOVING) return;
        if (!contact) return;

        const otherGroup = otherCollider.group;

        if (otherGroup === this.spikesGroupIndex) {
            GameManager.instance.gameOver();
            return;
        }

        if (otherGroup === this.gemGroupIndex) {
            const gem = otherCollider.node.getComponent('Gem');
            this.scheduleOnce(() => {
                if (gem && typeof (gem as any).collect === 'function') (gem as any).collect();
            }, 0);
            return;
        }

        if (otherGroup === this.keyGroupIndex) {
            AudioController.instance.playSound("Key");
            const key = otherCollider.node.getComponent('Key');
            if (key && typeof (key as any).collect === 'function') (key as any).collect();
            return;
        }

        const normal = contact.getWorldManifold().normal;
        let direction = new Vec2(normal.x, normal.y);
        if (this._moveDirection.x == 0) {
            if (Math.abs(direction.y) < 0.9) {
                return;
            }
        }
        else {
            if (Math.abs(direction.x) < 0.9) {
                return;
            }
        }

        if (otherGroup === this.wallGroupIndex) {
            if (otherCollider.node.name == "InvisibleWall") {
                this._hitInvisible = true;
            }
            this._stopLock = true;
            this.stopAndSeparate(new Vec2(normal.x, normal.y));
        }

        if (otherGroup === this.ccwGroupIndex) {
            this.scheduleOnce(() => {
                RoomRotator.instance.rotateCounterClockwise();
            }, 0);
        }
        if (otherGroup === this.cwGroupIndex) {
            this.scheduleOnce(() => {
                RoomRotator.instance.rotateClockwise();
            }, 0);
        }
    }

    private stopAndSeparate(normal: Vec2) {
        this._rigidBody.linearVelocity = Vec2.ZERO.clone();

        this.scheduleOnce(() => {
            this._lastWallNormal.set(normal.x, normal.y);
            this._hasWallNormal = true;

            const pos = this.node.getPosition();
            const adjustment = new Vec3(-normal.x, -normal.y, 0).multiplyScalar(2);
            let newPos = pos.clone();
            if (this._moveDirection.x == 0) {
                newPos.y += adjustment.y;
                newPos.y = Math.round(newPos.y / 10) * 10;
            }
            else {
                newPos.x += adjustment.x;
                newPos.x = Math.round(newPos.x / 10) * 10;
            }
            let dir = this._moveDirection.clone();
            this._moveDirection.set(0, 0);
            this.node.setPosition(newPos);
            this.node.getChildByName("Sprite").active = true;
            this.node.getChildByName("Light").active = false;
            if (this._hitInvisible) {
                this._lastWallNormal = new Vec2();
                this._hasWallNormal = false;
                this.node.angle = 0;
                this.levelLabel.angle = 0;
                this.positionLevelLabel(0);
                this._hitInvisible = false;
            }
            else {
                this.rotate(dir);
            }
            this._state = MoveState.IDLE;
            this._stopLock = false;
            this._lastStopTime = Date.now();
        }, 0);
    }

    rotate(direction: Vec2) {
        let angle = 0;
        if (Math.abs(direction.x) > 0.9) {
            angle = direction.x * 90;
        }
        else {
            angle = 90 + direction.y * 90;
        }

        this.node.angle = angle;
        this.levelLabel.angle = -angle;
        this.positionLevelLabel(angle);
    }

    private positionLevelLabel(angle: number): void {
        const radians = angle * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        this.levelLabel.setPosition(
            this.levelLabelOffset.x * cos + this.levelLabelOffset.y * sin,
            -this.levelLabelOffset.x * sin + this.levelLabelOffset.y * cos
        );
    }

    public get isMoving(): boolean {
        return this._state === MoveState.MOVING;
    }

    public clearLastWallNormal(): void {
        this._hasWallNormal = false;
    }

    public blockInput(): void {
        this._inputBlockCount++;
    }

    public unblockInput(): void {
        this._inputBlockCount--;
    }

    public stop() {
        this._rigidBody.linearVelocity = Vec2.ZERO.clone();
        this.scheduleOnce(() => {
            this._moveDirection.set(0, 0);
            this._lastWallNormal = new Vec2();
            this._hasWallNormal = false;
            this.node.angle = 0;
            this.levelLabel.angle = 0;
            this.positionLevelLabel(0);
            this.node.getChildByName("Sprite").active = true;
            this.node.getChildByName("Light").active = false;
            this._state = MoveState.IDLE;
            this._stopLock = false;
            this._lastStopTime = Date.now();
        }, 0);
    }
}