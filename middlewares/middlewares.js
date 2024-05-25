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

// db.connect(error => {
//   if(error) {
//     console.log(error);
//   } else {
    // console.log('MYSQL Connected...');    


// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'mgebel_studenci',
//   password: 'PMfvJAvjfpMPJCddUea7',
//   database: 'mgebel_studenci'
// })

// GET ADMISSION DETAILS (EDIT ADMISSION)
// DELETE ADMISSION
// DELETE TRANSACTION
// SALDA POSZCZEGÓLNYCH LAT AKADEMICKICH
// STUDENT ADMISSIONS FROM STUDENTS LIST PAGE
// STUDENT FILTERED TRANSACTIONS FROM STUDENTS LIST PAGE
// STUDENTS DATA FROM TRANSACTIONID
// STUDENTS DATA
// ISLOGGEDIN


//===================GET ADMISSION DETAILS=========================
exports.getAdmissionDetails = async (req, res, next) => {
  // console.log("Query: ", req.query);
  // console.log('Params: ', req.params);  
  
  try {
    db.query('SELECT * FROM admissions WHERE admissionId = ?', [req.params.id], async (error, results) => {      
      if(error) {
        console.log(error);
        // req.messages = {
        //   messagesuccess: '',
        //   messageerror: 'Błąd połączenia z bazą danych!'
        // }
        next()
      } else {  
        db.query('SELECT id, first_name, last_name FROM users WHERE id = ?', [results[0].studentId], async (err, studentname) => {
          if(err) {
            console.log(err);            
          } else {
            req.studentname = studentname[0]
            req.admissiondetails = results[0]

            // console.log(studentname[0])
            // console.log(results[0])
            
            // req.messages = {
            //   messagesuccess: 'Transakcja została usunięta!',
            //   messageerror: ''}        
            next()
          }
        })
      }
    })    
 
  } catch (er) {
    console.log(er);   
    // req.messages = {
    //   messagesuccess: '',
    //   messageerror: 'Błąd połączenia z bazą danych!'
    // }
    next() 
  }
}

//==================DELETE ADMISSION===========================
exports.deleteAdmission = async (req, res, next) => {
  try {
    db.query('SELECT id FROM transactions WHERE admissionId = ?', [req.params.admissionId], async (er, result) => {
      if(er) {
        console.log(er)      
      } else {
        // console.log(result);
        if(result.length > 0) {
          req.messages = {
            messagesuccess: '',
            messageerror: 'Nie można usunąć zapisu, który zawiera transakcje!'
          }
          return next()
        }
        db.query('UPDATE admissions SET status = ? WHERE admissionId = ?', [0, req.params.admissionId], async (erro) => {
          if(erro) {
            console.log(erro)
            req.messages = {
              messagesuccess: '',
              messageerror: 'Błąd połączenia z bazą danych!'
            }
            return next()
          } else {
            req.messages = {
              messagesuccess: 'Zapis został usunięty!',
              messageerror: ''}        
            return next()
          }
        })
      }
    })
  } catch (error) {
    console.log(error)
    req.messages = {
      messagesuccess: '',
      messageerror: 'Błąd połączenia z bazą danych!'
    }
    next() 
  }
}

//===================DELETE TRANSACTION=========================
exports.deleteTransaction = async (req, res, next) => {
  // console.log("Query: ", req.query);
  // console.log('Params: ', req.params);  
  
  try {
    db.query('UPDATE transactions SET status = ? WHERE id = ?', [0, req.params.transId], async (error) => {      
      if(error) {
        console.log(error);
        req.messages = {
          messagesuccess: '',
          messageerror: 'Błąd połączenia z bazą danych!'
        }
        next()
      } else {  
        req.messages = {
          messagesuccess: 'Transakcja została usunięta!',
          messageerror: ''}        
        next()
      }
    })    
  } catch (er) {
    console.log(er);   
    req.messages = {
      messagesuccess: '',
      messageerror: 'Błąd połączenia z bazą danych!'
    }
    next() 
  }
}


//============SALDA POSZCZEGÓLNYCH LAT AKADEMICKICH==============
exports.yearBalances = async (req, res, next) => {
  const status = 1; //1 - aktywne; 0 - skasowane
  // console.log("Req.param in admissions: ", req.zapisy);
  // console.log("Req.body in admissions: ", req.body);
let totalBalance = 0
// console.log('czy year Balance');

try {
  
  for (let i = 0; i < req.zapisy.length; i++) {
  db.query("SELECT SUM(amount) AS yearbalance FROM transactions WHERE idstudent = ? AND admissionId = ? AND status = ?", [req.student.id, req.zapisy[i].admissionId, 1], async (e, balance) => {
    if(balance[0].yearbalance === null) {balance[0].yearbalance = 0}
    // console.log('Balance', balance[0].yearbalance);
    // console.log(req.student.id);
    // console.log(req.zapisy[i].admissionId);
    // console.log(db.query.toStrin);
    // console.log(balance[0].yearbalance);
    totalBalance += balance[0].yearbalance;
    totalBalance = parseFloat(totalBalance.toFixed(2))
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

  db.query('SELECT * FROM admissions INNER JOIN academicyears on admissions.academicyearId = academicyears.id INNER JOIN institute on admissions.instytutId = institute.instituteId INNER JOIN branches on admissions.branchId = branches.branchId INNER JOIN level on admissions.levelId = level.levelId WHERE admissions.studentId = ? AND status = ? ORDER BY academicyears.id', [req.params.id, 1], async (err, admissions) => {
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
    })
}

//============STUDENT FILTERED TRANSACTIONS FROM STUDENTS LIST PAGE===========
exports.StudentTransactions = async (req, res, next) => {
  const status = 1; //1 - aktywne; 0 - skasowane
  // console.log("@@@", req.student);
  // req.student.id = req.params.studentId
  
  let ay = []
  // console.log("Req.params.id in transactions: ", req.query.ayear);
  // console.log('Req.body in transactions from students list page', req.body);

if(req.query.ayear > 0 && typeof(req.query.ayear) != undefined) {
  // console.log('jestem turrr');
  
  db.query("SELECT academicyear FROM admissions INNER JOIN academicyears on admissions.academicyearId = academicyears.id WHERE admissions.admissionId = ?", [req.query.ayear], (err, academicyear) => {
    // console.log(academicyear[0].academicyear); 
    ay = academicyear[0].academicyear
  })
}

// const ay = await usefulFunctions.getStudentsAcademicYears(req.query.ayear)
// console.log(ay);

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
                    ['academicyear']: ay,
                    ['ayear']: req.query.ayear}                   
        }
        // console.log('Filtered rows: ', rows);
        
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
        // console.log("Czy tu student jest?", req.student);
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
  //  console.log("Reqqq: ", req);
  // console.log('req.params w IsLoggedIn: ', req.params);
  // console.log('req.user w IsLoggedIn: ', req.user);
  // return
  // console.log(usefulFunctions.encryption(5));
   
// console.log('Jestem w IsLoggedIn');

  if(req.cookies.jwt) {
    try {
      //1. verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

      // console.log(decoded);
      // 2. Check if the user still exists
      db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result) => {
        // console.log(result[0].id);
        if(!result) {
          return res.status(401).render('login', {
            message: 'Błąd podczas połączenia z bazą danych!',
            pageTitle: 'Logowanie',
            user: [],
          })
     
        } 
        req.user = result[0]
        // console.log("result in isLoggedIn: ", result[0]);
        
        if(result[0].level === 1) {
          req.student = result[0]
        } else {
          req.student = {}
        }
        req.messages = {
          messageerror: '',
          messagesuccess: ''
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

// }  
// })