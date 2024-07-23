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
import { file_request, user_request, activity_prodi_request, ppepp_kriteria_request, ppepp_request, bukti_request } from "@/Config/request"
import { SwitchInput } from "@/Components/ui/input_form"
import { parse_image, parse_pdf } from "@/Config/ocr"
import extract from "@/Config/xlsx_extract"


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        per_page:15,
        last_page:0,
        page:1,
        q:"",
        type:"",
        id_ppepp:"",
        id_kriteria:props.id_kriteria
    })
    const [tambah_bukti, setTambahBukti]=useState({
        is_open:false,
        bukti:{
            type:"",
            id_ppepp:"",
            deskripsi:"",
            file:"",
            link:""
        }
    })
    const [edit_bukti, setEditBukti]=useState({
        is_open:false,
        bukti:{}
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
                type:filter.type,
                id_ppepp:"",
                deskripsi:"",
                file:"",
                link:""
            }
        })
    }
    const toggleEdit=(list={}, show=false)=>{
        setEditBukti({
            is_open:show,
            bukti:list
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
                    options_sub_ppepp={options_sub_ppepp}
                    filter={filter} 
                    setFilter={setFilter}
                    toggleEdit={toggleEdit}
                />
            </Layout>

            <ModalTambah
                data={tambah_bukti}
                options_sub_ppepp={options_sub_ppepp}
                toggleTambah={toggleTambah}
            />

            <ModalEdit
                data={edit_bukti}
                toggleEdit={toggleEdit}
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
    const options_type=()=>{
        return [
            {label:"Semua type", value:""},
            {label:"Penetapan", value:"penetapan"},
            {label:"Pelaksanaan", value:"pelaksanaan"},
            {label:"Evaluasi", value:"evaluasi"},
            {label:"Pengendalian", value:"pengendalian"}
        ]
    }
    const options_sub_ppepp=()=>{
        const data=props.options_sub_ppepp.data.data.map(d=>{
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
                                    options={options_type()}
                                    value={options_type().find(f=>f.value==props.filter.type)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"type", value:e.value}})
                                    }}
                                    placeholder="Pilih type"
                                />
                            </div>
                            <div style={{width:"200px"}} className="me-2">
                                <Select
                                    options={options_sub_ppepp()}
                                    value={options_sub_ppepp().find(f=>f.value==props.filter.id_ppepp)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"id_ppepp", value:e.value}})
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
                                        <th className="" colSpan="5">Bukti Sahih</th>
                                        <th className="" rowSpan="2" width="50"></th>
                                    </tr>
                                    <tr>
                                        <th className="" width="100">Type</th>
                                        <th className="">Justifikasi</th>
                                        <th className="">Dokumen</th>
                                        <th className="">Link</th>
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
                                                    <td>{list.type}</td>
                                                    <td className="text-prewrap">{list.deskripsi}</td>
                                                    <td>
                                                        <a 
                                                            href={`/storage/${list.link}`} 
                                                            className="text-dark text-truncate"
                                                            onClick={e=>{
                                                                e.preventDefault()
                                                                window.open(`/storage/${list.link}`, 'dokumen', 'width=800,height=700')
                                                            }}
                                                        >
                                                            {list.file}
                                                        </a>
                                                    </td>
                                                    <td className="text-nowrap">{`/storage/${list.link}`}</td>
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
                                                    <td colSpan={10} className="text-center">Data tidak ditemukan!</td>
                                                </tr>
                                            }
                                            {!_.isNull(props.data.error)&&
                                                <tr>
                                                    <td colSpan={10} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("gets_bukti")}>
                                                        <span className="text-muted">Gagal Memuat Data! &nbsp;<FiRefreshCw/></span>
                                                    </td>
                                                </tr>
                                            }
                                        </>
                                    :
                                        <>
                                            <tr>
                                                <td colSpan={10} className="text-center">
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
    const options_type=()=>{
        return [
            {label:"Pilih type", value:""},
            {label:"Penetapan", value:"penetapan"},
            {label:"Pelaksanaan", value:"pelaksanaan"},
            {label:"Evaluasi", value:"evaluasi"},
            {label:"Pengendalian", value:"pengendalian"}
        ]
    }
    const options_sub_ppepp=()=>{
        const data=props.options_sub_ppepp.data.data.map(d=>{
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
                                        <label className="my-1 me-2">Type <span className="text-danger">*</span></label>
                                        <Select
                                            options={options_type()}
                                            value={options_type().find(f=>f.value==formik.values.type)}
                                            onChange={e=>{
                                                formik.setFieldValue("type", e.value)
                                            }}
                                            placeholder="Pilih type"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2">Sub PPEPP <span className="text-danger">*</span></label>
                                        <Select
                                            options={options_sub_ppepp()}
                                            value={options_sub_ppepp().find(f=>f.value==formik.values.id_ppepp)}
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
                                        <label className="my-1 me-2" for="country">File</label>
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
                                                                        link:data.data.file
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
                                                        href={`/storage/${formik.values.link}`} 
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


export default Page