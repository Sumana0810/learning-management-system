const express = require("express");
const router = new express.Router();
const Admin_Schema = require("../models/Admin_Schema");
const Student_Schema = require("../models/Student_Schema");
const Course_Schema = require("../models/Course_Schema");
const multer = require("multer");
const Orders_Schema = require("../models/Orders_Schema");
const Partpayment_Schema = require("../models/Partpayment_Schema");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ------------------ Admin Login ------------------
router.get("/", function (req, res) {
    if (!req.session.admin) {
        res.render("admin/index", { message: "" });
    } else {
        res.redirect("/admin/profile");
    }
});

router.post("/login", function (req, res) {
    const { userid, password } = req.body;
    Admin_Schema.findOne({ userid: userid, password: password })
        .then((result) => {
            if (result) {
                req.session.admin = result;
                res.redirect("/admin/profile");
            } else {
                res.render("admin/index", { message: "Invalid Userid or Password" });
            }
        })
        .catch(() => {
            res.render("admin/index", { message: "Something went wrong!" });
        });
});

// ------------------ Admin Profile ------------------
router.get("/profile", function (req, res) {
    if (!req.session.admin) {
        res.redirect("/admin");
    } else {
        res.render("admin/profile", { admin: req.session.admin });
    }
});

// ------------------ Add Student ------------------
router.get("/addstudent", function (req, res) {
    if (!req.session.admin) {
        res.redirect("/admin");
    } else {
        res.render("admin/addstudent", { admin: req.session.admin, message: "" });
    }
});

router.post("/addstudent", function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");

    const data2 = new Student_Schema({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        age: req.body.age,
        gender: req.body.gender,
        nationality: req.body.nationality
    });

    Student_Schema.findOne({ email: data2.email })
        .then((result) => {
            if (result) {
                res.render("admin/addstudent", { message: "Email Already Exists", admin: req.session.admin });
            } else {
                Student_Schema.create(data2)
                    .then(() => {
                        res.render("admin/addstudent", { message: "Data Inserted Successfully", admin: req.session.admin });
                    });
            }
        })
        .catch(() => {
            res.render("admin/addstudent", { message: "Something went wrong!", admin: req.session.admin });
        });
});

// ------------------ All Students ------------------
router.get("/allstudent", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    const data1 = await Student_Schema.find();
    res.render("admin/allstudent", { admin: req.session.admin, student: data1 });
});

// ------------------ View Student ------------------
router.get("/viewstudent/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    const id = req.params.id;
    const data1 = await Student_Schema.findById(id);
    res.render("admin/viewstudent", { admin: req.session.admin, student: data1 });
});

// ------------------ Edit Student ------------------
router.get("/editstudent/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    const id = req.params.id;
    const data1 = await Student_Schema.findById(id);
    res.render("admin/editstudent", { admin: req.session.admin, student: data1, message: "" });
});

router.post("/editstudent/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const id = req.params.id;
        await Student_Schema.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            age: req.body.age,
            gender: req.body.gender,
            nationality: req.body.nationality
        });
        res.redirect("/admin/allstudent");
    } catch (err) {
        console.error(err);
        res.render("admin/editstudent", {
            admin: req.session.admin,
            student: await Student_Schema.findById(req.params.id),
            message: "Failed to update student"
        });
    }
});

// ------------------ Delete Student ------------------
router.get("/deletestudent/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    const id = req.params.id;
    const data1 = await Student_Schema.findById(id);
    res.render("admin/deletestudent", { admin: req.session.admin, student: data1, message: "" });
});

router.post("/deletestudent/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const id = req.params.id;
        await Student_Schema.findByIdAndDelete(id);
        res.redirect("/admin/allstudent");
    } catch (err) {
        console.error(err);
        res.render("admin/deletestudent", {
            admin: req.session.admin,
            student: await Student_Schema.findById(req.params.id),
            message: "Failed to delete student"
        });
    }
});

// ------------------ Add Course ------------------
router.get("/addcourse", function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    res.render("admin/addcourse", { admin: req.session.admin, message: "" });
});

router.post("/addcourse", function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");

    let filename1 = "";

    const storage = multer.diskStorage({
        destination: "./public/images/course",
        filename: (req, file, cb) => {
            filename1 = Date.now() + "-" + file.originalname.toLowerCase();
            cb(null, filename1);
        }
    });

    const upload = multer({ storage: storage }).single("image");

    upload(req, res, (err) => {
        if (err) return res.render("admin/addcourse", { message: "Upload error!", admin: req.session.admin });

        const data2 = new Course_Schema({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image: filename1
        });

        Course_Schema.findOne({ name: data2.name })
            .then((result) => {
                if (result) {
                    res.render("admin/addcourse", { message: "Course Already Exists", admin: req.session.admin });
                } else {
                    Course_Schema.create(data2)
                        .then(() => {
                            res.render("admin/addcourse", { message: "Course Inserted Successfully", admin: req.session.admin });
                        });
                }
            })
            .catch(() => {
                res.render("admin/addcourse", { message: "Something went wrong!", admin: req.session.admin });
            });
    });
});

// ------------------ Download Course Receipt ------------------
router.get("/downloadreceipt/:orderid", async (req, res) => {
    try {
        const order = await Orders_Schema.findById(req.params.orderid);
        const student = await Student_Schema.findById(order.userid);
        const course = await Course_Schema.findById(order.courseid);

        if (!order || !student || !course) return res.status(404).send("Data not found");

        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', `attachment; filename=receipt_${order._id}.pdf`);
        res.setHeader('Content-Type', 'application/pdf');

        doc.text("Payment Receipt", { align: "center", underline: true });
        doc.moveDown();
        doc.text(`Order ID: ${order._id}`);
        doc.text(`Student Name: ${student.name}`);
        doc.text(`Course Name: ${course.name}`);
        doc.text(`Total Fee: ₹${order.tfee}`);
        doc.text(`Paid Fee: ₹${order.pfee}`);
        doc.text(`Status: ${parseInt(order.pfee) >= parseInt(order.tfee) ? "Completed" : "Pending"}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);

        doc.end();
        doc.pipe(res);

    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong!");
    }
});


// ------------------ All Courses ------------------
router.get("/allcourse", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    const data1 = await Course_Schema.find();
    res.render("admin/allcourse", { admin: req.session.admin, course: data1 });
});

// ------------------ View Course ------------------
router.get("/viewcourse/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    const id = req.params.id;
    const data1 = await Course_Schema.findById(id);
    res.render("admin/viewcourse", { admin: req.session.admin, course: data1 });
});

// ------------------ Edit Course ------------------
router.get("/editcourse/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    const id = req.params.id;
    const data1 = await Course_Schema.findById(id);
    res.render("admin/editcourse", { admin: req.session.admin, course: data1, message: "" });
});

router.post("/editcourse/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const id = req.params.id;
        await Course_Schema.findByIdAndUpdate(id, {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price
        });
        res.redirect("/admin/allcourse");
    } catch (err) {
        console.error(err);
        res.render("admin/editcourse", {
            admin: req.session.admin,
            course: await Course_Schema.findById(req.params.id),
            message: "Failed to update course"
        });
    }
});

// ------------------ Delete Course ------------------
router.get("/deletecourse/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    const id = req.params.id;
    const data1 = await Course_Schema.findById(id);
    res.render("admin/deletecourse", { admin: req.session.admin, course: data1, message: "" });
});

router.post("/deletecourse/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const id = req.params.id;
        await Course_Schema.findByIdAndDelete(id);
        res.redirect("/admin/allcourse");
    } catch (err) {
        console.error(err);
        res.render("admin/deletecourse", {
            admin: req.session.admin,
            course: await Course_Schema.findById(req.params.id),
            message: "Failed to delete course"
        });
    }
});

// ------------------ Add Order ------------------
router.get("/addorder", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const students = await Student_Schema.find();
        const courses = await Course_Schema.find();
        res.render("admin/addorder", { 
            admin: req.session.admin, 
            message: "", 
            student: students, 
            course: courses 
        });
    } catch (err) {
        console.error(err);
        res.render("admin/addorder", { 
            admin: req.session.admin, 
            message: "Something went wrong!", 
            student: [], 
            course: [] 
        });
    }
});

router.post("/addorder", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        // ✅ rename to userid
        const { userid, courseid, tfee, pfee, mode } = req.body;

        // check existing order by userid + courseid
        const existingOrder = await Orders_Schema.findOne({ userid, courseid });
        const students = await Student_Schema.find();
        const courses = await Course_Schema.find();

        if (existingOrder) {
            return res.render("admin/addorder", { 
                admin: req.session.admin, 
                message: "Order Already Exists", 
                student: students, 
                course: courses 
            });
        }

        // create new order
        const newOrder = await Orders_Schema.create({ 
            userid, 
            courseid, 
            tfee, 
            pfee, 
            status: "1" 
        });

        // also create initial partpayment
        await Partpayment_Schema.create({ 
            ordersid: newOrder._id, 
            amount: pfee, 
            mode: mode, 
            status: "1" 
        });

        res.render("admin/addorder", { 
            admin: req.session.admin, 
            message: "Inserted Successfully", 
            student: students, 
            course: courses 
        });

    } catch (err) {
        console.error(err);
        const students = await Student_Schema.find();
        const courses = await Course_Schema.find();
        res.render("admin/addorder", { 
            admin: req.session.admin, 
            message: "Something went wrong!", 
            student: students, 
            course: courses 
        });
    }
});

// ------------------ All Orders ------------------
// ------------------ All Orders ------------------
router.get("/allorder", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const orders = await Orders_Schema.find();

        // attach studentName, courseName and computed status
        const ordersWithNames = await Promise.all(
            orders.map(async (order) => {
                const student = await Student_Schema.findById(order.userid);
                const course = await Course_Schema.findById(order.courseid);

                // compute status
                let status = "Pending";
                if (parseInt(order.pfee) >= parseInt(order.tfee)) {
                    status = "Completed";
                }

                return {
                    ...order.toObject(),
                    studentName: student ? student.name : "Deleted Student",
                    courseName: course ? course.name : "Deleted Course",
                    status
                };
            })
        );

        res.render("admin/allorder", { admin: req.session.admin, orders: ordersWithNames });
    } catch (err) {
        console.error(err);
        res.render("admin/allorder", { admin: req.session.admin, orders: [], message: "Something went wrong!" });
    }
});

// ------------------ View Order ------------------
router.get("/vieworder/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const order = await Orders_Schema.findById(req.params.id);
        const student = await Student_Schema.findById(order.userid);
        const course = await Course_Schema.findById(order.courseid);
        res.render("admin/vieworder", {
            admin: req.session.admin,
            order: order,
            studentName: student ? student.name : "Deleted Student",
            courseName: course ? course.name : "Deleted Course"
        });
    } catch (err) {
        console.error(err);
        res.redirect("/admin/allorder");
    }
});

// ------------------ Edit Order ------------------
router.get("/editorder/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const order = await Orders_Schema.findById(req.params.id);
        const students = await Student_Schema.find();
        const courses = await Course_Schema.find();
        res.render("admin/editorder", { admin: req.session.admin, order, students, courses, message: "" });
    } catch (err) {
        console.error(err);
        res.redirect("/admin/allorder");
    }
});

router.post("/editorder/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const { userid, courseid, tfee, pfee, status } = req.body;
        await Orders_Schema.findByIdAndUpdate(req.params.id, { userid, courseid, tfee, pfee, status });
        res.redirect("/admin/allorder");
    } catch (err) {
        console.error(err);
        res.redirect("/admin/allorder");
    }
});

// ------------------ Delete Order ------------------
router.get("/deleteorder/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const order = await Orders_Schema.findById(req.params.id);
        res.render("admin/deleteorder", { admin: req.session.admin, order, message: "" });
    } catch (err) {
        console.error(err);
        res.redirect("/admin/allorder");
    }
});

router.post("/deleteorder/:id", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        await Orders_Schema.findByIdAndDelete(req.params.id);
        res.redirect("/admin/allorder");
    } catch (err) {
        console.error(err);
        res.redirect("/admin/allorder");
    }
});


// ------------------ Change Password ------------------
router.get("/changepassword", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");
    try {
        const userid = req.session.admin.userid;
        const adminData = await Admin_Schema.findOne({ userid });
        res.render("admin/changepassword", { admin: req.session.admin, adminData, message: "" });
    } catch (err) {
        console.error(err);
        res.render("admin/changepassword", { admin: req.session.admin, adminData: null, message: "Something went wrong!" });
    }
});

router.post("/changepassword", async function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");

    try {
        const userid = req.session.admin.userid;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        const admin = await Admin_Schema.findOne({ userid });

        if (!admin) return res.render("admin/changepassword", { admin: req.session.admin, adminData: null, message: "Admin not found!" });
        if (admin.password !== oldPassword) return res.render("admin/changepassword", { admin: req.session.admin, adminData: admin, message: "Old password is incorrect!" });
        if (newPassword !== confirmPassword) return res.render("admin/changepassword", { admin: req.session.admin, adminData: admin, message: "New passwords do not match!" });

        admin.password = newPassword;
        await admin.save();

        res.render("admin/changepassword", { admin: req.session.admin, adminData: admin, message: "Password updated successfully!" });

    } catch (err) {
        console.error(err);
        res.render("admin/changepassword", { admin: req.session.admin, adminData: null, message: "Something went wrong while changing password!" });
    }
});

// ------------------ Logout ------------------
router.get("/logout", function (req, res) {
    if (!req.session.admin) return res.redirect("/admin");

    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.render("admin/index", { message: "Error logging out!" });
        }
        res.clearCookie("connect.sid"); // important: clear cookie
        res.redirect("/admin"); // back to login page
    });
});


module.exports = router;
