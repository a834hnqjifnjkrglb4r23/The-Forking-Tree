addLayer("ik", {
    name: "integral kinematics", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IK", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#fff5eb",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "integral points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        if (typeof(ikLastReset)=="undefined") ikLastReset = Decimal.dZero
        multik = new Decimal(1)

        if (hasUpgrade('ik', 31)){multik = multik.add(upgradeEffect('ik', 31))}
        if (hasUpgrade('ik', 34)){multik = multik.add(upgradeEffect('ik', 34))}

        if (hasUpgrade('p', 14)){multik = multik.add(upgradeEffect('p', 14))}
        if (hasUpgrade('p', 34)){multik = multik.add(upgradeEffect('p', 34))}
        if (hasUpgrade('p', 121)){multik = multik.add(upgradeEffect('p', 121))}

        multik = multik.times(buyableEffect('ik', 11))


        speedik = new Decimal(1)
        if (hasUpgrade('c', 21)){speedik = speedik.add(upgradeEffect('c', 21))}

        if (hasUpgrade('p', 51)){speedik = speedik.add(upgradeEffect('p', 51))}
        if (hasUpgrade('p', 74)){speedik = speedik.add(upgradeEffect('p', 74))}



        if (hasUpgrade('i', 83)){speedik = speedik.add(upgradeEffect('i', 83))}

        speedik = speedik.times(buyableEffect('ik', 13))

        if (hasUpgrade('cg', 12)){speedik = speedik.times(upgradeEffect('cg', 12))}

        if (hasUpgrade('et', 21)){speedik = speedik.times(upgradeEffect('et', 21))}

        ilnum = toNumber(player.il.points.add(0.1).trunc()) //floating point asf
        return multik
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expik = new Decimal(1)
        return expik
    },
    canReset() {return false},
    doReset(resettingLayer) {

        if (layers[resettingLayer].row > this.row) {
            ikLastReset = Decimal.dZero
            layerDataReset("ik", [])
        }
    },
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    update(diff) {
        if (!canGenPoints()) {return;} else {

            currentIKTime = player.points.sub(ikLastReset).times(speedik)
            nextTickIKTime = player.points.sub(ikLastReset).add(player.gamespeed().times(diff)).times(speedik)

            addPoints('ik', nextTickIKTime.pow(ilnum).sub(currentIKTime.pow(ilnum)).times(multik).div(factorial(ilnum)))
        }

    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textik = "the multiplier to integral kinematics point gain is "+format(multik)+"x <br>"
                textik += "the unit of integration is 1/"+format(speedik)+" seconds <br>"
                textik += "you have "+format(player.ik.total)+" total integral points <br>"
                textik += "you gain "+format(player.points.sub(ikLastReset).times(speedik).pow(ilnum - 1).times(multik).div(factorial(ilnum - 1)))+" integral points per second <br>"                
                textik += "your time integral is of layer "+format(ilnum)+"<br>"
                textik += "<br> this mechanic is stolen from Distance Incremental from jacorb90, but i promise there are original mechanics down the line (i also promise there are more stolen mechanics down the line too) <br>"
                return textik
            }
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) { 
                baseCost = new Decimal(2.5)
                if (hasUpgrade('ik', 33)) {baseCost = baseCost.div(upgradeEffect('ik', 33))}
                freeRank = Decimal.dNegOne
                rankMult = buyableEffect('ik', 12).times(4)
                if (hasUpgrade('p', 24)) {rankMult = rankMult.times(upgradeEffect('p', 24))}
                scaling = new Decimal(2.5)

                costik11 = Decimal.dTen.pow(x.minus(freeRank).div(rankMult).pow(scaling)).times(baseCost)

                ownedik11 = player.ik.points.div(baseCost).max(1).log10().root(scaling).times(rankMult).add(freeRank).add(1).max(0)
                if (hasUpgrade('q', 22)) {return player.veryLargeNumber(1)} else {return costik11}
            },
            effect(x) {
                if (hasUpgrade('et', 51)) {effbaseik11 = new Decimal(4/3)} else if (hasUpgrade('ik', 44)) {effbaseik11 = new Decimal(1.25)} else {effbaseik11 = new Decimal(1.2)}
                
                if (hasUpgrade('q', 22)) {logeffik11 = ownedik11} else {logeffik11 = new Decimal(x)}
                Decimal.pow(effbaseik11, logeffik11)
                return Decimal.pow(effbaseik11, logeffik11)
            },
            title() { return "integral kinematics buyable 11" },
            effectDisplay() { return format(buyableEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            display() { 
                bodytext = "multiply integral point gain by "+(format(effbaseik11))+"<br> req: "+format(this.cost())+"<br> owned: "
                if (hasUpgrade('q', 22)) {bodytext = bodytext+=format(ownedik11)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())
                if (hasUpgrade('q', 11)) {} else {bodytext = "resets time in this layer to "+bodytext}
            return bodytext},
            canAfford() { return (player.ik.points).gte(this.cost()) },
            buy() {
                if (hasUpgrade('q', 11)) {} else {
                    ikLastReset = player.points
                    layerDataReset('ik', [player.points, 'buyables'])
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return true},
            cost(x) { 
                baseCost = new Decimal(1.5)
                if (hasUpgrade('ik', 33)) {baseCost = baseCost.div(upgradeEffect('ik', 33))}
                rankCheapenerMult = new Decimal(1.5)
                if (hasUpgrade('p', 24)) {rankCheapenerMult = rankCheapenerMult.times(upgradeEffect('p', 24))}
                freeRankCheapener = Decimal.dNegOne
                scaling = new Decimal(4)
                costik12 = Decimal.dTen.pow(x.sub(freeRankCheapener).div(rankCheapenerMult).pow(scaling)).times(baseCost)

                ownedik12 = player.ik.points.div(baseCost).max(1).log10().root(scaling).times(rankCheapenerMult).add(freeRankCheapener).add(1).max(0)
                if (hasUpgrade('q', 22)) {return player.veryLargeNumber(2)} else {return costik12}
            },
            effect(x) {
                if (hasUpgrade('et', 51)) {rankCheapenerBase = new Decimal(1.25)} else rankCheapenerBase = new Decimal(1.2)
                if (hasUpgrade('q', 22)) {logeffik12 = ownedik12} else {logeffik12 = new Decimal(x)}
                effeik12 = Decimal.pow(rankCheapenerBase, logeffik12)
                return effeik12
            },
            title() { return "integral kinematics buyable 12" },
            effectDisplay() { return format(buyableEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            display() { 
                bodytext = "multiply your integral kinematics buyable 11 amount by "+format(rankCheapenerBase)+"<br> req: "+format(this.cost())+"<br> owned: "
                if (hasUpgrade('q', 22)) {bodytext = bodytext+=format(ownedik12)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())
                if (hasUpgrade('q', 11)) {} else {bodytext = "resets time in this layer to "+bodytext}
            return bodytext},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                if (hasUpgrade('q', 11)) {} else {
                    ikLastReset = player.points
                    layerDataReset('ik', [player.points, 'buyables'])
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return hasUpgrade('p', 44)},
            cost(x) { 
                baseCost = Decimal.dTwo
                freeTiers = Decimal.dNegOne
                tierMult = Decimal.dOne
                scaling = new Decimal(1.5)
                costik13 = baseCost.times(x.minus(freeTiers).div(tierMult).pow(scaling))

                ownedik13 = player.ik.points.div(baseCost).max(1).log10().root(scaling).times(tierMult).add(freeTiers).add(1).max(0)
                if (hasUpgrade('q', 22)) {return player.veryLargeNumber(3)} else {return costik13}
            },
            effect(x) {
                effbaseik13 = new Decimal(6/5)
                if (hasUpgrade('ik', 43)) {effbaseik13 = new Decimal(5/4)}
                if (hasUpgrade('f', 13)) {effbaseik13 = new Decimal(4/3)}
                if (hasUpgrade('et', 51)) {effbaseik13 = new Decimal(3/2)}
                
                if (hasUpgrade('q', 22)) {logeffik13 = ownedik13} else {logeffik13 = new Decimal(x)}
                return Decimal.pow(effbaseik13, logeffik13)
            },
            title() { return "integral kinematics buyable 13" },
            effectDisplay() { return format(buyableEffect(this.layer, this.id))+"x" }, // Add formatting to the effect
            display() { 
                bodytext = "resets your time in this layer and the previous two buyables to increase the layer's timespeed by x".concat(format(effbaseik13))+"<br> req: "+format(this.cost())+" integral kinematic buyable 11s <br> owned: "
                if (hasUpgrade('q', 22)) {bodytext = bodytext+=format(ownedik13)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())

            return bodytext},
            canAfford() { return (player.ik.buyables[11]).gte(this.cost()) },
            buy() {
                if (hasUpgrade('q', 13)) {} else {
                    ikLastReset = player.points
                    layerDataReset('ik', [player.points, 'buyables'])
                }
                if (hasUpgrade('q', 12)) {} else {
                    player.ik.buyables[11] = new Decimal(0)
                    player.ik.buyables[12] = new Decimal(0)
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        11: {
            title: "integral kinematics upgrade 11",
            description: "multiplies prestige point gain by (ik points +1)^0.33",
            cost: Decimal.dOne,
            effect() {
                eff = player.ik.points.add(1).root(3)
                if (hasUpgrade('p', 111)){eff = eff.pow(upgradeEffect('p', 111))}


                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "integral kinematics upgrade 12",
            description: "multiplies prestige point gain by 10^(total ik buyable 11s *0.2)",
            cost: Decimal.dTwo,
            effect() {
                if (hasUpgrade('q', 22)) {eff = ownedik11.times(0.2).pow10()} else {eff = player.ik.buyables[11].times(0.2).pow10()}
                if (hasUpgrade('ik', 41)) {eff = eff.pow(upgradeEffect('ik', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "integral kinematics upgrade 13",
            description: "multiplies prestige point gain by 10^(total ik buyable 12s *0.2)",
            cost: Decimal.dTwo,
            effect() {
                if (hasUpgrade('q', 22)) {eff = ownedik12.times(0.2).pow10()} else {eff = player.ik.buyables[12].times(0.2).pow10()}
                if (hasUpgrade('ik', 41)) {eff = eff.pow(upgradeEffect('ik', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "integral kinematics upgrade 14",
            description: "multiplies prestige point gain by 10^(total ik buyable 13s *0.4)",
            cost: new Decimal(4),
            effect() {
                if (hasUpgrade('q', 22)) {eff = ownedik13.times(0.4).pow10()} else {eff = player.ik.buyables[13].times(0.4).pow10()}
                if (hasUpgrade('ik', 41)) {eff = eff.pow(upgradeEffect('ik', 41))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "integral kinematics upgrade 21",
            description: "multiplies prestige point gain by log(total p points +1)",
            cost: new Decimal(20),
            effect() {
                eff = player.p.total.add(11).log10()
                
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "integral kinematics upgrade 22",
            description: "multiplies prestige point gain by (ik points +1)^0.33",
            cost: new Decimal(40),
            effect() {
                eff = player.ik.points.add(1).root(3)

                if (hasUpgrade('p', 111)){eff = eff.pow(upgradeEffect('p', 111))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "integral kinematics upgrade 23",
            description: "multiplies prestige point gain by 10^( il points *0.5)",
            cost: new Decimal(100),
            effect() {
                eff = player.il.points.times(0.5).pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "integral kinematics upgrade 24",
            description: "unlocks 8 integral kinematics upgrades",
            cost: new Decimal(200),
            effect() {
                eff = Decimal.dOne
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        31: {
            title: "integral kinematics upgrade 31",
            description: "add 0.1 to integral point gain multiplier",
            cost: new Decimal(500),
            effect() {
                eff = new Decimal(0.1)

                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        32: {
            title: "integral kinematics upgrade 32",
            description: "raises prestige upgrade 11 to 1.25",
            cost: new Decimal(1000),
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        33: {
            title: "integral kinematics upgrade 33",
            description: "divide costs of integral kinematics buyables 11, 12 by 2",
            cost: new Decimal(1000),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        34: {
            title: "integral kinematics upgrade 34",
            description: "add 0.1 to integral point gain multiplier",
            cost: new Decimal(20000),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        41: {
            title: "integral kinematics upgrade 41",
            description: "raise integral kinematics upgrade 12 to 14 to ^5 ",
            cost: new Decimal(5000),
            effect() {
                eff = new Decimal(5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        42: {
            title: "integral kinematics upgrade 42",
            description: "raise prestige point gain to 1.05",
            cost: new Decimal(5000),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        43: {
            title: "integral kinematics upgrade 43",
            description: "improve integral kinematics upgrade 13 effect to 1.25",
            cost: new Decimal(100000),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        44: {
            title: "integral kinematics upgrade 44",
            description: "improve integral kinematics buyable 11 effect to 1.25",
            cost: new Decimal(1e9),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
    },
})

addLayer("e", {
    name: "energy", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#668CFF",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "energy", // Name of prestige currency
    baseResource: "power", // Name of resource prestige is based on
    baseAmount() {return player.pw.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multe = new Decimal(1)
        if (hasUpgrade('c', 22)){multe = multe.times(upgradeEffect('c', 22))}
        if (hasUpgrade('p', 52)){multe = multe.add(upgradeEffect('p', 52))}
        if (hasUpgrade('p', 61)){multe = multe.add(upgradeEffect('p', 61))}

        if (hasUpgrade('i', 82)){multe = multe.add(upgradeEffect('i', 82))}


        if (hasUpgrade('cg', 13)){multe = multe.times(upgradeEffect('cg', 13))}

        if (hasUpgrade('et', 21)){multe = multe.times(upgradeEffect('et', 21))}
        return multe
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expe = new Decimal(1)
        return expe
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 44)||player.pw.total.gte(1)||player.cg.total.gte(1)},
    update(diff) {
        
        addPoints("e", player.pw.points.times(multe).times(diff).times(getPointGen()))
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                texte = "you have "+format(player.e.total)+" total energy <br>"
                texte += "you gain "+format(player.pw.points.times(multe))+" energy per second <br>"
                proportiontoVolts = player.pw.buyables[11].sub(player.pw.buyables[12]).add(10).max(0).min(20).div(20)
                Evoltage = player.pw.points.times(multe).pow(proportiontoVolts)
                Ecurrent = player.pw.points.times(multe).pow(proportiontoVolts.times(-1).add(1))
                if (hasMilestone('pw', 0)) {texte += "the voltage is "+format(Evoltage)+" and the current is "+format(Ecurrent)}
                return texte
            }
        },
    },
    upgrades: {
        11: {
            title: "energy upgrade 11",
            description: "multiplies prestige point gain by (remaining time +1)",
            cost: new Decimal(2),
            effect() {
                eff = player.totalGameTime().sub(player.points).add(1).max(1)

    

                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "energy upgrade 12",
            description: "raise prestige upgrade 11 effect to 2",
            cost: new Decimal(4),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "energy upgrade 13",
            description: "multiply prestige point gain by 10^(power *0.5)",
            cost: new Decimal(10),
            effect() {
                eff = player.pw.points.times(0.5).pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "energy upgrade 14",
            description: "multiply prestige point gain by ungained integral points +1",
            cost: new Decimal(20),
            effect() {

                eff = totalGameTime.sub(ikLastReset).times(speedik).pow(ilnum).times(multik).div(factorial(ilnum)).sub(player.ik.total).add(1).max(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "energy upgrade 21",
            description: "prestige upgrade 11 copy but all the numbers in the mantissa are 1 more and the exponent is 1 less",
            cost() {
                cost = new Decimal(40)
                return cost
            },
            effect() {
                if (upgradeEffect('p', 11).lte(10)) return Decimal.dOne
                logeff = upgradeEffect('p', 11).log10().trunc()
                if (hasUpgrade('et', 52)) {} else {logeff = logeff.min(5000)}

                eff = upgradeEffect('p', 11).div(logeff.pow10()).add(10/9).min(10).times(logeff.sub(1).pow10())


                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "energy upgrade 22",
            description: "multiplies prestige point gain by (remaining time +1)^2",
            cost() {
                cost = new Decimal(20)
                return cost
            },
            effect() {
                eff = player.totalGameTime().sub(player.points).add(1).max(1).pow(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "energy upgrade 23",
            description: "multiplies prestige point by 10^(-60cos(time*pi))",
            cost() {
                cost = new Decimal(80)
                return cost
            },
            effect() {
                eff = player.points.times(3.14159265358979323846).cos().times(-60).pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "energy upgrade 24",
            description: "multiply prestige upgrade 11 effect before any upgrades by its logarithm ^8",
            cost: new Decimal(160),
            effect() {
                eff = new Decimal(8)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    },
})

addLayer("c", {
    name: "charge", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        total: new Decimal(0),
    }},
    color: "#99a8ff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "charge", // Name of prestige currency
    baseResource: "current", // Name of resource prestige is based on
    baseAmount() {return Ecurrent}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses



        return new Decimal(1)
    },
    gainExp() { // Calculate the exponent on main currency from bonuses

        return new Decimal(1)
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasMilestone('pw', 0)},
    update(diff) {
        
        if (hasMilestone('pw', 0)) {addPoints("c", Ecurrent.times(diff).times(getPointGen()))}
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textc = "You gain "+format(Ecurrent)+" charge per second"
                return textc
            }
        },
    },

    upgrades: {
        11: {
            title: "charge upgrade 11",
            description: "raise prestige point gain by log10(integral points)*log10(current)/8+1",
            cost: new Decimal(4000),
            effect() {
                eff = player.ik.points.max(1).log10().times(Ecurrent.max(1).log10()).div(8).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "charge upgrade 12",
            description: "raise prestige point gain by log10(energy)*log10(current)/8+1",
            cost: new Decimal(1000),
            effect() {
                eff = player.e.points.max(1).log10().times(Ecurrent.max(1).log10()).div(8).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "charge upgrade 13",
            description: "raise prestige point gain by log10(fire)*log10(current)/8+1",
            cost: new Decimal(8000),
            effect() {
                eff = player.f.points.max(1).log10().times(Ecurrent.max(1).log10()).div(8).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "charge upgrade 14",
            description: "raise prestige point gain by log10(prestige point exponent)*log10(current)/8+1",
            cost: new Decimal(2000),
            effect() {
                eff = player.p.points.max(1e10).log10().log10().times(Ecurrent.max(1).log10()).div(8).add(1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "charge upgrade 21",
            description: "multiply integral point timespeed by log10(voltage)/(upgrades purchased this row)+1",
            cost: new Decimal(20),
            effect() {
                eff = Evoltage.max(1).log10().div(Math.max(hasUpgrade('c', 21)+hasUpgrade('c', 22)+hasUpgrade('c', 23)+hasUpgrade('c', 24), 1)).add(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "charge upgrade 22",
            description: "multiply energy timespeed by log10(voltage)/(upgrades purchased this row)+1",
            cost: new Decimal(20),
            effect() {
                eff = Evoltage.max(1).log10().div(Math.max(hasUpgrade('c', 21)+hasUpgrade('c', 22)+hasUpgrade('c', 23)+hasUpgrade('c', 24), 1)).add(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "charge upgrade 23",
            description: "multiply fire timespeed by log10(voltage)/(upgrades purchased this row)+1",
            cost: new Decimal(20),
            effect() {
                eff = Evoltage.max(1).log10().div(Math.max(hasUpgrade('c', 21)+hasUpgrade('c', 22)+hasUpgrade('c', 23)+hasUpgrade('c', 24), 1)).add(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        24: {
            title: "charge upgrade 24",
            description: "multiply infinity dimensions by log10(voltage)/(upgrades purchased this row)+1",
            cost: new Decimal(20),
            effect() {
                eff = Evoltage.max(1).log10().div(Math.max(hasUpgrade('c', 21)+hasUpgrade('c', 22)+hasUpgrade('c', 23)+hasUpgrade('c', 24), 1)).add(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    },
})

addLayer("f", {
    name: "fire", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 3, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
        total: new Decimal(1),
    }},
    color: "#ffec42",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "fire", // Name of prestige currency
    baseResource: "fire", // Name of resource prestige is based on
    baseAmount() {return player.f.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multf = new Decimal(0)
        if (hasUpgrade('p', 64)){multf = multf.add(upgradeEffect('p', 64))} 
        if (hasUpgrade('p', 82)){multf = multf.add(upgradeEffect('p', 82))} 
        if (hasUpgrade('i', 23)){multf = multf.add(upgradeEffect('i', 23))} 
        multf = multf.add(buyableEffect('f', 11)).add(buyableEffect('i', 11))


        multf = multf.times(buyableEffect('f', 12)).times(buyableEffect('i', 12))
        if (hasUpgrade('c', 23)){multf = multf.times(upgradeEffect('c', 23))}

        if (hasUpgrade('cg', 14)){multf = multf.times(upgradeEffect('cg', 14))}

        if (hasUpgrade('et', 21)){multf = multf.times(upgradeEffect('et', 21))}
        if (hasUpgrade('et', 34)){multf = multf.times(upgradeEffect('et', 34))}
        if (hasUpgrade('et', 64)){multf = multf.times(upgradeEffect('et', 64))}

        firstFireSoftcapStart = new Decimal('e10').times(buyableEffect('f', 13)) //** */
        if (hasUpgrade('et', 42)){firstFireSoftcapStart = firstFireSoftcapStart.times(upgradeEffect('et', 42))}
        firstFireSoftcapStrength = new Decimal(0.08) 
        if (hasUpgrade('et', 24)) {firstFireSoftcapStrength = firstFireSoftcapStrength.div(upgradeEffect('et', 24))}
        if (hasUpgrade('et', 53)) {firstFireSoftcapStrength = firstFireSoftcapStrength.div(upgradeEffect('et', 53))}
        firstFirePenalty = player.f.points.div(firstFireSoftcapStart).pow(firstFireSoftcapStrength).max(1)


        totalFirePenalty = firstFirePenalty.times(1) //times(1) replace with later softcaps

        multfAfterPenalty = multf.div(totalFirePenalty)



        return multf
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expf = new Decimal(1)
        return expf
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 64)||player.f.total.gt(1)||player.cg.total.gte(1)},
    update(diff) {
        if (canGenPoints()) {
            if (multf.eq(0)||(player.f.points.eq(0))) {return;} else {
                unsoftcappedCurrentFireTime = player.f.points.max(0.0000000000001).ln().div(multf) //unsoftcapped: dx/xdt = mx
                unsoftcappedNextTickFireTime = unsoftcappedCurrentFireTime.add(player.gamespeed().times(diff))
                unsoftcappedFire = unsoftcappedNextTickFireTime.times(multf).exp()
                if (unsoftcappedFire.lt(firstFireSoftcapStart)) {
                    addPoints('f', unsoftcappedNextTickFireTime.times(multf).exp().sub(player.f.points))                    
                }
                else {
                    currentFireTime = player.f.points.div(firstFireSoftcapStart).pow(firstFireSoftcapStrength).div(multf).div(firstFireSoftcapStrength) // softcapped: dx/dt = m * s^(p) * x^(1-p) where m = multiplier, s = start , p = strength in positive, x = fire amount, t = game time not layer time
                    nextTickFireTime = currentFireTime.add(player.gamespeed().times(diff))      
                    addPoints('f', multf.times(firstFireSoftcapStrength).times(nextTickFireTime).pow(firstFireSoftcapStrength.pow(-1)).times(firstFireSoftcapStart).sub(player.f.points))
                }
            }
        }
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textf = "you have "+format(player.f.points)+" fire <br>"
                textf += "you gain "+format(player.f.points.times(multfAfterPenalty))+" fire per second, which is "
                if (multfAfterPenalty.gte(10)) {textf += "+"+format(multfAfterPenalty.log(10))+" OoM of your fire <br>"} else {textf += format(multfAfterPenalty)+"x of your fire <br>"}
                if (player.f.points.gte(firstFireSoftcapStart)) {textf += "first fire softcap: after "+format(firstFireSoftcapStart)+" fire, slow down time for this layer by "+format(firstFirePenalty)+"x"}
                textf += "<br> you have "+format(player.f.total)+" total fire <br>"
                
                if (hasUpgrade('i', 74)) {textf += "<br> <br> this mechanic is from Replicanti Incremental from MrRedShark77"}
                return textf
            }
        },
    },
    upgrades: {
        11: {
            title: "fire upgrade 11",
            description: "multiply the effects of prestige upgrade 51 and 52 by 1.5",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "fire upgrade 12",
            description: "raise the effects of prestige upgrade 11 by 2",
            cost: new Decimal(2),
            effect() {
                eff = new Decimal(2)
                if (hasUpgrade('f', 21)) {eff = eff.times(upgradeEffect('f', 21))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "fire upgrade 13",
            description: "improve integral kinematics buyables 13 to 1.33",
            cost: new Decimal(3),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "fire upgrade 14",
            description: "multiply prestige point gain by log(p points)^14",
            cost: new Decimal(4),
            effect() {
                eff = player.p.points.max(1).log10().pow(14)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        21: {
            title: "fire upgrade 21",
            description: "multiply fire upgrade 12 by 2",
            cost: new Decimal(3e3),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        22: {
            title: "fire upgrade 22",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(1e6),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        23: {
            title: "fire upgrade 23",
            description: "multiply infinity dimensions by log(fire)^2",
            cost: new Decimal(1),
            effect() {
                eff = player.f.points.max(10).log10().pow(2)
                if (hasUpgrade('et', 11)) {eff = eff.pow(upgradeEffect('et', 11))}
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('i', 74)}
        },
        24: {
            title: "fire upgrade 24",
            description: "multiply infinity power conversion rate by 2",
            cost: new Decimal(1e15),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('i', 74)}
        },
        31: {
            title: "fire upgrade 31",
            description: "communtatively raise effects of prestige upgrade 91 and 92 with each other in base 10",
            cost: new Decimal(1e120),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('i', 74)}
        },
        32: {
            title: "fire upgrade 32",
            description: "communtatively raise effects of prestige upgrade 92 and 93 with each other in base 10",
            cost: new Decimal(1e180),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('i', 74)}
        },
        33: {
            title: "fire upgrade 33",
            description: "communtatively raise effects of prestige upgrade 93 and 94 with each other in base 10",
            cost: new Decimal(1e240),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('i', 74)}
        },
    },
    buyables: {
        11: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasef11 = Decimal.dTen

                fire11realx = new Decimal(x)
                if (hasUpgrade('et', 71)) {fire11realx = fire11realx.div(upgradeEffect('et', 71))}
                logcostf11 = fire11realx.pow(1.1)

                if (logcostf11.gte(50)) {logcostf11 = logcostf11.div(50).pow(1.2).times(50)}
                if (logcostf11.gte(308.2547155599167438)) {logcostf11 = logcostf11.div(308.2547155599167438).pow(1.5).times(308.2547155599167438)}
                logcostf11 = logcostf11.sub(buyableEffect('i', 13).log10())



                effectiveFireForBuyables = player.f.points.times(buyableEffect('i', 13)).max(1).log10()
                if (effectiveFireForBuyables.gte(50)) {effectiveFireForBuyables = effectiveFireForBuyables.div(50).root(1.2).times(50)}
                if (effectiveFireForBuyables.gte(308.2547155599167438)) {effectiveFireForBuyables = effectiveFireForBuyables.div(308.2547155599167438).root(1.5).times(308.2547155599167438)} //308.2 = 1024*log2/log10

                ownedf11 = effectiveFireForBuyables.root(1.1).add(1).max(0)
                if (hasUpgrade('et', 71)) {ownedf11 = ownedf11.times(upgradeEffect('et', 71))}

                if (hasUpgrade('q', 23)) {return player.veryLargeNumber(8)} else {return Decimal.pow(costbasef11, logcostf11)}
            },
            effect(x) {
                effbasef11 = new Decimal(0.05)
                if (hasUpgrade('et', 61)) {effbasef11 = effbasef11.add(upgradeEffect('et', 61))}

                if (hasUpgrade('q', 23)) {divefff11 = ownedf11} else {divefff11 = new Decimal(x)}

                return Decimal.times(effbasef11, divefff11)
            },
            title() { return "fire buyable 11"},
            display() { 
                bodytext = "increase fire gain by "+format(effbasef11)+" <br> cost: "+format(this.cost())+" <br> owned: "
                if (hasUpgrade('q', 23)) {bodytext = bodytext+=format(ownedf11)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())
            return bodytext},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasef12 = Decimal.dTen

                fire12realx = new Decimal(x)
                if (hasUpgrade('et', 72)) {fire12realx = fire12realx.div(upgradeEffect('et', 72))}
                logcostf12 = fire12realx.add(1).times(2).pow(1.2)

                if (logcostf12.gte(50)) {logcostf12 = logcostf12.div(50).pow(1.2).times(50)}
                if (logcostf12.gte(308.2547155599167438)) {logcostf12 = logcostf12.div(308.2547155599167438).pow(1.5).times(308.2547155599167438)}
                logcostf12 = logcostf12.sub(buyableEffect('i', 13).log10())




                ownedf12 = effectiveFireForBuyables.root(1.2).div(2).sub(1).add(1).max(0)
                if (hasUpgrade('et', 72)) {ownedf11 = ownedf11.times(upgradeEffect('et', 72))}
                
                if (hasUpgrade('q', 23)) {return player.veryLargeNumber(9)} else {return Decimal.pow(costbasef12, logcostf12)}

            },
            effect(x) {
                effbasef12 = new Decimal(1.05)
                if (hasUpgrade('et', 61)) {effbasef12 = effbasef12.add(upgradeEffect('et', 61))}

                if (hasUpgrade('q', 23)) {logefff12 = ownedf12} else {logefff12 = new Decimal(x)}
                

                return Decimal.pow(effbasef12, logefff12)
            },
            title() { return "fire buyable 12"},
            display() { 
                bodytext = "multiply fire gain by "+format(effbasef12)+" <br> cost: "+format(this.cost())+" <br> owned: "
                if (hasUpgrade('q', 23)) {bodytext = bodytext+=format(ownedf12)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())
            return bodytext},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasef13 = Decimal.dTen

                fire13realx = new Decimal(x)
                if (hasUpgrade('et', 73)) {fire13realx = fire13realx.div(upgradeEffect('et', 73))}
                logcostf13 = fire13realx.add(5).pow(1.3)

                if (hasUpgrade('et', 73)) {logcostf11 = logcostf11.div(upgradeEffect('et', 73))}
                if (logcostf13.gte(50)) {logcostf13 = logcostf13.div(50).pow(1.2).times(50)}
                if (logcostf13.gte(308.2547155599167438)) {logcostf13 = logcostf13.div(308.2547155599167438).pow(1.5).times(308.2547155599167438)}
                logcostf13 = logcostf13.sub(buyableEffect('i', 13).log10())



                ownedf13 = effectiveFireForBuyables.root(1.3).sub(5).add(1).max(0)
                if (hasUpgrade('et', 73)) {ownedf11 = ownedf11.times(upgradeEffect('et', 73))}

                if (hasUpgrade('q', 23)) {return player.veryLargeNumber(10)} else {return Decimal.pow(costbasef13, logcostf13)}
                
            },
            effect(x) {
                effbasef13 = new Decimal(10)
                if (hasUpgrade('et', 62)) {effbasef13 = effbasef13.pow(upgradeEffect('et', 62))}

                if (hasUpgrade('q', 23)) {logefff13 = ownedf13} else {logefff13 = new Decimal(x)}

                return Decimal.pow(effbasef13, logefff13)
            },
            title() { return "fire buyable 13"},
            display() { 
                bodytext = "multiply the first fire softcap start by "+format(effbasef13)+" <br> cost: "+format(this.cost())+" <br> owned: "
                if (hasUpgrade('q', 23)) {bodytext = bodytext+=format(ownedf13)} else {bodytext = bodytext+=format(getBuyableAmount(this.layer, this.id))}
                bodytext += "<br> effect: "+format(this.effect())
            return bodytext},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
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
    color: "#4BDC13",
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "prestige points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multp = new Decimal(1)
        if (hasUpgrade('ik', 11)){multp = multp.times(upgradeEffect('ik', 11))}
        if (hasUpgrade('ik', 12)){multp = multp.times(upgradeEffect('ik', 12))}
        if (hasUpgrade('ik', 13)){multp = multp.times(upgradeEffect('ik', 13))}
        if (hasUpgrade('ik', 14)){multp = multp.times(upgradeEffect('ik', 14))}
        if (hasUpgrade('ik', 21)){multp = multp.times(upgradeEffect('ik', 21))}
        if (hasUpgrade('ik', 22)){multp = multp.times(upgradeEffect('ik', 22))}
        if (hasUpgrade('ik', 23)){multp = multp.times(upgradeEffect('ik', 23))}

        if (hasUpgrade('e', 11)){multp = multp.times(upgradeEffect('e', 11))}
        if (hasUpgrade('e', 12)){multp = multp.times(upgradeEffect('e', 12))}
        if (hasUpgrade('e', 13)){multp = multp.times(upgradeEffect('e', 13))}
        if (hasUpgrade('e', 14)){multp = multp.times(upgradeEffect('e', 14))}
        if (hasUpgrade('e', 21)){multp = multp.times(upgradeEffect('e', 21))}


        if (hasUpgrade('e', 23)){multp = multp.times(upgradeEffect('e', 23))}



        if (hasUpgrade('f', 14)){multp = multp.times(upgradeEffect('f', 14))}

        if (hasUpgrade('p', 11)){multp = multp.times(upgradeEffect('p', 11))}
        if (hasUpgrade('p', 12)){multp = multp.times(upgradeEffect('p', 12))}

        if (hasUpgrade('p', 21)){multp = multp.times(upgradeEffect('p', 21))}

        if (hasUpgrade('p', 54)){multp = multp.times(upgradeEffect('p', 54))}
        if (hasUpgrade('p', 62)){multp = multp.times(upgradeEffect('p', 62))}
        if (hasUpgrade('p', 91)){multp = multp.times(upgradeEffect('p', 91))}
        if (hasUpgrade('p', 92)){multp = multp.times(upgradeEffect('p', 92))}
        if (hasUpgrade('p', 93)){multp = multp.times(upgradeEffect('p', 93))}
        if (hasUpgrade('p', 94)){multp = multp.times(upgradeEffect('p', 94))}
        if (hasUpgrade('p', 113)){multp = multp.times(upgradeEffect('p', 113))}
        if (hasUpgrade('p', 132)){multp = multp.times(upgradeEffect('p', 132))}


        multp = multp.times(buyableEffect('p', 11))

        if (hasUpgrade('i', 11)){multp = multp.times(upgradeEffect('i', 11))}
        if (hasUpgrade('i', 12)){multp = multp.times(upgradeEffect('i', 12))}
        if (hasUpgrade('i', 21)){multp = multp.times(upgradeEffect('i', 21))}
        if (hasUpgrade('i', 24)){multp = multp.times(upgradeEffect('i', 24))}
        if (hasUpgrade('i', 31)){multp = multp.times(upgradeEffect('i', 31))}
        if (hasUpgrade('i', 32)){multp = multp.times(upgradeEffect('i', 32))}
        if (hasUpgrade('i', 61)){multp = multp.times(upgradeEffect('i', 61))}

        if (hasUpgrade('i', 71)){multp = multp.times(upgradeEffect('i', 71))}
        if (hasUpgrade('i', 81)){multp = multp.times(upgradeEffect('i', 81))}    


        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(1)
        if (hasUpgrade('ik', 42)){expp = expp.times(upgradeEffect('ik', 42))}


        if (hasUpgrade('c', 11)){expp = expp.times(upgradeEffect('c', 11))}
        if (hasUpgrade('c', 12)){expp = expp.times(upgradeEffect('c', 12))}
        if (hasUpgrade('c', 13)){expp = expp.times(upgradeEffect('c', 13))}
        if (hasUpgrade('c', 14)){expp = expp.times(upgradeEffect('c', 14))}

        if (hasUpgrade('f', 22)){expp = expp.times(upgradeEffect('f', 22))}

        if (hasUpgrade('p', 71)){expp = expp.times(upgradeEffect('p', 71))}
        if (hasUpgrade('p', 72)){expp = expp.times(upgradeEffect('p', 72))}

        if (hasUpgrade('p', 101)){expp = expp.times(upgradeEffect('p', 101))}
        if (hasUpgrade('p', 102)){expp = expp.times(upgradeEffect('p', 102))}
        if (hasUpgrade('p', 103)){expp = expp.times(upgradeEffect('p', 103))}
        if (hasUpgrade('p', 112)){expp = expp.times(upgradeEffect('p', 112))}
        if (hasUpgrade('p', 114)){expp = expp.times(upgradeEffect('p', 114))}
        if (hasUpgrade('p', 134)){expp = expp.times(upgradeEffect('p', 134))}

        if (hasUpgrade('i', 14)){expp = expp.times(upgradeEffect('i', 14))}
        if (hasUpgrade('i', 34)){expp = expp.times(upgradeEffect('i', 34))}
        if (hasUpgrade('i', 43)){expp = expp.times(upgradeEffect('i', 43))}
        if (hasUpgrade('i', 52)){expp = expp.times(upgradeEffect('i', 52))}
        if (hasUpgrade('i', 54)){expp = expp.times(upgradeEffect('i', 54))}
        if (hasUpgrade('i', 63)){expp = expp.times(upgradeEffect('i', 63))}
        if (hasUpgrade('i', 72)){expp = expp.times(upgradeEffect('i', 72))}
        if (hasUpgrade('i', 73)){expp = expp.times(upgradeEffect('i', 73))}


        if (hasUpgrade('cg', 11)){expp = expp.times(upgradeEffect('cg', 11))}
        if (hasUpgrade('et', 31)){expp = expp.times(upgradeEffect('et', 31))}

        exp2p = new Decimal(1)
        if (hasUpgrade('cg', 41)){exp2p = exp2p.times(upgradeEffect('cg', 41))}
        return expp
        
    },
    getResetGain() {
        pp = player.points.log10().times(multp).pow(expp)
        if (pp.gte(10)) {pp = pp.log10().pow(exp2p).pow10()}

        return pp.floor().sub(player.p.total).max(0)
    },
    getNextAt() {
        nextp = player.p.total.add(getResetGain('p')).add(1)
        if (nextp.gte(10)) {nextp = nextp.log10().root(exp2p).pow10()}
        return nextp.root(expp).div(multp).pow10()
    },
    canReset() {return getResetGain('p').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" seconds" },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    doReset(resettingLayer) {
        let keep = [];
        
        keep.push("upgrades")
        keep.push("points")
        keep.push("best")
        keep.push("total")
        keep.push("buyables")
        
        maxkeeprow = 1
        if (hasUpgrade('q', 14)) {maxkeeprow = maxkeeprow + 1}
        if (hasUpgrade('q', 24)) {maxkeeprow = maxkeeprow + 1}

        if (layers[resettingLayer].row <= maxkeeprow) {layerDataReset("p", keep)} else if (layers[resettingLayer].row > this.row) {
            ikLastReset = new Decimal(0)
            layerDataReset("p", [])
        }

    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = ""
                
                text += "points will be sometimes referred to by their layer symbol; upgrades will be always referred to by their upgrade layer, row and column <br> log stands for log10, ln stands for loge, any other log base will be explicitly written out <br>"
                text += "you have "+formatWhole(player.p.total)+" total prestige points <br>"
                if (multp.gt(1)){text += "your prestige point gain multiplier is "+format(multp)+"<br>"}
                if (expp.gt(1)){text += "your prestige point gain exponent is "+format(expp)+"<br>"}
                if (exp2p.gt(1)){text += "your prestige point gain second exponent is "+format(exp2p)+"<br>"}
                if (hasUpgrade('p', 103)){text += "Cat Ascii Art was made by Blazej Kozlowski "}
                return text
            }
        },
    },
    milestones:{

    },
    buyables: {
        11: {
            cost(x) {
                costbasep11 = Decimal.dTen

                logcostp11 = new Decimal(x).add(1)
                if (hasUpgrade('cg', 21)) {logcostp11 = logcostp11.div(upgradeEffect('cg', 21))}

                if (logcostp11.gte(10)) logcostp11 = logcostp11.div(10).pow(4/3).times(10) //atp, price = x^(4/3)*11^(-1/3), at 10
                if (logcostp11.gte(25.19842099789746)) logcostp11 = logcostp11.div(25.19842099789746).pow(3/2).times(25.19842099789746) // 25.2 = 20^(4/3)*10^(-1/3), atp, price = x^2*20^(-2/3)*10^(-1/3), at 20
                if (logcostp11.gte(56.69644724526929)) logcostp11 = logcostp11.div(56.69644724526929).pow(2).times(56.69644724526929) // 56.69 = 30^2*20^(-2/3)*10^(-1/3), atp, price = x^4*30^(-2)*20^(-2/3)*10^(-1/3), at 30
                if (logcostp11.gte(2.867020344649667e7)) logcostp11 = logcostp11.div(2.867020344649667e7).pow(3/2).times(2.867020344649667e7) // 2e7 = 800^4*30^(-2)*20^(-2/3)*10^(-1/3), atp, price = x^6*800^(-6)*30^(-2)*20^(-2/3)*10^(-1/3), at 800
                

                logcostp11 = logcostp11.div(buyableEffect('cg', 11))



                ownedp11 = player.p.points.max(1).log(costbasep11)

                ownedp11 = ownedp11.times(buyableEffect('cg', 11))

                if (ownedp11.gte(2.867020344649667e7)) ownedp11 = ownedp11.div(2.867020344649667e7).root(3/2).times(2.867020344649667e7)               
                if (ownedp11.gte(56.69644724526929)) ownedp11 = ownedp11.div(56.69644724526929).root(2).times(56.69644724526929)
                if (ownedp11.gte(25.19842099789746)) ownedp11 = ownedp11.div(25.19842099789746).root(3/2).times(25.19842099789746)
                if (ownedp11.gte(10)) ownedp11 = ownedp11.div(10).root(4/3).times(10)
                ownedp11 = ownedp11.add(1).max(0)

                if (hasUpgrade('cg', 21)) {ownedp11 = ownedp11.times(upgradeEffect('cg', 21))}

                freep11 = new Decimal(0)
                if (hasUpgrade('cg', 44)) {if (hasUpgrade('q', 22)) {freep11 = ownedik11.add(ownedik12).add(ownedik13)} else {freep11 = getBuyableAmount('ik', 11).add(getBuyableAmount('ik', 12).add(getBuyableAmount('ik', 13)))}}
                    
                


                ownedp11 = ownedp11.max(0)
                totalownedp11 = ownedp11.add(freep11)

                if (hasUpgrade('q', 21)) {return Decimal.dInf} else {return Decimal.pow(costbasep11, logcostp11).trunc()}
            },
            effect(x) {
                effbasep11 = new Decimal(1.2)
                if (hasUpgrade('p', 22)){effbasep11 = effbasep11.add(upgradeEffect('p', 22))}
                if (hasUpgrade('p', 81)){effbasep11 = effbasep11.add(upgradeEffect('p', 81))} //

                if (hasUpgrade('p', 122)){effbasep11 = effbasep11.add(upgradeEffect('p', 122))}

                if (hasUpgrade('et', 54)) {effbasep11 = effbasep11.add(upgradeEffect('et', 54))}

                if (hasUpgrade('cg', 22)) {effbasep11 = effbasep11.times(upgradeEffect('cg', 22))}



                

                logeffp11 = new Decimal(x)

                if (hasUpgrade('q', 21)) {return Decimal.pow(effbasep11, totalownedp11)} else {return Decimal.pow(effbasep11, logeffp11)}
            },
            title() { if (hasUpgrade('p', 123)||player.cg.total.gte(1)) {return ""} else {return "prestige buyable 11"}},
            display() { 
                cat = "\xa0\xa0\xa0\xa0\xa0\xa0_\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\\\`*-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\)\xa0\xa0_`-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0.\xa0\xa0:\xa0`.\xa0.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0:\xa0_\xa0\xa0\xa0\'\xa0\xa0\\\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0;\xa0*`\xa0_.\xa0\xa0\xa0`*-._\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0`-.-\'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0`-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0;\xa0\xa0\xa0\xa0\xa0\xa0\xa0`\xa0\xa0\xa0\xa0\xa0\xa0\xa0`.\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:.\xa0\xa0\xa0\xa0\xa0\xa0\xa0.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\\\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0.\xa0\\\xa0\xa0.\xa0\xa0\xa0:\xa0\xa0\xa0.-\'\xa0\xa0\xa0.\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\'\xa0\xa0`+.;\xa0\xa0;\xa0\xa0\'\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\'\xa0\xa0|\xa0\xa0\xa0\xa0;\xa0\xa0\xa0\xa0\xa0\xa0\xa0;-.\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0;\xa0\'\xa0\xa0\xa0:\xa0:`-:\xa0\xa0\xa0\xa0\xa0_.`*\xa0;<br>\
                \xa0\xa0\xa0\xa0\xa0.*\'\xa0/\xa0\xa0.*\'\xa0;\xa0.*`-\xa0+\'\xa0\xa0`*\'\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0`*-*\xa0\xa0\xa0`*-*\xa0\xa0`*-*\'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\xa0"
                upgradedcat = "\xa0\xa0\xa0\xa0\xa0\xa0_\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\\\`*-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\)\xa0\xa0_`-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0.\xa0\xa0:\xa0`.\xa0.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0:\xa0_\xa0\xa0\xa0\'\xa0\xa0\\\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0meow~;\xa0*`\xa0_.\xa0\xa0\xa0`*-._\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0`-.-\'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0`-.\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0;\xa0\xa0\xa0\xa0\xa0\xa0\xa0`\xa0\xa0\xa0\xa0\xa0\xa0\xa0`.\xa0\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:.\xa0\xa0\xa0\xa0\xa0\xa0\xa0.\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\\\xa0\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0.\xa0\\\xa0\xa0.\xa0\xa0\xa0:\xa0\xa0\xa0.-\'\xa0\xa0\xa0.\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\'\xa0\xa0`+.;\xa0\xa0;\xa0\xa0\'\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0:\xa0\xa0\'\xa0\xa0|\xa0\xa0\xa0\xa0;\xa0\xa0\xa0\xa0\xa0\xa0\xa0;-.\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0;\xa0\'\xa0\xa0\xa0:\xa0:`-:\xa0\xa0\xa0\xa0\xa0_.`*\xa0;<br>\
                \xa0\xa0\xa0\xa0\xa0.*\'\xa0/\xa0\xa0.*\'\xa0;\xa0.*`-\xa0+\'\xa0\xa0`*\'\xa0<br>\
                \xa0\xa0\xa0\xa0\xa0`*-*\xa0\xa0\xa0`*-*\xa0\xa0`*-*\'\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0<br>\xa0"
                nocat = "multiplies your prestige point gain by "
                if (hasUpgrade('q', 21)) {
                    text1 = "x"+format(effbasep11)+" <br> owned: "+format(ownedp11)
                    text2 = " <br> effect: "+format(this.effect())
                    textfree = "+"+format(freep11)+"="+format(totalownedp11)
                    if (freep11.gt(0)) {text = text1+textfree+text2} else {text = text1+text2}
                } else {text = "x"+format(effbasep11)+"<br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect())}
                if (hasUpgrade('p', 123)&&player.cg.total.gte(2)) {return upgradedcat+text} else if (hasUpgrade('p', 123)||player.cg.total.gte(1)) {return cat+text} else {return nocat+text}},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        11: {
            title: "prestige upgrade 11",
            description() { 
                text = "multiplies prestige point gain by log(total p points+11)^2"
                if (player.p.total.gte(171.21)) text += "<br> (softcapped)" //43 = sol to log10(x+1)^2 = 3
                return text},
            cost: new Decimal(1),
            effect() {
                eff = player.p.total.add(11).log10().pow(2)  

                if (eff.gte(5)) eff = eff.div(5).root(2).times(5)
                if (eff.gte(1000)) eff = eff.div(1000).root(2).times(1000)

                eff = eff.min('e100')

                if (hasUpgrade('e', 24)){eff = eff.times(eff.log10().max(1).pow(upgradeEffect('e', 24)))}

                if (hasUpgrade('ik', 32)){eff = eff.pow(upgradeEffect('ik', 32))}    

                if (hasUpgrade('e', 12)){eff = eff.pow(upgradeEffect('e', 12))}    

                if (hasUpgrade('f', 12)){eff = eff.pow(upgradeEffect('f', 12))}    


                if (hasUpgrade('p', 31)){eff = eff.pow(upgradeEffect('p', 31))}    
                if (hasUpgrade('p', 32)){eff = eff.pow(upgradeEffect('p', 32))}    
                if (hasUpgrade('p', 41)){eff = eff.pow(upgradeEffect('p', 41))}    
                if (hasUpgrade('p', 42)){eff = eff.pow(upgradeEffect('p', 42))}  
                if (hasUpgrade('i', 22)){eff = eff.pow(upgradeEffect('i', 22))}   
                if (hasUpgrade('i', 33)){eff = eff.pow(upgradeEffect('i', 33))}   
                if (hasUpgrade('i', 53)){eff = eff.pow(upgradeEffect('i', 53))}  
                if (hasUpgrade('i', 62)){eff = eff.pow(upgradeEffect('i', 62))}  
                if (hasUpgrade('i', 91)){eff = eff.pow(upgradeEffect('i', 91))}  

                if (hasUpgrade('et', 12)){eff = eff.pow(upgradeEffect('et', 12))}  
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        12: {
            title: "prestige upgrade 12",
            description() { 
                text = "multiplies prestige point gain by log(total p points+12)^2"
                if (player.p.total.gte(7452.2)) text += "<br> (softcapped)" //7e3 = sol to log(x+12)^2 = 15
                return text},
            cost: new Decimal(2),
            effect() {
                eff = player.p.total.add(12).log10().pow(2)
                if (eff.gte(15)) {eff = eff.div(15).root(2).times(15)} 
                eff = eff.min('e100')


                if (hasUpgrade('i', 42)){eff = eff.pow(upgradeEffect('i', 42))}  
                if (hasUpgrade('i', 91)){eff = eff.pow(upgradeEffect('i', 91))}  

                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        13: {
            title: "prestige upgrade 13",
            description: "adds total time by 2",
            cost: new Decimal(4),
            effect() {
                eff = Decimal.dTwo
                if (hasUpgrade('i', 91)){eff = eff.times(upgradeEffect('i', 91))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        14: {
            title: "prestige upgrade 14",
            description: "add +0.1 to the integral point gain multiplier",
            cost: new Decimal(20),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 91)){eff = eff.times(upgradeEffect('i', 91))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        21: {
            title: "prestige upgrade 21",
            description: "multiplies prestige point gain by (total ik points +1)^0.33",
            cost: new Decimal(400),
            effect() {
                eff = player.ik.total.add(1).root(3)

                if (hasUpgrade('p', 111)){eff = eff.pow(upgradeEffect('p', 111))}
                if (hasUpgrade('i', 92)){eff = eff.pow(upgradeEffect('i', 92))}  

                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        22: {
            title: "prestige upgrade 22",
            description: "adds prestige buyable 11 effect base by 0.1",
            cost: new Decimal(4000),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 92)){eff = eff.times(upgradeEffect('i', 92))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        23: {
            title: "prestige upgrade 23",
            description: "adds total time by 2",
            cost: new Decimal(20000),
            effect() {
                eff = Decimal.dTwo
                if (hasUpgrade('i', 92)){eff = eff.times(upgradeEffect('i', 92))}  
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        24: {
            title: "prestige upgrade 24",
            description: "amount of integral kinematics buyables 11 and 12 and x1.2, and unlock electricity",
            cost: new Decimal('1e5'),
            effect() {
                eff = new Decimal(1.2)
                if (hasUpgrade('i', 92)){eff = eff.pow(upgradeEffect('i', 92))}  
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        31: {
            title: "prestige upgrade 31",
            description: "raises prestige upgrade 11 effect by 1.5, after softcaps",
            cost: new Decimal('5e6'),
            effect() {
                eff = new Decimal(1.5)
                if (hasUpgrade('i', 93)){eff = eff.pow(upgradeEffect('i', 93))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        32: {
            title: "prestige upgrade 32",
            description: "raises prestige upgrade 11 effect by 1.33, after softcaps",
            cost: new Decimal('5e7'),
            effect() {
                eff = new Decimal(4/3)
                if (hasUpgrade('i', 93)){eff = eff.pow(upgradeEffect('i', 93))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        33: {
            title: "prestige upgrade 33",
            description: "adds total time by 4",
            cost: new Decimal('5e8'),
            effect() {
                eff = new Decimal(4)
                if (hasUpgrade('i', 93)){eff = eff.times(upgradeEffect('i', 93))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        34: {
            title: "prestige upgrade 34",
            description: "add +0.1 to the integral point gain multiplier",
            cost: new Decimal('5e9'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 93)){eff = eff.times(upgradeEffect('i', 93))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        41: {
            title: "prestige upgrade 41",
            description: "raises prestige upgrade 11 effect by 1.25, after softcaps",
            cost: new Decimal('5e10'),
            effect() {
                eff = new Decimal(1.25)
                if (hasUpgrade('i', 94)){eff = eff.pow(upgradeEffect('i', 94))}  
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        42: {
            title: "prestige upgrade 42",
            description: "raises prestige upgrade 11 effect by 1.2, after softcaps",
            cost: new Decimal('5e11'),
            effect() {
                eff = new Decimal(1.2)
                if (hasUpgrade('i', 94)){eff = eff.pow(upgradeEffect('i', 94))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        43: {
            title: "prestige upgrade 43",
            description: "adds total time by 4",
            cost: new Decimal('1e13'),
            effect() {
                eff = new Decimal(4)
                if (hasUpgrade('i', 94)){eff = eff.times(upgradeEffect('i', 94))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        44: {
            title: "prestige upgrade 44",
            description: "unlock integral kinematics buyable 13",
            cost: new Decimal('1e15'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        51: {
            title: "prestige upgrade 51",
            description: "adds integral point timespeed by 0.2",
            cost: new Decimal('e20'),
            effect() {
                eff = new Decimal(0.2)
                if (hasUpgrade('f', 11)) {eff = eff.times(upgradeEffect('f', 11))}
                if (hasUpgrade('i', 101)){eff = eff.times(upgradeEffect('i', 101))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        52: {
            title: "prestige upgrade 52",
            description: "adds the energy timespeed by 0.2",
            cost: new Decimal('e25'),
            effect() {
                eff = new Decimal(0.2)
                if (hasUpgrade('f', 11)) {eff = eff.times(upgradeEffect('f', 11))}
                if (hasUpgrade('i', 101)){eff = eff.times(upgradeEffect('i', 101))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        53: {
            title: "prestige upgrade 53",
            description: "adds total time by 6",
            cost: new Decimal('e30'),
            effect() {
                eff = new Decimal(6)
                if (hasUpgrade('i', 101)){eff = eff.times(upgradeEffect('i', 101))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        54: {
            title: "prestige upgrade 54",
            description: "multiplies prestige point gain by log(total p points)^6",
            cost: new Decimal('e40'),
            effect() {
                eff = player.p.total.max(10).log10().pow(6)
                if (hasUpgrade('i', 102)){eff = eff.pow(upgradeEffect('i', 102))} 
                    
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        61: {
            title: "prestige upgrade 61",
            description: "adds energy timespeed by 0.1",
            cost: new Decimal('e50'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 101)){eff = eff.times(upgradeEffect('i', 101))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        62: {
            title: "prestige upgrade 62",
            description() { 
                text = "multiplies prestige point gain by (p points)^0.16"
                if (player.p.points.gte('1e150')) text += "<br> (softcapped)"
                return text},
            cost: new Decimal('e70'),
            effect() {
                upgp62 = new Decimal(1/6)
                if (hasUpgrade('i', 41)) upgp62 = upgp62.add(upgradeEffect('i', 41))
                eff = player.p.points.max(1e6).pow(upgp62).log10().log10().sub(0.3979400086720375) //1e6 = 10^6, 0.39 = log2.5/log10
                if (eff.gte(1)) {eff = eff.times(0.7).add(1).ln().times(2)}
                if (eff.gte(4)) {eff = eff.div(4).pow(0.52).times(4)}
                eff = eff.min(5).add(0.3979400086720375).pow10().pow10() //5.39 = log2.5/log10+5, cap at e2.5e5
                if (hasUpgrade('i', 102)){eff = eff.pow(upgradeEffect('i', 102))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        63: {
            title: "prestige upgrade 63",
            description: "adds total time by 6 ",
            cost: new Decimal('e90'),
            effect() {
                eff = new Decimal(6)
                if (hasUpgrade('i', 102)){eff = eff.times(upgradeEffect('i', 102))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        64: {
            title: "prestige upgrade harmonized",
            description: "unlocks fire, and 8 prestige upgrades",
            cost: new Decimal('1e140'),
            effect() {
                eff = new Decimal(0.05)
                if (hasUpgrade('i', 102)){eff = eff.times(upgradeEffect('i', 102))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        71: {
            title: "prestige upgrade 71",
            description: "raise prestige point gain to 1.05",
            cost: new Decimal('1e160'),
            effect() {
                eff = new Decimal(1.05)
                if (hasUpgrade('i', 103)){eff = eff.pow(upgradeEffect('i', 103))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        72: {
            title: "prestige upgrade 72",
            description: "raise prestige point gain to 1.05",
            cost: new Decimal('1e180'),
            effect() {
                eff = new Decimal(1.05) 
                if (hasUpgrade('i', 103)){eff = eff.pow(upgradeEffect('i', 103))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        73: {
            title: "prestige upgrade 73",
            description: "adds total time by 8",
            cost: new Decimal('1e200'),
            effect() {
                eff = new Decimal(8)
                if (hasUpgrade('i', 103)){eff = eff.times(upgradeEffect('i', 103))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        74: {
            title: "prestige upgrade 74",
            description: "adds integral point timespeed by 0.1",
            cost: new Decimal('1e220'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('i', 103)){eff = eff.times(upgradeEffect('i', 103))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        81: {
            title: "prestige upgrade 81",
            description: "adds prestige buyable 11 base by 0.2",
            cost: new Decimal('1e240'),
            effect() {
                eff = new Decimal(0.2)
                if (hasUpgrade('i', 104)){eff = eff.times(upgradeEffect('i', 104))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        82: {
            title: "prestige upgrade 82",            
            description: "adds fire gain by 0.05",
            cost: new Decimal('1e260'),
            effect() {
                eff = new Decimal(0.05)
                if (hasUpgrade('i', 104)){eff = eff.times(upgradeEffect('i', 104))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        83: {
            title: "prestige upgrade 83",
            description: "adds total time by 8",
            cost: new Decimal('1e280'),
            effect() {
                eff = new Decimal(8)
                if (hasUpgrade('i', 104)){eff = eff.times(upgradeEffect('i', 104))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        84: {
            title: "prestige upgrade 84",
            description: "unlocks infinity, and 8 prestige upgrades",
            cost: new Decimal('1e300'),
            effect() {
                eff = new Decimal(1)
                if (hasUpgrade('i', 104)){eff = eff.times(upgradeEffect('i', 104))} 
                return eff
            },
            unlocked() {return hasUpgrade('p', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        91: {
            title: "prestige upgrade 91",
            description() { 
                text = "multiply prestige point gain by log(p points)^2"
                if (player.p.total.gte('ee125')) text += "<br> (softcapped)" 
                return text},
            cost: new Decimal('e350'),
            effect() {
                eff9b = player.p.points.max(10).log10().pow(2)
                

                effrow9 = [Decimal.dOne, eff9b, eff9b.pow(2), eff9b.pow(3), eff9b.pow(4)]

                for (let i = 0; i < 4; i++) {
                    if (effrow9[i].gte('e250')) {effrow9[i] = effrow9[i].div('e250').pow(0.5).times('e250')}
                }

                eff = effrow9[1]
                if (hasUpgrade('f', 31)) {eff = eff.times(effrow9[2])}
                if (hasUpgrade('f', 32)) {eff = eff.times(effrow9[3])}
                if (hasUpgrade('f', 33)) {eff = eff.times(effrow9[4])}

                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        92: {
            title: "prestige upgrade 92",
            description() { 
                text = "multiply prestige point gain by log(p points)^4"
                if (player.p.total.gte('ee62.5')) text += "<br> (softcapped)" //43 = sol to log10(x+1)^2 = 3
                return text},
            cost: new Decimal('e400'),
            effect() {

                eff = effrow9[2]
                if (hasUpgrade('f', 31)) {eff = eff.times(effrow9[1])}
                if (hasUpgrade('f', 32)) {eff = eff.times(effrow9[3])}
                if (hasUpgrade('f', 33)) {eff = eff.times(effrow9[4])}

                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        93: {
            title: "prestige upgrade 93",
            description() { 
                text = "multiply prestige point gain by log(p points)^6"
                if (player.p.total.gte('ee41.6')) text += "<br> (softcapped)" //43 = sol to log10(x+1)^2 = 3
                return text},
            cost: new Decimal('e450'),
            effect() {

                eff = effrow9[3]
                if (hasUpgrade('f', 32)) {eff = eff.times(effrow9[1]).times(effrow9[2])}
                if (hasUpgrade('f', 33)) {eff = eff.times(effrow9[4])}

                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        94: {
            title: "prestige upgrade 94",
            description() { 
                text = "multiply prestige point gain by log(p points)^8"
                if (player.p.total.gte('ee31.2')) text += "<br> (softcapped)" //43 = sol to log10(x+1)^2 = 3
                return text},
            cost: new Decimal('e500'),
            effect() {

                eff = effrow9[4]
                if (hasUpgrade('f', 33)) {eff = eff.times(effrow9[1]).times(effrow9[2]).times(effrow9[3])}

                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        101: {
            title: "prestige upgrade 101",
            description: "raise prestige point gain by 1.05",
            cost: new Decimal('e600'),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        102: {
            title: "prestige upgrade 102",
            description: "raise prestige point gain by 1.05",
            cost: new Decimal('e700'),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        103: {
            title: "prestige upgrade 103",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal('e800'),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        104: {
            title: "prestige upgrade 104",
            description: "unlocks 8 prestige upgrades",
            cost: new Decimal('e900'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 84)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        111: {
            title: "prestige upgrade 111",
            description: "raise prestige upgrade 21 and integral kinematics upgrades 11 and 22 to 2",
            cost: new Decimal('e1000'),
            effect() {
                eff = new Decimal(2)
                if (hasUpgrade('i', 51)) {eff = eff.times(upgradeEffect('i', 51))}
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        112: {
            title: "prestige upgrade 112",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal('e1200'),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        113: {
            title: "prestige upgrade 113",
            description: "multiply prestige point gain by log(p points)^8",
            cost: new Decimal('e1500'),
            effect() {
                eff = player.p.points.max(10).log10().pow(8)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        114: {
            title: "prestige upgrade 114",
            description: "raise prestige point gain by 1.05",
            cost: new Decimal('e2000'),
            effect() {
                eff = new Decimal(1.05)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        121: {
            title: "prestige upgrade 121",
            description: "add integral point timespeed by 0.1",
            cost: new Decimal('e2500'),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        122: {
            title: "prestige upgrade 122",
            description: "add prestige buyable 11 effect base by 0.2",
            cost: new Decimal('e3000'),
            effect() {
                eff = new Decimal(0.2)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        123: {
            title: "prestige upgrade 123",
            description: "change the prestige buyable 11 description",
            cost: new Decimal('e4000'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        124: {
            title: "prestige upgrade 124",
            description: "unlock a new layer and the next 8 prestige upgrades",
            cost: new Decimal('e6000'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 104)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        131: {
            title: "prestige upgrade 131",
            description() {
                if (hasUpgrade('p', 131)) {return "here's the cat images buyable! wait, you already have it? sorry... i got nothing for you."} else {return "unlock another prestige buyable"}
            },
            cost: new Decimal('e8000'),
            effect() {
                eff = new Decimal(1-(hasUpgrade('p', 131)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        132: {
            title: "prestige upgrade 132",
            description() { 
                text = "multiply prestige gain by (prestige points)^0.1"
                if (hasUpgrade('p', 132)) text += ", but i can't put my best effort into anything recently..."
                return text},
            cost: new Decimal('e10000'),
            effect() {
                eff = player.p.points.max(10).root(10)
                if (hasUpgrade('p', 132)) {eff = eff.log10().pow(0.1).times(0.1).pow10()}
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        133: {
            title: "prestige upgrade 133",
            description() {
                if (hasUpgrade('p', 133)) {return "20 seconds? how much is a second? where am i?"} else {return "adds 20 seconds to game time"}
            },
            cost: new Decimal('e12000'),
            effect() {
                eff = new Decimal(20-20*(hasUpgrade('p', 133)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        134: {
            title: "prestige upgrade 134",
            description() { 
                text = "tries to raise prestige gain by 1.5"
                if (hasUpgrade('p', 134)) text += ", but fails"
                return text},
            cost: new Decimal('e14000'),
            effect() {
                eff = new Decimal(1.5-0.5*(hasUpgrade('p', 134)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        141: {
            title: "prestige upgrade 141",
            description() { 
                text = "multiply integral layer gain by 1.5"
                if (hasUpgrade('p', 141)) {text = "it seems the layer this upgrade is in is too low to "+text}
                return text},
            cost: new Decimal('e16000'),
            effect() {
                eff = new Decimal(1.5-0.5*(hasUpgrade('p', 141)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        142: {
            title: "prestige upgrade 142",
            description() { 
                text = "multiply gem gain by 1.5"
                if (hasUpgrade('p', 142)) {text = "sorry, we're in the wrong game. change /master to /one in the githack link to see if this upgrade works"}
                return text},
            cost: new Decimal('e20000'),
            effect() {
                eff = new Decimal(1.5-0.5*(hasUpgrade('p', 142)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        143: {
            title: "prestige upgrade 143",
            description() { 
                text = "multiply the version number by 1.5"
                if (hasUpgrade('p', 143)) {text = "it would be a really good gag if this upgrade works, but alas"}
                return text},
            cost: new Decimal('e24000'),
            effect() {
                eff = new Decimal(1.5-0.5*(hasUpgrade('p', 143)))
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        144: {
            title: "prestige upgrade 144",
            description() { 
                text = "this upgrade does nothing"
                if (hasUpgrade('p', 144)) {text += ", but at least youll enjoy the quality points"}
                return text},
            cost: new Decimal('e30000'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 124)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
    },
})

addLayer("q", {
    name: "quality", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "Q", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#8fff17",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "quality points", // Name of prestige currency
    baseResource: "total quality points", // Name of resource prestige is based on
    baseAmount() {
        qualityPoints = new Decimal(0)
        if (hasUpgrade('p', 24)) {qualityPoints = qualityPoints.add(2)}
        if (hasUpgrade('p', 44)) {qualityPoints = qualityPoints.add(4)}
        if (hasUpgrade('p', 64)) {qualityPoints = qualityPoints.add(6)}
        if (hasUpgrade('p', 84)) {qualityPoints = qualityPoints.add(8)}
        if (hasUpgrade('p', 104)) {qualityPoints = qualityPoints.add(10)}
        if (hasUpgrade('p', 124)) {qualityPoints = qualityPoints.add(12)}
        if (hasUpgrade('p', 144)) {qualityPoints = qualityPoints.add(14)}
        if (hasUpgrade('i', 24)) {qualityPoints = qualityPoints.add(4)}
        if (hasUpgrade('i', 44)) {qualityPoints = qualityPoints.add(8)}
        if (hasUpgrade('i', 64)) {qualityPoints = qualityPoints.add(12)}
        if (hasUpgrade('i', 84)) {qualityPoints = qualityPoints.add(16)}
        if (hasUpgrade('i', 104)) {qualityPoints = qualityPoints.add(20)}
        if (hasUpgrade('cg', 24)) {qualityPoints = qualityPoints.add(12)}
        if (hasUpgrade('cg', 44)) {qualityPoints = qualityPoints.add(24)}
        if (hasUpgrade('et', 24)) {qualityPoints = qualityPoints.add(12)}
        if (hasUpgrade('et', 44)) {qualityPoints = qualityPoints.add(24)}
        if (hasUpgrade('et', 64)) {qualityPoints = qualityPoints.add(36)}
        //add more here
        return qualityPoints
    }, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multq = new Decimal(1)


        return multq
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expq = new Decimal(1)
        return expq
    },
    getResetGain() {
        
        return qualityPoints.sub(player.q.total)
    },
    getNextAt() {
        nextq = qualityPoints.add(1)
        return nextq
    },
    canReset() {return getResetGain('q').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('q'))+" quality points." },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 24)||player.q.total.gte(1)},
    shouldNotify() {return getResetGain('q').gte(1)},
    doReset(resettingLayer) {
        let keep = [];
        
        keep.push("upgrades")
        keep.push("points")
        keep.push("best")
        keep.push("total")
        keep.push("buyables")
        


        layerDataReset("q", keep)

    },
    glowColor: "#ff0000",
    milestones:{

    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = ""
                
                text += "you gain quality points when you buy the rightmost upgrades on even rows equal to upgrade row number times layer row number factorial except row 0 layers (prestige is row 1) <br> upgrades that make other upgrades obsolete reduce their cost when the upgrades that it makes obsolete are bought"

                return text
            }
        },
    },
    buyables: {
        11: {
            unlocked() {return true},
            cost(x) {
            

                return Decimal.dZero
            },
            effect(x) {
                

                return getBuyableAmount(this.layer, this.id).div(3).floor().sub(getBuyableAmount(this.layer, this.id).div(3))
            },
            title() { return "quality buyable 11"},
            display() { 
                if (format(buyableEffect(this.layer, this.id)) == "0.00") textq = "changing every tick"
                if (format(buyableEffect(this.layer, this.id)) == "-0.33") textq = "changing slowly"
                if (format(buyableEffect(this.layer, this.id)) == "-0.67") textq = "unchanging"
                
                return "toggles flickering large numbers"  },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    
    upgrades: {
        11: {
            title: "quality upgrade 11",
            description: "integral kinematics buyables 11 and 12 do not reset layer time",
            cost: new Decimal(7),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "quality upgrade 12",
            description: "integral kinematics buyables 13 do not reset previous buyables",
            cost: new Decimal(8),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        13: {
            title: "quality upgrade 13",
            description: "integral kinematics buyables 13 do not reset layer time",
            cost: new Decimal(9),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "quality upgrade 14",
            description: "row 2 resets do not reset prestige",
            cost: new Decimal(15),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "quality upgrade 21",
            description: "unlock continuum for prestige buyable 11",
            cost: new Decimal(15),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "quality upgrade 22",
            description: "unlock continuum for integral kinematics buyables 11 to 13",
            cost() {return new Decimal(35-7*hasUpgrade('q', 11)-8*hasUpgrade('q', 12)-9*hasUpgrade('q', 13))},
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "quality upgrade 23",
            description: "unlock continuum for fire buyables 11 to 13 (requires fire buyables unlock)",
            cost: new Decimal(70),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
            title: "quality upgrade 24",
            description: "with the upgrade above this, row 3 resets do not reset prestige",
            cost: new Decimal(90), 
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        33: {
            title: "quality upgrade 33",
            description: "unlock continuum for infinity buyables 11 to 13",
            cost: new Decimal(70), 
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
    }
})

addLayer("il", {
    name: "integral layer", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IL", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
        total: new Decimal(1),
    }},
    color: "#ffe6cc",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "integral layers", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addil = new Decimal(2)
        multil = new Decimal(1)
        if (hasUpgrade('p', 141)) {multil = multil.times(upgradeEffect('p', 141))}

        return multil
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expil = new Decimal(1)
        return expil
    },
    getResetGain() {
        return player.p.points.max(25.96).log10().log(2).log(2).add(addil).times(multil).pow(expil).floor().sub(player.il.total) //25.96 = 10^(2^(2^(-1)))
    },
    getNextAt() {
        nextil = player.il.total.add(getResetGain('il')).add(1)
        return Decimal.dTwo.pow(Decimal.dTwo.pow(nextil.root(expil).div(multil).sub(addil))).pow10()
    },
    canReset() {return getResetGain('il').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('il'))+" integral layers. Next at "+format(getNextAt('il'))+" prestige points" },
    shouldNotify() {return getResetGain('il').gte(1)},
    glowColor: "#ff0000",
    row: 2, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return true},
    infoboxes: {
    },
    upgrades: {
    },
    doReset(resettingLayer) {
        let keep = [];
        
        keep.push("upgrades")
        keep.push("points")
        keep.push("best")
        keep.push("total")
        keep.push("buyables")
        
        maxkeeprow = 2

        if (hasUpgrade('q', 24)) {maxkeeprow = maxkeeprow + 1}

        if (layers[resettingLayer].row <= maxkeeprow) {layerDataReset("il", keep)} else if (layers[resettingLayer].row > this.row) {
            ikLastReset = new Decimal(0)
            layerDataReset("il", [])
        }
    },
})

addLayer("pw", {
    name: "power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "PW", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#1a53ff",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "power", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addpw = new Decimal(1)
        multpw = new Decimal(1)
        if (hasUpgrade('p', 142)) {multil = multil.times(upgradeEffect('p', 142))}

        return multpw
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exppw = new Decimal(1)
        return exppw
    },
    getResetGain() {
        return player.p.points.max(1000000).log10().log(6).log(2).add(addpw).times(multpw).pow(exppw).floor().sub(player.pw.total)
    },
    getNextAt() {
        nextpw = player.pw.total.add(getResetGain('pw')).add(1)
        return new Decimal(6).pow(Decimal.dTwo.pow(nextpw.root(exppw).div(multpw).sub(addpw))).pow10()
    },
    canReset() {return getResetGain('pw').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('pw'))+" power. Next at "+format(getNextAt('pw'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 24)||player.pw.total.gte(1)||player.cg.total.gte(1)},
    shouldNotify() {return getResetGain('pw').gte(1)},
    glowColor: "#ff0000",
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textpw = "you gain "+format(player.pw.total.times(multe))+" energy per second <br>"
                proportiontoVolts = player.pw.buyables[11].sub(player.pw.buyables[12]).add(10).max(0).min(20).div(20)
                Evoltage = player.pw.total.times(multe).pow(proportiontoVolts)
                Ecurrent = player.pw.total.times(multe).pow(proportiontoVolts.times(-1).add(1))
                if (hasMilestone('pw', 0)) {textpw += "the voltage is "+format(Evoltage)+" and the current is "+format(Ecurrent)}
                return textpw
            }
        },
    },
    milestones:{
        0: {
            requirementDescription: "power milestone 0",
            effectDescription: "4 power, unlock a certain energy upgrade",
            done() { return player[this.layer].points.gte(4) }
        }
    },
    buyables: {
        11: {
            unlocked() {return hasMilestone('pw', 0)},
            cost(x) {
            

                return Decimal.dZero
            },
            effect(x) {
                voltageEachClick = player.pw.total.times(multe).root(20)

                return Decimal.dZero
            },
            title() { return "power buyable 11"},
            display() { return "increases the resistance by x"+format(voltageEachClick)+" and performs a row 1 reset" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                doReset('p')
            },
        },
        12: {
            unlocked() {return hasMilestone('pw', 0)},
            cost(x) {
            

                return Decimal.dZero
            },
            effect(x) {
                voltageEachClick = player.pw.total.times(multe).root(20)

                return Decimal.dZero
            },
            title() { return "power buyable 12"},
            display() { return "decreases the resistance by x"+format(voltageEachClick)+" and performs a row 1 reset" },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                doReset('p')
            },
        },
    },
    upgrades: {
    },
    doReset(resettingLayer) {
        let keep = [];
        
        keep.push("upgrades")
        keep.push("points")
        keep.push("best")
        keep.push("total")
        keep.push("buyables")
        
        maxkeeprow = 2

        if (hasUpgrade('q', 24)) {maxkeeprow = maxkeeprow + 1}

        if (layers[resettingLayer].row <= maxkeeprow) {layerDataReset("pw", keep)} else if (layers[resettingLayer].row > this.row) {
            ikLastReset = new Decimal(0)
            layerDataReset("pw", [])
        }
    },
})

addLayer("i", {
    name: "infinity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "I", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#ff9800",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "infinity points", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.p.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multi = new Decimal(1)


        return multi
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expi = new Decimal(1)
        return expi
    },
    getResetGain() {
        return player.p.points.max(1).root(441.01279546715448388618912641430080723946693844967).div(5).times(multi).pow(expi).floor().sub(player.i.total).max(0) //441.0 = 1024*ln2/ln5
    },
    getNextAt() {
        nexti = player.i.total.add(getResetGain('i')).add(1)
        return nexti.root(expi).div(multi).times(5).pow(441.01279546715448388618912641430080723946693844967)
    },
    canReset() {return getResetGain('i').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('i'))+" infinity points. Next at "+format(getNextAt('i'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 84)||player.i.total.gte(1)||player.cg.total.gte(1)},
    doReset(resettingLayer) {
        let keep = [];
        
        keep.push("upgrades")
        keep.push("points")
        keep.push("best")
        keep.push("total")
        keep.push("buyables")
        
        maxkeeprow = 2

        if (hasUpgrade('q', 24)) {maxkeeprow = maxkeeprow + 1}

        if (layers[resettingLayer].row <= maxkeeprow) {layerDataReset("i", keep)} else if (layers[resettingLayer].row > this.row) {
            ikLastReset = new Decimal(0)
            layerDataReset("i", [])
        }
    },
    milestones:{


    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = "you have "+formatWhole(player.i.total)+" total infinity points <br>"
                if (multi.gt(1)){text += "your infinity point gain multiplier is "+format(multi)+"<br>"}
                if (expi.gt(1)){text += "your infinity point gain exponent is "+format(expi)+"<br>"}

                logip = player.i.points.max(1).log10().div(10)

                idmult = new Decimal(1)
                if (hasUpgrade('c', 24)) idmult = idmult.times(upgradeEffect('c', 24))
                if (hasUpgrade('f', 23)) idmult = idmult.times(upgradeEffect('f', 23))
                if (hasUpgrade('et', 13)) idmult = idmult.times(upgradeEffect('et', 13))
                if (hasUpgrade('et', 41)) idmult = idmult.times(upgradeEffect('et', 41))

                idtime = player.points.times(player.gamespeed()).times(idmult)

                if (logip.lt(1)||(!hasUpgrade('i', 24))) {infd1 = Decimal.dZero} else {infd1 = logip.div(1)}
                if (logip.lt(2)||(!hasUpgrade('i', 44))) {infd2 = Decimal.dZero} else {infd2 = logip.div(2)}
                if (logip.lt(6)||(!hasUpgrade('i', 64))) {infd3 = Decimal.dZero} else {infd3 = logip.div(6)}
                if (logip.lt(24)||(!hasUpgrade('i', 84))) {infd4 = Decimal.dZero} else {infd4 = logip.div(24)}
                if (logip.lt(120)||(!hasUpgrade('i', 84))) {infd5 = Decimal.dZero} else {infd5 = logip.div(120)}
                if (logip.lt(720)||(!hasUpgrade('i', 84))) {infd6 = Decimal.dZero} else {infd6 = logip.div(720)}
                if (logip.lt(5040)||(!hasUpgrade('i', 84))) {infd7 = Decimal.dZero} else {infd7 = logip.div(5040)}
                if (logip.lt(40320)||(!hasUpgrade('i', 84))) {infd8 = Decimal.dZero} else {infd8 = logip.div(40320)}

                infpow = Decimal.dZero
                infpow = infpow.add(idtime.pow(1).div(1).times(infd1))
                infpow = infpow.add(idtime.pow(2).div(2).times(infd2))
                infpow = infpow.add(idtime.pow(3).div(6).times(infd3))
                infpow = infpow.add(idtime.pow(4).div(24).times(infd4))
                infpow = infpow.add(idtime.pow(5).div(120).times(infd5))
                infpow = infpow.add(idtime.pow(6).div(720).times(infd6))
                infpow = infpow.add(idtime.pow(7).div(5040).times(infd7))
                infpow = infpow.add(idtime.pow(8).div(40320).times(infd8))

                infpowcv = new Decimal(224)
                if (hasUpgrade('f', 24)) {infpowcv = infpowcv.times(upgradeEffect('f', 24))}
                if (hasUpgrade('et', 22)) {infpowcv = infpowcv.times(upgradeEffect('et', 22))}
                if (hasUpgrade('et', 33)) {infpowcv = infpowcv.times(upgradeEffect('et', 33))}

                infmult = infpow.max(1).pow(infpowcv)

                if (infpow.gte(1)) {text += "<br> you have "+format(infpow)+" infinity power, raised to ^"+format(infpowcv)+" to multiply your prestige point gain by "+format(infmult)}
                if (idmult.gt(1)) {text += "<br> your infinity dimensions multiplier is "+format(idmult)}
                if (infd1.gt(0)) {text += "<br> you have "+format(infd1)+" first infinity dimension"}
                if (infd2.gt(0)) {text += "<br> you have "+format(infd2)+" second infinity dimension"}
                if (infd3.gt(0)) {text += "<br> you have "+format(infd3)+" third infinity dimension"}
                if (infd4.gt(0)) {text += "<br> you have "+format(infd4)+" fourth infinity dimension"}
                if (infd5.gt(0)) {text += "<br> you have "+format(infd5)+" fifth infinity dimension"}
                if (infd6.gt(0)) {text += "<br> you have "+format(infd6)+" sixth infinity dimension"}
                if (infd7.gt(0)) {text += "<br> you have "+format(infd7)+" seventh infinity dimension"}
                if (infd8.gt(0)) {text += "<br> you have "+format(infd8)+" eighth infinity dimension"}

                return text
            }
        },
    },
    buyables: {
        11: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasei11 = Decimal.dTen

                inf11realx = new Decimal(x)
                if (hasUpgrade('et', 71)) {inf11realx = inf11realx.div(upgradeEffect('et', 71))}
                logcosti11 = inf11realx.add(4.5).pow(2).add(119.75)

                if (hasUpgrade('et', 14)) {logcosti11 = logcosti11.sub(upgradeEffect('et', 14).log10())}
                if (logcosti11.gte(1000)) {logcosti11 = logcosti11.div(1000).pow(1.5).times(1000)}
                if (logcosti11.gte(5000)) {logcosti11 = logcosti11.div(5000).pow(4/3).times(5000)}
                if (logcosti11.gte(25000)) {logcosti11 = logcosti11.div(25000).pow(5/4).times(25000)}

                effectiveIpForBuyables = player.i.points.log10()
                if (effectiveIpForBuyables.gte(25000)) {effectiveIpForBuyables = effectiveIpForBuyables.div(25000).root(5/4).times(25000)}
                if (effectiveIpForBuyables.gte(5000)) {effectiveIpForBuyables = effectiveIpForBuyables.div(5000).root(4/3).times(5000)}
                if (effectiveIpForBuyables.gte(1000)) {effectiveIpForBuyables = effectiveIpForBuyables.div(1000).root(1.5).times(1000)}
                if (hasUpgrade('et', 14)) {effectiveIpForBuyables = effectiveIpForBuyables.add(upgradeEffect('et', 14).log10())}


                ownedi11 = effectiveIpForBuyables.max(1).sub(119.75).root(2).sub(4.5).add(1).max(0) //since x is owned buyable not about to be owned buyable, there is off by one error
                if (hasUpgrade('et', 71)) {ownedi11 = ownedi11.times(upgradeEffect('et', 71))}

                if (hasUpgrade('q', 33)) {return player.veryLargeNumber(12)} else {return Decimal.pow(costbasei11, logcosti11)}
            },
            effect(x) {
                effbasei11 = new Decimal(0.05)
                if (hasUpgrade('et', 61)) {effbasei11 = effbasei11.add(upgradeEffect('et', 61))}

                if (hasUpgrade('q', 33)) {diveffi11 = ownedi11} else {diveffi11 = new Decimal(x)}

                return Decimal.times(effbasei11, diveffi11)
            },
            title() { return "infinity buyable 11"},
            display() { return "increase fire gain by "+format(effbasei11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(diveffi11)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        12: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasei12 = Decimal.dTen

                inf12realx = new Decimal(x)
                if (hasUpgrade('et', 72)) {inf12realx = inf12realx.div(upgradeEffect('et', 72))}
                logcosti12 = inf12realx.add(1.5).pow(2).times(5).add(128.75)
                if (hasUpgrade('et', 14)) {logcosti12 = logcosti12.sub(upgradeEffect('et', 14).log10())}
                if (logcosti12.gte(1000)) {logcosti12 = logcosti12.div(1000).pow(1.5).times(1000)}
                if (logcosti12.gte(5000)) {logcosti12 = logcosti12.div(5000).pow(4/3).times(5000)}
                if (logcosti12.gte(25000)) {logcosti12 = logcosti12.div(25000).pow(5/4).times(25000)}

                ownedi12 = effectiveIpForBuyables.sub(128.75).div(5).root(2).sub(1.5).add(1).max(0)
                if (hasUpgrade('et', 72)) {ownedi12 = ownedi12.times(upgradeEffect('et', 72))}


                if (hasUpgrade('q', 33)) {return player.veryLargeNumber(12)} else {return Decimal.pow(costbasei12, logcosti12).round()}
            },
            effect(x) {
                effbasei12 = new Decimal(1.05)
                if (hasUpgrade('et', 61)) {effbasei12 = effbasei12.add(upgradeEffect('et', 61))}

                if (hasUpgrade('q', 33)) {logeffi12 = ownedi12} else {logeffi12 = new Decimal(x)}

                return Decimal.pow(effbasei12, logeffi12)
            },
            title() { return "infinity buyable 12"},
            display() { return "multiply fire gain by "+format(effbasei12)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(logeffi12)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
        13: {
            unlocked() {return hasUpgrade('i', 74)},
            cost(x) {
                costbasei13 = Decimal.dTen

                inf13realx = new Decimal(x)
                if (hasUpgrade('et', 74)) {inf13realx = inf13realx.div(upgradeEffect('et', 74))}
                logcosti13 = new Decimal(x).add(0.5).pow(2).times(25).add(193.75)
                if (hasUpgrade('et', 14)) {logcosti13 = logcosti13.sub(upgradeEffect('et', 14).log10())}
                if (logcosti13.gte(1000)) {logcosti13 = logcosti13.div(1000).pow(1.5).times(1000)}
                if (logcosti13.gte(5000)) {logcosti13 = logcosti13.div(5000).pow(4/3).times(5000)}
                if (logcosti13.gte(25000)) {logcosti13 = logcosti13.div(25000).pow(5/4).times(25000)}

                ownedi13 = effectiveIpForBuyables.sub(193.75).div(25).root(2).sub(0.5).add(1).max(0)
                if (hasUpgrade('et', 74)) {owned13 = owned13.times(upgradeEffect('et', 72))}


                if (hasUpgrade('q', 33)) {return player.veryLargeNumber(12)} else {return Decimal.pow(costbasei13, logcosti13).round()}
            },
            effect(x) {
                effbasei13 = new Decimal(10)
                if (hasUpgrade('et', 62)) {effbasei13 = effbasei13.pow(upgradeEffect('et', 62))}

                if (hasUpgrade('q', 33)) {logeffi13 = ownedi13} else {logeffi13 = new Decimal(x)}

                return Decimal.pow(effbasei13, logeffi13)
            },
            title() { return "infinity buyable 13"},
            display() { return "divide all fire buyable costs by "+format(effbasei13)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(logeffi13)+" <br> effect: "+format(this.effect())},
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    upgrades: {
        11: {
            title: "infinity upgrade 11",
            description: "multiplies prestige point gain by 10^(2*total time)",
            cost: new Decimal(1),
            effect() {
                eff = player.totalGameTime().times(2).pow10()
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "infinity upgrade 12",
            description() { 
                text = "multiplies prestige point gain by 10^(log(1+total i points)^0.8*100)"
                if (player.i.total.gte(2.997394400216383e7)) text += "(softcapped)" //3e7 = 10^(5^(5/4))-1
                return text},
            cost: new Decimal(2),
            effect() {
                if (hasUpgrade('et', 32)) {
                    upgradeIPoints = player.i.points.pow(upgradeEffect('et' ,32))
                    upgradeITotal = player.i.total.pow(upgradeEffect('et' ,32))
                } else {
                    upgradeIPoints = player.i.points
                    upgradeITotal = player.i.total
                }

                eff = upgradeITotal.add(1).log10().pow(0.8)

                if (eff.gte(5)) eff = eff.div(5).pow(1/3).times(5) 

                eff = eff.min(100).times(100).pow10()
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        13: {
            title: "infinity upgrade 13",
            description: "adds total time by 10",
            cost: new Decimal(4),
            effect() {
                eff = Decimal.dTen
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "infinity upgrade 14",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(20),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "infinity upgrade 21",
            description:"multiply prestige point gain by 10^(log(log(p point))^1.25*50)",
            cost: new Decimal(400),
            effect() {
                eff = player.p.points.max(1e10).log10().log10().pow(1.25).times(50).min(5000).pow10()



                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "infinity upgrade 22",
            description: "raise prestige upgrade 11 by ^1.2",
            cost: new Decimal(4000),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "infinity upgrade 23",
            description: "add fire gain by 0.05",
            cost: new Decimal(20000),
            effect() {
                eff = new Decimal(0.05)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
            title: "infinity upgrade 24",
            description: "unlock the 1st infinity dimension and the next 8 infinity upgrades",
            cost: new Decimal(1e5),
            effect() {
                eff = infmult.max(1)
                return eff
            },
            unlocked() {return true},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        31: {
            title: "infinity upgrade 31",
            description: "multiplies prestige point gain by log(i points)^180",
            cost: new Decimal(5e6),
            effect() {
                eff = upgradeITotal.max(1).log10().pow(180)
                eff = eff.min('e10000')
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        32: {
            title: "infinity upgrade 32",
            description() {
                text = "multiply prestige point gain by 10^(log(p points)^0.66)"
                if (player.p.points.gte('e11180')) {text += " (softcapped)"} // e11180 = 10^(500^(1/0.5))
                return text
            },
            cost: new Decimal(5e7),
            effect() {
                eff = player.p.points.max(10).log10().root(1.5)
                if (eff.gte(500)) {eff = eff.div(500).pow(0.75).times(500)} //effective pow: 0.5
                if (eff.gte(1000)) {eff = eff.div(1000).pow(2/3).times(1000)} //effective pow: 0.33
                if (eff.gte(2000)) {eff = eff.div(2000).pow(0.5).times(2000)} //effective pow: 0.16
                eff = eff.min(5000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        33: {
            title: "infinity upgrade 33",
            description: "raises prestige upgrade 11 effect by 1.25",
            cost: new Decimal(5e8),
            effect() {
                eff = new Decimal(1.25)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        34: {
            title: "infinity upgrade 34",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(5e9),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        41: {
            title: "infinity upgrade 41",
            description: "add 0.03 to the prestige upgrade 62 power",
            cost: new Decimal(5e10),
            effect() {
                eff = new Decimal(1/30)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        42: {
            title: "infinity upgrade 42",
            description: "raise prestige upgrade 12 to 10",
            cost: new Decimal(5e11),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },

        43: {
            title: "infinity upgrade 43",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(1e13),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        44: {
            title: "infinity upgrade 44",
            description: "unlock the 2nd infinity dimension and next 8 infinity upgrades",
            cost: new Decimal(1e15),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        51: {
            title: "infinity upgrade 51",
            description: "multiply prestige upgrade 111 by 1.5",
            cost: new Decimal(1e20),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        52: {
            title: "infinity upgrade 52",
            description: "raises prestige point gain to 1.2",
            cost: new Decimal(1e25),
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        53: {
            title: "infinity upgrade 53",
            description: "raise prestige upgrade 11 to 1.33",
            cost: new Decimal(1e30),
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        54: {
            title: "infinity upgrade 54",
            description: "raise prestige point gain to 1.1",
            cost: new Decimal(1e35),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        61: {
            title: "infinity upgrade 61",
            description: "multiply prestige point gain by 10^(log(i points)^0.5*180)",
            cost: new Decimal(1e40),
            effect() {
                eff = upgradeIPoints.max(1).log10().pow(0.5).times(180)

                eff = eff.min(5000)
                eff = eff.pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        62: {
            title: "infinity upgrade 62",
            description: "raise prestige upgrade 11 to 1.5",
            cost: new Decimal(1e45),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        63: {
            title: "infinity upgrade 63",
            description: "raise prestige point gain by 1.1",
            cost: new Decimal(1e50),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        64: {
            title: "infinity upgrade harmonized",
            description: "unlock the 3rd infinity dimension and 8 infinity upgrades",
            cost: new Decimal(1e55),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        71: {
            title: "infinity upgrade 71",
            description: "multiply prestige point gain by 10^(log(log(p points))^5)",
            cost: new Decimal(1e65),
            effect() {
                eff = player.p.points.max(1e10).log10().log10().pow(5).min(5000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        72: {
            title: "infinity upgrade 72",
            description: "raise prestige point gain by 1.15",
            cost: new Decimal(1e80),
            effect() {
                eff = new Decimal(1.15)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        73: {
            title: "infinity upgrade 73",
            description: "raise prestige point gain to 1.15",
            cost: new Decimal(1e110),
            effect() {
                eff = new Decimal(1.15)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        74: {
            title: "infinity upgrade 74",
            description: "unlock a fire upgrade and some buyables",
            cost: new Decimal(1e140),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        81: {
            title: "infinity upgrade 81",
            description: "multiply prestige point gain by 10^(log(i points)^0.5)",
            cost: new Decimal(1e160),
            effect() {
                eff = upgradeIPoints.max(10).log10().pow(0.5).min(10000).pow10()
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        82: {
            title: "infinity upgrade 82",
            description: "add the energy timespeed by 0.1",
            cost: new Decimal(1e190),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        83: {
            title: "infinity upgrade 83",
            description: "add the integral point timespeed by 0.1",
            cost: new Decimal(1e210),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        84: {
            title: "infinity upgrade 84",
            description: "unlock the 4th infinity dimension",
            cost: new Decimal(1e240),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasUpgrade('i', 64)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        91: {
            title: "infinity upgrade 91",
            description: "double the effects of prestige upgrade 11 to 14",
            cost: new Decimal('e500'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        92: {
            title: "infinity upgrade 92",
            description: "double the effects of prestige upgrade 21 to 24",
            cost: new Decimal('e1000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        93: {
            title: "infinity upgrade 93",
            description: "double the effects of prestige upgrade 31 to 34",
            cost: new Decimal('e2000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        94: {
            title: "infinity upgrade 94",
            description: "double the effects of prestige upgrade 41 to 44",
            cost: new Decimal('e4000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        101: {
            title: "infinity upgrade 101",
            description: "double the effects of prestige upgrade 51 to 54",
            cost: new Decimal('e10000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        102: {
            title: "infinity upgrade 102",
            description: "double the effects of prestige upgrade 61 to 64",
            cost: new Decimal('e20000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        103: {
            title: "infinity upgrade 103",
            description: "double the effects of prestige upgrade 71 to 74",
            cost: new Decimal('e40000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        104: {
            title: "infinity upgrade 104",
            description: "double the effects of prestige upgrade 81 to 84",
            cost: new Decimal('e80000'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasUpgrade('i', 84)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
    },
})

addLayer("cg", {
    name: "catgif", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "CG", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#f197ac",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "cat gifs", // Name of prestige currency
    baseResource: "prestige buyable 11s", // Name of resource prestige is based on
    baseAmount() {
        if (hasUpgrade('q', 21)) {return ownedp11} else {return player.p.buyables[11]}}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multcg = new Decimal(1)


        return multcg
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expcg = new Decimal(1)
        return expcg
    },
    getResetGain() {
        if (hasUpgrade('q', 21)) {basecurrencycg = ownedp11} else {basecurrencycg = player.p.buyables[11]}
        return basecurrencycg.div(100).root(2).times(multcg).pow(expcg).trunc().sub(player.cg.total)
    },
    getNextAt() {
        nextcg = player.cg.total.add(getResetGain('cg')).add(1)
        return nextcg.root(expcg).div(multcg).pow(2).times(100)
    },
    canReset() {return getResetGain('cg').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('cg'))+" cat gifs. Next at "+format(getNextAt('cg'))+" prestige buyable 11s" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 124)||player.cg.total.gte(1)},
    shouldNotify() {return getResetGain('cg').gte(1)},
    glowColor: "#ff0000",
    milestones:{
        0: {
            requirementDescription: "cat gif milestone 0",
            effectDescription: "1 total cat gif, unlock 8 cat gif upgrades",
            done() { return player[this.layer].total.gte(1) }
        },
        1: {
            requirementDescription: "cat gif milestone 1",
            effectDescription: "3 total cat gifs, unlock 8 cat gif upgrades",
            done() { return player[this.layer].total.gte(3) }
        },
    },
    infoboxes: {
    },
    buyables: {
        11: {
            cost(x) {
                costbasecg11 = Decimal.dTwo

                logcostcg11 = new Decimal(x)

                return Decimal.pow(costbasecg11, logcostcg11).trunc() //lb(x.max(1))+1
            },
            effect(x) {
                effbasecg11 = new Decimal(1.5)

                logeffcg11 = new Decimal(x)

                return Decimal.pow(effbasecg11, logeffcg11)
            },
            unlocked() {return hasUpgrade('cg', 24)},
            title() { return "cat gif buyable 11"},
            display() { return "root prestige buyable cost by "+format(effbasecg11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        },
    },
    
    upgrades: {
        11: {
            title: "cat gif upgrade 11",
            description: "raise prestige point gain by (cg points +1)^0.33",
            cost: new Decimal(0),
            effect() {
                eff = player.cg.points.add(1).root(3)
                if (hasUpgrade('cg', 31)) {eff = eff.pow(upgradeEffect('cg', 31))}
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "cat gif upgrade 12",
            description: "multiply integral point timespeed by (cg points +1)^0.16",
            cost: new Decimal(0),
            effect() {
                eff = player.cg.points.add(1).root(6)
                if (hasUpgrade('cg', 32)) {eff = eff.pow(upgradeEffect('cg', 32))}
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        13: {
            title: "cat gif upgrade 13",
            description: "multiply energy timespeed by (cg points +1)^0.16",
            cost: new Decimal(0),
            effect() {
                eff = player.cg.points.add(1).root(6)
                if (hasUpgrade('cg', 32)) {eff = eff.pow(upgradeEffect('cg', 32))}
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "cat gif upgrade 14",
            description: "multiply fire timespeed by (cg points +1)^0.16",
            cost: new Decimal(0),
            effect() {
                eff = player.cg.points.add(1).root(6)
                if (hasUpgrade('cg', 32)) {eff = eff.pow(upgradeEffect('cg', 32))}
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "cat gif upgrade 21",
            description: "multiply prestige buyable amount by 2",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "cat gif upgrade 22",
            description: "multiply prestige buyable effect by 2",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(2)
                if (hasUpgrade('cg', 42)) {eff = eff.times(upgradeEffect('cg', 42))}
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "cat gif upgrade 23",
            description: "adds total time by 10",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
            title: "cat gif upgrade 24",
            description: "unlock cat gif buyable 11",
            cost: new Decimal(0),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasMilestone('cg', 0)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        31: {
            title: "cat gif upgrade 31",
            description: "raise cat gif upgrade 11 to 1.5",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        32: {
            title: "cat gif upgrade 32",
            description: "raise cat gif upgrade 12 to 1.5",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        33: {
            title: "cat gif upgrade 33",
            description: "raise cat gif upgrade 13 to 1.5",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        34: {
            title: "cat gif upgrade 34",
            description: "raise cat gif upgrade 14 to 1.5",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        41: {
            title: "cat gif upgrade 41",
            description: "raise prestige point exponent by 1.01",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1.01)
                return eff
            },
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        42: {
            title: "cat gif upgrade 42",
            description: "multiply cat gif upgrade 22 by 10",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(10)
                return eff
            },
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        43: {
            title: "cat gif upgrade 43",
            description: "adds 60 seconds to total time",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(60)
                return eff
            },
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        44: {
            title: "cat gif upgrade 44",
            description: "integral kinematics buyables give free prestige buyables",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            unlocked() {return hasMilestone('cg', 1)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
    }
})

addLayer("et", {
    name: "eternity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "ET", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#b341e0",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "eternity points", // Name of prestige currency
    baseResource: "infinity points", // Name of resource prestige is based on
    baseAmount() {return player.i.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses

        multet = new Decimal(1)


        return multet
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expet = new Decimal(1)
        return expet
    },
    getResetGain() {
        return player.i.points.max(1).root(646.07206765717241558991576508698711480277569549505).div(3).times(multet).pow(expet).floor().sub(player.et.total).max(0) //646.1 = 1024*ln2/ln3
    },
    getNextAt() {
        nextet = player.et.total.add(getResetGain('et')).add(1)
        return nextet.root(expet).div(multet).times(3).pow(646.07206765717241558991576508698711480277569549505)
    },
    canReset() {return getResetGain('et').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('et'))+" eternity points. Next at "+format(getNextAt('et'))+" infinity points" },
    row: 3, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return player.i.points.gte(Decimal.dTwo.pow(1024))||player.et.total.gte(1)},
    milestones:{

    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = "you have "+formatWhole(player.et.total)+" total eternity points <br>"
                if (multet.gt(1)){text += "your eternity point gain multiplier is "+format(multet)+"<br>"}
                if (expet.gt(1)){text += "your eternity point gain exponent is "+format(expet)+"<br>"}

                loget = player.et.points.max(1).log(3)

                tdmult = new Decimal(1)


                if (hasUpgrade('et', 44)) {tdtime = player.totalGameTime().times(player.gamespeed()).times(tdmult)} else {tdtime = player.points.times(player.gamespeed()).times(tdmult)}


                if (loget.lt(1)) {timed1 = Decimal.dZero} else {timed1 = loget.div(1)}
                if (loget.lt(2)) {timed2 = Decimal.dZero} else {timed2 = loget.div(2)}
                if (loget.lt(6)) {timed3 = Decimal.dZero} else {timed3 = loget.div(6)}
                if (loget.lt(24)) {timed4 = Decimal.dZero} else {timed4 = loget.div(24)}
                if (loget.lt(120)) {timed5 = Decimal.dZero} else {timed5 = loget.div(120)}
                if (loget.lt(720)) {timed6 = Decimal.dZero} else {timed6 = loget.div(720)}
                if (loget.lt(5040)) {timed7 = Decimal.dZero} else {timed7 = loget.div(5040)}
                if (loget.lt(40320)) {timed8 = Decimal.dZero} else {timed8 = loget.div(40320)}

                timepow = Decimal.dZero
                timepow = timepow.add(tdtime.pow(1).div(1).times(timed1))
                timepow = timepow.add(tdtime.pow(2).div(2).times(timed2))
                timepow = timepow.add(tdtime.pow(3).div(6).times(timed3))
                timepow = timepow.add(tdtime.pow(4).div(24).times(timed4))
                timepow = timepow.add(tdtime.pow(5).div(120).times(timed5))
                timepow = timepow.add(tdtime.pow(6).div(720).times(timed6))
                timepow = timepow.add(tdtime.pow(7).div(5040).times(timed7))
                timepow = timepow.add(tdtime.pow(8).div(40320).times(timed8))
                timepow = timepow.max(1)

                tickspeedboost = new Decimal(1.01)

                
                if (hasUpgrade('et', 63)) {tickspeedcost = new Decimal(5/4)} else {tickspeedcost = new Decimal(4/3)}
                tickspeedcostLogTen = tickspeedcost.log10()
                tickspeedScalingStart = new Decimal(60) //number of free tickspeeds reached
                tickspeedScalingStrength = new Decimal(1.06) // multiplier to time shards requirement per tickspeed each tickspeed after scaling starts
                tickspeedScalingStrengthLogTen = tickspeedScalingStrength.log10()

                if (Decimal.log(timepow, tickspeedcost).gt(tickspeedScalingStart)) {
                    tempvar1 = tickspeedcostLogTen.times(2).add(tickspeedScalingStrengthLogTen)
                    tempvar2 = tickspeedScalingStrengthLogTen.times(timepow.log10().sub(tickspeedcostLogTen.times(tickspeedScalingStart))).times(8)
                    tickspeeds = tempvar1.pow(2).add(tempvar2).root(2).sub(tempvar1).div(tickspeedScalingStrengthLogTen).div(2).add(tickspeedScalingStart)
                    marginaltickspeedcost = tickspeedScalingStrength.pow(tickspeeds.sub(tickspeedScalingStart)).times(tickspeedcost)
                } 
                else {
                    tickspeeds = Decimal.log(timepow, tickspeedcost)
                    marginaltickspeedcost = tickspeedcost
                }


                timemult = Decimal.pow(tickspeedboost, tickspeeds)
                if (timepow.gt(1)) {text += "<br> you have "+format(timepow)+" time shards, the next tickspeed upgrade costs "+format(marginaltickspeedcost)+"x more than this one"}
                if (timepow.gt(1)) {text += "<br> you have "+format(tickspeeds)+" tickspeed upgrades, each giving a "+format(tickspeedboost)+"x boost to your row 0 timespeed to multiply it by "+format(timemult)+" in total"}
                if (timepow.gte(tickspeedcost.pow(tickspeedScalingStart))) {text += "<br> after "+format(tickspeedScalingStart)+" tickspeed upgrades, each upgrade is "+format(tickspeedScalingStrength)+"x more expensive than the last"}
                if (timed1.gt(0)) {text += "<br> you have "+format(timed1)+" first time dimension"}
                if (timed2.gt(0)) {text += "<br> you have "+format(timed2)+" second time dimension"}
                if (timed3.gt(0)) {text += "<br> you have "+format(timed3)+" third time dimension"}
                if (timed4.gt(0)) {text += "<br> you have "+format(timed4)+" fourth time dimension"}
                if (timed5.gt(0)) {text += "<br> you have "+format(timed5)+" fifth time dimension"}
                if (timed6.gt(0)) {text += "<br> you have "+format(timed6)+" sixth time dimension"}
                if (timed7.gt(0)) {text += "<br> you have "+format(timed7)+" seventh time dimension"}
                if (timed8.gt(0)) {text += "<br> you have "+format(timed8)+" eighth time dimension"}


                return text
            }
        },
    },
    buyables: {
    },
    
    upgrades: {
        11: {
            title: "eternity upgrade 11",
            description: "raise fire upgrade 23 to 3",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(3)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        12: {
            title: "eternity upgrade 12",
            description: "raise prestige upgrade 11 by 7",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(7)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        13: {
            title: "eternity upgrade 13",
            description: "multiply infinity dimensions by (unspent eternity points +1)",
            cost: new Decimal(1),
            effect() {
                eff = player.et.points.add(1).max(1)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        14: {
            title: "eternity upgrade 14",
            description: "divide the cost of infinity buyables 11 to 13 by 1e50",
            cost: new Decimal(3),
            effect() {
                eff = new Decimal(1e50)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
        },
        21: {
            title: "eternity upgrade 21",
            description: "unlock time dimensions at 3 eternity points",
            cost: new Decimal(1),
            effect() {
                eff = timemult
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        22: {
            title: "eternity upgrade 22",
            description: "multiply infinity power conversion rate by 2",
            cost: new Decimal(1),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        23: {
            title: "eternity upgrade 23",
            description: "adds 30 seconds to total time",
            cost: new Decimal(3),
            effect() {
                effe = new Decimal(30)
                return effe
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        24: {
            title: "eternity upgrade 24",
            description: "divide the fire softcap strength by 1.33",
            cost: new Decimal(5),
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            unlocked() {return player.et.total.gte(1)}, 
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
        },
        31: {
            title: "eternity upgrade 31",
            description: "raise prestige gain to 1.1",
            cost: new Decimal(10),
            effect() {
                eff = new Decimal(1.1)
                return eff
            },
            unlocked() {return hasUpgrade('et', 24)}, 
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        32: {
            title: "eternity upgrade 32",
            description: "upgrades with effects depending on infinity points use infinity points ^4 in their calculations",
            cost: new Decimal(30),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            unlocked() {return hasUpgrade('et', 24)}, 
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        33: {
            title: "eternity upgrade 33",
            description: "multiply infinity power conversion rate by 1.5",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasUpgrade('et', 24)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        34: {
            title: "eternity upgrade 34",
            description: "multiply fire gain by 3",
            cost: new Decimal(1000),
            effect() {
                eff = new Decimal(3)
                return eff
            },
            unlocked() {return hasUpgrade('et', 24)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        41: {
            title: "eternity upgrade 41",
            description: "multiply infinity dimensions by 10000",
            cost: new Decimal(1e4),
            effect() {
                eff = new Decimal(10000)
                return eff
            },
            unlocked() {return hasUpgrade('et', 24)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        42: {
            title: "eternity upgrade 42",
            description: "multiply the fire softcap start by 1e20",
            cost: new Decimal(1e5),
            effect() {
                eff = new Decimal(1e20)
                return eff
            },
            unlocked() {return hasUpgrade('et', 24)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        43: {
            title: "eternity upgrade 43",
            description: "adds 30 seconds to total time",
            cost: new Decimal(1e7),
            effect() {
                effe = new Decimal(30)
                return effe
            },
            unlocked() {return hasUpgrade('et', 24)}, 
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        44: {
            title: "eternity upgrade 44",
            description: "always have peak time shards",
            cost: new Decimal(1e10),
            effect() {
                effe = new Decimal(1)
                return effe
            },
            unlocked() {return hasUpgrade('et', 24)}, 
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        51: {
            title: "eternity upgrade 51",
            description: "improve integral kinematics buyable effects to 1.33, 1.25, 1.5",
            cost: new Decimal(1e15),
            effect() {
                effe = new Decimal(1)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        52: {
            title: "eternity upgrade 52",
            description: "turn the hardcap in energy upgrade 21, 24 into a softcap",
            cost: new Decimal(1e20),
            effect() {
                effe = new Decimal(1)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        53: {
            title: "eternity upgrade 53",
            description: "divide the fire softcap strength by 1.5",
            cost: new Decimal(1e25),
            effect() {
                effe = new Decimal(1.5)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))},
        },
        54: {
            title: "eternity upgrade 54",
            description: "add 0.1 to the prestige buyable base",
            cost: new Decimal(1e30),
            effect() {
                effe = new Decimal(0.1)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        61: {
            title: "eternity upgrade 61",
            description: "add fire and infinity buyables 11, 12 effect by 0.05",
            cost: new Decimal(1e40),
            effect() {
                effe = new Decimal(0.05)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        62: {
            title: "eternity upgrade 62",
            description: "raise fire and infinity buyables 13 effect by 1.25",
            cost: new Decimal(1e50),
            effect() {
                effe = new Decimal(1.25)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
        },
        63: {
            title: "eternity upgrade 63",
            description: "improve tickspeed upgrade costs to 1.25x",
            cost: new Decimal(1e70),
            effect() {
                effe = new Decimal(1)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        64: {
            title: "eternity upgrade harmonized",
            description: "multiply fire gain by 3",
            cost: new Decimal(1e100),
            effect() {
                effe = new Decimal(3)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        71: {
            title: "eternity upgrade 71",
            description: "multiply fire and infinity buyables 11 amount by 2",
            cost: new Decimal(1e130),
            effect() {
                effe = new Decimal(2)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        72: {
            title: "eternity upgrade 72",
            description: "multiply fire and infinity buyables 12 amount by 1.5",
            cost: new Decimal(1e160),
            effect() {
                effe = new Decimal(1.5)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        73: {
            title: "eternity upgrade 73",
            description: "multiply fire buyable 13 amount by 1.25",
            cost: new Decimal(1e200),
            effect() {
                effe = new Decimal(1.25)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        74: {
            title: "eternity upgrade 74",
            description: "multiply infinity buyable 13 amount by 1.1",
            cost: new Decimal(1e250),
            effect() {
                effe = new Decimal(1.1)
                return effe
            },
            unlocked() {return hasUpgrade('et', 44)}, 
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
    }
})