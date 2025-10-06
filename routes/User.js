const express=require("express");
const router=new express.Router();
const mongoose=require("mongoose");
const Student_Schema=require("../models/Student_Schema");
const Course_Schema=require("../models/Course_Schema");
const Orders_Schema=require("../models/Orders_Schema");
const Partpayment_Schema=require("../models/Partpayment_Schema");
const { name } = require("ejs");

router.get("/", async function(req,res){
    const course= await Course_Schema.find();
    res.render("index",{message:"",course:course});
})
router.post("/register",function(req,res){
    const data2=new Student_Schema({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        password:req.body.password,
        age:req.body.age,
        gender:req.body.gender,
        nationality:req.body.nationality
    })
    Student_Schema.findOne({email:data2.email})
    .then(async(result)=>{
        if(result){
                console.log("Email Already Exists");
                const course=await Course_Schema.find();
                res.render("index",{message:"Email Already Exists",course:course});
        }
        else{
            Student_Schema.create(data2);
                console.log("Data Inserted Successfully");
                const course=await Course_Schema.find();
                    res.render("index",{message:"Data Inserted Successfully",course:course});
        }
    })
})
router.get("/about",async function(req,res){
    const course=await Course_Schema.find();
    res.render("about",{message:"",course:course});
})
router.get("/contact",async function(req,res){
    const course=await Course_Schema.find();
    res.render("contact",{message:"",course:course});
})
// Single course page
router.get("/course/:id", async (req, res) => {
    try {
        const allCourses = await Course_Schema.find(); // All courses for recommendations
        const course = await Course_Schema.findById(req.params.id); // Selected course

        if (!course) {
            return res.status(404).send("Course not found");
        }

        res.render("course", {
            course: course,
            allCourses: allCourses
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});
// ------------------ User Login ------------------
router.post("/login", async function (req, res) {
    const { email, password } = req.body;

    try {
        const student = await Student_Schema.findOne({
    $or: [
        { email: email },
        { phone: email }
    ],
    password: password
});
        if (student) {
            req.session.student = student.email; 
            req.session.name = student.name;       
            res.redirect("/profile");
        } else {
            const course = await Course_Schema.find();
            res.render("index", { message: "Invalid Email or Password", course: course });
        }
    } catch (err) {
        console.error(err);
        const course = await Course_Schema.find();
        res.render("index", { message: "Something went wrong!", course: course });
    }
});

// ------------------ User Profile ------------------
router.get("/profile", async function (req, res) {
    if (!req.session.student) {
        return res.redirect("/login");
    }

    try {
        const student = await Student_Schema.findOne({ email: req.session.student });

        if (!student) return res.redirect("/logout");

        const courses = await Course_Schema.find();
        const orders = await Orders_Schema.find({ studentid: student._id });
        const partpayments = await Partpayment_Schema.find({ studentid: student._id });

        res.render("profile", {
            name: req.session.name,
            student,
            courses,           // renamed to match potential future use
            orders,            // renamed to match your EJS
            partpayments,      // renamed to match your EJS variable convention
            message: req.session.message || null // avoid undefined error
        });

        // Clear message after rendering
        req.session.message = null;
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});

// ------------------ Logout ------------------
router.get("/logout", function (req, res) {
    if (!req.session.student) return res.redirect("/");

    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.render("index", { message: "Error logging out!" });
        }
        res.clearCookie("connect.sid"); 
        res.redirect("/"); 
    });
});

module.exports=router;