addLayer("u", {
    name: "Unnamed Points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "U", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 0, // Row the layer is in on the tree (0 is the first row)
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#ef27bf",
    hotkeys: [
        {key: "u", description: "Press U to do an Unnamed Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.points.gte(10) || player.u.unlocked},
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
    }},
    requires() { return new Decimal(10) }, // Can be a function that takes requirement increases into account
    resource: "Unnamed Points", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { // Prestige currency exponent
		exp = new Decimal(0.2)
        if(hasUpgrade("u", 13)) exp = exp.add(tmp.u.effect)
		return exp
	},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("u", 21)) mult = mult.times(tmp.u.upgrades[21].effect)
        if(hasUpgrade("u", 23)) mult = mult.times(tmp.u.upgrades[23].effect)
        if(hasUpgrade("u", 51)) mult = mult.times(tmp.u.upgrades[51].effect)
        if(hasUpgrade("p", 22)) mult = mult.times(tmp.p.upgrades[22].effect)
        mult = mult.times(tmp.u.buyables[13].effect)
        mult = mult.times(tmp.r.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
	effect() {
		eff = new Decimal(0)
        if(hasUpgrade("u", 13)) eff = eff.add(player.u.points.add(1).log10().add(1).log10().div(25))
        if(hasUpgrade("s", 15)) eff = eff.times(player.u.points.slog().add(2).pow(0.1))
        if(eff.gte(0.4)) eff = eff.add(0.6).log10().add(0.4)
		return eff
	},
	effectDescription() { return ( hasUpgrade("u", 13) ? ( hasUpgrade("s", 14) ? "Which Are Adding " + format(tmp.u.effect) + " To The Unnamed Point Gain Exponent And Multiplying Point Gain By " + format(tmp.u.effect.add(1).pow(tmp.u.buyables[11].effect.times(100))) + "x":"Which Are Adding " + format(tmp.u.effect) + " To The Unnamed Point Gain Exponent"):"") },
    passiveGeneration() { return hasUpgrade("qol", 11) },
    doReset(resettingLayer){
        let keep = []
        if(hasUpgrade("qol", 41)) keep.push("upgrades")
        if(hasUpgrade("qol", 51)) keep.push("buyables")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        11: {
            title: "Give It A Name",
            description: "Gain 1 point per second",
            cost() { return new Decimal(1) },
            unlocked() { return player.u.unlocked || hasUpgrade("u", 11) || player.s.unlocked },
        },
        12: {
            title: "C'mon It's Not That Hard",
            description: "Unnamed Points boost Point gain",
            cost() { return new Decimal(2) },
            unlocked() { return player.u.unlocked || hasUpgrade("u", 12) || player.s.unlocked },
            effect() { 
				eff = new Decimal(player.u.points.add(1).log10().add(1).pow(5)).add(1)
                if(hasUpgrade("u", 15)) eff = eff.times(player.u.points.pow(0.9))
                if(eff.gte("1e100000")) eff = eff.pow(0.25).times(new Decimal("1e75000"))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.u.upgrades[12].effect) + " to Point gain" },
        },
        13: {
            title: "Really You Can't Find Anything",
            description: "Give an effect to Unnamed Points",
            cost() { return new Decimal(10) },
            unlocked() { return player.u.unlocked || hasUpgrade("u", 13) || player.s.unlocked },
        },
        14: {
            title: "Fine, Just Don't Give It A Name",
            description: "Points boost their own gain",
            cost() { return new Decimal(25) },
            unlocked() { return player.u.unlocked || hasUpgrade("u", 14) || player.s.unlocked },
            effect() { 
				eff = new Decimal(player.points.pow(0.5)).add(1)
                if(hasUpgrade("s", 12)) eff = eff.pow(1.5)
                if(hasUpgrade("s", 34)) eff = eff.pow(13/12)
                limit = new Decimal(1000)
                limitScaling = new Decimal(2)
                if(hasUpgrade("u", 22)) limitScaling = limitScaling.times(1.5)
                if(hasUpgrade("s", 23)) limitScaling = limitScaling.times(tmp.s.upgrades[23].effect.div(100).add(1))
                if(hasUpgrade("a", 25)) limitScaling = limitScaling.times(tmp.a.upgrades[25].effect.div(100).add(1))
                scaling = new Decimal(0.2)
                if(hasUpgrade("u", 32)) scaling = scaling.times(0.9)
                if(hasUpgrade("u", 33)) scaling = scaling.times(0.9)
                if(hasUpgrade("u", 34)) scaling = scaling.times(0.9)
                if(hasUpgrade("u", 35)) scaling = scaling.times(0.9)
                if(hasUpgrade("a", 32)) scaling = scaling.times(new Decimal(1).minus(tmp.a.upgrades[32].effect))
                while(eff.gte(limit)) {
                    eff = eff.pow(new Decimal(1).minus(scaling)).times(limit.pow(scaling))
                    limit = limit.pow(limitScaling)
                    limitScaling = limitScaling.minus(limitScaling.log10()).max(1.01)
                }
                return eff
            },
            effectDisplay() { return "*"+format(tmp.u.upgrades[14].effect) + " to Point gain" },
        },
        15: {
            title: "You Need To Give It A Name ?",
            description: "Make C'mon It's Not That Hard's formula better",
            cost() { return new Decimal(100) },
            unlocked() { return player.u.unlocked || hasUpgrade("u", 15) || player.s.unlocked },
        },
        21: {
            title: "Boost",
            description: "Points boost Unnamed Point gain",
            cost() { return new Decimal(1000) },
            unlocked() { return hasUpgrade("u", 15) || hasUpgrade("u", 21) || player.s.unlocked },
            effect() { 
				eff = new Decimal(player.points.add(1).log10().pow(3)).add(1)
                return eff
            },
            effectDisplay() { return "*"+format(tmp.u.upgrades[21].effect) + " to Unnamed Point gain" },
        },
        22: {
            title: "Slow Down",
            description: "4th upgrade's scaling is slower",
            cost() { return new Decimal("1e21") },
            unlocked() { return player.s.best.gte(8) || hasUpgrade("u", 22) || player.p.unlocked },
        },
        23: {
            title: "A Little Bit Faster",
            description: "Unnamed Points boost their own gain",
            cost() { return new Decimal("1e170") },
            unlocked() { return hasUpgrade("s", 13) || hasUpgrade("u", 23) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.u.points.add(1).log10().pow(10)).add(1)
                return eff
            },
            effectDisplay() { return "*"+format(tmp.u.upgrades[23].effect) + " to Unnamed Point gain" },
        },
        24: {
            title: "Imma Buy Some Stuff",
            description: "Unlock Unnamed Point buyables based on Unnamed Points",
            cost() { return new Decimal("1e220") },
            unlocked() { return hasUpgrade("s", 14) || hasUpgrade("u", 24) || player.p.unlocked },
            effect() { 
				eff = new Decimal(0)
                if(player.u.points.gte(this.unlocks[0])) eff = eff.add(1)
                if(player.u.points.gte(this.unlocks[1])) eff = eff.add(1)
                if(player.u.points.gte(this.unlocks[2])) eff = eff.add(1)
                return eff
            },
            unlocks: [new Decimal("1e220"), new Decimal("1e390"), new Decimal("1e1940"), new Decimal(NaN)],
            effectDisplay() { return "Next one at " + format(this.unlocks[tmp.u.upgrades[24].effect.toNumber()]) + " Unnamed Points" },
        },
        25: {
            title: "Super-Duper Extreme-o Bonanza Fast",
            description: "Points generate faster based on Super Points",
            cost() { return new Decimal("1e269") },
            unlocked() { return hasUpgrade("s", 21) || hasUpgrade("u", 25) || player.p.unlocked },
            effect() { 
                eff = new Decimal(3).pow(player.s.points.pow(1.1))
                if(eff.gte("1e10000")) eff = eff.log10().pow(2500)
                return eff
            },
            effectDisplay() { return "*" + format(tmp.u.upgrades[25].effect) + " to Point gain" },
        },
        31: {
            title: "Unnamed Super Boost",
            description: "Unnamed Points reduce Super Point cost",
            cost() { return new Decimal("1e821") },
            unlocked() { return hasUpgrade("s", 23) || hasUpgrade("u", 31) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.u.points).pow(player.u.points.add(2).ssqrt().div(1000))
                return eff
            },
            effectDisplay() { return "/" + format(tmp.u.upgrades[31].effect) + " to Super Point cost" },
        },
        32: {
            title: "We Finally Found A Name",
            description: "Just kidding<br>4th upgrade's scaling is 10% weaker",
            cost() { return new Decimal("1e1795") },
            unlocked() { return hasUpgrade("a", 13) || hasUpgrade("u", 32) || player.p.unlocked },
        },
        33: {
            title: "Repetitive Upgrades",
            description: "4th upgrade's scaling is 10% weaker again",
            cost() { return new Decimal("1e4375") },
            unlocked() { return hasUpgrade("a", 21) || hasUpgrade("u", 33) || player.p.unlocked },
        },
        34: {
            title: "Want To Do The Same Thing Again ?",
            description: "4th upgrade's scaling is 10% weaker yet again",
            cost() { return new Decimal("1e4765") },
            unlocked() { return hasUpgrade("s", 25) || hasUpgrade("u", 34) || player.p.unlocked },
        },
        35: {
            title: "ARE YOU KIDDING ME ?",
            description: "4th upgrade's scaling is 10% weaker :)",
            cost() { return new Decimal("1e5140") },
            unlocked() { return hasUpgrade("u", 34) || hasUpgrade("u", 35) || player.p.unlocked },
        },
        41: {
            title: "One More Push",
            description: "Super Point effect finally gains an exponential term",
            cost() { return new Decimal("1e16310") },
            unlocked() { return hasUpgrade("u", 34) || hasUpgrade("u", 41) || player.p.unlocked },
        },
        42: {
            title: "Power Boost",
            description: "Unnamed Points divide Power cost",
            cost() { return new Decimal("1e23430") },
            unlocked() { return hasUpgrade("p", 13) || hasUpgrade("u", 42) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.u.points.add(1).log10().add(1).pow(75))
                if(hasUpgrade("u", 43)) eff = eff.pow(5.2)
                if(hasUpgrade("u", 44)) eff = eff.pow(695.2)
                return eff
            },
            effectDisplay() { return "/" + format(tmp.u.upgrades[42].effect) + " to Power cost" },
        },
        43: {
            title: "",
            description: "Now that's an unnamed upgrade<br>Previous upgrade is 420% stronger",
            cost() { return new Decimal("1e78078") },
            unlocked() { return hasUpgrade("s", 32) || hasUpgrade("u", 43) || player.r.unlocked },
        },
        44: {
            title: "I Am Immature",
            description: "Power Boost is 69420% stronger",
            cost() { return new Decimal("1e55760000") },
            unlocked() { return player.b.unlocked || hasUpgrade("u", 44) || player.r.unlocked },
        },
        45: {
            title: "Why Can't I Find Names :(",
            description: "Unnamed Points boost Hyper Point gain",
            cost() { return new Decimal("1e66666666") },
            unlocked() { return hasUpgrade("u", 44) || hasUpgrade("u", 45) || player.r.unlocked },
            effect() { 
				eff = new Decimal(10).pow(player.u.points.add(1).slog().pow(3))
                return eff
            },
            effectDisplay() { return "*" + format(tmp.u.upgrades[45].effect) + " to Hyper Point gain" },
        },
        51: {
            title: "Self-Boost",
            description: "Unnamed Points boost their own gain",
            cost() { return new Decimal("1e95000000") },
            unlocked() { return hasUpgrade("r", 11) || hasUpgrade("u", 51) },
            effect() { 
				eff = new Decimal(10).pow(player.u.points.add(1).log10().pow(0.9))
                return eff
            },
            effectDisplay() { return "*" + format(tmp.u.upgrades[51].effect) + " to Unnnamed Point gain" },
        },
    },
    buyables: {
        11: {
            title: "Unnamed Boost",
            display() {
                return "Exponentiate the second part of Unnamed Point effect by " + format(tmp.u.buyables[11].effect) + "<br>Cost : " + format(this.cost(getBuyableAmount("u", 11))) + " Unnamed Points"
            },
            unlocked() { return (hasUpgrade("u", 24) && tmp.u.upgrades[24].effect.gte(1)) || getBuyableAmount("u", 11).gte(1) },
            cost(x) {
                if(x.lt(250)) return new Decimal("1e220").times(new Decimal("1e25").pow(x.pow(1.25)))
                else if(x.lt(1000)) return new Decimal("1e220").times(new Decimal("1e25").pow(x.pow(x.div(10000).add(1.25))))
                else if(x.lt(1250)) return new Decimal("1e220").times(new Decimal("1e25").pow(x.pow(x.div(2500).add(1.25))))
                else return new Decimal("1e220").times(new Decimal("1e25").pow(x.pow(x.add(1.25))))
            },
            canAfford() { 
                return player.u.points.gte(this.cost(getBuyableAmount("u", 11))) 
            },
            buy() { 
                player.u.points = player.u.points.minus(this.cost(getBuyableAmount("u", 11)))
                setBuyableAmount("u", 11, getBuyableAmount("u", 11).add(1))
            },
            effect() { 
                eff = new Decimal(getBuyableAmount("u", 11).add(1).log10().add(1).pow(5))
                return eff
            }
        },
        12: {
            title: "Point Booster",
            display() {
                return "Multiply Point gain by " + format(tmp.u.buyables[12].effect) + "x<br>Cost : " + format(this.cost(getBuyableAmount("u", 12))) + " Unnamed Points"
            },
            unlocked() { return (hasUpgrade("u", 24) && tmp.u.upgrades[24].effect.gte(2)) || getBuyableAmount("u", 12).gte(1) },
            cost(x) {
                if(x.lt(250)) return new Decimal("1e390").times(new Decimal("1e3").pow(x.pow(1.6)))
                else if(x.lt(1000)) return new Decimal("1e390").times(new Decimal("1e3").pow(x.pow(x.div(10000).add(1.6))))
                else if(x.lt(1250)) return new Decimal("1e390").times(new Decimal("1e3").pow(x.pow(x.div(2500).add(1.6))))
                else return new Decimal("1e390").times(new Decimal("1e3").pow(x.pow(x.add(1.6))))
            },
            canAfford() { 
                return player.u.points.gte(this.cost(getBuyableAmount("u", 12))) 
            },
            buy() { 
                player.u.points = player.u.points.minus(this.cost(getBuyableAmount("u", 12)))
                setBuyableAmount("u", 12, getBuyableAmount("u", 12).add(1))
            },
            effect() { 
                eff = new Decimal("1e9").times(getBuyableAmount("u", 12).pow(0.4)).pow(getBuyableAmount("u", 12))
                eff = eff.max(1)
                return eff
            }
        },
        13: {
            title: "Unnamed Buyable",
            display() {
                return "Multiply Unnamed Point gain by " + format(tmp.u.buyables[13].effect) + "x<br>Cost : " + format(this.cost(getBuyableAmount("u", 13))) + " Unnamed Points"
            },
            unlocked() { return (hasUpgrade("u", 24) && tmp.u.upgrades[24].effect.gte(3)) || getBuyableAmount("u", 13).gte(1) },
            cost(x) {
                if(x.lt(250)) return new Decimal("1e1940").times(new Decimal("1e30").pow(x.pow(1.35)))
                else if(x.lt(1000)) return new Decimal("1e1940").times(new Decimal("1e30").pow(x.pow(x.div(10000).add(1.35))))
                else if(x.lt(1250)) return new Decimal("1e1940").times(new Decimal("1e30").pow(x.pow(x.div(2500).add(1.35))))
                else return new Decimal("1e1940").times(new Decimal("1e30").pow(x.pow(x.add(1.35))))
            },
            canAfford() { 
                return player.u.points.gte(this.cost(getBuyableAmount("u", 13))) 
            },
            buy() { 
                player.u.points = player.u.points.minus(this.cost(getBuyableAmount("u", 13)))
                setBuyableAmount("u", 13, getBuyableAmount("u", 13).add(1))
            },
            effect() { 
                eff = new Decimal("1e25").pow(getBuyableAmount("u", 13))
                return eff
            }
        },
    },
})
addLayer("s", {
    name: "Super Points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "S", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 1, // Row the layer is in on the tree (0 is the first row)
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["u"],
    color: "#70c600",
    hotkeys: [
        {key: "s", description: "Press S to do a Super Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.points.gte("1e20") || player.s.unlocked},
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
    }},
    requires() { return new Decimal("1e25") }, // Can be a function that takes requirement increases into account
    resource: "Super Points", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { // Prestige currency exponent
		exp = new Decimal(1.25)
        if(hasUpgrade("s", 31)) exp = exp.minus(tmp.s.upgrades[31].effect)
		return exp
	},
    base() {
        base = new Decimal(1000)
        if(hasUpgrade("s", 22)) base = base.minus(tmp.s.upgrades[22].effect)
        return base
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("u", 31)) mult = mult.div(tmp.u.upgrades[31].effect)
        if(hasUpgrade("s", 21)) mult = mult.div(tmp.s.upgrades[21].effect)
        if(hasUpgrade("s", 32)) mult = mult.div(tmp.s.upgrades[32].effect)
        mult = mult.div(tmp.p.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    directMult() { // Multiplier to layer's currency gain
        mult = new Decimal(1)
        if(hasUpgrade("s", 41)) mult = mult.times(tmp.s.upgrades[41].effect)
        if(hasUpgrade("b", 13)) mult = mult.times(tmp.b.upgrades[13].effect)
        if(hasUpgrade("r", 12)) mult = mult.times(tmp.r.upgrades[12].effect)
        return mult
    },
	effect() {
		eff = new Decimal(1)
        if(hasUpgrade("u", 41)) eff = eff.times(new Decimal(5).pow(player.s.points))
        if(hasUpgrade("s", 13)) eff = eff.times(player.s.points.add(1).pow(player.s.points.add(9).log10().add(2).pow(3.5)))
        else eff = eff.times(player.s.points.add(1).pow(player.s.points.add(9).log10().pow(3)))
        if(hasUpgrade("s", 24)) eff = eff.times(player.s.points.add(1).pow(player.s.points.add(99).log10().add(2).pow(4)))
        if(hasUpgrade("s", 25)) eff = eff.times(player.s.points.add(1).pow(300))
        eff = eff.pow(tmp.h.buyables[11].effect)
        if(eff.gte((hasUpgrade("a", 14) ? new Decimal("1e1000").pow(new Decimal(1).minus(tmp.a.upgrades[14].effect).pow(-1)):new Decimal("1e1000")))) eff = eff.log10().pow((hasUpgrade("a", 14) ? new Decimal(1000).times(new Decimal(1).minus(tmp.a.upgrades[14].effect).pow(-1)).div(new Decimal(1).minus(tmp.a.upgrades[14].effect).pow(-1).times(1000).log10()):new Decimal(1000/3)))
		return eff
	},
	effectDescription() { return "Which Are Multiplying Point Gain By " + format(tmp.s.effect) + "x" + ( tmp.s.effect.gte((hasUpgrade("a", 14) ? new Decimal("1e1000").pow(new Decimal(1).minus(tmp.a.upgrades[14].effect).pow(-1)):new Decimal("1e1000"))) ? " ( Softcapped )":"") },
    canBuyMax() { return hasUpgrade("qol", 31) },
    resetsNothing() { return hasUpgrade("qol", 21) },
    autoPrestige() { return hasUpgrade("qol", 12) },
    doReset(resettingLayer){
        let keep = []
        if(hasUpgrade("qol", 42)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        11: {
            title: "Super Boost",
            description: "Super Points boost Point gain",
            cost() { return new Decimal(2) },
            unlocked() { return player.s.unlocked || hasUpgrade("s", 11) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.s.points.add(1).pow(15)).add(1)
                return eff
            },
            effectDisplay() { return "*"+format(tmp.s.upgrades[11].effect) + " to Point gain" },
        },
        12: {
            title: "Points",
            description: "4th Unnamed Point upgrade is 50% stronger",
            cost() { return new Decimal(10) },
            unlocked() { return hasUpgrade("s", 11) || hasUpgrade("s", 12) || player.p.unlocked },
        },
        13: {
            title: "Better Effects Part 1",
            description: "Super Point effect uses a better formula",
            cost() { return new Decimal(15) },
            unlocked() { return hasUpgrade("s", 12) || hasUpgrade("s", 13) || player.p.unlocked },
        },
        14: {
            title: "Better Effects Part 2",
            description: "Unnamed Point effect also boost Point gain",
            cost() { return new Decimal(70) },
            unlocked() { return hasUpgrade("s", 13) || hasUpgrade("s", 14) || player.p.unlocked },
        },
        15: {
            title: "Better Effects Part 3",
            description: "Unnamed Point effect gains another term",
            cost() { return new Decimal(74) },
            unlocked() { return hasUpgrade("s", 14) || hasUpgrade("s", 15) || player.p.unlocked },
        },
        21: {
            title: "Super Synergy",
            description: "Super Points reduce their own cost",
            cost() { return new Decimal(80) },
            unlocked() { return hasUpgrade("s", 15) || hasUpgrade("s", 21) || player.p.unlocked },
            effect() { 
				eff = new Decimal(10).pow(player.s.points.pow(0.8))
                return eff
            },
            effectDisplay() { return "/"+format(tmp.s.upgrades[21].effect) + " to Super Point cost" },
        },
        22: {
            title: "Smaller Base",
            description: "Points reduce Super Point base",
            cost() { return new Decimal(115) },
            unlocked() { return hasUpgrade("s", 15) || hasUpgrade("s", 22) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.points.add(1).log10().pow(0.6)).min(900)
                return eff
            },
            effectDisplay() { return "-"+format(tmp.s.upgrades[22].effect) + " to Super Point base" },
        },
        23: {
            title: "Low Scale",
            description: "4th Unnamed Point upgrade's scaling is slower based on Super Points",
            cost() { return new Decimal(149) },
            unlocked() { return hasUpgrade("s", 15) || hasUpgrade("s", 23) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.s.points.add(9).log10().add(9).log10().pow(5)).times(10)
                return eff
            },
            effectDisplay() { return "+"+format(tmp.s.upgrades[23].effect) + "% slower scaling" },
        },
        24: {
            title: "Super Effect",
            description: "Super Point effect gains a term",
            cost() { return new Decimal(261) },
            unlocked() { return hasUpgrade("a", 13) || hasUpgrade("s", 24) || player.p.unlocked },
        },
        25: {
            title: "Out Of Ideas",
            description: "Super Point effect gains another term",
            cost() { return new Decimal(1050) },
            unlocked() { return hasUpgrade("s", 24) || hasUpgrade("s", 25) || player.p.unlocked },
        },
        31: {
            title: "Smaller Exponent",
            description: "Points reduce the Super Point cost exponent",
            cost() { return new Decimal(1220) },
            unlocked() { return hasUpgrade("u", 35) || hasUpgrade("s", 31) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.points.add(1).slog().div(100))
                return eff
            },
            effectDisplay() { return "-"+format(tmp.s.upgrades[31].effect) + " to the Super Point cost exponent" },
        },
        32: {
            title: "Cost Reduction",
            description: "Points divide Super Point cost",
            cost() { return new Decimal(9860) },
            unlocked() { return hasUpgrade("p", 13) || hasUpgrade("s", 32) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.points.add(1).pow(0.25))
                return eff
            },
            effectDisplay() { return "/"+format(tmp.s.upgrades[32].effect) + " to Super Point cost" },
        },
        33: {
            title: "I Dunno What This One's Called",
            description: "Super Points divide Power cost",
            cost() { return new Decimal(101860) },
            unlocked() { return hasUpgrade("s", 32) || hasUpgrade("s", 33) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.s.points.add(1).log10().add(1).pow(1250))
                return eff
            },
            effectDisplay() { return "/"+format(tmp.s.upgrades[33].effect) + " to Power cost" },
        },
        34: {
            title: "Points The Sequel",
            description: "Points is 25% stronger",
            cost() { return new Decimal(1500000) },
            unlocked() { return hasUpgrade("p", 22) || hasUpgrade("s", 34) || player.r.unlocked },
        },
        35: {
            title: "Superinflation",
            description: "Point gain is boosted by Super Points",
            cost() { return new Decimal(1700000) },
            unlocked() { return hasUpgrade("p", 22) || hasUpgrade("s", 35) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.s.points.slog().add(1).pow(0.75))
                return eff
            },
            effectDisplay() { return "^"+format(tmp.s.upgrades[35].effect) + " to Point gain" },
        },
        41: {
            title: "Superlative",
            description: "The best upgrade<br>Super Point gain is 1% higher for every QoL point",
            cost() { return new Decimal("3.5e9") },
            unlocked() { return hasUpgrade("b", 21) || hasUpgrade("s", 41) || player.r.unlocked },
            effect() { 
				eff = new Decimal(1.01).pow(player.qol.points.add(player.qol.spentPoints))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.s.upgrades[41].effect) + " to Super Point gain" },
        },
        42: {
            title: "WW91 IGp1 c3Qg d2Fz dGVk IHlv dXIg dGlt ZSA6 KQ==",
            description: "Power cost is cube-rooted",
            cost() { return new Decimal("1e11") },
            unlocked() { return hasUpgrade("r", 11) || hasUpgrade("s", 42) },
        },
    },
})
addLayer("a", {
    name: "Average Points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 1, // Row the layer is in on the tree (0 is the first row)
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["u"],
    color: "#3471d0",
    hotkeys: [
        {key: "a", description: "Press A to do an Average Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return player.u.points.gte("1e890") || player.a.unlocked},
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
    }},
    requires() { return new Decimal("1e895") }, // Can be a function that takes requirement increases into account
    resource: "Average Points", // Name of prestige currency
    baseResource: "Unnamed Points", // Name of resource prestige is based on
    baseAmount() {return player.u.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { // Prestige currency exponent
		exp = new Decimal(0.04)
        if(hasUpgrade("a", 22)) exp = exp.add(tmp.a.upgrades[22].effect)
		return exp
	},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("a", 12)) mult = mult.times(tmp.a.upgrades[12].effect)
        if(hasUpgrade("a", 13)) mult = mult.times(tmp.a.upgrades[13].effect)
        if(hasUpgrade("a", 33)) mult = mult.times(tmp.a.upgrades[33].effect)
        if(hasUpgrade("p", 11)) mult = mult.times(tmp.p.upgrades[11].effect)
        if(hasUpgrade("p", 12)) mult = mult.times(tmp.p.upgrades[12].effect)
        mult = mult.times(tmp.r.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
	effect() {
		eff = new Decimal(1)
		return eff
	},
	effectDescription() { return "" },
    passiveGeneration() { return hasUpgrade("qol", 13) },
    doReset(resettingLayer){
        let keep = []
        if(hasUpgrade("qol", 43)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        11: {
            title: "Not Good",
            description: "Average Points boost point gain",
            cost() { return new Decimal(1) },
            unlocked() { return player.a.unlocked || hasUpgrade("a", 11) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.a.points.add(9).log10().add(1).pow(30))
                if(hasUpgrade("a", 21)) eff = eff.pow(3)
                return eff
            },
            effectDisplay() { return "*"+format(tmp.a.upgrades[11].effect) + " to Point gain" },
        },
        12: {
            title: "Not Bad",
            description: "Average Points boost their own gain",
            cost() { return new Decimal(25) },
            unlocked() { return player.a.unlocked || hasUpgrade("a", 12) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.a.points.add(2).ssqrt().pow(2/3))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.a.upgrades[12].effect) + " to Average Point gain" },
        },
        13: {
            title: "Just Average",
            description: "Super Points boost Average Point gain",
            cost() { return new Decimal(1000) },
            unlocked() { return player.a.unlocked || hasUpgrade("a", 13) || player.p.unlocked },
            effect() { 
				eff = new Decimal(player.s.points.pow(1/3))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.a.upgrades[13].effect) + " to Average Point gain" },
        },
        14: {
            title: "Average Upgrade",
            description: "Average Points reduce the softcap on Super Point's effect",
            cost() { return new Decimal("1e40") },
            unlocked() { return hasUpgrade("s", 24) || hasUpgrade("a", 14) || player.p.unlocked },
            effect() { 
                eff = new Decimal(player.a.points.add(1).pow(0.001).minus(1))
                if(hasUpgrade("a", 15)) eff = eff.times(2)
                eff = new Decimal(1).div(eff.add(1))
				eff = new Decimal(1).minus(eff)
                if(!hasUpgrade("a", 31)) eff = eff.min(0.90)
                else eff = eff.pow(5000).min(0.95)
                return eff
            },
            effectDisplay() { return format(tmp.a.upgrades[14].effect.times(100)) + "% weaker softcap" },
        },
        15: {
            title: "Averager Upgrade",
            description: "Previous upgrade is twice as strong",
            cost() { return new Decimal("1e82") },
            unlocked() { return hasUpgrade("a", 14) || hasUpgrade("a", 15) || player.p.unlocked },
        },
        21: {
            title: "Averagest Upgrade",
            description: "Not Good is thrice as strong",
            cost() { return new Decimal("1e122") },
            unlocked() { return hasUpgrade("a", 14) || hasUpgrade("a", 21) || player.p.unlocked },
        },
        22: {
            title: "Averagester Upgrade",
            description: "Average Point gain exponent is boosted by Super Points",
            cost() { return new Decimal("1e163") },
            unlocked() { return hasUpgrade("s", 25) || hasUpgrade("a", 22) || player.p.unlocked },
            effect() { 
                eff = new Decimal(player.s.points.add(1).slog().pow((hasUpgrade("a", 23) ? (hasUpgrade("a", 24) ? 5:3):2)).div(1000))
                return eff
            },
            effectDisplay() { return "+" + format(tmp.a.upgrades[22].effect) + " to the Averge Point gain exponent" },
        },
        23: {
            title: "Averagerester Upgrade",
            description: "Previous upgrade is 50% stronger",
            cost() { return new Decimal("1e250") },
            unlocked() { return hasUpgrade("s", 25) || hasUpgrade("a", 23) || player.p.unlocked },
        },
        24: {
            title: "Ok I'll Stop",
            description: "Previous upgrade is 200% stronger",
            cost() { return new Decimal("1e270") },
            unlocked() { return hasUpgrade("a", 23) || hasUpgrade("a", 24) || player.p.unlocked },
        },
        25: {
            title: "Boost It Again",
            description: "4th Unnamed Point Upgrade's scaling is slower based on Average Points",
            cost() { return new Decimal("1e1234") },
            unlocked() { return hasUpgrade("p", 13) || hasUpgrade("a", 25) || player.r.unlocked },
            effect() { 
                eff = new Decimal(0.99975).pow(player.a.points.add(1).log10().times(-1))
                if(eff.gt(2)) eff = new Decimal(2)
                eff = eff.times(100).minus(100)
                return eff
            },
            effectDisplay() { return "+" + format(tmp.a.upgrades[25].effect) + "% slower scaling" },
        },
        31: {
            title: "Average Upgrade 2.0",
            description: "Average Upgrade's effect can now go up to 95%, but is weaker",
            cost() { return new Decimal("1e4385") },
            unlocked() { return hasUpgrade("s", 32) || hasUpgrade("a", 31) || player.r.unlocked },
        },
        32: {
            title: "Another Average Upgrade",
            description: "4th Unnamed Point upgrade's scaling is weaker based on Average Points",
            cost() { return new Decimal("1e30000") },
            unlocked() { return hasUpgrade("h", 21) || hasUpgrade("a", 32) || player.r.unlocked },
            effect() { 
                eff = new Decimal(player.a.points.add(1).log10().pow(1/6).min(10).div(100))
                return eff
            },
            effectDisplay() { return "+" + format(tmp.a.upgrades[32].effect.times(100)) + "% weaker scaling" },
        },
        33: {
            title: "Yet Another Average Upgrade",
            description: "Unnamed Points boost Average Point gain",
            cost() { return new Decimal("1e3918000") },
            unlocked() { return hasUpgrade("b", 21) || hasUpgrade("a", 33) || player.r.unlocked },
            effect() { 
                eff = new Decimal(player.u.points.add(1).log10().pow(65536))
                return eff
            },
            effectDisplay() { return "*" + format(tmp.a.upgrades[33].effect) + " to Average Point gain" },
        },
        34: {
            title: "Meh",
            description: "Average Points boost Bonus Point gain",
            cost() { return new Decimal("1e12000000") },
            unlocked() { return hasUpgrade("r", 11) || hasUpgrade("a", 34) },
            effect() { 
                eff = new Decimal(player.a.points.add(1).log10().add(1))
                return eff
            },
            effectDisplay() { return "*" + format(tmp.a.upgrades[34].effect) + " to Bonus Point gain" },
        },
    },
})
addLayer("p", {
    name: "Power", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 2, // Row the layer is in on the tree (0 is the first row)
    position: 2, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["a"],
    color: "#781a7c",
    hotkeys: [
        {key: "p", description: "Press P to do a Power Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("u", 41) || player.p.unlocked},
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
    }},
    requires() { return new Decimal("1e1122") }, // Can be a function that takes requirement increases into account
    resource: "Power", // Name of prestige currency
    baseResource: "Average Points", // Name of resource prestige is based on
    baseAmount() {return player.a.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { // Prestige currency exponent
		exp = new Decimal(3.5)
		return exp
	},
    base() {
        base = new Decimal("1e5")
        return base
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("u", 42)) mult = mult.div(tmp.u.upgrades[42].effect)
        if(hasUpgrade("s", 33)) mult = mult.div(tmp.s.upgrades[33].effect)
        if(hasUpgrade("p", 21)) mult = mult.div(tmp.p.upgrades[21].effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        if(hasUpgrade("s", 42)) exp = exp.times(3)
        return exp
    },
    directMult() { // Multiplier to layer's currency gain
        mult = new Decimal(1)
        if(hasUpgrade("p", 23)) mult = mult.times(tmp.p.upgrades[23].effect)
        if(hasUpgrade("p", 24)) mult = mult.times(tmp.p.upgrades[24].effect)
        if(hasUpgrade("r", 13)) mult = mult.times(tmp.r.upgrades[13].effect)
        return mult
    },
	effect() {
		eff = new Decimal(1)
        eff = eff.times(new Decimal("1e200").pow(player.p.points.pow(0.99)))
        return eff
	},
	effectDescription() { return "Which Are Dividing Super Point Cost By " + format(tmp.p.effect) + "x And Multiplying Point Gain By " + format(new Decimal(10).pow(tmp.p.effect.add(3).ssqrt().minus(2))) + "x"},
    canBuyMax() { return hasUpgrade("qol", 32) },
    resetsNothing() { return hasUpgrade("qol", 22) },
    autoPrestige() { return hasUpgrade("qol", 14) },
    doReset(resettingLayer){
        let keep = []
        if(hasUpgrade("qol", 44)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        11: {
            title: "Power",
            description: "Power boosts Average Point gain",
            cost() { return new Decimal(2) },
            unlocked() { return player.p.unlocked || hasUpgrade("p", 11) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.p.points.add(2).pow(player.p.points.add(4).ssqrt().add(2).times(5)))
                if(eff.gte("1e1000000")) eff = eff.log10().pow(1000000/6)
                return eff
            },
            effectDisplay() { return "*"+format(tmp.p.upgrades[11].effect) + " to Average Point gain" },
        },
        12: {
            title: "Super Power",
            description: "Super Points boosts Average Point gain",
            cost() { return new Decimal(2) },
            unlocked() { return hasUpgrade("p", 11) || hasUpgrade("p", 12) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.s.points.pow(player.s.points.pow(2).add(2).ssqrt())).add(1)
                if(hasUpgrade("p", 13)) eff = eff.pow(2)
                if(eff.gte("1e1000000")) eff = eff.log10().pow(1000000/6)
                return eff
            },
            effectDisplay() { return "*"+format(tmp.p.upgrades[12].effect) + " to Average Point gain" },
        },
        13: {
            title: "Mega Power",
            description: "Previous upgrade is squared",
            cost() { return new Decimal(3) },
            unlocked() { return hasUpgrade("p", 11) || hasUpgrade("p", 13) || player.r.unlocked },
        },
        14: {
            title: "Overpowered Points",
            description: "Power boosts Point Gain",
            cost() { return new Decimal(7) },
            unlocked() { return player.p.best.gte(4) || hasUpgrade("p", 14) || player.r.unlocked },
            effect() { 
				eff = new Decimal("1e69").pow(player.p.points.pow(2))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.p.upgrades[14].effect) + " to Point gain" },
        },
        15: {
            title: "QoL Power",
            description: "Total QoL Points boost Point gain",
            cost() { return new Decimal(9) },
            unlocked() { return hasUpgrade("p", 14) || hasUpgrade("p", 15) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.qol.points.add(player.qol.spentPoints))
                tetr = new Decimal(2)
                if(hasUpgrade("h", 12)) tetr = tetr.add(0.125)
                if(hasUpgrade("h", 13)) tetr = tetr.add(0.0625)
                eff = eff.tetrate(tetr)
                return eff
            },
            effectDisplay() { return "*"+format(tmp.p.upgrades[15].effect) + " to Point gain" },
        },
        21: {
            title: "Hyper Power",
            description: "Hyper Points and Power divides Power cost",
            cost() { return new Decimal(10) },
            unlocked() { return hasUpgrade("h", 21) || hasUpgrade("p", 21) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.h.points).pow(player.p.points.times(100)).add(1)
                return eff
            },
            effectDisplay() { return "/"+format(tmp.p.upgrades[21].effect) + " to Power cost" },
        },
        22: {
            title: "The Power Of Tetration",
            description: "Power^^2.5 boosts Unnamed Point gain",
            cost() { return new Decimal(15) },
            unlocked() { return hasUpgrade("h", 21) || hasUpgrade("p", 22) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.p.points).tetrate(2.5).add(1)
                if(eff.gte("1e100000")) eff = eff.log10().times(new Decimal("1e99995"))
                if(eff.gte("1e1000000")) eff = eff.log10().times(new Decimal("1e999994"))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.p.upgrades[22].effect) + " to Unnamed Point gain" },
        },
        23: {
            title: "Extra Power",
            description: "Gain 10% more Power for every OoM of Power",
            cost() { return new Decimal(50) },
            unlocked() { return hasUpgrade("b", 21) || hasUpgrade("p", 23) || player.r.unlocked },
            effect() { 
				eff = new Decimal(1.1).pow(player.p.points.add(1).log10())
                return eff
            },
            effectDisplay() { return "*"+format(tmp.p.upgrades[23].effect) + " to Power gain" },
        },
        24: {
            title: "Free Power",
            description: "596F 7520 6C69 6B65 2074 6F20 7761 7374 6520 796F 7572 2074 696D 6520 646F 6E27 7420 796F 7520 3F<br>Power boosts Power gain again",
            cost() { return new Decimal(142) },
            unlocked() { return hasUpgrade("r", 13) || hasUpgrade("p", 24) },
            effect() { 
				eff = new Decimal(player.p.points.add(1).log10().add(1).pow(0.125))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.p.upgrades[24].effect) + " to Power gain" },
        },
        25: {
            title: "Even More Power",
            description: "Power divides Reset cost",
            cost() { return new Decimal(169) },
            unlocked() { return hasUpgrade("r", 13) || hasUpgrade("p", 25) },
            effect() { 
				eff = new Decimal(player.p.points.add(1).pow(9))
                return eff
            },
            effectDisplay() { return "/"+format(tmp.p.upgrades[25].effect) + " to Reset cost" },
        },
    },
})
addLayer("h", {
    name: "Hyper Points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 2, // Row the layer is in on the tree (0 is the first row)
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["s"],
    color: "#effda6",
    hotkeys: [
        {key: "h", description: "Press H to do an Hyper Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("p", 15) || player.h.unlocked},
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
    }},
    requires() { return new Decimal(100000) }, // Can be a function that takes requirement increases into account
    resource: "Hyper Points", // Name of prestige currency
    baseResource: "Super Points", // Name of resource prestige is based on
    baseAmount() {return player.s.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { // Prestige currency exponent
		exp = new Decimal(4)
		return exp
	},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("u", 45)) mult = mult.times(tmp.u.upgrades[45].effect)
        if(hasUpgrade("h", 14)) mult = mult.times(tmp.h.upgrades[14].effect)
        if(hasUpgrade("b", 14)) mult = mult.times(tmp.b.upgrades[14].effect)
        if(hasUpgrade("h", 15)) mult = mult.times(tmp.h.upgrades[15].effect)
        if(hasUpgrade("h", 31)) mult = mult.times(tmp.h.upgrades[31].effect)
        mult = mult.times(tmp.h.buyables[12].effect)
        mult = mult.times(tmp.b.effect)
        mult = mult.times(tmp.r.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
	effect() {
		eff = new Decimal(1)
        if(hasUpgrade("h", 11)) eff = eff.times(player.h.points.add(2).pow(10000))
		return eff
	},
	effectDescription() { return (hasUpgrade("h", 11) ? "Which Are Multiplying Point Gain By " + format(tmp.h.effect) + "x":"") },
    passiveGeneration() { return hasUpgrade("qol", 15) },
    doReset(resettingLayer){
        let keep = []
        if(hasUpgrade("qol", 45)) keep.push("upgrades")
        if(hasUpgrade("qol", 52)) keep.push("buyables")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        11: {
            title: "Hyper",
            description: "Hyper Points gain an effect",
            cost() { return new Decimal(1) },
            unlocked() { return player.h.unlocked || hasUpgrade("h", 11) || player.r.unlocked },
        },
        12: {
            title: "QoL Power Bis",
            description: "QoL Power Formula is better",
            cost() { return new Decimal(5) },
            unlocked() { return player.h.unlocked || hasUpgrade("h", 12) || player.r.unlocked },
        },
        13: {
            title: "QoL Power Ter",
            description: "Previous upgrade is 50% better",
            cost() { return new Decimal(10) },
            unlocked() { return hasUpgrade("h", 12) || hasUpgrade("h", 13) || player.r.unlocked },
        },
        14: {
            title: "Hyper Boost",
            description: "Super Points boost Hyper Point gain",
            cost() { return new Decimal(25) },
            unlocked() { return hasUpgrade("h", 13) || hasUpgrade("h", 14) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.s.points.add(1).log10().add(1))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.h.upgrades[14].effect) + " to Hyper Point gain" },
        },
        15: {
            title: "Hyper Synergy",
            description: "Hyper Points boost Hyper Point gain",
            cost() { return new Decimal(100) },
            unlocked() { return hasUpgrade("h", 13) || hasUpgrade("h", 15) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.h.points.add(1).log10().add(1).pow(4))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.h.upgrades[15].effect) + " to Hyper Point gain" },
        },
        21: {
            title: "Hyper Buyable",
            description: "Unlock an Hyper Point buyable",
            cost() { return new Decimal(100000) },
            unlocked() { return hasUpgrade("h", 15) || hasUpgrade("h", 21) || player.r.unlocked },
        },
        22: {
            title: "Hyper Buyable Part 2",
            description: "The scaling of the Hyper Point buyable is 40% weaker",
            cost() { return new Decimal(250000) },
            unlocked() { return hasUpgrade("p", 21) || hasUpgrade("h", 22) || player.r.unlocked },
        },
        23: {
            title: "Hyper Buyable Part 3",
            description: "Unlock another Hyper Point buyable",
            cost() { return new Decimal("1e57") },
            unlocked() { return hasUpgrade("b", 21) || hasUpgrade("h", 23) || player.r.unlocked },
        },
        24: {
            title: "Hyper Buyable Part 4",
            description: "Hyperoperator is a billion times cheaper",
            cost() { return new Decimal("1e58") },
            unlocked() { return hasUpgrade("h", 23) || hasUpgrade("h", 24) || player.r.unlocked },
        },
        25: {
            title: "Hyperinflation",
            description: "Super Points boost Bonus Point gain",
            cost() { return new Decimal("1e140") },
            unlocked() { return hasUpgrade("u", 45) || hasUpgrade("h", 25) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.s.points.add(1).pow(1.1))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.h.upgrades[25].effect) + " to Bonus Point gain" },
        },
        31: {
            title: "Hyperactive",
            description: "Average Points Boost Hyper Point gain",
            cost() { return new Decimal("1e380") },
            unlocked() { return hasUpgrade("r", 11) || hasUpgrade("h", 31) },
            effect() { 
				eff = new Decimal(player.a.points.add(1).log10().add(1).pow(2.5))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.h.upgrades[31].effect) + " to Hyper Point gain" },
        },
    },
    buyables: {
        11: {
            title: "Tetrated Boost",
            display() {
                return "Exponentiate Super Point's effect ( before softcap ) by " + format(tmp.h.buyables[11].effect) + "<br>Cost : " + format(this.cost(getBuyableAmount("h", 11))) + " Hyper Points"
            },
            unlocked() { return hasUpgrade("h", 21) || getBuyableAmount("h", 11).gte(1) },
            cost(x) { 
                if(hasUpgrade("h", 22)) return new Decimal(10000).tetrate(x.times(0.01).times(3/5).add(1))
                else return new Decimal(10000).tetrate(x.times(0.01).add(1))
            },
            canAfford() { 
                return player.h.points.gte(this.cost(getBuyableAmount("h", 11))) 
            },
            buy() { 
                player.h.points = player.h.points.minus(this.cost(getBuyableAmount("h", 11)))
                setBuyableAmount("h", 11, getBuyableAmount("h", 11).add(1))
            },
            effect() { 
                if(getBuyableAmount("h", 11).gte(200)) eff = new Decimal(2.5).pow(getBuyableAmount("h", 11)).tetrate(1.4)
                if(getBuyableAmount("h", 11).gte(50)) eff = new Decimal(2.5).pow(getBuyableAmount("h", 11)).tetrate(getBuyableAmount("h", 11).times(0.001).add(1.2))
                else eff = new Decimal(2.5).pow(getBuyableAmount("h", 11)).tetrate(getBuyableAmount("h", 11).times(0.005).add(1))
                return eff
            }
        },
        12: {
            title: "Hyperoperator",
            display() {
                return "Boost Hyper Point gain by " + format(tmp.h.buyables[12].effect) + "<br>Cost : " + format(this.cost(getBuyableAmount("h", 12))) + " Hyper Points"
            },
            unlocked() { return hasUpgrade("h", 23) || getBuyableAmount("h", 12).gte(1) },
            cost(x) { 
                return new Decimal((hasUpgrade("h", 24) ? "1e46":"1e55")).times(new Decimal(1.1).pow(x.pow(1.5)))
            },
            canAfford() { 
                return player.h.points.gte(this.cost(getBuyableAmount("h", 12))) 
            },
            buy() { 
                player.h.points = player.h.points.minus(this.cost(getBuyableAmount("h", 12)))
                setBuyableAmount("h", 12, getBuyableAmount("h", 12).add(1))
            },
            effect() { 
                exp = new Decimal(1.25)
                if(hasUpgrade("b", 22)) exp = exp.add(0.15)
                if(hasUpgrade("b", 23)) exp = exp.add(0.05)
                eff = new Decimal(1.1).pow(getBuyableAmount("h", 12).pow(exp))
                return eff
            }
        },
    },
})
addLayer("b", {
    name: "Bonus Points", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 2, // Row the layer is in on the tree (0 is the first row)
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["u", "s", "a"],
    color: "#b74119",
    hotkeys: [
        {key: "b", description: "Press B to do a Bonus Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("s", 35) || player.b.unlocked},
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
    }},
    requires() { return new Decimal("1e4500000") }, // Can be a function that takes requirement increases into account
    resource: "Bonus Points", // Name of prestige currency
    baseResource: "Unnamed Points", // Name of resource prestige is based on
    baseAmount() {return player.u.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { // Prestige currency exponent
		exp = new Decimal(0.0000001)
		return exp
	},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("a", 34)) mult = mult.times(tmp.a.upgrades[34].effect)
        if(hasUpgrade("h", 25)) mult = mult.times(tmp.h.upgrades[25].effect)
        if(hasUpgrade("b", 15)) mult = mult.times(tmp.b.upgrades[15].effect)
        if(hasUpgrade("b", 21)) mult = mult.times(tmp.b.upgrades[21].effect)
        if(hasUpgrade("r", 11)) mult = mult.times(tmp.r.upgrades[11].effect)
        mult = mult.times(tmp.r.effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
	effect() {
		eff = new Decimal(1)
        if(hasUpgrade("b", 11)) eff = eff.times(player.b.points.add(1).log10().add(1).pow(15))
		return eff
	},
	effectDescription() { return (hasUpgrade("b", 11) ? "Which Are Multiplying Hyper Point Gain By " + format(tmp.b.effect) + "x":"") },
    passiveGeneration() { return hasUpgrade("qol", 16) },
    doReset(resettingLayer){
        let keep = []
        if(hasUpgrade("qol", 46)) keep.push("upgrades")
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        11: {
            title: "Bonus",
            description: "Unlock an effect for Bonus Points",
            cost() { return new Decimal(5) },
            unlocked() { return player.b.unlocked || hasUpgrade("b", 11) || player.r.unlocked },
        },
        12: {
            title: "Another Bonus",
            description: "Bonus Points boost Point gain",
            cost() { return new Decimal(10) },
            unlocked() { return player.b.unlocked || hasUpgrade("b", 12) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.b.points).tetrate(2.25).add(1)
                if(eff.gte("1e1000000")) eff = eff.log10().pow(1000000/6)
                if(eff.gte("1e10000000")) eff = eff.log10().pow(10000000/7)
                return eff
            },
            effectDisplay() { return "*"+format(tmp.b.upgrades[12].effect) + " to Point gain" },
        },
        13: {
            title: "Super Bonus",
            description: "Bonus Points boost Super Point gain",
            cost() { return new Decimal(25) },
            unlocked() { return hasUpgrade("b", 12) || hasUpgrade("b", 13) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.b.points.slog().add(2).pow(0.4))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.b.upgrades[13].effect) + " to Super Point gain" },
        },
        14: {
            title: "Hyper Bonus",
            description: "Bonus Points boost Hyper Point gain",
            cost() { return new Decimal(50) },
            unlocked() { return hasUpgrade("b", 13) || hasUpgrade("b", 14) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.b.points.add(1).log10().add(1).pow(5))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.b.upgrades[14].effect) + " to Hyper Point gain" },
        },
        15: {
            title: "Finally",
            description: "Bonus Points boost Bonus Point gain",
            cost() { return new Decimal(75) },
            unlocked() { return hasUpgrade("b", 14) || hasUpgrade("b", 15) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.b.points.add(1).log10().add(1).pow(2.5))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.b.upgrades[15].effect) + " to Bonus Point gain" },
        },
        21: {
            title: "The Best Bonus",
            description: "All row 3 and under non-static layers currencies boosts Bonus Point gain",
            cost() { return new Decimal(500) },
            unlocked() { return hasUpgrade("b", 15) || hasUpgrade("b", 21) || player.r.unlocked },
            effect() { 
				eff = new Decimal(player.u.points.add(1).log10().times(player.a.points.add(1).log10()).times(player.h.points.add(1).log10()).times(player.b.points.add(1).log10()).add(1).pow(1/3))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.b.upgrades[21].effect) + " to Bonus Point gain" },
        },
        22: {
            title: "Bonus Exponent",
            description: "2nd Hyper Point buyable's effect exponent is 0.15 higher",
            cost() { return new Decimal("1e16") },
            unlocked() { return hasUpgrade("h", 24) || hasUpgrade("b", 22) || player.r.unlocked },
        },
        23: {
            title: "Exponential Bonus",
            description: "2nd Hyper Point buyable's effect exponent is 0.05 higher",
            cost() { return new Decimal("1e62") },
            unlocked() { return hasUpgrade("r", 11) || hasUpgrade("b", 23) },
        },
    },
})
addLayer("r", {
    name: "Resets", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "R", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 3, // Row the layer is in on the tree (0 is the first row)
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    branches: ["h", "b", "p"],
    color: "#fc9e0a",
    hotkeys: [
        {key: "r", description: "Press R to do a Reset Reset", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return hasUpgrade("h", 25) || player.r.unlocked},
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
        best: new Decimal(0),
        total: new Decimal(0),
        first: 0,
        auto: false,
        pseudoUpgs: [],
    }},
    requires() { return new Decimal("1e30") }, // Can be a function that takes requirement increases into account
    resource: "Resets", // Name of prestige currency
    baseResource: "Bonus Points", // Name of resource prestige is based on
    baseAmount() {return player.b.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { // Prestige currency exponent
		exp = new Decimal(1.6)
		return exp
	},
    base() {
        base = new Decimal(16)
        return base
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        if(hasUpgrade("p", 25)) mult = mult.div(tmp.p.upgrades[25].effect)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
	effect() {
		eff = new Decimal(1)
        eff = eff.times(new Decimal(1000).pow(player.r.points))
		return eff
	},
	effectDescription() { return "Which Are Boosting All Previous Non-Static Layers' Gain By " + format(tmp.r.effect) + "x" },
    doReset(resettingLayer){
        let keep = []
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
    upgrades: {
        11: {
            title: "QoL Reset",
            description: "Gain 20 bonus QoL Points and QoL Points boost Bonus Point gain",
            cost() { return new Decimal(5) },
            unlocked() { return player.r.unlocked || hasUpgrade("r", 11) },
            effect() { 
				eff = new Decimal(player.qol.points.add(player.qol.spentPoints).pow(2))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.r.upgrades[11].effect) + " to Bonus Point gain" },
        },
        12: {
            title: "I Want This Upgrade",
            description: "Gain another 20 QoL Points and Power boosts Super Point gain",
            cost() { return new Decimal(10) },
            unlocked() { return hasUpgrade("r", 11) || hasUpgrade("r", 12) },
            effect() { 
				eff = new Decimal(player.p.points.add(1).pow(0.1))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.r.upgrades[12].effect) + " to Super Point gain" },
        },
        13: {
            title: "I Need This Upgrade",
            description: "Resets boost Power gain",
            cost() { return new Decimal(12) },
            unlocked() { return hasUpgrade("r", 12) || hasUpgrade("r", 13) },
            effect() { 
				eff = new Decimal(player.r.points.add(1).log10().add(1).pow(0.1))
                return eff
            },
            effectDisplay() { return "*"+format(tmp.r.upgrades[13].effect) + " to Power gain" },
        },
    },
})
addLayer("qol", {
    name: "qol", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "QoL", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: "side", // Row the layer is in on the tree (0 is the first row)
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#a15e53",
    layerShown(){return true},
    startData() { return {
        unlocked: true,
        points: new Decimal(0),
        uPoints: new Decimal(0),
        buPoints: new Decimal(0),
        cPoints: new Decimal(0),
        spentPoints: new Decimal(0),
    }},
    resource: "Qol Points", // Name of prestige currency,
    effectDescription() {return "Including " + format(player.qol.uPoints) + " From Upgrades And " + format(player.qol.cPoints) + " From Currencies And " + format(player.qol.spentPoints) + " Spent On Upgrades"},
    upgrades: {
        11: {
            title: "",
            description: "Gain 100% of Unnamed Point gain on reset every second",
            cost() { return new Decimal(64) },
            unlocked() { return player.s.unlocked },
        },
        12: {
            title: "",
            description: "Do a Super Point reset every tick",
            cost() { return new Decimal(20) },
            unlocked() { return player.p.unlocked },
        },
        13: {
            title: "",
            description: "Gain 100% of Average Point gain on reset every second",
            cost() { return new Decimal(20) },
            unlocked() { return player.p.unlocked },
        },
        14: {
            title: "",
            description: "Do a Power reset every tick",
            cost() { return new Decimal(20) },
            unlocked() { return player.b.unlocked && hasUpgrade("qol", 15) },
        },
        15: {
            title: "",
            description: "Gain 100% of Hyper Points on reset every second",
            cost() { return new Decimal(20) },
            unlocked() { return player.b.unlocked },
        },
        16: {
            title: "",
            description: "Gain 100% of Bonus Points on reset every second",
            cost() { return new Decimal(15) },
            unlocked() { return player.r.unlocked },
        },
        21: {
            title: "",
            description: "Super Points resets nothing",
            cost() { return new Decimal(4) },
            unlocked() { return player.s.unlocked && hasUpgrade("qol", 11) },
        },
        22: {
            title: "",
            description: "Power resets nothing",
            cost() { return new Decimal(15) },
            unlocked() { return player.r.unlocked && hasUpgrade("qol", 16) },
        },
        31: {
            title: "",
            description: "Super Point resets buy max",
            cost() { return new Decimal(15) },
            unlocked() { return player.a.unlocked },
        },
        32: {
            title: "",
            description: "Power resets buy max",
            cost() { return new Decimal(0) },
            unlocked() { return player.r.unlocked && hasUpgrade("qol", 22) },
        },
        41: {
            title: "",
            description: "Keep Unnamed Point upgrades",
            cost() { return new Decimal(15) },
            unlocked() { return player.a.unlocked },
        },
        42: {
            title: "",
            description: "Keep Super Point upgrades",
            cost() { return new Decimal(15) },
            unlocked() { return player.p.unlocked },
        },
        43: {
            title: "",
            description: "Keep Average Point upgrades",
            cost() { return new Decimal(15) },
            unlocked() { return player.p.unlocked },
        },
        44: {
            title: "",
            description: "Keep Power upgrades",
            cost() { return new Decimal(15) },
            unlocked() { return player.r.unlocked && hasUpgrade("qol", 16) },
        },
        45: {
            title: "",
            description: "Keep Hyper Point upgrades",
            cost() { return new Decimal(15) },
            unlocked() { return player.r.unlocked && hasUpgrade("qol", 16) },
        },
        46: {
            title: "",
            description: "Keep Bonus Point upgrades",
            cost() { return new Decimal(15) },
            unlocked() { return player.r.unlocked && hasUpgrade("qol", 16) },
        },
        51: {
            title: "",
            description: "Keep Unnamed Point buyables",
            cost() { return new Decimal(15) },
            unlocked() { return player.a.unlocked },
        },
        52: {
            title: "",
            description: "Keep Hyper Point buyables",
            cost() { return new Decimal(0) },
            unlocked() { return player.r.unlocked && hasUpgrade("qol", 16) },
        },
        61: {
            title: "",
            description: "Autobuy buyables if you have at least 100 of them",
            cost() { return new Decimal(0) },
            unlocked() { return player.a.unlocked },
        },
    },
})
addLayer("sc", {
    name: "Softcaps", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "SC", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: "side", // Row the layer is in on the tree (0 is the first row)
    position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    color: "#8661c8",
    layerShown(){return player.points.gte("eee10") || player.sc.unlocked},
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    requires() { return new Decimal("eee10") }, // Can be a function that takes requirement increases into account
    resource: "Softcaps", // Name of prestige currency
    baseResource: "Points", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent() { // Prestige currency exponent
		exp = new Decimal(0)
		return exp
	},
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        exp = new Decimal(1)
        return exp
    },
    doReset(resettingLayer){
        let keep = []
        if (layers[resettingLayer].row > this.row) layerDataReset(this.layer, keep)
    },
})