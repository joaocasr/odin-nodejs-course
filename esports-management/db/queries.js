import pool from "./pool.js";

const db = {
    getSeasons: async () => {
        const { rows } = await pool.query("SELECT * FROM seasons;");
        return rows;
    },
    getSeasonGroups: async (season) => {
        const { rows } = await pool.query(`SELECT
            g.group_id,
            g.group_name,
            t.team_id,
            gst.wins,
            gst.draws,
            gst.losses,
            gst.points,
            gst.goals_for,
            gst.goals_against,
            t.name AS team_name
            FROM groups g
        JOIN group_teams gt ON g.group_id = gt.group_id
        JOIN teams t ON gt.team_id = t.team_id
        JOIN group_standings gst ON gst.team_id = t.team_id AND gst.group_id = g.group_id
        WHERE g.season_id ='${season}'
        ORDER BY g.group_name, t.name;`);
        return rows;
    },
    getknockoutPhaseGames: async (season,phase) => {
        const { rows } = await pool.query(`SELECT 
            km.leg_number,
            km.match_date,
            km.home_team_id,
            km.away_team_id,
            ht.name AS hometeam,
            at.name as awayteam,
            km.home_goals,
            km.away_goals
            FROM knockout_matches km
            JOIN knockout_ties kt ON  km.tie_id = kt.tie_id
            JOIN knockout_rounds kr ON kr.round_id = kt.round_id
            JOIN teams ht ON ht.team_id = km.home_team_id
            JOIN teams at ON at.team_id = km.away_team_id
            WHERE kr.season_id ='${season}' and kr.round_order = '${phase}';`);
        return rows;
    },
    getPlayers: async (seasonid) => {
        const { rows } = await pool.query(`SELECT 
            p.player_id,
            p.name, 
            p.real_name,
            p.country,
            p.position FROM players p
            JOIN player_teams pt ON p.player_id = pt.player_id
            WHERE pt.season_id = ${seasonid};`);
        return rows;
    },
    getPlayer: async (seasonid,playerid) => {
        const { rows } = await pool.query(`SELECT 
            p.player_id,
            p.name,
            p.real_name ,
            p.country ,
            p.position,
            p.goals,
            p.matches,
            p.assists,
            p.yellows,
            p.reds,
            t.team_id AS idteam,
            t.name AS teamname
            FROM players p
            JOIN player_teams pt ON p.player_id = pt.player_id
            JOIN teams t ON t.team_id = pt.team_id
            WHERE pt.season_id = ${seasonid} AND p.player_id = ${playerid}
            LIMIT 1;`);
        return rows;
    },
    getPlayersByName: async (seasonid,name) => {
        const { rows } = await pool.query(`SELECT 
            p.player_id,
            p.name, 
            p.real_name,
            p.country,
            p.position FROM players p
            JOIN player_teams pt ON p.player_id = pt.player_id
            WHERE pt.season_id = ${seasonid} AND LOWER(p.name) LIKE LOWER('%${name}%');`);
        return rows;
    },
    deletePlayer: async (seasonid,idplayer) => {
        const { rows } = await pool.query(`
            DELETE FROM player_teams pt WHERE pt.player_id=${idplayer} AND pt.season_id=${seasonid};
            DELETE FROM players p WHERE p.player_id=${idplayer};
            `);
        return rows;
    },
}

export default db;