import { Node, UIOpacity, tween } from 'cc';

/**
 * Blinks a node's opacity (highlight) a given number of times, then restores it.
 * UIOpacity affects the whole subtree, so this works on containers like Tunnel/Lever.
 */
export function pulseHighlight(node: Node, blinks: number = 2, onDone?: () => void): void {
    if (!node || !node.isValid) return;

    let op = node.getComponent(UIOpacity);
    if (!op) {
        op = node.addComponent(UIOpacity);
        op.opacity = 255;
    }

    const baseScale = node.scale.clone();
    const base = op.opacity;
    op.opacity = base;

    const seq = tween(op);
    for (let i = 0; i < blinks; i++) {
        seq.to(0.2, { opacity: 60 })
            .call(() => { tween(node).to(0.2, { scale: baseScale.clone().multiplyScalar(1.1) }).start(); });
        seq.to(0.2, { opacity: base })
            .call(() => { tween(node).to(0.2, { scale: baseScale }).start(); });
    }
    seq.call(() => { onDone?.(); }).start();
}
