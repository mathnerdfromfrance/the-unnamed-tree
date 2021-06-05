let modInfo = {
	name: "The Unnamed Tree",
	id: "TUTBB",
	author: "mathnerdfromfrance",
	pointsName: "Points",
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	
	offlineLimit: 1,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.10",
	name: "Past 300 Upgrades",
}

let changelog = `<h1>Changelog:</h1><br>
    <br><h3>v0.10 : Past 300 Upgrades ( June 5th )</h3><br>
    <br><h3>v0.9 : 4th Row ( June 4th )</h3><br>
    <br><h3>v0.8 : The Color Update ( June 3rd )</h3><br>
    <br><h3>v0.7 : Tetrate ( May 30th )</h3><br>
    <br><h3>v0.6 : The QoL Update ( May 28th )</h3><br>
    <br><h3>v0.5 : Overpowered ( May 26th )</h3><br>
    <br><h3>v0.4 : Average ( May 23rd )</h3><br>
    <br><h3>v0.3 : America ( May 22nd )</h3><br>
    <br><h3>v0.2 : No Ideas Yet ( May 22nd )</h3><br>
	<br><h3>v0.1 : I Had No Idea For A Name So... ( May 20th )</h3><br>`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = ["blowUpEverything"]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return hasUpgrade("u", 11)
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	// Upgrade Multipliers
	if(hasUpgrade("u", 12)) gain = gain.times(tmp.u.upgrades[12].effect)
	if(hasUpgrade("u", 14)) gain = gain.times(tmp.u.upgrades[14].effect)
	if(hasUpgrade("u", 25)) gain = gain.times(tmp.u.upgrades[25].effect)
	if(hasUpgrade("s", 11)) gain = gain.times(tmp.s.upgrades[11].effect)
	if(hasUpgrade("s", 14)) gain = gain.times(tmp.u.effect.add(1).pow(tmp.u.buyables[11].effect.times(100)))
	if(hasUpgrade("a", 11)) gain = gain.times(tmp.a.upgrades[11].effect)
	if(hasUpgrade("p", 14)) gain = gain.times(tmp.p.upgrades[14].effect)
	if(hasUpgrade("p", 15)) gain = gain.times(tmp.p.upgrades[15].effect)
	if(hasUpgrade("b", 12)) gain = gain.times(tmp.b.upgrades[12].effect)
	// Upgrade Exponents
	if(hasUpgrade("s", 35)) gain = gain.pow(tmp.s.upgrades[35].effect)
	// Other Multipliers
	gain = gain.times(tmp.u.buyables[12].effect)
	gain = gain.times(tmp.s.effect)
	gain = gain.times(new Decimal(10).pow(tmp.p.effect.add(3).ssqrt().minus(2)))
	gain = gain.times(tmp.h.effect)
	// Other Exponents
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
}}

// Display extra things at the top of the page
var displayThings = [
]

// Determines when the game "ends"
function isEndgame() {
	return player.r.points.gte(51)
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}
