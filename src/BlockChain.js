const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const { Block } = require('./Block');
const { Transaction } = require('./Transaction');


class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 0;
        this.pendingTransactions = [];
        this.miningReward = 100
    }

    createGenesisBlock() {
        return new Block(Date.parse('2022-01-01'), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress) {
        console.log('mining start mined!');

        const rewardTx = new Transaction(null, miningRewardAddress, {}, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        const block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        console.log(block.hash);

        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transaction must include from and to address');
        }

        if (!transaction.isValid()) {
            throw new Error('Cannot add invalid transaction to chain');
        }

        if (!transaction.details) {
            throw new Error('Transaction should have details')
        }

        if (transaction.amount <= 0) {
            throw new Error('Transaction amount should be higher than 0');
        }

        const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);

        console.log('wallet balance', walletBalance);

        if (walletBalance < transaction.amount) {
            throw new Error('Not enough balance');
        }

        const pendingTxForWallet = this.pendingTransactions
            .filter(tx => tx.fromAddress === transaction.fromAddress);

        if (pendingTxForWallet.length > 0) {
            const totalPendingAmount = pendingTxForWallet
                .map(tx => tx.amount)
                .reduce((prev, curr) => prev + curr);

            const totalAmount = totalPendingAmount + transaction.amount;
            if (totalAmount > walletBalance) {
                throw new Error('Pending transactions for this wallet is higher than its balance.');
            }
        }


        this.pendingTransactions.push(transaction);
        console.log('transaction added: %s', transaction);
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                console.log('transaction racho', trans);
                console.log('amount', trans.amount);
                if (trans.fromAddress === address) {
                    balance -= parseFloat(trans.amount);
                }

                if (trans.toAddress === address) {
                    balance += parseFloat(trans.amount);
                }
            }
        }

        console.log('getBalanceOfAdrees: %s', balance);
        return balance;
    }

    getAllTransactionsForWallet(address) {
        const txs = [];

        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.fromAddress === address || tx.toAddress === address) {
                    txs.push(tx);
                }
            }
        }

        console.log('get transactions for wallet count: %s', txs.length);
        return txs;
    }
    isChainValid() {
        const realGenesis = JSON.stringify(this.createGenesisBlock());

        if (realGenesis !== JSON.stringify(this.chain[0])) {

            return false;
        }
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (previousBlock.hash !== currentBlock.previousHash) {

                return false;
            }

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }
        }

        return true;
    }
}

module.exports.BlockChain = BlockChain