const constants = require("ocore/constants.js");
const conf = require("ocore/conf");
const db = require("ocore/db");
const eventBus = require("ocore/event_bus");
const validationUtils = require("ocore/validation_utils");
const headlessWallet = require("headless-obyte");
const request = require('request');

eventBus.once('headless_wallet_ready', () => {
      headlessWallet.setupChatEventHandlers();

  	eventBus.on('paired', (from_address, pairing_secret) => {
  	  // send a geeting message
  	  const device = require('ocore/device.js');
  	  device.sendMessageToDevice(from_address, 'text', "Welcome to my new shiny bot!");
  	});



});

process.on('unhandledRejection', up => {
  throw up;
});
