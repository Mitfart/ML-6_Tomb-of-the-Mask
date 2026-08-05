import { _decorator, Color, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColorUtils')
export class ColorUtils extends Component {

    public static setSpriteColorRecursively(node: Node, color: Color): void {
        if (!node) return;

        const sprites = node.getComponentsInChildren(Sprite);
        for (const sprite of sprites) {
            sprite.color = color;
        }
    }
}

