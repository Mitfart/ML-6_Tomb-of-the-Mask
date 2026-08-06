import { _decorator, Component, Camera, Vec3, screen } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StickToScreenBottom')
export class StickToScreenBottom extends Component {

    @property({ type: Camera })
    targetCamera: Camera | null = null;

    @property({ tooltip: 'Distance from bottom edge in world units' })
    bottomOffset: number = 0;

    @property({ tooltip: 'Align to right edge instead of horizontal center' })
    alignToRight: boolean = false;

    @property({ tooltip: 'Distance from right edge in world units (only when alignToRight is true)' })
    rightOffset: number = 0;

    private _targetPos = new Vec3();

    start() {
        if (!this.targetCamera) {
            const scene = this.node.scene;
            if (scene) {
                const cameras = scene.getComponentsInChildren(Camera);
                this.targetCamera = cameras.find(cam => cam.node.name === 'Main Camera') || cameras[0];
            }
        }
    }

    update() {
        if (!this.targetCamera) return;

        const cam = this.targetCamera;
        const camPos = cam.node.worldPosition;
        const orthoHeight = cam.orthoHeight;
        const size = screen.windowSize;
        const aspect = size.width / size.height;

        let x = camPos.x;
        if (this.alignToRight) {
            x = camPos.x + orthoHeight * aspect - this.rightOffset;
        }

        this._targetPos.set(
            x,
            camPos.y - orthoHeight + this.bottomOffset,
            camPos.z
        );

        this.node.worldPosition = this._targetPos;
    }
}