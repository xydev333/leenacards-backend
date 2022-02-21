var express = require("express");
var router = express.Router();
var validate = require("express-validation");
import user from "../controllers/user.js";
import admin from "../controllers/admin.js";
import comman from "../controllers/comman.js";
import notification from "../controllers/notification.js";
import country from "../controllers/country.js";
import category from "../controllers/category.js";
import type from "../controllers/type.js";
import card from "../controllers/card.js";
import banner from "../controllers/banner.js";
import home from "../controllers/home.js";
import userCard from "../controllers/userCard.js";
import cardInv from "../controllers/cardInventory.js";
import userTransaction from "../controllers/user_transaction.js";
import advertisement from "../controllers/advertisement.js";


// import knetController from "./controllers/knetController";

const fs = require('fs');

/* auth routes for admin ********************************************************************************/
router.get("/all-kpis", comman.listAllKpis);
//comman
router.get("/v1/auth/all-kpis", comman.listAllKpis);
router.post("/v1/auth/send-custom-message-to-all-user", comman.sendCustomMessageToAllUer);
//Advertisement table
router.post("/v1/auth/create-advertisement/:skip/:limit", advertisement.addAdvertisement);
router.get("/v1/auth/list-advertisement/:skip/:limit", advertisement.listAdvertisement);
//admin table
router.post("/v1/auth/edit-admin-support", admin.editSupportDetails);
router.post("/v1/auth/changePassword", admin.changeAdminPassword);
router.post("/v1/auth/changeProfileImage", admin.changeAdminProfile);

//users table
router.get("/v1/auth/list-user/:skip/:limit", user.listUsers);
router.post("/v1/auth/edit-admin-user", user.editAdminUser);
router.post("/v1/auth/delete-user/:userId/:skip/:limit", user.deleteUser);
router.post("/v1/auth/change-user-status", user.changeStatus);
router.post("/v1/auth/filter-user/:skip/:limit", user.filterUser);
//country table
router.get("/v1/auth/list-country/:skip/:limit", country.listCountry);
router.post("/v1/auth/edit-country", country.editCountry);
router.post("/v1/auth/add-country", country.addCountry);
router.post("/v1/auth/delete-country/:countryId/:skip/:limit", country.deleteCountry);
router.post("/v1/auth/change-country-status", country.changeStatus);
router.post("/v1/auth/change-country-gcc-status", country.changeGccStatus);
router.post("/v1/auth/filter-country/:skip/:limit", country.filterCountry);
//category table
router.get("/v1/auth/list-category/:skip/:limit", category.listCategory);
router.post("/v1/auth/edit-category", category.editCategory);
router.post("/v1/auth/add-category", category.addCategory);
router.post("/v1/auth/delete-category/:categoryId/:skip/:limit", category.deleteCategory);
router.post("/v1/auth/change-category-status", category.changeStatus);
router.post("/v1/auth/filter-category/:skip/:limit", category.filterCategory);
//type table
router.get("/v1/auth/list-type/:skip/:limit", type.listType);
router.post("/v1/auth/edit-type", type.editType);
router.post("/v1/auth/add-type", type.addType);
router.post("/v1/auth/delete-type/:typeId/:skip/:limit", type.deleteType);
router.post("/v1/auth/change-type-status", type.changeStatus);
router.post("/v1/auth/filter-type/:skip/:limit", type.filterType);
//card table
router.get("/v1/auth/list-card/:skip/:limit", card.listCard);
router.post("/v1/auth/edit-card", card.editCard);
router.post("/v1/auth/add-card", card.addCard);
router.post("/v1/auth/delete-card/:cardId/:skip/:limit", card.deleteCard);
router.post("/v1/auth/change-card-status", card.changeStatus);
router.post("/v1/auth/change-card-feature-status", card.changeFeatureStatus);
router.post("/v1/auth/filter-card/:skip/:limit", card.filterCard);
//banner table
router.get("/v1/auth/list-banners", banner.listBanners);
router.post("/v1/auth/add-banner", banner.addBanner);
router.post("/v1/auth/delete-banner", banner.deleteBanner);
router.post("/v1/auth/update-banner", banner.updateBanner);
//cardInventory table
router.post("/v1/auth/upload-card-redeem", cardInv.addDataFromExcel);
router.get("/v1/auth/list-card-redeem/:skip/:limit", cardInv.listCardInventory);
router.get("/v1/auth/list-card-redeem-using-cardid/:cardId/:skip/:limit", cardInv.listCardInventoryFromCardId);
router.get("/v1/auth/list-card-redeem-using-transactionId/:transactionId", cardInv.listCardInventoryFromTransactionId);
router.post("/v1/auth/edit-card-inventory", cardInv.editCardInventory);
router.post("/v1/auth/delete-card-inventory/:inventoryId/:cardId/:skip/:limit", cardInv.deleteCardInventory);

//admin table
router.post("/v1/auth/change-admin-status", admin.changeStatus);


/* unAuth routes admin ******************************************************************************* */
//admin table
router.post("/v1/create-admin", admin.registerAdmin);
router.post("/v1/admin-login", admin.adminLogin);


/* auth routes for application ******************************************************************************* */
//users table
router.post("/v1/auth/edit-user", user.editUser);
router.get("/v1/auth/get-user-detail", user.getUserDetail);
//notification table
router.get("/v1/auth/get-notification-list", notification.listNotifications);
router.get("/v1/auth/clear-notification-list", notification.clearAllNotification);
//user transaction table
router.post("/v1/auth/buy-card-reserved-fatoorah", userTransaction.buyCardReservedFatoorah);
router.post("/v1/auth/buy-card-fatoorah", userTransaction.buyCardFatoorah);
router.post("/v1/auth/buy-card-wallet", userTransaction.buyCardWallet);
router.post("/v1/auth/buy-card-reserved-knet", userTransaction.buyCardReservedKnet);
router.post("/v1/auth/buy-card-knet", userTransaction.buyCardKnet);
router.post("/v1/auth/add-amount-fatoorah", userTransaction.addAmountWalletUsingFatoorah);
router.post("/v1/auth/add-amount-knet", userTransaction.addAmountWalletUsingKnet);
router.post("/v1/auth/cancel-reservation", userTransaction.cancelReservation);
//user card table
router.get("/v1/auth/list-user-card/:skip/:limit", userCard.listAllUserCard);
//user wallet
router.get("/v1/auth/list-user-transactions-csv/:startDate/:endDate", userTransaction.listAllTransactionForCsv);
router.get("/v1/auth/list-user-wallet-transactions-csv/:startDate/:endDate", userTransaction.listAllWalletTransactionForCsv);
router.get("/v1/list-user-transactions-csv/:startDate/:endDate", userTransaction.listAllTransactionForCsv);
router.post("/v1/auth/list-user-transactions/:skip/:limit", userTransaction.listAllTransaction);
router.post("/v1/auth/list-user-wallet-transactions/:skip/:limit", userTransaction.listAllWalletTransaction);
router.post("/v1/auth/list-user-transactions-filter/:skip/:limit", userTransaction.listAllTransactionUsingFilter);
router.post("/v1/auth/list-user-wallet-transactions-filter/:skip/:limit", userTransaction.listAllWalletTransactionUsingFilter);


/* unAuth routes application ******************************************************************************* */
//users table
router.post("/v1/create-user", user.registerUser);
router.post("/v1/login", user.login);
router.post("/v1/reset-password-send-otp", user.resetPassWordSendOtp);
router.post("/v1/check-otp-user-password", user.checkOtpForPassword);
router.post("/v1/change-user-password", user.changePassword);
router.post("/v1/get-user-detail-using-phone", user.getUserDetailUsingPhone);
//home screen
router.get("/v1/list-all-home-data", home.listAllData);
router.get("/v1/list-all-home-data/:userId", home.listAllDataCheckUserActivation);

//country table
router.get("/v1/list-country/:skip/:limit", country.listCountry);
//type table
router.post("/v1/list-type-category/:skip/:limit", type.listTypeFromCategory);
router.post("/v1/list-type-country/:skip/:limit", type.listTypeFromCountry);
router.post("/v1/list-type-category-withSubData/:skip/:limit", type.listTypeFromCategorySubData);
router.post("/v1/list-type-category-country-withSubData/:skip/:limit", type.listTypeFromCategoryAndCountrySubData);
//card table
router.post("/v1/list-card-type", card.listCardFromType);


/* render images for category */
router.get('/category/images/:name', (req, res) => {
    const fileName = req.params.name;
    // console.log("fileName printed here", fileName);
    try {
        let file = fs.readFileSync(`./public/category/${fileName}`);
        // res.writeHead(200, { 'Content-Type': 'image/jpg' });
        res.end(file, 'binary');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/* render images for type */
router.get('/type/images/:name', (req, res) => {
    const fileName = req.params.name;
    // console.log("fileName printed here", fileName);
    try {
        let file = fs.readFileSync(`./public/type/${fileName}`);
        // res.writeHead(200, { 'Content-Type': 'image/jpg' });
        res.end(file, 'binary');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/* render images for card */
router.get('/card/images/:name', (req, res) => {
    const fileName = req.params.name;
    // console.log("fileName printed here", fileName);
    try {
        let file = fs.readFileSync(`./public/card/${fileName}`);
        // res.writeHead(200, { 'Content-Type': 'image/jpg' });
        res.end(file, 'binary');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

/* render images for banner */
router.get('/banner/images/:name', (req, res) => {
    const fileName = req.params.name;
    // console.log("fileName printed here", fileName);
    try {
        let file = fs.readFileSync(`./public/banner/${fileName}`);
        // res.writeHead(200, { 'Content-Type': 'image/jpg' });
        res.end(file, 'binary');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.get('/advertise/images/:name', (req, res) => {
    const fileName = req.params.name;
    // console.log("fileName printed here", fileName);
    try {
        let file = fs.readFileSync(`./public/advertise/${fileName}`);
        // res.writeHead(200, { 'Content-Type': 'image/jpg' });
        res.end(file, 'binary');
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;
