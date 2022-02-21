import createQueController from "../createQueueController";
import * as la from "lodash";
import NotificationController from "../notification";
const models = require('../../models');

class sendCustomMessage {
    constructor() {}
  
    async addQueue(res, quename, data) {
        try{
            let queData = await createQueController.createQueue(quename, data, 1);
      
            //process queue
            queData.process(async (job, done) => {
                try {
                    const data = job.data;
                    job.progress(0);

                    await new Promise(async (resolve, reject) => {
                        try{
                            // console.log("!!!!!!!!!data in process printed here", data);
                            let userData = await models.users.findAndCountAll({
                                where: {
                                  _deleted : false
                                }
                            });

                            let notiMessage = `${data.messageText}`;

                            //send notification to all user
                            for (let subData of userData.rows) {
                                //subData is user object
                                if(subData && subData.firebase_token && subData.firebase_token !== null){
                                    //send Push notification
                                    let notificationData = await NotificationController.sendAndCreateNotification(
                                        res, 
                                        subData.id, 
                                        data.titleText,
                                        notiMessage,
                                        "GENERAL",
                                        "",
                                        subData.email,
                                        subData.firebase_token,
                                        {
                                            messageText : data.messageText,
                                            notification_type : data.notification_type,
                                            click_action : data.click_action
                                        },
                                        {
                                            isEmail : false,
                                            isPush : true
                                        }
                                      );
                                      // console.log("*******notification sent to", subData.id);
                                }
                            }
                            
                            // console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!job comppleted!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                            resolve();
                        }catch(e){
                            // console.log("!!!!!!!!!!!!!!!!!error in sendpush notification in senCustomMessages", e);
                            // reject(e);
                        }
                    });

                    done();
                }
                catch (ex) {
                    done(new Error(ex));
                    // job.moveToFailed({
                    //     message : ex
                    // });
                }
            });

            return true;
        }catch(e){  
            throw e;
        }
    }
}
  
export default new sendCustomMessage();
  