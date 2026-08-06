import { _decorator, Component, Collider2D, director, Label, Node, Sprite, Color, tween, UIOpacity, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { AudioController } from './AudioController';
import { GlowEffect } from './GlowEffect';
const { ccclass, property } = _decorator;

@ccclass('Door')
export class Door extends Component {
    @property requiredKeys: number = 1;

    private _opened: boolean = false;
    private _glow: GlowEffect | null = null;

    onLoad() {
        director.on('key-count-changed', this.onKeyCountChanged, this);
        director.on('swipe', this.stopGlow, this);
        this.node.getComponentInChildren(Label).string = "x" + this.requiredKeys;
    }

    onDisable() {
        director.off('key-count-changed', this.onKeyCountChanged, this);
        director.off('swipe', this.stopGlow, this);
    }

    start() {
        // Item 5: lock (Keys group: Lock + Label) spawn animation — pop in with a bounce, staggered per door
        const keys = this.node.getChildByName("Keys");
        if (keys) {
            const keysOpacity = keys.getComponent(UIOpacity) || keys.addComponent(UIOpacity);
            keysOpacity.opacity = 0;
            keys.setScale(0, 0, 1);
            const delay = 0.3 + this.node.siblingIndex * 0.12;
            this.scheduleOnce(() => {
                keysOpacity.opacity = 0;
                tween(keys)
                    .to(0.45, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                    .start();
                tween(keysOpacity).to(0.45, { opacity: 255 }).start();
            }, delay);
        }

        // Item 1: doors glow while the player is idle (stops on first move)
        const spriteNode = this.node.getChildByName("Sprite");
        if (spriteNode) {
            spriteNode.addComponent(UIOpacity);
            this._glow = spriteNode.addComponent(GlowEffect);
        }
    }

    private stopGlow() {
        if (this._glow) {
            this._glow.stop();
            this._glow = null;
        }
    }

    private onKeyCountChanged(totalKeys: number) {
        if (!this._opened && totalKeys >= this.requiredKeys) {
            this.open();
            GameManager.instance.useKeys(totalKeys);
        }
    }

    private open() {
        AudioController.instance.playSound("Door");
        this._opened = true;
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.enabled = false;
        }
        this.stopGlow();

        // Item 2: opened door highlight — flash 2x, then fade out before deactivating
        const spriteNode = this.node.getChildByName("Sprite");
        const sprite = spriteNode?.getComponent(Sprite);
        if (sprite) {
            const base = sprite.color.clone();
            const highlight = new Color(255, 235, 120, base.a);
            tween(sprite)
                .to(0.12, { color: highlight })
                .to(0.12, { color: base })
                .union()
                .repeat(2)
                .to(0.3, { color: new Color(base.r, base.g, base.b, 0) })
                .start();
        }
        const keys = this.node.getChildByName("Keys");
        const keysOpacity = keys?.getComponent(UIOpacity);
        if (keysOpacity) {
            tween(keysOpacity).delay(0.5).to(0.3, { opacity: 0 }).start();
        }

        this.scheduleOnce(() => {
            this.node.active = false;
        }, 0.85);
    }
}
