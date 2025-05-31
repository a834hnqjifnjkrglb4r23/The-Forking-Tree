let modInfo = {
	name: "The Trolling Tree",
	id: "jacorb90timewallbelikeU2FtcGxlQm",
	author: "nobody",
	pointsName: "points. It is recommended to play at 80% zoom",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
	allowSmall: true,
}

// Set your version in num and name
let VERSION = {
	num: "0.3",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.3</h3><br>
		- Uninflated gems.<br>
		- Changed some coefficients.<br>
		- Changed lootbox mechanic. <br>
		- Changed milestone. <br>
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

	gainraw = baseGain.times(gainMult)
	gainraw = gainraw.times(buyableEffect('l', 11)[0][0]).times(buyableEffect('l', 11)[0][1])
	gainraw = gainraw.times(player.b.points.add(1).max(1))

	gain = gainraw
	firstSoftcapStrength = new Decimal(16)
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('p', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('mp', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('bp', 13))
	firstSoftcapStrength = firstSoftcapStrength.sub(buyableEffect('sp', 13))
	if (player.points.gte(1)) {gain = gain.div(player.points.pow(firstSoftcapStrength))}

	secondSoftcapStrength = new Decimal(20)
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('mp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('bp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('sp', 14))
	secondSoftcapStrength = secondSoftcapStrength.sub(buyableEffect('l', 11)[0][2])
	if (player.points.gte(2)) {gain = gain.div(player.points.div(2).pow(secondSoftcapStrength))}

	thirdSoftcapStrength = new Decimal(60)
	thirdSoftcapStrength = thirdSoftcapStrength.sub(buyableEffect('l', 11)[0][3])
	thirdSoftcapStrength = thirdSoftcapStrength.sub(buyableEffect('lf', 15))
	if (player.points.gte(3)) {gain = gain.div(player.points.div(3).pow(thirdSoftcapStrength))}

	fourthSoftcapStrength = new Decimal(240)
	fourthSoftcapStrength = fourthSoftcapStrength.sub(buyableEffect('lf', 16))
	if (player.points.gte(4)) {gain = gain.div(player.points.div(4).pow(fourthSoftcapStrength))}

	fifthSoftcapStrength = new Decimal(1200)
	if (player.points.gte(5)) {gain = gain.div(player.points.div(5).pow(fifthSoftcapStrength))}


	if (player.points.gte(9)) {gain = gain.times(player.points.sub(10).times(-1))}



	if (getBuyableAmount('g', 41).gt(0)) {gain = gain.times(buyableEffect('g', 41))}
	if (getBuyableAmount('g', 42).gt(0)) {gain = gain.times(buyableEffect('g', 42))}
	if (getBuyableAmount('g', 43).gt(0)) {gain = gain.times(buyableEffect('g', 43))}

	
	gain = gain.min(1)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	buyablePrice(type, amt, base, exp, limit) {
		if (type == "normal") {
			if (limit.lte('e100')) {limit = new Decimal('e100')} //limit is softcap, in currency at which scaling change to double exponential : linear
			if (base.pow(amt.add(1).pow(exp)).gt(limit)) {
				limitamt = limit.log10().div(base.log10()).pow(exp.pow(-1)).sub(1).floor()
				limitamtplus1 = limitamt.add(1)
				limitpriceloglog = base.pow(limitamt.add(1).pow(exp)).log10().log10()
				limitplus1priceloglog = base.pow(limitamtplus1.add(1).pow(exp)).log10().log10()
				newpricescalingloglog = limitplus1priceloglog.sub(limitpriceloglog)
				return amt.sub(limitamt).times(newpricescalingloglog).add(limitpriceloglog).pow10().pow10()
			} else {
				return base.pow(amt.add(1).pow(exp)).floor()
			}
		}

		if (type == "asymptote") {
			return base.pow(amt.add(1).times(limit).div(Decimal.sub(limit, amt)).pow(exp)).floor() //limit is hard limit, in buyable amount. softcap not needed since hardcapped
		}
		// if (type == "double") {
		// 	return base.pow(exp.pow(amt.add(1)))
		// }
		// if (type == "tetrate") {
		// 	return base.tetrate(amt.add(1).pow(exp))
		// }

	},
	buyableMaxPurchaseable(type, currency, base, exp, limit) {
		if (type == "normal") {
			if (limit.lte('e100')) {limit = new Decimal('e100')}
			if (currency.gt(limit)) {
				limitamt = limit.log10().div(base.log10()).pow(exp.pow(-1)).sub(1).floor()
				limitamtplus1 = limitamt.add(1)
				limitpriceloglog = base.pow(limitamt.add(1).pow(exp)).log10().log10()
				limitplus1priceloglog = base.pow(limitamtplus1.add(1).pow(exp)).log10().log10()
				newpricescalingloglog = limitplus1priceloglog.sub(limitpriceloglog)
				return currency.log10().log10().sub(limitpriceloglog).div(newpricescalingloglog).add(limitamt).ceil()
			} else {
				return currency.max(1).log10().div(base.log10()).pow(exp.pow(-1)).sub(1).floor()
			}
		}
		
	},
	row2normalBuyableSoftcap() {
		capexp = new Decimal(100)
		capexp = capexp.add(buyableEffect('lf', 101))
		return Decimal.dTen.pow(capexp)
	}
						
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