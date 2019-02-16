/*jslint node: true */
'use strict';
const constants = require('ocore/constants.js');
const conf = require('ocore/conf');
const db = require('ocore/db');
const eventBus = require('ocore/event_bus');
const validationUtils = require('ocore/validation_utils');
const headlessWallet = require('headless-obyte');
const axios = require('axios');
console.log("start")
/**
 * headless wallet is ready
 */

const baseUrl = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?format=json'
const appId = '&applicationId=1010942770825373351'
const sort = '&sort=-reviewCount';


async function handleText(from_address, text, onUnknown){

	text = text.trim();
  var device = require('ocore/device.js');
  const keyword = `&keyword=${text}`
  const getUrl = encodeURI(baseUrl + appId + keyword + sort)
  const address = '0DIKAFI6RKYNODC5WBDYEL33DNHPOGVKS'
  console.log(from_address);

  await axios.get(getUrl).then((result) => {
    result.data.Items.forEach(element => {
      var arrPayments = [{
        address: from_address,
        amount: 1,
        asset: 'base'
      }];

      var objPaymentRequest = {
        payments: arrPayments,
      };
      var paymentJson = JSON.stringify(objPaymentRequest);
      var paymentJsonBase64 = Buffer(paymentJson).toString('base64');
      var paymentRequestCode = 'payment:' + paymentJsonBase64;
      var paymentRequestText = '[your share of payment to the contract](' + paymentRequestCode + ')';
      device.sendMessageToDevice(from_address, 'text', element.Item.itemName);
      device.sendMessageToDevice(from_address, 'text', paymentRequestText);
      // device.sendMessageToDevice(from_address, 'text', "Price: " + element.Item.itemPrice);
    });
  }).catch((err) => {
    device.sendMessageToDevice(from_address, 'text', "ERROR");
  });
}

eventBus.once('headless_wallet_ready', () => {
	headlessWallet.setupChatEventHandlers();

	/**
	 * user pairs his device with the bot
	 */
	eventBus.on('paired', (from_address, pairing_secret) => {
		// send a geeting message
		const device = require('ocore/device.js');
		device.sendMessageToDevice(from_address, 'text', "Welcome to my new shiny bot!");
	});

	/**
	 * user sends message to the bot
	 */
	eventBus.on('text', (from_address, text) => {
		// analyze the text and respond
		handleText(from_address, text);
	});

});


/**
 * user pays to the bot
 */
eventBus.on('new_my_transactions', (arrUnits) => {
	// handle new unconfirmed payments
	// and notify user

//	const device = require('ocore/device.js');
//	device.sendMessageToDevice(device_address_determined_by_analyzing_the_payment, 'text', "Received your payment");
});

/**
 * payment is confirmed
 */
eventBus.on('my_transactions_became_stable', (arrUnits) => {
	// handle payments becoming confirmed
	// and notify user

//	const device = require('ocore/device.js');
//	device.sendMessageToDevice(device_address_determined_by_analyzing_the_payment, 'text', "Your payment is confirmed");
});



process.on('unhandledRejection', up => { throw up; });
