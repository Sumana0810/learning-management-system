    const express = require("express");
    const session = require("express-session");
    const flash = require("connect-flash");   // use connect-flash directly
    const path = require("path");
    const methodOverride = require("method-override");
    const connectDB = require("./utils/db");

    connectDB();
    const app = express();

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(methodOverride("_method"));

    // ✅ SESSION first
    app.use(
    session({
        secret: "supersecret",
        resave: false,
        saveUninitialized: false,
    })
    );

    // ✅ FLASH after session
    app.use(flash());

    // ✅ Global variables for flash messages
    app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
    });

    // Routes
    app.use("/", require("./routes/User"));
    app.use("/admin", require("./routes/Admin"));

    const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

