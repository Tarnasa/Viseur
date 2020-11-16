// Do not modify this file
// This is a simple lookup object for each GameObject class
import { BaseGameObjectClasses } from "src/viseur/game/interfaces";
import { Creature } from "./creature";
import { GameObject } from "./game-object";
import { Plant } from "./plant";
import { Player } from "./player";
import { Tile } from "./tile";

/** All the non Game classes in this game. */
export const GameObjectClasses: Readonly<BaseGameObjectClasses> = Object.freeze(
    {
        GameObject,
        Player,
        Tile,
        Plant,
        Creature,
    },
);
