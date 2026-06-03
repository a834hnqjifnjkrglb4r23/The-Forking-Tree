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
        if (hasUpgrade('ca', 32)) {multp = multp.times(upgradeEffect('ca', 32))}
        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(0.5)
        if (hasUpgrade('p', 42)) {expp = expp.times(upgradeEffect('p', 42))}
        if (hasUpgrade('ca', 42)) {expp = expp.times(upgradeEffect('ca', 42))}
        if (hasUpgrade('ha', 14)) {expp = expp.times(upgradeEffect('ha', 14))}
        if (hasUpgrade('ha', 23)) {expp = expp.times(upgradeEffect('ha', 23))}
        if (hasUpgrade('si', 23)) {expp = expp.times(upgradeEffect('si', 23))}
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
            for (let i = 11; i < 16; i++) {
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
                if (hasUpgrade('ca', 31)) {costBasep11 = costBasep11.div(upgradeEffect('ca', 31))}
                if (hasUpgrade('ca', 33)) {costBasep11 = costBasep11.div(upgradeEffect('ca', 33))}
                costBasep11 = costBasep11.root(buyableEffect('ha', 12))
                costMultp11 = new Decimal(2)
                costMultp11 = costMultp11.div(buyableEffect('ca', 11))
                costExpp11 = new Decimal(1)
                costLimitp11 = new Decimal('e1000')
                costLimitp11 = costLimitp11.pow(buyableEffect('ha', 13))
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
            style() {const size = {width: "150px", height: "150px"}
                return size},
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
                if (hasUpgrade('ca', 31)) {costBasep12 = costBasep12.div(upgradeEffect('ca', 31))}
                if (hasUpgrade('ca', 33)) {costBasep12 = costBasep12.div(upgradeEffect('ca', 33))}
                costBasep12 = costBasep12.root(buyableEffect('ha', 12))
                costMultp12 = new Decimal(3.66666666666666666666)
                costMultp12 = costMultp12.div(buyableEffect('ca', 11))
                costExpp12 = new Decimal(1)
                costLimitp12 = new Decimal('e1000')
                costLimitp12 = costLimitp12.pow(buyableEffect('ha', 13))
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
            style() {const size = {width: "150px", height: "150px"}
                return size},
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
            unlocked() {return hasMilestone('me', 10)},
            cost(x) { 
                costTypep13 = "normal"
                costBasep13 = new Decimal(1.5)
                if (hasUpgrade('p', 31)) {costBasep13 = costBasep13.div(upgradeEffect('p', 31))}
                if (hasUpgrade('p', 33)) {costBasep13 = costBasep13.div(upgradeEffect('p', 33))}
                if (hasUpgrade('p', 43)) {costBasep13 = costBasep13.div(upgradeEffect('p', 43))}
                if (hasUpgrade('ca', 31)) {costBasep13 = costBasep13.div(upgradeEffect('ca', 31))}
                if (hasUpgrade('ca', 33)) {costBasep13 = costBasep13.div(upgradeEffect('ca', 33))}
                costBasep13 = costBasep13.root(buyableEffect('ha', 12))
                costMultp13 = new Decimal(6)
                costMultp13 = costMultp13.div(buyableEffect('ca', 11))
                costExpp13 = new Decimal(1)
                costLimitp13 = new Decimal('e1000')
                costLimitp13 = costLimitp13.pow(buyableEffect('ha', 13))
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
            style() {const size = {width: "150px", height: "150px"}
                return size},
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
                costBasep14 = new Decimal(1.5)
                if (hasUpgrade('p', 31)) {costBasep14 = costBasep14.div(upgradeEffect('p', 31))}
                if (hasUpgrade('p', 33)) {costBasep14 = costBasep14.div(upgradeEffect('p', 33))}
                if (hasUpgrade('p', 43)) {costBasep14 = costBasep14.div(upgradeEffect('p', 43))}
                if (hasUpgrade('ca', 31)) {costBasep14 = costBasep14.div(upgradeEffect('ca', 31))}
                if (hasUpgrade('ca', 33)) {costBasep14 = costBasep14.div(upgradeEffect('ca', 33))}
                costBasep14 = costBasep14.root(buyableEffect('ha', 12))
                costMultp14 = new Decimal(1e-3)
                costMultp14 = costMultp14.div(buyableEffect('ca', 11))
                costExpp14 = new Decimal(1.15)
                costLimitp14 = new Decimal('1e100')
                costLimitp14 = costLimitp14.pow(buyableEffect('ha', 13))
                costStackp14 = new Decimal(x)
                return player.buyablePrice(costTypep14, costStackp14, costBasep14, costExpp14,costMultp14, costLimitp14 )
            },
            effect(x){
                effBasep14 = new Decimal(1.2)
                effBasep14 = effBasep14.add(buyableEffect('ha', 11))
                effStackp14 = new Decimal(x)
                return effBasep14.pow(effStackp14)
            },
            title() { 
                return "prestige buyable 14" 
            },
            display() {
                return "multiply point gain by "+format(effBasep14)+" <br> Cost: "+format(this.cost())+" points <br> Effect: "+format(this.effect())
            },
            style() {const size = {width: "150px", height: "150px"}
                return size},
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
        15: { // purposefully not included in p/ca upgrade 21
            unlocked() {return hasMilestone('ha', 10)||hasMilestone('si', 10)},
            cost(x) { 
                costTypep15 = "normal"
                costBasep15 = new Decimal(1.5)
                if (hasUpgrade('p', 31)) {costBasep15 = costBasep15.div(upgradeEffect('p', 31))}
                if (hasUpgrade('p', 33)) {costBasep15 = costBasep15.div(upgradeEffect('p', 33))}
                if (hasUpgrade('p', 43)) {costBasep15 = costBasep15.div(upgradeEffect('p', 43))}
                if (hasUpgrade('ca', 31)) {costBasep15 = costBasep15.div(upgradeEffect('ca', 31))}
                if (hasUpgrade('ca', 33)) {costBasep15 = costBasep15.div(upgradeEffect('ca', 33))}
                costBasep15 = costBasep15.root(buyableEffect('ha', 12))
                costMultp15 = new Decimal(1.3e-3)
                costMultp15 = costMultp15.div(buyableEffect('ca', 11))
                costExpp15 = new Decimal(1.2)
                costLimitp15 = new Decimal('1e100')
                costLimitp15 = costLimitp15.pow(buyableEffect('ha', 13))
                costStackp15 = new Decimal(x)
                return player.buyablePrice(costTypep15, costStackp15, costBasep15, costExpp15,costMultp15, costLimitp15 )
            },
            effect(x){
                effBasep15 = new Decimal(1.2)
                effBasep15 = effBasep15.add(buyableEffect('ha', 11))
                effStackp15 = new Decimal(x)
                return effBasep15.pow(effStackp15)
            },
            title() { 
                return "prestige buyable 15" 
            },
            display() {
                return "multiply point gain by "+format(effBasep15)+" <br> Cost: "+format(this.cost())+" points <br> Effect: "+format(this.effect())
            },
            style() {const size = {width: "150px", height: "150px"}
                return size},
            canAfford() { return player.points.gte(this.cost()) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypep15 == "asymptote")||player.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypep15, player.points, costBasep15, costExpp15, costMultp15, costLimitp15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep15, player.points, costBasep15, costExpp15, costMultp15, costLimitp15))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePrice(costTypep15, player.buyableMaxPurchaseable(costTypep15, player.points, costBasep15, costExpp15, costMultp15, costLimitp15), costBasep15, costExpp15, costMultp15, costLimitp15))}
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
            title: "prestige upgrade 42",
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
        if (hasUpgrade('ca', 43)) {expca = expca.times(upgradeEffect('ca', 43))}
        if (hasUpgrade('ha', 22)) {expca = expca.times(upgradeEffect('ha', 22))}
        if (hasUpgrade('ha', 24)) {expca = expca.times(upgradeEffect('ha', 24))}
        if (hasUpgrade('si', 22)) {expca = expca.times(upgradeEffect('si', 22))}
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
    layerShown(){return player.p.total.gte(1e6)||hasMilestone('ca', 10)},
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
            for (let i1 = 1; i1 < 5; i1++) {
                for (let i2 = 1; i2 < 5; i2++) {
                    if (!hasUpgrade('ca', i1*10+i2)) {buyUpgrade('ca', i1*10+i2)}
                }
            }

        }
    },
    update(diff) {
        if (hasMilestone('me', 2)) {
            addPoints('ca', getResetGain('ca').times(diff))
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
                effBaseca11 = effBaseca11.times(buyableEffect('si', 11))
                if (hasUpgrade('ca', 44)) {effBaseca11 = effBaseca11.pow(upgradeEffect('ca', 11 ))}
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
        31: {
            title: "cable upgrade 31",
            description: "divides prestige buyable 1x scaling by 1.05",
            cost: new Decimal(1e10),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        32: {
            title: "cable upgrade 32",
            description: "multiplies prestige point gain by log2(prestige points +2)^3",
            cost: new Decimal(1e20),
            effect() {
                eff = player.p.points.add(2).log(2).pow(3)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        33: {
            title: "cable upgrade 33",
            description: "divides prestige buyable 1x scaling by 1.05",
            cost: new Decimal(1e30),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        34: {
            title: "cable upgrade 34",
            description: "multiplies point gain by log2(cable points +2)^12",
            cost: new Decimal(1e40),
            effect() {
                eff = player.ca.points.add(2).log(2).pow(12)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        41: {
            title: "cable upgrade 41",
            description: "raise point gain to ^1.2",
            cost: new Decimal('e100'),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        42: {
            title: "cable upgrade 42",
            description: "raise prestige point gain to ^1.1",
            cost: new Decimal('e2000'),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        43: {
            title: "cable upgrade 43",
            description: "raise cable point gain to ^1.05",
            cost: new Decimal('e500'),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        44: {
            title: "cable upgrade 44",
            description: "raise cable buyable 11 effect to ^2",
            cost: new Decimal('e1000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
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
        multme = multme.times(buyableEffect('si', 13))
        return multme
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expme = new Decimal(0.2)
        if (hasUpgrade('si', 24)) {expme = expme.times(upgradeEffect('si', 24))}
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
    layerShown(){return player.ca.total.gte(1e6)||hasMilestone('me', 10)},
    onPrestige(gain) {

    },
    doReset(resettingLayer){
        if ((layers[resettingLayer].row > 2.5)&&!(hasMilestone('ha', 0)||hasMilestone('si', 0))) {
            layerDataReset(this.layer)
        }
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
            done() { return player.me.total.gte(4)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10) },
            unlocked() {return player.me.total.gte(4)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10)},
        },
        1: {
            requirementDescription: "10 total cable points",
            effectDescription: "automate cable upgrades and buyables",
            done() { return player.me.total.gte(10)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10) },
            unlocked() {return player.me.total.gte(10)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10)},
        },
        2: {
            requirementDescription: "1,000 total cable points",
            effectDescription: "automatically gain cable points gained on reset every second",
            done() { return player.me.total.gte(1000)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10) },
            unlocked() {return player.me.total.gte(1000)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10)},
        },
        10: {
            done() { return player.me.total.gte(1)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10) },
            effectDescription: "multiply point gain by 1,000",
            unlocked() {return true},
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                costTypeme11 = "normal"
                costBaseme11 = new Decimal(3)
                costBaseme11 = costBaseme11.root(buyableEffect('si', 12))
                costMultme11 = new Decimal(0.5)
                costExpme11 = new Decimal(1.02)
                costLimitme11 = new Decimal('e6')
                costStackme11 = new Decimal(x)
                return player.buyablePrice(costTypeme11, costStackme11, costBaseme11, costExpme11 ,costMultme11, costLimitme11 , true)
            },
            effect(x){
                effBaseme11 = player.p.points.max(2).log(2)
                effStackme11 = new Decimal(x)
                return effBaseme11.pow(effStackme11)
            },
            title() { 
                return "message buyable 11" 
            },
            display() {
                return "multiply point gain by log2(prestige points), currently "+format(effBaseme11)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.me.points.gte(this.cost()) },
            buy() {
                if (!(hasMilestone('ha', 2)||hasMilestone('si', 2))) {player.me.points = player.me.points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypeme11 == "asymptote")||player.me.points.lte(1e10)) {
                    while (menBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11))
                        if (player.me.points.lt('e100')&&!hasMilestone('me', 0)) {player.me.points = player.me.points.sub(player.buyablePrice(costTypeme11, player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11), costBaseme11, costExpme11, costMultme11, costLimitme11, true))}
                    }
                }
            },
        },

    },
    upgrades: {
        11: {
            title: "message upgrade 11",
            description: "raise prestige upgrade 11 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(1),
            effect() {
                eff = player.me.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(2),
            effect() {
                eff = player.me.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(3),
            effect() {
                eff = player.me.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(4),
            effect() {
                eff = player.me.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(5),
            effect() {
                eff = player.me.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(6),
            effect() {
                eff = player.me.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(7),
            effect() {
                eff = player.me.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(8),
            effect() {
                eff = player.me.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
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
        if (hasUpgrade('si', 24)) {expmec = expmec.times(upgradeEffect('si', 24))}
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
        if (hasMilestone('ha', 0)||hasMilestone('si', 0)) {        
            if (canBuyBuyable('me', 11)) {buyBuyable('me', 11)}
            if (canBuyBuyable('mec', 11)) {buyBuyable('mec', 11)}
        }

    },
    update(diff) {
        if (hasMilestone('ha', 1)||hasMilestone('si', 1)||hasMilestone('cu', 10)) {
            addPoints('me', getResetGain('me').times(diff))
        }
        if (hasMilestone('ha', 2)||hasMilestone('si', 2)||hasMilestone('cu', 10)) {
            addPoints('mec', getResetGain('me').pow(0.5).times(diff))
        }
    },
    doReset(resettingLayer){
        if ((layers[resettingLayer].row > 2.5)&&!(hasMilestone('ha', 0)||hasMilestone('si', 0)||hasMilestone('cu', 10))) {
            layerDataReset(this.layer)
        }
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
        11: {
            unlocked() {return true},
            cost(x) { 
                costTypemec11 = "normal"
                costBasemec11 = new Decimal(3)
                costBasemec11 = costBasemec11.root(buyableEffect('si', 12))
                costMultmec11 = new Decimal(0.5)
                costExpmec11 = new Decimal(1.02)
                costLimitmec11 = new Decimal('e6')
                costStackmec11 = new Decimal(x)
                return player.buyablePrice(costTypemec11, costStackmec11, costBasemec11, costExpmec11 ,costMultmec11, costLimitmec11 , true)
            },
            effect(x){
                effBasemec11 = player.ca.points.max(2).log(2)
                effStackmec11 = new Decimal(x)
                return effBasemec11.pow(effStackmec11)
            },
            title() { 
                return "message decabled buyable 11" 
            },
            display() {
                return "multiply point gain by log2(cable points), currently "+format(effBasemec11)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.mec.points.gte(this.cost()) },
            buy() {
                if (!(hasMilestone('ha', 2)||hasMilestone('si', 2))) {player.mec.points = player.mec.points.sub(this.cost())}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypemec11 == "asymptote")||player.mec.points.lte(1e10)) {
                    while (mecnBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11))
                        if (player.mec.points.lt('e100')&&!hasMilestone('mec', 0)) {player.mec.points = player.mec.points.sub(player.buyablePrice(costTypemec11, player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11), costBasemec11, costExpmec11, costMultmec11, costLimitmec11, true))}
                    }
                }
            },
        },

    },
    upgrades: {
        11: {
            title: "message decabled upgrade 11",
            description: "raise prestige upgrade 11 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(1),
            effect() {
                eff = player.mec.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message decabled upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(2),
            effect() {
                eff = player.mec.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message decabled upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(3),
            effect() {
                eff = player.mec.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message decabled upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(4),
            effect() {
                eff = player.mec.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message decabled upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(5),
            effect() {
                eff = player.mec.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message decabled upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(6),
            effect() {
                eff = player.mec.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message decabled upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(7),
            effect() {
                eff = player.mec.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message decabled upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(8),
            effect() {
                eff = player.mec.points.add(2).log(2)
                softcapPower = new Decimal(0)
                if (hasUpgrade('si', 14)) {softcapPower = softcapPower.add(upgradeEffect('si', 14))}
                if (eff.gte(5)) {
                    eff = eff.div(0.5).log10().pow(softcapPower).pow10().times(0.5)
                }
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    }
})

addLayer("ha", {
    name: "harvest", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HA", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return player.points.gte('e666')||player.ha.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#ffeea4",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "harvest points", // Name of harvest currency
    baseResource: "points", // Name of resource harvest is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multha = new Decimal(1.5e-3)
        return multha
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expha = new Decimal(4)
        exp2ha = new Decimal(1.2)
        return expha

    },
    getResetGain() {
        hap = player.points.log10().times(multha).pow(expha)
        if (hap.gte(10)) {hap = hap.log10().pow(exp2ha).pow10()}

        return hap.floor().max(0)
    },
    getNextAt() {
        nextha = getResetGain('ha').add(1)
        if (nextha.gte(10)) {nextha = nextha.log10().root(exp2ha).pow10()}
        return nextha.root(expha).div(multha).pow10()
    },
    canReset() {return getResetGain('ha').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('ha'))+" harvest points. Next at "+format(getNextAt('ha'))+" points" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for harvest points", onPress(){
            if (canReset(this.layer)) {doReset(this.layer)}
            }
        },
    ],
    layerShown(){return (player.points.gte('e666')||hasMilestone('ha', 10))&&(!hasMilestone('si', 10))},
    onPrestige(gain) {

    },
    automate() {

    },

    milestones: {
        0: {
            requirementDescription: "4 total harvest points",
            effectDescription: "message points are no longer reset",
            done() { return player.ha.total.gte(4) },
            unlocked() {return player.ha.total.gte(4)},
        },
        1: {
            requirementDescription: "100 total harvest points",
            effectDescription: "automatically gain message points on reset and automate message buyables",
            done() { return player.ha.total.gte(100) },
            unlocked() {return player.ha.total.gte(100)},
        },
        2: {
            requirementDescription: "1,000 total harvest points",
            effectDescription: "automatically gain message decabled points as if you can get ^0.5 of message points in challenge on reset",
            done() { return player.ha.total.gte(1000) },
            unlocked() {return player.ha.total.gte(1000)},
        },
        10: {
            done() { return player.ha.total.gte(1) },
            effectDescription: "multiply point gain by 1,000",
            unlocked() {return true},
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                costTypeha11 = "normal"
                costBaseha11 = new Decimal(2)
                costMultha11 = new Decimal(0.5)
                costExpha11 = new Decimal(1.2)
                costLimitha11 = new Decimal('e6')
                costStackha11 = new Decimal(x)
                return player.buyablePrice(costTypeha11, costStackha11, costBaseha11, costExpha11 ,costMultha11, costLimitha11 , true)
            },
            effect(x){
                effBaseha11 = new Decimal(0.05)
                effStackha11 = new Decimal(x)
                return effBaseha11.times(effStackha11)
            },
            title() { 
                return "harvest buyable 11" 
            },
            display() {
                return "add prestige buyable 14/15 effect by "+format(effBaseha11)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost())},
            buy() {
                if (true) {player.ha.points = player.ha.points.sub(this.cost())} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypeha11 == "asymptote")||player.ha.points.lte(1e10)) {
                    while (hanBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeha11, player.ha.points, costBaseha11, costExpha11, costMultha11, costLimitha11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha11, player.ha.points, costBaseha11, costExpha11, costMultha11, costLimitha11))
                        if (player.ha.points.lt('e100')&&true) {player.ha.points = player.ha.points.sub(player.buyablePrice(costTypeha11, player.buyableMaxPurchaseable(costTypeha11, player.ha.points, costBaseha11, costExpha11, costMultha11, costLimitha11), costBaseha11, costExpha11, costMultha11, costLimitha11, true))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) { 
                costTypeha12 = "normal"
                costBaseha12 = new Decimal(2)
                costMultha12 = new Decimal(500)
                costExpha12 = new Decimal(1.4)
                costLimitha12 = new Decimal('e6')
                costStackha12 = new Decimal(x)
                return player.buyablePrice(costTypeha12, costStackha12, costBaseha12, costExpha12 ,costMultha12, costLimitha12 , true)
            },
            effect(x){
                effBaseha12 = new Decimal(1.01)
                effStackha12 = new Decimal(x)
                return effBaseha12.pow(effStackha12)
            },
            title() { 
                return "harvest buyable 12" 
            },
            display() {
                return "divide prestige buyable 1x scaling by "+format(effBaseha12)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost())},
            buy() {
                if (true) {player.ha.points = player.ha.points.sub(this.cost())} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypeha12 == "asymptote")||player.ha.points.lte(1e10)) {
                    while (hanBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12))
                        if (player.ha.points.lt('e100')&&true) {player.ha.points = player.ha.points.sub(player.buyablePrice(costTypeha12, player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12), costBaseha12, costExpha12, costMultha12, costLimitha12, true))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) { 
                costTypeha13 = "asymptote"
                costBaseha13 = new Decimal(3)
                costMultha13 = new Decimal(333333.334)
                costExpha13 = new Decimal(1.6)
                costLimitha13 = this.purchaseLimit().add(1)
                costStackha13 = new Decimal(x)
                return player.buyablePrice(costTypeha13, costStackha13, costBaseha13, costExpha13 ,costMultha13, costLimitha13 , true)
            },
            effect(x){
                effBaseha13 = new Decimal(1)
                effStackha13 = new Decimal(x)
                return effBaseha13.times(effStackha13).add(1)
            },
            purchaseLimit() {
                return new Decimal(10)
            },
            title() { 
                return "harvest buyable 13" 
            },
            display() {
                return "raise prestige buyable 1x softcap start by "+format(effBaseha13)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost())},
            buy() {
                if (true) {player.ha.points = player.ha.points.sub(this.cost())} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypeha13 == "asymptote")||player.ha.points.lte(1e10)) {
                    while (hanBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13))
                        if (player.ha.points.lt('e100')&&true) {player.ha.points = player.ha.points.sub(player.buyablePrice(costTypeha13, player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13), costBaseha13, costExpha13, costMultha13, costLimitha13, true))}
                    }
                }
            },
        },
    },
    upgrades: {        
        11: {
            title: "harvest upgrade 11",
            description: "raises point gain by 1.15",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.15)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "harvest upgrade 12",
            description: "raises point gain by log10(log10(points))^0.5/1.5",
            cost: new Decimal(2),
            effect() {
                eff = player.points.max('ee2.25').log10().log10().pow(0.5).div(1.5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "harvest upgrade 13",
            description: "raises point gain by log2(harvest points +2)^0.2, softcap at ^2",
            cost: new Decimal(10),
            effect() {
                eff = player.ha.points.add(2).log(2).pow(0.2)
                if (eff.gte(2)) {eff = eff.log(2).add(1)}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "harvest upgrade 14",
            description: "raises prestige points gain by 1.1",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "harvest upgrade 21",
            description: "raises point gain by log10(log10(points))^0.5/1.5",
            cost: new Decimal(1000),
            effect() {
                eff = player.points.max('ee2.25').log10().log10().pow(0.5).div(1.5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "harvest upgrade 22",
            description: "raises cable point gain by 1.1",
            cost: new Decimal(1e4),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "harvest upgrade 23",
            description: "raise prestige gain by log10(log10(prestige points))^0.5/1.5",
            cost: new Decimal(1e5),
            effect() {
                eff = player.p.points.max('ee2.25').log10().log10().pow(0.5).div(1.5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "harvest upgrade 24",
            description: "raise cable points gain by log10(log10(cable points))^0.5/2.5",
            cost: new Decimal(1e6),
            effect() {
                eff = player.ca.points.max('ee2.25').log10().log10().pow(0.5).div(1.5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    }
})

addLayer("si", {
    name: "silence", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alpsibetical order
    startData() { return {
        unlocked() {return player.points.gte('e666')||player.si.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#a566d8",
    requires: new Decimal(0), // Can be a function tsit takes requirement increases into account
    resource: "silence points", // Name of silence currency
    baseResource: "points", // Name of resource silence is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already sive
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multsi = new Decimal(1.5e-3)
        return multsi
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expsi = new Decimal(4)
        exp2si = new Decimal(1.2)
        return expsi

    },
    getResetGain() {
        sip = player.points.log10().times(multsi).pow(expsi)
        if (sip.gte(10)) {sip = sip.log10().pow(exp2si).pow10()}

        return sip.floor().max(0)
    },
    getNextAt() {
        nextsi = getResetGain('si').add(1)
        if (nextsi.gte(10)) {nextsi = nextsi.log10().root(exp2si).pow10()}
        return nextsi.root(expsi).div(multsi).pow10()
    },
    canReset() {return getResetGain('si').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('si'))+" silence points. Next at "+format(getNextAt('si'))+" points" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "s", description: "S: Reset for silence points", onPress(){
            if (canReset(this.layer)) {doReset(this.layer)}
            }
        },
    ],
    layerShown(){return (player.points.gte('e666')||hasMilestone('si', 10))&&(!hasMilestone('ha', 10))},
    onPrestige(gain) {

    },
    automate() {

    },

    milestones: {
        0: {
            requirementDescription: "4 total silence points",
            effectDescription: "message points are no longer reset",
            done() { return player.si.total.gte(4) },
            unlocked() {return player.si.total.gte(4)},
        },
        1: {
            requirementDescription: "100 total silence points",
            effectDescription: "automatically gain message points on reset",
            done() { return player.si.total.gte(100) },
            unlocked() {return player.si.total.gte(100)},
        },
        2: {
            requirementDescription: "1,000 total silence points",
            effectDescription: "automatically gain message decabled points as if you can get ^0.5 of message points in challenge on reset",
            done() { return player.si.total.gte(1000) },
            unlocked() {return player.si.total.gte(1000)},
        },
        10: {
            done() { return player.si.total.gte(1) },
            effectDescription: "multiply point gain by 1,000",
            unlocked() {return true},
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                costTypesi11 = "normal"
                costBasesi11 = new Decimal(2)
                costMultsi11 = new Decimal(0.5)
                costExpsi11 = new Decimal(1.2)
                costLimitsi11 = new Decimal('e6')
                costStacksi11 = new Decimal(x)
                return player.buyablePrice(costTypesi11, costStacksi11, costBasesi11, costExpsi11 ,costMultsi11, costLimitsi11 , true)
            },
            effect(x){
                effBasesi11 = new Decimal(2)
                effStacksi11 = new Decimal(x)
                return effBasesi11.pow(effStacksi11)
            },
            title() { 
                return "silence buyable 11" 
            },
            display() {
                return "multiply cable buyable 11 effect by "+format(effBasesi11)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.si.points.gte(this.cost())},
            buy() {
                if (true) {player.si.points = player.si.points.sub(this.cost())} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesi11 == "asymptote")||player.si.points.lte(1e10)) {
                    while (sinBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurcsiseable(costTypesi11, player.si.points, costBasesi11, costExpsi11, costMultsi11, costLimitsi11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurcsiseable(costTypesi11, player.si.points, costBasesi11, costExpsi11, costMultsi11, costLimitsi11))
                        if (player.si.points.lt('e100')&&true) {player.si.points = player.si.points.sub(player.buyablePrice(costTypesi11, player.buyableMaxPurcsiseable(costTypesi11, player.si.points, costBasesi11, costExpsi11, costMultsi11, costLimitsi11), costBasesi11, costExpsi11, costMultsi11, costLimitsi11, true))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) { 
                costTypesi12 = "normal"
                costBasesi12 = new Decimal(2)
                costMultsi12 = new Decimal(500)
                costExpsi12 = new Decimal(1.4)
                costLimitsi12 = new Decimal('e6')
                costStacksi12 = new Decimal(x)
                return player.buyablePrice(costTypesi12, costStacksi12, costBasesi12, costExpsi12 ,costMultsi12, costLimitsi12 , true)
            },
            effect(x){
                effBasesi12 = new Decimal(1.1)
                effStacksi12 = new Decimal(x)
                return effBasesi12.pow(effStacksi12)
            },
            title() { 
                return "silence buyable 12" 
            },
            display() {
                return "divide message buyable 11s scaling by "+format(effBasesi12)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.si.points.gte(this.cost())},
            buy() {
                if (true) {player.si.points = player.si.points.sub(this.cost())} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesi12 == "asymptote")||player.si.points.lte(1e10)) {
                    while (sinBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurcsiseable(costTypesi12, player.si.points, costBasesi12, costExpsi12, costMultsi12, costLimitsi12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurcsiseable(costTypesi12, player.si.points, costBasesi12, costExpsi12, costMultsi12, costLimitsi12))
                        if (player.si.points.lt('e100')&&true) {player.si.points = player.si.points.sub(player.buyablePrice(costTypesi12, player.buyableMaxPurcsiseable(costTypesi12, player.si.points, costBasesi12, costExpsi12, costMultsi12, costLimitsi12), costBasesi12, costExpsi12, costMultsi12, costLimitsi12, true))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) { 
                costTypesi13 = "asymptote"
                costBasesi13 = new Decimal(3)
                costMultsi13 = new Decimal(333333.334)
                costExpsi13 = new Decimal(1.6)
                costLimitsi13 = this.purchaseLimit().add(1)
                costStacksi13 = new Decimal(x)
                return player.buyablePrice(costTypesi13, costStacksi13, costBasesi13, costExpsi13 ,costMultsi13, costLimitsi13 , true)
            },
            effect(x){
                effBasesi13 = new Decimal(1000)
                effStacksi13 = new Decimal(x)
                return effBasesi13.pow(effStacksi13)
            },
            purchaseLimit() {
                return new Decimal(10)
            },
            title() { 
                return "silence buyable 13" 
            },
            display() {
                return "multiply message gain by "+format(effBasesi13)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.si.points.gte(this.cost())},
            buy() {
                if (true) {player.si.points = player.si.points.sub(this.cost())} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesi13 == "asymptote")||player.si.points.lte(1e10)) {
                    while (sinBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurcsiseable(costTypesi13, player.si.points, costBasesi13, costExpsi13, costMultsi13, costLimitsi13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurcsiseable(costTypesi13, player.si.points, costBasesi13, costExpsi13, costMultsi13, costLimitsi13))
                        if (player.si.points.lt('e100')&&true) {player.si.points = player.si.points.sub(player.buyablePrice(costTypesi13, player.buyableMaxPurcsiseable(costTypesi13, player.si.points, costBasesi13, costExpsi13, costMultsi13, costLimitsi13), costBasesi13, costExpsi13, costMultsi13, costLimitsi13, true))}
                    }
                }
            },
        },
    },
    upgrades: {        
        11: {
            title: "silence upgrade 11",
            description: "raise point gain by 1.2",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "silence upgrade 12",
            description: "raise point gain by log10(log10(prestige points))^0.5/1.2",
            cost: new Decimal(2),
            effect() {
                eff = player.p.points.max('ee1.44').log10().log10().pow(0.5).div(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "silence upgrade 13",
            description: "raises point gain by log2(silence points +2)^0.2, softcap at ^2",
            cost: new Decimal(10),
            effect() {
                eff = player.si.points.add(2).log(2).pow(0.2)
                if (eff.gte(2)) {eff = eff.log(2).add(1)}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "silence upgrade 14",
            description: "message upgrades are softcapped at ^8 instead of hardcapped, and hardcapped at ^1,000,000 instead",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(0.5)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "silence upgrade 21",
            description: "raise point gain by log10(log10(cable points))^0.5",
            cost: new Decimal(1000),
            effect() {
                eff = player.ca.points.max('ee1').log10().log10().pow(0.5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "silence upgrade 22",
            description: "raises cable point gain by 1.1",
            cost: new Decimal(1e4),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "silence upgrade 23",
            description: "raise prestige gain by log10(log10(cable points))^0.5/1.2",
            cost: new Decimal(1e5),
            effect() {
                eff = player.ca.points.max('ee1.44').log10().log10().pow(0.5).div(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "silence upgrade 24",
            description: "raise message gain by ^1.03",
            cost: new Decimal(1e6),
            effect() {
                eff = new Decimal(1.03)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },

    }
})

addLayer("cu", {
    name: "copper", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CU", // This appears on the layer's node. Default is the id with the first letter capitalized
    pocution: 0, // Horizontal pocution within a row. By default it uses the layer id and sorts in alpcubetical order
    startData() { return {
        unlocked() {return player.ha.points.gte('1e8')||player.si.points.gte('1e8')||player.cu.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#9c410b",
    requires: new Decimal(0), // Can be a function tcut takes requirement increases into account
    resource: "copper points", // Name of copper currency
    baseResource: "harvest or silence points", // Name of resource copper is based on
    baseAmount() {return Decimal.max(player.ha.points, player.si.points)}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already cuve
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multcu = new Decimal(1e-8)
        return multcu
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expcu = new Decimal(0.2)
        exp2cu = new Decimal(0.8)
        return expcu

    },
    getResetGain() {
        cup = Decimal.max(player.ha.points, player.si.points).times(multcu).pow(expcu)
        if (cup.gte(10)) {cup = cup.log10().pow(exp2cu).pow10()}

        return cup.floor().max(0)
    },
    getNextAt() {
        nextcu = getResetGain('cu').add(1)
        if (nextcu.gte(10)) {nextcu = nextcu.log10().root(exp2cu).pow10()}
        return nextcu.root(expcu).div(multcu)
    },
    canReset() {return getResetGain('cu').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('cu'))+" copper points. Next at "+format(getNextAt('cu'))+" harvest or silence points" },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "u", description: "U: Reset for copper points", onPress(){
            if (canReset(this.layer)) {doReset(this.layer)}
            }
        },
    ],
    layerShown(){return player.ha.total.gte('1e8')||player.si.total.gte('1e8')||hasMilestone('cu', 10)},
    onPrestige(gain) {

    },
    automate() {

    },

    milestones: {
        // 0: {
        //     requirementDescription: "4 total copper points",
        //     effectDescription: "message points are no longer reset",
        //     done() { return player.cu.total.gte(4) },
        //     unlocked() {return player.cu.total.gte(4)},
        // },
        // 1: {
        //     requirementDescription: "100 total copper points",
        //     effectDescription: "automatically gain message points on reset",
        //     done() { return player.cu.total.gte(100) },
        //     unlocked() {return player.cu.total.gte(100)},
        // },
        // 2: {
        //     requirementDescription: "1,000 total copper points",
        //     effectDescription: "automatically gain message decabled points as if you can get ^0.5 of message points in challenge on reset",
        //     done() { return player.cu.total.gte(1000) },
        //     unlocked() {return player.cu.total.gte(1000)},
        // },
        10: {
            done() { return player.cu.total.gte(1) },
            effectDescription: "multiply point gain by 1,000,000",
            unlocked() {return true},
        },
    },
    infoboxes: {
        A: {
            title: "copper subresources",
            body() {
                textcu = "You have "+format(getBuyableAmount('cu', 101))+" copper wires, multiplying x by "+format(buyableEffect('cu', 101))+" and generating"
                textcu = "You have "+format(getBuyableAmount('cu', 102))+" copper plates, multiplying x by "+format(buyableEffect('cu', 102))
                textcu = "You have "+format(getBuyableAmount('cu', 103))+" copper blocks, multiplying x by "+format(buyableEffect('cu', 103))
                return textcu
            }
        },
    },
    buyables: {
        101: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                return new Decimal(x)
            },
            title() { 
                return "copper wires" 
            },
            display() {
                return 
            },
            canAfford() { return false},
            buy() {
            },
            buyMax() {
            },
        },
        102: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                return new Decimal(x)
            },
            title() { 
                return "copper plates" 
            },
            display() {
                return 
            },
            canAfford() { return false},
            buy() {
            },
            buyMax() {
            },
        },
        103: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                return new Decimal(x)
            },
            title() { 
                return "copper blocks" 
            },
            display() {
                return
            },
            canAfford() { return false},
            buy() {
            },
            buyMax() {
            },
        },
    },
    upgrades: {        


    }
})