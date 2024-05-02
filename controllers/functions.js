const mysql = require('mysql')
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

// ===================NUMBER NA STRING==============================
exports.numberToString = (num) => {
  
}

// ===================DANE DO INPUTÓW IN ADMISSION=========================
exports.admissionFields = (req, res, next) => {
  
  db.query('SELECT * FROM academicyears', (err, ayears) => {
    if(err) {
      console.log(err);      
    } else {
      // console.log(a);
      // ayears = a
    
      db.query('SELECT * FROM institute', (er, institutes) => {
        if(er) {
          console.log(er);          
        } else {
          // console.log(i);          
          // institutes = i
          // console.log(institutes);       
          
          db.query('SELECT * FROM branches', (erro, branches) => {
          
          if(erro) {
            console.log(erro);            
          } else {
            // console.log(b);
            // branches = b
          // console.log(institutes);
          
            db.query('SELECT * FROM level', (er, levels) => {
            
              if(er) {
                console.log(er);                
              } else {
                  // console.log('Czy t=====u dotarłem???');
                
                  db.query('SELECT * FROM markers', (e, markers ) => {
            
                    if(e) {
                      console.log(e);                      
                    } else {
                req.fields = {
                  ayears, 
                  institutes,
                  branches,
                  levels,
                  markers
                } 
                   next()        
              }})
            }})
          }})          
        }})
      }}) 
}

// ===================FORMATOWANIE DATY===================================
exports.formatDate = d => { 
  let year = d.toLocaleString("default", { year: "numeric" });
  let month = d.toLocaleString("default", { month: "2-digit" });
  let day = d.toLocaleString("default", { day: "2-digit" });
  return  year + "-" + month + "-" + day;
}

// ===================FORMATOWANIE KWOTY===================================
exports.formatAmount = d => { 
  let newAmount = parseFloat(d.toFixed(2))        
          
  newAmount = newAmount.toString()
  if(!newAmount.includes('.')) {
    newAmount = newAmount + '.00'
  }
  if(newAmount.slice(-2, -1) === '.') {
    newAmount = newAmount + '0'
  }
  let newAmountNumber = newAmount.replace(/\./g, ',')
  return newAmountNumber
}

// ===================TOTAL CHARGES===================================
exports.totalChargesAmount = rows => { 
  // console.log(rows);
  
  const totalAmount1 = rows.reduce((total, row) => {
    if(row.transactionType === 0) {
      total += row.amount;
    }
    return total
  }, 0);
  // console.log(totalAmount1);
  let newTotalAmount = 0
  if(totalAmount1) {newTotalAmount = parseFloat(totalAmount1.toFixed(2))}
  newTotalAmount = newTotalAmount.toString()
  // console.log(newTotalAmount);
  
  // console.log(newTotalAmount.length);
  

  if(!newTotalAmount.includes('.')) {
    newTotalAmount = newTotalAmount + '.00'
  }

  if(newTotalAmount.slice(-2, -1) === '.') {
    newTotalAmount = newTotalAmount + '0'
  }

  let newTotalNumber = newTotalAmount.toString().replace(/\./g, ',')
  // console.log(newTotalAmount);
  
  return newTotalNumber
}

// ===================TOTAL INCOME===================================
exports.totalIncomeAmount = rows => { 
  // console.log(rows);
  
  let totalAmount1 = rows.reduce((total, row) => {    
    if(row.transactionType === 1 || row.transactionType === 3) {
      total += row.amount;
    }
    return total
  }, 0);
  // console.log("Total: ", totalAmount1);

  let newTotalAmount = 0
  if(totalAmount1) {newTotalAmount = parseFloat(totalAmount1.toFixed(2))}
  newTotalAmount = newTotalAmount.toString()

  // let newTotalAmount = parseFloat(totalAmount1.toFixed(2))
  // newTotalAmount = newTotalAmount.toString()
  // console.log(newTotalAmount);
  
  // console.log(newTotalAmount.length);
  

  if(!newTotalAmount.includes('.')) {
    newTotalAmount = newTotalAmount + '.00'
  }

  if(newTotalAmount.slice(-2, -1) === '.') {
    newTotalAmount = newTotalAmount + '0'
  }

  let newTotalNumber = newTotalAmount.toString().replace(/\./g, ',')
  return newTotalNumber
}

// ===================TOTAL AMOUNT===================================
exports.totalAmount = rows => { 
  // console.log(rows);
  
  let totalAmount1 = rows.reduce((total, row) => {
    // if(row.transactionType === 0) {
      // return total - row.amount;
    // } else {
      return total + row.amount;
    // }
  }, 0);

  let newTotalAmount = parseFloat(totalAmount1.toFixed(2))
  newTotalAmount = newTotalAmount.toString()
  // console.log(newTotalAmount); 
  // console.log(newTotalAmount.length);  

  if(!newTotalAmount.includes('.')) {
    newTotalAmount = newTotalAmount + '.00'
  }

  if(newTotalAmount.slice(-2, -1) === '.') {
    newTotalAmount = newTotalAmount + '0'
  }

  let newTotalNumber = newTotalAmount.toString().replace(/\./g, ',')
  return newTotalNumber
}

// ===================TOTAL RAW AMOUNT===================================
exports.totalRawAmount = rows => { 
  let totalAmount = rows.reduce((total, row) => {
    // if(row.transactionType === 0) {
      // return total - row.amount
    // } else {
      return total += row.amount;
    // }
  }, 0);

  let newTotalAmount = parseFloat(totalAmount.toFixed(2))
  return newTotalAmount
}

exports.amountWith2DecimalPlaces = n => {
  const newAmount = (Math.round(n * 100) / 100).toFixed(2)
  return newAmount
}
