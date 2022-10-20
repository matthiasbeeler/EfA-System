exports.getPrintData = function(req, res, database){
    database.query(`SELECT * FROM receiverCards ORDER BY id DESC`,function (error, results, fields) {
        return res.json({"success": true, "startId": results[0].id})
    })
}
exports.setId = function(req, res, database){
    database.query(`UPDATE receiverCards SET id = ?;`,[req.body.id],function (error, results, fields) {
        return res.json({"success": true})
    })
}