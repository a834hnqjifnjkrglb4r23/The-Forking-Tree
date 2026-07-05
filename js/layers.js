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
        if (hasUpgrade('ha', 23)) {expp = expp.times(upgradeEffect('ha', 23))}
        if (hasUpgrade('si', 23)) {expp = expp.times(upgradeEffect('si', 23))}
        exp2p = new Decimal(0.96)
        if (inChallenge('pr', 11)) {exp2p = exp2p.times(0.5)}
        exp3p = new Decimal(0.96)
        return expp

    },
    getResetGain() {
        pp = player.points.times(multp).pow(expp)
        if (pp.gte(10)) {pp = pp.log10().pow(exp2p).pow10()}
        if (pp.gte('1e10')) {pp = pp.log10().log10().pow(exp3p).pow10().pow10()}

        if (pp.eq(Decimal.dNaN)) {pp = new Decimal(0)} 
        return pp.floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1)
        if (nextp.gte('1e10')) {nextp = nextp.log10().log10().root(exp3p).pow10().pow10()}
        if (nextp.gte(10)) {nextp = nextp.log10().root(exp2p).pow10()}
        return nextp.root(expp).div(multp)
    },
    canReset() {return getResetGain('p').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige/progress points", onPress(){
            if (hasMilestone('cu', 10)) {if (canReset('pr')) {doReset('pr')}} else {if (canReset(this.layer)) {doReset(this.layer)}}
            }
        },
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
                costBaseLogp11 = new Decimal(0.17609125905568124) //1.5
                if (hasUpgrade('p', 31)) {costBaseLogp11 = costBaseLogp11.sub(upgradeEffect('p', 31).log10())}
                if (hasUpgrade('p', 33)) {costBaseLogp11 = costBaseLogp11.sub(upgradeEffect('p', 33).log10())}
                if (hasUpgrade('p', 43)) {costBaseLogp11 = costBaseLogp11.sub(upgradeEffect('p', 43).log10())}
                if (hasUpgrade('ca', 31)) {costBaseLogp11 = costBaseLogp11.sub(upgradeEffect('ca', 31).log10())}
                if (hasUpgrade('ca', 33)) {costBaseLogp11 = costBaseLogp11.sub(upgradeEffect('ca', 33).log10())}
                costBaseLogp11 = costBaseLogp11.div(buyableEffect('ha', 12))
                costBaseLogp11 = costBaseLogp11.div(buyableEffect('pr', 21))
                costMultLogp11 = new Decimal(0.3010299956639812) // 2
                costMultLogp11 = costMultLogp11.sub(buyableEffect('ca', 11).log10())
                costExpp11 = new Decimal(1)
                costLimitLogp11 = new Decimal('1000')
                costLimitLogp11 = costLimitLogp11.times(buyableEffect('ha', 13))
                costStackp11 = new Decimal(x)
                return player.buyablePriceNew(costTypep11, costStackp11, costBaseLogp11, costExpp11 ,costMultLogp11, costLimitLogp11 )
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
                    if (player.buyableMaxPurchaseableNew(costTypep11, player.points, costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep11, player.points, costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePriceNew(costTypep11, player.buyableMaxPurchaseableNew(costTypep11, player.points, costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11), costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11))}
                    }
                }
            },
        },
        12: {
            unlocked() {return hasMilestone('p', 10)},
            cost(x) { 
                costTypep12 = "normal"
                costBaseLogp12 = new Decimal(0.17609125905568124) //1.5
                if (hasUpgrade('p', 31)) {costBaseLogp12 = costBaseLogp12.sub(upgradeEffect('p', 31).log10())}
                if (hasUpgrade('p', 33)) {costBaseLogp12 = costBaseLogp12.sub(upgradeEffect('p', 33).log10())}
                if (hasUpgrade('p', 43)) {costBaseLogp12 = costBaseLogp12.sub(upgradeEffect('p', 43).log10())}
                if (hasUpgrade('ca', 31)) {costBaseLogp12 = costBaseLogp12.sub(upgradeEffect('ca', 31).log10())}
                if (hasUpgrade('ca', 33)) {costBaseLogp12 = costBaseLogp12.sub(upgradeEffect('ca', 33).log10())}
                costBaseLogp12 = costBaseLogp12.div(buyableEffect('ha', 12))
                costBaseLogp12 = costBaseLogp12.div(buyableEffect('pr', 21))
                costMultLogp12 = new Decimal(0.5642714304385625) // 3.6666666666
                costMultLogp12 = costMultLogp12.sub(buyableEffect('ca', 11).log10())
                costExpp12 = new Decimal(1)
                costLimitLogp12 = new Decimal('1000')
                costLimitLogp12 = costLimitLogp12.times(buyableEffect('ha', 13))
                costStackp12 = new Decimal(x)
                return player.buyablePriceNew(costTypep12, costStackp12, costBaseLogp12, costExpp12 ,costMultLogp12, costLimitLogp12 )
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
                    if (player.buyableMaxPurchaseableNew(costTypep12, player.points, costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep12, player.points, costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePriceNew(costTypep12, player.buyableMaxPurchaseableNew(costTypep12, player.points, costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12), costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12))}
                    }
                }
            },
        },
        13: {
            unlocked() {return hasMilestone('ca', 10)},
            cost(x) { 
                costTypep13 = "normal"
                costBaseLogp13 = new Decimal(0.17609125905568124) //1.5
                if (hasUpgrade('p', 31)) {costBaseLogp13 = costBaseLogp13.sub(upgradeEffect('p', 31).log10())}
                if (hasUpgrade('p', 33)) {costBaseLogp13 = costBaseLogp13.sub(upgradeEffect('p', 33).log10())}
                if (hasUpgrade('p', 43)) {costBaseLogp13 = costBaseLogp13.sub(upgradeEffect('p', 43).log10())}
                if (hasUpgrade('ca', 31)) {costBaseLogp13 = costBaseLogp13.sub(upgradeEffect('ca', 31).log10())}
                if (hasUpgrade('ca', 33)) {costBaseLogp13 = costBaseLogp13.sub(upgradeEffect('ca', 33).log10())}
                costBaseLogp13 = costBaseLogp13.div(buyableEffect('ha', 12))
                costBaseLogp13 = costBaseLogp13.div(buyableEffect('pr', 21))
                costMultLogp13 = new Decimal(0.7781512503836436) // 6
                costMultLogp13 = costMultLogp13.sub(buyableEffect('ca', 11).log10())
                costExpp13 = new Decimal(1)
                costLimitLogp13 = new Decimal('1000')
                costLimitLogp13 = costLimitLogp13.times(buyableEffect('ha', 13))
                costStackp13 = new Decimal(x)
                return player.buyablePriceNew(costTypep13, costStackp13, costBaseLogp13, costExpp13 ,costMultLogp13, costLimitLogp13 )
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
                    if (player.buyableMaxPurchaseableNew(costTypep13, player.points, costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep13, player.points, costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePriceNew(costTypep13, player.buyableMaxPurchaseableNew(costTypep13, player.points, costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13), costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13))}
                    }
                }
            },
        },
        // 14: { // purposefully not included in p/ca upgrade 21
        //     unlocked() {return hasMilestone('me', 10)},
        //     cost(x) { 
        //         costTypep14 = "normal"
        //         costBasep14 = new Decimal(1.5)
        //         if (hasUpgrade('p', 31)) {costBasep14 = costBasep14.div(upgradeEffect('p', 31))}
        //         if (hasUpgrade('p', 33)) {costBasep14 = costBasep14.div(upgradeEffect('p', 33))}
        //         if (hasUpgrade('p', 43)) {costBasep14 = costBasep14.div(upgradeEffect('p', 43))}
        //         if (hasUpgrade('ca', 31)) {costBasep14 = costBasep14.div(upgradeEffect('ca', 31))}
        //         if (hasUpgrade('ca', 33)) {costBasep14 = costBasep14.div(upgradeEffect('ca', 33))}
        //         costBasep14 = costBasep14.root(buyableEffect('ha', 12))
        //         costBasep14 = costBasep14.root(buyableEffect('pr', 21))
        //         costMultp14 = new Decimal(1e-3)
        //         costMultp14 = costMultp14.div(buyableEffect('ca', 11))
        //         costExpp14 = new Decimal(1.15)
        //         costLimitp14 = new Decimal('1e100')
        //         costLimitp14 = costLimitp14.pow(buyableEffect('ha', 13))
        //         costStackp14 = new Decimal(x)
        //         return player.buyablePrice(costTypep14, costStackp14, costBasep14, costExpp14,costMultp14, costLimitp14 )
        //     },
        //     effect(x){
        //         effBasep14 = new Decimal(1.2)
        //         effBasep14 = effBasep14.add(buyableEffect('ha', 11))
        //         effStackp14 = new Decimal(x)
        //         return effBasep14.pow(effStackp14)
        //     },
        //     title() { 
        //         return "prestige buyable 14" 
        //     },
        //     display() {
        //         return "multiply point gain by "+format(effBasep14)+" <br> Cost: "+format(this.cost())+" points <br> Effect: "+format(this.effect())
        //     },
        //     style() {const size = {width: "150px", height: "150px"}
        //         return size},
        //     canAfford() { return player.points.gte(this.cost()) },
        //     buy() {
        //         if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost())}
        //         setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
        //     },
        //     buyMax() {
        //         if ((costTypep14 == "asymptote")||player.points.lte(1e10)) {
        //             while (canBuyBuyable([this.layer], [this.id])){
        //                 buyBuyable([this.layer], [this.id])
        //             }
        //         } else {
        //             if (player.buyableMaxPurchaseable(costTypep14, player.points, costBasep14, costExpp14, costMultp14, costLimitp14).lte(getBuyableAmount(this.layer, this.id))) {} else {
        //                 setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypep14, player.points, costBasep14, costExpp14, costMultp14, costLimitp14))
        //                 if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePrice(costTypep14, player.buyableMaxPurchaseable(costTypep14, player.points, costBasep14, costExpp14, costMultp14, costLimitp14), costBasep14, costExpp14, costMultp14, costLimitp14))}
        //             }
        //         }
        //     },
        // },
        14: {
            unlocked() {return hasMilestone('me', 10)},
            cost(x) { 
                costTypep14 = "normal"
                costBaseLogp14 = new Decimal(0.17609125905568124) //1.5
                if (hasUpgrade('p', 31)) {costBaseLogp14 = costBaseLogp14.sub(upgradeEffect('p', 31).log10())}
                if (hasUpgrade('p', 33)) {costBaseLogp14 = costBaseLogp14.sub(upgradeEffect('p', 33).log10())}
                if (hasUpgrade('p', 43)) {costBaseLogp14 = costBaseLogp14.sub(upgradeEffect('p', 43).log10())}
                if (hasUpgrade('ca', 31)) {costBaseLogp14 = costBaseLogp14.sub(upgradeEffect('ca', 31).log10())}
                if (hasUpgrade('ca', 33)) {costBaseLogp14 = costBaseLogp14.sub(upgradeEffect('ca', 33).log10())}
                costBaseLogp14 = costBaseLogp14.div(buyableEffect('ha', 12))
                costBaseLogp14 = costBaseLogp14.div(buyableEffect('pr', 21))
                costMultLogp14 = new Decimal(-3) // 1e-3
                costMultLogp14 = costMultLogp14.sub(buyableEffect('ca', 11).log10())
                costExpp14 = new Decimal(1.15)
                costLimitLogp14 = new Decimal('100')
                costLimitLogp14 = costLimitLogp14.times(buyableEffect('ha', 13))
                costStackp14 = new Decimal(x)
                return player.buyablePriceNew(costTypep14, costStackp14, costBaseLogp14, costExpp14 ,costMultLogp14, costLimitLogp14 )
            },
            effect(x){
                effBasep14 = new Decimal(1.2)
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
                    if (player.buyableMaxPurchaseableNew(costTypep14, player.points, costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep14, player.points, costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePriceNew(costTypep14, player.buyableMaxPurchaseableNew(costTypep14, player.points, costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14), costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14))}
                    }
                }
            },
        },
        15: {
            unlocked() {return hasMilestone('ha', 10)||hasMilestone('si', 10)},
            cost(x) { 
                costTypep15 = "normal"
                costBaseLogp15 = new Decimal(0.17609125905568124) //1.5
                if (hasUpgrade('p', 31)) {costBaseLogp15 = costBaseLogp15.sub(upgradeEffect('p', 31).log10())}
                if (hasUpgrade('p', 33)) {costBaseLogp15 = costBaseLogp15.sub(upgradeEffect('p', 33).log10())}
                if (hasUpgrade('p', 43)) {costBaseLogp15 = costBaseLogp15.sub(upgradeEffect('p', 43).log10())}
                if (hasUpgrade('ca', 31)) {costBaseLogp15 = costBaseLogp15.sub(upgradeEffect('ca', 31).log10())}
                if (hasUpgrade('ca', 33)) {costBaseLogp15 = costBaseLogp15.sub(upgradeEffect('ca', 33).log10())}
                costBaseLogp15 = costBaseLogp15.div(buyableEffect('ha', 12))
                costBaseLogp15 = costBaseLogp15.div(buyableEffect('pr', 21))
                costMultLogp15 = new Decimal(-2.886056647693163) // 1e-3
                costMultLogp15 = costMultLogp15.sub(buyableEffect('ca', 11).log10())
                costExpp15 = new Decimal(1.2)
                costLimitLogp15 = new Decimal('100')
                costLimitLogp15 = costLimitLogp15.times(buyableEffect('ha', 13))
                costStackp15 = new Decimal(x)
                return player.buyablePriceNew(costTypep15, costStackp15, costBaseLogp15, costExpp15 ,costMultLogp15, costLimitLogp15 )
            },
            effect(x){
                effBasep15 = new Decimal(1.2)
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
                    if (player.buyableMaxPurchaseableNew(costTypep15, player.points, costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep15, player.points, costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15))
                        if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePriceNew(costTypep15, player.buyableMaxPurchaseableNew(costTypep15, player.points, costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15), costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15))}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                eff = player.points.add(2).max(2).log(2)
                if (hasUpgrade('me', 12)) {eff = eff.pow(upgradeEffect('me', 12))}
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                eff = player.p.points.add(4).max(2).log(2)
                if (hasUpgrade('me', 13)) {eff = eff.pow(upgradeEffect('me', 13))}
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                eff = player.points.add(2).max(2).log(2)
                if (hasUpgrade('me', 14)) {eff = eff.pow(upgradeEffect('me', 14))}
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                eff = player.p.points.add(4).max(2).log(2).pow(2)
                if (hasUpgrade('me', 22)) {eff = eff.pow(upgradeEffect('me', 22))}
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                eff = player.p.points.add(4).max(2).log(2)
                if (hasUpgrade('me', 24)) {eff = eff.pow(upgradeEffect('me', 24))}
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                eff = player.points.add(2).max(2).log(2).pow(3)
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
            description: "multiplies prestige point gain by log2(prestige points+4)^8",
            cost: new Decimal(1e40),
            effect() {
                eff = player.p.points.add(4).max(2).log(2).pow(8)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 24)}
        },
        41: {
            title: "prestige upgrade 41",
            description: "raise point gain to ^1.2",
            cost: new Decimal('1e60'),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('p', 34)}
        },
        42: {
            title: "prestige upgrade 42",
            description: "raise prestige point gain to ^1.1",
            cost: new Decimal('1e100'),
            effect() {
                eff = new Decimal(1.1)
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
        if (inChallenge('pr', 11)) {exp2ca = exp2ca.times(0.5)}
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
                if (hasUpgrade('ha', 14)) {costLimitca11 = costLimitca11.pow(upgradeEffect('ha', 14))}
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
            description: "multiplies point gain by log2(prestige points+4)^10",
            cost: new Decimal(1e3),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.p.points.add(4).log(2).pow(10)
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
            description: "multiplies points, prestige points, and cable point gain by log2(cable points+4)^2",
            cost: new Decimal(1e5),
            effect() {
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                eff = player.ca.points.add(4).log(2).pow(2)
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
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
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
        expme = expme.times(buyableEffect('pr', 111))
        exp2me = new Decimal(0.5)
        if (inChallenge('pr', 11)) {exp2me = exp2me.times(0.5)}
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
        if (hasMilestone('si', 0)||hasMilestone('ha', 0)||hasMilestone('cu', 10)) {
            for (let i1 = 1; i1 < 3; i1++) {
                for (let i2 = 1; i2 < 5; i2++) {
                    if (!hasUpgrade('me', i1*10+i2)) {buyUpgrade('me', i1*10+i2)}
                    if (!hasUpgrade('mec', i1*10+i2)) {buyUpgrade('mec', i1*10+i2)}
                }
            }
        }
    },
    update(diff) {
        if (hasMilestone('ha', 1)||hasMilestone('si', 1)||hasMilestone('cu', 10)) {
            addPoints('me', getResetGain('me').max(0).times(diff))
        }
        if (hasMilestone('ha', 2)||hasMilestone('si', 2)||hasMilestone('cu', 10)) {
            addPoints('mec', getResetGain('me').max(0).pow(0.5).times(diff))
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
                costBaseme11 = new Decimal(2.8)
                costBaseme11 = costBaseme11.root(buyableEffect('si', 12))
                costMultme11 = new Decimal(0.4)
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
                if ((costTypeme11 == "asymptote")) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11))
                        if (player.me.points.lt('e100')&&!hasMilestone('ha', 0)&&!hasMilestone('si', 0)) {player.me.points = player.me.points.sub(player.buyablePrice(costTypeme11, player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11), costBaseme11, costExpme11, costMultme11, costLimitme11, true))}
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
                softcapStartme = new Decimal(5)
                if (hasUpgrade('si', 14)) {softcapStartme = softcapStartme.times(upgradeEffect('si', 14))}
                softcapStartme = softcapStartme.times(buyableEffect('pr', 101))
                if (eff.gte(softcapStartme)) {
                    eff = eff.log(softcapStartme).times(softcapStartme)
                }
                if (isNaN(eff)) {return new Decimal(1)} else {return eff}
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
            description: "raise prestige upgrade 11 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(1),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(2),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(3),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(4),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(5),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(6),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(7),
            effect() {
                return buyableEffect('me', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message points +2), softcapped at ^5",
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
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
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
        expmec = expmec.times(buyableEffect('pr', 111))
        exp2mec = new Decimal(0.5)
        if (inChallenge('pr', 11)) {exp2mec = exp2mec.times(0.5)}
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
                costBasemec11 = new Decimal(2.8)
                costBasemec11 = costBasemec11.root(buyableEffect('si', 12))
                costMultmec11 = new Decimal(0.4)
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
                if ((costTypemec11 == "asymptote")) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11))
                        if (player.mec.points.lt('e100')&&!hasMilestone('ha', 0)&&!hasMilestone('si', 0)) {player.mec.points = player.mec.points.sub(player.buyablePrice(costTypemec11, player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11), costBasemec11, costExpmec11, costMultmec11, costLimitmec11, true))}
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
                softcapStartmec = new Decimal(5)
                if (hasUpgrade('si', 14)) {softcapStartmec = softcapStartmec.times(upgradeEffect('si', 14))}
                softcapStartmec = softcapStartmec.times(buyableEffect('pr', 101))
                if (eff.gte(softcapStartmec)) {
                    eff = eff.log(softcapStartmec).times(softcapStartmec)
                }
                if (isNaN(eff)) {return new Decimal(1)} else {return eff}
                
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
            description: "raise prestige upgrade 11 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(1),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message decabled upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(2),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message decabled upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(3),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message decabled upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(4),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message decabled upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(5),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message decabled upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(6),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message decabled upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(7),
            effect() {
                return buyableEffect('mec', 12)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message decabled upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message decabled points +2), softcapped at ^5",
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
        unlocked() {return player.points.gte('e1000')||player.ha.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#ffeea4",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "harvest points", // Name of harvest currency
    baseResource: "points", // Name of resource harvest is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multha = new Decimal(1e-3)
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
        if (inChallenge('gi', 11)) {exp2ha = exp2ha.times(0.3)}
        if (inChallenge('pr', 11)) {exp2ha = exp2ha.times(0.5)}
        return expha

    },
    getResetGain() {
        hap = player.points.log10().times(multha).pow(expha)
        if (hap.gte(10)) {hap = hap.log10().pow(exp2ha).pow10()}

        choseSilence = hasMilestone('si', 10)
        if (choseSilence&&!maxedChallenge('gi', 11)&&!inChallenge('gi', 11)) {
            if (!hasChallenge('gi', 11)) {hapMax = new Decimal(0)} else {hapMax = Decimal.dTen.pow(Math.log10(challengeCompletions('gi', 11))**2)}
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
    layerShown(){return (player.points.gte('e1000')||hasMilestone('ha', 10))},
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
            requirementDescription: "100 total harvest points",
            effectDescription: "message points are no longer reset",
            done() { return player.ha.total.gte(100)||hasMilestone('pr', 10) },
            unlocked() {return player.ha.total.gte(100)||hasMilestone('pr', 10)},
        },
        1: {
            requirementDescription: "10,000 total harvest points",
            effectDescription: "automatically gain message points on reset and automate message buyables",
            done() { return player.ha.total.gte(1e4)||hasMilestone('pr', 10) },
            unlocked() {return player.ha.total.gte(1e4)||hasMilestone('pr', 10)},
        },
        2: {
            requirementDescription: "100,000 total harvest points",
            effectDescription: "automatically gain message decabled points as if you can get ^0.5 of message points in challenge on reset",
            done() { return player.ha.total.gte(1e5)||hasMilestone('pr', 10) },
            unlocked() {return player.ha.total.gte(1e5)||hasMilestone('pr', 10)},
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
                variablenameBrillantWow = new Decimal(56)
                if (hasUpgrade('pr', 23)) {variablenameBrillantWow = variablenameBrillantWow.add(upgradeEffect('pr', 23))}
                return variablenameBrillantWow
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
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha11, player.ha.points, costBaseha11, costExpha11, costMultha11, costLimitha11).min(this.purchaseLimit()))
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
                effBaseha12 = new Decimal(1.05)
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
                return "root prestige buyable 1x scaling by "+format(effBaseha12)+" <br> Cost: "+format(this.cost())+" <br> Effect: "+format(this.effect())
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
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12).min(this.purchaseLimit()))
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
                effBaseha13 = new Decimal(2)
                effStackha13 = new Decimal(x)
                return effBaseha13.pow(effStackha13)
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
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13).min(this.purchaseLimit()))
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
                eff = eff.pow(buyableEffect('pr', 33))
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "harvest upgrade 12",
            description: "raises point gain by log10(log10(points))^0.5/1.4",
            cost: new Decimal(2),
            effect() {
                eff = player.points.max('ee1.96').log10().log10().pow(0.5).div(1.4)
                eff = eff.pow(buyableEffect('pr', 33))
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
                eff = eff.pow(buyableEffect('pr', 33))
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "harvest upgrade 14",
            description: "raise cable buyable 11 softcap start to 10",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(10)
                eff = eff.pow(buyableEffect('pr', 33))
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "harvest upgrade 21",
            description: "raises point gain by log10(log10(points))^0.5/1.2",
            cost: new Decimal(1000),
            effect() {
                eff = player.points.max('ee1.44').log10().log10().pow(0.5).div(1.2)
                eff = eff.pow(buyableEffect('pr', 33))
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
                eff = eff.pow(buyableEffect('pr', 33))
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "harvest upgrade 23",
            description: "raise prestige gain by log10(log10(prestige points))^0.5/1.4",
            cost: new Decimal(1e5),
            effect() {
                eff = player.p.points.max('ee1.96').log10().log10().pow(0.5).div(1.4)
                eff = eff.pow(buyableEffect('pr', 33))
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "harvest upgrade 24",
            description: "raise cable points gain by log10(log10(cable points))^0.5/1.4",
            cost: new Decimal(1e6),
            effect() {
                eff = player.ca.points.max('ee1.96').log10().log10().pow(0.5).div(1.4)
                eff = eff.pow(buyableEffect('pr', 33))
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
        unlocked() {return player.points.gte('e1000')||player.si.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#a566d8",
    requires: new Decimal(0), // Can be a function tsit takes requirement increases into account
    resource: "silence points", // Name of silence currency
    baseResource: "points", // Name of resource silence is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already sive
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multsi = new Decimal(1e-3)
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
        if (inChallenge('gi', 11)) {exp2si = exp2si.times(0.3)}
        if (inChallenge('pr', 11)) {exp2si = exp2si.times(0.5)}
        return expsi

    },
    getResetGain() {
        sip = player.points.log10().times(multsi).pow(expsi)
        if (sip.gte(10)) {sip = sip.log10().pow(exp2si).pow10()}

        choseHarvest = hasMilestone('ha', 10)
        if (choseHarvest&&!maxedChallenge('gi', 11)&&!inChallenge('gi', 11)) {
            if (!hasChallenge('gi', 11)) {sipMax = new Decimal(0)} else {sipMax = Decimal.dTen.pow(Math.log10(challengeCompletions('gi', 11))**2)}
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
    layerShown(){return (player.points.gte('e1000')||hasMilestone('si', 10))},
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
            requirementDescription: "100 total silence points",
            effectDescription: "message points are no longer reset",
            done() { return player.si.total.gte(100)||hasMilestone('pr', 10) },
            unlocked() {return player.si.total.gte(100)||hasMilestone('pr', 10)},
        },
        1: {
            requirementDescription: "1,000 total silence points",
            effectDescription: "automatically gain message points on reset",
            done() { return player.si.total.gte(1000)||hasMilestone('pr', 10) },
            unlocked() {return player.si.total.gte(1000)||hasMilestone('pr', 10)},
        },
        2: {
            requirementDescription: "100,000 total silence points",
            effectDescription: "automatically gain message decabled points as if you can get ^0.5 of message points in challenge on reset",
            done() { return player.si.total.gte(1e5)||hasMilestone('pr', 10) },
            unlocked() {return player.si.total.gte(1e5)||hasMilestone('pr', 10)},
        },
        10: {
            done() { return (player.si.total.gte(1)&&!hasMilestone('ha', 10)) },
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
                variablenameBrillantWow = new Decimal(56)
                if (hasUpgrade('pr', 23)) {variablenameBrillantWow = variablenameBrillantWow.add(upgradeEffect('pr', 23))}
                return variablenameBrillantWow
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
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesi11, player.si.points, costBasesi11, costExpsi11, costMultsi11, costLimitsi11).min(this.purchaseLimit()))
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
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesi12, player.si.points, costBasesi12, costExpsi12, costMultsi12, costLimitsi12).min(this.purchaseLimit()))
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
                return new Decimal(9)
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
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypesi13, player.si.points, costBasesi13, costExpsi13, costMultsi13, costLimitsi13).min(this.purchaseLimit()))
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
                eff = eff.pow(buyableEffect('pr', 33))
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "silence upgrade 12",
            description: "raise point gain by log10(log10(prestige points))^0.5/1.4",
            cost: new Decimal(2),
            effect() {
                eff = player.p.points.max('ee1.96').log10().log10().pow(0.5).div(1.4)
                eff = eff.pow(buyableEffect('pr', 33))
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
                eff = eff.pow(buyableEffect('pr', 33))
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "silence upgrade 14",
            description: "message upgrades softcap start x2 later",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(2)
                if (hasUpgrade('gi', 33)) {eff = eff.add(upgradeEffect('gi', 33))}
                eff = eff.pow(buyableEffect('pr', 33))
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "silence upgrade 21",
            description: "raise point gain by log10(log10(cable points))^0.5/1.2",
            cost: new Decimal(1000),
            effect() {
                eff = player.ca.points.max('ee1.44').log10().log10().pow(0.5).div(1.2)
                eff = eff.pow(buyableEffect('pr', 33))
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
                eff = eff.pow(buyableEffect('pr', 33))
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
                eff = eff.pow(buyableEffect('pr', 33))
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
                eff = eff.pow(buyableEffect('pr', 33))
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
        if (hasUpgrade('cup', 11)) {multcu = multcu.times(upgradeEffect('cup', 11))}
        if (hasUpgrade('cup', 12)) {multcu = multcu.times(upgradeEffect('cup', 12))}
        if (hasUpgrade('cup', 13)) {multcu = multcu.times(upgradeEffect('cup', 13))}
        if (hasUpgrade('cup', 14)) {multcu = multcu.times(upgradeEffect('cup', 14))}
        multcu = multcu.times(buyableEffect('pr', 102))
        return multcu
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expcu = new Decimal(0.2)
        exp2cu = new Decimal(0.8)
        if (inChallenge('pr', 11)) {exp2cu = exp2cu.times(0.5)}
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
    doReset(resettingLayer){
        if (layers[resettingLayer].row > 4.5) {
            layerDataReset(this.layer)
            if (hasMilestone('pr', 10)) {setBuyableAmount('cu', 103, Decimal.dOne)}
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
    tabFormat: {
        "main": {
            shouldNotify: true,
            content:
                [["infobox", "A"],
                "main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "milestones", "buyables", "upgrades"],
        },
        "copper projections": {
            embedLayer: "cup",
            shouldNotify: true,
            unlocked() {return getBuyableAmount('cu', 101).times(getBuyableAmount('cu', 102)).times(getBuyableAmount('cu', 103)).gte('1e120')||player.cup.points.gte(1)},
            content:
                ["main-display",
                "prestige-button", "resource-display",
                ["blank", "5px"], // Height
                 "challenges", "blank", "buyables"],
        },
    },
    milestones: {
        0: {
            requirementDescription: "100 total copper points",
            effectDescription: "automate silence/harvest upgrades and buyables",
            done() { return player.cu.total.gte(100)||hasMilestone('pr', 10) },
            unlocked() {return player.cu.total.gte(100)||hasMilestone('pr', 10)},
        },
        1: {
            requirementDescription: "10,000 total copper points",
            effectDescription: "automate copper buyables",
            done() { return player.cu.total.gte(10000)||hasMilestone('pr', 10) },
            unlocked() {return player.cu.total.gte(10000)||hasMilestone('pr', 10)},
        },
        2: {
            requirementDescription: "1,000,000 total copper points",
            effectDescription: "automatically gain harvest/silence points",
            done() { return player.cu.total.gte(1e6)||hasMilestone('pr', 10) },
            unlocked() {return player.cu.total.gte(1e6)||hasMilestone('pr', 10)},
        },
        10: {
            done() { return player.cu.total.gte(1)||hasMilestone('pr', 10) },
            effectDescription: "multiply point gain by 1,000,000",
            unlocked() {return true},
        },
    },
    update(diff) {
        setBuyableAmount('cu', 101, getBuyableAmount('cu', 101).add(buyableEffect('cu', 113).times(diff)))
        setBuyableAmount('cu', 102, getBuyableAmount('cu', 102).add(buyableEffect('cu', 111).times(diff)))
        setBuyableAmount('cu', 103, getBuyableAmount('cu', 103).add(buyableEffect('cu', 112).times(diff)))
        if (hasMilestone('pr', 10)) {addPoints('cu', getResetGain('cu').times(diff))}
    },

    infoboxes: {
        A: {
            title: "copper subresources",
            body() {
                textcu = "You have "+format(getBuyableAmount('cu', 101))+" copper plates, multiplying silence/harvest gain by "+format(buyableEffect('cu', 101))+" and generating "+format(buyableEffect('cu', 111))+" copper wires/s"
                textcu += "<br> You have "+format(getBuyableAmount('cu', 102))+" copper wires, raising point gain to "+format(buyableEffect('cu', 102), 3)+" and generating "+format(buyableEffect('cu', 112))+" copper coins/s"
                textcu += "<br> You have "+format(getBuyableAmount('cu', 103))+" copper coins, raising copper buyable effects to "+format(buyableEffect('cu', 103))+" and generating "+format(buyableEffect('cu', 113))+" copper plates/s"
                return textcu
            }
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                costTypecu11 = "normal"
                costBasecu11 = new Decimal(2)
                if (hasUpgrade('gi', 14)) {costBasecu11 = costBasecu11.root(upgradeEffect('gi', 14))}
                costBasecu11 = costBasecu11.root(buyableEffect('pr', 24))
                costMultcu11 = new Decimal(0.5)
                costExpcu11 = new Decimal(1.1)
                costLimitcu11 = new Decimal('e10')
                costStackcu11 = new Decimal(x)
                return player.buyablePrice(costTypecu11, costStackcu11, costBasecu11, costExpcu11 ,costMultcu11, costLimitcu11 , false)
            },
            effect(x){
                effBasecu11 = getBuyableAmount('cu', 102).max(1).pow(buyableEffect('cu', 103))
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
                return "multiply point gain by copper wires, currently "+format(effBasecu11)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
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
                costBasecu12 = costBasecu12.root(buyableEffect('pr', 24))
                costMultcu12 = new Decimal(10)
                costExpcu12 = new Decimal(1.1)
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
                costBasecu13 = costBasecu13.root(buyableEffect('pr', 24))
                costMultcu13 = new Decimal(100)
                costExpcu13 = new Decimal(1.1)
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
                costBasecu14 = costBasecu14.root(buyableEffect('pr', 24))
                costMultcu14 = new Decimal(1000)
                costExpcu14 = new Decimal(1.1)
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
                costBasecu21 = new Decimal(2)
                if (hasUpgrade('gi', 14)) {costBasecu21 = costBasecu21.root(upgradeEffect('gi', 14))}
                costBasecu21 = costBasecu21.root(buyableEffect('pr', 24))
                costMultcu21 = new Decimal(5)
                costExpcu21 = new Decimal(1.1)
                costLimitcu21 = new Decimal('e10')
                costStackcu21 = new Decimal(x)
                return player.buyablePrice(costTypecu21, costStackcu21, costBasecu21, costExpcu21 ,costMultcu21, costLimitcu21 , false)
            },
            effect(x){
                effBasecu21 = getBuyableAmount('cu', 101).max(1).pow(buyableEffect('cu', 103))
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
                return "multiply prestige point gain by copper plates, currently "+format(effBasecu21)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
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
                costBasecu22 = costBasecu22.root(buyableEffect('pr', 24))
                costMultcu22 = new Decimal(100)
                costExpcu22 = new Decimal(1.1)
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
                costBasecu23 = costBasecu23.root(buyableEffect('pr', 24))
                costMultcu23 = new Decimal(1000)
                costExpcu23 = new Decimal(1.1)
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
                costBasecu31 = new Decimal(2)
                if (hasUpgrade('gi', 14)) {costBasecu31 = costBasecu31.root(upgradeEffect('gi', 14))}
                costBasecu31 = costBasecu31.root(buyableEffect('pr', 24))
                costMultcu31 = new Decimal(50)
                costExpcu31 = new Decimal(1.1)
                costLimitcu31 = new Decimal('e10')
                costStackcu31 = new Decimal(x)
                return player.buyablePrice(costTypecu31, costStackcu31, costBasecu31, costExpcu31 ,costMultcu31, costLimitcu31 , false)
            },
            effect(x){
                effBasecu31 = getBuyableAmount('cu', 101).max(1).log10().pow(0.5).pow10().pow(buyableEffect('cu', 103))
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
                return "multiply cable point gain by 10^log10(copper plates)^0.5, currently "+format(effBasecu31)+" <br> Cost: "+format(this.cost())+" copper coins <br> Effect: "+format(this.effect())
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
                costBasecu32 = costBasecu32.root(buyableEffect('pr', 24))
                costMultcu32 = new Decimal(1000)
                costExpcu32 = new Decimal(1.1)
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
                costBasecu41 = costBasecu41.root(buyableEffect('pr', 24))
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

                boosteff = new Decimal(x).pow(0.5).max(1)
                if (boosteff.gte(2)) {boosteff = boosteff.div(2).pow(0.5).times(2)}
                if (boosteff.gte(100)) {boosteff = boosteff.log10().div(2).pow(0.8).times(2).pow10()}

                if (hasUpgrade('gi', 12)) {boosteff = boosteff.pow(upgradeEffect('gi', 12))}
                if (hasUpgrade('gi', 34)) {boosteff = boosteff.pow(upgradeEffect('gi', 34))}
                if (hasUpgrade('cup', 23)) {boosteff = boosteff.pow(upgradeEffect('cup', 23))}


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

                boosteff = new Decimal(x).add(256).log(4).log(4).pow(0.8)
                boosteff = boosteff.times(10).log10().pow(0.96).pow10().div(10)
                if (boosteff.gte(2)) {boosteff = boosteff.div(2).pow(0.8).times(2)}

                if (hasUpgrade('gi', 23)) {boosteff = boosteff.pow(upgradeEffect('gi', 23))}
                if (hasUpgrade('cup', 22)) {boosteff = boosteff.pow(upgradeEffect('cup', 22))}
                
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

                boosteff = new Decimal(x).add(100).log10().sub(1)
                boosteffsoftcapstart = Decimal.dTen 
                if (hasUpgrade('gi', 13)) {boosteffsoftcapstart = boosteffsoftcapstart.times(upgradeEffect('gi', 13))}
                if (hasUpgrade('gi', 24)) {boosteffsoftcapstart = boosteffsoftcapstart.times(upgradeEffect('gi', 24))}
                boosteffsoftcapstart = boosteffsoftcapstart.times(buyableEffect('pr', 112))

                if (boosteff.gte(boosteffsoftcapstart)) {boosteff = boosteff.log(boosteffsoftcapstart).times(boosteffsoftcapstart)}

                if (hasUpgrade('gi', 11)) {boosteff = boosteff.pow(upgradeEffect('gi', 11))}
                if (hasUpgrade('cup', 21)) {boosteff = boosteff.pow(upgradeEffect('cup', 21))}

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

                generateeff = getBuyableAmount('cu', 101).pow(0.5).div(2)
                generateeff = generateeff.times(buyableEffect('cu', 104))
                generateeff = generateeff.times(buyableEffect('pr', 102))
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
                generateeff = generateeff.times(buyableEffect('pr', 102))
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
                generateeff = generateeff.times(buyableEffect('pr', 102))
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
        unlocked() {return getBuyableAmount('cu', 102).gte(1e5)||player.gi.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#ffba6b",
    requires: new Decimal(0), // Can be a function tsit takes requirement increases into account
    resource: "guitar points", // Name of guitar currency
    baseResource: "copper wires", // Name of resource guitar is based on
    baseAmount() {return getBuyableAmount('cu', 102)}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already sive
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multgi = new Decimal(1e-6)
        multgi = multgi.times(buyableEffect('pr', 112))
        return multgi
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expgi = new Decimal(0.8)
        exp2gi = new Decimal(0.6)
        if (inChallenge('pr', 11)) {exp2gi = exp2gi.times(0.5)}
        return expgi

    },
    getResetGain() {
        gip = getBuyableAmount('cu', 102).times(multgi).pow(expgi)
        if (gip.gte(10)) {gip = gip.log10().pow(exp2gi).pow10()}

        return gip.floor().max(0)
    },
    getNextAt() {
        nextgi = getResetGain('gi').add(1)
        if (nextgi.gte(10)) {nextgi = nextgi.log10().root(exp2gi).pow10()}
        return nextgi.root(expgi).div(multgi)
    },
    canReset() {return getResetGain('gi').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('gi'))+" guitar points. Next at "+format(getNextAt('gi'))+" copper wires" },
    row: 4, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "g", description: "G: Reset for guitar points", onPress(){
            if (canReset(this.layer)) {doReset(this.layer)}
            }
        },
    ],
    layerShown(){return (getBuyableAmount('cu', 102).gte(1e5)||hasMilestone('gi', 10))},
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
        if (hasMilestone('pr', 10)) {
            for (let i1 = 1; i1 < 5; i1++) {
                for (let i2 = 1; i2 < 5; i2++) {
                    if (!hasUpgrade('gi', i1*10+i2)) {buyUpgrade('gi', i1*10+i2)}
                }
            }
        }
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
            done() { return player.gi.total.gte(1e4)||hasMilestone('pr', 10) },
            unlocked() {return player.gi.total.gte(1e4)||hasMilestone('pr', 10)},
        },
        10: {
            done() { return player.gi.total.gte(1)||hasMilestone('pr', 10) },
            effectDescription: "",
            unlocked() {return true},
        },
    },
    buyables: {

    },
    upgrades: {        
        11: {
            title: "guitar upgrade 11",
            description: "raise copper coins passive effect to ^1.5",
            cost: new Decimal(1),
            effect() {
                return new Decimal(1.5)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "guitar upgrade 12",
            description: "raise copper plates effect to ^1.5",
            cost: new Decimal(5),
            effect() {
                return new Decimal(1.5)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "guitar upgrade 13",
            description: "copper coins passive effect softcap starts x2 later",
            cost: new Decimal(10),
            effect() {
                return new Decimal(2)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "guitar upgrade 14",
            description: "root copper coins buyable scaling by 2 ",
            cost: new Decimal(20),
            effect() {
                return new Decimal(2)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "guitar upgrade 21",
            description: "multiply silence/harvest gain by (log2(copper points +4)*log2(guitar points +4))^0.5",
            cost: new Decimal(50),
            effect() {
                return player.cu.points.add(4).log(2).times(player.gi.points.add(4).log(2)).pow(0.5)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        22: {
            title: "guitar upgrade 22",
            description: "multiply copper points gain by log2(guitar points +4)",
            cost: new Decimal(100),
            effect() {
                return player.gi.points.add(4).log(2)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        23: {
            title: "guitar upgrade 23",
            description: "raise copper wires effect by ^2",
            cost: new Decimal(200),
            effect() {
                return new Decimal(2)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        24: {
            title: "guitar upgrade 24",
            description: "copper coins passive effect softcap start xlog2(log2(guitar points +4))^0.7 later, caps at x5",
            cost: new Decimal(500),
            effect() {
                return player.gi.points.add(4).log(2).log(2).pow(0.7).min(5)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        31: {
            title: "guitar upgrade 31",
            description: "raise harvest/silence gain by log2(log2(guitar points))^0.05",
            cost: new Decimal(1e3),
            effect() {
                return player.gi.points.max(4).log(2).log(2).pow(0.05)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 24)}
        },
        32: {
            title: "guitar upgrade 32",
            description: "raise point gain by (guitar points)^0.01",
            cost: new Decimal(2e3),
            effect() {
                return player.gi.points.max(1).pow(0.01)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 24)}
        },
        33: {
            title: "guitar upgrade 33",
            description: "add +1 to silence buyable 14 effect",
            cost: new Decimal(3e3),
            effect() {
                return new Decimal(1)
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 24)}
        },
        34: {
            title: "guitar upgrade 34",
            description: "raise copper plates effect to ^1.5",
            cost: new Decimal(5e3),
            effect() {
                return new Decimal(1.5)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 24)}
        },
        41: {
            title: "guitar upgrade 41",
            description: "multiply all messages upgrade effects before softcap by 3",
            cost: new Decimal(1e4),
            effect() {
                return new Decimal(3)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 34)}
        },
        42: {
            title: "guitar upgrade 42",
            description: "multiply all messages upgrade effects before softcap by 3",
            cost: new Decimal(2e4),
            effect() {
                return new Decimal(3)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 34)}
        },
        43: {
            title: "guitar upgrade 43",
            description: "raise harvest/silence gain by log2(log2(guitar points))^0.15",
            cost: new Decimal(3e4),
            effect() {
                return player.gi.points.max(4).log(2).log(2).pow(0.15)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 34)}
        },
        44: {
            title: "guitar upgrade 44",
            description: "raise harvest/silence gain exponent by 1.1",
            cost: new Decimal(5e4),
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
            challengeDescription: "Copper buyables are limited to 1 purchase. Harvest/Silence point gains are nerfed 10^x -> 10^(x^0.3).",
            canComplete() {
                goalcup = new Decimal(challengeCompletions(this.layer, this.id)).floor().add(1)

                challcup = Decimal.max(player.ha.points, player.si.points).times(multcu).pow(expcu)
                if (challcup.gte(10)) {challcup = challcup.log10().pow(exp2cu).pow10()}

                return challcup.floor().sub(challengeCompletions(this.layer, this.id)).floor().max(0) * 1
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
                    textgichall11r += " capping harvest/silence points reset gain to "+formatWhole(new Decimal(10**(Math.log10(challengeCompletions(this.layer, this.id))**2)).floor())+" points "
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
                return new Decimal(10**(Math.log10(challengeCompletions(this.layer, this.id))**2)).floor()
            },
            completionLimit: 1e20,
        }
    }
})

addLayer("cup", {
    name: "copper projections", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CUP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return getBuyableAmount('cu', 101).times(getBuyableAmount('cu', 102)).times(getBuyableAmount('cu', 103)).gte('1e120')||player.cup.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#9c410b",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "copper projections", // Namec of message decabled currency
    baseResource: "copper products", // Namec of resource message decabled is based on
    baseAmount() {return getBuyableAmount('cu', 101).times(getBuyableAmount('cu', 102)).times(getBuyableAmount('cu', 103))}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multcup = new Decimal(0.002)
        return multcup
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expcup = new Decimal(1)
        exp2cup = new Decimal(1)
        return expcup

    },
    getResetGain() {
        cupp = this.baseAmount().max(10).log10().times(multcup).pow(expcup)
        if (cupp.gte(10)) {cupp = cupp.log10().pow(exp2cup).pow10()}

        return cupp.floor().max(0)
    },
    getNextAt() {
        nextcup = getResetGain('cup').add(1)
        if (nextcup.gte(10)) {nextcup = nextcup.log10().root(exp2cup).pow10()}
        return nextcup.root(expcup).div(multcup).pow10()
    },
    canReset() {
        return false
    },
    prestigeNotify() {return true},
    prestigeButtonText() {
        textcup = "you cannot reset this layer"
        textcup += "<br> you have "+format(getResetGain('cup'))+" total copper projections"
        textcup += "<br> next at "+format(getNextAt('cup'))+" copper products"
    return textcup
    },
    row: 4, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return false},
    onPrestige(gain) {

    },
    update(diff) {
        addPoints('cup', getResetGain('cup').sub(player.cup.total))
    },

    challenges: {
    },
    milestones: {

    },
    buyables: {
    },
    upgrades: {        
        11: {
            title: "copper projection upgrade 11",
            description: "multiply copper point gain by log(copper products)^4",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return getBuyableAmount('cu', 101).times(getBuyableAmount('cu', 102)).times(getBuyableAmount('cu', 103)).max(10).log10().pow(4)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "copper projection upgrade 12",
            description: "multiply copper point gain by log(copper points )^8",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return player.cu.points.max(10).log10().pow(8)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 11)}
        },
        13: {
            title: "copper projection upgrade 13",
            description: "multiply copper point gain by copper plates effect ^0.3",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return buyableEffect('cu', 101).pow(0.3)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 12)}
        },
        14: {
            title: "copper projection upgrade 14",
            description: "multiply copper point gain by guitar challenge effect",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return new Decimal(challengeCompletions('gi', 11)).max(1)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 13)}
        },
        21: {
            title: "copper projection upgrade 21",
            description: "raise copper coin passive effect to ^1.2",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return new Decimal(1.2)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 11)}
        },
        22: {
            title: "copper projection upgrade 22",
            description: "raise copper wires passive effect to ^1.25",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return new Decimal(1.25)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 21)&&hasUpgrade('cup', 12)}
        },
        23: {
            title: "copper projection upgrade 22",
            description: "raise copper plates passive effect to ^1.3",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return new Decimal(1.3)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 22)&&hasUpgrade('cup', 13)}
        },
    }
})

addLayer("pr", {
    name: "progress", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#188801",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "progress points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multpr = new Decimal(1e-10)
        multpr = multpr.times(buyableEffect('pr', 13))
        multpr = multpr.times(buyableEffect('pr', 42))
        multpr = multpr.times(buyableEffect('pr', 43))
        return multpr
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exppr = new Decimal(0.6)
        exp2pr = new Decimal(0.6)
        return expp

    },
    getResetGain() {
        prp = player.points.max(10).log10().times(multpr).pow(exppr)
        if (prp.gte(10)) {prp = prp.log10().pow(exp2pr).pow10()}

        if (prp.eq(Decimal.dNaN)) {prp = new Decimal(0)} 
        return prp.sub(player.pr.total).floor().max(0)
    },
    getNextAt() {
        nextpr = getResetGain('pr').add(1).add(player.pr.total)
        if (nextpr.gte(10)) {nextpr = nextpr.log10().root(exp2pr).pow10()}
        return nextpr.root(exppr).div(multpr).pow10()
    },
    canReset() {return getResetGain('pr').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('pr'))+" progress points. Next at "+format(getNextAt('pr'))+" points" },
    row: 5, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return player.points.gte('e1e7')||hasMilestone('pr', 10)},


    automate() {

    },
    milestones: {
        10: {
            done() { return player.pr.total.gte(1) },
            unlocked() {return true},
        },
    },
    update(diff) {
        if (getClickableState('pr', 11)==1) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).add(buyableEffect('pr', 103).times(diff)))}
        
        if (getClickableState('pr', 11)==2) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).add(buyableEffect('pr', 104).times(diff)))}
    },
    infoboxes: {
        C: {
            title: "progres subresources",
            body() {
                textpr = "Your progress points are giving "+format(buyableEffect('pr', 99))+" progress/base generation "
                textpr += "<br> You have "+format(getBuyableAmount('pr', 101))+" progress/message points ("+format(buyableEffect('pr', 103))+"/s), multiplying messages upgrade softcap start by "+format(buyableEffect('pr', 101))+", raising message points gain to "+format(buyableEffect('pr', 111))+", and dividing progress/copper points effective count by "+format(buyableEffect('pr', 121))
                textpr += "<br> You have "+format(getBuyableAmount('pr', 102))+" progress/copper points ("+format(buyableEffect('pr', 104))+"/s), multiplying copper subresources and copper points gain by "+format(buyableEffect('pr', 102))+", multiplying guitar points gain and copper coins effect softcap start by "+format(buyableEffect('pr', 112))+", and dividing progress/message points effective count by "+format(buyableEffect('pr', 122))
                textpr += "<br><br> Your progress/message subbuyables are making progress/copper subbuyables cost scale +"+format(buyableEffect('pr', 131))+" faster"
                textpr += "<br> Your progress/copper subbuyables are making progress/message subbuyables cost scale +"+format(buyableEffect('pr', 132))+" faster"


                return textpr
            }
        },
    },
    buyables: {
        11: {
            unlocked() {return getBuyableAmount('pr', 51).gte(1)},
            cost(x) { 
                costTypepr11 = "normal"
                costBasepr11 = new Decimal(2)
                costMultpr11 = new Decimal(1)
                costExppr11 = new Decimal(1.04)
                costLimitpr11 = new Decimal('e10')
                costStackpr11 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr11, costStackpr11, costBasepr11, costExppr11 ,costMultpr11, costLimitpr11 , false)
            },
            effect(x){
                effBasepr11 = new Decimal(1.5)
                effBasepr11 = effBasepr11.pow(buyableEffect('pr', 53))
                effStackpr11 = new Decimal(x)
                return effBasepr11.pow(effStackpr11)
            },
            title() { 
                return "progress/message subbuyable 11" 
            },
            display() {
                return "multiply progress/message point gain by "+format(effBasepr11)+" <br> Cost: "+format(this.cost())+" progress/message points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorm = {width: "150px", height: "150px", 'background-color': "#5465ff"}
                if (this.canAfford()) {return sizecolorm} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr11 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr11, getBuyableAmount('pr', 101), costBasepr11, costExppr11, costMultpr11, costLimitpr11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr11, getBuyableAmount('pr', 101), costBasepr11, costExppr11, costMultpr11, costLimitpr11))
                        if (getBuyableAmount('pr', 101).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(player.buyablePrice(costTypepr11, player.buyableMaxPurchaseable(costTypepr11, getBuyableAmount('pr', 101), costBasepr11, costExppr11, costMultpr11, costLimitpr11), costBasepr11, costExppr11, costMultpr11, costLimitpr11, false)))}
                    }
                }
            },
        },
        12: {
            unlocked() {return getBuyableAmount('pr', 51).gte(1)},
            cost(x) { 
                costTypepr12 = "normal"
                costBasepr12 = new Decimal(2.5)
                costMultpr12 = new Decimal(1.5)
                costExppr12 = new Decimal(1.04)
                costLimitpr12 = new Decimal('e10')
                costStackpr12 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr12, costStackpr12, costBasepr12, costExppr12 ,costMultpr12, costLimitpr12 , false)
            },
            effect(x){
                effBasepr12 = new Decimal(1.1)
                effBasepr12 = effBasepr12.pow(buyableEffect('pr', 53))
                effStackpr12 = new Decimal(x)
                return effBasepr12.pow(effStackpr12)
            },
            title() { 
                return "progress/message subbuyable 12" 
            },
            display() {
                return "raise point gain by "+format(effBasepr12)+" <br> Cost: "+format(this.cost())+" progress/message points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorm = {width: "150px", height: "150px", 'background-color': "#5465ff"}
                if (this.canAfford()) {return sizecolorm} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr12 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr12, getBuyableAmount('pr', 101), costBasepr12, costExppr12, costMultpr12, costLimitpr12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr12, getBuyableAmount('pr', 101), costBasepr12, costExppr12, costMultpr12, costLimitpr12))
                        if (getBuyableAmount('pr', 101).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(player.buyablePrice(costTypepr12, player.buyableMaxPurchaseable(costTypepr12, getBuyableAmount('pr', 101), costBasepr12, costExppr12, costMultpr12, costLimitpr12), costBasepr12, costExppr12, costMultpr12, costLimitpr12, false)))}
                    }
                }
            },
        },
        13: {
            unlocked() {return getBuyableAmount('pr', 51).gte(1)},
            cost(x) { 
                costTypepr13 = "normal"
                costBasepr13 = new Decimal(2.5)
                costMultpr13 = new Decimal(1.5)
                costExppr13 = new Decimal(1.04)
                costLimitpr13 = new Decimal('e10')
                costStackpr13 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr13, costStackpr13, costBasepr13, costExppr13 ,costMultpr13, costLimitpr13 , false)
            },
            effect(x){
                effBasepr13 = new Decimal(1.5)
                effBasepr13 = effBasepr13.pow(buyableEffect('pr', 53))
                effStackpr13 = new Decimal(x)
                return effBasepr13.pow(effStackpr13)
            },
            title() { 
                return "progress/copper subbuyable 13" 
            },
            display() {
                return "multiply progress point gain by "+format(effBasepr13)+" <br> Cost: "+format(this.cost())+" progress/copper points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorc = {width: "150px", height: "150px", 'background-color': "#9c410b"}
                if (this.canAfford()) {return sizecolorc} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr13 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr13, getBuyableAmount('pr', 102), costBasepr13, costExppr13, costMultpr13, costLimitpr13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr13, getBuyableAmount('pr', 102), costBasepr13, costExppr13, costMultpr13, costLimitpr13))
                        if (getBuyableAmount('pr', 102).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(player.buyablePrice(costTypepr13, player.buyableMaxPurchaseable(costTypepr13, getBuyableAmount('pr', 102), costBasepr13, costExppr13, costMultpr13, costLimitpr13), costBasepr13, costExppr13, costMultpr13, costLimitpr13, false)))}
                    }
                }
            },
        },
        14: {
            unlocked() {return getBuyableAmount('pr', 51).gte(1)},
            cost(x) { 
                costTypepr14 = "normal"
                costBasepr14 = new Decimal(2)
                costMultpr14 = new Decimal(1)
                costExppr14 = new Decimal(1.04)
                costLimitpr14 = new Decimal('e10')
                costStackpr14 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr14, costStackpr14, costBasepr14, costExppr14 ,costMultpr14, costLimitpr14 , false)
            },
            effect(x){
                effBasepr14 = new Decimal(1.5)
                effBasepr14 = effBasepr14.pow(buyableEffect('pr', 53))
                effStackpr14 = new Decimal(x)
                return effBasepr14.pow(effStackpr14)
            },
            title() { 
                return "progress/copper subbuyable 14" 
            },
            display() {
                return "multiply progress/copper point gain by "+format(effBasepr14)+" <br> Cost: "+format(this.cost())+" progress/copper points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorc = {width: "150px", height: "150px", 'background-color': "#9c410b"}
                if (this.canAfford()) {return sizecolorc} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr14 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr14, getBuyableAmount('pr', 102), costBasepr14, costExppr14, costMultpr14, costLimitpr14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr14, getBuyableAmount('pr', 102), costBasepr14, costExppr14, costMultpr14, costLimitpr14))
                        if (getBuyableAmount('pr', 102).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(player.buyablePrice(costTypepr14, player.buyableMaxPurchaseable(costTypepr14, getBuyableAmount('pr', 102), costBasepr14, costExppr14, costMultpr14, costLimitpr14), costBasepr14, costExppr14, costMultpr14, costLimitpr14, false)))}
                    }
                }
            },
        },
        21: {
            unlocked() {return getBuyableAmount('pr', 51).gte(2)},
            cost(x) { 
                costTypepr21 = "normal"
                costBasepr21 = new Decimal(2)
                costMultpr21 = new Decimal(2)
                costExppr21 = new Decimal(1.08)
                costLimitpr21 = new Decimal('e10')
                costStackpr21 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr21, costStackpr21, costBasepr21, costExppr21 ,costMultpr21, costLimitpr21 , false)
            },
            effect(x){
                effBasepr21 = new Decimal(2.5)
                effBasepr21 = effBasepr21.pow(buyableEffect('pr', 53))
                effStackpr21 = new Decimal(x)
                return effBasepr21.pow(effStackpr21)
            },
            title() { 
                return "progress/message subbuyable 21" 
            },
            display() {
                return "root prestige buyable scaling by "+format(effBasepr21)+" <br> Cost: "+format(this.cost())+" progress/message points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorm = {width: "150px", height: "150px", 'background-color': "#5465ff"}
                if (this.canAfford()) {return sizecolorm} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr21 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr21, getBuyableAmount('pr', 101), costBasepr21, costExppr21, costMultpr21, costLimitpr21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr21, getBuyableAmount('pr', 101), costBasepr21, costExppr21, costMultpr21, costLimitpr21))
                        if (getBuyableAmount('pr', 101).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(player.buyablePrice(costTypepr21, player.buyableMaxPurchaseable(costTypepr21, getBuyableAmount('pr', 101), costBasepr21, costExppr21, costMultpr21, costLimitpr21), costBasepr21, costExppr21, costMultpr21, costLimitpr21, false)))}
                    }
                }
            },
        },
        22: {
            unlocked() {return getBuyableAmount('pr', 51).gte(2)},
            cost(x) { 
                costTypepr22 = "normal"
                costBasepr22 = new Decimal(2)
                costMultpr22 = new Decimal(2)
                costExppr22 = new Decimal(1.24)
                costLimitpr22 = new Decimal('e10')
                costStackpr22 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr22, costStackpr22, costBasepr22, costExppr22 ,costMultpr22, costLimitpr22 , false)
            },
            effect(x){
                effBasepr22 = new Decimal(0.1)
                effBasepr22 = effBasepr22.times(buyableEffect('pr', 53))
                effStackpr22 = new Decimal(x)
                return effBasepr22.times(effStackpr22).add(1)
            },
            title() { 
                return "progress/message subbuyable 22" 
            },
            display() {
                return "add the divisor of the progress/message subbuyable scaling nerf by "+format(effBasepr22)+" <br> Cost: "+format(this.cost())+" progress/message points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorm = {width: "150px", height: "150px", 'background-color': "#5465ff"}
                if (this.canAfford()) {return sizecolorm} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr22 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr22, getBuyableAmount('pr', 101), costBasepr22, costExppr22, costMultpr22, costLimitpr22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr22, getBuyableAmount('pr', 101), costBasepr22, costExppr22, costMultpr22, costLimitpr22))
                        if (getBuyableAmount('pr', 101).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(player.buyablePrice(costTypepr22, player.buyableMaxPurchaseable(costTypepr22, getBuyableAmount('pr', 101), costBasepr22, costExppr22, costMultpr22, costLimitpr22), costBasepr22, costExppr22, costMultpr22, costLimitpr22, false)))}
                    }
                }
            },
        },
        23: {
            unlocked() {return getBuyableAmount('pr', 51).gte(2)},
            cost(x) { 
                costTypepr23 = "normal"
                costBasepr23 = new Decimal(2)
                costMultpr23 = new Decimal(2)
                costExppr23 = new Decimal(1.24)
                costLimitpr23 = new Decimal('e10')
                costStackpr23 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr23, costStackpr23, costBasepr23, costExppr23 ,costMultpr23, costLimitpr23 , false)
            },
            effect(x){
                effBasepr23 = new Decimal(0.1)
                effBasepr23 = effBasepr23.times(buyableEffect('pr', 53))
                effStackpr23 = new Decimal(x)
                return effBasepr23.times(effStackpr23).add(1)
            },
            title() { 
                return "progress/copper subbuyable 23" 
            },
            display() {
                return "add the divisor the progress/copper subbuyable scaling nerf by "+format(effBasepr23)+" <br> Cost: "+format(this.cost())+" progress/copper points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorc = {width: "150px", height: "150px", 'background-color': "#9c410b"}
                if (this.canAfford()) {return sizecolorc} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr23 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr23, getBuyableAmount('pr', 102), costBasepr23, costExppr23, costMultpr23, costLimitpr23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr23, getBuyableAmount('pr', 102), costBasepr23, costExppr23, costMultpr23, costLimitpr23))
                        if (getBuyableAmount('pr', 102).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(player.buyablePrice(costTypepr23, player.buyableMaxPurchaseable(costTypepr23, getBuyableAmount('pr', 102), costBasepr23, costExppr23, costMultpr23, costLimitpr23), costBasepr23, costExppr23, costMultpr23, costLimitpr23, false)))}
                    }
                }
            },
        },
        24: {
            unlocked() {return getBuyableAmount('pr', 51).gte(2)},
            cost(x) { 
                costTypepr24 = "normal"
                costBasepr24 = new Decimal(2)
                costMultpr24 = new Decimal(2)
                costExppr24 = new Decimal(1.08)
                costLimitpr24 = new Decimal('e10')
                costStackpr24 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr24, costStackpr24, costBasepr24, costExppr24 ,costMultpr24, costLimitpr24 , false)
            },
            effect(x){
                effBasepr24 = new Decimal(1.2)
                effBasepr24 = effBasepr24.pow(buyableEffect('pr', 53))
                effStackpr24 = new Decimal(x)
                return effBasepr24.pow(effStackpr24)
            },
            title() { 
                return "progress/copper subbuyable 24" 
            },
            display() {
                return "root the copper buyable scaling by "+format(effBasepr24)+" <br> Cost: "+format(this.cost())+" progress/copper points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorc = {width: "150px", height: "150px", 'background-color': "#9c410b"}
                if (this.canAfford()) {return sizecolorc} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr24 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr24, getBuyableAmount('pr', 102), costBasepr24, costExppr24, costMultpr24, costLimitpr24).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr24, getBuyableAmount('pr', 102), costBasepr24, costExppr24, costMultpr24, costLimitpr24))
                        if (getBuyableAmount('pr', 102).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(player.buyablePrice(costTypepr24, player.buyableMaxPurchaseable(costTypepr24, getBuyableAmount('pr', 102), costBasepr24, costExppr24, costMultpr24, costLimitpr24), costBasepr24, costExppr24, costMultpr24, costLimitpr24, false)))}
                    }
                }
            },
        },
        31: {
            unlocked() {return getBuyableAmount('pr', 51).gte(3)},
            cost(x) { 
                costTypepr31 = "normal"
                costBasepr31 = new Decimal(4)
                costMultpr31 = new Decimal(12.5)
                costExppr31 = new Decimal(1.32)
                costLimitpr31 = new Decimal('e10')
                costStackpr31 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr31, costStackpr31, costBasepr31, costExppr31 ,costMultpr31, costLimitpr31 , false)
            },
            effect(x){
                effBasepr31 = getBuyableAmount('pr', 101).max(10).log10().times(10).log10().pow(0.3).pow10().div(10)
                effBasepr31 = effBasepr31.pow(buyableEffect('pr', 53))
                effStackpr31 = new Decimal(x)
                return effBasepr31.pow(effStackpr31)
            },
            title() { 
                return "progress/message subbuyable 31" 
            },
            display() {
                return "multiply progress/message point gain by 10^(log10(log10(progress/message points))^0.3), currently "+format(effBasepr31)+" <br> Cost: "+format(this.cost())+" progress/message points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorm = {width: "150px", height: "150px", 'background-color': "#5465ff"}
                if (this.canAfford()) {return sizecolorm} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr31 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr31, getBuyableAmount('pr', 101), costBasepr31, costExppr31, costMultpr31, costLimitpr31).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr31, getBuyableAmount('pr', 101), costBasepr31, costExppr31, costMultpr31, costLimitpr31))
                        if (getBuyableAmount('pr', 101).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(player.buyablePrice(costTypepr31, player.buyableMaxPurchaseable(costTypepr31, getBuyableAmount('pr', 101), costBasepr31, costExppr31, costMultpr31, costLimitpr31), costBasepr31, costExppr31, costMultpr31, costLimitpr31, false)))}
                    }
                }
            },
        },
        32: {
            unlocked() {return getBuyableAmount('pr', 51).gte(3)},
            cost(x) { 
                costTypepr32 = "normal"
                costBasepr32 = new Decimal(3)
                costMultpr32 = new Decimal(10)
                costExppr32 = new Decimal(1.32)
                costLimitpr32 = new Decimal('e10')
                costStackpr32 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr32, costStackpr32, costBasepr32, costExppr32 ,costMultpr32, costLimitpr32 , false)
            },
            effect(x){
                effBasepr32 = new Decimal(0.05)
                effBasepr32 = effBasepr32.times(buyableEffect('pr', 53))
                effStackpr32 = new Decimal(x)
                return effBasepr32.times(effStackpr32).add(1)
            },
            title() { 
                return "progress/message subbuyable 32" 
            },
            display() {
                return "add the prestige upgrades 11-24 effect exponent power by "+format(effBasepr32)+" <br> Cost: "+format(this.cost())+" progress/message points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorm = {width: "150px", height: "150px", 'background-color': "#5465ff"}
                if (this.canAfford()) {return sizecolorm} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr32 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr32, getBuyableAmount('pr', 101), costBasepr32, costExppr32, costMultpr32, costLimitpr32).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr32, getBuyableAmount('pr', 101), costBasepr32, costExppr32, costMultpr32, costLimitpr32))
                        if (getBuyableAmount('pr', 101).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(player.buyablePrice(costTypepr32, player.buyableMaxPurchaseable(costTypepr32, getBuyableAmount('pr', 101), costBasepr32, costExppr32, costMultpr32, costLimitpr32), costBasepr32, costExppr32, costMultpr32, costLimitpr32, false)))}
                    }
                }
            },
        },
        33: {
            unlocked() {return getBuyableAmount('pr', 51).gte(3)},
            cost(x) { 
                costTypepr33 = "normal"
                costBasepr33 = new Decimal(3)
                costMultpr33 = new Decimal(10)
                costExppr33 = new Decimal(1.32)
                costLimitpr33 = new Decimal('e10')
                costStackpr33 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr33, costStackpr33, costBasepr33, costExppr33 ,costMultpr33, costLimitpr33 , false)
            },
            effect(x){
                effBasepr33 = new Decimal(1.01)
                effBasepr33 = effBasepr33.pow(buyableEffect('pr', 53))
                effStackpr33 = new Decimal(x)
                return effBasepr33.pow(effStackpr33)
            },
            title() { 
                return "progress/copper subbuyable 33" 
            },
            display() {
                return "raise silence/heavenly upgrade effects by "+format(effBasepr33)+" <br> Cost: "+format(this.cost())+" progress/copper points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorc = {width: "150px", height: "150px", 'background-color': "#9c410b"}
                if (this.canAfford()) {return sizecolorc} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr33 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr33, getBuyableAmount('pr', 102), costBasepr33, costExppr33, costMultpr33, costLimitpr33).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr33, getBuyableAmount('pr', 102), costBasepr33, costExppr33, costMultpr33, costLimitpr33))
                        if (getBuyableAmount('pr', 102).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(player.buyablePrice(costTypepr33, player.buyableMaxPurchaseable(costTypepr33, getBuyableAmount('pr', 102), costBasepr33, costExppr33, costMultpr33, costLimitpr33), costBasepr33, costExppr33, costMultpr33, costLimitpr33, false)))}
                    }
                }
            },
        },
        34: {
            unlocked() {return getBuyableAmount('pr', 51).gte(3)},
            cost(x) { 
                costTypepr34 = "normal"
                costBasepr34 = new Decimal(4)
                costMultpr34 = new Decimal(12.5)
                costExppr34 = new Decimal(1.32)
                costLimitpr34 = new Decimal('e10')
                costStackpr34 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr34, costStackpr34, costBasepr34, costExppr34 ,costMultpr34, costLimitpr34 , false)
            },
            effect(x){
                effBasepr34 = getBuyableAmount('pr', 102).max(10).log10().times(10).log10().pow(0.3).pow10().div(10)
                effBasepr34 = effBasepr34.pow(buyableEffect('pr', 53))
                effStackpr34 = new Decimal(x)
                return effBasepr34.pow(effStackpr34)
            },
            title() { 
                return "progress/copper subbuyable 34" 
            },
            display() {
                return "multiply progress/copper point gain by 10^log10(log10(progress/copper points))^0.3, currently "+format(effBasepr34)+" <br> Cost: "+format(this.cost())+" progress/copper points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorc = {width: "150px", height: "150px", 'background-color': "#9c410b"}
                if (this.canAfford()) {return sizecolorc} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr34 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr34, getBuyableAmount('pr', 102), costBasepr34, costExppr34, costMultpr34, costLimitpr34).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr34, getBuyableAmount('pr', 102), costBasepr34, costExppr34, costMultpr34, costLimitpr34))
                        if (getBuyableAmount('pr', 102).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(player.buyablePrice(costTypepr34, player.buyableMaxPurchaseable(costTypepr34, getBuyableAmount('pr', 102), costBasepr34, costExppr34, costMultpr34, costLimitpr34), costBasepr34, costExppr34, costMultpr34, costLimitpr34, false)))}
                    }
                }
            },
        },
        41: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr41 = "normal"
                costBasepr41 = new Decimal(3)
                costMultpr41 = new Decimal(50)
                costExppr41 = new Decimal(1.24)
                costLimitpr41 = new Decimal('e10')
                costStackpr41 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr41, costStackpr41, costBasepr41, costExppr41 ,costMultpr41, costLimitpr41 , false)
            },
            effect(x){
                effBasepr41 = player.ca.points.max('e1e10').log10().log10().log10().times(10).log10().pow(0.5).pow10().div(10)
                effBasepr41 = effBasepr41.pow(buyableEffect('pr', 53))
                effStackpr41 = new Decimal(x)
                return effBasepr41.pow(effStackpr41)
            },
            title() { 
                return "progress/message subbuyable 41" 
            },
            display() {
                return "multiply progress/message and progress/copper point gain by 10^(log10(log10(log10(log10(cable points))))-1)^0.5+1, currently "+format(effBasepr41)+" <br> Cost: "+format(this.cost())+" progress/message points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorm = {width: "150px", height: "150px", 'background-color': "#5465ff"}
                if (this.canAfford()) {return sizecolorm} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr41 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr41, getBuyableAmount('pr', 101), costBasepr41, costExppr41, costMultpr41, costLimitpr41).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr41, getBuyableAmount('pr', 101), costBasepr41, costExppr41, costMultpr41, costLimitpr41))
                        if (getBuyableAmount('pr', 101).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(player.buyablePrice(costTypepr41, player.buyableMaxPurchaseable(costTypepr41, getBuyableAmount('pr', 101), costBasepr41, costExppr41, costMultpr41, costLimitpr41), costBasepr41, costExppr41, costMultpr41, costLimitpr41, false)))}
                    }
                }
            },
        },
        42: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr42 = "normal"
                costBasepr42 = new Decimal(4)
                costMultpr42 = new Decimal(500)
                costExppr42 = new Decimal(1.5)
                costLimitpr42 = new Decimal('e10')
                costStackpr42 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr42, costStackpr42, costBasepr42, costExppr42 ,costMultpr42, costLimitpr42 , false)
            },
            effect(x){
                effBasepr42 = player.ca.points.max('e1e10').log10().log10().log10().times(10).log10().pow(0.5).pow10().div(10)
                effBasepr42 = effBasepr42.pow(buyableEffect('pr', 53))
                effStackpr42 = new Decimal(x)
                return effBasepr42.pow(effStackpr42)
            },
            title() { 
                return "progress/message subbuyable 42" 
            },
            display() {
                return "multiply progress point gain by 10^(log10(log10(log10(log10(cable points))))-1)^0.5+1, currently "+format(effBasepr42)+" <br> Cost: "+format(this.cost())+" progress/message points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorm = {width: "150px", height: "150px", 'background-color': "#5465ff"}
                if (this.canAfford()) {return sizecolorm} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr42 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr42, getBuyableAmount('pr', 101), costBasepr42, costExppr42, costMultpr42, costLimitpr42).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr42, getBuyableAmount('pr', 101), costBasepr42, costExppr42, costMultpr42, costLimitpr42))
                        if (getBuyableAmount('pr', 101).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 101, getBuyableAmount('pr', 101).sub(player.buyablePrice(costTypepr42, player.buyableMaxPurchaseable(costTypepr42, getBuyableAmount('pr', 101), costBasepr42, costExppr42, costMultpr42, costLimitpr42), costBasepr42, costExppr42, costMultpr42, costLimitpr42, false)))}
                    }
                }
            },
        },
        43: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr43 = "normal"
                costBasepr43 = new Decimal(4)
                costMultpr43 = new Decimal(500)
                costExppr43 = new Decimal(1.5)
                costLimitpr43 = new Decimal('e10')
                costStackpr43 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr43, costStackpr43, costBasepr43, costExppr43 ,costMultpr43, costLimitpr43 , false)
            },
            effect(x){
                effBasepr43 = player.gi.points.max(1e10).log10().log10().times(10).log10().pow(0.3).pow10().div(10)
                effBasepr43 = effBasepr43.pow(buyableEffect('pr', 53))
                effStackpr43 = new Decimal(x)
                return effBasepr43.pow(effStackpr43)
            },
            title() { 
                return "progress/copper subbuyable 43" 
            },
            display() {
                return "multiply progress point gain by 10^((log10(log10(log10(guitar points)))+1)^0.3-1), currently "+format(effBasepr43)+" <br> Cost: "+format(this.cost())+" progress/copper points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorc = {width: "150px", height: "150px", 'background-color': "#9c410b"}
                if (this.canAfford()) {return sizecolorc} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr43 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr43, getBuyableAmount('pr', 102), costBasepr43, costExppr43, costMultpr43, costLimitpr43).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr43, getBuyableAmount('pr', 102), costBasepr43, costExppr43, costMultpr43, costLimitpr43))
                        if (getBuyableAmount('pr', 102).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(player.buyablePrice(costTypepr43, player.buyableMaxPurchaseable(costTypepr43, getBuyableAmount('pr', 102), costBasepr43, costExppr43, costMultpr43, costLimitpr43), costBasepr43, costExppr43, costMultpr43, costLimitpr43, false)))}
                    }
                }
            },
        },
        44: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr44 = "normal"
                costBasepr44 = new Decimal(3)
                costMultpr44 = new Decimal(50)
                costExppr44 = new Decimal(1.24)
                costLimitpr44 = new Decimal('e10')
                costStackpr44 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr44, costStackpr44, costBasepr44, costExppr44 ,costMultpr44, costLimitpr44 , false)
            },
            effect(x){
                effBasepr44 = player.gi.points.max(1e10).log10().log10().times(10).log10().pow(0.3).pow10().div(10)
                effBasepr44 = effBasepr44.pow(buyableEffect('pr', 53))
                effStackpr44 = new Decimal(x)
                return effBasepr44.pow(effStackpr44)
            },
            title() { 
                return "progress/copper subbuyable 44" 
            },
            display() {
                return "multiply progress/message and progress/copper point gain by 10^((log10(log10(log10(guitar points)))+1)^0.3-1), currently "+format(effBasepr44)+" <br> Cost: "+format(this.cost())+" progress/copper points <br> Effect: "+format(this.effect())
            },
            style() {const sizecolorc = {width: "150px", height: "150px", 'background-color': "#9c410b"}
                if (this.canAfford()) {return sizecolorc} else {return {width: "150px", height: "150px"}}},
            canAfford() { return getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr44 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr44, getBuyableAmount('pr', 102), costBasepr44, costExppr44, costMultpr44, costLimitpr44).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr44, getBuyableAmount('pr', 102), costBasepr44, costExppr44, costMultpr44, costLimitpr44))
                        if (getBuyableAmount('pr', 102).lt('e100')&&!hasMilestone('cu', 1)) {setBuyableAmount('pr', 102, getBuyableAmount('pr', 102).sub(player.buyablePrice(costTypepr44, player.buyableMaxPurchaseable(costTypepr44, getBuyableAmount('pr', 102), costBasepr44, costExppr44, costMultpr44, costLimitpr44), costBasepr44, costExppr44, costMultpr44, costLimitpr44, false)))}
                    }
                }
            },
        },
        51: {
            unlocked() {return true},
            cost(x) { 
                costTypepr51 = "normal"
                costBasepr51 = new Decimal(30)
                costMultpr51 = new Decimal(3.3333333333333333)
                costExppr51 = new Decimal(1)
                costLimitpr51 = new Decimal('e10')
                costStackpr51 = new Decimal(x)
                return player.buyablePrice(costTypepr51, costStackpr51, costBasepr51, costExppr51 ,costMultpr51, costLimitpr51 , false)
            },
            effect(x){
                effBasepr51 = new Decimal(1)
                effStackpr51 = new Decimal(x)
                return effBasepr51.times(effStackpr51)
            },
            purchaseLimit: new Decimal(4),
            title() { 
                return "progress buyable 51" 
            },
            display() {
                return "Resets this layer except later buyables back to 1 progress point, delays the progress subpoint gain softcap by "+format(effBasepr51)+", and unlocks "+format(effBasepr51)+" row of progress upgrades (max 2) and buyables (max 4) <br> Cost: "+format(this.cost())+" progress/message and progress/copper points <br> Effect: "+format(this.effect())
            },
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())&&getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                this.buyMax()
            },
            buyMax() {
                pr53s = getBuyableAmount('pr', 53)
                pr52s = getBuyableAmount('pr', 52)
                thismaxPurchaseable = player.buyableMaxPurchaseable(costTypepr51, Decimal.min(getBuyableAmount('pr', 101), getBuyableAmount('pr', 102)), costBasepr51, costExppr51, costMultpr51, costLimitpr51).min(this.purchaseLimit)
                if (!false) {
                    doReset('pr')
                    layerDataReset('pr', ['challenges'])
                } //free requirement
                addPoints(this.layer, 1)
                setBuyableAmount(this.layer, this.id, thismaxPurchaseable)
                setBuyableAmount('pr', 52, pr52s)
                setBuyableAmount('pr', 52, pr53s)

            },
        },
        52: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr52 = "normal"
                costBasepr52 = new Decimal(100)
                costMultpr52 = new Decimal(27000000)
                costExppr52 = new Decimal(1.5)
                costLimitpr52 = new Decimal('e10000')
                costStackpr52 = new Decimal(x)
                return player.buyablePrice(costTypepr52, costStackpr52, costBasepr52, costExppr52 ,costMultpr52, costLimitpr52 , false)
            },
            effect(x){
                effBasepr52 = new Decimal(1)
                effStackpr52 = new Decimal(x)
                return effBasepr52.times(effStackpr52)
            },
            title() { 
                return "progress buyable 52" 
            },
            display() {
                return "Resets this layer except later buyables back to 1 progress point, and delays the progress subpoint gain softcap by "+format(effBasepr52)+" <br> Cost: "+format(this.cost())+" progress/message and progress/copper points <br> Effect: "+format(this.effect())
            },
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())&&getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                this.buyMax()
            },
            buyMax() {
                pr53s = getBuyableAmount('pr', 53)
                pr51s = getBuyableAmount('pr', 51)
                thismaxPurchaseable = player.buyableMaxPurchaseable(costTypepr52, Decimal.min(getBuyableAmount('pr', 101), getBuyableAmount('pr', 102)), costBasepr52, costExppr52, costMultpr52, costLimitpr52)
                if (!false) {
                    doReset('pr')
                    layerDataReset('pr', ['challenges'])
                } //free requirement
                addPoints(this.layer, 1)
                setBuyableAmount(this.layer, this.id, thismaxPurchaseable)
                setBuyableAmount('pr', 53, pr53s)
                setBuyableAmount('pr', 51, pr51s)
            },
        },
        53: {
            unlocked() {return true},
            cost(x) { 
                costTypepr53 = "large"
                costBasepr53 = new Decimal(3)
                costMultpr53 = new Decimal(5)
                costExppr53 = new Decimal(0.75)
                costLimitpr53 = new Decimal('ee10')
                costStackpr53 = new Decimal(x)
                return player.buyablePrice(costTypepr53, costStackpr53, costBasepr53, costExppr53 ,costMultpr53, costLimitpr53 , false)
            },
            effect(x){
                effBasepr53 = new Decimal(1.15)
                effStackpr53 = new Decimal(x)
                return effBasepr53.pow(effStackpr53)
            },
            title() { 
                return "progress buyable 53" 
            },
            display() {
                return "Resets this layer back to 1 progress point, and raise the progress subpoint and progress subbuyables effect by "+format(effBasepr53)+" <br> Cost: "+format(this.cost())+" progress/message and progress/copper points <br> Effect: "+format(this.effect())
            },
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())&&getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                this.buyMax()
            },
            buyMax() {
                thismaxPurchaseable = player.buyableMaxPurchaseable(costTypepr53, Decimal.min(getBuyableAmount('pr', 101), getBuyableAmount('pr', 102)), costBasepr53, costExppr53, costMultpr53, costLimitpr53)
                if (!false) {
                    doReset('pr')
                    layerDataReset('pr', ['challenges'])
                } //free requirement
                addPoints(this.layer, 1)
                setBuyableAmount(this.layer, this.id, thismaxPurchaseable)
            },
        },
        99: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                if (player.pr.points.eq(0)) {return Decimal.dZero}
                softcapStartpr = new Decimal(2)
                softcapStartpr = softcapStartpr.add(buyableEffect('pr', 51))
                softcapStartpr = softcapStartpr.add(buyableEffect('pr', 52))
                if (player.pr.points.lte(softcapStartpr)) {eff = Decimal.dTwo.pow(player.pr.points.sub(1))}
                else {eff = player.pr.points.sub(softcapStartpr.sub(2)).times(Decimal.dTwo.pow(softcapStartpr.sub(2)))}
                return eff
            },
            title() { 
                return "progress/base generation" 
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
        101: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                boosteff = getBuyableAmount('pr', 101)
                boosteff = boosteff.div(buyableEffect('pr', 122)).add(10)
                boosteff = boosteff.log10().pow(5)
                if (hasUpgrade('pr', 21)) {boosteff = boosteff.pow(upgradeEffect('pr', 21))}
                if (hasUpgrade('pr', 22)) {boosteff = boosteff.pow(upgradeEffect('pr', 22))}
                boosteff = boosteff.pow(buyableEffect('pr', 53))

                return boosteff
            },
            title() { 
                return "progress/message points" 
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
                boosteff = getBuyableAmount('pr', 102)
                boosteff = boosteff.div(buyableEffect('pr', 121)).add(10)
                boosteff = boosteff.log10().pow(5)
                if (hasUpgrade('pr', 21)) {boosteff = boosteff.pow(upgradeEffect('pr', 21))}
                if (hasUpgrade('pr', 22)) {boosteff = boosteff.pow(upgradeEffect('pr', 22))}
                boosteff = boosteff.pow(buyableEffect('pr', 53))

                return boosteff
            },
            title() { 
                return "progress/copper points" 
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
                eff = buyableEffect('pr', 99)

                eff = eff.times(buyableEffect('pr', 11))
                eff = eff.times(buyableEffect('pr', 31))
                eff = eff.times(buyableEffect('pr', 41))
                eff = eff.times(buyableEffect('pr', 44))
                return eff
            },
            title() { 
                return "progress/message generation" 
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
                eff = buyableEffect('pr', 99)


                eff = eff.times(buyableEffect('pr', 14))
                eff = eff.times(buyableEffect('pr', 34))
                eff = eff.times(buyableEffect('pr', 41))
                eff = eff.times(buyableEffect('pr', 44))
                return eff
            },
            title() { 
                return "progress/copper generation" 
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
                boosteff2 = getBuyableAmount('pr', 101)
                boosteff2 = boosteff2.div(buyableEffect('pr', 122)).add(10)
                boosteff2 = boosteff2.log10().pow(2)
                boosteff2 = boosteff2.times(10).log10().pow(0.8).pow10().div(10)
                if (hasUpgrade('pr', 21)) {boosteff2 = boosteff2.pow(upgradeEffect('pr', 21))}
                if (hasUpgrade('pr', 22)) {boosteff2 = boosteff2.pow(upgradeEffect('pr', 22))}
                boosteff2 = boosteff2.pow(buyableEffect('pr', 53))

                return boosteff2
            },
            title() { 
                return "progress/message 2nd effect" 
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
                boosteff2 = getBuyableAmount('pr', 102)
                boosteff2 = boosteff2.div(buyableEffect('pr', 121)).add(10)
                boosteff2 = boosteff2.log10().pow(2)
                boosteff2 = boosteff2.times(10).log10().pow(0.8).pow10().div(10)
                if (hasUpgrade('pr', 21)) {boosteff2 = boosteff2.pow(upgradeEffect('pr', 21))}
                if (hasUpgrade('pr', 22)) {boosteff2 = boosteff2.pow(upgradeEffect('pr', 22))}
                boosteff2 = boosteff2.pow(buyableEffect('pr', 53))

                return boosteff2
            },
            title() { 
                return "progress/copper 2nd effect" 
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
        121: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                boosteffneg = getBuyableAmount('pr', 101).add(1).pow(0.5)

                challprpr = new Decimal(challengeCompletions('pr', 11))
                if (challprpr.gte(10)) {challprpr = challprpr.log10().times(10)}
                challpr11eff = challprpr.add(10).div(10)

                boosteffneg = boosteffneg.root(challpr11eff)
                return boosteffneg
            },
            title() { 
                return "progress/message adverse effect" 
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
        122: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                boosteffneg = getBuyableAmount('pr', 102).add(1).pow(0.5)

                challprpr = new Decimal(challengeCompletions('pr', 11))
                if (challprpr.gte(10)) {challprpr = challprpr.log10().times(10)}
                challpr11eff = challprpr.add(10).div(10)

                boosteffneg = boosteffneg.root(challpr11eff)
                return boosteffneg
            },
            title() { 
                return "progress/copper adverse effect" 
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
        131: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = Decimal.dZero
                for (i1 = 1; i1 < 5; i1++) {
                    for (i2 = 1; i2 < 3; i2++) {
                        eff = eff.add(getBuyableAmount('pr', i1*10+i2)) 
                    }                    
                }
                eff = eff.times(0.2)
                eff = eff.div(buyableEffect('pr', 23))
                if (hasUpgrade('pr', 11)) {eff = eff.sub(upgradeEffect('pr', 11))}
                if (hasUpgrade('pr', 12)) {eff = eff.sub(upgradeEffect('pr', 12))}
                if (hasUpgrade('pr', 13)) {eff = eff.sub(upgradeEffect('pr', 13))}
                return eff
            },
            title() { 
                return "progress/message subbuyables adverse effect to progress/copper" 
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
        132: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = Decimal.dZero
                for (i3 = 1; i3 < 5; i3++) {
                    for (i4 = 3; i4 < 5; i4++) {
                        eff = eff.add(getBuyableAmount('pr', i3*10+i4)) 
                    }                    
                }
                eff = eff.times(0.2)
                eff = eff.div(buyableEffect('pr', 22))
                if (hasUpgrade('pr', 11)) {eff = eff.sub(upgradeEffect('pr', 11))}
                if (hasUpgrade('pr', 12)) {eff = eff.sub(upgradeEffect('pr', 12))}
                if (hasUpgrade('pr', 13)) {eff = eff.sub(upgradeEffect('pr', 13))}
                return eff
            },
            title() { 
                return "progress/copper subbuyables adverse effect to progress/message " 
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
    clickables: {
        11: {
            display() {return "Start collecting progress/message points "},
            canClick: true,
            onClick() {
                setClickableState(this.layer, this.id, 1)
            },
            style() {
                return {'background-color': "#5465ff"}
            }
        },
        12: {
            display() {return "Start collecting progress/copper points "},
            canClick: true,
            onClick() {
                setClickableState(this.layer, 11, 2)
            },
            style() {
                return {'background-color': "#9c410b"}
            }
        }
    },
    upgrades: {
        11: {
            title: "progress upgrade 11",
            description: "subtract log10(log10(log10(points)) levels from progress subbuyables scaling",
            cost: new Decimal(1),
            effect() {
                eff = player.points.max('e10').log10().log10().log10()
                return eff
            },
            effectDisplay() {return "-"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(1)}
        },
        12: {
            title: "progress upgrade 12",
            description: "subtract log10(log10(log10(prestige points)) levels from progress subbuyables scaling",
            cost: new Decimal(2),
            effect() {
                eff = player.p.points.max('e10').log10().log10().log10()
                return eff
            },
            effectDisplay() {return "-"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(1)}
        },
        13: {
            title: "progress upgrade 13",
            description: "subtract log10(log10(log10(cable points)) levels from progress subbuyables scaling",
            cost: new Decimal(3),
            effect() {
                eff = player.ca.points.max('e10').log10().log10().log10()
                return eff
            },
            effectDisplay() {return "-"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(1)}
        },
        14: {
            title: "progress upgrade 14",
            description: "raise point gain exponent by ^1.01",
            cost: new Decimal(4),
            effect() {
                eff = new Decimal(1.01)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(1)}
        },
        21: {
            title: "progress upgrade 21",
            description: "all positive progress subpoints effects are ^1.1",
            cost: new Decimal(10),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(2)}
        },
        22: {
            title: "progress upgrade 21",
            description: "all positive progress subpoints effects are ^1.2",
            cost: new Decimal(20),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(2)}
        },
        23: {
            title: "progress upgrade 23",
            description: "add 24 to harvest/silence buyable 11 purchase limit",
            cost: new Decimal(30),
            effect() {
                eff = new Decimal(24)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(2)}
        },
        24: {
            title: "progress upgrade 24",
            description: "raise point gain exponent by ^1.01",
            cost: new Decimal(40),
            effect() {
                eff = new Decimal(1.01)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(2)}
        },
    },
    challenges: {
        11: {
            unlocked() { return hasUpgrade('pr', 24)},
            name: "progress/message progress/copper coexistence challenges",
            challengeDescription: "Points and resettable layer points lower than this one are nerfed 10^x -> 10^(x^0.5).",
            canComplete() {
                goalprp = new Decimal(challengeCompletions(this.layer, this.id)).floor().add(1)

                challprp = player.points.max(10).log10().times(multpr).pow(exppr)
                if (challprp.gte(10)) {challprp = challprp.log10().pow(exp2pr).pow10()}

                return challprp.floor().sub(challengeCompletions(this.layer, this.id)).floor().max(0) * 1
            },
            goalDescription() { 
                textprchall11g = "Get "+format(goalprp)+" effective progress points on reset. "
                if (inChallenge(this.layer, this.id)) {textprchall11g += " Currently "+formatWhole(challprp.floor())+" effective progress points "}
                return textprchall11g
            },
            rewardEffect() {
                challprpr = new Decimal(challengeCompletions(this.layer, this.id))
                if (challprpr.gte(10)) {challprpr = challprpr.log10().times(10)}
                return challprpr.add(10).div(10)
            },
            rewardDescription() { 
                textprchall11r = formatWhole(challengeCompletions(this.layer, this.id))+"/"+formatWhole(this.completionLimit)+" completions, "
                // if (maxedChallenge(this.layer, this.id)) {
                //     textprchall11r += " fully allowing progress/harvest and progress/copper points to coexist"
                // } else {
                    textprchall11r += " reducing the progress/harvest and progress/copper conerf by ^1/"+format(this.rewardEffect())
                // }
                return textprchall11r
            },
            onEnter() {
            },
            completionLimit: 1e10,
        }
    }
})