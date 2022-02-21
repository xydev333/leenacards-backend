import AppController from "./appcontroller";
import constants from "../configuration/constants";
import * as la from "lodash";
import { encrypt, decrypt } from "./encryption";
const models = require('../models');
const Sequelize = require('sequelize');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
const UPLOAD_DIR = "./public/card/";

const Op = Sequelize.Op;

class CardInventory extends AppController {
    constructor() {
        super();
    }

    /* Admins functions */


    /*
        name: listCardInventory
        target: admin panel
        description: list all cards Inventory
        parameters: null
        response: all card Inventory array
    */
    async listCardInventory(req, res) {
        // console.log("listCardInventory function start", req.params);
        try {
            let result = await models.card_inventorys.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'amount', 'discount_amount'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });


            let responseArray = [];

            la.map(result.rows, (data, index) => {
                let dummy = data;
                dummy.redeem_code = decrypt(data.redeem_code);
                responseArray.push(dummy);
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: responseArray,
                total: result.count
            });

        } catch (error) {
            // console.log("listCardInventory function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }

    /*  
        name: deleteCardInventory
        description: delete inventiry detail (hard delete delete)
        target: admin panel
        parameters: inventoryId(string)
        response: user object
    */
    async deleteCardInventory(req, res) {
        // console.log("deleteCardInventory function start", req.params);
        try {

            if(!req.params.inventoryId || !req.params.cardId ) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let deleteData = await models.card_inventorys.destroy({
                where : {
                    id : req.params.inventoryId
                }
            });

            //availabel count minus
            let cardObject = await models.cards.update({
                available_count : Sequelize.literal('available_count - 1'),
            },{
                where : {
                    id : req.params.cardId
                }
            });


            let result = await models.card_inventorys.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'amount', 'discount_amount'],
                        required: false
                    },
                    {
                        model: models.user_transactions,
                        attributes: ['id', 'amount', 'order_code', 'transaction_at', 'status', 'reference_id'],
                        required: false
                    },
                    {
                        model: models.user_wallet_transactions,
                        attributes: ['id', 'amount', 'order_code', 'transaction_at', 'status', 'reference_id'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    card_id : req.params.cardId
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            let responseArray = [];

            la.map(result.rows, (data, index) => {
                let dummy = data;
                dummy.redeem_code = decrypt(data.redeem_code);
                responseArray.push(dummy);
            });

            res.json({
                status: constants.success_code,
                message: "Delete Inventory",
                data: responseArray,
                total: result.count
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
        name: editCardInventory
        target: admin panel
        description: edit cards Inventory
        parameters: null
        response: all card Inventory array
    */
    async editCardInventory(req, res) {
        // console.log("editCardInventory function start", req.params);
        try {

            if(!req.body.inventoryId) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let updateObjeect = {};

            if(req.body.redeem_code){
                let encryptRedeemCode = encrypt(req.body.redeem_code);
                updateObjeect.redeem_code = encryptRedeemCode;
            }

            if(updateObjeect == {}) {
                res.json({
                  status: constants.success_code,
                  message: "Edit Inventory Successfully",
                  data: null
                });
        
                return;
            }
        
            models.card_inventorys.update(updateObjeect,{
                where : {
                    id : req.body.inventoryId
                }
            }).then(inventoryObject => {
                // console.log("!!!!!!!!!!after successfully update", inventoryObject);
        
                res.json({
                    status: constants.success_code,
                    message: "Edit inventory Successfully",
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
            // console.log("editCardInventory function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }

    /*
        name: listCardInventoryFromCardId
        target: admin panel
        description: list all cards Inventory
        parameters: null
        response: all card Inventory array
    */
    async listCardInventoryFromCardId(req, res) {
        // console.log("listCardInventoryFromCardId function start", req.params);
        try {
            let result = await models.card_inventorys.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'amount', 'discount_amount'],
                        required: false
                    },
                    {
                        model: models.user_transactions,
                        attributes: ['id', 'amount', 'order_code', 'transaction_at', 'status', 'reference_id'],
                        required: false
                    },
                    {
                        model: models.user_wallet_transactions,
                        attributes: ['id', 'amount', 'order_code', 'transaction_at', 'status', 'reference_id'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    card_id : req.params.cardId
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            let responseArray = [];

            la.map(result.rows, (data, index) => {
                let dummy = data;
                dummy.redeem_code = decrypt(data.redeem_code);
                responseArray.push(dummy);
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: responseArray,
                total: result.count
            });

        } catch (error) {
            // console.log("listCardInventoryFromCardId function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }

    /*
        name: listCardInventoryFromTransactionId
        target: admin panel
        description: list all cards Inventory from transaction Id
        parameters: null
        response: all card Inventory array
    */
    async listCardInventoryFromTransactionId(req, res) {
        // console.log("listCardInventoryFromTransactionId function start", req.params);
        try {
            let result = await models.card_inventorys.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'amount', 'discount_amount'],
                        required: false
                    },
                    {
                        model: models.user_transactions,
                        attributes: ['id', 'amount', 'order_code', 'transaction_at', 'status', 'reference_id'],
                        required: false
                    },
                    {
                        model: models.user_wallet_transactions,
                        attributes: ['id', 'amount', 'order_code', 'transaction_at', 'status', 'reference_id'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    transaction_id : req.params.transactionId
                },
                order: [['createdAt', 'DESC']]
            });

            let responseArray = [];

            la.map(result.rows, (data, index) => {
                let dummy = data;
                dummy.redeem_code = decrypt(data.redeem_code);
                responseArray.push(dummy);
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: responseArray,
                total: result.count
            });

        } catch (error) {
            // console.log("listCardInventoryFromTransactionId function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }


     /*
        name: addDataFromExcel
        target: admin panel
        description: Add card redeem code from card Id
        parameters: fileName(string), cardId(string)
        response: card object
    */
    async addDataFromExcel(req, res) {
        // console.log("addDataFromExcel function start");
        try {

            if(!req.body.cardId || !req.body.fileName) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let cardData = await models.cards.findOne({
                where: {
                    id : req.body.cardId
                },
            });

            if(!cardData){
                res.json({
                    status: constants.server_error_code,
                    message: constants.server_error,
                    errors: "Card data not found"
                });

                return;
            }

            let exceltojson;

            if(req.body.fileName.split('.')[req.body.fileName.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }

            exceltojson({
                input: UPLOAD_DIR + req.body.fileName, //the same path where we uploaded our file
                output: null, //since we don't need output.json
                lowerCaseHeaders:true
            }, async function(err,result){
                if(err) {
                    // console.log("error in read excel file", err);
                    res.json({
                        status: constants.server_error_code,
                        message: constants.server_error,
                        errors: err
                    });

                    return;
                }

                let availableCount = result.length;
                let oldAvailableCount = cardData.available_count;
                let newAvailableCount = oldAvailableCount + availableCount;

                let cardObject = await models.cards.update({
                    available_count : newAvailableCount,
                },{
                    where : {
                        id : cardData.id
                    }
                });
                // console.log("!!!!!!!!!!!!!cardObject after update available count", cardObject);

                for (let data of result) {
                    let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
                    let encryptRedeemCode = encrypt(data.redeem_code);

                    let createObject = {
                        id: uniqueId,
                        card_id : req.body.cardId,
                        redeem_code : encryptRedeemCode,
                        is_active: true,
                        _deleted : false,
                    };
        
                    let cardInvData = await models.card_inventorys.create(createObject);
                }

                fs.unlinkSync(UPLOAD_DIR + req.body.fileName);

                res.json({
                    status: constants.success_code,
                    message: "successfully uploaded",
                });

                return;
            });
     
            return;

        } catch (error) {
            // console.log("create card reddem code function error", error);
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

export default new CardInventory();
