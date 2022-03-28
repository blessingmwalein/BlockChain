const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress , toAddress, details, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.details = details;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    calculateHash(){
       return crypto.createHash('sha256').update(this.fromAddress + this.toAddress + JSON.stringify(this.details) + this.timestamp + this.amount).digest('hex');
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You can not sign this transaction');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');

        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this tranaction');
        }
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
    
}

module.exports.Transaction = Transaction;