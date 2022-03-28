const { BlockChain } = require('./BlockChain');
const { Transaction } = require('./Transaction');
const { KeyGenerator } = require('./KeyGenerator');


const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const keyObj = new KeyGenerator();
// Your private key goes here
const myKey = ec.keyFromPrivate(keyObj.privateKey);


// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex');

console.log(myWalletAddress);

// Create new instance of Blockchain class
const savjeeCoin = new BlockChain();

// Mine first block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create a transaction & sign it with your key
const tx1 = new Transaction(myWalletAddress, 'address2',{name:'Tatenda'}, 100);
tx1.signTransaction(myKey);
savjeeCoin.addTransaction(tx1);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx2 = new Transaction(myWalletAddress, 'address1',{name:'Blessing'}, 50);
tx2.signTransaction(myKey);
savjeeCoin.addTransaction(tx2);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

console.log();
console.log(`Balance of xavier is ${savjeeCoin.getBalanceOfAddress(myWalletAddress)}`);

// Uncomment this line if you want to test tampering with the chain
// savjeeCoin.chain[1].transactions[0].amount = 10;

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');
