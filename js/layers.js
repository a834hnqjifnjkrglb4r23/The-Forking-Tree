addLayer("l", {
    name: "lootboxes", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "L", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#e6c72e",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "lootboxes", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {
        if (getClickableState('l', 11)=="") {
            setClickableState('l', 11, [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]])
        }

        if (typeof(textdescription)=="undefined") {textdescription = ""}
        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addl = new Decimal(0)


        multl = new Decimal(0.333333333333333333)
        

        return multl
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expl = new Decimal(1)


        exp2l = new Decimal(0.5)

        return expl
    },
    getResetGain() {
        lp = player.points.add(addl).times(multl).pow(expl)
        if (lp.gte(1)) {lp = lp.log10().pow(exp2l).pow10()}

        return lp.floor().max(0)
    },
    getNextAt() {
        nextl = getResetGain('l').add(1)
        if (nextl.gte(1)) {nextl = nextl.log10().root(exp2l).pow10()}
        return nextl.root(expl).div(multl).sub(addl)
    },
    canReset() {return getResetGain('l').gte(0)},

    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('l'))+" lootboxes. Next at "+format(getNextAt('l'))+" points" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "l", description: "L: Reset for lootboxes", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.points.gte(3)||player.l.total.gte(1)},
    clickables: {
        11: { //gear level grid, numbers
            unlocked: false,
            onClick() {
            },
            canClick() {return false},

        },

    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {

                return Decimal.dOne
            },
            effect(x) {
                gearpower = [[Decimal.dOne, Decimal.dOne, Decimal.dZero, Decimal.dZero], [Decimal.dOne, Decimal.dOne, Decimal.dZero, Decimal.dZero], [Decimal.dOne, Decimal.dOne, Decimal.dZero, Decimal.dZero], [Decimal.dOne, Decimal.dOne, Decimal.dZero, Decimal.dZero]]
                gearpower[0][0] = new Decimal(getClickableState('l', 11)[0][0]).add(39.770640859342509633).div(39.770640859342509633).pow(1.5) // ((x+a)/b)^p = 1, 50
                gearpower[0][1] = new Decimal(getClickableState('l', 11)[0][1]).add(15.060459189213234906).div(15.060459189213234906).pow(1.5) // ((x+a)/b)^p = 1, 200
                gearpower[0][2] = new Decimal(getClickableState('l', 11)[0][2]).div(62.5) //0, 8
                gearpower[0][3] = new Decimal(getClickableState('l', 11)[0][3]).div(25) //0, 20

                gearpower[1][0] = new Decimal(getClickableState('l', 11)[1][0]).div(36.840314986403866058).pow(1.5)  // 0, 50
                gearpower[1][1] = new Decimal(getClickableState('l', 11)[1][1]).div(14.620088691064330328).pow(1.5) // 0, 200
                gearpower[1][2] = new Decimal(getClickableState('l', 11)[1][2]).div(50) //0, 10
                gearpower[1][3] = new Decimal(getClickableState('l', 11)[1][3]).div(50) //0, 10

                gearpower[2][0] = new Decimal(getClickableState('l', 11)[2][0]).add(24.337595272607097033).div(24.337595272607097033).pow(6)  // 1, 10^8
                gearpower[2][1] = new Decimal(getClickableState('l', 11)[2][1]).add(5.0505050505050505051).div(5.0505050505050505051).pow(6)  // 1, 10^12
                gearpower[2][2] = new Decimal(getClickableState('l', 11)[2][2]).div(921.00787466009665144).pow(1.5) // 0, 0.4
                gearpower[2][3] = new Decimal(getClickableState('l', 11)[2][3]).div(5000) //0, 0.1

                gearpower[3][0] = new Decimal(getClickableState('l', 11)[3][0]).add(137.30270572692735409).div(137.30270572692735409).pow(6) // 1, 10^4
                gearpower[3][1] = new Decimal(getClickableState('l', 11)[3][1]).add(55.555555555555555556).div(55.555555555555555556).pow(6) // 1, 10^6
                gearpower[3][2] = new Decimal(getClickableState('l', 11)[3][2]).div(1462.0088691064330328).pow(1.5) // 0, 0.2
                gearpower[3][3] = new Decimal(getClickableState('l', 11)[3][3]).div(5000) //0, 0.1


                return gearpower
            },
            title() { return "open a lootbox"},
            display() { 
                text = "to get a random effect"
                return text},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                lootboxseed = Math.random() * 10000

                geartypecoef = Math.floor(lootboxseed / 100)
                geartypebounds = [23, 20, 31, 26] //points, bp, prestige, all row 2
                if (hasMilestone('m', 4)) {geartypebounds = [25, 25, 25, 25]}
                geartypeboundstotal = [geartypebounds[0], geartypebounds[0]+geartypebounds[1], geartypebounds[0]+geartypebounds[1]+geartypebounds[2], geartypebounds[0]+geartypebounds[1]+geartypebounds[2]+geartypebounds[3]]
                if (geartypecoef < geartypeboundstotal[0]) {geartype = 0}
                else if (geartypecoef < geartypeboundstotal[1]) {geartype = 1}
                else if (geartypecoef < geartypeboundstotal[2]) {geartype = 2}
                else if (geartypecoef < geartypeboundstotal[3]) {geartype = 3} 

                geartiercoef = Math.floor(lootboxseed % 100)
                geartierbounds = [42, 35, 15, 8] //+, x, ^/sc1, ^x^/sc2#
                if (hasMilestone('m', 3)) {geartierbounds = [37, 32, 18, 13]}
                if (hasMilestone('m', 5)) {geartierbounds = [25, 25, 25, 25]}
                geartierboundstotal = [geartierbounds[0], geartierbounds[0]+geartierbounds[1], geartierbounds[0]+geartierbounds[1]+geartierbounds[2], geartierbounds[0]+geartierbounds[1]+geartierbounds[2]+geartierbounds[3]]
                if (geartiercoef < geartierboundstotal[0]) {geartier = 0}
                else if (geartiercoef < geartierboundstotal[1]) {geartier = 1}
                else if (geartiercoef < geartierboundstotal[2]) {geartier = 2}
                else if (geartiercoef < geartierboundstotal[3]) {geartier = 3}

                gearlevelcoef = (lootboxseed % 1)**2
                gearmultiplier = getBuyableAmount('j', 101).sub(3).times(250).toNumber()
                gearlevel = Math.min(Math.max(Math.floor((1 + gearlevelcoef) * gearmultiplier), 1), 500)

                textdescription = "you've drawn a level "+gearlevel.toString()+" "+["common", "uncommon", "rare", "legendary"][geartier]+" "+["points", "bonus points", "prestige", "row 2"][geartype]+" gear."
                if (getClickableState('l', 11)[geartype][geartier] < gearlevel) {
                    newgeargrid = getClickableState('l', 11)
                    oldgearlevel = newgeargrid[geartype][geartier]
                    newgeargrid[geartype][geartier] = gearlevel
                    setClickableState('l', 11, newgeargrid)
                    textdescription += "<br> this is better than your old gear, so you replace it and sell the old gear for "

                    gearleveldecimal = new Decimal(gearlevel)


                    
                } else {
                    oldgearlevel = gearlevel
                    textdescription += "this is not better than your old gear, so you sell it for "
                }

                sellprice = Math.max(oldgearlevel / 100, oldgearlevel ** 2 / 10000) 
                if (geartier == 3) {sellprice *= 4}
                if (geartier == 2) {sellprice *= 2}
                sellprice = Math.floor(sellprice * 100) / 100
                textdescription += "$"+sellprice.toFixed(2)
                addPoints('j', sellprice)

            },
        },

    },
    upgrades: {

    },

    infoboxes: {
        11: {
            body() {
                mingearlevel = Math.floor(Math.max(Math.min(getBuyableAmount('j', 101).sub(3).times(250).toNumber(), 500), 1))
                maxgearlevel = Math.floor(Math.max(Math.min(getBuyableAmount('j', 101).sub(3).times(250).toNumber() * 2, 500), 1))
                textl = "Current gear level: "+mingearlevel.toString()+" to "+maxgearlevel.toString()
                textl += "<br> Points: x"+format(gearpower[0][0])+", x"+format(gearpower[0][1])+", -"+format(gearpower[0][2])+" to 2nd sc, -"+format(gearpower[0][3])+" to 3rd sc"
                textl += "<br> Bonus points: x"+format(gearpower[1][0])+", x"+format(gearpower[1][1])+", -"+format(gearpower[1][2])+" to 1st sc, -"+format(gearpower[1][3])+" to 2nd sc"
                textl += "<br> Prestige: x"+format(gearpower[2][0])+", x"+format(gearpower[2][1])+", +"+format(gearpower[2][2])+" to exp, +"+format(gearpower[2][3])+" to 2nd exp"
                textl += "<br> 2nd row: x"+format(gearpower[3][0])+", x"+format(gearpower[3][1])+", +"+format(gearpower[3][2])+" to exp, +"+format(gearpower[3][3])+" to 2nd exp"
                
                textl += "<br><br>"+textdescription
                return textl}
        }
    }, 
})

addLayer("j", {
    name: "job", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "J", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ffff33",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "dollars", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {
        if (typeof(lastClickedTime)=="undefined") {lastClickedTime = Date.now()}
        if (getClickableState('j', 11) == '') {setClickableState('j', 11, 0)}
        if (typeof(getClickableState('j', 11)) == 'undefined') {setClickableState('j', 11, 0)}
        if (getClickableState('j', 12) == '') {setClickableState('j', 12, 0)}
        if (typeof(getClickableState('j', 12)) == 'undefined') {setClickableState('j', 12, 0)}
        if (getClickableState('j', 13) == '') {setClickableState('j', 13, 0)}
        if (typeof(getClickableState('j', 13)) == 'undefined') {setClickableState('j', 13, 0)}
        if (getClickableState('j', 14) == '') {setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))}
        if (typeof(getClickableState('j', 14)) == 'undefined') {setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))}
        if (getClickableState('j', 15) == '') {setClickableState('j', 15, 7.25)}
        if (typeof(getClickableState('j', 15)) == 'undefined') {setClickableState('j', 15, 7.25)}
        return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "This layer cannot be reset" },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    doReset(resettingLayer) {
        return;
    },
    update(diff){
        if (player.points.gte(getBuyableAmount('j', 101))) {setBuyableAmount('j', 101, player.points)}
    },
    infoboxes: {
        11: {
            body() {return "you have $"+formatMoney(player.j.points, 2)+" left"}
        }
    }, 
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dZero
            },
            effect(x) {
                wages = getClickableState('j', 15)
                clicksPerHour = 4800
                owedMoney = Math.floor(getClickableState('j', 11)*wages/clicksPerHour*100)/100
                return Decimal.dZero
            },
            title() { return "get paid for all the work you did"},
            display() { return "you have clicked "+getClickableState('j', 11)+" times <br> your wages are $"+wages.toFixed(2)+" per "+clicksPerHour+" clicks <br> you are owed $"+owedMoney+"<br> you may get a payday after "+timeUntilPayday+" seconds"},
            canAfford() { 
                nextPaydayTime = getClickableState('j', 12) + 21600000
                timeUntilPayday = Math.ceil(Math.max(nextPaydayTime - Date.now(), 0)/1000)
                return timeUntilPayday == 0},
            buy() {
                player[this.layer].points = player[this.layer].points.add(owedMoney)
                clicksToBeTotalled = getClickableState('j', 11)
                setClickableState('j', 11, 0)
                setClickableState('j', 12, Date.now())

                if (getClickableState('j', 14) == Math.floor((Date.now()-342000000)/604800000)) {setClickableState('j', 13, getClickableState('j', 13)+clicksToBeTotalled)} else {setClickableState('j', 13, clicksToBeTotalled)}
                setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))
                
                //states:
                //11 is the amount of clicks unpaid
                //12 is the last time player got paid
                //13 is the amount of total paid clicks this week
                //14 is the week number 
                //15 is the raise
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dZero
            },
            effect(x) {
                clicksGoal = getClickableState('j', 15)*2400
                raiseChance = Math.min(Math.max((getClickableState('j', 13)-clicksGoal)/4800, 0), 1)

                return Decimal.dZero
            },
            title() { return "apply for a 25c raise"},
            display() { return "you have clicked "+getClickableState('j', 13)+" times this week <br> your productivity goal is "+clicksGoal+" clicks each week <br> if you apply for a raise now, there's a "+Math.floor(raiseChance*10000)/100+"% chance you'll get it"},
            canAfford() { 
                return true},
            buy() {
                if (Math.random() <= raiseChance) {setClickableState('j', 15, getClickableState('j', 15)+0.25)}
                setClickableState('j', 13, 0)
                
            },
        },
        101: {// best poitns
            unlocked() {return false},
            cost(x) {

                return Decimal.dOne
            },
            effect(x) {
                return new Decimal(123)
            },
            canAfford() { return false},
            buy() {

            },
        },
    },
    clickables: {
        11: {
            display: "click me",
            onClick() {
                
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 0}
        },
        12: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 1}
        },
        13: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 2}
        },
        21: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 3}
        },
        22: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 4}
        },
        23: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 5}
        },
        31: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 6}
        },
        32: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 7}
        },
        33: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 8}
        },
        41: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 9}
        },
        42: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 10}
        },
        43: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 11}
        },
        51: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 12}
        },
        52: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 13}
        },
        53: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 14}
        },
        61: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 15}
        },
        62: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 16}
        },
        63: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 17}
        },
        71: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 18}
        },
        72: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 19}
        },
        73: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 20}
        },
        81: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 21}
        },
        82: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 22}
        },
        83: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 23}
        },
        91: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 24}
        },
        92: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 25}
        },
        93: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+1)
            },
            canClick() {return lastClickedTime % 27 == 26}
        },
    }
})

addLayer("sj", {
    name: "superjob", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SJ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#c08c8c",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "nothing", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {
        if (typeof(lastClickedTimeS)=="undefined") {lastClickedTimeS = Date.now()}
        return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "This layer cannot be reset" },
    row: "side", // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    doReset(resettingLayer) {
        return;
    },
    infoboxes: {
        11: {
            body() {return "each click in the superjob counts as 5 clicks in the job"}
        }
    }, 
    buyables: {
    },
    clickables: {
        11: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 0}
        },
        12: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 1}
        },
        13: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 2}
        },
        21: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 3}
        },
        22: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 4}
        },
        23: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 5}
        },
        31: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 6}
        },
        32: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 7}
        },
        33: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 8}
        },
        41: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 9}
        },
        42: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 10}
        },
        43: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 11}
        },
        51: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 12}
        },
        52: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 13}
        },
        53: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 14}
        },
        61: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 15}
        },
        62: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 16}
        },
        63: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 17}
        },
        71: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 18}
        },
        72: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 19}
        },
        73: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 20}
        },
        81: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 21}
        },
        82: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 22}
        },
        83: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 23}
        },
        91: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 24}
        },
        92: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 25}
        },
        93: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setClickableState('j', 11, getClickableState('j', 11)+5)
            },
            canClick() {return lastClickedTimeS % 27 == 26}
        },
    }
})

addLayer("g", {
    name: "in-game shop", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#3333ff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "gems", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {return false},
    prestigeNotify() {return true},
    row: "side", // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer) {

        return;
    },
    update(diff){
        setBuyableAmount('g', 41, getBuyableAmount('g', 41).sub(diff).max(0))
        setBuyableAmount('g', 42, getBuyableAmount('g', 42).sub(diff).max(0))
        setBuyableAmount('g', 43, getBuyableAmount('g', 43).sub(diff).max(0))
    },
    infoboxes: {
        11: {
            body() {
                vipLevel = getBuyableAmount('g', 11).max(100).div(100).log(2).floor()
                vipEffect = vipLevel.div(60)
                text = "you have "+formatWhole(getBuyableAmount('g', 11))+" vip points, which gives you vip level "+formatWhole(vipLevel)
                text += "<br> your vip levels gives you "+format(vipEffect.times(100), 1)+"% free gems on gem purchases"
                text += "<br> you need "+formatWhole(Decimal.dTwo.pow(vipLevel.add(1)).times(100).sub(getBuyableAmount('g', 11)))+" vip points to get the next level"
                return text
            
            }
        }
    }, 
    layerShown(){return true},

    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(0.49)
            },
            effect(x) {
                baseGems1 = new Decimal(60)
                gemMultiplier1 = new Decimal(1).add(vipEffect)
                vipPoints1 = new Decimal(30)

                return Decimal.times(baseGems1, gemMultiplier1).round()
            },
            title() { return "gems pack 1"},
            display() { 
                text = "gives "+format(baseGems1, 0)+" gems "
                if (gemMultiplier1.gt(1)) {text += "with "+format(gemMultiplier1.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems. "}
                text += "<br> also gives "+format(vipPoints1, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints1))
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(0.99)
            },
            effect(x) {
                baseGems2 = new Decimal(120)
                gemMultiplier2 = new Decimal(1.05).add(vipEffect)
                vipPoints2 = new Decimal(63)

                return Decimal.times(baseGems2, gemMultiplier2).round()
            },
            title() { return "gems pack 2"},
            display() { 
                text = "gives "+format(baseGems2, 0)+" gems "
                if (gemMultiplier2.gt(1)) {text += "with "+format(gemMultiplier2.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints2, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints2))
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(1.99)
            },
            effect(x) {
                baseGems3 = new Decimal(240)
                gemMultiplier3 = new Decimal(1.1).add(vipEffect)
                vipPoints3 = new Decimal(132)

                return Decimal.times(baseGems3, gemMultiplier3).round()
            },
            title() { return "gems pack 3"},
            display() { 
                text = "gives "+format(baseGems3, 0)+" gems "
                if (gemMultiplier3.gt(1)) {text += "with "+format(gemMultiplier3.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints3, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints3))
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(4.99)
            },
            effect(x) {
                baseGems4 = new Decimal(600)
                gemMultiplier4 = new Decimal(1+1/6).add(vipEffect)
                vipPoints4 = new Decimal(350)

                return Decimal.times(baseGems4, gemMultiplier4).round()
            },
            title() { return "gems pack 4"},
            display() { 
                text = "gives "+format(baseGems4, 0)+" gems "
                if (gemMultiplier4.gt(1)) {text += "with "+format(gemMultiplier4.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints4, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints4))
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(9.99)
            },
            effect(x) {
                baseGems5 = new Decimal(1200)
                gemMultiplier5 = new Decimal(1.05+1/6).add(vipEffect)
                vipPoints5 = new Decimal(730)

                return Decimal.times(baseGems5, gemMultiplier5).round()
            },
            title() { return "gems pack 5"},
            display() { 
                text = "gives "+format(baseGems5, 0)+" gems "
                if (gemMultiplier5.gt(1)) {text += "with "+format(gemMultiplier5.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints5, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints5))
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(19.99)
            },
            effect(x) {
                baseGems6 = new Decimal(2400)
                gemMultiplier6 = new Decimal(1.1+1/6).add(vipEffect)
                vipPoints6 = new Decimal(1520)

                return Decimal.times(baseGems6, gemMultiplier6).round()
            },
            title() { return "gems pack 6"},
            display() { 
                text = "gives "+format(baseGems6, 0)+" gems "
                if (gemMultiplier6.gt(1)) {text += "with "+format(gemMultiplier6.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints6, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints6))
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(49.99)
            },
            effect(x) {
                baseGems7 = new Decimal(6000)
                gemMultiplier7 = new Decimal(1+1/3).add(vipEffect)
                vipPoints7 = new Decimal(4000)

                return Decimal.times(baseGems7, gemMultiplier7).round()
            },
            title() { return "gems pack 7"},
            display() { 
                text = "gives "+format(baseGems7, 0)+" gems "
                if (gemMultiplier7.gt(1)) {text += "with "+format(gemMultiplier7.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints7, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints7))
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(99.99)
            },
            effect(x) {
                baseGems8 = new Decimal(12000)
                gemMultiplier8 = new Decimal(1.05+1/3).add(vipEffect)
                vipPoints8 = new Decimal(8300)

                return Decimal.times(baseGems8, gemMultiplier8).round()
            },
            title() { return "gems pack 8"},
            display() { 
                text = "gives "+format(baseGems8, 0)+" gems "
                if (gemMultiplier8.gt(1)) {text += "with "+format(gemMultiplier8.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints8, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints8))
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {

                return new Decimal(199.99)
            },
            effect(x) {
                baseGems9 = new Decimal(24000)
                gemMultiplier9 = new Decimal(1.1+1/3).add(vipEffect)
                vipPoints9 = new Decimal(17200)

                return Decimal.times(baseGems9, gemMultiplier9).round()
            },
            title() { return "gems pack 9"},
            display() { 
                text = "gives "+format(baseGems9, 0)+" gems "
                if (gemMultiplier9.gt(1)) {text += "with "+format(gemMultiplier9.sub(1).times(100), 1)+"% free gems, boosted to "+format(this.effect(), 0)+" gems"}
                text += "<br> also gives "+format(vipPoints9, 0)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPoints9))
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(10)
            },
            effect(x) {

                return new Decimal(2)
            },
            title() { return "x2 points for 1 day"},
            display() { return "point gain is x"+format(this.effect(), 0)+" for 1 day <br> left: "+format(getBuyableAmount('g', 41))+" <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(86400))

            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(30)
            },
            effect(x) {

                return new Decimal(4)
            },
            title() { return "x4 points for 12 hours"},
            display() { return "point gain is x"+format(this.effect(), 0)+" for 12 hours <br> left: "+format(getBuyableAmount('g', 42))+" <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(43200))

            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                

                return new Decimal(300)
            },
            effect(x) {

                return new Decimal(24)
            },
            title() { return "x24 points for 4 hours"},
            display() { return "point gain is x"+format(this.effect(), 0)+" for 4 hours <br> left: "+format(getBuyableAmount('g', 43))+" <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(14400))

            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                cost = new Decimal(2)
                if (hasMilestone('m', 1)) {cost = new Decimal(1)}

                return cost
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant prestige"},
            display() { return "instantly gain your prestige points on prestige <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('p', getResetGain('p'))

            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costBaseg52 = new Decimal(2)

                costMultg52 = new Decimal(x).add(5)
                return Decimal.times(costBaseg52, costMultg52).floor()
            },
            effect(x) {
                effBaseg52 = new Decimal(0.1)
                effStackg52 = new Decimal(x)

                return Decimal.times(effBaseg52, effStackg52)
            },
            title() { return "free prestige points"},
            display() { return "add prestige point gain by "+format(effBaseg52)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackg52)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costBaseg53 = new Decimal(5)

                costMultg53 = new Decimal(x).add(5)
                return Decimal.times(costBaseg53, costMultg53).floor()
            },
            effect(x) {
                effBaseg53 = new Decimal(0.1)
                effStackg53 = new Decimal(x)

                return Decimal.times(effBaseg53, effStackg53)
            },
            title() { return "free prestige point multi"},
            display() { return "add prestige point gain multiplier by "+format(effBaseg53)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackg53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        61: {
            unlocked() {return true},
            cost(x) {
                cost = new Decimal(25)
                if (hasMilestone('m', 1)) {cost = new Decimal(5)}

                return cost
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant metaprestige"},
            display() { return "instantly gain your metaprestige points on metaprestige <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('mp', getResetGain('mp'))
            },
        },
        62: {
            unlocked() {return true},
            cost(x) {
                cost = new Decimal(27)
                if (hasMilestone('m', 1)) {cost = new Decimal(6)}

                return cost
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant buyable points"},
            display() { return "instantly gain your buyable points on buyable <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('bp', getResetGain('bp'))
            },
        },
        63: {
            unlocked() {return true},
            cost(x) {
                cost = new Decimal(30)
                if (hasMilestone('m', 1)) {cost = new Decimal(7)}

                return cost
            },
            effect(x) {


                return new Decimal(2)
            },
            title() { return "instant superprestige"},
            display() { return "instantly gain your superprestige points on superprestige <br> cost: "+format(this.cost())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                addPoints('sp', getResetGain('sp'))
            },
        },

    },
})

addLayer("m", {
    name: "milestones", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#e08080",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "milestones", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {return false},
    prestigeNotify() {return true},
    row: "side", // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer) {

        return;
    },
    layerShown(){return true},
    milestones: {
        0: {
            requirementDescription: "2.00 points",
            effectDescription: "automates prestige buyables",
            done() { return player.points.gte(2) },
            toggles: [["p", "autoBuy"]]
        },
        1: {
            requirementDescription: "2.50 points",
            effectDescription: "gain prestige gain on reset per 5 seconds, instant prestige gets cheaper and automates mp, bp, sp buyables",
            done() { return player.points.gte(2.5) },
            toggles: [["p", "autoGain"], ["bp", "autoBuy"]]

        },
        2: {
            requirementDescription: "3.00 points",
            effectDescription: "prestige doesnt get reset, instant row 2 gets cheaper",
            done() { return player.points.gte(3) },

        },
        3: {
            requirementDescription: "3.25 points",
            effectDescription: "better rarity on lootboxes",
            done() { return player.points.gte(3.25) },

        },
        4: {
            requirementDescription: "3.50 points",
            effectDescription: "better type on lootboxes",
            done() { return player.points.gte(3.5) },

        },
        5: {
            requirementDescription: "3.75 points",
            effectDescription: "better rarity on lootboxes",
            done() { return player.points.gte(3.75) },

        },
    },
})

addLayer("b", {
    name: "bonus points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#d0f0fe",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "bonus points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        return Decimal.dOne
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return Decimal.dOne
    },
    getResetGain() {
        basebgain = Decimal.max(buyableEffect('l', 11)[1][0].times(buyableEffect('l', 11)[1][1]), buyableEffect('l', 11)[1][0].add(buyableEffect('l', 11)[1][1]))// need change here 

        bgain = basebgain


        bfirstSoftcapStrength = new Decimal(20)
        bfirstSoftcapStrength = bfirstSoftcapStrength.sub(buyableEffect('l', 11)[1][2])
        if (player.b.points.gte(1)) {bgain = bgain.div(player.b.points.pow(bfirstSoftcapStrength))}

        bsecondSoftcapStrength = new Decimal(20)
        bsecondSoftcapStrength = bsecondSoftcapStrength.sub(buyableEffect('l', 11)[1][3])
        if (player.b.points.gte(2)) {bgain = bgain.div(player.b.points.div(2).pow(bsecondSoftcapStrength))}

        bthirdSoftcapStrength = new Decimal(60)
        if (player.b.points.gte(3)) {bgain = bgain.div(player.b.points.div(3).pow(bthirdSoftcapStrength))}

        bfourthSoftcapStrength = new Decimal(240)
        if (player.b.points.gte(4)) {bgain = bgain.div(player.b.points.div(4).pow(bfourthSoftcapStrength))}
        
        if (player.b.points.gte(9)) {bgain = bgain.times(player.b.points.sub(10).times(-1))} //***** */
        return bgain.min(1)
    },
    getNextAt() {

        return Decimal.dOne
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    passiveGeneration() {
        return Decimal.dOne
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return player.l.total.gte(1)},
    infoboxes: {
        11: {

            body() {return "you have "+format(player.b.points, 4)+" bonus points, multiplying point gain by "+format(player.b.points.add(1), 4)}
        }
    }, 
    buyables: {
    },
})

addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#6cdb40",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addp = new Decimal(0)
        addp = addp.add(buyableEffect('p', 21))
        addp = addp.add(buyableEffect('mp', 21))
        addp = addp.add(buyableEffect('bp', 21))
        addp = addp.add(buyableEffect('sp', 21))
        addp = addp.add(buyableEffect('g', 52))


        multp = new Decimal(1)
        multp = multp.add(buyableEffect('p', 22))
        multp = multp.add(buyableEffect('mp', 22))
        multp = multp.add(buyableEffect('bp', 22))
        multp = multp.add(buyableEffect('sp', 22))
        multp = multp.add(buyableEffect('g', 53))
        multp = multp.times(buyableEffect('l', 11)[2][0]).times(buyableEffect('l', 11)[2][1])

        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(4).times(buyableEffect('l', 11)[2][2].add(1))
        expp = expp.add(buyableEffect('p', 23))
        expp = expp.add(buyableEffect('mp', 23))
        expp = expp.add(buyableEffect('bp', 23))
        expp = expp.add(buyableEffect('sp', 23))
        

        exp2p = new Decimal(0.5).add(buyableEffect('l', 11)[2][3])
        exp2p = exp2p.add(buyableEffect('p', 24))
        exp2p = exp2p.add(buyableEffect('mp', 24))
        exp2p = exp2p.add(buyableEffect('bp', 24))
        exp2p = exp2p.add(buyableEffect('sp', 24))


        return expp
    },
    getResetGain() {
        pp = player.points.add(addp).times(multp).pow(expp)
        if (pp.gte(1)) {pp = pp.log10().pow(exp2p).pow10()}

        return pp.floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1)
        if (nextp.gte(1)) {nextp = nextp.log10().pow(exp2p.pow(-1)).pow10()}
        return nextp.root(expp).div(multp).sub(addp)
    },
    canReset() {return getResetGain('p').gte(0)&&!(hasMilestone('m', 1)&&player.p.autoGain)},
    passiveGeneration() {
        if (hasMilestone('m', 1)) {
            if (player.p.autoGain) {return new Decimal(0.2)} else {return Decimal.dZero}
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    automate() {
        if (hasMilestone('m', 0)&&player.p.autoBuy) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) {
        if ((layers[resettingLayer].row > this.row)&&(!hasMilestone('m', 2))) {layerDataReset(this.layer, [])}

    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypep11 = "normal"
                costBasep11 = new Decimal(1.3)
                costExpp11 = new Decimal(1.1)
                costLimitp11 = new Decimal('e100')
                return player.buyablePrice(costTypep11, new Decimal(x), costBasep11, costExpp11, costLimitp11)
            },
            effect(x) {
                effBasep11 = new Decimal(0.1)
                effStackp11 = new Decimal(x)

                return Decimal.times(effBasep11, effStackp11)
            },
            title() { return "prestige buyable 11"},
            display() { return "increase base point gain by "+format(effBasep11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep11 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep11, player[this.layer].points, costBasep11, costExpp11, costLimitp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep11, player[this.layer].points, costBasep11, costExpp11, costLimitp11))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep11, player.buyableMaxPurchaseable(costTypep11, player[this.layer].points, costBasep11, costExpp11, costLimitp11), costBasep11, costExpp11, costLimitp11))}
                    }
                }

            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypep12 = "normal"
                costBasep12 = new Decimal(1.5)
                costExpp12 = new Decimal(1.2)
                costLimitp12 = new Decimal('e100')
                return player.buyablePrice(costTypep12, new Decimal(x), costBasep12, costExpp12, costLimitp12)
            },
            effect(x) {
                effBasep12 = new Decimal(0.1)
                effStackp12 = new Decimal(x)

                return Decimal.times(effBasep12, effStackp12)
            },
            title() { return "prestige buyable 12"},
            display() { return "add point gain mult by "+format(effBasep12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep12 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep12, player[this.layer].points, costBasep12, costExpp12, costLimitp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep12, player[this.layer].points, costBasep12, costExpp12, costLimitp12))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep12, player.buyableMaxPurchaseable(costTypep12, player[this.layer].points, costBasep12, costExpp12, costLimitp12), costBasep12, costExpp12, costLimitp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costTypep13 = "asymptote"
                costBasep13 = new Decimal(1.7)
                costExpp13 = new Decimal(1.3)
                costLimitp13 = layers.p.buyables[13].purchaseLimit.add(1)
                return player.buyablePrice(costTypep13, new Decimal(x), costBasep13, costExpp13, costLimitp13)
            },
            effect(x) {
                effBasep13 = new Decimal(0.1)
                effStackp13 = new Decimal(x)

                return Decimal.times(effBasep13, effStackp13)
            },
            purchaseLimit: new Decimal(40),
            title() { return "prestige buyable 13"},
            display() { return "subtract first point softcap by "+format(effBasep13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep13 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep13, player[this.layer].points, costBasep13, costExpp13, costLimitp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep13, player[this.layer].points, costBasep13, costExpp13, costLimitp13))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep13, player.buyableMaxPurchaseable(costTypep13, player[this.layer].points, costBasep13, costExpp13, costLimitp13), costBasep13, costExpp13, costLimitp13))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypep21 = "normal"
                costBasep21 = new Decimal(1.5)
                costExpp21 = new Decimal(1.1)
                costLimitp21 = new Decimal('e100')
                return player.buyablePrice(costTypep21, new Decimal(x), costBasep21, costExpp21, costLimitp21)
            },
            effect(x) {
                effBasep21 = new Decimal(0.1)
                effStackp21 = new Decimal(x)

                return Decimal.times(effBasep21, effStackp21)
            },
            title() { return "prestige buyable 21"},
            display() { return "add base prestige point gain by "+format(effBasep21)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp21)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep21 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep21, player[this.layer].points, costBasep21, costExpp21, costLimitp21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep21, player[this.layer].points, costBasep21, costExpp21, costLimitp21))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep21, player.buyableMaxPurchaseable(costTypep21, player[this.layer].points, costBasep21, costExpp21, costLimitp21), costBasep21, costExpp21, costLimitp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypep22 = "normal"
                costBasep22 = new Decimal(1.7)
                costExpp22 = new Decimal(1.2)
                costLimitp22 = new Decimal('e100')
                return player.buyablePrice(costTypep22, new Decimal(x), costBasep22, costExpp22, costLimitp22)
            },
            effect(x) {
                effBasep22 = new Decimal(0.1)
                effStackp22 = new Decimal(x)

                return Decimal.times(effBasep22, effStackp22)
            },
            title() { return "prestige buyable 22"},
            display() { return "add prestige point gain mult by "+format(effBasep22)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp22)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep22 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep22, player[this.layer].points, costBasep22, costExpp22, costLimitp22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep22, player[this.layer].points, costBasep22, costExpp22, costLimitp22))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep22, player.buyableMaxPurchaseable(costTypep22, player[this.layer].points, costBasep22, costExpp22, costLimitp22), costBasep22, costExpp22, costLimitp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypep23 = "normal"
                costBasep23 = new Decimal(1.9)
                costExpp23 = new Decimal(1.4)
                costLimitp23 = new Decimal('e100')
                return player.buyablePrice(costTypep23, new Decimal(x), costBasep23, costExpp23, costLimitp23)
            },
            effect(x) {
                effBasep23 = new Decimal(0.2)
                effStackp23 = new Decimal(x)

                return Decimal.times(effBasep23, effStackp23)
            },
            title() { return "prestige buyable 23"},
            display() { return "add prestige point gain power by "+format(effBasep23)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep23 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep23, player[this.layer].points, costBasep23, costExpp23, costLimitp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep23, player[this.layer].points, costBasep23, costExpp23, costLimitp23))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep23, player.buyableMaxPurchaseable(costTypep23, player[this.layer].points, costBasep23, costExpp23, costLimitp23), costBasep23, costExpp23, costLimitp23))}
                    }
                }
            },
        },
        24: {
            unlocked() {return true},
            cost(x) {
                costTypep24 = "asymptote"
                costBasep24 = new Decimal(2.1)
                costExpp24 = new Decimal(1.6)
                costLimitp24 = layers.p.buyables[24].purchaseLimit.add(1)

                return player.buyablePrice(costTypep24, new Decimal(x), costBasep24, costExpp24, costLimitp24)
            },
            effect(x) {
                effBasep24 = new Decimal(0.01)
                effStackp24 = new Decimal(x)

                return Decimal.times(effBasep24, effStackp24)
            },
            purchaseLimit: new Decimal(10),
            title() { return "prestige buyable 24"},
            display() { return "add prestige point gain second power by "+format(effBasep24)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp24)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep24 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep24, player[this.layer].points, costBasep24, costExpp24, costLimitp24).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep24, player[this.layer].points, costBasep24, costExpp24, costLimitp24))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep24, player.buyableMaxPurchaseable(costTypep24, player[this.layer].points, costBasep24, costExpp24, costLimitp24), costBasep24, costExpp24, costLimitp24))}
                    }
                }
            },
        },
    },
})

addLayer("mp", {
    name: "metaprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#52db40",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "metaprestige points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.best}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addmp = new Decimal(0)
        addmp = addmp.add(buyableEffect('mp', 31))
        addmp = addmp.add(buyableEffect('bp', 31))
        addmp = addmp.add(buyableEffect('sp', 31))

        multmp = new Decimal(0.01)
        multmp = multmp.add(buyableEffect('mp', 32))
        multmp = multmp.add(buyableEffect('bp', 32))
        multmp = multmp.add(buyableEffect('sp', 32))

        multmp = multmp.times(buyableEffect('l', 11)[3][0]).times(buyableEffect('l', 11)[3][1])

        return multmp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expmp = new Decimal(0.5).times(buyableEffect('l', 11)[3][2].add(1))
        expmp = expmp.add(buyableEffect('mp', 33))
        expmp = expmp.add(buyableEffect('bp', 33))
        expmp = expmp.add(buyableEffect('sp', 33))


        exp2mp = new Decimal(0.5).add(buyableEffect('l', 11)[3][3])
        exp2mp = exp2mp.add(buyableEffect('mp', 34))
        exp2mp = exp2mp.add(buyableEffect('bp', 34))
        exp2mp = exp2mp.add(buyableEffect('sp', 34))


        return expmp
    },
    getResetGain() {
        mpp = player.p.best.add(addmp).times(multmp).pow(expmp)
        if (mpp.gte(1)) {mpp = mpp.log10().pow(exp2mp).pow10()}

        return mpp.floor().max(0)
    },
    getNextAt() {
        nextmp = getResetGain('mp').add(1)
        if (nextmp.gte(1)) {nextmp = nextmp.log10().root(exp2mp).pow10()}
        return nextmp.root(expmp).div(multmp).sub(addmp)
    },
    canReset() {return getResetGain('mp').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('mp'))+" metaprestige points. Next at "+format(getNextAt('mp'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for metaprestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return (player.p.best.gte(100)||player.mp.total.gte(1))},
    automate() {
        if (hasMilestone('m', 1)&&player.bp.autoBuy) {
            for (let i = 1; i < 6; i++) {
                for (let j = 1; j < 5; j++) {
                    if (canBuyBuyable('mp', i*10+j)) {buyMaxBuyable('mp', i*10+j)}
                }
            }
        }
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypemp11 = "normal"
                costBasemp11 = new Decimal(1.2)
                costExpmp11 = new Decimal(1.1)
                costLimitmp11 = new Decimal('e100')
                return player.buyablePrice(costTypemp11, new Decimal(x), costBasemp11, costExpmp11, costLimitmp11)
            },
            effect(x) {
                effBasemp11 = new Decimal(0.1)
                effStackmp11 = new Decimal(x)

                return Decimal.times(effBasemp11, effStackmp11)
            },
            title() { return "metaprestige buyable 11"},
            display() { return "increase base point gain by "+format(effBasemp11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp11 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp11, player[this.layer].points, costBasemp11, costExpmp11, costLimitmp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp11, player[this.layer].points, costBasemp11, costExpmp11, costLimitmp11))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp11, player.buyableMaxPurchaseable(costTypemp11, player[this.layer].points, costBasemp11, costExpmp11, costLimitmp11), costBasemp11, costExpmp11, costLimitmp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypemp12 = "normal"
                costBasemp12 = new Decimal(1.4)
                costExpmp12 = new Decimal(1.2)
                costLimitmp12 = new Decimal('e100')
                return player.buyablePrice(costTypemp12, new Decimal(x), costBasemp12, costExpmp12, costLimitmp12)
            },
            effect(x) {
                effBasemp12 = new Decimal(0.1)
                effStackmp12 = new Decimal(x)

                return Decimal.times(effBasemp12, effStackmp12)
            },
            title() { return "metaprestige buyable 12"},
            display() { return "add point gain mult by "+format(effBasemp12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp12 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp12, player[this.layer].points, costBasemp12, costExpmp12, costLimitmp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp12, player[this.layer].points, costBasemp12, costExpmp12, costLimitmp12))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp12, player.buyableMaxPurchaseable(costTypemp12, player[this.layer].points, costBasemp12, costExpmp12, costLimitmp12), costBasemp12, costExpmp12, costLimitmp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costTypemp13 = "asymptote"
                costBasemp13 = new Decimal(1.6)
                costExpmp13 = new Decimal(1.3)
                costLimitmp13 = layers.mp.buyables[13].purchaseLimit.add(1)

                return player.buyablePrice(costTypemp13, new Decimal(x), costBasemp13, costExpmp13, costLimitmp13)
            },
            effect(x) {
                effBasemp13 = new Decimal(0.1)
                effStackmp13 = new Decimal(x)

                return Decimal.times(effBasemp13, effStackmp13)
            },
            purchaseLimit: new Decimal(40),
            title() { return "metaprestige buyable 13"},
            display() { return "subtract first point softcap by "+format(effBasemp13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp13 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp13, player[this.layer].points, costBasemp13, costExpmp13, costLimitmp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp13, player[this.layer].points, costBasemp13, costExpmp13, costLimitmp13))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp13, player.buyableMaxPurchaseable(costTypemp13, player[this.layer].points, costBasemp13, costExpmp13, costLimitmp13), costBasemp13, costExpmp13, costLimitmp13))}
                    }
                }
            },
        },
        14: {
            unlocked() {return true},
            cost(x) {
                costTypemp14 = "asymptote"
                costBasemp14 = new Decimal(1.8)
                costExpmp14 = new Decimal(1.4)
                costLimitmp14 = layers.mp.buyables[14].purchaseLimit.add(1)

                return player.buyablePrice(costTypemp14, new Decimal(x), costBasemp14, costExpmp14, costLimitmp14)
            },
            effect(x) {
                effBasemp14 = new Decimal(0.1)
                effStackmp14 = new Decimal(x)

                return Decimal.times(effBasemp14, effStackmp14)
            },
            purchaseLimit: new Decimal(40),
            title() { return "metaprestige buyable 14"},
            display() { return "subtract second point softcap by "+format(effBasemp14)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp14)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp14 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp14, player[this.layer].points, costBasemp14, costExpmp14, costLimitmp14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp14, player[this.layer].points, costBasemp14, costExpmp14, costLimitmp14))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp14, player.buyableMaxPurchaseable(costTypemp14, player[this.layer].points, costBasemp14, costExpmp14, costLimitmp14), costBasemp14, costExpmp14, costLimitmp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypemp21 = "normal"
                costBasemp21 = new Decimal(1.3)
                costExpmp21 = new Decimal(1.08)
                costLimitmp21 = new Decimal('e100')
                return player.buyablePrice(costTypemp21, new Decimal(x), costBasemp21, costExpmp21, costLimitmp21)
            },
            effect(x) {
                effBasemp21 = new Decimal(0.1)
                effStackmp21 = new Decimal(x)

                return Decimal.times(effBasemp21, effStackmp21)
            },
            title() { return "metaprestige buyable 21"},
            display() { return "add base prestige point gain by "+format(effBasemp21)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp21)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp21 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp21, player[this.layer].points, costBasemp21, costExpmp21, costLimitmp21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp21, player[this.layer].points, costBasemp21, costExpmp21, costLimitmp21))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp21, player.buyableMaxPurchaseable(costTypemp21, player[this.layer].points, costBasemp21, costExpmp21, costLimitmp21), costBasemp21, costExpmp21, costLimitmp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypemp22 = "normal"
                costBasemp22 = new Decimal(1.5)
                costExpmp22 = new Decimal(1.18)
                costLimitmp22 = new Decimal('e100')
                return player.buyablePrice(costTypemp22, new Decimal(x), costBasemp22, costExpmp22, costLimitmp22)
            },
            effect(x) {
                effBasemp22 = new Decimal(0.001)
                effStackmp22 = new Decimal(x)

                return Decimal.times(effBasemp22, effStackmp22)
            },
            title() { return "metaprestige buyable 22"},
            display() { return "add prestige point gain mult by "+format(effBasemp22)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp22)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp22 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp22, player[this.layer].points, costBasemp22, costExpmp22, costLimitmp22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp22, player[this.layer].points, costBasemp22, costExpmp22, costLimitmp22))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp22, player.buyableMaxPurchaseable(costTypemp22, player[this.layer].points, costBasemp22, costExpmp22, costLimitmp22), costBasemp22, costExpmp22, costLimitmp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypemp23 = "normal"
                costBasemp23 = new Decimal(1.7)
                costExpmp23 = new Decimal(1.38)
                costLimitmp23 = new Decimal('e100')
                return player.buyablePrice(costTypemp23, new Decimal(x), costBasemp23, costExpmp23, costLimitmp23)
            },
            effect(x) {
                effBasemp23 = new Decimal(0.2)
                effStackmp23 = new Decimal(x)

                return Decimal.times(effBasemp23, effStackmp23)
            },
            title() { return "metaprestige buyable 23"},
            display() { return "add prestige point gain power by "+format(effBasemp23)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp23 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp23, player[this.layer].points, costBasemp23, costExpmp23, costLimitmp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp23, player[this.layer].points, costBasemp23, costExpmp23, costLimitmp23))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp23, player.buyableMaxPurchaseable(costTypemp23, player[this.layer].points, costBasemp23, costExpmp23, costLimitmp23), costBasemp23, costExpmp23, costLimitmp23))}
                    }
                }
            },
        },
        24: {
            unlocked() {return true},
            cost(x) {
                costTypemp24 = "asymptote"
                costBasemp24 = new Decimal(1.9)
                costExpmp24 = new Decimal(1.58)
                costLimitmp24 = layers.mp.buyables[24].purchaseLimit.add(1)

                return player.buyablePrice(costTypemp24, new Decimal(x), costBasemp24, costExpmp24, costLimitmp24)
            },
            effect(x) {
                effBasemp24 = new Decimal(0.01)
                effStackmp24 = new Decimal(x)

                return Decimal.times(effBasemp24, effStackmp24)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 24"},
            display() { return "add prestige point gain second power by "+format(effBasemp24)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp24)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp24 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp24, player[this.layer].points, costBasemp24, costExpmp24, costLimitmp24).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp24, player[this.layer].points, costBasemp24, costExpmp24, costLimitmp24))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp24, player.buyableMaxPurchaseable(costTypemp24, player[this.layer].points, costBasemp24, costExpmp24, costLimitmp24), costBasemp24, costExpmp24, costLimitmp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypemp31 = "normal"
                costBasemp31 = new Decimal(1.5)
                costExpmp31 = new Decimal(1.08)
                costLimitmp31 = new Decimal('e100')
                return player.buyablePrice(costTypemp31, new Decimal(x), costBasemp31, costExpmp31, costLimitmp31)
            },
            effect(x) {
                effBasemp31 = new Decimal(0.1)
                effStackmp31 = new Decimal(x)

                return Decimal.times(effBasemp31, effStackmp31)
            },
            title() { return "metaprestige buyable 31"},
            display() { return "add base metaprestige point gain by "+format(effBasemp31)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp31)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp31 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp31, player[this.layer].points, costBasemp31, costExpmp31, costLimitmp31).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp31, player[this.layer].points, costBasemp31, costExpmp31, costLimitmp31))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp31, player.buyableMaxPurchaseable(costTypemp31, player[this.layer].points, costBasemp31, costExpmp31, costLimitmp31), costBasemp31, costExpmp31, costLimitmp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypemp32 = "normal"
                costBasemp32 = new Decimal(1.7)
                costExpmp32 = new Decimal(1.18)
                costLimitmp32 = new Decimal('e100')
                return player.buyablePrice(costTypemp32, new Decimal(x), costBasemp32, costExpmp32, costLimitmp32)
            },
            effect(x) {
                effBasemp32 = new Decimal(0.001)
                effStackmp32 = new Decimal(x)

                return Decimal.times(effBasemp32, effStackmp32)
            },
            title() { return "metaprestige buyable 32"},
            display() { return "add metaprestige point gain mult by "+format(effBasemp32)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp32)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp32 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp32, player[this.layer].points, costBasemp32, costExpmp32, costLimitmp32).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp32, player[this.layer].points, costBasemp32, costExpmp32, costLimitmp32))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp32, player.buyableMaxPurchaseable(costTypemp32, player[this.layer].points, costBasemp32, costExpmp32, costLimitmp32), costBasemp32, costExpmp32, costLimitmp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypemp33 = "normal"
                costBasemp33 = new Decimal(1.9)
                costExpmp33 = new Decimal(1.38)
                costLimitmp33 = new Decimal('e100')
                return player.buyablePrice(costTypemp33, new Decimal(x), costBasemp33, costExpmp33, costLimitmp33)
            },
            effect(x) {
                effBasemp33 = new Decimal(0.025)
                effStackmp33 = new Decimal(x)

                return Decimal.times(effBasemp33, effStackmp33)
            },
            title() { return "metaprestige buyable 33"},
            display() { return "add metaprestige point gain power by "+format(effBasemp33)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp33 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp33, player[this.layer].points, costBasemp33, costExpmp33, costLimitmp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp33, player[this.layer].points, costBasemp33, costExpmp33, costLimitmp33))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp33, player.buyableMaxPurchaseable(costTypemp33, player[this.layer].points, costBasemp33, costExpmp33, costLimitmp33), costBasemp33, costExpmp33, costLimitmp33))}
                    }
                }
            },
        },
        34: {
            unlocked() {return true},
            cost(x) {
                costTypemp34 = "asymptote"
                costBasemp34 = new Decimal(2.1)
                costExpmp34 = new Decimal(1.58)
                costLimitmp34 = layers.mp.buyables[34].purchaseLimit.add(1)

                return player.buyablePrice(costTypemp34, new Decimal(x), costBasemp34, costExpmp34, costLimitmp34)
            },
            effect(x) {
                effBasemp34 = new Decimal(0.01)
                effStackmp34 = new Decimal(x)

                return Decimal.times(effBasemp34, effStackmp34)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 34"},
            display() { return "add metaprestige point gain second power by "+format(effBasemp34)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp34)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp34 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp34, player[this.layer].points, costBasemp34, costExpmp34, costLimitmp34).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp34, player[this.layer].points, costBasemp34, costExpmp34, costLimitmp34))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp34, player.buyableMaxPurchaseable(costTypemp34, player[this.layer].points, costBasemp34, costExpmp34, costLimitmp34), costBasemp34, costExpmp34, costLimitmp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypemp41 = "normal"
                costBasemp41 = new Decimal(1.55)
                costExpmp41 = new Decimal(1.08)
                costLimitmp41 = new Decimal('e100')
                return player.buyablePrice(costTypemp41, new Decimal(x), costBasemp41, costExpmp41, costLimitmp41)
            },
            effect(x) {
                effBasemp41 = new Decimal(0.1)
                effStackmp41 = new Decimal(x)

                return Decimal.times(effBasemp41, effStackmp41)
            },
            title() { return "metaprestige buyable 41"},
            display() { return "add base buyable point gain by "+format(effBasemp41)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp41)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp41 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp41, player[this.layer].points, costBasemp41, costExpmp41, costLimitmp41).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp41, player[this.layer].points, costBasemp41, costExpmp41, costLimitmp41))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp41, player.buyableMaxPurchaseable(costTypemp41, player[this.layer].points, costBasemp41, costExpmp41, costLimitmp41), costBasemp41, costExpmp41, costLimitmp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypemp42 = "normal"
                costBasemp42 = new Decimal(1.75)
                costExpmp42 = new Decimal(1.18)
                costLimitmp42 = new Decimal('e100')
                return player.buyablePrice(costTypemp42, new Decimal(x), costBasemp42, costExpmp42, costLimitmp42)
            },
            effect(x) {
                effBasemp42 = new Decimal(0.025)
                effStackmp42 = new Decimal(x)

                return Decimal.times(effBasemp42, effStackmp42)
            },
            title() { return "metaprestige buyable 42"},
            display() { return "add buyable point gain mult by "+format(effBasemp42)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp42)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp42 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp42, player[this.layer].points, costBasemp42, costExpmp42, costLimitmp42).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp42, player[this.layer].points, costBasemp42, costExpmp42, costLimitmp42))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp42, player.buyableMaxPurchaseable(costTypemp42, player[this.layer].points, costBasemp42, costExpmp42, costLimitmp42), costBasemp42, costExpmp42, costLimitmp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypemp43 = "normal"
                costBasemp43 = new Decimal(1.7)
                costExpmp43 = new Decimal(1.38)
                costLimitmp43 = new Decimal('e100')
                return player.buyablePrice(costTypemp43, new Decimal(x), costBasemp43, costExpmp43, costLimitmp43)
            },
            effect(x) {
                effBasemp43 = new Decimal(0.1)
                effStackmp43 = new Decimal(x)

                return Decimal.times(effBasemp43, effStackmp43)
            },
            title() { return "metaprestige buyable 43"},
            display() { return "add buyable point gain power by "+format(effBasemp43)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp43 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp43, player[this.layer].points, costBasemp43, costExpmp43, costLimitmp43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp43, player[this.layer].points, costBasemp43, costExpmp43, costLimitmp43))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp43, player.buyableMaxPurchaseable(costTypemp43, player[this.layer].points, costBasemp43, costExpmp43, costLimitmp43), costBasemp43, costExpmp43, costLimitmp43))}
                    }
                }
            },
        },
        44: {
            unlocked() {return true},
            cost(x) {
                costTypemp44 = "asymptote"
                costBasemp44 = new Decimal(2.15)
                costExpmp44 = new Decimal(1.58)
                costLimitmp44 = layers.mp.buyables[44].purchaseLimit.add(1)

                return player.buyablePrice(costTypemp44, new Decimal(x), costBasemp44, costExpmp44, costLimitmp44)
            },
            effect(x) {
                effBasemp44 = new Decimal(0.01)
                effStackmp44 = new Decimal(x)

                return Decimal.times(effBasemp44, effStackmp44)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 44"},
            display() { return "add buyable point gain second power by "+format(effBasemp44)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp44)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp44 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp44, player[this.layer].points, costBasemp44, costExpmp44, costLimitmp44).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp44, player[this.layer].points, costBasemp44, costExpmp44, costLimitmp44))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp44, player.buyableMaxPurchaseable(costTypemp44, player[this.layer].points, costBasemp44, costExpmp44, costLimitmp44), costBasemp44, costExpmp44, costLimitmp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypemp51 = "normal"
                costBasemp51 = new Decimal(1.6)
                costExpmp51 = new Decimal(1.08)
                costLimitmp51 = new Decimal('e100')
                return player.buyablePrice(costTypemp51, new Decimal(x), costBasemp51, costExpmp51, costLimitmp51)
            },
            effect(x) {
                effBasemp51 = new Decimal(0.1)
                effStackmp51 = new Decimal(x)

                return Decimal.times(effBasemp51, effStackmp51)
            },
            title() { return "metaprestige buyable 51"},
            display() { return "add base superprestige point gain by "+format(effBasemp51)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp51)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp51 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp51, player[this.layer].points, costBasemp51, costExpmp51, costLimitmp51).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp51, player[this.layer].points, costBasemp51, costExpmp51, costLimitmp51))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp51, player.buyableMaxPurchaseable(costTypemp51, player[this.layer].points, costBasemp51, costExpmp51, costLimitmp51), costBasemp51, costExpmp51, costLimitmp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypemp52 = "normal"
                costBasemp52 = new Decimal(1.8)
                costExpmp52 = new Decimal(1.18)
                costLimitmp52 = new Decimal('e100')
                return player.buyablePrice(costTypemp52, new Decimal(x), costBasemp52, costExpmp52, costLimitmp52)
            },
            effect(x) {
                effBasemp52 = new Decimal(0.05)
                effStackmp52 = new Decimal(x)

                return Decimal.times(effBasemp52, effStackmp52)
            },
            title() { return "metaprestige buyable 52"},
            display() { return "add superprestige point gain mult by "+format(effBasemp52)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp52)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp52 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp52, player[this.layer].points, costBasemp52, costExpmp52, costLimitmp52).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp52, player[this.layer].points, costBasemp52, costExpmp52, costLimitmp52))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp52, player.buyableMaxPurchaseable(costTypemp52, player[this.layer].points, costBasemp52, costExpmp52, costLimitmp52), costBasemp52, costExpmp52, costLimitmp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypemp53 = "normal"
                costBasemp53 = new Decimal(2)
                costExpmp53 = new Decimal(1.38)
                costLimitmp53 = new Decimal('e100')
                return player.buyablePrice(costTypemp53, new Decimal(x), costBasemp53, costExpmp53, costLimitmp53)
            },
            effect(x) {
                effBasemp53 = new Decimal(0.1)
                effStackmp53 = new Decimal(x)

                return Decimal.times(effBasemp53, effStackmp53)
            },
            title() { return "metaprestige buyable 53"},
            display() { return "add superprestige point gain power by "+format(effBasemp53)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp53 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp53, player[this.layer].points, costBasemp53, costExpmp53, costLimitmp53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp53, player[this.layer].points, costBasemp53, costExpmp53, costLimitmp53))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp53, player.buyableMaxPurchaseable(costTypemp53, player[this.layer].points, costBasemp53, costExpmp53, costLimitmp53), costBasemp53, costExpmp53, costLimitmp53))}
                    }
                }
            },
        },
        54: {
            unlocked() {return true},
            cost(x) {
                costTypemp54 = "asymptote"
                costBasemp54 = new Decimal(2.2)
                costExpmp54 = new Decimal(1.58)
                costLimitmp54 = layers.mp.buyables[54].purchaseLimit.add(1)

                return player.buyablePrice(costTypemp54, new Decimal(x), costBasemp54, costExpmp54, costLimitmp54)
            },
            effect(x) {
                effBasemp54 = new Decimal(0.01)
                effStackmp54 = new Decimal(x)

                return Decimal.times(effBasemp54, effStackmp54)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 54"},
            display() { return "add superprestige point gain second power by "+format(effBasemp54)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp54)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp54 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp54, player[this.layer].points, costBasemp54, costExpmp54, costLimitmp54).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp54, player[this.layer].points, costBasemp54, costExpmp54, costLimitmp54))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp54, player.buyableMaxPurchaseable(costTypemp54, player[this.layer].points, costBasemp54, costExpmp54, costLimitmp54), costBasemp54, costExpmp54, costLimitmp54))}
                    }
                }
            },
        },
    },
})

addLayer("bp", {
    name: "buyable points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#40d4db",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "buyable points", // Name of prestige currency
    baseResource: "prestige buyables", // Name of resource prestige is based on
    baseAmount() {
        totalPB = new Decimal(0)
        for (let i = 11; i < 18; i++) {
            totalPB = totalPB.add(player.p.buyables[i])
        }
        totalPBuyables = totalPB
        return totalPBuyables
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addbp = new Decimal(0)
        addbp = addbp.add(buyableEffect('mp', 41))
        addbp = addbp.add(buyableEffect('bp', 41))
        addbp = addbp.add(buyableEffect('sp', 41))

        multbp = new Decimal(0.025)
        multbp = multbp.add(buyableEffect('mp', 42))
        multbp = multbp.add(buyableEffect('bp', 42))
        multbp = multbp.add(buyableEffect('sp', 42))

        multbp = multbp.times(buyableEffect('l', 11)[3][0]).times(buyableEffect('l', 11)[3][1])

        return multbp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expbp = new Decimal(2).times(buyableEffect('l', 11)[3][2].add(1))
        expbp = expbp.add(buyableEffect('mp', 43))
        expbp = expbp.add(buyableEffect('bp', 43))
        expbp = expbp.add(buyableEffect('sp', 43))


        exp2bp = new Decimal(0.5).add(buyableEffect('l', 11)[3][3])
        exp2bp = exp2bp.add(buyableEffect('mp', 44))
        exp2bp = exp2bp.add(buyableEffect('bp', 44))
        exp2bp = exp2bp.add(buyableEffect('sp', 44))


        return expbp
    },
    getResetGain() {
        bpp = totalPBuyables.add(addbp).times(multbp).pow(expbp)
        if (bpp.gte(1)) {bpp = bpp.log10().pow(exp2bp).pow10()}

        return bpp.floor().max(0)
    },
    getNextAt() {
        nextbp = getResetGain('bp').add(1)
        if (nextbp.gte(1)) {nextbp = nextbp.log10().root(exp2bp).pow10()}
        return nextbp.root(expbp).div(multbp).sub(addbp)
    },
    canReset() {return getResetGain('bp').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('bp'))+" buyable points. Next at "+format(getNextAt('bp'))+" prestige buyables" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for buyable points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    automate() {
        if (hasMilestone('m', 1)&&player.bp.autoBuy) {
            for (let i = 1; i < 6; i++) {
                for (let j = 1; j < 5; j++) {
                    if (canBuyBuyable('bp', i*10+j)) {buyMaxBuyable('bp', i*10+j)}
                }
            }
        }
    },
    layerShown(){return (totalPBuyables.gte(40)||player.bp.total.gte(1))},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypebp11 = "normal"
                costBasebp11 = new Decimal(1.2)
                costExpbp11 = new Decimal(1.1)
                costLimitbp11 = new Decimal('e100')
                return player.buyablePrice(costTypebp11, new Decimal(x), costBasebp11, costExpbp11, costLimitbp11)
            },
            effect(x) {
                effBasebp11 = new Decimal(0.1)
                effStackbp11 = new Decimal(x)

                return Decimal.times(effBasebp11, effStackbp11)
            },
            title() { return "buyable buyable 11"},
            display() { return "increase base point gain by "+format(effBasebp11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp11 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp11, player[this.layer].points, costBasebp11, costExpbp11, costLimitbp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp11, player[this.layer].points, costBasebp11, costExpbp11, costLimitbp11))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp11, player.buyableMaxPurchaseable(costTypebp11, player[this.layer].points, costBasebp11, costExpbp11, costLimitbp11), costBasebp11, costExpbp11, costLimitbp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypebp12 = "normal"
                costBasebp12 = new Decimal(1.4)
                costExpbp12 = new Decimal(1.2)
                costLimitbp12 = new Decimal('e100')
                return player.buyablePrice(costTypebp12, new Decimal(x), costBasebp12, costExpbp12, costLimitbp12)
            },
            effect(x) {
                effBasebp12 = new Decimal(0.1)
                effStackbp12 = new Decimal(x)

                return Decimal.times(effBasebp12, effStackbp12)
            },
            title() { return "buyable buyable 12"},
            display() { return "add point gain mult by "+format(effBasebp12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp12 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp12, player[this.layer].points, costBasebp12, costExpbp12, costLimitbp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp12, player[this.layer].points, costBasebp12, costExpbp12, costLimitbp12))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp12, player.buyableMaxPurchaseable(costTypebp12, player[this.layer].points, costBasebp12, costExpbp12, costLimitbp12), costBasebp12, costExpbp12, costLimitbp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costTypebp13 = "asymptote"
                costBasebp13 = new Decimal(1.6)
                costExpbp13 = new Decimal(1.3)
                costLimitbp13 = layers.bp.buyables[13].purchaseLimit.add(1)

                return player.buyablePrice(costTypebp13, new Decimal(x), costBasebp13, costExpbp13, costLimitbp13)

            },
            effect(x) {
                effBasebp13 = new Decimal(0.1)
                effStackbp13 = new Decimal(x)

                return Decimal.times(effBasebp13, effStackbp13)
            },
            purchaseLimit: new Decimal(40),
            title() { return "buyable buyable 13"},
            display() { return "subtract first point softcap by "+format(effBasebp13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp13 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp13, player[this.layer].points, costBasebp13, costExpbp13, costLimitbp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp13, player[this.layer].points, costBasebp13, costExpbp13, costLimitbp13))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp13, player.buyableMaxPurchaseable(costTypebp13, player[this.layer].points, costBasebp13, costExpbp13, costLimitbp13), costBasebp13, costExpbp13, costLimitbp13))}
                    }
                }
            },
        },
        14: {
            unlocked() {return true},
            cost(x) {
                costTypebp14 = "asymptote"
                costBasebp14 = new Decimal(1.8)
                costExpbp14 = new Decimal(1.4)
                costLimitbp14 = layers.bp.buyables[14].purchaseLimit.add(1)

                return player.buyablePrice(costTypebp14, new Decimal(x), costBasebp14, costExpbp14, costLimitbp14)
            },
            effect(x) {
                effBasebp14 = new Decimal(0.1)
                effStackbp14 = new Decimal(x)

                return Decimal.times(effBasebp14, effStackbp14)
            },
            purchaseLimit: new Decimal(40),
            title() { return "buyable buyable 14"},
            display() { return "subtract second point softcap by "+format(effBasebp14)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp14)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp14 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp14, player[this.layer].points, costBasebp14, costExpbp14, costLimitbp14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp14, player[this.layer].points, costBasebp14, costExpbp14, costLimitbp14))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp14, player.buyableMaxPurchaseable(costTypebp14, player[this.layer].points, costBasebp14, costExpbp14, costLimitbp14), costBasebp14, costExpbp14, costLimitbp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypebp21 = "normal"
                costBasebp21 = new Decimal(1.3)
                costExpbp21 = new Decimal(1.075)
                costLimitbp21 = new Decimal('e100')
                return player.buyablePrice(costTypebp21, new Decimal(x), costBasebp21, costExpbp21, costLimitbp21)
            },
            effect(x) {
                effBasebp21 = new Decimal(0.1)
                effStackbp21 = new Decimal(x)

                return Decimal.times(effBasebp21, effStackbp21)
            },
            title() { return "buyable buyable 21"},
            display() { return "add base prestige point gain by "+format(effBasebp21)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp21)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp21 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp21, player[this.layer].points, costBasebp21, costExpbp21, costLimitbp21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp21, player[this.layer].points, costBasebp21, costExpbp21, costLimitbp21))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp21, player.buyableMaxPurchaseable(costTypebp21, player[this.layer].points, costBasebp21, costExpbp21, costLimitbp21), costBasebp21, costExpbp21, costLimitbp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypebp22 = "normal"
                costBasebp22 = new Decimal(1.5)
                costExpbp22 = new Decimal(1.175)
                costLimitbp22 = new Decimal('e100')
                return player.buyablePrice(costTypebp22, new Decimal(x), costBasebp22, costExpbp22, costLimitbp22)
            },
            effect(x) {
                effBasebp22 = new Decimal(0.001)
                effStackbp22 = new Decimal(x)

                return Decimal.times(effBasebp22, effStackbp22)
            },
            title() { return "buyable buyable 22"},
            display() { return "add prestige point gain mult by "+format(effBasebp22)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp22)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp22 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp22, player[this.layer].points, costBasebp22, costExpbp22, costLimitbp22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp22, player[this.layer].points, costBasebp22, costExpbp22, costLimitbp22))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp22, player.buyableMaxPurchaseable(costTypebp22, player[this.layer].points, costBasebp22, costExpbp22, costLimitbp22), costBasebp22, costExpbp22, costLimitbp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypebp23 = "normal"
                costBasebp23 = new Decimal(1.7)
                costExpbp23 = new Decimal(1.375)
                costLimitbp23 = new Decimal('e100')
                return player.buyablePrice(costTypebp23, new Decimal(x), costBasebp23, costExpbp23, costLimitbp23)
            },
            effect(x) {
                effBasebp23 = new Decimal(0.2)
                effStackbp23 = new Decimal(x)

                return Decimal.times(effBasebp23, effStackbp23)
            },
            title() { return "buyable buyable 23"},
            display() { return "add prestige point gain power by "+format(effBasebp23)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp23 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp23, player[this.layer].points, costBasebp23, costExpbp23, costLimitbp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp23, player[this.layer].points, costBasebp23, costExpbp23, costLimitbp23))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp23, player.buyableMaxPurchaseable(costTypebp23, player[this.layer].points, costBasebp23, costExpbp23, costLimitbp23), costBasebp23, costExpbp23, costLimitbp23))}
                    }
                }
            },
        },
        24: {
            unlocked() {return true},
            cost(x) {
                costTypebp24 = "asymptote"
                costBasebp24 = new Decimal(1.9)
                costExpbp24 = new Decimal(1.575)
                costLimitbp24 = layers.bp.buyables[24].purchaseLimit.add(1)

                return player.buyablePrice(costTypebp24, new Decimal(x), costBasebp24, costExpbp24, costLimitbp24)
            },
            effect(x) {
                effBasebp24 = new Decimal(0.01)
                effStackbp24 = new Decimal(x)

                return Decimal.times(effBasebp24, effStackbp24)
            },
            purchaseLimit: new Decimal(10),
            title() { return "buyable buyable 24"},
            display() { return "add prestige point gain second power by "+format(effBasebp24)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp24)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp24 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp24, player[this.layer].points, costBasebp24, costExpbp24, costLimitbp24).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp24, player[this.layer].points, costBasebp24, costExpbp24, costLimitbp24))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp24, player.buyableMaxPurchaseable(costTypebp24, player[this.layer].points, costBasebp24, costExpbp24, costLimitbp24), costBasebp24, costExpbp24, costLimitbp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypebp31 = "normal"
                costBasebp31 = new Decimal(1.45)
                costExpbp31 = new Decimal(1.075)
                costLimitbp31 = new Decimal('e100')
                return player.buyablePrice(costTypebp31, new Decimal(x), costBasebp31, costExpbp31, costLimitbp31)
            },
            effect(x) {
                effBasebp31 = new Decimal(0.1)
                effStackbp31 = new Decimal(x)

                return Decimal.times(effBasebp31, effStackbp31)
            },
            title() { return "buyable buyable 31"},
            display() { return "add base metaprestige point gain by "+format(effBasebp31)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp31)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp31 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp31, player[this.layer].points, costBasebp31, costExpbp31, costLimitbp31).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp31, player[this.layer].points, costBasebp31, costExpbp31, costLimitbp31))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp31, player.buyableMaxPurchaseable(costTypebp31, player[this.layer].points, costBasebp31, costExpbp31, costLimitbp31), costBasebp31, costExpbp31, costLimitbp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypebp32 = "normal"
                costBasebp32 = new Decimal(1.65)
                costExpbp32 = new Decimal(1.175)
                costLimitbp32 = new Decimal('e100')
                return player.buyablePrice(costTypebp32, new Decimal(x), costBasebp32, costExpbp32, costLimitbp32)
            },
            effect(x) {
                effBasebp32 = new Decimal(0.001)
                effStackbp32 = new Decimal(x)

                return Decimal.times(effBasebp32, effStackbp32)
            },
            title() { return "buyable buyable 32"},
            display() { return "add metaprestige point gain mult by "+format(effBasebp32)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp32)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp32 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp32, player[this.layer].points, costBasebp32, costExpbp32, costLimitbp32).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp32, player[this.layer].points, costBasebp32, costExpbp32, costLimitbp32))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp32, player.buyableMaxPurchaseable(costTypebp32, player[this.layer].points, costBasebp32, costExpbp32, costLimitbp32), costBasebp32, costExpbp32, costLimitbp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypebp33 = "normal"
                costBasebp33 = new Decimal(1.85)
                costExpbp33 = new Decimal(1.375)
                costLimitbp33 = new Decimal('e100')
                return player.buyablePrice(costTypebp33, new Decimal(x), costBasebp33, costExpbp33, costLimitbp33)
            },
            effect(x) {
                effBasebp33 = new Decimal(0.025)
                effStackbp33 = new Decimal(x)

                return Decimal.times(effBasebp33, effStackbp33)
            },
            title() { return "buyable buyable 33"},
            display() { return "add metaprestige point gain power by "+format(effBasebp33)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp33 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp33, player[this.layer].points, costBasebp33, costExpbp33, costLimitbp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp33, player[this.layer].points, costBasebp33, costExpbp33, costLimitbp33))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp33, player.buyableMaxPurchaseable(costTypebp33, player[this.layer].points, costBasebp33, costExpbp33, costLimitbp33), costBasebp33, costExpbp33, costLimitbp33))}
                    }
                }
            },
        },
        34: {
            unlocked() {return true},
            cost(x) {
                costTypebp34 = "asymptote"
                costBasebp34 = new Decimal(2.05)
                costExpbp34 = new Decimal(1.575)
                costLimitbp34 = layers.bp.buyables[34].purchaseLimit.add(1)

                return player.buyablePrice(costTypebp34, new Decimal(x), costBasebp34, costExpbp34, costLimitbp34)
            },
            effect(x) {
                effBasebp34 = new Decimal(0.01)
                effStackbp34 = new Decimal(x)

                return Decimal.times(effBasebp34, effStackbp34)
            },
            purchaseLimit: new Decimal(10),
            title() { return "buyable buyable 34"},
            display() { return "add metaprestige point gain second power by "+format(effBasebp34)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp34)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp34 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp34, player[this.layer].points, costBasebp34, costExpbp34, costLimitbp34).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp34, player[this.layer].points, costBasebp34, costExpbp34, costLimitbp34))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp34, player.buyableMaxPurchaseable(costTypebp34, player[this.layer].points, costBasebp34, costExpbp34, costLimitbp34), costBasebp34, costExpbp34, costLimitbp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypebp41 = "normal"
                costBasebp41 = new Decimal(1.5)
                costExpbp41 = new Decimal(1.075)
                costLimitbp41 = new Decimal('e100')
                return player.buyablePrice(costTypebp41, new Decimal(x), costBasebp41, costExpbp41, costLimitbp41)
            },
            effect(x) {
                effBasebp41 = new Decimal(0.1)
                effStackbp41 = new Decimal(x)

                return Decimal.times(effBasebp41, effStackbp41)
            },
            title() { return "buyable buyable 41"},
            display() { return "add base buyable point gain by "+format(effBasebp41)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp41)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp41 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp41, player[this.layer].points, costBasebp41, costExpbp41, costLimitbp41).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp41, player[this.layer].points, costBasebp41, costExpbp41, costLimitbp41))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp41, player.buyableMaxPurchaseable(costTypebp41, player[this.layer].points, costBasebp41, costExpbp41, costLimitbp41), costBasebp41, costExpbp41, costLimitbp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypebp42 = "normal"
                costBasebp42 = new Decimal(1.7)
                costExpbp42 = new Decimal(1.175)
                costLimitbp42 = new Decimal('e100')
                return player.buyablePrice(costTypebp42, new Decimal(x), costBasebp42, costExpbp42, costLimitbp42)
            },
            effect(x) {
                effBasebp42 = new Decimal(0.025)
                effStackbp42 = new Decimal(x)

                return Decimal.times(effBasebp42, effStackbp42)
            },
            title() { return "buyable buyable 42"},
            display() { return "add buyable point gain mult by "+format(effBasebp42)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp42)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp42 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp42, player[this.layer].points, costBasebp42, costExpbp42, costLimitbp42).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp42, player[this.layer].points, costBasebp42, costExpbp42, costLimitbp42))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp42, player.buyableMaxPurchaseable(costTypebp42, player[this.layer].points, costBasebp42, costExpbp42, costLimitbp42), costBasebp42, costExpbp42, costLimitbp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypebp43 = "normal"
                costBasebp43 = new Decimal(1.9)
                costExpbp43 = new Decimal(1.375)
                costLimitbp43 = new Decimal('e100')
                return player.buyablePrice(costTypebp43, new Decimal(x), costBasebp43, costExpbp43, costLimitbp43)
            },
            effect(x) {
                effBasebp43 = new Decimal(0.1)
                effStackbp43 = new Decimal(x)

                return Decimal.times(effBasebp43, effStackbp43)
            },
            title() { return "buyable buyable 43"},
            display() { return "add buyable point gain power by "+format(effBasebp43)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp43 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp43, player[this.layer].points, costBasebp43, costExpbp43, costLimitbp43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp43, player[this.layer].points, costBasebp43, costExpbp43, costLimitbp43))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp43, player.buyableMaxPurchaseable(costTypebp43, player[this.layer].points, costBasebp43, costExpbp43, costLimitbp43), costBasebp43, costExpbp43, costLimitbp43))}
                    }
                }
            },
        },
        44: {
            unlocked() {return true},
            cost(x) {
                costTypebp44 = "asymptote"
                costBasebp44 = new Decimal(2.1)
                costExpbp44 = new Decimal(1.575)
                costLimitbp44 = layers.bp.buyables[44].purchaseLimit.add(1)

                return player.buyablePrice(costTypebp44, new Decimal(x), costBasebp44, costExpbp44, costLimitbp44)
            },
            effect(x) {
                effBasebp44 = new Decimal(0.01)
                effStackbp44 = new Decimal(x)

                return Decimal.times(effBasebp44, effStackbp44)
            },
            purchaseLimit: new Decimal(10),
            title() { return "buyable buyable 44"},
            display() { return "add buyable point gain second power by "+format(effBasebp44)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp44)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp44 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp44, player[this.layer].points, costBasebp44, costExpbp44, costLimitbp44).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp44, player[this.layer].points, costBasebp44, costExpbp44, costLimitbp44))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp44, player.buyableMaxPurchaseable(costTypebp44, player[this.layer].points, costBasebp44, costExpbp44, costLimitbp44), costBasebp44, costExpbp44, costLimitbp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypebp51 = "normal"
                costBasebp51 = new Decimal(1.55)
                costExpbp51 = new Decimal(1.075)
                costLimitbp51 = new Decimal('e100')
                return player.buyablePrice(costTypebp51, new Decimal(x), costBasebp51, costExpbp51, costLimitbp51)
            },
            effect(x) {
                effBasebp51 = new Decimal(0.1)
                effStackbp51 = new Decimal(x)

                return Decimal.times(effBasebp51, effStackbp51)
            },
            title() { return "buyable buyable 51"},
            display() { return "add base superprestige point gain by "+format(effBasebp51)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp51)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp51 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp51, player[this.layer].points, costBasebp51, costExpbp51, costLimitbp51).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp51, player[this.layer].points, costBasebp51, costExpbp51, costLimitbp51))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp51, player.buyableMaxPurchaseable(costTypebp51, player[this.layer].points, costBasebp51, costExpbp51, costLimitbp51), costBasebp51, costExpbp51, costLimitbp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypebp52 = "normal"
                costBasebp52 = new Decimal(1.75)
                costExpbp52 = new Decimal(1.175)
                costLimitbp52 = new Decimal('e100')
                return player.buyablePrice(costTypebp52, new Decimal(x), costBasebp52, costExpbp52, costLimitbp52)
            },
            effect(x) {
                effBasebp52 = new Decimal(0.05)
                effStackbp52 = new Decimal(x)

                return Decimal.times(effBasebp52, effStackbp52)
            },
            title() { return "buyable buyable 52"},
            display() { return "add superprestige point gain mult by "+format(effBasebp52)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp52)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp52 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp52, player[this.layer].points, costBasebp52, costExpbp52, costLimitbp52).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp52, player[this.layer].points, costBasebp52, costExpbp52, costLimitbp52))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp52, player.buyableMaxPurchaseable(costTypebp52, player[this.layer].points, costBasebp52, costExpbp52, costLimitbp52), costBasebp52, costExpbp52, costLimitbp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypebp53 = "normal"
                costBasebp53 = new Decimal(1.95)
                costExpbp53 = new Decimal(1.375)
                costLimitbp53 = new Decimal('e100')
                return player.buyablePrice(costTypebp53, new Decimal(x), costBasebp53, costExpbp53, costLimitbp53)
            },
            effect(x) {
                effBasebp53 = new Decimal(0.1)
                effStackbp53 = new Decimal(x)

                return Decimal.times(effBasebp53, effStackbp53)
            },
            title() { return "buyable buyable 53"},
            display() { return "add superprestige point gain power by "+format(effBasebp53)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp53 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp53, player[this.layer].points, costBasebp53, costExpbp53, costLimitbp53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp53, player[this.layer].points, costBasebp53, costExpbp53, costLimitbp53))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp53, player.buyableMaxPurchaseable(costTypebp53, player[this.layer].points, costBasebp53, costExpbp53, costLimitbp53), costBasebp53, costExpbp53, costLimitbp53))}
                    }
                }
            },
        },
        54: {
            unlocked() {return true},
            cost(x) {
                costTypebp54 = "asymptote"
                costBasebp54 = new Decimal(2.15)
                costExpbp54 = new Decimal(1.575)
                costLimitbp54 = layers.bp.buyables[54].purchaseLimit.add(1)

                return player.buyablePrice(costTypebp54, new Decimal(x), costBasebp54, costExpbp54, costLimitbp54)
            },
            effect(x) {
                effBasebp54 = new Decimal(0.01)
                effStackbp54 = new Decimal(x)

                return Decimal.times(effBasebp54, effStackbp54)
            },
            purchaseLimit: new Decimal(10),
            title() { return "metaprestige buyable 54"},
            display() { return "add superprestige point gain second power by "+format(effBasebp54)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp54)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp54 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp54, player[this.layer].points, costBasebp54, costExpbp54, costLimitbp54).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp54, player[this.layer].points, costBasebp54, costExpbp54, costLimitbp54))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp54, player.buyableMaxPurchaseable(costTypebp54, player[this.layer].points, costBasebp54, costExpbp54, costLimitbp54), costBasebp54, costExpbp54, costLimitbp54))}
                    }
                }
            },
        },
    },
})

addLayer("sp", {
    name: "superprestige points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#5cdb2a",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "superprestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addsp = new Decimal(0)
        addsp = addsp.add(buyableEffect('mp', 51))
        addsp = addsp.add(buyableEffect('bp', 51))
        addsp = addsp.add(buyableEffect('sp', 51))

        multsp = new Decimal(0.5)
        multsp = multsp.add(buyableEffect('mp', 52))
        multsp = multsp.add(buyableEffect('bp', 52))
        multsp = multsp.add(buyableEffect('sp', 52))

        multsp = multsp.times(buyableEffect('l', 11)[3][0]).times(buyableEffect('l', 11)[3][1])

        return multsp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expsp = new Decimal(2).times(buyableEffect('l', 11)[3][2].add(1))
        expsp = expsp.add(buyableEffect('mp', 53))
        expsp = expsp.add(buyableEffect('bp', 53))
        expsp = expsp.add(buyableEffect('sp', 53))



        exp2sp = new Decimal(0.5).add(buyableEffect('l', 11)[3][3])
        exp2sp = exp2sp.add(buyableEffect('mp', 54))
        exp2sp = exp2sp.add(buyableEffect('bp', 54))
        exp2sp = exp2sp.add(buyableEffect('sp', 54))


        return expsp
    },
    getResetGain() {
        spp = player.points.add(addsp).times(multsp).pow(expsp)
        if (spp.gte(1)) {spp = spp.log10().pow(exp2sp).pow10()}

        return spp.floor().max(0)
    },
    getNextAt() {
        nextsp = getResetGain('sp').add(1)
        if (nextsp.gte(1)) {nextsp = nextsp.log10().root(exp2sp).pow10()}
        return nextsp.root(expsp).div(multsp).sub(addsp)
    },
    canReset() {return getResetGain('sp').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('sp'))+" superprestige points. Next at "+format(getNextAt('sp'))+" points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for superprestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    automate() {
        if (hasMilestone('m', 1)&&player.bp.autoBuy) {
            for (let i = 1; i < 6; i++) {
                for (let j = 1; j < 5; j++) {
                    if (canBuyBuyable('sp', i*10+j)) {buyMaxBuyable('sp', i*10+j)}
                }
            }
        }
    },
    layerShown(){return (player.points.gte(2)||player.sp.total.gte(1))},
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypesp11 = "normal"
                costBasesp11 = new Decimal(1.2)
                costExpsp11 = new Decimal(1.1)
                costLimitsp11 = new Decimal('e100')
                return player.buyablePrice(costTypesp11, new Decimal(x), costBasesp11, costExpsp11, costLimitsp11)
            },
            effect(x) {
                effBasesp11 = new Decimal(0.1)
                effStacksp11 = new Decimal(x)

                return Decimal.times(effBasesp11, effStacksp11)
            },
            title() { return "superprestige buyable 11"},
            display() { return "increase base point gain by "+format(effBasesp11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp11 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp11, player[this.layer].points, costBasesp11, costExpsp11, costLimitsp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp11, player[this.layer].points, costBasesp11, costExpsp11, costLimitsp11))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp11, player.buyableMaxPurchaseable(costTypesp11, player[this.layer].points, costBasesp11, costExpsp11, costLimitsp11), costBasesp11, costExpsp11, costLimitsp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypesp12 = "normal"
                costBasesp12 = new Decimal(1.4)
                costExpsp12 = new Decimal(1.2)
                costLimitsp12 = new Decimal('e100')
                return player.buyablePrice(costTypesp12, new Decimal(x), costBasesp12, costExpsp12, costLimitsp12)
            },
            effect(x) {
                effBasesp12 = new Decimal(0.1)
                effStacksp12 = new Decimal(x)

                return Decimal.times(effBasesp12, effStacksp12)
            },
            title() { return "superprestige buyable 12"},
            display() { return "add point gain mult by "+format(effBasesp12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp12 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp12, player[this.layer].points, costBasesp12, costExpsp12, costLimitsp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp12, player[this.layer].points, costBasesp12, costExpsp12, costLimitsp12))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp12, player.buyableMaxPurchaseable(costTypesp12, player[this.layer].points, costBasesp12, costExpsp12, costLimitsp12), costBasesp12, costExpsp12, costLimitsp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costTypesp13 = "asymptote"
                costBasesp13 = new Decimal(1.6)
                costExpsp13 = new Decimal(1.3)
                costLimitsp13 = layers.sp.buyables[13].purchaseLimit.add(1)
                return player.buyablePrice(costTypesp13, new Decimal(x), costBasesp13, costExpsp13, costLimitsp13)
            },
            effect(x) {
                effBasesp13 = new Decimal(0.1)
                effStacksp13 = new Decimal(x)

                return Decimal.times(effBasesp13, effStacksp13)
            },
            purchaseLimit: new Decimal(40),
            title() { return "superprestige buyable 13"},
            display() { return "subtract first point softcap by "+format(effBasesp13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp13 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp13, player[this.layer].points, costBasesp13, costExpsp13, costLimitsp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp13, player[this.layer].points, costBasesp13, costExpsp13, costLimitsp13))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp13, player.buyableMaxPurchaseable(costTypesp13, player[this.layer].points, costBasesp13, costExpsp13, costLimitsp13), costBasesp13, costExpsp13, costLimitsp13))}
                    }
                }
            },
        },
        14: {
            unlocked() {return true},
            cost(x) {
                costTypesp14 = "asymptote"
                costBasesp14 = new Decimal(1.8)
                costExpsp14 = new Decimal(1.4)
                costLimitsp14 = layers.sp.buyables[14].purchaseLimit.add(1)

                return player.buyablePrice(costTypesp14, new Decimal(x), costBasesp14, costExpsp14, costLimitsp14)
            },
            effect(x) {
                effBasesp14 = new Decimal(0.1)
                effStacksp14 = new Decimal(x)

                return Decimal.times(effBasesp14, effStacksp14)
            },
            purchaseLimit: new Decimal(40),
            title() { return "superprestige buyable 14"},
            display() { return "subtract second point softcap by "+format(effBasesp14)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp14)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp14 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp14, player[this.layer].points, costBasesp14, costExpsp14, costLimitsp14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp14, player[this.layer].points, costBasesp14, costExpsp14, costLimitsp14))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp14, player.buyableMaxPurchaseable(costTypesp14, player[this.layer].points, costBasesp14, costExpsp14, costLimitsp14), costBasesp14, costExpsp14, costLimitsp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypesp21 = "normal"
                costBasesp21 = new Decimal(1.3)
                costExpsp21 = new Decimal(1.07)
                costLimitsp21 = new Decimal('e100')
                return player.buyablePrice(costTypesp21, new Decimal(x), costBasesp21, costExpsp21, costLimitsp21)
            },
            effect(x) {
                effBasesp21 = new Decimal(0.1)
                effStacksp21 = new Decimal(x)

                return Decimal.times(effBasesp21, effStacksp21)
            },
            title() { return "superprestige buyable 21"},
            display() { return "add base prestige point gain by "+format(effBasesp21)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp21)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp21 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp21, player[this.layer].points, costBasesp21, costExpsp21, costLimitsp21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp21, player[this.layer].points, costBasesp21, costExpsp21, costLimitsp21))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp21, player.buyableMaxPurchaseable(costTypesp21, player[this.layer].points, costBasesp21, costExpsp21, costLimitsp21), costBasesp21, costExpsp21, costLimitsp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypesp22 = "normal"
                costBasesp22 = new Decimal(1.5)
                costExpsp22 = new Decimal(1.17)
                costLimitsp22 = new Decimal('e100')
                return player.buyablePrice(costTypesp22, new Decimal(x), costBasesp22, costExpsp22, costLimitsp22)
            },
            effect(x) {
                effBasesp22 = new Decimal(0.001)
                effStacksp22 = new Decimal(x)

                return Decimal.times(effBasesp22, effStacksp22)
            },
            title() { return "superprestige buyable 22"},
            display() { return "add prestige point gain mult by "+format(effBasesp22)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp22)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp22 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp22, player[this.layer].points, costBasesp22, costExpsp22, costLimitsp22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp22, player[this.layer].points, costBasesp22, costExpsp22, costLimitsp22))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp22, player.buyableMaxPurchaseable(costTypesp22, player[this.layer].points, costBasesp22, costExpsp22, costLimitsp22), costBasesp22, costExpsp22, costLimitsp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypesp23 = "normal"
                costBasesp23 = new Decimal(1.7)
                costExpsp23 = new Decimal(1.37)
                costLimitsp23 = new Decimal('e100')
                return player.buyablePrice(costTypesp23, new Decimal(x), costBasesp23, costExpsp23, costLimitsp23)
            },
            effect(x) {
                effBasesp23 = new Decimal(0.2)
                effStacksp23 = new Decimal(x)

                return Decimal.times(effBasesp23, effStacksp23)
            },
            title() { return "superprestige buyable 23"},
            display() { return "add prestige point gain power by "+format(effBasesp23)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp23 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp23, player[this.layer].points, costBasesp23, costExpsp23, costLimitsp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp23, player[this.layer].points, costBasesp23, costExpsp23, costLimitsp23))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp23, player.buyableMaxPurchaseable(costTypesp23, player[this.layer].points, costBasesp23, costExpsp23, costLimitsp23), costBasesp23, costExpsp23, costLimitsp23))}
                    }
                }
            },
        },
        24: {
            unlocked() {return true},
            cost(x) {
                costTypesp24 = "asymptote"
                costBasesp24 = new Decimal(1.9)
                costExpsp24 = new Decimal(1.57)
                costLimitsp24 = layers.sp.buyables[24].purchaseLimit.add(1)

                return player.buyablePrice(costTypesp24, new Decimal(x), costBasesp24, costExpsp24, costLimitsp24)
            },
            effect(x) {
                effBasesp24 = new Decimal(0.01)
                effStacksp24 = new Decimal(x)

                return Decimal.times(effBasesp24, effStacksp24)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 24"},
            display() { return "add prestige point gain second power by "+format(effBasesp24)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp24)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp24 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp24, player[this.layer].points, costBasesp24, costExpsp24, costLimitsp24).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp24, player[this.layer].points, costBasesp24, costExpsp24, costLimitsp24))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp24, player.buyableMaxPurchaseable(costTypesp24, player[this.layer].points, costBasesp24, costExpsp24, costLimitsp24), costBasesp24, costExpsp24, costLimitsp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypesp31 = "normal"
                costBasesp31 = new Decimal(1.4)
                costExpsp31 = new Decimal(1.07)
                costLimitsp31 = new Decimal('e100')
                return player.buyablePrice(costTypesp31, new Decimal(x), costBasesp31, costExpsp31, costLimitsp31)
            },
            effect(x) {
                effBasesp31 = new Decimal(0.1)
                effStacksp31 = new Decimal(x)

                return Decimal.times(effBasesp31, effStacksp31)
            },
            title() { return "superprestige buyable 31"},
            display() { return "add base metaprestige point gain by "+format(effBasesp31)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp31)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp31 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp31, player[this.layer].points, costBasesp31, costExpsp31, costLimitsp31).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp31, player[this.layer].points, costBasesp31, costExpsp31, costLimitsp31))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp31, player.buyableMaxPurchaseable(costTypesp31, player[this.layer].points, costBasesp31, costExpsp31, costLimitsp31), costBasesp31, costExpsp31, costLimitsp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypesp32 = "normal"
                costBasesp32 = new Decimal(1.6)
                costExpsp32 = new Decimal(1.17)
                costLimitsp32 = new Decimal('e100')
                return player.buyablePrice(costTypesp32, new Decimal(x), costBasesp32, costExpsp32, costLimitsp32)
            },
            effect(x) {
                effBasesp32 = new Decimal(0.001)
                effStacksp32 = new Decimal(x)

                return Decimal.times(effBasesp32, effStacksp32)
            },
            title() { return "superprestige buyable 32"},
            display() { return "add metaprestige point gain mult by "+format(effBasesp32)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp32)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp32 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp32, player[this.layer].points, costBasesp32, costExpsp32, costLimitsp32).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp32, player[this.layer].points, costBasesp32, costExpsp32, costLimitsp32))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp32, player.buyableMaxPurchaseable(costTypesp32, player[this.layer].points, costBasesp32, costExpsp32, costLimitsp32), costBasesp32, costExpsp32, costLimitsp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypesp33 = "normal"
                costBasesp33 = new Decimal(1.8)
                costExpsp33 = new Decimal(1.37)
                costLimitsp33 = new Decimal('e100')
                return player.buyablePrice(costTypesp33, new Decimal(x), costBasesp33, costExpsp33, costLimitsp33)
            },
            effect(x) {
                effBasesp33 = new Decimal(0.025)
                effStacksp33 = new Decimal(x)

                return Decimal.times(effBasesp33, effStacksp33)
            },
            title() { return "superprestige buyable 33"},
            display() { return "add metaprestige point gain power by "+format(effBasesp33)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp33 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp33, player[this.layer].points, costBasesp33, costExpsp33, costLimitsp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp33, player[this.layer].points, costBasesp33, costExpsp33, costLimitsp33))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp33, player.buyableMaxPurchaseable(costTypesp33, player[this.layer].points, costBasesp33, costExpsp33, costLimitsp33), costBasesp33, costExpsp33, costLimitsp33))}
                    }
                }
            },
        },
        34: {
            unlocked() {return true},
            cost(x) {
                costTypesp34 = "asymptote"
                costBasesp34 = new Decimal(2)
                costExpsp34 = new Decimal(1.57)
                costLimitsp34 = layers.sp.buyables[34].purchaseLimit.add(1)

                return player.buyablePrice(costTypesp34, new Decimal(x), costBasesp34, costExpsp34, costLimitsp34)
            },
            effect(x) {
                effBasesp34 = new Decimal(0.01)
                effStacksp34 = new Decimal(x)

                return Decimal.times(effBasesp34, effStacksp34)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 34"},
            display() { return "add metaprestige point gain second power by "+format(effBasesp34)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp34)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp34 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp34, player[this.layer].points, costBasesp34, costExpsp34, costLimitsp34).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp34, player[this.layer].points, costBasesp34, costExpsp34, costLimitsp34))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp34, player.buyableMaxPurchaseable(costTypesp34, player[this.layer].points, costBasesp34, costExpsp34, costLimitsp34), costBasesp34, costExpsp34, costLimitsp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypesp41 = "normal"
                costBasesp41 = new Decimal(1.45)
                costExpsp41 = new Decimal(1.07)
                costLimitsp41 = new Decimal('e100')
                return player.buyablePrice(costTypesp41, new Decimal(x), costBasesp41, costExpsp41, costLimitsp41)
            },
            effect(x) {
                effBasesp41 = new Decimal(0.1)
                effStacksp41 = new Decimal(x)

                return Decimal.times(effBasesp41, effStacksp41)
            },
            title() { return "superprestige buyable 41"},
            display() { return "add base buyable point gain by "+format(effBasesp41)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp41)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp41 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp41, player[this.layer].points, costBasesp41, costExpsp41, costLimitsp41).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp41, player[this.layer].points, costBasesp41, costExpsp41, costLimitsp41))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp41, player.buyableMaxPurchaseable(costTypesp41, player[this.layer].points, costBasesp41, costExpsp41, costLimitsp41), costBasesp41, costExpsp41, costLimitsp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypesp42 = "normal"
                costBasesp42 = new Decimal(1.65)
                costExpsp42 = new Decimal(1.17)
                costLimitsp42 = new Decimal('e100')
                return player.buyablePrice(costTypesp42, new Decimal(x), costBasesp42, costExpsp42, costLimitsp42)
            },
            effect(x) {
                effBasesp42 = new Decimal(0.025)
                effStacksp42 = new Decimal(x)

                return Decimal.times(effBasesp42, effStacksp42)
            },
            title() { return "superprestige buyable 42"},
            display() { return "add buyable point gain mult by "+format(effBasesp42)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp42)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp42 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp42, player[this.layer].points, costBasesp42, costExpsp42, costLimitsp42).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp42, player[this.layer].points, costBasesp42, costExpsp42, costLimitsp42))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp42, player.buyableMaxPurchaseable(costTypesp42, player[this.layer].points, costBasesp42, costExpsp42, costLimitsp42), costBasesp42, costExpsp42, costLimitsp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypesp43 = "normal"
                costBasesp43 = new Decimal(1.85)
                costExpsp43 = new Decimal(1.37)
                costLimitsp43 = new Decimal('e100')
                return player.buyablePrice(costTypesp43, new Decimal(x), costBasesp43, costExpsp43, costLimitsp43)
            },
            effect(x) {
                effBasesp43 = new Decimal(0.1)
                effStacksp43 = new Decimal(x)

                return Decimal.times(effBasesp43, effStacksp43)
            },
            title() { return "superprestige buyable 43"},
            display() { return "add buyable point gain power by "+format(effBasesp43)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp43 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp43, player[this.layer].points, costBasesp43, costExpsp43, costLimitsp43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp43, player[this.layer].points, costBasesp43, costExpsp43, costLimitsp43))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp43, player.buyableMaxPurchaseable(costTypesp43, player[this.layer].points, costBasesp43, costExpsp43, costLimitsp43), costBasesp43, costExpsp43, costLimitsp43))}
                    }
                }
            },
        },
        44: {
            unlocked() {return true},
            cost(x) {
                costTypesp44 = "asymptote"
                costBasesp44 = new Decimal(2.05)
                costExpsp44 = new Decimal(1.57)
                costLimitsp44 = layers.sp.buyables[44].purchaseLimit.add(1)

                return player.buyablePrice(costTypesp44, new Decimal(x), costBasesp44, costExpsp44, costLimitsp44)
            },
            effect(x) {
                effBasesp44 = new Decimal(0.01)
                effStacksp44 = new Decimal(x)

                return Decimal.times(effBasesp44, effStacksp44)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 44"},
            display() { return "add buyable point gain second power by "+format(effBasesp44)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp44)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp44 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp44, player[this.layer].points, costBasesp44, costExpsp44, costLimitsp44).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp44, player[this.layer].points, costBasesp44, costExpsp44, costLimitsp44))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp44, player.buyableMaxPurchaseable(costTypesp44, player[this.layer].points, costBasesp44, costExpsp44, costLimitsp44), costBasesp44, costExpsp44, costLimitsp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypesp51 = "normal"
                costBasesp51 = new Decimal(1.5)
                costExpsp51 = new Decimal(1.07)
                costLimitsp51 = new Decimal('e100')
                return player.buyablePrice(costTypesp51, new Decimal(x), costBasesp51, costExpsp51, costLimitsp51)
            },
            effect(x) {
                effBasesp51 = new Decimal(0.1)
                effStacksp51 = new Decimal(x)

                return Decimal.times(effBasesp51, effStacksp51)
            },
            title() { return "superprestige buyable 51"},
            display() { return "add base superprestige point gain by "+format(effBasesp51)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp51)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp51 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp51, player[this.layer].points, costBasesp51, costExpsp51, costLimitsp51).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp51, player[this.layer].points, costBasesp51, costExpsp51, costLimitsp51))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp51, player.buyableMaxPurchaseable(costTypesp51, player[this.layer].points, costBasesp51, costExpsp51, costLimitsp51), costBasesp51, costExpsp51, costLimitsp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypesp52 = "normal"
                costBasesp52 = new Decimal(1.7)
                costExpsp52 = new Decimal(1.17)
                costLimitsp52 = new Decimal('e100')
                return player.buyablePrice(costTypesp52, new Decimal(x), costBasesp52, costExpsp52, costLimitsp52)
            },
            effect(x) {
                effBasesp52 = new Decimal(0.05)
                effStacksp52 = new Decimal(x)

                return Decimal.times(effBasesp52, effStacksp52)
            },
            title() { return "superprestige buyable 52"},
            display() { return "add superprestige point gain mult by "+format(effBasesp52)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp52)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp52 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp52, player[this.layer].points, costBasesp52, costExpsp52, costLimitsp52).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp52, player[this.layer].points, costBasesp52, costExpsp52, costLimitsp52))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp52, player.buyableMaxPurchaseable(costTypesp52, player[this.layer].points, costBasesp52, costExpsp52, costLimitsp52), costBasesp52, costExpsp52, costLimitsp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypesp53 = "normal"
                costBasesp53 = new Decimal(1.9)
                costExpsp53 = new Decimal(1.37)
                costLimitsp53 = new Decimal('e100')
                return player.buyablePrice(costTypesp53, new Decimal(x), costBasesp53, costExpsp53, costLimitsp53)
            },
            effect(x) {
                effBasesp53 = new Decimal(0.1)
                effStacksp53 = new Decimal(x)

                return Decimal.times(effBasesp53, effStacksp53)
            },
            title() { return "superprestige buyable 53"},
            display() { return "add superprestige point gain power by "+format(effBasesp53)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp53 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp53, player[this.layer].points, costBasesp53, costExpsp53, costLimitsp53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp53, player[this.layer].points, costBasesp53, costExpsp53, costLimitsp53))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp53, player.buyableMaxPurchaseable(costTypesp53, player[this.layer].points, costBasesp53, costExpsp53, costLimitsp53), costBasesp53, costExpsp53, costLimitsp53))}
                    }
                }
            },
        },
        54: {
            unlocked() {return true},
            cost(x) {
                costTypesp54 = "asymptote"
                costBasesp54 = new Decimal(2.1)
                costExpsp54 = new Decimal(1.57)
                costLimitsp54 = layers.sp.buyables[54].purchaseLimit.add(1)

                return player.buyablePrice(costTypesp54, new Decimal(x), costBasesp54, costExpsp54, costLimitsp54)
            },
            effect(x) {
                effBasesp54 = new Decimal(0.01)
                effStacksp54 = new Decimal(x)

                return Decimal.times(effBasesp54, effStacksp54)
            },
            purchaseLimit: new Decimal(10),
            title() { return "superprestige buyable 54"},
            display() { return "add superprestige point gain second power by "+format(effBasesp54)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp54)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp54 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp54, player[this.layer].points, costBasesp54, costExpsp54, costLimitsp54).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp54, player[this.layer].points, costBasesp54, costExpsp54, costLimitsp54))
                        if (player[this.layer].points.lt('e1000')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp54, player.buyableMaxPurchaseable(costTypesp54, player[this.layer].points, costBasesp54, costExpsp54, costLimitsp54), costBasesp54, costExpsp54, costLimitsp54))}
                    }
                }
            },
        },
    },
})



addLayer("a", {
    name: "Ascension", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ffffff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "higher planes of existence", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        adda = new Decimal(0)


        multa = new Decimal(0.1)
        

        return multa
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expa = new Decimal(1)


        exp2a = new Decimal(1)

        return expa
    },
    getResetGain() {
        ap = player.points.add(adda).times(multa).pow(expa)
        if (ap.gte(1)) {ap = ap.log10().pow(exp2a).pow10()}

        return lp.floor().max(0)
    },
    getNextAt() {
        nexta = getResetGain('a').add(1)
        if (nexta.gte(1)) {nexta = nexta.log10().root(exp2a).pow10()}
        return nexta.root(expa).div(multa).sub(adda)
    },
    canReset() {return getResetGain('a').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset to ascend to "+formatWhole(getResetGain('a'))+" higher planes of existence. Next at "+format(getNextAt('a'))+" points" },
    row: 9, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "A", description: "A: Ascend", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
    },
    upgrades: {
    },
})