// This is a class to represent the Blob object in the game.
// If you want to render it in the game do so here.
import { Delta } from "@cadre/ts-utils/cadre";
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { IBlobState, ITileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import { ease } from "src/utils";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Blob extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Blob (dt = 0) */
    public current: IBlobState | undefined;

    /** The next state of the Blob (dt = 1) */
    public next: IBlobState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    public blobmasterSprite: PIXI.Sprite;
    public blob1Sprite: PIXI.Sprite;
    public blob3Sprite: PIXI.Sprite;
    public hardened1: PIXI.Sprite;
    public hardened3: PIXI.Sprite;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Blob with basic logic as provided by the Creer
     * code generator. This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Blob.
     * @param viseur - The Viseur instance that controls everything and contains the game.
     */
    constructor(state: IBlobState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Blob here.
        this.container.setParent(this.game.layers.game);

        this.blobmasterSprite = this.addSprite.blobmaster();
        this.blobmasterSprite.visible = false;
        this.blob1Sprite = this.addSprite.blob1();
        this.blob1Sprite.visible = false;
        this.blob3Sprite = this.addSprite.blob3({
            relativeScale: 3,
        });
        this.blob3Sprite.visible = false;
        this.hardened1 = this.addSprite.hardened1();
        this.hardened1.visible = false;
        this.hardened3 = this.addSprite.hardened3();
        this.hardened3.visible = false;

        if (state.tile) {
            this.container.position.set(state.tile.x, state.tile.y);
            this.container.visible = true;
        }
        else {
            this.container.position.set(-1, -1);
            this.container.visible = false;
        }

        this.recolor();
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Blob instances.
     * Leave empty if it is not being rendered.
     *
     * @param dt - A floating point number [0, 1) which represents how far into
     * the next turn that current turn we are rendering is at
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    public render(
        dt: number,
        current: Immutable<IBlobState>,
        next: Immutable<IBlobState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Blob is

        let rgb = 0xffffff; // Neutral blobs are white
        if (next.owner) {
            rgb = this.game.getPlayersColor(next.owner).rgbNumber();
        }

        this.blobmasterSprite.visible = false;
        this.blob1Sprite.visible = false;
        this.blob3Sprite.visible = false;
        this.hardened1.visible = false;
        this.hardened3.visible = false;
        if (next.isBlobmaster) {
            this.blobmasterSprite.visible = true;
            this.blobmasterSprite.tint = rgb;
        } else {
            if (current.size === 1) {
                this.blob1Sprite.visible = true;
                this.blob1Sprite.tint = rgb;
            } else if (current.size === 3) {
                this.blob3Sprite.visible = true;
                this.blob3Sprite.tint = rgb;
                this.blob3Sprite.scale.x = this.blob1Sprite.scale.x;
                this.blob3Sprite.scale.y = this.blob1Sprite.scale.y;
            } else {
                this.blob3Sprite.visible = true;
                this.blob3Sprite.tint = rgb;
                this.blob3Sprite.scale.x = this.blob1Sprite.scale.x * (current.size / 3);
                this.blob3Sprite.scale.y = this.blob1Sprite.scale.y * (current.size / 3);
            }
        }
        if (!next.tile) {
            this.container.visible = false;
            return;
        } else {
            this.container.visible = true;
        }

        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt),
            ease(current.tile.y, next.tile.y, dt),
        );
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Blob's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Blob instance should not be rendered,
     * such as going back in time before it existed.
     *
     * By default the super hides container.
     * If this sub class adds extra PIXI objects outside this.container, you should hide those too in here.
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
     * @param current - The current (most) game state, will be this.next if this.current is undefined.
     * @param next - The next (most) game state, will be this.current if this.next is undefined.
     * @param delta - The current (most) delta, which explains what happened.
     * @param nextDelta  - The the next (most) delta, which explains what happend.
     */
    public stateUpdated(
        current: Immutable<IBlobState>,
        next: Immutable<IBlobState>,
        delta: Immutable<Delta>,
        nextDelta: Immutable<Delta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Blob based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <Joueur functions> --- functions invoked for human playable client
    // NOTE: These functions are only used 99% of the time if the game supports human playable clients (like Chess).
    //       If it does not, feel free to ignore these Joueur functions.

    /**
     * Moves this Blob onto the given tile.
     * @param tile The tile for this Blob to move onto.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if the move worked, false
     * otherwise.
     */
    public move(tile: ITileState, callback?: (returned: boolean) => void): void {
        this.runOnServer("move", {tile}, callback);
    }

    /**
     * Swaps this Blob with an adjacent blob.
     * @param blob The blob to swap with.
     * @param callback? The callback that eventually returns the return value
     * from the server. - The returned value is True if the swap worked, false
     * otherwise.
     */
    public swap(blob: IBlobState, callback?: (returned: boolean) => void): void {
        this.runOnServer("swap", {blob}, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
