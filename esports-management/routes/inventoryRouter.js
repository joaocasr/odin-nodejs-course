import Router from "express";
import inventoryController from "../controllers/inventoryController.js";
const inventoryRouter = Router();

inventoryRouter.get("/", inventoryController.getSeasons);
inventoryRouter.get("/seasons/:season_id", inventoryController.getGroupStanding);

export default inventoryRouter;
