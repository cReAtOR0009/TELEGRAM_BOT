require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
var web3 = require("web3");
const rpc_url = process.env.RPC_URL;
let _web3 = new web3(new web3.providers.HttpProvider(rpc_url));
const app = express();
let fs = require("fs");
contractAbi = require("./contract.json");
eventDecodeLog = [
  [
    {
      type: "address",
      name: "previousOwner",
      indexed: true,
    },
    {
      type: "address",
      name: "newOwner",
      indexed: true,
    },
  ], //1OwnershipTransferred
  [
    {
      type: "address",
      name: "from",
      indexed: true,
    },
    {
      type: "address",
      name: "to",
      indexed: true,
    },
    {
      type: "uint256",
      name: "value",
    },
  ], //2Transfer
  [
    {
      type: "address",
      name: "from",
      indexed: true,
    },
    {
      type: "address",
      name: "to",
      indexed: true,
    },
    {
      type: "uint256",
      name: "value",
    },
  ], //3Transfer
  [
    {
      type: "address",
      name: "previousOwner",
      indexed: true,
    },
    {
      type: "address",
      name: "newOwner",
      indexed: true,
    },
  ], //4OwnershipTransferred2
  [
    {
      type: "address",
      name: "token0",
      indexed: true,
    },
    {
      type: "address",
      name: "token1",
      indexed: true,
    },
    {
      type: "address",
      name: "pair",
    },
    {
      name: "anonymous",
      type: "uint256",
    },
  ], //5PairCreated
  [
    {
      type: "address",
      name: "owner",
      indexed: true,
    },
    {
      type: "address",
      name: "spender",
      indexed: true,
    },
    {
      type: "uint256",
      name: "value",
    },
  ], //6Approval
  [
    {
      type: "address",
      name: "dst",
      indexed: true,
    },
    {
      type: "uint256",
      name: "wad",
    },
  ], //7Deposit
  [
    {
      type: "address",
      name: "from",
      indexed: true,
    },
    {
      type: "address",
      name: "to",
      indexed: true,
    },
    {
      type: "uint256",
      name: "value",
    },
  ], //8Transfer2
  [
    {
      type: "address",
      name: "src",
      indexed: true,
    },
    {
      type: "address",
      name: "dst",
      indexed: true,
    },
    {
      type: "uint256",
      name: "wad",
    },
  ], //9TransfeTwo
  [
    {
      type: "address",
      name: "from",
      indexed: true,
    },
    {
      type: "address",
      name: "to",
      indexed: true,
    },
    {
      type: "uint256",
      name: "value",
    },
  ], //10Transfer2
  [
    {
      type: "address",
      name: "from",
      indexed: true,
    },
    {
      type: "address",
      name: "to",
      indexed: true,
    },
    {
      type: "uint256",
      name: "value",
    },
  ], //11Transfer2
  [
    {
      type: "uint112",
      name: "reserve0",
    },
    {
      type: "uint112",
      name: "reserve1",
    },
  ], //12Sync
  [
    {
      type: "address",
      name: "sender",
      indexed: true,
    },
    {
      type: "uint256",
      name: "amount0",
    },
    {
      type: "uint256",
      name: "amount1",
    },
  ], //13Mint
  [
    {
      type: "address",
      name: "from",
      indexed: true,
    },
    {
      type: "address",
      name: "to",
      indexed: true,
    },
    {
      type: "uint256",
      name: "value",
    },
  ], //14Transfer
  [
    {
      type: "address",
      name: "previousOwner",
      indexed: true,
    },
    {
      type: "address",
      name: "newOwner",
      indexed: true,
    },
  ], //155OwnershipTransferred
];
const PORT = process.env.PORT || 5000;
// const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");

// Replace with your Telegram bot token and Etherscan API key
const TELEGRAM_BOT_TOKEN = process.env.TOKEN;
const ETHERSCAN_API_KEY = process.env.ETHER_SCAN_API;
const allowedUserId = Number(process.env.ALLOWED_USER_ID);
let lastContractCount = 0;
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Create a new Telegram bot
// const FetchContractBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Listen for the /start command
// FetchContractBot.onText(/\/start (.+)/, (msg, match) => {
//   const chatId = msg.chat.id;
//   const userId = msg.from.id;
//   const Monitor_Address = match[1];
//   console.log(userId);

//   // Check if the command is from the allowed user
//   if (userId === allowedUserId) {
//     FetchContractBot.sendMessage(
//       chatId,
//       "Welcome! You are an allowed user. proceeding to starting bot"
//     );
//     try {
//       setInterval(async () => {
//         start(chatId, Monitor_Address);
//       }, 2000);
//     } catch (error) {
//       console.log(error);
//       process.exit(1);
//     }
//   } else {
//     FetchContractBot.sendMessage(
//       chatId,
//       "Sorry, you are not authorized to use this command."
//     );
//   }
// });

async function getBlock(blockNumber) {
  return await _web3.eth
    .getBlock(blockNumber || "latest", false)
    .catch((error) => {
      throw error;
    });
}

function getContractDeployment(transactions = []) {
  let _transactions = [];
  // console.log("The transaction count is: ", transactions.length);
  for (let index = 0; index < transactions.length; index++) {
    if (transactions[index].to == null) {
      _transactions.push(transactions[index]);
      Object.keys(transactions[index]).forEach((element) => {
        // console.log(element);
      });
      // _transactions[_transactions.length] = transactions[index];
    }
  }
  return _transactions;
}

function getContractDeploymentReceipt(transactionHash) {
  return new Promise((resolve, reject) => {
    _web3.eth
      .getTransactionReceipt(transactionHash)
      .then((receipt) => {
        if (receipt) {
          return resolve(receipt);
        } else {
          reject("Receipt not found");
        }
      })
      .catch(console.error);
  });
}

async function getContractInfo(logs, address) {
  let contract = new _web3.eth.Contract(contractAbi, address);
  let info = {};
  console.log("This is the contract address: ", address);
  let name = await new Promise((resolve, reject) => {
    try {
      console.log("Moving...");
      // console.log(Object.keys(contract.methods));
      contract.methods.name().call((error, _name) => {
        console.log("error: ", error, "name: ", _name);
        console.log("Moving forward");
        if (!error) {
          console.log("This is the token name: ", _name);
          return resolve(_name);
        } else {
          console.log(error);
          return reject(error);
        }
      });
    } catch (error) {
      console.log(error);
      return reject(error);
    }
  });
  info.name = name;
  console.log(info);
  // for (let index = 0; index < logs.length; index++) {
  //   try {
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  return info;
}

async function start(chatId, Monitor_Address) {
  // console.log("Time is the timestamp: ", parseInt(Date.now() / 1000));
  let block = await getBlock("18286309");
  // console.log("Time is the timestamp: ", parseInt(Date.now() / 1000));
  console.log("Transaction count: ", block.transactions.length);
  let transactions = getContractDeployment(block.transactions);

  // transactions.length > 0?transactions.forEach(transaction => {
  // transaction.methods.tokenName().call((error, result) => {
  //   if (!error) {
  //     console.log('Token Name:', result);
  //   } else {
  //     console.error('Error:', error);
  //   }
  // })
  // FetchContractBot.sendMessage(chatId, transaction.undefined.blockHash);
  // }):null;;

  // console.log("That is the transaction",transactions.undefined);
  console.log(transactions.length);
  // console.log("That was the transaction count");
  // console.log("Time is the timestamp: ", parseInt(Date.now() / 1000));
  let receipt = await getContractDeploymentReceipt(transactions[0]);
  await saveToFile(receipt, "1Transactions.json");
  let contractEvents = await getContractInfo(
    receipt.logs,
    receipt.logs[0].address
  );
  await saveToFile(contractEvents, "contractEvents.json");
}

function saveToFile(object, fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      let logStream = fs.createWriteStream(fileName || "Transactions.json", {
        flags: "w",
      });
      logStream.write(JSON.stringify(object));
      logStream.end("\n\n\n\n\n");
      logStream.on("finish", resolve);
    } catch (error) {
      console.log(error);
      console.log(error);
      console.log(error);
      reject();
    }
  });
}
start(3234344, "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD").catch((error) => {
  console.log(error);
  process.exit(1);
});

// Token Name  - directly from contract
// Liquidity Amount (in Eth) inside index 12
// Contract Address directly from transaction
// Liquidity Source
// Buy/Sell Taxes
// Max Buy/ Max Wallet (Percencage)
