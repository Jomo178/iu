module.exports = function(stars) {
    let rarities = {
        1: "★☆☆☆☆" , 2:"★★☆☆☆", 3:"★★★☆☆" , 4: "★★★★☆" , 5: "★★★★★"
    }
    return rarities[stars]
}