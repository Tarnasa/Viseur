// These are the interfaces for all the states in this game
import { IBaseGame, IBaseGameObject, IBasePlayer } from "@cadre/ts-utils/cadre";

// This is a file generated by the Creer, it may have empty interfaces,
// but we need them, so let's disable that tslint rule
// tslint:disable:no-empty-interface

/**
 * Two player grid based game where each player tries to burn down the other
 * player's buildings. Let it burn.
 */
export interface IGameState extends IBaseGame {
    /**
     * How many bribes players get at the beginning of their turn, not counting
     * their burned down Buildings.
     */
    baseBribesPerTurn: number;

    /**
     * All the buildings in the game.
     */
    buildings: IBuildingState[];

    /**
     * The current Forecast, which will be applied at the end of the turn.
     */
    currentForecast: IForecastState;

    /**
     * The player whose turn it is currently. That player can send commands.
     * Other players cannot.
     */
    currentPlayer: IPlayerState;

    /**
     * The current turn number, starting at 0 for the first player's turn.
     */
    currentTurn: number;

    /**
     * All the forecasts in the game, indexed by turn number.
     */
    forecasts: IForecastState[];

    /**
     * A mapping of every game object's ID to the actual game object. Primarily
     * used by the server and client to easily refer to the game objects via ID.
     */
    gameObjects: {[id: string]: IGameObjectState};

    /**
     * The width of the entire map along the vertical (y) axis.
     */
    mapHeight: number;

    /**
     * The width of the entire map along the horizontal (x) axis.
     */
    mapWidth: number;

    /**
     * The maximum amount of fire value for any Building.
     */
    maxFire: number;

    /**
     * The maximum amount of intensity value for any Forecast.
     */
    maxForecastIntensity: number;

    /**
     * The maximum number of turns before the game will automatically end.
     */
    maxTurns: number;

    /**
     * The next Forecast, which will be applied at the end of your opponent's
     * turn. This is also the Forecast WeatherStations can control this turn.
     */
    nextForecast: IForecastState;

    /**
     * List of all the players in the game.
     */
    players: IPlayerState[];

    /**
     * A unique identifier for the game instance that is being played.
     */
    session: string;

    /**
     * The amount of time (in nano-seconds) added after each player performs a
     * turn.
     */
    timeAddedPerTurn: number;

}

/**
 * A basic building. It does nothing besides burn down. Other Buildings inherit
 * from this class.
 */
export interface IBuildingState extends IGameObjectState {
    /**
     * When true this building has already been bribed this turn and cannot be
     * bribed again this turn.
     */
    bribed: boolean;

    /**
     * The Building directly to the east of this building, or null if not
     * present.
     */
    buildingEast: IBuildingState;

    /**
     * The Building directly to the north of this building, or null if not
     * present.
     */
    buildingNorth: IBuildingState;

    /**
     * The Building directly to the south of this building, or null if not
     * present.
     */
    buildingSouth: IBuildingState;

    /**
     * The Building directly to the west of this building, or null if not
     * present.
     */
    buildingWest: IBuildingState;

    /**
     * How much fire is currently burning the building, and thus how much damage
     * it will take at the end of its owner's turn. 0 means no fire.
     */
    fire: number;

    /**
     * How much health this building currently has. When this reaches 0 the
     * Building has been burned down.
     */
    health: number;

    /**
     * True if this is the Headquarters of the owning player, false otherwise.
     * Burning this down wins the game for the other Player.
     */
    isHeadquarters: boolean;

    /**
     * The player that owns this building. If it burns down (health reaches 0)
     * that player gets an additional bribe(s).
     */
    owner: IPlayerState;

    /**
     * The location of the Building along the x-axis.
     */
    x: number;

    /**
     * The location of the Building along the y-axis.
     */
    y: number;

}

/**
 * Can put out fires completely.
 */
export interface IFireDepartmentState extends IBuildingState {
    /**
     * The amount of fire removed from a building when bribed to extinguish a
     * building.
     */
    fireExtinguished: number;

}

/**
 * The weather effect that will be applied at the end of a turn, which causes
 * fires to spread.
 */
export interface IForecastState extends IGameObjectState {
    /**
     * The Player that can use WeatherStations to control this Forecast when its
     * the nextForecast.
     */
    controllingPlayer: IPlayerState;

    /**
     * The direction the wind will blow fires in. Can be 'north', 'east',
     * 'south', or 'west'.
     */
    direction: string;

    /**
     * How much of a Building's fire that can be blown in the direction of this
     * Forecast. Fire is duplicated (copied), not moved (transfered).
     */
    intensity: number;

}

/**
 * An object in the game. The most basic class that all game classes should
 * inherit from automatically.
 */
export interface IGameObjectState extends IBaseGameObject {
    /**
     * String representing the top level Class that this game object is an
     * instance of. Used for reflection to create new instances on clients, but
     * exposed for convenience should AIs want this data.
     */
    gameObjectName: string;

    /**
     * A unique id for each instance of a GameObject or a sub class. Used for
     * client and server communication. Should never change value after being
     * set.
     */
    id: string;

    /**
     * Any strings logged will be stored here. Intended for debugging.
     */
    logs: string[];

}

/**
 * A player in this game. Every AI controls one player.
 */
export interface IPlayerState extends IGameObjectState, IBasePlayer {
    /**
     * How many bribes this player has remaining to use during their turn. Each
     * action a Building does costs 1 bribe. Any unused bribes are lost at the
     * end of the player's turn.
     */
    bribesRemaining: number;

    /**
     * All the buildings owned by this player.
     */
    buildings: IBuildingState[];

    /**
     * What type of client this is, e.g. 'Python', 'JavaScript', or some other
     * language. For potential data mining purposes.
     */
    clientType: string;

    /**
     * All the FireDepartments owned by this player.
     */
    fireDepartments: IFireDepartmentState[];

    /**
     * The Warehouse that serves as this player's headquarters and has extra
     * health. If this gets destroyed they lose.
     */
    headquarters: IWarehouseState;

    /**
     * If the player lost the game or not.
     */
    lost: boolean;

    /**
     * The name of the player.
     */
    name: string;

    /**
     * This player's opponent in the game.
     */
    opponent: IPlayerState;

    /**
     * All the PoliceDepartments owned by this player.
     */
    policeDepartments: IPoliceDepartmentState[];

    /**
     * The reason why the player lost the game.
     */
    reasonLost: string;

    /**
     * The reason why the player won the game.
     */
    reasonWon: string;

    /**
     * The amount of time (in ns) remaining for this AI to send commands.
     */
    timeRemaining: number;

    /**
     * All the warehouses owned by this player. Includes the Headquarters.
     */
    warehouses: IWarehouseState[];

    /**
     * All the WeatherStations owned by this player.
     */
    weatherStations: IWeatherStationState[];

    /**
     * If the player won the game or not.
     */
    won: boolean;

}

/**
 * Used to keep cities under control and raid Warehouses.
 */
export interface IPoliceDepartmentState extends IBuildingState {
}

/**
 * A typical abandoned warehouse... that anarchists hang out in and can be
 * bribed to burn down Buildings.
 */
export interface IWarehouseState extends IBuildingState {
    /**
     * How exposed the anarchists in this warehouse are to PoliceDepartments.
     * Raises when bribed to ignite buildings, and drops each turn if not
     * bribed.
     */
    exposure: number;

    /**
     * The amount of fire added to buildings when bribed to ignite a building.
     * Headquarters add more fire than normal Warehouses.
     */
    fireAdded: number;

}

/**
 * Can be bribed to change the next Forecast in some way.
 */
export interface IWeatherStationState extends IBuildingState {
}
