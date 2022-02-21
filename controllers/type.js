import AppController from "./appcontroller";
import constants from "../configuration/constants";
const models = require('../models');
const Sequelize = require('sequelize');
import card from "../controllers/card.js";
const Op = Sequelize.Op;

class Type extends AppController {
    constructor() {
        super();
    }

    /* Admins functions  ------------------------ ------------------------ ------------------------ ------------------------ */


    /*
        name: listType
        target: admin panel
        description: list all type
        parameters: null
        response: all type array
    */
    async listType(req, res) {
        // console.log("listType function start", req.params);
        try {
            let result = await models.types.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.countrys,
                        attributes: ['id', 'name', 'code', 'isd_code'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false
                },
                order: [['sort_order', 'DESC']],
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
            // console.log("listType function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }


    /*  
        name: filterType
        description: filter type
        target: admin panel
        parameters: skipnumber and limitnumber in params and search_text in body
        response: type object
    */
    async filterType(req, res) {
        // console.log("filterType function start", req.body, req.params);
        try {

            // if(!req.body.search_text) {
            //   res.json({
            //     status: constants.server_error_code,
            //     message: "Please provide all Data",
            //   });

            //   return;
            // }

            if(req.body.search_text == ''){
                let result = await models.types.findAndCountAll({
                    include: [
                        {
                            model: models.categorys,
                            attributes: ['id', 'name', 'description', 'color', 'icon'],
                            required: false
                        },
                        {
                            model: models.countrys,
                            attributes: ['id', 'name', 'code', 'isd_code'],
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

            let result = await models.types.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.countrys,
                        attributes: ['id', 'name', 'code', 'isd_code'],
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
                message: "Filter Type Successfully",
                data: result.rows,
                total: result.count
            });

            return;
          
        } catch (error) {
            // console.log("filterType function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }   
    }

    /*  
        name: editType
        description: edit type detail
        target: admin panel
        parameters: typeId(string), name (String), country(string), category_id(string), description(string), color(string), image(string), icon(string)
        response: type object
    */
    async editType(req, res) {
        // console.log("editType function start", req.body);
        try {

            if(!req.body.typeId || !req.body.arabic_name || !req.body.name || !req.body.category_id || !req.body.description  || !req.body.color || !req.body.sort_order) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let editObject = {
                name : req.body.name,
                arabic_name : req.body.arabic_name,
                sort_order : req.body.sort_order,
                category_id : req.body.category_id,
                description : req.body.description,
                color : req.body.color
            };

            editObject.country_id = req.body.country;

            if(req.body.icon && req.body.icon !== ""){
                editObject.icon = req.body.icon;
            }

            if(req.body.image && req.body.image !== ""){
                editObject.image = req.body.image;
            }

            let typeObject = await models.types.update(editObject,{
                where : {
                    id : req.body.typeId
                }
            });

            res.json({
                status: constants.success_code,
                message: "Edit Type Successfully",
                data: typeObject
            });

            return;

        } catch (error) {
            // console.log("editType function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }   
    }

    /*  
        name: deleteType
        description: delete type detail (soft delete)
        target: admin panel
        parameters: typeId(string)
        response: type object
    */
    async deleteType(req, res) {
        // console.log("deleteType function start", req.params);
        try {

            if(!req.params.typeId ) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            //soft delete
            let typeObject = await models.types.update({
                _deleted : true,
            },{
                where : {
                    id : req.params.typeId
                }
            });

            // console.log("!!!!!!!!!!after successfully delete", typeObject);
            //get updated list
            let result = await models.types.findAndCountAll({
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
                message: "Delete Type Successfully",
                data: result.rows,
                total: result.count
            });

            return;

        } catch (error) {
            // console.log("deleteType function error", error);
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
        description: Activated or deActivated type
        target: admin panel
        parameters: typeId(string), flag(boolean)
        response: type object
    */
    async changeStatus(req, res) {
        // console.log("changeStatus function start", req.body);

        try {
            if(!req.body.typeId) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let typeObject = await models.types.update({
                is_active : req.body.flag,
            },{
                where : {
                    id : req.body.typeId
                }
            });
            // console.log("!!!!!!!!!!after successfully change status", typeObject);
            
            res.json({
                status: constants.success_code,
                message: "Type status changed Successfully",
                data: typeObject
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
        name: addType
        target: admin panel
        description: Add type
        parameters: name(string), country(string), category_id(string), description(string), color(string), image(string), icon(string)
        response: type object
    */
    async addType(req, res) {
        // console.log("addType function start");
        try {

            if(!req.body.name || !req.body.arabic_name || !req.body.category_id || !req.body.description  || !req.body.color || !req.body.sort_order) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            var uniqueId = '_' + Math.random().toString(36).substr(2, 9);
        
            let createObject = {
                id: uniqueId,
                name : req.body.name,
                arabic_name : req.body.arabic_name,
                category_id : req.body.category_id,
                sort_order : req.body.sort_order,
                description : req.body.description,
                color : req.body.color,
                icon : req.body.icon,
                is_active: true,
                _deleted : false,
            };

            if(req.body.country && req.body.country !== null) {
                createObject.country_id = req.body.country;
            }

            if(req.body.image && req.body.image !== null) {
                createObject.image = req.body.image;
            }else{
                createObject.image = null;
            }

            let typeData = await models.types.create(createObject);

            // console.log("country printed here after creation", typeData, typeData.id);
            let responseObject = {
                id : typeData.id,
                name: typeData.name,
                country: typeData.country,
                category_id: typeData.category_id,
                description: typeData.description,
                is_active: typeData.is_active,
                createdAt: typeData.createdAt
            };

            // console.log("responseObject printed here", responseObject);
            res.json({
                status: constants.success_code,
                message: "successfully created",
                data: responseObject
            });

            return;

        } catch (error) {
            // console.log("create type function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

    /*
        ------------------------ ------------------------ ------------------------ ------------------------ ------------------------
        Application functions
    */

    /*
        name: listTypeFromCategory
        target: application
        description: list all type from category id
        parameters: category_id(string)
        response: all type array
    */
    async listTypeFromCategory(req, res) {
        // console.log("listTypeFromCategory function start", req.params);
        try {

            if(!req.body.category_id) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let result = await models.types.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.countrys,
                        attributes: ['id', 'name', 'code', 'isd_code'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    is_active : true,
                    category_id : req.body.category_id
                },
                order: [['sort_order', 'ASC']],
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
            // console.log("listTypeFromCategory function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }

    /*
        name: listTypeFromCategorySubData
        target: application
        description: list all type from category id
        parameters: category_id(string)
        response: all type array
    */
    async listTypeFromCategorySubData(req, res) {
        // console.log("listTypeFromCategorySubData function start", req.params);
        try {

            if(!req.body.category_id) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let result = await models.types.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.countrys,
                        attributes: ['id', 'name', 'code', 'isd_code'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    is_active : true,
                    category_id : req.body.category_id
                },
                order: [['sort_order', 'ASC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            let responseArray = [];


            for(let subData of result.rows) {
                // console.log("!!!!!!!!!!typeId to be find", subData.id);
                let dummySubData = {
                    id : subData.id,
                    category_id : subData.category_id,
                    name : subData.name,
                    arabic_name : subData.arabic_name,
                    color : subData.color,
                    image : subData.image,
                    icon : subData.icon,
                    country_id : subData.country_id,
                    description : subData.description,
                    available_count : subData.available_count,
                    sold_count : subData.sold_count,
                    is_active : subData.is_active,
                    category : subData.category,
                    country : subData.country
                };
                req.body.type_id = subData.id;
                
                let cardData = await card.listCardFromTypeData(req, res);

                dummySubData.cardData = cardData;
                responseArray.push(dummySubData);
            }

            res.json({
                status: constants.success_code,
                message: "successfully listed cards",
                data: responseArray,
                total: result.count
            });

        } catch (error) {
            // console.log("listTypeFromCategorySubData function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }


    /*
        name: listTypeFromCategoryAndCountrySubData
        target: application
        description: list all type from category id
        parameters: category_id(string)
        response: all type array
    */
    async listTypeFromCategoryAndCountrySubData(req, res) {
        // console.log("listTypeFromCategoryAndCountrySubData function start", req.params);
        try {

            if(!req.body.category_id && !req.body.country_id) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let result = await models.types.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.countrys,
                        attributes: ['id', 'name', 'code', 'isd_code'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    is_active : true,
                    category_id : req.body.category_id,
                    country_id : req.body.country_id
                },
                order: [['sort_order', 'ASC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            let responseArray = [];


            for(let subData of result.rows) {
                // console.log("!!!!!!!!!!typeId to be find", subData.id);
                let dummySubData = {
                    id : subData.id,
                    category_id : subData.category_id,
                    name : subData.name,
                    arabic_name : subData.arabic_name,
                    color : subData.color,
                    image : subData.image,
                    icon : subData.icon,
                    country_id : subData.country_id,
                    description : subData.description,
                    available_count : subData.available_count,
                    sold_count : subData.sold_count,
                    is_active : subData.is_active,
                    category : subData.category,
                    country : subData.country
                };
                req.body.type_id = subData.id;
                
                let cardData = await card.listCardFromTypeData(req, res);

                dummySubData.cardData = cardData;
                responseArray.push(dummySubData);
            }

            res.json({
                status: constants.success_code,
                message: "successfully listed cards",
                data: responseArray,
                total: result.count
            });

        } catch (error) {
            // console.log("listTypeFromCategoryAndCountrySubData function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }


    /*
        name: listTypeFromCountry
        target: application
        description: list all type from country id
        parameters: country_id(string)
        response: all type array
    */
    async listTypeFromCountry(req, res) {
        // console.log("listTypeFromCountry function start", req.params);
        try {

            if(!req.body.country_id) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let result = await models.types.findAndCountAll({
                include: [
                    {
                        model: models.categorys,
                        attributes: ['id', 'name', 'description', 'color', 'icon'],
                        required: false
                    },
                    {
                        model: models.countrys,
                        attributes: ['id', 'name', 'code', 'isd_code'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    is_active : true,
                    country_id : req.body.country_id
                },
                order: [['sort_order', 'ASC']],
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
            // console.log("listTypeFromCountry function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }
    }


    /*
        ------------------------- ------------------------ ------------------------ ------------------------ ------------------------
        comman functions
    */

}

export default new Type();
