const { Router } = require('express');

const indexRouter = Router();

const messages = [
    {
      id: 0,
      text: "Hi there!",
      user: "Amando",
      added: new Date()
    },
    {
      id: 1,
      text: "Hello World!",
      user: "Charles",
      added: new Date()
    }
  ];

indexRouter.post('/new',function(req,res,next){
    console.log(req.body)
    let id = messages.length
    let text = req.body.messageText
    let user = req.body.messageUser
    messages.push({'id':id,'text':text,'user':user,'added':new Date()})   
    res.redirect('/')
})

indexRouter.get('/', function(req, res) {
  let sortedmsgs = messages
  sortedmsgs.sort((a,b)=> b.added-a.added)
  res.render('index',{ title: "Mini Messageboard", messages: sortedmsgs });
})

indexRouter.get('/details/:id', function(req, res) {
  let msg = null
  for(let i=0;i<messages.length;i++){
    if(messages[i].id==req.params.id) msg = messages[i]
  }
  res.render('details',{ message: msg });
})


module.exports = indexRouter;