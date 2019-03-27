const Sequelize = require('sequelize');
const database = "dklegpakor67m";
const user = "ugmjmjhsfvytqq";
const password = "6896e21d068c1cbffec674dd568593319c0b2f8618260e89dd93f31e3e9f6c30";
const host = "ec2-54-221-236-144.compute-1.amazonaws.com";
var sequelize = new Sequelize(database, user, password,{
  host: host,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: true
  }
});
var Employee = sequelize.define('Employee',{
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hireDate: Sequelize.STRING
});

var Department = sequelize.define("Department",{
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  departmentName: Sequelize.STRING
});

module.exports.initialize = ()=>{
  return new Promise(function(resolve, reject){
    sequelize.sync()
    .then(()=>{ resolve(); })
    .catch(error=>{ reject("Unable to sync the database"); })
  })
}

module.exports.getAllEmployees = function(){
  return new Promise(function(resolve,reject){
    Employee.findAll()
    .then(data=>{ resolve(data); })
    .catch(error=>{ reject("No results found"); })
  })
}
/*
module.exports.getManager = function(){
  return new Promise(function(resolve,reject){
    reject();
  })
}
*/
module.exports.getDepartments = ()=>{
  return new Promise(function(resolve,reject){
    Department.findAll()
    .then(data=>resolve(data))
    .catch(error=>reject("No results found"))
  })
}

module.exports.addEmployee = employeeData =>{
  return new Promise((resolve,reject)=>{
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for(const property in employeeData){
      if(employeeData[property] === ""){ employeeData[property] = null; } 
    }
    Employee.create(employeeData)
    .then(()=>{ resolve();})
    .catch(()=>{ reject("Unable to create employee"); })
  })
}

module.exports.getEmployeesByStatus = status=>{
  return new Promise((resolve,reject)=>{
    Employee.findAll({ where: {status: status}})
    .then(data=>{ resolve(data); })
    .catch(error =>{ reject("No Result for this status")})
  })
}

module.exports.getEmployeesByDepartment = department =>{
  //let empDepartment = [];
  return new Promise((resolve,reject)=>{
    Employee.findAll({ where: { department: department }})
    .then(data=>resoleve(data))
    .catch(error=>reject("No result for this deparment"));
  })
}

module.exports.getEmployeesByManager = manager=>{
  //let empManager = [];
  return new Promise((resolve,reject)=>{
    Employee.findAll({ where: { employeeManagerNum: manager }})
    .then(data=>resoleve(data))
    .catch(error=>reject("No result for this manager"));
  })
}

module.exports.getEmployeeByNum = (eNumber) =>{
  //let empNumber;
  return new Promise((resolve,reject)=>{
    Employee.findAll({ where: { employeeNum: eNumber }})
    .then(data=>resoleve(data[0]))
    .catch(error=>reject("No result for this employee number"));
  })
}

module.exports.updateEmployee = employeeData=>{
  //let employeeUpdate;
  return new Promise((resolve,reject)=>{
    employeeData.isManager = (employeeData.isManager) ? true : false;
    for(const property in employeeDate){
      if(employeeData[property] === "") { employeeData[property] = null; }
    }
    Employee.update(employeeData,{
      where: { employeeNum: employeeData.employeeNum }
    })
    .then(data=>resolve(data))
    .catch((error)=>reject("Unable to update the employee data"))
  })
}

module.exports.addDepartment = departmentData=>{
  return new Promise((resolve,reject)=>{
    if(departmentData.departmentName === "") { departmentName = null; }
    Department.create(departmentData)
    .then(()=>{ resolve(); })
    .catch(()=>{ reject("Unable to create department"); })    
  })
}

module.exports.updateDepartment = departmentData => {
  return new Promise((resolve, reject)=>{
    if(departmentData.departmentName === "") { departmentData.departmentName = null; }
    Department.update(departmentData,{
      where: { departmentId: departmentData.departmentId }
    })
    .then(data=>resolve(data))
    .catch(error=>reject(`Unable to update department`))
  })
}

module.exports.getDepartmentById = id=>{
  return new Promise((resolve,reject)=>{
    Department.findAll({ where: { departmentId: id }})
    .then(data=>resolve(data[0]))
    .catch(error=>reject("No result for this department number"));
  })
}

module.exports.deleteEmployeeByNum = empNum=>{
  return new Promise((resolve,reject)=>{
    Employee.destroy({where: {employeeNum: empNum}})
    .then(()=>resolve())
    .catch(()=>reject("There was an error removing the employee"))
  })
}