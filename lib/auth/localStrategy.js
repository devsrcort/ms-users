const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("crypto-js");
const log = require("metalogger")();
const { ExtractJwt, Strategy: JWTStrategy } = require('passport-jwt');

const Users = require("users/models/users");
const userSerivce = new Users();

module.exports = () => {
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, async(email, password, done) => {
        try {
            const exUser = await userSerivce.getUser(email);
            if (exUser.length > 0) {
                const result = password === exUser[0]["password"] ? true : false;
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

    passport.use('jwt', new JWTStrategy({
            jwtFromRequest: ExtractJwt.fromHeader('authorization'),
            secretOrKey: process.env.JWT_SECRET,
        },
        async(jwtPayload, done) => {
            try {
                log.info(`Try to Token User : ${jwtPayload.id}`);

                const exUser = await userSerivce.getUser(jwtPayload.id);

                if (exUser[0]) {
                    log.info(`Sucess Find User : ${jwtPayload.id}`);

                    done(null, exUser[0]);
                    return;
                }
                log.info(`Sucess Find User : ${jwtPayload.id}`);

                done(null, false, { reason: '올바르지 않은 인증정보 입니다.' });
            } catch (error) {
                log.error(error);
                done(error);
            }
        }));
};