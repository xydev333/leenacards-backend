import validator from "validator";
import AWS from "aws-sdk";
import raw from "objection";
import AppController from "./appcontroller";
import constants from "../configuration/constants";
import bcrypt from 'bcryptjs';
import token from '../configuration/secret';

var jwt = require('jsonwebtoken');

const models = require('../models');

class Admin extends AppController {
  constructor() {
    super();
  }

  /* Admins functions */

  /*  
    name: changeStatus
    description: Activated or deActivated admin
    target: admin panel
    parameters: adminId(string), flag(boolean)
    response: admin object
  */
  async changeStatus(req, res) {
    // console.log("changeStatus function start");
    try {

      if(!req.body.adminId || !req.body.flag) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      models.admins.update({
        is_active : flag,
      },{
        where : {
          id : req.body.adminId
        }
      }).then(adminObject => {
        // console.log("!!!!!!!!!!after successfully change status", adminObject);
        
        res.json({
          status: constants.success_code,
          message: "Admin status changed Successfully",
          data: adminObject
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
      // console.log("Change Status function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }   
  }

  /*
    name: registerAdmin
    target: admin panel
    description: Register admin
    parameters: email(string), passowrd(string), first_name(string)
    response: admin object
  */
  async registerAdmin(req, res) {
    // console.log("registerAdmin function start");
    try {

      if(!req.body.first_name || !req.body.email || !req.body.password ) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      let secret = token();
      var hashedPassword = bcrypt.hashSync(req.body.password, 8);
      var uniqueId = '_' + Math.random().toString(36).substr(2, 9);
      
      let createObject = {
        id: uniqueId,
        first_name : req.body.first_name,
        email : req.body.email,
        password: hashedPassword,
        is_active: true,
        role: "Admin",
        _deleted : false
      }

      if(req.body.last_name){
        createObject.last_name = req.body.last_name;
      }

      if(req.body.phone){
        createObject.phone = req.body.phone;
      }

      // console.log("before create!!!!!!!!!!!!!!", createObject);

      models.admins.create(createObject).then(admin => {
        // console.log("admin printed here after creation", admin, admin.id);
        let responseObject = {
          id : admin.id,
          first_name: admin.first_name,
          last_name: admin.last_name,
          email: admin.email,
          phone: admin.phone,
          is_active: admin.is_active,
          createdAt: admin.createdAt
        };
        responseObject.authToken = jwt.sign({ id: admin.id, role: "Admin" }, secret, {
          expiresIn: 86400 // expires in 24 hours
        });

        // console.log("responseObject printed here", responseObject);

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
      // console.log("create Admin function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });

      return;
    }
  }

  /*
    name: changeAdminPassword
    target: admin panel
    description: change password admin
    parameters: password(string)
    response: admin object
  */
  async changeAdminPassword(req, res) {
    // console.log("changeAdminPassword function start");
    try {

      if(!req.body.password ) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      var hashedPassword = bcrypt.hashSync(req.body.password, 8);
      
      let updateAdmin = await models.admins.update({
        password : hashedPassword
      }, {
        where : {
          id : req.admin.id
        }
      });

      res.json({
        status: constants.success_code,
        message: "successfully updated",
        data : updateAdmin
      });

    } catch (error) {
      // console.log("change password of Admin function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });

      return;
    }
  }

    /*
    name: changeAdminProfile
    target: admin panel
    description: change profile pic admin
    parameters: profile pic string(string)
    response: admin object
  */
  async changeAdminProfile(req, res) {
    // console.log("changeAdminProfile function start");
    try {

      if(!req.body.profileString ) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      let updateAdmin = await models.admins.update({
        profile_image : req.body.profileString
      }, {
        where : {
          id : req.admin.id
        }
      });

      let adminData = await models.admins.findOne({
        where : {
          id : req.admin.id
        }
      });

      let responseObject = {
        id : adminData.id,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        email: adminData.email,
        phone: adminData.phone,
        support_email: adminData.support_email,
        support_call_number: adminData.support_call_number,
        support_chat_number: adminData.support_chat_number,
        profile_image : adminData.profile_image,
        terms : adminData.terms,
        privacy : adminData.privacy,
        is_active: adminData.is_active,
        createdAt: adminData.createdAt,
        authToken : req.token
      };

      res.json({
        status: constants.success_code,
        message: "successfully updated",
        data : responseObject,
        authToken : responseObject.authToken
      });

    } catch (error) {
      // console.log("change password of Admin function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });

      return;
    }
  }

  /*
    name: login
    target: admin panel
    description: login admin
    parameters: email(string), passowrd(string)
    response: admin object
  */
  async adminLogin(req, res) {
    // console.log("login function start");
    try {

      if(!req.body.email || !req.body.password ) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      models.admins.findOne({
        where : {
          email : req.body.email
        }
      }).then(admin => {

        if(admin != null){
          var isEqual = bcrypt.compareSync(req.body.password, admin.password);

          // console.log("!!!!!!!!!!after compare", isEqual);

          if(isEqual){

            let responseObject = {
              id : admin.id,
              first_name: admin.first_name,
              last_name: admin.last_name,
              email: admin.email,
              phone: admin.phone,
              support_email: admin.support_email,
              support_call_number: admin.support_call_number,
              support_chat_number: admin.support_chat_number,
              profile_image : admin.profile_image,
              terms : admin.terms,
              privacy : admin.privacy,
              is_active: admin.is_active,
              balance_limit: admin.balance_limit,
              createdAt: admin.createdAt
            };

            let secret = token();
  
            responseObject.authToken = jwt.sign({ id: admin.id, role: "Admin" }, secret, {
              expiresIn: 86400 // expires in 24 hours
            });

            res.json({
              status: constants.success_code,
              message: "successfully Logged in",
              data: responseObject,
              authToken :responseObject.authToken
            });
    
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
      // console.log("Login Admin function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }
  }

  /*
    name: editSupportDetails
    target: admin panel
    description: edit support details
    parameters: support_email(string), support_call_number(string), support_chat_number(string)
    response: admin object
  */
  async editSupportDetails(req, res) {
    try{
      // console.log("!!!!!!!!!!is about to edit support details", req.admin.id);

      if(!req.body.support_email || !req.body.support_call_number || !req.body.support_chat_number ) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data",
        });

        return;
      }

      let updateObject = {
        support_email : req.body.support_email,
        support_call_number : req.body.support_call_number,
        support_chat_number : req.body.support_chat_number,
        balance_limit: req.body.balance_limit
      };

      if(req.body.terms && req.body.terms !== null) {
        updateObject.terms = req.body.terms;
      }

      if(req.body.privacy && req.body.privacy !== null) {
        updateObject.privacy = req.body.privacy;
      }

      let updateAdmin = await models.admins.update(updateObject, {
        where : {
          id : req.admin.id
        }
      });
      // console.log("!!!!!!!!!!!!updateAdmin", updateAdmin);

      let adminData = await models.admins.findOne({
        where : {
          _deleted : false,
          id : req.admin.id
        }
      });

      res.json({
        status: constants.success_code,
        message: "successfully updated",
        data: adminData
      });

    } catch (error) {
      // console.log("editSupportDetails function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }
  }


  /*
    -------------------------
    comman functions
  */

}

export default new Admin();
