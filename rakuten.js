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
	var fields = text.split(/ /);

	var walletDefinedByKeys = require('ocore/wallet_defined_by_keys.js');
  var device = require('ocore/device.js');

  const keyword = `&keyword=${text}`
  const getUrl = encodeURI(baseUrl + appId + keyword + sort)

  await axios.get(getUrl).then((result) => {
    console.log("=====================response.Items")
    console.log(result.data.Items[0].Item.itemName)
    result.data.Items.forEach(element => {
      console.log(element.Item.itemName)
      device.sendMessageToDevice(from_address, 'text', element.Item.itemName);
    });
  }).catch((err) => {
    device.sendMessageToDevice(from_address, 'text', "そこに誰もいませんよ");
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
