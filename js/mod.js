let modInfo = {
	name: "The Trolling Tree",
	id: "jacorb90aL3GhF8bs8NB76hGDmeqA9ZzrI",
	author: "nobody",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.2",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.2</h3><br>
		- Overhaul on some structure.<br>
		- Added lootboxes.<br>
	<h3>v0.1</h3><br>
		- Gems inflation update.<br>
	<h3>v0.0</h3><br>
		- Added microtransactions.<br>
		- Added advertisements.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return true
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	baseGain = new Decimal(1)
	baseGain = baseGain.add(buyableEffect('p', 11))
	baseGain = baseGain.add(buyableEffect('mp', 11))
	baseGain = baseGain.add(buyableEffect('bp', 11))
	baseGain = baseGain.add(buyableEffect('sp', 11))
	gainMult = new Decimal(1)
	gainMult = gainMult.add(buyableEffect('p', 12))
	gainMult = gainMult.add(buyableEffect('mp', 12))
	gainMult = gainMult.add(buyableEffect('bp', 12))
	gainMult = gainMult.add(buyableEffect('sp', 12))

	gain = baseGain.times(gainMult).times(buyableEffect('l', 37))
	gain = gain.times(player.b.points.add(1).pow(buyableEffect('l', 23).add(1)))

	firstSoftcapStrength = new Decimal(20)
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('p', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('mp', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('bp', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('sp', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('l', 37))
	if (player.points.gte(1)) {gain = gain.div(player.points.pow(firstSoftcapStrength))}

	secondSoftcapStrength = new Decimal(20)
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('mp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('bp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('sp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('l', 38))
	if (player.points.gte(2)) {gain = gain.div(player.points.div(2).pow(secondSoftcapStrength))}

	thirdSoftcapStrength = new Decimal(30)
	thirdSoftcapStrength = thirdSoftcapStrength.sub(buyableEffect('l', 39))
	if (player.points.gte(3)) {gain = gain.div(player.points.div(3).pow(thirdSoftcapStrength))}

	fourthSoftcapStrength = new Decimal(60)
	if (player.points.gte(5)) {gain = gain.div(player.points.div(5).pow(fourthSoftcapStrength))}


	if (player.points.gte(9)) {gain = gain.times(player.points.sub(10).times(-1))}

	gain = gain.times(player.a.points.add(1).pow(buyableEffect('l', 23)).add(1))

	gain = gain.min(1)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {

}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.a.points.gte(1)
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(1) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){


}