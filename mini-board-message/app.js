const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

const indexRouter = require('./routes/indexRouter')

app.set('view engine', 'ejs')
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use('/',indexRouter)

app.listen(PORT,(error)=>{
    if(error) console.log(`Error occurred: ${error}"`)
    else console.log(`Server listening on ${PORT}`)
})