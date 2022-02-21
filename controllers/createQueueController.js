const Queue = require('bull');
var dotenv = require("dotenv");

dotenv.config();
let cronLooptime = process.env.CRON_LOOP_TIME;

class createQueController {
    constructor() {}
  
    async createQueue(quename, data, attemptNumber) {
        try{
            // console.log("!!!!!!!!!!!!quename", quename, data, attemptNumber, process.env.REDIS_PORT, process.env.REDIS_URL, process.env.REDIS_PASS);

            //create instance
            const queue = new Queue(quename, {
                redis: {
                    port: process.env.REDIS_PORT,
                    host: process.env.REDIS_URL,
                    password: process.env.REDIS_PASS
                }
            }); 

            //add queue 
            await queue.add(data, {
                attempts : attemptNumber,
                delay : 5000
            });

            return queue;
        }catch(e){  
            throw e;
        }
    }

    async createCronQueue(quename, data, attemptNumber) {
        try{
            // console.log("!!!!!!!!!!!!quename and cronLooptime", cronLooptime, quename, data);

            //create instance
            const queue = new Queue(quename, {
                redis: {
                    port: process.env.REDIS_PORT,
                    host: process.env.REDIS_URL,
                    password: process.env.REDIS_PASS
                }
            }); 

            await queue.empty();

            //add queue 
            await queue.add(data, {
                attempts : attemptNumber,
                // delay : 5000,
                repeat: {
                    every: 180000,
                }
            });

            // console.log("!!!!!!!!!!!!added", queue);

            return queue;
        }catch(e){  
            throw e;
        }
    }
}
  
module.exports = new createQueController();
  