const jwt = require("jsonwebtoken");

exports.addNew = function (request, response, database) {
    try {
        if(!request.body.name || ! request.body.id) return response.json({ success: false });
  var name = request.body.name;
  var id = request.body.id;
  var comment = request.body.comment;
  var coordinator = jwt.verify(
    request.cookies.Auth,
    process.env.jwtSecret
  ).username;
  database.query(
    `SELECT * FROM volunteerCards WHERE id = ?;`,
    [id],
    function (error, results, fields) {
      if (error) console.log(error);
      if (error) return response.json({ success: false });
      if (results.length > 0)
        return response.json({ success: false, message: "Karte existiert bereits" });
      database.query(
        `INSERT INTO volunteerCards (id, name, createdAt, coordinator, comment) VALUES (?,?,?,?,?);`,
        [id, name, Date.now(), coordinator, comment],
        function (error, results, fields) {
          if (error) console.log(error);
          if (error) return response.json({ success: false });
          if (!error) return response.json({ success: true });
        }
      );
    }
  );

        
} catch (error) {
    if (error) console.log(error);
    if (error) return response.json({ success: false });
}
};
