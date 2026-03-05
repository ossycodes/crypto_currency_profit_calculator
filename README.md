
# 🚀 Crypto Profit Calculator Bot

A Telegram bot built by Emmanuel (Ossy) that helps you track your crypto portfolio, calculate profits/losses, and determine exactly how much to sell to withdraw a specific amount.

## Features

- ✅ Add coins to your portfolio with buy price and current value
- 📊 View portfolio with profit/loss in USD and NGN
- 📈 Update current prices anytime
- 💸 Calculate exactly how much crypto to sell for a specific USD withdrawal
- 💱 Customizable USD to NGN exchange rate

## Setup Instructions

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name for your bot (e.g., "Crypto Profit Calculator")
4. Choose a username for your bot (must end in `bot`, e.g., `my_crypto_profit_bot`)
5. **Copy the token** that BotFather gives you (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Install Node.js

Make sure you have Node.js installed (version 16 or higher):
- Download from: https://nodejs.org/

### Step 3: Set Up the Bot

```bash
# Navigate to the bot folder
cd crypto_profit_bot

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

### Step 4: Add Your Token

Open the `.env` file and replace `your_bot_token_here` with your actual token:

```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

### Step 5: Run the Bot

```bash
npm start
```

You should see: `🚀 Bot is running...`

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and instructions |
| `/add` | Add a coin to your portfolio |
| `/portfolio` | View your portfolio with P/L |
| `/update` | Update a coin's current price |
| `/withdraw` | Calculate how much to sell |
| `/setrate` | Set USD to NGN exchange rate |
| `/clear` | Clear your portfolio |
| `/cancel` | Cancel current operation |

## Usage Example

1. **Add a coin:**
   - Send `/add`
   - Enter coin: `BTC`
   - Enter amount: `0.01177993`
   - Enter buy price (USD): `841.01`
   - Enter current value (USD): `861.82`

2. **View portfolio:**
   - Send `/portfolio`
   - See all your holdings with profit/loss

3. **Calculate withdrawal:**
   - Send `/withdraw`
   - Select coin: `BTC`
   - Enter amount: `18`
   - Bot tells you exactly how much BTC to sell

## Hosting (Keep Bot Running 24/7)

To keep your bot running, you can host it on:

- **Railway.app** (free tier available)
- **Render.com** (free tier available)
- **DigitalOcean** ($5/month)
- **Your own computer** (run with `pm2` for auto-restart)

### Using PM2 (recommended for self-hosting)

```bash
npm install -g pm2
pm2 start bot.js --name "crypto-bot"
pm2 save
pm2 startup
```

## Usage Example

### 1. Adding Your Coins

```
You: /add

Bot: 📝 Add a Coin
     Enter the coin symbol (e.g., BTC, ETH, SOL):

You: BTC

Bot: 💰 How much BTC do you hold?
     Enter the amount (e.g., 0.01177993):

You: 0.01177993

Bot: 💵 What was your buy price for BTC in USD?
     (Total USD value when you bought, e.g., 841.01):

You: 841.01

Bot: 📈 What is the current value of your BTC in USD?
     (Current total USD value, e.g., 861.82):

You: 861.82

Bot: ✅ BTC Added!
     
     Amount: 0.01177993
     Buy Price: $841.01
     Current: $861.82
     🟢 P/L: +$20.81 (+2.47%)
     
     Use /add to add more coins or /portfolio to see all.
```

*(Repeat /add for ETH and SOL)*

---

### 2. Viewing Portfolio

```
You: /portfolio

Bot: 📊 YOUR PORTFOLIO

     BTC
       Holdings: 0.01177993
       Bought: $841.01
       Current: $861.82
       🟢 P/L: +$20.81 (+2.47%)

     ETH
       Holdings: 0.19381103
       Bought: $410.32
       Current: $416.69
       🟢 P/L: +$6.37 (+1.55%)

     SOL
       Holdings: 2.25021602
       Bought: $205.63
       Current: $205.57
       🔴 P/L: -$0.06 (-0.03%)

     ────────────────────
     TOTAL
       Invested: $1,456.96 (₦2,010,613.00)
       Current: $1,484.08 (₦2,048,030.40)
       🟢 Profit: +$27.12 (+1.86%)
       🟢 In Naira: ₦37,425.60
```

---

### 3. Calculating Withdrawal ($18 from BTC)

```
You: /withdraw

Bot: 💸 Withdraw Profits
     
     Available to withdraw:
     🟢 BTC: +$20.81 ✓
     🟢 ETH: +$6.37 ✓
     
     Not available (no profit):
     🔴 SOL: -$0.06 (no profit)
     
     Which coin do you want to withdraw from?

You: BTC

Bot: 💵 Withdraw from BTC
     
     Available profit: $20.81 (₦28,717.80)
     
     How much USD do you want to withdraw?

You: 18

Bot: 💸 Withdrawal Calculator
     
     To withdraw $18.00 from BTC:
     
     📤 Sell: 0.00024600 BTC
     
     After selling:
       Remaining: 0.01153393 BTC
       Value: $843.82 (₦1,164,473.16)
     
     You'll receive:
       $18.00 (₦24,840.00)
```

---

### 4. Trying to Withdraw from a Coin with No Profit

```
You: /withdraw

Bot: 💸 Withdraw Profits
     ...

You: SOL

Bot: ❌ SOL has no profit to withdraw (-$0.06)
     
     Please choose a coin with profit:
```

---

### 5. Setting NGN Rate

```
You: /setrate

Bot: 💱 Set Exchange Rate
     
     Current rate: ₦1,380.00 per $1
     
     Enter the new NGN rate:

You: 1550

Bot: ✅ Exchange rate updated!
     
     New rate: ₦1,550.00 per $1
```

---

## Notes

- Data is stored in memory, so it resets when the bot restarts
- For persistent storage, you can modify the code to use a database (MongoDB, SQLite, etc.)
- The default NGN rate is ₦1,380 per $1 (change with `/setrate`)

---

Made with ❤️ for tracking crypto profits
