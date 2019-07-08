// Do not modify this file
// This is a simple lookup object for each GameObject class
import { IGameObjectClasses } from "src/viseur/game/interfaces";
import { Blob } from "./blob";
import { GameObject } from "./game-object";
import { Player } from "./player";
import { Tile } from "./tile";

/** All the non Game classes in this game */
export const GameObjectClasses: Readonly<IGameObjectClasses> = Object.freeze({
    GameObject,
    Player,
    Tile,
    Blob,
});
