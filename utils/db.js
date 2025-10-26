const mongoose = require('mongoose');
const express= require("express");
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/lms");
        console.log("Database Connected Successfully");
    } catch (err) {
        console.error("Database Connection Failed:", err);
    }
};

module.exports = connectDB;
