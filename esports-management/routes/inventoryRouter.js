import Router from "express";
import inventoryController from "../controllers/inventoryController.js";
const inventoryRouter = Router();

inventoryRouter.get("/", inventoryController.getSeasons);

inventoryRouter.get("/seasons/:season_id", function(req,res){
    if(req.query.season && req.query.phase) inventoryController.getknockoutGames(res,req.query.season,req.params.season_id,req.query.phase);
    else if(req.query.season) inventoryController.getGroupStanding(res,req.query.season,req.params.season_id)
});

export default inventoryRouter;
