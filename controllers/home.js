import AppController from "./appcontroller";
import constants from "../configuration/constants";
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const models = require('../models');
var dotenv = require("dotenv");

dotenv.config();
let adminId = process.env.ADMIN_ID;

class Home extends AppController {
  constructor() {
    super();
  }

  /* Admins functions */


  /*
    ------------------------
    Application functions
  */

    /*
        name: listAllData
        target: application
        description: list all data for home screen
        parameters: null
        response: all home screen data
    */
    async listAllData(req, res) {
        // console.log("listAllData function start");
        try {
            let categoryData = await models.categorys.findAndCountAll({
                where: {
                    _deleted : false,
                    is_active : true
                },
                order: [['sort_order', 'ASC']],
                // offset: parseInt(req.params.skip),
                // limit: parseInt(req.params.limit)
            });

            let cardData = await models.cards.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.types,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'available_count', 'sold_count'],
                        required: false
                    }
                ],
                where: {
                    [Op.and]: [
                        { 
                            _deleted : false 
                        },
                        {
                            is_active : true
                        },
                        { 
                            available_count: {
                                [Op.gt]: 0
                            }
                        }
                    ]   
                },
                order: [['sold_count', 'DESC']],
                offset: parseInt(0),
                limit: parseInt(4)
            });

            let featureCardData = await models.cards.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.types,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'available_count', 'sold_count'],
                        required: false
                    }
                ],
                where: {
                    [Op.and]: [
                        { 
                            _deleted : false 
                        },
                        {
                            is_active : true
                        },
                        { 
                            is_feature : true
                        }
                    ]   
                },
                order: [['sold_count', 'DESC']],
                offset: parseInt(0),
                limit: parseInt(6)
            });

            let bannerData = await models.banners.findAndCountAll({
                include: {
                    model: models.cards,
                },
                where: {
                    active : true
                }
            });

            let adminData = await models.admins.findOne({
                where : {
                  _deleted : false,
                  id : adminId
                }
            });

            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!categoryData printed here", categoryData);
            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!cardData printed here", cardData);
            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!featureCardData printed here", featureCardData);
            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!adminData printed here", adminData);

            res.json({
                status: constants.success_code,
                message: "successfully listed All Data",
                data: {
                    categoryData : categoryData,
                    cardData : cardData,
                    featureCardData : featureCardData,
                    adminData : adminData,
                    bannerData: bannerData
                },
            });
            
        } catch (error) {
            // console.log("listAllData function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }


    /*
        name: listAllDataCheckUserActivation
        target: application
        description: list all data for home screen with check user active or not
        parameters: null
        response: all home screen data
    */
    async listAllDataCheckUserActivation(req, res) {
        // console.log("listAllDataCheckUserActivation function start", req.params.userId);
        try {

            let userData = await models.users.findOne({
                where : {
                    id : req.params.userId
                }
            });

            if(!userData) {
                res.json({
                    status: constants.server_error_code,
                    message: "userData not found"
                });

                return;
            }

            let categoryData = await models.categorys.findAndCountAll({
                where: {
                    _deleted : false,
                    is_active : true
                },
                order: [['sort_order', 'ASC']],
                // offset: parseInt(req.params.skip),
                // limit: parseInt(req.params.limit)
            });

            let cardData = await models.cards.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.types,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'available_count', 'sold_count'],
                        required: false
                    }
                ],
                where: {
                    [Op.and]: [
                        { 
                            _deleted : false 
                        },
                        {
                            is_active : true
                        },
                        { 
                            available_count: {
                                [Op.gt]: 0
                            }
                        }
                    ]   
                },
                order: [['sold_count', 'DESC']],
                offset: parseInt(0),
                limit: parseInt(4)
            });

            let featureCardData = await models.cards.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.types,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'available_count', 'sold_count'],
                        required: false
                    }
                ],
                where: {
                    [Op.and]: [
                        { 
                            _deleted : false 
                        },
                        {
                            is_active : true
                        },
                        { 
                            is_feature : true
                        }
                    ]   
                },
                order: [['sold_count', 'DESC']],
                offset: parseInt(0),
                limit: parseInt(6)
            });

            let bannerData = await models.banners.findAndCountAll({
                include: {
                    model: models.cards,
                },
                where: {
                    active : true
                }
            });

            let adminData = await models.admins.findOne({
                where : {
                _deleted : false,
                id : adminId
                }
            });

            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!categoryData printed here", categoryData);
            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!cardData printed here", cardData);
            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!featureCardData printed here", featureCardData);
            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!adminData printed here", adminData);

            res.json({
                status: constants.success_code,
                message: "successfully listed All Data",
                data: {
                    categoryData : categoryData,
                    cardData : cardData,
                    featureCardData : featureCardData,
                    adminData : adminData,
                    activeFlag : userData.is_active,
                    walletBalance : userData.wallet_balance,
                    bannerData: bannerData
                },
            });
            
        } catch (error) {
            // console.log("listAllDataCheckUserActivation function error", error);
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

export default new Home();
