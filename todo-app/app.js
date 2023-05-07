/* eslint-disable no-undef */
const express = require("express");
var csrf = require("tiny-csrf"); 
const app = express();
const { Todo , User} = require("./models");
const bodyParser = require("body-parser"); 
var cookieParser = require("cookie-parser"); 
app.use(bodyParser.json());
const path = require("path");
const { request } = require("http");
const passport = require('passport') 
const connectEnsureLogin= require('connect-ensure-login');
const session = require('express-session');
const LocalStartegy=require('passport-local');
const { password, user } = require("pg/lib/defaults");
const { error } = require("console");
const bcrypt = require('bcrypt');
const saltRounds=10;
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser("shh!some secret string"));
app.use(csrf("this_should_be_32_character_long",["POST","PUT","DELETE"]));

app.set("view engine ","ejs");
app.use(express.static(path.join(__dirname,'public')));
app.use(session({
  secret:"my-super-secret-key-21728172615261652",
  cookie:{
    maxAge:24*60*60*1000
  }
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStartegy({
  usernameField: 'email',
  passwordField: 'password'
},(username,password,done)=>{
  User.findOne({where: {email:username}})
     .then(async (user)=> {
      const result= await bcrypt.compare(password,user.password)
      if(result){
        return done(null,user)
      }else{
        return done("Invalid Password")
      }
      return done(null,user)
     }).catch((error)=>{
      return(error)
     })
}))
passport.serializeUser((user,done)=>{
  console.log("serializing user in session",user.id)
  done(null,user.id)
})
passport.deserializeUser((id,done)=>{
  User.findByPk(id)
      .then(user=>{
        done(null,user)
      })
      .catch(error => {
        done(error,null)
      })
})

app.get("/", async (request,response) =>{
  response.render("index.ejs",{
    title:"Todo application",
    csrfToken:request.csrfToken(),
  })
});

app.get("/todos",connectEnsureLogin.ensureLoggedIn(),async (request,response) =>{
  const loggedInUser = request.user.id;
  const overdue = await Todo.overdue(loggedInUser);
  const dueToday  = await Todo.dueToday(loggedInUser);
  const dueLater = await Todo.dueLater(loggedInUser);
  const completed = await Todo.completed(loggedInUser);

  
  if(request.accepts("html")){
    response.render("todos.ejs",{
      title:"Todo application",
      overdue,
      dueToday,
      dueLater,
      completed,
      csrfToken: request.csrfToken(),
  });
  }else{
    response.json({
      overdue,
      dueToday,
      dueLater,
      completed
    })
  }
});


app.get("/signup",(request,response)=>{
  response.render("signup.ejs",{title:"Signup",csrfToken: request.csrfToken() })
})

app.post("/users",async(request,response)=>{
  const hashedPwd =await bcrypt.hash(request.body.password,saltRounds)
  console.log(hashedPwd)
  try{
    const user=await User.create({
      firstName:request.body.firstName,
      lastName:request.body.lastName,
      email:request.body.email,
      password:hashedPwd
    });
    request.login(user,(err)=>{
      if(err) {
        console.log(err)
      }
      response.redirect("/todos");
    })
  }catch(error) {
    console.log(error);
  }
})

app.get("/login",(request,response)=> {
  response.render("login.ejs",{title:"Login",csrfToken:request.csrfToken()});
  })

app.post("/session",passport.authenticate('local',{ failureRedirect:"/login"}),(request,response)=>{
  console.log(request.user);
  response.redirect("/todos");
})

app.get("/signout",(request,response)=>{
  request.logout((err)=> {
    if (err) {return next(err);}
    response.redirect("/");
  })
})

app.post("/todos",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  console.log("Creating a todo",request.body);
  console.log(request.user);
  try {
    await Todo.addTodo({
      title:request.body.title,
      dueDate:request.body.duedate,
      userId:request.user.id
    });
    return response.redirect("/todos")
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});


app.put("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  const todo = await Todo.findByPk(request.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(request.body.completed,
    );
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});


app.delete("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async function (request, response) {
  console.log("We have to delete a Todo with ID: ", request.params.id);
  try{
    await Todo.remove(request.params.id);
    response.json({success: true});
  }
  catch(error){
    console.log(error);
    return response.status(422).json(error);   
  }
});
// app.get("/todos", async(request,response) =>{
// const todoItems= await Todo.gettodo();
// response.json(todoItems);
// })
module.exports = app;
