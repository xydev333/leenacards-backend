import AppController from "./appcontroller";
import constants from "../configuration/constants";
import SendCardUpdate from "./Queue/SendCardUpdate";
const models = require('../models');
const Sequelize = require('sequelize');

const Op = Sequelize.Op;

class Card extends AppController {
    constructor() {
        super();
    }

    /* Admins functions */


    /*
        name: listCard
        target: admin panel
        description: list all cards
        parameters: null
        response: all card array
    */
    async listCard(req, res) {
        // console.log("listCard function start", req.params);
        try {
            let result = await models.cards.findAndCountAll({
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
                    _deleted : false
                },
                order: [['is_feature', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: result.rows,
                total: result.count
            });

        } catch (error) {
            // console.log("listCard function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }


    /*  
        name: filterCard
        description: filter card
        target: admin panel
        parameters: skipnumber and limitnumber in params and search_text in body
        response: card object
    */
    async filterCard(req, res) {
        // console.log("filterCard function start", req.body, req.params);
        try {
            if(req.body.search_text == ''){
                let result = await models.cards.findAndCountAll({
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
                        _deleted : false
                    },
                    order: [['createdAt', 'DESC']],
                    offset: parseInt(req.params.skip),
                    limit: parseInt(req.params.limit)
                });

                res.json({
                    status: constants.success_code,
                    message: "successfully listed",
                    data: result.rows,
                    total: result.count
                });

                return;
            }

            let result = await models.cards.findAndCountAll({
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
                    [Op.and] : [
                        {
                            _deleted : false
                        },
                        {
                            [Op.or] : [
                                {
                                    name: {
                                        [Op.like] : `%${req.body.search_text}%`
                                    }
                                }, 
                                {
                                    description: {
                                        [Op.like] : `%${req.body.search_text}%`
                                    }
                                }
                            ],
                        }
                    ]
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully Filter listed",
                data: result.rows,
                total: result.count
            });

        } catch (error) {
            // console.log("filterCard function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }   
    }

    /*  
        name: editCard
        description: edit card detail
        target: admin panel
        parameters: cardId(string), name (String), description(string), redeem_code(string), type_id(string), category_id(string), amount(double), discount_amount(double), color(string), is_paid(boolean), is_buy(boolean) 
        response: card object
    */
    async editCard(req, res) {
        // console.log("editCard function start", req.body);
        try {

            if(!req.body.cardId || !req.body.arabic_description || !req.body.sku || !req.body.name || !req.body.description || !req.body.type_id || !req.body.amount || !req.body.discount_amount || !req.body.color || !req.body.countryAmountObject) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let result = await models.types.findOne({
                where: {
                    id : req.body.type_id
                },
            });

            if(!result){
                res.json({
                    status: constants.server_error_code,
                    message: constants.server_error,
                    errors: "Type data not found"
                });

                return;
            }

            let categoryId = result.category_id;

            let updateObject = {
                name : req.body.name,
                type_id : req.body.type_id,
                category_id : categoryId,
                arabic_description : req.body.arabic_description,
                description : req.body.description,
                sku : req.body.sku,
                // redeem_code : req.body.redeem_code,
                amount : parseFloat(req.body.amount),
                discount_amount : parseFloat(req.body.discount_amount),
                country_amount : req.body.countryAmountObject,
                color : req.body.color,
                is_paid : req.body.is_paid,
                is_buy : req.body.is_buy
            };

            if(req.body.validity && req.body.validity !== null){
                updateObject.validity = req.body.validity;
            }

            if(req.body.terms_and_condition && req.body.terms_and_condition !== null){
                updateObject.terms_and_condition = req.body.terms_and_condition;
            }

            if(req.body.start_date && req.body.start_date !== null){
                updateObject.start_date = req.body.start_date;
            }

            if(req.body.end_date && req.body.end_date !== null){
                updateObject.end_date = req.body.end_date;
            }

            if(req.body.icon && req.body.icon !== ""){
                updateObject.icon = req.body.icon;
            }

            if(req.body.image && req.body.image !== ""){
                updateObject.image = req.body.image;
            }

            let cardObject = await models.cards.update(updateObject,{
                where : {
                    id : req.body.cardId
                }
            });

            res.json({
                status: constants.success_code,
                message: "Edit Card Successfully",
                data: cardObject
            });

            return;

        } catch (error) {
            // console.log("editCard function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }   
    }

    /*  
        name: deleteCard
        description: delete card detail (soft delete)
        target: admin panel
        parameters: cardId(string)
        response: card object
    */
    async deleteCard(req, res) {
        // console.log("deleteCard function start", req.params);
        try {

            if(!req.params.cardId ) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            //soft delete
            let cardObject = await models.cards.update({
                _deleted : true,
            },{
                where : {
                    id : req.params.cardId
                }
            });

            // console.log("!!!!!!!!!!after successfully delete", cardObject);
            //get updated list
            let result = await models.cards.findAndCountAll({
                where: {
                    _deleted : false
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            // console.log("result printed here", result);
            res.json({
                status: constants.success_code,
                message: "Delete Card Successfully",
                data: result.rows,
                total: result.count
            });

            return;

        } catch (error) {
            // console.log("deleteCard function error", error);
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
        description: Activated or deActivated card
        target: admin panel
        parameters: cardId(string), flag(boolean)
        response: card object
    */
    async changeStatus(req, res) {
        // console.log("changeStatus function start", req.body);

        try {
            if(!req.body.cardId) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let cardObject = await models.cards.update({
                is_active : req.body.flag,
            },{
                where : {
                    id : req.body.cardId
                }
            });

            // console.log("!!!!!!!!!!after successfully change status", cardObject);
            
            res.json({
                status: constants.success_code,
                message: "Card status changed Successfully",
                data: cardObject
            });

            return;

        } catch (error) {
            // console.log("changeStatus function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }   
    }

    /*  
        name: changeFeatureStatus
        description: Activated or deActivated feature flag of card
        target: admin panel
        parameters: cardId(string), flag(boolean)
        response: card object
    */
    async changeFeatureStatus(req, res) {
        // console.log("changeStatus function start", req.body);

        try {
            if(!req.body.cardId) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let cardObject = await models.cards.update({
                is_feature : req.body.flag,
            },{
                where : {
                    id : req.body.cardId
                }
            });

            // console.log("!!!!!!!!!!after successfully change status", cardObject);
            
            res.json({
                status: constants.success_code,
                message: "Card feature status changed Successfully",
                data: cardObject
            });

            return;

        } catch (error) {
            // console.log("changeFeatureStatus function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }   
    }

    /*
        name: addCard
        target: admin panel
        description: Add card
        parameters: name (String), description(string), redeem_code(string), type_id(string), category_id(string), amount(double), discount_amount(double), color(string), is_paid(boolean), is_buy(boolean) 
        response: card object
    */
    async addCard(req, res) {
        // console.log("addCard function start");
        try {

            if(!req.body.name || !req.body.arabic_description || !req.body.sku || !req.body.description || !req.body.type_id || !req.body.amount || !req.body.discount_amount || !req.body.color || !req.body.countryAmountObject) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let result = await models.types.findOne({
                where: {
                    id : req.body.type_id
                },
            });

            if(!result){
                res.json({
                    status: constants.server_error_code,
                    message: constants.server_error,
                    errors: "Type data not found"
                });

                return;
            }

            let categoryId = result.category_id;

            var uniqueId = '_' + Math.random().toString(36).substr(2, 9);
        
            let createObject = {
                id: uniqueId,
                name : req.body.name,
                type_id : req.body.type_id,
                category_id : categoryId,
                arabic_description : req.body.arabic_description,
                description : req.body.description,
                sku : req.body.sku,
                // redeem_code : req.body.redeem_code,
                amount : parseFloat(req.body.amount),
                discount_amount : parseFloat(req.body.discount_amount),
                country_amount : req.body.countryAmountObject,
                color : req.body.color,
                is_paid : req.body.is_paid,
                is_buy : req.body.is_buy,
                is_active: true,
                _deleted : false,
            };

            if(req.body.validity && req.body.validity !== null){
                createObject.validity = req.body.validity;
            }

            if(req.body.terms_and_condition && req.body.terms_and_condition !== null){
                createObject.terms_and_condition = req.body.terms_and_condition;
            }

            if(req.body.start_date && req.body.start_date !== null){
                createObject.start_date = req.body.start_date;
            }

            if(req.body.end_date && req.body.end_date !== null){
                createObject.end_date = req.body.end_date;
            }

            if(req.body.icon && req.body.icon !== null){
                createObject.icon = req.body.icon;
            }

            if(req.body.image && req.body.image !== null){
                createObject.image = req.body.image;
            }

            let cardData = await models.cards.create(createObject);

            // console.log("country printed here after creation", cardData, cardData.id);
            let responseObject = {
                id : cardData.id,
                name: cardData.name,
                type_id : cardData.type_id,
                category_id : cardData.category_id,
                description : cardData.description,
                redeem_code : cardData.redeem_code,
                sku : cardData.sku,
                amount : cardData.amount,
                discount_amount : cardData.discount_amount,
                color : cardData.color,
                is_paid : cardData.is_paid,
                is_buy : cardData.is_buy,
                is_active: cardData.is_active,
                createdAt: cardData.createdAt
            };

            //send notification to all User  
            let addQueueData = await SendCardUpdate.addQueue(res, "addCard", {
                id : cardData.id,
                name: cardData.name,
                amount: cardData.amount,
                discount_amount: cardData.discount_amount,
                notification_type : "CARD",
                click_action : "FLUTTER_NOTIFICATION_CLICK"
            });
            // console.log("!!!!!!!job added for addCard", addQueueData); 

            // console.log("responseObject printed here", responseObject);
            res.json({
                status: constants.success_code,
                message: "successfully created",
                data: responseObject
            });

            return;

        } catch (error) {
            // console.log("create card function error", error);
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
        name: listCardFromType
        target: application
        description: list all card from type id
        parameters: type_id(string)
        response: all card array
    */
    async listCardFromType(req, res) {
        // console.log("listCardFromType function start", req.params);
        try {

            if(!req.body.type_id) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let result = await models.cards.findAndCountAll({
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
                    _deleted : false,
                    type_id : req.body.type_id
                },
                order: [['createdAt', 'DESC']],
                // offset: parseInt(req.params.skip),
                // limit: parseInt(req.params.limit)
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: result.rows,
                total: result.count
            });

        } catch (error) {
            // console.log("listCardFromType function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

     /*
        name: listCardFromTypeData
        target: application
        description: list all card from type id and send to function from where this call
        parameters: type_id(string)
        response: all card array
    */
    async listCardFromTypeData(req, res) {
        // console.log("listCardFromType function start", req.params);
        try {

            if(!req.body.type_id) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let result = await models.cards.findAndCountAll({
                where: {
                    [Op.and] : [
                        {
                            _deleted : false,
                        }, 
                        {
                            is_active : true
                        },
                        {
                            type_id : req.body.type_id
                        },
                        {
                            available_count: {
                                [Op.gt] : 0
                            }
                        }
                    ]
                },
                order: [['amount', 'ASC']],
            });

            return {
                data: result.rows,
                total: result.count
            };

        } catch (error) {
            // console.log("listCardFromType function error", error);
            throw error;
        }
    }


    /*
        -------------------------
        comman functions
    */

}

export default new Card();
