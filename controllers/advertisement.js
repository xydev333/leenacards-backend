import validator from "validator";
import AWS from "aws-sdk";
import raw from "objection";
import AppController from "./appcontroller";
import constants from "../configuration/constants";
import bcrypt from 'bcryptjs';
import token from '../configuration/secret';
import * as la from "lodash";
var jwt = require('jsonwebtoken');
var fs = require('fs');
const UPLOAD_DIR = "./public/advertise/";
const models = require('../models');

class Advertisement extends AppController {
    constructor() {
        super();
    }

    /* Admins functions */

    /*
        name: listAdvertisement
        target: admin panel
        description: list all advertisements
        parameters: null
        response: all advertisements array
    */
    async listAdvertisement(req, res) {
        // console.log("listAdvertisement function start", req.params);

        try {
            models.advertisements.findAndCountAll({
                where: {
                    _deleted : false
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            }).then(result => {
                // console.log("result printed here", result);
                res.json({
                    status: constants.success_code,
                    message: "successfully listed",
                    data: result.rows,
                    total: result.count
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
            // console.log("listAdvertisement function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }


    /*
        name: addAdvertisement
        target: admin panel
        description: addAdvertisement
        parameters: null
        response: addAdvertisement object
    */
    async addAdvertisement(req, res) {
        // console.log("addAdvertisement function start");
        try {

            if(!req.body.imageArray) {
                res.json({
                    status: constants.server_error_code,
                    message: "Please provide imageArray"
                });
                return;
            }

            let deleteAdvertiseData = await  models.advertisements.findAndCountAll({
                where: {
                    _deleted : false
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            // console.log("!!!!!!!!pre data of loop", req.body.imageArray, deleteAdvertiseData.rows);

            if(deleteAdvertiseData.rows.length > 0){
                for(let data of deleteAdvertiseData.rows) {
                    if(!req.body.imageArray.includes(data.file_name)) {
                        let filePath = UPLOAD_DIR + data.file_name;
                        fs.unlinkSync(filePath);
                    }
                }   
            }

            await models.advertisements.destroy({
                where: {},
                truncate: true
            });

            for(let subData of req.body.imageArray) {
                // console.log("!!!!!!!!subData", subData);

                var uniqueId = '_' + Math.random().toString(36).substr(2, 9);
                let createObject = {
                    id: uniqueId,
                    file_name : subData,
                    is_active: true,
                    _deleted : false
                };
            
                let createData = await models.advertisements.create(createObject);
            }

            models.advertisements.findAndCountAll({
                where: {
                    _deleted : false
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            }).then(result => {
                // console.log("result printed here", result);
                res.json({
                    status: constants.success_code,
                    message: "successfully listed",
                    data: result.rows,
                    total: result.count
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
            // console.log("addAdvertisement function error", error);
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

export default new Advertisement();
