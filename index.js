const { tweetLatestApod } = require("./utils/tweetLatestApod")
const cron = require("node-cron")
const { logMessage } = require("./utils/logMessage")
const { tweetRandomApod } = require("./utils/tweetRandomApod")
require("dotenv").config()

// Cron job to post a random APOD every hour - 0 * * * *
cron.schedule("0 * * * *", async () => {
	logMessage("Starting random APOD post...", "INFO")
	try {
		await tweetRandomApod()
		logMessage("Random APOD posted successfully.", "SUCCESS")
	} catch (error) {
		logMessage(`Error posting random APOD: ${error.message}`, "ERROR")
	}
})
// Cron job to run the main bot daily at 11 AM - 0 11 * * *
cron.schedule("0 11 * * *", async () => {
	await tweetLatestApod()
	console.log("APOD postado com sucesso!")
})

// tweetLatestApod()
// tweetRandomApod()
logMessage("Bot started.", "SUCCESS")
