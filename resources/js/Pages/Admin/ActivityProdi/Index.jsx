import React, { useEffect, useMemo, useState } from "react"
import Layout from "@/Components/layout"
import { queryClient } from "@/Config/api"
import { toast } from "react-toastify"
import { FiChevronLeft, FiChevronRight, FiEdit, FiPlus, FiRefreshCw, FiTrash, FiTrash2, FiUpload } from "react-icons/fi"
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
import { file_request, user_request, activity_prodi_request } from "@/Config/request"
import { SwitchInput } from "@/Components/ui/input_form"
import { parse_image, parse_pdf } from "@/Config/ocr"
import extract from "@/Config/xlsx_extract"


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        per_page:15,
        last_page:0,
        page:1,
        q:""
    })
    const [tambah_activity, setTambahActivity]=useState({
        is_open:false,
        activity:{
            file_tor_rab:"",
            file_tor:"",
            file_rab:"",
            iku:"",
            ik:"",
            program:"",
            judul_kegiatan:"",
            penanggung_jawab_kegiatan:"",
            data:{},
            is_generating:false
        }
    })
    const [edit_activity, setEditActivity]=useState({
        is_open:false,
        activity:{}
    })

    //DATA/MUTATION
    const gets_activity=useQuery({
        queryKey:["gets_activity", filter],
        queryFn:async()=>activity_prodi_request.gets(filter),
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
        setTambahActivity({
            is_open:!tambah_activity.is_open,
            activity:{
                file_tor_rab:"",
                file_tor:"",
                file_rab:"",
                iku:"",
                ik:"",
                program:"",
                judul_kegiatan:"",
                penanggung_jawab_kegiatan:"",
                data:{},
                is_generating:false
            }
        })
    }
    const toggleEdit=(list={}, show=false)=>{
        setEditActivity({
            is_open:show,
            activity:Object.assign({}, list, {
                is_generating:false
            })
        })
    }

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Master Activity Prodi</h4>
                            <button className="btn btn-primary fw-bold ms-2 rounded-pill" onClick={e=>toggleTambah()}>
                                <FiPlus/> Tambah
                            </button>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_activity} 
                    filter={filter} 
                    setFilter={setFilter}
                    toggleEdit={toggleEdit}
                />
            </Layout>

            <ModalTambah
                data={tambah_activity}
                toggleTambah={toggleTambah}
            />

            <ModalEdit
                data={edit_activity}
                toggleEdit={toggleEdit}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION
    const delete_activity=useMutation({
        mutationFn:(id)=>activity_prodi_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_activity")
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
            title: "Yakin ingin menghapus activity prodi "+list.judul_kegiatan+"?",
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
                delete_activity.mutate(list.id_activity_prodi)
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
                    </div>
                    <div class="card-body">
                        <div className="table-responsive">
                            <table className="table table-hover table-hover table-custom table-wrap table-sm mb-0 w-100">
                                <thead>
                                    <tr>
                                        <th className="" width="50">#</th>
                                        <th className="">IKU</th>
                                        <th className="">IK</th>
                                        <th className="" width="230">Program</th>
                                        <th className="" width="230">Judul Kegiatan</th>
                                        <th className="" width="150">Penanggung Jawab</th>
                                        <th className="" width="50"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!props.data.isFetching?
                                        <>
                                            {props.data.data.data.map((list, idx)=>(
                                                <tr key={list}>
                                                    <td>{(idx+1)+((props.data.data.current_page-1)*props.filter.per_page)}</td>
                                                    <td className="py-0">{list.iku}</td>
                                                    <td>{list.ik}</td>
                                                    <td>{list.program}</td>
                                                    <td>{list.judul_kegiatan}</td>
                                                    <td>{list.penanggung_jawab_kegiatan}</td>
                                                    <td className="text-nowrap py-0">
                                                        <div style={{padding:"5px 0"}}>
                                                            <button type="button" className="btn btn-secondary btn-sm rounded-2" onClick={()=>props.toggleEdit(list, true)}>
                                                                <FiEdit className="icon"/>
                                                            </button>
                                                            {list.role?.privilege!="admin"&&
                                                                <button type="button" className="btn btn-danger btn-sm rounded-2 ms-1" onClick={()=>confirmHapus(list)}>
                                                                    <FiTrash2 className="icon"/>
                                                                </button>
                                                            }
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(props.data.data.data.length==0&&_.isNull(props.data.error))&&
                                                <tr>
                                                    <td colSpan={7} className="text-center">Data tidak ditemukan!</td>
                                                </tr>
                                            }
                                            {!_.isNull(props.data.error)&&
                                                <tr>
                                                    <td colSpan={7} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("gets_activity")}>
                                                        <span className="text-muted">Gagal Memuat Data! &nbsp;<FiRefreshCw/></span>
                                                    </td>
                                                </tr>
                                            }
                                        </>
                                    :
                                        <>
                                            <tr>
                                                <td colSpan={7} className="text-center">
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
    const add_activity=useMutation({
        mutationFn:params=>activity_prodi_request.add(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_activity")
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
                initialValues={props.data.activity}
                onSubmit={(values, actions)=>{
                    const new_values=Object.assign({}, values, {
                        data:Object.assign({}, values.data, {
                            iku:values.iku,
                            ik:values.ik,
                            program:values.program,
                            judul_kegiatan:values.judul_kegiatan,
                            penanggung_jawab_kegiatan:values.penanggung_jawab_kegiatan
                        })
                    })
                    
                    add_activity.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        file_tor_rab:yup.string().optional(),
                        iku:yup.string().required(),
                        ik:yup.string().required(),
                        program:yup.string().required(),
                        judul_kegiatan:yup.string().required(),
                        penanggung_jawab_kegiatan:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Tambah Activity Prodi</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">File TOR - RAB <span className="text-danger">*</span></label>
                                        <div>
                                            <label>
                                                <div className="btn btn-secondary btn-sm cursor-pointer">
                                                    <FiUpload className="icon"/> Upload
                                                </div>
                                                <input
                                                    type="file"
                                                    style={{display:"none"}}
                                                    accept=".xlsx"
                                                    onChange={e=>{
                                                        file_request.uploadDokumen(e.target.files[0])
                                                        .then(data=>{
                                                            formik.setFieldValue("file_tor_rab", data.data.file)
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
                                                className="btn btn-dark btn-sm ms-2"
                                                disabled={formik.values.file_tor_rab=="" || formik.values.is_generating}
                                                onClick={async e=>{
                                                    const url=`/storage/${formik.values.file_tor_rab}`
                                                    // const url="/tor-rab.xlsx"
                                                    
                                                    formik.setFieldValue("is_generating", true)
                                                    const result=await extract(url)
                                                    formik.setFieldValue("is_generating", false)
                                                    
                                                    // const form=["iku", "ik", "program", "judul_kegiatan"]
                                                    formik.setFieldValue("iku", result.data[0])
                                                    formik.setFieldValue("ik", result.data[1])
                                                    formik.setFieldValue("program", "")
                                                    formik.setFieldValue("judul_kegiatan", result.data[4])
                                                    formik.setFieldValue("penanggung_jawab_kegiatan", "")
                                                    formik.setFieldValue("data", {
                                                        iku:result.data[0],
                                                        ik:result.data[1],
                                                        program:"",
                                                        judul_kegiatan:result.data[4],
                                                        penanggung_jawab_kegiatan:"",
                                                        kegiatan:result.data[2],
                                                        sub_kegiatan:result.data[3]
                                                    })
                                                }}
                                            >
                                                {formik.values.is_generating?<>Generating...</>:<>Generate Data</>}
                                            </button>
                                        </div>
                                        <div className="mt-1">
                                            {formik.values.file_tor_rab!=""?
                                                <a href={`/storage/${formik.values.file_tor_rab}`} target="_blank" className="text-dark text-truncate">{formik.values.file_tor_rab}</a>
                                            :
                                                <span className="text-dark">Tidak ada berkas dipilih!</span>
                                            }
                                        </div>
                                        <div className="form-text text-muted mt-2">
                                            <ol>
                                                <li>Format/Template <a href="/tor-rab.xlsx" target="_blank">XLSX</a></li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr className="mb-1 mt-4"/>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Indikator Kinerja Utama (IKU) <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="iku"
                                            onChange={formik.handleChange}
                                            value={formik.values.iku}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Indikator Kinerja Kegiatan (IK) <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="ik"
                                            onChange={formik.handleChange}
                                            value={formik.values.ik}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Program <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="program"
                                            onChange={formik.handleChange}
                                            value={formik.values.program}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Judul Kegiatan <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="judul_kegiatan"
                                            onChange={formik.handleChange}
                                            value={formik.values.judul_kegiatan}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Penanggung Jawab Kegiatan <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="penanggung_jawab_kegiatan"
                                            onChange={formik.handleChange}
                                            value={formik.values.penanggung_jawab_kegiatan}
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
    const update_activity=useMutation({
        mutationFn:params=>activity_prodi_request.update(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_activity")
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
                initialValues={props.data.activity}
                onSubmit={(values, actions)=>{
                    const new_values=Object.assign({}, values, {
                        data:Object.assign({}, values.data, {
                            iku:values.iku,
                            ik:values.ik,
                            program:values.program,
                            judul_kegiatan:values.judul_kegiatan,
                            penanggung_jawab_kegiatan:values.penanggung_jawab_kegiatan
                        })
                    })
                    
                    update_activity.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        file_tor_rab:yup.string().optional(),
                        iku:yup.string().required(),
                        ik:yup.string().required(),
                        program:yup.string().required(),
                        judul_kegiatan:yup.string().required(),
                        penanggung_jawab_kegiatan:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Activity Prodi</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">File TOR - RAB <span className="text-danger">*</span></label>
                                        <div>
                                            <label>
                                                <div className="btn btn-secondary btn-sm cursor-pointer">
                                                    <FiUpload className="icon"/> Upload
                                                </div>
                                                <input
                                                    type="file"
                                                    style={{display:"none"}}
                                                    accept=".xlsx"
                                                    onChange={e=>{
                                                        file_request.uploadDokumen(e.target.files[0])
                                                        .then(data=>{
                                                            formik.setFieldValue("file_tor_rab", data.data.file)
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
                                                className="btn btn-dark btn-sm ms-2"
                                                disabled={formik.values.file_tor_rab=="" || formik.values.is_generating}
                                                onClick={async e=>{
                                                    const url=`/storage/${formik.values.file_tor_rab}`
                                                    // const url="/tor-rab.xlsx"
                                                    
                                                    formik.setFieldValue("is_generating", true)
                                                    const result=await extract(url)
                                                    formik.setFieldValue("is_generating", false)
                                                    
                                                    // const form=["iku", "ik", "program", "judul_kegiatan"]
                                                    formik.setFieldValue("iku", result.data[0])
                                                    formik.setFieldValue("ik", result.data[1])
                                                    formik.setFieldValue("program", "")
                                                    formik.setFieldValue("judul_kegiatan", result.data[4])
                                                    formik.setFieldValue("penanggung_jawab_kegiatan", "")
                                                    formik.setFieldValue("data", {
                                                        iku:result.data[0],
                                                        ik:result.data[1],
                                                        program:"",
                                                        judul_kegiatan:result.data[4],
                                                        penanggung_jawab_kegiatan:"",
                                                        kegiatan:result.data[2],
                                                        sub_kegiatan:result.data[3]
                                                    })
                                                }}
                                            >
                                                {formik.values.is_generating?<>Generating...</>:<>Generate Data</>}
                                            </button>
                                        </div>
                                        <div className="mt-1">
                                            {formik.values.file_tor_rab!=""?
                                                <a href={`/storage/${formik.values.file_tor_rab}`} target="_blank" className="text-dark text-truncate">{formik.values.file_tor_rab}</a>
                                            :
                                                <span className="text-dark">Tidak ada berkas dipilih!</span>
                                            }
                                        </div>
                                        <div className="form-text text-muted mt-2">
                                            <ol>
                                                <li>Format/Template <a href="/tor-rab.xlsx" target="_blank">XLSX</a></li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr className="mb-1 mt-4"/>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Indikator Kinerja Utama (IKU) <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="iku"
                                            onChange={formik.handleChange}
                                            value={formik.values.iku}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Indikator Kinerja Kegiatan (IK) <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="ik"
                                            onChange={formik.handleChange}
                                            value={formik.values.ik}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Program <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="program"
                                            onChange={formik.handleChange}
                                            value={formik.values.program}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Judul Kegiatan <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="judul_kegiatan"
                                            onChange={formik.handleChange}
                                            value={formik.values.judul_kegiatan}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Penanggung Jawab Kegiatan <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="penanggung_jawab_kegiatan"
                                            onChange={formik.handleChange}
                                            value={formik.values.penanggung_jawab_kegiatan}
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


export default Page