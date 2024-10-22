import React, { useEffect, useMemo, useState } from "react"
import Layout from "@/Components/layout"
import { queryClient } from "@/Config/api"
import { toast } from "react-toastify"
import { FiChevronLeft, FiChevronRight, FiEdit, FiFileText, FiPlus, FiRefreshCw, FiTrash, FiTrash2, FiUpload } from "react-icons/fi"
import Avatar from "@/Components/ui/avatar"
import { Modal, Spinner } from "react-bootstrap"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'
import {Select} from "@/Components/ui/select"
import { Formik } from "formik"
import * as yup from "yup"
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import _, { object } from "underscore"
import { Map } from "immutable"
import { router } from "@inertiajs/react"
import clsx from "clsx"
import axios from "axios"
import { file_request, user_request, activity_prodi_request, ppepp_kriteria_request, ppepp_request, bukti_request } from "@/Config/request"
import { SwitchInput } from "@/Components/ui/input_form"
import { parse_image, parse_pdf } from "@/Config/ocr"
import extract from "@/Config/xlsx_extract"
import FileSaver from "file-saver"
import * as ExcelJS from "exceljs"
import { sheetColumn } from "@/Config/helpers"


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        id_ppepp:"",
        id_sub_ppepp:"",
        id_kriteria:""
    })
    const [file_preview, setFilePreview]=useState({
        is_open:false,
        file:{}
    })

    //DATA/MUTATION
    const gets_rekap_bukti=useQuery({
        queryKey:["gets_rekap_bukti"],
        queryFn:async()=>bukti_request.gets_rekap_bukti(),
        initialData:{
            data:[]
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false
    })
    const options_kriteria=useQuery({
        queryKey:["options_kriteria"],
        queryFn:async()=>ppepp_kriteria_request.gets({}),
        initialData:{
            data:[],
            last_page:0,
            first_page:1,
            current_page:1
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false
    })
    const options_ppepp=useQuery({
        queryKey:["options_ppepp"],
        queryFn:async()=>ppepp_request.gets({type:"ppepp"}),
        initialData:{
            data:[],
            last_page:0,
            first_page:1,
            current_page:1
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false
    })
    const options_sub_ppepp=useQuery({
        queryKey:["options_sub_ppepp"],
        queryFn:async()=>ppepp_request.gets({type:"sub_ppepp"}),
        initialData:{
            data:[],
            last_page:0,
            first_page:1,
            current_page:1
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false
    })

    //ACTIONS
    const togglePreview=(list={}, show=false)=>{
        setFilePreview({
            is_open:show,
            file:list
        })
    }

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Rekap Bukti</h4>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_rekap_bukti}
                    filter={filter}
                    setFilter={setFilter}
                    options_kriteria={options_kriteria}
                    options_ppepp={options_ppepp}
                    options_sub_ppepp={options_sub_ppepp}
                    togglePreview={togglePreview}
                />
            </Layout>
            
            <ModalFilePreview
                data={file_preview}
                togglePreview={togglePreview}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION

    //VALUES
    const generated_data=()=>{
        let data_kriteria=props.data.data.data
        if(props.filter.id_kriteria!=""){
            data_kriteria=data_kriteria.filter(f=>f.id_kriteria==props.filter.id_kriteria)
        }
        
        const kriteria=data_kriteria.map(k=>{
            let k_row=k.ppepp.length==0?1:0
            
            let data_ppepp=k.ppepp
            if(props.filter.id_ppepp!=""){
                data_ppepp=data_ppepp.filter(f=>f.id_ppepp==props.filter.id_ppepp)
            }

            const ppepp=data_ppepp.map(p=>{
                let p_row=p.sub_ppepp.length==0?1:0

                let data_sub_ppepp=p.sub_ppepp
                if(props.filter.id_sub_ppepp!=""){
                    data_sub_ppepp=data_sub_ppepp.filter(f=>f.id_ppepp==props.filter.id_sub_ppepp)
                }

                if(data_sub_ppepp.length==0){
                    k_row++
                }

                const sub_ppepp=data_sub_ppepp.map(sp=>{
                    let sp_row=sp.bukti.length==0?1:0

                    if(sp.bukti.length==0){
                        k_row++
                        p_row++
                    }

                    const bukti=sp.bukti.map(b=>{
                        k_row++
                        p_row++
                        sp_row++

                        return b
                    })

                    return Object.assign({}, sp, {
                        bukti,
                        rowspan:sp_row
                    })
                })

                return Object.assign({}, p, {
                    sub_ppepp,
                    rowspan:p_row
                })
            })

            return Object.assign({}, k, {
                ppepp,
                rowspan:k_row
            })
        })

        return kriteria
    }

    //FILTER
    const options_kriteria=()=>{
        const data=props.options_kriteria.data.data.map(d=>{
            return {
                label:d.nama_kriteria,
                value:d.id_kriteria
            }
        })

        return [{label:"Semua kriteria", value:""}].concat(data)
    }
    const options_ppepp=()=>{
        const data=props.options_ppepp.data.data.filter(f=>f.id_kriteria==props.filter.id_kriteria).map(d=>{
            return {
                label:d.nama_ppepp,
                value:d.id_ppepp
            }
        })

        return [{label:"Semua ppepp", value:""}].concat(data)
    }
    const options_sub_ppepp=()=>{
        const data=props.options_sub_ppepp.data.data.filter(f=>f.nested==props.filter.id_ppepp).map(d=>{
            return {
                label:d.nama_ppepp,
                value:d.id_ppepp
            }
        })

        return [{label:"Semua sub ppepp", value:""}].concat(data)
    }
    const typeFilter=e=>{
        const target=e.target

        if(target.name=="id_kriteria"){
            props.setFilter(
                Map(props.filter)
                .set(target.name, target.value)
                .set("id_ppepp", "")
                .set("id_sub_ppepp", "")
                .toJS()
            )
        }
        else if(target.name=="id_ppepp"){
            props.setFilter(
                Map(props.filter)
                .set(target.name, target.value)
                .set("id_sub_ppepp", "")
                .toJS()
            )
        }
        else{
            props.setFilter(
                Map(props.filter)
                .set(target.name, target.value)
                .toJS()
            )
        }
    }

    //ACTIONS
    const downloadExcel=async()=>{
        let aoa_rekap_bukti=[]
        let rows_merge=[]

        //header
        aoa_rekap_bukti=aoa_rekap_bukti.concat([
            [
                "#",
                "Kriteria",
                "No. Butir",
                "PPEPP",
                "Deskripsi",
                "No. Urut",
                "Sub PPEPP",
                "Bukti Sahih",
                "",
                "",
                ""
            ],
            [
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "Justifikasi",
                "Dokumen",
                "Link External",
                "Skor"
            ]
        ])
        rows_merge=rows_merge.concat([
            {s:{r:1,c:1}, e:{r:2,c:1}},
            {s:{r:1,c:2}, e:{r:2,c:2}},
            {s:{r:1,c:3}, e:{r:2,c:3}},
            {s:{r:1,c:4}, e:{r:2,c:4}},
            {s:{r:1,c:5}, e:{r:2,c:5}},
            {s:{r:1,c:6}, e:{r:2,c:6}},
            {s:{r:1,c:7}, e:{r:2,c:7}},
            {s:{r:1,c:8}, e:{r:1,c:11}}
        ])

        //content
        let pos_k=3
        generated_data().map((k, idx_k)=>{
            if(k.ppepp.length==0){
                aoa_rekap_bukti=aoa_rekap_bukti.concat([
                    [
                        (idx_k+1).toString(),
                        k.nama_kriteria.toString(),
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                ])
                rows_merge=rows_merge.concat([
                    {s:{r:pos_k,c:1}, e:{r:pos_k+Number(k.rowspan)-1,c:1}},
                    {s:{r:pos_k,c:2}, e:{r:pos_k+Number(k.rowspan)-1,c:2}}
                ])
            }

            let pos_p=pos_k
            k.ppepp.map((p, idx_p)=>{
                if(p.sub_ppepp.length==0){
                    let ppepp_k=["", ""]
                    let ppepp_rows_merge=[]
                    if(idx_p==0){
                        ppepp_k=[
                            (idx_k+1).toString(),
                            k.nama_kriteria.toString()
                        ]
                        ppepp_rows_merge=ppepp_rows_merge.concat([
                            {s:{r:pos_k,c:1}, e:{r:pos_k+Number(k.rowspan)-1,c:1}},
                            {s:{r:pos_k,c:2}, e:{r:pos_k+Number(k.rowspan)-1,c:2}}
                        ])
                    }
                    let ppepp=[
                        p.no_butir.toString(),
                        p.nama_ppepp.toString(),
                        p.deskripsi.toString(),
                        "",
                        "",
                        "",
                        "",
                        "",
                        ""
                    ]
                    ppepp_rows_merge=ppepp_rows_merge.concat([
                        {s:{r:pos_p,c:3}, e:{r:pos_p+Number(p.rowspan)-1,c:3}},
                        {s:{r:pos_p,c:4}, e:{r:pos_p+Number(p.rowspan)-1,c:4}},
                        {s:{r:pos_p,c:5}, e:{r:pos_p+Number(p.rowspan)-1,c:5}}
                    ])

                    aoa_rekap_bukti=aoa_rekap_bukti.concat([ppepp_k.concat(ppepp)])
                    rows_merge=rows_merge.concat(ppepp_rows_merge)
                }

                let pos_sp=pos_p
                p.sub_ppepp.map((sp, idx_sp)=>{
                    if(sp.bukti.length==0){
                        let ppepp_k=["", ""]
                        let ppepp_p=["", "", ""]
                        let sub_ppepp_rows_merge=[]
                        if(idx_p==0 && idx_sp==0){
                            ppepp_k=[
                                (idx_k+1).toString(),
                                k.nama_kriteria.toString()
                            ]
                            sub_ppepp_rows_merge=sub_ppepp_rows_merge.concat([
                                {s:{r:pos_k,c:1}, e:{r:pos_k+Number(k.rowspan)-1,c:1}},
                                {s:{r:pos_k,c:2}, e:{r:pos_k+Number(k.rowspan)-1,c:2}}
                            ])
                        }
                        if(idx_sp==0){
                            ppepp_p=[
                                p.no_butir.toString(),
                                p.nama_ppepp.toString(),
                                p.deskripsi.toString()
                            ]
                            sub_ppepp_rows_merge=sub_ppepp_rows_merge.concat([
                                {s:{r:pos_p,c:3}, e:{r:pos_p+Number(p.rowspan)-1,c:3}},
                                {s:{r:pos_p,c:4}, e:{r:pos_p+Number(p.rowspan)-1,c:4}},
                                {s:{r:pos_p,c:5}, e:{r:pos_p+Number(p.rowspan)-1,c:5}}
                            ])
                        }
                        let sub_ppepp=[
                            sp.no_urut.toString(),
                            sp.nama_ppepp.toString(),
                            "",
                            "",
                            "",
                            ""
                        ]
                        sub_ppepp_rows_merge=sub_ppepp_rows_merge.concat([
                            {s:{r:pos_sp,c:6}, e:{r:pos_sp+Number(sp.rowspan)-1,c:6}},
                            {s:{r:pos_sp,c:7}, e:{r:pos_sp+Number(sp.rowspan)-1,c:7}}
                        ])

                        aoa_rekap_bukti=aoa_rekap_bukti.concat([ppepp_k.concat(ppepp_p).concat(sub_ppepp)])
                        rows_merge=rows_merge.concat(sub_ppepp_rows_merge)
                    }

                    sp.bukti.map((b, idx_b)=>{
                        let ppepp_k=["", ""]
                        let ppepp_p=["", "", ""]
                        let ppepp_sp=["", ""]
                        let bukti_rows_merge=[]
                        if(idx_p==0 && idx_sp==0 && idx_b==0){
                            ppepp_k=[
                                (idx_k+1).toString(),
                                k.nama_kriteria.toString()
                            ]
                            bukti_rows_merge=bukti_rows_merge.concat([
                                {s:{r:pos_k,c:1}, e:{r:pos_k+Number(k.rowspan)-1,c:1}},
                                {s:{r:pos_k,c:2}, e:{r:pos_k+Number(k.rowspan)-1,c:2}}
                            ])
                        }
                        if(idx_sp==0 && idx_b==0){
                            ppepp_p=[
                                p.no_butir.toString(),
                                p.nama_ppepp.toString(),
                                p.deskripsi.toString()
                            ]
                            bukti_rows_merge=bukti_rows_merge.concat([
                                {s:{r:pos_p,c:3}, e:{r:pos_p+Number(p.rowspan)-1,c:3}},
                                {s:{r:pos_p,c:4}, e:{r:pos_p+Number(p.rowspan)-1,c:4}},
                                {s:{r:pos_p,c:5}, e:{r:pos_p+Number(p.rowspan)-1,c:5}}
                            ])
                        }
                        if(idx_b==0){
                            ppepp_sp=[
                                sp.no_urut.toString(),
                                sp.nama_ppepp.toString(),
                            ]
                            bukti_rows_merge=bukti_rows_merge.concat([
                                {s:{r:pos_sp,c:6}, e:{r:pos_sp+Number(sp.rowspan)-1,c:6}},
                                {s:{r:pos_sp,c:7}, e:{r:pos_sp+Number(sp.rowspan)-1,c:7}}
                            ])
                        }
                        let bukti=[
                            b.deskripsi.toString(),
                            b.file.toString(),
                            b.link_external.toString(),
                            sp.skor.toString()
                        ]

                        aoa_rekap_bukti=aoa_rekap_bukti.concat([ppepp_k.concat(ppepp_p).concat(ppepp_sp).concat(bukti)])
                        rows_merge=rows_merge.concat(bukti_rows_merge)
                    })

                    pos_sp=pos_sp+sp.rowspan
                })

                pos_p=pos_p+p.rowspan
            })

            pos_k=pos_k+k.rowspan
        })

        //processing
        const workBook=new ExcelJS.Workbook()
        const workSheet1=workBook.addWorksheet("Sheet 1")
        workSheet1.addRows(aoa_rekap_bukti)
        rows_merge.map(rm=>{
            workSheet1.mergeCells(`${sheetColumn(rm.s.c)}${rm.s.r}`, `${sheetColumn(rm.e.c)}${rm.e.r}`)
        })
        workSheet1.getRow(1).font={bold:true}
        workSheet1.getRow(2).font={bold:true}

        await workBook.xlsx.writeBuffer()
        .then((data)=>{
            let today=new Date()
            let date=today.getFullYear()+
                (today.getMonth()+1).toString().padStart(2, "0")+
                today.getDate().toString().padStart(2, "0")+
                today.getHours().toString().padStart(2, "0")+
                today.getMinutes().toString().padStart(2, "0")+
                today.getSeconds().toString().padStart(2, "0")

            FileSaver.saveAs(new Blob([data]), date+"__rekap_bukti.xlsx")

        })
        .catch(err => {
            toast.error("Failed to create generated spreadsheet!", {position:"bottom-center"})
        })
    }

    //RENDER
    const render_generated_data=()=>{
        return generated_data().map((k, idx_k)=>{
            if(k.ppepp.length==0){
                return (
                    <tr>
                        <td rowspan={k.rowspan}>{idx_k+1}</td>
                        <td rowspan={k.rowspan}>{k.nama_kriteria}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                )
            }

            return k.ppepp.map((p, idx_p)=>{
                if(p.sub_ppepp.length==0){
                    return (
                        <tr>
                            {(idx_p==0)&&
                                <>
                                    <td rowspan={k.rowspan}>{idx_k+1}</td>
                                    <td rowspan={k.rowspan}>{k.nama_kriteria}</td>
                                </>
                            }
                            <td rowspan={p.rowspan}>{p.no_butir}</td>
                            <td rowspan={p.rowspan}>{p.nama_ppepp}</td>
                            <td rowspan={p.rowspan} className="text-prewrap">{p.deskripsi}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    )
                }

                return p.sub_ppepp.map((sp, idx_sp)=>{
                    if(sp.bukti.length==0){
                        return (
                            <tr>
                                {(idx_p==0 && idx_sp==0)&&
                                    <>
                                        <td rowspan={k.rowspan}>{idx_k+1}</td>
                                        <td rowspan={k.rowspan}>{k.nama_kriteria}</td>
                                    </>
                                }
                                {(idx_sp==0)&&
                                    <>
                                        <td rowspan={p.rowspan}>{p.no_butir}</td>
                                        <td rowspan={p.rowspan}>{p.nama_ppepp}</td>
                                        <td rowspan={p.rowspan} className="text-prewrap">{p.deskripsi}</td>
                                    </>
                                }
                                <td rowspan={sp.rowspan}>{sp.no_urut}</td>
                                <td rowspan={sp.rowspan}>{sp.nama_ppepp}</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        )
                    }

                    return sp.bukti.map((b, idx_b)=>(
                        <tr>
                            {(idx_p==0 && idx_sp==0 && idx_b==0)&&
                                <>
                                    <td rowspan={k.rowspan}>{idx_k+1}</td>
                                    <td rowspan={k.rowspan}>{k.nama_kriteria}</td>
                                </>
                            }
                            {(idx_sp==0 && idx_b==0)&&
                                <>
                                    <td rowspan={p.rowspan}>{p.no_butir}</td>
                                    <td rowspan={p.rowspan}>{p.nama_ppepp}</td>
                                    <td rowspan={p.rowspan} className="text-prewrap">{p.deskripsi}</td>
                                </>
                            }
                            {(idx_b==0)&&
                                <>
                                    <td rowspan={sp.rowspan}>{sp.no_urut}</td>
                                    <td rowSpan={sp.rowspan}>{sp.nama_ppepp}</td>
                                </>
                            }
                            <td className="text-prewrap">{b.deskripsi}</td>
                            <td>
                                <a 
                                    href={`${b.link}`} 
                                    className="d-inline-block text-dark text-truncate"
                                    style={{maxWidth:"150px"}}
                                    onClick={e=>{
                                        e.preventDefault()
                                        props.togglePreview(b, true)
                                    }}
                                    title={b.file}
                                >
                                    {b.file}
                                </a>
                            </td>
                            <td className="text-nowrap">
                                <a 
                                    href={`${b.link_external}`} 
                                    className="d-inline-block text-dark text-truncate"
                                    style={{maxWidth:"150px"}}
                                    target="_blank"
                                    title={b.link_external}
                                >
                                    {b.link_external}
                                </a>
                            </td>
                            <td>{sp.skor}</td>
                        </tr>
                    ))
                })
            })
        })
    }

    return (
        <div className="row">
            <div className="col-12">
                <div class="card">
                    <div className="card-header">
                        <div className="d-flex my-1">
                            <div style={{width:"200px"}} className="me-2">
                                <Select
                                    options={options_kriteria()}
                                    value={options_kriteria().find(f=>f.value==props.filter.id_kriteria)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"id_kriteria", value:e.value}})
                                    }}
                                    placeholder="Pilih kriteria"
                                />
                            </div>
                            <div style={{width:"200px"}} className="me-2">
                                <Select
                                    options={options_ppepp()}
                                    value={options_ppepp().find(f=>f.value==props.filter.id_ppepp)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"id_ppepp", value:e.value}})
                                    }}
                                    placeholder="Pilih ppepp"
                                />
                            </div>
                            <div style={{width:"200px"}} className="me-2">
                                <Select
                                    options={options_sub_ppepp()}
                                    value={options_sub_ppepp().find(f=>f.value==props.filter.id_sub_ppepp)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"id_sub_ppepp", value:e.value}})
                                    }}
                                    placeholder="Pilih sub ppepp"
                                />
                            </div>
                        </div>
                        <div className="d-flex mt-2">
                            <button 
                                type="button"
                                className="btn btn-secondary ms-2 rounded-pill"
                                onClick={downloadExcel}
                            >
                                <FiFileText/> Download Excel
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-custom table-wrap table-sm mb-0 w-100">
                                <thead>
                                    <tr>
                                        <th className="" rowSpan="2" width="50">#</th>
                                        <th className="" rowspan="2">Kriteria</th>
                                        <th className="" rowspan="2" width="80">No. Butir</th>
                                        <th className="" rowSpan="2">PPEPP</th>
                                        <th className="" rowSpan="2">Deskripsi</th>
                                        <th className="" rowspan="2" width="80">No. Urut</th>
                                        <th className="" rowSpan="2">Sub PPEPP</th>
                                        <th className="" colSpan="4">Bukti Sahih</th>
                                    </tr>
                                    <tr>
                                        <th className="">Justifikasi</th>
                                        <th className="" width="150">Dokumen</th>
                                        <th className="" width="150">Link External</th>
                                        <th className="" width="100">Skor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {render_generated_data()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ModalFilePreview=(props)=>{
    
    return (
        <Modal show={props.data.is_open} onHide={props.togglePreview} backdrop="static" size="lg" scrollable>
            <Modal.Header closeButton>
                <h4 className="modal-title">File Preview</h4>
            </Modal.Header>
            <Modal.Body className="p-0" style={{height:"100vh", overflow:"hidden"}}>
                <div className="row h-100">
                    <div className="col-12">
                        <iframe src={props.data.file.link} style={{width:"100%", height:"100%"}}/>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="border-top pt-2">
                <button 
                    type="button" 
                    className="btn btn-link link-dark me-auto" 
                    onClick={props.togglePreview}
                >
                    Tutup
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default Page