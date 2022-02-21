import constants from "../configuration/constants";

class MailerService {
    constructor() {}
  
    sendMail(res, toName, subject, templateName, paylodData) {
        try{
            console.log("!!!!!!!!initial data sendMail", toName, subject, templateName, paylodData);
            return new Promise((resolve, reject) => {
                console.log(templateName);
                res.mailer.send(templateName, {
                    to: toName, //This can be a comma delimited string just like a normal email to field. 
                    subject: subject,
                    payload: paylodData, // All additional properties are also passed to the template as local variables. 
                }, async function (err) {
                    if (err) {
                        reject(err);
                    }
                    resolve(true);
                });
            });
        } catch (e) {
            throw e;
        }
    }
}
  
module.exports = new MailerService();

  