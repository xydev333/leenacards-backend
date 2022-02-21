var FCM = require('fcm-node');
const serverKey = process.env.SERVERKRY; 
const collpaseKey = process.env.COLLPASE_KEY;
var fcm = new FCM(serverKey);

class FirebaseController {
    constructor() {}
  
    sendPushNotification(firebaseId, title, messageText, paylodData) {
        try{
            // console.log("!!!!!!!!initial data sendPushNotification", firebaseId, paylodData);
            return new Promise((resolve, reject) => {
                var message = { 
                    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                    to: firebaseId, 
                    collapse_key: collpaseKey,
                    
                    notification: {
                        title: title, 
                        body: messageText 
                    },
                    
                    data: paylodData
                };

                fcm.send(message, function(err, response){
                    if (err) {
                        // console.log("Something has gone wrong!", err);
                        reject(err);
                    } else {
                        // console.log("Successfully sent with response: ", response);
                        resolve(response);
                    }
                });
            });
        }catch(e){  
            throw e;
        }
    }
}
  
module.exports = new FirebaseController();
  