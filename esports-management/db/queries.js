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
            gst.played,
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
    createPlayer: async (name,realname,country,position,goals,matches,assists,yellows,reds,teamid,seasonid) => {
        const { rows } = await pool.query(`
            INSERT INTO players (name, real_name, country, position, goals, matches, assists, yellows, reds) VALUES
            ('${name}','${realname}','${country}','${position}',${goals},${matches},${assists},${yellows},${reds});
            INSERT INTO player_teams (player_id,team_id,season_id) VALUES
            ((select p.player_id 
                from player p 
                order by p.player_id desc
                limit 1
            )+1,
            ${teamid},
            ${seasonid}); 
            `);
        return rows;
    },
    getTeamNamesIds: async (seasonid) =>{
        const {rows} = await pool.query(`
            SELECT
            t.name AS teamname,
            t.team_id AS teamid
            FROM groups g
        JOIN group_teams gt ON g.group_id = gt.group_id
        JOIN teams t ON gt.team_id = t.team_id
        WHERE g.season_id = ${seasonid};`)
        return rows;
    },
    getAllTeams: async () =>{
        const {rows} = await pool.query(`
            SELECT
            t.name AS teamname,
            t.team_id AS teamid
            FROM teams t;`)
        return rows;
    },
    getAllTeamsInfo:async () =>{
        const {rows} = await pool.query(`
            SELECT * FROM teams t;`)
        return rows;
    },
    getAvailableSeasons: async () =>{
        let allDates = [];
        for(let d = 1955; d<new Date().getFullYear();d++){
            allDates.push(d+"-"+(d+1))
        }
        const {rows} = await pool.query(`
            SELECT
            s.season_year
            FROM seasons s;`)
        let availableDates = allDates;
        for(let j = 0; j<rows.length;j++){
            let value = rows[j].season_year;
            availableDates = availableDates.filter(function(item) {
                return item !== value
            })
        }
        return availableDates.reverse();
    },
    addSeason: async (season) =>{
        const {rows} = await pool.query(`INSERT INTO seasons (season_year) VALUES ('${season}');`)
        console.log(rows)
        return rows;
    },
    addTeam: async (name,country,year) =>{
        const {rows} = await pool.query(`
            INSERT INTO teams (name, country, founded_year) VALUES
            ('${name}','${country}',${year});
            `)
        return rows;
    },
    getNextTeamId: async () =>{
        const {rows} = await pool.query(`SELECT t.team_id from teams t ORDER BY t.team_id desc LIMIT 1;`)
        let id = -1;
        if(rows.length>0) id = rows[0].team_id
        id+=1
        return id;
    },
    insertGroup: async (groupName, teams) => {
        if (!teams || teams.length === 0) return;
        console.log(teams)
        const seasonId = teams[0].seasonid; // all teams in the group have same season

        try {
            // Begin transaction
            await pool.query('BEGIN');

            // Insert group and get its ID
            const groupRes = await pool.query(
            `INSERT INTO groups (season_id, group_name) 
            VALUES ($1, $2) 
            RETURNING group_id`,
            [seasonId, groupName]
            );
            const groupId = groupRes.rows[0].group_id;

            // Insert into group_teams
            const groupTeamsValues = teams.map((t, i) => `(${groupId}, ${t.teamid})`).join(', ');
            await pool.query(`
            INSERT INTO group_teams (group_id, team_id) VALUES ${groupTeamsValues}
            `);

            // Insert into group_standings
            const standingsValues = teams.map(t =>
            `(${groupId}, ${t.teamid}, ${t.mp}, ${t.w}, ${t.d}, ${t.l}, ${t.gf}, ${t.ga}, ${Number(t.w * 3) + Number(t.d)})`
            ).join(', ');

            await pool.query(`
            INSERT INTO group_standings 
                (group_id, team_id, played, wins, draws, losses, goals_for, goals_against, points) 
            VALUES ${standingsValues}
            `);

            // Commit transaction
            await pool.query('COMMIT');
            console.log(`Group ${groupName} inserted successfully!`);
        } catch (err) {
            await pool.query('ROLLBACK');
            console.error('Error inserting group:', err);
            throw err;
        }
    }
}

export default db;