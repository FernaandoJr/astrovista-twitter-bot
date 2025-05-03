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
		return null
	}

	const res = await fetch(url)
	const buffer = await res.arrayBuffer()

	// Save the original image to disk
	const fullPath = path.join(__dirname, "../images", filename)
	fs.writeFileSync(fullPath, Buffer.from(buffer))

	// Verify the file size on disk
	let fileStats = fs.statSync(fullPath)
	let fileSizeInBytes = fileStats.size
	let fileSizeInMB = (fileSizeInBytes / 1048 / 1048).toFixed(2)

	logMessage(
		`File size: ${fileSizeInBytes} bytes (${fileSizeInMB} MB)`,
		"INFO"
	)

	logMessage(`Downloaded image size: ${fileSizeInMB} MB`, "INFO")

	// Check if the file size exceeds 5 MB
	const maxFileSize = 5 * 1024 * 1024 // 5 MB in bytes
	if (fileSizeInBytes >= maxFileSize) {
		logMessage(
			`Image size (${fileSizeInMB} MB) exceeds 5 MB. Compressing...`,
			"INFO"
		)

		// Iteratively compress the image until it is below 5 MB
		let quality = 80 // Start with 80% quality
		while (fileSizeInBytes > maxFileSize && quality > 10) {
			await sharp(fullPath)
				.jpeg({ quality }) // Reduce quality
				.toFile(fullPath + ".tmp") // Save to a temporary file

			// Replace the original file with the compressed file
			fs.renameSync(fullPath + ".tmp", fullPath)

			// Recalculate the file size
			fileStats = fs.statSync(fullPath)
			fileSizeInBytes = fileStats.size
			fileSizeInMB = (fileSizeInBytes / 1024 / 1024).toFixed(2)

			logMessage(
				`Compressed image to ${fileSizeInMB} MB at ${quality}% quality.`,
				"INFO"
			)

			quality -= 10 // Decrease quality further if needed
		}

		if (fileSizeInBytes > maxFileSize) {
			logMessage(
				"Unable to compress the image below 5 MB. Aborting.",
				"ERROR"
			)
			return null
		}
	}

	logMessage(`Final image size: ${fileSizeInMB} MB`, "INFO")

	return fullPath
}

module.exports = { downloadImage }
