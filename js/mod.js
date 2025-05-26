let modInfo = {
	name: "The Cookie Modder Tree",
	author: "nobody",
	pointsName: "cookies",
	id: "H6iBtvKRUFy3lqYAqqX7+PjA8KvFpBtM",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 8784,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.1",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.1</h3><br>
		- Added building points.<br>
		- Added stuff.`

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
function getPointGenBeforePow() {
	let gain = new Decimal(0)
	gain = gain.add(buyableEffect('b', 11))
	gain = gain.add(buyableEffect('b', 21))
	gain = gain.add(buyableEffect('b', 31))
	gain = gain.add(buyableEffect('b', 41))
	gain = gain.add(buyableEffect('b', 51))
	gain = gain.add(buyableEffect('b', 61))
	gain = gain.add(buyableEffect('b', 71))
	gain = gain.add(buyableEffect('b', 81))
	gain = gain.add(buyableEffect('b', 91))

	gain = gain.times(buyableEffect('p', 11))
	gain = gain.times(buyableEffect('au', 12))
	return gain
}
function getPointGen() {
	if(!canGenPoints()) {return new Decimal(0)}
	else {
		gain = getPointGenBeforePow()




		if (hasUpgrade('c', 44)) {gain = gain.pow(upgradeEffect('c', 44))}
		if (getBuyableAmount('m', 11).gt(0)) {gain = gain.pow(buyableEffect('m', 11).eff)}


	}
	return gain
}



// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	clickgain() {
		clickgain = new Decimal(1)
		clickgain = clickgain.times(buyableEffect('p', 11))
		clickgain = clickgain.times(buyableEffect('au', 13))
		return clickgain
	},
	effBasesy() {
		eff = new Decimal(1.08)
		if (hasUpgrade('c', 13)) {eff = eff.add(upgradeEffect('c', 13))}
		return eff
	}
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.points.gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// Style for the background, can be a function
var backgroundStyle = {

}

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}

function croot(base, root) { 
	//base is a complex decimal, in the format of a list of decimal. root is a decimal that has to be integer
	r = base[0].pow(2).add(base[1].pow(2)).pow(1/2) //distance of complex number from zero 
	theta = base[1].div(base[0]).atan() //angle of complex number from real line
	if (theta.gte(Infinity)) {theta = new Decimal(1.57079632679489661923132169163975144209858469968755291048747229615390820314)} //pi/2
	if (base[0].lt(0)) {theta = theta.add(3.14159265358979323846264338327950288419716939937510582097494459230781640628)} //pi
	if (base[1].lt(0)&&(base[0].lt(0))) {theta = theta.sub(6.2831853071795864769252867665590057683943387987502116419498891846156328125)} //2pi
	// i am using a version of decimal without hypot or atan2
	rnew = r.root(root) //application of demoivres theorem
	thetanew = theta.div(root)
	thetasnew = []
	for (let i = 0; i < root; i++) {
		thetasnew.push(thetanew.add(new Decimal(6.28318530717958647692528676655900576839433879875021164194988918461563281257).div(root).times(i)))
	} //list of possible new angles for roots
	results = []
	for (let i = 0; i < root; i++) {
		results.push([rnew.times(thetasnew[i].cos()), rnew.times(thetasnew[i].sin())])
	} //list of all roots, multipling all possible angles with (only possible) new distance
	return results //list of root items, each item is 2 decimals
}