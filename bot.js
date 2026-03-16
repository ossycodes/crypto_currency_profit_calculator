const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Bot token from environment variable
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
    process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// Store user data (in production, use a database)
const userData = {};

// Default NGN rate
const DEFAULT_NGN_RATE = 1380.0;

// Conversation states
const STATES = {
    IDLE: 'IDLE',
    AWAITING_COIN: 'AWAITING_COIN',
    AWAITING_AMOUNT: 'AWAITING_AMOUNT',
    AWAITING_BUY_PRICE: 'AWAITING_BUY_PRICE',
    AWAITING_CURRENT_PRICE: 'AWAITING_CURRENT_PRICE',
    AWAITING_WITHDRAW_COIN: 'AWAITING_WITHDRAW_COIN',
    AWAITING_WITHDRAW_AMOUNT: 'AWAITING_WITHDRAW_AMOUNT',
    AWAITING_NGN_RATE: 'AWAITING_NGN_RATE',
    AWAITING_UPDATE_COIN: 'AWAITING_UPDATE_COIN',
    AWAITING_UPDATE_PRICE: 'AWAITING_UPDATE_PRICE',
};

// Initialize user data
function getUser(chatId) {
    if (!userData[chatId]) {
        userData[chatId] = {
            portfolio: {},
            ngnRate: DEFAULT_NGN_RATE,
            state: STATES.IDLE,
            temp: {},
        };
    }
    return userData[chatId];
}

// Format number with commas
function formatNum(num, decimals = 2) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

// ========== COMMAND HANDLERS ==========

// /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);
    
    const welcome = `
🚀 *Ossycodes Crypto Profit Calculator Bot*

Track your portfolio, calculate profits, and know exactly how much to sell! created by Emmanuel (ossycodes)

*Commands:*
/add - Add a coin to your portfolio
/portfolio - View your portfolio & profits
/update - Update a coin's current price
/withdraw - Calculate how much to sell
/setrate - Set USD to NGN rate
/clear - Clear your portfolio
/help - Show this message

*Current NGN Rate:* ₦${formatNum(user.ngnRate)} per $1

Let's start! Use /add to add your first coin.
`;
    
    bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
});

// /help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);

    const welcome = `
🚀 *Ossycodes Crypto Profit Calculator Bot*

Track your portfolio, calculate profits, and know exactly how much to sell! created by Emmanuel (ossycodes)

*Commands:*
/add - Add a coin to your portfolio
/portfolio - View your portfolio & profits
/update - Update a coin's current price
/withdraw - Calculate how much to sell
/setrate - Set USD to NGN rate
/clear - Clear your portfolio
/help - Show this message

*Current NGN Rate:* ₦${formatNum(user.ngnRate)} per $1

Let's start! Use /add to add your first coin.
`;

    bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
});

// /add command - Start adding a coin
bot.onText(/\/add/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);
    
    user.state = STATES.AWAITING_COIN;
    user.temp = {};
    
    bot.sendMessage(chatId, '📝 *Add a Coin*\n\nEnter the coin symbol (e.g., BTC, ETH, SOL):', {
        parse_mode: 'Markdown',
    });
});

// /portfolio command
bot.onText(/\/portfolio/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);
    const portfolio = user.portfolio;
    
    if (Object.keys(portfolio).length === 0) {
        bot.sendMessage(chatId, '📭 Your portfolio is empty!\n\nUse /add to add your first coin.');
        return;
    }
    
    let totalBuy = 0;
    let totalCurrent = 0;
    let lines = [];
    
    for (const [coin, data] of Object.entries(portfolio)) {
        const { amount, buyPriceUsd, currentPriceUsd } = data;
        const profit = currentPriceUsd - buyPriceUsd;
        const profitPct = buyPriceUsd > 0 ? (profit / buyPriceUsd) * 100 : 0;
        const emoji = profit >= 0 ? '🟢' : '🔴';
        
        totalBuy += buyPriceUsd;
        totalCurrent += currentPriceUsd;
        
        lines.push(
`*${coin}*
  Holdings: ${amount}
  Bought: $${formatNum(buyPriceUsd)}
  Current: $${formatNum(currentPriceUsd)}
  ${emoji} P/L: $${profit >= 0 ? '+' : ''}${formatNum(profit)} (${profit >= 0 ? '+' : ''}${formatNum(profitPct)}%)`
        );
    }
    
    const totalProfit = totalCurrent - totalBuy;
    const totalProfitPct = totalBuy > 0 ? (totalProfit / totalBuy) * 100 : 0;
    const totalEmoji = totalProfit >= 0 ? '🟢' : '🔴';
    
    let text = '📊 *YOUR PORTFOLIO*\n\n';
    text += lines.join('\n\n');
    text += '\n\n────────────────────\n';
    text += '*TOTAL*\n';
    text += `  Invested: $${formatNum(totalBuy)} (₦${formatNum(totalBuy * user.ngnRate)})\n`;
    text += `  Current: $${formatNum(totalCurrent)} (₦${formatNum(totalCurrent * user.ngnRate)})\n`;
    text += `  ${totalEmoji} Profit: $${totalProfit >= 0 ? '+' : ''}${formatNum(totalProfit)} (${totalProfit >= 0 ? '+' : ''}${formatNum(totalProfitPct)}%)\n`;
    text += `  ${totalEmoji} In Naira: ₦${totalProfit >= 0 ? '+' : ''}${formatNum(totalProfit * user.ngnRate)}`;
    
    bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// /update command - Update current price
bot.onText(/\/update/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);
    
    if (Object.keys(user.portfolio).length === 0) {
        bot.sendMessage(chatId, '📭 Your portfolio is empty!\n\nUse /add to add coins first.');
        return;
    }
    
    const coins = Object.keys(user.portfolio).join(', ');
    user.state = STATES.AWAITING_UPDATE_COIN;
    
    bot.sendMessage(chatId, `📝 *Update Price*\n\nYour coins: ${coins}\n\nWhich coin do you want to update?`, {
        parse_mode: 'Markdown',
    });
});

// /withdraw command
bot.onText(/\/withdraw/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);
    
    if (Object.keys(user.portfolio).length === 0) {
        bot.sendMessage(chatId, '📭 Your portfolio is empty!\n\nUse /add to add coins first.');
        return;
    }
    
    // Show coins with profits (separate profitable and non-profitable)
    let profitableLines = [];
    let noProfitLines = [];
    let hasProfitableCoins = false;
    
    for (const [coin, data] of Object.entries(user.portfolio)) {
        const profit = data.currentPriceUsd - data.buyPriceUsd;
        if (profit > 0) {
            hasProfitableCoins = true;
            const pricePerCoin = data.currentPriceUsd / data.amount;
            const profitInCoin = profit / pricePerCoin;
            profitableLines.push(`🟢 *${coin}*: +$${formatNum(profit)} (${profitInCoin.toFixed(8)} ${coin}) ✓`);
        } else {
            noProfitLines.push(`🔴 *${coin}*: $${formatNum(profit)} (no profit)`);
        }
    }
    
    if (!hasProfitableCoins) {
        bot.sendMessage(
            chatId,
            '😕 *No Profits to Withdraw*\n\nNone of your coins are currently in profit.\n\nCoin status:\n' + noProfitLines.join('\n'),
            { parse_mode: 'Markdown' }
        );
        return;
    }
    
    user.state = STATES.AWAITING_WITHDRAW_COIN;
    
    let message = '💸 *Withdraw Profits*\n\n*Available to withdraw:*\n' + profitableLines.join('\n');
    if (noProfitLines.length > 0) {
        message += '\n\n*Not available (no profit):*\n' + noProfitLines.join('\n');
    }
    message += '\n\nWhich coin do you want to withdraw from?';
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// /setrate command
bot.onText(/\/setrate/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);
    
    user.state = STATES.AWAITING_NGN_RATE;
    
    bot.sendMessage(
        chatId,
        `💱 *Set Exchange Rate*\n\nCurrent rate: ₦${formatNum(user.ngnRate)} per $1\n\nEnter the new NGN rate:`,
        { parse_mode: 'Markdown' }
    );
});

// /clear command
bot.onText(/\/clear/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);
    
    user.portfolio = {};
    user.state = STATES.IDLE;
    user.temp = {};
    
    bot.sendMessage(chatId, '🗑️ Portfolio cleared!\n\nUse /add to start fresh.');
});

// /cancel command
bot.onText(/\/cancel/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(chatId);
    
    user.state = STATES.IDLE;
    user.temp = {};
    
    bot.sendMessage(chatId, '❌ Cancelled. Use /help to see available commands.');
});

// ========== MESSAGE HANDLER (for conversation flow) ==========

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Ignore commands
    if (text && text.startsWith('/')) return;
    
    const user = getUser(chatId);
    
    switch (user.state) {
        // ===== ADD COIN FLOW =====
        case STATES.AWAITING_COIN:
            user.temp.coin = text.toUpperCase().trim();
            user.state = STATES.AWAITING_AMOUNT;
            bot.sendMessage(
                chatId,
                `💰 How much *${user.temp.coin}* do you hold?\n\nEnter the amount (e.g., 0.01177993):`,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case STATES.AWAITING_AMOUNT:
            const amount = parseFloat(text);
            if (isNaN(amount) || amount <= 0) {
                bot.sendMessage(chatId, '❌ Invalid number. Please enter a valid amount:');
                return;
            }
            user.temp.amount = amount;
            user.state = STATES.AWAITING_BUY_PRICE;
            bot.sendMessage(
                chatId,
                `💵 What was your *buy price* for ${user.temp.coin} in USD?\n\n(Total USD value when you bought, e.g., 841.01):`,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case STATES.AWAITING_BUY_PRICE:
            const buyPrice = parseFloat(text);
            if (isNaN(buyPrice) || buyPrice < 0) {
                bot.sendMessage(chatId, '❌ Invalid number. Please enter a valid price:');
                return;
            }
            user.temp.buyPrice = buyPrice;
            user.state = STATES.AWAITING_CURRENT_PRICE;
            bot.sendMessage(
                chatId,
                `📈 What is the *current value* of your ${user.temp.coin} in USD?\n\n(Current total USD value, e.g., 861.82):`,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case STATES.AWAITING_CURRENT_PRICE:
            const currentPrice = parseFloat(text);
            if (isNaN(currentPrice) || currentPrice < 0) {
                bot.sendMessage(chatId, '❌ Invalid number. Please enter a valid price:');
                return;
            }
            
            // Save coin to portfolio
            user.portfolio[user.temp.coin] = {
                amount: user.temp.amount,
                buyPriceUsd: user.temp.buyPrice,
                currentPriceUsd: currentPrice,
            };
            
            const profit = currentPrice - user.temp.buyPrice;
            const profitPct = user.temp.buyPrice > 0 ? (profit / user.temp.buyPrice) * 100 : 0;
            const emoji = profit >= 0 ? '🟢' : '🔴';
            
            bot.sendMessage(
                chatId,
                `✅ *${user.temp.coin} Added!*

Amount: ${user.temp.amount}
Buy Price: $${formatNum(user.temp.buyPrice)}
Current: $${formatNum(currentPrice)}
${emoji} P/L: $${profit >= 0 ? '+' : ''}${formatNum(profit)} (${profit >= 0 ? '+' : ''}${formatNum(profitPct)}%)

Use /add to add more coins or /portfolio to see all.`,
                { parse_mode: 'Markdown' }
            );
            
            user.state = STATES.IDLE;
            user.temp = {};
            break;
            
        // ===== UPDATE PRICE FLOW =====
        case STATES.AWAITING_UPDATE_COIN:
            const updateCoin = text.toUpperCase().trim();
            if (!user.portfolio[updateCoin]) {
                bot.sendMessage(chatId, `❌ Coin *${updateCoin}* not found in your portfolio. Try again:`, {
                    parse_mode: 'Markdown',
                });
                return;
            }
            user.temp.coin = updateCoin;
            user.state = STATES.AWAITING_UPDATE_PRICE;
            bot.sendMessage(
                chatId,
                `📈 Enter the new current value for *${updateCoin}* in USD:`,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case STATES.AWAITING_UPDATE_PRICE:
            const newPrice = parseFloat(text);
            if (isNaN(newPrice) || newPrice < 0) {
                bot.sendMessage(chatId, '❌ Invalid number. Please enter a valid price:');
                return;
            }
            
            const coinData = user.portfolio[user.temp.coin];
            const oldPrice = coinData.currentPriceUsd;
            coinData.currentPriceUsd = newPrice;
            
            const newProfit = newPrice - coinData.buyPriceUsd;
            const newProfitPct = coinData.buyPriceUsd > 0 ? (newProfit / coinData.buyPriceUsd) * 100 : 0;
            const newEmoji = newProfit >= 0 ? '🟢' : '🔴';
            
            bot.sendMessage(
                chatId,
                `✅ *${user.temp.coin} Updated!*

Old Value: $${formatNum(oldPrice)}
New Value: $${formatNum(newPrice)}
${newEmoji} Total P/L: $${newProfit >= 0 ? '+' : ''}${formatNum(newProfit)} (${newProfit >= 0 ? '+' : ''}${formatNum(newProfitPct)}%)

Use /portfolio to see your full portfolio.`,
                { parse_mode: 'Markdown' }
            );
            
            user.state = STATES.IDLE;
            user.temp = {};
            break;
            
        // ===== WITHDRAW FLOW =====
        case STATES.AWAITING_WITHDRAW_COIN:
            const withdrawCoin = text.toUpperCase().trim();
            if (!user.portfolio[withdrawCoin]) {
                bot.sendMessage(chatId, `❌ Coin *${withdrawCoin}* not found. Try again:`, {
                    parse_mode: 'Markdown',
                });
                return;
            }
            
            const coinProfit = user.portfolio[withdrawCoin].currentPriceUsd - user.portfolio[withdrawCoin].buyPriceUsd;
            
            // Check if coin has profit
            if (coinProfit <= 0) {
                bot.sendMessage(
                    chatId,
                    `❌ *${withdrawCoin}* has no profit to withdraw ($${formatNum(coinProfit)})\n\nPlease choose a coin with profit:`,
                    { parse_mode: 'Markdown' }
                );
                return;
            }
            
            user.temp.coin = withdrawCoin;
            user.state = STATES.AWAITING_WITHDRAW_AMOUNT;

            const recommended = Math.max(0, coinProfit - 2);
            const recPricePerCoin = user.portfolio[withdrawCoin].currentPriceUsd / user.portfolio[withdrawCoin].amount;
            const recCoinAmount = recommended / recPricePerCoin;

            bot.sendMessage(
                chatId,
                `💵 *Withdraw from ${withdrawCoin}*\n\nAvailable profit: $${formatNum(coinProfit)} (₦${formatNum(coinProfit * user.ngnRate)})\n\n💡 *Recommended (profit - $2):* $${formatNum(recommended)} = ${recCoinAmount.toFixed(8)} ${withdrawCoin}\n\nHow much USD do you want to withdraw?`,
                { parse_mode: 'Markdown' }
            );
            break;
            
        case STATES.AWAITING_WITHDRAW_AMOUNT:
            const withdrawAmount = parseFloat(text);
            if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
                bot.sendMessage(chatId, '❌ Invalid number. Please enter a valid amount:');
                return;
            }
            
            const coin = user.temp.coin;
            const data = user.portfolio[coin];
            const pricePerCoin = data.currentPriceUsd / data.amount;
            const amountToSell = withdrawAmount / pricePerCoin;
            const remainingAmount = data.amount - amountToSell;
            const remainingValue = remainingAmount * pricePerCoin;
            
            bot.sendMessage(
                chatId,
                `💸 *Withdrawal Calculator*

*To withdraw $${formatNum(withdrawAmount)} from ${coin}:*

📤 *Sell:* ${amountToSell.toFixed(8)} ${coin}

*After selling:*
  Remaining: ${remainingAmount.toFixed(8)} ${coin}
  Value: $${formatNum(remainingValue)} (₦${formatNum(remainingValue * user.ngnRate)})

*You'll receive:*
  $${formatNum(withdrawAmount)} (₦${formatNum(withdrawAmount * user.ngnRate)})`,
                { parse_mode: 'Markdown' }
            );
            
            user.state = STATES.IDLE;
            user.temp = {};
            break;
            
        // ===== SET NGN RATE =====
        case STATES.AWAITING_NGN_RATE:
            const newRate = parseFloat(text);
            if (isNaN(newRate) || newRate <= 0) {
                bot.sendMessage(chatId, '❌ Invalid number. Please enter a valid rate:');
                return;
            }
            
            user.ngnRate = newRate;
            user.state = STATES.IDLE;
            
            bot.sendMessage(
                chatId,
                `✅ Exchange rate updated!\n\nNew rate: ₦${formatNum(newRate)} per $1`
            );
            break;
    }
});

// Error handling
bot.on('polling_error', (error) => {
    console.error('Polling error:', error.message);
});

console.log('🚀 Bot is running...');
