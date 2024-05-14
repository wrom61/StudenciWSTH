const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { promisify } = require('util')
// const raportController = require('./pages')
const usefulFunctions = require('./functions')
// const sqlquery = require('./sqlqueries')
// const db = require('../db/db')
// db.dbConnection();
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

// PASSWORD CHANGE
// SHOW ADDTRANSACTION PAGE
// ADD TRANSACTION
// SAVE NEW ADMISSION
// SHOW ADMISSION PAGE
// SAVE EDITED ADMISSION
// SHOW EDIT ADMISSION PAGE
// SHOW VIEW TRANSACTION PAGE
// SHOW ADD ADMISSION PAGE
// SAVE NEW ADMISSION
// LOGIN (POST)
// LOGOUT
// REGISTER STUDENT INTO DATABASE
// SHOW EDIT STUDENT PAGE
// EDIT STUDENT
// DELETE TRANSACTION

//==============PASSWORD CHANIGE==================
exports.passwordChange = async (req, res) => {
// console.log('Jestem w pass', req.body);

const { modalpreviouspassword, modalnewpassword, modalnewpasswordconfirmation } = req.body

try {
  if( !modalpreviouspassword || !modalnewpassword || !modalnewpasswordconfirmation ) {
    return res.status(200).render('error', {
      message: 'Wprowadź e-mail i hasło!',
      user: req.user,
      pageTitle: "Błąd!"
    })
  }  
  

  db.query('SELECT password FROM users WHERE id = ?', [req.user.id], async (error, results) => {
    // console.log('Results', results); 
    // console.log('Resultsss', results[0].password);           
    if(results.length === 0 || !(await bcrypt.compare(modalpreviouspassword, results[0].password))) {
      return res.status(401).render('error', {
        message: 'Poprzednie hasło użytkownika jest niepoprawne!',
        user: req.user,
        pageTitle: "Błąd!"
      })
    } else if (modalnewpassword != modalnewpasswordconfirmation) {
      return res.status(401).render('error', {
        message: 'Nowe hasło i jego powtórzenie nie są takie same!',
        user: req.user,
        pageTitle: "Błąd!"
      })
    } else if (modalnewpassword == modalpreviouspassword) {
      return res.status(401).render('error', {
        message: 'Stare i nowe hasło są takie same!',
        user: req.user,
        pageTitle: "Błąd!"
      })
    } else {
      // console.log('OKKKK');
      
      let hashedPassword = await bcrypt.hash(modalnewpassword, 8)

      db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id], async (err) => {
        if (err) throw err;
     
      });  
      
        res.status(200).render(`profile`, {
          user: req.user,
          student: req.student,
          messageerror: '',
          messagesuccess: 'Hasło zostało zmienione!',
          pageTitle: 'Karta studenta',
          trans: req.trans, 
          admissions: req.zapisy
        })
    }
  })


} catch (error) {
  console.log(error);
  
}

}

//==============SHOW ADDTRANSACTION PAGE=========
exports.showAddTransactionPage = async (req, res) => {
  // console.log("Zapisy w showAddTransactionPage", req.zapisy);

  // console.log(req.user);
  
  // console.log('czy tu??????');
  
  
  if(req.zapisy.length === 0) {
    return res.status(200).render('error', {
      message: "Nie można dodać transakcji studentowi, który nie został zapisany!",
      user: req.user,
      pageTitle: "Błąd!"
    })
  }
 

  // console.log('Params at showAddTransactionPage', await req.zapisy);
  // console.log('tb', req.tb);
  
  // console.log('Czy jestem w addtransaction?');
  // console.log("Insert ID: ", req.params.id);
  
  try {
    // console.log('REQ.USER.LEVEL w renderowaniu ADDTRANSACTION', req.user.level);
    //to zmienić na > 1 jak będę odbierał id studentów
    if ( req.user.level > 2 ) {
      // console.log('Renderowanie ADDTRANSACTION!');
      // console.log(req.user.id, req.params.id);
      // console.log("Req.student: ", req.student);
      
        res.status(200).render('addtransaction', {
          pageTitle: 'Transakcja',
          formTitle: 'Dodawanie transakcji',
          buttonTitle: 'Zapisz transakcję',
          user: req.user,
          messagesuccess: '',
          messageerror: '',
          enteredValues: {
            description: '',
            amount: '',
            date: '',
            type: '',
            insertId: '',
            transactionId: '',
          },
          student: req.student,
          admissions: req.zapisy,
          totalBalance: req.tb,
          page: req.params.p
        })
        // console.log("Student5", req.student);
        
      } else {
        res.redirect('/login')
      }  
  } catch (error) {
    console.log(error); 
  } 
}


//==============ADD TRANSACTION=================
exports.addtransaction = async (req, res) => {
  // console.log("req.body in AddTransaction: ", req.body);
  // console.log('req.params in AddTransaction: ', req.params);
  // console.log('req.student in AddTransaction: ', req.zapisy);
  
  //  return
  
const { description, amount, date, type, ayear } = req.body
// return console.log(type, date)
//  console.log("Add trans (req.body): ", req.body, req.params.id);
//  console.log('req.user.level na początku ADDTRANSACTION', req.user.level);
 
 if( !description || !amount || !date || !type || !ayear) {
  return res.status(400).render('addtransaction', {
    messageerror: 'Wypełnij wszystkie pola transakcji!',
    messagesuccess: '',
    pageTitle: 'Transakcja',
    formTitle: 'Dodawanie transakcji',
    buttonTitle: 'Zapisz transakcję',
    user: req.user,
    enteredValues: {
      description,
      amount,
      date,
      type,
      ayear,
      insertId: '',
      transactionId: '',
    },
    student: req.student,
    admissions: req.zapisy,
    totalBalance: req.tb,
    page: req.params.p
  })
}  

let maxIdValue = 0
db.query('SELECT MAX(id) FROM transactions', async (error, maxId) => {
  // console.log('To 1');
  
  if(error) {
    console.log(error);    
  } else {
    // console.log("MaxID: ", maxId[0]['MAX(id)']);
    maxIdValue = await maxId[0]['MAX(id)']
    // maxIdValue = maxIdValue.toString()
    // console.log("MaxIdValue:", maxIdValue);
  }
  // db.query('SELECT * FROM transactions WHERE id = ?', [maxIdValue], async (error, trans) => {
    const queryText = "SELECT * FROM transactions WHERE id = ?"
    const queryParams = [maxIdValue]
  db.query(queryText, queryParams, async (error, trans) => {
    // console.log(queryText);
   
    
    if(error) {
      console.log(error);
      
    } else {
      // console.log("Tutaj:", maxIdValue, trans[0].id);
      // console.log("Id student: ", trans[0].idstudent, req.student.id)
      // console.log('Id transactionType: ', trans[0].transactionType, 1);
      // console.log('Document: ', trans[0].document, description);
      // console.log('Amount: ', typeof(trans[0].amount), typeof(amount));
      // console.log('Date: ', trans[0].date, date);
      // console.log('Data-year: ', trans[0].date.getFullYear(), date.slice(0,4)*1);
      // console.log('Data-month: ', trans[0].date.getMonth()+1, date.slice(5,7)*1);
      // console.log('Data-day: ', trans[0].date.getDate(), date.slice(8,10 *1))
      
      // console.log(trans[0].amount == amount);   
      // console.log(trans[0].date.getFullYear() == date.slice(0,4)*1); 
      // console.log(trans[0].date.getMonth()+1 == date.slice(5,7)*1);  
      // console.log(trans[0].date.getDate() == date.slice(8,10)*1);

      if(maxIdValue == trans[0].id && trans[0].idstudent == req.student.id && trans[0].transactionType == 1 && trans[0].document == description && trans[0].amount == amount && trans[0].date.getFullYear() == date.slice(0,4)*1 && trans[0].date.getMonth()+1 == date.slice(5,7) && trans[0].date.getDate() == date.slice(8,10)) {
        return res.status(400).render('addtransaction', {
          messageerror: `Nie można zapisać dwóch transakcji z takimi samymi danymi bezpośrednio po sobie!`,
          messagesuccess: '',
          pageTitle: 'Transakcja',
          formTitle: 'Dodawanie transakcji',
          buttonTitle: 'Zapisz transakcję',
          user: req.user,
          enteredValues: {
            description,
            amount,
            date,
            type,
            ayear,
            insertId: maxIdValue,
            transactionId: ''
          },
          student: req.student,
          admissions: req.zapisy,
          totalBalance: req.tb,
          page: req.params.p
        })
    }
    
    let transType = 0
    let transAmount = 0

    if (type === 'Należność') {
      transAmount = amount * -1
    } else if (type === 'Wpłata') {
      transType = 1
    } else if (type === 'Zwrot') {
      transType = 3
      transAmount = amount * -1
    }

    db.query("UPDATE users SET comment = ? WHERE id = ?", [req.body.comment, req.student.id], async (err, comment) => {
      if (err) throw err;
      // console.log(comment);
      req.student.comment = req.body.comment
    });

    const todaysDate = new Date();
    const fd = usefulFunctions.formatDate(todaysDate)

    const queryFinal = 'INSERT INTO transactions (idstudent, admissionId, document, amount, date, transactionType, transactionCreatedById, transactionCreatedDate) VALUES (?,?,?,?,?,?,?,?)'
    const queryFinalParam = [req.params.id, ayear, description, amount, date, type, req.user.id, fd]
    db.query(queryFinal, queryFinalParam, async (error, results) => {
      // console.log(queryFinal);
      // console.log(queryFinalParam);      
     if(error) {
       return res.status(400).render('addtransaction', {
         messageerror: `W trakcje zapisu transakcji pojawił się następujący błąd: "${error}!`,
         messagesuccess: '',
         pageTitle: 'Transakcja',
         formTitle: 'Dodawanie transakcji',
         buttonTitle: 'Zapisz transakcję',
         user: req.user,
         enteredValues: {
           description,
           amount,
           date,
           insertId: '',
           transactionId: '',
         },
         student: req.student,
         admissions: req.zapisy,
         totalBalance: req.tb,
         page: req.params.p
       })
    
     } else {
      //  console.log("Rezultaty w addTransaction", results.insertId); 
      //  console.log("Req.user po zapisaniu transakcji: ", req.user.id);
      //  console.log("Student8", req.student);
       
       return res.status(200).render('addtransaction', {
         messagesuccess: 'Transakcja została pomyślnie zarejestrowana!',
         messageerror: '',
         pageTitle: 'Transakcja',
         formTitle: 'Dodawanie transakcji',
         buttonTitle: 'Zapisz transakcję',
         user: req.user,
         enteredValues: {
           description: '',
           amount: '',
           date: '',
           insertId: results.insertID,
           transactionId: '',
         },
         student: req.student,
         admissions: req.zapisy,
         totalBalance: req.tb,
         page: req.params.p
       })
     }
    }) 
    }
  })
})
}

////=======================SAVE NEW ADMISSION=====================
exports.addAdmission = async (req, res) => {
  // console.log(req.body);
  // console.log("Tu: ", req.params.ayears[0].academicyear);
  let blad = false
  // console.log(req.params);
  
  const { ayears, institutes, branches, levels } = req.body
  // const id = req.params.id
  // console.log("Id studenta edycja transakcji: ", transactionId);
  
  if (!ayears || !institutes || !branches || !levels ) {
   blad = true
    // console.log("Nie wpisano wszystkich pól");
      return res.status(200).render('addadmission', {
        messageerror: 'Wypełnij wszystkie pola formularza!',
        messagesuccess: '',
        pageTitle: 'Zapis studenta',
        buttonTitle: 'Zapisz',
        user: req.user,
        studentId: req.params.id,
        studentfirstname: req.params.first_name,
        studentlastname: req.params.last_name,
        ayears: req.fields.ayears, 
        institutes: req.fields.institutes,
        branches: req.fields.branches,
        levels: req.fields.levels,
        markers: req.fields.markers,
        admissiondetails: {}
      })    
  }
  
  if (blad === false) {
    const todaysDate = new Date();
    const fd = usefulFunctions.formatDate(todaysDate)
    let resign = 0
    if(req.body.resignation) {resign = 1}
  db.query('INSERT INTO admissions (studentId, academicyearId, instytutId, branchId, levelId, markerId, admissionCreatedById, admissionCreatedDate, indexnumber, resignation) VALUES (?,?,?,?,?,?,?,?,?,?)', [req.params.id, req.body.ayears, req.body.institutes, req.body.branches, req.body.levels, req.body.markers, req.user.id, fd, req.body.index, resign], async (error, results) => {
    if(error) {
      console.log("er: ", error); 
        return res.status(200).render('addadmission', {
          messageerror: 'Błąd podczas zapisu do bazy danych!',
          messagesuccess: '',
          pageTitle: 'Zapis studenta',
          buttonTitle: 'Zapisz',
          user: req.user,
          studentId: req.params.id,
          studentfirstname: req.params.first_name,
          studentlastname: req.params.last_name,
          ayears: req.fields.ayears, 
          institutes: req.fields.institutes,
          branches: req.fields.branches,
          levels: req.fields.levels,
          markers: req.fields.markers,
          admissiondetails: {}
        })
    } 
    else {
      return res.status(200).render('addadmission', {
        messageerror: '',
        messagesuccess: 'Zapis został zarejestrowany!',
        pageTitle: 'Zapis studenta',
        buttonTitle: 'Zapisz',
        user: req.user,
        studentId: req.params.id,
        studentfirstname: req.params.first_name,
        studentlastname: req.params.last_name,
        ayears: req.fields.ayears, 
        institutes: req.fields.institutes,
        branches: req.fields.branches,
        levels: req.fields.levels,
        markers: req.fields.markers,
        admissiondetails: {}
      })
      }
    }) 
  }
  }
   
  
  ////=======================SHOW ADMISSION PAGE=====================
  exports.showAddAdmission = (req, res) => {
  //  console.log('params in show: ', req.params);
  //  console.log(req.fields);
      return res.status(200).render('addadmission', {
      messageerror: '',
      messagesuccess: '',
      pageTitle: 'Zapis studenta',
      buttonTitle: 'Zapisz',
      user: req.user,
      studentId: req.params.id,
      studentfirstname: req.params.first_name,
      studentlastname: req.params.last_name,
      ayears: req.fields.ayears, 
      institutes: req.fields.institutes,
      branches: req.fields.branches,
      levels: req.fields.levels,
      markers: req.fields.markers,
      admissiondetails: {}
    })
  }
  
  ////=======================SAVE EDITED ADMISSION=====================
exports.saveEditedAdmission = async (req, res) => {
  // console.log(req.params);
  // console.log("Tu: ", req.body);
  let blad = false
  // console.log("AD", req.admissiondetails);
  // return
  const { ayears, institutes, branches, levels, markers, index } = req.body
  // const id = req.params.id
  // console.log("Id studenta edycja transakcji: ", transactionId);
  
  if (!ayears || !institutes || !branches || !levels ) {
   blad = true
    // console.log("Nie wpisano wszystkich pól");
      return res.status(200).render('editadmission', {
        messageerror: 'Wypełnij wszystkie pola formularza!',
        messagesuccess: '',
        pageTitle: 'Edycja zapisu',
        buttonTitle: 'Zapisz zmiany',
        user: req.user,
        studentId: req.studentname.id,
        studentfirstname: req.studentname.first_name,
        studentlastname: req.studentname.last_name,
        ayears: req.fields.ayears, 
        institutes: req.fields.institutes,
        branches: req.fields.branches,
        levels: req.fields.levels,
        markers: req.fields.markers,
        admissionId: req.params.id,
        admissiondetails: req.admissiondetails
      })    
  }
  
  if (blad === false) {
    const todaysDate = new Date();
    const fd = usefulFunctions.formatDate(todaysDate)
    let resign = 0
    if(req.body.resignation) {resign = 1}



    db.query('UPDATE admissions SET academicyearId = ?, instytutId = ?, branchId = ?, levelId = ?, Indexnumber = ?, resignation = ?, markeriD = ?, admissionModifiedById = ?, admissionModifiedDate = ? WHERE admissionId = ?', [ayears, institutes, branches, levels, index, resign, markers, req.user.id, fd, req.params.id], async (error) => {
      
    if(error) {
      console.log("er: ", error); 
        return res.status(200).render('editadmission', {
          messageerror: 'Błąd podczas zapisu do bazy danych!',
          messagesuccess: '',
          pageTitle: 'Edycja zapisu',
          buttonTitle: 'Zapisz zmiany',
          user: req.user,
          studentId: req.studentname.id,
          studentfirstname: req.studentname.first_name,
          studentlastname: req.studentname.last_name,
          ayears: req.fields.ayears, 
          institutes: req.fields.institutes,
          branches: req.fields.branches,
          levels: req.fields.levels,
          markers: req.fields.markers,
          admissionId: req.params.id,
          admissiondetails: req.admissiondetails
        })
    } 
    else {
      // const { ayears, institutes, branches, levels, markers, index } = req.body
      req.admissiondetails.academicyearId  = ayears
      req.admissiondetails.instytutId  = institutes
      req.admissiondetails.branchId  = branches
      req.admissiondetails.levelId  = levels
      req.admissiondetails.markerId  = markers
      req.admissiondetails.Indexnumber  = index
      req.admissiondetails.resignation = resign
      
      // console.log("ADD", req.admissiondetails);
    // usefulFunctions.admissionFields();

        return res.status(200).render('editadmission', {
          messageerror: '',
          messagesuccess: 'Zapis został zmieniony!',
          pageTitle: 'Edycja zapisu',
          buttonTitle: 'Zapisz zmiany',
          user: req.user,
          studentId: req.studentname.id,
          studentfirstname: req.studentname.first_name,
          studentlastname: req.studentname.last_name,
          ayears: req.fields.ayears, 
          institutes: req.fields.institutes,
          branches: req.fields.branches,
          levels: req.fields.levels,
          markers: req.fields.markers,
          admissionId: req.params.id,
          admissiondetails: req.admissiondetails
        })
     
      }
    }) 
  }
  }
 
////=======================SHOW EDIT ADMISSION PAGE=====================
exports.showEditAdmissionPage = (req, res) => {
  //  console.log('params in show: ', req.params);
  //  console.log(req.student);
      return res.status(200).render('editadmission', {
      messageerror: '',
      messagesuccess: '',
      pageTitle: 'Edycja zapisu',
      buttonTitle: 'Zapisz zmiany',
      user: req.user,
      studentId: req.admissiondetails.studentId,
      studentfirstname: req.studentname.first_name,
      studentlastname: req.studentname.last_name,
      ayears: req.fields.ayears, 
      institutes: req.fields.institutes,
      branches: req.fields.branches,
      levels: req.fields.levels,
      markers: req.fields.markers,
      admissionId: req.params.id,
      admissiondetails: req.admissiondetails
    })
  }

////===================SHOW VIEW TRANSACTION PAGE======================
exports.viewTransaction = async (req, res) => {
    // console.log('reqqq', req.params.id);
    // console.log('Student: ', req.student);
    
  // console.log("Stuenta id: ", req.params.studentId);
  // console.log("Studenta lastname: ", req.params.first_name);
  // console.log("Studenta firstname: ", req.params.last_name);
  db.query('SELECT * FROM transactions WHERE id = ?', [req.params.id], async (error, results) => {
    if(error) {
      console.log(error);      
    } else {
    // console.log(results[0].date);
      const formattedDate = usefulFunctions.formatDate(results[0].date)
      const formattedAmount = usefulFunctions.formatAmount(results[0].amount)
      // console.log(formattedDate);Error transactions
      let type = ''
      if(results[0].transactionType === 0) {
        type = 'Należność'
      } else if (results[0].transactionType === 1) {
        type = 'Wpłata'
      } else if (results[0].transactionType === 3) {
        type = 'Zwrot'
      }    
      // console.log('req.studenttt: ', req.user);
      
      res.render('viewtransaction', {
        transData: results,
        formattedDate,
        formattedAmount,
        type,
        user: req.user,
        student: req.student[0],
        // studentsData: {
        //   studentId: req.params.studentId,
        //   first_name: req.params.first_name,
        //   last_name: req.params.last_name
        // },
        pageTitle: 'Transakcja'
      })   
    }
  })  
}



////==================LOGIN (POST)=========================================
exports.login = async (req, res) => {
  // console.log('req.body in LOGIN POST: ', req.body);  
  try {
    const { userNick, password } = req.body

    if( !userNick || !password ) {
      return res.status(400).render('login', {
        message: 'Wprowadź nazwę użytkownika i hasło!',
        pageTitle: 'Logowanie',
        user: []
      })
    }    
    // console.log(userNick);
    
    db.query('SELECT * FROM users WHERE userNick = ?', [userNick], async (error, results) => {
      // console.log('Results', results); 
      // console.log('Resultsss', results[0].password);           
      if(results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
        return res.status(401).render('login', {
          message: 'Nazwa użytkownika lub hasło są niepoprawne!',
          pageTitle: 'Logowanie',
          user: []
        })
      } else {
        const id = results[0].id
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        })
        // console.log("Token is", token);
        if (results.level === 1) {
          req.student = results[0]
        } else {
          req.student = []
        }

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
        res.cookie('jwt', token, cookieOptions)
        
        if(results[0].level === 1) {
          res.status(200).render('index', {
            user: results[0],
            student: req.student,
            pageTitle: 'Strona główna'
          })
        } else {
          res.status(200).redirect('/')
        }
      }
    })
  } catch (error) {
    console.log(error);    
  }
}


//================LOGOUT=========================================
exports.logout = async (req, res) => {
  res.cookie('jwt', jwt.sign({id: 'logout'}, process.env.JWT_SECRET, {}), {  
  expires: new Date(Date.now() + -2*1000),  
  httpOnly: true  
  })  
  res.status(200).redirect('/');  
  }


////====================REGISTER STUDENT INTO DB==================
exports.register = async (req, res) => {
  let first_name = req.body.first_name
  let last_name = req.body.last_name
  let email = req.body.email
  let gender = req.body.gender
  let userNick = req.body.userNick
  let password = req.body.password
  let password1 = req.body.password1
  let address1 = req.body.address1
  let zipcode1 = req.body.zipcode1
  let town1 = req.body.town1
  let address2 = req.body.address2
  let zipcode2 = req.body.zipcode2
  let town2 = req.body.town2
  let phone = req.body.phone
  let comment = req.body.comment
  let level = 1
  let ia = 0
  let ba = 0
  // if(req.user.level < 4) {
    
   
  // } else {
  //   { first_name, last_name, email, userNick, password, password1, address1, zipcode1, town1, address2, zipcode2, town2, phone, level, institute, branch, comment} = req.body
  // }
  // console.log(req.body);
  // console.log(req.user);
  
  // return
  
  if (!first_name || !last_name || !userNick || !password || !password1) {
    return res.status(400).render('register', {
      messageerror: 'Wypełnij obowiązkowe pola formularza!',
      messagesuccess: '',
      pageTitle: 'Rejestracja',
      formTitle: "Rejestracja studenta",
      buttonTitle: "Zarejestruj",
      user: req.user,
      regist: 1,
        student: {
          first_name,
          last_name,
          userNick,
          email,
          gender,
          password,
          password1,
          address1,
          zipcode1,
          town1,
          address2,
          zipcode2,
          town2,
          phone,
          comment,
          level,
          ia,
          ba
        },
    })
  }
  
  db.query('SELECT userNick FROM users WHERE userNick = ?', [userNick], async (error, results) => {
    if(error) {
      console.log(error);      
    }

    if( results.length > 0) {
      return res.render('register', {
        messageerror: 'Ta nazwa jest już zajęta!',
        messagesuccess: '',
        pageTitle: 'Rejestracja',
        formTitle: "Rejestracja studenta",
        buttonTitle: "Zarejestruj",
        user: req.user,
        regist: 1,
        student: {
          first_name,
          last_name,
          userNick,
          email,
          gender,
          password,
          password1,
          address1,
          zipcode1,
          town1,
          address2,
          zipcode2,
          town2,
          phone,
          comment,
          level,
          ia,
          ba
        },
      })
    } else if ( password !== password1) {
      return res.render('register', {
        messageerror: 'Hasło i jego powtórzenie nie są jednakowe!',
        messagesuccess: '',
        pageTitle: 'Rejestracja',
        formTitle: "Rejestracja studenta",
        buttonTitle: "Zarejestruj",
        user: req.user,
        regist: 1,
        student: {
          first_name,
          last_name,
          userNick,
          email,
          gender,
          password,
          password1,
          address1,
          zipcode1,
          town1,
          address2,
          zipcode2,
          town2,
          phone,
          comment,
          level,
          ia,
          ba
        },
      })
    }

    let hashedPassword = await bcrypt.hash(password, 8)
    const todaysDate = new Date();
    const fd = usefulFunctions.formatDate(todaysDate)

    // let level = 1
    // let ia = 0
    // let ba = 0
    if(req.user.level < 4) {
      level = 1
      ia = 0
      ba = 0
    } else {
      level = req.body.level
      ia = req.body.institute
      ba = req.body.branch
    }
      
    db.query('INSERT INTO users SET ?', {first_name: first_name, last_name: last_name, userNick: userNick, email: email, gender: gender, password: hashedPassword, address1: address1, zipCode1: zipcode1, town1: town1, address2: address2, zipCode2: zipcode2, town2: town2, phone: phone, comment: comment, userCreatedBy: req.user.id, userCreatedDate: fd, level: level, instituteId_access: ia, branchId_access: ba}, async (error, results) => {
      if(error) {
        console.log(error);
      } else {

        return res.render('register', {
          messageerror: '',
          messagesuccess: `Student ${first_name} ${last_name} został pomyślnie zarejestrowany!`,
          pageTitle: 'Rejestracja',
          formTitle: "Rejestracja studenta",
          buttonTitle: "Zarejestruj",
          user: req.user,
          regist: 1,
          student: []
        })
      }
    })
  })  
}

//==============SHOW EDIT STUDENT SITE=========
exports.showEditStudent = async (req, res) => {
  // console.log('edit', req.params);
  
  db.query('SELECT * FROM users WHERE id = ?', [req.params.id], async (error, studentData) => {
    // console.log("StudentData in SHOW EDIT STUDENT: ", studentData);
  
    if(error) {
      console.log(error);    
    } else {
      res.status(200).render(`editstudent`, {
        pageTitle: 'Edycja studenta', 
        user: req.user,
        messageerror: '',
        messagesuccess: '',
        formTitle: "Edycja studenta",
        buttonTitle: "Wprowadź zmiany",
        regist: 0,
        student: studentData[0],
        institutes: req.fields.institutes,
        branches: req.fields.branches,
        levels: req.fields.levels,
      })
      // console.log('Student data: ', studentData[0]);
    }    
  })
}

  ////=======================EDIT STUDENT=========================
exports.editStudent = async (req, res, next) => {
  // console.log("req.body: ", req.body);
  let first_name = req.body.first_name
  let last_name = req.body.last_name
  let email = req.body.email
  let gender = req.body.gender
  let userNick = req.body.userNick
  let address1 = req.body.address1
  let zipcode1 = req.body.zipcode1
  let town1 = req.body.town1
  let address2 = req.body.address2
  let zipcode2 = req.body.zipcode2
  let town2 = req.body.town2
  let phone = req.body.phone
  let comment = req.body.comment
  let previous_level = 0
  let previous_ia = 0
  let previous_ba = 0

  // const id = req.params.id
  // console.log("Stuenta id: ", req.student.id);
 
  if (!first_name || !last_name || !userNick) {
    return res.status(400).render('editstudent', {
      messageerror: 'Wypełnij obowiązkowe pola formularza!',
      messagesuccess: '',
      pageTitle: 'Edycja',
      formTitle: "Edycja studenta",
      buttonTitle: "Wprowadź zmiany",
      user: req.user,
      regist: 0,
      student: req.student
    })
  }
  
  db.query("SELECT userNick FROM users WHERE userNick = ?", [userNick], async (error, results) => {
    if(error) {
      console.log(error);      
    }
    //  console.log(results.length, results[0].userNick , userNick );
     
   
      if( results.length > 0 && await results[0].userNick != userNick ) {
        return res.render('editstudent', {
          messageerror: 'Ta nazwa użytkownika jest już zajęta!',
          messagesuccess: '',
          pageTitle: 'Edycja',
          formTitle: "Edycja studenta",
          buttonTitle: "Wprowadź zmiany",
          user: req.user,
          regist: 0,
          student: req.student
        })
      } 


      db.query("SELECT id, userNick, level, instituteId_access, branchId_access FROM users WHERE id = ?", [req.student.id], async (error, results) => {
        if(error) {
          console.log(error);      
        }
        // console.log(results.length, await results[0], req.student.id, req.student.userNick, userNick);      
        
    // console?.log("czy to resutl?", results[0]);
    previous_level = await results[0].level
    previous_ia = await results[0].instituteId_access
    previous_ba = await results[0].branchId_access
    // console.log(previous_ba, previous_ia, previous_level);
    
    // return
    const todaysDate = new Date();
    const fd = usefulFunctions.formatDate(todaysDate)

    let level = 0
    let ia = 0
    let ba = 0
    // console.log(req.user.level, previous_level, req.body.level);
    
    if(req.user.level < 4) {
      level = previous_level
      ia = previous_ia
      ba = previous_ba
    } else {
      level = req.body.level
      ia = req.body.institute
      ba = req.body.branch
    }
    // console.log(sqlquery.qUpdateUser);
    
    db.query('UPDATE users SET first_name = ?, last_name = ?, email = ?, gender = ?, userNick = ?, address1 = ?, address2 = ?, zipCode1 = ?, zipCode2 = ?, town1 = ?, town2 = ?, phone = ?, comment = ?, userModifiedBy = ?, userModifiedDate = ?, level = ?, instituteId_access = ?, branchId_access = ? WHERE id = ?', [first_name, last_name, email, gender, userNick, address1, address2, zipcode1, zipcode2, town1, town2, phone, comment, req.user.id, fd, level, ia, ba, req.student.id], async (error, userData) => {
      if(!userData) {
        console.log(error);
      } else {
        db.query('SELECT * FROM users WHERE userNick = ?', [userNick], (e, resultss) => {
          if(!resultss) {
            console.log(e);
          } else {
            // req.user = resultss[0]
            req.messagesuccess = 'Dane studenta zostały zaktualizowane!' 
            next()
          }
      })
      }
    })
    })
  })  
}

////=======================DELETE TRANSACTION========================
// exports.deleteTransaction = async (req, res) => {
//   console.log('Delete transaction params: ', req.student); 
        
//   db.query('UPDATE transactions SET status = ? WHERE id = ?', [0, req.params.id], async (error, results) => {
//     // db.query('DELETE FROM users WHERE id = ?', [req.params.id], async (error, results) => {
//     if(error) {
//       console.log(error);
//     } else {  

//       const status = 1; //1 - aktywne; 0 - skasowane
    
//       db.query('SELECT * FROM transactions WHERE status = ? AND idstudent = ? ORDER BY date', [status, req.params.studentId], async (err, rows) => {
//         //  console.log("Rows in selectTransactions: ", rows)
//       if(!err) {

//         if(await rows.length > 0) {
//           const newTotalNumber = usefulFunctions.totalAmount(rows)
//           const totalRawAmount = usefulFunctions.totalRawAmount(rows)   

//           for(let i=0; i<rows.length; i++) {
//             const newAmountNumber = usefulFunctions.formatAmount(rows[i].amount)          
            
//             let formattedDate = usefulFunctions.formatDate(rows[i].date)           
//             rows[i]= {['formatedDate']: formattedDate,
//                       ['document']: rows[i].document,
//                       ['amount']: newAmountNumber,
//                       ['total']: newTotalNumber,
//                       ['rawTotal']: totalRawAmount,
//                       ['id']: rows[i].id}
//           }
//         }          
//           //console.log('Rows in DELETE TRANS: ', rows);
//           //console.log('Req.params.Id: ', req.params.studentId);          
//           res.status(200).render('profile', {
//             pageTitle: 'Karta studenta',
//             user: req.user,
//             student: req.student,
//             admissions: req.zapisy,
//             trans: rows,
//             // studentData: {
//             //   studentId: req.params.studentId,
//             //   first_name: req.params.first_name,
//             //   last_name: req.params.last_name
//             // },
//           })
//         }         
//       })
//     }
//   })
// }


//=====================================================================
//=====================================================================
//=====================================================================
//=====================================================================




////===================SHOW STUDENT'S PROFILE PAGE======================
// exports.showProfilePage = async (req, res) => {
//   // console.log('profile page: ', req.params.id, req.params.last_name);
//   // console.log('Req.params in SHOW PROFILE: ', req.params);
//   // console.log(req);
//   // const d = console.log(ala());
//   //  console.log("To jest ala: ", req.ala);
   
  
//   if( req.trans ) {
//     res.render('profile', {
//       pageTitle: 'Karta studenta',
//       user: req.user,
//       trans: req.trans,
//       studentData: {
//         studentId: req.params.studentId,
//         first_name: req.params.first_name,
//         last_name: req.params.last_name,
//         level: req.params.lev},
//       admissions: req.zapisy
//     })
//     // console.log("Transdddd", req.trans[0].document);      
//   } else {
//     res.redirect('/login')
//   }  
// }

// //============STUDENT TRANSACTIONS FROM STUDENTS LIST PAGE===========
// exports.StudentTransactions = async (req, res, next) => {
//   const status = 1; //1 - aktywne; 0 - skasowane
//   // console.log("Req.params.id in transactions: ", req.student);
//   // console.log('Tu nie dochodzę????');
  
//   db.query('SELECT * FROM transactions WHERE status = ? AND idstudent = ? ORDER BY date', [status, req.student.id], async (err, rows) => {
//     //  console.log("Rowssss", rows)
//   if(!err) {    
//       if(await rows.length > 0) {
//         const newTotalNumber = usefulFunctions.totalAmount(rows)
//         const totalRawAmount = usefulFunctions.totalRawAmount(rows)
//         const totalChargesAmount = usefulFunctions.totalChargesAmount(rows)
//         const totalIncomeAmount = usefulFunctions.totalIncomeAmount(rows)
//         let saldo = 0

//         for(let i=0; i<rows.length; i++) {
//           let chargeAmount = 0;
//           let incomeAmount = 0
//           // console.log("TransactionTYpe: ", rows[i].transactionType);
          
//           if(rows[i].transactionType === 0) {
//             chargeAmount = usefulFunctions.formatAmount(rows[i].amount)
//             saldo = saldo - rows[i].amount           
//           }           
//           if (rows[i].transactionType === 1) {
//             incomeAmount = usefulFunctions.formatAmount(rows[i].amount)
//             saldo = saldo + rows[i].amount            
//           }
//           const saldoToString = usefulFunctions.formatAmount(saldo)
//           const formattedDate = usefulFunctions.formatDate(rows[i].date)
   
//           rows[i]= {['formatedDate']: formattedDate,
//                     ['document']: rows[i].document,
//                     ['chargeAmount']: chargeAmount,
//                     ['incomeAmount']: incomeAmount,
//                     ['saldo']: saldoToString,
//                     ['total']: newTotalNumber,
//                     ['totalCharges']: totalChargesAmount,
//                     ['totalIncome']: totalIncomeAmount,
//                     ['rawTotal']: totalRawAmount,
//                     ['id']: rows[i].id}
//         }
//         req.trans = rows         
//         return next()           
//       }
//       req.trans = []
//       return next()
 
//     } else {
//       console.log("Error transactions: ", err);
//     }
//     });    
// }

// //============STUDENT ADMISSIONS FROM STUDENTS LIST PAGE===========
// exports.StudentAdmissions = async (req, res, next) => {
//   // const status = 1; //1 - aktywne; 0 - skasowane
//   // console.log("Req.param in admissions: ", req.params);
//   // console.log("Req.body in admissions: ", req.body);

//   db.query('SELECT * FROM admissions INNER JOIN academicyears on admissions.academicyearId = academicyears.id INNER JOIN institute on admissions.instytutId = institute.instituteId INNER JOIN branches on admissions.branchId = branches.branchId INNER JOIN level on admissions.levelId = level.levelId WHERE admissions.studentId = ? ORDER BY academicyears.id', [req.params.studentId], async (err, admissions) => {
//     //  console.log("Rowssss", await admissions)
//     //  console.log(admissions.length);
     
//   if(!err) {    
//       if(await admissions.length > 0) {
//         // const newTotalNumber = usefulFunctions.totalAmount(rows)
//         // const totalRawAmount = usefulFunctions.totalRawAmount(rows)

//         for(let i=0; i < admissions.length; i++) {
//           // const newAmountNumber = usefulFunctions.formatAmount(rows[i].amount)
//           // const formattedDate = usefulFunctions.formatDate(rows[i].date)

//           admissions[i] = {['ayear']: admissions[i].academicyear,
//                     ['institute']: admissions[i].instituteShort,
//                     ['branch']: admissions[i].branchShort,
//                     ['level']: admissions[i].levelName,
//                     ['admissionId']: admissions[i].admissionId,
//                     // ['id']: rows[i].id}
//         }
//         req.zapisy = await admissions   
//         console.log('Admissions in StudentsAdmissions: ', i, admissions[i]);           
//       }
//       return next()

//     } else {
//       req.zapisy = []
//       console.log("Error transactions in ADMISSIONS: ", err);
//       next()
//     }
//   } else {
//     req.zapisy = []
//     next()
//   }
//     });    
// }

// ////=======================DELETE TRANSACTION========================
// exports.deleteTransaction = async (req, res) => {
//   console.log('Delete transaction params: ', req.params); 
        
//   db.query('UPDATE transactions SET status = ? WHERE id = ?', [0, req.params.id], async (error, results) => {
//     // db.query('DELETE FROM users WHERE id = ?', [req.params.id], async (error, results) => {
//     if(error) {
//       console.log(error);
//     } else {  

//       const status = 1; //1 - aktywne; 0 - skasowane
    
//       db.query('SELECT * FROM transactions WHERE status = ? AND idstudent = ? ORDER BY date', [status, req.params.studentId], async (err, rows) => {
//         //  console.log("Rows in selectTransactions: ", rows)
//       if(!err) {

//         if(await rows.length > 0) {
//           const newTotalNumber = usefulFunctions.totalAmount(rows)
//           const totalRawAmount = usefulFunctions.totalRawAmount(rows)   

//           for(let i=0; i<rows.length; i++) {
//             const newAmountNumber = usefulFunctions.formatAmount(rows[i].amount)          
            
//             let formattedDate = usefulFunctions.formatDate(rows[i].date)           
//             rows[i]= {['formatedDate']: formattedDate,
//                       ['document']: rows[i].document,
//                       ['amount']: newAmountNumber,
//                       ['total']: newTotalNumber,
//                       ['rawTotal']: totalRawAmount,
//                       ['id']: rows[i].id}
//           }
//         }          
//           //console.log('Rows in DELETE TRANS: ', rows);
//           //console.log('Req.params.Id: ', req.params.studentId);          
//           res.status(200).render('profile', {
//             pageTitle: 'Karta studenta',
//             user: req.user,
//             studentData: {
//               studentId: req.params.studentId,
//               first_name: req.params.first_name,
//               last_name: req.params.last_name
//             },
//             trans: rows,
//           })
//         }         
//       })
//     }
//   })
// }


////=======================ENTER EDIT TRANSACTION=====================
exports.editTransaction = async (req, res) => {
  // console.log("req.body edit: ", req.body);
  // console.log('req.params edit: ', req.params);
  
  const transactionId = req.params.id
  const studentId = req.params.studentId
  const last_name = req.params.last_name
  const first_name = req.params.first_name

  const { description, amount, date } = req.body
  // const id = req.params.id
  // console.log("Id studenta edycja transakcji: ", transactionId);
  
  if (!description || !amount || !date ) {
    return res.status(400).render('edittransaction', {
      messageerror: 'Wypełnij wszystkie pola formularza!',
      messagesuccess: '',
      pageTitle: 'Edycja',
      formTitle: "Edycja transakcji",
      buttonTitle: "Zapisz zmiany",
      user: req.user,
      enteredValues: { transactionId, description, amount, date, studentId, last_name, first_name }
    })
  }  
   
  db.query('UPDATE transactions SET date = ?, document = ?, amount = ? WHERE id = ?', [date, description, amount, transactionId], async (error, results) => {
    if(error) {
      console.log(error);
    } else {
            
      return res.render('edittransaction', {
        messageerror: '',
        messagesuccess: 'Dane transakcji zostały zaktualizowane!',
        pageTitle: 'Edycja',
        formTitle: "Edycja transakcji",
        buttonTitle: "",
        user: req.user,
        enteredValues: { transactionId: '', description: '' , amount: '', date: '', studentId, last_name, first_name }        
      })
    }
  })
}





//==============SHOW EDIT TRANSACTION PAGE=========
exports.showEditTransactionPage = async (req, res) => {
console.log("Show edit transaction page", req.params);

  const queryText = `SELECT * FROM transactions WHERE id = ?`
    
  db.query(queryText, [req.params.id], async (error, trans) => {
    // console.log(trans);
    const formattedDate = usefulFunctions.formatDate(trans[0].date)
    const formattedAmount = usefulFunctions.amountWith2DecimalPlaces(trans[0].amount)
    // console.log('fa: ', formattedAmount);
    
    if(error) {
      console.log(error);    
    } else {
      res.status(200).render('edittransaction', {
        pageTitle: 'Transakcja',
        formTitle: 'Edycja transakcji',
        buttonTitle: 'Zapisz zmiany',
        user: req.user,
        messagesuccess: '',
        messageerror: '',
        enteredValues: {
          description: trans[0].document,
          amount: formattedAmount,
          date: formattedDate,
          type,
          insertId: '',
          transactionId: req.params.id,
          // studentId: req.params.studentId,
          // last_name: req.params.last_name,
          // first_name: req.params.first_name
        },
        student: req.student
      })
    }
    // console.log('Student data: ', trans);
    
  })
  }

//==============SHOW ADDTRANSACTION PAGE=========

// exports.showAddTransactionPage = async (req, res) => {
//   // console.log('Params at showAddTransactionPage', await req.zapisy);
//   // console.log('tb', req.tb);
  
//   // console.log('Czy jestem w addtransaction?');
//   // console.log("Insert ID: ", req.params.id, req.params.last_name, req.params.first_name, req.params.level);
  
//   try {
//     // console.log('REQ.USER.LEVEL w renderowaniu ADDTRANSACTION', req.user.level);
//     //to zmienić na > 1 jak będę odbierał id studentów
//     if ( req.user.level > 0 ) {
//       // console.log('Renderowanie ADDTRANSACTION!');
//       // console.log(req.user.id, req.params.id);
//       // console.log("Req.student: ", req.student);
      
//         res.status(200).render('addtransaction', {
//           pageTitle: 'Transakcja',
//           formTitle: 'Dodawanie transakcji',
//           buttonTitle: 'Zapisz transakcję',
//           user: req.user,
//           messagesuccess: '',
//           messageerror: '',
//           enteredValues: {
//             description: '',
//             amount: '',
//             date: '',
//             type: '',
//             insertId: '',
//             transactionId: '',
//           },
//           student: req.student,
//           admissions: req.zapisy,
//           totalBalance: req.tb
//         })
//       } else {
//         res.redirect('/login')
//       }  
//   } catch (error) {
//     console.log(error); 
//   } 
// }








// ////=======================ENTER REGISTER=========================
// exports.register = async (req, res) => {

//   const { first_name, last_name, email, userNick, password, password1 } = req.body

//   if (!first_name || !last_name || !userNick || !password || !password1) {
//     return res.status(400).render('register', {
//       messageerror: 'Wypełnij wszystkie pola formularza!',
//       messagesuccess: '',
//       pageTitle: 'Rejestracja',
//       formTitle: "Rejestracja studenta",
//       buttonTitle: "Zarejestruj",
//       user: req.user,
//       student: []
//     })
//   }
  
//   db.query('SELECT userNick FROM users WHERE userNick = ?', [userNick], async (error, results) => {
//     if(error) {
//       console.log(error);      
//     }

//     if( results.length > 0) {
//       return res.render('register', {
//         messageerror: 'Ta nazwa jest już zajęta!',
//         messagesuccess: '',
//         pageTitle: 'Rejestracja',
//         formTitle: "Rejestracja studenta",
//         buttonTitle: "Zarejestruj",
//         user: req.user,
//         student: []
//       })
//     } else if ( password !== password1) {
//       return res.render('register', {
//         messageerror: 'Hasło i jego powtórzenie nie są jednakowe!',
//         messagesuccess: '',
//         pageTitle: 'Rejestracja',
//         formTitle: "Rejestracja studenta",
//         buttonTitle: "Zarejestruj",
//         user: req.user,
//         student: []
//       })
//     }

//     let hashedPassword = await bcrypt.hash(password, 8)    
      
//     db.query('INSERT INTO users SET ?', {first_name: first_name, last_name: last_name, userNick: userNick, email: email, password: hashedPassword }, async (error, results) => {
//       if(error) {
//         console.log(error);
//       } else {
//         return res.render('register', {
//           messageerror: '',
//           messagesuccess: 'Student został pomyślnie zarejestrowany!',
//           pageTitle: 'Rejestracja',
//           formTitle: "Rejestracja studenta",
//           buttonTitle: "Zarejestruj",
//           user: req.user,
//           student: []
//         })
// //==========================
//         // db.query('SELECT id FROM users WHERE userNick = ?', [userNick], async (er, hId) => {
//         //   if (er) {
//         //     console.log(er);            
//         //   } else {
//         //     let hashedId = await bcrypt.hash(hId.toString(), 8)
//         //     console.log("Hashed id", hId, hashedId);
            
//         //     db.query('UPDATE users SET hashedId = ? WHERE id = ?', [hashedId, hId[0].id], async (erro, resul) => {
//         //       if (erro) {
//         //         console.log(erro);                
//         //       } else {
//         //         return res.render('register', {
//         //           messageerror: '',
//         //           messagesuccess: 'Student został pomyślnie zarejestrowany!',
//         //           pageTitle: 'Rejestracja',
//         //           formTitle: "Rejestracja studenta",
//         //           buttonTitle: "Zarejestruj",
//         //           user: req.user,
//         //           student: []
//         //         })
//         //       }
//         //     })
//         //   }
//         // })  
        
        



//       }
//     })
//   })  
// }