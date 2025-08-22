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
        addl = new Decimal(-2.5)


        multl = new Decimal(2)
        

        return multl
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expl = new Decimal(1)


        exp2l = new Decimal(1)

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
    update(diff){
        if (player.points.gte(getBuyableAmount('l', 99))) {setBuyableAmount('l', 99, player.points)}

    },
    doReset(resettingLayer) { //lootbox        
        if ((layers[resettingLayer].row > 4.5)||layers[resettingLayer] == "wr") {layerDataReset(this.layer, [])}
        if (layers[resettingLayer].row == 4) {
            if (hasMilestone('m', 10)) {}
            else {
            listkeep = []
            if (buyableEffect('r', 34).gt(0.9999)) {listkeep.push("clickables")}
                else {
                    gearlevelkeep = buyableEffect('r', 34).toNumber()
                    newgearlevel = getClickableState('l', 11)
                    for (i = 0; i < 4; i++) {
                        for (j = 0; j < 4; j++) {
                            newgearlevel[i][j] = Math.floor(newgearlevel[i][j] * gearlevelkeep)
                        }
                    }
                }
                if (buyableEffect('r', 44).gt(0.9999)) {listkeep.push("buyables")}
                else {
                    scrapkeep = buyableEffect('r', 44)
                    newscrap = []
                    for (i = 21; i < 24; i++) {
                        newscrap[i] = getBuyableAmount('l', i).times(scrapkeep).floor()
                    }
                }
                layerDataReset(this.layer, listkeep)
                if (buyableEffect('r', 34).lt(0.9999)) {setClickableState('l', 11, newgearlevel)}
                if (buyableEffect('r', 44).lt(0.9999)) {
                    for (i = 21; i < 24; i++) {
                        setBuyableAmount('l', i, newscrap[i])
                    }
                }
            }
        }
    },
    layerShown(){
        realcondition = (player.points.gte(3)||player.l.total.gte(1)||player.hp.total.gte(1))
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)
    },
    clickables: {
        11: { //gear level grid, numbers
            unlocked: false,
            onClick() {
            },
            canClick() {return false},

        },
        12: { //maxgearlevel - 500
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
                effectivegearlevel = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
                // gearleveldiscountfactor = [[1.37972966146121483**(5 - getBuyableAmount('r', 41).round().toNumber()), 1.37972966146121483**(5 - getBuyableAmount('r', 41).round().toNumber()), Infinity, Infinity], 
                //                            [1.37972966146121483**(5 - getBuyableAmount('r', 41).round().toNumber()), 1.37972966146121483**(5 - getBuyableAmount('r', 41).round().toNumber()), Infinity, Infinity], 
                //                            [1.37972966146121483**(5 - getBuyableAmount('r', 41).round().toNumber()), 1.37972966146121483**(5 - getBuyableAmount('r', 41).round().toNumber()), 1.58489319246111349**(5 - getBuyableAmount('r', 42).round().toNumber()), Infinity],
                //                            [1.37972966146121483**(5 - getBuyableAmount('r', 41).round().toNumber()), 1.37972966146121483**(5 - getBuyableAmount('r', 41).round().toNumber()), 1.58489319246111349**(5 - getBuyableAmount('r', 42).round().toNumber()), Infinity]]
                if (getBuyableAmount('r', 41).eq(5)) {gearleveldiscountfactorcommon = 1}
                else {gearleveldiscountfactorcommon = 5 / buyableEffect('r', 41).toNumber()}
                if (getBuyableAmount('r', 42).eq(5)) {gearleveldiscountfactorrare = 1}
                else {gearleveldiscountfactorrare = 10 / buyableEffect('r', 42).toNumber()}
                gearleveldiscountfactor = [[gearleveldiscountfactorcommon, gearleveldiscountfactorcommon, Infinity, Infinity],
                                           [gearleveldiscountfactorcommon, gearleveldiscountfactorcommon, Infinity, Infinity],
                                           [gearleveldiscountfactorcommon, gearleveldiscountfactorcommon, gearleveldiscountfactorrare, Infinity],
                                           [gearleveldiscountfactorcommon, gearleveldiscountfactorcommon, gearleveldiscountfactorrare, Infinity]]

                for (i = 0; i < 4; i++) {
                    for (j = 0; j < 4; j++) {
                        if (getClickableState('l', 11)[i][j]  > 500) {
                            effectivegearlevel[i][j] = (getClickableState('l', 11)[i][j] - 500) / gearleveldiscountfactor[i][j] + 500
                        } else {
                            effectivegearlevel[i][j] = getClickableState('l', 11)[i][j]
                        }
                    }
                }
                gearpower[0][0] = new Decimal(effectivegearlevel[0][0]).add(39.770640859342509633).div(39.770640859342509633).pow(1.5) // ((x+a)/b)^p = 1, 50
                gearpower[0][1] = new Decimal(effectivegearlevel[0][1]).add(15.060459189213234906).div(15.060459189213234906).pow(1.5) // ((x+a)/b)^p = 1, 200
                gearpower[0][2] = new Decimal(effectivegearlevel[0][2]).div(62.5) //0, 8
                gearpower[0][3] = new Decimal(effectivegearlevel[0][3]).div(25) //0, 20

                gearpower[1][0] = new Decimal(effectivegearlevel[1][0]).div(36.840314986403866058).pow(1.5)  // 0, 50
                gearpower[1][1] = new Decimal(effectivegearlevel[1][1]).div(14.620088691064330328).pow(1.5) // 0, 200
                gearpower[1][2] = new Decimal(effectivegearlevel[1][2]).div(50) //0, 10
                gearpower[1][3] = new Decimal(effectivegearlevel[1][3]).div(50) //0, 10

                gearpower[2][0] = new Decimal(effectivegearlevel[2][0]).add(24.337595272607097033).div(24.337595272607097033).pow(6)  // 1, 10^8
                gearpower[2][1] = new Decimal(effectivegearlevel[2][1]).add(5.0505050505050505051).div(5.0505050505050505051).pow(6)  // 1, 10^12
                gearpower[2][2] = new Decimal(effectivegearlevel[2][2]).div(921.00787466009665144).pow(1.5) // 0, 0.4
                gearpower[2][3] = new Decimal(effectivegearlevel[2][3]).div(5000) //0, 0.1

                gearpower[3][0] = new Decimal(effectivegearlevel[3][0]).add(137.30270572692735409).div(137.30270572692735409).pow(6) // 1, 10^4
                gearpower[3][1] = new Decimal(effectivegearlevel[3][1]).add(55.555555555555555556).div(55.555555555555555556).pow(6) // 1, 10^6
                gearpower[3][2] = new Decimal(effectivegearlevel[3][2]).div(1462.0088691064330328).pow(1.5) // 0, 0.2
                gearpower[3][3] = new Decimal(effectivegearlevel[3][3]).div(5000) //0, 0.1


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
                if (hasMilestone('m', 5)) {geartierbounds = [32, 29, 21, 18]}
                geartierboundstotal = [geartierbounds[0], geartierbounds[0]+geartierbounds[1], geartierbounds[0]+geartierbounds[1]+geartierbounds[2], geartierbounds[0]+geartierbounds[1]+geartierbounds[2]+geartierbounds[3]]
                if (geartiercoef < geartierboundstotal[0]) {geartier = 0}
                else if (geartiercoef < geartierboundstotal[1]) {geartier = 1}
                else if (geartiercoef < geartierboundstotal[2]) {geartier = 2}
                else if (geartiercoef < geartierboundstotal[3]) {geartier = 3}

                gearlevelcoef = (lootboxseed % 1)**2
                gearmultiplier = getBuyableAmount('l', 99).sub(3).times(250).toNumber()
                gearlevelraw = (1 + gearlevelcoef) * gearmultiplier
                if ((gearlevelraw > 500)&&(getBuyableAmount('r', 43).lt(4.999))) {gearlevelraw = (gearlevelraw / 500) ** (0.5 + buyableEffect('r', 4).toNumber()) * 500}

                if (hasMilestone('l', 0)) {setClickableState('l', 12, 200)}
                if (hasMilestone('m', 7)) {setClickableState('l', 12, 500)}
                gearlevel = Math.floor(Math.min(Math.max(gearlevelraw, 1), getClickableState('l', 12) + 500))

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
                    textdescription += " this is not better than your old gear, so you sell it for "
                }

                sellprice = Math.max(oldgearlevel / 100, oldgearlevel ** 2 / 25000, oldgearlevel ** 4 / 6.25e9) 
                scrapprice = Math.max(oldgearlevel - 500, 0)
                if (geartier == 3) {
                    sellprice *= 4
                    scrapprice *= 4
                }
                if (geartier == 2) {
                    sellprice *= 2
                }
                sellprice = Math.floor(sellprice * 100) / 100
                textdescription += "$"+sellprice.toFixed(2)
                if (scrapprice > 0) {textdescription += " and "+scrapprice.toString()+" scrap"}
                addPoints('j', sellprice)
                if (geartier < 2) { //if common or uncommon
                    setBuyableAmount('l', 21, getBuyableAmount('l', 21).add(scrapprice))
                }
                if (geartier == 2) { //if rare
                    setBuyableAmount('l', 22, getBuyableAmount('l', 22).add(scrapprice))
                }
                if (geartier == 3) { //if legendary, give all gear
                    setBuyableAmount('l', 21, getBuyableAmount('l', 21).add(scrapprice / 4 * 2))
                    setBuyableAmount('l', 22, getBuyableAmount('l', 22).add(scrapprice / 4))
                    setBuyableAmount('l', 23, getBuyableAmount('l', 23).add(scrapprice / 4))
                }
            },
        },
        12: {
            unlocked() {return player.p.total.gte('e1e5')||getBuyableAmount(this.layer, this.id).gte(1)},
            cost(x) {
                costTypel12 = "normal"
                costBasel12 = new Decimal('e1e5')
                costExpl12 = new Decimal(3)
                costLimitl12 = new Decimal('e2.7e9')
                costStackl12 = new Decimal(x)
                if (costStackl12.gte(60)) {costStackl12 = costStackl12.div(60).pow(1.25).times(60)}
                return player.buyablePrice(costTypel12, costStackl12, costBasel12, costExpl12, costLimitl12)
            },
            effect(x) {
                effBasel12 = new Decimal(100)
                effStackl12 = new Decimal(x)

                return Decimal.times(effBasel12, effStackl12)
            },
            title() { return "lootbox buyable 12"},
            display() { return "increase buyable price softcap start by "+format(effBasel12)+" OoM <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackl12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypel12 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypel12, player.p.points, costBasel12, costExpl12, costLimitl12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        actualMaxPurchaseablel12 = player.buyableMaxPurchaseable(costTypel12, player.p.points, costBasel12, costExpl12, costLimitl12)
                        if (actualMaxPurchaseablel12.gte(60)) {actualMaxPurchaseablel12 = actualMaxPurchaseablel12.div(60).root(1.25).times(60).floor()}
                        setBuyableAmount(this.layer, this.id, actualMaxPurchaseablel12)
                        
                    }
                }

            },
        },
        21: {// gear scraps common/uncommon
            unlocked() {return false},
            cost(x) {

                return Decimal.dOne
            },
            effect(x) {
                eff = Decimal.pow(2, getBuyableAmount('l', 21).times(buyableEffect('mtp', 33)).add(1).log(2).pow(1.3333333333333333).sub(23.41344561179871)).add(0.9999999104943257).pow(hasMilestone('l', 0)+0) //(log(1600)/log(2))^1.33, 1-2^-23.4
                //if (eff.gte(16)) {eff = eff.div(16).pow(0.5).times(16)}
                return eff
            },
            canAfford() { return false},
            buy() {

            },
        },
        22: {// gear scraps rare
            unlocked() {return false},
            cost(x) {

                return Decimal.dOne
            },
            effect(x) {
                eff = Decimal.pow(2, getBuyableAmount('l', 22).times(buyableEffect('mtp', 33)).add(1).log(2).pow(1.3333333333333333).div(2).sub(10.263708402767985)).add(0.999186578019176).pow(hasMilestone('l', 0)+0) //(log(800)/log(2))^1.33/2, 1-2^-10.2
                //if (eff.gte(4)) {eff = eff.div(4).pow(0.5).times(4)}
                return eff
            },
            canAfford() { return false},
            buy() {

            },
        },
        23: {// gear scraps legendary
            unlocked() {return false},
            cost(x) {

                return Decimal.dOne
            },
            effect(x) {
                eff = Decimal.min(getBuyableAmount('l', 23).times(buyableEffect('mtp', 33)).add(4).log(2).log(2).pow(0.25).pow(hasMilestone('l', 0)+0), getBuyableAmount('l', 23).div(100).add(1).pow(hasMilestone('l', 0)+0))
                //if (eff.gte(4)) {eff = eff.div(4).pow(0.5).times(4)}
                return eff
            },
            canAfford() { return false},
            buy() {

            },
        },
        99: {// best points
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
    upgrades: {
    },
    milestones: {
        0: {
            requirementDescription: "obtain a level 500 gear on all 16 slots",
            effectDescription: "unlock gear scrap and max gear level +200",
            done() {  
                gearlevel500slots = 0
                for (i = 0; i < 4; i++) {
                    for (j = 0; j < 4; j++) {
                        gearlevel500slots = gearlevel500slots + ((getClickableState('l', 11)[i][j] >= 500)*1)
                    }
                }
                return (gearlevel500slots == 16||hasMilestone('m', 7))
            },
            unlocked() {
                gearlevel500slots = 0
                for (i = 0; i < 4; i++) {
                    for (j = 0; j < 4; j++) {
                        gearlevel500slots = gearlevel500slots + ((getClickableState('l', 11)[i][j] >= 500)*1)
                    }
                }
                return gearlevel500slots >= 14
            }
        },
        1: {
            requirementDescription: "get 2,000 common and 1,000 rare scrap",
            effectDescription: "unlock scrap factory",
            done() {  
                reqcommonscrap = getBuyableAmount('l', 21).gte(2000)
                reqrarescrap = getBuyableAmount('l', 22).gte(1000)
                return reqcommonscrap&&reqrarescrap
            },
            unlocked() {
                return getBuyableAmount('l', 21).add(getBuyableAmount('l', 22)).gte(2000)
            }
        },
    },
    infoboxes: {
        11: {
            body() {
                mingearlevel = Math.floor(Math.max(Math.min(getBuyableAmount('l', 99).sub(3).times(250).toNumber(), getClickableState('l', 12) + 500), 1))
                maxgearlevel = Math.floor(Math.max(Math.min(getBuyableAmount('l', 99).sub(3).times(250).toNumber() * 2, getClickableState('l', 12) + 500), 1))
                textl = "Current gear level: "+mingearlevel.toString()+" to "+maxgearlevel.toString()
                textl += "<br> Points: x"+format(gearpower[0][0])+", x"+format(gearpower[0][1])+", -"+format(gearpower[0][2])+" to 2nd sc, -"+format(gearpower[0][3])+" to 3rd sc"
                textl += "<br> Bonus points: x"+format(gearpower[1][0])+", x"+format(gearpower[1][1])+", -"+format(gearpower[1][2])+" to 1st sc, -"+format(gearpower[1][3])+" to 2nd sc"
                textl += "<br> Prestige: x"+format(gearpower[2][0])+", x"+format(gearpower[2][1])+", +"+format(gearpower[2][2])+" to exp, +"+format(gearpower[2][3])+" to 2nd exp"
                textl += "<br> 2nd row: x"+format(gearpower[3][0])+", x"+format(gearpower[3][1])+", +"+format(gearpower[3][2])+" to exp, +"+format(gearpower[3][3])+" to 2nd exp"
                
                if (getBuyableAmount('l', 21).gt(0)||hasMilestone('l', 0)) {
                    textl += " <br><br> You have "+format(getBuyableAmount('l', 21))+" common gear scrap, multiplying buyables ?1/?2 above this effect by "+format(buyableEffect('l', 21))
                }
                if (getBuyableAmount('l', 22).gt(0)||hasMilestone('l', 0)) {
                    textl += " <br><br> You have "+format(getBuyableAmount('l', 22))+" rare gear scrap, multiplying buyables ?3  above this except 13 effect by "+format(buyableEffect('l', 22))
                }
                if (getBuyableAmount('l', 23).gt(0)||hasMilestone('l', 0)) {
                    textl += " <br><br> You have "+format(getBuyableAmount('l', 23))+" legendary gear scrap, raising all buyables affected by previous scraps' effective count by "+format(buyableEffect('l', 23))
                }
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
        // if (getBuyableAmount('j', 11) == '') {setBuyableAmount('j', 11, 0)}
        // if (typeof(getBuyableAmount('j', 11)) == 'undefined') {setBuyableAmount('j', 11, 0)}
        // if (getBuyableAmount('j', 22) == '') {setClickableState('j', 12, 0)}
        // if (typeof(getBuyableAmount('j', 22)) == 'undefined') {setClickableState('j', 12, 0)}
        // if (getBuyableAmount('j', 12) == '') {setClickableState('j', 13, 0)}
        // if (typeof(getBuyableAmount('j', 12)) == 'undefined') {setClickableState('j', 13, 0)}
        // if (getClickableState('j', 14) == '') {setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))}
        // if (typeof(getClickableState('j', 14)) == 'undefined') {setClickableState('j', 14, Math.floor((Date.now()-342000000)/604800000))}
        // if (getClickableState('j', 15) == '') {setClickableState('j', 15, 7.25)}
        // if (typeof(getClickableState('j', 15)) == 'undefined') {setClickableState('j', 15, 7.25)}
        return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "This layer cannot be reset" },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    displayRow: "side",
    layerShown(){
        realcondition = true
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)
    },
    doReset(resettingLayer) { //job
        if (layers[resettingLayer].row > this.row) {layerDataReset(this.layer, [])}
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
                wages = getBuyableAmount('j', 25).times(0.25).add(7.25).times(buyableEffect('mtp', 11))
                clicksPerHour = new Decimal(4800)
                owedMoney = getBuyableAmount('j', 11).times(wages).div(clicksPerHour).times(100).floor().div(100)
                return Decimal.dZero
            },
            title() { return "get paid for all the work you did"},
            display() { return "you have clicked "+formatWhole(getBuyableAmount('j', 11))+" times <br> your wages are $"+formatMoney(wages)+" per "+formatWhole(clicksPerHour)+" clicks <br> you are owed $"+formatMoney(owedMoney)+"<br> you may get a payday after "+formatWhole(timeUntilPayday)+" seconds"},
            canAfford() { 
                nextPaydayTime = getBuyableAmount('j', 22).add(21600000 * (1-hasMilestone('m', 6)))
                timeUntilPayday = nextPaydayTime.sub(Date.now()).div(1000).max(0).ceil()
                return timeUntilPayday.eq(0)},
            buy() {
                player[this.layer].points = player[this.layer].points.add(owedMoney)
                clicksToBeTotalled = getBuyableAmount('j', 11)
                setBuyableAmount('j', 11, Decimal.dZero)
                setBuyableAmount('j', 22, new Decimal(Date.now()))

                if (getBuyableAmount('j', 24).eq(Math.floor((Date.now()-342000000)/604800000))) {setBuyableAmount('j', 12, getBuyableAmount('j', 12).add(clicksToBeTotalled))} else {setBuyableAmount('j', 12, clicksToBeTotalled)}
                setBuyableAmount('j', 24, new Decimal(Math.floor((Date.now()-342000000)/604800000)))
                
                //states:
                //11 is the amount of clicks unpaid
                //22 is the last time player got paid
                //12 is the amount of total paid clicks this week
                //24 is the week number 
                //25 is the raise
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dZero
            },
            effect(x) {
                clicksGoal = getBuyableAmount('j', 25).times(300).add(2400)
                if (getBuyableAmount('j', 25).gte(371)) {clicksGoal = getBuyableAmount('j', 25).sub(100).times(2400).add(113700)}
                raiseChance = getBuyableAmount('j', 12).sub(clicksGoal).div(1200).tanh().max(0).min(1)
                if (getBuyableAmount('j', 25).gte(371)) {raiseChance = getBuyableAmount('j', 12).sub(clicksGoal).div(getBuyableAmount('j', 25).sub(100).times(1200).add(1200)).tanh().max(0).min(1)}
                return Decimal.dZero
            },
            title() { return "apply for a 25c raise"},
            display() { return "you have clicked "+formatWhole(getBuyableAmount('j', 12))+" times this week <br> your productivity goal is "+format(clicksGoal)+" clicks each week <br> if you apply for a raise now, there's a "+format(raiseChance.times(100), 2)+"% chance you'll get it"},
            canAfford() { 
                return raiseChance.gt(0)},
            buy() {
                if (raiseChance.gte(Math.random())) {setBuyableAmount('j', 25, getBuyableAmount('j', 25).add(1))}
                setBuyableAmount('j', 12, Decimal.dZero)
                
            },
        },
        22: {// last time player got paid
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
        24: {// week number
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
        25: {// number of raises
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
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 0}
        },
        12: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 1}
        },
        13: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 2}
        },
        21: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 3}
        },
        22: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 4}
        },
        23: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 5}
        },
        31: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 6}
        },
        32: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 7}
        },
        33: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 8}
        },
        41: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 9}
        },
        42: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 10}
        },
        43: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 11}
        },
        51: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 12}
        },
        52: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 13}
        },
        53: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 14}
        },
        61: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 15}
        },
        62: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 16}
        },
        63: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 17}
        },
        71: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 18}
        },
        72: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 19}
        },
        73: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 20}
        },
        81: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 21}
        },
        82: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 22}
        },
        83: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 23}
        },
        91: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 24}
        },
        92: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
            },
            canClick() {return lastClickedTime % 27 == 25}
        },
        93: {
            display: "click me",
            onClick() {
                lastClickedTime = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(1))
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
    row: 4, // Row the layer is in on the tree (0 is the first row)
    displayRow: "side",
    layerShown(){
        realcondition = true
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)},
    doReset(resettingLayer) { //superjob
        if (layers[resettingLayer].row > this.row) {layerDataReset(this.layer, [])}
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
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 0}
        },
        12: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 1}
        },
        13: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 2}
        },
        21: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 3}
        },
        22: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 4}
        },
        23: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 5}
        },
        31: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 6}
        },
        32: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 7}
        },
        33: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 8}
        },
        41: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 9}
        },
        42: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 10}
        },
        43: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 11}
        },
        51: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 12}
        },
        52: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 13}
        },
        53: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 14}
        },
        61: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 15}
        },
        62: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 16}
        },
        63: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 17}
        },
        71: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 18}
        },
        72: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 19}
        },
        73: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 20}
        },
        81: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 21}
        },
        82: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 22}
        },
        83: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 23}
        },
        91: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 24}
        },
        92: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 25}
        },
        93: {
            display: "click me",
            onClick() {
                lastClickedTimeS = Date.now()
                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(5))
            },
            canClick() {return lastClickedTimeS % 27 == 26}
        },
    }
})

addLayer("w", {
    name: "management", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "W", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#f3f879",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "workers", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    canReset() {return false},
    prestigeNotify() {return true},
    row: 4, // Row the layer is in on the tree (0 is the first row)
    displayRow: "side",
    doReset(resettingLayer) { //workers

        if (layers[resettingLayer].row > this.row) {layerDataReset(this.layer, [])}
    },
    update(diff) {
        if (buyableEffect('w', 11).gt(0)) {
            setBuyableAmount('w', 12, getBuyableAmount('w', 12).add(buyableEffect('w', 11).sub(buyableEffect('w', 16).times(getBuyableAmount('w', 12))).times(diff)))
        }
        player.w.points = getBuyableAmount('w', 12).floor()
        if (getBuyableAmount('w', 17).gt(player.w.points)) {
            setBuyableAmount('w', 17, player.w.points)
        }

        if (buyableEffect('w', 22).gt(0)) {setBuyableAmount('w', 22, getBuyableAmount('w', 22).add(buyableEffect('w', 22).times(diff)))} else {setBuyableAmount('w', 22, Decimal.dZero)}
        if (buyableEffect('w', 23).gt(0)) {setBuyableAmount('w', 23, getBuyableAmount('w', 23).add(buyableEffect('w', 23).times(diff)))} else {setBuyableAmount('w', 23, Decimal.dZero)}
        if (buyableEffect('w', 24).gt(0)) {setBuyableAmount('w', 24, getBuyableAmount('w', 24).add(buyableEffect('w', 24).times(diff)))} else {setBuyableAmount('w', 24, Decimal.dZero)}

    },
    layerShown(){
        realcondition = player.j.points.gte(100)||player.w.total.gte(1)||getBuyableAmount('w', 12).gt(0)
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)
    },
    buyables: {
        11: { //rate at which workers join the company in worker/sec
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                workerspersec = new Decimal(0)
                if (hasUpgrade('w', 11)) {workerspersec = workerspersec.add(upgradeEffect('w', 11))}
                if (hasUpgrade('w', 13)) {workerspersec = workerspersec.add(upgradeEffect('w', 13))}
                if (hasUpgrade('w', 21)) {workerspersec = workerspersec.add(upgradeEffect('w', 21))}
                if (hasUpgrade('w', 23)) {workerspersec = workerspersec.add(upgradeEffect('w', 23))}
                if (hasUpgrade('w', 31)) {workerspersec = workerspersec.add(upgradeEffect('w', 31))}
                if (hasUpgrade('w', 33)) {workerspersec = workerspersec.add(upgradeEffect('w', 33))}
                if (hasUpgrade('w', 41)) {workerspersec = workerspersec.add(upgradeEffect('w', 41))}
                if (hasUpgrade('w', 43)) {workerspersec = workerspersec.add(upgradeEffect('w', 43))}

                populationLimit = buyableEffect('r', 51)
                effectiveworkers = getBuyableAmount('w', 12).sub(getBuyableAmount('w', 19))
                workerspersec = workerspersec.times(Decimal.sub(populationLimit, effectiveworkers).div(populationLimit))
                return workerspersec
            },
            title() { return },
            
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        12: { // progress to next worker
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                return Decimal.dZero
            },
            display() { return },
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        13: { // bonus clicks per hour: default 4800
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                clicksPerHourw = new Decimal(4800)
                if (hasUpgrade('w', 32)) {clicksPerHourw = clicksPerHourw.add(upgradeEffect('w', 32)[0])}
                clicksPerHourw = clicksPerHourw.add(getBuyableAmount('w', 13).times(300))

                if (hasUpgrade('w', 15)) {clicksPerHourw = clicksPerHourw.times(upgradeEffect('w', 15))}
                if (hasUpgrade('w', 25)) {clicksPerHourw = clicksPerHourw.times(upgradeEffect('w', 25))}
                if (hasUpgrade('w', 35)) {clicksPerHourw = clicksPerHourw.times(upgradeEffect('w', 35)[0])}
                if (hasUpgrade('w', 44)) {clicksPerHourw = clicksPerHourw.times(upgradeEffect('w', 44)[2])}
                if (hasUpgrade('w', 55)) {clicksPerHourw = clicksPerHourw.times(upgradeEffect('w', 55))}
                return clicksPerHourw
            },
            display() { return },
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        14: { // hours per day: default 8, max 24
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                hoursPerDay = new Decimal(8)
                if (hasUpgrade('w', 12)) {hoursPerDay = hoursPerDay.add(upgradeEffect('w', 12))}
                if (hasUpgrade('w', 34)) {hoursPerDay = hoursPerDay.add(upgradeEffect('w', 34)[0])}
                if (hasUpgrade('w', 44)) {hoursPerDay = hoursPerDay.add(upgradeEffect('w', 44)[0])}
                if (getBuyableAmount('w', 15).lt(0)) {
                    hoursPerDay = hoursPerDay.add(getBuyableAmount('w', 15).times(2))
                } else {
                    payfactor = new Decimal(1/4)
                    if (hasUpgrade('w', 24)) {payfactor = payfactor.times(upgradeEffect('w', 24))}
                    if (hasUpgrade('w', 34)) {payfactor = payfactor.times(upgradeEffect('w', 34)[1])}
                    if (hasUpgrade('w', 44)) {payfactor = payfactor.times(upgradeEffect('w', 44)[1])}
                    hoursPerDay = hoursPerDay.add(getBuyableAmount('w', 15).times(payfactor))
                }
                hoursPerDay = hoursPerDay.times(24).div(hoursPerDay.add(16)).max(0)
                return hoursPerDay
            },
            display() { return },
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        15: { // wages player pays workers
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                wagesw = new Decimal(7.25)
                if (hasUpgrade('w', 14)) {wagesw = wagesw.sub(upgradeEffect('w', 14))}
                if (hasUpgrade('w', 32)) {wagesw = wagesw.sub(upgradeEffect('w', 32)[1])}
                if (hasUpgrade('w', 34)) {wagesw = wagesw.sub(upgradeEffect('w', 34)[2])}
                if (hasUpgrade('w', 42)) {wagesw = wagesw.sub(upgradeEffect('w', 42))}
                if (hasUpgrade('w', 44)) {wagesw = wagesw.sub(upgradeEffect('w', 44)[3])}
                wagesw = wagesw.add(getBuyableAmount('w', 15).times(0.25))
                return wagesw
            },
            display() { return },
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        16: { // rate at which workers leave the job in 1/sec
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                baseclicksPerHourw = new Decimal(4800)
                if (hasUpgrade('w', 32)) {baseclicksPerHourw = baseclicksPerHourw.add(upgradeEffect('w', 32)[0])}

                leavejobrate = new Decimal(1/6000).times(getBuyableAmount('w', 13).add(baseclicksPerHourw.div(300)).div(baseclicksPerHourw.div(300)).pow(4))
                if (hasUpgrade('w', 22)) {leavejobrate = leavejobrate.times(upgradeEffect('w', 22))}
                if (hasUpgrade('w', 35)) {leavejobrate = leavejobrate.times(upgradeEffect('w', 35)[1])}
                return leavejobrate
            },
            display() { return },
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        17: { // number of workers in common scrap factory
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(123)
            },
            display() { return },
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        18: { // number of workers in rare scrap factory
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(123)
            },
            display() { return },
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        19: { // number of extra workers (e.g. research)
            unlocked() {return false},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {

                return new Decimal(123)
            },
            display() { return },
            canAfford() { return false },
            buy() {
            },
            buyMax() {

            },
        },
        22: { //effect: clicks per second
            unlocked() {return true},
            cost(x) {
                return Decimal.dZero
            },
            effect(x) {
                wagesw = buyableEffect('w', 15)
                clicksPerHourw = buyableEffect('w', 13).max(1)
                owingMoney = getBuyableAmount('w', 22).div(clicksPerHourw).times(wagesw).times(100).ceil().div(100)
                return buyableEffect('w', 13).times(buyableEffect('w', 14)).times(player.w.points.sub(getBuyableAmount('w', 17)).sub(getBuyableAmount('w', 18))).div(86400)
            },
            title() { return "pay your workers for all the work they did"},
            display() { return "they have clicked "+formatWhole(getBuyableAmount('w', 22))+" times <br> their wages are $"+formatMoney(wagesw)+" per "+formatWhole(clicksPerHourw)+" clicks <br> you owe $"+formatMoney(owingMoney)},
            canAfford() { 
                return player.j.points.gte(owingMoney)},
            buy() {
                player.j.points = player.j.points.sub(owingMoney)

                setBuyableAmount('j', 11, getBuyableAmount('j', 11).add(getBuyableAmount('w', 22)).floor())
                setBuyableAmount('w', 22, new Decimal(0))


            },
        },
        23: { //effect: common scraps per second
            unlocked() {return true},
            cost(x) {
                return Decimal.dZero
            },
            effect(x) {
                wagesw = buyableEffect('w', 15)
                scrapsPerHourw = buyableEffect('w', 13).div(40).max(1)
                if (hasUpgrade('w', 45)) {scrapsPerHourw = scrapsPerHourw.times(upgradeEffect('w', 45))}
                owingMoneyscrap = getBuyableAmount('w', 23).div(scrapsPerHourw).times(wagesw).times(100).ceil().div(100)
                owingGems = getBuyableAmount('w', 23).times(50).ceil()
                return buyableEffect('w', 13).div(40).times(buyableEffect('w', 14)).times(getBuyableAmount('w', 17)).div(86400)
            },
            title() { return "pay your workers for all the work they did"},
            display() { return "they have made "+formatWhole(getBuyableAmount('w', 23))+" scraps <br> their wages are $"+formatMoney(wagesw)+" per "+formatWhole(scrapsPerHourw)+" scraps <br> you owe $"+formatMoney(owingMoneyscrap)+" and "+format(owingGems)+" gems"},
            canAfford() { 
                return player.j.points.gte(owingMoneyscrap)&&player.g.points.gte(owingGems)},
            buy() {
                player.j.points = player.j.points.sub(owingMoneyscrap)
                player.g.points = player.g.points.sub(owingGems)
                setBuyableAmount('l', 21, getBuyableAmount('l', 21).add(getBuyableAmount('w', 23)).floor())
                setBuyableAmount('w', 23, new Decimal(0))


            },
        },
        24: { //effect: rare scraps per second
            unlocked() {return true},
            cost(x) {
                return Decimal.dZero
            },
            effect(x) {
                wagesw = buyableEffect('w', 15)
                rarescrapsPerHourw = buyableEffect('w', 13).div(80).max(1)
                if (hasUpgrade('w', 45)) {rarescrapsPerHourw = rarescrapsPerHourw.times(upgradeEffect('w', 45))}
                owingMoneyrarescrap = getBuyableAmount('w', 24).div(rarescrapsPerHourw).times(wagesw).times(100).ceil().div(100)
                owingGemsrare = getBuyableAmount('w', 24).times(100).ceil()
                return buyableEffect('w', 13).div(80).times(buyableEffect('w', 14)).times(getBuyableAmount('w', 18)).div(86400)
            },
            title() { return "pay your workers for all the work they did"},
            display() { return "they have made "+formatWhole(getBuyableAmount('w', 24))+" rare scraps <br> their wages are $"+formatMoney(wagesw)+" per "+formatWhole(rarescrapsPerHourw)+" scraps <br> you owe $"+formatMoney(owingMoneyrarescrap)+" and "+format(owingGemsrare)+" gems"},
            canAfford() { 
                return player.j.points.gte(owingMoneyrarescrap)&&player.g.points.gte(owingGemsrare)},
            buy() {
                player.j.points = player.j.points.sub(owingMoneyrarescrap)
                player.g.points = player.g.points.sub(owingGemsrare)
                setBuyableAmount('l', 22, getBuyableAmount('l', 22).add(getBuyableAmount('w', 24)).floor())
                setBuyableAmount('w', 24, new Decimal(0))


            },
        },
    }, 
    clickables: {
        11: {
            display: "decrease wages by 0.25c, also decreases working hours, requires payment for all previous clicks",
            onClick() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                setBuyableAmount('w', 15, getBuyableAmount('w', 15).sub(1))
            },
            canClick() {return (player.j.points.gte(owingMoney.add(owingMoneyscrap).add(owingMoneyrarescrap)))&&(player.g.points.gte(owingGems.add(owingGemsrare)))&&buyableEffect('w', 15).gt(0)}
        },
        12: {
            display: "increase wages by 0.25c, also increases working hours, requires payment for all previous clicks",
            onClick() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                setBuyableAmount('w', 15, getBuyableAmount('w', 15).add(1))
            },
            canClick() {return (player.j.points.gte(owingMoney.add(owingMoneyscrap).add(owingMoneyrarescrap)))&&(player.g.points.gte(owingGems.add(owingGemsrare)))}
        },
        21: {
            display: "decrease click speed requirement by 300 per hour, also decreases quit rate, requires payment for all previous clicks",
            onClick() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                setBuyableAmount('w', 13, getBuyableAmount('w', 13).sub(1))
            },
            canClick() {return (player.j.points.gte(owingMoney.add(owingMoneyscrap).add(owingMoneyrarescrap)))&&(player.g.points.gte(owingGems.add(owingGemsrare)))&&buyableEffect('w', 13).gt(900)}
        },
        22: {
            display: "increase click speed requirement by 300 per hour, also increases quit rate, requires payment for all previous clicks",
            onClick() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                setBuyableAmount('w', 13, getBuyableAmount('w', 13).add(1))
            },
            canClick() {return (player.j.points.gte(owingMoney.add(owingMoneyscrap).add(owingMoneyrarescrap)))&&(player.g.points.gte(owingGems.add(owingGemsrare)))}
        },
        31: {
            unlocked() {return hasMilestone('l', 1)&&player.w.points.gte(200)},
            display: "increase number of workers in common scrap factory by 1%",
            onClick() {
                onepercentworkers = player.w.points.div(100).floor()
                setBuyableAmount('w', 17, getBuyableAmount('w', 17).add(onepercentworkers))
            },
            canClick() {
                onepercentworkers = player.w.points.div(100).floor()
                return getBuyableAmount('w', 17).lte(player.w.points.sub(getBuyableAmount('w', 18)).sub(onepercentworkers)) 
            }
        },
        32: {
            unlocked() {return hasMilestone('l', 1)},
            display: "increase number of workers in common scrap factory",
            onClick() {
                setBuyableAmount('w', 17, getBuyableAmount('w', 17).add(1))
            },
            canClick() {return getBuyableAmount('w', 17).lt(player.w.points.sub(getBuyableAmount('w', 18))) }
        },
        33: {
            unlocked() {return hasMilestone('l', 1)},
            display: "decrease number of workers in common scrap factory",
            onClick() {
                setBuyableAmount('w', 17, getBuyableAmount('w', 17).sub(1))
            },
            canClick() {return getBuyableAmount('w', 17).gt(0)}
        },
        34: {
            unlocked() {return hasMilestone('l', 1)&&player.w.points.gte(200)},
            display: "decrease number of workers in common scrap factory by 1%",
            onClick() {
                onepercentworkers = player.w.points.div(100).floor()
                setBuyableAmount('w', 17, getBuyableAmount('w', 17).sub(onepercentworkers))
            },
            canClick() {
                onepercentworkers = player.w.points.div(100).floor()
                return getBuyableAmount('w', 17).gte(onepercentworkers)
            }
        },      
        41: {
            unlocked() {return hasMilestone('l', 1)&&player.w.points.gte(200)},
            display: "increase number of workers in rare scrap factory by 1%",
            onClick() {
                onepercentworkers = player.w.points.div(100).floor()
                setBuyableAmount('w', 18, getBuyableAmount('w', 18).add(onepercentworkers))
            },
            canClick() {
                onepercentworkers = player.w.points.div(100).floor()
                return getBuyableAmount('w', 18).lte(player.w.points.sub(getBuyableAmount('w', 17)).sub(onepercentworkers)) 
            }
        },  
        42: {
            unlocked() {return hasMilestone('l', 1)},
            display: "increase number of workers in rare scrap factory",
            onClick() {
                setBuyableAmount('w', 18, getBuyableAmount('w', 18).add(1))
            },
            canClick() {return getBuyableAmount('w', 18).lt(player.w.points.sub(getBuyableAmount('w', 17))) }
        },
        43: {
            unlocked() {return hasMilestone('l', 1)},
            display: "decrease number of workers in rare scrap factory",
            onClick() {
                setBuyableAmount('w', 18, getBuyableAmount('w', 18).sub(1))
            },
            canClick() {return getBuyableAmount('w', 18).gt(0)}
        },
        44: {
            unlocked() {return hasMilestone('l', 1)&&player.w.points.gte(200)},
            display: "decrease number of workers in rare scrap factory by 1%",
            onClick() {
                onepercentworkers = player.w.points.div(100).floor()
                setBuyableAmount('w', 18, getBuyableAmount('w', 18).sub(onepercentworkers))
            },
            canClick() {
                onepercentworkers = player.w.points.div(100).floor()
                return getBuyableAmount('w', 18).gte(onepercentworkers)
            }
        },
    },
    upgrades: {
        11: {
            title: "management upgrade 11",
            description: "advertise for your company on social media, attracting a worker every 600 seconds",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(1/600)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" workers/sec"},
            unlocked() {return true}
        },
        12: {
            title: "management upgrade 12",
            description: "encourages workers to work extended hours, increases their base hours by +0.25",
            cost: new Decimal(200),
            effect() {
                eff = new Decimal(1/4)
                if (hasUpgrade('w', 24)) {eff = eff.times(upgradeEffect('w', 24))}
                if (hasUpgrade('w', 34)) {eff = eff.times(upgradeEffect('w', 34)[1])}

                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            canAfford() {
                return player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(200))
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(this.cost)
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" base hours"},
            unlocked() {return true}
        },
        13: {
            title: "management upgrade 13",
            description: "advertise for your company on social media, attracting a worker every 600 seconds",
            cost: new Decimal(300),
            effect() {
                eff = new Decimal(1/600)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" workers/sec"},
            unlocked() {return true}
        },
        14: {
            title: "management upgrade 14",
            description: "hire disadvantaged workers who don't know/have trouble fighting for their rights, reduces base pay by $1/hr",
            cost: new Decimal(400),
            effect() {
                eff = new Decimal(1)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            canAfford() {
                return player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(200))
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(this.cost)
            },
            effectDisplay() {return "-$"+format(upgradeEffect(this.layer, this.id))+"/hour"},
            unlocked() {return true}
        },
        15: {
            title: "management upgrade 15",
            description: "build robots that keep track of workers' production, increases click speed by 20%",
            effect() {
                eff = new Decimal(1.2)


                return eff
            },
            canAfford() {
                reqmoney = player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(500))
                reqcommonscrap = getBuyableAmount('l', 21).gte(1000)
                reqrarescrap = getBuyableAmount('l', 22).gte(500)
                return reqmoney&&reqcommonscrap&&reqrarescrap
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(500)
                setBuyableAmount('l', 21, getBuyableAmount('l', 21).sub(1000))
                setBuyableAmount('l', 22, getBuyableAmount('l', 22).sub(500))
            },
            fullDisplay() {return "<h3> management upgrade 15 </h3> <br> build robots that keep track of workers' production, increases click speed by 20% <br> cost: 500 dollars, 1,000 common scrap, 500 rare scrap"+"<br> effect: x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('l', 21).add(getBuyableAmount('l', 22)).gte(1000)||hasUpgrade('w', 15)}
        },
        21: {
            title: "management upgrade 21",
            description: "sign up for job seeking websites as an employer, attracting a worker every 300 seconds",
            cost: new Decimal(600),
            effect() {
                eff = new Decimal(1/300)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" workers/sec"},
            unlocked() {return hasUpgrade('w', 14)}
        },
        22: {
            title: "management upgrade 22",
            description: "promote the mentality of dedication in the workplace, reduces quitting rate by 25%",
            cost: new Decimal(800),
            effect() {
                eff = new Decimal(3/4)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            canAfford() {
                return player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(800))
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(this.cost)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('w', 14)}
        },
        23: {
            title: "management upgrade 23",
            description: "buy billboards to advertise your company, attracting a worker every 100 seconds",
            cost: new Decimal(1000),
            effect() {
                eff = new Decimal(1/100)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" workers/sec"},
            unlocked() {return hasUpgrade('w', 14)}
        },
        24: {
            title: "management upgrade 24",
            description: "emotionally manipulate workers and defame the competition, increases extra hours by 33%",
            cost: new Decimal(1200),
            effect() {
                eff = new Decimal(4/3)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            canAfford() {
                return player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(1200))
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(this.cost)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('w', 14)}
        },    
        25: {
            title: "management upgrade 25",
            description: "add artifical arms to the robots to beat up underperformers, increases click speed by 25%",
            effect() {
                eff = new Decimal(1.25)


                return eff
            },
            canAfford() {
                reqmoney = player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(1600))
                reqcommonscrap = getBuyableAmount('l', 21).gte(2000)
                reqrarescrap = getBuyableAmount('l', 22).gte(1000)
                return reqmoney&&reqcommonscrap&&reqrarescrap
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(1600)
                setBuyableAmount('l', 21, getBuyableAmount('l', 21).sub(2000))
                setBuyableAmount('l', 22, getBuyableAmount('l', 22).sub(1000))
            },
            fullDisplay() {return "<h3> management upgrade 25 </h3> <br> add artifical arms to the robots to beat up underperformers, increases click speed by 25% <br> cost: 1,600 dollars, 2,000 common scrap, 1,000 rare scrap"+"<br> effect: x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('w', 15)}
        },
        31: {
            title: "management upgrade 31",
            description: "send flyers to communities by mail, attracting a worker every 20 seconds",
            cost: new Decimal(2000),
            effect() {
                eff = new Decimal(1/20)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" workers/sec"},
            unlocked() {return hasUpgrade('w', 24)}
        },    
        32: {
            title: "management upgrade 32",
            description: "set unrealistic goals for workers and cut their pay for not meeting those goals, increase base clicks per hour by 600 and reduces base pay by $1/hr",
            cost: new Decimal(4000),
            effect() {
                eff0 = new Decimal(600)
                eff1 = new Decimal(1)

                return [eff0, eff1]
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            canAfford() {
                return player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(4000))
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(this.cost)
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id)[0])+" clicks/hour, -$"+format(upgradeEffect(this.layer, this.id)[1])+"/hr"},
            unlocked() {return hasUpgrade('w', 24)}
        }, 
        33: {
            title: "management upgrade 33",
            description: "advertise your company on television, attracting a worker every 10 seconds",
            cost: new Decimal(6000),
            effect() {
                eff = new Decimal(1/10)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" workers/sec"},
            unlocked() {return hasUpgrade('w', 24)}
        },
        34: {
            title: "management upgrade 34",
            description: "optionally replace part of workers' income with probabilistic large payments, similar to lotteries. increase base hours by 2, extra hours by 50%, and reduces base pay by $1.5/hr",
            cost: new Decimal(8000),
            effect() {
                eff0 = new Decimal(2)
                eff1 = new Decimal(1.5)
                eff2 = new Decimal(1.5)
                return [eff0, eff1, eff2]
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            canAfford() {
                return player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(8000))
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(this.cost)
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id)[0])+" hours/day, x"+format(upgradeEffect(this.layer, this.id)[1])+" extra hours, -$"+format(upgradeEffect(this.layer, this.id)[2])+"/hr"},
            unlocked() {return hasUpgrade('w', 24)}
        },
        35: {
            title: "management upgrade 35",
            description: "connect a circuit to each workstation and the fence to shock workers who have temporarily stopped or slowed work and attempted escapees, increases click speed by 33% and reduces quit rate by 33%",
            effect() {
                eff0 = new Decimal(4/3)
                eff1 = new Decimal(2/3)

                return [eff0, eff1]
            },
            canAfford() {
                reqmoney = player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(10000))
                reqcommonscrap = getBuyableAmount('l', 21).gte(4000)
                reqrarescrap = getBuyableAmount('l', 22).gte(2000)
                return reqmoney&&reqcommonscrap&&reqrarescrap
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(10000)
                setBuyableAmount('l', 21, getBuyableAmount('l', 21).sub(4000))
                setBuyableAmount('l', 22, getBuyableAmount('l', 22).sub(2000))
            },
            fullDisplay() {return "<h3> management upgrade 35 </h3> <br> connect a circuit to each workstation to shock workers who have temporarily stopped or slowed work, increases click speed by 33% <br> cost: 10,000 dollars, 4,000 common scrap, 2,000 rare scrap"+"<br> effect: x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('w', 25)&&hasUpgrade('w', 34)}
        },
        41: {
            title: "management upgrade 41",
            description: "hire experts to fake studies on health benefits of prolonged clicking on a screen, attracting a worker every 3 seconds",
            cost: new Decimal(20000),
            effect() {
                eff = new Decimal(1/3)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" workers/sec"},
            unlocked() {return hasUpgrade('w', 34)}
        },
        42: {
            title: "management upgrade 42",
            description: "hire from countries with outdated laws without prohibiting debt slavery, reduces base pay by $2/hr",
            cost: new Decimal(40000),
            effect() {
                eff = new Decimal(2)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            canAfford() {
                return player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(40000))
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(this.cost)
            },
            effectDisplay() {return "-$"+format(upgradeEffect(this.layer, this.id))+"/hr"},
            unlocked() {return hasUpgrade('w', 34)}
        },
        43: {
            title: "management upgrade 43",
            description: "build a referral system, allowing workers to attract more workers",
            cost: new Decimal(60000),
            effect() {
                eff = getBuyableAmount('w', 12).times(1/1800)


                return eff
            },
            currencyInternalName: "points",
            currencyLayer: "j",
            currencyDisplayName: " dollars",
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))+" workers/sec"},
            unlocked() {return hasUpgrade('w', 34)}
        }, 
        44: {
            title: "management upgrade 44",
            description: "build an office at an unknown location and move all employees there, increases base hours by 6, extra hours by 100%, click speed by 50%, and reduces base pay by $3/hr",
            effect() {
                eff0 = new Decimal(6)
                eff1 = new Decimal(2)
                eff2 = new Decimal(1.5)
                eff3 = new Decimal(3)
                return [eff0, eff1, eff2, eff3]
            },
            canAfford() {
                reqmoney = player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(80000))
                reqcommonscrap = getBuyableAmount('l', 21).gte(8000)
                reqrarescrap = getBuyableAmount('l', 22).gte(4000)
                return reqmoney&&reqcommonscrap&&reqrarescrap
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(80000)
                setBuyableAmount('l', 21, getBuyableAmount('l', 21).sub(8000))
                setBuyableAmount('l', 22, getBuyableAmount('l', 22).sub(4000))
            },
            fullDisplay() {return "<h3> management upgrade 44 </h3> <br> build an office at an unknown location and move all employees there, increases base hours by 6, extra hours by 100%, click speed by 50%, and reduces base pay by $3/hr <br> cost: 80,000 dollars, 8,000 common scrap, 4,000 rare scrap"+"<br> effect: x"+format(upgradeEffect(this.layer, this.id)[2])},
            unlocked() {return hasUpgrade('w', 25)&&hasUpgrade('w', 34)}
        },
        45: {
            title: "management upgrade 45",
            description: "rebuild scrap factory, x2 all scrap production",
            effect() {
                eff = new Decimal(2)
                return eff
            },
            canAfford() {
                reqmoney = player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(100000))
                reqlegendaryscrap = getBuyableAmount('l', 23).gte(10000)
                return reqmoney&&reqlegendaryscrap
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(100000)
                setBuyableAmount('l', 23, getBuyableAmount('l', 23).sub(10000))
            },
            fullDisplay() {return "<h3> management upgrade 45 </h3> <br> rebuild scrap factory, x2 all scrap production <br> cost: 100,000 dollars, 10,000 legendary scrap"+"<br> effect: x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('w', 35)&&hasUpgrade('w', 44)}
        },
        55: {
            title: "management upgrade 55",
            description: "drain life force from workers, unlocks a layer but reduces click speed",
            effect() {
                eff = new Decimal(getClickableState('lf', 11)/6)
                return eff
            },
            canAfford() {
                reqmoney = player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(100000))
                reqcommonscrap = getBuyableAmount('l', 21).gte(8000)
                reqrarescrap = getBuyableAmount('l', 22).gte(4000)
                return reqmoney&&reqcommonscrap&&reqrarescrap
            },
            pay() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                player.j.points = player.j.points.sub(80000)
                setBuyableAmount('l', 21, getBuyableAmount('l', 21).sub(8000))
                setBuyableAmount('l', 22, getBuyableAmount('l', 22).sub(4000))
            },
            fullDisplay() {return "<h3> management upgrade 55 </h3> <br>drain life force from workers, unlocks a layer but reduces click speed by 50% <br> cost: 100,000 dollars, 8,000 common scrap, 4,000 rare scrap"+"<br> effect: x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('w', 54)&&hasUpgrade('w', 45)}
        },
        // 55: {
        //     title: "management upgrade 55",
        //     description: "remove workers' conciousness. workers work 24 hours a day, clicks 72,000 times an hour, never leaves, and sets pay to $0",
        //     effect() {
        //         return new Decimal(0)
        //     },
        //     canAfford() {
        //         reqmoney = player.j.points.gte(getBuyableAmount('w', 22).div(buyableEffect('w', 13)).times(buyableEffect('w', 15)).times(100).ceil().div(100).add(80000))
        //         reqcommonscrap = getBuyableAmount('l', 21).gte(8000)
        //         reqrarescrap = getBuyableAmount('l', 22).gte(4000)
        //         return reqmoney&&reqcommonscrap&&reqrarescrap
        //     },
        //     pay() {
        //         buyBuyable('w', 22)
        //         buyBuyable('w', 23)
        //         buyBuyable('w', 24)
        //         player.j.points = player.j.points.sub(80000)
        //         setBuyableAmount('l', 21, getBuyableAmount('l', 21).sub(8000))
        //         setBuyableAmount('l', 22, getBuyableAmount('l', 22).sub(4000))
        //     },
        //     fullDisplay() {return "<h3> management upgrade 44 </h3> <br> build an office at an unknown location and move all employees there, increases base hours by 6, extra hours by 100%, click speed by 50%, and reduces base pay by $3/hr <br> cost: 80,000 dollars, 8,000 common scrap, 4,000 rare scrap"+"<br> effect: x"+format(upgradeEffect(this.layer, this.id)[2])},
        //     unlocked() {return hasUpgrade('w', 25)&&hasUpgrade('w', 34)}
        // },
    },
    infoboxes: {
        11: {
            body() {
                textw = "Your workers are clicking "+formatWhole(buyableEffect('w', 13))+" times per hour, "+format(buyableEffect('w', 14))+" hours per day"
                textw += "<br> for an average of "+format(buyableEffect('w', 13).times(buyableEffect('w', 14)).div(86400))+" clicks per second per worker"
                textw += "<br> "+formatWhole(player.w.points.sub(getBuyableAmount('w', 17)).sub(getBuyableAmount('w', 18)))+" workers, for "+format(buyableEffect('w', 22))+" clicks per second"

                if (getBuyableAmount('w', 17).gte(1)) {
                    textw += "<br><br> Your workers are producing "+format(buyableEffect('w', 13).div(40))+" common scraps per hour, "
                    textw += "<br> for an average of "+format(buyableEffect('w', 13).div(40).times(buyableEffect('w', 14)).div(86400))+" common scraps per second per worker"
                    textw += "<br> "+formatWhole(getBuyableAmount('w', 17))+" workers, for "+format(buyableEffect('w', 23))+" common scraps per second"
                    textw += "<br> It takes 50 gems to produce a common scrap"
                    textw += "<br><br> Your workers are producing "+format(buyableEffect('w', 13).div(80))+" rare scraps per hour, "
                    textw += "<br> for an average of "+format(buyableEffect('w', 13).div(80).times(buyableEffect('w', 14)).div(86400))+" rare scraps per second per worker"
                    textw += "<br> "+formatWhole(getBuyableAmount('w', 18))+" workers, for "+format(buyableEffect('w', 24))+" rare scraps per second"
                    textw += "<br> It takes 100 gems to produce a rare scrap"
                    textw += "<br><br> You cannot produce legendary scraps"
                }
                textw += "<br><br> your workers are leaving the job after "+format(buyableEffect('w', 16).pow(-1))+" seconds on average"
                if (player.w.points.gte(populationLimit.times(0.8))) {textw += "<br> Your worker count is nearing the population of the world, which reduces your hiring rate"}
                textw += "<br>"+format(buyableEffect('w', 11), 4)+" workers per second, "+format(getBuyableAmount('w', 12).sub(player.w.points).times(100), 2)+"% to the next worker"
                return textw}
        }
    },

})
addLayer("g", {
    name: "in-game shop", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "G", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
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
    doReset(resettingLayer) { //gems

        if (layers[resettingLayer].row > this.row) {layerDataReset(this.layer, [])}
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
    layerShown(){
        realcondition = true
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)},
    clickables: {        
        11: {
            unlocked() {return getBuyableAmount('r', 21).gte(1)}, 
            title: "increase gem pack size by 1",
            onClick() {
                setBuyableAmount('g', 34, getBuyableAmount('g', 34).add(1))
            },
            canClick() {return getBuyableAmount('g', 34).lt(getBuyableAmount('r', 21)) }
        },
        12: {
            unlocked() {return getBuyableAmount('r', 21).gte(1)}, 
            title: "decrease gem pack size by 1",
            onClick() {
                setBuyableAmount('g', 34, getBuyableAmount('g', 34).sub(1))
            },
            canClick() {return getBuyableAmount('g', 34).gt(1) }
        },
    },
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
        34: {
            unlocked() {return getBuyableAmount('r', 21).gte(1)},
            cost(x) {
                gempacktier = new Decimal(9).add(getBuyableAmount('g', 34))
                gempacktierf =[gempacktier.sub(1).div(3).floor(), gempacktier.sub(1).sub(gempacktier.sub(1).div(3).floor().times(3))]
                gempackcoefficient = Decimal.dTen.pow(gempacktierf[0]).times(Decimal.dTwo.pow(gempacktierf[1].sub(1)))
                return gempackcoefficient.sub(0.01)
            },
            effect(x) {
                baseGemsN = gempackcoefficient.times(120)
                gemMultiplierN = Decimal.dOne.add(gempacktierf[1].div(20)).add(gempacktierf[0].div(6)).add(vipEffect)
                vipPointsN = gempackcoefficient.times(60).times(Decimal.dOne.add(gempacktierf[1].div(20)).add(gempacktierf[0].div(6)))

                return Decimal.times(baseGemsN, gemMultiplierN).round()
            },
            title() { return "gems pack "+formatWhole(gempacktier)},
            display() { 
                text = "gives "+formatWhole(baseGemsN)+" gems "
                if (gemMultiplierN.gt(1)) {text += "with "+format(gemMultiplierN.sub(1).times(100), 1)+"% free gems, boosted to "+formatWhole(this.effect())+" gems"}
                text += "<br> also gives "+formatWhole(vipPointsN)+" vip points"
                text +=" <br> cost: $"+format(this.cost())
                return text},
            canAfford() { return player.j.points.gte(this.cost()) },
            buy() {
                player.j.points = player.j.points.sub(this.cost())
                addPoints('g', this.effect())
                setBuyableAmount('g', 11, getBuyableAmount('g', 11).add(vipPointsN))
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
                costBaseg52 = new Decimal(5)

                costMultg52 = new Decimal(x).add(5)
                return Decimal.times(costBaseg52, costMultg52).floor()
            },
            effect(x) {
                effBaseg52 = new Decimal(0.2)
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
                if (hasMilestone('m', 1)) {cost = new Decimal(12)}
                if (hasMilestone('m', 8)) {cost = new Decimal(5)}
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
                if (hasMilestone('m', 1)) {cost = new Decimal(13)}
                if (hasMilestone('m', 8)) {cost = new Decimal(6)}
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
                if (hasMilestone('m', 1)) {cost = new Decimal(14)}
                if (hasMilestone('m', 8)) {cost = new Decimal(7)}
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
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
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
    row: 3,
    displayRow: "side", // Row the layer is in on the tree (0 is the first row)
    doReset(resettingLayer) { //milestones
        actualRow = 3
        if (getBuyableAmount('r', 22).gte(1)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    layerShown(){
        realcondition = true
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)},
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
            effectDescription: "better type on lootboxes, gain row 2 gain on reset every 5 seconds",
            done() { return player.points.gte(3.5) },
            toggles: [["bp", "autoGain"]]


        },
        5: {
            requirementDescription: "3.75 points",
            effectDescription: "better rarity on lootboxes",
            done() { return player.points.gte(3.75) },

        },
        6: {
            requirementDescription: "4.00 points",
            effectDescription: "lowers the maximum frequency of getting paid in the job",
            done() { return player.points.gte(4) },

        },
        7: {
            requirementDescription: "5.00 points",
            effectDescription: "lootbox max gear level +300, always unlock gear scrap",
            done() { return player.points.gte(5) },

        },
        8: {
            requirementDescription: "research buyable 23",
            effectDescription: "do not reset layer 2 on hyperprestige reset",
            done() { return getBuyableAmount('r', 23).gte(1) },

        },
        9: {
            requirementDescription: "research buyable 24",
            effectDescription: "do not reset bonus points on hyperprestige reset",
            done() { return getBuyableAmount('r', 24).gte(1) },

        },
        10: {
            requirementDescription: "research buyable 34 and 44 all complete",
            effectDescription: "do not reset lootboxes on hyperprestige reset",
            done() { return getBuyableAmount('r', 34).gte(4)&&getBuyableAmount('r', 44).gte(6) },

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
        basebgain = buyableEffect('l', 11)[1][1]


        bgainmult = buyableEffect('l', 11)[1][0]


        bgainraw = Decimal.max(basebgain.times(bgainmult), basebgain.add(bgainmult))

        bgainraw = bgainraw.times(player.points.pow(buyableEffect('b', 11)).times(buyableEffect('b', 11).pow(player.points)).max(1))

        bgain = bgainraw


        bfirstSoftcapStrength = new Decimal(20)
        bfirstSoftcapStrength = bfirstSoftcapStrength.sub(buyableEffect('l', 11)[1][2])
        bfirstSoftcapStrength = bfirstSoftcapStrength.sub(buyableEffect('hp', 12))
        if (player.b.points.gte(1)) {bgain = bgain.div(player.b.points.pow(bfirstSoftcapStrength))}

        bsecondSoftcapStrength = new Decimal(20)
        bsecondSoftcapStrength = bsecondSoftcapStrength.sub(buyableEffect('l', 11)[1][3])
        bsecondSoftcapStrength = bsecondSoftcapStrength.sub(buyableEffect('hp', 13))
        if (player.b.points.gte(2)) {bgain = bgain.div(player.b.points.div(2).pow(bsecondSoftcapStrength))}

        bthirdSoftcapStrength = new Decimal(60)
        if (player.b.points.gte(3)) {bgain = bgain.div(player.b.points.div(3).pow(bthirdSoftcapStrength))}

        bfourthSoftcapStrength = new Decimal(240)
        if (player.b.points.gte(4)) {bgain = bgain.div(player.b.points.div(4).pow(bfourthSoftcapStrength))}

        bfifthSoftcapStrength = new Decimal(1200)
        if (player.b.points.gte(5)) {bgain = bgain.div(player.b.points.div(5).pow(bfifthSoftcapStrength))}

        bsixthSoftcapStrength = new Decimal(7200)
	    if (player.b.points.gte(6)) {gain = gain.div(player.b.points.div(6).pow(bsixthSoftcapStrength))}
        
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
    layerShown(){
        realcondition = player.l.total.gte(1)||player.b.points.gte(0.0001)
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr) },
    doReset(resettingLayer) { //bonus points
        actualRow = 0
        if (hasMilestone('m', 9)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    buyables: {
        11: { //bonus coefficient (base 1)
            unlocked() {return false},
            cost(x) {
                return Decimal.dOne
            },
            effect(x) {

                return Decimal.dOne.add(buyableEffect('r', 32)).add(buyableEffect('mtp', 32))
            },
            canAfford() { return false },
            buy() {

            },
        },
    },
    infoboxes: {
        11: {

            body() {
                textb = "you have "+format(player.points, 4)+" points, multiplying bonus point gain by "+format(player.points.pow(buyableEffect('b', 11)).times(buyableEffect('b', 11).pow(player.points)).max(1), 4)
                textb += "<br> you have "+format(player.b.points, 4)+" bonus points, multiplying point gain by "+format(player.b.points.pow(buyableEffect('b', 11)).times(buyableEffect('b', 11).pow(player.b.points)).max(1), 4)
                if (buyableEffect('b', 11).gt(1)) {textb += " <br> the bonus coefficient is "+format(buyableEffect('b', 11))}
                return textb
            }
        }
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
        expp = expp.times(buyableEffect('hp', 23))
        

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
    layerShown(){
        realcondition = true
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)},
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
    doReset(resettingLayer) { //prestige
        actualRow = 1
        if (hasMilestone('m', 2)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypep11 = "normal"
                costBasep11 = new Decimal(1.3).root(buyableEffect('r', 31))
                costExpp11 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitp11 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypep11, new Decimal(x), costBasep11, costExpp11, costLimitp11)
            },
            effect(x) {
                effBasep11 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackp11 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep11, player.buyableMaxPurchaseable(costTypep11, player[this.layer].points, costBasep11, costExpp11, costLimitp11), costBasep11, costExpp11, costLimitp11))}
                    }
                }

            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypep12 = "normal"
                costBasep12 = new Decimal(1.5).root(buyableEffect('r', 31))
                costExpp12 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitp12 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypep12, new Decimal(x), costBasep12, costExpp12, costLimitp12)
            },
            effect(x) {
                effBasep12 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackp12 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep12, player.buyableMaxPurchaseable(costTypep12, player[this.layer].points, costBasep12, costExpp12, costLimitp12), costBasep12, costExpp12, costLimitp12))}
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep13, player.buyableMaxPurchaseable(costTypep13, player[this.layer].points, costBasep13, costExpp13, costLimitp13), costBasep13, costExpp13, costLimitp13))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypep21 = "normal"
                costBasep21 = new Decimal(1.5).root(buyableEffect('r', 31))
                costExpp21 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitp21 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypep21, new Decimal(x), costBasep21, costExpp21, costLimitp21)
            },
            effect(x) {
                effBasep21 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackp21 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep21, player.buyableMaxPurchaseable(costTypep21, player[this.layer].points, costBasep21, costExpp21, costLimitp21), costBasep21, costExpp21, costLimitp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypep22 = "normal"
                costBasep22 = new Decimal(1.7).root(buyableEffect('r', 31))
                costExpp22 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitp22 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypep22, new Decimal(x), costBasep22, costExpp22, costLimitp22)
            },
            effect(x) {
                effBasep22 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackp22 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep22, player.buyableMaxPurchaseable(costTypep22, player[this.layer].points, costBasep22, costExpp22, costLimitp22), costBasep22, costExpp22, costLimitp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypep23 = "normal"
                costBasep23 = new Decimal(1.9).root(buyableEffect('r', 31))
                costExpp23 = new Decimal(1.4).sub(buyableEffect('r', 33))
                costLimitp23 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypep23, new Decimal(x), costBasep23, costExpp23, costLimitp23)
            },
            effect(x) {
                effBasep23 = new Decimal(0.2).times(buyableEffect('l', 22))
                effStackp23 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep23, player.buyableMaxPurchaseable(costTypep23, player[this.layer].points, costBasep23, costExpp23, costLimitp23), costBasep23, costExpp23, costLimitp23))}
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep24, player.buyableMaxPurchaseable(costTypep24, player[this.layer].points, costBasep24, costExpp24, costLimitp24), costBasep24, costExpp24, costLimitp24))}
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

        multmp = new Decimal(0.5)
        multmp = multmp.add(buyableEffect('mp', 32))
        multmp = multmp.add(buyableEffect('bp', 32))
        multmp = multmp.add(buyableEffect('sp', 32))

        multmp = multmp.times(buyableEffect('l', 11)[3][0]).times(buyableEffect('l', 11)[3][1])

        return multmp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expmp = new Decimal(2).times(buyableEffect('l', 11)[3][2].add(1))
        expmp = expmp.add(buyableEffect('mp', 33))
        expmp = expmp.add(buyableEffect('bp', 33))
        expmp = expmp.add(buyableEffect('sp', 33))
        expmp = expmp.times(buyableEffect('hp', 33))

        exp2mp = new Decimal(0.5).add(buyableEffect('l', 11)[3][3])
        exp2mp = exp2mp.add(buyableEffect('mp', 34))
        exp2mp = exp2mp.add(buyableEffect('bp', 34))
        exp2mp = exp2mp.add(buyableEffect('sp', 34))

        return expmp
    },
    getResetGain() {
        mpp = player.p.best.max(1).log10().add(addmp).times(multmp).pow(expmp)
        if (mpp.gte(1)) {mpp = mpp.log10().pow(exp2mp).pow10()}

        return mpp.floor().max(0)
    },
    getNextAt() {
        nextmp = getResetGain('mp').add(1)
        if (nextmp.gte(1)) {nextmp = nextmp.log10().root(exp2mp).pow10()}
        return nextmp.root(expmp).div(multmp).sub(addmp).pow10()
    },
    canReset() {return getResetGain('mp').gte(0)&&(!hasMilestone('m', 4))},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('mp'))+" metaprestige points. Next at "+format(getNextAt('mp'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for metaprestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) { //metaprestige
        actualRow = 2
        if (hasMilestone('m', 8)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    passiveGeneration() {
        if (hasMilestone('m', 4)) {
            if (player.bp.autoGain) {return new Decimal(0.2)} else {return Decimal.dZero}
        } else {return Decimal.dZero}
    },
    layerShown(){ 
        realcondition = (player.p.best.gte(100)||player.mp.total.gte(1))
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)},
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
                costBasemp11 = new Decimal(1.2).root(buyableEffect('r', 31))
                costExpmp11 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitmp11 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp11, new Decimal(x), costBasemp11, costExpmp11, costLimitmp11)
            },
            effect(x) {
                effBasemp11 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackmp11 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp11, player.buyableMaxPurchaseable(costTypemp11, player[this.layer].points, costBasemp11, costExpmp11, costLimitmp11), costBasemp11, costExpmp11, costLimitmp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypemp12 = "normal"
                costBasemp12 = new Decimal(1.4).root(buyableEffect('r', 31))
                costExpmp12 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitmp12 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp12, new Decimal(x), costBasemp12, costExpmp12, costLimitmp12)
            },
            effect(x) {
                effBasemp12 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackmp12 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp12, player.buyableMaxPurchaseable(costTypemp12, player[this.layer].points, costBasemp12, costExpmp12, costLimitmp12), costBasemp12, costExpmp12, costLimitmp12))}
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp13, player.buyableMaxPurchaseable(costTypemp13, player[this.layer].points, costBasemp13, costExpmp13, costLimitmp13), costBasemp13, costExpmp13, costLimitmp13))}
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp14, player.buyableMaxPurchaseable(costTypemp14, player[this.layer].points, costBasemp14, costExpmp14, costLimitmp14), costBasemp14, costExpmp14, costLimitmp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypemp21 = "normal"
                costBasemp21 = new Decimal(1.3).root(buyableEffect('r', 31))
                costExpmp21 = new Decimal(1.07).sub(buyableEffect('r', 33))
                costLimitmp21 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp21, new Decimal(x), costBasemp21, costExpmp21, costLimitmp21)
            },
            effect(x) {
                effBasemp21 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackmp21 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp21, player.buyableMaxPurchaseable(costTypemp21, player[this.layer].points, costBasemp21, costExpmp21, costLimitmp21), costBasemp21, costExpmp21, costLimitmp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypemp22 = "normal"
                costBasemp22 = new Decimal(1.5).root(buyableEffect('r', 31))
                costExpmp22 = new Decimal(1.17).sub(buyableEffect('r', 33))
                costLimitmp22 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp22, new Decimal(x), costBasemp22, costExpmp22, costLimitmp22)
            },
            effect(x) {
                effBasemp22 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackmp22 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp22, player.buyableMaxPurchaseable(costTypemp22, player[this.layer].points, costBasemp22, costExpmp22, costLimitmp22), costBasemp22, costExpmp22, costLimitmp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypemp23 = "normal"
                costBasemp23 = new Decimal(1.7).root(buyableEffect('r', 31))
                costExpmp23 = new Decimal(1.37).sub(buyableEffect('r', 33))
                costLimitmp23 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp23, new Decimal(x), costBasemp23, costExpmp23, costLimitmp23)
            },
            effect(x) {
                effBasemp23 = new Decimal(0.2).times(buyableEffect('l', 22))
                effStackmp23 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp23, player.buyableMaxPurchaseable(costTypemp23, player[this.layer].points, costBasemp23, costExpmp23, costLimitmp23), costBasemp23, costExpmp23, costLimitmp23))}
                    }
                }
            },
        },
        24: {
            unlocked() {return true},
            cost(x) {
                costTypemp24 = "asymptote"
                costBasemp24 = new Decimal(1.9)
                costExpmp24 = new Decimal(1.57)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp24, player.buyableMaxPurchaseable(costTypemp24, player[this.layer].points, costBasemp24, costExpmp24, costLimitmp24), costBasemp24, costExpmp24, costLimitmp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypemp31 = "normal"
                costBasemp31 = new Decimal(1.5).root(buyableEffect('r', 31))
                costExpmp31 = new Decimal(1.07).sub(buyableEffect('r', 33))
                costLimitmp31 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp31, new Decimal(x), costBasemp31, costExpmp31, costLimitmp31)
            },
            effect(x) {
                effBasemp31 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackmp31 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp31, player.buyableMaxPurchaseable(costTypemp31, player[this.layer].points, costBasemp31, costExpmp31, costLimitmp31), costBasemp31, costExpmp31, costLimitmp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypemp32 = "normal"
                costBasemp32 = new Decimal(1.7).root(buyableEffect('r', 31))
                costExpmp32 = new Decimal(1.17).sub(buyableEffect('r', 33))
                costLimitmp32 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp32, new Decimal(x), costBasemp32, costExpmp32, costLimitmp32)
            },
            effect(x) {
                effBasemp32 = new Decimal(0.05).times(buyableEffect('l', 21))
                effStackmp32 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp32, player.buyableMaxPurchaseable(costTypemp32, player[this.layer].points, costBasemp32, costExpmp32, costLimitmp32), costBasemp32, costExpmp32, costLimitmp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypemp33 = "normal"
                costBasemp33 = new Decimal(1.9).root(buyableEffect('r', 31))
                costExpmp33 = new Decimal(1.37).sub(buyableEffect('r', 33))
                costLimitmp33 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp33, new Decimal(x), costBasemp33, costExpmp33, costLimitmp33)
            },
            effect(x) {
                effBasemp33 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackmp33 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp33, player.buyableMaxPurchaseable(costTypemp33, player[this.layer].points, costBasemp33, costExpmp33, costLimitmp33), costBasemp33, costExpmp33, costLimitmp33))}
                    }
                }
            },
        },
        34: {
            unlocked() {return true},
            cost(x) {
                costTypemp34 = "asymptote"
                costBasemp34 = new Decimal(2.1)
                costExpmp34 = new Decimal(1.57)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp34, player.buyableMaxPurchaseable(costTypemp34, player[this.layer].points, costBasemp34, costExpmp34, costLimitmp34), costBasemp34, costExpmp34, costLimitmp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypemp41 = "normal"
                costBasemp41 = new Decimal(1.55).root(buyableEffect('r', 31))
                costExpmp41 = new Decimal(1.07).sub(buyableEffect('r', 33))
                costLimitmp41 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp41, new Decimal(x), costBasemp41, costExpmp41, costLimitmp41)
            },
            effect(x) {
                effBasemp41 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackmp41 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp41, player.buyableMaxPurchaseable(costTypemp41, player[this.layer].points, costBasemp41, costExpmp41, costLimitmp41), costBasemp41, costExpmp41, costLimitmp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypemp42 = "normal"
                costBasemp42 = new Decimal(1.75).root(buyableEffect('r', 31))
                costExpmp42 = new Decimal(1.17).sub(buyableEffect('r', 33))
                costLimitmp42 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp42, new Decimal(x), costBasemp42, costExpmp42, costLimitmp42)
            },
            effect(x) {
                effBasemp42 = new Decimal(0.0025).times(buyableEffect('l', 21))
                effStackmp42 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp42, player.buyableMaxPurchaseable(costTypemp42, player[this.layer].points, costBasemp42, costExpmp42, costLimitmp42), costBasemp42, costExpmp42, costLimitmp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypemp43 = "normal"
                costBasemp43 = new Decimal(1.7).root(buyableEffect('r', 31))
                costExpmp43 = new Decimal(1.37).sub(buyableEffect('r', 33))
                costLimitmp43 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp43, new Decimal(x), costBasemp43, costExpmp43, costLimitmp43)
            },
            effect(x) {
                effBasemp43 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackmp43 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp43, player.buyableMaxPurchaseable(costTypemp43, player[this.layer].points, costBasemp43, costExpmp43, costLimitmp43), costBasemp43, costExpmp43, costLimitmp43))}
                    }
                }
            },
        },
        44: {
            unlocked() {return true},
            cost(x) {
                costTypemp44 = "asymptote"
                costBasemp44 = new Decimal(2.15)
                costExpmp44 = new Decimal(1.57)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp44, player.buyableMaxPurchaseable(costTypemp44, player[this.layer].points, costBasemp44, costExpmp44, costLimitmp44), costBasemp44, costExpmp44, costLimitmp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypemp51 = "normal"
                costBasemp51 = new Decimal(1.6).root(buyableEffect('r', 31))
                costExpmp51 = new Decimal(1.07).sub(buyableEffect('r', 33))
                costLimitmp51 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp51, new Decimal(x), costBasemp51, costExpmp51, costLimitmp51)
            },
            effect(x) {
                effBasemp51 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackmp51 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp51, player.buyableMaxPurchaseable(costTypemp51, player[this.layer].points, costBasemp51, costExpmp51, costLimitmp51), costBasemp51, costExpmp51, costLimitmp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypemp52 = "normal"
                costBasemp52 = new Decimal(1.8).root(buyableEffect('r', 31))
                costExpmp52 = new Decimal(1.17).sub(buyableEffect('r', 33))
                costLimitmp52 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp52, new Decimal(x), costBasemp52, costExpmp52, costLimitmp52)
            },
            effect(x) {
                effBasemp52 = new Decimal(0.05).times(buyableEffect('l', 21))
                effStackmp52 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp52, player.buyableMaxPurchaseable(costTypemp52, player[this.layer].points, costBasemp52, costExpmp52, costLimitmp52), costBasemp52, costExpmp52, costLimitmp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypemp53 = "normal"
                costBasemp53 = new Decimal(2).root(buyableEffect('r', 31))
                costExpmp53 = new Decimal(1.37).sub(buyableEffect('r', 33))
                costLimitmp53 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp53, new Decimal(x), costBasemp53, costExpmp53, costLimitmp53)
            },
            effect(x) {
                effBasemp53 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackmp53 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp53, player.buyableMaxPurchaseable(costTypemp53, player[this.layer].points, costBasemp53, costExpmp53, costLimitmp53), costBasemp53, costExpmp53, costLimitmp53))}
                    }
                }
            },
        },
        54: {
            unlocked() {return true},
            cost(x) {
                costTypemp54 = "asymptote"
                costBasemp54 = new Decimal(2.2)
                costExpmp54 = new Decimal(1.57)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp54, player.buyableMaxPurchaseable(costTypemp54, player[this.layer].points, costBasemp54, costExpmp54, costLimitmp54), costBasemp54, costExpmp54, costLimitmp54))}
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
        for (let i = 11; i < 14; i++) {
            if (i == 13) {totalPB = totalPB.add(player.p.buyables[i])}
            else {totalPB = totalPB.add(player.p.buyables[i].pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23)))}
        }
        for (let j = 21; j < 25; j++) {
            if (j == 24) {totalPB = totalPB.add(player.p.buyables[j])}
            else {totalPB = totalPB.add(player.p.buyables[j].pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23)))}
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
        expbp = expbp.times(buyableEffect('hp', 43))

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
    canReset() {return getResetGain('bp').gte(0)&&(!hasMilestone('m', 4))},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('bp'))+" buyable points. Next at "+format(getNextAt('bp'))+" prestige buyables" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for buyable points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    doReset(resettingLayer) {//buyable
        actualRow = 2
        if (hasMilestone('m', 8)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    passiveGeneration() { 
        if (hasMilestone('m', 4)) {
            if (player.bp.autoGain) {return new Decimal(0.2)} else {return Decimal.dZero}
        } else {return Decimal.dZero}
    },
    automate() {
        if (hasMilestone('m', 1)&&player.bp.autoBuy) {
            for (let i = 1; i < 6; i++) {
                for (let j = 1; j < 5; j++) {
                    if (canBuyBuyable('bp', i*10+j)) {buyMaxBuyable('bp', i*10+j)}
                }
            }
        }
    },
    layerShown(){
        realcondition = (totalPBuyables.gte(40)||player.bp.total.gte(1))
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypebp11 = "normal"
                costBasebp11 = new Decimal(1.2).root(buyableEffect('r', 31))
                costExpbp11 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitbp11 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp11, new Decimal(x), costBasebp11, costExpbp11, costLimitbp11)
            },
            effect(x) {
                effBasebp11 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackbp11 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp11, player.buyableMaxPurchaseable(costTypebp11, player[this.layer].points, costBasebp11, costExpbp11, costLimitbp11), costBasebp11, costExpbp11, costLimitbp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypebp12 = "normal"
                costBasebp12 = new Decimal(1.4).root(buyableEffect('r', 31))
                costExpbp12 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitbp12 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp12, new Decimal(x), costBasebp12, costExpbp12, costLimitbp12)
            },
            effect(x) {
                effBasebp12 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackbp12 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp12, player.buyableMaxPurchaseable(costTypebp12, player[this.layer].points, costBasebp12, costExpbp12, costLimitbp12), costBasebp12, costExpbp12, costLimitbp12))}
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp13, player.buyableMaxPurchaseable(costTypebp13, player[this.layer].points, costBasebp13, costExpbp13, costLimitbp13), costBasebp13, costExpbp13, costLimitbp13))}
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp14, player.buyableMaxPurchaseable(costTypebp14, player[this.layer].points, costBasebp14, costExpbp14, costLimitbp14), costBasebp14, costExpbp14, costLimitbp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypebp21 = "normal"
                costBasebp21 = new Decimal(1.3).root(buyableEffect('r', 31))
                costExpbp21 = new Decimal(1.065).sub(buyableEffect('r', 33))
                costLimitbp21 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp21, new Decimal(x), costBasebp21, costExpbp21, costLimitbp21)
            },
            effect(x) {
                effBasebp21 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackbp21 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp21, player.buyableMaxPurchaseable(costTypebp21, player[this.layer].points, costBasebp21, costExpbp21, costLimitbp21), costBasebp21, costExpbp21, costLimitbp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypebp22 = "normal"
                costBasebp22 = new Decimal(1.5).root(buyableEffect('r', 31))
                costExpbp22 = new Decimal(1.165).sub(buyableEffect('r', 33))
                costLimitbp22 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp22, new Decimal(x), costBasebp22, costExpbp22, costLimitbp22)
            },
            effect(x) {
                effBasebp22 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackbp22 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp22, player.buyableMaxPurchaseable(costTypebp22, player[this.layer].points, costBasebp22, costExpbp22, costLimitbp22), costBasebp22, costExpbp22, costLimitbp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypebp23 = "normal"
                costBasebp23 = new Decimal(1.7).root(buyableEffect('r', 31))
                costExpbp23 = new Decimal(1.365).sub(buyableEffect('r', 33))
                costLimitbp23 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp23, new Decimal(x), costBasebp23, costExpbp23, costLimitbp23)
            },
            effect(x) {
                effBasebp23 = new Decimal(0.2).times(buyableEffect('l', 22))
                effStackbp23 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp23, player.buyableMaxPurchaseable(costTypebp23, player[this.layer].points, costBasebp23, costExpbp23, costLimitbp23), costBasebp23, costExpbp23, costLimitbp23))}
                    }
                }
            },
        },
        24: {
            unlocked() {return true},
            cost(x) {
                costTypebp24 = "asymptote"
                costBasebp24 = new Decimal(1.9)
                costExpbp24 = new Decimal(1.565)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp24, player.buyableMaxPurchaseable(costTypebp24, player[this.layer].points, costBasebp24, costExpbp24, costLimitbp24), costBasebp24, costExpbp24, costLimitbp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypebp31 = "normal"
                costBasebp31 = new Decimal(1.45).root(buyableEffect('r', 31))
                costExpbp31 = new Decimal(1.065).sub(buyableEffect('r', 33))
                costLimitbp31 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp31, new Decimal(x), costBasebp31, costExpbp31, costLimitbp31)
            },
            effect(x) {
                effBasebp31 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackbp31 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp31, player.buyableMaxPurchaseable(costTypebp31, player[this.layer].points, costBasebp31, costExpbp31, costLimitbp31), costBasebp31, costExpbp31, costLimitbp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypebp32 = "normal"
                costBasebp32 = new Decimal(1.65).root(buyableEffect('r', 31))
                costExpbp32 = new Decimal(1.165).sub(buyableEffect('r', 33))
                costLimitbp32 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp32, new Decimal(x), costBasebp32, costExpbp32, costLimitbp32)
            },
            effect(x) {
                effBasebp32 = new Decimal(0.05).times(buyableEffect('l', 21))
                effStackbp32 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp32, player.buyableMaxPurchaseable(costTypebp32, player[this.layer].points, costBasebp32, costExpbp32, costLimitbp32), costBasebp32, costExpbp32, costLimitbp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypebp33 = "normal"
                costBasebp33 = new Decimal(1.85).root(buyableEffect('r', 31))
                costExpbp33 = new Decimal(1.365).sub(buyableEffect('r', 33))
                costLimitbp33 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp33, new Decimal(x), costBasebp33, costExpbp33, costLimitbp33)
            },
            effect(x) {
                effBasebp33 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackbp33 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp33, player.buyableMaxPurchaseable(costTypebp33, player[this.layer].points, costBasebp33, costExpbp33, costLimitbp33), costBasebp33, costExpbp33, costLimitbp33))}
                    }
                }
            },
        },
        34: {
            unlocked() {return true},
            cost(x) {
                costTypebp34 = "asymptote"
                costBasebp34 = new Decimal(2.05)
                costExpbp34 = new Decimal(1.565)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp34, player.buyableMaxPurchaseable(costTypebp34, player[this.layer].points, costBasebp34, costExpbp34, costLimitbp34), costBasebp34, costExpbp34, costLimitbp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypebp41 = "normal"
                costBasebp41 = new Decimal(1.5).root(buyableEffect('r', 31))
                costExpbp41 = new Decimal(1.065).sub(buyableEffect('r', 33))
                costLimitbp41 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp41, new Decimal(x), costBasebp41, costExpbp41, costLimitbp41)
            },
            effect(x) {
                effBasebp41 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackbp41 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp41, player.buyableMaxPurchaseable(costTypebp41, player[this.layer].points, costBasebp41, costExpbp41, costLimitbp41), costBasebp41, costExpbp41, costLimitbp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypebp42 = "normal"
                costBasebp42 = new Decimal(1.7).root(buyableEffect('r', 31))
                costExpbp42 = new Decimal(1.165).sub(buyableEffect('r', 33))
                costLimitbp42 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp42, new Decimal(x), costBasebp42, costExpbp42, costLimitbp42)
            },
            effect(x) {
                effBasebp42 = new Decimal(0.0025).times(buyableEffect('l', 21))
                effStackbp42 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp42, player.buyableMaxPurchaseable(costTypebp42, player[this.layer].points, costBasebp42, costExpbp42, costLimitbp42), costBasebp42, costExpbp42, costLimitbp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypebp43 = "normal"
                costBasebp43 = new Decimal(1.9).root(buyableEffect('r', 31))
                costExpbp43 = new Decimal(1.365).sub(buyableEffect('r', 33))
                costLimitbp43 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp43, new Decimal(x), costBasebp43, costExpbp43, costLimitbp43)
            },
            effect(x) {
                effBasebp43 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackbp43 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp43, player.buyableMaxPurchaseable(costTypebp43, player[this.layer].points, costBasebp43, costExpbp43, costLimitbp43), costBasebp43, costExpbp43, costLimitbp43))}
                    }
                }
            },
        },
        44: {
            unlocked() {return true},
            cost(x) {
                costTypebp44 = "asymptote"
                costBasebp44 = new Decimal(2.1)
                costExpbp44 = new Decimal(1.565)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp44, player.buyableMaxPurchaseable(costTypebp44, player[this.layer].points, costBasebp44, costExpbp44, costLimitbp44), costBasebp44, costExpbp44, costLimitbp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypebp51 = "normal"
                costBasebp51 = new Decimal(1.55).root(buyableEffect('r', 31))
                costExpbp51 = new Decimal(1.065).sub(buyableEffect('r', 33))
                costLimitbp51 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp51, new Decimal(x), costBasebp51, costExpbp51, costLimitbp51)
            },
            effect(x) {
                effBasebp51 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackbp51 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp51, player.buyableMaxPurchaseable(costTypebp51, player[this.layer].points, costBasebp51, costExpbp51, costLimitbp51), costBasebp51, costExpbp51, costLimitbp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypebp52 = "normal"
                costBasebp52 = new Decimal(1.75).root(buyableEffect('r', 31))
                costExpbp52 = new Decimal(1.165).sub(buyableEffect('r', 33))
                costLimitbp52 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp52, new Decimal(x), costBasebp52, costExpbp52, costLimitbp52)
            },
            effect(x) {
                effBasebp52 = new Decimal(0.05).times(buyableEffect('l', 21))
                effStackbp52 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp52, player.buyableMaxPurchaseable(costTypebp52, player[this.layer].points, costBasebp52, costExpbp52, costLimitbp52), costBasebp52, costExpbp52, costLimitbp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypebp53 = "normal"
                costBasebp53 = new Decimal(1.95).root(buyableEffect('r', 31))
                costExpbp53 = new Decimal(1.365).sub(buyableEffect('r', 33))
                costLimitbp53 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp53, new Decimal(x), costBasebp53, costExpbp53, costLimitbp53)
            },
            effect(x) {
                effBasebp53 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackbp53 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp53, player.buyableMaxPurchaseable(costTypebp53, player[this.layer].points, costBasebp53, costExpbp53, costLimitbp53), costBasebp53, costExpbp53, costLimitbp53))}
                    }
                }
            },
        },
        54: {
            unlocked() {return true},
            cost(x) {
                costTypebp54 = "asymptote"
                costBasebp54 = new Decimal(2.15)
                costExpbp54 = new Decimal(1.565)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp54, player.buyableMaxPurchaseable(costTypebp54, player[this.layer].points, costBasebp54, costExpbp54, costLimitbp54), costBasebp54, costExpbp54, costLimitbp54))}
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
        expsp = expsp.times(buyableEffect('hp', 53))


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
    canReset() {return getResetGain('sp').gte(0)&&(!hasMilestone('m', 4))},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('sp'))+" superprestige points. Next at "+format(getNextAt('sp'))+" points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for superprestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    passiveGeneration() { 
        if (hasMilestone('m', 4)) {
            if (player.bp.autoGain) {return new Decimal(0.2)} else {return Decimal.dZero}
        } else {return Decimal.dZero}
    },
    automate() {
        if (hasMilestone('m', 1)&&player.bp.autoBuy) {
            for (let i = 1; i < 6; i++) {
                for (let j = 1; j < 5; j++) {
                    if (canBuyBuyable('sp', i*10+j)) {buyMaxBuyable('sp', i*10+j)}
                }
            }
        }
    },
    doReset(resettingLayer) { //superprsetige
        actualRow = 2
        if (hasMilestone('m', 8)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    layerShown(){
        realcondition = (player.points.gte(2)||player.sp.total.gte(1))
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypesp11 = "normal"
                costBasesp11 = new Decimal(1.2).root(buyableEffect('r', 31))
                costExpsp11 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitsp11 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp11, new Decimal(x), costBasesp11, costExpsp11, costLimitsp11)
            },
            effect(x) {
                effBasesp11 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStacksp11 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp11, player.buyableMaxPurchaseable(costTypesp11, player[this.layer].points, costBasesp11, costExpsp11, costLimitsp11), costBasesp11, costExpsp11, costLimitsp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypesp12 = "normal"
                costBasesp12 = new Decimal(1.4).root(buyableEffect('r', 31))
                costExpsp12 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitsp12 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp12, new Decimal(x), costBasesp12, costExpsp12, costLimitsp12)
            },
            effect(x) {
                effBasesp12 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStacksp12 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp12, player.buyableMaxPurchaseable(costTypesp12, player[this.layer].points, costBasesp12, costExpsp12, costLimitsp12), costBasesp12, costExpsp12, costLimitsp12))}
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp13, player.buyableMaxPurchaseable(costTypesp13, player[this.layer].points, costBasesp13, costExpsp13, costLimitsp13), costBasesp13, costExpsp13, costLimitsp13))}
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp14, player.buyableMaxPurchaseable(costTypesp14, player[this.layer].points, costBasesp14, costExpsp14, costLimitsp14), costBasesp14, costExpsp14, costLimitsp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypesp21 = "normal"
                costBasesp21 = new Decimal(1.3).root(buyableEffect('r', 31))
                costExpsp21 = new Decimal(1.06).sub(buyableEffect('r', 33))
                costLimitsp21 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp21, new Decimal(x), costBasesp21, costExpsp21, costLimitsp21)
            },
            effect(x) {
                effBasesp21 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStacksp21 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp21, player.buyableMaxPurchaseable(costTypesp21, player[this.layer].points, costBasesp21, costExpsp21, costLimitsp21), costBasesp21, costExpsp21, costLimitsp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypesp22 = "normal"
                costBasesp22 = new Decimal(1.5).root(buyableEffect('r', 31))
                costExpsp22 = new Decimal(1.16).sub(buyableEffect('r', 33))
                costLimitsp22 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp22, new Decimal(x), costBasesp22, costExpsp22, costLimitsp22)
            },
            effect(x) {
                effBasesp22 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStacksp22 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp22, player.buyableMaxPurchaseable(costTypesp22, player[this.layer].points, costBasesp22, costExpsp22, costLimitsp22), costBasesp22, costExpsp22, costLimitsp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypesp23 = "normal"
                costBasesp23 = new Decimal(1.7).root(buyableEffect('r', 31))
                costExpsp23 = new Decimal(1.36).sub(buyableEffect('r', 33))
                costLimitsp23 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp23, new Decimal(x), costBasesp23, costExpsp23, costLimitsp23)
            },
            effect(x) {
                effBasesp23 = new Decimal(0.2).times(buyableEffect('l', 22))
                effStacksp23 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp23, player.buyableMaxPurchaseable(costTypesp23, player[this.layer].points, costBasesp23, costExpsp23, costLimitsp23), costBasesp23, costExpsp23, costLimitsp23))}
                    }
                }
            },
        },
        24: {
            unlocked() {return true},
            cost(x) {
                costTypesp24 = "asymptote"
                costBasesp24 = new Decimal(1.9)
                costExpsp24 = new Decimal(1.56)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp24, player.buyableMaxPurchaseable(costTypesp24, player[this.layer].points, costBasesp24, costExpsp24, costLimitsp24), costBasesp24, costExpsp24, costLimitsp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypesp31 = "normal"
                costBasesp31 = new Decimal(1.4).root(buyableEffect('r', 31))
                costExpsp31 = new Decimal(1.06).sub(buyableEffect('r', 33))
                costLimitsp31 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp31, new Decimal(x), costBasesp31, costExpsp31, costLimitsp31)
            },
            effect(x) {
                effBasesp31 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStacksp31 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp31, player.buyableMaxPurchaseable(costTypesp31, player[this.layer].points, costBasesp31, costExpsp31, costLimitsp31), costBasesp31, costExpsp31, costLimitsp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypesp32 = "normal"
                costBasesp32 = new Decimal(1.6).root(buyableEffect('r', 31))
                costExpsp32 = new Decimal(1.16).sub(buyableEffect('r', 33))
                costLimitsp32 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp32, new Decimal(x), costBasesp32, costExpsp32, costLimitsp32)
            },
            effect(x) {
                effBasesp32 = new Decimal(0.05).times(buyableEffect('l', 21))
                effStacksp32 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp32, player.buyableMaxPurchaseable(costTypesp32, player[this.layer].points, costBasesp32, costExpsp32, costLimitsp32), costBasesp32, costExpsp32, costLimitsp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypesp33 = "normal"
                costBasesp33 = new Decimal(1.8).root(buyableEffect('r', 31))
                costExpsp33 = new Decimal(1.36).sub(buyableEffect('r', 33))
                costLimitsp33 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp33, new Decimal(x), costBasesp33, costExpsp33, costLimitsp33)
            },
            effect(x) {
                effBasesp33 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStacksp33 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp33, player.buyableMaxPurchaseable(costTypesp33, player[this.layer].points, costBasesp33, costExpsp33, costLimitsp33), costBasesp33, costExpsp33, costLimitsp33))}
                    }
                }
            },
        },
        34: {
            unlocked() {return true},
            cost(x) {
                costTypesp34 = "asymptote"
                costBasesp34 = new Decimal(2)
                costExpsp34 = new Decimal(1.56)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp34, player.buyableMaxPurchaseable(costTypesp34, player[this.layer].points, costBasesp34, costExpsp34, costLimitsp34), costBasesp34, costExpsp34, costLimitsp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypesp41 = "normal"
                costBasesp41 = new Decimal(1.45).root(buyableEffect('r', 31))
                costExpsp41 = new Decimal(1.06).sub(buyableEffect('r', 33))
                costLimitsp41 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp41, new Decimal(x), costBasesp41, costExpsp41, costLimitsp41)
            },
            effect(x) {
                effBasesp41 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStacksp41 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp41, player.buyableMaxPurchaseable(costTypesp41, player[this.layer].points, costBasesp41, costExpsp41, costLimitsp41), costBasesp41, costExpsp41, costLimitsp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypesp42 = "normal"
                costBasesp42 = new Decimal(1.65).root(buyableEffect('r', 31))
                costExpsp42 = new Decimal(1.16).sub(buyableEffect('r', 33))
                costLimitsp42 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp42, new Decimal(x), costBasesp42, costExpsp42, costLimitsp42)
            },
            effect(x) {
                effBasesp42 = new Decimal(0.0025).times(buyableEffect('l', 21))
                effStacksp42 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp42, player.buyableMaxPurchaseable(costTypesp42, player[this.layer].points, costBasesp42, costExpsp42, costLimitsp42), costBasesp42, costExpsp42, costLimitsp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypesp43 = "normal"
                costBasesp43 = new Decimal(1.85).root(buyableEffect('r', 31))
                costExpsp43 = new Decimal(1.36).sub(buyableEffect('r', 33))
                costLimitsp43 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp43, new Decimal(x), costBasesp43, costExpsp43, costLimitsp43)
            },
            effect(x) {
                effBasesp43 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStacksp43 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp43, player.buyableMaxPurchaseable(costTypesp43, player[this.layer].points, costBasesp43, costExpsp43, costLimitsp43), costBasesp43, costExpsp43, costLimitsp43))}
                    }
                }
            },
        },
        44: {
            unlocked() {return true},
            cost(x) {
                costTypesp44 = "asymptote"
                costBasesp44 = new Decimal(2.05)
                costExpsp44 = new Decimal(1.56)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp44, player.buyableMaxPurchaseable(costTypesp44, player[this.layer].points, costBasesp44, costExpsp44, costLimitsp44), costBasesp44, costExpsp44, costLimitsp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypesp51 = "normal"
                costBasesp51 = new Decimal(1.5).root(buyableEffect('r', 31))
                costExpsp51 = new Decimal(1.06).sub(buyableEffect('r', 33))
                costLimitsp51 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp51, new Decimal(x), costBasesp51, costExpsp51, costLimitsp51)
            },
            effect(x) {
                effBasesp51 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStacksp51 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp51, player.buyableMaxPurchaseable(costTypesp51, player[this.layer].points, costBasesp51, costExpsp51, costLimitsp51), costBasesp51, costExpsp51, costLimitsp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypesp52 = "normal"
                costBasesp52 = new Decimal(1.7).root(buyableEffect('r', 31))
                costExpsp52 = new Decimal(1.16).sub(buyableEffect('r', 33))
                costLimitsp52 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp52, new Decimal(x), costBasesp52, costExpsp52, costLimitsp52)
            },
            effect(x) {
                effBasesp52 = new Decimal(0.05).times(buyableEffect('l', 21))
                effStacksp52 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp52, player.buyableMaxPurchaseable(costTypesp52, player[this.layer].points, costBasesp52, costExpsp52, costLimitsp52), costBasesp52, costExpsp52, costLimitsp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypesp53 = "normal"
                costBasesp53 = new Decimal(1.9).root(buyableEffect('r', 31))
                costExpsp53 = new Decimal(1.36).sub(buyableEffect('r', 33))
                costLimitsp53 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp53, new Decimal(x), costBasesp53, costExpsp53, costLimitsp53)
            },
            effect(x) {
                effBasesp53 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStacksp53 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp53, player.buyableMaxPurchaseable(costTypesp53, player[this.layer].points, costBasesp53, costExpsp53, costLimitsp53), costBasesp53, costExpsp53, costLimitsp53))}
                    }
                }
            },
        },
        54: {
            unlocked() {return true},
            cost(x) {
                costTypesp54 = "asymptote"
                costBasesp54 = new Decimal(2.1)
                costExpsp54 = new Decimal(1.56)
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
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp54, player.buyableMaxPurchaseable(costTypesp54, player[this.layer].points, costBasesp54, costExpsp54, costLimitsp54), costBasesp54, costExpsp54, costLimitsp54))}
                    }
                }
            },
        },
    },
})

addLayer("lf", {
    name: "life force", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "LF", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),

    }},
    color: "#ffb3df",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "life force", // Name of prestige currency
    baseResource: "workers", // Name of resource prestige is based on
    baseAmount() {return player.w.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addlf = new Decimal(0)



        multlf = new Decimal(1/300)

        return multlf
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        explf = new Decimal(1)

        

        exp2lf = new Decimal(1)


        return explf
    },
    getResetGain() {
        lfp = player.w.points.add(addlf).times(multlf).pow(explf)
        if (lfp.gte(1)) {lfp = lfp.log10().pow(exp2lf).pow10()}

        return lfp.max(0)
    },
    getNextAt() {
        nextlf = getResetGain('lf').add(1)
        if (nextlf.gte(1)) {nextlf = nextlf.log10().pow(exp2lf.pow(-1)).pow10()}
        return nextlf.root(explf).div(multlf).sub(addlf)
    },
    canReset() {return false},
    passiveGeneration() {
        if (hasUpgrade('w', 55)) {
            return Decimal.dOne.sub(upgradeEffect('w', 55))
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "You are gaining "+formatWhole(getResetGain('lf'))+" life force per second" },
    row: 7, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
       
    ],
    layerShown(){return hasUpgrade('w', 55)},
    automate() {
    },
    doReset(resettingLayer) { //life force
      

    },
    clickables: {
        11: {
            unlocked() {return true},
            display: "decrease the speed of draining",
            onClick() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                setClickableState('lf', 11, getClickableState('lf', 11)*1+1)
            },
            canClick() {return (getClickableState('lf', 11)<6)&&(player.j.points.gte(owingMoney.add(owingMoneyscrap).add(owingMoneyrarescrap)))&&(player.g.points.gte(owingGems.add(owingGemsrare))) }
        },
        12: {
            unlocked() {return true},
            display: "increase the speed of draining",
            onClick() {
                buyBuyable('w', 22)
                buyBuyable('w', 23)
                buyBuyable('w', 24)
                setClickableState('lf', 11, getClickableState('lf', 11)*1-1)
            },
            canClick() {return (getClickableState('lf', 11)>0)&&(player.j.points.gte(owingMoney.add(owingMoneyscrap).add(owingMoneyrarescrap)))&&(player.g.points.gte(owingGems.add(owingGemsrare))) }
        },
    },
    buyables: {
        
    },
})

addLayer("hp", {
    name: "hyperprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#3ea430",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "hyperprestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addhp = new Decimal(-4)
        addhp = addhp.add(buyableEffect('mtp', 21))


        multhp = new Decimal(1)
        multhp = multhp.add(buyableEffect('mtp', 22))

        return multhp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exphp = new Decimal(1)

        

        exp2hp = new Decimal(0.5)


        return exphp
    },
    getResetGain() {
        hpp = player.points.add(addhp).times(multhp).pow(exphp)
        if (hpp.gte(1)) {hpp = hpp.log10().pow(exp2hp).pow10()}

        return hpp.max(0).floor()
    },
    getNextAt() {
        nexthp = getResetGain('hp').add(1)
        if (nexthp.gte(1)) {nexthp = nexthp.log10().pow(exp2hp.pow(-1)).pow10()}
        return nexthp.root(exphp).div(multhp).sub(addhp)
    },
    canReset() {return getResetGain('hp').gte(1)},
    passiveGeneration() {
        if (false) {
            return Decimal.dOne
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('hp'))+" hyperprestige points. Next at "+format(getNextAt("hp"))+" points" },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
       
    ],
    layerShown(){
        realcondition = player.points.gte(5)||player.hp.total.gte(1)
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)
    },
    automate() {
    },
    doReset(resettingLayer) { //hyperprestige
       
        if (layers[resettingLayer].row > this.row) {layerDataReset(this.layer, [])}
    },
    clickables: {

    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypehp11 = "normal"
                costBasehp11 = new Decimal(1.3)
                costExphp11 = new Decimal(1.1)
                costLimithp11 = new Decimal('e100')
                return player.buyablePrice(costTypehp11, new Decimal(x), costBasehp11, costExphp11, costLimithp11)
            },
            effect(x) {
                effBasehp11 = new Decimal(0.05)
                effStackhp11 = new Decimal(x)

                return Decimal.times(effBasehp11, effStackhp11)
            },
            title() { return "hyperprestige buyable 11"},
            display() { return "increase point gain exponent by "+format(effBasehp11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp11 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp11, player[this.layer].points, costBasehp11, costExphp11, costLimithp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp11, player[this.layer].points, costBasehp11, costExphp11, costLimithp11))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp11, player.buyableMaxPurchaseable(costTypehp11, player[this.layer].points, costBasehp11, costExphp11, costLimithp11), costBasehp11, costExphp11, costLimithp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypehp12 = "asymptote"
                costBasehp12 = new Decimal(1.3)
                costExphp12 = new Decimal(1.1)
                costLimithp12 = layers.hp.buyables[12].purchaseLimit.add(1)
                return player.buyablePrice(costTypehp12, new Decimal(x), costBasehp12, costExphp12, costLimithp12)
            },
            effect(x) {
                effBasehp12 = new Decimal(0.25)
                effStackhp12 = new Decimal(x)

                return Decimal.times(effBasehp12, effStackhp12)
            },
            purchaseLimit: new Decimal(40),
            title() { return "hyperprestige buyable 12"},
            display() { return "subtract first bonus point softcap by "+format(effBasehp12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp12 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp12, player[this.layer].points, costBasehp12, costExphp12, costLimithp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp12, player[this.layer].points, costBasehp12, costExphp12, costLimithp12))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp12, player.buyableMaxPurchaseable(costTypehp12, player[this.layer].points, costBasehp12, costExphp12, costLimithp12), costBasehp12, costExphp12, costLimithp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costTypehp13 = "asymptote"
                costBasehp13 = new Decimal(1.4)
                costExphp13 = new Decimal(1.2)
                costLimithp13 = layers.hp.buyables[13].purchaseLimit.add(1)
                return player.buyablePrice(costTypehp13, new Decimal(x), costBasehp13, costExphp13, costLimithp13)
            },
            effect(x) {
                effBasehp13 = new Decimal(0.25)
                effStackhp13 = new Decimal(x)

                return Decimal.times(effBasehp13, effStackhp13)
            },
            purchaseLimit: new Decimal(40),
            title() { return "hyperprestige buyable 13"},
            display() { return "subtract second bonus point softcap by "+format(effBasehp12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp13 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp13, player[this.layer].points, costBasehp13, costExphp13, costLimithp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp13, player[this.layer].points, costBasehp13, costExphp13, costLimithp13))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp13, player.buyableMaxPurchaseable(costTypehp13, player[this.layer].points, costBasehp13, costExphp13, costLimithp13), costBasehp13, costExphp13, costLimithp13))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypehp23 = "normal"
                costBasehp23 = new Decimal(1.5)
                costExphp23 = new Decimal(1.2)
                costLimithp23 = new Decimal('e100')
                return player.buyablePrice(costTypehp23, new Decimal(x), costBasehp23, costExphp23, costLimithp23)
            },
            effect(x) {
                effBasehp23 = new Decimal(2)
                effStackhp23 = new Decimal(x)

                return Decimal.pow(effBasehp23, effStackhp23)
            },
            title() { return "hyperprestige buyable 23"},
            display() { return "multiply prestige point exponent by "+format(effBasehp23)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp23 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp23, player[this.layer].points, costBasehp23, costExphp23, costLimithp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp23, player[this.layer].points, costBasehp23, costExphp23, costLimithp23))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp23, player.buyableMaxPurchaseable(costTypehp23, player[this.layer].points, costBasehp23, costExphp23, costLimithp23), costBasehp23, costExphp23, costLimithp23))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypehp33 = "normal"
                costBasehp33 = new Decimal(1.7)
                costExphp33 = new Decimal(1.2)
                costLimithp33 = new Decimal('e100')
                return player.buyablePrice(costTypehp33, new Decimal(x), costBasehp33, costExphp33, costLimithp33)
            },
            effect(x) {
                effBasehp33 = new Decimal(2)
                effStackhp33 = new Decimal(x)

                return Decimal.pow(effBasehp33, effStackhp33)
            },
            title() { return "hyperprestige buyable 33"},
            display() { return "multiply metaprestige point exponent by "+format(effBasehp33)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp33 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp33, player[this.layer].points, costBasehp33, costExphp33, costLimithp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp33, player[this.layer].points, costBasehp33, costExphp33, costLimithp33))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp33, player.buyableMaxPurchaseable(costTypehp33, player[this.layer].points, costBasehp33, costExphp33, costLimithp33), costBasehp33, costExphp33, costLimithp33))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypehp43 = "normal"
                costBasehp43 = new Decimal(1.75)
                costExphp43 = new Decimal(1.2)
                costLimithp43 = new Decimal('e100')
                return player.buyablePrice(costTypehp43, new Decimal(x), costBasehp43, costExphp43, costLimithp43)
            },
            effect(x) {
                effBasehp43 = new Decimal(2)
                effStackhp43 = new Decimal(x)

                return Decimal.pow(effBasehp43, effStackhp43)
            },
            title() { return "hyperprestige buyable 43"},
            display() { return "multiply buyable point exponent by "+format(effBasehp43)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp43 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp43, player[this.layer].points, costBasehp43, costExphp43, costLimithp43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp43, player[this.layer].points, costBasehp43, costExphp43, costLimithp43))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp43, player.buyableMaxPurchaseable(costTypehp43, player[this.layer].points, costBasehp43, costExphp43, costLimithp43), costBasehp43, costExphp43, costLimithp43))}
                    }
                }
            },
        },   
        53: {
            unlocked() {return true},
            cost(x) {
                costTypehp53 = "normal"
                costBasehp53 = new Decimal(1.8)
                costExphp53 = new Decimal(1.2)
                costLimithp53 = new Decimal('e100')
                return player.buyablePrice(costTypehp53, new Decimal(x), costBasehp53, costExphp53, costLimithp53)
            },
            effect(x) {
                effBasehp53 = new Decimal(2)
                effStackhp53 = new Decimal(x)

                return Decimal.pow(effBasehp53, effStackhp53)
            },
            title() { return "hyperprestige buyable 53"},
            display() { return "multiply superprestige point exponent by "+format(effBasehp53)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp53 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp53, player[this.layer].points, costBasehp53, costExphp53, costLimithp53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp53, player[this.layer].points, costBasehp53, costExphp53, costLimithp53))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp53, player.buyableMaxPurchaseable(costTypehp53, player[this.layer].points, costBasehp53, costExphp53, costLimithp53), costBasehp53, costExphp53, costLimithp53))}
                    }
                }
            },
        },   
    },
})

addLayer("r", {
    name: "research", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),

    }},
    color: "#9daae0",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "research points", // Name of prestige currency
    baseResource: "none", // Name of resource prestige is based on
    baseAmount() {return new Decimal(0)}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addr = new Decimal(0)



        multr = new Decimal(1)

        return multr
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expr = new Decimal(1)

        

        exp2r = new Decimal(1)


        return expr
    },
    getResetGain() {
        rp = new Decimal(0).add(addr).times(multr).pow(expr)
        if (rp.gte(1)) {rp = rp.log10().pow(exp2r).pow10()}

        return rp.max(0).floor()
    },
    getNextAt() {

        return Decimal.dInf
    },
    canReset() {return false},
    passiveGeneration() {
        if (false) {
            return Decimal.dOne
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return false},
    prestigeButtonText() {return "This layer cannot be reset." },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
       
    ],
    layerShown(){
        realcondition = player.hp.total.gte(1)
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)},
    automate() {
    },
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {layerDataReset(this.layer, [])}

    },
    update(diff){
        if (getBuyableAmount([this.layer], 12).gt(0)) {
            setBuyableAmount([this.layer], 12, getBuyableAmount([this.layer], 12).sub(player[this.layer].points.sub(getBuyableAmount([this.layer], 13)).times(diff).times(buyableEffect('mtp', 12))))
        }
        if (getBuyableAmount([this.layer], 12).lte(1e-4)&&getClickableState([this.layer], 11)!=0) {
            setBuyableAmount([this.layer], getClickableState([this.layer], 11), getBuyableAmount([this.layer], getClickableState([this.layer], 11)).add(1))
            setClickableState([this.layer], 11, 0)
            setBuyableAmount([this.layer], 13, Decimal.dZero)
        }

    },
    clickables: {
        11: {
            unlocked() {return false}, //current research item
            onClick() {
            },
            canClick() {return false }
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costBaser11 = new Decimal(2)
                costMultMoneyr11 = new Decimal(50000)
                return Decimal.pow(costBaser11, x)
            },
            effect(x) {
                effBaser11 = new Decimal(1)
                effStackr11 = new Decimal(x)

                return Decimal.times(effBaser11, effStackr11)
            },
            title() { return "research buyable 11"},
            display() { return "obtain "+format(effBaser11)+" research points <br> cost: "+format(this.cost())+" workers, $"+format(this.cost().times(costMultMoneyr11))+" <br> requirement: "+format(getBuyableAmount([this.layer], [this.id]).add(1))+" total hyperprestige points <br> owned: "+format(effStackr11)+" <br> effect: "+format(this.effect())},
            canAfford() { return (getBuyableAmount('w', 12).gte(this.cost())&&player.j.points.gte(this.cost().times(costMultMoneyr11))&&player.hp.total.gte(getBuyableAmount([this.layer], [this.id]).add(1))) },
            buy() {
                setBuyableAmount('w', 12, getBuyableAmount('w', 12).sub(this.cost()))
                player.j.points = player.j.points.sub(this.cost().times(costMultMoneyr11))
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                setBuyableAmount('w', 19, getBuyableAmount('w', 19).sub(this.cost()))
                addPoints('r', 1)
            },
            buyMax() {
                while (canBuyBuyable([this.layer], [this.id])){
                    buyBuyable([this.layer], [this.id])
                }
            },
        },
        12: {
            unlocked() {return false}, //research cd
            cost(x) {
                return Decimal.pow(10, 100000000)
            },
            effect(x) {
                return Decimal.dOne
            },
            canAfford() { return false},
            buy() {
            },
            buyMax() {
            },
        },
        13: {
            unlocked() {return false}, //research barrier
            cost(x) {
                return Decimal.pow(10, 100000000)
            },
            effect(x) {
                return Decimal.dOne
            },
            canAfford() { return false},
            buy() {
            },
            buyMax() {
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costBaser21 = new Decimal(1.5)
                costMultRMinr21 = new Decimal(5)
                costMoneyr21f =[getBuyableAmount('r', 21).div(3).floor().add(3), getBuyableAmount('r', 21).sub(getBuyableAmount('r', 21).div(3).floor().times(3))]
                costMoneyr21 = Decimal.dTen.pow(costMoneyr21f[0]).times(Decimal.dTwo.pow(costMoneyr21f[1])).sub(0.02)
                return [player.roundTime(Decimal.pow(costBaser21, x).times(costMultRMinr21)), costMoneyr21]
            },
            effect(x) {
                effBaser21 = new Decimal(1)
                effStackr21 = new Decimal(x)

                return Decimal.times(effBaser21, effStackr21)
            },
            title() { return "research buyable 21"},
            display() { return "add maximum gem pack size by "+format(effBaser21)+" <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr21)+" <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
            },
        },  
        22: {
            unlocked() {return true},
            purchaseLimit: Decimal.dOne,
            cost(x) {
                costRMinr22 = new Decimal(15)
                costMoneyr22 = new Decimal(50000)
                return [costRMinr22, costMoneyr22]
            },
            effect(x) {
                effBaser22 = new Decimal(1)
                effStackr22 = new Decimal(x)

                return Decimal.times(effBaser22, effStackr22)
            },
            title() { return "research buyable 22"},
            display() { return "do not reset milestones on hyperprestige reset <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr22)+"/1.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
            },
        },  
        23: {
            unlocked() {return player[this.layer].points.gte(3)},
            purchaseLimit: Decimal.dOne,
            cost(x) {
                costRMinr23 = new Decimal(30)
                costMoneyr23 = new Decimal(50000)
                reqRPr23 = new Decimal(2)
                return [costRMinr23, costMoneyr23, reqRPr23]
            },
            effect(x) {
                effBaser23 = new Decimal(1)
                effStackr23 = new Decimal(x)

                return Decimal.times(effBaser23, effStackr23)
            },
            title() { return "research buyable 23"},
            display() { return "do not reset layer 2 on hyperprestige reset <br> barrier: "+formatWhole(reqRPr23)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr23)+"/1.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(3)},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        },  
        24: {
            unlocked() {return player[this.layer].points.gte(5)},
            purchaseLimit: Decimal.dOne,
            cost(x) {
                costRMinr24 = new Decimal(5)
                costMoneyr24 = new Decimal(10000)
                reqRPr24 = new Decimal(4)
                return [costRMinr24, costMoneyr24, reqRPr24]
            },
            effect(x) {
                effBaser24 = new Decimal(1)
                effStackr24 = new Decimal(x)

                return Decimal.times(effBaser24, effStackr24)
            },
            title() { return "research buyable 24"},
            display() { return "do not reset bonus points on hyperprestige reset <br> barrier: "+formatWhole(reqRPr24)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr24)+"/1.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(5)},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        },  
        31: {
            unlocked() {return true},
            purchaseLimit: new Decimal(20),
            cost(x) {
                costBaseTimer31 = new Decimal(1.5)
                costBaseMoneyr31 = new Decimal(2)
                costMultRMinr31 = new Decimal(15)
                costMultMoneyr31 = new Decimal(25000)
                return [costBaseTimer31.pow(x).times(costMultRMinr31).round(), costBaseMoneyr31.pow(x).times(costMultMoneyr31).round()]
            },
            effect(x) {
                effBaser31 = new Decimal(1.1220184543019633)
                effStackr31 = new Decimal(x)

                if (effStackr31.eq(20)) {return new Decimal(10)} 
                else {return Decimal.pow(effBaser31, effStackr31)}
            },
            title() { return "research buyable 31"},
            display() { return "root row 1 to 2 unlimited buyable cost by "+format(effBaser31)+" <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr31)+"/20.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        }, 
        32: {
            unlocked() {return true},
            purchaseLimit: new Decimal(20),
            cost(x) {
                costBaseTimer32 = new Decimal(1.5)
                costBaseMoneyr32 = new Decimal(2)
                costMultRMinr32 = new Decimal(5)
                costMultMoneyr32 = new Decimal(5000)
                return [player.roundTime(costBaseTimer32.pow(x).times(costMultRMinr32)), costBaseMoneyr32.pow(x).times(costMultMoneyr32).round()]
            },
            effect(x) {
                effBaser32 = new Decimal(0.1)
                effStackr32 = new Decimal(x)

                return Decimal.times(effBaser32, effStackr32)
            },
            title() { return "research buyable 32"},
            display() { return "increase bonus point boost coefficient by "+format(effBaser32)+" <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr32)+"/20.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        }, 
        33: {
            unlocked() {return player[this.layer].points.gte(5)},
            purchaseLimit: new Decimal(8),
            cost(x) {
                costBaseTimer33 = new Decimal(1.5)
                costBaseMoneyr33 = new Decimal(2)
                costMultRMinr33 = new Decimal(20)
                costMultMoneyr33 = new Decimal(100000)
                reqRPr33 = new Decimal(4)
                return [player.roundTime(costBaseTimer33.pow(x).times(costMultRMinr33)), costBaseMoneyr33.pow(x).times(costMultMoneyr33).round(), reqRPr33]
            },
            effect(x) {
                effBaser33 = new Decimal(0.0025)
                effStackr33 = new Decimal(x)

                return Decimal.times(effBaser33, effStackr33)
            },
            title() { return "research buyable 33"},
            display() { return "subtract row 1 to 2 unlimited buyable exponent by "+format(effBaser33)+"<br> barrier: "+formatWhole(reqRPr33)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr33)+"/8.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        },
        34: {
            unlocked() {return player[this.layer].points.gte(5)},
            purchaseLimit: new Decimal(4),
            cost(x) {
                costBaseTimer34 = new Decimal(1.5)
                costBaseMoneyr34 = new Decimal(2)
                costMultRMinr34 = new Decimal(40)
                costMultMoneyr34 = new Decimal(100000)
                reqRPr34 = new Decimal(4)
                return [player.roundTime(costBaseTimer34.pow(x).times(costMultRMinr34)), costBaseMoneyr34.pow(x).times(costMultMoneyr34).round(), reqRPr34]
            },
            effect(x) {
                effBaser34 = new Decimal(0.25)
                effStackr34 = new Decimal(x)

                return Decimal.times(effBaser34, effStackr34)
            },
            title() { return "research buyable 34"},
            display() { return "keep "+format(effBaser34)+" of your lootbox gear level on hyperprestige reset <br> barrier: "+formatWhole(reqRPr34)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr34)+"/4.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(reqRPr34.add(1))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        },
        41: {
            unlocked() {return player[this.layer].points.gte(2)},
            purchaseLimit: new Decimal(5),
            cost(x) {
                costBaseTimer41 = new Decimal(2)
                costBaseMoneyr41 = new Decimal(2.5)
                costMultRMinr41 = new Decimal(5)
                costMultMoneyr41 = new Decimal(8000)
                reqRPr41 = new Decimal(x)
                return [player.roundTime(costBaseTimer41.pow(x).times(costMultRMinr41)), costBaseMoneyr41.pow(x).times(costMultMoneyr41).round(), reqRPr41]
            },
            effect(x) {
                effBaser41 = new Decimal(1.37972966146121483)
                effStackr41 = new Decimal(x)

                return Decimal.pow(effBaser41, effStackr41)
            },
            title() { return "research buyable 41"},
            display() { return "divide common gear effective level softcap by "+format(effBaser41)+"<br> barrier: "+formatWhole(reqRPr41)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr41)+"/5.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(reqRPr41.add(1))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        }, 
        42: {
            unlocked() {return player[this.layer].points.gte(2)},
            purchaseLimit: new Decimal(5),
            cost(x) {
                costBaseTimer42 = new Decimal(2)
                costBaseMoneyr42 = new Decimal(2.5)
                costMultRMinr42 = new Decimal(10)
                costMultMoneyr42 = new Decimal(20000)
                reqRPr42 = new Decimal(x)
                return [player.roundTime(costBaseTimer42.pow(x).times(costMultRMinr42)), costBaseMoneyr42.pow(x).times(costMultMoneyr42).round(), reqRPr42]
            },
            effect(x) {
                effBaser42 = new Decimal(1.58489319246111349)
                effStackr42 = new Decimal(x)

                return Decimal.pow(effBaser42, effStackr42)
            },
            title() { return "research buyable 42"},
            display() { return "divide rare gear effective level softcap by "+format(effBaser42)+"<br> barrier: "+formatWhole(reqRPr42)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr42)+"/5.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(reqRPr42.add(1))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        }, 
        43: {
            unlocked() {return player[this.layer].points.gte(4)},
            purchaseLimit: new Decimal(5),
            cost(x) {
                costBaseTimer43 = new Decimal(2)
                costBaseMoneyr43 = new Decimal(3)
                costMultRMinr43 = new Decimal(30)
                costMultMoneyr43 = new Decimal(50000)
                reqRPr43 = new Decimal(x).times(2)
                return [costBaseTimer43.pow(x).times(costMultRMinr43).round(), costBaseMoneyr43.pow(x).times(costMultMoneyr43).round(), reqRPr43]
            },
            effect(x) {
                effBaser43 = new Decimal(0.1)
                effStackr43 = new Decimal(x)

                return Decimal.times(effBaser43, effStackr43)
            },
            title() { return "research buyable 43"},
            display() { return "subtract gear gain level softcap by "+format(effBaser43)+" <br> barrier: "+formatWhole(reqRPr43)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr43)+"/5.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(reqRPr43.add(1))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        }, 
        44: {
            unlocked() {return player[this.layer].points.gte(5)},
            purchaseLimit: new Decimal(6),
            cost(x) {
                costBaseTimer44 = new Decimal(2)
                costBaseMoneyr44 = new Decimal(3)
                costMultRMinr44 = new Decimal(60)
                costMultMoneyr44 = new Decimal(100000)
                reqRPr44 = new Decimal(x).add(5)
                return [player.roundTime(costBaseTimer44.pow(x).times(costMultRMinr44)), costBaseMoneyr44.pow(x).times(costMultMoneyr44).round(), reqRPr44]
            },
            effect(x) {
                effBaser44 = new Decimal(1/6)
                effStackr44 = new Decimal(x)

                return Decimal.times(effBaser44, effStackr44)
            },
            title() { return "research buyable 44"},
            display() { return "keep "+format(effBaser44)+" of your gear scrap on hyperprestige reset <br> barrier: "+formatWhole(reqRPr44)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr44)+"/6.00 <br> effect: "+format(this.effect())},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(reqRPr44.add(1))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        },
        51: {
            unlocked() {return player[this.layer].points.gte(5)&&getBuyableAmount([this.layer], [this.id]).lt(4.99)},
            purchaseLimit: new Decimal(5),
            cost(x) {
                costBaseTimer51 = new Decimal(2)
                costBaseMoneyr51 = new Decimal(4)
                costMultRMinr51 = new Decimal(60)
                costMultMoneyr51 = new Decimal(1000000)
                reqRPr51 = Decimal.times(x, 2).add(4)
                return [player.roundTime(costBaseTimer51.pow(x).times(costMultRMinr51)), costBaseMoneyr51.pow(x).times(costMultMoneyr51).round(), reqRPr51]
            },
            effect(x) {

                effr51 = [new Decimal(25800), new Decimal(159000), new Decimal(820000), new Decimal(3420000), new Decimal(10800000), new Decimal(23400000), new Decimal(23400000)]
                         //0                        1                      2                       3                   4                    5                    5+1  // note these numbers are all arbitrarily decided and there is no formula
                effStackr51number = x.toNumber()
                return effr51[effStackr51number]
            },
            title() { return "research buyable 51"},
            display() { return "travel to a new world to hire more workers. this world has "+format(effr51[effStackr51number+1].sub(this.effect()))+" inhabitants <br> barrier: "+formatWhole(reqRPr51)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+effStackr51number.toString()+".00/5.00 <br> your current world has "+format(this.effect())+" inhabitants"},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(reqRPr51.add(1))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        }, 
        52: {
            unlocked() {return player[this.layer].points.gte(15)&&getBuyableAmount([this.layer], 51).gte(4.99)&&getBuyableAmount([this.layer], 52).lt(2.99)},
            purchaseLimit: new Decimal(3),
            cost(x) {
                costBaseTimer52 = new Decimal(1.5)
                costBaseMoneyr52 = new Decimal(2.5)
                costMultRMinr52 = new Decimal(1920)
                costMultMoneyr52 = new Decimal(1024000000)
                reqRPr52 = new Decimal(14)
                return [player.roundTime(costBaseTimer52.pow(x).times(costMultRMinr52)), costBaseMoneyr52.pow(x).times(costMultMoneyr52).round(), reqRPr52]
            },
            effect(x) {


                return Decimal.dOne
            },
            title() { return "research buyable 52"},
            display() {  
                if (getBuyableAmount([this.layer], [this.id]).eq(0)) {textr52 = "somehow, there are no signs of the next world... improve your detectors"}
                else if (getBuyableAmount([this.layer], [this.id]).eq(1)) {textr52 = "the next world is found. it has 2,575,000,000,000 inhabitants, but its location is yet unknown. improve your spaceships"}                
                else if (getBuyableAmount([this.layer], [this.id]).eq(2)) {textr52 = "the next world is found. it has 2,575,000,000,000 inhabitants, but its location seems to be in a field of magic... looks like you cannot get there with only spaceships. find alternative ways to arrive"} 
                                               
                return textr52+"<br> barrier: "+formatWhole(reqRPr52)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(getBuyableAmount([this.layer], [this.id]))+"/?.?? "},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(reqRPr52.add(1))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        }, 
        53: {
            unlocked() {return player[this.layer].points.gte(15)&&getBuyableAmount([this.layer], 52).gte(2.99)&&getBuyableAmount([this.layer], [this.id]).lt(4.99)},
            purchaseLimit: new Decimal(5),
            cost(x) {
                costBaseTimer53 = new Decimal(2)
                costBaseMoneyr53 = new Decimal(5)
                costMultRMinr53 = new Decimal(6480)
                costMultMoneyr53 = new Decimal(1.6e10)
                reqRPr53 = Decimal.times(2, x).add(14)
                return [player.roundTime(costBaseTimer53.pow(x).times(costMultRMinr53)), costBaseMoneyr53.pow(x).times(costMultMoneyr53).round(), reqRPr53]
            },
            effect(x) {
                effBaser53 = new Decimal(1)
                effStackr53 = new Decimal(x)

                return Decimal.pow(effStackr53, 10).times(Decimal.pow(10, effStackr53)).round()
            },
            title() { return "research buyable 53"},
            display() { 
                textr53a = "turns out, the only way to transport yourself to the new world is to let a size 5 magical truck run through you. "
                if (getBuyableAmount([this.layer], [this.id]).eq(0)) {textr53b = "however, you don't have magical trucks. "}
                if (getBuyableAmount([this.layer], [this.id]).gt(0.1)) {textr53b = "in addition, you have discovered that you can take apart the magical truck infinitely and it will remain the same size. "}
                return textr53a+textr53b+"build a magical truck of size "+formatWhole(getBuyableAmount('r', 53).add(1))+" <br> barrier: "+formatWhole(reqRPr53)+" research points <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> you currently have a magical truck of size "+formatWhole(getBuyableAmount('r', 53))},
            canAfford() { return (player.j.points.gte(this.cost()[1])&&getBuyableAmount([this.layer], 12).lt(1e-4))&&player[this.layer].points.gte(reqRPr53.add(1))},
            buy() {
                player.j.points = player.j.points.sub(this.cost()[1])
                setClickableState([this.layer], 11, this.id)
                setBuyableAmount([this.layer], 12, this.cost()[0].times(60))
                setBuyableAmount([this.layer], 13, this.cost()[2])
            },
        }, 
        54: {
            unlocked() {return getBuyableAmount('r', 53).gte(4.99)&&getBuyableAmount('r', 54).lt(0.99)},
            purchaseLimit: Decimal.dOne,
            cost(x) {

                return Decimal.dOne
            },
            effect(x) {


                return Decimal.dOne
            },
            title() { return "research buyable 54"},
            display() { return "The magical truck is ready, but you need to have enough power to be successfully transported instead of destroyed. Let's go.<br> requires: 6.00 points"},
            canAfford() { return player.points.gte(6)},
            buy() {
                setBuyableAmount([this.layer], [this.id], getBuyableAmount([this.layer], [this.id]).add(1))

            },
        }, 
    },
    infoboxes: {
        11: {
            body() {
                textr = ""
                if (getBuyableAmount('r', 53).gte(0.999)) {
                    textr += "you are currently gaining "+format(buyableEffect('r', 53))+" magical truck parts per second"
                }
                if (getClickableState('r', 11)!=0) {
                    textr += "<br> currently researching: "+getClickableState('r', 11).toString()
                    textr += "<br> time left: "+formatTime(getBuyableAmount('r', 12))

                }
                return textr
            }
        }
    }, 
})

addLayer("mtp", {
    name: "magical truck parts", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MTP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#e9acf3",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "magical truck parts", // Name of prestige currency
    baseResource: "magical truck size", // Name of resource prestige is based on
    baseAmount() {return getBuyableAmount('r', 53)}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addmtp = new Decimal(0)



        multmtp = new Decimal(1)

        return multmtp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expmtp = new Decimal(1)

        

        exp2mtp = new Decimal(1)


        return expmtp
    },
    getResetGain() {
        mtpp = buyableEffect('r', 53).add(addmtp).times(multmtp).pow(expmtp)
        if (mtpp.gte(1)) {mtpp = mtpp.log10().pow(exp2mtp).pow10()}

        return mtpp.max(0).floor()
    },
    getNextAt() {
        nextmtp = getResetGain('mtp').add(1)
        if (nextmtp.gte(1)) {nextmtp = nextmtp.log10().pow(exp2mtp.pow(-1)).pow10()}
        return nextmtp.root(expmtp).div(multmtp).sub(addmtp)
    },
    canReset() {return false},
    passiveGeneration() {
        if (getBuyableAmount('r', 53).gte(1)) {
            return Decimal.dOne
        } else {return Decimal.dZero}
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "You cannot reset this layer." },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
       
    ],
    layerShown(){
        realcondition = getBuyableAmount('r', 53).gte(1)
temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 21).lte(0.99))
        return realcondition&&(!temporaryhidewr)
    },
    automate() {
    },
    doReset(resettingLayer) { //magical truck parts
       
        if (layers[resettingLayer].row > this.row) {layerDataReset(this.layer, [])}
    },
    clickables: {

    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypemtp11 = "normal"
                costBasemtp11 = new Decimal(4)
                costExpmtp11 = new Decimal(1.25)
                costLimitmtp11 = new Decimal('e100')
                return player.buyablePrice(costTypemtp11, new Decimal(x), costBasemtp11, costExpmtp11, costLimitmtp11)
            },
            effect(x) {
                effBasemtp11 = new Decimal(2)
                effStackmtp11 = new Decimal(x)

                return Decimal.pow(effBasemtp11, effStackmtp11)
            },
            title() { return "magical truck parts buyable 11"},
            display() { return "multiply the click value multiple by "+format(effBasemtp11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp11 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp11, player[this.layer].points, costBasemtp11, costExpmtp11, costLimitmtp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp11, player[this.layer].points, costBasemtp11, costExpmtp11, costLimitmtp11))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp11, player.buyableMaxPurchaseable(costTypemtp11, player[this.layer].points, costBasemtp11, costExpmtp11, costLimitmtp11), costBasemtp11, costExpmtp11, costLimitmtp11))}
                    }
                }
            },
        },   
        12: {
            unlocked() {return true},
            cost(x) {
                costTypemtp12 = "normal"
                costBasemtp12 = new Decimal(3.5)
                costExpmtp12 = new Decimal(1.5)
                costLimitmtp12 = new Decimal('e100')
                return player.buyablePrice(costTypemtp12, new Decimal(x), costBasemtp12, costExpmtp12, costLimitmtp12)
            },
            effect(x) {
                effBasemtp12 = new Decimal(2)
                effStackmtp12 = new Decimal(x)

                return Decimal.pow(effBasemtp12, effStackmtp12)
            },
            title() { return "magical truck parts buyable 12"},
            display() { return "multiply the research speed multiple by "+format(effBasemtp12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp12 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp12, player[this.layer].points, costBasemtp12, costExpmtp12, costLimitmtp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp12, player[this.layer].points, costBasemtp12, costExpmtp12, costLimitmtp12))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp12, player.buyableMaxPurchaseable(costTypemtp12, player[this.layer].points, costBasemtp12, costExpmtp12, costLimitmtp12), costBasemtp12, costExpmtp12, costLimitmtp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costTypemtp13 = "asymptote"
                costBasemtp13 = new Decimal(4)
                costExpmtp13 = new Decimal(1.75)
                costLimitmtp13 = layers.mtp.buyables[13].purchaseLimit.add(1)
                return player.buyablePrice(costTypemtp13, new Decimal(x), costBasemtp13, costExpmtp13, costLimitmtp13)
            },
            effect(x) {
                effBasemtp13 = new Decimal(1)
                effStackmtp13 = new Decimal(x)

                return Decimal.times(effBasemtp13, effStackmtp13)
            },
            purchaseLimit: new Decimal(40),
            title() { return "magical truck parts buyable 13"},
            display() { return "reduce the third point gain softcap by "+format(effBasemtp13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp13 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp13, player[this.layer].points, costBasemtp13, costExpmtp13, costLimitmtp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp13, player[this.layer].points, costBasemtp13, costExpmtp13, costLimitmtp13))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp13, player.buyableMaxPurchaseable(costTypemtp13, player[this.layer].points, costBasemtp13, costExpmtp13, costLimitmtp13), costBasemtp13, costExpmtp13, costLimitmtp13))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypemtp21 = "normal"
                costBasemtp21 = new Decimal(2.2)
                costExpmtp21 = new Decimal(1.25)
                costLimitmtp21 = new Decimal('e100')
                return player.buyablePrice(costTypemtp21, new Decimal(x), costBasemtp21, costExpmtp21, costLimitmtp21)
            },
            effect(x) {
                effBasemtp21 = new Decimal(0.2)
                effStackmtp21 = new Decimal(x)

                return Decimal.times(effBasemtp21, effStackmtp21)
            },
            title() { return "magical truck parts buyable 21"},
            display() { return "add base hyperprestige gain by "+format(effBasemtp21)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp21)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp21 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp21, player[this.layer].points, costBasemtp21, costExpmtp21, costLimitmtp21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp21, player[this.layer].points, costBasemtp21, costExpmtp21, costLimitmtp21))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp21, player.buyableMaxPurchaseable(costTypemtp21, player[this.layer].points, costBasemtp21, costExpmtp21, costLimitmtp21), costBasemtp21, costExpmtp21, costLimitmtp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypemtp22 = "normal"
                costBasemtp22 = new Decimal(3.4)
                costExpmtp22 = new Decimal(1.5)
                costLimitmtp22 = new Decimal('e100')
                return player.buyablePrice(costTypemtp22, new Decimal(x), costBasemtp22, costExpmtp22, costLimitmtp22)
            },
            effect(x) {
                effBasemtp22 = new Decimal(0.1)
                effStackmtp22 = new Decimal(x)

                return Decimal.times(effBasemtp22, effStackmtp22)
            },
            title() { return "magical truck parts buyable 22"},
            display() { return "add the hyperprestige point mult by "+format(effBasemtp22)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp22)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp22 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp22, player[this.layer].points, costBasemtp22, costExpmtp22, costLimitmtp22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp22, player[this.layer].points, costBasemtp22, costExpmtp22, costLimitmtp22))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp22, player.buyableMaxPurchaseable(costTypemtp22, player[this.layer].points, costBasemtp22, costExpmtp22, costLimitmtp22), costBasemtp22, costExpmtp22, costLimitmtp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypemtp23 = "normal"
                costBasemtp23 = new Decimal(8)
                costExpmtp23 = new Decimal(1.75)
                costLimitmtp23 = new Decimal('e100')
                return player.buyablePrice(costTypemtp23, new Decimal(x), costBasemtp23, costExpmtp23, costLimitmtp23)
            },
            effect(x) {
                effBasemtp23 = new Decimal(0.1)
                effStackmtp23 = new Decimal(x)

                return Decimal.times(effBasemtp23, effStackmtp23).add(1)
            },
            title() { return "magical truck parts buyable 23"},
            display() { return "add the row 1 to 2 unlimited buyable exponent by "+format(effBasemtp23)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp23 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp23, player[this.layer].points, costBasemtp23, costExpmtp23, costLimitmtp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp23, player[this.layer].points, costBasemtp23, costExpmtp23, costLimitmtp23))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp23, player.buyableMaxPurchaseable(costTypemtp23, player[this.layer].points, costBasemtp23, costExpmtp23, costLimitmtp23), costBasemtp23, costExpmtp23, costLimitmtp23))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypemtp31 = "normal"
                costBasemtp31 = new Decimal(2.4)
                costExpmtp31 = new Decimal(1.25)
                costLimitmtp31 = new Decimal('e100')
                return player.buyablePrice(costTypemtp31, new Decimal(x), costBasemtp31, costExpmtp31, costLimitmtp31)
            },
            effect(x) {
                effBasemtp31 = new Decimal(1)
                effStackmtp31 = new Decimal(x)

                return Decimal.times(effBasemtp31, effStackmtp31).add(1)
            },
            title() { return "magical truck parts buyable 31"},
            display() { return "add the row 1 to 2 unlimited buyable softcap threshold multiple by "+format(effBasemtp31)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp31)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp31 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp31, player[this.layer].points, costBasemtp31, costExpmtp31, costLimitmtp31).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp31, player[this.layer].points, costBasemtp31, costExpmtp31, costLimitmtp31))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp31, player.buyableMaxPurchaseable(costTypemtp31, player[this.layer].points, costBasemtp31, costExpmtp31, costLimitmtp31), costBasemtp31, costExpmtp31, costLimitmtp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypemtp32 = "normal"
                costBasemtp32 = new Decimal(3.8)
                costExpmtp32 = new Decimal(1.5)
                costLimitmtp32 = new Decimal('e100')
                return player.buyablePrice(costTypemtp32, new Decimal(x), costBasemtp32, costExpmtp32, costLimitmtp32)
            },
            effect(x) {
                effBasemtp32 = new Decimal(0.2)
                effStackmtp32 = new Decimal(x)

                return Decimal.times(effBasemtp32, effStackmtp32)
            },
            title() { return "magical truck parts buyable 32"},
            display() { return "add bonus points coefficient by "+format(effBasemtp32)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp32)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp32 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp32, player[this.layer].points, costBasemtp32, costExpmtp32, costLimitmtp32).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp32, player[this.layer].points, costBasemtp32, costExpmtp32, costLimitmtp32))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp32, player.buyableMaxPurchaseable(costTypemtp32, player[this.layer].points, costBasemtp32, costExpmtp32, costLimitmtp32), costBasemtp32, costExpmtp32, costLimitmtp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypemtp33 = "normal"
                costBasemtp33 = new Decimal(11)
                costExpmtp33 = new Decimal(1.75)
                costLimitmtp33 = new Decimal('e100')
                return player.buyablePrice(costTypemtp33, new Decimal(x), costBasemtp33, costExpmtp33, costLimitmtp33)
            },
            effect(x) {
                effBasemtp33 = new Decimal(2)
                effStackmtp33 = new Decimal(x)

                return Decimal.pow(effBasemtp33, effStackmtp33)
            },
            title() { return "magical truck parts buyable 33"},
            display() { return "multiply the effective scrap count multiple by "+format(effBasemtp33)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemtp33 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemtp33, player[this.layer].points, costBasemtp33, costExpmtp33, costLimitmtp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemtp33, player[this.layer].points, costBasemtp33, costExpmtp33, costLimitmtp33))
                        if (player[this.layer].points.lt('e200')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp33, player.buyableMaxPurchaseable(costTypemtp33, player[this.layer].points, costBasemtp33, costExpmtp33, costLimitmtp33), costBasemtp33, costExpmtp33, costLimitmtp33))}
                    }
                }
            },
        },
    },
})

addLayer("wr", {
    name: "world resets", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "WR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ef7575",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "world resets", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addwr = new Decimal(-5)


        multwr = new Decimal(1)
        

        return multwr
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expwr = new Decimal(1)


        exp2wr = new Decimal(0.5)

        return expwr
    },
    getResetGain() {
        wrp = player.points.add(addwr).times(multwr).pow(expwr)
        if (wrp.gte(1)) {wrp = wrp.log10().pow(exp2wr).pow10()}

        return wrp.floor().max(0)
    },
    getNextAt() {
        nextwr = getResetGain('wr').add(1)
        if (nextwr.gte(1)) {nextwr = nextwr.log10().root(exp2wr).pow10()}
        return nextwr.root(expwr).div(multwr).sub(addwr)
    },
    effect() {
        effwr = player.wr.points.pow(3)
        return effwr
    },
    effectDescription() {
        return "multiplying experience point gain by "+format(layers.wr.effect())
    },
    canReset() {return getResetGain('wr').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset to world reset up "+formatWhole(getResetGain('wr'))+" times. Next at "+format(getNextAt('wr'))+" points" },
    row: 5, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return getBuyableAmount('r', 54).gte(1)||player.wr.total.gte(1)},
    buyables: {
        11: {
            unlocked() {return false}, //amt: xp points, eff: world reset
            cost(x) {
                return new Decimal(1)
            },
            effect(x) {
                effStackwr11 = new Decimal(x)
                if (effStackwr11.gte(14300)) {return new Decimal(1.1916666666666667).pow(effStackwr11.sub(10)).times(14300)} //softcap: exponential
                else {return effStackwr11.div(100).add(1).pow(0.5)} // f(x) = (x-1)(x+1)

                return Decimal.times(effBasewr21, effStackwr21)
            },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
            },
            buyMax() {
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                return new Decimal(5).div(Decimal.dOne.sub(x))
            },
            effect(x) {
                effBasewr21 = new Decimal(1)
                effStackwr21 = new Decimal(x)

                return Decimal.times(effBasewr21, effStackwr21)
            },
            purchaseLimit: Decimal.dOne,
            title() { return "world resets buyable 21"},
            display() { return "create a portal back to your original world <br> req: "+format(this.cost())+" levels <br> owned: "+format(effStackwr21.gte(1))},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
            },
        },
    },
    upgrades: {

    },
    infoboxes: {
        11: {
            body() {
                textwr = "you have "+formatWhole(buyableEffect('wr', 11).floor())+" levels"
                textwr += "<br> you have "+formatWhole(getBuyableAmount('wr', 11))+" experience points, "+format(buyableEffect('wr', 11).subtract(buyableEffect('wr', 11).floor()).times(100))+"% to the next level"
                return textwr
            },
            unlocked() {
                return player.wr.total.gte(1)
            }
        }
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

        return ap.floor().max(0)
    },
    getNextAt() {
        nexta = getResetGain('a').add(1)
        if (nexta.gte(1)) {nexta = nexta.log10().root(exp2a).pow10()}
        return nexta.root(expa).div(multa).sub(adda)
    },
    canReset() {return getResetGain('a').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset to ascend to "+formatWhole(getResetGain('a'))+" higher planes of existence. Next at "+format(getNextAt('a'))+" points" },
    row: 10, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "A", description: "A: Ascend", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    buyables: {
    },
    upgrades: {
    },

})