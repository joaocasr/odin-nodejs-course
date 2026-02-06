const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000

app.use(
    express.urlencoded({
      extended: true,
    })
);

app.use(express.static(__dirname+'/public'))
app.use(express.json());

app.get('/',function(req,res){
    res.sendFile(__dirname + '/' +  'index.html')
})

app.get('/about',function(req,res){
    res.sendFile(__dirname + '/' +  'about.html')
})

app.get('/contact-me',function(req,res){
    res.sendFile(__dirname + '/' +  'contact-me.html')
})

app.get(/(.*)/,function(req,res){
    res.sendFile(__dirname + '/' +  '404.html')
})

/*app.use(function (req, res, next) {
    res.sendFile(__dirname + '/' +  '404.html')
})*/

app.listen(PORT,function(err){
    if (err) console.log(err)
    else console.log(`Server listening on port ${PORT}`)
    
})