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
        name: addBanner
        target: admin panel
        description: Add banner
        parameters: image (String), enabled(boolean), card(string)
        response: banner object
    */
    async addBanner(req, res) {
        try {

            if(!req.body.image) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            var uniqueId = '_' + Math.random().toString(36).substr(2, 9);

            // console.log(req.body);
            let createObject = {
                id: uniqueId,
                active: req.body.enabled,
                image: req.body.image,
                card_id: req.body.card,
            };

            await models.banners.create(createObject);
            // console.log("!!!!!!!job added for addCard", addQueueData); 

            // console.log("responseObject printed here", responseObject);
            res.json({
                status: constants.success_code,
                message: "successfully created",
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
        name: updateBanner
        target: admin panel
        description: Update banner
        parameters: bannerObj(object)
        response: banner object array
    */
    async updateBanner(req, res) {
        try {

            if(!req.body.id) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide all Data",
                });

                return;
            }

            await models.banners.update(req.body, {
                where: {
                    id: req.body.id
                }
            });
            // console.log("responseObject printed here", responseObject);
            let result = await models.banners.findAll({
                include: [
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'sku'],
                    },
                ]
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: result,
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
        name: deleteBanner
        target: admin panel
        description: Delete banner
        parameters: bannerId (string)
        response: banner object array
    */
   async deleteBanner(req, res) {
    try {

        if(req.body.bannerId == "") {
            res.json({
                status: constants.server_error_code,
                message: "Please provide all Data",
            });

            return;
        }

        await models.banners.destroy({
            where: {
                id: req.body.bannerId
            }
        });

        // console.log("responseObject printed here", responseObject);
        let result = await models.banners.findAll({
            include: [
                {
                    model: models.cards,
                    attributes: ['id', 'name', 'sku'],
                },
            ]
        });

        res.json({
            status: constants.success_code,
            message: "successfully listed",
            data: result,
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
        name: listbanners
        target: admin panel
        description: List Banners
        parameters: 
        response: banner object array
    */
    async listBanners(req, res) {
        // console.log("listCard function start", req.params);
        try {
            let result = await models.banners.findAll({
                include: [
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'sku'],
                    },
                ]
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: result,
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
        ------------------------
        Application functions
    */



    /*
        -------------------------
        comman functions
    */

}

export default new Card();
