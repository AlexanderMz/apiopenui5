const hana = require("@sap/hana-client")
const dbconfig = require("../../config/dbconfig.js");
const client = hana.createConnection()
client.connect("serverNode=192.168.1.30:30015;uid=SYSTEM;pwd=Pa$$w0rd!")

exports.salida = (req, res) => {
    const body = req.body
    let document = {
        Comments: req.query.comments,
        DocDate: new Date(),
        BPL_IDAssignedToInvoice: 1
    }
    const sql = `SELECT \"ItemCode\", \"ItemName\", \"OnHandQty\", \"BinAbs\", \"BinCode\", \"WhsCode\", \"BPLId\", \"AbsEntry\", \"DistNumber\" 
            FROM \"_SYS_BIC\".\"PortalGROB.Consultas.Inv_View.Transferencia/TEMP_INV_TRANSF_EXIST_LOTEVTA\" WHERE \"ItemCode\" = ? And \"BinCode\" = ?`;
    let DocumentLines = []
    body.items.map(function (element, index, array) {
        const statement = client.prepare(sql)
        const rows = statement.exec([element.itemcode, element.location])
        statement.drop()
        let temp = 0
        let newQuantity = 0
        let BatchNumber = []
        let DocumentLinesBinAllocations = []
        let indexLote = 0
        for (const key in rows.sort((a, b) => a - b)) {
            const item = rows[key];
            const OnHandQty = rows[key].OnHandQty;

            if (OnHandQty < element.quantity - temp) {
                BatchNumber.push({
                    BatchNumber: item.DistNumber,
                    Quantity: OnHandQty,
                    BaseLineNumber: index
                })
                DocumentLinesBinAllocations.push({
                    BinAbsEntry: item.BinAbs,
                    Quantity: OnHandQty,
                    AllowNegativeQuantity: "tNO",
                    SerialAndBatchNumbersBaseLine: indexLote,
                    BaseLineNumber: index
                })
                temp += OnHandQty
                newQuantity = element.quantity - OnHandQty
                indexLote++
                continue;
            }
            if (OnHandQty >= newQuantity) {
                BatchNumber.push({
                    BatchNumber: item.DistNumber,
                    Quantity: element.quantity - temp,
                    BaseLineNumber: index
                })
                DocumentLinesBinAllocations.push({
                    BinAbsEntry: item.BinAbs,
                    Quantity: element.quantity - temp,
                    AllowNegativeQuantity: "tNO",
                    SerialAndBatchNumbersBaseLine: indexLote,
                    BaseLineNumber: index
                })
                break;
            }
        }
        DocumentLines.push({
            LineNum: index,
            ItemCode: element.itemcode,
            Quantity: element.quantity,
            AccountCode: "501-004",
            BatchNumber: BatchNumber,
            DocumentLinesBinAllocations: DocumentLinesBinAllocations
        });
    })
    document.DocumentLines = DocumentLines
    res.json(document)
}

exports.entrada = (req, res) => {
    const body = req.body
    let document = {
        Comments: req.query.comments,
        DocDate: new Date(),
        BPL_IDAssignedToInvoice: 1
    }
    const sql = `SELECT \"ItemCode\", \"ItemName\", \"OnHandQty\", \"BinAbs\", \"BinCode\", \"WhsCode\", \"BPLId\", \"AbsEntry\", \"DistNumber\" 
            FROM \"_SYS_BIC\".\"PortalGROB.Consultas.Inv_View.Transferencia/TEMP_INV_TRANSF_EXIST_LOTEVTA\" WHERE \"ItemCode\" = ? And \"BinCode\" = ?`;
    let DocumentLines = []
    body.items.map(function (element, index, array) {
        const statement = client.prepare(sql)
        const rows = statement.exec([element.itemcode, element.location])
        statement.drop()
        let temp = 0
        let newQuantity = 0
        let BatchNumber = []
        let DocumentLinesBinAllocations = []
        let indexLote = 0
        for (const key in rows.sort((a, b) => a - b)) {
            const item = rows[key];
            const OnHandQty = rows[key].OnHandQty;

            if (OnHandQty < element.quantity - temp) {
                BatchNumber.push({
                    BatchNumber: item.DistNumber,
                    Quantity: OnHandQty,
                    BaseLineNumber: index
                })
                DocumentLinesBinAllocations.push({
                    BinAbsEntry: item.BinAbs,
                    Quantity: OnHandQty,
                    AllowNegativeQuantity: "tNO",
                    SerialAndBatchNumbersBaseLine: indexLote,
                    BaseLineNumber: index
                })
                temp += OnHandQty
                newQuantity = element.quantity - OnHandQty
                indexLote++
                continue;
            }
            if (OnHandQty >= newQuantity) {
                BatchNumber.push({
                    BatchNumber: item.DistNumber,
                    Quantity: element.quantity - temp,
                    BaseLineNumber: index
                })
                DocumentLinesBinAllocations.push({
                    BinAbsEntry: item.BinAbs,
                    Quantity: element.quantity - temp,
                    AllowNegativeQuantity: "tNO",
                    SerialAndBatchNumbersBaseLine: indexLote,
                    BaseLineNumber: index
                })
                break;
            }
        }
        DocumentLines.push({
            LineNum: index,
            ItemCode: element.itemcode,
            Quantity: element.quantity,
            AccountCode: "501-004",
            BatchNumber: BatchNumber,
            DocumentLinesBinAllocations: DocumentLinesBinAllocations
        });
    })
    document.DocumentLines = DocumentLines
    res.json(document)
}