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
        multik = new Decimal(1)
        if (hasUpgrade('e', 12)){multik = multik.add(upgradeEffect('e', 12))}

        if (hasUpgrade('p', 51)){multik = multik.add(upgradeEffect('p', 51))}

        ilnum = toNumber(player.il.points.add(0.1).trunc())
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
        
        addPoints("ik", player.points.add(getPointGen().times(diff)).pow(ilnum).sub(player.points.pow(ilnum)).div(factorial(ilnum)).times(multik))
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textik = "time is in seconds <br>"
                textik += "you have "+format(player.ik.total)+" total integral points <br>"
                textik += "you gain "+format(player.points.pow(ilnum - 1).div(factorial(ilnum - 1)).times(multik))+" integral points per second <br>"
                textik += "your integral point multiplier is "+format(multik)+"<br>"                
                textik += "your time integral is of layer "+format(ilnum)+"<br>"
                return textik
            }
        },
    },
    upgrades: {
        11: {
            title: "integral kinematics upgrade 11",
            description: "unlockes 3 integral kinematics upgrades",
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
                text =  "multiplies prestige point gain by (total ik points +1)^0.8"
                if (player.ik.total.gte(69)) text += "<br> (softcapped)"
                return text},
            cost: new Decimal(4),
            effect() {
                if (player.ik.total.gt(600.013578556)) {eff = player.ik.total.add(1).pow(0.5).times(4.8989240521204347)}
                else if (player.ik.total.gt(188.992434476)) {eff = player.ik.total.add(1).pow(0.6).times(2.5839529336166196)}
                else if (player.ik.total.gt(69.2104195796)) {eff = player.ik.total.add(1).pow(0.7).times(1.5298193747370034)}
                else {eff = player.ik.total.add(1).pow(0.8)}

                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 11)}
        },
        14: {
            title: "integral kinematics upgrade 14",
            description: "unlockes 4 integral kinematics upgrades",
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
            description: "multiplies prestige point gain by ( ik points +1)",
            cost: new Decimal(50),
            effect() {
                eff = player.ik.points.add(1)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
        },
        24: {
            title: "integral kinematics upgrade 24",
            description: "unlockes 4 integral kinematics upgrades",
            cost: new Decimal(1000),
            effect() {
                eff = Decimal.dOne
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 14)}
        },
        31: {
            title: "integral kinematics upgrade 31",
            description: "multiples prestige gain by 10^(-10*cos(time*pi))",
            cost: new Decimal(1000),
            effect() {
                eff = player.points.times(3.1415926535897932).cos().times(-10).pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        32: {
            title: "integral kinematics upgrade 32",
            description: "raises prestige upgrade 11 to 2, before softcaps",
            cost: new Decimal(2000),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return hasUpgrade('ik', 24)}
        },
        33: {
            title: "integral kinematics upgrade 33",
            description: "raises prestige upgrade 11 to 2, before softcaps",
            cost: new Decimal(3000),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
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
        if (hasUpgrade('e', 13)){multe = multe.add(upgradeEffect('e', 13))}

        if (hasUpgrade('p', 52)){multe = multe.add(upgradeEffect('p', 52))}
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
    layerShown(){return hasUpgrade('p', 44)||player.pw.total.gte(1)},
    update(diff) {
        
        addPoints("e", player.pw.points.times(multe).times(diff).times(getPointGen()))
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                texte = "you have "+format(player.e.total)+" total energy <br>"
                texte += "you gain "+format(player.pw.total.times(multe))+" energy per second <br>"
                return texte
            }
        },
    },
    upgrades: {
        11: {
            title: "energy upgrade 11",
            description: "multiplies prestige point gain by 10^(energy/10)",
            cost: new Decimal(2),
            effect() {
                eff = player.e.points.div(10).pow10()
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "energy upgrade 12",
            description: "adds base integral points gain by 0.1",
            cost: new Decimal(3),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        13: {
            title: "energy upgrade 13",
            description: "adds the power effect by 0.1",
            cost: new Decimal(3),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        14: {
            title: "energy upgrade 14",
            description: "raises prestige upgrade 21 effect by 5",
            cost: new Decimal(6),
            effect() {
                eff = new Decimal(5)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
    },
})

addLayer("f", {
    name: "fire", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
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
        multf = new Decimal(1)
        if (hasUpgrade('p', 64)){multf = multf.add(upgradeEffect('p', 64))} 

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
    layerShown(){return hasUpgrade('p', 64)||player.f.total.gt(1)},
    update(diff) {
        
        addPoints("f", player.f.points.times(multf.pow(getPointGen().times(diff)).sub(1)))
    },
    infoboxes: {
        A: {
            title: "General Information",
            body() {
                textf = "you have "+format(player.f.points)+" fire <br>"
                textf = "you have "+format(player.f.total)+" total fire <br>"
                textf += "you gain "+format(player.f.points.times(multf.sub(1)))+" fire per second <br>"
                return textf
            }
        },
    },
    upgrades: {
        11: {
            title: "fire upgrade 11",
            description: "multiply prestige upgrade 51 by 2",
            cost: new Decimal(2),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
        },
        12: {
            title: "fire upgrade 12",
            description: "multiply prestige upgrade 52 by 2",
            cost: new Decimal(2),
            effect() {
                eff = new Decimal(2)
                return eff
            },
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
            unlocked() {return true}
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
        if (hasUpgrade('ik', 31)){multp = multp.times(upgradeEffect('ik', 31))}

        if (hasUpgrade('e', 11)){multp = multp.times(upgradeEffect('e', 11))}

        if (hasUpgrade('p', 11)){multp = multp.times(upgradeEffect('p', 11))}
        if (hasUpgrade('p', 12)){multp = multp.times(upgradeEffect('p', 12))}
        if (hasUpgrade('p', 14)){multp = multp.times(upgradeEffect('p', 14))}
        if (hasUpgrade('p', 21)){multp = multp.times(upgradeEffect('p', 21))}
        if (hasUpgrade('p', 22)){multp = multp.times(upgradeEffect('p', 22))}
        if (hasUpgrade('p', 61)){multp = multp.times(upgradeEffect('p', 61))}
        if (hasUpgrade('p', 62)){multp = multp.times(upgradeEffect('p', 62))}
        multp = multp.times(buyableEffect('p', 11))
        
        return multp
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expp = new Decimal(1)
        return expp
    },
    getResetGain() {
        return player.points.max(1).log10().times(multp).pow(expp).floor().sub(player.p.total).max(0)
    },
    getNextAt() {
        nextp = player.p.total.add(getResetGain('p')).add(1)
        return nextp.root(expp).div(multp).pow10()
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
                if (logcostp11.gte(28)) logcostp11 = logcostp11.div(28).pow(3/2).times(28)

                return Decimal.pow(costbasep11, logcostp11).trunc()
            },
            effect(x) {
                effbasep11 = new Decimal(1.2)
                if (hasUpgrade('p', 34)){effbasep11 = effbasep11.add(upgradeEffect('p', 34))}
                if (hasUpgrade('p', 54)){effbasep11 = effbasep11.add(upgradeEffect('p', 54))}

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
        },
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
                if (hasUpgrade('ik', 32)){eff = eff.pow(upgradeEffect('ik', 32))}   
                if (hasUpgrade('ik', 33)){eff = eff.pow(upgradeEffect('ik', 33))}   
                scstrength = Decimal.dTen
                if (hasUpgrade('p', 32)){scstrength = scstrength.div(upgradeEffect('p', 32))}
                if (eff.gte(30)) eff = eff.div(30).root(scstrength).times(30)
                if (eff.gte(200)) eff = eff.div(200).root(2).times(200)
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
            description: "multiplies prestige point gain by (total ik points +1)^0.1",
            cost: new Decimal(400),
            effect() {
                eff = player.ik.total.add(1).pow(0.1)
                if (hasUpgrade('e', 14)){eff = eff.pow(upgradeEffect('e', 14))}
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
            description: "unlockes integral layers for integral kinematics, and 8 prestige upgrades",
            cost: new Decimal('8e4'),
            effect() {
                eff = new Decimal(1)
                return eff
            },
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        31: {
            title: "prestige upgrade 31",
            description: "raises prestige upgrade 11 effect by 1.5, after softcaps",
            cost: new Decimal('5e6'),
            effect() {
                eff = new Decimal(1.5)
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
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
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "/"+format(upgradeEffect(this.layer, this.id))}
        },
        33: {
            title: "prestige upgrade 33",
            description: "adds total time by 4",
            cost: new Decimal('3e8'),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        34: {
            title: "prestige upgrade 34",
            description: "adds prestige buyable 11 effect base by 0.1",
            cost: new Decimal('8e8'),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        41: {
            title: "prestige upgrade 41",
            description: "raises prestige upgrade 11 effect by 1.33, after softcaps",
            cost: new Decimal('2e9'),
            effect() {
                eff = new Decimal(4/3)
                return eff
            },
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        42: {
            title: "prestige upgrade 42",
            description: "raises prestige upgrade 11 effect by 1.66, after softcaps",
            cost: new Decimal('5e10'),
            effect() {
                eff = new Decimal(5/3)
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "^"+format(upgradeEffect(this.layer, this.id))}
        },
        43: {
            title: "prestige upgrade 43",
            description: "adds total time by 4",
            cost: new Decimal('1e12'),
            effect() {
                eff = new Decimal(4)
                return eff
            },
            unlocked() {return hasUpgrade('p', 24)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))}
        },
        44: {
            title: "prestige upgrade 44",
            description: "unlocks electricity, and 8 prestige upgrades",
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
            description: "adds base integral points gain by 0.1",
            cost: new Decimal('1e18'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('f', 11)) {eff = eff.times(upgradeEffect('f', 11))}
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        52: {
            title: "prestige upgrade 52",
            description: "adds the power effect by 0.1",
            cost: new Decimal('1e19'),
            effect() {
                eff = new Decimal(0.1)
                if (hasUpgrade('f', 12)) {eff = eff.times(upgradeEffect('f', 12))}
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        53: {
            title: "prestige upgrade 53",
            description: "adds total time by 6",
            cost: new Decimal('1e20'),
            effect() {
                eff = new Decimal(6)
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        54: {
            title: "prestige upgrade 54",
            description: "adds prestige buyable 11 effect by 0.1",
            cost: new Decimal('1e22'),
            effect() {
                eff = new Decimal(0.1)
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        61: {
            title: "prestige upgrade 61",
            description: "multiplies prestige point gain by log(total p points +11)^4",
            cost: new Decimal('5e23'),
            effect() {
                eff = player.p.total.add(11).log10().pow(4)
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        62: {
            title: "prestige upgrade 62",
            description: "multiplies prestige point gain by (p points +1)^0.1",
            cost: new Decimal('1e30'),
            effect() {
                eff = player.p.points.add(1).root(10)
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "x"+format(upgradeEffect(this.layer, this.id))},
        },
        63: {
            title: "prestige upgrade 63",
            description: "adds total time by 6 ",
            cost: new Decimal('1e33'),
            effect() {
                eff = new Decimal(6)
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
        64: {
            title: "prestige upgrade harmonized",
            description: "unlocks fire, and 8 prestige upgrades",
            cost: new Decimal('1e50'),
            effect() {
                eff = new Decimal(0.05)
                return eff
            },
            unlocked() {return hasUpgrade('p', 44)},
            effectDisplay() {return "+"+format(upgradeEffect(this.layer, this.id))},
        },
    },
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


        return multil
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        expil = new Decimal(1)
        return expil
    },
    getResetGain() {
        return player.p.points.max(37).log10().log(6).log(2).add(addil).times(multil).pow(expil).floor().sub(player.il.total)
    },
    getNextAt() {
        nextil = player.il.total.add(getResetGain('il')).add(1)
        return new Decimal(6).pow(Decimal.dTwo.pow(nextil.root(expil).div(multil).sub(addil))).pow10()
    },
    canReset() {return getResetGain('il').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('il'))+" integral layers. Next at "+format(getNextAt('il'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)

    layerShown(){return hasUpgrade('p', 24)||player.il.total.gte(2)},
    infoboxes: {
    },
    upgrades: {
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
    color: "#1A53FF",
    requires: new Decimal(0), // Can be a function that takes requirement increases into account
    resource: "power", // Name of prestige currency
    baseResource: "prestige points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    gainMult() { // Calculate the multiplier for main currency from bonuses
        addpw = new Decimal(0)

        multpw = new Decimal(1)


        return multpw
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exppw = new Decimal(1)
        return exppw
    },
    getResetGain() {
        return player.p.points.max(10000).log10().log(2).log(2).log(2).add(addpw).times(multpw).pow(exppw).floor().sub(player.pw.total)
    },
    getNextAt() {
        nextpw = player.pw.total.add(getResetGain('pw')).add(1)
        return Decimal.dTwo.pow(Decimal.dTwo.pow(Decimal.dTwo.pow(nextpw.root(exppw).div(multpw).sub(addpw)))).pow10()
    },
    canReset() {return getResetGain('pw').gte(0)},
    prestigeNotify() {return true},
    prestigeButtonText() {return "Reset for "+formatWhole(getResetGain('pw'))+" power. Next at "+format(getNextAt('pw'))+" prestige points" },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return hasUpgrade('p', 44)||player.pw.total.gte(1)},
    infoboxes: {
    },
    upgrades: {
    },
})