const express = require('express')
const authController = require('../controllers/auth')
const pagesController = require('../controllers/pages')
const usefulFunctions = require('../controllers/functions')
const middleware = require('../middlewares/middlewares')
const router = express.Router();

router.post('/login', authController.login)

router.get('/viewtransaction/id/:id', middleware.isLoggedIn, 
middleware.studentDataFromTransactionId, authController.viewTransaction)

router.get('/addtransaction/id/:id/p/:p', middleware.isLoggedIn, middleware.studentData, middleware.StudentAdmissions, middleware.yearBalances,  authController.showAddTransactionPage)

router.get('/logout', authController.logout)

router.post('/register', middleware.isLoggedIn, authController.register)

router.get('/editstudent/id/:id', middleware.isLoggedIn, usefulFunctions.admissionFields, authController.showEditStudent)

router.post('/editstudent/id/:id', middleware.isLoggedIn, middleware.studentData, authController.editStudent, pagesController.showStudentList)

router.post('/addtransaction/id/:id/p/:p', middleware.isLoggedIn, middleware.studentData, middleware.StudentAdmissions, middleware.yearBalances, authController.addtransaction)

router.get('/transId/:transId/id/:id', middleware.isLoggedIn, middleware.deleteTransaction, middleware.studentData, middleware.StudentTransactions, middleware.StudentAdmissions, pagesController.showProfilePage)

router.get('/admissionId/:admissionId/id/:id', middleware.isLoggedIn, middleware.deleteAdmission, middleware.studentData, middleware.StudentTransactions, middleware.StudentAdmissions, pagesController.showProfilePage)

router.get('/addadmission/id/:id/sfn/:first_name/sln/:last_name', middleware.isLoggedIn, usefulFunctions.admissionFields, authController.showAddAdmission)

router.post('/addadmission/id/:id/sfn/:first_name/sln/:last_name/ayears/:ayears/institutes/:institutes/branches/:branches/levels/:levels', middleware.isLoggedIn,  usefulFunctions.admissionFields, authController.addAdmission)

router.get('/editadmission/id/:id', middleware.isLoggedIn, usefulFunctions.admissionFields, middleware.getAdmissionDetails, authController.showEditAdmissionPage)

router.post('/editadmission/id/:id', middleware.isLoggedIn, usefulFunctions.admissionFields, middleware.getAdmissionDetails, authController.saveEditedAdmission)

router.post('/password/id/:id', middleware.isLoggedIn, middleware.StudentTransactions, middleware.StudentAdmissions, authController.passwordChange)
//=====================================================================


// router.get('/id/:id',middleware.isLoggedIn, middleware.studentData, middleware.StudentAdmissions, authController.deleteTransaction)



router.get('/edittransaction/id/:id/sfn/:first_name/sln/:last_name/ids/:studentId', middleware.isLoggedIn, authController.showEditTransactionPage)

// router.get('/viewtransaction/id/:id/sfn/:first_name/sln/:last_name/ids/:studentId', authController.isLoggedIn, middleware.StudentTransactions, authController.viewTransaction)

router.post('/edittransaction/id/:id/sfn/:first_name/sln/:last_name/ids/:studentId', middleware.isLoggedIn, authController.editTransaction)

// router.get('/profile/studentId/:studentId/last_name/:last_name/first_name/:first_name', authController.isLoggedIn, middleware.StudentTransactions, authController.StudentAdmissions, authController.showProfilePage)

// router.get('/profile/studentId/:studentId/last_name/:last_name/first_name/:first_name', authController.isLoggedIn, middleware.StudentTransactions, authController.StudentAdmissions, authController.showProfilePage)

// router.get('/id/:id',middleware.isLoggedIn, authController.deleteTransaction)



module.exports = router;