const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const { ExtractJwt } = require("passport-jwt");
const db = require("../config/connectDB");
const { JWT_SECRET, auth } = require("../config/oauth");
const response = require("../utils/response");
const LOGGER = require("../utils/logger");
const FacebookTokenStrategy = require("passport-facebook-token");
const GooglePlusTokenStrategy = require("passport-google-plus-token");
const jwt = require("jsonwebtoken");

const generateAccessTokenFB = (profile) => {
    return jwt.sign(
        {
            auth_facebook_id: profile.id,
            email: profile.emails[0].value,
            auth_type: "facebook",
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

const generateRefreshTokenFB = (profile) => {
    return jwt.sign(
        {
            auth_facebook_id: profile.id,
            email: profile.emails[0].value,
            auth_type: "facebook",
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "60d",
        }
    );
};
const generateAccessTokenGG = (profile) => {
    return jwt.sign(
        {
            auth_google_id: profile.id,
            email: profile.emails[0].value,
            auth_type: "google",
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

const generateRefreshTokenGG = (profile) => {
    return jwt.sign(
        {
            auth_google_id: profile.id,
            email: profile.emails[0].value,
            auth_type: "google",

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "60d",
        }
    );
};

// Passport JWT
passport.use(
    new JwtStrategy(
        {
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken("Authorization"),
            secretOrKey: process.env.ACCESS_TOKEN_SECRET,
        },
        async (payload, done) => {
            try {
                console.log("payload", payload);
                const user = await db("user")
                    .where({ email: payload.email })
                    .first();
                if (!user) {
                    return done(null, false);
                }
                return done(null, user);
            } catch (error) {
                done(error, false);
            }
        }
    )
);

// Passport Facebook
passport.use(
    new FacebookTokenStrategy(
        {
            clientID: auth.facebook.CLIENT_ID,
            clientSecret: auth.facebook.CLIENT_SECRET,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let accessTokenClient = "";
                let refreshTokenClient = "";
                const user = await db("user")
                    .where({
                        auth_facebook_id: profile.id,
                        auth_type: "facebook",
                    })
                    .first();

                if (user) {
                    const dataToBeSent = {
                        id: user.id,
                        authFacebookId: user.auth_facebook_id,
                        displayName: user.display_name,
                        email: user.email,
                        authType: user.auth_type,
                        accessToken: user.access_token,
                        refreshToken: user.refresh_token,
                        isDelete: user.is_delete
                    };
                    return done(null, dataToBeSent);
                } else {
                    accessTokenClient = generateAccessTokenFB(profile);
                    refreshTokenClient = generateRefreshTokenFB(profile);
                }

                //If new user
                const dataToBeInsert = {
                    auth_facebook_id: profile.id,
                    email: profile.emails[0].value,
                    auth_type: "facebook",
                    display_name: profile.displayName,
                    access_token: accessTokenClient,    
                    refresh_token: refreshTokenClient,
                    is_delete: false,
                };
                const [id] = await db("user")
                    .clone()
                    .insert(dataToBeInsert, ["id"]);
                LOGGER.APP.info("id user inserted ", id);
                const userNew = await db("user").clone().where({ id }).first();
                const dataToBeSent = {
                    id: userNew.id,
                    authFacebookId: userNew.auth_facebook_id,
                    displayName: userNew.display_name,
                    email: userNew.email,
                    authType: userNew.auth_type,
                    accessToken: accessTokenClient,
                    refreshToken: refreshTokenClient,
                    isDelete: user.is_delete
                };

                return done(null, dataToBeSent);
            } catch (error) {
                done(error, false);
            }
        }
    )
);

// Passport Google
passport.use(
    new GooglePlusTokenStrategy(
        {
            clientID: auth.google.CLIENT_ID,
            clientSecret: auth.google.CLIENT_SECRET,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let accessTokenClient = "";
                let refreshTokenClient = "";
                const user = await db("user")
                    .where({ auth_google_id: profile.id, auth_type: "google" })
                    .first();

                if (user) {
                    const dataToBeSent = {
                        id: user.id,
                        authGoogleId: user.auth_google_id,
                        displayName: user.display_name,
                        email: user.email,
                        authType: user.auth_type,
                        accessToken: user.access_token,
                        refreshToken: user.refresh_token,
                        isActive: user.is_active,
                    };
                    return done(null, dataToBeSent);
                } else {
                    accessTokenClient = generateAccessTokenGG(profile);
                    refreshTokenClient = generateRefreshTokenGG(profile);
                }

                //If new user
                const dataToBeInsert = {
                    auth_google_id: profile.id,
                    email: profile.emails[0].value,
                    auth_type: "google",
                    display_name: profile.displayName,
                    access_token: accessTokenClient,
                    refresh_token: refreshTokenClient,
                    is_delete: false,
                };
                const [id] = await db("user")
                    .clone()
                    .insert(dataToBeInsert, ["id"]);
                LOGGER.APP.info("id user inserted ", id);
                const userNew = await db("user").clone().where({ id }).first();
                const dataToBeSent = {
                    id: userNew.id,
                    authGoogleId: userNew.auth_google_id,
                    displayName: userNew.display_name,
                    email: userNew.email,
                    authType: userNew.auth_type,
                    accessToken: accessTokenClient,
                    refreshToken: refreshTokenClient,
                    isActive: userNew.is_active,
                };

                return done(null, dataToBeSent);
            } catch (error) {
                console.log("error inserting", error);
                done(error, false);
            }
        }
    )
);
