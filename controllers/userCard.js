import AppController from "./appcontroller";
import constants from "../configuration/constants";
import { encrypt, decrypt } from "./encryption";
import * as la from "lodash";
const models = require('../models');

class UserCard extends AppController {
  constructor() {
    super();
  }

  /* Admins functions */

  /*
    ------------------------
    Application functions
  */



    /*
        name: listAllUserCard
        target: application
        description: list all user card
        parameters: null
        response: all user card object
    */
    async listAllUserCard(req, res) {
        // console.log("listAllUserCard function start", req.user.id);
        try {
            let result = await models.user_cards.findAndCountAll({
                include: [
                    {
                        model: models.users,
                        attributes: ['id', 'first_name', 'email', 'phone', 'username'],
                        required: false
                    },
                    {
                        model: models.cards,
                        attributes: ['id', 'name', 'color', 'image', 'icon', 'description', 'amount', 'discount_amount'],
                        required: false
                    }
                ],
                where: {
                    _deleted : false,
                    user_id : req.user.id
                },
                order: [['createdAt', 'DESC']],
                offset: parseInt(req.params.skip),
                limit: parseInt(req.params.limit)
            });

            let responseArray = [];

            la.map(result.rows, (data, index) => {
                let dummy = data;
                dummy.redeem_code = decrypt(data.redeem_code);
                responseArray.push(dummy);
            });

            res.json({
                status: constants.success_code,
                message: "successfully listed",
                data: responseArray,
                total: result.count
            });
            
        } catch (error) {
            // console.log("listAllUserCard function error", error);
            res.json({
                status: constants.server_error_code,
                message: constants.server_error,
                errors: error
            });
            return;

        }
    }

  /*
    -------------------------
    comman functions
  */

}

export default new UserCard();
