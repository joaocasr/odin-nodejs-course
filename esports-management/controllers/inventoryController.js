import db from "../db/queries.js";
import { countryToAlpha2 } from "country-to-iso";

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
  },
  getPlayers: async(res,season,seasonid)=>{
    const players = await db.getPlayers(seasonid)
    res.render('players',{"players":players,"season":season,"seasonid":seasonid})
  }, 
  getPlayer: async(res,seasonid,playerid)=>{
    const players = await db.getPlayer(seasonid,playerid)
    console.log(players[0])
    res.render('playerdetails',{"player":players[0],"isocode":countryToAlpha2(players[0].country).toLowerCase()})
  },
  getTeams: async(req,res)=>{

  }
}
export default inventoryController;