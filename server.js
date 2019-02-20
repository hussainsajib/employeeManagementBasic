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
var app = express();
var port = process.env.PORT || 8080;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: (request,file,cb)=>{
        cb(null,Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.post("/images/add", upload.single("imageFile"), (request,response)=>{
    response.redirect('/images');
})

app.post("/employees/add", (request,response)=>{
    dataService.addEmployee(request.body)
    .then(()=>{
        response.redirect("/employees");
    });
});

app.get("/", function(request, response){
    response.sendFile(path.join(__dirname,"/views/home.html"));
});

app.get("/about", function(request,response){
    response.sendFile(path.join(__dirname,"/views/about.html"));
});

app.get("/employees", function(request,response){
    let queryParam;
    let queryData;
    if(request.query.status != undefined){
        queryParam = request.query.status;
        //console.log(queryParam);
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
    /*
    var empData = dataService.getAllEmployees();
    empData
    .then(function(data){
        response.json(data);
    })
    .catch(function(error){
        response.send({
            message: error,
        });
    })
    */
    queryData.then((data)=>{
       response.json(data);
    })
    .catch((error)=>{
        response.send({
           message: error,
        })
   })
});

app.get("/employee/:value",(request,response)=>{
    let employeeInfo = dataService.getEmployeeByNum(request.params.value);
    employeeInfo.then((data)=>{
        response.json(data);
    })
    .catch((error)=>{
        response.send(error);
    })
});

app.get("/managers", function(request,response){
    var manData = dataService.getManager();
    manData.then(function(data){
        response.send(data);
    })
    .catch(function(error){
        response.send({
            message:error,
        })
    })
});

app.get("/departments", function(request,response){
    var departData = dataService.getDepartments();
    departData.then(function(data){
        response.send(data);
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
            response.json({
                //title: "Hello",
                images: files
            });
        }
    });
});

app.get("/employees/add",(request,response)=>{
    response.sendFile(path.join(__dirname,"/views/addEmployee.html"));
});

app.get("/images/add",(request,response)=>{
    response.sendFile(path.join(__dirname,"/views/addImage.html"));
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