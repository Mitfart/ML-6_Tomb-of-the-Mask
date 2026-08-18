import { _decorator, Camera, Node, screen } from 'cc';
import { StickToScreenBottom } from './StickToScreenBottom';
import { OrientationSwitch } from './General/Code/adaptive/OrientationSwitch';

const { ccclass, property } = _decorator;

@ccclass('OrientationSwitcher')
export class OrientationSwitcher extends OrientationSwitch {
    static instance: OrientationSwitcher;

    @property(Camera)
    camera: Camera = null!;

    @property(Node)
    panel: Node = null!;

    protected onLoad(): void {
        OrientationSwitcher.instance = this;
        super.onLoad();
    }

    protected applyOrientation(isPortrait: boolean): void {
        const { width, height } = screen.resolution;
        const ratio = Math.max(width, height) / Math.min(width, height);

        const isFourByThreeOrBigger = ratio <= 1.4;
        
        const panelScale = 
            isPortrait && isFourByThreeOrBigger ? 1.9 
            : isPortrait ? 1.6 
            : 1.3;

        this.camera.orthoHeight = isPortrait
            ? isFourByThreeOrBigger ? 1000 : 1500
            : isFourByThreeOrBigger ? 1000 : 800;
        this.panel.setScale(panelScale, panelScale);
    }
}
