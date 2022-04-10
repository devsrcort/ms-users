const passport = require('passport');
const local = require('./localStrategy');
const Users = require("users/models/users");
const userService = new Users();
const log = require("metalogger")();


module.exports = () => {
    passport.serializeUser((user, done) => {
        log.info(`InSerialize`);

        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        log.info(`InDeserial`);

        userService.getUser(id)
            .then(users => done(null, users[0]))
            .catch(err => done(err));
    });

    local();
    // jwtAuth();
};