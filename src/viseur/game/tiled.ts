import { IBaseGameObject } from "@cadre/ts-utils/cadre";
import { Immutable } from "src/utils";

/** The valid directions Tiles can be in. */
export type TileDirection = "North" | "South" | "East" | "West";

/** The base tiles. */
export interface IBaseTile extends IBaseGameObject {
    /**
     * The Tile to the 'East' of this one (x+1, y). Or undefined if out of bounds of the map.
     */
    tileEast: IBaseTile;

    /**
     * The Tile to the 'North' of this one (x, y-1). Or undefined if out of bounds of the map.
     */
    tileNorth: IBaseTile;

    /**
     * The Tile to the 'South' of this one (x, y+1). Or undefined if out of bounds of the map.
     */
    tileSouth: IBaseTile;

    /**
     * The Tile to the 'West' of this one (x-1, y). Or undefined if out of bounds of the map.
     */
    tileWest: IBaseTile;

    /** The x (horizontal) position of this Tile. */
    x: number;

    /** The y (vertical) position of this Tile. */
    y: number;
}

/**
 * Gets the neighboring tile given any unknown string, which may not always have a tile in that direction.
 * @param state - Tile state
 * @param direction  - unknown direction to try to get at.
 * @returns A tile stat in that direction, or undefined if direction is invalid.
 */
export function getTileNeighbor<T extends IBaseTile>(state: Immutable<T>, direction: string): T | undefined;

/**
 * Gets the neighboring tile given a known direction string.
 * @param state - Tile state
 * @param direction  - The direction to get a tile in.
 * @returns A tile stat in that direction.
 */
export function getTileNeighbor<T extends IBaseTile>(state: Immutable<T>, direction: TileDirection): T;

/**
 * Gets the tile for a given tile state at a given direction.
 *
 * @param state - The state to inspect.
 * @param direction  - The direction in the state.
 * @returns The neighbor tile state if present in that direction, undefined otherwise.
 */
export function getTileNeighbor<T extends IBaseTile>(state: Immutable<T>, direction: string): T | undefined {
    // return (state as { [key: string]: T | undefined })[`tile${direction}`];

    switch (direction.toLowerCase()) {
        case "north":
            return state.tileNorth as T;
        case "east":
            return state.tileEast as T;
        case "south":
            return state.tileSouth as T;
        case "west":
            return state.tileWest as T;
    }
}
