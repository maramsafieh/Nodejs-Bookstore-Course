const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateRegisterUser, validateLoginUser } = require("../models/User");

/**
 * @desc    Register New User
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 */
router.post("/register", asyncHandler(async (req, res) => {
    // 1. التحقق من البيانات المدخلة
    const { error } = validateRegisterUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. التحقق ما إذا كان المستخدم موجوداً مسبقاً
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: "this user already registered" });
    }

    // 3. تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

    // 4. إنشاء مستخدم جديد وحفظه
    user = new User({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    });

    const result = await user.save();

    // 5. إنشاء التوكن باستخدام الدالة الجديدة من الـ Model
    const token = user.generateToken(); 

    // 6. إرسال الاستجابة (بدون كلمة المرور)
    const { password, ...other } = result._doc;
    res.status(201).json({ ...other, token });
}));

/**
 * @desc    Login User
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 */
router.post("/login", asyncHandler(async (req, res) => {
    // 1. التحقق من البيانات المدخلة
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. البحث عن المستخدم بالبريد الإلكتروني
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ message: "invalid email or password" });
    }

    // 3. التحقق من تطابق كلمة المرور
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "invalid email or password" });
    }

    // 4. إنشاء التوكن باستخدام الدالة الجديدة من الـ Model
    const token = user.generateToken(); 

    // 5. إرسال الاستجابة
    const { password: pass, ...otherDetails } = user._doc;
    res.status(200).json({ ...otherDetails, token });
}));

module.exports = router;