const express = require('express')
const authController = require('../controllers/auth')
const pagesController = require('../controllers/pages')
const usefulFunctions = require('../controllers/functions')
const middleware = require('../middlewares/middlewares')
const router = express.Router();

router.post('/login', authController.login)

router.get('/viewtransaction/id/:id', middleware.isLoggedIn, 
middleware.studentDataFromTransactionId, authController.viewTransaction)

router.get('/addtransaction/id/:id', middleware.isLoggedIn, middleware.studentData, middleware.StudentAdmissions, middleware.yearBalances,  authController.showAddTransactionPage)



router.get('/logout', authController.logout)

router.post('/register', middleware.isLoggedIn, authController.register)

router.get('/editstudent/id/:id', middleware.isLoggedIn, authController.showEditStudent)

router.post('/editstudent/id/:id', middleware.isLoggedIn, middleware.studentData, authController.editStudent, pagesController.showStudentList)

router.post('/addtransaction/id/:id', middleware.isLoggedIn, middleware.studentData, middleware.StudentAdmissions, middleware.yearBalances, authController.addtransaction)

//=====================================================================






router.get('/edittransaction/id/:id/sfn/:first_name/sln/:last_name/ids/:studentId', middleware.isLoggedIn, authController.showEditTransactionPage)

// router.get('/viewtransaction/id/:id/sfn/:first_name/sln/:last_name/ids/:studentId', authController.isLoggedIn, middleware.StudentTransactions, authController.viewTransaction)

router.post('/edittransaction/id/:id/sfn/:first_name/sln/:last_name/ids/:studentId', middleware.isLoggedIn, authController.editTransaction)

// router.get('/profile/studentId/:studentId/last_name/:last_name/first_name/:first_name', authController.isLoggedIn, middleware.StudentTransactions, authController.StudentAdmissions, authController.showProfilePage)

// router.get('/profile/studentId/:studentId/last_name/:last_name/first_name/:first_name', authController.isLoggedIn, middleware.StudentTransactions, authController.StudentAdmissions, authController.showProfilePage)

router.get('/id/:id/sid/:studentId/sfn/:first_name/sln/:last_name',middleware.isLoggedIn, authController.deleteTransaction)

router.get('/addadmission/id/:id/sfn/:first_name/sln/:last_name',middleware.isLoggedIn, usefulFunctions.admissionFields, authController.showAddAdmission)

router.post('/addadmission/id/:id/sfn/:first_name/sln/:last_name/ayears/:ayears/institutes/:institutes/branches/:branches/levels/:levels',middleware.isLoggedIn,  usefulFunctions.admissionFields, authController.addAdmission)

module.exports = router;