import db from "../db/queries.js";

const inventoryController = {
  getSeasons: async (req, res) =>{
    const seasons = await db.getSeasons()
    res.render('seasons', {"seasons":seasons})
  },
  getGroupStanding: async(res,season,seasonid)=>{
    const groups = await db.getSeasonGroups(seasonid)
    let allgroups = {}
    groups.forEach((team)=>{
      if(allgroups[team.group_name] !== undefined) allgroups[team.group_name].push(team)
      else allgroups[team.group_name] = [team]
    })
    res.render('groups',{"season":season,"seasonid":seasonid,"groups":allgroups, "games": null, "phase": 0})
  },
  getknockoutGames: async(res,season,seasonid,phase)=>{
    const games = await db.getknockoutPhaseGames(seasonid,phase)
    res.render('groups',{"season":season,"seasonid":seasonid, "groups":null,"games": games, "phase": phase})
  }
}
export default inventoryController;