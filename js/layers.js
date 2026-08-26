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
        if (hasUpgrade('pr', 32)) {expp = expp.times(upgradeEffect('pr', 32))}
        exp2p = new Decimal(0.96)
        if (inChallenge('pr', 11)) {exp2p = exp2p.times(0.5)}
        exp3p = new Decimal(0.96)
        exp4p = new Decimal(0.96)
        return expp

    },
    getResetGain() {
        pp = player.points.times(multp).pow(expp)
        if (pp.gte(10)) {pp = pp.log10().pow(exp2p).pow10()}
        if (pp.gte('1e10')) {pp = pp.log10().log10().pow(exp3p).pow10().pow10()}
        if (pp.gte('e1e10')) {pp = pp.log10().log10().log10().pow(exp4p).pow10().pow10().pow10()}
        if (pp.eq(Decimal.dNaN)) {pp = new Decimal(0)} 
        return pp.floor().max(0)
    },
    getNextAt() {
        nextp = getResetGain('p').add(1)
        if (nextp.gte('e1e10')) {nextp = nextp.log10().log10().log10().root(exp4p).pow10().pow10().pow10()}
        if (nextp.gte('1e10')) {nextp = nextp.log10().log10().root(exp3p).pow10().pow10()}
        if (nextp.gte(10)) {nextp = nextp.log10().root(exp2p).pow10()}
        return nextp.root(expp).div(multp)
    },
    canReset() {return getResetGain('p').gte(1)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige/proverb points", onPress(){
            if (canReset('pr')) {doReset('pr')} else {if (canReset(this.layer)) {doReset(this.layer)}}
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
        if ((layers[resettingLayer].row > 0.5) && (!hasMilestone('pr', 10))) {
            layerDataReset(this.layer)
            setBuyableAmount('p', 11, Decimal.dOne)
        }
    },
    automate() {
        if (hasMilestone('p', 0)&&player.p.autoBuyBuyable&&(!hasMilestone('ca', 0))) {
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
                costBaseLogp11 = costBaseLogp11.div(buyableEffect('ha', 12)).div(buyableEffect('pr', 21))
                costMultLogp11 = new Decimal(0.3010299956639812) // 2
                costMultLogp11 = costMultLogp11.sub(buyableEffect('ca', 11).log10())
                costExpp11 = new Decimal(1)
                costLimitLogp11 = new Decimal('1000')
                costLimitLogp11 = costLimitLogp11.times(buyableEffect('ha', 13))
                costStackp11 = new Decimal(x)
                return {cost: player.buyablePriceNew(costTypep11, costStackp11, costBaseLogp11, costExpp11 ,costMultLogp11, costLimitLogp11), continuum: player.buyableMaxPurchaseableNew(costTypep11, player.points, costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11).max(1)}
            },
            effect(x){
                effBasep11 = new Decimal(1)
                if (hasMilestone('ca', 0)) {effStackp11 = this.cost().continuum} else {effStackp11 = new Decimal(x)}
                return effBasep11.times(effStackp11)
            },
            title() { 
                return "prestige buyable 11" 
            },
            display() {
                return "increase point gain by "+format(effBasep11)+" <br> Cost: "+format(this.cost().cost)+" points <br> Effect: "+format(this.effect())
            },
            style() {const size = {width: "150px", height: "150px"}
                return size},
            canAfford() { return player.points.gte(this.cost().cost)&&(!hasMilestone('ca', 0)) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('ca', 0)) {} else {                
                    if ((costTypep11 == "asymptote")) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseableNew(costTypep11, player.points, costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep11, player.points, costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11))
                            if (player.points.lt('e100')) {player.points = player.points.sub(player.buyablePriceNew(costTypep11, player.buyableMaxPurchaseableNew(costTypep11, player.points, costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11), costBaseLogp11, costExpp11, costMultLogp11, costLimitLogp11))}
                        }
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
                costBaseLogp12 = costBaseLogp12.div(buyableEffect('ha', 12)).div(buyableEffect('pr', 21))
                costMultLogp12 = new Decimal(0.5642714304385625) // 3.6666666666
                costMultLogp12 = costMultLogp12.sub(buyableEffect('ca', 11).log10())
                costExpp12 = new Decimal(1)
                costLimitLogp12 = new Decimal('1000')
                costLimitLogp12 = costLimitLogp12.times(buyableEffect('ha', 13))
                costStackp12 = new Decimal(x)
                return {cost: player.buyablePriceNew(costTypep12, costStackp12, costBaseLogp12, costExpp12 ,costMultLogp12, costLimitLogp12), continuum: player.buyableMaxPurchaseableNew(costTypep12, player.points, costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12)}
            },
            effect(x){
                effBasep12 = new Decimal(1)
                if (hasMilestone('ca', 0)) {effStackp12 = this.cost().continuum} else {effStackp12 = new Decimal(x)}
                return effBasep12.times(effStackp12)
            },
            title() { 
                return "prestige buyable 12" 
            },
            display() {
                return "increase point gain by "+format(effBasep12)+" <br> Cost: "+format(this.cost().cost)+" points <br> Effect: "+format(this.effect())
            },
            style() {const size = {width: "150px", height: "150px"}
                return size},
            canAfford() { return player.points.gte(this.cost().cost)&&(!hasMilestone('ca', 0)) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('ca', 0)) {} else {
                    if ((costTypep12 == "asymptote")) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseableNew(costTypep12, player.points, costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep12, player.points, costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12))
                            if (player.points.lt('e100')) {player.points = player.points.sub(player.buyablePriceNew(costTypep12, player.buyableMaxPurchaseableNew(costTypep12, player.points, costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12), costBaseLogp12, costExpp12, costMultLogp12, costLimitLogp12))}
                        }
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
                costBaseLogp13 = costBaseLogp13.div(buyableEffect('ha', 12)).div(buyableEffect('pr', 21))
                costMultLogp13 = new Decimal(0.7781512503836436) // 6
                costMultLogp13 = costMultLogp13.sub(buyableEffect('ca', 11).log10())
                costExpp13 = new Decimal(1)
                costLimitLogp13 = new Decimal('1000')
                costLimitLogp13 = costLimitLogp13.times(buyableEffect('ha', 13))
                costStackp13 = new Decimal(x)
                return {cost: player.buyablePriceNew(costTypep13, costStackp13, costBaseLogp13, costExpp13 ,costMultLogp13, costLimitLogp13), continuum: player.buyableMaxPurchaseableNew(costTypep13, player.points, costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13)}
            },
            effect(x){
                effBasep13 = new Decimal(1)
                if (hasMilestone('ca', 0)) {effStackp13 = this.cost().continuum} else {effStackp13 = new Decimal(x)}
                return effBasep13.times(effStackp13)
            },
            title() { 
                return "prestige buyable 13" 
            },
            display() {
                return "increase point gain by "+format(effBasep13)+" <br> Cost: "+format(this.cost().cost)+" points <br> Effect: "+format(this.effect())
            },
            style() {const size = {width: "150px", height: "150px"}
                return size},
            canAfford() { return player.points.gte(this.cost().cost)&&(!hasMilestone('ca', 0)) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('ca', 0)) {} else {
                    if ((costTypep13 == "asymptote")) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseableNew(costTypep13, player.points, costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep13, player.points, costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13))
                            if (player.points.lt('e100')) {player.points = player.points.sub(player.buyablePriceNew(costTypep13, player.buyableMaxPurchaseableNew(costTypep13, player.points, costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13), costBaseLogp13, costExpp13, costMultLogp13, costLimitLogp13))}
                        }
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
                costBaseLogp14 = costBaseLogp14.div(buyableEffect('ha', 12)).div(buyableEffect('pr', 21))
                costMultLogp14 = new Decimal(-3) // 1e-3
                costMultLogp14 = costMultLogp14.sub(buyableEffect('ca', 11).log10())
                costExpp14 = new Decimal(1.15)
                costLimitLogp14 = new Decimal('100')
                costLimitLogp14 = costLimitLogp14.times(buyableEffect('ha', 13))
                costStackp14 = new Decimal(x)
                return {cost: player.buyablePriceNew(costTypep14, costStackp14, costBaseLogp14, costExpp14 ,costMultLogp14, costLimitLogp14), continuum: player.buyableMaxPurchaseableNew(costTypep14, player.points, costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14)}
            },
            effect(x){
                effBasep14 = new Decimal(1.2).add(buyableEffect('ha', 11))
                if (hasMilestone('ca', 0)) {effStackp14 = this.cost().continuum} else {effStackp14 = new Decimal(x)}
                return effBasep14.pow(effStackp14)
            },
            title() { 
                return "prestige buyable 14" 
            },
            display() {
                return "multiply point gain by "+format(effBasep14)+" <br> Cost: "+format(this.cost().cost)+" points <br> Effect: "+format(this.effect())
            },
            style() {const size = {width: "150px", height: "150px"}
                return size},
            canAfford() { return player.points.gte(this.cost().cost)&&(!hasMilestone('ca', 0)) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('ca', 0)) {} else {
                    if ((costTypep14 == "asymptote")) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseableNew(costTypep14, player.points, costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep14, player.points, costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14))
                            if (player.points.lt('e100')) {player.points = player.points.sub(player.buyablePriceNew(costTypep14, player.buyableMaxPurchaseableNew(costTypep14, player.points, costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14), costBaseLogp14, costExpp14, costMultLogp14, costLimitLogp14))}
                        }
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
                costBaseLogp15 = costBaseLogp15.div(buyableEffect('ha', 12)).div(buyableEffect('pr', 21))
                costMultLogp15 = new Decimal(-2.886056647693163) // 1e-3
                costMultLogp15 = costMultLogp15.sub(buyableEffect('ca', 11).log10())
                costExpp15 = new Decimal(1.2)
                costLimitLogp15 = new Decimal('100')
                costLimitLogp15 = costLimitLogp15.times(buyableEffect('ha', 13))
                costStackp15 = new Decimal(x)
                return {cost: player.buyablePriceNew(costTypep15, costStackp15, costBaseLogp15, costExpp15 ,costMultLogp15, costLimitLogp15), continuum: player.buyableMaxPurchaseableNew(costTypep15, player.points, costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15)}
            },
            effect(x){
                effBasep15 = new Decimal(1.2).add(buyableEffect('ha', 11))
                if (hasMilestone('ca', 0)) {effStackp15 = this.cost().continuum} else {effStackp15 = new Decimal(x)}
                return effBasep15.pow(effStackp15)
            },
            title() { 
                return "prestige buyable 15" 
            },
            display() {
                return "multiply point gain by "+format(effBasep15)+" <br> Cost: "+format(this.cost().cost)+" points <br> Effect: "+format(this.effect())
            },
            style() {const size = {width: "150px", height: "150px"}
                return size},
            canAfford() { return player.points.gte(this.cost().cost)&&(!hasMilestone('ca', 0)) },
            buy() {
                if (hasMilestone('ca', 0)) {} else {player.points = player.points.sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('ca', 0)) {} else {
                    if ((costTypep15 == "asymptote")) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseableNew(costTypep15, player.points, costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseableNew(costTypep15, player.points, costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15))
                            if (player.points.lt('e100')&&!hasMilestone('ca', 0)) {player.points = player.points.sub(player.buyablePriceNew(costTypep15, player.buyableMaxPurchaseableNew(costTypep15, player.points, costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15), costBaseLogp15, costExpp15, costMultLogp15, costLimitLogp15))}
                        }
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
                eff = eff.times(buyableEffect('pr', 21))
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
        multca = multca.times(buyableEffect('cu', 84))
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
    doReset(resettingLayer){
        if ((layers[resettingLayer].row > 1.5) && (!hasMilestone('pr', 10))) {
            layerDataReset(this.layer)
        }
    },
    automate() {

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
                return {cost: player.buyablePrice(costTypeca11, costStackca11, costBaseca11, costExpca11 ,costMultca11, costLimitca11 , true), continuum: player.buyableMaxPurchaseable(costTypeca11, player.ca.points, costBaseca11, costExpca11, costMultca11, costLimitca11, false)}
            },
            effect(x){
                if (inChallenge('mec', 11)) {return Decimal.dOne}
                effBaseca11 = new Decimal(5)
                if (hasMilestone('me', 0)) {effStackca11 = this.cost().continuum} else {effStackca11 = new Decimal(x)}
                return effBaseca11.pow(effStackca11)
            },
            title() { 
                return "cable buyable 11" 
            },
            display() {
                return "divide prestige buyable 1x costs by "+format(effBaseca11)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ca.points.gte(this.cost().cost)&&(!inChallenge('mec', 11))&&(!hasMilestone('me', 0)) },
            buy() {
                if (!hasMilestone('me', 0)) {player.ca.points = player.ca.points.sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('me', 0)) {} {
                    if ((costTypeca11 == "asymptote")||player.ca.points.lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypeca11, player.ca.points, costBaseca11, costExpca11, costMultca11, costLimitca11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeca11, player.ca.points, costBaseca11, costExpca11, costMultca11, costLimitca11))
                            if (player.ca.points.lt('e100')) {player.ca.points = player.ca.points.sub(player.buyablePrice(costTypeca11, player.buyableMaxPurchaseable(costTypeca11, player.ca.points, costBaseca11, costExpca11, costMultca11, costLimitca11), costBaseca11, costExpca11, costMultca11, costLimitca11, true))}
                        }
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                eff = eff.times(buyableEffect('pr', 21))
                eff = eff.pow(2)
                if (hasUpgrade('mec', 21)) {eff = eff.pow(upgradeEffect('mec', 21))}
                if (hasUpgrade('ca', 44)) {eff = eff.pow(upgradeEffect('ca', 44))}
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
                if (eff.gte(10)) {eff = eff.log10().pow(buyableEffect('pr', 32)).pow10()}
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
        multme = multme.times(buyableEffect('cu', 41))
        multme = multme.times(buyableEffect('cu', 73))
        multme = multme.times(buyableEffect('cu', 83))
        return multme
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expme = new Decimal(0.2)
        expme = expme.times(buyableEffect('si', 13))
        if (hasUpgrade('si', 24)) {expme = expme.times(upgradeEffect('si', 24))}
        if (hasUpgrade('gi', 52)) {expme = expme.times(upgradeEffect('gi', 52))}
        if (hasUpgrade('pr', 33)) {expme = expme.times(upgradeEffect('pr', 33))}
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
            requirementDescription: "10 total message points",
            effectDescription: "automate cable upgrades and buyables",
            done() { return player.me.total.gte(10)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10) },
            unlocked() {return player.me.total.gte(10)||hasMilestone('ha', 10)||hasMilestone('si', 10)||hasMilestone('cu', 10)},
        },
        2: {
            requirementDescription: "1,000 total message points",
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
                return {cost: player.buyablePrice(costTypeme11, costStackme11, costBaseme11, costExpme11 ,costMultme11, costLimitme11 , true), continuum: player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11)}
            },
            effect(x){
                effBaseme11 = player.p.points.max(2).log(2)
                effBaseme11 = effBaseme11.pow(buyableEffect('si', 11))
                if (hasMilestone('ha', 0)||hasMilestone('si', 0)) {effStackme11 = this.cost().continuum} else {effStackme11 = new Decimal(x)}
                return effBaseme11.pow(effStackme11)
            },
            title() { 
                return "message buyable 11" 
            },
            display() {
                return "multiply point gain by log2(prestige points), currently "+format(effBaseme11)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.me.points.gte(this.cost().cost)&&(!(hasMilestone('ha', 0)||hasMilestone('si', 0))) },
            buy() {
                if (!(hasMilestone('ha', 0)||hasMilestone('si', 0))) {player.me.points = player.me.points.sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((hasMilestone('ha', 0)||hasMilestone('si', 0))) {} else {
                    if ((costTypeme11 == "asymptote")) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11))
                            if (player.me.points.lt('e100')) {player.me.points = player.me.points.sub(player.buyablePrice(costTypeme11, player.buyableMaxPurchaseable(costTypeme11, player.me.points, costBaseme11, costExpme11, costMultme11, costLimitme11), costBaseme11, costExpme11, costMultme11, costLimitme11, true))}
                        }
                    }
                }
            },
        },
    },
    upgrades: {
        11: {
            title: "message upgrade 11",
            description: "raise prestige upgrade 11 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(1),
            effect() {
                eff = player.me.points.add(2).log(2)
                if (hasUpgrade('gi', 41)) {eff = eff.times(upgradeEffect('gi', 41))}
                if (hasUpgrade('gi', 42)) {eff = eff.times(upgradeEffect('gi', 42))}
                eff = eff.pow(buyableEffect('pr', 63))
                softcapStartme = new Decimal(5)
                if (hasUpgrade('si', 14)) {softcapStartme = softcapStartme.times(upgradeEffect('si', 14))}
                softcapStartme = softcapStartme.times(buyableEffect('pr', 101))
                if (eff.gte(softcapStartme)) {
                    eff = eff.log(softcapStartme).times(softcapStartme)
                }
                if (isNaN(eff)) {return new Decimal(1)} else {return eff}
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(2),
            effect() {
                return upgradeEffect('me', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(3),
            effect() {
                return upgradeEffect('me', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(4),
            effect() {
                return upgradeEffect('me', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(5),
            effect() {
                return upgradeEffect('me', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(6),
            effect() {
                return upgradeEffect('me', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(7),
            effect() {
                return upgradeEffect('me', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message points +2), softcapped at ^5",
            cost: new Decimal(8),
            effect() {
                return upgradeEffect('me', 11)
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
                return {cost: player.buyablePrice(costTypemec11, costStackmec11, costBasemec11, costExpmec11 ,costMultmec11, costLimitmec11 , true), continuum: player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11)}
            },
            effect(x){
                effBasemec11 = player.ca.points.max(2).log(2)
                effBasemec11 = effBasemec11.pow(buyableEffect('si', 11))
                if (hasMilestone('ha', 0)||hasMilestone('si', 0)) {effStackmec11 = this.cost().continuum} else {effStackmec11 = new Decimal(x)}
                return effBasemec11.pow(effStackmec11)
            },
            title() { 
                return "message decabled buyable 11" 
            },
            display() {
                return "multiply point gain by log2(cable points), currently "+format(effBasemec11)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.mec.points.gte(this.cost().cost)&&(!(hasMilestone('ha', 0)||hasMilestone('si', 0))) },
            buy() {
                if (!(hasMilestone('ha', 0)||hasMilestone('si', 0))) {player.mec.points = player.mec.points.sub(this.cost().cost)}
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((hasMilestone('ha', 0)||hasMilestone('si', 0))) {} else {
                    if ((costTypemec11 == "asymptote")) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11))
                            if (player.mec.points.lt('e100')) {player.mec.points = player.mec.points.sub(player.buyablePrice(costTypemec11, player.buyableMaxPurchaseable(costTypemec11, player.mec.points, costBasemec11, costExpmec11, costMultmec11, costLimitmec11), costBasemec11, costExpmec11, costMultmec11, costLimitmec11, true))}
                        }
                    }
                }

            },
        },
    },
    upgrades: {
        11: {
            title: "message decabled upgrade 11",
            description: "raise prestige upgrade 11 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(1),
            effect() {
                eff = player.mec.points.add(2).log(2)
                if (hasUpgrade('gi', 41)) {eff = eff.times(upgradeEffect('gi', 41))}
                if (hasUpgrade('gi', 42)) {eff = eff.times(upgradeEffect('gi', 42))}
                eff = eff.pow(buyableEffect('pr', 63))
                softcapStartmec = new Decimal(5)
                if (hasUpgrade('si', 14)) {softcapStartmec = softcapStartmec.times(upgradeEffect('si', 14))}
                softcapStartmec = softcapStartmec.times(buyableEffect('pr', 101))
                if (eff.gte(softcapStartmec)) {
                    eff = eff.log(softcapStartmec).times(softcapStartmec)
                }
                if (isNaN(eff)) {return new Decimal(1)} else {return eff}
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "message decabled upgrade 12",
            description: "raise prestige upgrade 12 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(2),
            effect() {
                return upgradeEffect('mec', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "message decabled upgrade 13",
            description: "raise prestige upgrade 13 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(3),
            effect() {
                return upgradeEffect('mec', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "message decabled upgrade 14",
            description: "raise prestige upgrade 14 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(4),
            effect() {
                return upgradeEffect('mec', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "message decabled upgrade 21",
            description: "raise prestige upgrade 21 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(5),
            effect() {
                return upgradeEffect('mec', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "message decabled upgrade 22",
            description: "raise prestige upgrade 22 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(6),
            effect() {
                return upgradeEffect('mec', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "message decabled upgrade 23",
            description: "raise prestige upgrade 23 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(7),
            effect() {
                return upgradeEffect('mec', 11)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "message decabled upgrade 24",
            description: "raise prestige upgrade 24 effect to log2(message decabled points +2), softcapped at ^5",
            cost: new Decimal(8),
            effect() {
                return upgradeEffect('mec', 11)
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
        multha = multha.times(buyableEffect('cu', 62))
        multha = multha.times(buyableEffect('cu', 72))
        multha = multha.times(buyableEffect('cu', 82))
        if (hasUpgrade('gi', 21)) {multha = multha.times(upgradeEffect('gi', 21))}
        return multha
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expha = new Decimal(4)
        if (hasUpgrade('gi', 31)) {expha = expha.times(upgradeEffect('gi', 31))}
        if (hasUpgrade('gi', 43)) {expha = expha.times(upgradeEffect('gi', 43))}
        expha = expha.times(buyableEffect('gi', 24))
        exp2ha = new Decimal(1.2)
        if (hasUpgrade('gi', 44)) {exp2ha = exp2ha.times(upgradeEffect('gi', 44))}
        if (hasUpgrade('pr', 23)) {exp2ha = exp2ha.times(upgradeEffect('pr', 23))}
        if (inChallenge('gi', 11)) {exp2ha = exp2ha.times(0.3)}
        if (inChallenge('pr', 11)) {exp2ha = exp2ha.times(0.5)}
        exp3ha = new Decimal(0.96)
        return expha
    },
    getResetGain() {
        hap = player.points.log10().times(multha).pow(expha)
        if (hap.gte(10)) {hap = hap.log10().pow(exp2ha).pow10()}
        if (hap.gte(1e10)) {hap = hap.log10().log10().pow(exp3ha).pow10().pow10()}
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
        if (nextha.gte(1e10)) {nextha = nextha.log10().log10().root(exp3ha).pow10().pow10()}
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
            requirementDescription: "1,000 total harvest points",
            effectDescription: "automatically gain message points on reset and automate message buyables",
            done() { return player.ha.total.gte(1e3)||hasMilestone('pr', 10) },
            unlocked() {return player.ha.total.gte(1e3)||hasMilestone('pr', 10)},
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
                return {cost: player.buyablePrice(costTypeha11, costStackha11, costBaseha11, costExpha11 ,costMultha11, costLimitha11 , true), continuum: player.buyableMaxPurchaseable(costTypeha11, player.ha.points, costBaseha11, costExpha11, costMultha11, costLimitha11, false).min(this.purchaseLimit())}
            },
            effect(x){
                effBaseha11 = new Decimal(0.05)
                if (hasMilestone('cu',0)) {effStackha11 = this.cost().continuum} else {effStackha11 = new Decimal(x)}
                return effBaseha11.times(effStackha11)
            },
            title() { 
                return "harvest buyable 11" 
            },
            purchaseLimit() {
                return new Decimal(56)
            },
            display() {
                return "add prestige buyable 14/15 effect by "+format(effBaseha11)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost().cost)&&(!hasMilestone('cu', 0))},
            buy() {
                if (!hasMilestone('cu', 0)) {player.ha.points = player.ha.points.sub(this.cost().cost)} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('cu', 0)) {} else {
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
                return {cost: player.buyablePrice(costTypeha12, costStackha12, costBaseha12, costExpha12 ,costMultha12, costLimitha12 , true), continuum: player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12, false).min(this.purchaseLimit())}
            },
            effect(x){
                effBaseha12 = new Decimal(1.05)
                if (hasMilestone('cu',0)) {effStackha12 = this.cost().continuum} else {effStackha12 = new Decimal(x)}
                return effBaseha12.pow(effStackha12)
            },
            title() { 
                return "harvest buyable 12" 
            },
            purchaseLimit() {
                return new Decimal(24)
            },
            display() {
                return "root prestige buyable 1x scaling by "+format(effBaseha12)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost().cost)&&(!hasMilestone('cu', 0))},
            buy() {
                if (!hasMilestone('cu', 0)) {player.ha.points = player.ha.points.sub(this.cost())} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('cu', 0)) {} else {
                    if ((costTypeha12 == "asymptote")||player.ha.points.lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12).min(this.purchaseLimit()))
                            if (player.ha.points.lt('e100')) {player.ha.points = player.ha.points.sub(player.buyablePrice(costTypeha12, player.buyableMaxPurchaseable(costTypeha12, player.ha.points, costBaseha12, costExpha12, costMultha12, costLimitha12), costBaseha12, costExpha12, costMultha12, costLimitha12, true))}
                        }
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
                return {cost: player.buyablePrice(costTypeha13, costStackha13, costBaseha13, costExpha13 ,costMultha13, costLimitha13 , true), continuum: player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13, false).min(this.purchaseLimit())}
            },
            effect(x){
                effBaseha13 = new Decimal(2)
                if (hasMilestone('cu',0)) {effStackha13 = this.cost().continuum} else {effStackha13 = new Decimal(x)}
                return effBaseha13.pow(effStackha13)
            },
            purchaseLimit() {
                return new Decimal(9)
            },
            title() { 
                return "harvest buyable 13" 
            },
            display() {
                return "raise prestige buyable 1x softcap start by "+format(effBaseha13)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.ha.points.gte(this.cost().cost)&&(!hasMilestone('cu', 0))},
            buy() {
                if (!hasMilestone('cu', 0)){player.ha.points = player.ha.points.sub(this.cost())} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('cu', 0)) {} else {
                    if ((costTypeha13 == "asymptote")||player.ha.points.lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13).min(this.purchaseLimit()))
                            if (player.ha.points.lt('e100')) {player.ha.points = player.ha.points.sub(player.buyablePrice(costTypeha13, player.buyableMaxPurchaseable(costTypeha13, player.ha.points, costBaseha13, costExpha13, costMultha13, costLimitha13), costBaseha13, costExpha13, costMultha13, costLimitha13, true))}
                        }
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
        multsi = multsi.times(buyableEffect('cu', 62))
        multsi = multsi.times(buyableEffect('cu', 72))
        multsi = multsi.times(buyableEffect('cu', 82))
        if (hasUpgrade('gi', 21)) {multsi = multsi.times(upgradeEffect('gi', 21))}
        return multsi
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expsi = new Decimal(4)
        if (hasUpgrade('gi', 31)) {expsi = expsi.times(upgradeEffect('gi', 31))}
        if (hasUpgrade('gi', 43)) {expsi = expsi.times(upgradeEffect('gi', 43))}
        expsi = expsi.times(buyableEffect('gi', 24))
        exp2si = new Decimal(1.2)
        if (hasUpgrade('gi', 44)) {exp2si = exp2si.times(upgradeEffect('gi', 44))}
        if (hasUpgrade('pr', 23)) {exp2si = exp2si.times(upgradeEffect('pr', 23))}
        if (inChallenge('gi', 11)) {exp2si = exp2si.times(0.3)}
        if (inChallenge('pr', 11)) {exp2si = exp2si.times(0.5)}
        exp3si = new Decimal(0.96)
        return expsi

    },
    getResetGain() {
        sip = player.points.log10().times(multsi).pow(expsi)
        if (sip.gte(10)) {sip = sip.log10().pow(exp2si).pow10()}
        if (sip.gte('1e10')) {sip = sip.log10().log10().pow(exp3si).pow10().pow10()}
        choseHarvest = hasMilestone('ha', 10)
        if (choseHarvest&&!maxedChallenge('gi', 11)&&!inChallenge('gi', 11)) {
            if (!hasChallenge('gi', 11)) {sipMax = new Decimal(0)} else {sipMax = Decimal.dTen.pow(Math.log10(challengeCompletions('gi', 11))**2)}
            sip = sip.min(sipMax)
        }

        return sip.floor().max(0)
    },
    getNextAt() {
        nextsi = getResetGain('si').add(1)
        if (nextsi.gte(1e10)) {nextsi = nextsi.log10().log10().root(exp3si).pow10().pow10()}
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
                return {cost: player.buyablePrice(costTypesi11, costStacksi11, costBasesi11, costExpsi11 ,costMultsi11, costLimitsi11 , true), continuum: player.buyableMaxPurchaseable(costTypesi11, player.si.points, costBasesi11, costExpsi11, costMultsi11, costLimitsi11, false).min(this.purchaseLimit())}
            },
            effect(x){
                effBasesi11 = new Decimal(1.05)
                if (hasMilestone('cu',0)) {effStacksi11 = this.cost().continuum} else {effStacksi11 = new Decimal(x)}
                return effBasesi11.pow(effStacksi11)
            },
            title() { 
                return "silence buyable 11" 
            },
            purchaseLimit() {
                return new Decimal(56)
            },
            display() {
                return "raise message buyable effect by "+format(effBasesi11)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.si.points.gte(this.cost().cost)&&(!hasMilestone('cu', 0))},
            buy() {
                if (!hasMilestone('cu', 0)){player.si.points = player.si.points.sub(this.cost().cost)} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('cu', 0)) {} else {
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
                return {cost: player.buyablePrice(costTypesi12, costStacksi12, costBasesi12, costExpsi12 ,costMultsi12, costLimitsi12 , true), continuum: player.buyableMaxPurchaseable(costTypesi12, player.si.points, costBasesi12, costExpsi12, costMultsi12, costLimitsi12, false).min(this.purchaseLimit())}
            },
            effect(x){
                effBasesi12 = new Decimal(1.25)
                if (hasMilestone('cu',0)) {effStacksi12 = this.cost().continuum} else {effStacksi12 = new Decimal(x)}
                return effBasesi12.pow(effStacksi12)
            },
            title() { 
                return "silence buyable 12" 
            },
            display() {
                return "divide message buyable 11s scaling by "+format(effBasesi12)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            purchaseLimit() {
                return new Decimal(24)
            },
            canAfford() { return player.si.points.gte(this.cost().cost)&&(!hasMilestone('cu', 0))},
            buy() {
                if (!hasMilestone('cu', 0)){player.si.points = player.si.points.sub(this.cost().cost)} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('cu', 0)) {} else {
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
                return {cost: player.buyablePrice(costTypesi13, costStacksi13, costBasesi13, costExpsi13 ,costMultsi13, costLimitsi13 , true), continuum: player.buyableMaxPurchaseable(costTypesi13, player.si.points, costBasesi13, costExpsi13, costMultsi13, costLimitsi13, false).min(this.purchaseLimit())}
            },
            effect(x){
                effBasesi13 = new Decimal(1.5)
                if (hasMilestone('cu',0)) {effStacksi13 = this.cost().continuum} else {effStacksi13 = new Decimal(x)}
                return effBasesi13.pow(effStacksi13)
            },
            purchaseLimit() {
                return new Decimal(9)
            },
            title() { 
                return "silence buyable 13" 
            },
            display() {
                return "raise message gain by "+format(effBasesi13)+" <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.si.points.gte(this.cost().cost)&&(!hasMilestone('cu', 0))},
            buy() {
                if (!hasMilestone('cu', 0)){player.si.points = player.si.points.sub(this.cost().cost)} // csinge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('cu', 0)) {} else {
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
            description: "raise point gain by log10(log10(prestige points))^0.5/1.2",
            cost: new Decimal(2),
            effect() {
                eff = player.p.points.max('ee1.44').log10().log10().pow(0.5).div(1.2)
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
            description: "message upgrades softcap start x4 later",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(4)
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
        multcu = multcu.times(buyableEffect('gi', 22))
        multcu = multcu.times(buyableEffect('cu', 51))
        return multcu
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expcu = new Decimal(0.2)
        if (hasUpgrade('gi', 53)) {expcu = expcu.times(upgradeEffect('gi', 53))}
        if (hasUpgrade('pr', 33)) {expcu = expcu.times(upgradeEffect('pr', 33))}
        exp2cu = new Decimal(0.6)
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
            unlocked() {return getBuyableAmount('cu', 101).gte('1e50')||player.cup.points.gte(1)},
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
        3: {
            requirementDescription: "1e10,000 total copper points",
            effectDescription: "automate copper mirror buyables",
            done() { return player.cu.total.gte('e1e4') },
            unlocked() {return player.cu.total.gte('e1e4')},
        },
        10: {
            done() { return player.cu.total.gte(1)||hasMilestone('pr', 10) },
            effectDescription: "multiply point gain by 1,000,000",
            unlocked() {return true},
        },
    },
    update(diff) {
        addBuyables('cu', 101, buyableEffect('cu', 113).times(diff))
        addBuyables('cu', 102, buyableEffect('cu', 111).times(diff))
        addBuyables('cu', 103, buyableEffect('cu', 112).times(diff))
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
                if (hasUpgrade('cup', 32)) {costLimitcu11 = costLimitcu11.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu11 = costLimitcu11.pow(upgradeEffect('gi', 63))}
                costStackcu11 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu11, costStackcu11, costBasecu11, costExpcu11 ,costMultcu11, costLimitcu11 , false), continuum: player.buyableMaxPurchaseable(costTypecu11, getBuyableAmount('cu', 103), costBasecu11, costExpcu11, costMultcu11, costLimitcu11)}
            },
            effect(x){
                effBasecu11 = getBuyableAmount('cu', 103).max(1).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu11 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu11 = this.cost().continuum} else {effStackcu11 = new Decimal(x)}}
                return effBasecu11.pow(effStackcu11)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 11" 
            },
            display() {
                return "multiply point gain by copper coins, currently "+format(effBasecu11)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu11 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu11, getBuyableAmount('cu', 103), costBasecu11, costExpcu11, costMultcu11, costLimitcu11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu11, getBuyableAmount('cu', 103), costBasecu11, costExpcu11, costMultcu11, costLimitcu11))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu11, player.buyableMaxPurchaseable(costTypecu11, getBuyableAmount('cu', 103), costBasecu11, costExpcu11, costMultcu11, costLimitcu11), costBasecu11, costExpcu11, costMultcu11, costLimitcu11, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu12 = costLimitcu12.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu12 = costLimitcu12.pow(upgradeEffect('gi', 63))}
                costStackcu12 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu12, costStackcu12, costBasecu12, costExpcu12 ,costMultcu12, costLimitcu12 , false), continuum: player.buyableMaxPurchaseable(costTypecu12, getBuyableAmount('cu', 103), costBasecu12, costExpcu12, costMultcu12, costLimitcu12)}
            },
            effect(x){
                effBasecu12 = player.points.max(2).log(2).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu12 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu12 = this.cost().continuum} else {effStackcu12 = new Decimal(x)}}
                return effBasecu12.pow(effStackcu12)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 12" 
            },
            display() {
                return "multiply point gain by log2(points), currently "+format(effBasecu12)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu12 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu12, getBuyableAmount('cu', 103), costBasecu12, costExpcu12, costMultcu12, costLimitcu12).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu12, getBuyableAmount('cu', 103), costBasecu12, costExpcu12, costMultcu12, costLimitcu12))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu12, player.buyableMaxPurchaseable(costTypecu12, getBuyableAmount('cu', 103), costBasecu12, costExpcu12, costMultcu12, costLimitcu12), costBasecu12, costExpcu12, costMultcu12, costLimitcu12, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu13 = costLimitcu13.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu13 = costLimitcu13.pow(upgradeEffect('gi', 63))}
                costStackcu13 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu13, costStackcu13, costBasecu13, costExpcu13 ,costMultcu13, costLimitcu13 , false), continuum: player.buyableMaxPurchaseable(costTypecu13, getBuyableAmount('cu', 103), costBasecu13, costExpcu13, costMultcu13, costLimitcu13)}
            },
            effect(x){
                effBasecu13 = player.p.points.max(2).log(2).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu13 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu13 = this.cost().continuum} else {effStackcu13 = new Decimal(x)}}
                return effBasecu13.pow(effStackcu13)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 13" 
            },
            display() {
                return "multiply point gain by log2(prestige points), currently "+format(effBasecu13)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu13 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu13, getBuyableAmount('cu', 103), costBasecu13, costExpcu13, costMultcu13, costLimitcu13).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu13, getBuyableAmount('cu', 103), costBasecu13, costExpcu13, costMultcu13, costLimitcu13))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu13, player.buyableMaxPurchaseable(costTypecu13, getBuyableAmount('cu', 103), costBasecu13, costExpcu13, costMultcu13, costLimitcu13), costBasecu13, costExpcu13, costMultcu13, costLimitcu13, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu14 = costLimitcu14.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu14 = costLimitcu14.pow(upgradeEffect('gi', 63))}
                costStackcu14 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu14, costStackcu14, costBasecu14, costExpcu14 ,costMultcu14, costLimitcu14 , false), continuum: player.buyableMaxPurchaseable(costTypecu14, getBuyableAmount('cu', 103), costBasecu14, costExpcu14, costMultcu14, costLimitcu14)}
            },
            effect(x){
                effBasecu14 = player.ca.points.max(2).log(2).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu14 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu14 = this.cost().continuum} else {effStackcu14 = new Decimal(x)}}
                return effBasecu14.pow(effStackcu14)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 14" 
            },
            display() {
                return "multiply point gain by log2(cable points), currently "+format(effBasecu14)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu14 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu14, getBuyableAmount('cu', 103), costBasecu14, costExpcu14, costMultcu14, costLimitcu14).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu14, getBuyableAmount('cu', 103), costBasecu14, costExpcu14, costMultcu14, costLimitcu14))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu14, player.buyableMaxPurchaseable(costTypecu14, getBuyableAmount('cu', 103), costBasecu14, costExpcu14, costMultcu14, costLimitcu14), costBasecu14, costExpcu14, costMultcu14, costLimitcu14, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu21 = costLimitcu21.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu21 = costLimitcu21.pow(upgradeEffect('gi', 63))}
                costStackcu21 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu21, costStackcu21, costBasecu21, costExpcu21 ,costMultcu21, costLimitcu21 , false), continuum: player.buyableMaxPurchaseable(costTypecu21, getBuyableAmount('cu', 103), costBasecu21, costExpcu21, costMultcu21, costLimitcu21)}
            },
            effect(x){
                effBasecu21 = getBuyableAmount('cu', 102).max(1).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu21 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu21 = this.cost().continuum} else {effStackcu21 = new Decimal(x)}}
                return effBasecu21.pow(effStackcu21)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 21" 
            },
            display() {
                return "multiply prestige point gain by copper wires, currently "+format(effBasecu21)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu21 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu21, getBuyableAmount('cu', 103), costBasecu21, costExpcu21, costMultcu21, costLimitcu21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu21, getBuyableAmount('cu', 103), costBasecu21, costExpcu21, costMultcu21, costLimitcu21))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu21, player.buyableMaxPurchaseable(costTypecu21, getBuyableAmount('cu', 103), costBasecu21, costExpcu21, costMultcu21, costLimitcu21), costBasecu21, costExpcu21, costMultcu21, costLimitcu21, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu22 = costLimitcu22.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu22 = costLimitcu22.pow(upgradeEffect('gi', 63))}
                costStackcu22 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu22, costStackcu22, costBasecu22, costExpcu22 ,costMultcu22, costLimitcu22 , false), continuum: player.buyableMaxPurchaseable(costTypecu22, getBuyableAmount('cu', 103), costBasecu22, costExpcu22, costMultcu22, costLimitcu22)}
            },
            effect(x){
                effBasecu22 = player.p.points.max(2).log(2).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu22 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu22 = this.cost().continuum} else {effStackcu22 = new Decimal(x)}}
                return effBasecu22.pow(effStackcu22)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 22" 
            },
            display() {
                return "multiply prestige point gain by log2(prestige points), currently "+format(effBasecu22)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu22 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu22, getBuyableAmount('cu', 103), costBasecu22, costExpcu22, costMultcu22, costLimitcu22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu22, getBuyableAmount('cu', 103), costBasecu22, costExpcu22, costMultcu22, costLimitcu22))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu22, player.buyableMaxPurchaseable(costTypecu22, getBuyableAmount('cu', 103), costBasecu22, costExpcu22, costMultcu22, costLimitcu22), costBasecu22, costExpcu22, costMultcu22, costLimitcu22, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu23 = costLimitcu23.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu23 = costLimitcu23.pow(upgradeEffect('gi', 63))}
                costStackcu23 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu23, costStackcu23, costBasecu23, costExpcu23 ,costMultcu23, costLimitcu23 , false), continuum: player.buyableMaxPurchaseable(costTypecu23, getBuyableAmount('cu', 103), costBasecu23, costExpcu23, costMultcu23, costLimitcu23)}
            },
            effect(x){
                effBasecu23 = player.ca.points.max(2).log(2).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu23 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu23 = this.cost().continuum} else {effStackcu23 = new Decimal(x)}}
                return effBasecu23.pow(effStackcu23)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 23" 
            },
            display() {
                return "multiply prestige point gain by log2(cable points), currently "+format(effBasecu23)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu23 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu23, getBuyableAmount('cu', 103), costBasecu23, costExpcu23, costMultcu23, costLimitcu23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu23, getBuyableAmount('cu', 103), costBasecu23, costExpcu23, costMultcu23, costLimitcu23))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu23, player.buyableMaxPurchaseable(costTypecu23, getBuyableAmount('cu', 103), costBasecu23, costExpcu23, costMultcu23, costLimitcu23), costBasecu23, costExpcu23, costMultcu23, costLimitcu23, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu31 = costLimitcu31.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu31 = costLimitcu31.pow(upgradeEffect('gi', 63))}
                costStackcu31 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu31, costStackcu31, costBasecu31, costExpcu31 ,costMultcu31, costLimitcu31 , false), continuum: player.buyableMaxPurchaseable(costTypecu31, getBuyableAmount('cu', 103), costBasecu31, costExpcu31, costMultcu31, costLimitcu31)}
            },
            effect(x){
                effBasecu31 = getBuyableAmount('cu', 101).max(1).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu31 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu31 = this.cost().continuum} else {effStackcu31 = new Decimal(x)}}
                return effBasecu31.pow(effStackcu31)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 31" 
            },
            display() {
                return "multiply cable point gain by copper plates, currently "+format(effBasecu31)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu31 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu31, getBuyableAmount('cu', 103), costBasecu31, costExpcu31, costMultcu31, costLimitcu31).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu31, getBuyableAmount('cu', 103), costBasecu31, costExpcu31, costMultcu31, costLimitcu31))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu31, player.buyableMaxPurchaseable(costTypecu31, getBuyableAmount('cu', 103), costBasecu31, costExpcu31, costMultcu31, costLimitcu31), costBasecu31, costExpcu31, costMultcu31, costLimitcu31, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu32 = costLimitcu32.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu32 = costLimitcu32.pow(upgradeEffect('gi', 63))}
                costStackcu32 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu32, costStackcu32, costBasecu32, costExpcu32 ,costMultcu32, costLimitcu32 , false), continuum: player.buyableMaxPurchaseable(costTypecu32, getBuyableAmount('cu', 103), costBasecu32, costExpcu32, costMultcu32, costLimitcu32)}
            },
            effect(x){
                effBasecu32 = player.ca.points.max(2).log(2).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu32 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu32 = this.cost().continuum} else {effStackcu32 = new Decimal(x)}}
                return effBasecu32.pow(effStackcu32)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 32" 
            },
            display() {
                return "multiply cable point gain by log2(cable points), currently "+format(effBasecu32)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu32 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu32, getBuyableAmount('cu', 103), costBasecu32, costExpcu32, costMultcu32, costLimitcu32).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu32, getBuyableAmount('cu', 103), costBasecu32, costExpcu32, costMultcu32, costLimitcu32))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu32, player.buyableMaxPurchaseable(costTypecu32, getBuyableAmount('cu', 103), costBasecu32, costExpcu32, costMultcu32, costLimitcu32), costBasecu32, costExpcu32, costMultcu32, costLimitcu32, false).times(-1))}
                        }
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
                if (hasUpgrade('cup', 32)) {costLimitcu41 = costLimitcu41.pow(upgradeEffect('cup', 32))}
                if (hasUpgrade('gi', 63)) {costLimitcu41 = costLimitcu41.pow(upgradeEffect('gi', 63))}
                costStackcu41 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu41, costStackcu41, costBasecu41, costExpcu41 ,costMultcu41, costLimitcu41 , false), continuum: player.buyableMaxPurchaseable(costTypecu41, getBuyableAmount('cu', 103), costBasecu41, costExpcu41, costMultcu41, costLimitcu41, false)}
            },
            effect(x){
                effBasecu41 = player.cu.points.max(1).pow(buyableEffect('cu', 103))
                if (inChallenge('gi', 11)) {effStackcu41 = new Decimal(1)} else {if (hasMilestone('cu', 1)) {effStackcu41 = this.cost().continuum} else {effStackcu41 = new Decimal(x)}}
                return effBasecu41.pow(effStackcu41)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper buyable 41" 
            },
            display() {
                return "multiply message point gain by copper points, currently "+format(effBasecu41)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 1))},
            buy() {
                if (!hasMilestone('cu', 1)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 1)) {
                    if ((costTypecu41 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu41, getBuyableAmount('cu', 103), costBasecu41, costExpcu41, costMultcu41, costLimitcu41).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu41, getBuyableAmount('cu', 103), costBasecu41, costExpcu41, costMultcu41, costLimitcu41))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu41, player.buyableMaxPurchaseable(costTypecu41, getBuyableAmount('cu', 103), costBasecu41, costExpcu41, costMultcu41, costLimitcu41), costBasecu41, costExpcu41, costMultcu41, costLimitcu41, false).times(-1))}
                        }
                    }
                }
            },
        },
        51: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu51 = "large"
                costBasecu51 = new Decimal(6)
                costMultcu51 = new Decimal(1)
                costExpcu51 = new Decimal(1.3)
                costLimitcu51 = new Decimal('e1e8')
                costStackcu51 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu51, costStackcu51, costBasecu51, costExpcu51 ,costMultcu51, costLimitcu51 , false), continuum: player.buyableMaxPurchaseable(costTypecu51, getBuyableAmount('cu', 103), costBasecu51, costExpcu51, costMultcu51, costLimitcu51, false)}
            },
            effect(x){
                effBasecu51 = player.si.points.max(player.ha.points).max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu51 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu51 = this.cost().continuum} else {effStackcu51 = new Decimal(x)}}
                return effBasecu51.pow(effStackcu51)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 51" 
            },
            display() {
                return "multiply copper point gain by log10(silence/harvest point), currently "+format(effBasecu51)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu51 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu51, getBuyableAmount('cu', 103), costBasecu51, costExpcu51, costMultcu51, costLimitcu51).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu51, getBuyableAmount('cu', 103), costBasecu51, costExpcu51, costMultcu51, costLimitcu51))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu51, player.buyableMaxPurchaseable(costTypecu51, getBuyableAmount('cu', 103), costBasecu51, costExpcu51, costMultcu51, costLimitcu51), costBasecu51, costExpcu51, costMultcu51, costLimitcu51, false).times(-1))}
                        }
                    }
                }
            },
        },
        61: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu61 = "large"
                costBasecu61 = new Decimal(6)
                costMultcu61 = new Decimal(1)
                costExpcu61 = new Decimal(1.3)
                costLimitcu61 = new Decimal('e1e8')
                costStackcu61 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu61, costStackcu61, costBasecu61, costExpcu61 ,costMultcu61, costLimitcu61 , false), continuum: player.buyableMaxPurchaseable(costTypecu61, getBuyableAmount('cu', 103), costBasecu61, costExpcu61, costMultcu61, costLimitcu61, false)}
            },
            effect(x){
                effBasecu61 = player.me.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu61 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu61 = this.cost().continuum} else {effStackcu61 = new Decimal(x)}}
                return effBasecu61.pow(effStackcu61)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 61" 
            },
            display() {
                return "multiply copper plates gain by log10(message points), currently "+format(effBasecu61)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu61 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu61, getBuyableAmount('cu', 103), costBasecu61, costExpcu61, costMultcu61, costLimitcu61).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu61, getBuyableAmount('cu', 103), costBasecu61, costExpcu61, costMultcu61, costLimitcu61))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu61, player.buyableMaxPurchaseable(costTypecu61, getBuyableAmount('cu', 103), costBasecu61, costExpcu61, costMultcu61, costLimitcu61), costBasecu61, costExpcu61, costMultcu61, costLimitcu61, false).times(-1))}
                        }
                    }
                }
            },
        },
        62: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu62 = "large"
                costBasecu62 = new Decimal(5)
                costMultcu62 = new Decimal(1)
                costExpcu62 = new Decimal(1.3)
                costLimitcu62 = new Decimal('e1e8')
                costStackcu62 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu62, costStackcu62, costBasecu62, costExpcu62 ,costMultcu62, costLimitcu62 , false), continuum: player.buyableMaxPurchaseable(costTypecu62, getBuyableAmount('cu', 103), costBasecu62, costExpcu62, costMultcu62, costLimitcu62, false)}
            },
            effect(x){
                effBasecu62 = player.me.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu62 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu62 = this.cost().continuum} else {effStackcu62 = new Decimal(x)}}
                return effBasecu62.pow(effStackcu62)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 62" 
            },
            display() {
                return "multiply silence/harvest gain by log10(message points), currently "+format(effBasecu62)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu62 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu62, getBuyableAmount('cu', 103), costBasecu62, costExpcu62, costMultcu62, costLimitcu62).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu62, getBuyableAmount('cu', 103), costBasecu62, costExpcu62, costMultcu62, costLimitcu62))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu62, player.buyableMaxPurchaseable(costTypecu62, getBuyableAmount('cu', 103), costBasecu62, costExpcu62, costMultcu62, costLimitcu62), costBasecu62, costExpcu62, costMultcu62, costLimitcu62, false).times(-1))}
                        }
                    }
                }
            },
        },
        71: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu71 = "large"
                costBasecu71 = new Decimal(6)
                costMultcu71 = new Decimal(1)
                costExpcu71 = new Decimal(1.3)
                costLimitcu71 = new Decimal('e1e8')
                costStackcu71 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu71, costStackcu71, costBasecu71, costExpcu71 ,costMultcu71, costLimitcu71 , false), continuum: player.buyableMaxPurchaseable(costTypecu71, getBuyableAmount('cu', 103), costBasecu71, costExpcu71, costMultcu71, costLimitcu71, false)}
            },
            effect(x){
                effBasecu71 = player.ca.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu71 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu71 = this.cost().continuum} else {effStackcu71 = new Decimal(x)}}
                return effBasecu71.pow(effStackcu71)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 71" 
            },
            display() {
                return "multiply copper wires gain by log10(message points), currently "+format(effBasecu71)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu71 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu71, getBuyableAmount('cu', 103), costBasecu71, costExpcu71, costMultcu71, costLimitcu71).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu71, getBuyableAmount('cu', 103), costBasecu71, costExpcu71, costMultcu71, costLimitcu71))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu71, player.buyableMaxPurchaseable(costTypecu71, getBuyableAmount('cu', 103), costBasecu71, costExpcu71, costMultcu71, costLimitcu71), costBasecu71, costExpcu71, costMultcu71, costLimitcu71, false).times(-1))}
                        }
                    }
                }
            },
        },
        72: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu72 = "large"
                costBasecu72 = new Decimal(5)
                costMultcu72 = new Decimal(1)
                costExpcu72 = new Decimal(1.3)
                costLimitcu72 = new Decimal('e1e8')
                costStackcu72 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu72, costStackcu72, costBasecu72, costExpcu72 ,costMultcu72, costLimitcu72 , false), continuum: player.buyableMaxPurchaseable(costTypecu72, getBuyableAmount('cu', 103), costBasecu72, costExpcu72, costMultcu72, costLimitcu72, false)}
            },
            effect(x){
                effBasecu72 = player.ca.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu72 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu72 = this.cost().continuum} else {effStackcu72 = new Decimal(x)}}
                return effBasecu72.pow(effStackcu72)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 72" 
            },
            display() {
                return "multiply silence/harvest gain by log10(cable points), currently "+format(effBasecu72)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu72 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu72, getBuyableAmount('cu', 103), costBasecu72, costExpcu72, costMultcu72, costLimitcu72).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu72, getBuyableAmount('cu', 103), costBasecu72, costExpcu72, costMultcu72, costLimitcu72))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu72, player.buyableMaxPurchaseable(costTypecu72, getBuyableAmount('cu', 103), costBasecu72, costExpcu72, costMultcu72, costLimitcu72), costBasecu72, costExpcu72, costMultcu72, costLimitcu72, false).times(-1))}
                        }
                    }
                }
            },
        },
        73: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu73 = "large"
                costBasecu73 = new Decimal(4)
                costMultcu73 = new Decimal(1)
                costExpcu73 = new Decimal(1.3)
                costLimitcu73 = new Decimal('e1e8')
                costStackcu73 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu73, costStackcu73, costBasecu73, costExpcu73 ,costMultcu73, costLimitcu73 , false), continuum: player.buyableMaxPurchaseable(costTypecu73, getBuyableAmount('cu', 103), costBasecu73, costExpcu73, costMultcu73, costLimitcu73, false)}
            },
            effect(x){
                effBasecu73 = player.ca.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu73 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu73 = this.cost().continuum} else {effStackcu73 = new Decimal(x)}}
                return effBasecu73.pow(effStackcu73)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 73" 
            },
            display() {
                return "multiply message gain by log10(cable points), currently "+format(effBasecu73)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu73 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu73, getBuyableAmount('cu', 103), costBasecu73, costExpcu73, costMultcu73, costLimitcu73).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu73, getBuyableAmount('cu', 103), costBasecu73, costExpcu73, costMultcu73, costLimitcu73))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu73, player.buyableMaxPurchaseable(costTypecu73, getBuyableAmount('cu', 103), costBasecu73, costExpcu73, costMultcu73, costLimitcu73), costBasecu73, costExpcu73, costMultcu73, costLimitcu73, false).times(-1))}
                        }
                    }
                }
            },
        },
        81: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu81 = "large"
                costBasecu81 = new Decimal(6)
                costMultcu81 = new Decimal(1)
                costExpcu81 = new Decimal(1.3)
                costLimitcu81 = new Decimal('e1e8')
                costStackcu81 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu81, costStackcu81, costBasecu81, costExpcu81 ,costMultcu81, costLimitcu81 , false), continuum: player.buyableMaxPurchaseable(costTypecu81, getBuyableAmount('cu', 103), costBasecu81, costExpcu81, costMultcu81, costLimitcu81, false)}
            },
            effect(x){
                effBasecu81 = player.p.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu81 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu81 = this.cost().continuum} else {effStackcu81 = new Decimal(x)}}
                return effBasecu81.pow(effStackcu81)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 81" 
            },
            display() {
                return "multiply copper coin gain by log10(prestige points), currently "+format(effBasecu81)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu81 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu81, getBuyableAmount('cu', 103), costBasecu81, costExpcu81, costMultcu81, costLimitcu81).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu81, getBuyableAmount('cu', 103), costBasecu81, costExpcu81, costMultcu81, costLimitcu81))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu81, player.buyableMaxPurchaseable(costTypecu81, getBuyableAmount('cu', 103), costBasecu81, costExpcu81, costMultcu81, costLimitcu81), costBasecu81, costExpcu81, costMultcu81, costLimitcu81, false).times(-1))}
                        }
                    }
                }
            },
        },
        82: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu82 = "large"
                costBasecu82 = new Decimal(5)
                costMultcu82 = new Decimal(1)
                costExpcu82 = new Decimal(1.3)
                costLimitcu82 = new Decimal('e1e8')
                costStackcu82 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu82, costStackcu82, costBasecu82, costExpcu82 ,costMultcu82, costLimitcu82 , false), continuum: player.buyableMaxPurchaseable(costTypecu82, getBuyableAmount('cu', 103), costBasecu82, costExpcu82, costMultcu82, costLimitcu82, false)}
            },
            effect(x){
                effBasecu82 = player.p.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu82 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu82 = this.cost().continuum} else {effStackcu82 = new Decimal(x)}}
                return effBasecu82.pow(effStackcu82)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 82" 
            },
            display() {
                return "multiply silence/harvest gain by log10(prestige points), currently "+format(effBasecu82)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu82 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu82, getBuyableAmount('cu', 103), costBasecu82, costExpcu82, costMultcu82, costLimitcu82).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu82, getBuyableAmount('cu', 103), costBasecu82, costExpcu82, costMultcu82, costLimitcu82))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu82, player.buyableMaxPurchaseable(costTypecu82, getBuyableAmount('cu', 103), costBasecu82, costExpcu82, costMultcu82, costLimitcu82), costBasecu82, costExpcu82, costMultcu82, costLimitcu82, false).times(-1))}
                        }
                    }
                }
            },
        },
        83: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu83 = "large"
                costBasecu83 = new Decimal(4)
                costMultcu83 = new Decimal(1)
                costExpcu83 = new Decimal(1.3)
                costLimitcu83 = new Decimal('e1e8')
                costStackcu83 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu83, costStackcu83, costBasecu83, costExpcu83 ,costMultcu83, costLimitcu83 , false), continuum: player.buyableMaxPurchaseable(costTypecu83, getBuyableAmount('cu', 103), costBasecu83, costExpcu83, costMultcu83, costLimitcu83, false)}
            },
            effect(x){
                effBasecu83 = player.p.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu83 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu83 = this.cost().continuum} else {effStackcu83 = new Decimal(x)}}
                return effBasecu83.pow(effStackcu83)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 83" 
            },
            display() {
                return "multiply message gain by log10(prestige points), currently "+format(effBasecu83)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu83 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu83, getBuyableAmount('cu', 103), costBasecu83, costExpcu83, costMultcu83, costLimitcu83).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu83, getBuyableAmount('cu', 103), costBasecu83, costExpcu83, costMultcu83, costLimitcu83))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu83, player.buyableMaxPurchaseable(costTypecu83, getBuyableAmount('cu', 103), costBasecu83, costExpcu83, costMultcu83, costLimitcu83), costBasecu83, costExpcu83, costMultcu83, costLimitcu83, false).times(-1))}
                        }
                    }
                }
            },
        },
        84: {
            unlocked() {return hasUpgrade('cup', 41)},
            cost(x) { 
                costTypecu84 = "large"
                costBasecu84 = new Decimal(3)
                costMultcu84 = new Decimal(1)
                costExpcu84 = new Decimal(1.3)
                costLimitcu84 = new Decimal('e1e8')
                costStackcu84 = new Decimal(x)
                return {cost: player.buyablePrice(costTypecu84, costStackcu84, costBasecu84, costExpcu84 ,costMultcu84, costLimitcu84 , false), continuum: player.buyableMaxPurchaseable(costTypecu84, getBuyableAmount('cu', 103), costBasecu84, costExpcu84, costMultcu84, costLimitcu84, false)}
            },
            effect(x){
                effBasecu84 = player.p.points.max(10).log10()
                if (inChallenge('gi', 11)) {effStackcu84 = new Decimal(1)} else {if (hasMilestone('cu', 3)) {effStackcu84 = this.cost().continuum} else {effStackcu84 = new Decimal(x)}}
                return effBasecu84.pow(effStackcu84)
            },
            purchaseLimit() {
                if (inChallenge('gi', 11)) {return Decimal.dOne} else {return Decimal.dInf}
            },
            title() { 
                return "copper mirror buyable 84" 
            },
            display() {
                return "multiply cable gain by log10(prestige points), currently "+format(effBasecu84)+" <br> Cost: "+format(this.cost().cost)+" copper coins <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('cu', 103).gte(this.cost().cost)&&(!hasMilestone('cu', 3))},
            buy() {
                if (!hasMilestone('cu', 3)) {addBuyables('cu', 103, this.cost().cost.times(-1))} // ccunge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('cu', 3)) {
                    if ((costTypecu84 == "asymptote")||getBuyableAmount('cu', 103).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypecu84, getBuyableAmount('cu', 103), costBasecu84, costExpcu84, costMultcu84, costLimitcu84).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypecu84, getBuyableAmount('cu', 103), costBasecu84, costExpcu84, costMultcu84, costLimitcu84))
                            if (getBuyableAmount('cu', 103).lte(1e100)) {addBuyables('cu', 103, player.buyablePrice(costTypecu84, player.buyableMaxPurchaseable(costTypecu84, getBuyableAmount('cu', 103), costBasecu84, costExpcu84, costMultcu84, costLimitcu84), costBasecu84, costExpcu84, costMultcu84, costLimitcu84, false).times(-1))}
                        }
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
                boosteffsoftcapstart1 = new Decimal(100)
                if (hasUpgrade('cup', 31)) {boosteffsoftcapstart1 = boosteffsoftcapstart1.times(upgradeEffect('cup', 31))}
                if (boosteff.gte(boosteffsoftcapstart1)) {boosteff = boosteff.log10().div(boosteffsoftcapstart1.log10()).pow(0.8).times(boosteffsoftcapstart1.log10()).pow10()}

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

                if (boosteff.gte(boosteffsoftcapstart)) {boosteff = boosteff.log(boosteffsoftcapstart).pow(2).times(boosteffsoftcapstart)}

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
                generateeff = generateeff.times(buyableEffect('gi', 101))
                generateeff = generateeff.times(buyableEffect('cu', 71))
                if (hasUpgrade('gi', 61)) {generateeff = generateeff.times(upgradeEffect('gi', 61))}
                return generateeff
            },
            title() { 
                return "copper plates generating wires" 
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
                generateeff = generateeff.times(buyableEffect('gi', 101))
                generateeff = generateeff.times(buyableEffect('cu', 81))
                if (hasUpgrade('gi', 61)) {generateeff = generateeff.times(upgradeEffect('gi', 61))}
                if (hasUpgrade('gi', 62)) {generateeff = generateeff.times(upgradeEffect('gi', 62))}
                return generateeff
            },
            title() { 
                return "copper wires generating coins" 
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
                generateeff = generateeff.times(buyableEffect('gi', 101))
                generateeff = generateeff.times(buyableEffect('cu', 61))
                if (hasUpgrade('gi', 61)) {generateeff = generateeff.times(upgradeEffect('gi', 61))}
                return generateeff
            },
            title() { 
                return "copper coins generating plates" 
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
        multgi = multgi.times(buyableEffect('gi', 23))
        return multgi
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expgi = new Decimal(0.8)
        if (hasUpgrade('gi', 64)) {expgi = expgi.times(upgradeEffect('gi', 64))}
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
        addBuyables('gi', 101, buyableEffect('gi', 11).times(diff))
    },
    infoboxes: {
        A: {
            title: "guitar subresources",
            body() {
                textgi = ""
                if (player.gi.total.gte(1e10)||getBuyableAmount('gi', 11).gte(1)) {
                    textgi += "You have "+format(getBuyableAmount('gi', 101))+" guitar loops, multiplying copper subresources generation by "+format(buyableEffect('gi', 101))
                }
                return textgi
            }
        },
    },
    milestones: {
        0: {
            requirementDescription: "10,000 total guitar points",
            effectDescription: "automatically gain guitar points on reset",
            done() { return player.gi.total.gte(1e4)||hasMilestone('pr', 10) },
            unlocked() {return player.gi.total.gte(1e4)||hasMilestone('pr', 10)},
        },
        2: {
            requirementDescription: "1e100 total guitar points",
            effectDescription: "automate guitar loops",
            done() { return player.gi.total.gte(1e100) },
            unlocked() {return player.gi.total.gte(1e100)},
        },
        10: {
            done() { return player.gi.total.gte(1)||hasMilestone('pr', 10) },
            effectDescription: "",
            unlocked() {return true},
        },
    },
    buyables: {
        11: {
            unlocked() {return player.gi.total.gte(1e10)||getBuyableAmount(this.layer, this.id).gte(1)},
            cost(x) { 
                costTypegi11 = "normal"
                costBasegi11 = new Decimal(1e12)
                costMultgi11 = new Decimal(1)
                costExpgi11 = new Decimal(1.2)
                costLimitgi11 = new Decimal('e40000')
                costStackgi11 = new Decimal(x)
                return {cost: player.buyablePrice(costTypegi11, costStackgi11, costBasegi11, costExpgi11 ,costMultgi11, costLimitgi11 , true), continuum: player.buyableMaxPurchaseable(costTypegi11, player.gi.points, costBasegi11, costExpgi11, costMultgi11, costLimitgi11, false)}
            },
            effect(x){
                effBasegi11 = new Decimal(1)
                effBasegi11 = effBasegi11.times(buyableEffect('gi', 21))
                if (hasMilestone('gi',2)) {effStackgi11 = this.cost().continuum} else {effStackgi11 = new Decimal(x)}
                eff = effBasegi11.times(effStackgi11)
                eff = eff.times(buyableEffect('pr', 62))
                return eff
            },
            title() { 
                return "guitar buyable 11" 
            },
            display() {
                return "generate "+format(effBasegi11)+" guitar loops per second <br> Cost: "+format(this.cost().cost)+" <br> Effect: "+format(this.effect())
            },
            canAfford() { return player.gi.points.gte(this.cost().cost)&&(!hasMilestone('gi', 2))},
            buy() {
                if (!hasMilestone('gi', 2)){player.gi.points = player.gi.points.sub(this.cost().cost)} // cginge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (hasMilestone('gi', 2)) {} else {
                    if ((costTypegi11 == "asymptote")||player.gi.points.lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypegi11, player.gi.points, costBasegi11, costExpgi11, costMultgi11, costLimitgi11).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypegi11, player.gi.points, costBasegi11, costExpgi11, costMultgi11, costLimitgi11).min(this.purchaseLimit()))
                            if (player.gi.points.lt('e100')&&!hasMilestone('cu', 0)) {player.gi.points = player.gi.points.sub(player.buyablePrice(costTypegi11, player.buyableMaxPurchaseable(costTypegi11, player.gi.points, costBasegi11, costExpgi11, costMultgi11, costLimitgi11), costBasegi11, costExpgi11, costMultgi11, costLimitgi11, true))}
                        }
                    }
                }
            },
        },
        21: {
            unlocked() {return player.gi.total.gte(1e10)||getBuyableAmount('gi', 11).gte(1)},
            cost(x) { 
                costTypegi21 = "normal"
                costBasegi21 = new Decimal(2)
                costMultgi21 = new Decimal(1)
                costExpgi21 = new Decimal(1)
                costLimitgi21 = Decimal.dInf
                costStackgi21 = new Decimal(x)
                return {cost: player.buyablePrice(costTypegi21, costStackgi21, costBasegi21, costExpgi21 ,costMultgi21, costLimitgi21 , false), continuum: player.buyableMaxPurchaseable(costTypegi21, getBuyableAmount('gi', 101), costBasegi21, costExpgi21, costMultgi21, costLimitgi21, false)}
            },
            effect(x){
                effBasegi21 = new Decimal(1.5)
                if (hasMilestone('gi', 2)) {effStackgi21 = this.cost().continuum} else {effStackgi21 = new Decimal(x)}
                return effBasegi21.pow(effStackgi21)
            },
            title() { 
                return "guitar buyable 21" 
            },
            display() {
                return "multiply guitar loop gain by "+format(effBasegi21)+" <br> Cost: "+format(this.cost().cost)+" guitar loops <br> Effect: "+format(this.effect())
            },
            purchaseLimit: new Decimal(400),
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('gi', 101).gte(this.cost().cost)&&(!hasMilestone('gi', 2))},
            buy() {
                if (!hasMilestone('gi', 2)) {addBuyables('gi', 101, this.cost().cost.times(-1))} // cginge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('gi', 2)) {
                    if ((costTypegi21 == "asymptote")||getBuyableAmount('gi', 101).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypegi21, getBuyableAmount('gi', 101), costBasegi21, costExpgi21, costMultgi21, costLimitgi21).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypegi21, getBuyableAmount('gi', 101), costBasegi21, costExpgi21, costMultgi21, costLimitgi21))
                            if (getBuyableAmount('gi', 101).lte(1e100)) {addBuyables('gi', 101, player.buyablePrice(costTypegi21, player.buyableMaxPurchaseable(costTypegi21, getBuyableAmount('gi', 101), costBasegi21, costExpgi21, costMultgi21, costLimitgi21), costBasegi21, costExpgi21, costMultgi21, costLimitgi21, false).times(-1))}
                        }
                    }
                }
            },
        },
        22: {
            unlocked() {return player.gi.total.gte(1e10)||getBuyableAmount('gi', 11).gte(1)},
            cost(x) { 
                costTypegi22 = "normal"
                costBasegi22 = new Decimal(2)
                costMultgi22 = new Decimal(1)
                costExpgi22 = new Decimal(1)
                costLimitgi22 = new Decimal('e10')
                costStackgi22 = new Decimal(x)
                return {cost: player.buyablePrice(costTypegi22, costStackgi22, costBasegi22, costExpgi22 ,costMultgi22, costLimitgi22 , false), continuum: player.buyableMaxPurchaseable(costTypegi22, getBuyableAmount('gi', 101), costBasegi22, costExpgi22, costMultgi22, costLimitgi22, false)}
            },
            effect(x){
                effBasegi22 = new Decimal(1e20)
                if (hasUpgrade('gi', 54)) {effBasegi22 = effBasegi22.pow(upgradeEffect('gi', 54))}
                if (hasUpgrade('gi', 51)) {effBasegi22 = effBasegi22.pow(upgradeEffect('gi', 51))}
                if (hasMilestone('gi', 2)) {effStackgi22 = this.cost().continuum} else {effStackgi22 = new Decimal(x)}
                return effBasegi22.pow(effStackgi22)
            },
            title() { 
                return "guitar buyable 22" 
            },
            display() {
                return "multiply copper gain by "+format(effBasegi22)+" <br> Cost: "+format(this.cost().cost)+" guitar loops <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('gi', 101).gte(this.cost().cost)&&(!hasMilestone('gi', 2))},
            buy() {
                if (!hasMilestone('gi', 2)) {addBuyables('gi', 101, this.cost().cost.times(-1))} // cginge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('gi', 2)) {
                    if ((costTypegi22 == "asymptote")||getBuyableAmount('gi', 101).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypegi22, getBuyableAmount('gi', 101), costBasegi22, costExpgi22, costMultgi22, costLimitgi22).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypegi22, getBuyableAmount('gi', 101), costBasegi22, costExpgi22, costMultgi22, costLimitgi22))
                            if (getBuyableAmount('gi', 101).lte(1e100)) {addBuyables('gi', 101, player.buyablePrice(costTypegi22, player.buyableMaxPurchaseable(costTypegi22, getBuyableAmount('gi', 101), costBasegi22, costExpgi22, costMultgi22, costLimitgi22), costBasegi22, costExpgi22, costMultgi22, costLimitgi22, false).times(-1))}
                        }
                    }
                }
            },
        },
        23: {
            unlocked() {return player.gi.total.gte(1e10)||getBuyableAmount('gi', 11).gte(1)},
            cost(x) { 
                costTypegi23 = "normal"
                costBasegi23 = new Decimal(2)
                costMultgi23 = new Decimal(1)
                costExpgi23 = new Decimal(1)
                costLimitgi23 = new Decimal('e10')
                costStackgi23 = new Decimal(x)
                return {cost: player.buyablePrice(costTypegi23, costStackgi23, costBasegi23, costExpgi23 ,costMultgi23, costLimitgi23 , false), continuum: player.buyableMaxPurchaseable(costTypegi23, getBuyableAmount('gi', 101), costBasegi23, costExpgi23, costMultgi23, costLimitgi23, false)}
            },
            effect(x){
                effBasegi23 = new Decimal(1e4)
                if (hasUpgrade('gi', 54)) {effBasegi23 = effBasegi23.pow(upgradeEffect('gi', 54))}
                if (hasUpgrade('gi', 51)) {effBasegi23 = effBasegi23.pow(upgradeEffect('gi', 51))}
                if (hasMilestone('gi', 2)) {effStackgi23 = this.cost().continuum} else {effStackgi23 = new Decimal(x)}
                return effBasegi23.pow(effStackgi23)
            },
            title() { 
                return "guitar buyable 23" 
            },
            display() {
                return "multiply guitar gain by "+format(effBasegi23)+" <br> Cost: "+format(this.cost().cost)+" guitar loops <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('gi', 101).gte(this.cost().cost)&&(!hasMilestone('gi', 2))},
            buy() {
                if (!hasMilestone('gi', 2)) {addBuyables('gi', 101, this.cost().cost.times(-1))} // cginge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('gi', 2)) {
                    if ((costTypegi23 == "asymptote")||getBuyableAmount('gi', 101).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypegi23, getBuyableAmount('gi', 101), costBasegi23, costExpgi23, costMultgi23, costLimitgi23).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypegi23, getBuyableAmount('gi', 101), costBasegi23, costExpgi23, costMultgi23, costLimitgi23))
                            if (getBuyableAmount('gi', 101).lte(1e100)) {addBuyables('gi', 101, player.buyablePrice(costTypegi23, player.buyableMaxPurchaseable(costTypegi23, getBuyableAmount('gi', 101), costBasegi23, costExpgi23, costMultgi23, costLimitgi23), costBasegi23, costExpgi23, costMultgi23, costLimitgi23, false).times(-1))}
                        }
                    }
                }
            },
        },
        24: {
            unlocked() {return player.gi.total.gte(1e10)||getBuyableAmount('gi', 11).gte(1)},
            cost(x) { 
                costTypegi24 = "normal"
                costBasegi24 = new Decimal(2)
                costMultgi24 = new Decimal(1)
                costExpgi24 = new Decimal(2)
                costLimitgi24 = new Decimal('e10')
                costStackgi24 = new Decimal(x)
                return {cost: player.buyablePrice(costTypegi24, costStackgi24, costBasegi24, costExpgi24 ,costMultgi24, costLimitgi24 , false), continuum: player.buyableMaxPurchaseable(costTypegi24, getBuyableAmount('gi', 101), costBasegi24, costExpgi24, costMultgi24, costLimitgi24, false)}
            },
            effect(x){
                effBasegi24 = new Decimal(1.1)
                if (hasUpgrade('gi', 51)) {effBasegi24 = effBasegi24.pow(upgradeEffect('gi', 51))}
                if (hasMilestone('gi', 2)) {effStackgi24 = this.cost().continuum} else {effStackgi24 = new Decimal(x)}
                return effBasegi24.pow(effStackgi24)
            },
            title() { 
                return "guitar buyable 24" 
            },
            display() {
                return "multiply harvest/silence gain exponent by "+format(effBasegi24)+" <br> Cost: "+format(this.cost().cost)+" guitar loops <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('gi', 101).gte(this.cost().cost)&&(!hasMilestone('gi', 2))},
            buy() {
                if (!hasMilestone('gi', 2)) {addBuyables('gi', 101, this.cost().cost.times(-1))} // cginge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('gi', 2)) {
                    if ((costTypegi24 == "asymptote")||getBuyableAmount('gi', 101).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypegi24, getBuyableAmount('gi', 101), costBasegi24, costExpgi24, costMultgi24, costLimitgi24).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypegi24, getBuyableAmount('gi', 101), costBasegi24, costExpgi24, costMultgi24, costLimitgi24))
                            if (getBuyableAmount('gi', 101).lte(1e100)) {addBuyables('gi', 101, player.buyablePrice(costTypegi24, player.buyableMaxPurchaseable(costTypegi24, getBuyableAmount('gi', 101), costBasegi24, costExpgi24, costMultgi24, costLimitgi24), costBasegi24, costExpgi24, costMultgi24, costLimitgi24, false).times(-1))}
                        }
                    }
                }
            },
        },
        25: {
            unlocked() {return player.gi.total.gte(1e10)||getBuyableAmount('gi', 11).gte(1)},
            cost(x) { 
                costTypegi25 = "normal"
                costBasegi25 = new Decimal(2)
                costMultgi25 = new Decimal(1)
                costExpgi25 = new Decimal(2)
                costLimitgi25 = new Decimal('e10')
                costStackgi25 = new Decimal(x)
                return {cost: player.buyablePrice(costTypegi25, costStackgi25, costBasegi25, costExpgi25 ,costMultgi25, costLimitgi25 , false), continuum: player.buyableMaxPurchaseable(costTypegi25, getBuyableAmount('gi', 101), costBasegi25, costExpgi25, costMultgi25, costLimitgi25, false)}
            },
            effect(x){
                effBasegi25 = new Decimal(4)
                if (hasUpgrade('gi', 51)) {effBasegi25 = effBasegi25.pow(upgradeEffect('gi', 51))}
                if (hasMilestone('gi', 2)) {effStackgi25 = this.cost().continuum} else {effStackgi25 = new Decimal(x)}
                return effBasegi25.pow(effStackgi25)
            },
            title() { 
                return "guitar buyable 25" 
            },
            display() {
                return "multiply point gain exponent by "+format(effBasegi25)+" <br> Cost: "+format(this.cost().cost)+" guitar loops <br> Effect: "+format(this.effect())
            },
            style() {const size1 = {width: "160px", height: "160px"}
                return size1},
            canAfford() { return getBuyableAmount('gi', 101).gte(this.cost().cost)&&(!hasMilestone('gi', 2))},
            buy() {
                if (!hasMilestone('gi', 2)) {addBuyables('gi', 101, this.cost().cost.times(-1))} // cginge to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if (!hasMilestone('gi', 2)) {
                    if ((costTypegi25 == "asymptote")||getBuyableAmount('gi', 101).lte(1e10)) {
                        while (canBuyBuyable([this.layer], [this.id])){
                            buyBuyable([this.layer], [this.id])
                        }
                    } else {
                        if (player.buyableMaxPurchaseable(costTypegi25, getBuyableAmount('gi', 101), costBasegi25, costExpgi25, costMultgi25, costLimitgi25).lte(getBuyableAmount(this.layer, this.id))) {} else {
                            setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypegi25, getBuyableAmount('gi', 101), costBasegi25, costExpgi25, costMultgi25, costLimitgi25))
                            if (getBuyableAmount('gi', 101).lte(1e100)) {addBuyables('gi', 101, player.buyablePrice(costTypegi25, player.buyableMaxPurchaseable(costTypegi25, getBuyableAmount('gi', 101), costBasegi25, costExpgi25, costMultgi25, costLimitgi25), costBasegi25, costExpgi25, costMultgi25, costLimitgi25, false).times(-1))}
                        }
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
                if (new Decimal(x).lte(1e3)) {eff = new Decimal(x).root(1.5).times(0.12).pow10()}
                else {eff = new Decimal(x).pow(4)}

                if (hasUpgrade('gi', 52)) {eff = eff.pow(upgradeEffect('gi', 52))}
                return eff
            },
            title() { 
                return "guitar loops" 
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
            description: "multiply silence/harvest gain by (log2(copper points +4)*log2(guitar points +4))",
            cost: new Decimal(50),
            effect() {
                return player.cu.points.add(4).log(2).times(player.gi.points.add(4).log(2))
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 14)}
        },
        22: {
            title: "guitar upgrade 22",
            description: "multiply copper points gain by log2(guitar points +4)^3",
            cost: new Decimal(100),
            effect() {
                return player.gi.points.add(4).log(2).pow(3)
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
            description: "copper coins passive effect softcap start xlog2(log2(guitar points +4)) later, caps at x10",
            cost: new Decimal(500),
            effect() {
                return player.gi.points.add(4).log(2).log(2).min(10)
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
            description: "add +1 to silence upgrade 14 effect",
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
            description: "raise harvest/silence gain by log2(log2(guitar points))^0.2",
            cost: new Decimal(3e4),
            effect() {
                return player.gi.points.max(4).log(2).log(2).pow(0.2)
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
        51: {
            title: "guitar upgrade 51",
            description: "raise guitar buyables 22-24 effect to 1.25",
            cost: new Decimal(1e20),
            effect() {
                return new Decimal(1.25)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return player.gi.total.gte(1e15)&&hasUpgrade('gi', 44)}
        },
        52: {
            title: "guitar upgrade 52",
            description: "raise guitar loop passive effect to ^1.1",
            cost: new Decimal(1e25),
            effect() {
                return new Decimal(1.1)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return player.gi.total.gte(1e15)&&hasUpgrade('gi', 44)}
        },
        53: {
            title: "guitar upgrade 53",
            description: "raise copper and message gain by log2(log2(guitar points +4))^0.25",
            cost: new Decimal(1e30),
            effect() {
                eff = player.gi.points.add(4).log(2).log(2).pow(0.25)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return player.gi.total.gte(1e15)&&hasUpgrade('gi', 44)}
        },
        54: {
            title: "guitar upgrade 54",
            description: "raise guitar buyable 22-23 effect by log2(guitar buyable 11 count)^0.5",
            cost: new Decimal(1e35),
            effect() {
                return effStackgi11.max(2).log(2).root(2)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return player.gi.total.gte(1e15)&&hasUpgrade('gi', 44)}
        },
        61: {
            title: "guitar upgrade 61",
            description: "multiply copper subresources gain by log2(guitar points +4)^8",
            cost: new Decimal(1e40),
            effect() {
                return player.gi.points.add(4).log(2).pow(8)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 54)}
        },
        62: {
            title: "guitar upgrade 62",
            description: "multiply copper coin generation by (copper coins)^0.1",
            cost: new Decimal(1e50),
            effect() {
                return getBuyableAmount('cu', 103).pow(0.1).max(1)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 54)}
        },
        63: {
            title: "guitar upgrade 63",
            description: "raise copper buyables softcap start to ^2",
            cost: new Decimal(1e60),
            effect() {
                return new Decimal(2)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 54)}
        },
        64: {
            title: "guitar upgrade 64",
            description: "raise guitar gain to ^log10(log10(guitar points))",
            cost: new Decimal(1e70),
            effect() {
                return player.gi.points.max(1e10).log10().log10().pow(0.5)
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('gi', 54)}
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
                    textgichall11r += " capping harvest/silence points reset gain to "+formatWhole(new Decimal(Math.log10(challengeCompletions(this.layer, this.id))).pow(2).pow10().floor())+" points "
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
            completionLimit: 1e100,
        }
    }
})

addLayer("cup", {
    name: "copper projections", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CUP", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked() {return getBuyableAmount('cu', 101).gte('1e50')||player.cup.points.gte(1)},
		points: new Decimal(0),
    }},
    color: "#9c410b",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "copper projections", // Namec of message decabled currency
    baseResource: "copper plates", // Namec of resource message decabled is based on
    baseAmount() {return getBuyableAmount('cu', 101)}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multcup = new Decimal(0.02)
        return multcup
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expcup = new Decimal(1)
        exp2cup = new Decimal(0.6)
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
        textcup += "<br> next at "+format(getNextAt('cup'))+" copper plates"
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
            description: "multiply copper point gain by log(copper plates)^2",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                eff = getBuyableAmount('cu', 101).max(10).log10().pow(2)
                if (hasUpgrade('cup', 41)) {eff = eff.pow(upgradeEffect('cup', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "copper projection upgrade 12",
            description: "multiply copper point gain by log(copper points )^25",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return player.cu.points.max(10).log10().pow(25)
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 11)}
        },
        13: {
            title: "copper projection upgrade 13",
            description: "multiply copper point gain by copper plates effect ^5",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                eff = buyableEffect('cu', 101).pow(5)
                if (hasUpgrade('cup', 41)) {eff = eff.pow(upgradeEffect('cup', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 12)}
        },
        14: {
            title: "copper projection upgrade 14",
            description: "multiply copper point gain by guitar challenge effect, softcapped at 1e50",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                challgipr = new Decimal(challengeCompletions('gi', 11)).max(1)
                if (challgipr.lte(1e50)) {eff = challgipr.log10().pow(2).pow10()} else {eff = challgipr.pow(50)}
                if (hasUpgrade('cup', 41)) {eff = eff.pow(upgradeEffect('cup', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 13)}
        },
        21: {
            title: "copper projection upgrade 21",
            description: "raise copper coin passive effect to ^1.3",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                eff = new Decimal(1.3)
                if (hasUpgrade('cup', 41)) {eff = eff.pow(upgradeEffect('cup', 41))}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 11)}
        },
        22: {
            title: "copper projection upgrade 22",
            description: "raise copper wires passive effect to ^1.4",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                eff = new Decimal(1.4)
                if (hasUpgrade('cup', 41)) {eff = eff.pow(upgradeEffect('cup', 41))}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 21)&&hasUpgrade('cup', 12)}
        },
        23: {
            title: "copper projection upgrade 23",
            description: "raise copper plates passive effect to ^1.5",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                eff = new Decimal(1.5)
                if (hasUpgrade('cup', 41)) {eff = eff.pow(upgradeEffect('cup', 41))}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 22)&&hasUpgrade('cup', 13)}
        },
        31: {
            title: "copper projection upgrade 31",
            description: "times copper plates passive effect softcap start by x4",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                eff = new Decimal(4)
                if (hasUpgrade('cup', 41)) {eff = eff.pow(upgradeEffect('cup', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 21)}
        },
        32: {
            title: "copper projection upgrade 32",
            description: "raise copper buyable softcap start to ^10",
            cost() {
                return new Decimal(1+hasUpgrade('cup', 11)+hasUpgrade('cup', 12)+hasUpgrade('cup', 13)+hasUpgrade('cup', 14)+hasUpgrade('cup', 21)+hasUpgrade('cup', 22)+hasUpgrade('cup', 23)+hasUpgrade('cup', 24)+hasUpgrade('cup', 31)+hasUpgrade('cup', 32)+hasUpgrade('cup', 33)+hasUpgrade('cup', 34)+hasUpgrade('cup', 41)+hasUpgrade('cup', 42)+hasUpgrade('cup', 43)+hasUpgrade('cup', 44))
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                eff = new Decimal(10)
                if (hasUpgrade('cup', 41)) {eff = eff.pow(upgradeEffect('cup', 41))}
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 31)&&hasUpgrade('cup', 22)}
        },
        41: {
            title: "copper projection upgrade 41",
            description: "unlock copper mirror buyables and raise above buyables to log(copper projections)/10",
            cost() {
                return new Decimal(10)
            },
            canAfford() {
                return (true)&&player.cup.points.gte(this.cost())
            },
            pay() {},
            effect() {
                return player.cup.points.max(10).log10()
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('cup', 32)}
        },
    }
})

addLayer("pr", {
    name: "proverb", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PR", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#188801",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "proverb points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multpr = new Decimal(1e-9)
        multpr = multpr.times(buyableEffect('pr', 13))
        multpr = multpr.times(buyableEffect('pr', 42))
        multpr = multpr.times(buyableEffect('pr', 43))
        multpr = multpr.times(buyableEffect('pr', 64))
        return multpr
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exppr = new Decimal(0.8)
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
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('pr'))+" proverb points. Next at "+format(getNextAt('pr'))+" points" },
    row: 5, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return player.points.gte('e1e7')||hasMilestone('pr', 10)},


    automate() {

    },
    doReset(resettingLayer){
        if (layers[resettingLayer].row > 5.5)  {
            layerDataReset(this.layer)
        }
        layerDataReset('cu')
        layerDataReset('ha')
        layerDataReset('si')
        layerDataReset('me')
        layerDataReset('ca')
        layerDataReset('p')
    },
    milestones: {
        4: {
            effectDescription: "proverb subbuyables no longer cost proverb subpoints",
            done() { return player.pr.total.gte(10000) },
            unlocked() {return true},
        },
        10: {
            effectDescription: "",
            done() { return player.pr.total.gte(1) },
            unlocked() {return true},
        },
    },
    update(diff) {
        if (getClickableState('pr', 11)==1) {addBuyables('pr', 101, buyableEffect('pr', 103).times(diff))}
        
        if (getClickableState('pr', 11)==2) {addBuyables('pr', 102, buyableEffect('pr', 104).times(diff))}


        addBuyables('pr', 105, buyableEffect('pr', 98).times(diff))
    },
    infoboxes: {
        C: {
            title: "proverb subresources",
            body() {
                textpr = "Your proverb points are giving "+format(buyableEffect('pr', 99))+" proverb/base generation "
                textpr += "<br> You have "+format(getBuyableAmount('pr', 101))+" proverb/message points ("+format(buyableEffect('pr', 103))+"/s), multiplying messages upgrade softcap start by "+format(buyableEffect('pr', 101))+", raising message points gain to "+format(buyableEffect('pr', 111))+", and dividing proverb/copper points effective count by "+format(buyableEffect('pr', 121))
                textpr += "<br> You have "+format(getBuyableAmount('pr', 102))+" proverb/copper points ("+format(buyableEffect('pr', 104))+"/s), multiplying copper subresources and copper points gain by "+format(buyableEffect('pr', 102))+", multiplying guitar points gain and copper coin effect softcap start by "+format(buyableEffect('pr', 112))+", and dividing proverb/message points effective count by "+format(buyableEffect('pr', 122))
                if (buyableEffect('pr', 98).gt(0)) {
                    textpr += "<br> You have "+format(getBuyableAmount('pr', 105))+" proverb/shiny points ("+format(buyableEffect('pr', 98))+"/s), raising point gain exponent to "+format(buyableEffect('pr', 105), 4)
                }
                textpr += "<br><br> Your proverb/message subbuyables are making proverb/copper subbuyables cost scale +"+format(buyableEffect('pr', 131))+" faster"
                textpr += "<br> Your proverb/copper subbuyables are making proverb/message subbuyables cost scale +"+format(buyableEffect('pr', 132))+" faster"


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
                return "proverb/message subbuyable 11" 
            },
            display() {
                return "multiply proverb/message point gain by "+format(effBasepr11)+" <br> Cost: "+format(this.cost())+" proverb/message points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 101, player.buyablePrice(costTypepr11, player.buyableMaxPurchaseable(costTypepr11, getBuyableAmount('pr', 101), costBasepr11, costExppr11, costMultpr11, costLimitpr11), costBasepr11, costExppr11, costMultpr11, costLimitpr11, false).times(-1))}
                    }
                }
            },
        },
        12: {
            unlocked() {return getBuyableAmount('pr', 51).gte(1)},
            cost(x) { 
                costTypepr12 = "normal"
                costBasepr12 = new Decimal(2.5)
                costMultpr12 = new Decimal(1.6)
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
                return "proverb/message subbuyable 12" 
            },
            display() {
                return "raise point gain by "+format(effBasepr12)+" <br> Cost: "+format(this.cost())+" proverb/message points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 101, player.buyablePrice(costTypepr12, player.buyableMaxPurchaseable(costTypepr12, getBuyableAmount('pr', 101), costBasepr12, costExppr12, costMultpr12, costLimitpr12), costBasepr12, costExppr12, costMultpr12, costLimitpr12, false).times(-1))}
                    }
                }
            },
        },
        13: {
            unlocked() {return getBuyableAmount('pr', 51).gte(1)},
            cost(x) { 
                costTypepr13 = "normal"
                costBasepr13 = new Decimal(2.5)
                costMultpr13 = new Decimal(1.6)
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
                return "proverb/copper subbuyable 13" 
            },
            display() {
                return "multiply proverb point gain by "+format(effBasepr13)+" <br> Cost: "+format(this.cost())+" proverb/copper points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 102, player.buyablePrice(costTypepr13, player.buyableMaxPurchaseable(costTypepr13, getBuyableAmount('pr', 102), costBasepr13, costExppr13, costMultpr13, costLimitpr13), costBasepr13, costExppr13, costMultpr13, costLimitpr13, false).times(-1))}
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
                return "proverb/copper subbuyable 14" 
            },
            display() {
                return "multiply proverb/copper point gain by "+format(effBasepr14)+" <br> Cost: "+format(this.cost())+" proverb/copper points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 102, player.buyablePrice(costTypepr14, player.buyableMaxPurchaseable(costTypepr14, getBuyableAmount('pr', 102), costBasepr14, costExppr14, costMultpr14, costLimitpr14), costBasepr14, costExppr14, costMultpr14, costLimitpr14, false).times(-1))}
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
                effBasepr21 = new Decimal(1.4)
                effBasepr21 = effBasepr21.pow(buyableEffect('pr', 53))
                effStackpr21 = new Decimal(x)
                return effBasepr21.pow(effStackpr21)
            },
            title() { 
                return "proverb/message subbuyable 21" 
            },
            display() {
                return "root prestige buyable scaling by "+format(effBasepr21)+" <br> Cost: "+format(this.cost())+" proverb/message points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 101, player.buyablePrice(costTypepr21, player.buyableMaxPurchaseable(costTypepr21, getBuyableAmount('pr', 101), costBasepr21, costExppr21, costMultpr21, costLimitpr21), costBasepr21, costExppr21, costMultpr21, costLimitpr21, false).times(-1))}
                    }
                }
            },
        },
        22: {
            unlocked() {return getBuyableAmount('pr', 51).gte(2)},
            cost(x) { 
                costTypepr22 = "large"
                costBasepr22 = new Decimal(1.4)
                costMultpr22 = new Decimal(0.9293071397599867)
                costExppr22 = new Decimal(0.8)
                costLimitpr22 = new Decimal('e10')
                costStackpr22 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr22, costStackpr22, costBasepr22, costExppr22 ,costMultpr22, costLimitpr22 , false)
            },
            effect(x){
                effBasepr22 = new Decimal(1.1)
                effBasepr22 = effBasepr22.pow(buyableEffect('pr', 53))
                effStackpr22 = new Decimal(x)
                return effBasepr22.pow(effStackpr22)
            },
            title() { 
                return "proverb/message subbuyable 22" 
            },
            display() {
                return "divide the proverb/message subbuyable scaling nerf by "+format(effBasepr22)+" <br> Cost: "+format(this.cost())+" proverb/message points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 101, player.buyablePrice(costTypepr22, player.buyableMaxPurchaseable(costTypepr22, getBuyableAmount('pr', 101), costBasepr22, costExppr22, costMultpr22, costLimitpr22), costBasepr22, costExppr22, costMultpr22, costLimitpr22, false).times(-1))}
                    }
                }
            },
        },
        23: {
            unlocked() {return getBuyableAmount('pr', 51).gte(2)},
            cost(x) { 
                costTypepr23 = "large"
                costBasepr23 = new Decimal(1.4)
                costMultpr23 = new Decimal(0.9293071397599867)
                costExppr23 = new Decimal(0.8)
                costLimitpr23 = new Decimal('e10')
                costStackpr23 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr23, costStackpr23, costBasepr23, costExppr23 ,costMultpr23, costLimitpr23 , false)
            },
            effect(x){
                effBasepr23 = new Decimal(1.1)
                effBasepr23 = effBasepr23.pow(buyableEffect('pr', 53))
                effStackpr23 = new Decimal(x)
                return effBasepr23.pow(effStackpr23)
            },
            title() { 
                return "proverb/copper subbuyable 23" 
            },
            display() {
                return "divide the proverb/copper subbuyable scaling nerf by "+format(effBasepr23)+" <br> Cost: "+format(this.cost())+" proverb/copper points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 102, player.buyablePrice(costTypepr23, player.buyableMaxPurchaseable(costTypepr23, getBuyableAmount('pr', 102), costBasepr23, costExppr23, costMultpr23, costLimitpr23), costBasepr23, costExppr23, costMultpr23, costLimitpr23, false).times(-1))}
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
                return "proverb/copper subbuyable 24" 
            },
            display() {
                return "root the copper buyable scaling by "+format(effBasepr24)+" <br> Cost: "+format(this.cost())+" proverb/copper points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 102, player.buyablePrice(costTypepr24, player.buyableMaxPurchaseable(costTypepr24, getBuyableAmount('pr', 102), costBasepr24, costExppr24, costMultpr24, costLimitpr24), costBasepr24, costExppr24, costMultpr24, costLimitpr24, false).times(-1))}
                    }
                }
            },
        },
        31: {
            unlocked() {return getBuyableAmount('pr', 51).gte(3)},
            cost(x) { 
                costTypepr31 = "normal"
                costBasepr31 = new Decimal(4)
                costMultpr31 = new Decimal(5)
                costExppr31 = new Decimal(1.32)
                costLimitpr31 = new Decimal('e10')
                costStackpr31 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr31, costStackpr31, costBasepr31, costExppr31 ,costMultpr31, costLimitpr31 , false)
            },
            effect(x){
                effBasepr31 = getBuyableAmount('pr', 105).add(10).log10().add(10).log10()
                effBasepr31 = effBasepr31.pow(buyableEffect('pr', 53))
                effStackpr31 = new Decimal(x)
                return effBasepr31.pow(effStackpr31)
            },
            title() { 
                return "proverb/message subbuyable 31" 
            },
            display() {
                return "multiply proverb/message point gain by log10(log10(proverb/shiny points+10)+1), currently "+format(effBasepr31)+" <br> Cost: "+format(this.cost())+" proverb/message points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 101, player.buyablePrice(costTypepr31, player.buyableMaxPurchaseable(costTypepr31, getBuyableAmount('pr', 101), costBasepr31, costExppr31, costMultpr31, costLimitpr31), costBasepr31, costExppr31, costMultpr31, costLimitpr31, false).times(-1))}
                    }
                }
            },
        },
        32: {
            unlocked() {return getBuyableAmount('pr', 51).gte(3)},
            cost(x) { 
                costTypepr32 = "large"
                costBasepr32 = new Decimal(1.8)
                costMultpr32 = new Decimal(1.2783499975911006)
                costExppr32 = new Decimal(0.96)
                costLimitpr32 = new Decimal('e10')
                costStackpr32 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr32, costStackpr32, costBasepr32, costExppr32 ,costMultpr32, costLimitpr32 , false)
            },
            effect(x){
                effBasepr32 = new Decimal(1.006)
                effBasepr32 = effBasepr32.pow(buyableEffect('pr', 53))
                effStackpr32 = new Decimal(x)
                return effBasepr32.pow(effStackpr32)
            },
            title() { 
                return "proverb/message subbuyable 32" 
            },
            display() {
                return "raise the prestige and cable upgrades 11-24 effect exponent by "+format(effBasepr32, 3)+" <br> Cost: "+format(this.cost())+" proverb/message points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 101, player.buyablePrice(costTypepr32, player.buyableMaxPurchaseable(costTypepr32, getBuyableAmount('pr', 101), costBasepr32, costExppr32, costMultpr32, costLimitpr32), costBasepr32, costExppr32, costMultpr32, costLimitpr32, false).times(-1))}
                    }
                }
            },
        },
        33: {
            unlocked() {return getBuyableAmount('pr', 51).gte(3)},
            cost(x) { 
                costTypepr33 = "large"
                costBasepr33 = new Decimal(1.8)
                costMultpr33 = new Decimal(1.2783499975911006)
                costExppr33 = new Decimal(0.96)
                costLimitpr33 = new Decimal('e10')
                costStackpr33 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr33, costStackpr33, costBasepr33, costExppr33 ,costMultpr33, costLimitpr33 , false)
            },
            effect(x){
                effBasepr33 = new Decimal(1.05)
                effBasepr33 = effBasepr33.pow(buyableEffect('pr', 53))
                effStackpr33 = new Decimal(x)
                return effBasepr33.pow(effStackpr33)
            },
            title() { 
                return "proverb/copper subbuyable 33" 
            },
            display() {
                return "raise silence/heavenly upgrade effects by "+format(effBasepr33)+" <br> Cost: "+format(this.cost())+" proverb/copper points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 102, player.buyablePrice(costTypepr33, player.buyableMaxPurchaseable(costTypepr33, getBuyableAmount('pr', 102), costBasepr33, costExppr33, costMultpr33, costLimitpr33), costBasepr33, costExppr33, costMultpr33, costLimitpr33, false).times(-1))}
                    }
                }
            },
        },
        34: {
            unlocked() {return getBuyableAmount('pr', 51).gte(3)},
            cost(x) { 
                costTypepr34 = "normal"
                costBasepr34 = new Decimal(4)
                costMultpr34 = new Decimal(5)
                costExppr34 = new Decimal(1.32)
                costLimitpr34 = new Decimal('e10')
                costStackpr34 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr34, costStackpr34, costBasepr34, costExppr34 ,costMultpr34, costLimitpr34 , false)
            },
            effect(x){
                effBasepr34 = getBuyableAmount('pr', 105).add(10).log10().add(10).log10()
                effBasepr34 = effBasepr34.pow(buyableEffect('pr', 53))
                effStackpr34 = new Decimal(x)
                return effBasepr34.pow(effStackpr34)
            },
            title() { 
                return "proverb/copper subbuyable 34" 
            },
            display() {
                return "multiply proverb/copper point gain by log10(log10(proverb/shiny points+10)+1), currently "+format(effBasepr34)+" <br> Cost: "+format(this.cost())+" proverb/copper points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 102, player.buyablePrice(costTypepr34, player.buyableMaxPurchaseable(costTypepr34, getBuyableAmount('pr', 102), costBasepr34, costExppr34, costMultpr34, costLimitpr34), costBasepr34, costExppr34, costMultpr34, costLimitpr34, false).times(-1))}
                    }
                }
            },
        },
        41: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr41 = "normal"
                costBasepr41 = new Decimal(10)
                costMultpr41 = new Decimal(50)
                costExppr41 = new Decimal(1.5)
                costLimitpr41 = new Decimal('e10')
                costStackpr41 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr41, costStackpr41, costBasepr41, costExppr41 ,costMultpr41, costLimitpr41 , false)
            },
            effect(x){
                effBasepr41 = player.p.points.max(1e10).log10().log10()
                effBasepr41 = effBasepr41.pow(buyableEffect('pr', 53))
                effStackpr41 = new Decimal(x)
                return effBasepr41.pow(effStackpr41)
            },
            title() { 
                return "proverb/message subbuyable 41" 
            },
            display() {
                return "multiply proverb/message and proverb/copper point gain by log10(log10(prestige points)), currently "+format(effBasepr41)+" <br> Cost: "+format(this.cost())+" proverb/message points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 101, player.buyablePrice(costTypepr41, player.buyableMaxPurchaseable(costTypepr41, getBuyableAmount('pr', 101), costBasepr41, costExppr41, costMultpr41, costLimitpr41), costBasepr41, costExppr41, costMultpr41, costLimitpr41, false).times(-1))}
                    }
                }
            },
        },
        42: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr42 = "normal"
                costBasepr42 = new Decimal(20)
                costMultpr42 = new Decimal(500)
                costExppr42 = new Decimal(1.6)
                costLimitpr42 = new Decimal('e10')
                costStackpr42 = new Decimal(x).add(buyableEffect('pr', 132))
                return player.buyablePrice(costTypepr42, costStackpr42, costBasepr42, costExppr42 ,costMultpr42, costLimitpr42 , false)
            },
            effect(x){
                effBasepr42 = player.p.points.max(1e10).log10().log10()
                effBasepr42 = effBasepr42.pow(buyableEffect('pr', 53))
                effStackpr42 = new Decimal(x)
                return effBasepr42.pow(effStackpr42)
            },
            title() { 
                return "proverb/message subbuyable 42" 
            },
            display() {
                return "multiply proverb point gain by log10(log10(prestige points)), currently "+format(effBasepr42)+" <br> Cost: "+format(this.cost())+" proverb/message points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 101, player.buyablePrice(costTypepr42, player.buyableMaxPurchaseable(costTypepr42, getBuyableAmount('pr', 101), costBasepr42, costExppr42, costMultpr42, costLimitpr42), costBasepr42, costExppr42, costMultpr42, costLimitpr42, false).times(-1))}
                    }
                }
            },
        },
        43: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr43 = "normal"
                costBasepr43 = new Decimal(20)
                costMultpr43 = new Decimal(500)
                costExppr43 = new Decimal(1.6)
                costLimitpr43 = new Decimal('e10')
                costStackpr43 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr43, costStackpr43, costBasepr43, costExppr43 ,costMultpr43, costLimitpr43 , false)
            },
            effect(x){
                effBasepr43 = player.p.points.max(1e10).log10().log10()
                effBasepr43 = effBasepr43.pow(buyableEffect('pr', 53))
                effStackpr43 = new Decimal(x)
                return effBasepr43.pow(effStackpr43)
            },
            title() { 
                return "proverb/copper subbuyable 43" 
            },
            display() {
                return "multiply proverb point gain by log10(log10(prestige points)), currently "+format(effBasepr43)+" <br> Cost: "+format(this.cost())+" proverb/copper points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 102, player.buyablePrice(costTypepr43, player.buyableMaxPurchaseable(costTypepr43, getBuyableAmount('pr', 102), costBasepr43, costExppr43, costMultpr43, costLimitpr43), costBasepr43, costExppr43, costMultpr43, costLimitpr43, false).times(-1))}
                    }
                }
            },
        },
        44: {
            unlocked() {return getBuyableAmount('pr', 51).gte(4)},
            cost(x) { 
                costTypepr44 = "normal"
                costBasepr44 = new Decimal(10)
                costMultpr44 = new Decimal(50)
                costExppr44 = new Decimal(1.5)
                costLimitpr44 = new Decimal('e10')
                costStackpr44 = new Decimal(x).add(buyableEffect('pr', 131))
                return player.buyablePrice(costTypepr44, costStackpr44, costBasepr44, costExppr44 ,costMultpr44, costLimitpr44 , false)
            },
            effect(x){
                effBasepr44 = player.p.points.max(1e10).log10().log10()
                effBasepr44 = effBasepr44.pow(buyableEffect('pr', 53))
                effStackpr44 = new Decimal(x)
                return effBasepr44.pow(effStackpr44)
            },
            title() { 
                return "proverb/copper subbuyable 44" 
            },
            display() {
                return "multiply proverb/message and proverb/copper point gain by log10(log10(prestige points)), currently "+format(effBasepr44)+" <br> Cost: "+format(this.cost())+" proverb/copper points <br> Effect: "+format(this.effect())
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
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 102, player.buyablePrice(costTypepr44, player.buyableMaxPurchaseable(costTypepr44, getBuyableAmount('pr', 102), costBasepr44, costExppr44, costMultpr44, costLimitpr44), costBasepr44, costExppr44, costMultpr44, costLimitpr44, false).times(-1))}
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
                effBasepr51 = new Decimal(2)
                effStackpr51 = new Decimal(x)
                return effBasepr51.pow(effStackpr51)
            },
            purchaseLimit: new Decimal(4),
            title() { 
                return "proverb buyable 51" 
            },
            display() {
                return "Resets this layer except later buyables back to 1 proverb point, multiply proverb/subpoint gain by "+format(effBasepr51)+", and unlocks a row of proverb upgrades (max 2) and subbuyables (max 4) <br> Cost: "+format(this.cost())+" proverb/message and proverb/copper points <br> Effect: "+format(this.effect())
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
                costLimitpr52 = new Decimal('e1000')
                costStackpr52 = new Decimal(x)
                return player.buyablePrice(costTypepr52, costStackpr52, costBasepr52, costExppr52 ,costMultpr52, costLimitpr52 , false)
            },
            effect(x){
                effBasepr52 = new Decimal(2)
                effStackpr52 = new Decimal(x)
                return effBasepr52.pow(effStackpr52)
            },
            title() { 
                return "proverb buyable 52" 
            },
            display() {
                return "Multiply proverb/subpoints gain by "+format(effBasepr52)+" <br> Cost: "+format(this.cost())+" proverb/message and proverb/copper points <br> Effect: "+format(this.effect())
            },
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())&&getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                this.buyMax()
            },
            buyMax() {
                thismaxPurchaseable = player.buyableMaxPurchaseable(costTypepr52, Decimal.min(getBuyableAmount('pr', 101), getBuyableAmount('pr', 102)), costBasepr52, costExppr52, costMultpr52, costLimitpr52)
                setBuyableAmount(this.layer, this.id, thismaxPurchaseable)
            },
        },
        53: {
            unlocked() {return true},
            cost(x) { 
                costTypepr53 = "large"
                costBasepr53 = new Decimal(2)
                costMultpr53 = new Decimal(25)
                costExppr53 = new Decimal(1)
                costLimitpr53 = new Decimal('ee10')
                costStackpr53 = new Decimal(x)
                return player.buyablePrice(costTypepr53, costStackpr53, costBasepr53, costExppr53 ,costMultpr53, costLimitpr53 , false)
            },
            effect(x){
                effBasepr53 = new Decimal(1.2)
                effStackpr53 = new Decimal(x)
                return effBasepr53.pow(effStackpr53).times(buyableEffect('pr', 54))
            },
            title() { 
                return "proverb buyable 53" 
            },
            display() {
                return "Resets this layer back to 1 proverb point, raise the proverb subpoint and proverb subbuyables effect by "+format(effBasepr53)+", and unlock a proverb subbuyable and upgrade <br> Cost: "+format(this.cost())+" proverb/message and proverb/copper points <br> Effect: "+format(this.effect())
            },
            purchaseLimit: new Decimal(4),
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
                setBuyableAmount(this.layer, this.id, thismaxPurchaseable.min(this.purchaseLimit))
            },
        },
        54: {
            unlocked() {return getBuyableAmount('pr', 53).gte(4)},
            cost(x) { 
                costTypepr54 = "large"
                costBasepr54 = new Decimal(10)
                costMultpr54 = new Decimal(100)
                costExppr54 = new Decimal(1.5)
                costLimitpr54 = new Decimal('e1e6')
                costStackpr54 = new Decimal(x)
                return player.buyablePrice(costTypepr54, costStackpr54, costBasepr54, costExppr54 ,costMultpr54, costLimitpr54 , false)
            },
            effect(x){
                effBasepr54 = new Decimal(1.25)
                effStackpr54 = new Decimal(x)
                return effBasepr54.pow(effStackpr54)
            },
            title() { 
                return "proverb buyable 54" 
            },
            display() {
                return "Raise the proverb subpoint and proverb subbuyables effect by "+format(effBasepr54)+" <br> Cost: "+format(this.cost())+" proverb/message and proverb/copper points <br> Effect: "+format(this.effect())
            },
            canAfford() { return getBuyableAmount('pr', 101).gte(this.cost())&&getBuyableAmount('pr', 102).gte(this.cost())},
            buy() {
                this.buyMax()
            },
            buyMax() {
                thismaxPurchaseable = player.buyableMaxPurchaseable(costTypepr54, Decimal.min(getBuyableAmount('pr', 101), getBuyableAmount('pr', 102)), costBasepr54, costExppr54, costMultpr54, costLimitpr54)
                setBuyableAmount(this.layer, this.id, thismaxPurchaseable)
            },
        },
        61: {
            unlocked() {return getBuyableAmount('pr', 53).gte(1)},
            cost(x) { 
                costTypepr61 = "normal"
                costBasepr61 = new Decimal(2)
                costMultpr61 = new Decimal(1)
                costExppr61 = new Decimal(1.04)
                costLimitpr61 = new Decimal('e10')
                costStackpr61 = new Decimal(x).add(buyableEffect('pr', 133))
                return player.buyablePrice(costTypepr61, costStackpr61, costBasepr61, costExppr61 ,costMultpr61, costLimitpr61 , false)
            },
            effect(x){
                effBasepr61 = new Decimal(1.5)
                effBasepr61 = effBasepr61.pow(buyableEffect('pr', 53))
                effStackpr61 = new Decimal(x)
                return effBasepr61.pow(effStackpr61)
            },
            title() { 
                return "proverb/shiny subbuyable 61" 
            },
            display() {
                return "multiply proverb/shiny, proverb/message and proverb/copper point gain by "+format(effBasepr61)+" <br> Cost: "+format(this.cost())+" proverb/shiny points <br> Effect: "+format(this.effect())
            },
            style() {return {width: "150px", height: "150px"}},
            canAfford() { return getBuyableAmount('pr', 105).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 105, getBuyableAmount('pr', 105).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr61 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr61, getBuyableAmount('pr', 105), costBasepr61, costExppr61, costMultpr61, costLimitpr61).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr61, getBuyableAmount('pr', 105), costBasepr61, costExppr61, costMultpr61, costLimitpr61))
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 105, player.buyablePrice(costTypepr61, player.buyableMaxPurchaseable(costTypepr61, getBuyableAmount('pr', 105), costBasepr61, costExppr61, costMultpr61, costLimitpr61), costBasepr61, costExppr61, costMultpr61, costLimitpr61, false).times(-1))}
                    }
                }
            },
        },
        62: {
            unlocked() {return getBuyableAmount('pr', 53).gte(2)},
            cost(x) { 
                costTypepr62 = "normal"
                costBasepr62 = new Decimal(2.5)
                costMultpr62 = new Decimal(1.6)
                costExppr62 = new Decimal(1.04)
                costLimitpr62 = new Decimal('e10')
                costStackpr62 = new Decimal(x).add(buyableEffect('pr', 133))
                return player.buyablePrice(costTypepr62, costStackpr62, costBasepr62, costExppr62 ,costMultpr62, costLimitpr62 , false)
            },
            effect(x){
                effBasepr62 = new Decimal(2)
                effBasepr62 = effBasepr62.pow(buyableEffect('pr', 53))
                effStackpr62 = new Decimal(x)
                return effBasepr62.pow(effStackpr62)
            },
            title() { 
                return "proverb/copper subbuyable 62" 
            },
            display() {
                return "multiply guitar loop gain by "+format(effBasepr62)+" <br> Cost: "+format(this.cost())+" proverb/shiny points <br> Effect: "+format(this.effect())
            },
            style() {return {width: "150px", height: "150px"}},
            canAfford() { return getBuyableAmount('pr', 105).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 105, getBuyableAmount('pr', 105).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr62 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr62, getBuyableAmount('pr', 105), costBasepr62, costExppr62, costMultpr62, costLimitpr62).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr62, getBuyableAmount('pr', 105), costBasepr62, costExppr62, costMultpr62, costLimitpr62))
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 105, player.buyablePrice(costTypepr62, player.buyableMaxPurchaseable(costTypepr62, getBuyableAmount('pr', 105), costBasepr62, costExppr62, costMultpr62, costLimitpr62), costBasepr62, costExppr62, costMultpr62, costLimitpr62, false).times(-1))}
                    }
                }
            },
        },   
        63: {
            unlocked() {return getBuyableAmount('pr', 53).gte(3)},
            cost(x) { 
                costTypepr63 = "normal"
                costBasepr63 = new Decimal(5)
                costMultpr63 = new Decimal(10)
                costExppr63 = new Decimal(1.2)
                costLimitpr63 = new Decimal('e10')
                costStackpr63 = new Decimal(x).add(buyableEffect('pr', 133))
                return player.buyablePrice(costTypepr63, costStackpr63, costBasepr63, costExppr63 ,costMultpr63, costLimitpr63 , false)
            },
            effect(x){
                effBasepr63 = new Decimal(1.03)
                effBasepr63 = effBasepr63.pow(buyableEffect('pr', 53))
                effStackpr63 = new Decimal(x)
                return effBasepr63.pow(effStackpr63)
            },
            title() { 
                return "proverb/copper subbuyable 63" 
            },
            display() {
                return "raise messages upgrades effect by "+format(effBasepr63)+" <br> Cost: "+format(this.cost())+" proverb/shiny points <br> Effect: "+format(this.effect())
            },
            style() {return {width: "150px", height: "150px"}},
            canAfford() { return getBuyableAmount('pr', 105).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 105, getBuyableAmount('pr', 105).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr63 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr63, getBuyableAmount('pr', 105), costBasepr63, costExppr63, costMultpr63, costLimitpr63).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr63, getBuyableAmount('pr', 105), costBasepr63, costExppr63, costMultpr63, costLimitpr63))
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 105, player.buyablePrice(costTypepr63, player.buyableMaxPurchaseable(costTypepr63, getBuyableAmount('pr', 105), costBasepr63, costExppr63, costMultpr63, costLimitpr63), costBasepr63, costExppr63, costMultpr63, costLimitpr63, false).times(-1))}
                    }
                }
            },
        },
        64: {
            unlocked() {return getBuyableAmount('pr', 53).gte(4)},
            cost(x) { 
                costTypepr64 = "normal"
                costBasepr64 = new Decimal(10)
                costMultpr64 = new Decimal(50)
                costExppr64 = new Decimal(1.5)
                costLimitpr64 = new Decimal('e10')
                costStackpr64 = new Decimal(x).add(buyableEffect('pr', 133))
                return player.buyablePrice(costTypepr64, costStackpr64, costBasepr64, costExppr64 ,costMultpr64, costLimitpr64 , false)
            },
            effect(x){
                effBasepr64 = player.ca.points.max('1e10').log10().log10()
                effBasepr64 = effBasepr64.pow(buyableEffect('pr', 53))
                effStackpr64 = new Decimal(x)
                return effBasepr64.pow(effStackpr64)
            },
            title() { 
                return "proverb/copper subbuyable 64" 
            },
            display() {
                return "multiply progress/message, copper, shiny, and point gain by log10(log10(cable points)) "+format(effBasepr64)+" <br> Cost: "+format(this.cost())+" proverb/shiny points <br> Effect: "+format(this.effect())
            },
            style() {return {width: "150px", height: "150px"}},
            canAfford() { return getBuyableAmount('pr', 105).gte(this.cost())},
            buy() {
                if (!false) {setBuyableAmount('pr', 105, getBuyableAmount('pr', 105).sub(this.cost()))} // change to  free req
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            buyMax() {
                if ((costTypepr64 == "asymptote")||getBuyableAmount('pr', 101).lte(1e10)) {
                    while (canBuyBuyable([this.layer], [this.id])){
                        buyBuyable([this.layer], [this.id])
                    }
                } else {
                    if (player.buyableMaxPurchaseable(costTypepr64, getBuyableAmount('pr', 105), costBasepr64, costExppr64, costMultpr64, costLimitpr64).lte(getBuyableAmount(this.layer, this.id))) {} else {
                        setBuyableAmount(this.layer, this.id, player.buyableMaxPurchaseable(costTypepr64, getBuyableAmount('pr', 105), costBasepr64, costExppr64, costMultpr64, costLimitpr64))
                        if (!hasMilestone('pr', 4)) {addBuyables('pr', 105, player.buyablePrice(costTypepr64, player.buyableMaxPurchaseable(costTypepr64, getBuyableAmount('pr', 105), costBasepr64, costExppr64, costMultpr64, costLimitpr64), costBasepr64, costExppr64, costMultpr64, costLimitpr64, false).times(-1))}
                    }
                }
            },
        },
        98: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = player.pr.points.sub(2).max(0)
                eff = eff.times(buyableEffect('pr', 61))
                eff = eff.times(buyableEffect('pr', 64))
                return eff
            },
            title() { 
                return "proverb/shiny generation" 
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
        99: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = player.pr.points
                eff = eff.times(buyableEffect('pr', 51))
                eff = eff.times(buyableEffect('pr', 52))
                return eff
            },
            title() { 
                return "proverb/base generation" 
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
                boosteff = boosteff.div(buyableEffect('pr', 122))
                boosteff = boosteff.add(10).log10().pow(5)
                if (hasUpgrade('pr', 21)) {boosteff = boosteff.pow(upgradeEffect('pr', 21))}
                if (hasUpgrade('pr', 22)) {boosteff = boosteff.pow(upgradeEffect('pr', 22))}
                boosteff = boosteff.pow(buyableEffect('pr', 53))

                return boosteff
            },
            title() { 
                return "proverb/message points" 
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
                boosteff = boosteff.div(buyableEffect('pr', 121))
                boosteff = boosteff.add(10).log10().pow(5)
                if (hasUpgrade('pr', 21)) {boosteff = boosteff.pow(upgradeEffect('pr', 21))}
                if (hasUpgrade('pr', 22)) {boosteff = boosteff.pow(upgradeEffect('pr', 22))}
                boosteff = boosteff.pow(buyableEffect('pr', 53))

                return boosteff
            },
            title() { 
                return "proverb/copper points" 
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
                eff = eff.times(buyableEffect('pr', 61))
                eff = eff.times(buyableEffect('pr', 64))
                return eff
            },
            title() { 
                return "proverb/message generation" 
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
                eff = eff.times(buyableEffect('pr', 61))
                eff = eff.times(buyableEffect('pr', 64))
                return eff
            },
            title() { 
                return "proverb/copper generation" 
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
        105: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = getBuyableAmount('pr', 105).add(19683).log(3).log(3).log(2).root(3)
                //if (eff.gte(1.1)) {eff = eff.div(1.1).pow(0.6).times(1.1)}
                return eff
            },
            title() { 
                return "proverb/shiny points" 
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
                boosteff2 = boosteff2.div(buyableEffect('pr', 122))
                boosteff2 = boosteff2.add(10).log10().pow(2)
                boosteff2 = boosteff2.times(10).log10().pow(0.8).pow10().div(10)
                if (hasUpgrade('pr', 21)) {boosteff2 = boosteff2.pow(upgradeEffect('pr', 21))}
                if (hasUpgrade('pr', 22)) {boosteff2 = boosteff2.pow(upgradeEffect('pr', 22))}
                boosteff2 = boosteff2.pow(buyableEffect('pr', 53))

                return boosteff2
            },
            title() { 
                return "proverb/message 2nd effect" 
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
                boosteff2 = boosteff2.div(buyableEffect('pr', 121))
                boosteff2 = boosteff2.add(10).log10().pow(2)
                boosteff2 = boosteff2.times(10).log10().pow(0.8).pow10().div(10)
                if (hasUpgrade('pr', 21)) {boosteff2 = boosteff2.pow(upgradeEffect('pr', 21))}
                if (hasUpgrade('pr', 22)) {boosteff2 = boosteff2.pow(upgradeEffect('pr', 22))}
                boosteff2 = boosteff2.pow(buyableEffect('pr', 53))

                return boosteff2
            },
            title() { 
                return "proverb/copper 2nd effect" 
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
                boosteffneg = getBuyableAmount('pr', 101).max(1).pow(0.5)

                challprpr = new Decimal(challengeCompletions('pr', 11))
                if (challprpr.gte(100)) {challpr11eff = challprpr.log10()} else {challpr11eff = challprpr.times(0.01).add(1)}
                

                boosteffneg = boosteffneg.root(challpr11eff)
                return boosteffneg
            },
            title() { 
                return "proverb/message adverse effect" 
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
                boosteffneg = getBuyableAmount('pr', 102).max(1).pow(0.5)

                challprpr = new Decimal(challengeCompletions('pr', 11))
                if (challprpr.gte(100)) {challpr11eff = challprpr.log10()} else {challpr11eff = challprpr.times(0.01).add(1)}

                boosteffneg = boosteffneg.root(challpr11eff)
                return boosteffneg
            },
            title() { 
                return "proverb/copper adverse effect" 
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
                for (i5 = 1; i5 < 5; i5++) {
                    eff = eff.add(getBuyableAmount('pr', 60+i5))
                }    
                eff = eff.times(0.2)
                eff = eff.div(buyableEffect('pr', 23))
                if (hasUpgrade('pr', 11)) {eff = eff.sub(upgradeEffect('pr', 11))}
                if (hasUpgrade('pr', 12)) {eff = eff.sub(upgradeEffect('pr', 12))}
                if (hasUpgrade('pr', 13)) {eff = eff.sub(upgradeEffect('pr', 13))}
                return eff.max(0)
            },
            title() { 
                return "proverb/message subbuyables adverse effect to proverb/copper" 
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
                for (i6 = 1; i6 < 5; i6++) {
                    eff = eff.add(getBuyableAmount('pr', 60+i6))
                }    
                eff = eff.times(0.2)
                eff = eff.div(buyableEffect('pr', 22))
                if (hasUpgrade('pr', 11)) {eff = eff.sub(upgradeEffect('pr', 11))}
                if (hasUpgrade('pr', 12)) {eff = eff.sub(upgradeEffect('pr', 12))}
                if (hasUpgrade('pr', 13)) {eff = eff.sub(upgradeEffect('pr', 13))}
                return eff.max(0)
            },
            title() { 
                return "proverb/copper subbuyables adverse effect to proverb/message " 
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
        133: {
            unlocked() {return false},
            cost(x) { 
                return Decimal.dInf
            },
            effect(x){
                eff = Decimal.dZero
                for (i7 = 1; i7 < 5; i7++) {
                    for (i8 = 1; i8 < 5; i8++) {
                        eff = eff.add(getBuyableAmount('pr', i7*10+i8)) 
                    }                    
                }  
                eff = eff.times(0.2)
                if (hasUpgrade('pr', 11)) {eff = eff.sub(upgradeEffect('pr', 11))}
                if (hasUpgrade('pr', 12)) {eff = eff.sub(upgradeEffect('pr', 12))}
                if (hasUpgrade('pr', 13)) {eff = eff.sub(upgradeEffect('pr', 13))}
                return eff.max(0)
            },
            title() { 
                return "proverb/copper, message subbuyables adverse effect to proverb/shiny " 
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
            display() {return "Start collecting proverb/message points "},
            canClick: true,
            onClick() {
                setClickableState(this.layer, this.id, 1)
            },
            style() {
                return {'background-color': "#5465ff"}
            }
        },
        12: {
            display() {return "Start collecting proverb/copper points "},
            canClick: true,
            onClick() {
                setClickableState(this.layer, 11, 2)
            },
            style() {
                return {'background-color': "#9c410b"}
            }
        },
        21: {
            display() {return "Reset progress subbuyables"},
            canClick: true,
            onClick() {
                for (i1 = 1; i1 < 5; i1++) {
                    for (i2 = 1; i2 < 5; i2++) {
                        setBuyableAmount('pr', i1*10+i2, Decimal.dZero)
                    }                   
                }
                for (i2 = 1; i2 < 5; i2++) {
                    setBuyableAmount('pr', 60+i2, Decimal.dZero)
                }   
            },
        }
    },
    upgrades: {
        11: {
            title: "proverb upgrade 11",
            description: "subtract log10(log10(log10(points)) levels from proverb subbuyables scaling",
            cost: new Decimal(1),
            effect() {
                eff = player.points.max('e10').log10().log10().log10()
                return eff
            },
            effectDisplay() {return "-"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(1)}
        },
        12: {
            title: "proverb upgrade 12",
            description: "subtract log10(log10(log10(prestige points)) levels from proverb subbuyables scaling",
            cost: new Decimal(2),
            effect() {
                eff = player.p.points.max('e10').log10().log10().log10()
                return eff
            },
            effectDisplay() {return "-"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(1)}
        },
        13: {
            title: "proverb upgrade 13",
            description: "subtract log10(log10(log10(cable points)) levels from proverb subbuyables scaling",
            cost: new Decimal(3),
            effect() {
                eff = player.ca.points.max('e10').log10().log10().log10()
                return eff
            },
            effectDisplay() {return "-"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(1)}
        },
        14: {
            title: "proverb upgrade 14",
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
            title: "proverb upgrade 21",
            description: "all positive proverb subpoints effects are ^1.1",
            cost: new Decimal(10),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(2)}
        },
        22: {
            title: "proverb upgrade 21",
            description: "all positive proverb subpoints effects are ^1.2",
            cost: new Decimal(20),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(2)}
        },
        23: {
            title: "proverb upgrade 23",
            description: "raise harvest/silence gain exponent by 1.05",
            cost: new Decimal(30),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(2)}
        },
        24: {
            title: "proverb upgrade 24",
            description: "raise point gain exponent by ^1.01",
            cost: new Decimal(40),
            effect() {
                eff = new Decimal(1.01)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 51).gte(2)}
        },
        31: {
            title: "proverb upgrade 31",
            description:  "raise point gain to ^(proverb points^0.25)",
            cost: new Decimal(1000),
            effect() {
                eff = player.pr.points.pow(0.25).max(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 53).gte(1)}
        },
        32: {
            title: "proverb upgrade 32",
            description: "raise prestige point gain to ^(proverb points^0.25)",
            cost: new Decimal(1e5),
            effect() {
                eff = player.pr.points.pow(0.25).max(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 53).gte(2)}
        },
        33: {
            title: "proverb upgrade 33",
            description: "raise copper and message point gain to ^(proverb points^0.1)",
            cost: new Decimal(1e7),
            effect() {
                eff = player.pr.points.pow(0.1).max(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 53).gte(3)}
        },
       34: {
            title: "proverb upgrade 34",
            description: "raise point gain exponent to ^1.01",
            cost: new Decimal(1e7),
            effect() {
                eff = new Decimal(1.01)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return getBuyableAmount('pr', 53).gte(4)}
        },
    },
    challenges: {
        11: {
            unlocked() { return hasUpgrade('pr', 24)},
            name: "proverb/message proverb/copper coexistence challenges",
            challengeDescription: "Points and resettable layer points lower than this one are nerfed 10^x -> 10^(x^0.5).",
            canComplete() {
                goalprp = new Decimal(challengeCompletions(this.layer, this.id)).floor().add(1)

                challprp = player.points.max(10).log10().times(multpr).pow(exppr)
                if (challprp.gte(10)) {challprp = challprp.log10().pow(exp2pr).pow10()}

                return challprp.floor().sub(challengeCompletions(this.layer, this.id)).floor().max(0) * 1
            },
            goalDescription() { 
                textprchall11g = "Get "+format(goalprp)+" effective proverb points on reset. "
                if (inChallenge(this.layer, this.id)) {textprchall11g += " Currently "+formatWhole(challprp.floor())+" effective proverb points "}
                return textprchall11g
            },
            rewardEffect() {
                challprpr = new Decimal(challengeCompletions(this.layer, this.id))
                if (challprpr.gte(100)) {return challprpr.log10()}
                return challprpr.times(0.01).add(1)
            },
            rewardDescription() { 
                textprchall11r = formatWhole(challengeCompletions(this.layer, this.id))+"/"+formatWhole(this.completionLimit)+" completions, "
                // if (maxedChallenge(this.layer, this.id)) {
                //     textprchall11r += " fully allowing proverb/harvest and proverb/copper points to coexist"
                // } else {
                    textprchall11r += " reducing the proverb/harvest and proverb/copper conerf by ^1/"+format(this.rewardEffect())
                // }
                return textprchall11r
            },
            onEnter() {
            },
            completionLimit: 1e20,
        }
    }
})