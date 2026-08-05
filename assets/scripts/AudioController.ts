import { _decorator, AudioSource, Component, Node, Sprite, Button, SpriteFrame, AudioClip, Tween, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioController')
export class AudioController extends Component {

    public static instance: AudioController;

    //@property(Button) muteButton: Button;
    //@property(SpriteFrame) mutedSprite: SpriteFrame;
    //@property(SpriteFrame) unmutedSprite: SpriteFrame;

    muted: boolean = false;

    onLoad() {
        AudioController.instance = this;
    }

    onEnable() {
        //this.muteButton.node.on(Button.EventType.CLICK, () => this.onMuteButtonClick());
    }
    onDisable() {
        //this.muteButton.node.off(Button.EventType.CLICK);
    }

    playSound(name: string, fadeIn: boolean = false, time: number = 0.5) {
        if (this.muted == false) {
            let sound = this.node.getChildByName(name).getComponent(AudioSource);
            let vol = sound.volume;
            if (fadeIn) {
                let tweenTarget = { value: sound.volume };
                let toTarget = vol;

                sound.volume = 0;
                sound.play();
                const tw: Tween = tween(tweenTarget)
                    .to(time, { value: toTarget }, {
                        onUpdate: () => {
                            if (!sound) { tw.destroySelf(); return; }

                            toTarget = tweenTarget.value;
                            sound.volume = tweenTarget.value;
                        },
                    })
                    .start();
            }
            else {
                sound.play();
            }
            
        }
    }

    stopSound(name: string, fadeOut: boolean = false, time: number = 0.5) {
        let sound = this.node.getChildByName(name).getComponent(AudioSource);

        if (sound.playing == false) {
            return;
        }

        let vol = sound.volume;
        if (fadeOut) {
            let tweenTarget = { value: sound.volume };
            let toTarget = 0;

            const tw: Tween = tween(tweenTarget)
                .to(time, { value: toTarget }, {
                    onUpdate: () => {
                        if (!sound) { tw.destroySelf(); return; }

                        toTarget = tweenTarget.value;
                        sound.volume = tweenTarget.value;
                    },
                    onComplete() {
                        sound.stop();
                        sound.volume = vol;
                    },
                })
                .start();
        }
        else {
            sound.stop();
        }
    }

    playSoundOneShot(name: string, volume: number = 1) {
        if (this.muted == false) {
            let sound: AudioClip = this.node.getChildByName(name).getComponent(AudioSource).clip;
            this.node.getChildByName(name).getComponent(AudioSource).playOneShot(sound, volume);
        }
    }

    stopAll() {
        for (let sound of this.node.children) {
            if (sound.name !== "Music") {
                sound.getComponent(AudioSource).stop();
            }
        }
    }

    //onMuteButtonClick() {
    //    if (this.muted) {
    //        this.muted = false;
    //        this.muteButton.getComponent(Sprite).spriteFrame = this.unmutedSprite;
    //    }
    //    else {
    //        this.muted = true;
    //        for (let sound of this.node.children) {
    //            sound.getComponent(AudioSource).stop();
    //        }
    //        this.muteButton.getComponent(Sprite).spriteFrame = this.mutedSprite;
    //    }
    //}
}


