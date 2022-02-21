import AppController from "./appcontroller";
import constants from "../configuration/constants";
const models = require('../models');

class Category extends AppController {
    constructor() {
        super();
    }

    /* Admins functions */


    /*
        name: listCategory
        target: admin panel
        description: list all category
        parameters: null
        response: all category array
    */
    async listCategory(req, res) {
        // console.log("listCategory function start", req.params);
        try {
            let result = await models.categorys.findAndCountAll({
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
            // console.log("listCategory function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }


    /*  
        name: filterCategory
        description: filter category
        target: admin panel
        parameters: skipnumber and limitnumber in params and search_text in body
        response: category object
    */
    async filterCategory(req, res) {
        // console.log("filterCategory function start", req.body, req.params);
        try {

            // if(!req.body.search_text) {
            //   res.json({
            //     status: constants.server_error_code,
            //     message: "Please provide all Data",
            //   });

            //   return;
            // }

            if(req.body.search_text == ''){
                let result = await models.categorys.findAndCountAll({
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

            let categoryWithoutLimit = await models.sequelize.query("SELECT * FROM `categorys` AS `categorys` WHERE ((`categorys`.`name` LIKE '%" + req.body.search_text +  "%')) AND `categorys`.`_deleted` = false ORDER BY `categorys`.`createdAt` DESC");

            models.sequelize.query("SELECT * FROM `categorys` AS `categorys` WHERE ((`categorys`.`name` LIKE '%" + req.body.search_text +  "%')) AND `categorys`.`_deleted` = false ORDER BY `categorys`.`createdAt` DESC LIMIT " + req.params.skip + ", " + req.params.limit + "")
            .then(([categoryData, metadata]) =>{
                // console.log("^^^^^^^^^^^^^^^^^^^^^^categoryData printed here", categoryData, categoryData.length);
                res.json({
                    status: constants.success_code,
                    message: "Filter Category Successfully",
                    data: categoryData,
                    total: categoryWithoutLimit[0].length
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
            // console.log("filterCategory function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }   
    }

    /*  
        name: editCategory
        description: edit category detail
        target: admin panel
        parameters: categoryId(string), name (String), description(string), color(string), icon(string)
        response: category object
    */
    async editCategory(req, res) {
        // console.log("editCategory function start", req.body);
        try {

            if(!req.body.categoryId || !req.body.name || !req.body.arabic_name || !req.body.description || !req.body.color || !req.body.sort_order) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let editObject = {
                name : req.body.name,
                arabic_name: req.body.arabic_name,
                description : req.body.description,
                color : req.body.color,
                sort_order : req.body.sort_order
            };

            if(req.body.icon && req.body.icon !== ""){
                editObject.icon = req.body.icon;
            }

            let categoryObject = await models.categorys.update(editObject,{
                where : {
                    id : req.body.categoryId
                }
            });

            res.json({
                status: constants.success_code,
                message: "Edit Category Successfully",
                data: categoryObject
            });

            return;

        } catch (error) {
            // console.log("editCategory function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }   
    }

    /*  
        name: deleteCategory
        description: delete category detail (soft delete)
        target: admin panel
        parameters: categoryId(string)
        response: category object
    */
    async deleteCategory(req, res) {
        // console.log("deleteCategory function start", req.params);
        try {

            if(!req.params.categoryId ) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            //soft delete
            let categoryObject = await models.categorys.update({
                _deleted : true,
            },{
                where : {
                    id : req.params.categoryId
                }
            });

            // console.log("!!!!!!!!!!after successfully delete", categoryObject);
            //get updated list
            let result = await models.categorys.findAndCountAll({
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
                message: "Delete Category Successfully",
                data: result.rows,
                total: result.count
            });

            return;

        } catch (error) {
            // console.log("deleteCategory function error", error);
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
        description: Activated or deActivated category
        target: admin panel
        parameters: categoryId(string), flag(boolean)
        response: category object
    */
    async changeStatus(req, res) {
        // console.log("changeStatus function start", req.body);

        try {
            if(!req.body.categoryId) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let categoryObject = await models.categorys.update({
                is_active : req.body.flag,
            },{
                where : {
                    id : req.body.categoryId
                }
            });

            // console.log("!!!!!!!!!!after successfully change status", categoryObject);
            
            res.json({
                status: constants.success_code,
                message: "Category status changed Successfully",
                data: categoryObject
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
        name: addCategory
        target: admin panel
        description: Add category
        parameters: name (String), description(string), color(string), icon(string)
        response: category object
    */
    async addCategory(req, res) {
        // console.log("addCategory function start");
        // console.log(req.body);
        try {

            if(!req.body.name || !req.body.description || !req.body.color || !req.body.sort_order || !req.body.arabicName) {
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
                arabic_name : req.body.arabicName,
                description : req.body.description,
                color : req.body.color,
                icon : req.body.icon,
                is_active: true,
                _deleted : false,
                sort_order : req.body.sort_order
            };

            let categoryData = await models.categorys.create(createObject);

            // console.log("country printed here after creation", categoryData, categoryData.id);
            let responseObject = {
                id : categoryData.id,
                name: categoryData.name,
                description: categoryData.description,
                color: categoryData.color,
                icon: categoryData.icon,
                is_active: categoryData.is_active,
                createdAt: categoryData.createdAt
            };

            // console.log("responseObject printed here", responseObject);
            res.json({
                status: constants.success_code,
                message: "successfully created",
                data: responseObject
            });

            return;

        } catch (error) {
            // console.log("create category function error", error);
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

export default new Category();
