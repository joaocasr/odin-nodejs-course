import db from "../db/queries.js";

const inventoryController = {
  getSeasons: async (req, res) =>{
    const seasons = await db.getSeasons()
    res.render('seasons', {"seasons":seasons})
  },
  getGroupStanding: async(req,res)=>{
    const groups = await db.getSeasonGroups(req.params.season_id)
    let allgroups = {}
    groups.forEach((team)=>{
      if(allgroups[team.group_name] !== undefined) allgroups[team.group_name].push(team)
      else allgroups[team.group_name] = [team]
    })
    console.log(allgroups)
    res.render('groups',{"groups":allgroups})
  }
}
export default inventoryController;