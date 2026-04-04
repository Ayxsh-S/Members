const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { createMessage, deleteMessage } = require("../models/messageModel");

function ensureLoggedIn(req, res, next) {
    if (req.user) return next();
    return res.redirect("/login");
}

function ensureAdmin(req, res, next) {
    if (req.user && req.user.is_admin) return next();
    return res.status(403).send("Forbidden");
}

router.get("/new", ensureLoggedIn, (req, res) => res.render("new-message", { errors: [], formData: {} }));

router.post("/new", ensureLoggedIn, [
    body("title").trim().notEmpty().withMessage("Title required").escape(),
    body("body").trim().notEmpty().withMessage("Message body required").escape()
], async (req, res) => {
    const errors = validationResult(req);
    const formData = { ...req.body };
    if (!errors.isEmpty()) return res.render("new-message", { errors: errors.array(), formData });
    try {
        await createMessage({ user_id: req.user.id, title: req.body.title, body: req.body.body });
        return res.redirect("/");
    } catch (err) {
        console.error(err);
        res.render("new-message", { errors: [{ msg: "Server error" }], formData });
    }
});

router.delete("/:id", ensureLoggedIn, ensureAdmin, async (req, res) => {
    try {
        const deleted = await deleteMessage(req.params.id);
        if (!deleted) {
            return res.status(404).send("Message not found");
        }
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).render("error", { message: "Something went wrong" });
    }
});

module.exports = router;