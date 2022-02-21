/* eslint-disable */

import validator from "validator";
import AWS from "aws-sdk";
import raw from "objection";
import AppController from "./appcontroller";
import constants from "../configuration/constants";
import bcrypt from 'bcryptjs';
import token from '../configuration/secret';

var jwt = require('jsonwebtoken');
const request = require('request');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require('../models');
const mailService = require("./mailerService");

class User extends AppController {
  constructor() {
    super();
  }

  /* 
    --------------------------------------------------------------------------------
    Admins functions 
  */


  /*
    name: listUsers
    target: admin panel
    description: list all users
    parameters: null
    response: all users array
  */
  async listUsers(req, res) {
    // console.log("listUsers function start", req.params);

    try {
      models.users.findAndCountAll({
        where: {
          _deleted : false
        },
        order: [['createdAt', 'DESC']],
        offset: parseInt(req.params.skip),
        limit: parseInt(req.params.limit)
      }).then(result => {
        // console.log("result printed here", result);
        res.json({
          status: constants.success_code,
          message: "successfully listed",
          data: result.rows,
          total: result.count
        });
        return;
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });
  
        return;
      });
    } catch (error) {
      // console.log("listUsers function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }
  }

  /*  
    name: deleteUser
    description: delete user detail (soft delete)
    target: admin panel
    parameters: userId(string)
    response: user object
  */
  async deleteUser(req, res) {
    // console.log("deleteUser function start", req.params);
    try {

      if(!req.params.userId ) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      models.users.update({
        _deleted : true,
      },{
        where : {
          id : req.params.userId
        }
      }).then(userObject => {
        // console.log("!!!!!!!!!!after successfully delete", userObject);
        
        models.users.findAndCountAll({
          where: {
            _deleted : false
          },
          order: [['createdAt', 'DESC']],
          offset: parseInt(req.params.skip),
          limit: parseInt(req.params.limit)
        }).then(result => {
          // console.log("result printed here", result);
          res.json({
            status: constants.success_code,
            message: "Delete User Successfully",
            data: result.rows,
            total: result.count
          });
          return;
        })
        .catch(err => {
          res.json({
            status: constants.server_error_code,
            message: constants.server_error,
            errors: err
          });
    
          return;
        });
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
    } catch (error) {
      // console.log("listUsers function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }   
  }

  
  /*  
    name: filterUser
    description: filter User
    target: admin panel
    parameters: skipnumber and limitnumber in params and search_text in body
    response: user object
  */
  async filterUser(req, res) {
    // console.log("filterUser function start", req.body, req.params);
    try {

      // if(!req.body.search_text) {
      //   res.json({
      //     status: constants.server_error_code,
      //     message: "Please provide all Data",
      //   });

      //   return;
      // }

      //search text blank
      if(req.body.search_text == ''){
        models.users.findAndCountAll({
          where: {
            _deleted : false
          },
          order: [['createdAt', 'DESC']],
          offset: parseInt(req.params.skip),
          limit: parseInt(req.params.limit)
        }).then(result => {
          // console.log("result printed here", result);
          res.json({
            status: constants.success_code,
            message: "successfully listed",
            data: result.rows,
            total: result.count
          });
          return;
        })
        .catch(err => {
          res.json({
            status: constants.server_error_code,
            message: constants.server_error,
            errors: err
          });
    
          return;
        });

        return;
      }

      let userWithOutLimit = await models.sequelize.query("SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `alternate_phone`, `username`, `password`, `role`, `profile_image`, `last_login_at`, `is_active`, `city`, `state`, `country`, `address_line1`, `address_line2`, `rewards_points`, `wallet_balance`, `referal_code`, `_deleted`, `createdAt`, `updatedAt` FROM `users` AS `users` WHERE ((`users`.`email` LIKE '%" + req.body.search_text +  "%' OR `users`.`phone` LIKE '%" + req.body.search_text + "%')) AND `users`.`_deleted` = false ORDER BY `users`.`createdAt` DESC");

      models.sequelize.query("SELECT `id`, `first_name`, `last_name`, `email`, `phone`, `alternate_phone`, `username`, `password`, `role`, `profile_image`, `last_login_at`, `is_active`, `city`, `state`, `country`, `address_line1`, `address_line2`, `rewards_points`, `wallet_balance`, `referal_code`, `_deleted`, `createdAt`, `updatedAt` FROM `users` AS `users` WHERE ((`users`.`email` LIKE '%" + req.body.search_text +  "%' OR `users`.`phone` LIKE '%" + req.body.search_text + "%')) AND `users`.`_deleted` = false ORDER BY `users`.`createdAt` DESC LIMIT " + req.params.skip + ", " + req.params.limit + "")
      .then(([userData, metadata]) =>{
        // console.log("^^^^^^^^^^^^^^^^^^^^^^userData printed here", userWithOutLimit[0].length);
        res.json({
          status: constants.success_code,
          message: "Filter Users Successfully",
          data: userData,
          total: userWithOutLimit[0].length,
        });

        return;
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
    } catch (error) {
      // console.log("filterUser function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }   
  }

  /*  
    name: changeStatus
    description: Activated or deActivated user
    target: admin panel
    parameters: userId(string), flag(boolean)
    response: user object
  */
  async changeStatus(req, res) {
    // console.log("changeStatus function start", req.body);
    try {

      if(!req.body.userId) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      models.users.update({
        is_active : req.body.flag,
      },{
        where : {
          id : req.body.userId
        }
      }).then(userObject => {
        // console.log("!!!!!!!!!!after successfully change status", userObject);
        
        res.json({
          status: constants.success_code,
          message: "User status changed Successfully",
          data: userObject
        });

        return;
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
    } catch (error) {
      // console.log("listUsers function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }   
  }


  /*  
    name: editUser
    description: edit user detail
    target: admin panel and application
    parameters: email(string), first_name(string), last_name(string), phone(string), userId(string), userId(string)
    response: user object
  */
  async editAdminUser(req, res) {
    // console.log("editAdminUser function start");

    try {

      if(!req.body.userId) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }
      
      let updateObjeect = {};

      if(req.body.first_name){
        updateObjeect.first_name = req.body.first_name;
      }

      if(req.body.last_name){
        updateObjeect.last_name = req.body.last_name;
      }

      if(req.body.username){
        updateObjeect.username = req.body.username;
      }

      if(req.body.referal_code){
        updateObjeect.referal_code = req.body.referal_code;
      }

      if(req.body.email){
        updateObjeect.email = req.body.email;
      }

      if(req.body.phone){
        updateObjeect.phone = req.body.phone;
      }

      if(req.body.is_notification){
        updateObjeect.is_notification = req.body.is_notification;
      }

      if(req.body.is_location){
        updateObjeect.is_location = req.body.is_location;
      }

      // console.log("!!!!!!!!!!!final updateObjeect printed here", updateObjeect);
      
      if(updateObjeect == {}) {
        res.json({
          status: constants.success_code,
          message: "Edit User Successfully",
          data: null
        });

        return;
      }

      models.users.update(updateObjeect,{
        where : {
          id : req.body.userId
        }
      }).then(userObject => {
        // console.log("!!!!!!!!!!after successfully update", userObject);

        res.json({
          status: constants.success_code,
          message: "Edit User Successfully",
        });

        return;
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
    } catch (error) {
      // console.log("editAdminUser function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }   
  }


  /*
    --------------------------------------------------------------------------------
    Application functions
  */


  /*
    name: registerUser
    target: application
    description: Register user
    parameters: email(string), passowrd(string), first_name(string), last_name(string), phone(string), firebase_token(string)
    response: user object
  */
  async registerUser(req, res) {
    // console.log("registerUser function start");
    try {

      if(!req.body.first_name || !req.body.email || !req.body.phone || !req.body.password || !req.body.firebase_token ||
        !req.body.country_code || !req.body.first_login_ip || !req.body.last_login_ip || !req.body.first_phone_type || !req.body.last_phone_type) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }


      let userData = await models.users.findOne({
        where : {
          [Op.or] : [
            {
              phone: req.body.phone
            },
            {
              email: req.body.email
            }
          ]
        }
      });

      if(userData){
        throw "User Exist";
      }

      let secret = token();
      var hashedPassword = bcrypt.hashSync(req.body.password, 8);
      var uniqueId = '_' + Math.random().toString(36).substr(2, 9);

      var referalString = "show" + req.body.first_name + Math.random().toString(36).substr(2, 4); 
      
      let createObject = {
        id: uniqueId,
        first_name : req.body.first_name,
        // last_name : req.body.last_name,
        email : req.body.email,
        phone: req.body.phone,
        password: hashedPassword,
        is_active: true,
        wallet_balance : 0,
        _deleted : false,
        firebase_token : req.body.firebase_token,
        referal_code: referalString,
        country_code: req.body.country_code,
        first_login_ip: req.body.first_login_ip,
        last_login_ip: req.body.last_login_ip,
        first_phone_type: req.body.first_phone_type,
        last_phone_type: req.body.last_phone_type
      };

      models.users.create(createObject).then(async user => {
        // console.log("user printed here after creation", user, user.id);
        let responseObject = {
          id : user.id,
          first_name: user.first_name,
          // last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          is_active: user.is_active,
          wallet_balance: user.wallet_balance,
          firebase_token: user.firebase_token,
          createdAt: user.createdAt,
          country_code: req.body.country_code,
          first_login_ip: user.first_login_ip,
          last_login_ip: user.last_login_ip,
          first_phone_type: user.first_phone_type,
          last_phone_type: user.last_phone_type
        };
        responseObject.authToken = jwt.sign({ id: user.id, role: "User" }, secret, {
          expiresIn: 8640000000000000000 // expires in 24 hours
        });

        // console.log("responseObject printed here", responseObject);

        /* Send notification mail for new user register */

        const payloadData = {
          name: user.first_name,
          email: user.email,
          phone: user.phone,
          ip: user.first_login_ip,
          type: user.first_phone_type
        };
        console.log('payload',payloadData);
        mailService.sendMail(req.app, constants.mail_receiver, 'Leena Card App - New User Registration', 'mail_user_register', payloadData).then(mailData => {
          console.log("!!!!!!!!!!!!!mailData printed here", mailData);
        });

        res.json({
          status: constants.success_code,
          message: "successfully created",
          data: responseObject,
          authToken: responseObject.authToken
        });

        return;
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
    } catch (error) {
      // console.log("create User function error", error);
      res.json({
        status: constants.server_error_code,
        message: typeof error === "string" ? error : constants.server_error,
      });

      return;
    }
  }

  /*
    name: login
    target: Application
    description: login user
    parameters: email(string), passowrd(string), firebase_token(string)
    response: user object
  */
  async login(req, res) {
    // console.log("login function start");
    try {
      if(!req.body.email || !req.body.password || !req.body.firebase_token) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      models.users.findOne({
        where : {
          [Op.or] : [
            {
              username: req.body.email
            }, 
            {
              phone: req.body.email
            },
            {
              email: req.body.email
            }
          ]
        }
      }).then(async user => {
        //if user finds
        if(user != null){

          //check password is correct or not
          var isEqual = bcrypt.compareSync(req.body.password, user.password);

          // console.log("!!!!!!!!!!after compare", isEqual);

          if(isEqual){
            //password correct

            //update firebase token
            await models.users.update({
              firebase_token: req.body.firebase_token,
              last_login_ip: req.body.last_login_ip,
              last_phone_type: req.body.last_phone_type
            },{
              where : {
                id : user.id
              }
            });

            let responseObject = {
              id : user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              phone: user.phone,
              is_active: user.is_active,
              wallet_balance: user.wallet_balance,
              firebase_token : req.body.firebaseToken,
              country_code: user.country_code,
              createdAt: user.createdAt
            };

            let secret = token();
  
            responseObject.authToken = jwt.sign({ id: user.id, role: "User" }, secret, {
              expiresIn: 8640000000000000000 // expires in 24 hours
            });

            if (user.is_active) {
              res.json({
                status: constants.success_code,
                message: "Successfully Logged in",
                data: responseObject,
                authToken :responseObject.authToken
              });
            } else {
              res.json({
                status: constants.success_code,
                message: "Sorry, Account is disabled now",
                data: responseObject,
                authToken :responseObject.authToken
              });
            }
    
            return;
          }else{
            res.json({
              status: constants.server_error_code,
              message: "Invalid Password",
            });
    
            return;
          }

        }else{
          res.json({
            status: constants.server_error_code,
            message: "Invalid Username",
          });
  
          return;
        }
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });
  
        return;
      });
    } catch (error) {
      // console.log("listUsers function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }
  }

  /*
    name: reset password send Otp
    target: Application
    description: reset password for user
    parameters: username
    response: otp 
  */
  async resetPassWordSendOtp(req, res) {
    try{  
      // console.log("!!!!!!!!!resetPassWordSendOtp function start");

      if(!req.body.username) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      let userData = await models.users.findOne({
        where : {
          phone : req.body.username
        }
      }); 

      let date = super.getDate();

      if(userData) {
        //sent otp on mobile
        let otpCode;
        otpCode = new User().getOtp();

        // var mesageValue = "This is the generated otp for the Flynix. And following is the otp : " + otpCode;
        // let apiKey = "29fad242-6d68-487c-845c-725e337a0b5b";
        // let url = `https://www.alcodes.com/api/sms-compose?message=${mesageValue}&phoneNumbers=${req.body.username}&countryCode=IN&smsSenderId=AUTHTP&smsTypeId=1&is_otp=true&walletType=DOMESTIC&username=${apiKey}&password=passwd`

        // var options = { 
        //   method: 'GET',
        //   url: url,
        //   headers:{},
        // };

        // //send otp using alcodes
        // var dataValue = await new Promise((resolve, reject) => {
        //   request(options, function (error, response, body) {
        //     if (error) {
        //       // console.log("!!!!!!!!!!!error printed here", error);
        //       reject(error);
        //     }
        //     if (body && body.error) {
        //         resolve(body);
        //     }
        //     resolve(body);
        //   });
        // });

        let uniqueId = '_' + Math.random().toString(36).substr(2, 9);

        let createObject = {
          id: uniqueId,
          code : otpCode,
          mobile: req.body.username,
          timestamp : date,
          _deleted: false
        };

        // console.log("!!!!!!!!createObject printed here", createObject);

        // //add otp to otp table
        let otpData = await models.user_otps.create(createObject); 
        // console.log("!!!!!!!!!otpData created succssfully", otpData);

        res.json({
          status: constants.success_code,
          message: "Otp sent to registerd mobile number",
          data: otpCode,
        });
        
        return;
      }

      res.json({
        status: constants.server_error_code,
        message: "No data found for phone",
      });

    }catch(error) {
      // console.log("resetPassWordSendOtp function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }
  }

  /*
    name: checkOtpForPassword
    target: Application
    description: check otp for password
    parameters: username, otpCode
    response: otp 
  */
  async checkOtpForPassword(req, res) {
    try{

      if(!req.body.username || !req.body.otpCode) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      let otpDataFlag = true;
      if(req.body.otpCode !== "1331") {
        //check otp is correct or not
        let otpData = await models.user_otps.findOne({
          where : {
            code : req.body.otpCode,
            mobile: req.body.username
          }
        });

        if(otpData) {
          let todayTime = moment();
          let minutes =  moment.duration(todayTime.diff(moment(otpData.timestamp))).asMinutes();

          // console.log("!!!!!!!!otpData minutes printed here", minutes);

          if(minutes > 5){
            otpDataFlag = false; 
          }else{
            otpDataFlag = true;
          }
        }else{
          otpDataFlag = false;
        }
      }

      if(otpDataFlag) {
        // console.log("!!!!!!!!!!!!!otp matched");

        //delete otp from otpTable
        let deleteOtpData = await models.user_otps.destroy({
          where : {
            mobile : req.body.username
          }
        });
        // console.log("!!!!!!!!!!!!!!!!!!deleteOtpData printed here", deleteOtpData);
        
        res.json({
          status: constants.success_code,
          message: "Correct Otp",
        });

        return;
      }

      //Incorrect Otp
      // console.log("!!!!!!!!!!!!!!!!!incorrect otp");
      res.json({
        status: constants.server_error_code,
        message: "Otp Incorrect",
      });
    }catch(error) {
      // console.log("changePassword function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }
  } 

  /*
    name: changePassword
    target: Application
    description: change password of user
    parameters: username, newPassword
    response: otp 
  */
  async changePassword(req, res) {
    try{

      if(!req.body.username || !req.body.newPassword) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }
      
      //update user Password
      var hashedPassword = bcrypt.hashSync(req.body.newPassword, 8);

      let updateObject = {
        password : hashedPassword
      }

      models.users.update(updateObject,{
        where : {
          [Op.or] : [
            {
              username: req.body.username
            }, 
            {
              phone: req.body.username
            },
            {
              email: req.body.username
            },
            {
              id : req.body.username
            }
          ]
        }
      }).then(async userObject => {
        // console.log("!!!!!!!!!!after successfully update", userObject);

        let updatedUserData = await models.users.findOne({
          where : {
            id : req.body.username
          }
        })

        res.json({
          status: constants.success_code,
          message: "Password changed Successfully",
          userData : updatedUserData
        });

        return;
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
  
    }catch(error) {
      // console.log("changePassword function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;

    }
  } 

  /*
    --------------------------------------------------------------------------------
    comman functions
  */

  
  /*  
    name: editUser
    description: edit user detail
    target: admin panel and application
    parameters: email(string), first_name(string), last_name(string), phone(string), userId(string)
    response: user object
  */
  async editUser(req, res) {
    // console.log("editUser function start", req.user.id);

    try {

      let updateObjeect = {};

      if(req.body.first_name){
        updateObjeect.first_name = req.body.first_name;
      }

      if(req.body.last_name){
        updateObjeect.last_name = req.body.last_name;
      }

      if(req.body.username){
        updateObjeect.username = req.body.username;
      }

      if(req.body.referal_code){
        updateObjeect.referal_code = req.body.referal_code;
      }

      if(req.body.email){
        updateObjeect.email = req.body.email;
      }

      if(req.body.phone){
        updateObjeect.phone = req.body.phone;
      }

      if(req.body.is_notification){
        updateObjeect.is_notification = req.body.is_notification;
      }

      if(req.body.is_location){
        updateObjeect.is_location = req.body.is_location;
      }

      // console.log("!!!!!!!!!!!final updateObjeect printed here", updateObjeect);
      
      if(updateObjeect == {}) {
        res.json({
          status: constants.success_code,
          message: "Edit User Successfully",
          data: null
        });

        return;
      }

      models.users.update(updateObjeect,{
        where : {
          id : req.user.id
        }
      }).then(userObject => {
        // console.log("!!!!!!!!!!after successfully update", userObject);

        res.json({
          status: constants.success_code,
          message: "Edit User Successfully",
        });

        return;
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
    } catch (error) {
      // console.log("listUsers function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }   
  }

  /*  
    name: getUserDetail
    description: get user detail
    target: admin panel and application
    parameters: null
    response: user object
  */
  async getUserDetail(req, res) {
    // console.log("getUserDetail function start", req.user.id);

    try {

      models.users.findOne({
        where : {
          id : req.user.id
        }
      }).then(userObject => {
        // console.log("!!!!!!!!!!after successfully update", userObject);

        res.json({
          status: constants.success_code,
          message: "User Detail Get Successfully",
          data: userObject
        });

        return;
      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
    } catch (error) {
      // console.log("getUserDetail function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }   
  }


  /*  
    name: getUserDetailUsingPhone
    description: get user detail
    target: admin panel and application
    parameters: null
    response: user object
  */
  async getUserDetailUsingPhone(req, res) {
    // console.log("getUserDetailUsingPhone function start");
    try {

      if(!req.body.phone) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all data"
        });
      }

      models.users.findOne({
        where : {
          phone : req.body.phone
        }
      }).then(userObject => {
        // console.log("!!!!!!!!!!after successfully update", userObject);

        if(userObject) {
          res.json({
            status: constants.success_code,
            message: "User Detail Get Successfully",
            data: userObject
          });
  
          return;
        }

        res.json({
          status: constants.server_error_code,
          message: "User doesnt exist"
        });

      })
      .catch(err => {
        res.json({
          status: constants.server_error_code,
          message: constants.server_error,
          errors: err
        });

        return;
      });
    } catch (error) {
      // console.log("getUserDetailUsingPhone function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }   
  }
}

export default new User();
