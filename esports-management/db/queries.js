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
        console.log(rows)
        return rows;
    }
}

export default db;