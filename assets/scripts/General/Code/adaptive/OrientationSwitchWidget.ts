import { _decorator, Widget, log, Node, Vec3, view, CCFloat, CCBoolean } from 'cc';
import { OrientationSwitch } from './OrientationSwitch';
const { ccclass, property } = _decorator;

@ccclass('OrientationSwitchWidget')
export class OrientationSwitchWidget extends OrientationSwitch {
    @property(Widget) widget: Widget;

    @property(CCBoolean) setForPortrait: boolean = false;
    @property(CCFloat) left: number = 0;
    @property(CCFloat) right: number = 0;
    @property(CCFloat) top: number = 0;
    @property(CCFloat) bottom: number = 0;

    private _initLeft: number = 0;
    private _initRight: number = 0;
    private _initTop: number = 0;
    private _initBottom: number = 0;

    protected onLoad(): void {
        this._initLeft = this.widget.left;
        this._initRight = this.widget.right;
        this._initTop = this.widget.top;
        this._initBottom = this.widget.bottom;

        super.onLoad();
    }

    protected applyOrientation(isPortrait: boolean): void {
        if (this.setForPortrait == isPortrait) {
            this.widget.left = this.left;
            this.widget.right = this.right;
            this.widget.top = this.top;
            this.widget.bottom = this.bottom;
        } else {
            this.widget.left = this._initLeft;
            this.widget.right = this._initRight;
            this.widget.top = this._initTop;
            this.widget.bottom = this._initBottom;
        }
        this.widget.updateAlignment();
    }
}