import AppController from "./appcontroller";
import constants from "../configuration/constants";
const models = require('../models');

class Country extends AppController {
    constructor() {
        super();
    }

    /* Admins functions */


    /*
        name: listCountry
        target: admin panel
        description: list all country
        parameters: null
        response: all country array
    */
    async listCountry(req, res) {
        // console.log("listCountry function start", req.params);
        try {
            let result = await models.countrys.findAndCountAll({
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

        } catch (error) {
            // console.log("listCountry function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }


    /*  
        name: filterCountry
        description: filter country
        target: admin panel
        parameters: skipnumber and limitnumber in params and search_text in body
        response: country object
    */
    async filterCountry(req, res) {
        // console.log("filterCountry function start", req.body, req.params);
        try {

            // if(!req.body.search_text) {
            //   res.json({
            //     status: constants.server_error_code,
            //     message: "Please provide all Data",
            //   });

            //   return;
            // }

            if(req.body.search_text == ''){
                let result = await models.countrys.findAndCountAll({
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

            let countryWithoutLimit = await models.sequelize.query("SELECT * FROM `countrys` AS `countrys` WHERE ((`countrys`.`name` LIKE '%" + req.body.search_text +  "%' OR `countrys`.`code` LIKE '%" + req.body.search_text + "%'  OR `countrys`.`isd_code` LIKE '%" + req.body.search_text + "%')) AND `countrys`.`_deleted` = false ORDER BY `countrys`.`createdAt` DESC");

            models.sequelize.query("SELECT * FROM `countrys` AS `countrys` WHERE ((`countrys`.`name` LIKE '%" + req.body.search_text +  "%' OR `countrys`.`code` LIKE '%" + req.body.search_text + "%'  OR `countrys`.`isd_code` LIKE '%" + req.body.search_text + "%')) AND `countrys`.`_deleted` = false ORDER BY `countrys`.`createdAt` DESC LIMIT " + req.params.skip + ", " + req.params.limit + "")
            .then(([countryData, metadata]) =>{
                // console.log("^^^^^^^^^^^^^^^^^^^^^^countryData printed here", countryData, countryData.length);
                res.json({
                    status: constants.success_code,
                    message: "Filter Country Successfully",
                    data: countryData,
                    total: countryWithoutLimit[0].length
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
            // console.log("filterCountry function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });

            return;
        }   
    }

    /*  
        name: editCountry
        description: edit country detail
        target: admin panel
        parameters: countryId(string), name (String), code(string), isd_code(string)
        response: city object
    */
    async editCountry(req, res) {
        // console.log("editCountry function start", req.body);
        try {

            if(!req.body.countryId || !req.body.name || !req.body.code || !req.body.isd_code) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let countryObject = await models.countrys.update({
                name : req.body.name,
                code : req.body.code,
                isd_code : req.body.isd_code
            },{
                where : {
                    id : req.body.countryId
                }
            });

            res.json({
                status: constants.success_code,
                message: "Edit Country Successfully",
                data: countryObject
            });

            return;

        } catch (error) {
            // console.log("editCountry function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }   
    }

    /*  
        name: deleteCountry
        description: delete country detail (soft delete)
        target: admin panel
        parameters: countryId(string)
        response: country object
    */
    async deleteCountry(req, res) {
        // console.log("deleteCountry function start", req.params);
        try {

            if(!req.params.countryId ) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            //soft delete
            let countryObject = await models.countrys.update({
                _deleted : true,
            },{
                where : {
                    id : req.params.countryId
                }
            });

            // console.log("!!!!!!!!!!after successfully delete", countryObject);
            //get updated list
            let result = await models.countrys.findAndCountAll({
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
                message: "Delete Country Successfully",
                data: result.rows,
                total: result.count
            });

            return;

        } catch (error) {
            // console.log("deleteCountry function error", error);
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
        description: Activated or deActivated country
        target: admin panel
        parameters: countryId(string), flag(boolean)
        response: country object
    */
    async changeStatus(req, res) {
        // console.log("changeStatus function start", req.body);

        try {
            if(!req.body.countryId) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let countryObject = await models.countrys.update({
                is_active : req.body.flag,
            },{
                where : {
                    id : req.body.countryId
                }
            });

            // console.log("!!!!!!!!!!after successfully change status", countryObject);
            
            res.json({
                status: constants.success_code,
                message: "Country status changed Successfully",
                data: countryObject
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
        name: changeGccStatus
        description: is gcc country
        target: admin panel
        parameters: countryId(string), flag(boolean)
        response: country object
    */
    async changeGccStatus(req, res) {
        // console.log("changeGccStatus function start", req.body);

        try {
            if(!req.body.countryId) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            let countryObject = await models.countrys.update({
                is_gcc : req.body.flag,
            },{
                where : {
                    id : req.body.countryId
                }
            });

            // console.log("!!!!!!!!!!after successfully change status", countryObject);
            
            res.json({
                status: constants.success_code,
                message: "Country gcc status changed Successfully",
                data: countryObject
            });

            return;

        } catch (error) {
            // console.log("changeGccStatus function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }   
    }

    /*
        name: addCountry
        target: admin panel
        description: Add country
        parameters: name(string), code(string), isd_code(string)
        response: country object
    */
    async addCountry(req, res) {
        // console.log("addCountry function start");
        try {

            if(!req.body.name || !req.body.code || !req.body.isd_code) {
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
                code : req.body.code,
                isd_code : req.body.isd_code,
                is_active: true,
                is_gcc : false,
                _deleted : false,
            };

            let countryData = await models.countrys.create(createObject);

            // console.log("country printed here after creation", countryData, countryData.id);
            let responseObject = {
                id : countryData.id,
                name: countryData.name,
                code: countryData.code,
                is_active: countryData.is_active,
                createdAt: countryData.createdAt
            };

            // console.log("responseObject printed here", responseObject);
            res.json({
                status: constants.success_code,
                message: "successfully created",
                data: responseObject
            });

            return;

        } catch (error) {
            // console.log("create country function error", error);
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

export default new Country();
