import AppController from "./appcontroller";
import constants from "../configuration/constants";
import NotificationController from "./notification";
const models = require('../models');
const la = require('lodash');
import { encrypt, decrypt } from "./encryption";
const mailService = require("./mailerService");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require("moment");

class UserTransaction extends AppController {
  constructor() {
    super();
  }

  /* Admins functions */


    /*
        name: listAll  Transactions for csv export
        target: admin panel
        description: list all Transactions for csv export
        parameters: null
        response: all Transactions object
    */
    async listAllTransactionForCsv(req, res) {
        // console.log("listAllTransactionForCsv function start", req.params.startDate, req.params.endDate);

        var startDate = req.params.startDate;
        var endDate = req.params.endDate;

        // console.log("!!!!!!!!!!startDate and endDate", startDate, endDate);

        try {
            let responseArray = [];

            let allCsvResults = await models.user_transactions.findAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                        required: false
                    },
                    {
                        model: models.card_inventorys,
                        attributes: ['transaction_type', 'redeem_code'],
                        required: false
                    }
                ],
                where: {
                    [Op.and] : [
                        {
                            _deleted : false
                        }, 
                        {
                            status : "SUCCESS"
                        },
                        {
                            transaction_at : {
                                [Op.gte] : startDate
                            }
                        },
                        {
                            transaction_at : {
                                [Op.lte] : endDate
                            }
                        }
                    ]
                },
                order: [['createdAt', 'DESC']]
            });

            la.map(allCsvResults, (data, index) => {
                let dummy = data;
                if(data.card_inventorys && data.card_inventorys.length > 0) {
                    let dummyCardInventory = [];
                    la.map(data.card_inventorys, (subData, subIndex) => {
                        let dummyData = subData;
                        dummyData.redeem_code = decrypt(dummyData.redeem_code);
                        dummyCardInventory.push(dummyData);
                    });

                    dummy.card_inventorys = dummyCardInventory;
                }
                responseArray.push(dummy);
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data : responseArray,
                total : allCsvResults.length
            });

            return;

            models.sequelize.query("SELECT `user_transactions`.`id`, `user_transactions`.`user_id`, `user_transactions`.`card_id`, `user_transactions`.`amount`, `user_transactions`.`card_quantity`, `user_transactions`.`type`, `user_transactions`.`is_pass_used`, `user_transactions`.`reference_id`, `user_transactions`.`payment_gateway_order_id`, `user_transactions`.`response_string`, `user_transactions`.`order_code`, `user_transactions`.`transaction_at`, `user_transactions`.`payment_mode`, `user_transactions`.`status`, `user_transactions`.`_deleted`, `user_transactions`.`createdAt`, `user_transactions`.`updatedAt`, `user`.`id` AS `user.id`, `user`.`first_name` AS `userFirstName`, `user`.`last_name` AS `userLastName`, `user`.`email` AS `user.email`, `user`.`phone` AS `user.phone`, `user`.`username` AS `user.username`, `card`.`id` AS `card.id`, `card`.`name` AS `cardName`, `card`.`color` AS `card.color`, `card`.`image` AS `card.image`, `card`.`icon` AS `card.icon`, `card`.`description` AS `card.description`, `card_inventorys`.`id` AS `card_inventorys.id`, `card_inventorys`.`redeem_code` AS `card_inventorys.redeem_code` FROM `user_transactions` AS `user_transactions` LEFT OUTER JOIN `users` AS `user` ON `user_transactions`.`user_id` = `user`.`id` LEFT OUTER JOIN `cards` AS `card` ON `user_transactions`.`card_id` = `card`.`id` LEFT OUTER JOIN `card_inventorys` AS `card_inventorys` ON `user_transactions`.`id` = `card_inventorys`.`transaction_id` WHERE (`user_transactions`.`_deleted` = false AND `user_transactions`.`transaction_at` >= '" + startDate  + "' AND `user_transactions`.`transaction_at` <= '" + endDate + "' AND `user_transactions`.`status` = 'SUCCESS') ORDER BY `user_transactions`.`createdAt` DESC")
            .then(([transactionData, metadata]) => {
                // console.log("!!!!!!!!!!!!!!!!!transactionData", transactionData);

                let responseArray = [];

                la.map(transactionData, (data, index) => {
                    let dummy = data;
                    if(data.card_inventorys && data.card_inventorys.length > 0) {
                        let dummyCardInventory = [];
                        la.map(data.card_inventorys, (subData, subIndex) => {
                            let dummyData = subData;
                            dummyData.redeem_code = decrypt(dummyData.redeem_code);
                            dummyCardInventory.push(dummyData);
                        });
    
                        dummy.card_inventorys = dummyCardInventory;
                    }
                    responseArray.push(dummy);
                });
    
                res.json({
                    status: constants.success_code,
                    message: "successfully listed",
                    data : responseArray,
                    total : transactionData.length
                });
            })
            .catch((error) => {
                // console.log("listAllTransactionForCsv function error", error);
                res.json({
                    status: constants.server_error_code,
                    message: constants.server_error,
                    errors: error
                });
    
                return;
            });

            // let result = await models.user_transactions.findAndCountAll({
            //     include: [
            //         {
            //             model: models.users,
            //             attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
            //             required: false
            //         },
            //         {
            //             model: models.cards,
            //             attributes: ['id', 'name', 'color', 'image', 'icon', 'description'],
            //             required: false
            //         },
            //         {
            //             model: models.card_inventorys,
            //             attributes: ['id', 'redeem_code'],
            //             required: false
            //         }
            //     ],
            //     where: {
            //         [Op.and] : [
            //             {
            //                 _deleted : false
            //             }, 
            //             {
            //                 transaction_at : {
            //                     [Op.gte] : startDate
            //                 }
            //             },
            //             {
            //                 transaction_at : {
            //                     [Op.lte] : endDate
            //                 }
            //             },
            //             {
            //                 status : "SUCCESS"
            //             }
            //         ]
            //     },
            //     order: [['createdAt', 'DESC']],
            // });
            
        } catch (error) {
            // console.log("listAllTransactionForCsv function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

    /*
        name: listAll wallet Transactions for csv export
        target: admin panel
        description: list all wallet Transactions for csv export
        parameters: null
        response: all wallet Transactions object
    */
    async listAllWalletTransactionForCsv(req, res) {
        // console.log("listAllWalletTransactionForCsv function start", req.params.startDate, req.params.endDate);

        var startDate = req.params.startDate;
        var endDate = req.params.endDate;

        // console.log("!!!!!!!!!!startDate and endDate", startDate, endDate);

        try {
            let responseArray = [];

            let allCsvResults = await models.user_wallet_transactions.findAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                        required: false
                    },
                    {
                        model: models.card_inventorys,
                        attributes: ['transaction_type', 'redeem_code'],
                        required: false
                    }
                ],
                where: {
                    [Op.and] : [
                        {
                            _deleted : false
                        }, 
                        {
                            status : "SUCCESS"
                        },
                        {
                            transaction_at : {
                                [Op.gte] : startDate
                            }
                        },
                        {
                            transaction_at : {
                                [Op.lte] : endDate
                            }
                        }
                    ]
                },
                order: [['createdAt', 'DESC']]
            });

            la.map(allCsvResults, (data, index) => {
                let dummy = data;
                if(data.card_inventorys && data.card_inventorys.length > 0) {
                    let dummyCardInventory = [];
                    la.map(data.card_inventorys, (subData, subIndex) => {
                        let dummyData = subData;
                        dummyData.redeem_code = decrypt(dummyData.redeem_code);
                        dummyCardInventory.push(dummyData);
                    });

                    dummy.card_inventorys = dummyCardInventory;
                }
                responseArray.push(dummy);
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data : responseArray,
                total : allCsvResults.length
            });

            return;
            
        } catch (error) {
            // console.log("listAllWalletTransactionForCsv function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

    /*
        name: listAll  Transactions
        target: admin panel
        description: list all Transactions
        parameters: null
        response: all Transactions object
    */
    async listAllTransaction(req, res) {
        // console.log("listAllTransaction function start");

        if((!req.user) && !req.body.userId) {
            let allResults = await models.user_transactions.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data : allResults.rows,
                total : allResults.count
            });

            return;
        } 

        try {
            let result = await models.user_transactions.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    user_id : req.user ? req.user.id : req.body.userId
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data : result.rows,
                total : result.count
            });
            
        } catch (error) {
            // console.log("listAllTransaction function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }
    

    /*
        name: listAll wallet Transactions
        target: admin panel
        description: list all wallet Transactions
        parameters: null
        response: all wallet Transactions object
    */
    async listAllWalletTransaction(req, res) {
        // console.log("listAllWalletTransaction function start");

        if((!req.user) && !req.body.userId) {
            let walletAllResult = await models.user_wallet_transactions.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'sku', 'color', 'image', 'icon', 'description'],
                        required: false
                    },
                    {
                        model: models.user_transactions,
                        attributes: ['id', 'order_code', 'status', 'amount', 'card_quantity', 'type', 'payment_mode'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data : walletAllResult.rows,
                total : walletAllResult.count
            });

            return;
        } 

        try {
            let walletResult = await models.user_wallet_transactions.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                        required: false
                    },
                    {
                        model: models.user_transactions,
                        attributes: ['id', 'order_code', 'status', 'amount', 'card_quantity', 'type', 'payment_mode'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    user_id : req.user ? req.user.id : req.body.userId
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data : walletResult.rows,
                total : walletResult.count
            });
            
        } catch (error) {
            // console.log("listAllWalletTransaction function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

    /*
        name: listAll  Transactions using filter
        target: admin panel
        description: list all Transactions using filter
        parameters: null
        response: all Transactions object
    */
    async listAllTransactionUsingFilter(req, res) {
        // console.log("listAllTransactionUsingFilter function start");
        
        try {
            if(req.body.orderCode === "") {
                let allResults = await models.user_transactions.findAndCountAll({
                    include: [
                        {
                            model: models.users,
                            attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                            required: false
                        },
                        {
                            model: models.cards,
                            attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                            required: false
                        }
                    ],
                    where: {
                        _deleted : false,
                    },
                    order: [['createdAt', 'DESC']],
                    offset: parseInt(req.params.skip),
                    limit: parseInt(req.params.limit)
                });
    
                res.json({
                    status: constants.success_code,
                    message: "successfully listed",
                    data : allResults.rows,
                    total : allResults.count
                });
    
                return;
            }

            let result = await models.user_transactions.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    order_code : {
                        [Op.like] : `%${req.body.orderCode}%`
                    }
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data : result.rows,
                total : result.count
            });
            
        } catch (error) {
            // console.log("listAllTransactionUsingFilter function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

    /*
        name: listAll wallet Transactions using filter
        target: admin panel
        description: list all wallet Transactions using filter
        parameters: null
        response: all wallet Transactions object
    */
    async listAllWalletTransactionUsingFilter(req, res) {
        // console.log("listAllWalletTransactionUsingFilter function start");

        try {
            if(req.body.orderCode === "") {
                let walletAllResult = await models.user_wallet_transactions.findAndCountAll({
                    include: [
                        {
                            model: models.users,
                            attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                            required: false
                        },
                        {
                            model: models.cards,
                            attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                            required: false
                        },
                        {
                            model: models.user_transactions,
                            attributes: ['id', 'order_code', 'status', 'amount', 'card_quantity', 'type', 'payment_mode'],
                            required: false
                        }
                    ],
                    where: {
                        _deleted : false,
                    },
                    order: [['createdAt', 'DESC']],
                    offset: parseInt(req.params.skip),
                    limit: parseInt(req.params.limit)
                });
    
                res.json({
                    status: constants.success_code,
                    message: "successfully listed",
                    data : walletAllResult.rows,
                    total : walletAllResult.count
                });
    
                return;
            }

            let walletResult = await models.user_wallet_transactions.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'sku', 'image', 'icon', 'description'],
                        required: false
                    },
                    {
                        model: models.user_transactions,
                        attributes: ['id', 'order_code', 'status', 'amount', 'card_quantity', 'type', 'payment_mode'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    order_code : {
                        [Op.like] : `%${req.body.orderCode}%`
                    }
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data : walletResult.rows,
                total : walletResult.count
            });
            
        } catch (error) {
            // console.log("listAllWalletTransactionUsingFilter function error", error);
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
        name: buyCardReservedFatoorah
        target: application
        description: reserve card using fatoorah
        parameters: null
        response: transaction object
    */
    async buyCardReservedFatoorah(req, res) {
        // console.log("buyCardReservedFatoorah function start");
        try {
            if(!req.body.userId && !req.body.cardId && !req.body.amount && !req.body.cardQuantity) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data"
                });
    
                return;
            } 

            //check Available count
            let cardData = await models.cards.findOne({
                where: {
                    _deleted : false,
                    id : req.body.cardId
                },
            });
            // console.log("!!!!!!!!!cardData", cardData);

            if(!cardData || (cardData && (parseInt(req.body.cardQuantity) > cardData.available_count))){
                res.json({
                    status: constants.server_error_code,
                    message: "No available card is there"
                });

                return;
            }

            //cross check
            let cardInventoryData = await models.card_inventorys.findAndCountAll({
                where: {
                    [Op.and] : [
                        {
                            card_id: req.body.cardId
                        }, 
                        {
                            user_id: null
                        },
                        {
                            is_paid: false
                        },
                        {
                            reserved_on: null
                        },
                    ]
                },
            });
            // console.log("!!!!!!!!!cardInventoryData", cardInventoryData);

            if(!cardInventoryData || (cardInventoryData && (parseInt(req.body.cardQuantity) > cardInventoryData.count))){
                res.json({
                    status: constants.server_error_code,
                    message: "No available card is there"
                });

                return;
            }

            //add entry or user_transaction
            let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
            let orderCode = '_' + Math.random().toString(36).substr(2, 9);
            let date = super.getDate();
            let createTransactionObject = {
                id : uniqueId,
                user_id : req.body.userId,
                card_id : req.body.cardId,
                amount : parseFloat(req.body.amount),
                card_quantity : parseInt(req.body.cardQuantity),
                type : "DEBIT",
                order_code : orderCode,
                transaction_at : date,
                payment_mode : "FATOORAH",
                status : "PENDING",
                _deleted : false
            };
            let createTransactionData = await models.user_transactions.create(createTransactionObject); 
            // console.log("!!!!!!!!!!!!!!!createTransactionData", createTransactionData);


            //edit card_inventorys and set resrved On and add user_id and transaction id
            let loopCountArray = [];
            for(var i=0; i < parseInt(req.body.cardQuantity); i++) {
                loopCountArray.push(i);
            }

            for(let data of loopCountArray) {
                let editCardInventoryObject = {
                    reserved_on : date,
                    is_paid : false,
                    user_id : req.body.userId,
                    transaction_id : createTransactionData.id,
                    transaction_type : "FATOORAH"
                };
                let toUpdateCarInventoryData = await models.card_inventorys.findOne({
                    where: {
                        [Op.and] : [
                            {
                                card_id: req.body.cardId
                            }, 
                            {
                                user_id: null
                            },
                            {
                                is_paid: false
                            },
                            {
                                reserved_on: null
                            },
                        ]
                    },
                });
                let updateInventory = await models.card_inventorys.update(editCardInventoryObject,{
                    where : {
                      id : toUpdateCarInventoryData.id
                    }
                });
                // console.log("!!!!!!!!!!!!updateInventory", updateInventory);
            }

            //edit available count and sold_count
            let updatedAvailableCount = cardData.available_count - parseInt(req.body.cardQuantity);
            let updateSoldCount = cardData.sold_count + parseInt(req.body.cardQuantity);
            let editCardData = {
                available_count : updatedAvailableCount,
                sold_count : updateSoldCount
            };

            let updateCardWholeData = await models.cards.update(editCardData,{
                where : {
                  id : req.body.cardId
                }
            });
            // console.log("!!!!!!!!!!!!!!!updateCardWholeData", updateCardWholeData);

            res.json({
                status: constants.success_code,
                message: "successfully reserved",
                orderCode: createTransactionData.order_code,
            });
            
        } catch (error) {
            // console.log("buyCardReservedFatoorah function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }


    /*
        name: buyCardFatoorah
        target: application
        description: buy card using fatoorah
        parameters: null
        response: transaction object
    */
    async buyCardFatoorah(req, res) {
        try{
            if(!req.body.userId && !req.body.cardId && !req.body.amount && !req.body.cardQuantity && !req.body.orderCode && !req.body.responsData) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data"
                });
    
                return;
            } 

            let parseResponse = JSON.parse(req.body.responsData);

            //find transactionData
            let transactionData = await models.user_transactions.findOne({
                where: {
                    _deleted : false,
                    order_code : req.body.orderCode
                },
            });
            // console.log("!!!!!!!!!!!transactionData", transactionData);


            //check card is reserverd or not 
            let checkCardInventoryData = await models.card_inventorys.findAndCountAll({
                where : {
                    [Op.and] : [
                        {
                            card_id : req.body.cardId
                        }, 
                        {
                            user_id: req.body.userId
                        },
                        {
                            transaction_id: transactionData.id
                        },
                        {
                            reserved_on : {
                                [Op.ne] : null
                            }
                        },
                        {
                            is_paid : false
                        }
                    ]
                }
            });
            // console.log("!!!!!!!!!checkCardInventoryData for check reservation", checkCardInventoryData.count);

            let availableCardData = await models.cards.findOne({
                where : {
                    id : req.body.cardId
                }
            });

            let date = super.getDate();

            if(checkCardInventoryData.count !== req.body.cardQuantity) {
                //card reservation removed
                // console.log("!!!!!!!!!!!!card reservation removed");

                //card goone be resrved
                let updatedCheckReservedCount = parseInt(req.body.cardQuantity) - checkCardInventoryData.count;

                //check vaailable card 
                // console.log("!!!!!!!!!!!!!availableCardData", availableCardData);

                //cross check availability
                let availableCardInventoryData = await models.card_inventorys.findAndCountAll({
                    where : {
                        [Op.and] : [
                            {
                                card_id : req.body.cardId
                            }, 
                            {
                                user_id: null
                            },
                            {
                                transaction_id: null
                            },
                            {
                                reserved_on : null
                            },
                            {
                                is_paid : false
                            }
                        ]
                    }
                });

                if((!availableCardData || (availableCardData && (updatedCheckReservedCount > availableCardData.available_count))) || (!availableCardInventoryData || (availableCardInventoryData && (updatedCheckReservedCount > availableCardInventoryData.count)))){
                    //update transaction to refund
                    let editTransactionObject = {
                        status: "REFUND",
                        response_string : req.body.responsData,
                        reference_id : parseResponse && parseResponse.InvoiceTransactions.length > 0 && parseResponse.InvoiceTransactions[0].TransactionId,
                        payment_gateway_order_id : parseResponse && parseResponse.InvoiceTransactions.length > 0 && parseResponse.InvoiceTransactions[0].PaymentId,
                    };
                    let updateTransactionData = await models.user_transactions.update(editTransactionObject,{
                        where : {
                          order_code : req.body.orderCode
                        }
                    });
                    // console.log("!!!!!!!!!!!!updateTransactionData", updateTransactionData);

                    res.json({
                        status: constants.success_code,
                        message: "You will be refunded shortly",
                    });

                    return;
                }

                //card available then reserve card
                //edit card_inventorys and set resrved On and add user_id and transaction id

                let loopCountArray = [];
                for(var i=0; i < updatedCheckReservedCount; i++) {
                    loopCountArray.push(i);
                }

                for(let data of loopCountArray) {
                    let editCardInventoryObject = {
                        reserved_on : date,
                        is_paid : false,
                        user_id : req.body.userId,
                        transaction_id : transactionData.id,
                        transaction_type : "FATOORAH"
                    };
                    let toUpdateCarInventoryData = await models.card_inventorys.findOne({
                        where: {
                            [Op.and] : [
                                {
                                    card_id: req.body.cardId
                                }, 
                                {
                                    user_id: null
                                },
                                {
                                    is_paid: false
                                },
                                {
                                    reserved_on: null
                                },
                            ]
                        },
                    });
                    let updateInventory = await models.card_inventorys.update(editCardInventoryObject,{
                        where : {
                            id : toUpdateCarInventoryData.id
                        }
                    });
                    // console.log("!!!!!!!!!!!!updateInventory", updateInventory);
                }

                //edit available count and sold_count
                let updatedAvailableCount = availableCardData.available_count - updatedCheckReservedCount;
                let updateSoldCount = availableCardData.sold_count + updatedCheckReservedCount;
                let editCardData = {
                    available_count : updatedAvailableCount,
                    sold_count : updateSoldCount
                };

                let updateCardWholeData = await models.cards.update(editCardData,{
                    where : {
                        id : req.body.cardId
                    }
                });
                // console.log("!!!!!!!!!!!!!!!updateCardWholeData", updateCardWholeData);
            }

            //Main process ***************************************/

            //update transaction using orederCode
            let editTransactionObject = {
                status: "SUCCESS",
                response_string : req.body.responsData,
                reference_id : parseResponse && parseResponse.InvoiceTransactions.length > 0 && parseResponse.InvoiceTransactions[0].TransactionId,
                payment_gateway_order_id : parseResponse && parseResponse.InvoiceTransactions.length > 0 && parseResponse.InvoiceTransactions[0].PaymentId,
            };
            let updateTransactionData = await models.user_transactions.update(editTransactionObject,{
                where : {
                  order_code : req.body.orderCode
                }
            });
            // console.log("!!!!!!!!!!!!updateTransactionData", updateTransactionData);

            //update card inventorys
            let editCardInventoryObject = {
                is_paid : true
            };
            let updateCardInventoryData = await models.card_inventorys.update(editCardInventoryObject,{
                where : {
                    [Op.and] : [
                        {
                            card_id : req.body.cardId
                        }, 
                        {
                            user_id: req.body.userId
                        },
                        {
                            transaction_id: transactionData.id
                        },
                    ]
                }
            });
            // console.log("!!!!!!!!!!!!!!updateCardInventoryData", updateCardInventoryData);

            //add redeem code in user_cards
            let cardInventoryData = await models.card_inventorys.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'image', 'sku', 'icon', 'description', 'amount', 'discount_amount', 'validity'],
                        required: false
                    }
                ],
                where: {
                    [Op.and] : [
                        {
                            card_id : req.body.cardId
                        }, 
                        {
                            user_id: req.body.userId
                        },
                        {
                            transaction_id: transactionData.id
                        },
                    ]
                },
            });
            // console.log("!!!!!!!!!!!cardInventoryData", cardInventoryData);
            var cardIds = [];
            var cardName = '';
            var card_quantity = 0;
            var card_sku = '';
            for (let inData of cardInventoryData.rows) {
                
                cardIds.push(decrypt(inData.redeem_code));
                cardName = inData.card.name;
                card_quantity++;
                card_sku = inData.card.sku;

                let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
                let dateFormat = 'YYYY-MM-DD hh:mm:ss';
                let userCardStartDate = moment(new Date()).format(dateFormat);
                let userCardEndDate = null;
    
                if(inData.card && inData.card.validity === 3){
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 90).format(dateFormat);
                } else if(inData.card && inData.card.validity === 6){
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 180).format(dateFormat);
                } else if(inData.card && inData.card.validity === 12) {
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 365).format(dateFormat); 
                }

                // console.log("!!!!!!!!!userCardEndDate", inData.card && inData.card.validity, userCardEndDate);

                let creatUserPassObject = {
                    id : uniqueId,
                    name : inData.card && inData.card.name,
                    user_id : req.body.userId,
                    card_id : req.body.cardId,
                    transaction_id : transactionData.id,
                    transaction_type : "FATOORAH",
                    redeem_code : inData.redeem_code,
                    amount : parseFloat(req.body.amount) / parseInt(req.body.cardQuantity),
                    start_date : inData.start_date, 
                    end_date : inData.end_date,
                    user_card_start_date : userCardStartDate,
                    user_card_end_date : userCardEndDate !== null ? userCardEndDate : inData.end_date,
                    validity : inData.card && inData.card.validity, 
                    is_active : true,
                    is_paid : true,
                    purchase_date : userCardStartDate,
                    _deleted : false
                };

                let createUserCardata = await models.user_cards.create(creatUserPassObject); 
                // console.log("!!!!!!!!!!!!!!!createUserCardata", createUserCardata);
            }

            let subUserData = await models.users.findOne({
                where : {
                    id : req.body.userId
                }
            });
            console.log("!!!!!!!subUserData printed here", subUserData);

            //Mail notification for purchase
            mailService.sendMail(req.app, subUserData.email, 'Leena Card App - Purchase', 'mail_customer_purchase', {
                cardName: cardName,
                amount: card_quantity,
                cards: cardIds,
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet purchase", mailData);
            });
            mailService.sendMail(req.app, constants.mail_receiver, 'Leena Card App - Purchase', 'mail_seller_purchase', {
                name: subUserData.first_name,
                cardName: cardName,
                quantity: card_quantity,
                sku: card_sku,
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet purchase_seller", mailData);
            });

            let notiMessage = `you have successfully purchased ${availableCardData.name} card.Please check your transaction.`;

            //send Notification
            let notificationData = await NotificationController.sendAndCreateNotification(
                res, 
                subUserData.id, 
                "CARD",
                notiMessage,
                "TRANSACTION",
                "",
                subUserData.email,
                subUserData.firebase_token,
                {
                    userId : subUserData.id,
                    cardName: availableCardData.name,
                    transactionId: transactionData.id,
                    walletTransactionId : null
                },
                {
                    isEmail : false,
                    isPush : true
                }
            );


            res.json({
                status: constants.success_code,
                message: "successfully buy",
            });

        }catch(error) {
            // console.log("buyCardFatoorah function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }


    /*
        name: buyCardWallet
        target: application
        description: buy card using wallet
        parameters: null
        response: transaction object
    */
    async buyCardWallet(req, res) {
        try{

            if(!req.body.userId && !req.body.cardId && !req.body.amount && !req.body.cardQuantity) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data"
                });

                return;
            } 

            //check wallet balance
            let userData = await models.users.findOne({
                where: {
                    _deleted : false,
                    id : req.body.userId
                },
            });

            if(!userData) {
                res.json({
                    status: constants.server_error_code,
                    message: "userData not found"
                });

                return;
            }
            if(userData.wallet_balance < parseFloat(req.body.amount) ) {
                res.json({
                    status: constants.server_error_code,
                    message: "No enough balance"
                });

                return;
            }


            let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
            let orderCode = '_' + Math.random().toString(36).substr(2, 9);
            let date = super.getDate();

            //check Available count
            let cardData = await models.cards.findOne({
                where: {
                    _deleted : false,
                    id : req.body.cardId
                },
            });
            // console.log("!!!!!!!!!cardData", cardData);

            if(!cardData || (cardData && (parseInt(req.body.cardQuantity) > cardData.available_count))){
                res.json({
                    status: constants.server_error_code,
                    message: "No available card is there"
                });

                return;
            }
    
            //cross check
            let cardInventoryData = await models.card_inventorys.findAndCountAll({
                where: {
                    [Op.and] : [
                        {
                            card_id: req.body.cardId
                        }, 
                        {
                            user_id: null
                        },
                        {
                            is_paid: false
                        },
                        {
                            reserved_on: null
                        },
                    ]
                },
            });
            // console.log("!!!!!!!!!cardInventoryData", cardInventoryData);

            if(!cardInventoryData || (cardInventoryData && (parseInt(req.body.cardQuantity) > cardInventoryData.count))){
                res.json({
                    status: constants.server_error_code,
                    message: "No available card is there"
                });

                return;
            }

            //create wallet transaction
            let createTransactionObject = {
                id : uniqueId,
                user_id : req.body.userId,
                card_id : req.body.cardId,
                amount : parseFloat(req.body.amount),
                card_quantity : parseInt(req.body.cardQuantity),
                type : "DEBIT",
                order_code : orderCode,
                transaction_at : date,
                payment_mode : "WALLET",
                status : "SUCCESS",
                _deleted : false
            };
            let createTransactionData = await models.user_wallet_transactions.create(createTransactionObject); 
            // console.log("!!!!!!!!!!!!!!!createTransactionData", createTransactionData);

            //edit card inventory 
            let loopCountArray = [];
            for(var i=0; i < parseInt(req.body.cardQuantity); i++) {
                loopCountArray.push(i);
            }

            for(let data of loopCountArray) {
                let editCardInventoryObject = {
                    reserved_on : date,
                    is_paid : true,
                    user_id : req.body.userId,
                    transaction_id : createTransactionData.id,
                    transaction_type : "WALLET"
                };

                let toUpdateCarInventoryData = await models.card_inventorys.findOne({
                    where: {
                        [Op.and] : [
                            {
                                card_id: req.body.cardId
                            }, 
                            {
                                user_id: null
                            },
                            {
                                is_paid: false
                            },
                            {
                                reserved_on: null
                            },
                        ]
                    },
                });

                let updateInventory = await models.card_inventorys.update(editCardInventoryObject,{
                    where : {
                      id : toUpdateCarInventoryData.id
                    }
                });
                // console.log("!!!!!!!!!!!!updateInventory", updateInventory);

            }

            //edit available count and sold_count
            let updatedAvailableCount = cardData.available_count - parseInt(req.body.cardQuantity);
            let updateSoldCount = cardData.sold_count + parseInt(req.body.cardQuantity);
            let editCardData = {
                available_count : updatedAvailableCount,
                sold_count : updateSoldCount
            };
            let updateCardWholeData = await models.cards.update(editCardData,{
                where : {
                  id : req.body.cardId
                }
            });
            // console.log("!!!!!!!!!!!!!!!updateCardWholeData", updateCardWholeData);
            //edit user wallet balance
            let updatedWalletBalance = userData.wallet_balance - parseFloat(req.body.amount);
            let updatedUserData = await models.users.update({
                wallet_balance : updatedWalletBalance
            },{
                where : {
                  id : req.body.userId
                }
            });
            // console.log("!!!!!!!!!!!!!!!updatedUserData", updatedUserData);

             //add redeem code in user_cards
            let cardInventoryTestData = await models.card_inventorys.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'image', 'sku', 'icon', 'description', 'amount', 'discount_amount', 'validity'],
                        required: false
                    }
                ],
                where: {
                    [Op.and] : [
                        {
                            card_id : req.body.cardId
                        }, 
                        {
                            user_id: req.body.userId
                        },
                        {
                            transaction_id: createTransactionData.id
                        },
                    ]
                },
            });
            // console.log("!!!!!!!!!!!cardInventoryTestData", cardInventoryTestData);

            let cardIds = [];
            let cardName = '';
            let card_quantity = 0;
            let card_sku = '';
            for (let inData of cardInventoryTestData.rows) {
                
                cardIds.push(decrypt(inData.redeem_code));
                cardName = inData.card.name;
                card_quantity++;
                card_sku = inData.card.sku;
                
                let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
                let dateFormat = 'YYYY-MM-DD hh:mm:ss';
                let userCardStartDate = moment(new Date()).format(dateFormat);
                let userCardEndDate = null;
    
                if(inData.card && inData.card.validity === 3){
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 90).format(dateFormat);
                } else if(inData.card && inData.card.validity === 6){
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 180).format(dateFormat);
                } else if(inData.card && inData.card.validity === 12) {
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 365).format(dateFormat); 
                }

                // console.log("!!!!!!!!!userCardEndDate", inData.card && inData.card.validity, userCardEndDate);

                let creatUserPassObject = {
                    id : uniqueId,
                    name : inData.card && inData.card.name,
                    user_id : req.body.userId,
                    card_id : req.body.cardId,
                    transaction_id : createTransactionData.id,
                    transaction_type : "WALLET",
                    redeem_code : inData.redeem_code,
                    amount : parseFloat(req.body.amount) / parseInt(req.body.cardQuantity),
                    start_date : inData.start_date, 
                    end_date : inData.end_date,
                    user_card_start_date : userCardStartDate,
                    user_card_end_date : userCardEndDate !== null ? userCardEndDate : inData.end_date,
                    validity : inData.card && inData.card.validity, 
                    is_active : true,
                    is_paid : true,
                    purchase_date : userCardStartDate,
                    _deleted : false
                };

                let createUserCardata = await models.user_cards.create(creatUserPassObject); 
                // console.log("!!!!!!!!!!!!!!!createUserCardata", createUserCardata);
            }

            //Mail notification for purchase
            mailService.sendMail(req.app, userData.email, 'Leena Card App - Purchase', 'mail_customer_purchase', {
                cardName: cardName,
                amount: card_quantity,
                cards: cardIds,
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet purchase", mailData);
            });
            mailService.sendMail(req.app, constants.mail_receiver, 'Leena Card App - Purchase', 'mail_seller_purchase', {
                name: userData.first_name,
                cardName: cardName,
                quantity: card_quantity,
                sku: card_sku,
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet purchase_seller", mailData);
            });

            let notiMessage = `you have successfully purchased ${cardData.name} card.Please check your transaction.`;

            //send Notification
            let notificationData = await NotificationController.sendAndCreateNotification(
                res, 
                userData.id, 
                "CARD",
                notiMessage,
                "TRANSACTION",
                "",
                userData.email,
                userData.firebase_token,
                {
                    userId : userData.id,
                    cardName: cardData.name,
                    transactionId : null,
                    walletTransactionId: createTransactionData.id,
                },
                {
                    isEmail : false,
                    isPush : true
                }
            );

            res.json({
                status: constants.success_code,
                message: "successfully buy",
                updatedWalletBalance: updatedWalletBalance
            });

        }catch(e) {
            // console.log("buyCardWallet function error", e);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: e
            });

            return;
        }
    }

    /*
        name: buyCardReservedKnet
        target: application
        description: reserve card using fatoorah
        parameters: null
        response: transaction object
    */
    async buyCardReservedKnet(req, res) {
        // console.log("buyCardReservedKnet function start");
        try {   
            if(!req.body.userId && !req.body.cardId && !req.body.amount && !req.body.cardQuantity) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data"
                });

                return;
            } 

            //check Available count
            let cardData = await models.cards.findOne({
                where: {
                    _deleted : false,
                    id : req.body.cardId
                },
            });
            // console.log("!!!!!!!!!cardData", cardData);

            if(!cardData || (cardData && (parseInt(req.body.cardQuantity) > cardData.available_count))){
                res.json({
                    status: constants.server_error_code,
                    message: "No available card is there"
                });

                return;
            }

            //cross check
            let cardInventoryData = await models.card_inventorys.findAndCountAll({
                where: {
                    [Op.and] : [
                        {
                            card_id: req.body.cardId
                        }, 
                        {
                            user_id: null
                        },
                        {
                            is_paid: false
                        },
                        {
                            reserved_on: null
                        },
                    ]
                },
            });
            // console.log("!!!!!!!!!cardInventoryData", cardInventoryData);

            if(!cardInventoryData || (cardInventoryData && (parseInt(req.body.cardQuantity) > cardInventoryData.count))){
                res.json({
                    status: constants.server_error_code,
                    message: "No available card is there"
                });

                return;
            }

            //add entry or user_transaction
            let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
            let orderCode = '_' + Math.random().toString(36).substr(2, 9);
            let date = super.getDate();
            let createTransactionObject = {
                id : uniqueId,
                user_id : req.body.userId,
                card_id : req.body.cardId,
                amount : parseFloat(req.body.amount),
                card_quantity : parseInt(req.body.cardQuantity),
                type : "DEBIT",
                order_code : orderCode,
                transaction_at : date,
                payment_mode : "KNET",
                status : "PENDING",
                _deleted : false
            };
            let createTransactionData = await models.user_transactions.create(createTransactionObject); 
            // console.log("!!!!!!!!!!!!!!!createTransactionData", createTransactionData);


            //edit card_inventorys and set resrved On and add user_id and transaction id
            let loopCountArray = [];
            for(var i=0; i < parseInt(req.body.cardQuantity); i++) {
                loopCountArray.push(i);
            }

            for(let data of loopCountArray) {
                let editCardInventoryObject = {
                    reserved_on : date,
                    is_paid : false,
                    user_id : req.body.userId,
                    transaction_id : createTransactionData.id,
                    transaction_type : "KNET"
                };
                let toUpdateCarInventoryData = await models.card_inventorys.findOne({
                    where: {
                        [Op.and] : [
                            {
                                card_id: req.body.cardId
                            }, 
                            {
                                user_id: null
                            },
                            {
                                is_paid: false
                            },
                            {
                                reserved_on: null
                            },
                        ]
                    },
                });
                let updateInventory = await models.card_inventorys.update(editCardInventoryObject,{
                    where : {
                    id : toUpdateCarInventoryData.id
                    }
                });
                // console.log("!!!!!!!!!!!!updateInventory", updateInventory);
            }

            //edit available count and sold_count
            let updatedAvailableCount = cardData.available_count - parseInt(req.body.cardQuantity);
            let updateSoldCount = cardData.sold_count + parseInt(req.body.cardQuantity);
            let editCardData = {
                available_count : updatedAvailableCount,
                sold_count : updateSoldCount
            };

            let updateCardWholeData = await models.cards.update(editCardData,{
                where : {
                id : req.body.cardId
                }
            });
            // console.log("!!!!!!!!!!!!!!!updateCardWholeData", updateCardWholeData);

            res.json({
                status: constants.success_code,
                message: "successfully reserved",
                orderCode: createTransactionData.order_code,
            });
            
        } catch (error) {
            // console.log("buyCardReservedKnet function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

    /*
        name: buyCardKnet
        target: application
        description: buy card using fatoorah
        parameters: null
        response: transaction object
    */
    async buyCardKnet(req, res) {
        try{
            if(!req.body.userId && !req.body.cardId && !req.body.amount && !req.body.cardQuantity && !req.body.orderCode && !req.body.responsData) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data"
                });

                return;
            } 

            let parseResponse = JSON.parse(req.body.responsData);

            //find transactionData
            let transactionData = await models.user_transactions.findOne({
                where: {
                    _deleted : false,
                    order_code : req.body.orderCode
                },
            });
            // console.log("!!!!!!!!!!!transactionData", transactionData);


            //check card is reserverd or not 
            let checkCardInventoryData = await models.card_inventorys.findAndCountAll({
                where : {
                    [Op.and] : [
                        {
                            card_id : req.body.cardId
                        }, 
                        {
                            user_id: req.body.userId
                        },
                        {
                            transaction_id: transactionData.id
                        },
                        {
                            reserved_on : {
                                [Op.ne] : null
                            }
                        },
                        {
                            is_paid : false
                        }
                    ]
                }
            });
            // console.log("!!!!!!!!!checkCardInventoryData for check reservation", checkCardInventoryData.count);

            let availableCardData = await models.cards.findOne({
                where : {
                    id : req.body.cardId
                }
            });

            let date = super.getDate();

            if(checkCardInventoryData.count !== req.body.cardQuantity) {
                //card reservation removed
                // console.log("!!!!!!!!!!!!card reservation removed");

                //card goone be resrved
                let updatedCheckReservedCount = parseInt(req.body.cardQuantity) - checkCardInventoryData.count;

                //check vaailable card 
                // console.log("!!!!!!!!!!!!!availableCardData", availableCardData);

                //cross check availability
                let availableCardInventoryData = await models.card_inventorys.findAndCountAll({
                    where : {
                        [Op.and] : [
                            {
                                card_id : req.body.cardId
                            }, 
                            {
                                user_id: null
                            },
                            {
                                transaction_id: null
                            },
                            {
                                reserved_on : null
                            },
                            {
                                is_paid : false
                            }
                        ]
                    }
                });

                if((!availableCardData || (availableCardData && (updatedCheckReservedCount > availableCardData.available_count))) || (!availableCardInventoryData || (availableCardInventoryData && (updatedCheckReservedCount > availableCardInventoryData.count)))){
                    //update transaction to refund
                    let editTransactionObject = {
                        status: "REFUND",
                        response_string : req.body.responsData,
                        reference_id : parseResponse && parseResponse.ref,
                        payment_gateway_order_id : parseResponse && parseResponse.paymentid
                    };
                    let updateTransactionData = await models.user_transactions.update(editTransactionObject,{
                        where : {
                          order_code : req.body.orderCode
                        }
                    });
                    // console.log("!!!!!!!!!!!!updateTransactionData", updateTransactionData);

                    res.json({
                        status: constants.success_code,
                        message: "You will be refunded shortly",
                    });

                    return;
                }

                //card available then reserve card
                //edit card_inventorys and set resrved On and add user_id and transaction id

                let loopCountArray = [];
                for(var i=0; i < updatedCheckReservedCount; i++) {
                    loopCountArray.push(i);
                }

                for(let data of loopCountArray) {
                    let editCardInventoryObject = {
                        reserved_on : date,
                        is_paid : false,
                        user_id : req.body.userId,
                        transaction_id : transactionData.id,
                        transaction_type : "KNET"
                    };
                    let toUpdateCarInventoryData = await models.card_inventorys.findOne({
                        where: {
                            [Op.and] : [
                                {
                                    card_id: req.body.cardId
                                }, 
                                {
                                    user_id: null
                                },
                                {
                                    is_paid: false
                                },
                                {
                                    reserved_on: null
                                },
                            ]
                        },
                    });
                    let updateInventory = await models.card_inventorys.update(editCardInventoryObject,{
                        where : {
                            id : toUpdateCarInventoryData.id
                        }
                    });
                    // console.log("!!!!!!!!!!!!updateInventory", updateInventory);
                }

                //edit available count and sold_count
                let updatedAvailableCount = availableCardData.available_count - updatedCheckReservedCount;
                let updateSoldCount = availableCardData.sold_count + updatedCheckReservedCount;
                let editCardData = {
                    available_count : updatedAvailableCount,
                    sold_count : updateSoldCount
                };

                let updateCardWholeData = await models.cards.update(editCardData,{
                    where : {
                        id : req.body.cardId
                    }
                });
                // console.log("!!!!!!!!!!!!!!!updateCardWholeData", updateCardWholeData);
            }

            //Main process ***************************************/


            //update transaction using orederCode
            let editTransactionObject = {
                status: "SUCCESS",
                response_string : req.body.responsData,
                reference_id : parseResponse && parseResponse.ref,
                payment_gateway_order_id : parseResponse && parseResponse.paymentid
            };
            let updateTransactionData = await models.user_transactions.update(editTransactionObject,{
                where : {
                order_code : req.body.orderCode
                }
            });
            // console.log("!!!!!!!!!!!!updateTransactionData", updateTransactionData);


            //update card inventorys
            let editCardInventoryObject = {
                is_paid : true
            };
            let updateCardInventoryData = await models.card_inventorys.update(editCardInventoryObject,{
                where : {
                [Op.and] : [
                        {
                            card_id : req.body.cardId
                        }, 
                        {
                            user_id: req.body.userId
                        },
                        {
                            transaction_id: transactionData.id
                        },
                    ]
                }
            });
            // console.log("!!!!!!!!!!!!!!updateCardInventoryData", updateCardInventoryData);

            //add redeem code in user_cards
            let cardInventoryData = await models.card_inventorys.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'image', 'sku', 'icon', 'description', 'amount', 'discount_amount', 'validity'],
                        required: false
                    }
                ],
                where: {
                    [Op.and] : [
                        {
                            card_id : req.body.cardId
                        }, 
                        {
                            user_id: req.body.userId
                        },
                        {
                            transaction_id: transactionData.id
                        },
                    ]
                },
            });
            // console.log("!!!!!!!!!!!cardInventoryData", cardInventoryData);
            let cardIds = [];
            let cardName = '';
            let card_quantity = 0;
            let card_sku = '';
            for (let inData of cardInventoryData.rows) {
                
                cardIds.push(decrypt(inData.redeem_code));
                cardName = inData.card.name;
                card_quantity++;
                card_sku = inData.card.sku;
                
                let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
                let dateFormat = 'YYYY-MM-DD hh:mm:ss';
                let userCardStartDate = moment(new Date()).format(dateFormat);
                let userCardEndDate = null;

                if(inData.card && inData.card.validity === 3){
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 90).format(dateFormat);
                } else if(inData.card && inData.card.validity === 6){
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 180).format(dateFormat);
                } else if(inData.card && inData.card.validity === 12) {
                    userCardEndDate = moment(userCardStartDate, dateFormat).add('days', 365).format(dateFormat); 
                }

                // console.log("!!!!!!!!!userCardEndDate", inData.card && inData.card.validity, userCardEndDate);

                let creatUserPassObject = {
                    id : uniqueId,
                    name : inData.card && inData.card.name,
                    user_id : req.body.userId,
                    card_id : req.body.cardId,
                    transaction_id : transactionData.id,
                    transaction_type : "KNET",
                    redeem_code : inData.redeem_code,
                    amount : parseFloat(req.body.amount) / parseInt(req.body.cardQuantity),
                    start_date : inData.start_date, 
                    end_date : inData.end_date,
                    user_card_start_date : userCardStartDate,
                    user_card_end_date : userCardEndDate !== null ? userCardEndDate : inData.end_date,
                    validity : inData.card && inData.card.validity, 
                    is_active : true,
                    is_paid : true,
                    purchase_date : userCardStartDate,
                    _deleted : false
                };

                let createUserCardata = await models.user_cards.create(creatUserPassObject); 
                // console.log("!!!!!!!!!!!!!!!createUserCardata", createUserCardata);
            }

            let subUserData = await models.users.findOne({
                where : {
                    id : req.body.userId
                }
            });
            // console.log("!!!!!!!subUserData printed here", subUserData);

            //Mail notification for purchase
            mailService.sendMail(req.app, subUserData.email, 'Leena Card App - Purchase', 'mail_customer_purchase', {
                cardName: cardName,
                amount: card_quantity,
                cards: cardIds,
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet purchase", mailData);
            });
            mailService.sendMail(req.app, constants.mail_receiver, 'Leena Card App - Purchase', 'mail_seller_purchase', {
                name: subUserData.first_name,
                cardName: cardName,
                quantity: card_quantity,
                sku: card_sku,
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet purchase_seller", mailData);
            });

            let notiMessage = `you have successfully purchased ${availableCardData.name} card.Please check your transaction.`;

            //send Notification
            let notificationData = await NotificationController.sendAndCreateNotification(
                res, 
                subUserData.id, 
                "CARD",
                notiMessage,
                "TRANSACTION",
                "",
                subUserData.email,
                subUserData.firebase_token,
                {
                    userId : subUserData.id,
                    cardName: availableCardData.name,
                    transactionId: transactionData.id,
                    walletTransactionId : null
                },
                {
                    isEmail : false,
                    isPush : true
                }
            );

            res.json({
                status: constants.success_code,
                message: "successfully buy",
            });

        }catch(error) {
            // console.log("buyCardKnet function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

    /*
        name: addAmountWalletUsingFatoorah
        target: application
        description: add amount to wallet using fatoorah
        parameters: null
        response: null
    */
    async addAmountWalletUsingFatoorah(req, res) {
        try{    
            if(!req.body.userId && !req.body.amount && !req.body.responsData) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data"
                });

                return;
            } 

            let userData = await models.users.findOne({
                where: {
                    _deleted : false,
                    id : req.body.userId
                },
            });

            if(!userData) {
                res.json({
                    status: constants.server_error_code,
                    message: "No user there"
                });

                return;
            }

            //create transaction
            let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
            let orderCode = '_' + Math.random().toString(36).substr(2, 9);
            let date = super.getDate();

            let parseResponse = JSON.parse(req.body.responsData);

            let createTransactionObject = {
                id : uniqueId,
                user_id : req.body.userId,
                amount : parseFloat(req.body.amount),
                type : "DEBIT",
                order_code : orderCode,
                transaction_at : date,
                payment_mode : "FATOORAH",
                status : "SUCCESS",
                response_string : req.body.responsData,
                reference_id : parseResponse && parseResponse.InvoiceTransactions.length > 0 && parseResponse.InvoiceTransactions[0].TransactionId,
                payment_gateway_order_id : parseResponse && parseResponse.InvoiceTransactions.length > 0 && parseResponse.InvoiceTransactions[0].PaymentId,
                _deleted : false
            };
            // console.log("!!!!!!!!!!!!!!!!!!!!!!createTransactionObject", parseResponse, createTransactionObject);

            let createTransactionData = await models.user_transactions.create(createTransactionObject); 
            // console.log("!!!!!!!!!!!!!!!createTransactionData", createTransactionData);


            //create wallet transaction
            let walletUniqueId = '_' + Math.random().toString(36).substr(2, 9);
            let walletOrderCode = '_' + Math.random().toString(36).substr(2, 9);
            let createWallettransactionObject = {
                id : walletUniqueId,
                user_id : req.body.userId,
                transaction_id : createTransactionData.id,
                amount : parseFloat(req.body.amount),
                type : "CREDIT",
                order_code : walletOrderCode,
                transaction_at : date,
                payment_mode : "WALLET",
                status : "SUCCESS",
                _deleted : false
            };
            let createWalletTransactionData = await models.user_wallet_transactions.create(createWallettransactionObject); 
            // console.log("!!!!!!!!!!!!!!!createWalletTransactionData", createWalletTransactionData);

            let updatedWalletBalance = userData.wallet_balance + (parseFloat(req.body.amount));
            //Mail notification for wallet recharge
            mailService.sendMail(req.app, userData.email, 'Leena Card App - Wallet Recharged', 'mail_customer_wallet_recharge', {
                amount: parseFloat(req.body.amount),
                orderNo: parseResponse && parseResponse.InvoiceTransactions.length > 0 && parseResponse.InvoiceTransactions[0].PaymentId,
                balance: updatedWalletBalance,
                method: 'Fatoorah'
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet recharge", mailData);
            });
            mailService.sendMail(req.app, constants.mail_receiver, 'Leena Card App - Wallet Recharged', 'mail_seller_wallet_recharge', {
                name: userData.first_name,
                amount: parseFloat(req.body.amount),
                method: 'Fatoorah'
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet recharge_seller", mailData);
            });
            //add amount in wallet
            let adminData = await models.admins.findAll();
      
            if (parseFloat(req.body.amount) >= adminData[0].balance_limit) {
                let updatedUserData = await models.users.update({
                    wallet_balance: updatedWalletBalance,
                    is_active: false
                },{
                    where : {
                        id : req.body.userId
                    }
                });
                mailService.sendMail(req.app, userData.email, 'Leena Card App - Adding balance limit', 'mail_customer_balance_limit', {}).then(mailData => {
                    console.log("!!!!!!!!!!!!!mailData printed here", "Mail for adding more than limit", mailData);
                });
                // console.log("!!!!!!!!!!!!!!!updatedUserData", updatedUserData);  
            } else {
                let updatedUserData = await models.users.update({
                    wallet_balance : updatedWalletBalance
                },{
                    where : {
                    id : req.body.userId
                    }
                });
                // console.log("!!!!!!!!!!!!!!!updatedUserData", updatedUserData);  
            }

            let notiMessage = `KD ${req.body.amount} added to your Leena wallet.`;

            //send Notification
            let notificationData = await NotificationController.sendAndCreateNotification(
                res, 
                userData.id, 
                "WALLET",
                notiMessage,
                "WALLET",
                "",
                userData.email,
                userData.firebase_token,
                {
                    userId : userData.id,
                },
                {
                    isEmail : false,
                    isPush : true
                }
            );
            
            if (parseFloat(req.body.amount) >= adminData[0].balance_limit) {
                res.json({
                    status: constants.success_code,
                    message: "balance limit",
                    updatedWalletBalance : updatedWalletBalance
                });
            } else {
                res.json({
                    status: constants.success_code,
                    message: "Successfully added balance",
                    updatedWalletBalance : updatedWalletBalance
                });
            }

        } catch (error) {
            // console.log("buyCardKnet function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        } 
    }

    /*
        name: addAmountWalletUsingKnet
        target: application
        description: add amount to wallet using knet
        parameters: null
        response: null
    */
    async addAmountWalletUsingKnet(req, res) {
        try{
            if(!req.body.userId && !req.body.amount && !req.body.responsData) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data"
                });

                return;
            }

            let userData = await models.users.findOne({
                where: {
                    _deleted : false,
                    id : req.body.userId
                },
            });

            if(!userData) {
                res.json({
                    status: constants.server_error_code,
                    message: "No user there"
                });

                return;
            }

            //create transaction
            let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
            let orderCode = '_' + Math.random().toString(36).substr(2, 9);
            let date = super.getDate();

            let parseResponse = JSON.parse(req.body.responsData);

            let createTransactionObject = {
                id : uniqueId,
                user_id : req.body.userId,
                amount : parseFloat(req.body.amount),
                type : "DEBIT",
                order_code : orderCode,
                transaction_at : date,
                payment_mode : "KNET",
                status : "SUCCESS",
                response_string : req.body.responsData,
                reference_id : parseResponse && parseResponse.ref,
                payment_gateway_order_id : parseResponse && parseResponse.paymentid,
                _deleted : false
            };
            let createTransactionData = await models.user_transactions.create(createTransactionObject); 
            // console.log("!!!!!!!!!!!!!!!createTransactionData", createTransactionData);


            //create wallet transaction
            let walletUniqueId = '_' + Math.random().toString(36).substr(2, 9);
            let walletOrderCode = '_' + Math.random().toString(36).substr(2, 9);
            let createWallettransactionObject = {
                id : walletUniqueId,
                user_id : req.body.userId,
                transaction_id : createTransactionData.id,
                amount : parseFloat(req.body.amount),
                type : "CREDIT",
                order_code : walletOrderCode,
                transaction_at : date,
                payment_mode : "WALLET",
                status : "SUCCESS",
                _deleted : false
            };
            let createWalletTransactionData = await models.user_wallet_transactions.create(createWallettransactionObject); 
            // console.log("!!!!!!!!!!!!!!!createWalletTransactionData", createWalletTransactionData);

            let updatedWalletBalance = userData.wallet_balance + (parseFloat(req.body.amount));
            //Mail notification for wallet recharge
            mailService.sendMail(req.app, userData.email, 'Leena Card App - Wallet Recharged', 'mail_customer_wallet_recharge', {
                amount: parseFloat(req.body.amount),
                orderNo: parseResponse && parseResponse.paymentid,
                balance: updatedWalletBalance,
                method: 'Knet'
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet recharge_customer", mailData);
            });
            mailService.sendMail(req.app, constants.mail_receiver, 'Leena Card App - Wallet Recharged', 'mail_seller_wallet_recharge', {
                name: userData.first_name,
                amount: parseFloat(req.body.amount),
                method: 'Knet'
            }).then(mailData => {
                console.log("!!!!!!!!!!!!!mailData printed here", "Mail for wallet recharge_seller", mailData);
            });
            //add amount in wallet
            let adminData = await models.admins.findAll();
            if (parseFloat(req.body.amount) >= adminData[0].balance_limit) {
                let updatedUserData = await models.users.update({
                    wallet_balance: updatedWalletBalance,
                    is_active: false
                },{
                    where : {
                    id : req.body.userId
                    }
                });
                mailService.sendMail(req.app, userData.email, 'Leena Card App - Adding balance limit', 'mail_customer_balance_limit', {}).then(mailData => {
                    console.log("!!!!!!!!!!!!!mailData printed here", "Mail for adding more than 500KD", mailData);
                });
                // console.log("!!!!!!!!!!!!!!!updatedUserData", updatedUserData);
            } else {
                let updatedUserData = await models.users.update({
                    wallet_balance: updatedWalletBalance,
                },{
                    where : {
                    id : req.body.userId
                    }
                });
                // console.log("!!!!!!!!!!!!!!!updatedUserData", updatedUserData);
            }

            let notiMessage = `KD ${req.body.amount} added to your Lena wallet.`;

            let notificationData = await NotificationController.sendAndCreateNotification(
                res, 
                userData.id, 
                "WALLET",
                notiMessage,
                "WALLET",
                "",
                userData.email,
                userData.firebase_token,
                {
                    userId : userData.id,
                },
                {
                    isEmail : false,
                    isPush : true
                }
            );
            
            if (parseFloat(req.body.amount) >= adminData[0].balance_limit) {
                res.json({
                    status: constants.success_code,
                    message: "balance limit",
                    updatedWalletBalance: updatedWalletBalance
                });
            } else {
                res.json({
                    status: constants.success_code,
                    message: "Successfully added balance",
                    updatedWalletBalance: updatedWalletBalance
                });
            }

        }catch(error){
            // console.log("buyCardKnet function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        } 
    }


    /*
        name: cancelReservation
        target: application
        description: cancel card reservation
        parameters: null
        response: null
    */
    async cancelReservation(req, res) {
       try{
            if(!req.body.orderCode) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data"
                });

                return;
            } 

            let transactionData = await models.user_transactions.findOne({
                where : {
                    _deleted : false,
                    order_code : req.body.orderCode,
                    status : {
                        [Op.ne] : "SUCCESS"
                    }
                }
            });
            // console.log("!!!!!!!!!!!!!transactionData", transactionData);

            if(!transactionData) {
                res.json({
                    status: constants.server_error_code,
                    message: "transaction Data not Found"
                });

                return;
            }

            let userId = transactionData.user_id;
            let cardId = transactionData.card_id;
            let transactionId = transactionData.id;
            let cardQuantity = transactionData.card_quantity;

            let editCardInventoryObject = {
                reserved_on : null,
                is_paid : false,
                user_id : null,
                transaction_id : null,
                transaction_type : null
            };

            //update card Inventory
            let updateInventory = await models.card_inventorys.update(editCardInventoryObject,{
                where: {
                    [Op.and] : [
                        {
                            _deleted: false
                        }, 
                        {
                            is_paid : false
                        },
                        {
                            user_id : userId
                        },
                        {
                            transaction_id : transactionId
                        },
                        {
                            card_id : cardId
                        },
                        {
                            reserved_on : {
                                [Op.ne] : null
                            }
                        }
                    ]
                },
            });
            // console.log("!!!!!!!!!!updateInventory", updateInventory);

            //update card available_count and sold_count
            let cardData = await models.cards.findOne({
                where: {
                    _deleted : false,
                    id : cardId
                },
            });
            let updatedAvailableCount = cardData.available_count + cardQuantity;
            let updateSoldCount = cardData.sold_count - cardQuantity;
            let editCardData = {
                available_count : updatedAvailableCount,
                sold_count : updateSoldCount
            };
            let updateCardWholeData = await models.cards.update(editCardData,{
                where : {
                    id : cardId
                }
            });
            // console.log("!!!!!!!!!!!!!!!updateCardWholeData", updateCardWholeData); 

            //cancel Transaction
            let editTransactionObject = {
                status: "CANCELED"
            };
            let updateTransactionData = await models.user_transactions.update(editTransactionObject,{
                where : {
                  id : transactionId
                }
            });
            // console.log("!!!!!!!!!!!!updateTransactionData", updateTransactionData);

            res.json({
                status: constants.success_code,
                message: "Cancel Reservation successfully"
            });

       }catch(error) {
            // console.log("buyCardKnet function error", error);
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
        Comman functions
    */

}

export default new UserTransaction();
