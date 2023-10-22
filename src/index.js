require("dotenv").config();
const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
var web3 = require("web3");
let _web3 = new web3(new web3.providers.HttpProvider(rpc_url));
const app = express();
let fs = require("fs");
contractAbi = require("./contract.json");
var currentBlockNumber = readLastInput("ScannedBlocks.js");
isStarted = false;
const { parse } = require("path");
lastBlockScanned = currentBlockNumber;
const rpc_url = process.env.RPC_URL;
const TELEGRAM_BOT_TOKEN = process.env.TOKEN;
const allowedAdminId = Number(process.env.ALLOWED_USER_ID);
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
const allowed_Admins = ["5022663995", "562182249"];

// Replace with your Telegram bot token and Etherscan API key
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// Create a new Telegram bot
const FetchContractBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Listen for the /start command
FetchContractBot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  // console.log("chatId", chatId)
  const AdminId = msg.from.id;
  const Monitor_Address = null;
  console.log("AdminId", AdminId);

  // Check if the command is from the allowed user
  if (allowed_Admins.includes(AdminId.toString())) {
    FetchContractBot.sendMessage(
      chatId,
      "Welcome! You are an allowed user. proceeding to starting bot"
    );
    try {
      setInterval(async () => {
        await start(chatId, Monitor_Address);
      }, 500);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  } else {
    console.log("unauthorized");
    // FetchContractBot.sendMessage(
    //   chatId,
    //   "Sorry, you are not authorized to use this command."
    // );
  }
});

async function getBlock(chatId) {
  latestBlock = await _web3.eth
    .getBlock("latest", true)
    .then(async (latestBlock) => {
      // console.log("Inside the then");
      console.log(
        " checking for new block: ",
        parseInt(latestBlock.transactions[0].blockNumber)
      );
      console.log(" former blockNumber: ", currentBlockNumber);
      await currentBlockNumber;
      if (
        parseInt(latestBlock.transactions[0].blockNumber) >
        parseInt(currentBlockNumber)
      ) {
        console.log(
          "New block detected:",
          parseInt(latestBlock.transactions[0].blockNumber)
        );
        console.log("former block: ", currentBlockNumber);

        currentBlockNumber = parseInt(latestBlock.transactions[0].blockNumber);
        await saveToFile(currentBlockNumber, "ScannedBlocks.js");
        // Handle the new block here
      } else {
        console.log(
          "New block: ",
          parseInt(latestBlock.transactions[0].blockNumber),
          " Former block: ",
          parseInt(currentBlockNumber)
        );
        return null;
      }
      return latestBlock;
    })
    .catch((error) => {
      throw error;
    });

  // return new Promise((resolve, reject) => {
  //   setTimeout(resolve(latestBlock), 5000);
  // });
  // console.log(latestBlock, "That was the latest block");
  // await saveToFile(latestBlock, "latestblock.json");
  return latestBlock;
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

async function getContractInfo(address) {
  let contract = new _web3.eth.Contract(contractAbi, address);
  let info = { isRequiredContract: true };
  console.log("This is the contract address: ", address);
  try {
    let [name, sellTax, buyTax] = await Promise.all([
      contract.methods.name().call(),
      contract.methods.sellTax().call(),
      contract.methods.buyTax().call(),
    ]);
    // let [name, _maxTaxSwap, _maxTxAmount] = await Promise.all([
    //   contract.methods.name().call(),
    //   contract.methods._maxTaxSwap().call(),
    //   contract.methods._maxTxAmount().call(),
    // ]);
    delete buyTax["0"];
    delete buyTax["1"];
    delete buyTax["2"];
    delete buyTax["3"];
    delete buyTax["4"];
    delete buyTax["__length__"];
    delete sellTax["0"];
    delete sellTax["1"];
    delete sellTax["2"];
    delete sellTax["3"];
    delete sellTax["4"];
    delete sellTax["__length__"];
    info.ContractAddress = address;
    info.TokenName = name;
    info._maxTaxSwap = sellTax;
    info._maxTxAmount = buyTax;
    console.log(info);
  } catch (error) {
    info.isRequiredContract = false;
  }
  return info;
}

async function start(chatId, Monitor_Address) {
  if (isStarted) {
    return;
  }
  // startBlock++;
  // FetchContractBot.sendMessage(
  //   chatId,`proceeding to scanning Block ${startBlock}` )
  isStarted = true;
  try {
    // console.log("Time is the timestamp: ", parseInt(Date.now() / 1000));
    // let block = await getBlock(); //"18286309");
    // let block = await getBlock("18286309");
    // let block = await waitForNewBlock()
    let block = await getBlock(chatId);
    if (block == null) {
      console.log("WE ARE RETURNING NOW");
      isStarted = false;
      return;
    } else {
      console.log("We are not returning...");
    }
    // let block = await getBlock();
    // console.log("Time is the timestamp: ", parseInt(Date.now() / 1000));
    // console.log("Transaction count: ", block.transactions.length);
    //
    // if (
    //   parseInt(block.transactions[0].blockNumber) ==
    //   parseInt(currentBlockNumber)
    // ) {
    //   lastBlockScanned++;
    // } else {
    //   return;
    // }
    let transactions = getContractDeployment(block.transactions);

    // transactions.length > 0?transactions.forEach(transaction => {
    // transaction.methods.tokenName().call((error, result) => {
    //   if (!error) {
    //     console.log('Token Name:', result);
    //   } else {
    //     console.error('Error:', error);
    //   }
    // })

    // console.log("That is the transaction",transactions.undefined);

    // console.log(transactions.length);

    // console.log("That was the transaction count");
    // console.log("Time is the timestamp: ", parseInt(Date.now() / 1000));
    let contractInfo = {};
    for (let index = 0; index < transactions.length; index++) {
      try {
        console.log("looping through contract: ", index);
        let receipt = await getContractDeploymentReceipt(
          transactions[index].hash
        );
        await saveToFile(receipt, "1Transactions.json");
        contractInfo = await getContractInfo(receipt.logs[0].address);
        contractInfo.liquidity =
          _web3.utils.fromWei(transactions[0].value, "ether") + " Ether";
        contractInfo.from = transactions[0].from;
        contractInfo.hash = transactions[0].hash;
        contractInfo.maxGwei = _web3.utils.fromWei(
          transactions[0].maxFeePerGas,
          "Gwei"
        );
        await saveToFile(contractInfo, "contractInfo.json");
        await saveToFile(transactions[0], "value.json");
        if (contractInfo.isRequiredContract) {
          break;
        }
      } catch (error) {
        console.log(error);
      }
    }
    console.log(contractInfo, "This is the required contract information");
    if (contractInfo.isRequiredContract) {
      FetchContractBot.sendMessage(
        chatId,
        // JSON.stringify(contractInfo, null, 3)
        "Token Name: " +
          contractInfo.TokenName +
          "\n" +
          "Contract Address: " +
          contractInfo.ContractAddress +
          "\n" +
          "Max Gwei: " +
          contractInfo.maxGwei +
          "\n" +
          "Buy Tax: " +
          contractInfo._maxTaxSwap +
          "\n" +
          "Sell Tax: " +
          contractInfo._maxTaxSwap +
          "\n" +
          "Tx Link: " +
          "https://etherscan.io/tx/" +
          contractInfo.hash +
          "\n"
      );
    } else {
      // FetchContractBot.sendMessage(chatId, JSON.stringify(contractInfo));
      // FetchContractBot.sendMessage(chatId, "This is not the required contract");
    }
    console.log("Setting is started to false");
    isStarted = false;
  } catch (error) {
    console.log(error);
    console.log("Setting is started to false becuase of an error");
    isStarted = false;
  }
}

function saveToFile(object, fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      let logStream = fs.createWriteStream(fileName || "Transactions.json", {
        flags: "a",
      });
      logStream.write(JSON.stringify(object));
      logStream.end("\n");
      logStream.on("finish", resolve);
    } catch (error) {
      console.log(error);
      reject();
    }
  });
}

function readLastInput(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, "utf8", async (err, data) => {
      if (err) {
        reject(err);
      } else {
        // Split the contents by newline characters to get an array of lines
        const lines = data.split("\n");
        console.log(lines);
        // Extract the last line (which contains the last input)
        lastInput = lines[lines.length - 1];
        if (lastInput == "" || null) {
          console.log((currentBlockNumber = lines[lines.length - 2]));
          lastInput = currentBlockNumber = lines[lines.length - 2];
        }
        currentBlockNumber = lastInput;
        resolve(parseInt(lastInput));
      }
    });
  });
}

// - Token Name  - directly from contract
// Liquidity Amount (in Eth) inside index 12
// - Contract Address directly from transaction
// Liquidity Source
// - Buy/Sell Taxes
// Max Buy/ Max Wallet (Percencage)
