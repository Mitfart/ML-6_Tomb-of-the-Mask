import { _decorator, Component, Node, director, UIOpacity, RigidBody, RigidBody2D, BoxCollider2D, Camera, AnimationComponent } from 'cc';
import { AnimUtils } from './AnimUtils';
import { CameraController } from './CameraController';
import super_html_playable from './super_html_playable';
import { ValueCarrier } from './ValueCarrier';
import { CharacterMovement } from './CharacterMovement';
import { KeysUI } from './KeysUI';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager = null!;

    @property(Node) playerNode: Node = null!;
    @property(Node) winScreen: Node = null!;
    @property(Node) failScreen: Node = null!;
    @property([Node]) rooms: Node[] = [];
    @property(Node) hp: Node = null!;
    @property(Node) splash: Node = null!;
    @property(KeysUI) keysUI: KeysUI = null!;

    private _keys: number = 0;
    private _health: number = 3;

    static get instance(): GameManager {
        return this._instance;
    }

    get keys(): number {
        return this._keys;
    }

    onLoad() {
        if (GameManager._instance) {
            this.node.destroy();
            return;
        }
        GameManager._instance = this;
        const hpOpacity = this.hp.getComponent(UIOpacity) || this.hp.addComponent(UIOpacity);
        hpOpacity.opacity = 0;
        director.addPersistRootNode(this.node);
        //this.rooms[2].active = false;
        //this.rooms[3].active = false;
    }

    start() {
        this.keysUI.setValue(this._keys);
        this.keysUI.show();
    }

    hideKeysUI() {
        this.keysUI.hide();
    }

    addKey(amount: number = 1) {
        this._keys += amount;
        this.keysUI.setValue(this._keys);
        director.emit('key-count-changed', this._keys);
    }

    useKeys(amount: number): boolean {
        if (this._keys >= amount) {
            this._keys -= amount;
            this.keysUI.setValue(this._keys);
            director.emit('key-count-changed', this._keys);
            return true;
        }
        return false;
    }

    showHp() {
        AnimUtils.animateOpacity(this.hp, 255, 0.5);
    }

    onHealthLoss() {
        this._health--;
        if (this._health == 0) {
            this.gameOver();
            return;
        }
        this.hp.children[this._health].active = false;
        director.emit('restart');
        this.scheduleOnce(() => {
            this.playerNode.getComponent(CharacterMovement).stop();
            this.scheduleOnce(() => {
                this.playerNode.getComponent(RigidBody2D).enabled = false;
                this.scheduleOnce(() => {
                    this.playerNode.setPosition(-340, -2340);
                    this.playerNode.getComponent(ValueCarrier).reset();
                    this.scheduleOnce(() => {
                        this.playerNode.getComponent(RigidBody2D).enabled = true;
                    }, 0);
                }, 0);
            }, 0);
        }, 0);
    }

    public gameOver() {
        //CameraController.instance.reset();
        this.playerNode.getComponent(UIOpacity).opacity = 0;
        this.failScreen.getComponent(UIOpacity).opacity = 0;
        this.failScreen.setWorldPosition(CameraController.instance.node.worldPosition);
        this.failScreen.active = true;
        this.scheduleOnce(()=>{
            AnimUtils.animateOpacity(this.failScreen, 255, 2);
        }, 1);
    }

    public win() {
        //CameraController.instance.reset();
        this.playerNode.getComponent(UIOpacity).opacity = 0;
        this.winScreen.getComponent(UIOpacity).opacity = 0;
        this.winScreen.setWorldPosition(CameraController.instance.node.worldPosition);
        this.winScreen.active = true;
        AnimUtils.animateOpacity(this.winScreen, 255, 0.5, () => {
            const stars = this.winScreen.getChildByName("Panel").getChildByName("Stars").children;
            let t = 0;
            stars.forEach(star => {
                this.scheduleOnce(() => {
                    star.getComponent(AnimationComponent).play("starAnimation");
                }, t);
                t += 0.2;
            })
        });
    }

    onInstallButtonClick() {
        super_html_playable.download();
    }
}