const hana = require("@sap/hana-client")
const dbconfig = require("../../config/dbconfig.js");
const client = hana.createConnection()
client.connect("serverNode=192.168.1.30:30015;uid=SYSTEM;pwd=Pa$$w0rd!")

exports.salida = (req, res) => {
    console.log('POST: salida ->')
    const body = req.body
    let today = new Date()

    let d = today.getDate();
    let m = today.getMonth() + 1; //Month from 0 to 11
    let y = today.getFullYear();
    let t = '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    let document = {
        Comments: req.query.comments,
        DocDate: t,
        BPL_IDAssignedToInvoice: body.bplid
    }
    const sql = `SELECT \"ItemCode\", \"ItemName\", \"OnHandQty\", \"BinAbs\", \"BinCode\", \"WhsCode\", \"BPLId\", \"AbsEntry\", \"DistNumber\" 
             FROM \"_SYS_BIC\".\"PortalGROB.Consultas.Inv_View.Transferencia/TEMP_INV_TRANSF_EXIST_LOTEVTA\" WHERE \"ItemCode\" = ? And \"BinCode\" = ?`;
    //const sql = `SELECT \"ItemCode\", \"ItemName\", \"OnHandQty\", \"BinAbs\", \"BinCode\", \"WhsCode\", \"BPLId\", \"AbsEntry\", \"DistNumber\" 
    //        FROM \"_SYS_BIC\".\"ProductivaGOVI/INV_LOTE_EXIT_PORTAL_AJUSTES_INV\" WHERE \"ItemCode\" = ? And \"BinCode\" = ?`;
    let DocumentLines = []
    let indexLineNum = 0
    body.items.map(function (element, index, array) {
        const statement = client.prepare(sql)
        const rows = statement.exec([element.itemcode, element.location])

        statement.drop()
        let temp = 0
        let newQuantity = 0
        let BatchNumber = []
        let DocumentLinesBinAllocations = []
        let indexLote = 0
        const existencia = rows.length > 1 ? rows.reduce((sum, { OnHandQty }) => sum + OnHandQty, 0) : rows.length == 0 ? 0 : rows[0].OnHandQty
        element.quantity = element.quantity > existencia ? existencia : element.quantity

        for (const key in rows.sort((a, b) => (a.OnHandQty > b.OnHandQty) ? 1 : ((b.OnHandQty > a.OnHandQty) ? -1 : 0))) {
            const item = rows[key];
            const OnHandQty = rows[key].OnHandQty;

            if (OnHandQty < element.quantity - temp) {
                BatchNumber.push({
                    BatchNumber: item.DistNumber,
                    Quantity: OnHandQty,
                    BaseLineNumber: indexLineNum
                })
                DocumentLinesBinAllocations.push({
                    BinAbsEntry: item.BinAbs,
                    Quantity: OnHandQty,
                    AllowNegativeQuantity: "tNO",
                    SerialAndBatchNumbersBaseLine: indexLote,
                    BaseLineNumber: indexLineNum
                })
                temp += OnHandQty
                newQuantity = element.quantity - temp
                indexLote++
                continue;
            }
            if (OnHandQty >= newQuantity) {
                BatchNumber.push({
                    BatchNumber: item.DistNumber,
                    Quantity: element.quantity - temp,
                    BaseLineNumber: indexLineNum
                })
                DocumentLinesBinAllocations.push({
                    BinAbsEntry: item.BinAbs,
                    Quantity: element.quantity - temp,
                    AllowNegativeQuantity: "tNO",
                    SerialAndBatchNumbersBaseLine: indexLote,
                    BaseLineNumber: indexLineNum
                })
                break;
            }
        }
        if (BatchNumber.length) {
            DocumentLines.push({
                LineNum: indexLineNum,
                ItemCode: element.itemcode,
                Quantity: element.quantity,
                AccountCode: "501-004",
                BatchNumbers: BatchNumber,
                DocumentLinesBinAllocations: DocumentLinesBinAllocations
            });
            indexLineNum++
        }
    })
    document.DocumentLines = DocumentLines
    res.json(document)
}

exports.entrada = (req, res) => {
    console.log('POST: entrada ->')
    const body = req.body
    let today = new Date()

    let d = today.getDate();
    let m = today.getMonth() + 1; //Month from 0 to 11
    let y = today.getFullYear();
    let t = '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    let document = {
        Comments: req.query.comments,
        DocDate: t,
        BPL_IDAssignedToInvoice: body.bplid
    }
    const sql = `SELECT TOP 1 \"AbsEntry\" FROM \"SBOGOVI\".\"OBIN\" WHERE \"BinCode\" = ?`;
    let DocumentLines = []
    body.items.map(function (element, index, array) {
        const statement = client.prepare(sql)
        const rows = statement.exec([element.location])
        statement.drop()

        let BatchNumber = []
        let DocumentLinesBinAllocations = []
        BatchNumber.push({
            BatchNumber: 'LoteGOVI',
            Quantity: element.quantity,
            BaseLineNumber: index
        })
        DocumentLinesBinAllocations.push({
            BinAbsEntry: rows[0].AbsEntry,
            Quantity: element.quantity,
            AllowNegativeQuantity: "tNO",
            SerialAndBatchNumbersBaseLine: 0,
            BaseLineNumber: index
        })
        if (BatchNumber.length) {
            DocumentLines.push({
                LineNum: index,
                ItemCode: element.itemcode,
                Quantity: element.quantity,
                AccountCode: "501-004",
                BatchNumbers: BatchNumber,
                DocumentLinesBinAllocations: DocumentLinesBinAllocations
            });
        }
    })
    document.DocumentLines = DocumentLines
    res.json(document)
}