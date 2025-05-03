require("dotenv").config()
const { getApodOfToday, isDatePosted } = require("../services/mongo")
const fetch = (...args) =>
	import("node-fetch").then((mod) => mod.default(...args))
const { tweetApod } = require("../utils/tweetApod")
const { logMessage } = require("./logMessage")

async function tweetLatestApod() {
	const apod = await getApodOfToday()
	if (!apod) {
		logMessage("Nenhum APOD encontrado para hoje.", "ERROR")
		return
	}

	if (apod.media_type !== "image") {
		logMessage(
			`O APOD de hoje não é uma imagem. Tipo: ${apod.media_type}`,
			"ERROR"
		)
		return
	}

	const alreadyPosted = await isDatePosted(apod.date)
	if (alreadyPosted) {
		logMessage("APOD já postado.", "ERROR")
		return
	}

	tweetApod(apod)
}

module.exports = { tweetLatestApod }
