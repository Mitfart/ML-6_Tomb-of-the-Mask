import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayableCTA')
export class PlayableCTA extends Component {
    public static moloco() {
        console.log('CTA click');
        const fbPlayableAd = (window as any).FbPlayableAd;
        if (typeof fbPlayableAd !== "undefined" && typeof fbPlayableAd.onCTAClick === "function") {
            fbPlayableAd.onCTAClick();
        }
    }

    public static mintegral() {
        console.log('CTA click');
        if (typeof (window as any).install === "function") {
            (window as any).install && (window as any).install();
        }
        if (typeof (window as any).gameEnd === "function") {
            (window as any).gameEnd && (window as any).gameEnd();
        }
    }
}

