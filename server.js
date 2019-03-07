/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Md. Hussainul Islam Sajib Student ID: 137651170 Date: 07 March 2019
*
* Online (Heroku) Link: https://young-garden-36261.herokuapp.com/
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
    })
    .catch(()=>response.status(500).send("Failed to add the employee"))
});

app.post("/employee/update",(request,response)=>{
    dataService.updateEmployee(request.body)
    .then(()=>{
        response.redirect("/employees");
    })
    .catch(()=>response.status(500).send("Failed to update the employee"))
});

app.get("/", (request, response)=>{
    response.render("home.hbs");
});

app.get("/about", (request,response)=>{
    response.render("about.hbs");
});

app.get("/employees", (request,response)=>{
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
        if(data.length > 0 ){
            response.render("employees",{
                employees: data
            });

        } else {
            response.render("employees", {message:"No Results Found"} );
        }
    })
    .catch((error)=>{
        response.render("employees",{ message: error }); 
   })
});

app.get("/employees/delete/:empNum",(request,response)=>{
    dataService.deleteEmployeeByNum(request.params.empNum)
    .then(()=>response.redirect("/employees"))
    .catch(()=>response.status(500).send(`Unable to Remove employee number ${request.params.empNum}/employee not found`));
})

app.get("/employee/:value",(request,response)=>{
    let employeeInfo = dataService.getEmployeeByNum(request.params.value);
    employeeInfo.then(data=>{
        response.render("employee", { 
            employee: data
        });
    })
    .catch((error)=>{
        response.render("employee",{message: error});
    })
});

app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.empNum)
    .then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    })
    .catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    })
    .then(dataService.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
        // loop through viewData.departments and once we have found the departmentId that matches
        // the employee's "department" value, add a "selected" property to the matching
        // viewData.departments object
        for (let i = 0; i < viewData.departments.length; i++) {
            if (viewData.departments[i].departmentId == viewData.employee.department) {
                viewData.departments[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).send("Employee Not Found");
        } else {
        res.render("employee", { viewData: viewData }); // render the "employee" view
        }
    });
});

app.get("/managers", function(request,response){
    var manData = dataService.getManager();
    manData.then(data=>{
        response.send(data);
    })
    .catch(error=>{
        response.send({ message:error })
    })
});

app.get("/departments", function(request,response){
    var departData = dataService.getDepartments();
    departData.then(data=>{
        if(data.length > 0){
            response.render("departments", { departments: data });
        }
        else {
            response.render("departments", { message: "No Data" });
        }
    })
    .catch(error=>{ response.render("departments",{ message: error });
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

app.get("/images/add",(request,response)=>response.render("addImage") );

app.get("/employees/add",(request,response)=>{
    dataService.getDepartments()
    .then(data=>{
        response.render("addEmployee",{ departments: data });
    })
    .catch(error=>{
        response.render("addEmpoyee",{departments: []});
    })
    
});

app.get("/departments/add",(request,response)=>{
    response.render("adddepartment");
});

app.post("/departments/add",(request,response)=>{
    dataService.addDepartment(request.body)
    .then(()=>response.redirect("/departments"))
    .catch(error=>response.send(`Error: ${error}`))
});

app.post("/department/update",(request,response)=>{
    dataService.updateDepartment(request.body)
    .then(()=>response.redirect("/departments"))
    .catch(error=>response.send(`Error: ${error}`))
});

app.get("/department/:departmentId",(request,response)=>{
    dataService.getDepartmentById(request.params.departmentId)
    .then(data=>{
        if(data !== undefined){
            response.render("department", { 
                department: data
            });
        } else{
            response.status(404).send(`Department Not Found`);
        }
    })
    .catch((error)=>{
        response.status(404).send(`Department Not Found`);
    })    
});

app.get("*", (request,response)=>{
    response.status(404);
    response.sendFile(path.join(__dirname,"/views/404.html"));
});

var init = dataService.initialize();
init
.then(app.listen(port, function(){
    console.log("Express http server listening on " +port);
}))
.catch(msg=>{
    console.log(msg);
})