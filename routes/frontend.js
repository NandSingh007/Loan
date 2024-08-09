const express = require("express");
const router = express.Router();
const path = require("path");

const authMiddleware = (req, res, next) => {
  // Your authentication logic here
  next();
};

router.get("/", authMiddleware, (req, res) => {
  res.render("Frontend/HomePage", {
    title: "home",
    currentRoute: req.url
  });
});
router.get("/Reg", authMiddleware, (req, res) => {
  res.render("Frontend/Register", {
    title: "home",
    currentRoute: req.url
  });
});
router.get("/emi", authMiddleware, (req, res) => {
  res.render("Frontend/Emi", {
    title: "home",
    currentRoute: req.url
  });
});

router.get("/Other", authMiddleware, (req, res) => {
  res.render("Frontend/OtherForm", {
    title: "home",
    currentRoute: req.url
  });
});
router.get("/sans", authMiddleware, (req, res) => {
  res.render("Frontend/sansction", {
    title: "home",
    currentRoute: req.url
  });
});
router.get("/Download", authMiddleware, (req, res) => {
  res.render("Frontend/DownLoad", {
    title: "home",
    currentRoute: req.url
  });
});

router.get("/FinalPage", authMiddleware, (req, res) => {
  res.render("Frontend/FinalPage", {
    title: "home",
    currentRoute: req.url
  });
});

module.exports = router;
