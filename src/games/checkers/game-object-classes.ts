// Do not modify this file
// This is a simple lookup object for each GameObject class
import { IGameObjectClasses } from "src/viseur/game/interfaces";
import { Checker } from "./checker";
import { GameObject } from "./game-object";
import { Player } from "./player";

/** All the non Game classes in this game */
export const GameObjectClasses: Readonly<IGameObjectClasses> = Object.freeze({
    GameObject,
    Player,
    Checker,
});
