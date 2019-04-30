import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Blobmaster. */
export const GameResources = createResources("Blobmaster", {
    // <<-- Creer-Merge: resources -->>
    floor: load("floor.png"),
    wall: load("wall.png"),
    blobmaster: load("blobmaster.png"),
    blob1: load("blob1.png"),
    blob2: load("blob2.png"),
    blob3: load("blob3.png"),
    dried_blob: load("dried_blob.png"),
    // <<-- /Creer-Merge: resources -->>
});
