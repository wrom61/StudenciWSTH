const mysql = require('mysql')
const usefulFunctions = require('./functions')

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

// SHOW PROFILE PAGE
// SEARCH/FIND STUDENT
// SHOW REGISTER PAGE

//===============SHOW PROFILE PAGE==================================
exports.showProfilePage = async (req, res) => {
  // console.log(req.user.id);
  // console.log("Req.params in Show profile pageE: ", req.params);
  // console.log("Req.user in Show profile pageE: ", req.user);
  // console.log("Req.student in Show profile pageE: ", req.student);
  // console.log('Tut: ', req.trans);
  // console.log("Student", req.student);
  
  if( req.user ) {
    res.render('profile', {
      pageTitle: 'Karta studenta',
      user: req.user,
      trans: req.trans,
      student: req.student,
      // studentData: {
      //   id: req.user.id,
      //   first_name: req.user.first_name,
      //   last_name: req.user.last_name,
      //   lev: req.params.lev,
      //   studentId: req.params.studentId
      // },
      admissions: req.zapisy
    })     
  } else {
    res.redirect('/login')
  }  
}

//==================SEARCH/FIND STUDENT=========================
exports.find = (req, res) => {
  const { searchfn, searchln, searchad } = req.body
  // console.log(searchTerm);
  
  db.query('SELECT * FROM users WHERE (last_name LIKE ? AND first_name LIKE ? AND address1 LIKE ? AND level = 1) OR (last_name LIKE ? AND first_name LIKE ? AND zipCode1 LIKE ? AND level = 1) OR (last_name LIKE ? AND first_name LIKE ? AND town1 LIKE ? AND level = 1)', ['%' + searchln +'%', '%' + searchfn +'%', '%' + searchad +'%', '%' + searchln +'%', '%' + searchfn +'%', '%' + searchad +'%', '%' + searchln +'%', '%' + searchfn +'%', '%' + searchad +'%'], (err, students) => {
    if(!err) {
        res.status(200).render('studentsList', {
          pageTitle: 'Lista studentów',
          successmessage: '',
          user: req.user,
          students,
          searchFieldValues: {
            searchfn,
            searchln,
            searchad
          }
        })
       
    } else {
      console.log('err');      
    }
    // console.log('The data from user table: \n', students);
    
  })
}

//===============SHOW REGISTER PAGE==================================
exports.showRegisterPage = async (req, res) => {
  try {
    if ( req.user.level > 1 ) {
        res.status(200).render('register', {
          pageTitle: 'Rejestracja', 
          user: req.user,
          messageerror: '',
          messagesuccess: '',
          formTitle: "Rejestracja studenta",
          buttonTitle: "Zarejestruj",
          regist: 1,
          student: []
        })
      } else {
        res.redirect('/login')
      }  
} catch (error) {
}
}

// //===============SHOW LOGIN PAGE==================================
// exports.showLoginPage = async (req, res) => {
//   console.log('Czy jestem w LOGIN?');
// console.log('req.user w LOGIN', req.user);
//   try {
//     // if(req.user.level > 0) {
//       res.status(200).render('login', {
//         pageTitle: 'Logowanie', 
//         message: '', 
//         user: req.user
//       })
//     // }    
//   } catch (error) {
//       res.status(200).render('login', {
//       pageTitle: 'Logowanie', 
//       message: '', 
//       user: req.user
//     })
//   }
// }



//============================================================
//============================================================
//============================================================
//============================================================
//============================================================



//=====================DELETE STUDENT=========================
exports.deleteUser = (req, res, next) => {
  // console.log("jestem w delete student", req.params.id);
  const param = req.params.id * 1
 
  db.query('SELECT * FROM transactions WHERE status = ? AND idstudent = ?', [1, param], async (err, resul) => {
    // console.log(sqlquery);
    
    // console.log("resul in DELETE STUDENT:", resul[0]);
    
    if(err) {
      // console.log("Czy to ten błąd?", err);      
    } else {
      if(resul.length > 0) {
        // console.log("Czy tu w DELETE doszedłem?"); 
        return res.status(200).render('error', {
          message: "Nie można usunąć studenta, który ma wpisane wpłaty!",
          user: req.user,
          pageTitle: "Błąd!"
        })

      } else {
        // console.log('Lecimy też tu?');
        
        db.query('UPDATE users SET status = ? WHERE id = ?', [0, req.params.id], async (error, results) => {
        // db.query('DELETE FROM users WHERE id = ?', [req.params.id], async (error, results) => {
          if(error) {
            console.log(error);
          } else {
          // next()       
            res.status(200).redirect('/')
          }
        })
      }
    }
  })
}







//==================STUDENT LIST=========================
exports.showStudentList = async (req, res) => {
  db.query('SELECT * FROM users WHERE level = ? AND status = ? ORDER BY last_name, first_name LIMIT 200', [1, 1], async (err, result) => {
    // console.log('Czy w studentList?');
    
    if(!err) {
      // req.allStudents = result
      if(req.user) {
        try {      
          if (req.user.level > 1) {
          //  console.log(req.ala1.ala);
          //  console.log(req.ala1.jan);
           
              // console.log(req.allStudents);
                        
              res.status(200).render('studentsList', {
              pageTitle: 'Lista studentów',
              successmessage: req.messagesuccess,
              user: req.user,
              students: result,
              searchFieldValues: {
                searchfn: '',
                searchln: '',
                searchad: ''
              }
            })
          } else {
            res.status(200).render('index', {
              pageTitle: 'Strona główna',
              user: req.user})
          }    
        } catch (error) {
        }
      } else {
        res.status(200).render('index', {
        pageTitle: 'Strona główna',
        user: req.user})
      }
      // next()
    } else {
      console.log("Problem to get all students: ", err);
    }
  })  
}


//=================TRANSACTIONS================================
// exports.transactions = async (req, res, next) => {
//     // console.log('nr', req.user.first_name);
    
//     const status = 1; //1 - aktywne; 0 - skasowane
      
//       db.query('SELECT * FROM transactions WHERE status = ? AND idstudent = ? ORDER BY date', [status, req.user.id], async (err, rows) => {
//         //  console.log("Rowssss", rows)
//       if(!err) {

//           if(await rows.length > 0) {
//             const newTotalNumber = usefulFunctions.totalAmount(rows)
//             const totalRawAmount = usefulFunctions.totalRawAmount(rows)
  
//             for(let i=0; i<rows.length; i++) {
//               const newAmountNumber = usefulFunctions.formatAmount(rows[i].amount)            
             
//               let formattedDate = usefulFunctions.formatDate(rows[i].date)
             
//               rows[i]= {['formatedDate']: formattedDate,
//                         ['document']: rows[i].document,
//                         ['amount']: newAmountNumber,
//                         ['total']: newTotalNumber,
//                         ['rawTotal']: totalRawAmount,
//                         ['id']: rows[i].id}
//             }
//             req.trans = rows
//             return next()           
//           }
//           req.trans = []
//           return next()
 
//         } else {
//           console.log("Error transactions: ", err);
//         }
//         });
//   };


  

  

  