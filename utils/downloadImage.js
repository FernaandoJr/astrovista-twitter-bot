const fs = require("fs")
const path = require("path")
const sharp = require("sharp")
const { logMessage } = require("./logMessage")
const fetch = (...args) =>
	import("node-fetch").then((mod) => mod.default(...args))

async function downloadImage(url, filename) {
	// Check if the file extension is valid
	const validExtensions = [".jpg", ".jpeg", ".png"]
	const fileExtension = path.extname(url).toLowerCase()

	logMessage(`File extension: ${fileExtension}`, "INFO")

	if (!validExtensions.includes(fileExtension)) {
		logMessage(
			`Invalid image format: ${fileExtension}. Supported formats are ${validExtensions.join(
				", "
			)}`,
			"ERROR"
		)
	}

	const res = await fetch(url)
	const buffer = await res.arrayBuffer()

	logMessage(`Image downloaded and resized: ${filename}`, "INFO")

	// Convert to JPEG
	const fullPath = path.join(
		__dirname,
		"../images",
		filename.replace(".png", ".jpg")
	)

	await sharp(buffer).png({ quality: 90 }).toFile(fullPath)

	logMessage(`Image resized and saved: ${fullPath}`, "INFO")

	return fullPath
}

module.exports = { downloadImage }
