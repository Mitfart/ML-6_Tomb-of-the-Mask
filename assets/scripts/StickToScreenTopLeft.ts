import { _decorator, Camera, Component, screen, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StickToScreenTopLeft')
export class StickToScreenTopLeft extends Component {
    @property(Camera) targetCamera: Camera = null!;
    @property({ tooltip: 'Distance from the left edge' }) horizontalGap: number = 100;
    @property({ tooltip: 'Distance from the top edge' }) verticalGap: number = 100;

    private _position = new Vec3();

    update() {
        const cameraPosition = this.targetCamera.node.worldPosition;
        const halfWidth = this.targetCamera.orthoHeight * screen.windowSize.width / screen.windowSize.height;
        const transform = this.getComponent(UITransform)!;

        this._position.set(
            cameraPosition.x - halfWidth + this.horizontalGap + transform.width * transform.anchorX,
            cameraPosition.y + this.targetCamera.orthoHeight - this.verticalGap - transform.height * (1 - transform.anchorY),
            cameraPosition.z
        );
        this.node.worldPosition = this._position;
    }
}
