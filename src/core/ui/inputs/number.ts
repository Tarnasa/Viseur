import { Immutable } from "src/utils";
import { Event, events } from "ts-typed-events";
import { BaseInput, IBaseInputArgs } from "./base-input";

/** Arguments to initialize a number input. */
export interface INumberInputArgs extends IBaseInputArgs<number> {
    /** the minimum accepted number */
    min?: number;

    /** the maximum accepted number */
    max?: number;

    /** the number that values can change by */
    step?: number | "any";

    /** the numeric value */
    value?: number;
}

/** A text input for numbers. */
export class NumberInput extends BaseInput<number> {
    /** Events this class emits */
    public readonly events = events({
        /** Emitted when this input's value changes */
        changed: new Event<number>(),
    });

    /**
     * Initializes the Number Input.
     *
     * @param args - The initialization args, can have min, max, and step.
     */
    constructor(args: Readonly<INumberInputArgs>) {
        // tslint:disable-next-line:no-object-literal-type-assertion
        super(({
            value: 0,
            type: "number",
            ...args,
        }) as Immutable<INumberInputArgs>);

        this.setStep(args.step === undefined ? "any" : args.step);
        this.setMin(args.min);
        this.setMax(args.max);
    }

    // TODO: override set value and clamp numeric input

    /**
     * Sets the min attribute of this input
     * @param min the minimum value this number input can be
     */
    public setMin(min?: number): void {
        if (min !== undefined) {
            this.element.attr("min", min);

            if (this.value < min) {
                this.value = min;
            }
        }
        else {
            this.element.removeAttr("min");
        }
    }

    /**
     * Sets the max attribute of this input
     * @param max the maximum value this number input can be
     */
    public setMax(max?: number): void {
        if (max !== undefined) {
            this.element.attr("max", max);

            if (this.value > max) {
                this.value = max;
            }
        }
        else {
            this.element.removeAttr("min");
        }
    }

    /**
     * Sets the step attribute of this input.
     *
     * @param step - How much this number input increases/decreases
     * by for each increment.
     */
    public setStep(step?: number | "any"): void {
        this.element.attr("step", step === undefined
            ? "any"
            : step,
        );
    }
}
