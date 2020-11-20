// This is a class to represent the Creature object in the game.
// If you want to render it in the game do so here.
import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { makeRenderable } from "src/viseur/game";
import { GameObject } from "./game-object";
import { CreatureState, GalapagosDelta, TileState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// any additional imports you want can be added here safely between Creer runs
import { ease } from "src/utils";
// <<-- /Creer-Merge: imports -->>

// <<-- Creer-Merge: should-render -->>
// Set this variable to `true`, if this class should render.
const SHOULD_RENDER = true;
// <<-- /Creer-Merge: should-render -->>

/**
 * An object in the game. The most basic class that all game classes should inherit from automatically.
 */
export class Creature extends makeRenderable(GameObject, SHOULD_RENDER) {
    // <<-- Creer-Merge: static-functions -->>
    // you can add static functions here
    // <<-- /Creer-Merge: static-functions -->>

    /** The current state of the Creature (dt = 0). */
    public current: CreatureState | undefined;

    /** The next state of the Creature (dt = 1). */
    public next: CreatureState | undefined;

    // <<-- Creer-Merge: variables -->>
    // You can add additional member variables here
    public heart: PIXI.Sprite;
    public body: PIXI.Sprite;
    public head: PIXI.Sprite;
    public neck: PIXI.Sprite;
    public armor: PIXI.Sprite;
    public arms: PIXI.Sprite;
    public eyes: PIXI.Sprite;
    public jaw: PIXI.Sprite;
    public frontLegs: PIXI.Sprite;
    public backLegs: PIXI.Sprite;
    public spikes: PIXI.Sprite;
    public tail: PIXI.Sprite;
    public teeth: PIXI.Sprite;
    public healthbar: PIXI.Sprite;
    // <<-- /Creer-Merge: variables -->>

    /**
     * Constructor for the Creature with basic logic
     * as provided by the Creer code generator.
     * This is a good place to initialize sprites and constants.
     *
     * @param state - The initial state of this Creature.
     * @param viseur - The Viseur instance that controls everything and
     * contains the game.
     */
    constructor(state: CreatureState, viseur: Viseur) {
        super(state, viseur);

        // <<-- Creer-Merge: constructor -->>
        // You can initialize your new Creature here.
        this.container.setParent(this.game.layers.game);
        this.heart = this.addSprite.heart({ visible: state.isEgg });
        this.body = this.addSprite.creatureMisc({
            index: 0,
            visible: !state.isEgg,
        });
        this.head = this.addSprite.creatureMisc({
            index: 1,
            visible: !state.isEgg,
        });
        this.neck = this.addSprite.creatureMisc({
            index: 2,
            visible: !state.isEgg,
        });
        this.armor = this.addSprite.arms({
            index: this.rescaleRound(state.defense, 1, 6, 0, 10),
            visible: !state.isEgg,
        });
        this.arms = this.addSprite.arms({
            index: Math.min(11, Math.ceil((state.herbivorism * 11.0) / 11)),
            visible: !state.isEgg,
        });
        this.eyes = this.addSprite.eyes({
            index: Math.min(6, Math.ceil((state.defense * 6.0) / 10)),
            visible: !state.isEgg,
        });
        this.jaw = this.addSprite.jaws({
            index: Math.min(11, Math.ceil((state.herbivorism * 11.0) / 11)),
            visible: !state.isEgg,
        });
        this.frontLegs = this.addSprite.frontLegs({
            index: Math.min(10, Math.ceil((state.speed * 10.0) / 10)),
            visible: !state.isEgg,
        });
        this.backLegs = this.addSprite.backLegs({
            index: Math.min(6, Math.ceil((state.speed * 6.0) / 10)),
            visible: !state.isEgg,
        });
        this.spikes = this.addSprite.spikes({
            index: Math.min(10, Math.ceil((state.endurance * 10.0) / 50)),
            visible: !state.isEgg,
        });
        this.teeth = this.addSprite.teeth({
            index: Math.min(10, Math.ceil((state.carnivorism * 10.0) / 10)),
            visible: !state.isEgg,
        });
        this.tail = this.addSprite.tails({
            index: Math.min(10, Math.ceil((state.endurance * 10.0) / 10)),
            visible: !state.isEgg,
        });
        this.healthbar = this.addSprite.healthbar({ index: 9 });
        this.healthbar.scale.x /= 1.1;
        this.healthbar.scale.y *= 0.15;
        this.healthbar.anchor.y = 0;
        this.container.width = 1.1;
        this.container.height = 1.1;
        this.recolor();
        if (state.owner.id == "0") {
            this.container.scale.x = -1;
        }
        // <<-- /Creer-Merge: constructor -->>
    }

    /**
     * Called approx 60 times a second to update and render Creature
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
        current: Immutable<CreatureState>,
        next: Immutable<CreatureState>,
        delta: Immutable<GalapagosDelta>,
        nextDelta: Immutable<GalapagosDelta>,
    ): void {
        super.render(dt, current, next, delta, nextDelta);

        // <<-- Creer-Merge: render -->>
        // render where the Creature is
        if (!next.tile) {
            this.container.visible = false;
            return;
        }
        this.heart.visible = false;
        this.body.visible = !next.isEgg;
        this.neck.visible = !next.isEgg;
        this.head.visible = !next.isEgg;
        this.armor.visible = !next.isEgg;
        this.arms.visible = !next.isEgg;
        this.eyes.visible = !next.isEgg;
        this.jaw.visible = !next.isEgg;
        this.frontLegs.visible = !next.isEgg;
        this.backLegs.visible = !next.isEgg;
        this.spikes.visible = !next.isEgg;
        this.teeth.visible = !next.isEgg;
        this.tail.visible = !next.isEgg;
        this.healthbar.visible = !next.isEgg;
        this.healthbar.texture = this.game.resources.healthbar.getTexture(
            this.rescaleRound(next.currentHealth, 0, next.maxHealth, 0, 9),
        );
        this.container.visible = true;
        this.container.position.set(
            ease(current.tile.x, next.tile.x, dt),
            ease(current.tile.y, next.tile.y, dt),
        );
        if (next.owner.id == "0") {
            this.container.x += 1;
        }
        if (!current.tile && next.parents && next.parents.length == 2) {
            this.heart.visible = true;
            this.heart.position.x =
                (next.parents[0].tile.x + next.parents[1].tile.x) / 2;
            this.heart.position.y =
                (next.parents[0].tile.y + next.parents[1].tile.y) / 2;
        }
        // <<-- /Creer-Merge: render -->>
    }

    /**
     * Invoked after a player changes their color,
     * so we have a chance to recolor this Creature's sprites.
     */
    public recolor(): void {
        super.recolor();

        // <<-- Creer-Merge: recolor -->>
        // replace with code to recolor sprites based on player color
        let owner = undefined;
        if (this.current) {
            owner = this.current.owner;
        } else if (this.next) {
            owner = this.next.owner;
        }
        if (owner === undefined) {
            return;
        }
        this.body.tint = this.game.getPlayersColor(owner).rgbNumber();
        this.head.tint = this.game.getPlayersColor(owner).rgbNumber();
        this.neck.tint = this.game.getPlayersColor(owner).rgbNumber();
        this.frontLegs.tint = this.game.getPlayersColor(owner).rgbNumber();
        this.backLegs.tint = this.game.getPlayersColor(owner).rgbNumber();
        this.arms.tint = this.game.getPlayersColor(owner).rgbNumber();
        this.tail.tint = this.game.getPlayersColor(owner).rgbNumber();
        // <<-- /Creer-Merge: recolor -->>
    }

    /**
     * Invoked when this Creature instance should not be rendered,
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
        current: Immutable<CreatureState>,
        next: Immutable<CreatureState>,
        delta: Immutable<GalapagosDelta>,
        nextDelta: Immutable<GalapagosDelta>,
    ): void {
        super.stateUpdated(current, next, delta, nextDelta);

        // <<-- Creer-Merge: state-updated -->>
        // update the Creature based off its states
        // <<-- /Creer-Merge: state-updated -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // You can add additional public functions here
    // <<-- /Creer-Merge: public-functions -->>

    // <Joueur functions> --- functions invoked for human playable client
    // NOTE: These functions are only used 99% of the time if the game
    // supports human playable clients (like Chess).
    // If it does not, feel free to ignore these Joueur functions.

    /**
     * Command a creature to bite a plant or creature on a specified tile.
     *
     * @param tile - The Tile with a creature or plant to bite.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully bit, false
     * otherwise.
     */
    public bite(tile: TileState, callback: (returned: boolean) => void): void {
        this.runOnServer("bite", { tile }, callback);
    }

    /**
     * Command a creature to breed with an adjacent creature.
     *
     * @param mate - The Creature to breed with.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is The baby creature if successful,
     * null otherwise.
     */
    public breed(
        mate: CreatureState,
        callback: (returned: CreatureState) => void,
    ): void {
        this.runOnServer("breed", { mate }, callback);
    }

    /**
     * Command a creature to move to a specified adjacent tile.
     *
     * @param tile - The Tile to move to.
     * @param callback - The callback that eventually returns the return value
     * from the server. - The returned value is True if successfully moved,
     * false otherwise.
     */
    public move(tile: TileState, callback: (returned: boolean) => void): void {
        this.runOnServer("move", { tile }, callback);
    }

    // </Joueur functions>

    // <<-- Creer-Merge: protected-private-functions -->>
    private rescaleRound(
        x: number,
        inmin: number,
        inmax: number,
        outmin: number,
        outmax: number,
    ): number {
        // From (1 to 5) to (0, 11)
        // 1 -> 0
        // 2 -> 2
        // 3 -> 5
        // 4 -> 8
        // 5 -> 11
        // From (0, 50) to (0, 9)
        // 0 -> 0
        // 1 -> 0
        // 24 -> 4
        // 25 -> 5
        // 49 -> 9
        // 50 -> 9
        if (x <= inmin) {
            return outmin;
        }
        if (x >= inmax) {
            return outmax;
        }
        return (
            outmin +
            Math.round(((x - inmin) * (outmax - outmin)) / (inmax - inmin))
        );
    }
    // You can add additional protected/private functions here
    // <<-- /Creer-Merge: protected-private-functions -->>
}
