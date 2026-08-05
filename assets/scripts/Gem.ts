import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('Gem')
export class Gem extends Component {
    collect() {
        this.node.destroy();
    }
}