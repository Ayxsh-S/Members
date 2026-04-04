const express = require("express");
const router = express.Router();
const messageModel = require("../models/messageModel");
const { setMember } = require("../models/userModel");

const CLUB_PASSWORD = process.env.CLUB_PASSWORD || "secret";

function ensureLoggedIn(req, res, next) {
    if (req.user) return next();
    return res.redirect("/login");
}

router.get("/", async (req, res) => {
    try {
        const messages = await messageModel.listMessages();
        return res.render("index", { messages });
    } catch (err) {
        console.error(err);
        return res.status(500).render("error", { message: "Failed to load messages"} );
    }
});

router.get("/join", ensureLoggedIn, (req, res) => 
    res.render("join", { errors: [] })
);

router.post("/join", ensureLoggedIn, async (req, res) => {
    const { passcode } = req.body;
    if (passcode === CLUB_PASSWORD) {
        await setMember(req.user.id, true);
        req.user.is_member = true;
        return res.redirect("/");
    } else {
        return res.render("join", { errors: [{ msg: "Wrong password" }] });
    }
});

module.exports = router;