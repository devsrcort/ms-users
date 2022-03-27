const passport = require('passport');
const local = require('./localStrategy');
const Users = require("users/models/users");
const userService = new Users();

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        userService.getUser(id)
            .then(users => done(null, users[0]))
            .catch(err => done(err));
    });

    local();
};