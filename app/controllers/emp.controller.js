var hdb = require("hdb");
var dbconfig = require("../../config/dbconfig.js");
var quote = "\""

var client = hdb.createClient(dbconfig.hana);

// list all
exports.listAll = function(req, res){
    var sql = "SELECT top 10 * FROM SBOGOVI.OBBQ";

    client.connect(function(err){
        if (err){
            res.send({"errorCon": err.message});
        }
        client.exec(sql, function(err, rows){
            if (err){
                res.send({"errorEXE": err.message});
            }
            client.end();
            res.send({rows});
        });
    })
};

// query by id
exports.queryById = function(req, res){
    var sql = "SELECT " + quote + "ItemCode" + quote + ", " + quote + "ItemName" + quote + ", " + quote + "OnHandQty" + quote + ", " + quote + "BinAbs" + quote + ", " + quote + "BinCode" + quote + ", " + quote + "WhsCode" + quote + ", " + quote + "BPLId" + quote + ", " + quote + "AbsEntry" + quote + ", " + quote + "DistNumber" + quote + " FROM " + quote + "_SYS_BIC" + quote + "." + quote + "PortalGROB.Consultas.Inv_View.Transferencia/TEMP_INV_TRANSF_EXIST_LOTEVTA" + quote + " WHERE " + quote + "ItemCode" + quote + " = ? And " + quote + "BinCode" + quote + " = ?"; 
    client.connect(function(err){
        if (err){
            res.send({"error": err.message});
        }
        client.prepare(sql, function(err, statement){
            if (err){
                res.send({"error": err.message});
            }
            statement.exec([req.params.itemcode, req.params.location], function(err, rows){
                if (err){
                    res.send({"error": err.message});
                }
                client.end();
                res.send(rows);
            });
        });
    });
};

// create
exports.create = function(req, res){
    var sql = "INSERT INTO STONE.EMP_MASTER VALUES(?,?,?,?,?,?,?,?)";
    client.connect(function(err){
        if (err){
            res.send({"error": err.message});
        }
        client.prepare(sql, function(err, statement){
            if (err){
                res.send({"error": err.message});
            }

            var params = [
                req.body.EMP_ID,
                req.body.GENDER,
                req.body.AGE,
                req.body.EMAIL,
                req.body.PHONE_NR,
                req.body.EDUCATION,
                req.body.MARITAL_STAT,
                req.body.NR_OF_CHILDREN
            ];
            statement.exec(params, function(err, data){
                if (err){
                    res.send({"error": err.message});
                }
                client.end();
                res.sendStatus(200);
            });
        });
    });
};

// update
exports.update = function(req, res){
    var sql = "UPDATE STONE.EMP_MASTER SET GENDER=?, AGE=?, EMAIL=?, PHONE_NR=?, EDUCATION=?, MARITAL_STAT=?, NR_OF_CHILDREN=? WHERE EMP_ID=?";
    client.connect(function(err){
        if (err){
            res.send({"error": err.message});
        }
        client.prepare(sql, function(err, statement){
            if (err){
                res.send({"error": err.message});
            }

            var params = [       
                req.body.GENDER,
                req.body.AGE,
                req.body.EMAIL,
                req.body.PHONE_NR,
                req.body.EDUCATION,
                req.body.MARITAL_STAT,
                req.body.NR_OF_CHILDREN,
                req.params.emp_id
            ];

            statement.exec(params, function(err, data){
                if (err){
                    res.send({"error": err.message});
                }
                client.end();
                res.sendStatus(200);
            });
        });
    });
};

// delete
exports.delete = function(req, res){
    var sql = "DELETE FROM STONE.EMP_MASTER WHERE EMP_ID=?";
    client.connect(function(err){
        if (err){
            res.send({"error": err.message});
        }
        client.prepare(sql, function(err, statement){
            if (err){
                res.send({"error": err.message});
            }

            statement.exec([req.params.emp_id], function(err, data){
                if (err){
                    res.send({"error": err.message});
                }
                client.end();
                res.sendStatus(200);
            });
        });
    });
};