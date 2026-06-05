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
        multp = multp.times(buyableEffect('cu', 21))
        multp = multp.times(buyableEffect('cu', 22))
        multp = multp.times(buyableEffect('cu', 23))
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

        if (pp.eq(Decimal.dNaN)) {pp = new Decimal(0)} 
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
            unlocked() {return hasMilestone('ca', 10)},
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
        multca = multca.times(buyableEffect('cu', 31))
        multca = multca.times(buyableEffect('cu', 32))
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = new Decimal(1.05)
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.p.points.add(2).log(2).pow(3)
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = new Decimal(1.05)
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.ca.points.add(2).log(2).pow(12)
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (inChallenge('mec', 11)) {return Decimal.dOne}
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
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = new Decimal(1.1)
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = new Decimal(1.05)
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        44: {
            title: "cable upgrade 44",
            description: "raise all upgrades on this layers effect to ^1.2",
            cost: new Decimal('e1000'),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = new Decimal(1.2)
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
        multme = multme.times(buyableEffect('cu', 41))
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
        keepRow = 2.5
        if (hasMilestone('ha', 0)||hasMilestone('si', 0)) {keepRow += 1}
        if (layers[resettingLayer].row > keepRow) {
            layerDataReset(this.layer)
        }
    },
    automate() {
        if (hasMilestone('si', 0)||hasMilestone('ha', 0)) {
            for (let i = 11; i < 12; i++) {
                if (canBuyBuyable('me', i)) {buyMaxBuyable('me', i)}
                if (canBuyBuyable('mec', i)) {buyMaxBuyable('mec', i)}
            }
        }
        if (hasMilestone('si', 0)||hasMilestone('ha', 0)) {
            for (let i1 = 1; i1 < 3; i1++) {
                for (let i2 = 1; i2 < 5; i2++) {
                    if (!hasUpgrade('me', i1*10+i2)) {buyUpgrade('me', i1*10+i2)}
                    if (!hasUpgrade('mec', i1*10+i2)) {buyUpgrade('mec', i1*10+i2)}
                }
            }
        }
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
                effBaseme11 = effBaseme11.pow(buyableEffect('si', 11))
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
                    while (canBuyBuyable([this.layer], [this.id])){
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
        12: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = player.me.points.add(2).log(2)
                if (hasUpgrade('gi', 41)) {eff = eff.times(upgradeEffect('gi', 41))}
                if (hasUpgrade('gi', 42)) {eff = eff.times(upgradeEffect('gi', 42))}
                softcapStart = new Decimal(5)
                softcapStart = softcapStart.times(buyableEffect('cu', 102).max(1))
                if (eff.gte(softcapStart)) {
                    if (hasUpgrade('si', 14)) {
                        eff = eff.log(softcapStart).pow(upgradeEffect('si', 14)).times(softcapStart)
                    } else {
                        eff = softcapStart
                    }
                }
                return eff
            },
            title() { 
                return "message upgrades effect calculator" 
            },
            display() {
                return 
            },
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
    },
    upgrades: {
        11: {
            title: "message upgrade 11",
            description: "raise prestige upgrade 11 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(1),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(2),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(3),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(4),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(5),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(6),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(7),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message points +2), capped at ^5",
            cost: new Decimal(8),
            effect() {
                return buyableEffect('me', 12)
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
        keepRow = 2.5
        if (hasMilestone('ha', 0)||hasMilestone('si', 0)) {keepRow += 1}
        if (layers[resettingLayer].row > keepRow) {
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
                effBasemec11 = effBasemec11.pow(buyableEffect('si', 11))
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
        12: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = player.mec.points.add(2).log(2)
                if (hasUpgrade('gi', 41)) {eff = eff.times(upgradeEffect('gi', 41))}
                if (hasUpgrade('gi', 42)) {eff = eff.times(upgradeEffect('gi', 42))}
                softcapStart = new Decimal(5)
                softcapStart = softcapStart.times(buyableEffect('cu', 102).max(1))
                if (eff.gte(softcapStart)) {
                    if (hasUpgrade('si', 14)) {
                        eff = eff.log(softcapStart).pow(upgradeEffect('si', 14)).times(softcapStart)
                    } else {
                        eff = softcapStart
                    }
                }
                return eff
            },
            title() { 
                return "message upgrades effect calculator" 
            },
            display() {
                return 
            },
            canAfford() { return false },
            buy() {
            },
            buyMax() {
            },
        },
    },
    upgrades: {
        11: {
            title: "message decabled upgrade 11",
            description: "raise prestige upgrade 11 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(1),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message decabled upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(2),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message decabled upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(3),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message decabled upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(4),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message decabled upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(5),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message decabled upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(6),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message decabled upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(7),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message decabled upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message decabled points +2), capped at ^5",
            cost: new Decimal(8),
            effect() {
                return buyableEffect('mec', 12)
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
        multha = multha.times(buyableEffect('cu', 101))
        if (hasUpgrade('gi', 21)) {multha = multha.times(upgradeEffect('gi', 21))}
        return multha
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expha = new Decimal(4)
        if (hasUpgrade('gi', 31)) {expha = expha.times(upgradeEffect('gi', 31))}
        if (hasUpgrade('gi', 43)) {expha = expha.times(upgradeEffect('gi', 43))}
        exp2ha = new Decimal(1.2)
        if (hasUpgrade('gi', 44)) {exp2ha = exp2ha.times(upgradeEffect('gi', 44))}
        if (inChallenge('gi', 11)) {exp2ha = exp2ha.times(0.5)}
        return expha

    },
    getResetGain() {
        hap = player.points.log10().times(multha).pow(expha)
        if (hap.gte(10)) {hap = hap.log10().pow(exp2ha).pow10()}

        choseSilence = hasMilestone('si', 10)
        if (choseSilence&&!maxedChallenge('gi', 11)&&!inChallenge('gi', 11)) {
            if (!hasChallenge('gi', 11)) {hapMax = new Decimal(0)} else {hapMax = Decimal.dTen.pow(challengeCompletions('gi', 11)**2)}
            hap = hap.min(hapMax)
        }

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
    layerShown(){return (player.points.gte('e666')||hasMilestone('ha', 10))},
    onPrestige(gain) {

    },
    automate() {

    },
    update(diff) {
        if (hasMilestone('cu', 2)&&player.ha.total.gte(1)) {
            addPoints('ha', getResetGain('ha').times(diff))
        }
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
            done() { return player.ha.total.gte(1)&&!hasMilestone('si', 10)  },
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
                costLimitha11 = new Decimal('1e6')
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
            purchaseLimit() {
                return new Decimal(56)
            },
            display() {
                return "add prestige buyable 14/15 effect by "+format(effBaseha11)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 0)) {player.ha.points = player.ha.points.sub(this.cost())} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypeha11 == "asymptote")||player.ha.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeha11, player.ha.points, costBaseha11, costExpha11, costMultha11, costLimitha11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha11, player.ha.points, costBaseha11, costExpha11, costMultha11, costLimitha11))
                        if (player.ha.points.lt('e100')&&!hasMilestone('cu', 0)) {player.ha.points = player.ha.points.sub(player.buyablePrice(costTypeha11, player.buyableMaxPurchaseable(costTypeha11, player.ha.points, costBaseha11, costExpha11, costMultha11, costLimitha11), costBaseha11, costExpha11, costMultha11, costLimitha11, true))}
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
                costLimitha12 = new Decimal('1e6')
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
            purchaseLimit() {
                return new Decimal(24)
            },
            display() {
                return "divide prestige buyable 1x scaling by "+format(effBaseha12)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 0)) {player.ha.points = player.ha.points.sub(this.cost())} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypeha12 == "asymptote")||player.ha.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12))
                        if (player.ha.points.lt('e100')&&!hasMilestone('cu', 0)) {player.ha.points = player.ha.points.sub(player.buyablePrice(costTypeha12, player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12), costBaseha12, costExpha12, costMultha12, costLimitha12, true))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) { 
                costTypeha13 = "normal"
                costBaseha13 = new Decimal(10)
                costMultha13 = new Decimal(1e5)
                costExpha13 = new Decimal(1.6)
                costLimitha13 = new Decimal('1e6')
                costStackha13 = new Decimal(x)
                return player.buyablePrice(costTypeha13, costStackha13, costBaseha13, costExpha13 ,costMultha13, costLimitha13 , true)
            },
            effect(x){
                effBaseha13 = new Decimal(1)
                effStackha13 = new Decimal(x)
                return effBaseha13.times(effStackha13).add(1)
            },
            purchaseLimit() {
                return new Decimal(9)
            },
            title() { 
                return "harvest buyable 13" 
            },
            display() {
                return "raise prestige buyable 1x softcap start by "+format(effBaseha13)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 0)){player.ha.points = player.ha.points.sub(this.cost())} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypeha13 == "asymptote")||player.ha.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13))
                        if (player.ha.points.lt('e100')&&!hasMilestone('cu', 0)) {player.ha.points = player.ha.points.sub(player.buyablePrice(costTypeha13, player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13), costBaseha13, costExpha13, costMultha13, costLimitha13, true))}
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
                if (eff.gte(10)) {eff = eff.log(2).add(1)}
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
        multsi = multsi.times(buyableEffect('cu', 101))
        if (hasUpgrade('gi', 21)) {multsi = multsi.times(upgradeEffect('gi', 21))}
        return multsi
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expsi = new Decimal(4)
        if (hasUpgrade('gi', 31)) {expsi = expsi.times(upgradeEffect('gi', 31))}
        if (hasUpgrade('gi', 43)) {expsi = expsi.times(upgradeEffect('gi', 43))}
        exp2si = new Decimal(1.2)
        if (hasUpgrade('gi', 44)) {exp2si = exp2si.times(upgradeEffect('gi', 44))}
        if (inChallenge('gi', 11)) {exp2si = exp2si.times(0.5)}
        return expsi

    },
    getResetGain() {
        sip = player.points.log10().times(multsi).pow(expsi)
        if (sip.gte(10)) {sip = sip.log10().pow(exp2si).pow10()}

        choseHarvest = hasMilestone('ha', 10)
        if (choseHarvest&&!maxedChallenge('gi', 11)&&!inChallenge('gi', 11)) {
            if (!hasChallenge('gi', 11)) {sipMax = new Decimal(0)} else {sipMax = Decimal.dTen.pow(challengeCompletions('gi', 11)**2)}
            sip = sip.min(sipMax)
        }

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
    layerShown(){return (player.points.gte('e666')||hasMilestone('si', 10))},
    onPrestige(gain) {

    },
    automate() {
        if (hasMilestone('cu', 0)) {
            for (i = 11; i < 14; i++){
                if (canBuyBuyable('ha', i)) {buyMaxBuyable('ha', i)}
                if (canBuyBuyable('si', i)) {buyMaxBuyable('si', i)}
            }
        }
        if (hasMilestone('cu', 0)) {
            for (let i1 = 1; i1 < 5; i1++) {
                for (let i2 = 1; i2 < 5; i2++) {
                    if (!hasUpgrade('ha', i1*10+i2)) {buyUpgrade('ha', i1*10+i2)}
                    if (!hasUpgrade('si', i1*10+i2)) {buyUpgrade('si', i1*10+i2)}
                }
            }
        }
    },
    update(diff) {
        if (hasMilestone('cu', 2)&&player.si.total.gte(1)) {
            addPoints('si', getResetGain('si').times(diff))
        }
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
            done() { return player.si.total.gte(1)&&!hasMilestone('ha', 10) },
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
                costLimitsi11 = new Decimal('1e6')
                costStacksi11 = new Decimal(x)
                return player.buyablePrice(costTypesi11, costStacksi11, costBasesi11, costExpsi11 ,costMultsi11, costLimitsi11 , true)
            },
            effect(x){
                effBasesi11 = new Decimal(0.05)
                effStacksi11 = new Decimal(x)
                return effBasesi11.times(effStacksi11).add(1)
            },
            title() { 
                return "silence buyable 11" 
            },
            purchaseLimit() {
                return new Decimal(56)
            },
            display() {
                return "power message buyable effect by "+format(effBasesi11)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.si.points.gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 0)){player.si.points = player.si.points.sub(this.cost())} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesi11 == "asymptote")||player.si.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesi11, player.si.points, costBasesi11, costExpsi11, costMultsi11, costLimitsi11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesi11, player.si.points, costBasesi11, costExpsi11, costMultsi11, costLimitsi11))
                        if (player.si.points.lt('e100')&&!hasMilestone('cu', 0)) {player.si.points = player.si.points.sub(player.buyablePrice(costTypesi11, player.buyableMaxPurchaseable(costTypesi11, player.si.points, costBasesi11, costExpsi11, costMultsi11, costLimitsi11), costBasesi11, costExpsi11, costMultsi11, costLimitsi11, true))}
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
                costLimitsi12 = new Decimal('1e6')
                costStacksi12 = new Decimal(x)
                return player.buyablePrice(costTypesi12, costStacksi12, costBasesi12, costExpsi12 ,costMultsi12, costLimitsi12 , true)
            },
            effect(x){
                effBasesi12 = new Decimal(1.15)
                effStacksi12 = new Decimal(x)
                return effBasesi12.pow(effStacksi12)
            },
            title() { 
                return "silence buyable 12" 
            },
            display() {
                return "divide message buyable 11s scaling by "+format(effBasesi12)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
            },
            purchaseLimit() {
                return new Decimal(24)
            },
            canAfford() { return player.si.points.gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 0)){player.si.points = player.si.points.sub(this.cost())} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesi12 == "asymptote")||player.si.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesi12, player.si.points, costBasesi12, costExpsi12, costMultsi12, costLimitsi12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesi12, player.si.points, costBasesi12, costExpsi12, costMultsi12, costLimitsi12))
                        if (player.si.points.lt('e100')&&!hasMilestone('cu', 0)) {player.si.points = player.si.points.sub(player.buyablePrice(costTypesi12, player.buyableMaxPurchaseable(costTypesi12, player.si.points, costBasesi12, costExpsi12, costMultsi12, costLimitsi12), costBasesi12, costExpsi12, costMultsi12, costLimitsi12, true))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) { 
                costTypesi13 = "normal"
                costBasesi13 = new Decimal(10)
                costMultsi13 = new Decimal(1e5)
                costExpsi13 = new Decimal(1.6)
                costLimitsi13 = new Decimal('1e6')
                costStacksi13 = new Decimal(x)
                return player.buyablePrice(costTypesi13, costStacksi13, costBasesi13, costExpsi13 ,costMultsi13, costLimitsi13 , true)
            },
            effect(x){
                effBasesi13 = new Decimal(1e4)
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
                if (!hasMilestone('cu', 0)){player.si.points = player.si.points.sub(this.cost())} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypesi13 == "asymptote")||player.si.points.lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypesi13, player.si.points, costBasesi13, costExpsi13, costMultsi13, costLimitsi13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesi13, player.si.points, costBasesi13, costExpsi13, costMultsi13, costLimitsi13))
                        if (player.si.points.lt('e100')&&!hasMilestone('cu', 0)) {player.si.points = player.si.points.sub(player.buyablePrice(costTypesi13, player.buyableMaxPurchaseable(costTypesi13, player.si.points, costBasesi13, costExpsi13, costMultsi13, costLimitsi13), costBasesi13, costExpsi13, costMultsi13, costLimitsi13, true))}
                    }
                }
            },
        },
    },
    upgrades: {        
        11: {
            title: "silence upgrade 11",
            description: "raise point gain by 1.15",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.15)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "silence upgrade 12",
            description: "raise point gain by log10(log10(prestige points))^0.5/1.5",
            cost: new Decimal(2),
            effect() {
                eff = player.p.points.max('ee2.25').log10().log10().pow(0.5).div(1.5)
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
                if (eff.gte(10)) {eff = eff.log(2).add(1)}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "silence upgrade 14",
            description: "message upgrades are softcapped at ^5 instead of hardcapped",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(1)
                if (hasUpgrade('gi', 33)) {eff = eff.add(upgradeEffect('gi', 33))}
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "silence upgrade 21",
            description: "raise point gain by log10(log10(cable points))^0.5/1.2",
            cost: new Decimal(1000),
            effect() {
                eff = player.ca.points.max('ee1.44').log10().log10().pow(0.5).div(1.2)
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
            description: "raise message gain by ^1.1",
            cost: new Decimal(1e6),
            effect() {
                eff = new Decimal(1.1)
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
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alpcubetical order
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
        if (hasUpgrade('gi', 22)) {multcu = multcu.times(upgradeEffect('gi', 22))}
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
        for (i = 11; i < 15; i++) {
            setBuyableAmount('cu', i, Decimal.dZero)
        }
        for (i = 21; i < 24; i++) {
            setBuyableAmount('cu', i, Decimal.dZero)
        }
        for (i = 31; i < 33; i++) {
            setBuyableAmount('cu', i, Decimal.dZero)
        }
        for (i = 41; i < 42; i++) {
            setBuyableAmount('cu', i, Decimal.dZero)
        }
        for (i = 101; i < 104; i++) {
            setBuyableAmount('cu', i, Decimal.dOne)
        }
    },
    automate() {
        if (hasMilestone('cu', 1)&&!inChallenge('gi', 11)) {
            for (i = 11; i < 15; i++) {
                if (canBuyBuyable('cu', i)) {buyMaxBuyable('cu', i)}
            }
            for (i = 21; i < 24; i++) {
                if (canBuyBuyable('cu', i)) {buyMaxBuyable('cu', i)}
            }
            for (i = 31; i < 33; i++) {
                if (canBuyBuyable('cu', i)) {buyMaxBuyable('cu', i)}
            }
            for (i = 41; i < 42; i++) {
                if (canBuyBuyable('cu', i)) {buyMaxBuyable('cu', i)}
            }
        }

    },

    milestones: {
        0: {
            requirementDescription: "100 total copper points",
            effectDescription: "automate silence/harvest upgrades and buyables",
            done() { return player.cu.total.gte(100) },
            unlocked() {return player.cu.total.gte(100)},
        },
        1: {
            requirementDescription: "10,000 total copper points",
            effectDescription: "automate copper buyables",
            done() { return player.cu.total.gte(10000) },
            unlocked() {return player.cu.total.gte(10000)},
        },
        2: {
            requirementDescription: "1,000,000 total copper points",
            effectDescription: "automatically gain harvest/silence points",
            done() { return player.cu.total.gte(1e6) },
            unlocked() {return player.cu.total.gte(1e6)},
        },
        10: {
            done() { return player.cu.total.gte(1) },
            effectDescription: "multiply point gain by 1,000,000",
            unlocked() {return true},
        },
    },
    update(diff) {
        setBuyableAmount('cu', 101, getBuyableAmount('cu', 101).add(buyableEffect('cu', 113).times(diff)))
        setBuyableAmount('cu', 102, getBuyableAmount('cu', 102).add(buyableEffect('cu', 111).times(diff)))
        setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).add(buyableEffect('cu', 112).times(diff)))
    },
    infoboxes: {
        A: {
            title: "copper subresources",
            body() {
                textcu = "You have "+format(getBuyableAmount('cu', 101))+" copper plates, multiplying silence/harvest gain by "+format(buyableEffect('cu', 101))+" and generating "+format(buyableEffect('cu', 111))+" copper wires/s"
                textcu += "<br> You have "+format(getBuyableAmount('cu', 102))+" copper wires, multiplying message upgrade softcap start by "+format(buyableEffect('cu', 102))+" and generating "+format(buyableEffect('cu', 112))+" copper coins/s"
                textcu += "<br> You have "+format(getBuyableAmount('cu', 103))+" copper coins, multiplying copper buyable effective counts by "+format(buyableEffect('cu', 103))+" and generating "+format(buyableEffect('cu', 113))+" copper plates/s"
                return textcu
            }
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                costTypecu11 = "normal"
                costBasecu11 = new Decimal(1.8)
                if (hasUpgrade('gi', 14)) {costBasecu11 = costBasecu11.root(upgradeEffect('gi', 14))}
                costMultcu11 = new Decimal(0.555555555555555556)
                costExpcu11 = new Decimal(1)
                costLimitcu11 = new Decimal('e100')
                costStackcu11 = new Decimal(x)
                return player.buyablePrice(costTypecu11, costStackcu11, costBasecu11, costExpcu11 ,costMultcu11, costLimitcu11 , false)
            },
            effect(x){
                effBasecu11 = getBuyableAmount('cu', 101).max(1).pow(buyableEffect('cu', 103))
                effStackcu11 = new Decimal(x)
                return effBasecu11.pow(effStackcu11)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 11" 
            },
            display() {
                return "multiply point gain by copper plates, currently "+format(effBasecu11)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu11 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu11, getBuyableAmount('cu', 103), costBasecu11, costExpcu11, costMultcu11, costLimitcu11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu11, getBuyableAmount('cu', 103), costBasecu11, costExpcu11, costMultcu11, costLimitcu11))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu11, player.buyableMaxPurchaseable(costTypecu11, getBuyableAmount('cu', 103), costBasecu11, costExpcu11, costMultcu11, costLimitcu11), costBasecu11, costExpcu11, costMultcu11, costLimitcu11, false)))}
                    }
                }
            },
        },
        12: {
            unlocked() {return true},
            cost(x) { 
                costTypecu12 = "normal"
                costBasecu12 = new Decimal(3)
                if (hasUpgrade('gi', 14)) {costBasecu12 = costBasecu12.root(upgradeEffect('gi', 14))}
                costMultcu12 = new Decimal(3.33333333333333334)
                costExpcu12 = new Decimal(1)
                costLimitcu12 = new Decimal('e10')
                costStackcu12 = new Decimal(x)
                return player.buyablePrice(costTypecu12, costStackcu12, costBasecu12, costExpcu12 ,costMultcu12, costLimitcu12 , false)
            },
            effect(x){
                effBasecu12 = player.points.max(2).log(2).pow(buyableEffect('cu', 103))
                effStackcu12 = new Decimal(x)
                return effBasecu12.pow(effStackcu12)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 12" 
            },
            display() {
                return "multiply point gain by log2(points), currently "+format(effBasecu12)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu12 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu12, getBuyableAmount('cu', 103), costBasecu12, costExpcu12, costMultcu12, costLimitcu12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu12, getBuyableAmount('cu', 103), costBasecu12, costExpcu12, costMultcu12, costLimitcu12))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu12, player.buyableMaxPurchaseable(costTypecu12, getBuyableAmount('cu', 103), costBasecu12, costExpcu12, costMultcu12, costLimitcu12), costBasecu12, costExpcu12, costMultcu12, costLimitcu12, false)))}
                    }
                }
            },
        },
        13: {
            unlocked() {return true},
            cost(x) { 
                costTypecu13 = "normal"
                costBasecu13 = new Decimal(4)
                if (hasUpgrade('gi', 14)) {costBasecu13 = costBasecu13.root(upgradeEffect('gi', 14))}
                costMultcu13 = new Decimal(25)
                costExpcu13 = new Decimal(1)
                costLimitcu13 = new Decimal('e10')
                costStackcu13 = new Decimal(x)
                return player.buyablePrice(costTypecu13, costStackcu13, costBasecu13, costExpcu13 ,costMultcu13, costLimitcu13 , false)
            },
            effect(x){
                effBasecu13 = player.p.points.max(2).log(2).pow(buyableEffect('cu', 103))
                effStackcu13 = new Decimal(x)
                return effBasecu13.pow(effStackcu13)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 13" 
            },
            display() {
                return "multiply point gain by log2(prestige points), currently "+format(effBasecu13)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu13 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu13, getBuyableAmount('cu', 103), costBasecu13, costExpcu13, costMultcu13, costLimitcu13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu13, getBuyableAmount('cu', 103), costBasecu13, costExpcu13, costMultcu13, costLimitcu13))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu13, player.buyableMaxPurchaseable(costTypecu13, getBuyableAmount('cu', 103), costBasecu13, costExpcu13, costMultcu13, costLimitcu13), costBasecu13, costExpcu13, costMultcu13, costLimitcu13, false)))}
                    }
                }
            },
        },
        14: {
            unlocked() {return true},
            cost(x) { 
                costTypecu14 = "normal"
                costBasecu14 = new Decimal(5)
                if (hasUpgrade('gi', 14)) {costBasecu14 = costBasecu14.root(upgradeEffect('gi', 14))}
                costMultcu14 = new Decimal(200)
                costExpcu14 = new Decimal(1)
                costLimitcu14 = new Decimal('e10')
                costStackcu14 = new Decimal(x)
                return player.buyablePrice(costTypecu14, costStackcu14, costBasecu14, costExpcu14 ,costMultcu14, costLimitcu14 , false)
            },
            effect(x){
                effBasecu14 = player.ca.points.max(2).log(2).pow(buyableEffect('cu', 103))
                effStackcu14 = new Decimal(x)
                return effBasecu14.pow(effStackcu14)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 14" 
            },
            display() {
                return "multiply point gain by log2(cable points), currently "+format(effBasecu14)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu14 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu14, getBuyableAmount('cu', 103), costBasecu14, costExpcu14, costMultcu14, costLimitcu14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu14, getBuyableAmount('cu', 103), costBasecu14, costExpcu14, costMultcu14, costLimitcu14))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu14, player.buyableMaxPurchaseable(costTypecu14, getBuyableAmount('cu', 103), costBasecu14, costExpcu14, costMultcu14, costLimitcu14), costBasecu14, costExpcu14, costMultcu14, costLimitcu14, false)))}
                    }
                }
            },
        },
        21: {
            unlocked() {return true},
            cost(x) { 
                costTypecu21 = "normal"
                costBasecu21 = new Decimal(1.8)
                if (hasUpgrade('gi', 14)) {costBasecu21 = costBasecu21.root(upgradeEffect('gi', 14))}
                costMultcu21 = new Decimal(5.555555555556)
                costExpcu21 = new Decimal(1)
                costLimitcu21 = new Decimal('e10')
                costStackcu21 = new Decimal(x)
                return player.buyablePrice(costTypecu21, costStackcu21, costBasecu21, costExpcu21 ,costMultcu21, costLimitcu21 , false)
            },
            effect(x){
                effBasecu21 = getBuyableAmount('cu', 102).max(1).pow(buyableEffect('cu', 103))
                effStackcu21 = new Decimal(x)
                return effBasecu21.pow(effStackcu21)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 21" 
            },
            display() {
                return "multiply prestige point gain by copper wires, currently "+format(effBasecu21)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu21 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu21, getBuyableAmount('cu', 103), costBasecu21, costExpcu21, costMultcu21, costLimitcu21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu21, getBuyableAmount('cu', 103), costBasecu21, costExpcu21, costMultcu21, costLimitcu21))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu21, player.buyableMaxPurchaseable(costTypecu21, getBuyableAmount('cu', 103), costBasecu21, costExpcu21, costMultcu21, costLimitcu21), costBasecu21, costExpcu21, costMultcu21, costLimitcu21, false)))}
                    }
                }
            },
        },
        22: {
            unlocked() {return true},
            cost(x) { 
                costTypecu22 = "normal"
                costBasecu22 = new Decimal(6)
                if (hasUpgrade('gi', 14)) {costBasecu22 = costBasecu22.root(upgradeEffect('gi', 14))}
                costMultcu22 = new Decimal(16.6666666666667)
                costExpcu22 = new Decimal(1)
                costLimitcu22 = new Decimal('e10')
                costStackcu22 = new Decimal(x)
                return player.buyablePrice(costTypecu22, costStackcu22, costBasecu22, costExpcu22 ,costMultcu22, costLimitcu22 , false)
            },
            effect(x){
                effBasecu22 = player.p.points.max(2).log(2).pow(buyableEffect('cu', 103))
                effStackcu22 = new Decimal(x)
                return effBasecu22.pow(effStackcu22)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 22" 
            },
            display() {
                return "multiply prestige point gain by log2(prestige points), currently "+format(effBasecu22)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu22 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu22, getBuyableAmount('cu', 103), costBasecu22, costExpcu22, costMultcu22, costLimitcu22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu22, getBuyableAmount('cu', 103), costBasecu22, costExpcu22, costMultcu22, costLimitcu22))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu22, player.buyableMaxPurchaseable(costTypecu22, getBuyableAmount('cu', 103), costBasecu22, costExpcu22, costMultcu22, costLimitcu22), costBasecu22, costExpcu22, costMultcu22, costLimitcu22, false)))}
                    }
                }
            },
        },
        23: {
            unlocked() {return true},
            cost(x) { 
                costTypecu23 = "normal"
                costBasecu23 = new Decimal(7)
                if (hasUpgrade('gi', 14)) {costBasecu23 = costBasecu23.root(upgradeEffect('gi', 14))}
                costMultcu23 = new Decimal(142.857142857142858)
                costExpcu23 = new Decimal(1)
                costLimitcu23 = new Decimal('e10')
                costStackcu23 = new Decimal(x)
                return player.buyablePrice(costTypecu23, costStackcu23, costBasecu23, costExpcu23 ,costMultcu23, costLimitcu23 , false)
            },
            effect(x){
                effBasecu23 = player.ca.points.max(2).log(2).pow(buyableEffect('cu', 103))
                effStackcu23 = new Decimal(x)
                return effBasecu23.pow(effStackcu23)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 23" 
            },
            display() {
                return "multiply prestige point gain by log2(cable points), currently "+format(effBasecu23)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu23 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu23, getBuyableAmount('cu', 103), costBasecu23, costExpcu23, costMultcu23, costLimitcu23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu23, getBuyableAmount('cu', 103), costBasecu23, costExpcu23, costMultcu23, costLimitcu23))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu23, player.buyableMaxPurchaseable(costTypecu23, getBuyableAmount('cu', 103), costBasecu23, costExpcu23, costMultcu23, costLimitcu23), costBasecu23, costExpcu23, costMultcu23, costLimitcu23, false)))}
                    }
                }
            },
        },
        31: {
            unlocked() {return true},
            cost(x) { 
                costTypecu31 = "normal"
                costBasecu31 = new Decimal(1.8)
                if (hasUpgrade('gi', 14)) {costBasecu31 = costBasecu31.root(upgradeEffect('gi', 14))}
                costMultcu31 = new Decimal(55.55555555556)
                costExpcu31 = new Decimal(1)
                costLimitcu31 = new Decimal('e10')
                costStackcu31 = new Decimal(x)
                return player.buyablePrice(costTypecu31, costStackcu31, costBasecu31, costExpcu31 ,costMultcu31, costLimitcu31 , false)
            },
            effect(x){
                effBasecu31 = getBuyableAmount('cu', 102).max(1).log10().pow(0.5).pow10().pow(buyableEffect('cu', 103))
                effStackcu31 = new Decimal(x)
                return effBasecu31.pow(effStackcu31)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 31" 
            },
            display() {
                return "multiply cable point gain by 10^log10(copper wires)^0.5, currently "+format(effBasecu31)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu31 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu31, getBuyableAmount('cu', 103), costBasecu31, costExpcu31, costMultcu31, costLimitcu31).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu31, getBuyableAmount('cu', 103), costBasecu31, costExpcu31, costMultcu31, costLimitcu31))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu31, player.buyableMaxPurchaseable(costTypecu31, getBuyableAmount('cu', 103), costBasecu31, costExpcu31, costMultcu31, costLimitcu31), costBasecu31, costExpcu31, costMultcu31, costLimitcu31, false)))}
                    }
                }
            },
        },
        32: {
            unlocked() {return true},
            cost(x) { 
                costTypecu32 = "normal"
                costBasecu32 = new Decimal(8)
                if (hasUpgrade('gi', 14)) {costBasecu32 = costBasecu32.root(upgradeEffect('gi', 14))}
                costMultcu32 = new Decimal(125)
                costExpcu32 = new Decimal(1)
                costLimitcu32 = new Decimal('e10')
                costStackcu32 = new Decimal(x)
                return player.buyablePrice(costTypecu32, costStackcu32, costBasecu32, costExpcu32 ,costMultcu32, costLimitcu32 , false)
            },
            effect(x){
                effBasecu32 = player.ca.points.max(2).log(2).pow(buyableEffect('cu', 103))
                effStackcu32 = new Decimal(x)
                return effBasecu32.pow(effStackcu32)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 32" 
            },
            display() {
                return "multiply cable point gain by log2(cable points), currently "+format(effBasecu32)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu32 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu32, getBuyableAmount('cu', 103), costBasecu32, costExpcu32, costMultcu32, costLimitcu32).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu32, getBuyableAmount('cu', 103), costBasecu32, costExpcu32, costMultcu32, costLimitcu32))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu32, player.buyableMaxPurchaseable(costTypecu32, getBuyableAmount('cu', 103), costBasecu32, costExpcu32, costMultcu32, costLimitcu32), costBasecu32, costExpcu32, costMultcu32, costLimitcu32, false)))}
                    }
                }
            },
        },
        41: {
            unlocked() {return true},
            cost(x) { 
                costTypecu41 = "normal"
                costBasecu41 = new Decimal(10)
                if (hasUpgrade('gi', 14)) {costBasecu41 = costBasecu41.root(upgradeEffect('gi', 14))}
                costMultcu41 = new Decimal(1e4)
                costExpcu41 = new Decimal(1.3)
                costLimitcu41 = new Decimal('e10')
                costStackcu41 = new Decimal(x)
                return player.buyablePrice(costTypecu41, costStackcu41, costBasecu41, costExpcu41 ,costMultcu41, costLimitcu41 , false)
            },
            effect(x){
                effBasecu41 = new Decimal(4).pow(buyableEffect('cu', 103))
                effStackcu41 = new Decimal(x)
                return effBasecu41.pow(effStackcu41)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 41" 
            },
            display() {
                return "multiply message point gain by 4, currently "+format(effBasecu41)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost())},
            buy() {
                if (!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(this.cost()))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypecu41 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypecu41, getBuyableAmount('cu', 103), costBasecu41, costExpcu41, costMultcu41, costLimitcu41).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu41, getBuyableAmount('cu', 103), costBasecu41, costExpcu41, costMultcu41, costLimitcu41))
                        if (player.cu.points.lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).sub(player.buyablePrice(costTypecu41, player.buyableMaxPurchaseable(costTypecu41, getBuyableAmount('cu', 103), costBasecu41, costExpcu41, costMultcu41, costLimitcu41), costBasecu41, costExpcu41, costMultcu41, costLimitcu41, false)))}
                    }
                }
            },
        },
        101: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){

                boosteff = new Decimal(x).div(100).add(1)
                if (hasUpgrade('gi', 12)) {boosteff = boosteff.pow(upgradeEffect('gi', 12))}
                if (hasUpgrade('gi', 34)) {boosteff = boosteff.pow(upgradeEffect('gi', 34))}
                if (boosteff.gte(2)) {boosteff = boosteff.div(2).pow(0.25).times(2)}
                if (boosteff.gte(1e3)) {boosteff = boosteff.log10().div(3).pow(0.25).times(3).pow10()}


                return boosteff
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
        102: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){

                boosteff = new Decimal(x).add(256).log(4).log(4).pow(0.5)
                if (hasUpgrade('gi', 23)) {boosteff = boosteff.pow(upgradeEffect('gi', 23))}

                return boosteff
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
        103: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){

                boosteff = new Decimal(x).pow(0.08).max(1)
                boosteffsoftcapstart = Decimal.dTen 
                if (hasUpgrade('gi', 13)) {boosteffsoftcapstart = boosteffsoftcapstart.times(upgradeEffect('gi', 13))}
                if (hasUpgrade('gi', 24)) {boosteffsoftcapstart = boosteffsoftcapstart.times(upgradeEffect('gi', 24))}
                if (boosteff.gte(boosteffsoftcapstart)) {boosteff = boosteff.log(boosteffsoftcapstart).pow(2).times(boosteffsoftcapstart)}


                return boosteff
            },
            title() { 
                return "copper coins" 
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
        111: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){

                generateeff = getBuyableAmount('cu', 101)
                generateeff = generateeff.times(buyableEffect('cu', 104))
                return generateeff
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
        112: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){



                generateeff = getBuyableAmount('cu', 102)
                generateeff = generateeff.times(buyableEffect('cu', 104))
                return generateeff
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
        113: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){


                generateeff = getBuyableAmount('cu', 103).pow(0.1).div(10)
                generateeff = generateeff.times(buyableEffect('cu', 104))
                return generateeff
            },
            title() { 
                return "copper coins" 
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
        104: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = player.cu.points
                if (hasUpgrade('gi', 11)) {eff = eff.pow(upgradeEffect('gi', 11))}
                return eff
            },
            title() { 
                return "copper generation" 
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

addLayer("gi", {
    name: "guitar", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "GI", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alpsibetical order
    startData() { return {
        unlocked() {return player.points.gte('e1e5')||player.gi.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#ffba6b",
    requires: new Decimal(0), // Can be a function tsit takes requirement increases into account
    resource: "guitar points", // Name of guitar currency
    baseResource: "points", // Name of resource guitar is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already sive
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multgi = new Decimal(1e-5)
        return multgi
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expgi = new Decimal(1)
        exp2gi = new Decimal(0.8)
        return expgi

    },
    getResetGain() {
        gip = player.points.log10().times(multgi).pow(expgi)
        if (gip.gte(10)) {gip = gip.log10().pow(exp2gi).pow10()}

        return gip.floor().max(0)
    },
    getNextAt() {
        nextgi = getResetGain('gi').add(1)
        if (nextgi.gte(10)) {nextgi = nextgi.log10().root(exp2gi).pow10()}
        return nextgi.root(expgi).div(multgi).pow10()
    },
    canReset() {return getResetGain('gi').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('gi'))+" guitar points. Next at "+format(getNextAt('gi'))+" points" },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset for guitar points", onPress(){
            if (canReset(this.layer)) {doReset(this.layer)}
            }
        },
    ],
    layerShown(){return (player.points.gte('e1e5')||hasMilestone('gi', 10))},
    onPrestige(gain) {

    },
    automate() {

    },
    update(diff) {
        if (hasMilestone('gi', 0)) {
            addPoints('gi', getResetGain('gi').times(diff))
        }
    },
    milestones: {
        0: {
            requirementDescription: "10,000 total guitar points",
            effectDescription: "automatically gain guitar points on reset",
            done() { return player.gi.total.gte(1e4) },
            unlocked() {return player.gi.total.gte(1e4)},
        },
        10: {
            done() { return player.gi.total.gte(1) },
            effectDescription: "",
            unlocked() {return true},
        },
    },
    buyables: {

    },
    upgrades: {        
        11: {
            title: "guitar upgrade 11",
            description: "raise copper points effect to ^1.3",
            cost: new Decimal(1),
            effect() {
                return new Decimal(1.3)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "guitar upgrade 12",
            description: "raise copper plates effect to ^1.5",
            cost: new Decimal(10),
            effect() {
                return new Decimal(1.5)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "guitar upgrade 13",
            description: "copper coins passive effect softcap starts x2 later",
            cost: new Decimal(50),
            effect() {
                return new Decimal(2)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "guitar upgrade 14",
            description: "root copper coins buyable scaling by 2 ",
            cost: new Decimal(100),
            effect() {
                return new Decimal(2)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "guitar upgrade 21",
            description: "multiply silence/harvest gain by log2(copper points +4)*log2(guitar points +4)",
            cost: new Decimal(200),
            effect() {
                return player.cu.points.add(4).log(2).times(player.gi.points.add(4).log(2))
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        22: {
            title: "guitar upgrade 22",
            description: "multiply copper points gain by log2(guitar points +4)",
            cost: new Decimal(500),
            effect() {
                return player.gi.points.add(4).log(2)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        23: {
            title: "guitar upgrade 23",
            description: "raise copper wires effect by ^2",
            cost: new Decimal(1e3),
            effect() {
                return new Decimal(2)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        24: {
            title: "guitar upgrade 24",
            description: "copper coins passive effect softcap start xlog2(log2(guitar points +4)) later, caps at x5",
            cost: new Decimal(2e3),
            effect() {
                return player.gi.points.add(4).log(2).log(2).min(5)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        31: {
            title: "guitar upgrade 31",
            description: "raise harvest/silence gain by log2(log2(guitar points))^0.1",
            cost: new Decimal(3e3),
            effect() {
                return player.gi.points.max(4).log(2).log(2).pow(0.1)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 24)}
        },
        32: {
            title: "guitar upgrade 32",
            description: "raise point gain by (guitar points)^0.02",
            cost: new Decimal(4e3),
            effect() {
                return player.gi.points.max(1).pow(0.02)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 24)}
        },
        33: {
            title: "guitar upgrade 33",
            description: "subtract +0.5 to message upgrades softcap strength",
            cost: new Decimal(5e3),
            effect() {
                return new Decimal(0.5)
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 24)}
        },
        34: {
            title: "guitar upgrade 34",
            description: "raise copper plates effect to ^1.5",
            cost: new Decimal(6e3),
            effect() {
                return new Decimal(1.5)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 24)}
        },
        41: {
            title: "guitar upgrade 41",
            description: "multiply all message upgrade by 5",
            cost: new Decimal(1e4),
            effect() {
                return new Decimal(5)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 34)}
        },
        42: {
            title: "guitar upgrade 42",
            description: "multiply all message upgrade by 5",
            cost: new Decimal(2e4),
            effect() {
                return new Decimal(5)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 34)}
        },
        43: {
            title: "guitar upgrade 43",
            description: "raise harvest/silence gain by log2(log2(guitar points))^0.1",
            cost: new Decimal(3e4),
            effect() {
                return player.gi.points.max(4).log(2).log(2).pow(0.1)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 34)}
        },
        44: {
            title: "guitar upgrade 44",
            description: "raise harvest/silence gain exponent by 1.1",
            cost: new Decimal(4e4),
            effect() {
                return new Decimal(1.1)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 34)}
        },
    },
    challenges: {
        11: {
            unlocked() { return hasUpgrade('gi', 24)},
            name: "harvest/silence coexistence challenge",
            challengeDescription: "Copper buyables are limited to 1 purchase. Harvest/Silence point gains are nerfed 10^x -> 10^(x^0.5).",
            canComplete() {
                goalcup = new Decimal(challengeCompletions(this.layer, this.id)).pow10()
                
                challcup = Decimal.max(player.ha.points, player.si.points).times(1e-8).pow(0.2)
                if (challcup.gte(10)) {challcup = challcup.log10().pow(0.8).pow10()}

                if (challcup.eq(0)) {completions = new Decimal(0)} else {completions = challcup.log10().add(1).floor()}
                return completions.sub(challengeCompletions(this.layer, this.id)).max(0) * 1
            },
            goalDescription() { 
                textgichall11g = "Get "+format(goalcup)+" effective copper points on reset. "
                if (inChallenge(this.layer, this.id)) {textgichall11g += " Currently "+formatWhole(challcup.floor())+" effective copper points "}
                return textgichall11g
            },
            rewardDescription() { 
                textgichall11r = formatWhole(challengeCompletions(this.layer, this.id))+"/"+formatWhole(this.completionLimit)+" completions, "
                if (maxedChallenge(this.layer, this.id)) {
                    textgichall11r += " fully allowing harvest and silence points to coexist"
                } else {
                    textgichall11r += " capping harvest/silence points reset gain to "+formatWhole(new Decimal(10**(challengeCompletions(this.layer, this.id)-1)).floor())+" points "
                }
                return textgichall11r
            },
            onEnter() {
                for (i = 11; i < 15; i++) {
                    setBuyableAmount('cu', i, Decimal.dOne)
                }
                for (i = 21; i < 24; i++) {
                    setBuyableAmount('cu', i, Decimal.dOne)
                }
                for (i = 31; i < 33; i++) {
                    setBuyableAmount('cu', i, Decimal.dOne)
                }
                for (i = 41; i < 42; i++) {
                    setBuyableAmount('cu', i, Decimal.dOne)
                }
            },
            rewardEffect() {
                return new Decimal(10**(challengeCompletions(this.layer, this.id)**2)).floor()
            },
            completionLimit: 10,
        }
    }
})