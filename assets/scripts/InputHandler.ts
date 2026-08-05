import { _decorator, Component, input, Input, EventTouch, Vec2, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InputHandler')
export class InputHandler extends Component {
    @property minSwipeDistance: number = 30;
    @property maxSwipeDuration: number = 0.5;

    private _startPos: Vec2 = new Vec2();
    private _startTime: number = 0;

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        this._startPos.set(event.getLocationX(), event.getLocationY());
        this._startTime = Date.now();
    }

    private onTouchEnd(event: EventTouch) {
        const elapsed = (Date.now() - this._startTime) / 1000;
        if (elapsed > this.maxSwipeDuration) return;

        const endPos = new Vec2(event.getLocationX(), event.getLocationY());
        const delta = endPos.subtract(this._startPos);
        if (delta.length() < this.minSwipeDistance) return;

        const direction = this.snapToCardinal(delta);
        director.emit('swipe', direction);
    }

    private snapToCardinal(delta: Vec2): Vec2 {
        if (Math.abs(delta.x) > Math.abs(delta.y)) {
            return new Vec2(delta.x > 0 ? 1 : -1, 0);
        } else {
            return new Vec2(0, delta.y > 0 ? 1 : -1);
        }
    }
}