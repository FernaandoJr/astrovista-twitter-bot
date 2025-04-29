require("dotenv").config()
const { getApodOfToday, isDatePosted } = require("../services/mongo")
const fetch = (...args) =>
	import("node-fetch").then((mod) => mod.default(...args))
const { tweetApod } = require("../utils/tweetApod")

async function tweetLatestApod() {
	const apod = await getApodOfToday()
	if (!apod) {
		console.log("Nenhum APOD encontrado para hoje.")
		return
	}

	if (apod.media_type !== "image") {
		console.log("O APOD de hoje não é uma imagem.")
		return
	}

	const alreadyPosted = await isDatePosted(apod.date)
	if (alreadyPosted) {
		console.log("APOD já postado.")
		return
	}

	tweetApod(apod)
}

module.exports = { tweetLatestApod }
