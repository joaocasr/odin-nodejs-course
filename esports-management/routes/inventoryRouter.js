import Router from "express";
import inventoryController from "../controllers/inventoryController.js";
const inventoryRouter = Router();

inventoryRouter.get("/", inventoryController.getSeasons);

inventoryRouter.get("/seasons/:season_id", function(req,res){
    if(req.query.season && req.query.phase) inventoryController.getknockoutGames(res,req.query.season,req.params.season_id,req.query.phase);
    else if(req.query.season) inventoryController.getGroupStanding(res,req.query.season,req.params.season_id)
});

inventoryRouter.get("/teams", inventoryController.getTeams);
inventoryRouter.get("/players/seasons/:season/:idseason", function(req,res){
    inventoryController.getPlayers(res,req.params.season,req.params.idseason)
});
inventoryRouter.get("/players/:seasonid/:idplayer", function(req,res){
    inventoryController.getPlayer(res,req.params.seasonid,req.params.idplayer)
});

inventoryRouter.get("/search/players/:season/:seasonid", function(req,res){
    if(req.query.name) inventoryController.getPlayersByName(res,req.params.season,req.params.seasonid,req.query.name)
});

inventoryRouter.post("/delete/players/:season/:idseason/:idplayer", async function(req,res){
    await inventoryController.deletePlayer(res,req.params.season,req.params.idseason,req.params.idplayer);
    res.redirect('/players/seasons/'+req.params.season+"/"+req.params.idseason)
})

export default inventoryRouter;
