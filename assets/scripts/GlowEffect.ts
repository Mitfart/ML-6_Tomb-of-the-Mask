import { _decorator, Component, Node, tween, v3, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GlowEffect')
export class GlowEffect extends Component {
    @property phaseOffset: number = 0;
    private uiOpacity: UIOpacity | null = null;

    onLoad() {
        this.uiOpacity = this.getComponent(UIOpacity);
    }

    start() {
        if (!this.uiOpacity) return;

        this.scheduleOnce(() => {
            tween(this.uiOpacity)
                .to(0.5, { opacity: 100 })
                .to(0.5, { opacity: 255 })
                .union()
                .repeat(Infinity)
                .start();
        }, this.phaseOffset);

    }
}