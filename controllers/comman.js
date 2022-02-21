import validator from "validator";
import AWS from "aws-sdk";
import raw from "objection";
import AppController from "./appcontroller";
import constants from "../configuration/constants";
import bcrypt from 'bcryptjs';
import token from '../configuration/secret';
import sendCustomMessage from "./Queue/SendCustomMessage";
import * as la from "lodash";

var jwt = require('jsonwebtoken');
const moment = require("moment");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require('../models');

class Comman extends AppController {
  constructor() {
    super();
  }

  /* Admins functions */


  /*
    name: listAll KPIS
    target: admin panel
    description: list all KPIs
    parameters: null
    response: all KPIS object
  */
  async listAllKpis(req, res) {
    // console.log("listAllKpis function start");

    try {
        let startDateString = moment().startOf('date').format("YYYY-MM-DD");
        let endDateString = moment().endOf('date').format("YYYY-MM-DD");
        let startDate = `${startDateString} 00:00:00`;
        let endDate =  `${endDateString} 23:59:59`;

        // console.log("!!!!!!!!!!!dates", startDate, endDate);

        let userCount = await models.users.count({
          where : {
            _deleted : false
          }
        });
        let cardCount = await models.cards.count({
          where : {
            _deleted : false
          }
        });
        let countryCount = await models.countrys.count({
          where : {
            _deleted : false
          }
        });
        let categoryCount = await models.categorys.count({
          where : {
            _deleted : false
          }
        });
        let typeCount = await models.types.count({
          where : {
            _deleted : false
          }
        });

        let userTransactionTotalSaleData = await models.user_cards.findAll({
          where : {
            [Op.and] : [
              {
                  _deleted : false
              }, 
              {
                  createdAt : {
                      [Op.gte] : startDate
                  }
              },
              {
                  createdAt : {
                      [Op.lte] : endDate
                  }
              },

          ]
          },
        });

        let userTransactionTotalDataCount = await models.user_cards.count({
          where : {
            [Op.and] : [
              {
                  _deleted : false
              }, 
          ]
          },
        });

        let saleAmount = 0;

        la.map(userTransactionTotalSaleData, (data, index) => {
          // console.log("!!!!!!!!!!amount to be added", data.amount);
          saleAmount = saleAmount + parseFloat(data.amount.toString()); 
        });

        // console.log("!!!!!!!!saleAmount", saleAmount);

        res.json({
            status: constants.success_code,
            message: "successfully listed All KPIs",
            data: {
               userCount : userCount,
               cardCount : cardCount,
               countryCount : countryCount,
               categoryCount : categoryCount,
               typeCount : typeCount,
               saleAmount : saleAmount,
               totalCardSaleCount : userTransactionTotalDataCount,
               todayCardSaleCount : userTransactionTotalSaleData && userTransactionTotalSaleData.length
            },
        });
        
    } catch (error) {
      // console.log("listCities function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;
    }
  }

  /*
    name: sen Custom Message to all
    target: admin panel
    description: sen custom message to all users
    parameters: null
    response: null
  */
  async sendCustomMessageToAllUer(req, res) {
    // console.log("sendCustomMessageToAllUer function start");

    try {
      if(!req.body.messageText || !req.body.titleText) {
        res.json({
          status: constants.server_error_code,
          message: "Please provide all Data"
        });
        return;

      }

      //add queue
      let addQueueData = await sendCustomMessage.addQueue(res, "addCustomMessage", {
          messageText : req.body.messageText,
          titleText : req.body.titleText,
          notification_type : "GENERAL",
          click_action : "FLUTTER_NOTIFICATION_CLICK"
      });
      // console.log("!!!!!!!job added for addCustomMessage", addQueueData);
      
      res.json({
        status: constants.success_code,
        message: "successfully sent"
      });
        
    } catch (error) {
      // console.log("sendCustomMessageToAllUer function error", error);
      res.json({
        status: constants.server_error_code,
        message: constants.server_error,
        errors: error
      });
      return;

    }
  }


  /*
    ------------------------
    Application functions
  */



  /*
    -------------------------
    comman functions
  */

}

export default new Comman();
