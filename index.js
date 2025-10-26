    // index.js
    const express = require("express");
    const session = require("express-session");
    const flash = require("connect-flash");
    const path = require("path");
    const methodOverride = require("method-override");
    const connectDB = require("./utils/db");

    connectDB();

    // ----------------- Express App -----------------
    const app = express();

    // Set EJS and Views Folder
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    // Public folder for static assets
    app.use(express.static(path.join(__dirname, "public")));

    // Body parser
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());

    // Method Override for PUT/DELETE
    app.use(methodOverride("_method"));

    // ----------------- Session -----------------
    app.use(
    session({
        secret: "supersecret",
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 2 }, // 2 hours
    })
    );

    // ----------------- Flash -----------------
    app.use(flash());

    // Global variables for flash messages
    app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
    });

    // ----------------- Routes -----------------
    app.use("/", require("./routes/User"));    // User routes
    app.use("/admin", require("./routes/Admin")); // Admin routes

    // ----------------- 404 -----------------
    app.use((req, res, next) => {
    res.status(404).send("Page Not Found");
    });

    // ----------------- Start Server -----------------
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    });
