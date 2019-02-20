var fs = require("fs");
var employees;
var departments;
module.exports.initialize = function (){
  return new Promise(function(resolve, reject){
    fs.readFile("./data/employees.json","utf8",function(error,content){
      if(error){
        reject(error);
      } else {
        employees = JSON.parse(content);
        resolve();
      }
    })
  }).then(function(){
    return new Promise(function(resolve,reject){
      fs.readFile("./data/departments.json","utf8",function(error,content){
        if(error){
          reject(error);
        } else{
          departments = JSON.parse(content);
          resolve();
        }
      })
    })
  }).then(function(){
    return new Promise(function(resolve,reject){
        resolve();
    })
  })
}

module.exports.getAllEmployees = function(){
  return new Promise(function(resolve,reject){
    employees.length? resolve(employees) : reject("No results returned for employees");
  })
}

module.exports.getManager = function(){
  var managers = [];
  return new Promise(function(resolve,reject){
    for(let i = 0; i < employees.length; i++){
      if(employees[i].isManager == true){
        managers.push(employees[i]);
      }
    }
    managers.length ? resolve(managers) : reject("No results returned for managers");
  })
}

module.exports.getDepartments = function(){
  return new Promise(function(resolve,reject){
    departments.length ? resolve(departments) : reject("No results returned for departments");
  })
}

module.exports.addEmployee = (employeeData) =>{
  return new Promise((resolve,reject)=>{
    try{
      employeeData.isManager = !(employeeData.isManager == undefined);
      employeeData.employeeNum = employees.length + 1;
      employees.push(employeeData);
      resolve();
    } catch{
      reject();
    }
  })
}

module.exports.getEmployeesByStatus = (status)=>{
  let empStatus = [];
  return new Promise((resolve,reject)=>{
    for(let i = 0; i < employees.length; i++){
      if(employees[i].status.toLowerCase() == status.toLowerCase()){
        empStatus.push(employees[i]);
      }
    }
    empStatus.length ? resolve(empStatus) : reject("No employees found with this status");
  })
}

module.exports.getEmployeesByDepartment = (department) =>{
  let empDepartment = [];
  return new Promise((resolve,reject)=>{
    for(let i = 0; i < employees.length; i++){
      if(employees[i].department === parseInt(department)){
        empDepartment.push(employees[i]);
      }
    }
    empDepartment.length ? resolve(empDepartment) : reject("No employee found in the department");
  })
}

module.exports.getEmployeesByManager = (manager)=>{
  let empManager = [];
  return new Promise((resolve,reject)=>{
    for(let i = 0; i < employees.length; i++){
      if(employees[i].employeeManagerNum === parseInt(manager)){
        empManager.push(employees[i]);
      }
    }
    empManager.length ? resolve(empManager) : reject("No employee found under that manager");
  })
}

module.exports.getEmployeeByNum = (eNumber) =>{
  let empNumber = [];
  return new Promise((resolve,reject)=>{
    for(let i = 0; i < employees.length; i++){
      if(employees[i].employeeNum == parseInt(eNumber)){
        empNumber.push(employees[i]);
      }
    }
    empNumber.length ? resolve(empNumber) : reject("No employee found with the employee number");
  })
}