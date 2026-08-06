import { _decorator, Component, Node, Sprite, SpriteFrame, UIOpacity, tween, v3, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ParticleEmitter')
export class ParticleEmitter extends Component {
    @property({ type: SpriteFrame })
    texture: SpriteFrame | null = null;

    @property
    spawnRate: number = 8;

    @property
    speed: number = 300;

    @property
    lifetime: number = 1.5;

    @property
    size: number = 15;

    @property
    spawnRadius: number = 50;

    @property
    finalScaleMultiplier: number = 0.3;

    @property({ type: Color })
    color1: Color = new Color(255, 200, 0, 255);

    @property({ type: Color })
    color2: Color = new Color(255, 50, 0, 255);

    @property
    blinkInterval: number = 0.15;

    private _spawnTimer: number = 0;

    start() {
        if (!this.texture) {
            console.warn("Texture is not set in ParticleEmitter");
        }
    }

    update(deltaTime: number) {
        if (!this.texture) return;
        this._spawnTimer += deltaTime;
        const spawnInterval = 1 / this.spawnRate;
        while (this._spawnTimer >= spawnInterval) {
            this._spawnTimer -= spawnInterval;
            this.spawnParticle();
        }
    }

    private spawnParticle() {
        const particleNode = new Node("Particle");
        this.node.addChild(particleNode);

        const sprite = particleNode.addComponent(Sprite);
        sprite.spriteFrame = this.texture;

        const uiOpacity = particleNode.addComponent(UIOpacity);
        uiOpacity.opacity = 255;

        const offsetX = (Math.random() - 0.5) * this.spawnRadius;
        particleNode.position = v3(offsetX, 0, 0);

        const initialScale = this.size / 100;
        const finalScale = initialScale * this.finalScaleMultiplier;
        particleNode.scale = v3(initialScale, initialScale, 1);

        const blinkCycles = Math.floor(this.lifetime / (this.blinkInterval * 2));

        const blinkTween = tween(sprite)
            .call(() => { sprite.color = this.color1; })
            .delay(this.blinkInterval)
            .call(() => { sprite.color = this.color2; })
            .delay(this.blinkInterval)
            .union()
            .repeat(blinkCycles);

        tween(particleNode)
            .parallel(
                tween(particleNode).by(this.lifetime, { position: v3(0, this.speed * this.lifetime, 0) }),
                tween(particleNode).to(this.lifetime, { scale: v3(finalScale, finalScale, 1) }),
                tween(uiOpacity).to(this.lifetime, { opacity: 0 }),
                blinkTween
            )
            .call(() => {
                particleNode.destroy();
            })
            .start();
    }
}