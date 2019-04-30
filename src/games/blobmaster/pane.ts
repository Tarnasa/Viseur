import { Immutable } from "src/utils";
import { Viseur } from "src/viseur";
import { BasePane, IPaneStat } from "src/viseur/game";
import { Game } from "./game";
import { IGameState, IPlayerState } from "./state-interfaces";

// <<-- Creer-Merge: imports -->>
// Add additional imports you need here
// <<-- /Creer-Merge: imports -->>

/**
 * The visual pane that is displayed below the game and has text elements for
 * each player
 */
export class Pane extends BasePane<IGameState, IPlayerState> {
    // <<-- Creer-Merge: variables -->>
    // if you need add more member class variables, do so here
    // <<-- /Creer-Merge: variables -->>

    /**
     * Creates the pane for the Blobmaster game.
     *
     * @param viseur - The Viseur instance controlling the pane.
     * @param game - The game this pane is displaying stats for.
     * @param state - The initial state of the game.
     */
    constructor(viseur: Viseur, game: Game, state: Immutable<IGameState>) {
        super(viseur, game, state);

        // <<-- Creer-Merge: constructor -->>
        // constructor your pane here
        // <<-- /Creer-Merge: constructor -->>
    }

    // <<-- Creer-Merge: public-functions -->>
    // If you want to add more public functions, do so here
    // <<-- /Creer-Merge: public-functions -->>

    /**
     * Gets the stats for the players score bars.
     *
     * @param state - The current(most) state of the game to update this pane for.
     * @returns An array of numbers, where each index is the player at that
     * index. Sum does not matter, it will resize dynamically. If You want
     * to display no score, return undefined.
     * An array of numbers is treated as a full bar display.
     * An array of number tuples is treated as individual bars alternatively
     * left and right aligned scaling from the first to the max second value.
     */
    protected getPlayersScores(state: Immutable<IGameState>): Array<[number, number]> | number[] | undefined {
        super.getPlayersScores(state);

        // <<-- Creer-Merge: get-player-scores -->>
        return [state.players[0].score, state.players[1].score];
        // <<-- /Creer-Merge: get-player-scores -->>
    }

    /**
     * Gets the stats to show on the top bar of the pane,
     * which tracks stats in the game.
     * This is only called once, during initialization.
     * @param state the initial state of the game
     * @returns All the PaneStats to display on this BasePane for the game.
     */
    protected getGameStats(state: Immutable<IGameState>): Array<IPaneStat<IGameState>> {
        const stats = super.getGameStats(state);

        // <<-- Creer-Merge: game-stats -->>
        // add stats for games to show up here
        // <<-- /Creer-Merge: game-stats -->>

        return stats;
    }

    /**
     * Gets the stats to show on each player pane, which tracks stats for that player
     * @param state the initial state of the game
     * @returns All the PaneStats to display on this BasePane for the player.
     */
    protected getPlayerStats(state: Immutable<IGameState>): Array<IPaneStat<IPlayerState>> {
        const stats = super.getPlayerStats(state);

        // <<-- Creer-Merge: player-stats -->>
        // add stats for players to show up here
        stats.push({
            title: "Score",
            icon: "trophy",  // fontawesome
            get: (player) => player.score,
        });
        stats.push({
            title: "Slime",
            icon: "tint",  // fontawesome
            get: (player) => player.slime,
        });
        // <<-- /Creer-Merge: player-stats -->>

        return stats;
    }

    // <<-- Creer-Merge: functions -->>
    // add more functions for your pane here
    // <<-- /Creer-Merge: functions -->>
}
