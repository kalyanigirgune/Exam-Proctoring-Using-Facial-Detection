const { Router } = require("express");
const multer = require('multer');
const path = require('path');
const User = require('../models/user');
const { createTokenForUser } = require('../services/authentication');

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get('/signin', (req, res) => {
    res.render('signin', { user: req.user });
});

router.get('/signup', (req, res) => {
    res.render('signup', { user: req.user });
});

router.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    try {
        await User.create({ fullName, email, password });
        res.redirect("/");
    } catch (error) {
        console.error('Error during signup:', error);
        res.render('signup', { error: 'Error creating account' });
    }
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password); // Ensure this line calls the static method properly
        res.cookie("token", token).redirect("/");
    } catch (error) {
        console.error('Error during signin:', error);
        res.render('signin', { error: 'Incorrect Email or Password' });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/');
});

router.get('/profile', async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/signin'); // Redirect to signin if user is not authenticated
        }
        const user = await User.findById(req.user._id);
        res.render('profile', { user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.redirect('/');
    }
});

router.post('/profile/update', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/signin'); // Redirect to signin if user is not authenticated
        }
        const userId = req.user._id;
        const profileImageURL = `/uploads/${req.file.filename}`;
        await User.findByIdAndUpdate(userId, { profileImageURL });
        res.redirect('/user/profile');
    } catch (error) {
        console.error('Error updating profile image:', error);
        res.redirect('/user/profile');
    }
});

module.exports = router;
