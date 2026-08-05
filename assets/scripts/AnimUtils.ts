import { _decorator, Color, Component, Label, Node, Quat, Sprite, SpriteFrame, Tween, tween, TweenEasing, UIOpacity, UITransform, Vec3 } from 'cc';
//import { HtmlManager } from './HtmlManager';
const { ccclass, property } = _decorator;

export const enum AnimationInterpolation {
    LINEAR = "linear",
    CUBIC_IN_OUT = "cubicInOut",
    BOUNCE_IN_OUT = "bounceInOut",
    BOUNCE_IN = "bounceIn",
    BOUNCE_OUT = "bounceOut",
    ELASTIC_IN_OUT = "elasticInOut",
}

@ccclass('AnimUtils')
export class AnimUtils extends Component {
    public static animateScale(node: Node, to: Vec3, time: number, onCompleteFunc: Function = () => {}, easing: TweenEasing = AnimationInterpolation.CUBIC_IN_OUT): void {
        if (!node) return;

        let tweenTarget = { value: node.scale };
        let toTarget = to;

        const tw: Tween = tween(tweenTarget)
            .to(time, { value: toTarget }, { easing: easing,
                onUpdate: () => {
                    if (!node?.scale) { tw.destroySelf(); return; }

                    toTarget = tweenTarget.value;
                    node.scale = tweenTarget.value;
                },
                onComplete() {
                    onCompleteFunc();
                },
            })
            .start();
    }

    public static animateRotation2D(node: Node, to: number, time: number, onCompleteFunc: Function = () => { }, easing: TweenEasing = AnimationInterpolation.CUBIC_IN_OUT): void {
        if (!node) return;

        const startAngle = node.eulerAngles.z;
        const targetAngle = to;

        const tweenTarget = { value: startAngle };

        const tw = tween(tweenTarget)
            .to(time, { value: targetAngle }, {
                easing: easing,
                onUpdate: () => {
                    if (!node) { tw.destroySelf(); return; }
                    node.eulerAngles = new Vec3(node.eulerAngles.x, node.eulerAngles.y, tweenTarget.value);
                },
                onComplete: () => {
                    onCompleteFunc();
                }
            })
            .start();
    }

    public static animatePosition(node: Node, to: Vec3, time: number, onCompleteFunc: Function = () => {}, easing: TweenEasing = AnimationInterpolation.CUBIC_IN_OUT): void {
        if (!node) return;

        let tweenTarget = { value: node.position };
        let toTarget = to;

        const tw = tween(tweenTarget)
            .to(time, { value: toTarget }, { easing: easing,
                onUpdate: () => {
                    if (!node?.position) { tw.destroySelf(); return; }

                    toTarget = tweenTarget.value;
                    node.position = tweenTarget.value;
                },
                onComplete() {
                    onCompleteFunc();
                },
            })
            .start();
    }

    public static animateWorldPosition(node: Node, to: Vec3, time: number, onCompleteFunc: Function = () => { }, easing: TweenEasing = AnimationInterpolation.CUBIC_IN_OUT): void {
        if (!node) return;

        let tweenTarget = { value: node.worldPosition };
        let toTarget = to;

        const tw = tween(tweenTarget)
            .to(time, { value: toTarget }, {
                easing: easing,
                onUpdate: () => {
                    if (!node?.worldPosition) { tw.destroySelf(); return; }

                    toTarget = tweenTarget.value;
                    node.worldPosition = tweenTarget.value;
                },
                onComplete() {
                    onCompleteFunc();
                },
            })
            .start();
    }

    public static animateTransparency(node: Node, to: number, time: number, onCompleteFunc: Function = () => {}, easing: TweenEasing = AnimationInterpolation.LINEAR): void {
        if (!node?.getComponent(Sprite)) throw new TypeError("There's no Sprite Component");

        const sprite: Sprite = node.getComponent(Sprite);

        if (to < 0) { to = 0; }
        if (to > 255) { to = 255; }

        let tweenTarget = { value: sprite.color.a };
        let toTarget = to;

        tween(tweenTarget)
            .to(time, { value: toTarget }, { easing: easing,
                onUpdate: () => {
                    if (!node) return;

                    toTarget = tweenTarget.value;
                    sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, tweenTarget.value);
                },
                onComplete() {
                    onCompleteFunc();
                },
            })
            .start();
    }

    public static animateOpacity(node: Node, to: number, time: number, onCompleteFunc: Function = () => { }, easing: TweenEasing = AnimationInterpolation.LINEAR): void {
        if (!node?.getComponent(UIOpacity)) throw new TypeError("There's no UIOpacity Component");

        if (to < 0) { to = 0; }
        if (to > 255) { to = 255; }

        let tweenTarget = { value: node.getComponent(UIOpacity).opacity };
        let toTarget = to;

        tween(tweenTarget)
            .to(time, { value: toTarget }, {
                easing: easing,
                onUpdate: () => {
                    if (!node) return;

                    toTarget = tweenTarget.value;
                    node.getComponent(UIOpacity).opacity = tweenTarget.value;
                },
                onComplete() {
                    onCompleteFunc();
                },
            })
            .start();
    }

    //public static animateBalance(target: Label, from: number, to: number, time: number, ending: string = "", onCompleteFunc: Function = () => { }): void {
    //    const tweenTarget = { value: from };
    //
    //    let start = "";
    //
    //    if (HtmlManager.left) {
    //        start = ending;
    //        ending = "";
    //    }
    //
    //    tween(tweenTarget)
    //        .to(time, { value: to }, {
    //            onUpdate: () => {
    //                if (!target) return;
    //
    //                to = Math.floor(tweenTarget.value);
    //                target.string = start + to.toLocaleString(HtmlManager.locale) + ending;
    //            },
    //            onComplete() {
    //                let fin = Math.round(tweenTarget.value * 2) / 2;
    //                target.string = start + fin.toLocaleString(HtmlManager.locale) + ending;
    //                onCompleteFunc();
    //            },
    //        })
    //        .start();
    //}

    public static swapSprites(nodes: Node[], sprite: SpriteFrame) {
        nodes.forEach(node => {
            node.getChildByName("Sprite").getComponent(Sprite).spriteFrame = sprite;
            node.getChildByName("Sprite").getComponent(UITransform).setContentSize(64, 64);
        });
    }
}


