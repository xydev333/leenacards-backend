// const AppController = require("./appcontroller");
const mailService = require("./mailerService");
const firebaseService = require("./firebaseController");
const constants = require("../configuration/constants");

const models = require('../models');

class Notification {
    constructor() {
        // super();
    }

    /* Admins functions */

    /*
        ------------------------
        Application functions
    */


    /*
        name: listNotifications
        target: Application
        description: list all notifications
        parameters: null
        response: all notification array
    */
    async listNotifications(req, res) {
        // console.log("listNotifications function start", req.user.id);

        try {
            let notificationData = await models.notifications.findAll({
                include: [{
                    model: models.users,
                    attributes: ['id', 'username', 'email', 'phone'],
                    required: false
                }],
                where: {
                    _deleted : false,
                    is_read : false,
                    user_id : req.user.id
                },
                order: [['createdAt', 'DESC']],
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: notificationData,
            });

            return;

        } catch (error) {
            // console.log("listNotifications function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }

    /*
        name: clearAllNotification
        target: Application
        description: status chnaged to read for all notification
        parameters: null
        response: null
    */
    async clearAllNotification(req, res) {
        // console.log("clearAllNotification function start", req.user.id);

        try {
            let notificationUpdateData = await models.notifications.update({
                is_read : true
            },
            {
                where: {
                    _deleted : false,
                    is_read : false,
                    user_id : req.user.id
                },
            });

            // console.log("!!!!!!!!!!!!!!!notificationUpdateData", notificationUpdateData)

            res.json({
                status: constants.success_code,
                message: "successfully Updated Status",
            });

            return;

        } catch (error) {
            // console.log("clearAllNotification function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;
        }
    }

    /*
        name: sendAndCreateNotification
        target: Application
        description: send firebase push notification and create transaction in notification table
        parameters: userId(string), message(string), type(string)
        response: null
    */
    async sendAndCreateNotification( 
        res, 
        userId, 
        title, 
        message, 
        type, 
        email_template,
        userEmail,
        firebase_token,
        paylodData,
        flags
    ) {
        // console.log("sendAndCreateNotification function start", userId, title, message, type, email_template, userEmail, firebase_token, flags);
        try {
            //create notification Data
            let uniqueId = '_' + Math.random().toString(36).substr(2, 9);
            let creatNotificationData = {
                id : uniqueId,
                user_id : userId,
                notification_type : type,
                title : title,
                message : message,
                is_read : false,
                _deleted : false,
                payload : JSON.stringify(paylodData),
                email_template : email_template
            };
            let notificationCreateData = await models.notifications.create(creatNotificationData);
            // console.log("!!!!!!!!!!!!!!!notificationCreateData", notificationCreateData);

            //send Firebase push notification
            if(flags.isPush){
                if(firebase_token && firebase_token !== null) {
                    let firebaseData = await firebaseService.sendPushNotification(firebase_token, title, message, paylodData);
                    // console.log("!!!!!!!!!!!firebaseData printed here", firebaseData);
                }
            }

            //send Email
            // if(flags.isEmail){
            //     let mailData = await mailService.sendMail(res, userEmail, title, email_template, paylodData);
            //     // console.log("!!!!!!!!!!!!!mailData printed here", mailData);
            // }
      
            return true;

        } catch (error) {
            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!error in sendAndCreateNotification printed here", error);
            // throw error;
            return true;
        }
    }


    /*
        -------------------------
        comman functions
    */

}

module.exports = new Notification();
