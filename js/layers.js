addLayer("p", {
    name: "prestige", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#4BDC13",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multp = new Decimal(0.02)
        if (hasUpgrade('p', 23)) {multp = multp.times(upgradeEffect('p', 23))}
	    if (hasUpgrade('p', 24)) {multp = multp.times(upgradeEffect('p', 24))}
	    if (hasUpgrade('p', 34)) {multp = multp.times(upgradeEffect('p', 34))}
        if (hasUpgrade('ca', 11)) {multp = multp.times(upgradeEffect('ca', 11))}
	    if (hasUpgrade('ca', 13)) {multp = multp.times(upgradeEffect('ca', 13))}
	    if (hasUpgrade('ca', 14)) {multp = multp.times(upgradeEffect('ca', 14))}
        if (hasUpgrade('ca', 21)) {multp = multp.times(upgradeEffect('ca', 21))}
        if (hasUpgrade('ca', 24)) {multp = multp.times(upgradeEffect('ca', 24))}
        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(0.5)
        if (hasUpgrade('p', 42)) {multp = multp.times(upgradeEffect('p', 42))}
        exp2p = new Decimal(0.96)
        return expp

    },
    getResetGain() {
        pp = player.points.times(multp).pow(expp)
        if (pp.gte(10)) {pp = pp.log10().pow(exp2p).pow10()}

        return pp.floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1)
        if (nextp.gte(10)) {nextp = nextp.log10().root(exp2p).pow10()}
        return nextp.root(expp).div(multp)
    },
    canReset() {return getResetGain('p').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    onPrestige(gain) {
        setBuyableAmount('p', 11, Decimal.dOne)
        for (i = 12; i < 20; i++) {
            setBuyableAmount('p', i, Decimal.dZero)
        }
    },
    doReset(resettingLayer){
        if (layers[resettingLayer].row > 0.5) {
            layerDataReset(this.layer)
            setBuyableAmount('p', 11, Decimal.dOne)
        }
        
    },
    automate() {
        if (hasMilestone('p', 0)&&player.p.autoBuyBuyable) {
            for (let i = 11; i < 15; i++) {
                if (canBuyBuyable('p', i)) {buyMaxBuyable('p', i)}
            }
        }
        if (hasMilestone('ca', 1)) {
            for (let i1 = 1; i1 < 5; i1++) {
                for (let i2 = 1; i2 < 5; i2++) {
                    if (!hasUpgrade('p', i1*10+i2)) {buyUpgrade('p', i1*10+i2)}
                }
            }

        }
    },
    milestones: {
        0: {
            requirementDescription: "100 total prestige points",
            effectDescription: "automates prestige buyables",
            done() { return player.p.total.gte(100)||hasMilestone('ca', 10) },
            unlocked() {return player.p.total.gte(100)||hasMilestone('ca', 10)},
            toggles: [["p", "autoBuyBuyable"]]
        },
        10: {
            done() { return player.p.total.gte(1)||hasMilestone('ca', 10) },
            unlocked() {return true},
        },
    },
    update(diff) {
        if (hasMilestone('ca', 2)) {
            addPoints('p', getResetGain('p').times(diff))
        }
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                costTypep11 = "normal"
                costBasep11 = new Decimal(1.5)
                if (hasUpgrade('p', 31)) {costBasep11 = costBasep11.div(upgradeEffect('p', 31))}
                if (hasUpgrade('p', 33)) {costBasep11 = costBasep11.div(upgradeEffect('p', 33))}
                if (hasUpgrade('p', 43)) {costBasep11 = costBasep11.div(upgradeEffect('p', 43))}
                costMultp11 = new Decimal(2)
                costMultp11 = costMultp11.div(buyableEffect('ca', 11))
                costExpp11 = new Decimal(1)
                costLimitp11 = Decimal.dInf
                costStackp11 = new Decimal(x)
                return player.buyablePrice(costTypep11, costStackp11, costBasep11, costExpp11 ,costMultp11, costLimitp11 )
            },
            effect(x){
                effBasep11 = new Decimal(1)
                effStackp11 = new Decimal(x)
                return effBasep11.times(effStackp11)
            },
            title() { 
                return "prestige buyable 11" 
            },
            display() {
                return "increase point gain by "+format(effBasep11)+" <br> Cost: "+format(this.cost())+" points <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep11 == "asymptote")||player.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep11, player.points, costBasep11, costExpp11, costMultp11, costLimitp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep11, player.points, costBasep11, costExpp11, costMultp11, costLimitp11))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePrice(costTypep11, player.buyableMaxPurchaseable(costTypep11, player.points, costBasep11, costExpp11, costMultp11, costLimitp11), costBasep11, costExpp11, costMultp11, costLimitp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return hasMilestone('p', 10)},
            cost(x) { 
                costTypep12 = "normal"
                costBasep12 = new Decimal(1.5)
                if (hasUpgrade('p', 31)) {costBasep12 = costBasep12.div(upgradeEffect('p', 31))}
                if (hasUpgrade('p', 33)) {costBasep12 = costBasep12.div(upgradeEffect('p', 33))}
                if (hasUpgrade('p', 43)) {costBasep12 = costBasep12.div(upgradeEffect('p', 43))}
                costMultp12 = new Decimal(3.66666666666666666666)
                costMultp12 = costMultp12.div(buyableEffect('ca', 11))
                costExpp12 = new Decimal(1)
                costLimitp12 = Decimal.dInf
                costStackp12 = new Decimal(x)
                return player.buyablePrice(costTypep12, costStackp12, costBasep12, costExpp12,costMultp12, costLimitp12 )
            },
            effect(x){
                effBasep12 = new Decimal(1)
                effStackp12 = new Decimal(x)
                return effBasep12.times(effStackp12)
            },
            title() { 
                return "prestige buyable 12" 
            },
            display() {
                return "increase point gain by "+format(effBasep12)+" <br> Cost: "+format(this.cost())+" points <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep12 == "asymptote")||player.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep12, player.points, costBasep12, costExpp12, costMultp12, costLimitp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep12, player.points, costBasep12, costExpp12, costMultp12, costLimitp12))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePrice(costTypep12, player.buyableMaxPurchaseable(costTypep12, player.points, costBasep12, costExpp12, costMultp12, costLimitp12), costBasep12, costExpp12, costMultp12, costLimitp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return hasMilestone('ca', 10)},
            cost(x) { 
                costTypep13 = "normal"
                costBasep13 = new Decimal(1.5)
                if (hasUpgrade('p', 31)) {costBasep13 = costBasep13.div(upgradeEffect('p', 31))}
                if (hasUpgrade('p', 33)) {costBasep13 = costBasep13.div(upgradeEffect('p', 33))}
                if (hasUpgrade('p', 43)) {costBasep13 = costBasep13.div(upgradeEffect('p', 43))}
                costMultp13 = new Decimal(6)
                costMultp13 = costMultp13.div(buyableEffect('ca', 11))
                costExpp13 = new Decimal(1)
                costLimitp13 = Decimal.dInf
                costStackp13 = new Decimal(x)
                return player.buyablePrice(costTypep13, costStackp13, costBasep13, costExpp13,costMultp13, costLimitp13 )
            },
            effect(x){
                effBasep13 = new Decimal(1)
                effStackp13 = new Decimal(x)
                return effBasep13.times(effStackp13)
            },
            title() { 
                return "prestige buyable 13" 
            },
            display() {
                return "increase point gain by "+format(effBasep13)+" <br> Cost: "+format(this.cost())+" points <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep13 == "asymptote")||player.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep13, player.points, costBasep13, costExpp13, costMultp13, costLimitp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep13, player.points, costBasep13, costExpp13, costMultp13, costLimitp13))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePrice(costTypep13, player.buyableMaxPurchaseable(costTypep13, player.points, costBasep13, costExpp13, costMultp13, costLimitp13), costBasep13, costExpp13, costMultp13, costLimitp13))}
                    }
                }
            },
        },
        14: { // purposefully not included in p/ca upgrade 21
            unlocked() {return hasMilestone('me', 10)},
            cost(x) { 
                costTypep14 = "normal"
                costBasep14 = new Decimal(2)
                if (hasUpgrade('p', 31)) {costBasep14 = costBasep14.div(upgradeEffect('p', 31))}
                if (hasUpgrade('p', 33)) {costBasep14 = costBasep14.div(upgradeEffect('p', 33))}
                if (hasUpgrade('p', 43)) {costBasep14 = costBasep14.div(upgradeEffect('p', 43))}
                costMultp14 = new Decimal(1e-3)
                costMultp14 = costMultp14.div(buyableEffect('ca', 11))
                costExpp14 = new Decimal(1.15)
                costLimitp14 = new Decimal('1e100')
                costStackp14 = new Decimal(x)
                return player.buyablePrice(costTypep14, costStackp14, costBasep14, costExpp14,costMultp14, costLimitp14 )
            },
            effect(x){
                effBasep14 = new Decimal(1.15)
                effStackp14 = new Decimal(x)
                return effBasep14.pow(effStackp14)
            },
            title() { 
                return "prestige buyable 14" 
            },
            display() {
                return "multiply point gain by "+format(effBasep14)+" <br> Cost: "+format(this.cost())+" points <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep14 == "asymptote")||player.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep14, player.points, costBasep14, costExpp14, costMultp14, costLimitp14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep14, player.points, costBasep14, costExpp14, costMultp14, costLimitp14))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePrice(costTypep14, player.buyableMaxPurchaseable(costTypep14, player.points, costBasep14, costExpp14, costMultp14, costLimitp14), costBasep14, costExpp14, costMultp14, costLimitp14))}
                    }
                }
            },
        },
    },
    upgrades: {
        11: {
            title: "prestige upgrade 11",
            description: "multiplies point gain by 2",
            cost: new Decimal(2),
            effect() {
                eff = new Decimal(2)
                if (hasUpgrade('me', 11)) {eff = eff.pow(upgradeEffect('me', 11))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "prestige upgrade 12",
            description: "multiplies point gain by log2(points+2)",
            cost: new Decimal(4),
            effect() {
                eff = player.points.add(2).log(2)
                if (hasUpgrade('me', 12)) {eff = eff.pow(upgradeEffect('me', 12))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "prestige upgrade 13",
            description: "multiplies point gain by log2(prestige points+4)",
            cost: new Decimal(10),
            effect() {
                eff = player.p.points.add(4).log(2)
                if (hasUpgrade('me', 13)) {eff = eff.pow(upgradeEffect('me', 13))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "prestige upgrade 14",
            description: "multiplies point gain by log2(points+2)",
            cost: new Decimal(50),
            effect() {
                eff = player.points.add(2).log(2)
                if (hasUpgrade('me', 14)) {eff = eff.pow(upgradeEffect('me', 14))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "prestige upgrade 21",
            description: "multiplies point gain by (total prestige 1x buyables)*0.25+1",
            cost: new Decimal(500),
            effect() {
                eff = new Decimal(1)
                for (i = 11; i < 14; i++) {
                    eff = eff.add(getBuyableAmount('p', i).times(0.25))
                }
                if (hasUpgrade('me', 21)) {eff = eff.pow(upgradeEffect('me', 21))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 14)}
        },
        22: {
            title: "prestige upgrade 22",
            description: "multiplies point gain by log2(prestige points+4)^2",
            cost: new Decimal(3e3),
            effect() {
                eff = player.p.points.add(4).log(2).pow(2)
                if (hasUpgrade('me', 22)) {eff = eff.pow(upgradeEffect('me', 22))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 14)}
        },
        23: {
            title: "prestige upgrade 23",
            description: "multiplies prestige point gain by 2",
            cost: new Decimal(1e4),
            effect() {
                eff = new Decimal(2)
                if (hasUpgrade('me', 23)) {eff = eff.pow(upgradeEffect('me', 23))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 14)}
        },
        24: {
            title: "prestige upgrade 24",
            description: "multiplies prestige point gain by log2(prestige points+4)",
            cost: new Decimal(1e5),
            effect() {
                eff = player.p.points.add(4).log(2)
                if (hasUpgrade('me', 24)) {eff = eff.pow(upgradeEffect('me', 24))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 14)}
        },
        31: {
            title: "prestige upgrade 31",
            description: "divides prestige buyable scaling by 1.03",
            cost: new Decimal(1e10),
            effect() {
                eff = new Decimal(1.03)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 24)}
        },
        32: {
            title: "prestige upgrade 32",
            description: "multiplies point gain by log2(points+2)^3",
            cost: new Decimal(1e20),
            effect() {
                eff = player.points.add(2).log(2).pow(3)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 24)}
        },
        33: {
            title: "prestige upgrade 33",
            description: "divides prestige buyable scaling by 1.03",
            cost: new Decimal(1e30),
            effect() {
                eff = new Decimal(1.03)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 24)}
        },
        34: {
            title: "prestige upgrade 34",
            description: "multiplies prestige point gain by log2(prestige points+4)^4",
            cost: new Decimal(1e40),
            effect() {
                eff = player.p.points.add(4).log(2).pow(4)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 24)}
        },
        41: {
            title: "prestige upgrade 41",
            description: "raise point gain to ^1.1",
            cost: new Decimal('1e60'),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 34)}
        },
        42: {
            title: "prestige upgrade 41",
            description: "raise prestige point gain to ^1.05",
            cost: new Decimal('1e100'),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 34)}
        },
        43: {
            title: "prestige upgrade 43",
            description: "divides prestige buyable scaling by 1.03",
            cost: new Decimal('1e150'),
            effect() {
                eff = new Decimal(1.03)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 34)}
        },
        44: {
            title: "prestige upgrade 44",
            description: "raise point gain to ^1.1",
            cost: new Decimal('1e200'),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 34)}
        },
    }
})

addLayer("ca", {
    name: "cable", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return player.p.total.gte(1e6)||player.ca.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#4dcdff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "cable points", // Name of cable currency
    baseResource: "points", // Name of resource cable is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multca = new Decimal(1e-6)
        if (hasUpgrade('ca', 23)) {multca = multca.times(upgradeEffect('ca', 23))}
	    if (hasUpgrade('ca', 24)) {multca = multca.times(upgradeEffect('ca', 24))}
        return multca
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expca = new Decimal(0.2)
        exp2ca = new Decimal(0.9)
        return expca

    },
    getResetGain() {
        cap = player.p.points.times(multca).pow(expca)
        if (cap.gte(10)) {cap = cap.log10().pow(exp2ca).pow10()}

        return cap.floor().max(0)
    },
    getNextAt() {
        nextca = getResetGain('ca').add(1)
        if (nextca.gte(10)) {nextca = nextca.log10().root(exp2ca).pow10()}
        return nextca.root(expca).div(multca)
    },
    canReset() {return getResetGain('ca').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('ca'))+" cable points. Next at "+format(getNextAt('ca'))+" prestige points" },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for cable points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    onPrestige(gain) {
        // setBuyableAmount('ca', 11, Decimal.dOne)
        // for (i = 12; i < 20; i++) {
        //     setBuyableAmount('ca', i, Decimal.dZero)
        // }
    },
    automate() {
        if (hasMilestone('me', 1)) {
            if (canBuyBuyable('ca', 11)) {buyMaxBuyable('ca', 11)}
        }
        if (hasMilestone('me', 1)) {
            for (let i1 = 1; i1 < 3; i1++) {
                for (let i2 = 1; i2 < 5; i2++) {
                    if (!hasUpgrade('ca', i1*10+i2)) {buyUpgrade('ca', i1*10+i2)}
                }
            }

        }
    },
    milestones: {
        0: {
            requirementDescription: "4 total cable points",
            effectDescription: "buying prestige 1x buyables no longer reduces points",
            done() { return player.ca.total.gte(4)||hasMilestone('me', 10) },
            unlocked() {return player.ca.total.gte(4)||hasMilestone('me', 10)},
        },
        1: {
            requirementDescription: "100 total cable points",
            effectDescription: "automate prestige upgrades",
            done() { return player.ca.total.gte(100)||hasMilestone('me', 10) },
            unlocked() {return player.ca.total.gte(100)||hasMilestone('me', 10)},
        },
        2: {
            requirementDescription: "1e6 total cable points",
            effectDescription: "automatically gain prestige points gained on reset every second",
            done() { return player.ca.total.gte(1e6)||hasMilestone('me', 10) },
            unlocked() {return player.ca.total.gte(1e6)||hasMilestone('me', 10)},
        },
        10: {
            done() { return player.ca.total.gte(1)||hasMilestone('me', 10) },
            unlocked() {return true},
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                costTypeca11 = "normal"
                costBaseca11 = new Decimal(2.25)
                costMultca11 = new Decimal(0.5)
                costExpca11 = new Decimal(1)
                costLimitca11 = new Decimal('e100')
                costStackca11 = new Decimal(x)
                return player.buyablePrice(costTypeca11, costStackca11, costBaseca11, costExpca11 ,costMultca11, costLimitca11 , true)
            },
            effect(x){
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                effBaseca11 = new Decimal(5)
                effStackca11 = new Decimal(x)
                return effBaseca11.pow(effStackca11)
            },
            title() { 
                return "cable buyable 11" 
            },
            display() {
                return "divide prestige buyable 1x costs by "+format(effBaseca11)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ca.points.gte(this.cost())&&(!inChallenge('mec', 11)) },
            buy() {
                if (!hasMilestone('me', 0)) {player.ca.points = player.ca.points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypeca11 == "asymptote")||player.ca.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeca11, player.ca.points, costBaseca11, costExpca11, costMultca11, costLimitca11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeca11, player.ca.points, costBaseca11, costExpca11, costMultca11, costLimitca11))
                        if (player.ca.points.lt('e100')&&!hasMilestone('me', 0)) {player.ca.points = player.ca.points.sub(player.buyablePrice(costTypeca11, player.buyableMaxPurchaseable(costTypeca11, player.ca.points, costBaseca11, costExpca11, costMultca11, costLimitca11), costBaseca11, costExpca11, costMultca11, costLimitca11, true))}
                    }
                }
            },
        },
    },
    upgrades: {
        11: {
            title: "cable upgrade 11",
            description: "multiplies point, prestige point gain by (cable points + 0.5)^0.5*4, capped at 1e6",
            cost: new Decimal(1),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.ca.points.add(0.5).pow(0.5).times(4).min(1e6)
                if (hasUpgrade('mec', 11)) {eff = eff.pow(upgradeEffect('mec', 11))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "cable upgrade 12",
            description: "multiplies point gain by log2(points+2)^4",
            cost: new Decimal(2),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.points.add(2).log(2).pow(4)
                if (hasUpgrade('mec', 12)) {eff = eff.pow(upgradeEffect('mec', 12))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "cable upgrade 13",
            description: "multiplies prestige point gain by log2(cable points+4)^4",
            cost: new Decimal(10),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.ca.points.add(4).log(2).pow(4)
                if (hasUpgrade('mec', 13)) {eff = eff.pow(upgradeEffect('mec', 13))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "cable upgrade 14",
            description: "multiplies prestige point gain by log2(prestige points+2)^2",
            cost: new Decimal(20),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.p.points.add(2).log(2).pow(2)
                if (hasUpgrade('mec', 14)) {eff = eff.pow(upgradeEffect('mec', 14))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "cable upgrade 21",
            description: "multiplies point gain and prestige point gain by ((total prsetige 1x buyables)*0.5+1)^2",
            cost: new Decimal(100),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = new Decimal(1)
                for (i = 11; i < 14; i++) {
                    eff = eff.add(getBuyableAmount('p', i).times(0.5))
                }
                eff = eff.pow(2)
                if (hasUpgrade('mec', 21)) {eff = eff.pow(upgradeEffect('mec', 21))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "cable upgrade 22",
            description: "multiplies point gain by log2(prestige points+4)^8",
            cost: new Decimal(1e3),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.p.points.add(4).log(2).pow(8)
                if (hasUpgrade('mec', 22)) {eff = eff.pow(upgradeEffect('mec', 22))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "cable upgrade 23",
            description: "multiplies cable point gain by 2",
            cost: new Decimal(1e4),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = new Decimal(2)
                if (hasUpgrade('mec', 23)) {eff = eff.pow(upgradeEffect('mec', 23))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "cable upgrade 24",
            description: "multiplies points, prestige points, and cable point gain by log2(cable points+4)",
            cost: new Decimal(1e5),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.ca.points.add(4).log(2)
                if (hasUpgrade('mec', 24)) {eff = eff.pow(upgradeEffect('mec', 24))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    }
})

addLayer("me", {
    name: "message", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ME", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return player.ca.total.gte(1e6)||player.me.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#5465ff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "message points", // Name of message currency
    baseResource: "cable points", // Name of resource message is based on
    baseAmount() {return player.ca.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multme = new Decimal(1e-6)
        return multme
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expme = new Decimal(0.1)
        exp2me = new Decimal(0.5)
        return expme

    },
    getResetGain() {
        mep = player.ca.points.times(multme).pow(expme)
        if (mep.gte(10)) {mep = mep.log10().pow(exp2me).pow10()}

        return mep.floor().max(0)
    },
    getNextAt() {
        nextme = getResetGain('me').add(1)
        if (nextme.gte(10)) {nextme = nextme.log10().root(exp2me).pow10()}
        return nextme.root(expme).div(multme)
    },
    canReset() {return getResetGain('me').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('me'))+" message points. Next at "+format(getNextAt('me'))+" cable points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for message points", onPress(){
            if (inChallenge('mec', 11)) {if (canReset('mec')) {doReset('mec')}} else {if (canReset(this.layer)) {doReset(this.layer)}}
            }
        },
    ],
    layerShown(){return true},
    onPrestige(gain) {

    },
    automate() {

    },
    tabFormat: {
        "message points": {
            shouldNotify: true,
            content:
                [["infobox", 11],
                "main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "milestones", "buyables", "upgrades"],
        },
        "message decabled challenge": {
            embedLayer: "mec",
            shouldNotify: true,
            unlocked() {return hasUpgrade('me', 24)},
            content:
                ["main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "challenges", "blank", "buyables"],
        },

    },
    milestones: {
        0: {
            requirementDescription: "4 total message points",
            effectDescription: "buying cable 1x buyables no longer reduces points",
            done() { return player.me.total.gte(4) },
            unlocked() {return player.me.total.gte(4)},
        },
        1: {
            requirementDescription: "10 total cable points",
            effectDescription: "automate cable upgrades and buyables",
            done() { return player.me.total.gte(10) },
            unlocked() {return player.me.total.gte(10)},
        },
        2: {
            requirementDescription: "1e6 total cable points",
            effectDescription: "automatically gain cable points gained on reset every second",
            done() { return player.me.total.gte(1e6) },
            unlocked() {return player.me.total.gte(1e6)},
        },
        10: {
            done() { return player.me.total.gte(1) },
            effectDescription: "multiply point gain by 1,000",
            unlocked() {return true},
        },
    },
    buyables: {


    },
    upgrades: {
        11: {
            title: "message upgrade 11",
            description: "raise prestige upgrade 11 effect to log2(message points +2)+1",
            cost: new Decimal(1),
            effect() {
                eff = player.me.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message points +2)+1",
            cost: new Decimal(2),
            effect() {
                eff = player.me.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message points +2)+1",
            cost: new Decimal(3),
            effect() {
                eff = player.me.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message points +2)+1",
            cost: new Decimal(4),
            effect() {
                eff = player.me.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message points +2)+1",
            cost: new Decimal(5),
            effect() {
                eff = player.me.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message points +2)+1",
            cost: new Decimal(6),
            effect() {
                eff = player.me.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message points +2)+1",
            cost: new Decimal(7),
            effect() {
                eff = player.me.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message points +2)+1",
            cost: new Decimal(8),
            effect() {
                eff = player.me.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    }
})

addLayer("mec", {
    namec: "message decabled", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "MEC", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return player.me.total.gte(100)||player.mec.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#5465ff",
    requires: new Decimal(0), // Can be a function that takes requiremecnt increases into account
    resource: "message decabled points", // Namec of message decabled currency
    baseResource: "cable points", // Namec of resource message decabled is based on
    baseAmount() {return player.ca.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multmec = new Decimal(1e-6)
        return multmec
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expmec = new Decimal(0.1)
        exp2mec = new Decimal(0.5)
        return expmec

    },
    getResetGain() {
        mecp = player.ca.points.times(multmec).pow(expmec)
        if (mecp.gte(10)) {mecp = mecp.log10().pow(exp2mec).pow10()}

        return mecp.floor().max(0)
    },
    getNextAt() {
        nextmec = getResetGain('mec').add(1)
        if (nextmec.gte(10)) {nextmec = nextmec.log10().root(exp2mec).pow10()}
        return nextmec.root(expmec).div(multmec)
    },
    canReset() {
        return inChallenge('mec', 11)
    },
    prestigeNotify() {return true},
    prestigeButtonText() {
        if (inChallenge('mec', 11)) {
            return "Reset for "+formatWhole(getResetGain('mec'))+" message decabled points. Next at "+format(getNextAt('mec'))+" cable points" 
        } else{
            return "Must be in message decabled challenge to reset for message decabled points"
        }
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return false},
    onPrestige(gain) {

    },
    automate() {

    },
    challenges: {
        11: {
            name: "Message decabled challenge",
            challengeDescription: "Cable upgrades and buyables do nothing",
            canComplete() {return false}
        },

    },
    milestones: {

    },
    buyables: {


    },
    upgrades: {
        11: {
            title: "message decabled upgrade 11",
            description: "raise prestige upgrade 11 effect to log2(message decabled points +2)+1",
            cost: new Decimal(1),
            effect() {
                eff = player.mec.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message decabled upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message decabled points +2)+1",
            cost: new Decimal(2),
            effect() {
                eff = player.mec.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message decabled upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message decabled points +2)+1",
            cost: new Decimal(3),
            effect() {
                eff = player.mec.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message decabled upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message decabled points +2)+1",
            cost: new Decimal(4),
            effect() {
                eff = player.mec.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message decabled upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message decabled points +2)+1",
            cost: new Decimal(5),
            effect() {
                eff = player.mec.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message decabled upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message decabled points +2)+1",
            cost: new Decimal(6),
            effect() {
                eff = player.mec.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message decabled upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message decabled points +2)+1",
            cost: new Decimal(7),
            effect() {
                eff = player.mec.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message decabled upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message decabled points +2)+1",
            cost: new Decimal(8),
            effect() {
                eff = player.mec.points.add(2).log(2).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    }
})