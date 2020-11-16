// This is a class to represent the Plant object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { GalapagosDelta, PlantState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Plant extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Plant (dt = 0). */
    public current: PlantState | undefined;

    /** The next state of the Plant (dt = 1). */
    public next: PlantState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    public currentSprite: PIXI.Sprite;
    public nextSprite: PIXI.Sprite;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Plant with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Plant.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: PlantState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Plant here.
        this.container.setParent(this.game.layers.game);
        this.currentSprite = this.addSprite.plants({ index: 9 });
        this.currentSprite.texture = this.getTextureForSize(state.size);
        this.currentSprite.visible = true;
        this.nextSprite = this.addSprite.plants({ index: 9 });
        this.nextSprite.texture = this.getTextureForSize(state.size);
        this.nextSprite.visible = false;
        this.container.position.set(state.tile.x, state.tile.y);
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Plant
     * instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at.
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public render(
        dt: number,
        current: Immutable<PlantState>,
        next: Immutable<PlantState>,
        delta: Immutable<GalapagosDelta>,
        nextDelta: Immutable<GalapagosDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Plant is
        if (!next.tile) {
            this.container.visible = false;
            return;
        } else {
            this.container.visible = true;
        }
        this.currentSprite.texture = this.getTextureForSize(current.size);
        this.nextSprite.texture = this.getTextureForSize(next.size);
        if (current.size != next.size) {
            this.nextSprite.visible = true;
            this.currentSprite.alpha = 1 - dt;
            this.nextSprite.alpha = dt;
        } else {
            this.nextSprite.visible = false;
            this.currentSprite.alpha = 1;
            this.nextSprite.alpha = 0;
        }
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Plant's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Plant instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you
     * should hide those too in here.
     */
    public hideRender(): void {
        super.hideRender();

        // <<-- Creer-Merge: hide-render -->>
        // hide anything outside of `this.container`.
        // <<-- /Creer-Merge: hide-render -->>
    }

    /**
     * Invoked when the state updates.
     *
     * @param current - The current (most) game state, will be this.next if
     * this.current is undefined.
     * @param next - The next (most) game state, will be this.current if
     * this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta - The the next (most) delta, which explains what
     * happend.
     */
    public stateUpdated(
        current: Immutable<PlantState>,
        next: Immutable<PlantState>,
        delta: Immutable<GalapagosDelta>,
        nextDelta: Immutable<GalapagosDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Plant based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    public getTextureForSize(size: number): PIXI.Texture {
        let index = Math.ceil((size * 10.0) / 15.0);
        if (index > 10) {
            index = 10;
        }
        return this.game.resources.plants.getTexture(index);
    }
    // <<-- /Creer-Merge: public-functions -->>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
