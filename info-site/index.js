const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000
const path = require("path");

app.use(
    express.urlencoded({
      extended: true,
    })
);

app.use(express.static(path.join(process.cwd(), "public")))
app.use(express.json());

app.get('/',function(req,res){
    res.sendFile(path.join(process.cwd(), "public","index.html"))
})

app.get('/about',function(req,res){
    res.sendFile(path.join(process.cwd(),"public","about.html"))
})

app.get('/contact-me',function(req,res){
    res.sendFile(path.join(process.cwd(), "public","contact-me.html"))
})

app.get(/(.*)/,function(req,res){
    res.sendFile(path.join(process.cwd(), "public","404.html"))
})

/*app.use(function (req, res, next) {
    res.sendFile(process.cwd() + '/' +  '404.html')
})*/ 
app.listen(PORT,function(err){
    if (err) console.log(err)
    else console.log(`Server listening on port ${PORT}`)
    
})

//module.exports = app;