import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ValueCarrier')
export class ValueCarrier extends Component {
    @property value: number = 0;
    @property(Label) valueLabel: Label = null!;

    start() {
        this.updateLabel();
    }

    add(amount: number) {
        this.value += amount;
        this.updateLabel();
    }

    private updateLabel() {
        if (this.valueLabel) {
            this.valueLabel.string = this.value.toString();
        }
    }

    reset() {
        this.value = 10;
        this.updateLabel();
    }
}