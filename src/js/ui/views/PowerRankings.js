import PropTypes from "prop-types";
import React from "react";
import { g, helpers } from "../../common";
import { getCols, setTitle } from "../util";
import { DataTable, NewWindowLink } from "../components";

const PowerRankings = ({ teams }) => {
    setTitle("Power Rankings");

    const cols = getCols("O", "P", "69", "Team", "W", "L", "L10", "MOV");
    cols[3].width = "100%";

    const rows = teams.map(t => {
        const performanceRank = t.stats.gp > 0 ? t.performanceRank : "-";

        return {
            key: t.tid,
            data: [
                t.overallRank,
                performanceRank,
                t.talentRank,
                <a href={helpers.leagueUrl(["roster", t.abbrev])}>
                    {t.region} {t.name}
                </a>,
                t.seasonAttrs.won,
                t.seasonAttrs.lost,
                t.seasonAttrs.lastTen,
                <span
                    className={t.stats.mov > 0 ? "text-success" : "text-danger"}
                >
                    {t.stats.mov.toFixed(1)}
                </span>,
            ],
            classNames: {
                info: t.tid === g.userTid,
            },
        };
    });

    return (
        <div>
            <h1>
                Power Rankings <NewWindowLink />
            </h1>

            <p>
                The "Performance" rating is based on point differential and
                recent team performance. The "Talent" rating is based on player
                ratings and stats. The "Overall" rating is a combination of the
                two.
            </p>

            <DataTable
                cols={cols}
                defaultSort={[0, "asc"]}
                name="PowerRankings"
                rows={rows}
            />
        </div>
    );
};

PowerRankings.propTypes = {
    teams: PropTypes.arrayOf(
        PropTypes.shape({
            abbrev: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            overallRank: PropTypes.number.isRequired,
            performanceRank: PropTypes.number.isRequired,
            region: PropTypes.string.isRequired,
            tid: PropTypes.number.isRequired,
            seasonAttrs: PropTypes.shape({
                lastTen: PropTypes.string.isRequired,
                lost: PropTypes.number.isRequired,
                won: PropTypes.number.isRequired,
            }),
            stats: PropTypes.shape({
                mov: PropTypes.number.isRequired,
            }),
        }),
    ).isRequired,
};

export default PowerRankings;
