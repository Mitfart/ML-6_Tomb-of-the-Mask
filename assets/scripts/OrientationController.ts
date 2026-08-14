import { _decorator, Camera, Component, Node, view, game, sys, math, Vec3, UITransform, ResolutionPolicy, Animation, Widget, WidgetComponent, Vec2, Label, HorizontalTextAlignment } from 'cc';
import { Room } from './Room';
import { StickToScreenBottom } from './StickToScreenBottom';
const { Quat } = math;
const { ccclass, property } = _decorator;

@ccclass('OrientationSwitcher')
export class OrientationSwitcher extends Component {
    static instance: OrientationSwitcher;

    @property(Camera)
    camera: Camera = null!;

    @property(Node)
    panel: Node;
    @property(StickToScreenBottom)
    button: StickToScreenBottom;

    lastIsPortrait: boolean = false;
    private _hasInitialized: boolean = false;

    is169: boolean;
    is169_2: boolean;
    is43: boolean;
    isIpad: boolean;
    is1610: boolean;
    is2: boolean;
    is3: boolean;
    is4: boolean;
    is15: boolean;
    isIphone14Pro: boolean;
    is1: boolean;
    isZFold: boolean;

    onLoad() {
        OrientationSwitcher.instance = this;
        this.scheduleOnce(() => {
            this.lastIsPortrait = this.isPortrait();
            this.applyOrientation(this.lastIsPortrait);
            this._hasInitialized = true;
        }, 0); 
    }

    update() {
        if (!this._hasInitialized) return;

        const currentIsPortrait = this.isPortrait();
        if (currentIsPortrait !== this.lastIsPortrait) {
            this.applyOrientation(currentIsPortrait);
            this.lastIsPortrait = currentIsPortrait;
        }

        this.camera.orthoHeight = currentIsPortrait ? this.is43 ? 1200 : 1500 : this.is43 ? 900 : 800;
        //this.camera.orthoHeight = currentIsPortrait ? this.portraitHeight : this.landscapeHeight;
    }

    isPortrait(): boolean {
        // ���-��������� � ���� �������� DOM canvas
        if (sys.isBrowser) {
            const canvas = game.canvas as HTMLCanvasElement;
            const width = canvas?.clientWidth ?? 0;
            const height = canvas?.clientHeight ?? 0;

            // fallback, ���� canvas �� ������� ��� ������� �������
            if (width === 0 || height === 0) {
                const visibleSize = view.getVisibleSize();
                return visibleSize.height >= visibleSize.width;
            }

            if (height < width) {
                this.is1 = width / height <= 1.3;
                this.is43 = (width / height > 1.3) && (width / height <= 1.4);
                this.isIpad = (width / height > 1.4) && (width / height <= 1.47);
                this.is15 = (width / height > 1.47) && (width / height <= 1.53);
                this.is1610 = (width / height > 1.53) && (width / height <= 1.65);
                this.is3 = (width / height > 1.65) && (width / height <= 1.74);
                this.is169 = (width / height > 1.74) && (width / height <= 1.78);
                this.is169_2 = (width / height > 1.78) && (width / height <= 1.85);
                this.is4 = (width / height > 1.85) && (width / height <= 1.95);
                this.is2 = (width / height > 1.95) && (width / height <= 2.10);
                this.isIphone14Pro = (width / height > 2.16) && (width / height <= 2.17);
                this.isZFold = (width / height > 2.4);
            }
            else {
                this.is1 = height / width <= 1.3;
                this.is43 = (height / width > 1.3) && (height / width <= 1.4);
                this.isIpad = (height / width > 1.4) && (height / width <= 1.47);
                this.is15 = (height / width > 1.47) && (height / width <= 1.53);
                this.is1610 = (height / width > 1.53) && (height / width <= 1.65);
                this.is3 = (height / width > 1.65) && (height / width <= 1.74);
                this.is169 = (height / width > 1.74) && (height / width <= 1.78);
                this.is169_2 = (height / width > 1.78) && (height / width <= 1.85);
                this.is4 = (height / width > 1.85) && (height / width <= 1.95);
                this.is2 = (height / width > 1.95) && (height / width <= 2.10);
                this.isIphone14Pro = (height / width > 2.16) && (height / width <= 2.17);
                this.isZFold = (height / width > 2.4);
            }
            return height >= width;
        }


        // ����� ��� ���������
        const visibleSize = view.getVisibleSize();

        if (visibleSize.height < visibleSize.width) {
            this.is1 = visibleSize.width / visibleSize.height <= 1.4;
            this.is43 = (visibleSize.width / visibleSize.height > 1.3) && (visibleSize.width / visibleSize.height <= 1.4);
            this.isIpad = (visibleSize.width / visibleSize.height > 1.4) && (visibleSize.width / visibleSize.height <= 1.47);
            this.is15 = (visibleSize.width / visibleSize.height > 1.47) && (visibleSize.width / visibleSize.height <= 1.53);
            this.is1610 = (visibleSize.width / visibleSize.height > 1.53) && (visibleSize.width / visibleSize.height <= 1.65);
            this.is3 = (visibleSize.width / visibleSize.height > 1.65) && (visibleSize.width / visibleSize.height <= 1.74);
            this.is169 = (visibleSize.width / visibleSize.height > 1.74) && (visibleSize.width / visibleSize.height <= 1.78);
            this.is169_2 = (visibleSize.width / visibleSize.height > 1.78) && (visibleSize.width / visibleSize.height <= 1.85);
            this.is4 = (visibleSize.width / visibleSize.height > 1.85) && (visibleSize.width / visibleSize.height <= 1.95);
            this.is2 = (visibleSize.width / visibleSize.height > 1.95) && (visibleSize.width / visibleSize.height <= 2.10);
            this.isIphone14Pro = (visibleSize.width / visibleSize.height > 2.16) && (visibleSize.width / visibleSize.height <= 2.17);
            this.isZFold = (visibleSize.width / visibleSize.height > 2.4);
        }
        else {
            this.is1 = visibleSize.height / visibleSize.width <= 1.3;
            this.is43 = (visibleSize.height / visibleSize.width > 1.3) && (visibleSize.height / visibleSize.width <= 1.4);
            this.isIpad = (visibleSize.height / visibleSize.width > 1.4) && (visibleSize.height / visibleSize.width <= 1.47);
            this.is15 = (visibleSize.height / visibleSize.width > 1.47) && (visibleSize.height / visibleSize.width <= 1.53);
            this.is1610 = (visibleSize.height / visibleSize.width > 1.53) && (visibleSize.height / visibleSize.width <= 1.65);
            this.is3 = (visibleSize.height / visibleSize.width > 1.65) && (visibleSize.height / visibleSize.width <= 1.74);
            this.is169 = (visibleSize.height / visibleSize.width > 1.74) && (visibleSize.height / visibleSize.width <= 1.78);
            this.is169_2 = (visibleSize.height / visibleSize.width > 1.78) && (visibleSize.height / visibleSize.width <= 1.85);
            this.is4 = (visibleSize.height / visibleSize.width > 1.85) && (visibleSize.height / visibleSize.width <= 1.95);
            this.is2 = (visibleSize.height / visibleSize.width > 1.95) && (visibleSize.height / visibleSize.width <= 2.10);
            this.isIphone14Pro = (visibleSize.height / visibleSize.width > 2.16) && (visibleSize.height / visibleSize.width <= 2.17);
            this.isZFold = (visibleSize.height / visibleSize.width > 2.4);
        }
        return visibleSize.height >= visibleSize.width;
    }

    public applyOrientation(isPortrait: boolean): void {
        if (!this.camera) {
            console.error("Camera is not assigned!");
            return;
        }
        //this.key.setOrtho();

        let panelScale = 1.6;
        let buttonScale = 0.8;

        if (isPortrait) {
            if (this.is169 || this.is169_2 || this.is1610) {
                panelScale = 1.8;
                buttonScale = 1;
            }
            if (this.isIpad || this.is15 || this.is43) {
                panelScale = 1.9;
                buttonScale = 1.2;
            }
            this.button.alignToRight = false;
        }
        else {
            panelScale = 1.3;
            this.button.alignToRight = true;
            if (this.isIpad || this.is15 || this.is43) {
                buttonScale = 0.6;
            }
        }

        this.panel.setScale(panelScale, panelScale);
        this.button.node.setScale(buttonScale, buttonScale);
        //panel.setPosition(panelX, panelY);

    }
}



