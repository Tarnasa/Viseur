/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-empty-interface */

// These are the interfaces for all the states in this game
import {
    BaseGame,
    BaseGameObject,
    BasePlayer,
    FinishedDelta,
    RanDelta,
} from "@cadre/ts-utils/cadre";
import {
    GameObjectInstance,
    GameSpecificDelta,
} from "src/viseur/game/base-delta";

// -- Game State Interfaces -- \\
/**
 * Adapt, Evolve, Segfault.
 *
 */
export interface GameState extends BaseGame {
    /**
     * The amount of health that a creature with a 0 endurance stat starts with.
     *
     */
    baseHealth: number;

    /**
     * Every Creature in the game.
     *
     */
    creatures: CreatureState[];

    /**
     * The player whose turn it is currently. That player can send commands.
     * Other players cannot.
     *
     */
    currentPlayer: PlayerState;

    /**
     * The current turn number, starting at 0 for the first player's turn.
     *
     */
    currentTurn: number;

    /**
     * How much to damage an opponent per difference of carnivorism and defense.
     *
     */
    damageMultiplier: number;

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     *
     */
    gameObjects: { [id: string]: GameObjectState };

    /**
     * The amount of health required from -each- creature in order to breed.
     *
     */
    healthPerBreed: number;

    /**
     * Multiplied by carnivorism to determine health gained from eating
     * creatures.
     *
     */
    healthPerCarnivorism: number;

    /**
     * The amount of extra health for each point of endurance.
     *
     */
    healthPerEndurance: number;

    /**
     * Multiplied by herbivorism to determine health gained from biting plants.
     *
     */
    healthPerHerbivorism: number;

    /**
     * The amount of health required to move.
     *
     */
    healthPerMove: number;

    /**
     * The amount of health lost after each of your turns.
     *
     */
    healthPerTurn: number;

    /**
     * The number of Tiles in the map along the y (vertical) axis.
     *
     */
    mapHeight: number;

    /**
     * The number of Tiles in the map along the x (horizontal) axis.
     *
     */
    mapWidth: number;

    /**
     * The maximum size a plant to grow to.
     *
     */
    maxPlantSize: number;

    /**
     * The maximum number of creatures that each player will start with.
     *
     */
    maxStartingCreatures: number;

    /**
     * The maximum number of plants that the map will start with.
     *
     */
    maxStartingPlants: number;

    /**
     * The maxmimum value that a stat (carnivorism, herbivorism, defense,
     * endurance, speed) can have.
     *
     */
    maxStatValue: number;

    /**
     * The maximum number of turns before the game will automatically end.
     *
     */
    maxTurns: number;

    /**
     * The minimum number of creatures that each player will start with.
     *
     */
    minStartingCreatures: number;

    /**
     * The minimum number of plants that the map will start with.
     *
     */
    minStartingPlants: number;

    /**
     * Every Plant in the game.
     *
     */
    plants: PlantState[];

    /**
     * List of all the players in the game.
     *
     */
    players: PlayerState[];

    /**
     * A unique identifier for the game instance that is being played.
     *
     */
    session: string;

    /**
     * All the tiles in the map, stored in Row-major order. Use `x + y *
     * mapWidth` to access the correct index.
     *
     */
    tiles: TileState[];

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     *
     */
    timeAddedPerTurn: number;
}

/**
 * A Creature in the game.
 *
 */
export interface CreatureState extends GameObjectState {
    /**
     * Indicates whether or not this creature can bite this turn.
     *
     */
    canBite: boolean;

    /**
     * Indicates whether or not this creature can breed this turn.
     *
     */
    canBreed: boolean;

    /**
     * The carnivore level of the creature. This increases damage to other other
     * creatures and health restored on kill.
     *
     */
    carnivorism: number;

    /**
     * The current amount of health that this creature has.
     *
     */
    currentHealth: number;

    /**
     * The defense of the creature. This reduces the amount of damage this
     * creature takes from being eaten.
     *
     */
    defense: number;

    /**
     * The endurance level of the creature. This increases the max health a
     * creature can have.
     *
     */
    endurance: number;

    /**
     * The herbivore level of the creature. This increases health restored from
     * eating plants.
     *
     */
    herbivorism: number;

    /**
     * Indicates whether or not this creature is still in an egg and cannot
     * bite, breed, or be bitten.
     *
     */
    isEgg: boolean;

    /**
     * The maximum amount of health this creature can have.
     *
     */
    maxHealth: number;

    /**
     * The amount of moves this creature has left this turn.
     *
     */
    movementLeft: number;

    /**
     * The owner of the creature.
     *
     */
    owner: PlayerState;

    /**
     * The creatures that gave birth to this one.
     *
     */
    parents: CreatureState[];

    /**
     * The speed of the creature. This determines how many times a creature can
     * move in one turn.
     *
     */
    speed: number;

    /**
     * The Tile this Creature occupies.
     *
     */
    tile: TileState;
}

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 *
 */
export interface GameObjectState extends BaseGameObject {
    /**
     * String representing the top level Class that this game object is an
     * instance of. Used for reflection to create new instances on clients, but
     * exposed for convenience should AIs want this data.
     *
     */
    gameObjectName: string;

    /**
     * A unique id for each instance of a GameObject or a sub class. Used for
     * client and server communication. Should never change value after being
     * set.
     *
     */
    id: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     *
     */
    logs: string[];
}

/**
 * A Plant in the game.
 *
 */
export interface PlantState extends GameObjectState {
    /**
     * The total number of turns it takes this plant to grow in size.
     *
     */
    growthRate: number;

    /**
     * The size of the plant.
     *
     */
    size: number;

    /**
     * The Tile this Plant occupies.
     *
     */
    tile: TileState;

    /**
     * The number of turns left until this plant will grow again.
     *
     */
    turnsUntilGrowth: number;
}

/**
 * A player in this game. Every AI controls one player.
 *
 */
export interface PlayerState extends GameObjectState, BasePlayer {
    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     *
     */
    clientType: string;

    /**
     * Every creature owned by this Player.
     *
     */
    creatures: CreatureState[];

    /**
     * If the player lost the game or not.
     *
     */
    lost: boolean;

    /**
     * The name of the player.
     *
     */
    name: string;

    /**
     * This player's opponent in the game.
     *
     */
    opponent: PlayerState;

    /**
     * The reason why the player lost the game.
     *
     */
    reasonLost: string;

    /**
     * The reason why the player won the game.
     *
     */
    reasonWon: string;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     *
     */
    timeRemaining: number;

    /**
     * If the player won the game or not.
     *
     */
    won: boolean;
}

/**
 * A Tile in the game that makes up the 2D map grid.
 *
 */
export interface TileState extends GameObjectState {
    /**
     * The Creature on this Tile or null.
     *
     */
    creature: CreatureState;

    /**
     * The unhatched Creature on this Tile or null.
     *
     */
    egg: CreatureState;

    /**
     * The Plant on this Tile or null.
     *
     */
    plant: PlantState;

    /**
     * The Tile to the 'East' of this one (x+1, y). Null if out of bounds of the
     * map.
     *
     */
    tileEast: TileState;

    /**
     * The Tile to the 'North' of this one (x, y-1). Null if out of bounds of
     * the map.
     *
     */
    tileNorth: TileState;

    /**
     * The Tile to the 'South' of this one (x, y+1). Null if out of bounds of
     * the map.
     *
     */
    tileSouth: TileState;

    /**
     * The Tile to the 'West' of this one (x-1, y). Null if out of bounds of the
     * map.
     *
     */
    tileWest: TileState;

    /**
     * The x (horizontal) position of this Tile.
     *
     */
    x: number;

    /**
     * The y (vertical) position of this Tile.
     *
     */
    y: number;
}

// -- Run Deltas -- \\
/**
 * The delta about what happened when a 'Creature' ran their 'bite' function.
 *
 */
export type CreatureBiteRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CreatureState>;

            /** The name of the function of the caller to run. */
            functionName: "bite";

            /**
             * The arguments to Creature.bite,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile with a creature or plant to bite.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if successfully bit, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'Creature' ran their 'breed' function.
 *
 */
export type CreatureBreedRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CreatureState>;

            /** The name of the function of the caller to run. */
            functionName: "breed";

            /**
             * The arguments to Creature.breed,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Creature to breed with.
                 *
                 */
                mate: GameObjectInstance<CreatureState>;
            };
        };

        /**
         * The baby creature if successful, null otherwise.
         *
         */
        returned: GameObjectInstance<CreatureState>;
    };
};

/**
 * The delta about what happened when a 'Creature' ran their 'move' function.
 *
 */
export type CreatureMoveRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<CreatureState>;

            /** The name of the function of the caller to run. */
            functionName: "move";

            /**
             * The arguments to Creature.move,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * The Tile to move to.
                 *
                 */
                tile: GameObjectInstance<TileState>;
            };
        };

        /**
         * True if successfully moved, false otherwise.
         *
         */
        returned: boolean;
    };
};

/**
 * The delta about what happened when a 'GameObject' ran their 'log' function.
 *
 */
export type GameObjectLogRanDelta = RanDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        run: {
            /** The reference to the game object requesting a function to be run. */
            caller: GameObjectInstance<GameObjectState>;

            /** The name of the function of the caller to run. */
            functionName: "log";

            /**
             * The arguments to GameObject.log,
             * as a map of the argument name to its value.
             */
            args: {
                /**
                 * A string to add to this GameObject's log. Intended for
                 * debugging.
                 *
                 */
                message: string;
            };
        };

        /**
         * This run delta does not return a value.
         *
         */
        returned: void;
    };
};

/**
 * The delta about what happened when a 'AI' ran their 'runTurn' function.
 *
 */
export type AIRunTurnFinishedDelta = FinishedDelta & {
    /** Data about why the run/ran occurred. */
    data: {
        /** The player that requested this game logic be ran. */
        player: GameObjectInstance<PlayerState>;

        /** The data about what was requested be run. */
        order: {
            /** The name of the function of the caller to run. */
            name: "runTurn";

            /**
             * The arguments to AI.runTurn,
             * as a positional array of arguments send to the AI.
             */
            args: {};
        };

        /**
         * Represents if you want to end your turn. True means end your turn,
         * False means to keep your turn going and re-call this function.
         *
         */
        returned: boolean;
    };
};

/** All the possible specific deltas in Galapagos. */
export type GalapagosSpecificDelta =
    | CreatureBiteRanDelta
    | CreatureBreedRanDelta
    | CreatureMoveRanDelta
    | GameObjectLogRanDelta
    | AIRunTurnFinishedDelta;

/** The possible delta objects in Galapagos. */
export type GalapagosDelta = GameSpecificDelta<GalapagosSpecificDelta>;
