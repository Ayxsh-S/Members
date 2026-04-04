const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { findByEmail, findById } = require("../models/userModel");

function configure(passport) {
    passport.use(new LocalStrategy({ usernameField: "email" }, async(email, password, done) => {
        try {
            const user = await findByEmail(email);
            if (!user) return done(null, false, { message: "Incorrect email or password" });
            const match = await bcrypt.compare(password, user.password_hash);
            if (!match) return done(null, false, { message: "Incorrect email or password" });
            const { password_hash, ...safeUser} = user;
            return done(null, safeUser);
        } catch(err) {
            return done(err);
        }
    }));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await findById(id);
            if (user) {
                const { password_hash, ...safeUser } = user;
                return done(null, safeUser);
            }
            if (!user) return done(null, false);
        } catch (err) {
            done(err);
        }
    });
}

module.exports = configure;