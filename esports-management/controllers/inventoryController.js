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
    res.render('players',{"players":players,"season":season,"seasonid":seasonid,"search":false})
  }, 
  getPlayer: async(res,seasonid,playerid)=>{
    const players = await db.getPlayer(seasonid,playerid)
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
    await db.deletePlayer(seasonid,idplayer)
  },
  addSeason: async(req,res) =>{
    const seasons = await db.getAvailableSeasons()
    res.render('create-season.ejs',{"seasons":seasons})
  },
  createSeason: async(req,res,season) =>{
    await db.addSeason(season)
  },
  addGroups: async(req,res,seasonid) =>{
    const teams = await db.getAllTeams()
    res.render('allocate-groups.ejs',{"teams":teams,"seasonid":seasonid,"groupsToUpdate":null,"groupNamesToUpdate":null,"groupCounterToUpdate":null})
  },
  insertGroup: async(req,res) =>{
    for (const groupName in req.body["group"]) {
      await db.insertUpdateGroup(groupName, req.body["group"][groupName]);
    }
    const seasons = await db.getSeasons()
    res.render('seasons', {"seasons":seasons})
  },
  updateGroups: async(req,res,seasonid) =>{
    console.log("aqui")
    const groups = await db.getSeasonGroups(seasonid)
    const teams = await db.getAllTeams()
    let allgroups = {}
    groups.forEach((team)=>{
      if(allgroups[team.group_name] !== undefined) allgroups[team.group_name].push(team)
      else allgroups[team.group_name] = [team]
    })
    let groupNames = Object.keys(allgroups);
    let groupCounter = groupNames.length
    res.render('allocate-groups.ejs',{"groupsToUpdate":allgroups,"groupNamesToUpdate":groupNames,"groupCounterToUpdate":groupCounter,"allteams":teams,"teams":teams,"seasonid":seasonid})
  },
  addTeams: async(req,res) =>{
    const teamid = await db.getNextTeamId()
    res.render('create-team.ejs',{"teamid":teamid})
  },
  gotoCreatePage: async(req,res,seasonid) =>{
    const players = await db.getPlayersNamesIds()
    const teams = await db.getTeamNamesIds(seasonid)
    console.log(players)
    res.render('create-player.ejs',{"players":players,"teams":teams,"current_id":players[0].player_id + 1,"seasonid":seasonid})
  },
  createTeam: async(req,res) =>{
    await db.addTeam(req.body.name,req.body.country,req.body.year)
    const teams = await db.getAllTeamsInfo()
    res.render('teams',{"teams":teams})
  },
  createPlayer: async(req,res) =>{
    console.log("hey")
    console.log(req.body)
    await db.createPlayer(
      req.body.playername,
      req.body.playername,
      req.body.country,
      req.body.position,
      req.body.goals,
      req.body.matches,
      req.body.assists,
      req.body.yellows,
      req.body.reds,
      req.body.playerid,
      req.body.teamid,
      req.body.seasonid
    )
    const seasons = await db.getSeasons()
    res.render('seasons', {"seasons":seasons})
  }
}
export default inventoryController;