const mysql = require('mysql')
const usefulFunctions = require('../controllers/functions')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { promisify } = require('util')

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

// SALDA POSZCZEGÓLNYCH LAT AKADEMICKICH
// STUDENT ADMISSIONS FROM STUDENTS LIST PAGE
// STUDENT TRANSACTIONS
// STUDENTS DATA
// ISLOGGEDIN


//============SALDA POSZCZEGÓLNYCH LAT AKADEMICKICH==============
exports.yearBalances = async (req, res, next) => {
  const status = 1; //1 - aktywne; 0 - skasowane
  // console.log("Req.param in admissions: ", req.zapisy);
  // console.log("Req.body in admissions: ", req.body);
let totalBalance = 0
// console.log('czy year Balance');

try {
  
  for (let i = 0; i < req.zapisy.length; i++) {
  db.query("SELECT SUM(amount) AS yearbalance FROM transactions WHERE idstudent = ? AND admissionId = ?", [req.student.id, req.zapisy[i].admissionId], async (e, balance) => {
    if(balance[0].yearbalance === null) {balance[0].yearbalance = 0}
    console.log('Balance', balance[0].yearbalance);
    // console.log(req.student.id);
    // console.log(req.zapisy[i].admissionId);
    // console.log(db.query.toStrin);
    // console.log(balance[0].yearbalance);
    totalBalance += balance[0].yearbalance;
    // console.log(balance);
    // balance[i] = {
    //   ['yearbalance']: balance[i],
    //   ['totalbalance']: totalBalance,
      
    // }
    // admissions[i] = {['ayear']: admissions[i].academicyear,
    req.zapisy[i].yearbalance = await balance[0].yearbalance
    req.zapisy[i].totalBalance = totalBalance
    // newZapisy.push({zapisy[i]})
    
    // req.newZapisy = await balance
    if(i === req.zapisy.length - 1) req.tb = totalBalance
    })
    }
    // console.log('New Zpisy: ', balance);
    setTimeout(()=> {
      // console.log('Zapisy1: ', req.zapisy)
      next();
    }, 500)
    // return next()
  } catch (error) {
    console.log(error);  
  }
   
}

//============STUDENT ADMISSIONS FROM STUDENTS LIST PAGE===========
exports.StudentAdmissions = async (req, res, next) => {
  // const status = 1; //1 - aktywne; 0 - skasowane
  // console.log("Req.param in admissions: ", req.params);
  // console.log("Req.body in admissions: ", req.body);

  db.query('SELECT * FROM admissions INNER JOIN academicyears on admissions.academicyearId = academicyears.id INNER JOIN institute on admissions.instytutId = institute.instituteId INNER JOIN branches on admissions.branchId = branches.branchId INNER JOIN level on admissions.levelId = level.levelId WHERE admissions.studentId = ? ORDER BY academicyears.id', [req.params.id], async (err, admissions) => {
    //  console.log("Rowssss", await admissions)
    //  console.log(admissions.length);
     
  if(!err) {    
      if(await admissions.length > 0) {
        // const newTotalNumber = usefulFunctions.totalAmount(rows)
        // const totalRawAmount = usefulFunctions.totalRawAmount(rows)

        for(let i=0; i < admissions.length; i++) {
          // const newAmountNumber = usefulFunctions.formatAmount(rows[i].amount)
          // const formattedDate = usefulFunctions.formatDate(rows[i].date)

          admissions[i] = {['ayear']: admissions[i].academicyear,
                    ['institute']: admissions[i].instituteShort,
                    ['branch']: admissions[i].branchShort,
                    ['level']: admissions[i].levelName,
                    ['admissionId']: admissions[i].admissionId,
                    // ['id']: rows[i].id}
        }
        req.zapisy = await admissions   
        // console.log('Admissions in StudentsAdmissions: ', i, admissions[i]);           
      }
      return next()

    } else {
      req.zapisy = []
      // console.log("Error transactions in ADMISSIONS: ", err);
      next()
    }
  } else {
    req.zapisy = []
    next()
  }
    });    
}

//============STUDENT TRANSACTIONS FROM STUDENTS LIST PAGE===========
exports.StudentTransactions = async (req, res, next) => {
  const status = 1; //1 - aktywne; 0 - skasowane
  let ay = ''
  // console.log("Req.params.id in transactions: ", typeof(req.query.ayear));
  // console.log('Tu nie dochodzę????');

if(req.query.ayear > 0 && typeof(req.query.ayear) != undefined) {
  // console.log('jestem turrr');
  
  db.query("SELECT academicyear FROM admissions INNER JOIN academicyears on admissions.academicyearId = academicyears.id WHERE admissions.admissionId = ?", [req.query.ayear], (err, academicyear) => {
    // console.log(academicyear[0].academicyear); 
    ay = academicyear[0].academicyear
  })
}

let query = ''
let array = []
if(req.query.ayear == 0 || req.query.ayear == undefined) {
  query = 'SELECT * FROM transactions WHERE status = ? AND idstudent = ? ORDER BY date'
  array = [status, req.student.id]
} else {
  query = 'SELECT * FROM transactions WHERE status = ? AND idstudent = ? AND admissionId = ? ORDER BY date'
  array = [status, req.student.id, req.query.ayear]
}

  db.query(query, array, async (err, rows) => {
    //  console.log("Rowssss", rows)
  if(!err) {    
      if(await rows.length > 0) {
        const newTotalNumber = usefulFunctions.totalAmount(rows)
        const totalRawAmount = usefulFunctions.totalRawAmount(rows)
        const totalChargesAmount = usefulFunctions.totalChargesAmount(rows)
        // console.log("TCA", totalChargesAmount);
        
        const totalIncomeAmount = usefulFunctions.totalIncomeAmount(rows)
        let saldo = 0

        for(let i=0; i<rows.length; i++) {
          let chargeAmount = 0;
          let incomeAmount = 0
          // console.log("TransactionTYpe: ", rows[i].transactionType);
          
          // chargeAmount = usefulFunctions.formatAmount(rows[i].amount)
          // incomeAmount = usefulFunctions.formatAmount(rows[i].amount)
          
          if(rows[i].transactionType === 0) {
            chargeAmount = usefulFunctions.formatAmount(rows[i].amount)
            // saldo = saldo - rows[i].amount           
          }           
          if (rows[i].transactionType === 1 || rows[i].transactionType === 3) {
            incomeAmount = usefulFunctions.formatAmount(rows[i].amount)
            // saldo = saldo + rows[i].amount            
          }
          saldo = saldo + rows[i].amount 
          const saldoToString = usefulFunctions.formatAmount(saldo)
          const formattedDate = usefulFunctions.formatDate(rows[i].date)
   
          rows[i]= {['formatedDate']: formattedDate,
                    ['document']: rows[i].document,
                    ['chargeAmount']: chargeAmount,
                    ['incomeAmount']: incomeAmount,
                    ['saldo']: saldoToString,
                    ['total']: newTotalNumber,
                    ['totalCharges']: totalChargesAmount,
                    ['totalIncome']: totalIncomeAmount,
                    ['rawTotal']: totalRawAmount,
                    ['id']: rows[i].id,
                    ['academicyear']: ay}                   
        }
        console.log('Rowsas: ', rows);
        
        req.trans = rows      
        return next()           
      }
      req.trans = [{
        totalCharges: "0,00",
        totalIncome: "0,00"
    }]
      return next()
 
    } else {
      req.trans = [{
        totalCharges: "0,00",
        totalIncome: "0,00"
    }]
      return next()
      // console.log("Error transactions: ", err);
    }
    });    
}

////===============STUDENTS DATA FROM TRANSACTIONID==========================
exports.studentDataFromTransactionId = async (req, res, next) => {
  // console.log("req.params in StudentsData", req.params.id);
  // const conversion = req.params.id
    try {      
      db.query('SELECT idstudent FROM transactions WHERE id = ?', [req.params.id], (error, studentId) => {
        // console.log("StudentID", studentId);
        if(!studentId || error) {
          throw new Error
          // return res.status(401).render('error', {
          //   message: 'Błąd połączenia z bazą danych',
          //   pageTitle: 'Error',
          //   user: req.user,
          //   student: {}
          // })
        }        
        // req.studentId = result[0]
        // console.log(req.student);
        db.query('SELECT * FROM users WHERE id = ?', [studentId[0].idstudent], (er, result) => {
          if (er) {
            console.log(er);
            throw new Error
          } else {
            // console.log('result', result);            
            // {student: result}
            req.student = result
            return next()
          }
        })
      })
    } catch (error) {
      // console.log("Error in IsLoggedIn: ", error);
      return res.status(401).render('error', {
        message: 'Błąd połączenia z bazą danych',
        pageTitle: 'Error',
        user: req.user,
        student: {}
      })
    } 
}


////===============STUDENTS DATA=========================================
exports.studentData = async (req, res, next) => {
  // console.log("req.params in StudentsData", req.params);
  
    try {      
      db.query('SELECT * FROM users WHERE id = ?', [req.params.id], (error, result) => {
        // console.log(result);
        if(!result) {
          return res.status(401).render('error', {
            message: 'Błąd połączenia z bazą danych',
            pageTitle: 'Error',
            user: req.user,
            student: {}
          })
        }        
        req.student = result[0]
        // console.log(req.student);
        return next()
      })
    } catch (error) {
      // console.log("Error in IsLoggedIn: ", error);
      return res.status(401).render('error', {
        message: 'Błąd połączenia z bazą danych',
        pageTitle: 'Error',
        user: req.user,
        student: {}
      })
    } 
}

////===============ISLOGGEDIN=========================================
exports.isLoggedIn = async (req, res, next) => {
  // const db = dbCon.dbConnection()
//  console.log(req.cookies);
// console.log('req.body w IsLoggedIn: ', req.body);
// console.log('req.user w IsLoggedIn: ', req.user);

  if(req.cookies.jwt) {
    try {
      //1. verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

      // console.log(decoded);
      // 2. Check if the user still exists
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        // console.log(result);
        if(!result) {
          return res.status(401).render('login', {
            message: '',
            pageTitle: 'Logowanie',
            user: []  
          })
          // return next()
        }
        req.user = result[0]
        // console.log("result in isLoggedIn: ", result[0].level);
        
        if(result[0].level === 1) {
          req.student = result[0]
        } else {
          req.student = {}
        }

        // console.log("Req.student z isLoggedIn: ", req.student);        
        return next()
      })
    } catch (error) {
      console.log("Error in IsLoggedIn: ", error);
      return res.status(401).render('login', {
        message: '',
        pageTitle: 'Logowanie',
        user: []  
      })
      // return next()
    }
  } else {
    // console.log('Brak cookies in IsLoggedIn!');  
    return res.status(401).render('login', {
      message: '',
      pageTitle: 'Logowanie',
      user: []  
    })
    // next()
  }
}