import { Immutable } from "@cadre/ts-utils";
import { BaseElement, BaseElementArgs } from "src/core/ui/base-element";
import { DisableableElement } from "src/core/ui/disableable-element";
import * as inputs from "src/core/ui/inputs";
import { Viseur } from "src/viseur";
import { viseurConstructed } from "src/viseur/constructed";
import { GamelogWithReverses, ViseurGamelog } from "src/viseur/game/gamelog";
import { Event, events } from "ts-typed-events";
import { KEYS } from "../keys";
import * as playbackPaneHbs from "./playback-pane.hbs";
import "./playback-pane.scss";

/** Handles all the playback controls and logic for the playback part of the GUI. */
export class PlaybackPane extends BaseElement {
    /** All the events this class emits. */
    public readonly events = events({
        /** Emitted when the playback slider is slid. */
        playbackSlide: new Event<number>(),

        /** Emitted when fullscreen is toggled. */
        toggleFullscreen: new Event(),

        /** Emitted when we want to go to the next state. */
        next: new Event(),

        /** Emitted when we want to go to the previous state. */
        back: new Event(),

        /** Emitted when we want play or pause (toggled). */
        playPause: new Event(),
    });

    /** The Viseur instance that controls this. */
    private viseur: Viseur | undefined;

    /** The number of deltas in the gamelog. */
    private numberOfDeltas = 0;

    /** If all the inputs are disabled. */
    private disabled = false;

    /** The number of turns in the gamelog. */
    private numberOfTurns = 0;

    /** Element displaying the current playback time. */
    private readonly playbackTimeCurrentElement: JQuery;

    /** Element displaying the max playback time. */
    private readonly playbackTimeMaxElement: JQuery;

    /** The top container for buttons. */
    private readonly topContainerElement: JQuery;

    /** The bottom left container for buttons. */
    private readonly bottomLeftContainerElement: JQuery;

    /** The bottom right container for buttons. */
    private readonly bottomRightContainerElement: JQuery;

    /** Handy collection of all our inputs. */
    private readonly inputs: DisableableElement[];

    // Our Inputs \\

    /** The slider to control turn. */
    private readonly playbackSlider: inputs.Slider;

    /** The play/pause button. */
    private readonly playPauseButton: inputs.Button;

    /** The back one turn button. */
    private readonly backButton: inputs.Button;

    /** The advance one turn button. */
    private readonly nextButton: inputs.Button;

    /** The toggle delta mode button. */
    private readonly deltasButton: inputs.Button;

    /** The toggle turn mode button. */
    private readonly turnsButton: inputs.Button;

    /** The speed slider to control playback speed. */
    private readonly speedSlider: inputs.Slider;

    /** The fullscreen enable button. */
    private readonly fullscreenButton: inputs.Button;

    constructor(args: Readonly<BaseElementArgs>) {
        super(args, playbackPaneHbs);

        this.element.addClass("collapsed");

        this.playbackTimeCurrentElement = this.element.find(
            ".playback-time-current",
        );
        this.playbackTimeMaxElement = this.element.find(".playback-time-max");

        this.topContainerElement = this.element.find(".playback-pane-top");
        this.bottomLeftContainerElement = this.element.find(
            ".playback-pane-bottom-left",
        );
        this.bottomRightContainerElement = this.element.find(
            ".playback-pane-bottom-right",
        );

        this.playbackSlider = new inputs.Slider({
            id: "playback-slider",
            parent: this.topContainerElement,
        });
        this.playbackSlider.events.changed.on((value) => {
            this.events.playbackSlide.emit(value);
        });

        // play or pause \\
        this.playPauseButton = new inputs.Button({
            id: "play-pause-button",
            parent: this.bottomLeftContainerElement,
        });
        this.playPauseButton.events.clicked.on(() => {
            this.events.playPause.emit();
        });

        KEYS.space.up.on(() => {
            // space bar up, hence the ' => '
            this.playPauseButton.click();
        });

        // back \\
        this.backButton = new inputs.Button({
            id: "back-button",
            parent: this.bottomLeftContainerElement,
        });
        this.backButton.events.clicked.on(() => {
            this.events.back.emit();
        });
        KEYS["left arrow"].up.on(() => {
            this.backButton.click();
        });

        // next \\
        this.nextButton = new inputs.Button({
            id: "next-button",
            parent: this.bottomLeftContainerElement,
        });
        this.nextButton.events.clicked.on(() => {
            this.events.next.emit();
        });
        KEYS["right arrow"].up.on(() => {
            this.nextButton.click();
        });

        // deltas and turns mode \\
        this.deltasButton = new inputs.Button({
            id: "deltas-button",
            parent: this.bottomRightContainerElement,
        });
        this.deltasButton.events.clicked.on(() => {
            if (
                this.viseur &&
                this.viseur.settings.playbackMode.get() !== "deltas"
            ) {
                this.viseur.settings.playbackMode.set("deltas");
            }
        });
        this.turnsButton = new inputs.Button({
            id: "turns-button",
            parent: this.bottomRightContainerElement,
        });
        this.turnsButton.events.clicked.on(() => {
            if (
                this.viseur &&
                this.viseur.settings.playbackMode.get() !== "turns"
            ) {
                this.viseur.settings.playbackMode.set("turns");
            }
        });

        // speed \\
        this.speedSlider = new inputs.Slider({
            id: "speed-slider",
            parent: this.bottomRightContainerElement,
            min: 0,
            max: 0.98,
            value: 0,
        });

        this.speedSlider.events.changed.on(() => {
            this.updateSpeedSetting();
        });

        this.fullscreenButton = new inputs.Button({
            id: "fullscreen-button",
            parent: this.bottomRightContainerElement,
        });
        this.fullscreenButton.events.clicked.on(() => {
            this.events.toggleFullscreen.emit();
        });

        this.inputs = [
            this.playbackSlider,
            this.playPauseButton,
            this.backButton,
            this.nextButton,
            this.deltasButton,
            this.turnsButton,
            this.speedSlider,
            this.fullscreenButton,
        ];

        this.disable();

        viseurConstructed.once((viseur) => {
            this.viseur = viseur;

            this.updateSpeedSlider();
            this.speedSlider.value = this.getSliderFromSpeed();

            viseur.settings.playbackSpeed.changed.on(() => {
                this.updateSpeedSlider();
            });

            this.viseur.events.ready.once(({ gamelog }) => {
                this.viseurReady(gamelog);
            });

            this.viseur.events.gamelogUpdated.on((gamelog) => {
                this.updateTimepointsFromGamelog(gamelog);
                this.updatePlaybackSlider();
            });

            this.viseur.events.gamelogFinalized.on(() => {
                this.enable();
            });

            this.viseur.timeManager.events.playing.on(() => {
                this.element.addClass("playing");
            });

            this.viseur.timeManager.events.paused.on(() => {
                this.element.removeClass("playing");
            });

            this.viseur.events.timeUpdated.on((data) => {
                this.timeUpdated(data.index, data.dt);
            });

            this.viseur.settings.playbackMode.changed.on((value) => {
                this.updatePlaybackMode(String(value));
            });

            this.updatePlaybackMode(this.viseur.settings.playbackMode.get());
        });
    }

    /**
     * Runs through every delta in the gamelog to find the maximal turn number.
     *
     * @param gamelog - To get the number of turns of.
     * @returns The number of turns in the gamelog.
     */
    private getNumberOfTurnsInGamelog(
        gamelog: Immutable<GamelogWithReverses>,
    ): number {
        let turns = -1;
        for (const delta of gamelog.deltas) {
            if (
                delta.game &&
                delta.game.currentTurn !== undefined &&
                (delta.game.currentTurn as number) > turns
            ) {
                turns = delta.game.currentTurn as number;
            }
        }
        return turns + 1;
    }

    /**
     * Invoked when the gamelog is loaded.
     *
     * @param gamelog - The gamelog that was loaded.
     */
    private viseurReady(gamelog: Immutable<GamelogWithReverses>): void {
        if (!this.viseur) {
            throw new Error("Viseur ready triggered without Viseur!");
        }

        this.numberOfDeltas = gamelog.deltas.length;
        this.numberOfTurns = this.getNumberOfTurnsInGamelog(gamelog);

        if (!gamelog.streaming) {
            this.enable();
        } else {
            this.speedSlider.enable(); // While streaming the gamelog only enable the speed slider
            this.viseur.events.gamelogFinalized.on((data) => {
                this.updateTimepointsFromGamelog(data.gamelog);
                this.updatePlaybackSlider();
            });
        }

        this.playbackSlider.value = 0;
        this.updateTimepointsFromGamelog(gamelog);
        this.updatePlaybackSlider();

        this.element.removeClass("collapsed");
    }

    /**
     * Depending on playback mode, return the maximum "number" the slider can reach.
     *
     * @returns The maximum value on the slider.
     */
    private getMaxSliderValue(): number {
        if (
            this.viseur &&
            this.viseur.settings.playbackMode.get() === "turns"
        ) {
            return this.numberOfTurns - 1;
        } else {
            return this.numberOfDeltas - 1;
        }
    }

    /**
     * Updates numberOfDeltas and numberOfTurns from the given gamelog.
     *
     * @param gamelog - To gather deltas and turns from.
     */
    private updateTimepointsFromGamelog(
        gamelog: Immutable<ViseurGamelog>,
    ): void {
        this.numberOfDeltas = gamelog.deltas.length;
        this.numberOfTurns = this.getNumberOfTurnsInGamelog(gamelog);
    }

    /**
     * Invoked when the gamelog's number of deltas/turns is known or changes.
     */
    private updatePlaybackSlider(): void {
        const max = this.getMaxSliderValue();
        this.playbackSlider.setMax(max + 1 - 1 / 1e10); // basically round down a bit
        this.playbackTimeMaxElement.html(String(max));
    }

    /**
     * Disables the playback mode of mode not enabled.
     *
     * @param mode - The current mode we are in.
     */
    private updatePlaybackMode(mode: string): void {
        const m = mode.toLowerCase();
        this.turnsButton.element.toggleClass("active", m === "turns");
        this.deltasButton.element.toggleClass("active", m === "deltas");
        this.updatePlaybackSlider();
    }

    /**
     * Invoked when the TimeManager's time changes, so we can update the slider and buttons.
     *
     * @param index - The index that was updated to.
     * @param dt - The dt number [0, 1) that was updated.
     */
    private timeUpdated(index: number, dt: number): void {
        this.playbackTimeCurrentElement.html(String(index));
        if (this.playbackSlider.value !== index + dt) {
            this.playbackSlider.value = index + dt;
        }

        if (this.isEnabled()) {
            if (index === 0 && dt === 0) {
                this.backButton.disable();
            } else {
                this.backButton.enable();
            }

            if (index >= this.getMaxSliderValue()) {
                this.nextButton.disable();
            } else {
                this.nextButton.enable();
            }
        }
    }

    /**
     * Converts from the speed slider's value to the actual speed for the TimeManager.
     *
     * @returns - The TimeMangers speed based on the slider value x.
     */
    private getSpeedFromSlider(): number {
        return Math.round((1 - this.speedSlider.value) * 1000);
    }

    /**
     * Converts from the speed of the TimeManager to the slider's value (reverse of y).
     *
     * @returns - The speedSlider's value to represent y.
     */
    private getSliderFromSpeed(): number {
        return this.viseur
            ? 1 - this.viseur.settings.playbackSpeed.get() / 1000
            : 1;
    }

    /**
     * Invoked when the speedSlider is dragged/changed.
     */
    private updateSpeedSetting(): void {
        if (this.viseur) {
            this.viseur.settings.playbackSpeed.set(this.getSpeedFromSlider());
        }
    }

    /**
     * Invoked when the playback-speed setting is changed, so we can update
     * the slider.
     */
    private updateSpeedSlider(): void {
        this.speedSlider.value = this.getSliderFromSpeed();
    }

    /**
     * Enables all the inputs.
     */
    private enable(): void {
        this.disabled = false;
        for (const input of this.inputs) {
            input.enable();
        }
    }

    /**
     * Disables all the inputs.
     */
    private disable(): void {
        this.disabled = true;
        for (const input of this.inputs) {
            input.disable();
        }
    }

    /**
     * Checks if the playback pane is enabled (playback can be manipulated).
     * It should be disabled during streaming gamelogs.
     *
     * @returns True if enabled, false otherwise.
     */
    private isEnabled(): boolean {
        return !this.disabled;
    }
}
