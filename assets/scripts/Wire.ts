import { _decorator, Component, Node, Color, tween } from 'cc';
import { ElectricityEffect } from './ElectricityEffect';
const { ccclass } = _decorator;

@ccclass('Wire')
export class Wire extends Component {
    private _scheduled: (() => void)[] = [];

    public activate(duration: number): void {
        this._cancelAll();

        this.getComponent(ElectricityEffect).activate(duration);

        const groups: { comp: any }[][] = [];
        const directChildren = this.node.children;

        for (const child of directChildren) {
            // Prevent the wire from accidentally processing nodes created by the electricity effect
            if (child.name === 'ElectricityGfx' || child.name.startsWith('Spark')) {
                continue;
            }

            const comps: { comp: any }[] = [];
            this._collectComps(child, comps);
            groups.push(comps);
        }

        const count = groups.length;
        if (count === 0) return;

        if (duration <= 0 || count === 1) {
            for (const group of groups) {
                for (const item of group) {
                    item.comp.color = Color.WHITE;
                }
            }
            return;
        }

        const interval = duration / (count - 1);

        for (let i = 0; i < count; i++) {
            const group = groups[i];
            const delay = i * interval;
            const callback = () => {
                for (const item of group) {
                    item.comp.color = Color.WHITE;
                }
            };
            this._scheduled.push(callback);
            this.scheduleOnce(callback, delay);
        }
    }

    private _collectComps(node: Node, out: { comp: any }[]): void {
        for (const comp of node.components) {
            if (comp['color'] instanceof Color) {
                out.push({ comp });
            }
        }
        for (const child of node.children) {
            this._collectComps(child, out);
        }
    }

    private _cancelAll(): void {
        for (const cb of this._scheduled) {
            this.unschedule(cb);
        }
        this._scheduled = [];
    }

    onDestroy(): void {
        this._cancelAll();
    }
}