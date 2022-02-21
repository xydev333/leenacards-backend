const models = require('../../models');
const la = require("lodash");
const createQueController = require("../createQueueController");
const moment = require("moment");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

class CheckReservedCard {
    constructor() {}
  
    async addQueue(res, quename, data) {
        try{
            let queData = await createQueController.createCronQueue(quename, data, 1);
      
            //process queue
            queData.process(async (job, done) => {
                try {
                    const data = job.data;
                    job.progress(0);

                    await new Promise(async (resolve, reject) => {
                        try{
                            let cardInventoryData = await models.card_inventorys.findAndCountAll({
                                where: {
                                    [Op.and] : [
                                        {
                                            _deleted: false
                                        }, 
                                        {
                                            is_paid : false
                                        },
                                        {
                                            user_id : {
                                                [Op.ne] : null
                                            }
                                        },
                                        {
                                            transaction_id : {
                                                [Op.ne] : null
                                            }
                                        },
                                        {
                                            reserved_on : {
                                                [Op.ne] : null
                                            }
                                        }
                                    ]
                                }
                            });
                            // // console.log("!!!!!!!!!!!!cardInventoryData", cardInventoryData);

                            for (let subData of cardInventoryData.rows) {
                                let isPaid = subData.is_paid;
                                let userId = subData.user_id;
                                let cardId = subData.card_id;
                                let transactionId = subData.transaction_id;
                                let reservedOn = subData.reserved_on;

                                // console.log("!!!!!!!!!!!!subData", subData.id);

                                if(!isPaid && (userId !== null) && (transactionId !== null) && (reservedOn !== null)) {
                                    // console.log("!!!!!!!!!!!!!!Warining check");
                                    // console.log("!!!!!!!!!!reservedOn", reservedOn);
                                    let todayTime = moment();
                                    let minutes =  moment.duration(todayTime.diff(moment(reservedOn))).asMinutes();
                                    // console.log("!!!!!!!!!!!differenceMinute", minutes);

                                    if(minutes > 5) {
                                        //delete resrved card
                                        let editCardInventoryObject = {
                                            reserved_on : null,
                                            is_paid : false,
                                            user_id : null,
                                            transaction_id : null,
                                            transaction_type : null
                                        };

                                        let updateInventory = await models.card_inventorys.update(editCardInventoryObject,{
                                            where: {
                                                id : subData.id
                                            },
                                        });
                                        // console.log("!!!!!!!!!!!!updateInventory", updateInventory);

                                        //update card available_count and sold_count
                                        let cardData = await models.cards.findOne({
                                            where: {
                                                _deleted : false,
                                                id : cardId
                                            },
                                        });
                                        let updatedAvailableCount = cardData.available_count + 1;
                                        let updateSoldCount = cardData.sold_count - 1;
                                        let editCardData = {
                                            available_count : updatedAvailableCount,
                                            sold_count : updateSoldCount
                                        };
                                        let updateCardWholeData = await models.cards.update(editCardData,{
                                            where : {
                                                id : cardId
                                            }
                                        });
                                        // console.log("!!!!!!!!!!!!!!!updateCardWholeData", updateCardWholeData); 


                                        //cancel Transaction
                                        let editTransactionObject = {
                                            status: "CANCELED"
                                        };
                                        let updateTransactionData = await models.user_transactions.update(editTransactionObject,{
                                            where : {
                                              id : transactionId
                                            }
                                        });
                                        // console.log("!!!!!!!!!!!!updateTransactionData", updateTransactionData);
                                    }
                                }
                            }

                            // console.log("!!!!!!!!!!!job completed");
                            resolve();
                        }catch(e){
                            // console.log("!!!!!!!!!!!error in process", e);
                            reject(e);
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
            // console.log("!!!!!!!!!!error ", e);
        }
    }
}
  
module.exports = new CheckReservedCard();
  