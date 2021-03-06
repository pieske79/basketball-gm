import classNames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { helpers } from "../../common";
import { emitter, logEvent, realtimeUpdate, setTitle, toWorker } from "../util";
import { HelpPopover, NewWindowLink } from "../components";

class GodMode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dirty: false,
            disableInjuries: String(props.disableInjuries),
            luxuryPayroll: props.luxuryPayroll,
            luxuryTax: props.luxuryTax,
            maxContract: props.maxContract,
            minContract: props.minContract,
            minPayroll: props.minPayroll,
            minRosterSize: props.minRosterSize,
            maxRosterSize: props.maxRosterSize,
            numGames: props.numGames,
            quarterLength: props.quarterLength,
            salaryCap: props.salaryCap,
            aiTrades: props.aiTrades,
        };
        this.handleChanges = {
            disableInjuries: this.handleChange.bind(this, "disableInjuries"),
            luxuryPayroll: this.handleChange.bind(this, "luxuryPayroll"),
            luxuryTax: this.handleChange.bind(this, "luxuryTax"),
            maxContract: this.handleChange.bind(this, "maxContract"),
            minContract: this.handleChange.bind(this, "minContract"),
            minPayroll: this.handleChange.bind(this, "minPayroll"),
            minRosterSize: this.handleChange.bind(this, "minRosterSize"),
            maxRosterSize: this.handleChange.bind(this, "maxRosterSize"),
            numGames: this.handleChange.bind(this, "numGames"),
            quarterLength: this.handleChange.bind(this, "quarterLength"),
            salaryCap: this.handleChange.bind(this, "salaryCap"),
            aiTrades: this.handleChange.bind(this, "aiTrades"),
        };
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleGodModeToggle = this.handleGodModeToggle.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.dirty) {
            this.setState({
                disableInjuries: String(nextProps.disableInjuries),
                luxuryPayroll: nextProps.luxuryPayroll,
                luxuryTax: nextProps.luxuryTax,
                maxContract: nextProps.maxContract,
                minContract: nextProps.minContract,
                minPayroll: nextProps.minPayroll,
                minRosterSize: nextProps.minRosterSize,
                maxRosterSize: nextProps.maxRosterSize,
                numGames: nextProps.numGames,
                quarterLength: nextProps.quarterLength,
                salaryCap: nextProps.salaryCap,
                aiTrades: String(nextProps.aiTrades),
            });
        }
    }

    handleChange(name, e) {
        this.setState({
            dirty: true,
            [name]: e.target.value,
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        await toWorker("updateGameAttributes", {
            disableInjuries: this.state.disableInjuries === "true",
            numGames: parseInt(this.state.numGames, 10),
            quarterLength: parseFloat(this.state.quarterLength),
            minRosterSize: parseInt(this.state.minRosterSize, 10),
            maxRosterSize: parseInt(this.state.maxRosterSize, 10),
            salaryCap: parseInt(this.state.salaryCap * 1000, 10),
            minPayroll: parseInt(this.state.minPayroll * 1000, 10),
            luxuryPayroll: parseInt(this.state.luxuryPayroll * 1000, 10),
            luxuryTax: parseFloat(this.state.luxuryTax),
            minContract: parseInt(this.state.minContract * 1000, 10),
            maxContract: parseInt(this.state.maxContract * 1000, 10),
            aiTrades: this.state.aiTrades === "true",
        });

        this.setState({
            dirty: false,
        });

        logEvent({
            type: "success",
            text: "God Mode options successfully updated.",
            saveToDb: false,
        });

        realtimeUpdate(["toggleGodMode"], helpers.leagueUrl(["god_mode"]));
    }

    async handleGodModeToggle() {
        const attrs = { godMode: !this.props.godMode };

        if (attrs.godMode) {
            attrs.godModeInPast = true;
        }

        await toWorker("updateGameAttributes", attrs);
        emitter.emit("updateTopMenu", { godMode: attrs.godMode });
        realtimeUpdate(["toggleGodMode"]);
    }

    render() {
        const { godMode } = this.props;

        setTitle("God Mode");

        return (
            <div>
                <h1>
                    God Mode <NewWindowLink />
                </h1>

                <p>
                    God Mode is a collection of customization features that
                    allow you to kind of do whatever you want. If you enable God
                    Mode, you get access to the following features (which show
                    up in the game as{" "}
                    <span className="god-mode god-mode-text">purple text</span>):
                </p>

                <ul>
                    <li>
                        Create custom players by going to Tools > Create A
                        Player
                    </li>
                    <li>
                        Edit any player by going to their player page and
                        clicking Edit Player
                    </li>
                    <li>
                        Force any trade to be accepted by checking the Force
                        Trade checkbox before proposing a trade
                    </li>
                    <li>You can become the GM of another team at any time</li>
                    <li>You will never be fired!</li>
                    <li>You will be able to change the options below</li>
                </ul>

                <p>
                    However, if you enable God Mode within a league, you will
                    not get credit for any <a href="/account">Achievements</a>.
                    This persists even if you disable God Mode. You can only get
                    Achievements in a league where God Mode has never been
                    enabled.
                </p>

                <button
                    className={classNames(
                        "btn",
                        godMode ? "btn-success" : "btn-danger",
                    )}
                    onClick={this.handleGodModeToggle}
                >
                    {godMode ? "Disable God Mode" : "Enable God Mode"}
                </button>

                <h2 style={{ marginTop: "1em" }}>God Mode Options</h2>

                <p className="text-danger">
                    These options are not well tested and might make the AI do
                    weird things.
                </p>

                <form onSubmit={this.handleFormSubmit}>
                    <div className="row">
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>
                                Injuries{" "}
                                <HelpPopover placement="right" title="Injuries">
                                    This won't heal current injuries, but it
                                    will prevent any new ones from occurring.
                                </HelpPopover>
                            </label>
                            <select
                                className="form-control"
                                disabled={!godMode}
                                onChange={this.handleChanges.disableInjuries}
                                value={this.state.disableInjuries}
                            >
                                <option value="false">Enabled</option>
                                <option value="true">Disabled</option>
                            </select>
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>
                                # Games Per Season{" "}
                                <HelpPopover
                                    placement="left"
                                    title="# Games Per Season"
                                >
                                    This will only apply to seasons that have
                                    not started yet.
                                </HelpPopover>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={!godMode}
                                onChange={this.handleChanges.numGames}
                                value={this.state.numGames}
                            />
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Quarter Length (minutes)</label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={!godMode}
                                onChange={this.handleChanges.quarterLength}
                                value={this.state.quarterLength}
                            />
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Trades Between AI Teams</label>
                            <select
                                className="form-control"
                                disabled={!godMode}
                                onChange={this.handleChanges.aiTrades}
                                value={this.state.aiTrades}
                            >
                                <option value="true">Enabled</option>
                                <option value="false">Disabled</option>
                            </select>
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Salary Cap</label>
                            <div className="input-group">
                                <span className="input-group-addon">$</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    disabled={!godMode}
                                    onChange={this.handleChanges.salaryCap}
                                    value={this.state.salaryCap}
                                />
                                <span className="input-group-addon">M</span>
                            </div>
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Min Payroll</label>
                            <div className="input-group">
                                <span className="input-group-addon">$</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    disabled={!godMode}
                                    onChange={this.handleChanges.minPayroll}
                                    value={this.state.minPayroll}
                                />
                                <span className="input-group-addon">M</span>
                            </div>
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Luxury Tax Threshold</label>
                            <div className="input-group">
                                <span className="input-group-addon">$</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    disabled={!godMode}
                                    onChange={this.handleChanges.luxuryPayroll}
                                    value={this.state.luxuryPayroll}
                                />
                                <span className="input-group-addon">M</span>
                            </div>
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>
                                Luxury Tax{" "}
                                <HelpPopover
                                    placement="left"
                                    title="Luxury Tax"
                                >
                                    Take the difference between a team's payroll
                                    and the luxury tax threshold. Multiply that
                                    by this number. The result is the penalty
                                    they have to pay.
                                </HelpPopover>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={!godMode}
                                onChange={this.handleChanges.luxuryTax}
                                value={this.state.luxuryTax}
                            />
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Min Contract</label>
                            <div className="input-group">
                                <span className="input-group-addon">$</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    disabled={!godMode}
                                    onChange={this.handleChanges.minContract}
                                    value={this.state.minContract}
                                />
                                <span className="input-group-addon">M</span>
                            </div>
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Max Contract</label>
                            <div className="input-group">
                                <span className="input-group-addon">$</span>
                                <input
                                    type="text"
                                    className="form-control"
                                    disabled={!godMode}
                                    onChange={this.handleChanges.maxContract}
                                    value={this.state.maxContract}
                                />
                                <span className="input-group-addon">M</span>
                            </div>
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Min Roster Size</label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={!godMode}
                                onChange={this.handleChanges.minRosterSize}
                                value={this.state.minRosterSize}
                            />
                        </div>
                        <div className="col-sm-3 col-xs-6 form-group">
                            <label>Max Roster Size</label>
                            <input
                                type="text"
                                className="form-control"
                                disabled={!godMode}
                                onChange={this.handleChanges.maxRosterSize}
                                value={this.state.maxRosterSize}
                            />
                        </div>
                    </div>

                    <button className="btn btn-primary" disabled={!godMode}>
                        Save God Mode Options
                    </button>
                </form>
            </div>
        );
    }
}

GodMode.propTypes = {
    disableInjuries: PropTypes.bool.isRequired,
    godMode: PropTypes.bool.isRequired,
    luxuryPayroll: PropTypes.number.isRequired,
    luxuryTax: PropTypes.number.isRequired,
    maxContract: PropTypes.number.isRequired,
    minContract: PropTypes.number.isRequired,
    minPayroll: PropTypes.number.isRequired,
    minRosterSize: PropTypes.number.isRequired,
    maxRosterSize: PropTypes.number.isRequired,
    numGames: PropTypes.number.isRequired,
    quarterLength: PropTypes.number.isRequired,
    salaryCap: PropTypes.number.isRequired,
    aiTrades: PropTypes.bool.isRequired,
};

export default GodMode;
