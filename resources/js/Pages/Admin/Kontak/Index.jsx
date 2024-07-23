import React, { useEffect, useMemo, useState } from "react"
import Layout from "@/Components/layout"
import { queryClient } from "@/Config/api"
import { toast } from "react-toastify"
import { FiChevronLeft, FiChevronRight, FiEdit, FiMoreVertical, FiPlus, FiRefreshCw, FiTrash, FiTrash2, FiUpload } from "react-icons/fi"
import Avatar from "@/Components/ui/avatar"
import { Button, Dropdown, Modal, Spinner } from "react-bootstrap"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'
import {Select} from "@/Components/ui/select"
import { Formik } from "formik"
import * as yup from "yup"
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import _, { object, range } from "underscore"
import { Map } from "immutable"
import { router } from "@inertiajs/react"
import clsx from "clsx"
import axios from "axios"
import { file_request, user_request, activity_prodi_request, ppepp_kriteria_request, kontak_request } from "@/Config/request"
import { SwitchInput } from "@/Components/ui/input_form"
import { parse_image, parse_pdf } from "@/Config/ocr"
import extract from "@/Config/xlsx_extract"
import { NumericFormat } from "react-number-format"
import DataGrid from "react-data-grid"
import * as ExcelJS from "exceljs"
import { readFile } from "@/Config/helpers"


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        per_page:15,
        last_page:0,
        page:1,
        q:""
    })
    const [tambah_kontak, setTambahKontak]=useState({
        is_open:false,
        kontak:{
            no_hp:"",
            nama_lengkap:""
        }
    })
    const [edit_kontak, setEditKontak]=useState({
        is_open:false,
        kontak:{}
    })
    const [import_kontak, setImportKontak]=useState({
        is_open:false,
        kontak:{
            data:[]
        }
    })

    //DATA/MUTATION
    const gets_kontak=useQuery({
        queryKey:["gets_kontak", filter],
        queryFn:async()=>kontak_request.gets(filter),
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

    //ACTIONS
    const toggleTambah=()=>{
        setTambahKontak({
            is_open:!tambah_kontak.is_open,
            kontak:{
                no_hp:"",
                nama_lengkap:""
            }
        })
    }
    const toggleEdit=(list={}, show=false)=>{
        setEditKontak({
            is_open:show,
            kontak:list
        })
    }
    const toggleImport=(list={}, show=false)=>{
        setImportKontak({
            is_open:show,
            kontak:list
        })
    }

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Master Kontak</h4>
                            <button className="btn btn-primary fw-bold ms-2 rounded-pill" onClick={e=>toggleTambah()}>
                                <FiPlus/> Tambah
                            </button>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_kontak} 
                    filter={filter} 
                    setFilter={setFilter}
                    toggleEdit={toggleEdit}
                    toggleImport={toggleImport}
                />
            </Layout>

            <ModalTambah
                data={tambah_kontak}
                toggleTambah={toggleTambah}
            />

            <ModalEdit
                data={edit_kontak}
                toggleEdit={toggleEdit}
            />

            <ModalImport
                data={import_kontak}
                toggleImport={toggleImport}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION
    const delete_kontak=useMutation({
        mutationFn:(id)=>kontak_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_kontak")
        },
        onError:err=>{
            toast.error("Remove Data Failed!", {position:"bottom-center"})
        }
    })

    //VALUES

    //FILTER
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
    const confirmHapus=(list)=>{
        MySwal.fire({
            title: "Yakin ingin menghapus Data?",
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
                delete_kontak.mutate(list.id_kontak)
            }
        })
    }
    const generateFromExcel=async(file)=>{
        const workBook=new ExcelJS.Workbook()
        const buffer=await readFile(file)

        const file_excel=await workBook.xlsx.load(buffer)
        const workSheet=file_excel.getWorksheet(1)

        let imported=[]

        workSheet.eachRow((row, row_num)=>{
            if(row_num>1){
                if(!_.isNull(row.getCell(1).value)){
                    imported=imported.concat([
                        {
                            idx:row_num-2,
                            no_hp:row.getCell(1).value.toString(),
                            nama_lengkap:!_.isNull(row.getCell(2).value)?row.getCell(2).value:row.getCell(1).value.toString()
                        }
                    ])
                }
            }
        })

        props.toggleImport({data:imported}, true)
    }

    return (
        <div className="row">
            <div className="col-12">
                <div class="card">
                    <div className="card-header">
                        <div className="d-flex">
                            <div className="d-flex my-1">
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
                            <div className="ms-auto d-flex">
                                <Dropdown align="end">
                                    <Dropdown.Toggle variant="light" className="btn-icon ms-1 py-1 px-2">
                                        <FiMoreVertical className="icon" size={18}/>
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item 
                                            href={`/template_kontak.xlsx`}
                                            target="_blank"
                                        >
                                            Download Template Excel
                                        </Dropdown.Item>
                                        <label className="w-100">
                                            <Dropdown.Item className="d-block w-100 cursor-pointer" as="span">
                                                Import dari Template
                                            </Dropdown.Item>
                                            <input
                                                type="file"
                                                name="file"
                                                onChange={e=>{
                                                    generateFromExcel(e.target.files[0])
                                                }}
                                                style={{display:"none"}}
                                                accept=".xlsx"
                                            />
                                        </label>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover table-hover table-custom table-wrap table-sm mb-0 w-100">
                                <thead>
                                    <tr>
                                        <th className="" width="50">#</th>
                                        <th className="">No HP</th>
                                        <th className="">Nama Lengkap</th>
                                        <th className="" width="50"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!props.data.isFetching?
                                        <>
                                            {props.data.data.data.map((list, idx)=>(
                                                <tr key={list}>
                                                    <td>{(idx+1)+((props.data.data.current_page-1)*props.filter.per_page)}</td>
                                                    <td>{list.no_hp}</td>
                                                    <td>{list.nama_lengkap}</td>
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
                                                    <td colSpan={4} className="text-center">Data tidak ditemukan!</td>
                                                </tr>
                                            }
                                            {!_.isNull(props.data.error)&&
                                                <tr>
                                                    <td colSpan={4} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("gets_kontak")}>
                                                        <span className="text-muted">Gagal Memuat Data! &nbsp;<FiRefreshCw/></span>
                                                    </td>
                                                </tr>
                                            }
                                        </>
                                    :
                                        <>
                                            <tr>
                                                <td colSpan={4} className="text-center">
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
                                <select className="form-select" name="per_page" value={props.data.data.per_page} onChange={setPerPage}>
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
    const add_kontak=useMutation({
        mutationFn:params=>kontak_request.add(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_kontak")
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
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleTambah} backdrop="static" size="md" scrollable>
            <Formik
                initialValues={props.data.kontak}
                onSubmit={(values, actions)=>{
                    const new_values=values
                    
                    add_kontak.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        no_hp:yup.string().required(),
                        nama_lengkap:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Tambah Kontak</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">No HP <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            placeholder="08xxxxxx"
                                            name="no_hp"
                                            onKeyDown={e=>{
                                                const num=range(0, 10)
                                                    .map(l=>l.toString())
                                                    .concat(["Enter", "Backspace", "Tab"])

                                                if(!num.includes(e.key)) {
                                                    e.preventDefault()
                                                }
                                            }}
                                            onChange={formik.handleChange}
                                            value={formik.values.no_hp}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Nama Lengkap</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_lengkap"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_lengkap}
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
    const update_kontak=useMutation({
        mutationFn:params=>kontak_request.update(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_kontak")
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
                initialValues={props.data.kontak}
                onSubmit={(values, actions)=>{
                    const new_values=values
                    
                    update_kontak.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        nama_lengkap:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Kontak</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">No HP <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            placeholder="08xxxxxx"
                                            name="no_hp"
                                            value={formik.values.no_hp}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Nama Lengkap</label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_lengkap"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_lengkap}
                                        />
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

const ModalImport=(props)=>{

    //MUTATION
    const upsert_multiple_kontak=useMutation({
        mutationFn:params=>kontak_request.upsert_multiple(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_kontak")
            props.toggleImport()
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
        }
    })

    //VALUES
    const columns=[
        {
            key:'no',
            name:'No.',
            width: 30,
            frozen: true,
            resizable: true,
            renderCell:({row})=>{
                return <span>{row.idx+1}</span>
            }
        },
        {
            key: 'no_hp',
            name: 'No. HP',
            resizable: true,
            renderCell:({row})=>{
                return <span>{row.no_hp}</span>
            }
        },
        {
            key: 'nama_lengkap',
            name: 'Nama Lengkap',
            resizable: true,
            renderCell:({row})=>{
                return <span>{row.nama_lengkap}</span>
            }
        }
    ]

    return (
        <Modal show={props.data.is_open} onHide={props.toggleImport} backdrop="static" size="md">
            <Formik
                initialValues={props.data.kontak}
                onSubmit={(values, actions)=>{
                    const new_values={
                        kontak:values.data
                    }
                    
                    upsert_multiple_kontak.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        data:yup.array().optional()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Preview Import Excel Data Kontak</h4>
                        </Modal.Header>
                        <Modal.Body className="p-0">
                            <DataGrid
                                rows={formik.values.data}
                                columns={columns}
                                className={clsx("rdg-light","fill-grid")}
                                rowHeight={25}
                                headerRowHeight={40}
                                style={{height:"300px"}}
                                renderers
                            />
                        </Modal.Body>
                        <Modal.Footer className="border-top pt-2">
                            <button 
                                type="button" 
                                className="btn btn-link link-dark me-auto" 
                                onClick={(e)=>props.toggleImport}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={formik.isSubmitting||!(formik.isValid)}
                            >
                                <FiUpload className="btn-icon-prepend"/>
                                Import Excel
                            </button>
                        </Modal.Footer>
                    </form>
                )}
            </Formik>
        </Modal>
    )
}


export default Page