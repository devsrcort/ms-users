// eslint-disable global-require
const path = require("path");
const helmet = require("helmet");
const log = require("metalogger")();
const healthcheck = require("maikai");
const hbs = require("hbs");
const session = require('express-session');
const nunjucks = require('nunjucks');

const cors = require("cors");

require("app-module-path").addPath(path.join(__dirname, "/lib"));
const morgan = require('morgan');
const dotenv = require('dotenv');
const passport = require('passport');
const passportConfig = require('auth');
const { contentSecurityPolicy } = require("helmet");

dotenv.config();
passportConfig();

// Add all routes and route-handlers for your service/app here:
function serviceRoutes(app) {
    // For Liveness Probe, defaults may be all you need.
    const livenessCheck = healthcheck();
    app.use(livenessCheck.express());

    // For readiness check, let's also test the DB
    const check = healthcheck({ path: "/ping" });
    const AdvancedHealthcheckers = require("healthchecks-advanced");
    const advCheckers = new AdvancedHealthcheckers();
    // Database health check is cached for 10000ms = 10 seconds!
    check.addCheck("db", "dbQueryCheck", advCheckers.dbQueryCheck, { minCacheMs: 10000 });
    app.use(check.express());
    app.use(morgan('dev'));

    app.set('view engine', 'html');

    nunjucks.configure('./lib/views', {
        express: app,
        watch: true,
    });
    /* eslint-disable global-require */

    // Temporary allow all urls
    const safesitelist =
        process.env.NODE_ENV == "production" ? [
            "https://srt-wallet.io",
            "https://app.srt-wallet.io",
            "https://admin.srt-wallet.io",
        ] : [
            "http://localhost:6001",
            "http://localhost:33127",
            "http://192.168.0.7:34129",
            "https://dev.srt-wallet.io",
            "https://dev.app.srt-wallet.io",
            "https://dev.admin.srt-wallet.io",
            "*"
        ];

    const corsOptions = {
        origin: function(origin, callback) {
            const issafesitelisted = safesitelist.indexOf(origin) !== -1;
            callback(null, issafesitelisted);
        },

        credentials: true,
    };

    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(cors(corsOptions));
    app.use("/users", require("users")); // attach to sub-route
    // app.use('/register', require('users')); // attach to sub-route
    /* eslint-enable global-require */
}

function setupErrorHandling(app) {
    // Custom formatting for error responses.
    app.use((err, req, res, next) => {
        if (err) {
            const out = {};
            if (err.isJoi || err.type === "validation") {
                //validation error. No need to log these
                out.errors = err.details;
                res.status(400).json(out);
                return;
            } else {
                log.error(err);
                if (process.env.NODE_ENV === "production") {
                    out.errors = ["Internal server error"];
                } else {
                    out.errors = [err.toString()];
                }
                res.status(500).json(out);
                return;
            }
        }
        return next();
    });
}

exports.setup = function(app, callback) {
    // Choose your favorite view engine(s)
    app.set("view engine", "handlebars");
    app.engine("handlebars", hbs.__express);

    /** Adding security best-practices middleware
     * see: https://www.npmjs.com/package/helmet **/

    const cspOptions = {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'unsafe-inline'"],
        }
    }

    app.use(helmet({
            contentSecurityPolicy: cspOptions,
        }

    ));

    //---- Mounting well-encapsulated application modules (so-called: "mini-apps")
    //---- See: http://expressjs.com/guide/routing.html and http://vimeo.com/56166857
    serviceRoutes(app);

    setupErrorHandling(app);

    // If you need websockets:
    // let socketio = require('socket.io')(runningApp.http);
    // require('fauxchatapp')(socketio);

    if (typeof callback === "function") {
        callback(app);
        return;
    }
};