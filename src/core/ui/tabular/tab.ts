import partial from "src/core/partial";
import { Event, events } from "ts-typed-events";
import { BaseElement, IBaseElementArgs } from "../base-element";
import { Tabular } from "./tabular";

export interface ITabArgs extends IBaseElementArgs {
    /** The tabular this tab is to be a part of */
    tabular: Tabular;
}

export class Tab extends BaseElement {
    /** The events this class emits */
    public readonly events = events({
        /** Emitted when this tab's tab is selected */
        selected: new Event<undefined>(),
    });

    /** The clickable tab that shows the content in the tabular */
    public readonly tab: JQuery<HTMLElement>;

    /** The content wrapper around the element */
    public readonly content: JQuery<HTMLElement>;

    /** The tabular this is a part of */
    public readonly tabular: Tabular;

    /** The title of the tab */
    public get title(): string {
        return "TAB_TITLE";
    }

    constructor(args: ITabArgs) {
        super(args);

        this.tabular = args.tabular;

        this.content = partial(require("./tab-content.hbs"), this, this.parent);
        this.content.append(this.element);

        this.tab = partial(require("./tab.hbs"), this);
        this.tab.on("click", () => {
            this.events.selected.emit(undefined);
        });
    }
}