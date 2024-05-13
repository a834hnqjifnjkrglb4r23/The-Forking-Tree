addLayer("ik", {
    name: "integral kinematics", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "IK", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
    }},
    color: "#FFF8F0",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "integral points", // Name of prestige currency
    baseResource: "points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        multik = new Decimal(1)

        orderik = 1
        if (hasUpgrade('p', 24)){orderik = orderik + upgradeEffect('p', 24)}
        return multik
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expik = new Decimal(1)
        return expik
    },
    canReset() {return false},
    prestigeNotify() {return true},
    prestigeButtonText() {return "you cannot reset this layer" },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return true},
    update(diff) {
        
        addPoints("ik", player.points.add(getPointGen().times(diff)).pow(orderik).sub(player.points.pow(orderik)).div(factorial(orderik)))
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = "time is in seconds <br>"
                text += "you have "+formatWhole(player.ik.total)+" total integral points <br>"
                text += "your time integral is of order "+format(orderik)+"<br>"
                return text
            }
        },
    },
    upgrades: {
        11: {
            title: "integral kinematics upgrade 11",
            description: "unlocks integral kinematics upgrades 12 to 14",
            cost: Decimal.dTen,
            effect() {
                eff = new Decimal(3)
                return eff
            },
            effectDisplay() {return "+"+formatWhole(upgradeEffect(this.layer, this.id))}
        },
        12: {
            title: "integral kinematics upgrade 12",
            description: "multiplies prestige point gain by 1.2",
            cost: Decimal.dTwo,
            effect() {
                eff = new Decimal(1.2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 11)}
        },
        13: {
            title: "integral kinematics upgrade 13",
            description() { 
                text =  "multiplies prestige point gain by (total ik points +1)^0.66"
                if (player.ik.total.gte(163)) text += "<br> (softcapped)"
                return text},
            cost: new Decimal(4),
            effect() {
                eff = player.ik.total.add(1).pow(2/3)
                if (eff.gte(30)) eff = eff.div(30).pow(0.9).times(30)
                if (eff.gte(60)) eff = eff.div(60).pow(5/6).times(60)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 11)}
        },
        14: {
            title: "integral kinematics upgrade 14",
            description: "unlockes 4 upgrades",
            cost: new Decimal(100),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 11)}
        },
        21: {
            title: "integral kinematics upgrade 21",
            description: "multiplies prestige point gain by log(total p points +11)",
            cost: new Decimal(50),
            effect() {
                eff = player.p.total.add(11).log10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
        },
        22: {
            title: "integral kinematics upgrade 22",
            description: "multiplies prestige point gain by 10",
            cost: new Decimal(50),
            effect() {
                eff = Decimal.dTen
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
        },
        23: {
            title: "integral kinematics upgrade 23",
            description: "multiplies prestige point gain by (total ik points +1)^0.1)",
            cost: new Decimal(50),
            effect() {
                eff = player.ik.total.add(1).pow(0.1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
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
        if (hasUpgrade('ik', 12)){multp = multp.times(upgradeEffect('ik', 12))}
        if (hasUpgrade('ik', 13)){multp = multp.times(upgradeEffect('ik', 13))}
        if (hasUpgrade('ik', 21)){multp = multp.times(upgradeEffect('ik', 21))}
        if (hasUpgrade('ik', 22)){multp = multp.times(upgradeEffect('ik', 22))}
        if (hasUpgrade('ik', 23)){multp = multp.times(upgradeEffect('ik', 23))}

        if (hasUpgrade('p', 11)){multp = multp.times(upgradeEffect('p', 11))}
        if (hasUpgrade('p', 12)){multp = multp.times(upgradeEffect('p', 12))}
        if (hasUpgrade('p', 14)){multp = multp.times(upgradeEffect('p', 14))}
        if (hasUpgrade('p', 21)){multp = multp.times(upgradeEffect('p', 21))}
        if (hasUpgrade('p', 22)){multp = multp.times(upgradeEffect('p', 22))}
        multp = multp.times(buyableEffect('p', 11))
        
        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(1)
        return expp
    },
    getResetGain() {
        return Decimal.log10(player.points.max(1)).times(multp).pow(expp).floor().sub(player.p.total)
    },
    getNextAt() {
        nextp = player.p.total.add(getResetGain('p')).add(1)
        return Decimal.pow10(nextp.root(expp).div(multp))
    },
    canReset() {return getResetGain('p').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('p'))+" prestige points. Next at "+format(getNextAt('p'))+" points" },
    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for prestige points", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                text = "points will be sometimes referred to by their layer symbol; upgrades will be always referred to by their upgrade layer, row and column <br> log stands for log10, ln stands for loge, any other log base will be explicitly written out <br>"
                text += "you have "+formatWhole(player.p.total)+" total prestige points <br>"
                if (multp.gt(1)){text += "your prestige point gain multiplier is "+format(multp)+"<br>"}
                if (expp.gt(1)){text += "your prestige point gain exponent is "+format(expp)+"<br>"}
                return text
            }
        },
    },
    buyables: {
        11: {
            cost(x) {
                costbasep11 = Decimal.dTen

                logcostp11 = new Decimal(x).add(1)

                if (logcostp11.gte(10)) logcostp11 = logcostp11.div(10).pow(4/3).times(10)

                return Decimal.pow(costbasep11, logcostp11).trunc()
            },
            effect(x) {
                effbasep11 = new Decimal(1.2)
                if (hasUpgrade('p', 34)){effbasep11 = effbasep11.add(upgradeEffect('p', 34))}

                logeffp11 = new Decimal(x)

                return Decimal.pow(effbasep11, logeffp11)
            },
            title() { return "prestige buyable 11"},
            display() { return "multiplies your prestige point gain by "+format(effbasep11)+" <br> cost: "+format(this.cost())+" <br> owned: "+format(getBuyableAmount(this.layer, this.id))+" <br> effect: "+format(this.effect()) },
            canAfford() { return player[this.layer].points.gte(this.cost()) },
            buy() {
                player[this.layer].points = player[this.layer].points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
        }
    },
    upgrades: {
        11: {
            title: "prestige upgrade 11",
            description() { 
                text = "multiplies prestige point gain by log(total p points+20)^4"
                if (player.p.total.gte(199)) text += "<br> (softcapped)"
                return text},
            cost: Decimal.dOne,
            effect() {
                eff = player.p.total.add(20).log10().pow(4)
                scstrength = Decimal.dTen
                if (hasUpgrade('p', 32)){scstrength = scstrength.div(upgradeEffect('p', 32))}
                if (eff.gte(30)) eff = eff.div(30).root(scstrength).times(30)
                if (hasUpgrade('p', 31)){eff = eff.pow(upgradeEffect('p', 31))}    
                if (hasUpgrade('p', 41)){eff = eff.pow(upgradeEffect('p', 41))}    
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        12: {
            title: "prestige upgrade 12",
            description() { 
                text = "multiplies prestige point gain by log(total p points+12)^3"
                if (player.p.total.gte(130)) text += "<br> (softcapped)"
                return text},
            cost: Decimal.dTwo,
            effect() {
                eff = player.p.total.add(12).log10().pow(3)
                if (eff.gte(10)) eff = eff.log10().pow(0.75).pow10()
                if (hasUpgrade('p', 42)){eff = eff.pow(upgradeEffect('p', 42))}  
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
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        14: {
            title: "prestige upgrade 14",
            description() { 
                text = "multiplies prestige point gain by (total p points +1)^0.1"
                if (player.p.total.gte(1024)) text += "<br> (softcapped)"
                return text},
            cost: new Decimal(20),
            effect() {
                eff = player.p.total.add(1).pow(0.1)
                if (eff.gte(2)) eff = eff.log(2).add(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        21: {
            title: "prestige upgrade 21",
            description: "multiplies prestige point gain by (total i points +1)^0.1",
            cost: new Decimal(400),
            effect() {
                eff = player.ik.total.add(1).pow(0.1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        22: {
            title: "prestige upgrade 22",
            description: "multiplies prestige point gain by log(total p points+11)^0.75",
            cost: new Decimal(3000),
            effect() {
                eff = player.p.total.add(11).log10().pow(0.75)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))}
        },
        23: {
            title: "prestige upgrade 23",
            description: "adds total time by 2",
            cost: new Decimal(20000),
            effect() {
                eff = Decimal.dTwo
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        24: {
            title: "prestige upgrade 24",
            description: "adds the ik order by 1",
            cost: new Decimal('5e5'),
            effect() {
                eff = 1
                return eff
            },
            effectDisplay() {return "+"+upgradeEffect(this.layer, this.id)}
        },
        31: {
            title: "prestige upgrade 31",
            description: "raises prestige upgrade 11 effect to the power of 1.5, after softcaps",
            cost: new Decimal('5e6'),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        32: {
            title: "prestige upgrade 32",
            description: "divide prestige upgrade 11 softcap strength by 2",
            cost: new Decimal('5e7'),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))}
        },
        33: {
            title: "prestige upgrade 33",
            description: "adds total time by 4",
            cost: new Decimal('15e7'),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        34: {
            title: "prestige upgrade 34",
            description: "adds prestige buyable 11 effect base by 0.1",
            cost: new Decimal('3e8'),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        41: {
            title: "prestige upgrade 41",
            description: "raises prestige upgrade 11 effect to the power of 1.33, after softcaps",
            cost: new Decimal('8e8'),
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        42: {
            title: "prestige upgrade 42",
            description: "raises prestige upgrade 11 effect to the power of 1.67, after softcaps",
            cost: new Decimal('7e9'),
            effect() {
                eff = new Decimal(5/3)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        43: {
            title: "prestige upgrade 43",
            description: "adds total time by 4",
            cost: new Decimal('2e10'),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        44: {
            title: "prestige upgrade 44",
            description: "unlocks electricity",
            cost: new Decimal('1e15'),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
    },
})
