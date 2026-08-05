import { _decorator, Component, Node, Vec3, Color, Graphics, tween, UIOpacity, Tween, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ElectricityEffect')
export class ElectricityEffect extends Component {
    @property({ type: CCInteger, tooltip: "Size of the square spark core (in pixels)" })
    public sparkSize: number = 6;

    @property({ type: CCInteger, tooltip: "Radius of the glowing aura (in pixels)" })
    public glowSize: number = 20;

    @property({ type: CCInteger, tooltip: "Brightness/Opacity of the glow aura (0-255)" })
    public glowIntensity: number = 120;

    @property({ type: CCInteger, tooltip: "Number of sparks spawned per burst" })
    public sparkCount: number = 12;

    @property({ type: CCInteger, tooltip: "Maximum distance sparks fly outwards" })
    public sparkDistance: number = 40;

    @property({ type: CCInteger, tooltip: "Time it takes for sparks to fade out (in ms)" })
    public fadeMs: number = 250;

    private _positions: Vec3[] = [];
    private _scheduledTasks: Function[] = [];
    private _sparkNodes: Node[] = [];

    public activate(duration: number): void {
        this._cancelAll();
        this._clearSparkNodes();

        const children = this.node.children;
        if (children.length < 2) return;

        const positions: Vec3[] = [];
        for (const child of children) {
            positions.push(child.worldPosition.clone());
        }
        this._positions = positions;

        const steps = children.length - 1;
        if (steps === 0) return;
        const interval = duration / steps;

        let currentHead = 0;
        const stepCallback = () => {
            if (currentHead >= this._positions.length) {
                this._cancelAll();
                return;
            }

            const headPos = this._positions[currentHead];
            this._emitSparks(headPos);

            currentHead++;
            if (currentHead >= children.length) {
                this.scheduleOnce(() => this._cancelAll(), 0.3);
            }
        };

        stepCallback();
        for (let i = 1; i < children.length; i++) {
            const cb = () => stepCallback();
            this._scheduledTasks.push(cb);
            this.scheduleOnce(cb, interval * i);
        }
    }

    private _emitSparks(position: Vec3): void {
        if (!position) return;

        for (let i = 0; i < this.sparkCount; i++) {
            const sparkNode = new Node("Spark");
            sparkNode.parent = this.node;
            sparkNode.worldPosition = position.clone();

            const gfx = sparkNode.addComponent(Graphics);

            // --- Procedural Radial Glow ---
            const steps = 8;
            for (let s = steps; s >= 0; s--) {
                const t = s / steps;
                const radius = this.glowSize * t;
                // Alpha drops off as the circle gets bigger
                const alpha = Math.floor(this.glowIntensity * t);

                gfx.fillColor = new Color(0, 180 + (75 * t), 255, alpha);
                gfx.circle(0, 0, radius);
                gfx.fill();
            }

            // --- Sharp 8-bit Square Core ---
            gfx.fillColor = Color.WHITE;
            const halfSize = this.sparkSize / 2;
            gfx.rect(-halfSize, -halfSize, this.sparkSize, this.sparkSize);
            gfx.fill();

            const uiOpacity = sparkNode.addComponent(UIOpacity);
            uiOpacity.opacity = 255;

            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * this.sparkDistance;
            const targetPos = new Vec3(
                Math.cos(angle) * distance,
                Math.sin(angle) * distance,
                0
            );

            tween(sparkNode)
                .parallel(
                    tween(sparkNode).by(0.15, { position: targetPos }),
                    tween(sparkNode).to(0.15, { scale: new Vec3(0.3, 0.3, 1) }),
                    tween(uiOpacity).to(this.fadeMs / 1000, { opacity: 0 })
                )
                .call(() => {
                    sparkNode.destroy();
                })
                .start();

            this._sparkNodes.push(sparkNode);
        }
    }

    private _clearSparkNodes(): void {
        for (const node of this._sparkNodes) {
            if (node && node.isValid) {
                Tween.stopAllByTarget(node);
                node.destroy();
            }
        }
        this._sparkNodes = [];
    }

    private _cancelAll(): void {
        for (const cb of this._scheduledTasks) {
            this.unschedule(cb);
        }
        this._scheduledTasks = [];
        this._clearSparkNodes();
    }

    onDestroy(): void {
        this._cancelAll();
    }
}