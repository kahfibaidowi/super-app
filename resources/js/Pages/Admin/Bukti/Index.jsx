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
import * as ExcelJS from "exceljs"
import FileSaver from "file-saver"
import { sheetColumn } from "@/Config/helpers"


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        per_page:15,
        last_page:0,
        page:1,
        q:"",
        type:"",
        id_ppepp:"",
        id_sub_ppepp:"",
        id_kriteria:props.id_kriteria
    })
    const [tambah_bukti, setTambahBukti]=useState({
        is_open:false,
        bukti:{
            type:"",
            id_ppepp:"",
            deskripsi:"",
            file:"",
            link:"",
            link_external:""
        }
    })
    const [edit_bukti, setEditBukti]=useState({
        is_open:false,
        bukti:{}
    })
    const [file_preview, setFilePreview]=useState({
        is_open:false,
        file:{}
    })

    //DATA/MUTATION
    const gets_bukti=useQuery({
        queryKey:["gets_bukti", filter],
        queryFn:async()=>bukti_request.gets(filter),
        initialData:{
            data:[],
            last_page:0,
            first_page:1,
            current_page:1,
            total:0
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false
    })
    const options_ppepp=useQuery({
        queryKey:["options_ppepp"],
        queryFn:async()=>ppepp_request.gets({type:"ppepp", id_kriteria:props.id_kriteria}),
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
        queryFn:async()=>ppepp_request.gets({type:"sub_ppepp", id_kriteria:props.id_kriteria}),
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
    const toggleTambah=()=>{
        setTambahBukti({
            is_open:!tambah_bukti.is_open,
            bukti:{
                type:filter.id_ppepp,
                id_ppepp:filter.id_sub_ppepp,
                deskripsi:"",
                file:"",
                link:"",
                link_external:""
            }
        })
    }
    const toggleEdit=(list={}, show=false)=>{
        setEditBukti({
            is_open:show,
            bukti:list
        })
    }
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
                            <h4 class="page-title">Master Bukti</h4>
                            <button className="btn btn-primary fw-bold ms-2 rounded-pill" onClick={e=>toggleTambah()}>
                                <FiPlus/> Tambah
                            </button>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_bukti} 
                    options_ppepp={options_ppepp}
                    options_sub_ppepp={options_sub_ppepp}
                    filter={filter} 
                    setFilter={setFilter}
                    toggleEdit={toggleEdit}
                    togglePreview={togglePreview}
                />
            </Layout>

            <ModalTambah
                data={tambah_bukti}
                options_ppepp={options_ppepp}
                options_sub_ppepp={options_sub_ppepp}
                toggleTambah={toggleTambah}
            />

            <ModalEdit
                data={edit_bukti}
                toggleEdit={toggleEdit}
            />

            <ModalFilePreview
                data={file_preview}
                togglePreview={togglePreview}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION
    const delete_bukti=useMutation({
        mutationFn:(id)=>bukti_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_bukti")
        },
        onError:err=>{
            toast.error("Remove Data Failed!", {position:"bottom-center"})
        }
    })

    //VALUES

    //FILTER
    
    const options_ppepp=()=>{
        const data=props.options_ppepp.data.data.map(d=>{
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
    const setPerPage=e=>{
        const target=e.target

        props.setFilter(
            Map(props.filter)
            .set("per_page", target.value)
            .set("page", 1)
            .toJS()
        )
    }
    const goToPage=page=>{
        props.setFilter(
            Map(props.filter)
            .set("page", page)
            .toJS()
        )
    }
    const typeFilter=e=>{
        const target=e.target

        if(target.name=="q"){
            if(timeout) clearTimeout(timeout)
            timeout=setTimeout(()=>{
                props.setFilter(
                    Map(props.filter)
                    .set(target.name, target.value)
                    .set("page", 1)
                    .toJS()
                )
            }, 500)
        }
        else if(target.name=="id_ppepp"){
            props.setFilter(
                Map(props.filter)
                .set(target.name, target.value)
                .set("id_sub_ppepp", "")
                .set("page", 1)
                .toJS()
            )
        }
        else{
            props.setFilter(
                Map(props.filter)
                .set(target.name, target.value)
                .set("page", 1)
                .toJS()
            )
        }
    }
    let timeout=0

    //ACTIONS
    const downloadExcel=async()=>{
        let aoa_bukti=[]
        let rows_merge=[]

        //header
        aoa_bukti=aoa_bukti.concat([
            [
                "#",
                "PPEPP",
                "Deskripsi",
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
            {s:{r:1,c:5}, e:{r:1,c:8}}
        ])

        //content
        const bukti=props.data.data.data
        for(var i=0; i<bukti.length; i++){
            aoa_bukti=aoa_bukti.concat([
                [
                    ((i+1)+((props.data.data.current_page-1)*props.filter.per_page)).toString(),
                    bukti[i].sub_ppepp.parent.nama_ppepp.toString(),
                    bukti[i].sub_ppepp.parent.deskripsi.toString(),
                    bukti[i].sub_ppepp.nama_ppepp.toString(),
                    bukti[i].deskripsi.toString(),
                    bukti[i].file.toString(),
                    bukti[i].link_external.toString(),
                    bukti[i].sub_ppepp.skor.toString()
                ]
            ])
        }

        //processing
        const workBook=new ExcelJS.Workbook()
        const workSheet1=workBook.addWorksheet("Sheet 1")
        workSheet1.addRows(aoa_bukti)
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

            FileSaver.saveAs(new Blob([data]), date+"__bukti.xlsx")

        })
        .catch(err => {
            toast.error("Failed to create generated spreadsheet!", {position:"bottom-center"})
        })
    }
    const confirmHapus=(list)=>{
        MySwal.fire({
            title: "Yakin ingin menghapus data?",
            text: "Data yang sudah dihapus mungkin tidak bisa dikembalikan lagi!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus Data!',
            cancelButtonText: 'Batal!',
            reverseButtons: true,
            customClass:{
                popup:"w-auto",
                confirmButton:"btn btn-danger rounded-3 fw-bold ms-2",
                cancelButton:"btn btn-link link-dark rounded-3 fw-bold"
            },
            buttonsStyling:false
        })
        .then(result=>{
            if(result.isConfirmed){
                delete_bukti.mutate(list.id_bukti)
            }
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
                            <div style={{width:"200px"}} className="me-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    name="q"
                                    onChange={typeFilter}
                                    defaultValue={props.filter.q}
                                    placeholder="Cari ..."
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
                            <table className="table table-hover table-hover table-custom table-wrap table-sm mb-0 w-100">
                                <thead>
                                    <tr>
                                        <th className="" rowSpan="2" width="50">#</th>
                                        <th className="" rowSpan="2">PPEPP</th>
                                        <th className="" rowSpan="2">Deskripsi</th>
                                        <th className="" rowSpan="2">Sub PPEPP</th>
                                        <th className="" colSpan="4">Bukti Sahih</th>
                                        <th className="" rowSpan="2" width="50"></th>
                                    </tr>
                                    <tr>
                                        <th className="">Justifikasi</th>
                                        <th className="" width="150">Dokumen</th>
                                        <th className="" width="150">Link External</th>
                                        <th className="" width="100">Skor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!props.data.isFetching?
                                        <>
                                            {props.data.data.data.map((list, idx)=>(
                                                <tr key={list}>
                                                    <td>{(idx+1)+((props.data.data.current_page-1)*props.filter.per_page)}</td>
                                                    <td>{list.sub_ppepp.parent.nama_ppepp}</td>
                                                    <td className="text-prewrap">{list.sub_ppepp.parent.deskripsi}</td>
                                                    <td>{list.sub_ppepp.nama_ppepp}</td>
                                                    <td className="text-prewrap">{list.deskripsi}</td>
                                                    <td>
                                                        <a 
                                                            href={`${list.link}`} 
                                                            className="d-inline-block text-dark text-truncate"
                                                            style={{maxWidth:"150px"}}
                                                            onClick={e=>{
                                                                e.preventDefault()
                                                                props.togglePreview(list, true)
                                                            }}
                                                            title={list.file}
                                                        >
                                                            {list.file}
                                                        </a>
                                                    </td>
                                                    <td className="text-nowrap">
                                                        <a 
                                                            href={`${list.link_external}`} 
                                                            className="d-inline-block text-dark text-truncate"
                                                            style={{maxWidth:"150px"}}
                                                            target="_blank"
                                                            title={list.link_external}
                                                        >
                                                            {list.link_external}
                                                        </a>
                                                    </td>
                                                    <td>{list.sub_ppepp.skor}</td>
                                                    <td className="text-nowrap py-0">
                                                        <div style={{padding:"5px 0"}}>
                                                            <button type="button" className="btn btn-secondary btn-sm rounded-2" onClick={()=>props.toggleEdit(list, true)}>
                                                                <FiEdit className="icon"/>
                                                            </button>
                                                            <button type="button" className="btn btn-danger btn-sm rounded-2 ms-1" onClick={()=>confirmHapus(list)}>
                                                                <FiTrash2 className="icon"/>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(props.data.data.data.length==0&&_.isNull(props.data.error))&&
                                                <tr>
                                                    <td colSpan={9} className="text-center">Data tidak ditemukan!</td>
                                                </tr>
                                            }
                                            {!_.isNull(props.data.error)&&
                                                <tr>
                                                    <td colSpan={9} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("gets_bukti")}>
                                                        <span className="text-muted">Gagal Memuat Data! &nbsp;<FiRefreshCw/></span>
                                                    </td>
                                                </tr>
                                            }
                                        </>
                                    :
                                        <>
                                            <tr>
                                                <td colSpan={9} className="text-center">
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <Spinner
                                                            as="span"
                                                            animation="border"
                                                            size="sm"
                                                            role="status"
                                                            aria-hidden="true"
                                                            className="me-2"
                                                        />
                                                        Loading...
                                                    </div>
                                                </td>
                                            </tr>
                                        </>
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="card-footer"  style={{position:"sticky", bottom:0}}>
                        <div className="d-flex align-items-center my-1">
                            <div className="d-flex flex-column">
                                <div>Halaman {props.data.data.current_page} dari {props.data.data.last_page} ({props.data.data.total} data)</div>
                            </div>
                            <div className="d-flex align-items-center me-auto ms-3">
                                <select className="form-select" name="per_page" value={props.filter.per_page} onChange={setPerPage}>
                                    <option value="15">15 Data</option>
                                    <option value="25">25 Data</option>
                                    <option value="50">50 Data</option>
                                    <option value="100">100 Data</option>
                                </select>
                            </div>
                            <div className="d-flex ms-3">
                                <button 
                                    className={clsx(
                                        "btn",
                                        "border-0",
                                        {"btn-secondary":props.data.data.current_page>1}
                                    )}
                                    disabled={props.data.data.current_page<=1}
                                    onClick={()=>goToPage(props.data.data.current_page-1)}
                                >
                                    <FiChevronLeft/>
                                    Prev
                                </button>
                                <button 
                                    className={clsx(
                                        "btn",
                                        "border-0",
                                        {"btn-secondary":props.data.data.current_page<props.data.data.last_page},
                                        "ms-2"
                                    )}
                                    disabled={props.data.data.current_page>=props.data.data.last_page}
                                    onClick={()=>goToPage(props.data.data.current_page+1)}
                                >
                                    Next
                                    <FiChevronRight/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ModalTambah=(props)=>{

    //MUTATION
    const add_bukti=useMutation({
        mutationFn:params=>bukti_request.add(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_bukti")
            props.toggleTambah()
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Insert Data Failed! ", {position:"bottom-center"})
        }
    })

    //FILTER
    const options_ppepp=()=>{
        const data=props.options_ppepp.data.data.map(d=>{
            return {
                label:d.nama_ppepp,
                value:d.id_ppepp
            }
        })

        return [{label:"Pilih ppepp", value:""}].concat(data)
    }
    const options_sub_ppepp=(ppepp)=>{
        const data=props.options_sub_ppepp.data.data.filter(f=>f.nested==ppepp).map(d=>{
            return {
                label:d.nama_ppepp,
                value:d.id_ppepp
            }
        })

        return [{label:"Pilih sub ppepp", value:""}].concat(data)
    }
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleTambah} backdrop="static" size="md" scrollable>
            <Formik
                initialValues={props.data.bukti}
                onSubmit={(values, actions)=>{
                    const new_values=values
                    
                    add_bukti.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        type:yup.string().required(),
                        id_ppepp:yup.string().required(),
                        deskripsi:yup.string().optional(),
                        file:yup.string().required(),
                        link:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Tambah Bukti</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2">PPEPP <span className="text-danger">*</span></label>
                                        <Select
                                            options={options_ppepp()}
                                            value={options_ppepp().find(f=>f.value==formik.values.type)}
                                            onChange={e=>{
                                                formik.setValues(
                                                    Object.assign({}, formik.values, {
                                                        type:e.value,
                                                        id_ppepp:""
                                                    })
                                                )
                                            }}
                                            placeholder="Pilih ppepp"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2">Sub PPEPP <span className="text-danger">*</span></label>
                                        <Select
                                            options={options_sub_ppepp(formik.values.type)}
                                            value={options_sub_ppepp(formik.values.type).find(f=>f.value==formik.values.id_ppepp)}
                                            onChange={e=>{
                                                formik.setFieldValue("id_ppepp", e.value)
                                            }}
                                            placeholder="Pilih sub ppepp"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Justifikasi</label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            name="deskripsi"
                                            onChange={e=>formik.setFieldValue("deskripsi", e.target.value)}
                                            value={formik.values.deskripsi}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">File/Dokumen</label>
                                        <div className="d-flex flex-column">
                                            <div>
                                                <label>
                                                    <div className="btn btn-secondary btn-sm cursor-pointer">
                                                        <FiUpload className="icon"/> Upload
                                                    </div>
                                                    <input
                                                        type="file"
                                                        style={{display:"none"}}
                                                        accept=".jpg, .png, .pdf, .doc, .docx, .xls, .xlsx"
                                                        onChange={e=>{
                                                            file_request.uploadDokumen(e.target.files[0])
                                                            .then(data=>{
                                                                formik.setValues(
                                                                    Object.assign({}, formik.values, {
                                                                        file:data.data.file_name,
                                                                        link:"/storage/"+data.data.file
                                                                    }),
                                                                    true
                                                                )
                                                            })
                                                            .catch(err=>{
                                                                if(err.response.status===401){
                                                                    router.visit("/")
                                                                }
                                                                toast.error("Upload File Failed!", {position:"bottom-center"})
                                                            })
                                                        }}
                                                    />
                                                </label>
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm ms-2"
                                                    onClick={e=>{
                                                        formik.setFieldValue("file", "")
                                                        formik.setFieldValue("link", "")
                                                    }}
                                                >
                                                    <i><FiTrash2/></i>
                                                </button>
                                            </div>
                                            <div className="mt-1">
                                                {formik.values.file!=""?
                                                    <a 
                                                        href={`${formik.values.link}`} 
                                                        target="_blank" 
                                                        className="text-dark text-truncate"
                                                    >
                                                        {formik.values.file}
                                                    </a>
                                                :
                                                    <span className="text-dark">Tidak ada berkas dipilih!</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Link External</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="link_external"
                                            onChange={formik.handleChange}
                                            value={formik.values.link_external}
                                            placeholder="https://"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="border-top pt-2">
                            <button 
                                type="button" 
                                className="btn btn-link link-dark me-auto" 
                                onClick={props.toggleTambah}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                            >
                                Save Changes
                            </button>
                        </Modal.Footer>
                    </form>
                )}
            </Formik>
        </Modal>
    )
}

const ModalEdit=(props)=>{

    //MUTATION
    const update_bukti=useMutation({
        mutationFn:params=>bukti_request.update(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_bukti")
            props.toggleEdit()
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
        }
    })

    //FILTER
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleEdit} backdrop="static" size="md">
            <Formik
                initialValues={props.data.bukti}
                onSubmit={(values, actions)=>{
                    const new_values=values
                    
                    update_bukti.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        deskripsi:yup.string().optional()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Bukti</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Justifikasi</label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            name="deskripsi"
                                            onChange={formik.handleChange}
                                            value={formik.values.deskripsi}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="border-top pt-2">
                            <button 
                                type="button" 
                                className="btn btn-link link-dark me-auto" 
                                onClick={props.toggleEdit}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={formik.isSubmitting||!(formik.isValid)}
                            >
                                Save Changes
                            </button>
                        </Modal.Footer>
                    </form>
                )}
            </Formik>
        </Modal>
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