// controllers/usersController.js
import {body, validationResult, matchedData, check} from "express-validator";
import usersStorage from '../storages/usersStorage.js';

const alphaErr = "must only contain letters or accented letters.";
const lengthErr = "must be between 1 and 10 characters.";
const ageErr = "must be between 18 and 120.";
const emailErr = "The email is not well formatted.";
const bioErr = "must be of maximum of 200 characters";

const validateUser = [
  body("firstName").trim()
    .matches(/^[A-zÀ-ú]+$/).withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 100 }).withMessage(`First name ${lengthErr}`),
  body("lastName").trim()
    .matches(/^[A-zÀ-ú]+$/).withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 100 }).withMessage(`Last name ${lengthErr}`),
  check("age").optional({ checkFalsy: true }).isInt({min: 18, max:120}).withMessage(`Age ${ageErr}`),
  body("email").trim()
    .isEmail().withMessage(`${emailErr}`),
  check("bio").optional({ checkFalsy: true }).isLength({max:200}).withMessage(`Bio ${bioErr}`)

];

const usersController = {
  usersListGet : (req, res) => {
    res.render("index", {
      title: "Users Platform",
      users: usersStorage.getUsers(),
    });
  },

  usersCreateGet : (req, res) => {
    res.render("createUser", {
      title: "Create user",
    });
  },

  usersCreatePost : [
    validateUser,
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("createUser", {
          title: "Create user",
          errors: errors.array(),
        });
      }
      const { id, firstName, lastName, email, age, bio } = matchedData(req);
      usersStorage.addUser({ id, firstName, lastName, email, age, bio });
      res.redirect("/");
    }
  ],

  usersUpdateGet : (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    res.render("updateUser", {
      title: "Update user",
      user: user,
    });
  },

  usersUpdatePost : [
    validateUser,
    (req, res) => {
      const user = usersStorage.getUser(req.params.id);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("updateUser", {
          title: "Update user",
          user: user,
          errors: errors.array(),
        });
      }
      const { id, firstName, lastName, email, age, bio } = matchedData(req);
      usersStorage.updateUser(req.params.id, { id, firstName, lastName, email, age, bio });
      res.redirect("/");
    }
  ],

  usersDeletePost : (req, res) => {
    usersStorage.deleteUser(req.params.id);
    res.redirect("/");
  },

  usersSearch : (req,res) => {
    const name = req.query.name
    res.render("index", {
      title: "Users Platform",
      users: usersStorage.searchUsers(name),
    });
  }
}
export default usersController;
