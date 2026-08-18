import { _decorator, CCBoolean, CCFloat, Component, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Follow2D')
export class Follow2D extends Component {
    @property(Node) private target: Node | null = null;
    @property(Vec3) public offset = new Vec3();
    @property(CCBoolean) public blockX = true;
    @property(CCBoolean) public blockY = false;
    @property(CCBoolean) public smoothFollow = true;
    @property({ type: CCFloat, visible() { return this.smoothFollow; } }) public followSpeed = 10;
    @property({ type: CCFloat, min: 0, visible() { return this.smoothFollow; } }) public lookAheadSeconds = 0.18;
    @property({ type: CCFloat, min: 0, visible() { return this.smoothFollow; } }) public maxLookAhead = 180;
    @property({ type: CCFloat, min: 0, visible() { return this.smoothFollow; } }) public velocityResponse = 8;

    private targetPosition = new Vec3();
    private previousTargetPosition = new Vec3();
    private position = new Vec3();
    private velocity = new Vec3();
    private prediction = new Vec3();
    private desiredPosition = new Vec3();
    private lockedPosition = new Vec3();
    private initialized = false;

    protected start(): void {
        this.setTarget(this.target);
    }

    public setTarget(newTarget: Node | null, worldPosition: Vec3 | null = null): void {
        if (this.initialized && newTarget && newTarget === this.target) return;
        this.target = newTarget;
        this.initialized = true;
        this.node.getWorldPosition(this.lockedPosition);
        if (newTarget) newTarget.getWorldPosition(this.targetPosition);
        else if (worldPosition) this.targetPosition.set(worldPosition);
        else this.node.getWorldPosition(this.targetPosition);
        this.previousTargetPosition.set(this.targetPosition);
        this.velocity.set(Vec3.ZERO);
        this.position.set(this.targetPosition).add(this.offset);
        if (this.blockX) this.position.x = this.lockedPosition.x;
        if (this.blockY) this.position.y = this.lockedPosition.y;
        this.node.setWorldPosition(this.position);
    }

    protected lateUpdate(deltaTime: number): void {
        if (this.target?.isValid) this.target.getWorldPosition(this.targetPosition);
        if (!this.smoothFollow) {
            this.position.set(this.targetPosition).add(this.offset);
            if (this.blockX) this.position.x = this.lockedPosition.x;
            if (this.blockY) this.position.y = this.lockedPosition.y;
            this.node.setWorldPosition(this.position);
            this.previousTargetPosition.set(this.targetPosition);
            return;
        }

        if (deltaTime > 0) {
            Vec3.subtract(this.prediction, this.targetPosition, this.previousTargetPosition).multiplyScalar(1 / deltaTime);
            Vec3.lerp(this.velocity, this.velocity, this.prediction, 1 - Math.exp(-Math.min(6, this.velocityResponse) * deltaTime));
        }
        this.previousTargetPosition.set(this.targetPosition);
        this.prediction.set(this.velocity).multiplyScalar(Math.min(0.2, this.lookAheadSeconds));
        const predictionLength = this.prediction.length();
        const maxPrediction = Math.min(180, this.maxLookAhead);
        if (predictionLength > maxPrediction && predictionLength > 0) this.prediction.multiplyScalar(maxPrediction / predictionLength);
        if (this.blockX) this.prediction.x = 0;
        if (this.blockY) this.prediction.y = 0;

        this.desiredPosition.set(this.targetPosition).add(this.offset);
        if (this.blockX) this.desiredPosition.x = this.lockedPosition.x;
        if (this.blockY) this.desiredPosition.y = this.lockedPosition.y;
        const response = Math.max(8, Math.min(10, this.followSpeed));
        Vec3.lerp(this.position, this.position, this.desiredPosition, 1 - Math.exp(-response * deltaTime));
        this.desiredPosition.set(this.position).add(this.prediction);
        this.node.setWorldPosition(this.desiredPosition);
    }
}
