const hdb = require("hdb");
const dbconfig = require("../../config/dbconfig.js");
const quote = "\""

const client = hdb.createClient(dbconfig.hana);

// list all
exports.prepareLine = async function (req, res) {
    const body = req.body
    let document = {
        Comments: "",
        DocDate: new Date(),
        BPL_IDAssignedToInvoice: 1
    }
    const sql = `SELECT \"ItemCode\", \"ItemName\", \"OnHandQty\", \"BinAbs\", \"BinCode\", \"WhsCode\", \"BPLId\", \"AbsEntry\", \"DistNumber\" 
            FROM \"_SYS_BIC\".\"PortalGROB.Consultas.Inv_View.Transferencia/TEMP_INV_TRANSF_EXIST_LOTEVTA\" WHERE \"ItemCode\" = ? And \"BinCode\" = ?`;
    const result = await getDocumentsLines(body, sql, res)
    document.DocumentLines = result
    return res.send(document);

}

function getDocumentsLines (body, sql, res) {
    return new Promise((resolve, reject) => {
        let DocumentLines = []
        client.connect(function (err) {
            if (err) {
                res.send({ "error": err.message });
            }
            body.items.map(function (element, index, array) {
                client.prepare(sql, function (err, statement) {
                    if (err) {
                        res.send({ "error": err.message });
                    }
                    statement.exec([element.itemcode, element.location], function (err, rows) {
                        if (err) {
                            res.send({ "error": err.message });
                        }
                        client.end();
                        let temp = 0
                        let lotes = []
                        let lotesB = []
                        for (const key in rows.sort((a, b) => a - b)) {
                            const item = rows[key];
                            const OnHandQty = rows[key].OnHandQty;
                            if (OnHandQty >= element.quantity) {
                                lotes.push({
                                    BatchNumber: item.DistNumber,
                                    Quantity: element.quantity - temp,
                                    BaseLineNumber: index
                                })
                                lotesB.push({
                                    BinAbsEntry: item.BinAbs,
                                    Quantity: element.quantity - temp,
                                    AllowNegativeQuantity: "tNO",
                                    SerialAndBatchNumbersBaseLine: index,
                                    BaseLineNumber: index
                                })
                                break;
                            }
                            if (OnHandQty < element.quantity - temp) {
                                lotes.push({
                                    BatchNumber: item.DistNumber,
                                    Quantity: element.quantity,
                                    BaseLineNumber: index
                                })
                                lotesB.push({
                                    BinAbsEntry: item.BinAbs,
                                    Quantity: element.quantity,
                                    AllowNegativeQuantity: "tNO",
                                    SerialAndBatchNumbersBaseLine: index,
                                    BaseLineNumber: index
                                })
                                temp += OnHandQty
                            }
                        }
                        return {
                            LineNum: index,
                            ItemCode: element.itemcode,
                            Quantity: element.quantity,
                            AccountCode: "501-004",
                            BatchNumber: lotes,
                            DocumentLinesBinAllocations: lotesB
                        };
                    });
                });
            });
            resolve(DocumentLines)
        });
    })
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