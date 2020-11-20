import { Immutable } from "@cadre/ts-utils";
import {
    BaseGame as CadreBaseGame,
    GamelogUnknownVersion,
    Gamelog,
    LobbiedEvent,
} from "@cadre/ts-utils/cadre";
import * as $ from "jquery";
import * as queryString from "query-string";
import { GAMES } from "src/games";
import {
    objectHasProperty,
    UnknownObject,
    unStringify,
    validateURL,
} from "src/utils";
import { viseurConstructed } from "./constructed";
import { ViseurEvents } from "./events";
import { BaseGame } from "./game/base-game";
import { GamelogWithReverses, ViseurGamelog } from "./game/gamelog";
import { BaseGameNamespace, ViseurGameState } from "./game/interfaces";
import { GUI } from "./gui";
import {
    Joueur,
    JoueurConnectionArgs,
    TournamentClient,
    TournamentConnectionArgs,
} from "./joueur";
import { Parser } from "./parser";
import { Renderer } from "./renderer";
import { BaseSetting, ViseurSettings } from "./settings";
import { TimeManager } from "./time-manager";

/** The possible types a parsed query string can result in values from. */
type QueryStringTypes = undefined | null | string | string[];

/** A game state with an index signature to be delta merged. */
type DeltaMergeableGameState = CadreBaseGame;

/** Data required to play as a human player in a game. */
interface PlayAsHumanData
    extends TournamentConnectionArgs,
        JoueurConnectionArgs {}

/**
 * The container for merged deltas. We only store 2 states as they get HUGE,
 * and if we stored every merged delta storage space could run out.
 */
export interface MergedDelta {
    /** The deltas index in the deltas array. */
    index: number;

    /** The current state at that delta, what we are moving from. */
    currentState?: CadreBaseGame;

    /** The deltas index of the next turn. */
    indexOfNextTurn: number;

    /** The next state of that delta, what we are moving to. */
    nextState?: DeltaMergeableGameState;
}

/** The class that handles all the interconnected-ness of the application. */
export class Viseur {
    //// ---- public ---- \\\\

    /** The game we are rendering and handling input for. */
    public game: BaseGame | undefined;

    /** The graphics user interface handler. */
    public readonly gui: GUI;

    /** Manages the time for the current index and dt during playback. */
    public readonly timeManager: TimeManager;

    /**
     * The renderer that handles textures and base rendering for the
     * visualizer.
     */
    public readonly renderer: Renderer;

    /** Manages all the global (viseur), non-game, related settings. */
    public readonly settings = ViseurSettings;

    /** The gamelog. */
    public gamelog?: ViseurGamelog;

    /** The gamelog in its unparsed json form. */
    public unparsedGamelog?: string;

    /** The raw gamelog. */
    public rawGamelog?: Immutable<GamelogWithReverses>;

    /** All available game namespaces. */
    public games: {
        [gameName: string]: BaseGameNamespace | undefined;
    };

    /** All the events Viseur emits. */
    public readonly events = ViseurEvents;

    //// ---- private ---- \\\\

    /** Parameters parsed from the URL parameters. */
    private urlParameters!: {
        [key: string]: QueryStringTypes;
    }; // set in constructor, which calls parseURL

    /** The gamelog parser. */
    private readonly parser = new Parser();

    /** Our merged delta container. */
    private mergedDelta!: MergedDelta;

    /** Our current merged game states and reasons. */
    private readonly currentState: ViseurGameState = {};

    /** The game client we will use when playing or spectating games. */
    private joueur?: Joueur;

    /** The client to the tournament server. */
    private tournamentClient?: TournamentClient;

    /** Indicates the textures loaded. */
    private loadedTextures = false;

    /** Creates the singleton viseur instance. */
    public constructor() {
        this.games = GAMES;

        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError(
                error ||
                    new Error(
                        typeof message === "string" ? message : message.type,
                    ),
            );
        };

        this.timeManager = new TimeManager(this);
        this.timeManager.events.newIndex.on((index: number) => {
            this.updateCurrentStateAsync(index);
        });

        this.gui = new GUI({
            parent: $(document.body),
            viseur: this,
        });

        this.renderer = new Renderer({
            parent: this.gui.rendererWrapper,
            viseur: this,
        });

        this.gui.events.resized.on((resized) => {
            this.renderer.resize(resized.width, resized.remainingHeight);
        });
        this.gui.resize();

        this.renderer.events.rendering.on(() => {
            if (this.game) {
                const time = this.timeManager.getCurrentTime();
                this.events.timeUpdated.emit(time);
                this.game.render(time.dt);
            }
        });

        viseurConstructed.emit(this);

        this.parseURL();
    }

    /**
     * Returns the current state of the game.
     *
     * @returns The current state, which is a custom object containing
     * the current `game` state and the `nextGame` state.
     */
    public getCurrentState(): Immutable<ViseurGameState> {
        return this.currentState as Immutable<ViseurGameState>;
    }

    /**
     * Connects to a game server to spectate some game.
     *
     * @param server - The server is running on (without port).
     * @param port - The port the server is running on.
     * @param gameName - The name of the game to spectate.
     * @param session - The session to spectate.
     */
    public spectate(
        server: string,
        port: number,
        gameName: string,
        session: string,
    ): void {
        this.gui.modalMessage("Spectating game...");

        this.createJoueur({
            server,
            port,
            gameName,
            session,
            spectating: true,
        });
    }

    /**
     * Starts up "arena" mode, which grabs gamelogs from a url, then plays
     * it, then repeats.
     *
     * @param url - The url to start grabbing arena gamelog urls from.
     * @param presentationMode - True if should auto fullscreen,
     * false otherwise.
     * @param legacyMode - True if legacy mode (old python arena),
     * false otherwise.
     */
    public startArenaMode(
        url: string,
        presentationMode = true,
        legacyMode = false,
    ): void {
        if (validateURL(url)) {
            this.urlParameters.arena = url;

            if (presentationMode) {
                // this way the url parm will be ?presentation, no value.
                // it's presence tell us we want it
                this.urlParameters.presentation = null;
            }

            if (legacyMode) {
                this.urlParameters.legacy = null;
            }

            // this refreshes the page, as we want
            location.search = queryString.stringify(this.urlParameters);
        } else {
            this.gui.modalError("Invalid url for arena mode");
        }
    }

    /**
     * Connects to a game server to play a game for the human controlling this Viseur.
     *
     * @param args - The args to send to the joueur client.
     */
    public playAsHuman(args: Immutable<PlayAsHumanData>): void {
        this.gui.modalMessage("Connecting to game server...");

        this.createJoueur(args);
    }

    /**
     * Checks if there is currently a human playing.
     *
     * @returns True if there is a human player, false otherwise (including spectator mode).
     */
    public hasHumanPlaying(): boolean {
        return Boolean(this.game && this.game.humanPlayer);
    }

    /**
     * Runs some function the server for a game object.
     *
     * @param callerID - The id of the caller.
     * @param functionName - The name function to run (as a string).
     * @param args - An object of key/value pairs for the function to run.
     * @param callback - An optional callback to invoke once run, is passed
     * the return value.
     */
    public runOnServer(
        callerID: string,
        functionName: string,
        args: UnknownObject,
        callback?: (returned: unknown) => void,
    ): void {
        if (!this.joueur) {
            throw new Error("No game client to run game logic for.");
        }

        this.joueur.run(callerID, functionName, args);

        if (callback) {
            this.joueur.events.ran.once(callback);
        }
    }

    /**
     * Connects to a tournament server to wait for play data to later connect
     * as a human client.
     *
     * @param server - The server tournament server is running on
     * (without port).
     * @param port - The port the server is running on.
     * @param playerName - The name of the player in the tournament.
     */
    public connectToTournament(
        server: string,
        port: number,
        playerName: string,
    ): void {
        this.doubleLog("Connecting to tournament server...");

        this.tournamentClient = new TournamentClient(this);

        this.tournamentClient.events.error.on((err) => {
            this.gui.modalError(err.message);
        });

        this.tournamentClient.events.connected.on(() => {
            this.doubleLog("Connected to tournament server, awaiting game.");
        });

        this.tournamentClient.events.closed.on(() => {
            this.events.connectionMessage.emit(
                "Connected to tournament server closed.",
            );
        });

        this.tournamentClient.events.playing.on(() => {
            this.events.connectionMessage.emit(
                `Now playing ${String(this.game && this.game.name)}`,
            );
        });

        this.tournamentClient.events.messaged.on((message) => {
            this.events.connectionMessage.emit(
                `Message from tournament server: '${message}'`,
            );
        });

        this.tournamentClient.connect({ server, port, playerName });
    }

    /**
     * Handles an uncaught error, if this gets hit something **BAD** happened.
     *
     * @param error - The uncaught error.
     */
    public handleError(error: Error): void {
        if (this.gui) {
            this.gui.modalError(
                `Uncaught Error: '${error.name}' = '${error.message}'`,
            );
        }
    }

    /**
     * Does an ajax call to load a remote gamelog at some url.
     *
     * @param url - A url that will respond with the gamelog to load.
     */
    public loadRemoteGamelog(url: string): void {
        this.gui.modalMessage("Loading remote gamelog");
        this.events.gamelogIsRemote.emit({ url });

        void $.ajax({
            url,
            dataType: "text",
            crossDomain: true,
            success: (jsonGamelog: string) => {
                this.gui.modalMessage("Initializing Visualizer.");
                this.parseGamelog(jsonGamelog);
            },
            error: () => {
                this.gui.modalError("Error loading remote gamelog.");
            },
        });
    }

    /**
     * Parses a json string to a gamelog.
     *
     * @param jsonGamelog - The json formatted string that is the gamelog.
     */
    public parseGamelog(jsonGamelog: string): void {
        this.unparsedGamelog = jsonGamelog;

        let parsed: GamelogUnknownVersion;
        try {
            parsed = JSON.parse(jsonGamelog) as GamelogUnknownVersion;
        } catch (err) {
            this.gui.modalError(
                "Error parsing gamelog - Does not appear to be valid JSON",
            );

            return;
        }

        this.gamelogLoaded(this.ensureLatestGamelog(parsed));
    }

    /**
     * Ensure the structure of a gamelog is the latest version.
     *
     * @param gamelog - The gamelog to check and ensure.
     * @returns A gamelog that will have the latest structure for certain.
     */
    private ensureLatestGamelog(gamelog: GamelogUnknownVersion): Gamelog {
        if (objectHasProperty(gamelog, "gamelogVersion")) {
            return gamelog;
        }
        // Else we are unsure if this gamelog is an old version we need to patch to the newest structure

        if (objectHasProperty(gamelog, "settings")) {
            return {
                gamelogVersion: "2.0.0",
                gameVersion: "unknown",
                ...gamelog,
            };
        }

        const { randomSeed, ...oldGamelog } = gamelog;

        return {
            gamelogVersion: "1.0.0",
            gameVersion: "unknown",
            settings: {
                note:
                    "This is an old gamelog that is lacking complete saved settings",
                randomSeed,
            },
            ...oldGamelog,
        };
    }

    /**
     * Parses URL parameters and does whatever they do, ignores unknown url
     * parameters.
     */
    private parseURL(): void {
        this.urlParameters = queryString.parse(location.search) as {
            [key: string]: QueryStringTypes;
        };

        // set Settings via url parameters if they are valid
        for (const key of Object.keys(this.urlParameters)) {
            const setting = (this.settings as {
                [key: string]: BaseSetting | undefined;
            })[key];

            if (setting) {
                const value = this.urlParameters[key];
                if (value !== undefined) {
                    setting.set(
                        Array.isArray(value)
                            ? value.map(unStringify)
                            : unStringify(value),
                    );
                }
            }
        }

        // check if the gamelog url is remote
        const logUrl =
            this.urlParameters.log ||
            this.urlParameters.logUrl ||
            this.urlParameters.logURL;
        if (typeof logUrl === "string") {
            this.loadRemoteGamelog(logUrl);
        } else if (typeof this.urlParameters.arena === "string") {
            // then we are in arena mode
            this.gui.modalMessage("Requesting next gamelog from Arena...");
            const arenaUrl = this.urlParameters.arena;

            // load the gamelog (modal should be fullscreen already)
            if (objectHasProperty(this.urlParameters, "legacy")) {
                // legacy mode, hit-up the url for a gamelog url
                // NOTE: would be better with async/await syntax, however I don't want to bloat the build with that
                // polyfill for just this usage.
                this.getRemoteGamelogUrl(arenaUrl)
                    .then((gamelogUrl) => this.loadRemoteGamelog(gamelogUrl))
                    .catch((err) =>
                        this.gui.modalError(
                            `Error loading legacy gamelog url: ${String(err)}`,
                        ),
                    );
            } else {
                // url directly points to gamelog
                this.loadRemoteGamelog(arenaUrl);
            }

            const presentationMode = objectHasProperty(
                this.urlParameters,
                "presentation",
            );
            if (presentationMode) {
                this.events.delayedReady.on(() => {
                    this.gui.goFullscreen();
                    this.timeManager.play();
                });
            }

            // When we finish playback (the timer reaches its end), wait 5 seconds
            //  then reload the window (which will grab a new gamelog and do all this again)
            this.timeManager.events.ended.on(() => {
                window.setTimeout(() => {
                    location.reload();
                }, 5000);
            });
        }
    }

    /**
     * Called once a gamelog is loaded.
     *
     * @param gamelog - The deserialized JSON object that is the FULL gamelog.
     */
    private gamelogLoaded(gamelog: Immutable<ViseurGamelog>): void {
        this.rawGamelog = gamelog;
        this.parser.updateConstants(gamelog.constants);

        if (!gamelog.streaming) {
            this.events.gamelogLoaded.emit(gamelog);
        }
        // else we didn't "load" the gamelog, and thus it's streaming to us

        // we keep the current and next state here, fully merged with all game information.
        const delta = gamelog.deltas[0];
        this.mergedDelta = {
            index: -1,
            currentState: undefined,
            // clone the current game state into an empty object
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nextState: this.parser.mergeDelta({} as any, delta.game),
            indexOfNextTurn: 0,
        };

        if (!this.joueur && gamelog.deltas.length > 0) {
            this.createGame(gamelog.gameName);
        }
    }

    /**
     * Initializes the Game object for the specified gameName.
     * The class created will be the one in `src/games/{gameName}/game.js`.
     *
     * @param gameName - The name of the game to initialize. Must be a valid
     * game name, or throws an error.
     * @param playerID - The id of the player if this game has a human player.
     */
    private createGame(gameName: string, playerID?: string): void {
        const gameNamespace = this.games[gameName];

        if (!gameNamespace) {
            throw new Error(`Cannot load data for game '${gameName}'.`);
        }

        if (this.game) {
            throw new Error("Viseur game already initialized");
        }

        if (!this.joueur) {
            this.updateCurrentState(0); // create the initial states
            this.timeManager.setTime(0, 0);
        }

        this.game = new gameNamespace.Game(this, this.rawGamelog, playerID);

        // preload all textures
        this.renderer.loadTextures(() => {
            this.loadedTextures = true;
            this.checkIfReady();
        });
    }

    /**
     * Invokes updateCurrentState asynchronously if it may take a long time, so the gui can update.
     *
     * @param index - The new states index, must be between [0, deltas.length].
     */
    private updateCurrentStateAsync(index: number): void {
        this.updateCurrentState(index);
    }

    /**
     * Brings the current state & next state to the one at the specified index.
     * If the current and passed in indexes are far apart this operation can
     * take a decent chunk of time...
     *
     * @param index - The new states index, must be between [0, deltas.length].
     */
    private updateCurrentState(index: number): void {
        if (this.settings.playbackMode.get() == "turns") {
            this.updateCurrentTurn(index);
        } else {
            this.updateCurrentDelta(index);
        }
    }

    /**
     * Brings the current state & next state to the one at the specified index.
     * If the current and passed in indexes are far apart this operation can
     * take a decent chunk of time...
     *
     * @param index - The new states index, must be between [0, deltas.length].
     */
    private updateCurrentDelta(index: number): void {
        if (!this.rawGamelog) {
            throw new Error(
                "cannot update current state deltas without a gamelog",
            );
        }

        const d = this.mergedDelta;
        const deltas = this.rawGamelog.deltas;

        if (index < 0) {
            this.currentState.game = d.currentState;
            this.currentState.nextGame = d.nextState;
            this.currentState.delta = undefined;

            return;
        }

        const indexChanged = index !== d.index;
        d.currentState = (d.currentState || {}) as CadreBaseGame;

        // if increasing index...
        while (index > d.index) {
            d.index++;

            if (deltas[d.index] && !deltas[d.index].reversed) {
                deltas[d.index].reversed = this.parser.createReverseDelta(
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    d.currentState as {},
                    deltas[d.index].game,
                );
            }

            if (
                d.nextState &&
                deltas[d.index] &&
                deltas[d.index + 1] &&
                !deltas[d.index + 1].reversed
            ) {
                deltas[d.index + 1].reversed = this.parser.createReverseDelta(
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    d.nextState as {},
                    deltas[d.index + 1].game,
                );
            }

            if (deltas[d.index]) {
                d.currentState = this.parser.mergeDelta(
                    d.currentState,
                    deltas[d.index].game,
                );
            }

            if (d.nextState && deltas[d.index + 1]) {
                // if there is a next state (not at the end)
                d.nextState = this.parser.mergeDelta(
                    d.nextState,
                    deltas[d.index + 1].game,
                );
            }

            this.updateStepped(d);
        }

        // if decreasing index...
        while (index < d.index) {
            const r = deltas[d.index] && deltas[d.index].reversed;
            const r2 =
                d.nextState &&
                deltas[d.index + 1] &&
                deltas[d.index + 1].reversed;

            if (r) {
                d.currentState = this.parser.mergeDelta(
                    d.currentState,
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    r as {},
                );
            }

            if (r2) {
                if (deltas[d.index + 1]) {
                    // if there is a next state (not at the end)
                    d.nextState = this.parser.mergeDelta(
                        d.nextState as CadreBaseGame,
                        // eslint-disable-next-line @typescript-eslint/ban-types
                        r2 as {},
                    );
                }
            }

            d.index--;
            this.updateStepped(d);
        }

        if (indexChanged) {
            this.updateStepped(d);
            this.events.stateChanged.emit(this.currentState);
        }
    }

    /**
     * Gets the turn number from the current game state, or -1.
     *
     * @param state - The state to retrieve the turn number from.
     * @returns Turn number of the given state.
     */
    private getTurnNumber(state: CadreBaseGame): number {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (state["currentTurn"] === undefined) {
            return -1;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return state["currentTurn"] as number;
    }

    /**
     * Brings the current state & next state to the one at the specified turn.
     * If the current and passed in turns are far apart this operation can
     * take a decent chunk of time...
     *
     * @param turn - The new state's turn.
     */
    private updateCurrentTurn(turn: number): void {
        if (!this.rawGamelog) {
            throw new Error(
                "cannot update current state deltas without a gamelog",
            );
        }

        const d = this.mergedDelta;
        const deltas = this.rawGamelog.deltas;

        if (turn < 0) {
            this.currentState.game = d.currentState;
            this.currentState.nextGame = d.nextState;
            this.currentState.delta = undefined;
            return;
        }

        const originalIndex = d.index;
        d.currentState = (d.currentState || {}) as CadreBaseGame;
        let currentTurn = this.getTurnNumber(d.currentState);

        // Update current state backward to the previous turn
        // We will then move forward so that we land on the first delta of the current turn
        while (turn - 1 < currentTurn && d.index > 0) {
            const r = deltas[d.index] && deltas[d.index].reversed;

            if (r) {
                d.currentState = this.parser.mergeDelta(
                    d.currentState,
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    r as {},
                );
                currentTurn = this.getTurnNumber(d.currentState);
            }

            d.index--;
        }

        // Update current state forward
        while (turn > currentTurn) {
            d.index++;

            // Stop if there are no more deltas
            if (!deltas[d.index]) {
                break;
            }

            if (deltas[d.index] && !deltas[d.index].reversed) {
                deltas[d.index].reversed = this.parser.createReverseDelta(
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    d.currentState as {},
                    deltas[d.index].game,
                );
            }

            if (deltas[d.index]) {
                d.currentState = this.parser.mergeDelta(
                    d.currentState,
                    deltas[d.index].game,
                );
                currentTurn = this.getTurnNumber(d.currentState);
            }
        }

        // Update next state
        if (!d.nextState) {
            throw new Error("no next state");
        }
        let nextTurn = this.getTurnNumber(d.nextState);
        // Update next state backward to the current turn
        // We will then move forward so that we land on the first delta of the next turn
        while (turn < nextTurn && d.indexOfNextTurn > 0) {
            const r =
                deltas[d.indexOfNextTurn] &&
                deltas[d.indexOfNextTurn].reversed;

            if (r) {
                // eslint-disable-next-line @typescript-eslint/ban-types
                d.nextState = this.parser.mergeDelta(d.nextState, r as {});
                nextTurn = this.getTurnNumber(d.nextState);
            }

            d.indexOfNextTurn--;
        }
        // Now move forward to the first of the next turn
        while (nextTurn < turn + 1) {
            d.indexOfNextTurn++;

            // Stop if there are no more deltas
            if (!deltas[d.indexOfNextTurn]) {
                break;
            }

            if (
                deltas[d.indexOfNextTurn] &&
                !deltas[d.indexOfNextTurn].reversed
            ) {
                deltas[
                    d.indexOfNextTurn
                ].reversed = this.parser.createReverseDelta(
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    d.nextState as {},
                    deltas[d.indexOfNextTurn].game,
                );
            }

            if (deltas[d.indexOfNextTurn]) {
                d.nextState = this.parser.mergeDelta(
                    d.nextState,
                    deltas[d.indexOfNextTurn].game,
                );
                nextTurn = this.getTurnNumber(d.nextState);
            }
        }

        if (d.index != originalIndex) {
            this.updateStepped(d);
            this.events.stateChanged.emit(this.currentState);
        }
    }

    /**
     * Invoked when we step 1 delta away from the old current.
     *
     * @param d - The current delta states.
     */
    private updateStepped(d: Immutable<MergedDelta>): void {
        if (!this.rawGamelog) {
            return;
        }

        const deltas = this.rawGamelog.deltas;

        const delta = deltas[d.index];
        const nextDelta = deltas[d.index + 1];

        this.currentState.game = d.currentState;
        this.currentState.nextGame = d.nextState;
        this.currentState.delta = delta;
        this.currentState.nextDelta = nextDelta;

        this.events.stateChangedStep.emit(
            this.currentState as Immutable<ViseurGameState>,
        );
    }

    /**
     * Called when Viseur thinks it is ready, meaning the renderer has
     * downloaded all assets, the gamelog is loaded, and the game class as been
     * initialized.
     */
    private checkIfReady(): void {
        if (
            this.loadedTextures &&
            (!this.joueur || this.joueur.hasStarted())
        ) {
            // then we are ready to start
            this.gui.hideModal();
            this.events.ready.emit({
                game: this.game as BaseGame,
                gamelog: this.rawGamelog as Immutable<Gamelog>,
            });

            // HACK: wait 1 second, then resize the gui because the panel
            //       sometimes (seemingly randomly) is the wrong height
            window.setTimeout(() => {
                this.gui.hideModal();
                this.gui.resize();
                if (this.hasHumanPlaying()) {
                    // deltas may have streamed in while we were setting up, so fast forward to the last delta
                    this.timeManager.setTime(
                        (this.rawGamelog as Immutable<Gamelog>).deltas.length -
                            1,
                        0.9999,
                    );
                }
                this.events.delayedReady.emit(); // ready, but delayed so we are super ready (arena mode play)
            }, 1000);
        }
    }

    /**
     * Logs a string to the modal and connection tab.
     *
     * @param message - The string to log.
     */
    private doubleLog(message: string): void {
        this.gui.modalMessage(message);
        this.events.connectionMessage.emit(message);
    }

    /**
     * Initializes the Joueur (game client).
     *
     * @param args - Argus to connect with.
     */
    private createJoueur(args: JoueurConnectionArgs): void {
        this.joueur = new Joueur(this);

        this.rawGamelog = this.joueur.getGamelog() as Immutable<Gamelog>;

        this.joueur.events.connected.on(() => {
            this.gui.modalMessage("Awaiting game to start...");

            this.events.connectionConnected.emit();
        });

        let lobbiedData: LobbiedEvent["data"] | undefined;
        this.joueur.events.lobbied.on((data) => {
            lobbiedData = data;
            this.gui.modalMessage(
                `In lobby '${data.gameSession}' for '${data.gameName}'. Waiting for game to start.`,
            );
        });

        this.joueur.events.start.on(() => {
            if (!this.joueur) {
                throw new Error("Joueur client destroyed before game started");
            }

            if (!lobbiedData) {
                throw new Error("Game started before being lobbied!");
            }

            this.createGame(lobbiedData.gameName, this.joueur.getPlayerID());
            this.checkIfReady();
        });

        this.joueur.events.error.on((err) => {
            this.gui.modalError("Connection error");
            this.events.connectionError.emit(err);
        });

        this.joueur.events.closed.on((data) => {
            this.events.connectionClosed.emit(data);
        });

        this.joueur.events.delta.on(() => {
            if (this.rawGamelog && this.rawGamelog.deltas.length === 1) {
                this.gamelogLoaded(this.rawGamelog as Immutable<Gamelog>);
            }

            this.events.gamelogUpdated.emit(
                this.rawGamelog as Immutable<Gamelog>,
            );
        });

        this.joueur.events.over.on((data) => {
            this.events.gamelogFinalized.emit({
                gamelog: this.rawGamelog as Immutable<Gamelog>,
                url: data.gamelogURL,
            });
        });

        this.joueur.events.fatal.on((data) => {
            this.gui.modalError(
                `Fatal game server event: ${String(data.message)}`,
            );
        });

        this.joueur.connect(args);
    }

    /**
     * Hits up a remote url expecting the text response to be a url to a
     * gamelog.
     *
     * @param url - The url to query.
     * @returns A promise that might resolve to the url, or reject if an
     * error occurs.
     */
    private getRemoteGamelogUrl(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            void $.ajax({
                dataType: "text",
                url,
                crossDomain: true,
                success: (gamelogURL: string) => {
                    resolve(gamelogURL);
                },
                error: (err) => {
                    reject(err);
                },
            });
        });
    }
}
