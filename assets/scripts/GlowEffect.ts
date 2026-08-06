import { _decorator, Component, tween, UIOpacity, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GlowEffect')
export class GlowEffect extends Component {
    @property phaseOffset: number = 0;
    private uiOpacity: UIOpacity | null = null;
    private _tween: Tween<UIOpacity> | null = null;

    onLoad() {
        this.uiOpacity = this.getComponent(UIOpacity);
    }

    start() {
        if (!this.uiOpacity) return;

        this.scheduleOnce(() => {
            this._tween = tween(this.uiOpacity)
                .to(0.5, { opacity: 100 })
                .to(0.5, { opacity: 255 })
                .union()
                .repeat(Infinity)
                .start();
        }, this.phaseOffset);
    }

    public stop(): void {
        if (this._tween) {
            this._tween.stop();
            this._tween = null;
        }
        if (this.uiOpacity) {
            this.uiOpacity.opacity = 255;
        }
    }
}
