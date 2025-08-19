const router = require("express").Router();
const { register, login, refresh, me } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", auth, me);

module.exports = router;