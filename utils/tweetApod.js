require("dotenv").config()
const { downloadImage } = require("./downloadImage")
const { markDateAsPosted } = require("../services/mongo")
const { logMessage } = require("./logMessage")
const { postTweet } = require("../twitter")
const TinyURL = require("tinyurl")
const { deleteImages } = require("./deleteImages")

async function tweetApod(apod) {
	logMessage(`Posting APOD...`, "INFO")
	const imageUrl = apod.hdurl || apod.url
	const filename = `${apod.date}.jpg`

	const imagePath = await downloadImage(imageUrl, filename)

	// Format the date to include the month name, treating it as a local date
	const dateParts = apod.date.split("-") // Split the date string (YYYY-MM-DD)
	const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]) // Create a local date
	const formattedDate = dateObj.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	})

	// Remove all \n characters from explanation and copyright
	const cleanExplanation = apod.explanation
		.replace(/\n/g, " ")
		.replace(/�/g, "")
	const cleanCopyright = apod.copyright
		? apod.copyright.replace(/\n/g, " ").replace(/�/g, "")
		: ""

	// Twitter-friendly caption
	let caption = `🌌 ${apod.title}\n`
	caption += `📅 ${formattedDate}\n`
	if (cleanCopyright) caption += `📸 Credit: ${cleanCopyright}\n`
	caption += `${cleanExplanation}\n`

	if (caption.length > 280) caption = caption.slice(0, 277) + "..."

	const shortUrl = await TinyURL.shorten(
		`https://astrovista.vercel.app/gallery/${apod.date}`
	)
	if (caption.length + shortUrl.length + 21 > 280) {
		caption = caption.slice(0, 280 - shortUrl.length - 21) + "..."
	}
	caption += `\nFull description at: ${shortUrl}\n`

	try {
		await postTweet(imagePath, caption)
		logMessage(`Image posted successfully!`, "SUCCESS")

		// Mark the date as posted in the database
		try {
			await markDateAsPosted(apod.date)
			logMessage(`Date ${apod.date} marked as posted.`, "SUCCESS")
		} catch (error) {
			logMessage(
				`Error marking date as posted: ${error.message}`,
				"ERROR"
			)
		}
	} catch (error) {
		logMessage(`Error posting tweet: ${error}`, "ERROR")
		return
	}
	deleteImages()
}

module.exports = { tweetApod }
