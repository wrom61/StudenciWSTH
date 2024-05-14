const express = require('express')
// const authController = require('../controllers/auth')
const pagesController = require('../controllers/pages')
const middleware = require('../middlewares/middlewares')
const usefulFunctions = require('../controllers/functions')
const router = express.Router();

// router.get('/login', raportController.showLoginPage)

// router.get('/profile/level/:level/studentId/:studentId', authController.isLoggedIn, raportController.transactions, middleware.StudentAdmissions, raportController.showProfilePage)

// router.get('/profile', middleware.isLoggedIn, middleware.StudentTransactions, middleware.StudentAdmissions, pagesController.showProfilePage)

router.get('/profile/id/:id', middleware.isLoggedIn, middleware.studentData, middleware.StudentTransactions, middleware.StudentAdmissions, pagesController.showProfilePage)

router.post('/', middleware.isLoggedIn, pagesController.find)

// router.post('/profile', middleware.isLoggedIn, pagesController.findAyearTransactions)

router.get('/register', middleware.isLoggedIn, usefulFunctions.admissionFields,  pagesController.showRegisterPage)

router.get('/:id', middleware.isLoggedIn, pagesController.deleteUser)

//==========================================================

router.get('/', middleware.isLoggedIn, pagesController.showStudentList)







module.exports = router;