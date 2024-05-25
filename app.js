const express = require('express')
const path = require('path')
const mysql = require('mysql')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const expressLayouts = require('express-ejs-layouts')

dotenv.config({ path: './.env'})

const app = express();

const publicDirectory = path.join(__dirname, './public' )
app.use(express.static(publicDirectory))
app.use(express.urlencoded( { extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use('/', require('./routes/pages'))
app.use('/auth', require('./routes/auth'))
app.use(expressLayouts)

app.set('view engine', 'ejs')

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
})

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'mgebel_studenci',
//   password: 'K2MmGmEth1',
//   database: 'mgebel_studenci'
// })

// db.connect(error => {
//   if(error) {
//     console.log(error);
//   } else {
//     console.log('MYSQL Connected...');    
//   }  
// })

app.listen(process.env.PORT, () => {console.log(`Server started on port ${process.env.PORT}`)})