const hdb = require("hdb");
const dbconfig = require("../../config/dbconfig.js");
const quote = "\""

const client = hdb.createClient(dbconfig.hana);

// list all
exports.prepareLine = function (req, res) {
    const body = req.body
    let result = {
        Comments: "",
        DocDate: new Date(),
        BPL_IDAssignedToInvoice: 1
    }
    const sql = `SELECT \"ItemCode\", \"ItemName\", \"OnHandQty\", \"BinAbs\", \"BinCode\", \"WhsCode\", \"BPLId\", \"AbsEntry\", \"DistNumber\" 
            FROM \"_SYS_BIC\".\"PortalGROB.Consultas.Inv_View.Transferencia/TEMP_INV_TRANSF_EXIST_LOTEVTA\" WHERE \"ItemCode\" = ? And \"BinCode\" = ?`;
    client.connect(function (err) {
        if (err) {
            res.send({ "error": err.message });
        }
        let DocumentLines = []
        DocumentLines.push(
            body.items.map((element, index, array) => {
                client.prepare(sql, function (err, statement) {
                    if (err) {
                        res.send({ "error": err.message });
                    }
                    statement.exec([element.itemcode, element.location], function (err, rows) {
                        if (err) {
                            res.send({ "error": err.message });
                        }
                        client.end();
                        return {
                            LineNum: index,
                            ItemCode: element.itemcode,
                            Quantity: element.quantity,
                            AccountCode: "501-004",
                            BatchNumber: rows.map((item, indexLote) => {
                                if (item.OnHandQty >= element.quantity) {
                                    return {
                                        BatchNumber: item.DistNumber,
                                        Quantity: element.quantity,
                                        BaseLineNumber: index
                                    }
                                } else return {
                                    BatchNumber: item.DistNumber,
                                    Quantity: item.OnHandQty,
                                    BaseLineNumber: index
                                }
                            }),
                            DocumentLinesBinAllocations: rows.map((item, indexLote) => {
                                if (item.OnHandQty >= element.quantity) {
                                    return {
                                        BinAbsEntry: item.BinAbs,
                                        Quantity: element.quantity,
                                        AllowNegativeQuantity: "tNO",
                                        SerialAndBatchNumbersBaseLine: indexLote,
                                        BaseLineNumber: index
                                    }
                                }
                            })
                        };
                    });
                });
            }))
        result.DocumentLines = DocumentLines
        return res.send(result);
    });
};

function getDocumentLines () {

}

// query by id
exports.queryById = function (req, res) {
    var sql = `SELECT \"ItemCode\", \"ItemName\", \"OnHandQty\", \"BinAbs\", \"BinCode\", \"WhsCode\", \"BPLId\", \"AbsEntry\", \"DistNumber\" 
            FROM \"_SYS_BIC\".\"PortalGROB.Consultas.Inv_View.Transferencia/TEMP_INV_TRANSF_EXIST_LOTEVTA\" WHERE \"ItemCode\" = ? And \"BinCode\" = ?`;
    client.connect(function (err) {
        if (err) {
            res.send({ "error": err.message });
        }
        client.prepare(sql, function (err, statement) {
            if (err) {
                res.send({ "error": err.message });
            }
            statement.exec([req.params.itemcode, req.params.location], function (err, rows) {
                if (err) {
                    res.send({ "error": err.message });
                }
                client.end();
                res.send(rows);
            });
        });
    });
};