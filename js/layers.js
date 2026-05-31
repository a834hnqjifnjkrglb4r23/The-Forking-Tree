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
    layerShown(){ //lootbox
        realcondition = (player.points.gte(3)||player.l.total.gte(1)||player.hp.total.gte(1))
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(2.99))
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
                gearpower[0][0] = new Decimal(effectivegearlevel[0][0]).add(24.337595272607097033).div(24.337595272607097033).pow(1.5) // ((x+a)/b)^p = 1, 100
                gearpower[0][1] = new Decimal(effectivegearlevel[0][1]).add(5.0505050505050505051).div(5.0505050505050505051).pow(1.5) // ((x+a)/b)^p = 1, 1000
                gearpower[0][2] = new Decimal(effectivegearlevel[0][2]).div(25) //0, 20
                gearpower[0][3] = new Decimal(effectivegearlevel[0][3]).div(25) //0, 20

                gearpower[1][0] = new Decimal(effectivegearlevel[1][0]).add(24.337595272607097033).div(24.337595272607097033).pow(1.5) // ((x+a)/b)^p = 1, 100
                gearpower[1][1] = new Decimal(effectivegearlevel[1][1]).add(5.0505050505050505051).div(5.0505050505050505051).pow(1.5) // ((x+a)/b)^p = 1, 1000
                gearpower[1][2] = new Decimal(effectivegearlevel[1][2]).div(25) //0, 20
                gearpower[1][3] = new Decimal(effectivegearlevel[1][3]).div(25) //0, 20

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
                if (hasMilestone('m', 5)) {geartierbounds = [30, 27, 23, 20]}
                geartierboundstotal = [geartierbounds[0], geartierbounds[0]+geartierbounds[1], geartierbounds[0]+geartierbounds[1]+geartierbounds[2], geartierbounds[0]+geartierbounds[1]+geartierbounds[2]+geartierbounds[3]]
                if (geartiercoef < geartierboundstotal[0]) {geartier = 0}
                else if (geartiercoef < geartierboundstotal[1]) {geartier = 1}
                else if (geartiercoef < geartierboundstotal[2]) {geartier = 2}
                else if (geartiercoef < geartierboundstotal[3]) {geartier = 3}

                gearlevelcoef = (lootboxseed % 1)**2
                gearmultiplier = getBuyableAmount('l', 99).sub(3).times(250).toNumber()
                gearlevelraw = (1 + gearlevelcoef) * gearmultiplier
                if ((gearlevelraw > 500)&&(getBuyableAmount('r', 43).lt(4.999))) {gearlevelraw = (gearlevelraw / 500) ** (0.5 + buyableEffect('r', 43).toNumber()) * 500}

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
                costSoftcapStartl12 = new Decimal(60)
                costSoftcapPowerl12 = new Decimal(1.25)
                costStackl12 = softcap(new Decimal(x), costSoftcapStartl12, costSoftcapPowerl12)
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
                        setBuyableAmount(this.layer, this.id, undosoftcap(player.buyableMaxPurchaseable(costTypel12, player.p.points, costBasel12, costExpl12, costLimitl12), costSoftcapStartl12, costSoftcapPowerl12).floor())
                        
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
                effectiveCommonScraps = getBuyableAmount('l', 21).times(buyableEffect('mtp', 33))
                if (effectiveCommonScraps.lte(1000)) {eff = Decimal.dOne.add(effectiveCommonScraps.div(4000))}
                else {eff = effectiveCommonScraps.div(1000).pow(3).times(1.25)}
                //if (eff.gte(16)) {eff = eff.div(16).pow(0.5).times(16)}
                if (hasMilestone('l', 0)) {return eff} else {return new Decimal(1)}
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
                effectiveRareScraps = getBuyableAmount('l', 22).times(buyableEffect('mtp', 33))
                if (effectiveRareScraps.lte(1000)) {eff = Decimal.dOne.add(effectiveRareScraps.div(8000))}
                else {eff = effectiveRareScraps.div(1000).pow(1.5).times(1.125)}
                if (hasMilestone('l', 0)) {return eff} else {return new Decimal(1)}
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
                effectiveLegScraps = getBuyableAmount('l', 23)
                if (effectiveLegScraps.lte(10)) {eff = Decimal.dOne.add(effectiveLegScraps.div(100))}
                else if (effectiveLegScraps.lte(1e10)) {eff = Decimal.dOne.add(effectiveLegScraps.log10().times(0.1))}
                else if (effectiveLegScraps.lte(1e10)) {eff = Decimal.dOne.add(effectiveLegScraps.log10().times(0.1))}
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
                textl += "<br> Bonus points: x"+format(gearpower[1][0])+", x"+format(gearpower[1][1])+", -"+format(gearpower[1][2])+" to 2nd sc, -"+format(gearpower[1][3])+" to 3rd sc"
                textl += "<br> Prestige: x"+format(gearpower[2][0])+", x"+format(gearpower[2][1])+", +"+format(gearpower[2][2])+" to exp, +"+format(gearpower[2][3])+" to 2nd exp"
                textl += "<br> 2nd row: x"+format(gearpower[3][0])+", x"+format(gearpower[3][1])+", +"+format(gearpower[3][2])+" to exp, +"+format(gearpower[3][3])+" to 2nd exp"
                if (buyableEffect('mtp', 33).gt(1)) {
                    textl += "<br><br> Your common and rare scrap count is multiplied by "+format(buyableEffect('mtp', 33))
                }
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
    layerShown(){ //job
        realcondition = true
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(2.99))
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
                raiseChance = getBuyableAmount('j', 12).sub(clicksGoal).div(2400).max(0).min(1)
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
    layerShown(){ //superjob
        realcondition = true
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(2.99))
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
    layerShown(){ //workers
        realcondition = player.j.points.gte(100)||player.w.total.gte(1)||getBuyableAmount('w', 12).gt(0)
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(3.99))
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
    color: "#7799ff",
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
    layerShown(){ //gems
        realcondition = true
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(2.99))
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
        if (hasMilestone('wr', 1)) {actualRow = 6}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    layerShown(){ //milestones
        realcondition = true
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(0.99))
        return realcondition&&(!temporaryhidewr)},
    milestones: {
        0: {
            requirementDescription: "2.00 points",
            effectDescription: "automates prestige buyables and unlocks bonus points",
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
        if (hasMilestone('m', 0)) {
            basebgain = new Decimal(1)
            basebgain = basebgain.add(buyableEffect('p', 111))
            basebgain = basebgain.add(buyableEffect('mp', 111))
            basebgain = basebgain.add(buyableEffect('bp', 111))
            basebgain = basebgain.add(buyableEffect('sp', 111))
        } else {
            basebgain = new Decimal(0)
        }

        if (hasMilestone('m', 0)) {
            bgainmult = new Decimal(1)
            bgainmult = bgainmult.add(buyableEffect('p', 112))
            bgainmult = bgainmult.add(buyableEffect('mp', 112))
            bgainmult = bgainmult.add(buyableEffect('bp', 112))
            bgainmult = bgainmult.add(buyableEffect('sp', 112))
        } else {
            bgainmult = new Decimal(0)
        }

        bgainraw = Decimal.max(basebgain.times(bgainmult), basebgain.add(bgainmult))

        bgainraw = bgainraw.times(player.points.pow(buyableEffect('b', 11)).max(1)).times(buyableEffect('l', 11)[1][0]).times(buyableEffect('l', 11)[1][1])


	    bgainExp = new Decimal(1)
	    bgainExp = bgainExp.add(buyableEffect('wrte', 115))

        bgain = bgainraw.pow(bgainExp)

        return bgain
    },
    getNextAt() {

        return Decimal.dOne
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){ //bonus points
        realcondition = hasMilestone('m', 0)||player.b.points.gte(0.0001)
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(0.99))
        return realcondition&&(!temporaryhidewr) },
    doReset(resettingLayer) { //bonus points
        actualRow = 0
        if (hasMilestone('m', 9)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    update(diff) {
        bfirstSoftcapStrength = new Decimal(20) 
        bfirstSoftcapStrength = bfirstSoftcapStrength.sub(buyableEffect('p', 113))
        bfirstSoftcapStrength = bfirstSoftcapStrength.sub(buyableEffect('mp', 113))
        bfirstSoftcapStrength = bfirstSoftcapStrength.sub(buyableEffect('bp', 113))
        bfirstSoftcapStrength = bfirstSoftcapStrength.sub(buyableEffect('sp', 113))

        bsecondSoftcapStrength = new Decimal(40) 
        bsecondSoftcapStrength = bsecondSoftcapStrength.sub(buyableEffect('l', 11)[1][2])
        bsecondSoftcapStrength = bsecondSoftcapStrength.sub(buyableEffect('hp', 114))

        bthirdSoftcapStrength = new Decimal(60) // 40 left
        bthirdSoftcapStrength = bthirdSoftcapStrength.sub(buyableEffect('l', 11)[1][3])
        bthirdSoftcapStrength = bthirdSoftcapStrength.sub(buyableEffect('hp', 116))

        bfourthSoftcapStrength = new Decimal(240) // 120 left
        bfourthSoftcapStrength = bfourthSoftcapStrength.sub(buyableEffect('wr', 117))
	    bfourthSoftcapStrength = bfourthSoftcapStrength.sub(buyableEffect('wrp', 117))
	    bfourthSoftcapStrength = bfourthSoftcapStrength.sub(buyableEffect('wrmp', 117))
	    bfourthSoftcapStrength = bfourthSoftcapStrength.sub(buyableEffect('wrbp', 117))
	    bfourthSoftcapStrength = bfourthSoftcapStrength.sub(buyableEffect('wrsp', 117))

        bfifthSoftcapStrength = new Decimal(1200)

        bsixthSoftcapStrength = new Decimal(7200)

        bseventhSoftcapStrength = new Decimal(50400)
        
        beighthSoftcapStrength = new Decimal(403200)

	    bninthSoftcapStrength = new Decimal(3628800)

        bpointTotalSoftcapStrength = new Decimal(0)
	    if (player.b.points.gte(1)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(bfirstSoftcapStrength)}
	    if (player.b.points.gte(2)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(bsecondSoftcapStrength)}
	    if (player.b.points.gte(3)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(bthirdSoftcapStrength)}
	    if (player.b.points.gte(4)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(bfourthSoftcapStrength)}
	    if (player.b.points.gte(5)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(bfifthSoftcapStrength)}
	    if (player.b.points.gte(6)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(bsixthSoftcapStrength)}
	    if (player.b.points.gte(7)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(bseventhSoftcapStrength)}
	    if (player.b.points.gte(8)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(beighthSoftcapStrength)}
	    if (player.b.points.gte(9)) {bpointTotalSoftcapStrength = bpointTotalSoftcapStrength.add(bninthSoftcapStrength)}

	    bpointTotalSoftcapConst = new Decimal(1)
	    //  if (player.b.points.gte(1)) {pointTotalSoftcapConst = pointTotalSoftcapConst.times(new Decimal(1).pow(firstSoftcapStrength))} 
	    if (player.b.points.gte(2)) {bpointTotalSoftcapConst = bpointTotalSoftcapConst.times(new Decimal(2).pow(bsecondSoftcapStrength))}
	    if (player.b.points.gte(3)) {bpointTotalSoftcapConst = bpointTotalSoftcapConst.times(new Decimal(3).pow(bthirdSoftcapStrength))}
	    if (player.b.points.gte(4)) {bpointTotalSoftcapConst = bpointTotalSoftcapConst.times(new Decimal(4).pow(bfourthSoftcapStrength))}
	    if (player.b.points.gte(5)) {bpointTotalSoftcapConst = bpointTotalSoftcapConst.times(new Decimal(5).pow(bfifthSoftcapStrength))}
	    if (player.b.points.gte(6)) {bpointTotalSoftcapConst = bpointTotalSoftcapConst.times(new Decimal(6).pow(bsixthSoftcapStrength))}
	    if (player.b.points.gte(7)) {bpointTotalSoftcapConst = bpointTotalSoftcapConst.times(new Decimal(7).pow(bseventhSoftcapStrength))}
	    if (player.b.points.gte(8)) {bpointTotalSoftcapConst = bpointTotalSoftcapConst.times(new Decimal(8).pow(beighthSoftcapStrength))}
	    if (player.b.points.gte(9)) {bpointTotalSoftcapConst = bpointTotalSoftcapConst.times(new Decimal(9).pow(bninthSoftcapStrength))}

	    if (player.b.points.gte(1)) {	
		
		    currentbPointTime = player.b.points.pow(bpointTotalSoftcapStrength.add(1)).div(bpointTotalSoftcapStrength.add(1)).div(bpointTotalSoftcapConst).div(bgain)
		    bpointDiff = diff
		    if (getBuyableAmount('g', 41).gt(0)) {bpointDiff = bpointDiff.times(buyableEffect('g', 41))}
		    if (getBuyableAmount('g', 42).gt(0)) {bpointDiff = bpointDiff.times(buyableEffect('g', 42))}
		    if (getBuyableAmount('g', 43).gt(0)) {bpointDiff = bpointDiff.times(buyableEffect('g', 43))}
		    nextTickbPointTime = currentbPointTime.add(bpointDiff)
		    nextTickbPoints = nextTickbPointTime.times(bpointTotalSoftcapStrength.add(1)).times(bpointTotalSoftcapConst).times(bgain).root(bpointTotalSoftcapStrength.add(1))
		    nextTickbPoints = nextTickbPoints.min(player.b.points.add(1).floor())


		    }
	    else {
		    nextTickbPoints = player.b.points.add(bgain.times(diff).min(1))
	    }
        player.b.points = nextTickbPoints
    },
    buyables: {
        11: { //bonus coefficient (base 1)
            unlocked() {return false},
            cost(x) {
                return Decimal.dOne
            },
            effect(x) {
                basebcoeff = new Decimal(0)
                basebcoeff = basebcoeff.add(buyableEffect('p', 114))
                basebcoeff = basebcoeff.add(buyableEffect('mp', 114))
                basebcoeff = basebcoeff.add(buyableEffect('bp', 114))
                basebcoeff = basebcoeff.add(buyableEffect('sp', 114))
                
                bcoeffmult = new Decimal(1)
                bcoeffmult = bcoeffmult.add(buyableEffect('r', 32))
                bcoeffmult = bcoeffmult.add(buyableEffect('mtp', 32))

                return basebcoeff.times(bcoeffmult)
            },
            canAfford() { return false },
            buy() {

            },
        },
    },
    infoboxes: {
        11: {

            body() {
                textb = "you have "+format(player.points, 4)+" points, multiplying bonus point gain by "+format(player.points.pow(buyableEffect('b', 11)).max(1), 4)
                textb += "<br> you have "+format(player.b.points, 4)+" bonus points, multiplying point gain by "+format(player.b.points.pow(buyableEffect('b', 11)).max(1), 4)
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
        expp = new Decimal(4)
        expp = expp.add(buyableEffect('p', 23))
        expp = expp.add(buyableEffect('mp', 23))
        expp = expp.add(buyableEffect('bp', 23))
        expp = expp.add(buyableEffect('sp', 23))
        expp = expp.times(buyableEffect('l', 11)[2][2].times(buyableEffect('l', 22)).add(1))
        expp = expp.times(buyableEffect('hp', 23))
        expp = expp.times(buyableEffect('wrte', 23))   

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
    layerShown(){ //prestige
        realcondition = true
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(0.99))
        return realcondition&&(!temporaryhidewr)},
    automate() {
        if (hasMilestone('m', 0)&&player.p.autoBuy) {
            for (let i = 11; i < 14; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 21; i < 25; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
            for (let i = 111; i < 115; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
    },
    doReset(resettingLayer) { //prestige
        actualRow = 1
        if (hasMilestone('m', 2)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    update(diff) {
        if (buyableEffect('wr', 13).row1.eq(0)||getBuyableAmount('wr', 212).lt(1)||player.p.points.eq(0)) {return;} else {
            unsoftcappedCurrentRepliPrestigeTime = player.p.points.max(1).ln().div(buyableEffect('wr', 13).row1) //unsoftcapped: dx/xdt = mx
            unsoftcappedNextTickRepliPrestigeTime = unsoftcappedCurrentRepliPrestigeTime.add(diff)
            unsoftcappedRepliPrestige = unsoftcappedNextTickRepliPrestigeTime.times(buyableEffect('wr', 13).row1).exp()
            addPoints('p', unsoftcappedRepliPrestige.sub(player.p.points))
        }
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypep11 = "normal"
                costBasep11 = new Decimal(1.3).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep11, player.buyableMaxPurchaseable(costTypep11, player[this.layer].points, costBasep11, costExpp11, costLimitp11), costBasep11, costExpp11, costLimitp11))}
                    }
                }

            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypep12 = "normal"
                costBasep12 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep12, player.buyableMaxPurchaseable(costTypep12, player[this.layer].points, costBasep12, costExpp12, costLimitp12), costBasep12, costExpp12, costLimitp12))}
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
            purchaseLimit: new Decimal(50),
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep13, player.buyableMaxPurchaseable(costTypep13, player[this.layer].points, costBasep13, costExpp13, costLimitp13), costBasep13, costExpp13, costLimitp13))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypep21 = "normal"
                costBasep21 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep21, player.buyableMaxPurchaseable(costTypep21, player[this.layer].points, costBasep21, costExpp21, costLimitp21), costBasep21, costExpp21, costLimitp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypep22 = "normal"
                costBasep22 = new Decimal(1.7).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep22, player.buyableMaxPurchaseable(costTypep22, player[this.layer].points, costBasep22, costExpp22, costLimitp22), costBasep22, costExpp22, costLimitp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypep23 = "normal"
                costBasep23 = new Decimal(1.9).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep23, player.buyableMaxPurchaseable(costTypep23, player[this.layer].points, costBasep23, costExpp23, costLimitp23), costBasep23, costExpp23, costLimitp23))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep24, player.buyableMaxPurchaseable(costTypep24, player[this.layer].points, costBasep24, costExpp24, costLimitp24), costBasep24, costExpp24, costLimitp24))}
                    }
                }
            },
        },
        111: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypep111 = "normal"
                costBasep111 = new Decimal(1.3).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpp111 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitp111 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypep111, new Decimal(x), costBasep111, costExpp111, costLimitp111)
            },
            effect(x) {
                effBasep111 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackp111 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasep111, effStackp111)
            },
            title() { return "prestige buyable 111"},
            display() { return "increase base bonus point gain by "+format(effBasep111)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp111)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep111 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep111, player[this.layer].points, costBasep111, costExpp111, costLimitp111).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep111, player[this.layer].points, costBasep111, costExpp111, costLimitp111))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep111, player.buyableMaxPurchaseable(costTypep111, player[this.layer].points, costBasep111, costExpp111, costLimitp111), costBasep111, costExpp111, costLimitp111))}
                    }
                }

            },
        },
        112: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypep112 = "normal"
                costBasep112 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpp112 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitp112 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypep112, new Decimal(x), costBasep112, costExpp112, costLimitp112)
            },
            effect(x) {
                effBasep112 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackp112 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasep112, effStackp112)
            },
            title() { return "prestige buyable 112"},
            display() { return "add bonus point gain mult by "+format(effBasep112)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp112)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep112 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep112, player[this.layer].points, costBasep112, costExpp112, costLimitp112).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep112, player[this.layer].points, costBasep112, costExpp112, costLimitp112))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep112, player.buyableMaxPurchaseable(costTypep112, player[this.layer].points, costBasep112, costExpp112, costLimitp112), costBasep112, costExpp112, costLimitp112))}
                    }
                }
            },
        },
        113: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypep113 = "asymptote"
                costBasep113 = new Decimal(1.7)
                costExpp113 = new Decimal(1.3)
                costLimitp113 = layers.p.buyables[113].purchaseLimit.add(1)
                return player.buyablePrice(costTypep113, new Decimal(x), costBasep113, costExpp113, costLimitp113)
            },
            effect(x) {
                effBasep113 = new Decimal(0.1)
                effStackp113 = new Decimal(x)

                return Decimal.times(effBasep113, effStackp113)
            },
            purchaseLimit: new Decimal(50),
            title() { return "prestige buyable 113"},
            display() { return "subtract first bonus point softcap by "+format(effBasep113)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp113)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep113 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep113, player[this.layer].points, costBasep113, costExpp113, costLimitp113).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep113, player[this.layer].points, costBasep113, costExpp113, costLimitp113))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep113, player.buyableMaxPurchaseable(costTypep113, player[this.layer].points, costBasep113, costExpp113, costLimitp113), costBasep113, costExpp113, costLimitp113))}
                    }
                }
            },
        },
        114: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypep114 = "asymptote"
                costBasep114 = new Decimal(2)
                costExpp114 = new Decimal(1.5)
                costLimitp114 = layers.p.buyables[114].purchaseLimit.add(1)
                return player.buyablePrice(costTypep114, new Decimal(x), costBasep114, costExpp114, costLimitp114)
            },
            effect(x) {
                effBasep114 = new Decimal(0.2)
                effStackp114 = new Decimal(x)

                return Decimal.times(effBasep114, effStackp114)
            },
            purchaseLimit: new Decimal(200),
            title() { return "prestige buyable 114"},
            display() { return "add bonus point coefficent "+format(effBasep114)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackp114)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep114 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep114, player[this.layer].points, costBasep114, costExpp114, costLimitp114).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep114, player[this.layer].points, costBasep114, costExpp114, costLimitp114))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypep114, player.buyableMaxPurchaseable(costTypep114, player[this.layer].points, costBasep114, costExpp114, costLimitp114), costBasep114, costExpp114, costLimitp114))}
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
        expmp = new Decimal(2)
        expmp = expmp.add(buyableEffect('mp', 33))
        expmp = expmp.add(buyableEffect('bp', 33))
        expmp = expmp.add(buyableEffect('sp', 33))
        expmp = expmp.times(buyableEffect('l', 11)[3][2].times(buyableEffect('l', 11)[2][2]).add(1))
        expmp = expmp.times(buyableEffect('hp', 33))
        expmp = expmp.times(buyableEffect('wrte', 33))   

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
    layerShown(){  //metaprestige
        realcondition = (player.p.best.gte(100)||player.mp.total.gte(1))
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(1.99))
        return realcondition&&(!temporaryhidewr)},
    automate() {
        if (hasMilestone('m', 1)&&player.bp.autoBuy) {
            for (let i = 1; i < 6; i++) {
                for (let j = 1; j < 5; j++) {
                    if (canBuyBuyable('mp', i*10+j)) {buyMaxBuyable('mp', i*10+j)}
                }
            }
            for (let i = 111; i < 115; i++) {
                if (canBuyBuyable('mp', i)) {buyMaxBuyable('mp', i)}
            }
        }
    },    
    update(diff) {
        if (buyableEffect('wr', 13).row2.eq(0)||getBuyableAmount('wr', 212).lt(2)||player.mp.points.eq(0)) {return;} else {
            unsoftcappedCurrentRepliMetaprestigeTime = player.mp.points.max(1).ln().div(buyableEffect('wr', 13).row2) //unsoftcapped: dx/xdt = mx
            unsoftcappedNextTickRepliMetaprestigeTime = unsoftcappedCurrentRepliMetaprestigeTime.add(diff)
            unsoftcappedRepliMetaprestige = unsoftcappedNextTickRepliMetaprestigeTime.times(buyableEffect('wr', 13).row2).exp()
            addPoints('mp', unsoftcappedRepliMetaprestige.sub(player.mp.points))
        }
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypemp11 = "normal"
                costBasemp11 = new Decimal(1.2).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp11, player.buyableMaxPurchaseable(costTypemp11, player[this.layer].points, costBasemp11, costExpmp11, costLimitmp11), costBasemp11, costExpmp11, costLimitmp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypemp12 = "normal"
                costBasemp12 = new Decimal(1.4).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp12, player.buyableMaxPurchaseable(costTypemp12, player[this.layer].points, costBasemp12, costExpmp12, costLimitmp12), costBasemp12, costExpmp12, costLimitmp12))}
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
            purchaseLimit: new Decimal(50),
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp13, player.buyableMaxPurchaseable(costTypemp13, player[this.layer].points, costBasemp13, costExpmp13, costLimitmp13), costBasemp13, costExpmp13, costLimitmp13))}
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
            purchaseLimit: new Decimal(50),
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp14, player.buyableMaxPurchaseable(costTypemp14, player[this.layer].points, costBasemp14, costExpmp14, costLimitmp14), costBasemp14, costExpmp14, costLimitmp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypemp21 = "normal"
                costBasemp21 = new Decimal(1.3).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp21, player.buyableMaxPurchaseable(costTypemp21, player[this.layer].points, costBasemp21, costExpmp21, costLimitmp21), costBasemp21, costExpmp21, costLimitmp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypemp22 = "normal"
                costBasemp22 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp22, player.buyableMaxPurchaseable(costTypemp22, player[this.layer].points, costBasemp22, costExpmp22, costLimitmp22), costBasemp22, costExpmp22, costLimitmp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypemp23 = "normal"
                costBasemp23 = new Decimal(1.7).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp23, player.buyableMaxPurchaseable(costTypemp23, player[this.layer].points, costBasemp23, costExpmp23, costLimitmp23), costBasemp23, costExpmp23, costLimitmp23))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp24, player.buyableMaxPurchaseable(costTypemp24, player[this.layer].points, costBasemp24, costExpmp24, costLimitmp24), costBasemp24, costExpmp24, costLimitmp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypemp31 = "normal"
                costBasemp31 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp31, player.buyableMaxPurchaseable(costTypemp31, player[this.layer].points, costBasemp31, costExpmp31, costLimitmp31), costBasemp31, costExpmp31, costLimitmp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypemp32 = "normal"
                costBasemp32 = new Decimal(1.7).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp32, player.buyableMaxPurchaseable(costTypemp32, player[this.layer].points, costBasemp32, costExpmp32, costLimitmp32), costBasemp32, costExpmp32, costLimitmp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypemp33 = "normal"
                costBasemp33 = new Decimal(1.9).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp33, player.buyableMaxPurchaseable(costTypemp33, player[this.layer].points, costBasemp33, costExpmp33, costLimitmp33), costBasemp33, costExpmp33, costLimitmp33))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp34, player.buyableMaxPurchaseable(costTypemp34, player[this.layer].points, costBasemp34, costExpmp34, costLimitmp34), costBasemp34, costExpmp34, costLimitmp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypemp41 = "normal"
                costBasemp41 = new Decimal(1.55).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp41, player.buyableMaxPurchaseable(costTypemp41, player[this.layer].points, costBasemp41, costExpmp41, costLimitmp41), costBasemp41, costExpmp41, costLimitmp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypemp42 = "normal"
                costBasemp42 = new Decimal(1.75).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp42, player.buyableMaxPurchaseable(costTypemp42, player[this.layer].points, costBasemp42, costExpmp42, costLimitmp42), costBasemp42, costExpmp42, costLimitmp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypemp43 = "normal"
                costBasemp43 = new Decimal(1.95).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp43, player.buyableMaxPurchaseable(costTypemp43, player[this.layer].points, costBasemp43, costExpmp43, costLimitmp43), costBasemp43, costExpmp43, costLimitmp43))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp44, player.buyableMaxPurchaseable(costTypemp44, player[this.layer].points, costBasemp44, costExpmp44, costLimitmp44), costBasemp44, costExpmp44, costLimitmp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypemp51 = "normal"
                costBasemp51 = new Decimal(1.6).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp51, player.buyableMaxPurchaseable(costTypemp51, player[this.layer].points, costBasemp51, costExpmp51, costLimitmp51), costBasemp51, costExpmp51, costLimitmp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypemp52 = "normal"
                costBasemp52 = new Decimal(1.8).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp52, player.buyableMaxPurchaseable(costTypemp52, player[this.layer].points, costBasemp52, costExpmp52, costLimitmp52), costBasemp52, costExpmp52, costLimitmp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypemp53 = "normal"
                costBasemp53 = new Decimal(2).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp53, player.buyableMaxPurchaseable(costTypemp53, player[this.layer].points, costBasemp53, costExpmp53, costLimitmp53), costBasemp53, costExpmp53, costLimitmp53))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp54, player.buyableMaxPurchaseable(costTypemp54, player[this.layer].points, costBasemp54, costExpmp54, costLimitmp54), costBasemp54, costExpmp54, costLimitmp54))}
                    }
                }
            },
        },
        111: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypemp111 = "normal"
                costBasemp111 = new Decimal(1.3).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpmp111 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitmp111 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp111, new Decimal(x), costBasemp111, costExpmp111, costLimitmp111)
            },
            effect(x) {
                effBasemp111 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackmp111 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasemp111, effStackmp111)
            },
            title() { return "metaprestige buyable 111"},
            display() { return "increase base bonus point gain by "+format(effBasemp111)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp111)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp111 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp111, player[this.layer].points, costBasemp111, costExpmp111, costLimitmp111).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp111, player[this.layer].points, costBasemp111, costExpmp111, costLimitmp111))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp111, player.buyableMaxPurchaseable(costTypemp111, player[this.layer].points, costBasemp111, costExpmp111, costLimitmp111), costBasemp111, costExpmp111, costLimitmp111))}
                    }
                }

            },
        },
        112: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypemp112 = "normal"
                costBasemp112 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpmp112 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitmp112 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypemp112, new Decimal(x), costBasemp112, costExpmp112, costLimitmp112)
            },
            effect(x) {
                effBasemp112 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackmp112 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasemp112, effStackmp112)
            },
            title() { return "metaprestige buyable 112"},
            display() { return "add bonus point gain mult by "+format(effBasemp112)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp112)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp112 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp112, player[this.layer].points, costBasemp112, costExpmp112, costLimitmp112).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp112, player[this.layer].points, costBasemp112, costExpmp112, costLimitmp112))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp112, player.buyableMaxPurchaseable(costTypemp112, player[this.layer].points, costBasemp112, costExpmp112, costLimitmp112), costBasemp112, costExpmp112, costLimitmp112))}
                    }
                }
            },
        },
        113: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypemp113 = "asymptote"
                costBasemp113 = new Decimal(1.7)
                costExpmp113 = new Decimal(1.3)
                costLimitmp113 = layers.p.buyables[113].purchaseLimit.add(1)
                return player.buyablePrice(costTypemp113, new Decimal(x), costBasemp113, costExpmp113, costLimitmp113)
            },
            effect(x) {
                effBasemp113 = new Decimal(0.1)
                effStackmp113 = new Decimal(x)

                return Decimal.times(effBasemp113, effStackmp113)
            },
            purchaseLimit: new Decimal(50),
            title() { return "metaprestige buyable 113"},
            display() { return "subtract first bonus point softcap by "+format(effBasemp113)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp113)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp113 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp113, player[this.layer].points, costBasemp113, costExpmp113, costLimitmp113).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp113, player[this.layer].points, costBasemp113, costExpmp113, costLimitmp113))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp113, player.buyableMaxPurchaseable(costTypemp113, player[this.layer].points, costBasemp113, costExpmp113, costLimitmp113), costBasemp113, costExpmp113, costLimitmp113))}
                    }
                }
            },
        },
        114: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypemp114 = "asymptote"
                costBasemp114 = new Decimal(2)
                costExpmp114 = new Decimal(1.5)
                costLimitmp114 = layers.p.buyables[114].purchaseLimit.add(1)
                return player.buyablePrice(costTypemp114, new Decimal(x), costBasemp114, costExpmp114, costLimitmp114)
            },
            effect(x) {
                effBasemp114 = new Decimal(0.2)
                effStackmp114 = new Decimal(x)

                return Decimal.times(effBasemp114, effStackmp114)
            },
            purchaseLimit: new Decimal(200),
            title() { return "metaprestige buyable 114"},
            display() { return "add bonus point coefficent "+format(effBasemp114)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmp114)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemp114 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemp114, player[this.layer].points, costBasemp114, costExpmp114, costLimitmp114).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemp114, player[this.layer].points, costBasemp114, costExpmp114, costLimitmp114))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemp114, player.buyableMaxPurchaseable(costTypemp114, player[this.layer].points, costBasemp114, costExpmp114, costLimitmp114), costBasemp114, costExpmp114, costLimitmp114))}
                    }
                }
            },
        },
    },
})

addLayer("bp", {
    name: "buyabol points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "BP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#40d4db",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "buyabol points", // Name of prestige currency
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
    for (let j = 111; j < 115; j++) {
            if (j == 114||j == 113) {totalPB = totalPB.add(player.p.buyables[j])}
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
        expbp = new Decimal(2)
        expbp = expbp.add(buyableEffect('mp', 43))
        expbp = expbp.add(buyableEffect('bp', 43))
        expbp = expbp.add(buyableEffect('sp', 43))
        expbp = expbp.times(buyableEffect('l', 11)[3][2].times(buyableEffect('l', 11)[2][2]).add(1))
        expbp = expbp.times(buyableEffect('hp', 43))
        expbp = expbp.times(buyableEffect('wrte', 43))  

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
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('bp'))+" buyabol points. Next at "+format(getNextAt('bp'))+" prestige buyables" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "b", description: "B: Reset for buyabol points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
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
            for (let i = 111; i < 115; i++) {
                if (canBuyBuyable('bp', i)) {buyMaxBuyable('bp', i)}
            }
        }
    },
    layerShown(){ //buyable
        realcondition = (totalPBuyables.gte(40)||player.bp.total.gte(1))
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(1.99))
        return realcondition&&(!temporaryhidewr)
    },
    update(diff) {
        if (buyableEffect('wr', 13).row2.eq(0)||getBuyableAmount('wr', 212).lt(2)||player.bp.points.eq(0)) {return;} else {
            unsoftcappedCurrentRepliBuyabolTime = player.bp.points.max(1).ln().div(buyableEffect('wr', 13).row2) //unsoftcapped: dx/xdt = mx
            unsoftcappedNextTickRepliBuyabolTime = unsoftcappedCurrentRepliBuyabolTime.add(diff)
            unsoftcappedRepliBuyabol = unsoftcappedNextTickRepliBuyabolTime.times(buyableEffect('wr', 13).row2).exp()
            addPoints('bp', unsoftcappedRepliBuyabol.sub(player.bp.points))
        }
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypebp11 = "normal"
                costBasebp11 = new Decimal(1.2).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp11 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitbp11 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp11, new Decimal(x), costBasebp11, costExpbp11, costLimitbp11)
            },
            effect(x) {
                effBasebp11 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackbp11 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp11, effStackbp11)
            },
            title() { return "buyabol buyable 11"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp11, player.buyableMaxPurchaseable(costTypebp11, player[this.layer].points, costBasebp11, costExpbp11, costLimitbp11), costBasebp11, costExpbp11, costLimitbp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypebp12 = "normal"
                costBasebp12 = new Decimal(1.4).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp12 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitbp12 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp12, new Decimal(x), costBasebp12, costExpbp12, costLimitbp12)
            },
            effect(x) {
                effBasebp12 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackbp12 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp12, effStackbp12)
            },
            title() { return "buyabol buyable 12"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp12, player.buyableMaxPurchaseable(costTypebp12, player[this.layer].points, costBasebp12, costExpbp12, costLimitbp12), costBasebp12, costExpbp12, costLimitbp12))}
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
            purchaseLimit: new Decimal(50),
            title() { return "buyabol buyable 13"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp13, player.buyableMaxPurchaseable(costTypebp13, player[this.layer].points, costBasebp13, costExpbp13, costLimitbp13), costBasebp13, costExpbp13, costLimitbp13))}
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
            purchaseLimit: new Decimal(50),
            title() { return "buyabol buyable 14"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp14, player.buyableMaxPurchaseable(costTypebp14, player[this.layer].points, costBasebp14, costExpbp14, costLimitbp14), costBasebp14, costExpbp14, costLimitbp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypebp21 = "normal"
                costBasebp21 = new Decimal(1.3).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp21 = new Decimal(1.065).sub(buyableEffect('r', 33))
                costLimitbp21 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp21, new Decimal(x), costBasebp21, costExpbp21, costLimitbp21)
            },
            effect(x) {
                effBasebp21 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackbp21 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp21, effStackbp21)
            },
            title() { return "buyabol buyable 21"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp21, player.buyableMaxPurchaseable(costTypebp21, player[this.layer].points, costBasebp21, costExpbp21, costLimitbp21), costBasebp21, costExpbp21, costLimitbp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypebp22 = "normal"
                costBasebp22 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp22 = new Decimal(1.165).sub(buyableEffect('r', 33))
                costLimitbp22 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp22, new Decimal(x), costBasebp22, costExpbp22, costLimitbp22)
            },
            effect(x) {
                effBasebp22 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackbp22 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp22, effStackbp22)
            },
            title() { return "buyabol buyable 22"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp22, player.buyableMaxPurchaseable(costTypebp22, player[this.layer].points, costBasebp22, costExpbp22, costLimitbp22), costBasebp22, costExpbp22, costLimitbp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypebp23 = "normal"
                costBasebp23 = new Decimal(1.7).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp23 = new Decimal(1.365).sub(buyableEffect('r', 33))
                costLimitbp23 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp23, new Decimal(x), costBasebp23, costExpbp23, costLimitbp23)
            },
            effect(x) {
                effBasebp23 = new Decimal(0.2).times(buyableEffect('l', 22))
                effStackbp23 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp23, effStackbp23)
            },
            title() { return "buyabol buyable 23"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp23, player.buyableMaxPurchaseable(costTypebp23, player[this.layer].points, costBasebp23, costExpbp23, costLimitbp23), costBasebp23, costExpbp23, costLimitbp23))}
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
            title() { return "buyabol buyable 24"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp24, player.buyableMaxPurchaseable(costTypebp24, player[this.layer].points, costBasebp24, costExpbp24, costLimitbp24), costBasebp24, costExpbp24, costLimitbp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypebp31 = "normal"
                costBasebp31 = new Decimal(1.45).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp31 = new Decimal(1.065).sub(buyableEffect('r', 33))
                costLimitbp31 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp31, new Decimal(x), costBasebp31, costExpbp31, costLimitbp31)
            },
            effect(x) {
                effBasebp31 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackbp31 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp31, effStackbp31)
            },
            title() { return "buyabol buyable 31"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp31, player.buyableMaxPurchaseable(costTypebp31, player[this.layer].points, costBasebp31, costExpbp31, costLimitbp31), costBasebp31, costExpbp31, costLimitbp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypebp32 = "normal"
                costBasebp32 = new Decimal(1.65).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp32 = new Decimal(1.165).sub(buyableEffect('r', 33))
                costLimitbp32 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp32, new Decimal(x), costBasebp32, costExpbp32, costLimitbp32)
            },
            effect(x) {
                effBasebp32 = new Decimal(0.05).times(buyableEffect('l', 21))
                effStackbp32 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp32, effStackbp32)
            },
            title() { return "buyabol buyable 32"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp32, player.buyableMaxPurchaseable(costTypebp32, player[this.layer].points, costBasebp32, costExpbp32, costLimitbp32), costBasebp32, costExpbp32, costLimitbp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypebp33 = "normal"
                costBasebp33 = new Decimal(1.85).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp33 = new Decimal(1.365).sub(buyableEffect('r', 33))
                costLimitbp33 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp33, new Decimal(x), costBasebp33, costExpbp33, costLimitbp33)
            },
            effect(x) {
                effBasebp33 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackbp33 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp33, effStackbp33)
            },
            title() { return "buyabol buyable 33"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp33, player.buyableMaxPurchaseable(costTypebp33, player[this.layer].points, costBasebp33, costExpbp33, costLimitbp33), costBasebp33, costExpbp33, costLimitbp33))}
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
            title() { return "buyabol buyable 34"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp34, player.buyableMaxPurchaseable(costTypebp34, player[this.layer].points, costBasebp34, costExpbp34, costLimitbp34), costBasebp34, costExpbp34, costLimitbp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypebp41 = "normal"
                costBasebp41 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp41 = new Decimal(1.065).sub(buyableEffect('r', 33))
                costLimitbp41 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp41, new Decimal(x), costBasebp41, costExpbp41, costLimitbp41)
            },
            effect(x) {
                effBasebp41 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackbp41 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp41, effStackbp41)
            },
            title() { return "buyabol buyable 41"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp41, player.buyableMaxPurchaseable(costTypebp41, player[this.layer].points, costBasebp41, costExpbp41, costLimitbp41), costBasebp41, costExpbp41, costLimitbp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypebp42 = "normal"
                costBasebp42 = new Decimal(1.7).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp42 = new Decimal(1.165).sub(buyableEffect('r', 33))
                costLimitbp42 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp42, new Decimal(x), costBasebp42, costExpbp42, costLimitbp42)
            },
            effect(x) {
                effBasebp42 = new Decimal(0.0025).times(buyableEffect('l', 21))
                effStackbp42 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp42, effStackbp42)
            },
            title() { return "buyabol buyable 42"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp42, player.buyableMaxPurchaseable(costTypebp42, player[this.layer].points, costBasebp42, costExpbp42, costLimitbp42), costBasebp42, costExpbp42, costLimitbp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypebp43 = "normal"
                costBasebp43 = new Decimal(1.9).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp43 = new Decimal(1.365).sub(buyableEffect('r', 33))
                costLimitbp43 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp43, new Decimal(x), costBasebp43, costExpbp43, costLimitbp43)
            },
            effect(x) {
                effBasebp43 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackbp43 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp43, effStackbp43)
            },
            title() { return "buyabol buyable 43"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp43, player.buyableMaxPurchaseable(costTypebp43, player[this.layer].points, costBasebp43, costExpbp43, costLimitbp43), costBasebp43, costExpbp43, costLimitbp43))}
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
            title() { return "buyabol buyable 44"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp44, player.buyableMaxPurchaseable(costTypebp44, player[this.layer].points, costBasebp44, costExpbp44, costLimitbp44), costBasebp44, costExpbp44, costLimitbp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypebp51 = "normal"
                costBasebp51 = new Decimal(1.55).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp51 = new Decimal(1.065).sub(buyableEffect('r', 33))
                costLimitbp51 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp51, new Decimal(x), costBasebp51, costExpbp51, costLimitbp51)
            },
            effect(x) {
                effBasebp51 = new Decimal(0.2).times(buyableEffect('l', 21))
                effStackbp51 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp51, effStackbp51)
            },
            title() { return "buyabol buyable 51"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp51, player.buyableMaxPurchaseable(costTypebp51, player[this.layer].points, costBasebp51, costExpbp51, costLimitbp51), costBasebp51, costExpbp51, costLimitbp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypebp52 = "normal"
                costBasebp52 = new Decimal(1.75).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp52 = new Decimal(1.165).sub(buyableEffect('r', 33))
                costLimitbp52 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp52, new Decimal(x), costBasebp52, costExpbp52, costLimitbp52)
            },
            effect(x) {
                effBasebp52 = new Decimal(0.05).times(buyableEffect('l', 21))
                effStackbp52 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp52, effStackbp52)
            },
            title() { return "buyabol buyable 52"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp52, player.buyableMaxPurchaseable(costTypebp52, player[this.layer].points, costBasebp52, costExpbp52, costLimitbp52), costBasebp52, costExpbp52, costLimitbp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypebp53 = "normal"
                costBasebp53 = new Decimal(1.95).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp53 = new Decimal(1.365).sub(buyableEffect('r', 33))
                costLimitbp53 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp53, new Decimal(x), costBasebp53, costExpbp53, costLimitbp53)
            },
            effect(x) {
                effBasebp53 = new Decimal(0.1).times(buyableEffect('l', 22))
                effStackbp53 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp53, effStackbp53)
            },
            title() { return "buyabol buyable 53"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp53, player.buyableMaxPurchaseable(costTypebp53, player[this.layer].points, costBasebp53, costExpbp53, costLimitbp53), costBasebp53, costExpbp53, costLimitbp53))}
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
            title() { return "buyabol buyable 54"},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp54, player.buyableMaxPurchaseable(costTypebp54, player[this.layer].points, costBasebp54, costExpbp54, costLimitbp54), costBasebp54, costExpbp54, costLimitbp54))}
                    }
                }
            },
        },
        111: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypebp111 = "normal"
                costBasebp111 = new Decimal(1.3).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp111 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitbp111 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp111, new Decimal(x), costBasebp111, costExpbp111, costLimitbp111)
            },
            effect(x) {
                effBasebp111 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackbp111 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp111, effStackbp111)
            },
            title() { return "buyabol buyable 111"},
            display() { return "increase base bonus point gain by "+format(effBasebp111)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp111)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp111 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp111, player[this.layer].points, costBasebp111, costExpbp111, costLimitbp111).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp111, player[this.layer].points, costBasebp111, costExpbp111, costLimitbp111))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp111, player.buyableMaxPurchaseable(costTypebp111, player[this.layer].points, costBasebp111, costExpbp111, costLimitbp111), costBasebp111, costExpbp111, costLimitbp111))}
                    }
                }

            },
        },
        112: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypebp112 = "normal"
                costBasebp112 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpbp112 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitbp112 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypebp112, new Decimal(x), costBasebp112, costExpbp112, costLimitbp112)
            },
            effect(x) {
                effBasebp112 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStackbp112 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasebp112, effStackbp112)
            },
            title() { return "buyabol buyable 112"},
            display() { return "add bonus point gain mult by "+format(effBasebp112)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp112)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp112 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp112, player[this.layer].points, costBasebp112, costExpbp112, costLimitbp112).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp112, player[this.layer].points, costBasebp112, costExpbp112, costLimitbp112))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp112, player.buyableMaxPurchaseable(costTypebp112, player[this.layer].points, costBasebp112, costExpbp112, costLimitbp112), costBasebp112, costExpbp112, costLimitbp112))}
                    }
                }
            },
        },
        113: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypebp113 = "asymptote"
                costBasebp113 = new Decimal(1.7)
                costExpbp113 = new Decimal(1.3)
                costLimitbp113 = layers.p.buyables[113].purchaseLimit.add(1)
                return player.buyablePrice(costTypebp113, new Decimal(x), costBasebp113, costExpbp113, costLimitbp113)
            },
            effect(x) {
                effBasebp113 = new Decimal(0.1)
                effStackbp113 = new Decimal(x)

                return Decimal.times(effBasebp113, effStackbp113)
            },
            purchaseLimit: new Decimal(50),
            title() { return "buyabol buyable 113"},
            display() { return "subtract first bonus point softcap by "+format(effBasebp113)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp113)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp113 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp113, player[this.layer].points, costBasebp113, costExpbp113, costLimitbp113).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp113, player[this.layer].points, costBasebp113, costExpbp113, costLimitbp113))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp113, player.buyableMaxPurchaseable(costTypebp113, player[this.layer].points, costBasebp113, costExpbp113, costLimitbp113), costBasebp113, costExpbp113, costLimitbp113))}
                    }
                }
            },
        },
        114: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypebp114 = "asymptote"
                costBasebp114 = new Decimal(2)
                costExpbp114 = new Decimal(1.5)
                costLimitbp114 = layers.p.buyables[114].purchaseLimit.add(1)
                return player.buyablePrice(costTypebp114, new Decimal(x), costBasebp114, costExpbp114, costLimitbp114)
            },
            effect(x) {
                effBasebp114 = new Decimal(0.2)
                effStackbp114 = new Decimal(x)

                return Decimal.times(effBasebp114, effStackbp114)
            },
            purchaseLimit: new Decimal(200),
            title() { return "buyabol buyable 114"},
            display() { return "add bonus point coefficent "+format(effBasebp114)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackbp114)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypebp114 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypebp114, player[this.layer].points, costBasebp114, costExpbp114, costLimitbp114).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypebp114, player[this.layer].points, costBasebp114, costExpbp114, costLimitbp114))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypebp114, player.buyableMaxPurchaseable(costTypebp114, player[this.layer].points, costBasebp114, costExpbp114, costLimitbp114), costBasebp114, costExpbp114, costLimitbp114))}
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
        expsp = new Decimal(2)
        expsp = expsp.add(buyableEffect('mp', 53))
        expsp = expsp.add(buyableEffect('bp', 53))
        expsp = expsp.add(buyableEffect('sp', 53))
        expsp = expsp.times(buyableEffect('l', 11)[3][2].times(buyableEffect('l', 11)[2][2]).add(1))
        expsp = expsp.times(buyableEffect('hp', 53))
        expsp = expsp.times(buyableEffect('wrte', 53))        

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
            for (let i = 111; i < 115; i++) {
                if (canBuyBuyable('sp', i)) {buyMaxBuyable('sp', i)}
            }
        }
    },
    doReset(resettingLayer) { //superprsetige
        actualRow = 2
        if (hasMilestone('m', 8)) {actualRow = 4}
        if (layers[resettingLayer].row > actualRow) {layerDataReset(this.layer, [])}
    },
    layerShown(){//superprestige
        realcondition = (player.points.gte(2)||player.sp.total.gte(1))
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(1.99))
        return realcondition&&(!temporaryhidewr)
    },
    update(diff) {
        if (buyableEffect('wr', 13).row2.eq(0)||getBuyableAmount('wr', 212).lt(2)||player.sp.points.eq(0)) {return;} else {
            unsoftcappedCurrentRepliSuperprestigeTime = player.sp.points.max(1).ln().div(buyableEffect('wr', 13).row2) //unsoftcapped: dx/xdt = mx
            unsoftcappedNextTickRepliSuperprestigeTime = unsoftcappedCurrentRepliSuperprestigeTime.add(diff)
            unsoftcappedRepliSuperprestige = unsoftcappedNextTickRepliSuperprestigeTime.times(buyableEffect('wr', 13).row2).exp()
            addPoints('sp', unsoftcappedRepliSuperprestige.sub(player.sp.points))
        }
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
                costTypesp11 = "normal"
                costBasesp11 = new Decimal(1.2).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp11, player.buyableMaxPurchaseable(costTypesp11, player[this.layer].points, costBasesp11, costExpsp11, costLimitsp11), costBasesp11, costExpsp11, costLimitsp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) {
                costTypesp12 = "normal"
                costBasesp12 = new Decimal(1.4).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp12, player.buyableMaxPurchaseable(costTypesp12, player[this.layer].points, costBasesp12, costExpsp12, costLimitsp12), costBasesp12, costExpsp12, costLimitsp12))}
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
            purchaseLimit: new Decimal(50),
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp13, player.buyableMaxPurchaseable(costTypesp13, player[this.layer].points, costBasesp13, costExpsp13, costLimitsp13), costBasesp13, costExpsp13, costLimitsp13))}
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
            purchaseLimit: new Decimal(50),
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp14, player.buyableMaxPurchaseable(costTypesp14, player[this.layer].points, costBasesp14, costExpsp14, costLimitsp14), costBasesp14, costExpsp14, costLimitsp14))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) {
                costTypesp21 = "normal"
                costBasesp21 = new Decimal(1.3).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp21, player.buyableMaxPurchaseable(costTypesp21, player[this.layer].points, costBasesp21, costExpsp21, costLimitsp21), costBasesp21, costExpsp21, costLimitsp21))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) {
                costTypesp22 = "normal"
                costBasesp22 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp22, player.buyableMaxPurchaseable(costTypesp22, player[this.layer].points, costBasesp22, costExpsp22, costLimitsp22), costBasesp22, costExpsp22, costLimitsp22))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypesp23 = "normal"
                costBasesp23 = new Decimal(1.7).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp23, player.buyableMaxPurchaseable(costTypesp23, player[this.layer].points, costBasesp23, costExpsp23, costLimitsp23), costBasesp23, costExpsp23, costLimitsp23))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp24, player.buyableMaxPurchaseable(costTypesp24, player[this.layer].points, costBasesp24, costExpsp24, costLimitsp24), costBasesp24, costExpsp24, costLimitsp24))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) {
                costTypesp31 = "normal"
                costBasesp31 = new Decimal(1.4).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp31, player.buyableMaxPurchaseable(costTypesp31, player[this.layer].points, costBasesp31, costExpsp31, costLimitsp31), costBasesp31, costExpsp31, costLimitsp31))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) {
                costTypesp32 = "normal"
                costBasesp32 = new Decimal(1.6).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp32, player.buyableMaxPurchaseable(costTypesp32, player[this.layer].points, costBasesp32, costExpsp32, costLimitsp32), costBasesp32, costExpsp32, costLimitsp32))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypesp33 = "normal"
                costBasesp33 = new Decimal(1.8).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp33, player.buyableMaxPurchaseable(costTypesp33, player[this.layer].points, costBasesp33, costExpsp33, costLimitsp33), costBasesp33, costExpsp33, costLimitsp33))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp34, player.buyableMaxPurchaseable(costTypesp34, player[this.layer].points, costBasesp34, costExpsp34, costLimitsp34), costBasesp34, costExpsp34, costLimitsp34))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) {
                costTypesp41 = "normal"
                costBasesp41 = new Decimal(1.45).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp41, player.buyableMaxPurchaseable(costTypesp41, player[this.layer].points, costBasesp41, costExpsp41, costLimitsp41), costBasesp41, costExpsp41, costLimitsp41))}
                    }
                }
            },
        },
        42: {
            unlocked() {return true},
            cost(x) {
                costTypesp42 = "normal"
                costBasesp42 = new Decimal(1.65).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp42, player.buyableMaxPurchaseable(costTypesp42, player[this.layer].points, costBasesp42, costExpsp42, costLimitsp42), costBasesp42, costExpsp42, costLimitsp42))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypesp43 = "normal"
                costBasesp43 = new Decimal(1.85).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp43, player.buyableMaxPurchaseable(costTypesp43, player[this.layer].points, costBasesp43, costExpsp43, costLimitsp43), costBasesp43, costExpsp43, costLimitsp43))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp44, player.buyableMaxPurchaseable(costTypesp44, player[this.layer].points, costBasesp44, costExpsp44, costLimitsp44), costBasesp44, costExpsp44, costLimitsp44))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) {
                costTypesp51 = "normal"
                costBasesp51 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp51, player.buyableMaxPurchaseable(costTypesp51, player[this.layer].points, costBasesp51, costExpsp51, costLimitsp51), costBasesp51, costExpsp51, costLimitsp51))}
                    }
                }
            },
        },
        52: {
            unlocked() {return true},
            cost(x) {
                costTypesp52 = "normal"
                costBasesp52 = new Decimal(1.7).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp52, player.buyableMaxPurchaseable(costTypesp52, player[this.layer].points, costBasesp52, costExpsp52, costLimitsp52), costBasesp52, costExpsp52, costLimitsp52))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypesp53 = "normal"
                costBasesp53 = new Decimal(1.9).sub(1).div(buyableEffect('r', 31)).add(1)
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp53, player.buyableMaxPurchaseable(costTypesp53, player[this.layer].points, costBasesp53, costExpsp53, costLimitsp53), costBasesp53, costExpsp53, costLimitsp53))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp54, player.buyableMaxPurchaseable(costTypesp54, player[this.layer].points, costBasesp54, costExpsp54, costLimitsp54), costBasesp54, costExpsp54, costLimitsp54))}
                    }
                }
            },
        },
        111: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypesp111 = "normal"
                costBasesp111 = new Decimal(1.3).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpsp111 = new Decimal(1.1).sub(buyableEffect('r', 33))
                costLimitsp111 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp111, new Decimal(x), costBasesp111, costExpsp111, costLimitsp111)
            },
            effect(x) {
                effBasesp111 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStacksp111 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasesp111, effStacksp111)
            },
            title() { return "superprestige buyable 111"},
            display() { return "increase base bonus point gain by "+format(effBasesp111)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp111)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp111 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp111, player[this.layer].points, costBasesp111, costExpsp111, costLimitsp111).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp111, player[this.layer].points, costBasesp111, costExpsp111, costLimitsp111))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp111, player.buyableMaxPurchaseable(costTypesp111, player[this.layer].points, costBasesp111, costExpsp111, costLimitsp111), costBasesp111, costExpsp111, costLimitsp111))}
                    }
                }

            },
        },
        112: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypesp112 = "normal"
                costBasesp112 = new Decimal(1.5).sub(1).div(buyableEffect('r', 31)).add(1)
                costExpsp112 = new Decimal(1.2).sub(buyableEffect('r', 33))
                costLimitsp112 = player.row2normalBuyableSoftcap()
                return player.buyablePrice(costTypesp112, new Decimal(x), costBasesp112, costExpsp112, costLimitsp112)
            },
            effect(x) {
                effBasesp112 = new Decimal(0.1).times(buyableEffect('l', 21))
                effStacksp112 = new Decimal(x).pow(buyableEffect('l', 23)).pow(buyableEffect('mtp', 23))

                return Decimal.times(effBasesp112, effStacksp112)
            },
            title() { return "superprestige buyable 112"},
            display() { return "add bonus point gain mult by "+format(effBasesp112)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp112)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp112 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp112, player[this.layer].points, costBasesp112, costExpsp112, costLimitsp112).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp112, player[this.layer].points, costBasesp112, costExpsp112, costLimitsp112))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp112, player.buyableMaxPurchaseable(costTypesp112, player[this.layer].points, costBasesp112, costExpsp112, costLimitsp112), costBasesp112, costExpsp112, costLimitsp112))}
                    }
                }
            },
        },
        113: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypesp113 = "asymptote"
                costBasesp113 = new Decimal(1.7)
                costExpsp113 = new Decimal(1.3)
                costLimitsp113 = layers.p.buyables[113].purchaseLimit.add(1)
                return player.buyablePrice(costTypesp113, new Decimal(x), costBasesp113, costExpsp113, costLimitsp113)
            },
            effect(x) {
                effBasesp113 = new Decimal(0.1)
                effStacksp113 = new Decimal(x)

                return Decimal.times(effBasesp113, effStacksp113)
            },
            purchaseLimit: new Decimal(50),
            title() { return "superprestige buyable 113"},
            display() { return "subtract first bonus point softcap by "+format(effBasesp113)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp113)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp113 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp113, player[this.layer].points, costBasesp113, costExpsp113, costLimitsp113).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp113, player[this.layer].points, costBasesp113, costExpsp113, costLimitsp113))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp113, player.buyableMaxPurchaseable(costTypesp113, player[this.layer].points, costBasesp113, costExpsp113, costLimitsp113), costBasesp113, costExpsp113, costLimitsp113))}
                    }
                }
            },
        },
        114: {
            unlocked() {return hasMilestone('m', 0)},
            cost(x) {
                costTypesp114 = "asymptote"
                costBasesp114 = new Decimal(2)
                costExpsp114 = new Decimal(1.5)
                costLimitsp114 = layers.p.buyables[114].purchaseLimit.add(1)
                return player.buyablePrice(costTypesp114, new Decimal(x), costBasesp114, costExpsp114, costLimitsp114)
            },
            effect(x) {
                effBasesp114 = new Decimal(0.2)
                effStacksp114 = new Decimal(x)

                return Decimal.times(effBasesp114, effStacksp114)
            },
            purchaseLimit: new Decimal(200),
            title() { return "superprestige buyable 114"},
            display() { return "add bonus point coefficent "+format(effBasesp114)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStacksp114)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesp114 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesp114, player[this.layer].points, costBasesp114, costExpsp114, costLimitsp114).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesp114, player[this.layer].points, costBasesp114, costExpsp114, costLimitsp114))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypesp114, player.buyableMaxPurchaseable(costTypesp114, player[this.layer].points, costBasesp114, costExpsp114, costLimitsp114), costBasesp114, costExpsp114, costLimitsp114))}
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
    layerShown(){ //hyperprest
        realcondition = player.points.gte(5)||player.hp.total.gte(1)
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(4.99))
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
        14: {
            unlocked() {return true},
            cost(x) {
                costTypehp14 = "asymptote"
                costBasehp14 = new Decimal(1.1)
                costExphp14 = new Decimal(1.03)
                costLimithp14 = layers.hp.buyables[14].purchaseLimit.add(1)
                return player.buyablePrice(costTypehp14, new Decimal(x), costBasehp14, costExphp14, costLimithp14)
            },
            effect(x) {
                effBasehp14 = new Decimal(0.1)
                effStackhp14 = new Decimal(x)

                return Decimal.times(effBasehp14, effStackhp14)
            },
            purchaseLimit: new Decimal(50),
            title() { return "hyperprestige buyable 14"},
            display() { return "subtract second point softcap by "+format(effBasehp14)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp14)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp14 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp14, player[this.layer].points, costBasehp14, costExphp14, costLimithp14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp14, player[this.layer].points, costBasehp14, costExphp14, costLimithp14))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp14, player.buyableMaxPurchaseable(costTypehp14, player[this.layer].points, costBasehp14, costExphp14, costLimithp14), costBasehp14, costExphp14, costLimithp14))}
                    }
                }
            },
        },
        15: {
            unlocked() {return true},
            cost(x) {
                costTypehp15 = "normal"
                costBasehp15 = new Decimal(1.3)
                costExphp15 = new Decimal(1.1)
                costLimithp15 = new Decimal('e200')
                return player.buyablePrice(costTypehp15, new Decimal(x), costBasehp15, costExphp15, costLimithp15)
            },
            effect(x) {
                effBasehp15 = new Decimal(0.05)
                effStackhp15 = new Decimal(x)

                return Decimal.times(effBasehp15, effStackhp15)
            },
            title() { return "hyperprestige buyable 15"},
            display() { return "increase point gain exponent by "+format(effBasehp15)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp15)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp15 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp15, player[this.layer].points, costBasehp15, costExphp15, costLimithp15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp15, player[this.layer].points, costBasehp15, costExphp15, costLimithp15))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp15, player.buyableMaxPurchaseable(costTypehp15, player[this.layer].points, costBasehp15, costExphp15, costLimithp15), costBasehp15, costExphp15, costLimithp15))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp23, player.buyableMaxPurchaseable(costTypehp23, player[this.layer].points, costBasehp23, costExphp23, costLimithp23), costBasehp23, costExphp23, costLimithp23))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp33, player.buyableMaxPurchaseable(costTypehp33, player[this.layer].points, costBasehp33, costExphp33, costLimithp33), costBasehp33, costExphp33, costLimithp33))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp43, player.buyableMaxPurchaseable(costTypehp43, player[this.layer].points, costBasehp43, costExphp43, costLimithp43), costBasehp43, costExphp43, costLimithp43))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp53, player.buyableMaxPurchaseable(costTypehp53, player[this.layer].points, costBasehp53, costExphp53, costLimithp53), costBasehp53, costExphp53, costLimithp53))}
                    }
                }
            },
        },   
        114: {
            unlocked() {return true},
            cost(x) {
                costTypehp114 = "asymptote"
                costBasehp114 = new Decimal(1.2)
                costExphp114 = new Decimal(1.1)
                costLimithp114 = layers.hp.buyables[114].purchaseLimit.add(1)
                return player.buyablePrice(costTypehp114, new Decimal(x), costBasehp114, costExphp114, costLimithp114)
            },
            effect(x) {
                effBasehp114 = new Decimal(0.1)
                effStackhp114 = new Decimal(x)

                return Decimal.times(effBasehp114, effStackhp114)
            },
            purchaseLimit: new Decimal(200),
            title() { return "hyperprestige buyable 114"},
            display() { return "subtract second bonus point softcap by "+format(effBasehp114)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp114)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp114 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp114, player[this.layer].points, costBasehp114, costExphp114, costLimithp114).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp114, player[this.layer].points, costBasehp114, costExphp114, costLimithp114))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp114, player.buyableMaxPurchaseable(costTypehp114, player[this.layer].points, costBasehp114, costExphp114, costLimithp114), costBasehp114, costExphp114, costLimithp114))}
                    }
                }
            },
        },
        116: {
            unlocked() {return true},
            cost(x) {
                costTypehp116 = "asymptote"
                costBasehp116 = new Decimal(1.15)
                costExphp116 = new Decimal(1.1)
                costLimithp116 = layers.hp.buyables[116].purchaseLimit.add(1)
                return player.buyablePrice(costTypehp116, new Decimal(x), costBasehp116, costExphp116, costLimithp116)
            },
            effect(x) {
                effBasehp116 = new Decimal(0.1)
                effStackhp116 = new Decimal(x)

                return Decimal.times(effBasehp116, effStackhp116)
            },
            purchaseLimit: new Decimal(400),
            title() { return "hyperprestige buyable 116"},
            display() { return "subtract third bonus point softcap by "+format(effBasehp116)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackhp116)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypehp116 == "asymptote")||player[this.layer].points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypehp116, player[this.layer].points, costBasehp116, costExphp116, costLimithp116).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypehp116, player[this.layer].points, costBasehp116, costExphp116, costLimithp116))
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypehp116, player.buyableMaxPurchaseable(costTypehp116, player[this.layer].points, costBasehp116, costExphp116, costLimithp116), costBasehp116, costExphp116, costLimithp116))}
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
    layerShown(){ //reesearc
        realcondition = player.hp.total.gte(1)
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(4.99))
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
            purchaseLimit: new Decimal(18),
            cost(x) {
                costBaseTimer31 = new Decimal(1.5)
                costBaseMoneyr31 = new Decimal(2)
                costMultRMinr31 = new Decimal(15)
                costMultMoneyr31 = new Decimal(25000)
                return [costBaseTimer31.pow(x).times(costMultRMinr31).round(), costBaseMoneyr31.pow(x).times(costMultMoneyr31).round()]
            },
            effect(x) {
                effBaser31 = new Decimal(0.05)
                effStackr31 = new Decimal(x)

                {return Decimal.dOne.sub(Decimal.times(effBaser31, effStackr31))}
            },
            title() { return "research buyable 31"},
            display() { return "divide row 1 to 2 unlimited buyable cost base by "+format(effBaser31)+" <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr31)+"/20.00 <br> effect: "+format(this.effect())},
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
                effBaser32 = new Decimal(0.2)
                effStackr32 = new Decimal(x)

                return Decimal.times(effBaser32, effStackr32)
            },
            title() { return "research buyable 32"},
            display() { return "increase bonus point coefficient multiplier by "+format(effBaser32)+" <br> cost: "+formatTime(this.cost()[0].times(60))+" research points, $"+format(this.cost()[1])+" <br> owned: "+format(effStackr32)+"/20.00 <br> effect: "+format(this.effect())},
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

                return Decimal.pow(effStackr53, 12).round()
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
            display() { return "The magical truck is ready, but you need to be strong enough to be successfully transported instead of destroyed.<br> requires: 6.00 points"},
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
    layerShown(){ //mtp
        realcondition = getBuyableAmount('r', 53).gte(1)
        temporaryhidewr = (getBuyableAmount('r', 54).gte(1))||(player.wr.total.gte(1)&&getBuyableAmount('wr', 211).lte(4.99))
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp11, player.buyableMaxPurchaseable(costTypemtp11, player[this.layer].points, costBasemtp11, costExpmtp11, costLimitmtp11), costBasemtp11, costExpmtp11, costLimitmtp11))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp12, player.buyableMaxPurchaseable(costTypemtp12, player[this.layer].points, costBasemtp12, costExpmtp12, costLimitmtp12), costBasemtp12, costExpmtp12, costLimitmtp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) {
                costTypemtp13 = "asymptote"
                costBasemtp13 = new Decimal(1.2)
                costExpmtp13 = new Decimal(1.1)
                costLimitmtp13 = layers.mtp.buyables[13].purchaseLimit.add(1)
                return player.buyablePrice(costTypemtp13, new Decimal(x), costBasemtp13, costExpmtp13, costLimitmtp13)
            },
            effect(x) {
                effBasemtp13 = new Decimal(0.1)
                effStackmtp13 = new Decimal(x)

                return Decimal.times(effBasemtp13, effStackmtp13)
            },
            purchaseLimit: new Decimal(400),
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp13, player.buyableMaxPurchaseable(costTypemtp13, player[this.layer].points, costBasemtp13, costExpmtp13, costLimitmtp13), costBasemtp13, costExpmtp13, costLimitmtp13))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp21, player.buyableMaxPurchaseable(costTypemtp21, player[this.layer].points, costBasemtp21, costExpmtp21, costLimitmtp21), costBasemtp21, costExpmtp21, costLimitmtp21))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp22, player.buyableMaxPurchaseable(costTypemtp22, player[this.layer].points, costBasemtp22, costExpmtp22, costLimitmtp22), costBasemtp22, costExpmtp22, costLimitmtp22))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp23, player.buyableMaxPurchaseable(costTypemtp23, player[this.layer].points, costBasemtp23, costExpmtp23, costLimitmtp23), costBasemtp23, costExpmtp23, costLimitmtp23))}
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp31, player.buyableMaxPurchaseable(costTypemtp31, player[this.layer].points, costBasemtp31, costExpmtp31, costLimitmtp31), costBasemtp31, costExpmtp31, costLimitmtp31))}
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
            display() { return "add bonus points coefficient multiplier by "+format(effBasemtp32)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp32)+" <br> effect: "+format(this.effect())},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp32, player.buyableMaxPurchaseable(costTypemtp32, player[this.layer].points, costBasemtp32, costExpmtp32, costLimitmtp32), costBasemtp32, costExpmtp32, costLimitmtp32))}
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
            display() { return "multiply the effective common and rare scrap count by "+format(effBasemtp33)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(effStackmtp33)+" <br> effect: "+format(this.effect())},
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
                        if (player[this.layer].points.lt('e100')) {player[this.layer].points = player[this.layer].points.sub(player.buyablePrice(costTypemtp33, player.buyableMaxPurchaseable(costTypemtp33, player[this.layer].points, costBasemtp33, costExpmtp33, costLimitmtp33), costBasemtp33, costExpmtp33, costLimitmtp33))}
                    }
                }
            },
        },
    },
})

addLayer("wr", {
    name: "World Replication", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "WR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return getBuyableAmount('r', 54).gte(1)},
		points: new Decimal(0),

    }},
    color: "#ff6060",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "world replication", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addwr = new Decimal(-5)


        multwr = new Decimal(1)

        basemultrepli = new Decimal(0.2)
        basemultrepli = basemultrepli.add(buyableEffect('wr', 121))
        basemultrepli = basemultrepli.add(buyableEffect('wrp', 121))
        basemultrepli = basemultrepli.add(buyableEffect('wrmp', 121))
        basemultrepli = basemultrepli.add(buyableEffect('wrbp', 121))
        basemultrepli = basemultrepli.add(buyableEffect('wrsp', 121))


        multreplimult = new Decimal(0.2)
        multreplimult = multreplimult.add(buyableEffect('wr', 122))
        multreplimult = multreplimult.add(buyableEffect('wrp', 122))
        multreplimult = multreplimult.add(buyableEffect('wrmp', 122))
        multreplimult = multreplimult.add(buyableEffect('wrbp', 122))
        multreplimult = multreplimult.add(buyableEffect('wrsp', 122))

        multreplishare = basemultrepli.times(multreplimult).times(buyableEffect('wr', 11))
        
        multreplionly = multreplishare.times(buyableEffect('wr', 141)).times(buyableEffect('wr', 142)).times(buyableEffect('wr', 143)).times(buyableEffect('wr', 144)).times(buyableEffect('wr', 145))

        firstRepliSoftcapStart = new Decimal(1)
        firstRepliSoftcapStart = firstRepliSoftcapStart.times(buyableEffect('wr', 123))
        firstRepliSoftcapStart = firstRepliSoftcapStart.times(buyableEffect('wrp', 123))
        firstRepliSoftcapStart = firstRepliSoftcapStart.times(buyableEffect('wrmp', 123))
        firstRepliSoftcapStart = firstRepliSoftcapStart.times(buyableEffect('wrbp', 123))
        firstRepliSoftcapStart = firstRepliSoftcapStart.times(buyableEffect('wrsp', 123))


        firstRepliSoftcapStrengthInverse = new Decimal(2) 
        firstRepliSoftcapStrengthInverse = firstRepliSoftcapStrengthInverse.add(buyableEffect('wr', 124))
        firstRepliSoftcapStrengthInverse = firstRepliSoftcapStrengthInverse.add(buyableEffect('wrp', 124))
        firstRepliSoftcapStrengthInverse = firstRepliSoftcapStrengthInverse.add(buyableEffect('wrmp', 124))
        firstRepliSoftcapStrengthInverse = firstRepliSoftcapStrengthInverse.add(buyableEffect('wrbp', 124))
        firstRepliSoftcapStrengthInverse = firstRepliSoftcapStrengthInverse.add(buyableEffect('wrsp', 124))
 
        firstRepliSoftcapStrengthInverse = firstRepliSoftcapStrengthInverse.times(buyableEffect('wrte', 125))

        firstRepliSoftcapStrength = firstRepliSoftcapStrengthInverse.pow(-1)

        firstRepliPenalty = player.wr.buyables[11].div(firstRepliSoftcapStart).max(1).pow(firstRepliSoftcapStrength)

        totalRepliPenalty = firstRepliPenalty //times(1) replace with later softcaps

        multrepliAfterPenalty = multreplionly.div(totalRepliPenalty)

        return multwr
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expwr = new Decimal(1)


        exp2wr = new Decimal(1)

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
    canReset() {return getResetGain('wr').gte(0)},
    doReset(resettingLayer) {
        if (layers[resettingLayer].row > this.row) {
        layerDataReset("wr", [])
        }
        if (layers[resettingLayer].row >= this.row) {
        setBuyableAmount('wr', 11, new Decimal(1))
        }

    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('wr'))+" world replicants. Next at "+format(getNextAt('wr'))+" points" },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "w", description: "W: Reset for world replicants", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    update(diff) {
        if (multreplionly.eq(0)||player.wr.buyables[11].lte(0)) {return;} else {
            unsoftcappedCurrentRepliTime = player.wr.buyables[11].ln().div(multreplionly) //unsoftcapped: dx/xdt = mx
            unsoftcappedNextTickRepliTime = unsoftcappedCurrentRepliTime.add(diff)
            unsoftcappedRepli = unsoftcappedNextTickRepliTime.times(multreplionly).exp()
            if (unsoftcappedRepli.lt(firstRepliSoftcapStart)) {
                setBuyableAmount('wr', 11, unsoftcappedNextTickRepliTime.times(multreplionly).exp().max(1))                
            }
            else {
                currentRepliTime = player.wr.buyables[11].div(firstRepliSoftcapStart).pow(firstRepliSoftcapStrength).div(multreplionly).div(firstRepliSoftcapStrength) // softcapped: dx/dt = m * s^(p) * x^(1-p) where m = multiplier, s = start , p = strength in positive, x = Repli amount, t = game time 
                nextTickRepliTime = currentRepliTime.add(diff)      
                setBuyableAmount('wr', 11, multreplionly.times(firstRepliSoftcapStrength).times(nextTickRepliTime).pow(firstRepliSoftcapStrength.pow(-1)).times(firstRepliSoftcapStart).max(1))
            }
        }
    },
    layerShown(){return getBuyableAmount('r', 54).gte(1)||player.wr.total.gte(1)},
    milestones: {
        0: {
            requirementDescription: "1e10 replicants",
            effectDescription: "automates replication buyables with less than 129 id",
            done() { return player.wr.buyables[11].gte('1e10') },
            toggles: [["wr", "autoBuy"]]
        },
        1: {
            requirementDescription: "e1e4 replicants",
            effectDescription: "automates replication buyables with less than 139 id",
            done() { return player.wr.buyables[11].gte('e1e4') },
            unlocked() {return player.wr.buyables[11].gte('e1e3')},
            toggles: [["wr", "autoBuy1"]]
        },
        2: {
            requirementDescription: "e1e8 replicants",
            effectDescription: "automates replication buyables with less than 149 id",
            done() { return player.wr.buyables[11].gte('e1e8') },
            unlocked() {return player.wr.buyables[11].gte('e1e6')},
            toggles: [["wr", "autoBuy2"]]
        },
    },
    tabFormat: {
        "main replicants": {
            shouldNotify: true,
            content:
                [["infobox", 11],
                "main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "milestones", "blank", "buyables"],
        },
        "prestige points": {
            embedLayer: "wrp",
            shouldNotify: true,
            unlocked() {return getBuyableAmount('wr', 211).gte(1)},
            content:
                ["main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "milestones", "blank", "buyables"],
        },
        "metaprestige points": {
            embedLayer: "wrmp",
            shouldNotify: true,
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            content:
                ["main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "milestones", "blank", "buyables"],
        },
        "buyabol points": {
            embedLayer: "wrbp",
            shouldNotify: true,
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            content:
                ["main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "milestones", "blank", "buyables"],
        },
        "superprestige points": {
            embedLayer: "wrsp",
            shouldNotify: true,
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            content:
                ["main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "milestones", "blank", "buyables"],
        },

    },
    automate() {
        if (hasMilestone('wr', 0)&&player.wr.autoBuy) {
            for (let i = 15; i < 16; i++) {
                if (canBuyBuyable('wr', i)) {buyMaxBuyable('wr', i)}
                if (canBuyBuyable('wrp', i)) {buyMaxBuyable('wrp', i)}
                if (canBuyBuyable('wrmp', i)) {buyMaxBuyable('wrmp', i)}
                if (canBuyBuyable('wrbp', i)) {buyMaxBuyable('wrbp', i)}
                if (canBuyBuyable('wrsp', i)) {buyMaxBuyable('wrsp', i)}
            }
            for (let i = 17; i < 18; i++) {
                if (canBuyBuyable('wr', i)) {buyMaxBuyable('wr', i)}
                if (canBuyBuyable('wrp', i)) {buyMaxBuyable('wrp', i)}
                if (canBuyBuyable('wrmp', i)) {buyMaxBuyable('wrmp', i)}
                if (canBuyBuyable('wrbp', i)) {buyMaxBuyable('wrbp', i)}
                if (canBuyBuyable('wrsp', i)) {buyMaxBuyable('wrsp', i)}
            }
            for (let i = 2; i < 6; i++) {
                j = 10*i+3
                if (canBuyBuyable('wr', j)) {buyMaxBuyable('wr', j)}
                if (canBuyBuyable('wrp', j)) {buyMaxBuyable('wrp', j)}
                if (canBuyBuyable('wrmp', j)) {buyMaxBuyable('wrmp', j)}
                if (canBuyBuyable('wrbp', j)) {buyMaxBuyable('wrbp', j)}
                if (canBuyBuyable('wrsp', j)) {buyMaxBuyable('wrsp', j)}
            }
            for (let i = 115; i < 116; i++) {
                if (canBuyBuyable('wr', i)) {buyMaxBuyable('wr', i)}
                if (canBuyBuyable('wrp', i)) {buyMaxBuyable('wrp', i)}
                if (canBuyBuyable('wrmp', i)) {buyMaxBuyable('wrmp', i)}
                if (canBuyBuyable('wrbp', i)) {buyMaxBuyable('wrbp', i)}
                if (canBuyBuyable('wrsp', i)) {buyMaxBuyable('wrsp', i)}
            }
            for (let i = 117; i < 118; i++) {
                if (canBuyBuyable('wr', i)) {buyMaxBuyable('wr', i)}
                if (canBuyBuyable('wrp', i)) {buyMaxBuyable('wrp', i)}
                if (canBuyBuyable('wrmp', i)) {buyMaxBuyable('wrmp', i)}
                if (canBuyBuyable('wrbp', i)) {buyMaxBuyable('wrbp', i)}
                if (canBuyBuyable('wrsp', i)) {buyMaxBuyable('wrsp', i)}
            }
            for (let i = 121; i < 126; i++) {
                if (canBuyBuyable('wr', i)) {buyMaxBuyable('wr', i)}
                if (canBuyBuyable('wrp', i)) {buyMaxBuyable('wrp', i)}
                if (canBuyBuyable('wrmp', i)) {buyMaxBuyable('wrmp', i)}
                if (canBuyBuyable('wrbp', i)) {buyMaxBuyable('wrbp', i)}
                if (canBuyBuyable('wrsp', i)) {buyMaxBuyable('wrsp', i)}
            }
        }
        if (hasMilestone('wr', 1)&&player.wr.autoBuy1) {
            for (let i = 131; i < 134; i++) {
                if (canBuyBuyable('wr', i)) {buyMaxBuyable('wr', i)}
                if (canBuyBuyable('wrp', i)) {buyMaxBuyable('wrp', i)}
                if (canBuyBuyable('wrmp', i)) {buyMaxBuyable('wrmp', i)}
                if (canBuyBuyable('wrbp', i)) {buyMaxBuyable('wrbp', i)}
                if (canBuyBuyable('wrsp', i)) {buyMaxBuyable('wrsp', i)}
            }
        }
        if (hasMilestone('wr', 2)&&player.wr.autoBuy2) {
            for (let i = 141; i < 146; i++) {
                if (canBuyBuyable('wr', i)) {buyMaxBuyable('wr', i)}
            }
        }
    },
    buyables: {
        11: {
            unlocked() {return false}, //replicants count
            cost(x) {
                return new Decimal(1)
            },
            effect(x) { //replicants speed from world repl

                return player.wr.points
            },
            title() { return ""},
            display() { return ""},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        13: {
            unlocked() {return false}, 
            cost(x) {
                return new Decimal(1)
            },
            effect(x) { //unsoftcapped replicants speed for other layer

                return {row1: multreplishare.times(buyableEffect('wr', 212)), row2: multreplishare.times(buyableEffect('wr', 212).sub(1).max(0))}
            },
            title() { return ""},
            display() { return ""},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        15: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr15 = "asymptote"
                costBasewr15 = new Decimal('e200')
                costExpwr15 = new Decimal(1.9)
                costLimitwr15 = layers.wr.buyables[15].purchaseLimit.add(1)
                return player.buyablePrice(costTypewr15, new Decimal(x), costBasewr15, costExpwr15, costLimitwr15)
            },
            effect(x) {
                effBasewr15 = new Decimal(0.01)
                effStackwr15 = new Decimal(x)

                return Decimal.times(effBasewr15, effStackwr15) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication buyable 15"},
            display() { return "add the bonus point gain power by "+format(effBasewr15)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr15)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost()) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr15 == "asymptote")||(costTypewr15 == "largeasymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr15, player.wr.buyables[11], costBasewr15, costExpwr15, costLimitwr15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr15, player.wr.buyables[11], costBasewr15, costExpwr15, costLimitwr15))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr15, player.buyableMaxPurchaseable(costTypewr15, player.wr.buyables[11], costBasewr15, costExpwr15, costLimitwr15), costBasewr15, costExpwr15, costLimitwr15))}
                    }
                }
            },
        },
        17: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr17 = "asymptote"
                costBasewr17 = new Decimal('e1000')
                costExpwr17 = new Decimal(2.9)
                costLimitwr17 = layers.wr.buyables[17].purchaseLimit.add(1)
                return player.buyablePrice(costTypewr17, new Decimal(x), costBasewr17, costExpwr17, costLimitwr17)
            },
            effect(x) {
                effBasewr17 = new Decimal(0.1)
                effStackwr17 = new Decimal(x)

                return Decimal.times(effBasewr17, effStackwr17) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication buyable 17"},
            display() { return "subtract the point fourth softcap by "+format(effBasewr17)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr17)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost()) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr17 == "asymptote")||(costTypewr17 == "largeasymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr17, player.wr.buyables[11], costBasewr17, costExpwr17, costLimitwr17).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr17, player.wr.buyables[11], costBasewr17, costExpwr17, costLimitwr17))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr17, player.buyableMaxPurchaseable(costTypewr17, player.wr.buyables[11], costBasewr17, costExpwr17, costLimitwr17), costBasewr17, costExpwr17, costLimitwr17))}
                    }
                }
            },
        },
        23: {
            unlocked() {return getBuyableAmount('wr', 211).gte(1)},
            cost(x) {
                costTypewr23 = "large"
                costBasewr23 = new Decimal(1.2)
                costExpwr23 = new Decimal(1.5)
                costLimitwr23 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewr23, new Decimal(x), costBasewr23, costExpwr23, costLimitwr23)
            },
            effect(x) {
                effBasewr23 = new Decimal(1.2)
                effStackwr23 = new Decimal(x)

                return Decimal.pow(effBasewr23, effStackwr23)
            },
            title() { return "world replication buyable 23"},
            display() { return "multiply the prestige gain power "+format(effBasewr23)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost()) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr23 == "asymptote")||(costTypewr23 == "largeasymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr23, player.wr.buyables[11], costBasewr23, costExpwr23, costLimitwr23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr23, player.wr.buyables[11], costBasewr23, costExpwr23, costLimitwr23))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr23, player.buyableMaxPurchaseable(costTypewr23, player.wr.buyables[11], costBasewr23, costExpwr23, costLimitwr23), costBasewr23, costExpwr23, costLimitwr23))}
                    }
                }
            },
        },
        33: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr33 = "large"
                costBasewr33 = new Decimal(1.2)
                costExpwr33 = new Decimal(1.5)
                costLimitwr33 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewr33, new Decimal(x), costBasewr33, costExpwr33, costLimitwr33)
            },
            effect(x) {
                effBasewr33 = new Decimal(1.2)
                effStackwr33 = new Decimal(x)

                return Decimal.pow(effBasewr33, effStackwr33) 
            },
            title() { return "world replication buyable 33"},
            display() { return "multiply the metaprestige gain power "+format(effBasewr33)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost()) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr33 == "asymptote")||(costTypewr33 == "largeasymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr33, player.wr.buyables[11], costBasewr33, costExpwr33, costLimitwr33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr33, player.wr.buyables[11], costBasewr33, costExpwr33, costLimitwr33))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr33, player.buyableMaxPurchaseable(costTypewr33, player.wr.buyables[11], costBasewr33, costExpwr33, costLimitwr33), costBasewr33, costExpwr33, costLimitwr33))}
                    }
                }
            },
        },
        43: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr43 = "large"
                costBasewr43 = new Decimal(1.2)
                costExpwr43 = new Decimal(1.5)
                costLimitwr43 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewr43, new Decimal(x), costBasewr43, costExpwr43, costLimitwr43)
            },
            effect(x) {
                effBasewr43 = new Decimal(1.2)
                effStackwr43 = new Decimal(x)

                return Decimal.pow(effBasewr43, effStackwr43) 
            },
            title() { return "world replication buyable 43"},
            display() { return "multiply the buyabol gain power "+format(effBasewr43)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost()) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr43 == "asymptote")||(costTypewr43 == "largeasymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr43, player.wr.buyables[11], costBasewr43, costExpwr43, costLimitwr43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr43, player.wr.buyables[11], costBasewr43, costExpwr43, costLimitwr43))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr43, player.buyableMaxPurchaseable(costTypewr43, player.wr.buyables[11], costBasewr43, costExpwr43, costLimitwr43), costBasewr43, costExpwr43, costLimitwr43))}
                    }
                }
            },
        },
        53: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr53 = "large"
                costBasewr53 = new Decimal(1.2)
                costExpwr53 = new Decimal(1.5)
                costLimitwr53 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewr53, new Decimal(x), costBasewr53, costExpwr53, costLimitwr53)
            },
            effect(x) {
                effBasewr53 = new Decimal(1.2)
                effStackwr53 = new Decimal(x)

                return Decimal.pow(effBasewr53, effStackwr53) 
            },
            title() { return "world replication buyable 53"},
            display() { return "multiply the superprestige gain power by "+format(effBasewr53)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost()) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr53 == "asymptote")||(costTypewr53 == "largeasymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr53, player.wr.buyables[11], costBasewr53, costExpwr53, costLimitwr53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr53, player.wr.buyables[11], costBasewr53, costExpwr53, costLimitwr53))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr53, player.buyableMaxPurchaseable(costTypewr53, player.wr.buyables[11], costBasewr53, costExpwr53, costLimitwr53), costBasewr53, costExpwr53, costLimitwr53))}
                    }
                }
            },
        },
        115: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr115 = "asymptote"
                costBasewr115 = new Decimal('e200')
                costExpwr115 = new Decimal(1.9)
                costLimitwr115 = layers.wr.buyables[115].purchaseLimit.add(1)
                return player.buyablePrice(costTypewr115, new Decimal(x), costBasewr115, costExpwr115, costLimitwr115)
            },
            effect(x) {
                effBasewr115 = new Decimal(0.01)
                effStackwr115 = new Decimal(x)

                return Decimal.times(effBasewr115, effStackwr115) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication buyable 115"},
            display() { return "add the bonus point gain power by "+format(effBasewr115)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr115)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost()) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr115 == "asymptote")||(costTypewr115 == "largeasymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr115, player.wr.buyables[11], costBasewr115, costExpwr115, costLimitwr115).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr115, player.wr.buyables[11], costBasewr115, costExpwr115, costLimitwr115))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr115, player.buyableMaxPurchaseable(costTypewr115, player.wr.buyables[11], costBasewr115, costExpwr115, costLimitwr115), costBasewr115, costExpwr115, costLimitwr115))}
                    }
                }
            },
        },
        117: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr117 = "asymptote"
                costBasewr117 = new Decimal('e1000')
                costExpwr117 = new Decimal(2.9)
                costLimitwr117 = layers.wr.buyables[117].purchaseLimit.add(1)
                return player.buyablePrice(costTypewr117, new Decimal(x), costBasewr117, costExpwr117, costLimitwr117)
            },
            effect(x) {
                effBasewr117 = new Decimal(0.1)
                effStackwr117 = new Decimal(x)

                return Decimal.times(effBasewr117, effStackwr117) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication buyable 117"},
            display() { return "subtract the bonus point fourth softcap by "+format(effBasewr117)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr117)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost()) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr117 == "asymptote")||(costTypewr117 == "largeasymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr117, player.wr.buyables[11], costBasewr117, costExpwr117, costLimitwr117).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr117, player.wr.buyables[11], costBasewr117, costExpwr117, costLimitwr117))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr117, player.buyableMaxPurchaseable(costTypewr117, player.wr.buyables[11], costBasewr117, costExpwr117, costLimitwr117), costBasewr117, costExpwr117, costLimitwr117))}
                    }
                }
            },
        },
        121: {
            unlocked() {return true},
            cost(x) {
                costTypewr121 = "normal"
                costBasewr121 = new Decimal(1.2)
                costExpwr121 = new Decimal(1.1)
                costLimitwr121 = new Decimal('e1e4')
                return player.buyablePrice(costTypewr121, new Decimal(x), costBasewr121, costExpwr121, costLimitwr121)
            },
            effect(x) {
                effBasewr121 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwr121 = new Decimal(x)

                return Decimal.times(effBasewr121, effStackwr121)
            },
            title() { return "world replication buyable 121"},
            display() { return "increase replicants production by "+format(effBasewr121)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr121)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].buyables[11].gte(this.cost().add(1)) },
            buy() {
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr121 == "asymptote")||player[this.layer].buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr121, player[this.layer].buyables[11], costBasewr121, costExpwr121, costLimitwr121).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr121, player[this.layer].buyables[11], costBasewr121, costExpwr121, costLimitwr121))
                        if (player[this.layer].buyables[11].lt('e100')) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(player.buyablePrice(costTypewr121, player.buyableMaxPurchaseable(costTypewr121, player[this.layer].buyables[11], costBasewr121, costExpwr121, costLimitwr121), costBasewr121, costExpwr121, costLimitwr121))}
                    }
                }
            },
        },
        122: {
            unlocked() {return true},
            cost(x) {
                costTypewr122 = "normal"
                costBasewr122 = new Decimal(1.4)
                costExpwr122 = new Decimal(1.2)
                costLimitwr122 = new Decimal('e1e4')
                return player.buyablePrice(costTypewr122, new Decimal(x), costBasewr122, costExpwr122, costLimitwr122)
            },
            effect(x) {
                effBasewr122 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwr122 = new Decimal(x)

                return Decimal.times(effBasewr122, effStackwr122)
            },
            title() { return "world replication buyable 122"},
            display() { return "increase replicants production multiplier by "+format(effBasewr122)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr122)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].buyables[11].gte(this.cost().add(1)) },
            buy() {
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr122 == "asymptote")||player[this.layer].buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr122, player[this.layer].buyables[11], costBasewr122, costExpwr122, costLimitwr122).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr122, player[this.layer].buyables[11], costBasewr122, costExpwr122, costLimitwr122))
                        if (player[this.layer].buyables[11].lt('e100')) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(player.buyablePrice(costTypewr122, player.buyableMaxPurchaseable(costTypewr122, player[this.layer].buyables[11], costBasewr122, costExpwr122, costLimitwr122), costBasewr122, costExpwr122, costLimitwr122))}
                    }
                }
            },
        },
        123: {
            unlocked() {return true},
            cost(x) {
                costTypewr123 = "normal"
                costBasewr123 = new Decimal(10)
                costExpwr123 = new Decimal(1.3)
                costLimitwr123 = new Decimal('1e200')
                return player.buyablePrice(costTypewr123, new Decimal(x), costBasewr123, costExpwr123, costLimitwr123)
            },
            effect(x) {
                effBasewr123 = new Decimal(10).pow(buyableEffect('wrte', 131)).pow(buyableEffect('wrte', 132))
                effStackwr123 = new Decimal(x)

                return Decimal.pow(effBasewr123, effStackwr123)
            },
            title() { return "world replication buyable 123"},
            display() { return "delay first replicants softcap start by "+format(effBasewr123)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr123)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].buyables[11].gte(this.cost().add(1)) },
            buy() {
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr123 == "asymptote")||player[this.layer].buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr123, player[this.layer].buyables[11], costBasewr123, costExpwr123, costLimitwr123).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr123, player[this.layer].buyables[11], costBasewr123, costExpwr123, costLimitwr123))
                        if (player[this.layer].buyables[11].lt('e100')) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(player.buyablePrice(costTypewr123, player.buyableMaxPurchaseable(costTypewr123, player[this.layer].buyables[11], costBasewr123, costExpwr123, costLimitwr123), costBasewr123, costExpwr123, costLimitwr123))}
                    }
                }
            },
        },
        124: {
            unlocked() {return true},
            cost(x) {
                costTypewr124 = "normal"
                costBasewr124 = new Decimal(5)
                costExpwr124 = new Decimal(1.4)
                costLimitwr124 = new Decimal('1e100')
                return player.buyablePrice(costTypewr124, new Decimal(x), costBasewr124, costExpwr124, costLimitwr124)
            },
            effect(x) {
                effBasewr124 = new Decimal(0.1)
                effStackwr124 = new Decimal(x)

                return Decimal.times(effBasewr124, effStackwr124)
            },
            title() { return "world replication buyable 124"},
            display() { return "add first replicants softcap strength by "+format(effBasewr124)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr124)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].buyables[11].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr124 == "asymptote")||(costTypewr124 == "largeasymptote")||player[this.layer].buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr124, player[this.layer].buyables[11], costBasewr124, costExpwr124, costLimitwr124).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr124, player[this.layer].buyables[11], costBasewr124, costExpwr124, costLimitwr124))
                        if (player[this.layer].buyables[11].lt('e100')) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(player.buyablePrice(costTypewr124, player.buyableMaxPurchaseable(costTypewr124, player[this.layer].buyables[11], costBasewr124, costExpwr124, costLimitwr124), costBasewr124, costExpwr124, costLimitwr124))}
                    }
                }
            },
        },
        125: {
            unlocked() {return true},
            cost(x) {
                costTypewr125 = "asymptote"
                costBasewr125 = new Decimal(100)
                costExpwr125 = new Decimal(2.2)
                costLimitwr125 = layers.wr.buyables[125].purchaseLimit.add(1)
                return player.buyablePrice(costTypewr125, new Decimal(x), costBasewr125, costExpwr125, costLimitwr125)
            },
            effect(x) {
                effBasewr125 = new Decimal(1.025)
                effStackwr125 = new Decimal(x)

                return Decimal.pow(effBasewr125, effStackwr125)
            },
            purchaseLimit: new Decimal(50),
            title() { return "world replication buyable 125"},
            display() { return "divide the first replicants softcap strength by "+format(effBasewr125)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr125)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].buyables[11].gte(this.cost()) },
            buy() {
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr125 == "asymptote")||(costTypewr125 == "largeasymptote")||player[this.layer].buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr125, player[this.layer].buyables[11], costBasewr125, costExpwr125, costLimitwr125).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr125, player[this.layer].buyables[11], costBasewr125, costExpwr125, costLimitwr125))
                        if (player[this.layer].buyables[11].lt('e100')) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(player.buyablePrice(costTypewr125, player.buyableMaxPurchaseable(costTypewr125, player[this.layer].buyables[11], costBasewr125, costExpwr125, costLimitwr125), costBasewr125, costExpwr125, costLimitwr125))}
                    }
                }
            },
        },
        131: {
            unlocked() {return true},
            cost(x) {
                costTypewr131 = "normal"
                costBasewr131 = new Decimal(1e10)
                costExpwr131 = new Decimal(3)
                costLimitwr131 = new Decimal('e1e4')
                return player.buyablePrice(costTypewr131, new Decimal(x), costBasewr131, costExpwr131, costLimitwr131)
            },
            effect(x) {
                effBasewr131 = new Decimal(0.01).times(buyableEffect('wrte', 132))
                effStackwr131 = new Decimal(x)

                return Decimal.times(effBasewr131, effStackwr131)
            },
            title() { return "world replication buyable 131"},
            display() { return "add buyables 121 to 123 effect multiplier by "+format(effBasewr131)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr131)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost().add(1)) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr131 == "asymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr131, player.wr.buyables[11], costBasewr131, costExpwr131, costLimitwr131).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr131, player.wr.buyables[11], costBasewr131, costExpwr131, costLimitwr131))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr131, player.buyableMaxPurchaseable(costTypewr131, player.wr.buyables[11], costBasewr131, costExpwr131, costLimitwr131), costBasewr131, costExpwr131, costLimitwr131))}
                    }
                }
            },
        },
        132: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr132 = "large"
                costBasewr132 = new Decimal('1e5')
                costExpwr132 = new Decimal(0.3)
                costLimitwr132 = new Decimal('e1e8')
                return player.buyablePrice(costTypewr132, new Decimal(x), costBasewr132, costExpwr132, costLimitwr132)
            },
            effect(x) {
                effBasewr132 = new Decimal(0.01)
                effStackwr132 = new Decimal(x)

                return Decimal.times(effBasewr132, effStackwr132)
            },
            title() { return "world replication buyable 132"},
            display() { return "add buyables 121 to 123 and 131 effect multiplier by "+format(effBasewr132)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr132)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost().add(1)) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr132 == "asymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr132, player.wr.buyables[11], costBasewr132, costExpwr132, costLimitwr132).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr132, player.wr.buyables[11], costBasewr132, costExpwr132, costLimitwr132))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr132, player.buyableMaxPurchaseable(costTypewr132, player.wr.buyables[11], costBasewr132, costExpwr132, costLimitwr132), costBasewr132, costExpwr132, costLimitwr132))}
                    }
                }
            },
        },
        133: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr133 = "asymptote"
                costBasewr133 = new Decimal('e2e7')
                costExpwr133 = new Decimal(3)
                costLimitwr133 = layers.wr.buyables[133].purchaseLimit.add(1)
                return player.buyablePrice(costTypewr133, new Decimal(x), costBasewr133, costExpwr133, costLimitwr133)
            },
            effect(x) {
                effBasewr133 = new Decimal(1.05)
                effStackwr133 = new Decimal(x)

                return Decimal.pow(effBasewr133, effStackwr133)
            },
            purchaseLimit: new Decimal(50),
            title() { return "world replication buyable 133"},
            display() { return "divide the first replicanti softcap strength by "+format(effBasewr133)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr133)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.wr.buyables[11].gte(this.cost().add(1)) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr133 == "asymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr133, player.wr.buyables[11], costBasewr133, costExpwr133, costLimitwr133).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr133, player.wr.buyables[11], costBasewr133, costExpwr133, costLimitwr133))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr133, player.buyableMaxPurchaseable(costTypewr133, player.wr.buyables[11], costBasewr133, costExpwr133, costLimitwr133), costBasewr133, costExpwr133, costLimitwr133))}
                    }
                }
            },
        },
        141: {
            unlocked() {return getBuyableAmount('wr', 211).gte(1)},
            cost(x) {
                costTypewr141 = "normal"
                costBasewr141 = new Decimal('e1e6')
                costExpwr141 = new Decimal(3)
                costLimitwr141 = new Decimal('e1e7')                 // 1 free buyables
                return player.buyablePrice(costTypewr141, new Decimal(x).sub(1), costBasewr141, costExpwr141, costLimitwr141)
            },
            effect(x) {
                effBasewr141 = player.points.max(1).times(player.b.points.max(1))
                effStackwr141 = new Decimal(x)

                return Decimal.pow(effBasewr141, effStackwr141)
            },
            title() { return "world replication buyable 141"},
            display() { return "multiply replication speed by (points * bonus points), currently "+format(effBasewr141)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr141)+" <br> effect: "+format(this.effect())+"<br> Starting from buyable row 14 won't be replicated and multiplier won't be shared to lower layers. "},
            canAfford() { return player.wr.buyables[11].gte(this.cost().add(1)) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr141 == "asymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr141, player.wr.buyables[11], costBasewr141, costExpwr141, costLimitwr141).add(1).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr141, player.wr.buyables[11], costBasewr141, costExpwr141, costLimitwr141).add(1))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr141, player.buyableMaxPurchaseable(costTypewr141, player.wr.buyables[11], costBasewr141, costExpwr141, costLimitwr141).sub(1), costBasewr141, costExpwr141, costLimitwr141))}
                    }
                }
            },
        },
        142: {
            unlocked() {return getBuyableAmount('wr', 211).gte(1)},
            cost(x) {
                costTypewr142 = "normal"
                costBasewr142 = new Decimal('e3e6')
                costExpwr142 = new Decimal(3)
                costLimitwr142 = new Decimal('e1e7')              //    1 free level on this 
                return player.buyablePrice(costTypewr142, new Decimal(x).sub(1), costBasewr142, costExpwr142, costLimitwr142)
            },
            effect(x) {
                effBasewr142 = player.p.points.max('1e10').log10().log10()
                if (effBasewr142.gte(10)) {effBasewr142 = effBasewr142.log10().pow(0.5).pow10()}
                effStackwr142 = new Decimal(x)

                return Decimal.pow(effBasewr142, effStackwr142)
            },
            title() { return "world replication buyable 142"},
            display() { return "multiply replication speed by 10^(log(log(log(prestige points)))^0.5), currently "+format(effBasewr142)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr142)+" <br> effect: "+format(this.effect())+"<br> Starting from buyable row 14 won't be replicated. "},
            canAfford() { return player.wr.buyables[11].gte(this.cost().add(1)) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr142 == "asymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr142, player.wr.buyables[11], costBasewr142, costExpwr142, costLimitwr142).add(1).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr142, player.wr.buyables[11], costBasewr142, costExpwr142, costLimitwr142).add(1))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr142, player.buyableMaxPurchaseable(costTypewr142, player.wr.buyables[11], costBasewr142, costExpwr142, costLimitwr142).sub(1), costBasewr142, costExpwr142, costLimitwr142))}
                    }
                }
            },
        },
        143: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr143 = "normal"
                costBasewr143 = new Decimal('e3e6')
                costExpwr143 = new Decimal(3)
                costLimitwr143 = new Decimal('e1e7')  
                return player.buyablePrice(costTypewr143, new Decimal(x), costBasewr143, costExpwr143, costLimitwr143)
            },
            effect(x) {
                effBasewr143 = player.mp.points.max('1e10').log10().log10()
                if (effBasewr143.gte(10)) {effBasewr143 = effBasewr143.log10().pow(0.5).pow10()}
                effStackwr143 = new Decimal(x)

                return Decimal.pow(effBasewr143, effStackwr143)
            },
            title() { return "world replication buyable 143"},
            display() { return "multiply replication speed by 10^(log(log(log(metaprestige points)))^0.5), currently "+format(effBasewr143)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr143)+" <br> effect: "+format(this.effect())+"<br> Starting from buyable row 14 won't be replicated. "},
            canAfford() { return player.wr.buyables[11].gte(this.cost().add(1)) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr143 == "asymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr143, player.wr.buyables[11], costBasewr143, costExpwr143, costLimitwr143).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr143, player.wr.buyables[11], costBasewr143, costExpwr143, costLimitwr143))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr143, player.buyableMaxPurchaseable(costTypewr143, player.wr.buyables[11], costBasewr143, costExpwr143, costLimitwr143), costBasewr143, costExpwr143, costLimitwr143))}
                    }
                }
            },
        },
        144: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr144 = "normal"
                costBasewr144 = new Decimal('e3e6')
                costExpwr144 = new Decimal(3)
                costLimitwr144 = new Decimal('e1e7') 
                return player.buyablePrice(costTypewr144, new Decimal(x), costBasewr144, costExpwr144, costLimitwr144)
            },
            effect(x) {
                effBasewr144 = player.bp.points.max('1e10').log10().log10()
                if (effBasewr144.gte(10)) {effBasewr144 = effBasewr144.log10().pow(0.5).pow10()}
                effStackwr144 = new Decimal(x)

                return Decimal.pow(effBasewr144, effStackwr144)
            },
            title() { return "world replication buyable 144"},
            display() { return "multiply replication speed by 10^(log(log(log(buyabol points)))^0.5), currently "+format(effBasewr144)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr144)+" <br> effect: "+format(this.effect())+"<br> Starting from buyable row 14 won't be replicated. "},
            canAfford() { return player.wr.buyables[11].gte(this.cost().add(1)) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr144 == "asymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr144, player.wr.buyables[11], costBasewr144, costExpwr144, costLimitwr144).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr144, player.wr.buyables[11], costBasewr144, costExpwr144, costLimitwr144))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr144, player.buyableMaxPurchaseable(costTypewr144, player.wr.buyables[11], costBasewr144, costExpwr144, costLimitwr144), costBasewr144, costExpwr144, costLimitwr144))}
                    }
                }
            },
        },
        145: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewr145 = "normal"
                costBasewr145 = new Decimal('e3e6')
                costExpwr145 = new Decimal(3)
                costLimitwr145 = new Decimal('e1e7') 
                return player.buyablePrice(costTypewr145, new Decimal(x), costBasewr145, costExpwr145, costLimitwr145)
            },
            effect(x) {
                effBasewr145 = player.sp.points.max('1e10').log10().log10()
                if (effBasewr145.gte(10)) {effBasewr145 = effBasewr145.log10().pow(0.5).pow10()}
                effStackwr145 = new Decimal(x)

                return Decimal.pow(effBasewr145, effStackwr145)
            },
            title() { return "world replication buyable 145"},
            display() { return "multiply replication speed by 10^(log(log(log(superprestige points)))^0.5), currently "+format(effBasewr145)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr145)+" <br> effect: "+format(this.effect())+"<br> Starting from buyable row 14 won't be replicated. "},
            canAfford() { return player.wr.buyables[11].gte(this.cost().add(1)) },
            buy() {
                player.wr.buyables[11] = player.wr.buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr145 == "asymptote")||player.wr.buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr145, player.wr.buyables[11], costBasewr145, costExpwr145, costLimitwr145).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr145, player.wr.buyables[11], costBasewr145, costExpwr145, costLimitwr145))
                        if (player.wr.buyables[11].lt('e100')) {player.wr.buyables[11] = player.wr.buyables[11].sub(player.buyablePrice(costTypewr145, player.buyableMaxPurchaseable(costTypewr145, player.wr.buyables[11], costBasewr145, costExpwr145, costLimitwr145), costBasewr145, costExpwr145, costLimitwr145))}
                    }
                }
            },
        },
        211: {
            unlocked() {return true},
            cost(x) {
                costTypewr211 = "large"
                costBasewr211 = new Decimal(10)
                costExpwr211 = new Decimal(2)
                costLimitwr211 = new Decimal('e10')
                return player.buyablePrice(costTypewr211, new Decimal(x), costBasewr211, costExpwr211, costLimitwr211)
            },
            effect(x) {
                effBasewr211 = new Decimal(1)
                effStackwr211 = new Decimal(x)

                return Decimal.times(effBasewr211, effStackwr211)
            },
            title() { return "world replication buyable 211"},
            display() { return "unlock row "+format(this.effect().add(effBasewr211))+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr211)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].buyables[11].gte(this.cost().add(1)) },
            buy() {
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr211 == "asymptote")||player[this.layer].buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr211, player[this.layer].buyables[11], costBasewr211, costExpwr211, costLimitwr211).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr211, player[this.layer].buyables[11], costBasewr211, costExpwr211, costLimitwr211))
                        if (player[this.layer].buyables[11].lt('e100')) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(player.buyablePrice(costTypewr211, player.buyableMaxPurchaseable(costTypewr211, player[this.layer].buyables[11], costBasewr211, costExpwr211, costLimitwr211), costBasewr211, costExpwr211, costLimitwr211))}
                    }
                }
            },
        },
        212: {
            unlocked() {return getBuyableAmount('wr', 211).gte(1)},
            cost(x) {
                costTypewr211 = "large"
                costBasewr211 = new Decimal(100)
                costExpwr211 = new Decimal(2)
                costLimitwr211 = new Decimal('e100')
                return player.buyablePrice(costTypewr211, new Decimal(x), costBasewr211, costExpwr211, costLimitwr211)
            },
            effect(x) {
                effBasewr211 = new Decimal(1)
                effStackwr211 = new Decimal(x)

                return Decimal.times(effBasewr211, effStackwr211)
            },
            title() { return "world replication buyable 212"},
            display() { return "start replicating row "+format(this.effect().add(effBasewr211))+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwr211)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].buyables[11].gte(this.cost().add(1)) },
            buy() {
                player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewr211 == "asymptote")||player[this.layer].buyables[11].lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewr211, player[this.layer].buyables[11], costBasewr211, costExpwr211, costLimitwr211).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewr211, player[this.layer].buyables[11], costBasewr211, costExpwr211, costLimitwr211))
                        if (player[this.layer].buyables[11].lt('e100')) {player[this.layer].buyables[11] = player[this.layer].buyables[11].sub(player.buyablePrice(costTypewr211, player.buyableMaxPurchaseable(costTypewr211, player[this.layer].buyables[11], costBasewr211, costExpwr211, costLimitwr211), costBasewr211, costExpwr211, costLimitwr211))}
                    }
                }
            },
        },
    },
    upgrades: {
    },
    infoboxes: {
        11: {
            body() {
                textwr = "You have "+format(getBuyableAmount('wr', 11))+" replicants"
                textwr += "<br> you gain "+format(player.wr.buyables[11].times(multrepliAfterPenalty))+" replicants/s, which is "
                if (multrepliAfterPenalty.gte(10)) {textwr += "+"+format(multrepliAfterPenalty.log(10))+" OoM <br>"} else {textwr += format(multrepliAfterPenalty)+"x <br>"}
                textwr += " of your replicants"
                if (player.wr.buyables[11].gte(firstRepliSoftcapStart)) {textwr += "<br> After "+format(firstRepliSoftcapStart)+" replicants, slow down replicants growth by replicants^(1/"+format(firstRepliSoftcapStrengthInverse)+"). Currently "
                    if (firstRepliPenalty.gte(10)) {textwr += "-"+format(firstRepliPenalty.log(10))+" OoM"} else {textwr += format(firstRepliPenalty)+"x"}
                }
                textwr += "<br> Your world replications are multiplying replicant gain by x"+format(buyableEffect('wr', 11))

                if (player.wr.buyables[212].gte(1)) {textwr += "<br> <br> Your row 1 resources are producing themselves at a rate of "
                    if (buyableEffect('wr', 13).row1.gte(10)) {textwr += "+"+format(buyableEffect('wr', 13).row1.log(10))+" OoM/s"} else {textwr += format(buyableEffect('wr', 13).row1)+"x/s"}
                }
                if (player.wr.buyables[212].gte(2)) {textwr += "<br> Your row 2 resources are producing themselves at a rate of "
                    if (buyableEffect('wr', 13).row2.gte(10)) {textwr += "+"+format(buyableEffect('wr', 13).row2.log(10))+" OoM/s"} else {textwr += format(buyableEffect('wr', 13).row2)+"x/s"}
                }
                return textwr
            }
        }
    }, 
})

addLayer("wrp", {
    name: "World Replication Prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "WRP", // This appears on the layer's node. Default is the id with the first letter capitalized
    startData() { return {
        unlocked() {getBuyableAmount('wr', 211).gte(1)} ,
		points: new Decimal(0),
    }},
    position: 1,
    color: "#d05050",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "world replication prestige", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        

        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    getResetGain() {

        return new Decimal(0)
    },
    getNextAt() {
        return Decimal.dInf
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "You cannot reset this layer" },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
    ],
    layerShown(){return false},
    buyables: {
        15: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp15 = "asymptote"
                costBasewrp15 = new Decimal('e200')
                costExpwrp15 = new Decimal(1.9)
                costLimitwrp15 = layers.wrp.buyables[15].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp15, new Decimal(x), costBasewrp15, costExpwrp15, costLimitwrp15)
            },
            effect(x) {
                effBasewrp15 = new Decimal(0.01)
                effStackwrp15 = new Decimal(x)

                return Decimal.times(effBasewrp15, effStackwrp15) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication prestige buyable 15"},
            display() { return "add the point gain power by "+format(effBasewrp15)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp15)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp15 == "asymptote")||(costTypewrp15 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp15, player.p.points, costBasewrp15, costExpwrp15, costLimitwrp15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp15, player.p.points, costBasewrp15, costExpwrp15, costLimitwrp15))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp15, player.buyableMaxPurchaseable(costTypewrp15, player.p.points, costBasewrp15, costExpwrp15, costLimitwrp15), costBasewrp15, costExpwrp15, costLimitwrp15))}
                    }
                }
            },
        },
        17: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp17 = "asymptote"
                costBasewrp17 = new Decimal('e1000')
                costExpwrp17 = new Decimal(2.9)
                costLimitwrp17 = layers.wrp.buyables[17].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp17, new Decimal(x), costBasewrp17, costExpwrp17, costLimitwrp17)
            },
            effect(x) {
                effBasewrp17 = new Decimal(0.1)
                effStackwrp17 = new Decimal(x)

                return Decimal.times(effBasewrp17, effStackwrp17) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication prestige buyable 17"},
            display() { return "subtract the point fourth softcap by "+format(effBasewrp17)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp17)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp17 == "asymptote")||(costTypewrp17 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp17, player.p.points, costBasewrp17, costExpwrp17, costLimitwrp17).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp17, player.p.points, costBasewrp17, costExpwrp17, costLimitwrp17))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp17, player.buyableMaxPurchaseable(costTypewrp17, player.p.points, costBasewrp17, costExpwrp17, costLimitwrp17), costBasewrp17, costExpwrp17, costLimitwrp17))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypewrp23 = "large"
                costBasewrp23 = new Decimal(1.2)
                costExpwrp23 = new Decimal(1.5)
                costLimitwrp23 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrp23, new Decimal(x), costBasewrp23, costExpwrp23, costLimitwrp23)
            },
            effect(x) {
                effBasewrp23 = new Decimal(1.2)
                effStackwrp23 = new Decimal(x)

                return Decimal.pow(effBasewrp23, effStackwrp23)
            },
            
            title() { return "world replication prestige buyable 23"},
            display() { return "multiply the prestige gain power "+format(effBasewrp23)+" <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp23 == "asymptote")||(costTypewrp23 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp23, player.p.points, costBasewrp23, costExpwrp23, costLimitwrp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp23, player.p.points, costBasewrp23, costExpwrp23, costLimitwrp23))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp23, player.buyableMaxPurchaseable(costTypewrp23, player.p.points, costBasewrp23, costExpwrp23, costLimitwrp23), costBasewrp23, costExpwrp23, costLimitwrp23))}
                    }
                }
            },
        },
        33: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp33 = "large"
                costBasewrp33 = new Decimal(1.2)
                costExpwrp33 = new Decimal(1.5)
                costLimitwrp33 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrp33, new Decimal(x), costBasewrp33, costExpwrp33, costLimitwrp33)
            },
            effect(x) {
                effBasewrp33 = new Decimal(1.2)
                effStackwrp33 = new Decimal(x)

                return Decimal.pow(effBasewrp33, effStackwrp33) 
            },
            
            title() { return "world replication prestige buyable 33"},
            display() { return "multiply the metaprestige "+format(effBasewrp33)+" <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp33 == "asymptote")||(costTypewrp33 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp33, player.p.points, costBasewrp33, costExpwrp33, costLimitwrp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp33, player.p.points, costBasewrp33, costExpwrp33, costLimitwrp33))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp33, player.buyableMaxPurchaseable(costTypewrp33, player.p.points, costBasewrp33, costExpwrp33, costLimitwrp33), costBasewrp33, costExpwrp33, costLimitwrp33))}
                    }
                }
            },
        },
        43: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp43 = "large"
                costBasewrp43 = new Decimal(1.2)
                costExpwrp43 = new Decimal(1.5)
                costLimitwrp43 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrp43, new Decimal(x), costBasewrp43, costExpwrp43, costLimitwrp43)
            },
            effect(x) {
                effBasewrp43 = new Decimal(1.2)
                effStackwrp43 = new Decimal(x)

                return Decimal.pow(effBasewrp43, effStackwrp43) 
            },
            
            title() { return "world replication prestige buyable 43"},
            display() { return "multiply the buyabol gain power "+format(effBasewrp43)+" <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp43 == "asymptote")||(costTypewrp43 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp43, player.p.points, costBasewrp43, costExpwrp43, costLimitwrp43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp43, player.p.points, costBasewrp43, costExpwrp43, costLimitwrp43))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp43, player.buyableMaxPurchaseable(costTypewrp43, player.p.points, costBasewrp43, costExpwrp43, costLimitwrp43), costBasewrp43, costExpwrp43, costLimitwrp43))}
                    }
                }
            },
        },
        53: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp53 = "large"
                costBasewrp53 = new Decimal(1.2)
                costExpwrp53 = new Decimal(1.5)
                costLimitwrp53 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrp53, new Decimal(x), costBasewrp53, costExpwrp53, costLimitwrp53)
            },
            effect(x) {
                effBasewrp53 = new Decimal(1.2)
                effStackwrp53 = new Decimal(x)

                return Decimal.pow(effBasewrp53, effStackwrp53) 
            },
            
            title() { return "world replication prestige buyable 53"},
            display() { return "multiply the superprestige gain power by "+format(effBasewrp53)+" <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp53 == "asymptote")||(costTypewrp53 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp53, player.p.points, costBasewrp53, costExpwrp53, costLimitwrp53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp53, player.p.points, costBasewrp53, costExpwrp53, costLimitwrp53))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp53, player.buyableMaxPurchaseable(costTypewrp53, player.p.points, costBasewrp53, costExpwrp53, costLimitwrp53), costBasewrp53, costExpwrp53, costLimitwrp53))}
                    }
                }
            },
        },
        115: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp115 = "asymptote"
                costBasewrp115 = new Decimal('e200')
                costExpwrp115 = new Decimal(1.9)
                costLimitwrp115 = layers.wrp.buyables[115].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp115, new Decimal(x), costBasewrp115, costExpwrp115, costLimitwrp115)
            },
            effect(x) {
                effBasewrp115 = new Decimal(0.01)
                effStackwrp115 = new Decimal(x)

                return Decimal.times(effBasewrp115, effStackwrp115) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication prestige buyable 115"},
            display() { return "add the bonus point gain power by "+format(effBasewrp115)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp115)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp115 == "asymptote")||(costTypewrp115 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp115, player.p.points, costBasewrp115, costExpwrp115, costLimitwrp115).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp115, player.p.points, costBasewrp115, costExpwrp115, costLimitwrp115))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp115, player.buyableMaxPurchaseable(costTypewrp115, player.p.points, costBasewrp115, costExpwrp115, costLimitwrp115), costBasewrp115, costExpwrp115, costLimitwrp115))}
                    }
                }
            },
        },
        117: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp117 = "asymptote"
                costBasewrp117 = new Decimal('e1000')
                costExpwrp117 = new Decimal(2.9)
                costLimitwrp117 = layers.wrp.buyables[117].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp117, new Decimal(x), costBasewrp117, costExpwrp117, costLimitwrp117)
            },
            effect(x) {
                effBasewrp117 = new Decimal(0.1)
                effStackwrp117 = new Decimal(x)

                return Decimal.times(effBasewrp117, effStackwrp117) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication prestige buyable 117"},
            display() { return "subtract the bonus point fourth softcap by "+format(effBasewrp117)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp117)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp117 == "asymptote")||(costTypewrp117 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp117, player.p.points, costBasewrp117, costExpwrp117, costLimitwrp117).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp117, player.p.points, costBasewrp117, costExpwrp117, costLimitwrp117))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp117, player.buyableMaxPurchaseable(costTypewrp117, player.p.points, costBasewrp117, costExpwrp117, costLimitwrp117), costBasewrp117, costExpwrp117, costLimitwrp117))}
                    }
                }
            },
        },
        121: {
            unlocked() {return true},
            cost(x) {
                costTypewrp121 = "normal"
                costBasewrp121 = new Decimal(1.2)
                costExpwrp121 = new Decimal(1.1)
                costLimitwrp121 = new Decimal('e1e4')
                return player.buyablePrice(costTypewrp121, new Decimal(x), costBasewrp121, costExpwrp121, costLimitwrp121)
            },
            effect(x) {
                effBasewrp121 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwrp121 = new Decimal(x)

                return Decimal.times(effBasewrp121, effStackwrp121)
            },
            title() { return "world replication buyable 121"},
            display() { return "increase replicants production by "+format(effBasewrp121)+" <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp121)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost().add(1)) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp121 == "asymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp121, player.p.points, costBasewrp121, costExpwrp121, costLimitwrp121).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp121, player.p.points, costBasewrp121, costExpwrp121, costLimitwrp121))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp121, player.buyableMaxPurchaseable(costTypewrp121, player.p.points, costBasewrp121, costExpwrp121, costLimitwrp121), costBasewrp121, costExpwrp121, costLimitwrp121))}
                    }
                }
            },
        },
        122: {
            unlocked() {return true},
            cost(x) {
                costTypewrp122 = "normal"
                costBasewrp122 = new Decimal(1.4)
                costExpwrp122 = new Decimal(1.2)
                costLimitwrp122 = new Decimal('e1e4')
                return player.buyablePrice(costTypewrp122, new Decimal(x), costBasewrp122, costExpwrp122, costLimitwrp122)
            },
            effect(x) {
                effBasewrp122 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwrp122 = new Decimal(x)

                return Decimal.times(effBasewrp122, effStackwrp122)
            },
            title() { return "world replication buyable 122"},
            display() { return "increase replicants production multiplier by "+format(effBasewrp122)+" <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp122)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost().add(1)) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp122 == "asymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp122, player.p.points, costBasewrp122, costExpwrp122, costLimitwrp122).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp122, player.p.points, costBasewrp122, costExpwrp122, costLimitwrp122))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp122, player.buyableMaxPurchaseable(costTypewrp122, player.p.points, costBasewrp122, costExpwrp122, costLimitwrp122), costBasewrp122, costExpwrp122, costLimitwrp122))}
                    }
                }
            },
        },
        123: {
            unlocked() {return true},
            cost(x) {
                costTypewrp123 = "normal"
                costBasewrp123 = new Decimal(10)
                costExpwrp123 = new Decimal(1.3)
                costLimitwrp123 = new Decimal('1e200')
                return player.buyablePrice(costTypewrp123, new Decimal(x), costBasewrp123, costExpwrp123, costLimitwrp123)
            },
            effect(x) {
                effBasewrp123 = new Decimal(10).pow(buyableEffect('wrte', 131)).pow(buyableEffect('wrte', 132))
                effStackwrp123 = new Decimal(x)

                return Decimal.pow(effBasewrp123, effStackwrp123)
            },
            title() { return "world replication buyable 123"},
            display() { return "delay first replicants softcap start by "+format(effBasewrp123)+"x <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp123)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost().add(1)) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp123 == "asymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp123, player.p.points, costBasewrp123, costExpwrp123, costLimitwrp123).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp123, player.p.points, costBasewrp123, costExpwrp123, costLimitwrp123))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp123, player.buyableMaxPurchaseable(costTypewrp123, player.p.points, costBasewrp123, costExpwrp123, costLimitwrp123), costBasewrp123, costExpwrp123, costLimitwrp123))}
                    }
                }
            },
        },
        124: {
            unlocked() {return true},
            cost(x) {
                costTypewrp124 = "normal"
                costBasewrp124 = new Decimal(5)
                costExpwrp124 = new Decimal(1.4)
                costLimitwrp124 = new Decimal('1e100')
                return player.buyablePrice(costTypewrp124, new Decimal(x), costBasewrp124, costExpwrp124, costLimitwrp124)
            },
            effect(x) {
                effBasewrp124 = new Decimal(0.1)
                effStackwrp124 = new Decimal(x)

                return Decimal.times(effBasewrp124, effStackwrp124)
            },
            title() { return "world replication prestige buyable 124"},
            display() { return "add first replicants softcap strength by "+format(effBasewrp124)+" <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp124)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp124 == "asymptote")||(costTypewrp124 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp124, player.p.points, costBasewrp124, costExpwrp124, costLimitwrp124).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp124, player.p.points, costBasewrp124, costExpwrp124, costLimitwrp124))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp124, player.buyableMaxPurchaseable(costTypewrp124, player.p.points, costBasewrp124, costExpwrp124, costLimitwrp124), costBasewrp124, costExpwrp124, costLimitwrp124))}
                    }
                }
            },
        },
        125: {
            unlocked() {return true},
            cost(x) {
                costTypewrp125 = "asymptote"
                costBasewrp125 = new Decimal(100)
                costExpwrp125 = new Decimal(2.2)
                costLimitwrp125 = layers.wrp.buyables[125].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp125, new Decimal(x), costBasewrp125, costExpwrp125, costLimitwrp125)
            },
            effect(x) {
                effBasewrp125 = new Decimal(1.025)
                effStackwrp125 = new Decimal(x)

                return Decimal.pow(effBasewrp125, effStackwrp125)
            },
            purchaseLimit: new Decimal(50),
            title() { return "world replication prestige buyable 125"},
            display() { return "divide the first replicants softcap strength by "+format(effBasewrp125)+" <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp125)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost()) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp125 == "asymptote")||(costTypewrp125 == "largeasymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp125, player.p.points, costBasewrp125, costExpwrp125, costLimitwrp125).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp125, player.p.points, costBasewrp125, costExpwrp125, costLimitwrp125))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp125, player.buyableMaxPurchaseable(costTypewrp125, player.p.points, costBasewrp125, costExpwrp125, costLimitwrp125), costBasewrp125, costExpwrp125, costLimitwrp125))}
                    }
                }
            },
        },
        131: {
            unlocked() {return true},
            cost(x) {
                costTypewrp131 = "normal"
                costBasewrp131 = new Decimal(1e10)
                costExpwrp131 = new Decimal(3)
                costLimitwrp131 = new Decimal('e1e6')
                return player.buyablePrice(costTypewrp131, new Decimal(x), costBasewrp131, costExpwrp131, costLimitwrp131)
            },
            effect(x) {
                effBasewrp131 = new Decimal(0.01).times(buyableEffect('wrte', 132))
                effStackwrp131 = new Decimal(x)

                return Decimal.times(effBasewrp131, effStackwrp131)
            },
            title() { return "world replication prestige buyable 131"},
            display() { return "add buyables 121 to 123 effect multiplier by "+format(effBasewrp131)+"x <br> cost: "+format(this.cost())+" prestige points <br> owned: "+format(effStackwrp131)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost().add(1)) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp131 == "asymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp131, player.p.points, costBasewrp131, costExpwrp131, costLimitwrp131).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp131, player.p.points, costBasewrp131, costExpwrp131, costLimitwrp131))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp131, player.buyableMaxPurchaseable(costTypewrp131, player.p.points, costBasewrp131, costExpwrp131, costLimitwrp131), costBasewrp131, costExpwrp131, costLimitwrp131))}
                    }
                }
            },
        },        
        132: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp132 = "large"
                costBasewrp132 = new Decimal('1e5')
                costExpwrp132 = new Decimal(0.3)
                costLimitwrp132 = new Decimal('e1e8')
                return player.buyablePrice(costTypewrp132, new Decimal(x), costBasewrp132, costExpwrp132, costLimitwrp132)
            },
            effect(x) {
                effBasewrp132 = new Decimal(0.01)
                effStackwrp132 = new Decimal(x)

                return Decimal.times(effBasewrp132, effStackwrp132)
            },
            title() { return "world replication prestige prestige buyable 132"},
            display() { return "add buyables 121 to 123 and 131 effect multiplier by "+format(effBasewrp132)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp132)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost().add(1)) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp132 == "asymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp132, player.p.points, costBasewrp132, costExpwrp132, costLimitwrp132).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp132, player.p.points, costBasewrp132, costExpwrp132, costLimitwrp132))
                        if (player.wr.buyables[11].lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp132, player.buyableMaxPurchaseable(costTypewrp132, player.p.points, costBasewrp132, costExpwrp132, costLimitwrp132), costBasewrp132, costExpwrp132, costLimitwrp132))}
                    }
                }
            },
        },
        133: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp133 = "asymptote"
                costBasewrp133 = new Decimal('e2e7')
                costExpwrp133 = new Decimal(3)
                costLimitwrp133 = layers.wrp.buyables[133].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp133, new Decimal(x), costBasewrp133, costExpwrp133, costLimitwrp133)
            },
            effect(x) {
                effBasewrp133 = new Decimal(1.05)
                effStackwrp133 = new Decimal(x)

                return Decimal.pow(effBasewrp133, effStackwrp133)
            },
            purchaseLimit: new Decimal(50),
            title() { return "world replication prestige buyable 133"},
            display() { return "divide the first replicanti softcap strength by "+format(effBasewrp133)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp133)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.p.points.gte(this.cost().add(1)) },
            buy() {
                player.p.points = player.p.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp133 == "asymptote")||player.p.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp133, player.p.points, costBasewrp133, costExpwrp133, costLimitwrp133).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp133, player.p.points, costBasewrp133, costExpwrp133, costLimitwrp133))
                        if (player.p.points.lt('e100')) {player.p.points = player.p.points.sub(player.buyablePrice(costTypewrp133, player.buyableMaxPurchaseable(costTypewrp133, player.p.points, costBasewrp133, costExpwrp133, costLimitwrp133), costBasewrp133, costExpwrp133, costLimitwrp133))}
                    }
                }
            },
        },
    },
    upgrades: {
    },

})

addLayer("wrmp", {
    name: "World Replication Metaprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "WRMP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {getBuyableAmount('wr', 211).gte(1)} ,
		points: new Decimal(0),
    }},
    color: "#d05050",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "World Replication Metaprestige", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        

        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    getResetGain() {

        return new Decimal(0)
    },
    getNextAt() {
        return Decimal.dInf
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "You cannot reset this layer" },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
    ],
    layerShown(){return false},
    buyables: {
        15: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrmp15 = "asymptote"
                costBasewrmp15 = new Decimal('e200')
                costExpwrmp15 = new Decimal(1.9)
                costLimitwrmp15 = layers.wrmp.buyables[15].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrmp15, new Decimal(x), costBasewrmp15, costExpwrmp15, costLimitwrmp15)
            },
            effect(x) {
                effBasewrmp15 = new Decimal(0.01)
                effStackwrmp15 = new Decimal(x)

                return Decimal.times(effBasewrmp15, effStackwrmp15) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication metaprestige buyable 15"},
            display() { return "add the point gain power by "+format(effBasewrmp15)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrmp15)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp15 == "asymptote")||(costTypewrmp15 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp15, player.mp.points, costBasewrmp15, costExpwrmp15, costLimitwrmp15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp15, player.mp.points, costBasewrmp15, costExpwrmp15, costLimitwrmp15))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp15, player.buyableMaxPurchaseable(costTypewrmp15, player.mp.points, costBasewrmp15, costExpwrmp15, costLimitwrmp15), costBasewrmp15, costExpwrmp15, costLimitwrmp15))}
                    }
                }
            },
        },
        17: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrmp17 = "asymptote"
                costBasewrmp17 = new Decimal('e1000')
                costExpwrmp17 = new Decimal(2.9)
                costLimitwrmp17 = layers.wrmp.buyables[17].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrmp17, new Decimal(x), costBasewrmp17, costExpwrmp17, costLimitwrmp17)
            },
            effect(x) {
                effBasewrmp17 = new Decimal(0.1)
                effStackwrmp17 = new Decimal(x)

                return Decimal.times(effBasewrmp17, effStackwrmp17) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication metaprestige buyable 17"},
            display() { return "subtract the point fourth softcap by "+format(effBasewrmp17)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrmp17)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp17 == "asymptote")||(costTypewrmp17 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp17, player.mp.points, costBasewrmp17, costExpwrmp17, costLimitwrmp17).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp17, player.mp.points, costBasewrmp17, costExpwrmp17, costLimitwrmp17))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp17, player.buyableMaxPurchaseable(costTypewrmp17, player.mp.points, costBasewrmp17, costExpwrmp17, costLimitwrmp17), costBasewrmp17, costExpwrmp17, costLimitwrmp17))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp23 = "large"
                costBasewrmp23 = new Decimal(1.2)
                costExpwrmp23 = new Decimal(1.5)
                costLimitwrmp23 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrmp23, new Decimal(x), costBasewrmp23, costExpwrmp23, costLimitwrmp23)
            },
            effect(x) {
                effBasewrmp23 = new Decimal(1.2)
                effStackwrmp23 = new Decimal(x)

                return Decimal.pow(effBasewrmp23, effStackwrmp23)
            },
            
            title() { return "world replication metaprestige buyable 23"},
            display() { return "multiply the prestige gain power "+format(effBasewrmp23)+" <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp23 == "asymptote")||(costTypewrmp23 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp23, player.mp.points, costBasewrmp23, costExpwrmp23, costLimitwrmp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp23, player.mp.points, costBasewrmp23, costExpwrmp23, costLimitwrmp23))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp23, player.buyableMaxPurchaseable(costTypewrmp23, player.mp.points, costBasewrmp23, costExpwrmp23, costLimitwrmp23), costBasewrmp23, costExpwrmp23, costLimitwrmp23))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp33 = "large"
                costBasewrmp33 = new Decimal(1.2)
                costExpwrmp33 = new Decimal(1.5)
                costLimitwrmp33 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrmp33, new Decimal(x), costBasewrmp33, costExpwrmp33, costLimitwrmp33)
            },
            effect(x) {
                effBasewrmp33 = new Decimal(1.2)
                effStackwrmp33 = new Decimal(x)

                return Decimal.pow(effBasewrmp33, effStackwrmp33) 
            },
            
            title() { return "world replication metaprestige buyable 33"},
            display() { return "multiply the metaprestige gain power by "+format(effBasewrmp33)+" <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp33 == "asymptote")||(costTypewrmp33 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp33, player.mp.points, costBasewrmp33, costExpwrmp33, costLimitwrmp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp33, player.mp.points, costBasewrmp33, costExpwrmp33, costLimitwrmp33))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp33, player.buyableMaxPurchaseable(costTypewrmp33, player.mp.points, costBasewrmp33, costExpwrmp33, costLimitwrmp33), costBasewrmp33, costExpwrmp33, costLimitwrmp33))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp43 = "large"
                costBasewrmp43 = new Decimal(1.2)
                costExpwrmp43 = new Decimal(1.5)
                costLimitwrmp43 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrmp43, new Decimal(x), costBasewrmp43, costExpwrmp43, costLimitwrmp43)
            },
            effect(x) {
                effBasewrmp43 = new Decimal(1.2)
                effStackwrmp43 = new Decimal(x)

                return Decimal.pow(effBasewrmp43, effStackwrmp43) 
            },
            
            title() { return "world replication metaprestige buyable 43"},
            display() { return "multiply the buyabol gain power "+format(effBasewrmp43)+" <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp43 == "asymptote")||(costTypewrmp43 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp43, player.mp.points, costBasewrmp43, costExpwrmp43, costLimitwrmp43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp43, player.mp.points, costBasewrmp43, costExpwrmp43, costLimitwrmp43))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp43, player.buyableMaxPurchaseable(costTypewrmp43, player.mp.points, costBasewrmp43, costExpwrmp43, costLimitwrmp43), costBasewrmp43, costExpwrmp43, costLimitwrmp43))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp53 = "large"
                costBasewrmp53 = new Decimal(1.2)
                costExpwrmp53 = new Decimal(1.5)
                costLimitwrmp53 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrmp53, new Decimal(x), costBasewrmp53, costExpwrmp53, costLimitwrmp53)
            },
            effect(x) {
                effBasewrmp53 = new Decimal(1.2)
                effStackwrmp53 = new Decimal(x)

                return Decimal.pow(effBasewrmp53, effStackwrmp53) 
            },
            
            title() { return "world replication metaprestige buyable 53"},
            display() { return "multiply the superprestige gain power by "+format(effBasewrmp53)+" <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp53 == "asymptote")||(costTypewrmp53 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp53, player.mp.points, costBasewrmp53, costExpwrmp53, costLimitwrmp53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp53, player.mp.points, costBasewrmp53, costExpwrmp53, costLimitwrmp53))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp53, player.buyableMaxPurchaseable(costTypewrmp53, player.mp.points, costBasewrmp53, costExpwrmp53, costLimitwrmp53), costBasewrmp53, costExpwrmp53, costLimitwrmp53))}
                    }
                }
            },
        },
        115: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrmp115 = "asymptote"
                costBasewrmp115 = new Decimal('e200')
                costExpwrmp115 = new Decimal(1.9)
                costLimitwrmp115 = layers.wrmp.buyables[115].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrmp115, new Decimal(x), costBasewrmp115, costExpwrmp115, costLimitwrmp115)
            },
            effect(x) {
                effBasewrmp115 = new Decimal(0.01)
                effStackwrmp115 = new Decimal(x)

                return Decimal.times(effBasewrmp115, effStackwrmp115) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication metaprestige buyable 115"},
            display() { return "add the bonus point gain power by "+format(effBasewrmp115)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrmp115)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp115 == "asymptote")||(costTypewrmp115 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp115, player.mp.points, costBasewrmp115, costExpwrmp115, costLimitwrmp115).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp115, player.mp.points, costBasewrmp115, costExpwrmp115, costLimitwrmp115))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp115, player.buyableMaxPurchaseable(costTypewrmp115, player.mp.points, costBasewrmp115, costExpwrmp115, costLimitwrmp115), costBasewrmp115, costExpwrmp115, costLimitwrmp115))}
                    }
                }
            },
        },
        117: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrmp117 = "asymptote"
                costBasewrmp117 = new Decimal('e1000')
                costExpwrmp117 = new Decimal(2.9)
                costLimitwrmp117 = layers.wrmp.buyables[117].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrmp117, new Decimal(x), costBasewrmp117, costExpwrmp117, costLimitwrmp117)
            },
            effect(x) {
                effBasewrmp117 = new Decimal(0.1)
                effStackwrmp117 = new Decimal(x)

                return Decimal.times(effBasewrmp117, effStackwrmp117) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication metaprestige buyable 117"},
            display() { return "subtract the bonus point fourth softcap by "+format(effBasewrmp117)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrmp117)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp117 == "asymptote")||(costTypewrmp117 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp117, player.mp.points, costBasewrmp117, costExpwrmp117, costLimitwrmp117).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp117, player.mp.points, costBasewrmp117, costExpwrmp117, costLimitwrmp117))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp117, player.buyableMaxPurchaseable(costTypewrmp117, player.mp.points, costBasewrmp117, costExpwrmp117, costLimitwrmp117), costBasewrmp117, costExpwrmp117, costLimitwrmp117))}
                    }
                }
            },
        },
        121: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp121 = "normal"
                costBasewrmp121 = new Decimal(1.2)
                costExpwrmp121 = new Decimal(1.1)
                costLimitwrmp121 = new Decimal('e1e4')
                return player.buyablePrice(costTypewrmp121, new Decimal(x), costBasewrmp121, costExpwrmp121, costLimitwrmp121)
            },
            effect(x) {
                effBasewrmp121 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwrmp121 = new Decimal(x)

                return Decimal.times(effBasewrmp121, effStackwrmp121)
            },
            title() { return "world replication buyable 121"},
            display() { return "increase replicants production by "+format(effBasewrmp121)+" <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp121)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost().add(1)) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp121 == "asymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp121, player.mp.points, costBasewrmp121, costExpwrmp121, costLimitwrmp121).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp121, player.mp.points, costBasewrmp121, costExpwrmp121, costLimitwrmp121))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp121, player.buyableMaxPurchaseable(costTypewrmp121, player.mp.points, costBasewrmp121, costExpwrmp121, costLimitwrmp121), costBasewrmp121, costExpwrmp121, costLimitwrmp121))}
                    }
                }
            },
        },
        122: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp122 = "normal"
                costBasewrmp122 = new Decimal(1.4)
                costExpwrmp122 = new Decimal(1.2)
                costLimitwrmp122 = new Decimal('e1e4')
                return player.buyablePrice(costTypewrmp122, new Decimal(x), costBasewrmp122, costExpwrmp122, costLimitwrmp122)
            },
            effect(x) {
                effBasewrmp122 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwrmp122 = new Decimal(x)

                return Decimal.times(effBasewrmp122, effStackwrmp122)
            },
            title() { return "world replication buyable 122"},
            display() { return "increase replicants production multiplier by "+format(effBasewrmp122)+" <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp122)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost().add(1)) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp122 == "asymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp122, player.mp.points, costBasewrmp122, costExpwrmp122, costLimitwrmp122).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp122, player.mp.points, costBasewrmp122, costExpwrmp122, costLimitwrmp122))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp122, player.buyableMaxPurchaseable(costTypewrmp122, player.mp.points, costBasewrmp122, costExpwrmp122, costLimitwrmp122), costBasewrmp122, costExpwrmp122, costLimitwrmp122))}
                    }
                }
            },
        },
        123: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp123 = "normal"
                costBasewrmp123 = new Decimal(10)
                costExpwrmp123 = new Decimal(1.3)
                costLimitwrmp123 = new Decimal('1e200')
                return player.buyablePrice(costTypewrmp123, new Decimal(x), costBasewrmp123, costExpwrmp123, costLimitwrmp123)
            },
            effect(x) {
                effBasewrmp123 = new Decimal(10).pow(buyableEffect('wrte', 131)).pow(buyableEffect('wrte', 132))
                effStackwrmp123 = new Decimal(x)

                return Decimal.pow(effBasewrmp123, effStackwrmp123)
            },
            title() { return "world replication buyable 123"},
            display() { return "delay first replicants softcap start by "+format(effBasewrmp123)+"x <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp123)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost().add(1)) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp123 == "asymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp123, player.mp.points, costBasewrmp123, costExpwrmp123, costLimitwrmp123).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp123, player.mp.points, costBasewrmp123, costExpwrmp123, costLimitwrmp123))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp123, player.buyableMaxPurchaseable(costTypewrmp123, player.mp.points, costBasewrmp123, costExpwrmp123, costLimitwrmp123), costBasewrmp123, costExpwrmp123, costLimitwrmp123))}
                    }
                }
            },
        },
        124: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp124 = "normal"
                costBasewrmp124 = new Decimal(5)
                costExpwrmp124 = new Decimal(1.4)
                costLimitwrmp124 = new Decimal('1e100')
                return player.buyablePrice(costTypewrmp124, new Decimal(x), costBasewrmp124, costExpwrmp124, costLimitwrmp124)
            },
            effect(x) {
                effBasewrmp124 = new Decimal(0.1)
                effStackwrmp124 = new Decimal(x)

                return Decimal.times(effBasewrmp124, effStackwrmp124)
            },
            title() { return "World Replication Metaprestige buyable 124"},
            display() { return "add first replicants softcap strength by "+format(effBasewrmp124)+" <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp124)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp124 == "asymptote")||(costTypewrmp124 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp124, player.mp.points, costBasewrmp124, costExpwrmp124, costLimitwrmp124).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp124, player.mp.points, costBasewrmp124, costExpwrmp124, costLimitwrmp124))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp124, player.buyableMaxPurchaseable(costTypewrmp124, player.mp.points, costBasewrmp124, costExpwrmp124, costLimitwrmp124), costBasewrmp124, costExpwrmp124, costLimitwrmp124))}
                    }
                }
            },
        },
        125: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp125 = "asymptote"
                costBasewrmp125 = new Decimal(100)
                costExpwrmp125 = new Decimal(2.2)
                costLimitwrmp125 = layers.wrmp.buyables[125].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrmp125, new Decimal(x), costBasewrmp125, costExpwrmp125, costLimitwrmp125)
            },
            effect(x) {
                effBasewrmp125 = new Decimal(1.025)
                effStackwrmp125 = new Decimal(x)

                return Decimal.pow(effBasewrmp125, effStackwrmp125)
            },
            purchaseLimit: new Decimal(50),
            title() { return "World Replication Metaprestige buyable 125"},
            display() { return "divide the first replicants softcap strength by "+format(effBasewrmp125)+" <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp125)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost()) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp125 == "asymptote")||(costTypewrmp125 == "largeasymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp125, player.mp.points, costBasewrmp125, costExpwrmp125, costLimitwrmp125).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp125, player.mp.points, costBasewrmp125, costExpwrmp125, costLimitwrmp125))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp125, player.buyableMaxPurchaseable(costTypewrmp125, player.mp.points, costBasewrmp125, costExpwrmp125, costLimitwrmp125), costBasewrmp125, costExpwrmp125, costLimitwrmp125))}
                    }
                }
            },
        },
        131: {
            unlocked() {return true},
            cost(x) {
                costTypewrmp131 = "normal"
                costBasewrmp131 = new Decimal(1e10)
                costExpwrmp131 = new Decimal(3)
                costLimitwrmp131 = new Decimal('e1e6')
                return player.buyablePrice(costTypewrmp131, new Decimal(x), costBasewrmp131, costExpwrmp131, costLimitwrmp131)
            },
            effect(x) {
                effBasewrmp131 = new Decimal(0.01).times(buyableEffect('wrte', 132))
                effStackwrmp131 = new Decimal(x)

                return Decimal.times(effBasewrmp131, effStackwrmp131)
            },
            title() { return "World Replication Metaprestige buyable 131"},
            display() { return "add buyables 121 to 123 multiplier by "+format(effBasewrmp131)+"x <br> cost: "+format(this.cost())+" metaprestige points <br> owned: "+format(effStackwrmp131)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost().add(1)) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp131 == "asymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp131, player.mp.points, costBasewrmp131, costExpwrmp131, costLimitwrmp131).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp131, player.mp.points, costBasewrmp131, costExpwrmp131, costLimitwrmp131))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp131, player.buyableMaxPurchaseable(costTypewrmp131, player.mp.points, costBasewrmp131, costExpwrmp131, costLimitwrmp131), costBasewrmp131, costExpwrmp131, costLimitwrmp131))}
                    }
                }
            },
        },
        132: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrmp132 = "large"
                costBasewrmp132 = new Decimal('1e5')
                costExpwrmp132 = new Decimal(0.3)
                costLimitwrmp132 = new Decimal('e1e8')
                return player.buyablePrice(costTypewrmp132, new Decimal(x), costBasewrmp132, costExpwrmp132, costLimitwrmp132)
            },
            effect(x) {
                effBasewrmp132 = new Decimal(0.01)
                effStackwrmp132 = new Decimal(x)

                return Decimal.times(effBasewrmp132, effStackwrmp132)
            },
            title() { return "world replication metaprestige buyable 132"},
            display() { return "add buyables 121 to 123 and 131 effect multiplier by "+format(effBasewrmp132)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrmp132)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost().add(1)) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrmp132 == "asymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrmp132, player.mp.points, costBasewrmp132, costExpwrmp132, costLimitwrmp132).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrmp132, player.mp.points, costBasewrmp132, costExpwrmp132, costLimitwrmp132))
                        if (player.wr.buyables[11].lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrmp132, player.buyableMaxPurchaseable(costTypewrmp132, player.mp.points, costBasewrmp132, costExpwrmp132, costLimitwrmp132), costBasewrmp132, costExpwrmp132, costLimitwrmp132))}
                    }
                }
            },
        },
        133: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp133 = "asymptote"
                costBasewrp133 = new Decimal('e2e7')
                costExpwrp133 = new Decimal(3)
                costLimitwrp133 = layers.wrmp.buyables[133].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp133, new Decimal(x), costBasewrp133, costExpwrp133, costLimitwrp133)
            },
            effect(x) {
                effBasewrp133 = new Decimal(1.05)
                effStackwrp133 = new Decimal(x)

                return Decimal.pow(effBasewrp133, effStackwrp133)
            },
            purchaseLimit: new Decimal(50),
            title() { return "world replication buyable 133"},
            display() { return "divide the first replicanti softcap strength by "+format(effBasewrp133)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp133)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.mp.points.gte(this.cost().add(1)) },
            buy() {
                player.mp.points = player.mp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp133 == "asymptote")||player.mp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp133, player.mp.points, costBasewrp133, costExpwrp133, costLimitwrp133).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp133, player.mp.points, costBasewrp133, costExpwrp133, costLimitwrp133))
                        if (player.mp.points.lt('e100')) {player.mp.points = player.mp.points.sub(player.buyablePrice(costTypewrp133, player.buyableMaxPurchaseable(costTypewrp133, player.mp.points, costBasewrp133, costExpwrp133, costLimitwrp133), costBasewrp133, costExpwrp133, costLimitwrp133))}
                    }
                }
            },
        },
    },
    upgrades: {
    },

})

addLayer("wrbp", {
    name: "World Replication Buyabol", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "WRBP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {getBuyableAmount('wr', 211).gte(1)} ,
		points: new Decimal(0),
    }},
    color: "#d05050",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "World Replication Buyabol", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        

        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    getResetGain() {

        return new Decimal(0)
    },
    getNextAt() {
        return Decimal.dInf
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "You cannot reset this layer" },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
    ],
    layerShown(){return false},
    buyables: {
        15: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrbp15 = "asymptote"
                costBasewrbp15 = new Decimal('e200')
                costExpwrbp15 = new Decimal(1.9)
                costLimitwrbp15 = layers.wrbp.buyables[15].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrbp15, new Decimal(x), costBasewrbp15, costExpwrbp15, costLimitwrbp15)
            },
            effect(x) {
                effBasewrbp15 = new Decimal(0.01)
                effStackwrbp15 = new Decimal(x)

                return Decimal.times(effBasewrbp15, effStackwrbp15) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication buyabol buyable 15"},
            display() { return "add the point gain power by "+format(effBasewrbp15)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrbp15)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp15 == "asymptote")||(costTypewrbp15 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp15, player.bp.points, costBasewrbp15, costExpwrbp15, costLimitwrbp15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp15, player.bp.points, costBasewrbp15, costExpwrbp15, costLimitwrbp15))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp15, player.buyableMaxPurchaseable(costTypewrbp15, player.bp.points, costBasewrbp15, costExpwrbp15, costLimitwrbp15), costBasewrbp15, costExpwrbp15, costLimitwrbp15))}
                    }
                }
            },
        },
        17: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrbp17 = "asymptote"
                costBasewrbp17 = new Decimal('e1000')
                costExpwrbp17 = new Decimal(2.9)
                costLimitwrbp17 = layers.wrbp.buyables[17].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrbp17, new Decimal(x), costBasewrbp17, costExpwrbp17, costLimitwrbp17)
            },
            effect(x) {
                effBasewrbp17 = new Decimal(0.1)
                effStackwrbp17 = new Decimal(x)

                return Decimal.times(effBasewrbp17, effStackwrbp17) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication buyabol buyable 17"},
            display() { return "subtract the point fourth softcap by "+format(effBasewrbp17)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrbp17)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp17 == "asymptote")||(costTypewrbp17 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp17, player.bp.points, costBasewrbp17, costExpwrbp17, costLimitwrbp17).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp17, player.bp.points, costBasewrbp17, costExpwrbp17, costLimitwrbp17))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp17, player.buyableMaxPurchaseable(costTypewrbp17, player.bp.points, costBasewrbp17, costExpwrbp17, costLimitwrbp17), costBasewrbp17, costExpwrbp17, costLimitwrbp17))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp23 = "large"
                costBasewrbp23 = new Decimal(1.2)
                costExpwrbp23 = new Decimal(1.5)
                costLimitwrbp23 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrbp23, new Decimal(x), costBasewrbp23, costExpwrbp23, costLimitwrbp23)
            },
            effect(x) {
                effBasewrbp23 = new Decimal(1.2)
                effStackwrbp23 = new Decimal(x)

                return Decimal.pow(effBasewrbp23, effStackwrbp23)
            },
            
            title() { return "world replication buyabol buyable 23"},
            display() { return "multiply the prestige gain power "+format(effBasewrbp23)+" <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp23 == "asymptote")||(costTypewrbp23 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp23, player.bp.points, costBasewrbp23, costExpwrbp23, costLimitwrbp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp23, player.bp.points, costBasewrbp23, costExpwrbp23, costLimitwrbp23))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp23, player.buyableMaxPurchaseable(costTypewrbp23, player.bp.points, costBasewrbp23, costExpwrbp23, costLimitwrbp23), costBasewrbp23, costExpwrbp23, costLimitwrbp23))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp33 = "large"
                costBasewrbp33 = new Decimal(1.2)
                costExpwrbp33 = new Decimal(1.5)
                costLimitwrbp33 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrbp33, new Decimal(x), costBasewrbp33, costExpwrbp33, costLimitwrbp33)
            },
            effect(x) {
                effBasewrbp33 = new Decimal(1.2)
                effStackwrbp33 = new Decimal(x)

                return Decimal.pow(effBasewrbp33, effStackwrbp33) 
            },
            
            title() { return "world replication buyabol buyable 33"},
            display() { return "multiply the metaprestige gain power "+format(effBasewrbp33)+" <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp33 == "asymptote")||(costTypewrbp33 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp33, player.bp.points, costBasewrbp33, costExpwrbp33, costLimitwrbp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp33, player.bp.points, costBasewrbp33, costExpwrbp33, costLimitwrbp33))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp33, player.buyableMaxPurchaseable(costTypewrbp33, player.bp.points, costBasewrbp33, costExpwrbp33, costLimitwrbp33), costBasewrbp33, costExpwrbp33, costLimitwrbp33))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp43 = "large"
                costBasewrbp43 = new Decimal(1.2)
                costExpwrbp43 = new Decimal(1.5)
                costLimitwrbp43 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrbp43, new Decimal(x), costBasewrbp43, costExpwrbp43, costLimitwrbp43)
            },
            effect(x) {
                effBasewrbp43 = new Decimal(1.2)
                effStackwrbp43 = new Decimal(x)

                return Decimal.pow(effBasewrbp43, effStackwrbp43) 
            },
            
            title() { return "world replication buyabol buyable 43"},
            display() { return "multiply the buyabol gain power "+format(effBasewrbp43)+" <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp43 == "asymptote")||(costTypewrbp43 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp43, player.bp.points, costBasewrbp43, costExpwrbp43, costLimitwrbp43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp43, player.bp.points, costBasewrbp43, costExpwrbp43, costLimitwrbp43))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp43, player.buyableMaxPurchaseable(costTypewrbp43, player.bp.points, costBasewrbp43, costExpwrbp43, costLimitwrbp43), costBasewrbp43, costExpwrbp43, costLimitwrbp43))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp53 = "large"
                costBasewrbp53 = new Decimal(1.2)
                costExpwrbp53 = new Decimal(1.5)
                costLimitwrbp53 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrbp53, new Decimal(x), costBasewrbp53, costExpwrbp53, costLimitwrbp53)
            },
            effect(x) {
                effBasewrbp53 = new Decimal(1.2)
                effStackwrbp53 = new Decimal(x)

                return Decimal.pow(effBasewrbp53, effStackwrbp53) 
            },
            
            title() { return "world replication buyabol buyable 53"},
            display() { return "multiply the superprestige gain power by "+format(effBasewrbp53)+" <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp53 == "asymptote")||(costTypewrbp53 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp53, player.bp.points, costBasewrbp53, costExpwrbp53, costLimitwrbp53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp53, player.bp.points, costBasewrbp53, costExpwrbp53, costLimitwrbp53))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp53, player.buyableMaxPurchaseable(costTypewrbp53, player.bp.points, costBasewrbp53, costExpwrbp53, costLimitwrbp53), costBasewrbp53, costExpwrbp53, costLimitwrbp53))}
                    }
                }
            },
        },
        115: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrbp115 = "asymptote"
                costBasewrbp115 = new Decimal('e200')
                costExpwrbp115 = new Decimal(1.9)
                costLimitwrbp115 = new Decimal('1e100')
                return player.buyablePrice(costTypewrbp115, new Decimal(x), costBasewrbp115, costExpwrbp115, costLimitwrbp115)
            },
            effect(x) {
                effBasewrbp115 = new Decimal(0.01)
                effStackwrbp115 = new Decimal(x)

                return Decimal.times(effBasewrbp115, effStackwrbp115) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication buyabol buyable 115"},
            display() { return "add the bonus point gain power by "+format(effBasewrbp115)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrbp115)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp115 == "asymptote")||(costTypewrbp115 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp115, player.bp.points, costBasewrbp115, costExpwrbp115, costLimitwrbp115).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp115, player.bp.points, costBasewrbp115, costExpwrbp115, costLimitwrbp115))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp115, player.buyableMaxPurchaseable(costTypewrbp115, player.bp.points, costBasewrbp115, costExpwrbp115, costLimitwrbp115), costBasewrbp115, costExpwrbp115, costLimitwrbp115))}
                    }
                }
            },
        },
        117: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrbp117 = "asymptote"
                costBasewrbp117 = new Decimal('e1000')
                costExpwrbp117 = new Decimal(2.9)
                costLimitwrbp117 = layers.wrbp.buyables[117].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrbp117, new Decimal(x), costBasewrbp117, costExpwrbp117, costLimitwrbp117)
            },
            effect(x) {
                effBasewrbp117 = new Decimal(0.1)
                effStackwrbp117 = new Decimal(x)

                return Decimal.times(effBasewrbp117, effStackwrbp117) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication buyabol buyable 117"},
            display() { return "subtract the bonus point fourth softcap by "+format(effBasewrbp117)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrbp117)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp117 == "asymptote")||(costTypewrbp117 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp117, player.bp.points, costBasewrbp117, costExpwrbp117, costLimitwrbp117).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp117, player.bp.points, costBasewrbp117, costExpwrbp117, costLimitwrbp117))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp117, player.buyableMaxPurchaseable(costTypewrbp117, player.bp.points, costBasewrbp117, costExpwrbp117, costLimitwrbp117), costBasewrbp117, costExpwrbp117, costLimitwrbp117))}
                    }
                }
            },
        },
        121: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp121 = "normal"
                costBasewrbp121 = new Decimal(1.2)
                costExpwrbp121 = new Decimal(1.1)
                costLimitwrbp121 = new Decimal('e1e4')
                return player.buyablePrice(costTypewrbp121, new Decimal(x), costBasewrbp121, costExpwrbp121, costLimitwrbp121)
            },
            effect(x) {
                effBasewrbp121 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwrbp121 = new Decimal(x)

                return Decimal.times(effBasewrbp121, effStackwrbp121)
            },
            title() { return "world replication buyable 121"},
            display() { return "increase replicants production by "+format(effBasewrbp121)+" <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp121)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost().add(1)) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp121 == "asymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp121, player.bp.points, costBasewrbp121, costExpwrbp121, costLimitwrbp121).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp121, player.bp.points, costBasewrbp121, costExpwrbp121, costLimitwrbp121))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp121, player.buyableMaxPurchaseable(costTypewrbp121, player.bp.points, costBasewrbp121, costExpwrbp121, costLimitwrbp121), costBasewrbp121, costExpwrbp121, costLimitwrbp121))}
                    }
                }
            },
        },
        122: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp122 = "normal"
                costBasewrbp122 = new Decimal(1.4)
                costExpwrbp122 = new Decimal(1.2)
                costLimitwrbp122 = new Decimal('e1e4')
                return player.buyablePrice(costTypewrbp122, new Decimal(x), costBasewrbp122, costExpwrbp122, costLimitwrbp122)
            },
            effect(x) {
                effBasewrbp122 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwrbp122 = new Decimal(x)

                return Decimal.times(effBasewrbp122, effStackwrbp122)
            },
            title() { return "world replication buyable 122"},
            display() { return "increase replicants production multiplier by "+format(effBasewrbp122)+" <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp122)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost().add(1)) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp122 == "asymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp122, player.bp.points, costBasewrbp122, costExpwrbp122, costLimitwrbp122).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp122, player.bp.points, costBasewrbp122, costExpwrbp122, costLimitwrbp122))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp122, player.buyableMaxPurchaseable(costTypewrbp122, player.bp.points, costBasewrbp122, costExpwrbp122, costLimitwrbp122), costBasewrbp122, costExpwrbp122, costLimitwrbp122))}
                    }
                }
            },
        },
        123: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp123 = "normal"
                costBasewrbp123 = new Decimal(10)
                costExpwrbp123 = new Decimal(1.3)
                costLimitwrbp123 = new Decimal('1e200')
                return player.buyablePrice(costTypewrbp123, new Decimal(x), costBasewrbp123, costExpwrbp123, costLimitwrbp123)
            },
            effect(x) {
                effBasewrbp123 = new Decimal(10).pow(buyableEffect('wrte', 131)).pow(buyableEffect('wrte', 132))
                effStackwrbp123 = new Decimal(x)

                return Decimal.pow(effBasewrbp123, effStackwrbp123)
            },
            title() { return "world replication buyable 123"},
            display() { return "delay first replicants softcap start by "+format(effBasewrbp123)+"x <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp123)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost().add(1)) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp123 == "asymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp123, player.bp.points, costBasewrbp123, costExpwrbp123, costLimitwrbp123).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp123, player.bp.points, costBasewrbp123, costExpwrbp123, costLimitwrbp123))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp123, player.buyableMaxPurchaseable(costTypewrbp123, player.bp.points, costBasewrbp123, costExpwrbp123, costLimitwrbp123), costBasewrbp123, costExpwrbp123, costLimitwrbp123))}
                    }
                }
            },
        },
        124: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp124 = "normal"
                costBasewrbp124 = new Decimal(5)
                costExpwrbp124 = new Decimal(1.4)
                costLimitwrbp124 = new Decimal('1e100')
                return player.buyablePrice(costTypewrbp124, new Decimal(x), costBasewrbp124, costExpwrbp124, costLimitwrbp124)
            },
            effect(x) {
                effBasewrbp124 = new Decimal(0.1)
                effStackwrbp124 = new Decimal(x)

                return Decimal.times(effBasewrbp124, effStackwrbp124)
            },
            title() { return "World Replication Buyabol buyable 124"},
            display() { return "add first replicants softcap strength by "+format(effBasewrbp124)+" <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp124)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp124 == "asymptote")||(costTypewrbp124 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp124, player.bp.points, costBasewrbp124, costExpwrbp124, costLimitwrbp124).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp124, player.bp.points, costBasewrbp124, costExpwrbp124, costLimitwrbp124))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp124, player.buyableMaxPurchaseable(costTypewrbp124, player.bp.points, costBasewrbp124, costExpwrbp124, costLimitwrbp124), costBasewrbp124, costExpwrbp124, costLimitwrbp124))}
                    }
                }
            },
        },
        125: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp125 = "asymptote"
                costBasewrbp125 = new Decimal(100)
                costExpwrbp125 = new Decimal(2.2)
                costLimitwrbp125 = layers.wrbp.buyables[125].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrbp125, new Decimal(x), costBasewrbp125, costExpwrbp125, costLimitwrbp125)
            },
            effect(x) {
                effBasewrbp125 = new Decimal(1.025)
                effStackwrbp125 = new Decimal(x)

                return Decimal.pow(effBasewrbp125, effStackwrbp125)
            },
            purchaseLimit: new Decimal(50),
            title() { return "World Replication Buyabol buyable 125"},
            display() { return "divide the first replicants softcap strength by "+format(effBasewrbp125)+" <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp125)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost()) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp125 == "asymptote")||(costTypewrbp125 == "largeasymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp125, player.bp.points, costBasewrbp125, costExpwrbp125, costLimitwrbp125).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp125, player.bp.points, costBasewrbp125, costExpwrbp125, costLimitwrbp125))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp125, player.buyableMaxPurchaseable(costTypewrbp125, player.bp.points, costBasewrbp125, costExpwrbp125, costLimitwrbp125), costBasewrbp125, costExpwrbp125, costLimitwrbp125))}
                    }
                }
            },
        },
        131: {
            unlocked() {return true},
            cost(x) {
                costTypewrbp131 = "normal"
                costBasewrbp131 = new Decimal(1e10)
                costExpwrbp131 = new Decimal(3)
                costLimitwrbp131 = new Decimal('e1e6')
                return player.buyablePrice(costTypewrbp131, new Decimal(x), costBasewrbp131, costExpwrbp131, costLimitwrbp131)
            },
            effect(x) {
                effBasewrbp131 = new Decimal(0.01).times(buyableEffect('wrte', 132))
                effStackwrbp131 = new Decimal(x)

                return Decimal.times(effBasewrbp131, effStackwrbp131)
            },
            title() { return "World Replication Buyabol buyable 131"},
            display() { return "add buyables 121 to 123 multiplier by "+format(effBasewrbp131)+"x <br> cost: "+format(this.cost())+" buyabol points <br> owned: "+format(effStackwrbp131)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost().add(1)) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp131 == "asymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp131, player.bp.points, costBasewrbp131, costExpwrbp131, costLimitwrbp131).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp131, player.bp.points, costBasewrbp131, costExpwrbp131, costLimitwrbp131))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp131, player.buyableMaxPurchaseable(costTypewrbp131, player.bp.points, costBasewrbp131, costExpwrbp131, costLimitwrbp131), costBasewrbp131, costExpwrbp131, costLimitwrbp131))}
                    }
                }
            },
        },
        132: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrbp132 = "large"
                costBasewrbp132 = new Decimal('1e5')
                costExpwrbp132 = new Decimal(0.3)
                costLimitwrbp132 = new Decimal('e1e8')
                return player.buyablePrice(costTypewrbp132, new Decimal(x), costBasewrbp132, costExpwrbp132, costLimitwrbp132)
            },
            effect(x) {
                effBasewrbp132 = new Decimal(0.01)
                effStackwrbp132 = new Decimal(x)

                return Decimal.times(effBasewrbp132, effStackwrbp132)
            },
            title() { return "world replication buyabol buyable 132"},
            display() { return "add buyables 121 to 123 and 131 effect multiplier by "+format(effBasewrbp132)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrbp132)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost().add(1)) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrbp132 == "asymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrbp132, player.bp.points, costBasewrbp132, costExpwrbp132, costLimitwrbp132).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrbp132, player.bp.points, costBasewrbp132, costExpwrbp132, costLimitwrbp132))
                        if (player.wr.buyables[11].lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrbp132, player.buyableMaxPurchaseable(costTypewrbp132, player.bp.points, costBasewrbp132, costExpwrbp132, costLimitwrbp132), costBasewrbp132, costExpwrbp132, costLimitwrbp132))}
                    }
                }
            },
        },
        133: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp133 = "asymptote"
                costBasewrp133 = new Decimal('e2e7')
                costExpwrp133 = new Decimal(3)
                costLimitwrp133 = layers.wrbp.buyables[133].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp133, new Decimal(x), costBasewrp133, costExpwrp133, costLimitwrp133)
            },
            effect(x) {
                effBasewrp133 = new Decimal(1.05)
                effStackwrp133 = new Decimal(x)

                return Decimal.pow(effBasewrp133, effStackwrp133)
            },
            purchaseLimit: new Decimal(50),
            title() { return "world replication buyable 133"},
            display() { return "divide the first replicanti softcap strength by "+format(effBasewrp133)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp133)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.bp.points.gte(this.cost().add(1)) },
            buy() {
                player.bp.points = player.bp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp133 == "asymptote")||player.bp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp133, player.bp.points, costBasewrp133, costExpwrp133, costLimitwrp133).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp133, player.bp.points, costBasewrp133, costExpwrp133, costLimitwrp133))
                        if (player.bp.points.lt('e100')) {player.bp.points = player.bp.points.sub(player.buyablePrice(costTypewrp133, player.buyableMaxPurchaseable(costTypewrp133, player.bp.points, costBasewrp133, costExpwrp133, costLimitwrp133), costBasewrp133, costExpwrp133, costLimitwrp133))}
                    }
                }
            },
        },
    },
    upgrades: {
    },

})

addLayer("wrsp", {
    name: "World Replication Superprestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "WRSP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {getBuyableAmount('wr', 211).gte(1)} ,
		points: new Decimal(0),
    }},
    color: "#d05050",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "World Replication Superprestige", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        

        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    getResetGain() {

        return new Decimal(0)
    },
    getNextAt() {
        return Decimal.dInf
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "You cannot reset this layer" },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
    ],
    layerShown(){return false},
    buyables: {
        15: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrsp15 = "asymptote"
                costBasewrsp15 = new Decimal('e200')
                costExpwrsp15 = new Decimal(1.9)
                costLimitwrsp15 = layers.wrsp.buyables[15].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrsp15, new Decimal(x), costBasewrsp15, costExpwrsp15, costLimitwrsp15)
            },
            effect(x) {
                effBasewrsp15 = new Decimal(0.01)
                effStackwrsp15 = new Decimal(x)

                return Decimal.times(effBasewrsp15, effStackwrsp15) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication superprestige buyable 15"},
            display() { return "add the point gain power by "+format(effBasewrsp15)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrsp15)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp15 == "asymptote")||(costTypewrsp15 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp15, player.sp.points, costBasewrsp15, costExpwrsp15, costLimitwrsp15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp15, player.sp.points, costBasewrsp15, costExpwrsp15, costLimitwrsp15))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp15, player.buyableMaxPurchaseable(costTypewrsp15, player.sp.points, costBasewrsp15, costExpwrsp15, costLimitwrsp15), costBasewrsp15, costExpwrsp15, costLimitwrsp15))}
                    }
                }
            },
        },
        17: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrsp17 = "asymptote"
                costBasewrsp17 = new Decimal('e1000')
                costExpwrsp17 = new Decimal(2.9)
                costLimitwrsp17 = layers.wrsp.buyables[17].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrsp17, new Decimal(x), costBasewrsp17, costExpwrsp17, costLimitwrsp17)
            },
            effect(x) {
                effBasewrsp17 = new Decimal(0.1)
                effStackwrsp17 = new Decimal(x)

                return Decimal.times(effBasewrsp17, effStackwrsp17) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication superprestige buyable 17"},
            display() { return "subtract the point fourth softcap by "+format(effBasewrsp17)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrsp17)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp17 == "asymptote")||(costTypewrsp17 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp17, player.sp.points, costBasewrsp17, costExpwrsp17, costLimitwrsp17).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp17, player.sp.points, costBasewrsp17, costExpwrsp17, costLimitwrsp17))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp17, player.buyableMaxPurchaseable(costTypewrsp17, player.sp.points, costBasewrsp17, costExpwrsp17, costLimitwrsp17), costBasewrsp17, costExpwrsp17, costLimitwrsp17))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp23 = "large"
                costBasewrsp23 = new Decimal(1.2)
                costExpwrsp23 = new Decimal(1.5)
                costLimitwrsp23 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrsp23, new Decimal(x), costBasewrsp23, costExpwrsp23, costLimitwrsp23)
            },
            effect(x) {
                effBasewrsp23 = new Decimal(1.2)
                effStackwrsp23 = new Decimal(x)

                return Decimal.pow(effBasewrsp23, effStackwrsp23)
            },
            
            title() { return "world replication superprestige buyable 23"},
            display() { return "multiply the prestige gain power "+format(effBasewrsp23)+" <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp23)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp23 == "asymptote")||(costTypewrsp23 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp23, player.sp.points, costBasewrsp23, costExpwrsp23, costLimitwrsp23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp23, player.sp.points, costBasewrsp23, costExpwrsp23, costLimitwrsp23))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp23, player.buyableMaxPurchaseable(costTypewrsp23, player.sp.points, costBasewrsp23, costExpwrsp23, costLimitwrsp23), costBasewrsp23, costExpwrsp23, costLimitwrsp23))}
                    }
                }
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp33 = "large"
                costBasewrsp33 = new Decimal(1.2)
                costExpwrsp33 = new Decimal(1.5)
                costLimitwrsp33 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrsp33, new Decimal(x), costBasewrsp33, costExpwrsp33, costLimitwrsp33)
            },
            effect(x) {
                effBasewrsp33 = new Decimal(1.2)
                effStackwrsp33 = new Decimal(x)

                return Decimal.pow(effBasewrsp33, effStackwrsp33) 
            },
            
            title() { return "world replication superprestige buyable 33"},
            display() { return "multiply the metaprestige gain power "+format(effBasewrsp33)+" <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp33)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp33 == "asymptote")||(costTypewrsp33 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp33, player.sp.points, costBasewrsp33, costExpwrsp33, costLimitwrsp33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp33, player.sp.points, costBasewrsp33, costExpwrsp33, costLimitwrsp33))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp33, player.buyableMaxPurchaseable(costTypewrsp33, player.sp.points, costBasewrsp33, costExpwrsp33, costLimitwrsp33), costBasewrsp33, costExpwrsp33, costLimitwrsp33))}
                    }
                }
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp43 = "large"
                costBasewrsp43 = new Decimal(1.2)
                costExpwrsp43 = new Decimal(1.5)
                costLimitwrsp43 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrsp43, new Decimal(x), costBasewrsp43, costExpwrsp43, costLimitwrsp43)
            },
            effect(x) {
                effBasewrsp43 = new Decimal(1.2)
                effStackwrsp43 = new Decimal(x)

                return Decimal.pow(effBasewrsp43, effStackwrsp43) 
            },
            
            title() { return "world replication superprestige buyable 43"},
            display() { return "multiply the buyabol gain power "+format(effBasewrsp43)+" <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp43)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp43 == "asymptote")||(costTypewrsp43 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp43, player.sp.points, costBasewrsp43, costExpwrsp43, costLimitwrsp43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp43, player.sp.points, costBasewrsp43, costExpwrsp43, costLimitwrsp43))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp43, player.buyableMaxPurchaseable(costTypewrsp43, player.sp.points, costBasewrsp43, costExpwrsp43, costLimitwrsp43), costBasewrsp43, costExpwrsp43, costLimitwrsp43))}
                    }
                }
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp53 = "large"
                costBasewrsp53 = new Decimal(1.2)
                costExpwrsp53 = new Decimal(1.5)
                costLimitwrsp53 = new Decimal('e1.00e4')
                return player.buyablePrice(costTypewrsp53, new Decimal(x), costBasewrsp53, costExpwrsp53, costLimitwrsp53)
            },
            effect(x) {
                effBasewrsp53 = new Decimal(1.2)
                effStackwrsp53 = new Decimal(x)

                return Decimal.pow(effBasewrsp53, effStackwrsp53) 
            },
            
            title() { return "world replication superprestige buyable 53"},
            display() { return "multiply the superprestige gain power by "+format(effBasewrsp53)+" <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp53)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp53 == "asymptote")||(costTypewrsp53 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp53, player.sp.points, costBasewrsp53, costExpwrsp53, costLimitwrsp53).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp53, player.sp.points, costBasewrsp53, costExpwrsp53, costLimitwrsp53))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp53, player.buyableMaxPurchaseable(costTypewrsp53, player.sp.points, costBasewrsp53, costExpwrsp53, costLimitwrsp53), costBasewrsp53, costExpwrsp53, costLimitwrsp53))}
                    }
                }
            },
        },
        115: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrsp115 = "asymptote"
                costBasewrsp115 = new Decimal('e200')
                costExpwrsp115 = new Decimal(1.9)
                costLimitwrsp115 = layers.wrsp.buyables[115].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrsp115, new Decimal(x), costBasewrsp115, costExpwrsp115, costLimitwrsp115)
            },
            effect(x) {
                effBasewrsp115 = new Decimal(0.01)
                effStackwrsp115 = new Decimal(x)

                return Decimal.times(effBasewrsp115, effStackwrsp115) 
            },
            purchaseLimit: new Decimal(40),
            title() { return "world replication superprestige buyable 115"},
            display() { return "add the bonus point gain power by "+format(effBasewrsp115)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrsp115)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp115 == "asymptote")||(costTypewrsp115 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp115, player.sp.points, costBasewrsp115, costExpwrsp115, costLimitwrsp115).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp115, player.sp.points, costBasewrsp115, costExpwrsp115, costLimitwrsp115))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp115, player.buyableMaxPurchaseable(costTypewrsp115, player.sp.points, costBasewrsp115, costExpwrsp115, costLimitwrsp115), costBasewrsp115, costExpwrsp115, costLimitwrsp115))}
                    }
                }
            },
        },
        117: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrsp117 = "asymptote"
                costBasewrsp117 = new Decimal('e1000')
                costExpwrsp117 = new Decimal(2.9)
                costLimitwrsp117 = layers.wrsp.buyables[117].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrsp117, new Decimal(x), costBasewrsp117, costExpwrsp117, costLimitwrsp117)
            },
            effect(x) {
                effBasewrsp117 = new Decimal(0.1)
                effStackwrsp117 = new Decimal(x)

                return Decimal.times(effBasewrsp117, effStackwrsp117) 
            },
            purchaseLimit: new Decimal(240),
            title() { return "world replication superprestige buyable 117"},
            display() { return "subtract the bonus point fourth softcap by "+format(effBasewrsp117)+" <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrsp117)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp117 == "asymptote")||(costTypewrsp117 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp117, player.sp.points, costBasewrsp117, costExpwrsp117, costLimitwrsp117).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp117, player.sp.points, costBasewrsp117, costExpwrsp117, costLimitwrsp117))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp117, player.buyableMaxPurchaseable(costTypewrsp117, player.sp.points, costBasewrsp117, costExpwrsp117, costLimitwrsp117), costBasewrsp117, costExpwrsp117, costLimitwrsp117))}
                    }
                }
            },
        },
        121: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp121 = "normal"
                costBasewrsp121 = new Decimal(1.2)
                costExpwrsp121 = new Decimal(1.1)
                costLimitwrsp121 = new Decimal('e1e4')
                return player.buyablePrice(costTypewrsp121, new Decimal(x), costBasewrsp121, costExpwrsp121, costLimitwrsp121)
            },
            effect(x) {
                effBasewrsp121 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwrsp121 = new Decimal(x)

                return Decimal.times(effBasewrsp121, effStackwrsp121)
            },
            title() { return "world replication buyable 121"},
            display() { return "increase replicants production by "+format(effBasewrsp121)+" <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp121)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost().add(1)) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp121 == "asymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp121, player.sp.points, costBasewrsp121, costExpwrsp121, costLimitwrsp121).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp121, player.sp.points, costBasewrsp121, costExpwrsp121, costLimitwrsp121))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp121, player.buyableMaxPurchaseable(costTypewrsp121, player.sp.points, costBasewrsp121, costExpwrsp121, costLimitwrsp121), costBasewrsp121, costExpwrsp121, costLimitwrsp121))}
                    }
                }
            },
        },
        122: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp122 = "normal"
                costBasewrsp122 = new Decimal(1.4)
                costExpwrsp122 = new Decimal(1.2)
                costLimitwrsp122 = new Decimal('e1e4')
                return player.buyablePrice(costTypewrsp122, new Decimal(x), costBasewrsp122, costExpwrsp122, costLimitwrsp122)
            },
            effect(x) {
                effBasewrsp122 = new Decimal(0.01).times(buyableEffect('wrte', 131)).times(buyableEffect('wrte', 132))
                effStackwrsp122 = new Decimal(x)

                return Decimal.times(effBasewrsp122, effStackwrsp122)
            },
            title() { return "world replication buyable 122"},
            display() { return "increase replicants production multiplier by "+format(effBasewrsp122)+" <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp122)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost().add(1)) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp122 == "asymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp122, player.sp.points, costBasewrsp122, costExpwrsp122, costLimitwrsp122).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp122, player.sp.points, costBasewrsp122, costExpwrsp122, costLimitwrsp122))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp122, player.buyableMaxPurchaseable(costTypewrsp122, player.sp.points, costBasewrsp122, costExpwrsp122, costLimitwrsp122), costBasewrsp122, costExpwrsp122, costLimitwrsp122))}
                    }
                }
            },
        },
        123: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp123 = "normal"
                costBasewrsp123 = new Decimal(10)
                costExpwrsp123 = new Decimal(1.3)
                costLimitwrsp123 = new Decimal('1e200')
                return player.buyablePrice(costTypewrsp123, new Decimal(x), costBasewrsp123, costExpwrsp123, costLimitwrsp123)
            },
            effect(x) {
                effBasewrsp123 = new Decimal(10).pow(buyableEffect('wrte', 131)).pow(buyableEffect('wrte', 132))
                effStackwrsp123 = new Decimal(x)

                return Decimal.pow(effBasewrsp123, effStackwrsp123)
            },
            title() { return "world replication buyable 123"},
            display() { return "delay first replicants softcap start by "+format(effBasewrsp123)+"x <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp123)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost().add(1)) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp123 == "asymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp123, player.sp.points, costBasewrsp123, costExpwrsp123, costLimitwrsp123).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp123, player.sp.points, costBasewrsp123, costExpwrsp123, costLimitwrsp123))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp123, player.buyableMaxPurchaseable(costTypewrsp123, player.sp.points, costBasewrsp123, costExpwrsp123, costLimitwrsp123), costBasewrsp123, costExpwrsp123, costLimitwrsp123))}
                    }
                }
            },
        },
        124: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp124 = "normal"
                costBasewrsp124 = new Decimal(5)
                costExpwrsp124 = new Decimal(1.4)
                costLimitwrsp124 = new Decimal('1e100')
                return player.buyablePrice(costTypewrsp124, new Decimal(x), costBasewrsp124, costExpwrsp124, costLimitwrsp124)
            },
            effect(x) {
                effBasewrsp124 = new Decimal(0.1)
                effStackwrsp124 = new Decimal(x)

                return Decimal.times(effBasewrsp124, effStackwrsp124)
            },
            title() { return "World Replication Superprestige buyable 124"},
            display() { return "add first replicants softcap strength by "+format(effBasewrsp124)+" <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp124)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp124 == "asymptote")||(costTypewrsp124 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp124, player.sp.points, costBasewrsp124, costExpwrsp124, costLimitwrsp124).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp124, player.sp.points, costBasewrsp124, costExpwrsp124, costLimitwrsp124))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp124, player.buyableMaxPurchaseable(costTypewrsp124, player.sp.points, costBasewrsp124, costExpwrsp124, costLimitwrsp124), costBasewrsp124, costExpwrsp124, costLimitwrsp124))}
                    }
                }
            },
        },
        125: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp125 = "asymptote"
                costBasewrsp125 = new Decimal(100)
                costExpwrsp125 = new Decimal(2.2)
                costLimitwrsp125 = layers.wrsp.buyables[125].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrsp125, new Decimal(x), costBasewrsp125, costExpwrsp125, costLimitwrsp125)
            },
            effect(x) {
                effBasewrsp125 = new Decimal(1.025)
                effStackwrsp125 = new Decimal(x)

                return Decimal.pow(effBasewrsp125, effStackwrsp125)
            },
            purchaseLimit: new Decimal(50),
            title() { return "World Replication Superprestige buyable 125"},
            display() { return "divide the first replicants softcap strength by "+format(effBasewrsp125)+" <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp125)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost()) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp125 == "asymptote")||(costTypewrsp125 == "largeasymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp125, player.sp.points, costBasewrsp125, costExpwrsp125, costLimitwrsp125).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp125, player.sp.points, costBasewrsp125, costExpwrsp125, costLimitwrsp125))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp125, player.buyableMaxPurchaseable(costTypewrsp125, player.sp.points, costBasewrsp125, costExpwrsp125, costLimitwrsp125), costBasewrsp125, costExpwrsp125, costLimitwrsp125))}
                    }
                }
            },
        },
        131: {
            unlocked() {return true},
            cost(x) {
                costTypewrsp131 = "normal"
                costBasewrsp131 = new Decimal(1e10)
                costExpwrsp131 = new Decimal(3)
                costLimitwrsp131 = new Decimal('e1e6')
                return player.buyablePrice(costTypewrsp131, new Decimal(x), costBasewrsp131, costExpwrsp131, costLimitwrsp131)
            },
            effect(x) {
                effBasewrsp131 = new Decimal(0.01).times(buyableEffect('wrte', 132))
                effStackwrsp131 = new Decimal(x)

                return Decimal.times(effBasewrsp131, effStackwrsp131)
            },
            title() { return "World Replication Superprestige buyable 131"},
            display() { return "add buyables 121 to 123 multiplier by "+format(effBasewrsp131)+"x <br> cost: "+format(this.cost())+" superprestige points <br> owned: "+format(effStackwrsp131)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost().add(1)) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp131 == "asymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp131, player.sp.points, costBasewrsp131, costExpwrsp131, costLimitwrsp131).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp131, player.sp.points, costBasewrsp131, costExpwrsp131, costLimitwrsp131))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp131, player.buyableMaxPurchaseable(costTypewrsp131, player.sp.points, costBasewrsp131, costExpwrsp131, costLimitwrsp131), costBasewrsp131, costExpwrsp131, costLimitwrsp131))}
                    }
                }
            },
        },
        132: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrsp132 = "large"
                costBasewrsp132 = new Decimal('1e5')
                costExpwrsp132 = new Decimal(0.3)
                costLimitwrsp132 = new Decimal('e1e8')
                return player.buyablePrice(costTypewrsp132, new Decimal(x), costBasewrsp132, costExpwrsp132, costLimitwrsp132)
            },
            effect(x) {
                effBasewrsp132 = new Decimal(0.01)
                effStackwrsp132 = new Decimal(x)

                return Decimal.times(effBasewrsp132, effStackwrsp132)
            },
            title() { return "world replication superprestige buyable 132"},
            display() { return "add buyables 121 to 123 and 131 effect multiplier by "+format(effBasewrsp132)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrsp132)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost().add(1)) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrsp132 == "asymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrsp132, player.sp.points, costBasewrsp132, costExpwrsp132, costLimitwrsp132).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrsp132, player.sp.points, costBasewrsp132, costExpwrsp132, costLimitwrsp132))
                        if (player.wr.buyables[11].lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrsp132, player.buyableMaxPurchaseable(costTypewrsp132, player.sp.points, costBasewrsp132, costExpwrsp132, costLimitwrsp132), costBasewrsp132, costExpwrsp132, costLimitwrsp132))}
                    }
                }
            },
        },
        133: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                costTypewrp133 = "asymptote"
                costBasewrp133 = new Decimal('e2e7')
                costExpwrp133 = new Decimal(3)
                costLimitwrp133 = layers.wrsp.buyables[133].purchaseLimit.add(1)
                return player.buyablePrice(costTypewrp133, new Decimal(x), costBasewrp133, costExpwrp133, costLimitwrp133)
            },
            effect(x) {
                effBasewrp133 = new Decimal(1.05)
                effStackwrp133 = new Decimal(x)

                return Decimal.pow(effBasewrp133, effStackwrp133)
            },
            purchaseLimit: new Decimal(50),
            title() { return "world replication buyable 133"},
            display() { return "divide the first replicanti softcap strength by "+format(effBasewrp133)+"x <br> cost: "+format(this.cost())+" replicants <br> owned: "+format(effStackwrp133)+" <br> effect: "+format(this.effect())},
            canAfford() { return player.sp.points.gte(this.cost().add(1)) },
            buy() {
                player.sp.points = player.sp.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypewrp133 == "asymptote")||player.sp.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypewrp133, player.sp.points, costBasewrp133, costExpwrp133, costLimitwrp133).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypewrp133, player.sp.points, costBasewrp133, costExpwrp133, costLimitwrp133))
                        if (player.sp.points.lt('e100')) {player.sp.points = player.sp.points.sub(player.buyablePrice(costTypewrp133, player.buyableMaxPurchaseable(costTypewrp133, player.sp.points, costBasewrp133, costExpwrp133, costLimitwrp133), costBasewrp133, costExpwrp133, costLimitwrp133))}
                    }
                }
            },
        },
    },
    upgrades: {
    },

})

addLayer("wrte", {
    name: "World Replication Total Effect", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "WRTE", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 4, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false ,
		points: new Decimal(0),
    }},
    color: "#d05050",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "World Replication Total Effect", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {

        return player.points
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        

        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    getResetGain() {

        return new Decimal(0)
    },
    getNextAt() {
        return Decimal.dInf
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "You cannot reset this layer" },
    row: 6, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
    ],
    layerShown(){return false},
    buyables: {
        15: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte15 = new Decimal(1)
                effBasewrte15 = effBasewrte15.add(buyableEffect('wr', 15))
                effBasewrte15 = effBasewrte15.add(buyableEffect('wrp', 15))
                effBasewrte15 = effBasewrte15.add(buyableEffect('wrmp', 15))
                effBasewrte15 = effBasewrte15.add(buyableEffect('wrbp', 15))
                effBasewrte15 = effBasewrte15.add(buyableEffect('wrsp', 15))

                return effBasewrte15
            },
            title() { return "World Replication total effect buyable 15"},
            display() { return "add points gain power "},
            buy() {
            },
            buyMax() {
            },
        },
        23: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte23 = new Decimal(1)
                effBasewrte23 = effBasewrte23.times(buyableEffect('wr', 23))
                effBasewrte23 = effBasewrte23.times(buyableEffect('wrp', 23))
                effBasewrte23 = effBasewrte23.times(buyableEffect('wrmp', 23))
                effBasewrte23 = effBasewrte23.times(buyableEffect('wrbp', 23))
                effBasewrte23 = effBasewrte23.times(buyableEffect('wrsp', 23))
                return effBasewrte23
            },
            title() { return "world replication total effect buyable 23"},
            display() { return "add the prestige gain power by "},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        33: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte33 = new Decimal(1)
                effBasewrte33 = effBasewrte33.times(buyableEffect('wr', 33))
                effBasewrte33 = effBasewrte33.times(buyableEffect('wrp', 33))
                effBasewrte33 = effBasewrte33.times(buyableEffect('wrmp', 33))
                effBasewrte33 = effBasewrte33.times(buyableEffect('wrbp', 33))
                effBasewrte33 = effBasewrte33.times(buyableEffect('wrsp', 33))
                return effBasewrte33
            },
            title() { return "world replication total effect buyable 33"},
            display() { return "add the superprestige gain power by "},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        43: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte43 = new Decimal(1)
                effBasewrte43 = effBasewrte43.times(buyableEffect('wr', 43))
                effBasewrte43 = effBasewrte43.times(buyableEffect('wrp', 43))
                effBasewrte43 = effBasewrte43.times(buyableEffect('wrmp', 43))
                effBasewrte43 = effBasewrte43.times(buyableEffect('wrbp', 43))
                effBasewrte43 = effBasewrte43.times(buyableEffect('wrsp', 43))
                return effBasewrte43
            },
            title() { return "world replication total effect buyable 43"},
            display() { return "add the superprestige gain power by "},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        53: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte53 = new Decimal(1)
                effBasewrte53 = effBasewrte53.times(buyableEffect('wr', 53))
                effBasewrte53 = effBasewrte53.times(buyableEffect('wrp', 53))
                effBasewrte53 = effBasewrte53.times(buyableEffect('wrmp', 53))
                effBasewrte53 = effBasewrte53.times(buyableEffect('wrbp', 53))
                effBasewrte53 = effBasewrte53.times(buyableEffect('wrsp', 53))
                return effBasewrte53
            },
            title() { return "world replication total effect buyable 53"},
            display() { return "add the superprestige gain power by "},
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
        115: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte115 = new Decimal(0)
                effBasewrte115 = effBasewrte115.add(buyableEffect('wr', 115))
                effBasewrte115 = effBasewrte115.add(buyableEffect('wrp', 115))
                effBasewrte115 = effBasewrte115.add(buyableEffect('wrmp', 115))
                effBasewrte115 = effBasewrte115.add(buyableEffect('wrbp', 115))
                effBasewrte115 = effBasewrte115.add(buyableEffect('wrsp', 115))

                return effBasewrte115
            },
            title() { return "World Replication total effect buyable 115"},
            display() { return "add bonus point gain power"},
            buy() {
            },
            buyMax() {
            },
        },
        125: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte125 = new Decimal(1)
                effBasewrte125 = effBasewrte125.times(buyableEffect('wr', 125))
                effBasewrte125 = effBasewrte125.times(buyableEffect('wrp', 125))
                effBasewrte125 = effBasewrte125.times(buyableEffect('wrmp', 125))
                effBasewrte125 = effBasewrte125.times(buyableEffect('wrbp', 125))
                effBasewrte125 = effBasewrte125.times(buyableEffect('wrsp', 125))

                effBasewrte125 = effBasewrte125.times(buyableEffect('wr', 133))
                effBasewrte125 = effBasewrte125.times(buyableEffect('wrp', 133))
                effBasewrte125 = effBasewrte125.times(buyableEffect('wrmp', 133))
                effBasewrte125 = effBasewrte125.times(buyableEffect('wrbp', 133))
                effBasewrte125 = effBasewrte125.times(buyableEffect('wrsp', 133))
                return effBasewrte125
            },
            title() { return "World Replication total effect buyable 125"},
            display() { return "add buyables 121 to 123 multiplier by "},
            buy() {
            },
            buyMax() {
            },
        },
        131: {
            unlocked() {return true},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte131 = new Decimal(1)
                effBasewrte131 = effBasewrte131.add(buyableEffect('wr', 131))
                effBasewrte131 = effBasewrte131.add(buyableEffect('wrp', 131))
                effBasewrte131 = effBasewrte131.add(buyableEffect('wrmp', 131))
                effBasewrte131 = effBasewrte131.add(buyableEffect('wrbp', 131))
                effBasewrte131 = effBasewrte131.add(buyableEffect('wrsp', 131))

                return effBasewrte131
            },
            title() { return "World Replication total effect buyable 131"},
            display() { return "add buyables 121 to 123 multiplier by "},
            buy() {
            },
            buyMax() {
            },
        },
        132: {
            unlocked() {return getBuyableAmount('wr', 211).gte(2)},
            cost(x) {
                return Decimal.dInf
            },
            effect(x) {
                effBasewrte132 = new Decimal(1)
                effBasewrte132 = effBasewrte132.add(buyableEffect('wr', 132))
                effBasewrte132 = effBasewrte132.add(buyableEffect('wrp', 132))
                effBasewrte132 = effBasewrte132.add(buyableEffect('wrmp', 132))
                effBasewrte132 = effBasewrte132.add(buyableEffect('wrbp', 132))
                effBasewrte132 = effBasewrte132.add(buyableEffect('wrsp', 132))

                return effBasewrte132
            },
            title() { return "World Replication total effect buyable 132"},
            display() { return "add buyables 121 to 123 and 132 multiplier by "},
            buy() {
            },
            buyMax() {
            },
        },
    },
    upgrades: {
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