const fs = require("fs")
const path = require("path")
const { logMessage } = require("./logMessage")

function deleteImages() {
	const imagesDir = path.join(__dirname, "../images")

	fs.readdir(imagesDir, (err, files) => {
		if (err) {
			console.error("Error reading images directory:", err)
			return
		}

		files.forEach((file) => {
			if (file !== ".gitkeep") {
				const filePath = path.join(imagesDir, file)
				fs.unlink(filePath, (err) => {
					if (err) {
						logMessage(`Error deleting file: ${file}`, "ERROR")
					} else {
						logMessage(`Deleted file: ${file}`, "SUCCESS")
					}
				})
			}
		})
	})
}

module.exports = { deleteImages }
