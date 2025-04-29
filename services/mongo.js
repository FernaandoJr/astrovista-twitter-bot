const { MongoClient } = require("mongodb")
require("dotenv").config()

const uri = process.env.MONGODB_URI

if (!uri) {
	throw new Error("MONGODB_URI is not defined in the environment variables.")
}

async function getApodOfToday() {
	const client = new MongoClient(uri)
	await client.connect()
	const db = client.db("Apod")
	const collection = db.collection("pictures")

	const apod = await collection.findOne({}, { sort: { date: -1 } })

	await client.close()
	return apod
}

async function getApod(date) {
	const client = new MongoClient(uri)
	await client.connect()
	const db = client.db("Apod")
	const collection = db.collection("pictures")

	const apod = await collection.findOne({ date: date })

	return apod
}

async function isDatePosted(date) {
	const client = new MongoClient(uri)
	await client.connect()
	const db = client.db("Apod")
	const collection = db.collection("twitter_posted_dates")

	const result = await collection.findOne({ date })
	return result !== null
}

async function markDateAsPosted(date) {
	const client = new MongoClient(uri)
	await client.connect()
	const db = client.db("Apod")
	const collection = db.collection("twitter_posted_dates")

	await collection.insertOne({ date })
}

module.exports = { getApodOfToday, getApod, isDatePosted, markDateAsPosted }
