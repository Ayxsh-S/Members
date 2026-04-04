const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const { createUser, findByEmail, setAdmin } = require("../models/userModel");

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE;

router.get("/signup", (req, res) => res.render("signup", {errors: [], formData: {} }));

router.post("/signup", [
    body("first_name").trim().notEmpty().withMessage("First name required").escape(),
    body("last_name").trim().notEmpty().withMessage("Last name required").escape(),
    body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage("Password must be 6+ chars"),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) throw new Error("Passwords do not match");
        return true;
    }),
], async (req, res) => {
    const errors = validationResult(req);
    const formData = { ...req.body };
    if (!errors.isEmpty()) {
        return res.render("signup", {
            errors: errors.array(),
            formData
        });
    }
    try {
        const existing = await findByEmail(req.body.email);
        if (existing) {
            return res.render("signup", { errors: [ { msg: "Email already registered" }], formData});
        }
        const hashed = await bcrypt.hash(req.body.password, 12);
        let isAdmin = false;
        if (req.body.adminPasscode && req.body.adminPasscode === ADMIN_PASSCODE) isAdmin = true;
        const user = await createUser({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password_hash: hashed,
            is_admin: isAdmin
        });
        req.login(user, (err) => {
            if (err) {
                console.error(err);
                return res.render("signup", { errors: [{ msg: "Login failed" }], formData });
            }
            return res.redirect("/");
        });
    } catch (err) {
        console.error(err);
        res.render("signup", { errors: [{ msg: "Server error" }], formData });
    }
});

router.get("/login", (req, res) => res.render("login", { errors: [] }));

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login?error=true",
        failureFlash: false
    })(req, res, next);
});

router.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) {
            console.error(err);
        }
        res.redirect("/");
    });
});

module.exports = router;