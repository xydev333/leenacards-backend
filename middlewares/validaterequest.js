// var jwt = require('jwt-simple');
// import jwt from 'jsonwebtoken';
var jwt = require('jsonwebtoken');
import constants from '../configuration/constants';
import token from '../configuration/secret';
const models = require('../models');

module.exports = function(req, res, next) {

	try {
		// console.log("!!!!!!!!!!!!!!!**************");

		// When performing a cross domain request, you will recieve
		// a preflighted request first. This is to check if our the app
		// is safe. 
		// We skip the token outh for [OPTIONS] requests.
		//if(req.method == 'OPTIONS') next();

		var access_token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['authorization'];
		//matching null if user dont have saved the token in browser in that case it will be string type of null value
		// console.log("access_token" , access_token);

		if (access_token && access_token.split(" ")[1] && access_token.split(" ")[1]!='null') {
			// console.log("!!!!!!!!!validate auth start here");

			access_token = access_token.split(" ")[1];
			let secret = token();

			jwt.verify(access_token, secret , function (err, decoded) {
				if (err) {
					res.json({
						"status": constants.token_expired_code,
						"message": constants.token_expired,
						"error": err
					});
					return;
				}else {
					// console.log("!!!!!!!!!!!!!successfully passed", decoded);
					if(decoded.role == "Admin"){
						models.admins.findOne({
							where : {
								id: decoded.id
							}
						})
						.then(admin => {
							// console.log("name of admin", admin);
							req.admin = admin;
							req.token = access_token;
							next();
						})
						.catch(error=>{
							res.json({
								"status": constants.token_expired_code,
								"message": constants.token_expired,
								"error": error
							});
							return;
						});
					}else{
						models.users.findOne({
							where : {
								id: decoded.id
							}
						})
						.then(user => {
							// console.log("name of user", user);
							req.user = user;
							next();
						})
						.catch(error=>{
							res.json({
								"status": constants.token_expired_code,
								"message": constants.token_expired,
								"error": error
							});
							return;
						});
					}
					
					// User.query()
					// .first()
					// .where({ access_token, deleted: '0', is_active: '1', role: '1' })
					// .whereNotDeleted()
					// .then(response=> {
					// 	if(response instanceof User) {
					// 		req.decoded = decoded;
					// 		next();
					// 	}else {
					// 		res.json({
					// 			"status": constants.token_expired_code,
					// 			"message": constants.token_expired
					// 		});
					// 		return;
					// 	}
					// })
					// .catch(error=>{
					// 	res.json({
					// 		"status": constants.token_expired_code,
					// 		"message": constants.token_expired,
					// 		"error": error
					// 	});
					// 	return;
					// });
				}
			});
		} else {
			res.json({
				"status": constants.unauthorized_code,
				"message": constants.unauthorize_access
			});
			return;
		}
	}catch (err) {
		//res.status(500);
		res.json({
			"status": constants.token_expired_code,
			"message": constants.server_error,
			"error": err
		});
	}
};

