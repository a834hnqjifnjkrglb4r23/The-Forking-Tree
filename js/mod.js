let modInfo = {
	name: "The Trolling Tree",
	id: "jacorb90timewallbelikeU2FtcGxlQm",
	author: "nobody",
	pointsName: "points",
	modFiles: ["layers.js", "tree.js"],

	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (0), // Used for hard resets and new players
	offlineLimit: 0,  // In hours
	allowSmall: true,
}

// Set your version in num and name
let VERSION = {
	num: "0.5",
	name: "Literally nothing",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.5</h3><br>
		- Added hyperprestige. <br>
		- Added research. <br>
		- Added more lore. <br>
		- Changed some technical parts on buyable pricing. <br>
	<h3>v0.4</h3><br>
		- Uninflated gems.<br>
		- Changed some coefficients.<br>
		- Changed lootbox mechanic, extended lootbox content. <br>
		- Changed milestone. <br>
		- Added some lore. <br>
	<h3>v0.3</h3><br>
		- Overhaul on some structure.<br>
		- Added lootboxes.<br>
	<h3>v0.2</h3><br>
		- Restructured buyables. <br>
	<h3>v0.1</h3><br>
		- Gems inflation update.<br>
	<h3>v0.0</h3><br>
		- Added microtransactions.<br>
		- Added advertisements.`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything", "damageCalc", "generateEnemy", "unlockedStats", "experienceCalc", "mobDict", "itemDict", "consumableEffect", "chooseEnemy", "hitcountCalc", "equipEquippable", "unequipEquippable", "elementalDict", "elementalDamageMultiplier", "indexcostCoefficient", "typecostCoefficient"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	temporaryhidewr = player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lt(0.5)

	return !temporaryhidewr
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
	gainraw = gainraw.times(player.b.points.pow(buyableEffect('b', 11)).times(buyableEffect('b', 11).pow(player.b.points)).max(1))

	gainExp = new Decimal(1)
	gainExp = gainExp.add(buyableEffect('hp', 11))

	gain = gainraw.pow(gainExp)
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
	thirdSoftcapStrength = thirdSoftcapStrength.sub(buyableEffect('mtp', 13))

	if (player.points.gte(3)) {gain = gain.div(player.points.div(3).pow(thirdSoftcapStrength))}

	fourthSoftcapStrength = new Decimal(240)

	if (player.points.gte(4)) {gain = gain.div(player.points.div(4).pow(fourthSoftcapStrength))}

	fifthSoftcapStrength = new Decimal(1200)
	if (player.points.gte(5)) {gain = gain.div(player.points.div(5).pow(fifthSoftcapStrength))}

	sixthSoftcapStrength = new Decimal(7200)
	if (player.points.gte(6)) {gain = gain.div(player.points.div(6).pow(sixthSoftcapStrength))}

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
		if (type == "large") { //large = base^base^(x+1)^pow
			if (limit.lte('ee10')) {limit = new Decimal('ee10')} //limit is softcap, in currency at which scaling change to triple exponential : linear
			if (base.pow(base.pow(amt.add(1).pow(exp))).floor().gt(limit)) {
				limitamt = limit.log10().div(base.log10()).log10().div(base.log10()).root(exp).sub(1)
				limitamtplus1 = limitamt.add(1)
				limitpricetriplelog = limit.log10().log10().log10()
				limitplus1pricetriplelog = base.pow(base.pow(limitamtplus1.add(1).pow(exp))).log10().log10().log10()
				newpricescalingtriplelog = limitplus1pricetriplelog.sub(limitpricetriplelog)
				return amt.sub(limitamt).times(newpricescalingtriplelog).add(limitpricetriplelog).pow10().pow10().pow10()
			} else {
				return base.pow(base.pow(amt.add(1).pow(exp))).floor()
			}
		}
		if (type == "normal") { //normal = base^(x+1)^pow
			if (limit.lte('e10')) {limit = new Decimal('e10')} //limit is softcap, in currency at which scaling change to double exponential : linear
			if (base.pow(amt.add(1).pow(exp)).gt(limit)) {
				limitamt = limit.log10().div(base.log10()).pow(exp.pow(-1)).sub(1)
				limitamtplus1 = limitamt.add(1)
				limitpriceloglog = limit.log10().log10()
				limitplus1priceloglog = base.pow(limitamtplus1.add(1).pow(exp)).log10().log10()
				newpricescalingloglog = limitplus1priceloglog.sub(limitpriceloglog)
				return amt.sub(limitamt).times(newpricescalingloglog).add(limitpriceloglog).pow10().pow10()
			} else {
				return base.pow(amt.add(1).pow(exp)).floor()
			}
		}
		if (type == "small") { //small = base*(x+1)^pow
			if (limit.lte('10')) {limit = new Decimal('10')} //limit is softcap, in currency at which scaling change to exponential : linear
			if (base.times(amt.add(1).pow(exp)).gt(limit)) {
				limitamt = limit.div(base).root(exp).sub(1)
				limitamtplus1 = limitamt.add(1)
				limitpricelog = limit.log10()
				limitplus1pricelog = base.times(limitamtplus1.add(1).pow(exp)).log10()
				newpricescalinglog = limitplus1pricelog.sub(limitpricelog)
				return amt.sub(limitamt).times(newpricescalinglog).add(limitpricelog).pow10()
			} else {
				return base.times(amt.add(1).pow(exp)).floor()
			}
		}

		if (type == "asymptote") {
			return base.pow(amt.add(1).times(limit).div(Decimal.sub(limit, amt)).pow(exp)).floor() //limit is hard limit, in buyable amount. softcap not needed since hardcapped
		}
		

	},
	buyableMaxPurchaseable(type, currency, base, exp, limit) {
		if (type == "large") {
			if (limit.lte('ee10')) {limit = new Decimal('ee10')} //limit is softcap, in currency at which scaling change to triple exponential : linear
			if (currency.gt(limit)) {
				limitamt = limit.log10().div(base.log10()).log10().div(base.log10()).root(exp).sub(1).floor()
				limitamtplus1 = limitamt.add(1)
				limitpricetriplelog = base.pow(base.pow(limitamt.add(1).pow(exp))).log10().log10().log10()
				limitplus1pricetriplelog = base.pow(base.pow(limitamtplus1.add(1).pow(exp))).log10().log10().log10()
				newpricescalingtriplelog = limitplus1pricetriplelog.sub(limitpricetriplelog)
				return currency.log10().log10().log10().sub(limitpricetriplelog).div(newpricescalingtriplelog).add(limitamt).ceil()
			}
			else return currency.max(10).log10().div(base.log10()).log10().div(base.log10()).root(exp).sub(1)
		}
		if (type == "normal") {
			if (limit.lte('e10')) {limit = new Decimal('e10')}
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
		if (type == "small") {
			if (limit.lte('10')) {limit = new Decimal('10')}
			if (currency.gt(limit)) {
				limitamt = limit.div(base).root(exp).sub(1).floor()
				limitamtplus1 = limitamt.add(1)
				limitpricelog = base.times(limitamt.add(1).pow(exp)).log10()
				limitplus1pricelog = base.times(limitamtplus1.add(1).pow(exp)).log10()
				newpricescalinglog = limitplus1pricelog.sub(limitpricelog)	
				return currency.log10().sub(limitpricelog).div(newpricescalinglog).add(limitamt).ceil()			
			} else {
				return currency.max(0).div(base).root(exp).sub(1).floor()
			}
		}
	},
	roundTime(minutes) {
		if (minutes.lte(60)) {floorminutes = Decimal.dOne} //120 = 2*60
		else if (minutes.lte(120)) {floorminutes = Decimal.dTwo} //360 = 6*60
		else if (minutes.lte(360)) {floorminutes = new Decimal(5)} //720 = 12*60
		else if (minutes.lte(720)) {floorminutes = Decimal.dTen} //1440 = 24*60	
		else if (minutes.lte(1440)) {floorminutes = new Decimal(15)} //2880 = 2*1440	
		else if (minutes.lte(2880)) {floorminutes = new Decimal(30)} //5760 = 4*1440
		else if (minutes.lte(5760)) {floorminutes = new Decimal(60)} //10080 = 7*1440
		else if (minutes.lte(10080)) {floorminutes = new Decimal(120)} //21600 = 15*1440
		else if (minutes.lte(21600)) {floorminutes = new Decimal(360)} //43200 = 30*1440
		else if (minutes.lte(43200)) {floorminutes = new Decimal(720)} 
		else {floorminutes = new Decimal(1440)}
		return minutes.div(floorminutes).round().times(floorminutes)
	},
	row2normalBuyableSoftcap() {
		capexp = new Decimal(100)
		capexp = capexp.add(buyableEffect('l', 12))
		capexp = capexp.times(buyableEffect('mtp', 31))
		return Decimal.dTen.pow(capexp)
	},
	
	worldInventory: [
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
		Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero, Decimal.dZero,
	],
	worldInventorysublist(type) {
		sublist = []
		for (i = 0; i < player.worldInventory.length / 10 ; i++) {
			sublist[i] = player.worldInventory[10 * i + type]
		}
		return sublist
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
	return(1) // set to 1 secomdds
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){


}

