require("dotenv").config()
const { TwitterApi } = require("twitter-api-v2")
const { logMessage } = require("../utils/logMessage")

// Substitua com suas chaves do app
const client = new TwitterApi({
	appKey: process.env.API_KEY,
	appSecret: process.env.API_SECRET,
	accessToken: process.env.ACCESS_TOKEN,
	accessSecret: process.env.ACCESS_SECRET,
})

async function postTweet(imagePath, caption) {
	try {
		const mediaId = await client.v1.uploadMedia(imagePath, { type: "jpg" })
		const response = await client.v2.tweet({
			text: caption,
			media: { media_ids: [mediaId] },
		})
		logMessage(`Tweet postado com sucesso: ${response.data.id}`, "SUCCESS")
	} catch (error) {
		// console.error("Erro ao postar tweet:", error)
		throw new Error(JSON.stringify(error.data))
	}
}

module.exports = { postTweet }
