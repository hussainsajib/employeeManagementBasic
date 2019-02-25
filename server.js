/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Md. Hussainul Islam Sajib Student ID: 137651170 Date: 05 February 2019
*
* Online (Heroku) Link: https://fast-forest-53593.herokuapp.com/
*
********************************************************************************/

var express = require('express');
var path = require('path');
var multer = require('multer');
var fs = require('fs');
var bodyParser = require('body-parser');
var dataService = require("./data-service.js");
var exphbs = require('express-handlebars');
var app = express();
var port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    helpers:{
      navLink: (url,options)=>{
        return '<li'+((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal:(lvalue,rvalue,options)=>{
          if(arguments.length < 3){
              throw new Error("Handlebars Helper equal needs 2 parameters");
          }
          if(lvalue != rvalue){
              return options.inverse(this);
          }
          else{
              return options.fn(this);
          }
      }  
    }

    }));
app.set('view engine','.hbs');


const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: (request,file,cb)=>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
app.use((request,response,next)=>{
    let route = request.baseUrl + request.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/,"");
    next(); 
});

app.post("/images/add", upload.single("imageFile"), (request,response)=>{
    response.redirect('/images');
})

app.post("/employees/add", (request,response)=>{
    dataService.addEmployee(request.body)
    .then(()=>{
        response.redirect("/employees");
    });
});

app.post("/employee/update",(request,response)=>{
    dataService.updateEmployee(request.body)
    .then(()=>{
        response.redirect("/employees");
    });
});

app.get("/", function(request, response){
    response.render("home.hbs");
});

app.get("/about", function(request,response){
    response.render("about.hbs");
});

app.get("/employees", function(request,response){
    let queryParam;
    let queryData;
    if(request.query.status != undefined){
        queryParam = request.query.status;
        
        queryData = dataService.getEmployeesByStatus(queryParam);
    } else if(request.query.department != undefined){
        queryParam = request.query.department;
        queryData = dataService.getEmployeesByDepartment(queryParam);
    } else if(request.query.manager != undefined){
        queryParam = request.query.manager;
        queryData = dataService.getEmployeesByManager(queryParam);
    } else {
        queryData = dataService.getAllEmployees();
    }

    queryData.then((data)=>{
        
        response.render("employees",{
           employees: data
       });
    })
    .catch((error)=>{
        response.render({
           message: "no results",
        })
   })
});

app.get("/employee/:value",(request,response)=>{
    let employeeInfo = dataService.getEmployeeByNum(request.params.value);
    employeeInfo.then((data)=>{
        response.render("employee", { 
            employee: data
        });
    })
    .catch((error)=>{
        response.render("employee",{message: error});
    })
});

app.get("/managers", function(request,response){
    var manData = dataService.getManager();
    manData.then(function(data){
        response.send(data);
    })
    .catch(function(error){
        response.send({ message:error })
    })
});

app.get("/departments", function(request,response){
    var departData = dataService.getDepartments();
    departData.then(function(data){
        response.render("departments",{ departments: data });
    })
    .catch(function(error){
        response.send({
            message:error,
        })
    })
});

app.get("/images", (request,response)=>{
    fs.readdir("./public/images/uploaded",(error,files)=>{
        if(error){
            throw error;
        } else {
            response.render("images",{
                images: files
            });
        }
    });
});

app.get("/employees/add",(request,response)=>{
    response.render("addEmployee");
});

app.get("/images/add",(request,response)=>{
    response.render("addImage");
});

app.get("*", function(request,response){
    response.status(404);
    response.sendFile(path.join(__dirname,"/views/404.html"));
});

var init = dataService.initialize();
init
.then(app.listen(port, function(){
    console.log("Express http server listening on " +port);
}))
.catch(function(msg){
    console.log(msg);
})