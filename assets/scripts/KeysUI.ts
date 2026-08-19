import { _decorator, Component, Label, tween, Tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KeysUI')
export class KeysUI extends Component {
    @property(Label) label: Label = null!;

    private _opacity: UIOpacity = null!;
    private _value: number = 0;

    onLoad() {
        this._opacity = this.getComponent(UIOpacity) || this.addComponent(UIOpacity);
        this._opacity.opacity = 0;
    }

    onDestroy() {
        Tween.stopAllByTarget(this._opacity);
        Tween.stopAllByTarget(this.label.node);
    }

    setValue(value: number) {
        const reset = this._value > 0 && value === 0;
        this._value = value;
        this.label.string = value.toString();
        if (reset) this.bounce();
    }

    show() {
        Tween.stopAllByTarget(this._opacity);
        tween(this._opacity).to(0.25, { opacity: 255 }).start();
    }

    hide() {
        Tween.stopAllByTarget(this._opacity);
        tween(this._opacity).to(0.25, { opacity: 0 }).start();
    }

    private bounce() {
        const scale = this.label.node.scale.clone();
        Tween.stopAllByTarget(this.label.node);
        tween(this.label.node)
            .to(0.12, { scale: scale.clone().multiplyScalar(1.2) }, { easing: 'backOut' })
            .to(0.12, { scale }, { easing: 'backIn' })
            .start();
    }
}
