// This is a "class" to represent the FireDepartment object in the game. If you want to render it in the game do so here.
var Classe = require("classe");
var PIXI = require("pixi.js");
var Color = require("color");
var ease = require("core/utils").ease;

var Building = require("./building");

//<<-- Creer-Merge: requires -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
// any additional requires you want can be required here safely between Creer runs
//<<-- /Creer-Merge: requires -->>

/**
 * @typedef {Object} FireDepartmentState - A state representing a FireDepartment
 * @property {boolean} bribed - When true this building has already been bribed this turn and cannot be bribed again this turn.
 * @property {BuildingState} buildingEast - The Building directly to the east of this building, or null if not present.
 * @property {BuildingState} buildingNorth - The Building directly to the north of this building, or null if not present.
 * @property {BuildingState} buildingSouth - The Building directly to the south of this building, or null if not present.
 * @property {BuildingState} buildingWest - The Building directly to the west of this building, or null if not present.
 * @property {number} fire - How much fire is currently burning the building, and thus how much damage it will take at the end of its owner's turn. 0 means no fire.
 * @property {number} fireExtinguished - The amount of fire removed from a building when bribed to extinguish a building.
 * @property {string} gameObjectName - String representing the top level Class that this game object is an instance of. Used for reflection to create new instances on clients, but exposed for convenience should AIs want this data.
 * @property {number} health - How much health this building currently has. When this reaches 0 the Building has been burned down.
 * @property {string} id - A unique id for each instance of a GameObject or a sub class. Used for client and server communication. Should never change value after being set.
 * @property {boolean} isHeadquarters - True if this is the Headquarters of the owning player, false otherwise. Burning this down wins the game for the other Player.
 * @property {Array.<string>} logs - Any strings logged will be stored here. Intended for debugging.
 * @property {PlayerState} owner - The player that owns this building. If it burns down (health reaches 0) that player gets an additional bribe(s).
 * @property {number} x - The location of the Building along the x-axis.
 * @property {number} y - The location of the Building along the y-axis.
 */

/**
 * @class
 * @classdesc Can put out fires completely.
 * @extends Building
 */
var FireDepartment = Classe(Building, {
    /**
     * Initializes a FireDepartment with basic logic as provided by the Creer code generator. This is a good place to initialize sprites
     *
     * @memberof FireDepartment
     * @param {FireDepartmentState} initialState - the initial state of this game object
     * @param {Game} game - the game this FireDepartment is in
     */
    init: function(initialState, game) {
        Building.init.apply(this, arguments);

        //<<-- Creer-Merge: init -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // initialization logic goes here
        //<<-- /Creer-Merge: init -->>
    },

    /**
     * Static name of the classe.
     *
     * @static
     */
    name: "FireDepartment",

    /**
     * The current state of this FireDepartment. Undefined when there is no current state.
     *
     * @type {FireDepartmentState|null})}
     */
    current: null,

    /**
     * The next state of this FireDepartment. Undefined when there is no next state.
     *
     * @type {FireDepartmentState|null})}
     */
    next: null,

    /**
     * Set this to `true` if this GameObject should be rendered.
     *
     * @static
     */
    //<<-- Creer-Merge: shouldRender -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    shouldRender: true, // Yes we want to show them
    //<<-- /Creer-Merge: shouldRender -->>

    /**
     * Called approx 60 times a second to update and render the FireDepartment. Leave empty if it should not be rendered
     *
     * @param {Number} dt - a floating point number [0, 1) which represents how far into the next turn that current turn we are rendering is at
     * @param {FireDepartmentState} current - the current (most) game state, will be this.next if this.current is null
     * @param {FireDepartmentState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    render: function(dt, current, next, reason, nextReason) {
        Building.render.apply(this, arguments);

        //<<-- Creer-Merge: render -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // render where the FireDepartment is
        //<<-- /Creer-Merge: render -->>
    },

    /**
     * Invoked after init or when a player changes their color, so we have a chance to recolor this GameObject's sprites
     */
    recolor: function() {
        Building.recolor.apply(this, arguments);

        //<<-- Creer-Merge: recolor -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // replace with code to recolor sprites based on player color
        //<<-- /Creer-Merge: recolor -->>
    },

    /**
     * Invoked when the right click menu needs to be shown.
     *
     * @private
     * @returns {Array} array of context menu items, which can be {text, icon, callback} for items, or "---" for a seperator
     */
    _getContextMenu: function() {
        var self = this;
        var menu = [];

        //<<-- Creer-Merge: _getContextMenu -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // add context items to the menu here
        //<<-- /Creer-Merge: _getContextMenu -->>

        return menu;
    },


    // Joueur functions - functions invoked for human playable client

    /**
     * Bribes this FireDepartment to extinguish the some of the fire in a building.
     *
     * @param {BuildingState} building - The Building you want to extinguish.
     * @param {Function} [callback] - callback that is passed back the return value of boolean once ran on the server
     */
    extinguish: function(building, callback) {
        this._runOnServer("extinguish", {
            building: building,
        }, callback);
    },

    // /Joueur functions

    /**
     * Invoked when the state updates.
     *
     * @private
     * @param {FireDepartmentState} current - the current (most) game state, will be this.next if this.current is null
     * @param {FireDepartmentState} next - the next (most) game state, will be this.current if this.next is null
     * @param {DeltaReason} reason - the reason for the current delta
     * @param {DeltaReason} nextReason - the reason for the next delta
     */
    _stateUpdated: function(current, next, reason, nextReason) {
        Building._stateUpdated.apply(this, arguments);

        //<<-- Creer-Merge: _stateUpdated -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
        // update the FireDepartment based on its current and next states
        //<<-- /Creer-Merge: _stateUpdated -->>
    },

    //<<-- Creer-Merge: functions -->> - Code you add between this comment and the end comment will be preserved between Creer re-runs.
    // any additional functions you want to add to this class can be perserved here
    beamColor: Color("#00BFFF"),
    //<<-- /Creer-Merge: functions -->>

});

module.exports = FireDepartment;
