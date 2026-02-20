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
    console.log(allgroups)
    res.render('groups',{"season":season,"seasonid":seasonid,"groups":allgroups, "games": null, "phase": 0})
  },
  getknockoutGames: async(res,season,seasonid,phase)=>{
    const games = await db.getknockoutPhaseGames(seasonid,phase)
    res.render('groups',{"season":season,"seasonid":seasonid, "groups":null,"games": games, "phase": phase})
  },
  getPlayers: async(res,season,seasonid)=>{
    const players = await db.getPlayers(seasonid)
    res.render('players',{"players":players,"season":season,"seasonid":seasonid,"search":false})
  }, 
  getPlayer: async(res,seasonid,playerid)=>{
    const players = await db.getPlayer(seasonid,playerid)
    console.log(players[0])
    res.render('playerdetails',{"player":players[0],"isocode":countryToAlpha2(players[0].country).toLowerCase()})
  },
  getTeams: async(req,res)=>{
    const teams = await db.getAllTeamsInfo()
    res.render('teams',{"teams":teams})

  },
  getPlayersByName: async(res,season,seasonid,name)=>{
    const players = await db.getPlayersByName(seasonid,name)
    res.render('players',{"players":players,"season":season,"seasonid":seasonid,"name":name,"search":true})
  },
  deletePlayer:async(res,season,seasonid,idplayer)=>{
    const players = await db.deletePlayer(seasonid,idplayer)
  },
  addSeason: async(req,res) =>{
    const seasons = await db.getAvailableSeasons()
    res.render('create-season.ejs',{"seasons":seasons})
  },
  createSeason: async(req,res,season) =>{
    await db.addSeason(season)
  },
  addGroups: async(req,res) =>{
    const teams = await db.getAllTeams()
    console.log(teams)
    res.render('allocate-groups.ejs',{"teams":teams})
  },
  addTeams: async(req,res) =>{
    const teamid = await db.getNextTeamId()
    console.log(teamid)
    res.render('create-team.ejs',{"teamid":teamid})
  },
  createTeam: async(req,res) =>{
    await db.addTeam(req.body.name,req.body.country,req.body.year)
    const teams = await db.getAllTeamsInfo()
    res.render('teams',{"teams":teams})
  }


}
export default inventoryController;