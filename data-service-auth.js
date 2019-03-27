var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
const uri = 'mongodb://localhost/web322';
let User; //to be defined on new connection

var userSchema = new Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{"dateTime": Date, "userAgent": String }]
});


module.exports.initialize = ()=>{
    return new Promise((resolve,reject)=>{
        let db = mongoose.createConnection(uri);
        db.on('error',error=>reject(error));
        db.once('open',()=>{
            db.model('users',userSchema);
        });
    });
};

module.exports.registerUser = (userDate)=>{
    return new Promise((resolve,reject)=>{
        if(userData.password != userData.password2){ reject("Passwords Do not match"); }
        else{
            var newUser = new User(userData);
            newUser.save(error=>{
                if(error){
                    if(error.code == 11000){
                        reject("User Name already taken");
                    } else {
                        reject("There was an error creating the user: "+error);
                    }
                } else {
                    resolve();
                }
            })
        }
    })
};

module.exports.checkUser = (userData)=>{
    return new Promise((resolve,reject)=>{
        User.find({user: userData.userName})
        .exec()
        .then(users=>{
            if(users.length() == 0){ reject(`Unable to find the user: ${userData.userName}`); }
            else if(users[0].password != userData.password) {reject(`Incorrect Password for user: ${userData.userName}`); }
            else {
                users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent:userData.userAgent});
                User.updateOne({userName: users[0].userName}, { $set: {loginHistory: users[0].loginHistory}})
                .exec()
                .then((data)=>resolve(data))
                .catch((error)=>reject(`There was an error varifying the user: ${error}`))
            }
        })
        .catch(error=> reject(`Unable to find user: ${userData.user}`))
    });
};
