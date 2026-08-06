import { _decorator, Component } from 'cc';
import { AudioController } from './AudioController';
const { ccclass } = _decorator;

@ccclass('Gem')
export class Gem extends Component {
    collect() {
        AudioController.instance.playSoundOneShot("Gem");
        this.node.destroy();
    }
}