"use strict";
const constants = require("ocore/constants.js");
const conf = require("ocore/conf");
const db = require("ocore/db");
const eventBus = require("ocore/event_bus");
const validationUtils = require("ocore/validation_utils");
const headlessWallet = require("headless-obyte");

let assocDeviceAddressToPeerAddress = {};
let assocDeviceAddressToMyAddress = {};
let assocMyAddressToDeviceAddress = {};

eventBus.on('paired',(from_address,pairing_secret)=>{
  const device = require('ocore/device.js');
  device.sendMessageToDevice(from_address,'text',"Please Sende Me your address");

});

eventBus.on('text',(from_address,text)=>{
  text = text.trim();
  const device = require("ocore/device.js");

  if(validationUtils.isValidAddress(text)){
    assocDeviceAddressToPeerAddress[from_address] = text;
    device.sendMessageToDevice(from_address,'text','Saved your wallet address');
    headlessWallet.issueNextMainAddress((address) => {
      assocMyAddressToDeviceAddress[address] = from_address;
      assocDeviceAddressToMyAddress[from_address] = address;
      device.sendMessageToDevice(from_address, 'text', '[barance](byteball:' + address + '?amount=10)');
    })
  }else if(assocDeviceAddressToMyAddress[from_address]){
    device.sendMessageToDevice(from_address, 'text', '[barance](byteball:' + assocDeviceAddressToMyAddress[from_address] + '?amount=10)');
  }else{
    device.sendMessageToDevice(from_address, 'text', 'Saved your wallet address');
  }
})

eventBus.on('new_my_transactions', (arrUnits) => {
  const device = require("ocore/device.js");
  db.query("SELECT address, amount, asset FROM outputs WHERE unit IN (?)", [arrUnits], rows => {
    rows.forEach(row => {
      let deviceAddress = assocMyAddressToDeviceAddress[row.address];
      if(row.asset === null && deviceAddress){
        device.sendMessageToDevice(deviceAddress,'text','I received your payment: ' + row.amount + ' bytes');
        return true;
      }
    });
  })
})

eventBus.on('my_transactions_became_stable',(arrUnits)=>{
  const device = require("ocore/device.js");
  db.query("SELECT address, amount, asset FROM outputs WHERE unit IN (?)", [arrUnits], rows => {
    rows.forEach(row => {
      let deviceAddress = assocMyAddressToDeviceAddress[row.address];
      if(row.asset === null && deviceAddress){
        headlessWallet.sendAllBytesFromAddress(row.address,assocDeviceAddressToPeerAddress[deviceAddress],deviceAddress,(err,unit)=>{
          if(err) device,sendMessageToDevice(deviceAddress,'text', 'Oops, theres been a mistake. : ' + err);

          device.sendMessageToDevice(deviceAddress, 'text', 'I sent back your payment! Unit: ' + unit);
          return true;
        })
      }
    });
  })
})

process.on("unhandledRejection", up => {
  throw up;
});
