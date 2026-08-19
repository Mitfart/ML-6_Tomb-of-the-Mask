import { _decorator, Component, Collider2D, director, Label, Node, Sprite, Color, tween, UIOpacity, Vec3 } from 'cc';
import { GameManager } from './GameManager';
import { AudioController } from './AudioController';
import { GlowEffect } from './GlowEffect';
import { cancelEvent, scheduleEvent } from './EventUtils';

const { ccclass, property } = _decorator;

@ccclass('Door')
export class Door extends Component {
    @property requiredKeys: number = 1;
    @property finalDoor: boolean = false;

    private _opened: boolean = false;
    private _glow: GlowEffect | null = null;
    private _glowTimerId: number | null = null;   // stores the setTimeout ID for this door

    onLoad() {
        director.on('key-count-changed', this.onKeyCountChanged, this);
        director.on('swipe', this.stopGlow, this);
        this.node.getComponentInChildren(Label).string = "x" + this.requiredKeys;
    }

    onDisable() {
        director.off('key-count-changed', this.onKeyCountChanged, this);
        director.off('swipe', this.stopGlow, this);
        this.cancelGlowTimer(); // clean up when disabled
    }

    onDestroy() {
        this.cancelGlowTimer();
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

    private startGlow() {
        // Only start if the component exists, door is closed, and node is active
        if (this._glow && !this._opened && this.node.active) {
            this._glow.start();
        }
        this._glowTimerId = null; // timer has fired, clear the reference
    }

    private stopGlow() {
        if (this._glow) {
            this._glow.stop();          // stop the visual effect
            // Do NOT set this._glow = null – we want to keep the component for later restarts
        }
        
        this.cancelGlowTimer();
        this._glowTimerId = scheduleEvent(5, this.startGlow.bind(this));
    }

    private cancelGlowTimer() {
        if (this._glowTimerId != null) {
            cancelEvent(this._glowTimerId);
            this._glowTimerId = null;
        }
    }

    private onKeyCountChanged(totalKeys: number) {
        // If door is still closed and we have enough keys – open it
        if (!this._opened && totalKeys >= this.requiredKeys && GameManager.instance.useKeys(totalKeys)) {
            this.open();
            this.cancelGlowTimer();   // no glow after opening
            return;
        }

        // If door is already open, don't schedule glow
        if (this._opened) {
            this.cancelGlowTimer();
            return;
        }

        // Otherwise, cancel any previous timer and schedule a new one
        this.cancelGlowTimer();
        this._glowTimerId = scheduleEvent(5, this.startGlow.bind(this));
    }

    private open() {
        AudioController.instance.playSound("Door");
        this._opened = true;
        if (this.finalDoor) GameManager.instance.hideKeysUI();
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.enabled = false;
        }
        this.stopGlow(); // stop effect and clear timer

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