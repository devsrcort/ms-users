const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("crypto-js");
const log = require("metalogger")();

const Users = require("users/models/users");
const userSerivce = new Users();

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async(email, password, done) => {
        try {
            const exUser = await userSerivce.getUser(email);
            if (exUser.length > 0) {
                const result = password === exUser[0].password ? true : false;
                if (result) {
                    done(null, exUser[0]);
                } else {
                    done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
                }
            } else {
                done(null, false, { message: '가입되지 않은 회원입니다.' });
            }
        } catch (error) {
            log.error(error);
            done(error);
        }
    }));
};