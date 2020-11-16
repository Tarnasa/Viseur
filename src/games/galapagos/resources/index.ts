import { createResources, load } from "src/viseur/renderer";

/** These are the resources (sprites) that are loaded and usable by game objects in Galapagos. */
export const GameResources = createResources("Galapagos", {
    // <<-- Creer-Merge: resources -->>
    //floor: load("floor.png"),
    dirt: load("floor.png"),
    creatureMisc: load("creature_misc.png", {
        sheet: {
            axis: "x",
            width: 2,
            height: 2,
        },
    }),
    armors: load("creature_armors.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    arms: load("creature_arms.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    eyes: load("creature_eyes.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    jaws: load("creature_jaws.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    backLegs: load("creature_legs_back.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    frontLegs: load("creature_legs_front.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    spikes: load("creature_spikes.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    tails: load("creature_tails.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    teeth: load("creature_teeth.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    plants: load("plants.png", {
        sheet: {
            axis: "x",
            width: 4,
            height: 4,
        },
    }),
    healthbar: load("healthbar_solid.png", {
        sheet: {
            axis: "x",
            width: 1,
            height: 10,
        },
    }),
    grounds: load("tile_ground.png", {
        sheet: {
            axis: "x",
            width: 8,
            height: 4,
        },
    }),
    sand: load("seamless_beach_sand_texture.jpg"),
    egg: load("egg.png"),
    heart: load("heart.png"),
    // <<-- /Creer-Merge: resources -->>
});
