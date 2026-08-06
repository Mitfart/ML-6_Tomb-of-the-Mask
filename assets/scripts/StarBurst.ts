import { _decorator, Component, Node, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StarBurst')
export class StarBurst extends Component {
    @property({ type: [SpriteFrame] })
    frames: SpriteFrame[] = [];

    play() {
        this.node.children.forEach((star, i) => {
            if (i >= 3) return;
            this.scheduleOnce(() => this.animate(star), i * 0.2);
        });
    }

    private animate(star: Node) {
        const sprite = star.getComponent(Sprite);
        if (!sprite || this.frames.length === 0) return;
        star.setScale(0.01, 0.01, 1);
        tween(star).to(0.25, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' }).start();
        let f = 0;
        const step = () => {
            sprite.spriteFrame = this.frames[f++];
            if (f < this.frames.length) this.scheduleOnce(step, 0.05);
        };
        step();
    }
}
