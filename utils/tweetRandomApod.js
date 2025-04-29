require("dotenv").config()
const {
	getApodOfToday,
	isDatePosted,
	getApod,
	markDateAsPosted,
} = require("../services/mongo")
const fetch = (...args) =>
	import("node-fetch").then((mod) => mod.default(...args))
const { logMessage } = require("./logMessage")
const { tweetApod } = require("./tweetApod")

async function getRandomDate() {
	const start = new Date(1995, 5, 16)
	const end = await getApodOfToday().then((apod) => {
		const dateParts = apod.date.split("-") // Split the date string (YYYY-MM-DD)
		return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) // Return a Date object
	})

	while (true) {
		const randomDate = new Date(
			start.getTime() + Math.random() * (end.getTime() - start.getTime())
		) // Generate a random date between start and end
		const formattedDate = randomDate.toISOString().split("T")[0] // Format as YYYY-MM-DD

		const alreadyPosted = await isDatePosted(formattedDate)
		if (!alreadyPosted) {
			return formattedDate // Return the formatted date directly
		}
	}
}

async function tweetRandomApod() {
	let apod
	while (true) {
		date = await getRandomDate()
		logMessage(`Trying to get APOD for ${date}`, "INFO")

		apod = await getApod(date)

		if (apod.media_type !== "image") {
			logMessage(`APOD is not an image. Trying again...`, "INFO")
			continue
		}
		console.log("APOD:", JSON.stringify(apod))
		logMessage(`APOD: ${JSON.stringify(apod)}`, "INFO")
		break
	}
	tweetApod(apod)
}

module.exports = { tweetRandomApod }
