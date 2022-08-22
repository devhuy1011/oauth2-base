const express = require('express');
const { createUser, signIn, refreshToken } = require('../controllers/auth');
const passport = require("passport");
const { response } = require('express');

require('../middlewares/passport');

const createUserHandler = async (req, res) => {
  const data = req.body;
  const response = await createUser(data)
  return res.status(response.code).send(response.data)
}

const signInHandler = async (req, res) => {
    const data = req.body;
    const response = await signIn(data)
    return res.status(response.code).send(response.data)
}

const secretHandler = async (req, res) => {
    return res.status(200).send("secret")
}

const authFacebookHandler = async (req, res) => {
  return res.status(200).json({ success: true, data: req.user });
}
const authGoogleHandler = async (req, res) => {
  return res.status(200).json({ success: true, data: req.user });
}

const refreshTokenHandler = async (req, res) => {
  const refreshTokenClient = req.body.refresh_token;
  const dataUser = req.user;
  const response = await refreshToken(refreshTokenClient, dataUser)
  return res.status(response.code).send(response.data)
}

const router = express.Router();

router.post('/register', createUserHandler);
router.post('/login', signInHandler);
router.get('/secret', passport.authenticate('jwt', { session: false }), secretHandler);
router.post('/auth/facebook', passport.authenticate('facebook-token', { session: false }), authFacebookHandler);
router.post('/auth/google', passport.authenticate('google-plus-token', { session: false }), authGoogleHandler);
router.post('/auth/refresh-token', passport.authenticate('jwt', { session: false }), refreshTokenHandler);


module.exports = router
