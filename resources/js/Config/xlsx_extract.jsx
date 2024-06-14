import * as ExcelJS from "exceljs"
import axios from "axios"
import _ from "underscore"

const extract=async(file)=>{
    const req=await axios.get(file, {responseType:"arraybuffer"})
    const req_data=await req.data

    const workbook=new ExcelJS.Workbook()
    const excel=await workbook.xlsx.load(req_data)

    const sheet=excel.getWorksheet("TOR")
    const sheet_row_count=sheet.rowCount
    const searcher=[
        "1. indikator kinerja utama (iku)", 
        "2. indikator kinerja kegiatan (ik)",
        "3. kegiatan",
        "4. sub kegiatan",
        "5. judul kegiatan"
    ]
    let search_data=[null, null, null, null, null]
    
    for(var i=1; i<=sheet_row_count; i++){
        const row=sheet.getRow(i).values.map(v=>{
            if(!_.isNull(v)){
                if(_.isObject(v)){
                    return v.result.toString().trim()
                }
                return v.toString().trim()
            }
        })
        const left_block=[...new Set(row.slice(1, 5))].join(" ").trim()
        const right_block=[...new Set(row.slice(6))].join(" ").trim()
        const found_dot2=!_.isUndefined(row[5])?(row[5].toString().trim()==":"?true:false):false
        
        for(var j=0; j<searcher.length; j++){
            if(_.isNull(search_data[j])){
                if(left_block.toLowerCase()==searcher[j] && found_dot2){
                    search_data[j]=right_block
                }
            }
        }
    }

    return {
        searcher,
        data:search_data
    }       
}

export default extract