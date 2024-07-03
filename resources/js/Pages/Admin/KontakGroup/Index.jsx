import React, { useEffect, useMemo, useState } from "react"
import Layout from "@/Components/layout"
import { queryClient } from "@/Config/api"
import { toast } from "react-toastify"
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiCircle, FiEdit, FiPlus, FiRefreshCw, FiTrash, FiTrash2, FiUpload } from "react-icons/fi"
import Avatar from "@/Components/ui/avatar"
import { Dropdown, DropdownMenu, DropdownToggle, Modal, Offcanvas, Spinner } from "react-bootstrap"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'
import {CreateAsyncMultiSelect, CreateSelect, Select} from "@/Components/ui/select"
import { Formik } from "formik"
import * as yup from "yup"
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import _, { object, range } from "underscore"
import { Map } from "immutable"
import { router } from "@inertiajs/react"
import clsx from "clsx"
import axios from "axios"
import { file_request, user_request, activity_prodi_request, ppepp_kriteria_request, kontak_request, kontak_group_request } from "@/Config/request"
import { SwitchInput } from "@/Components/ui/input_form"
import { parse_image, parse_pdf } from "@/Config/ocr"
import extract from "@/Config/xlsx_extract"
import { NumericFormat } from "react-number-format"
import VirtualizedCheckbox from "@/Components/ui/virtualized_checkbox"
import SwipeableViews from "react-swipeable-views"


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        per_page:15,
        last_page:0,
        page:1,
        q:""
    })
    const [tambah_group, setTambahGroup]=useState({
        is_open:false,
        group:{
            nama_group:"",
            kontak:[]
        }
    })
    const [edit_group, setEditGroup]=useState({
        is_open:false,
        group:{}
    })

    //DATA/MUTATION
    const gets_group=useQuery({
        queryKey:["gets_group", filter],
        queryFn:async()=>kontak_group_request.gets(filter),
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
    const options_kontak=useQuery({
        queryKey:["options_kontak"],
        queryFn:async()=>kontak_request.gets({}),
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
        setTambahGroup({
            is_open:!tambah_group.is_open,
            group:{
                nama_group:"",
                kontak:[]
            }
        })
    }
    const toggleEdit=(list={}, show=false)=>{
        setEditGroup({
            is_open:show,
            group:list
        })
    }

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Master Group Kontak</h4>
                            <button className="btn btn-primary fw-bold ms-2 rounded-pill" onClick={e=>toggleTambah()}>
                                <FiPlus/> Tambah
                            </button>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_group} 
                    filter={filter} 
                    setFilter={setFilter}
                    toggleEdit={toggleEdit}
                />
            </Layout>

            <ModalTambah
                data={tambah_group}
                options_kontak={options_kontak}
                toggleTambah={toggleTambah}
            />

            <ModalEdit
                data={edit_group}
                options_kontak={options_kontak}
                toggleEdit={toggleEdit}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION
    const delete_group=useMutation({
        mutationFn:(id)=>kontak_group_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_group")
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
                delete_group.mutate(list.id_group)
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
                                        <th className="">Nama Group</th>
                                        <th className="">Anggota(No HP)</th>
                                        <th className="" width="50"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!props.data.isFetching?
                                        <>
                                            {props.data.data.data.map((list, idx)=>(
                                                <tr key={list}>
                                                    <td>{(idx+1)+((props.data.data.current_page-1)*props.filter.per_page)}</td>
                                                    <td>{list.nama_group}</td>
                                                    <td>
                                                        {list.kontak.map(no=>(
                                                            <span className="badge bg-purple fs-6 me-1">
                                                                {no.nama_lengkap}
                                                            </span>
                                                        ))}
                                                    </td>
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
                                                    <td colSpan={4} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("gets_group")}>
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
                                    <option value="1">15 Data</option>
                                    <option value="2">25 Data</option>
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

    const [slide, setSlide]=useState(0)

    //MUTATION/DATA
    const add_group=useMutation({
        mutationFn:params=>kontak_group_request.add(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_group")
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
    const options_kontak=()=>{
        const data=props.options_kontak.data.data
            .slice(0, 15)
            .map(d=>{
                return {
                    label:d.nama_lengkap,
                    value:d.no_hp
                }
            })

        return data
    }
    const searchKontak=(q)=>{
        return new Promise((resolve)=>{
            if(timeoutSearchKontak) clearTimeout(timeoutSearchKontak)
            timeoutSearchKontak=setTimeout(()=>{
                const options=props.options_kontak.data.data
                    .filter(f=>{
                        return f.nama_lengkap.toString().toLowerCase().indexOf(q.toLowerCase())>=0 || f.no_hp.toString().indexOf(q)>=0
                    })
                    .slice(0, 15)
                    .map(d=>({label:d.nama_lengkap, value:d.no_hp}))
                
                resolve(options)
            }, 500);
        })
    }
    let timeoutSearchKontak=0
    const kontak_data=()=>{
        const a=_.range(1000).map(e=>({label:e.toString(), value:e.toString()+"ssd", checked:true}))
        return a
    }
    
    return (
        <>
            <Modal show={props.data.is_open} onHide={props.toggleTambah} backdrop="static" size="md" scrollable>
                <Formik
                    initialValues={props.data.group}
                    onSubmit={(values, actions)=>{
                        const new_values=values
                        
                        add_group.mutate(new_values, {
                            onSettled:data=>{
                                actions.setSubmitting(false)
                            }
                        })
                    }}
                    validationSchema={
                        yup.object().shape({
                            nama_group:yup.string().required(),
                            kontak:yup.array().optional()
                        })
                    }
                >
                    {formik=>(
                        <form onSubmit={formik.handleSubmit}>
                            <Modal.Header closeButton>
                                <h4 className="modal-title">Tambah Group</h4>
                            </Modal.Header>
                            <Modal.Body>
                                <div className="row">
                                    <div className="col-12">
                                        <div className="mb-2">
                                            <label className="my-1 me-2" for="country">Nama Group<span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                name="nama_group"
                                                onChange={formik.handleChange}
                                                value={formik.values.nama_group}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="mb-2">
                                            <label className="my-1 me-2">Kontak </label>
                                            <CreateAsyncMultiSelect
                                                value={formik.values.kontak.map(l=>({label:l.nama_lengkap,value:l.no_hp}))}
                                                defaultOptions={options_kontak()}
                                                loadOptions={searchKontak}
                                                onChange={e=>{
                                                    const penerima=e.map(l=>({nama_lengkap:l.label, no_hp:l.value}))
                                                    formik.setFieldValue("kontak", penerima)
                                                }}
                                                onCreateOption={e=>{
                                                    if(!_.isNaN(Number(e))){
                                                        const penerima=formik.values.kontak.concat([{nama_lengkap:e, no_hp:e}])
                                                        formik.setFieldValue("kontak", penerima)
                                                    }
                                                }}
                                                placeholder="Cari Kontak"
                                                closeMenuOnSelect={false}
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
        </>
    )
}

const ModalEdit=(props)=>{

    //MUTATION
    const update_group=useMutation({
        mutationFn:params=>kontak_group_request.update(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_group")
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
    const options_kontak=()=>{
        const data=props.options_kontak.data.data
            .slice(0, 15)
            .map(d=>{
                return {
                    label:d.nama_lengkap,
                    value:d.no_hp
                }
            })

        return data
    }
    const searchKontak=(q)=>{
        return new Promise((resolve)=>{
            if(timeoutSearchKontak) clearTimeout(timeoutSearchKontak)
            timeoutSearchKontak=setTimeout(()=>{
                const options=props.options_kontak.data.data
                    .filter(f=>{
                        return f.nama_lengkap.toString().toLowerCase().indexOf(q.toLowerCase())>=0 || f.no_hp.toString().indexOf(q)>=0
                    })
                    .slice(0, 15)
                    .map(d=>({label:d.nama_lengkap, value:d.no_hp}))
                
                resolve(options)
            }, 500);
        })
    }
    let timeoutSearchKontak=0
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleEdit} backdrop="static" size="md">
            <Formik
                initialValues={props.data.group}
                onSubmit={(values, actions)=>{
                    const new_values=values
                    
                    update_group.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        nama_group:yup.string().required(),
                        kontak:yup.array().optional()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Group</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Nama Group<span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_group"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_group}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2">Kontak </label>
                                        <CreateAsyncMultiSelect
                                            value={formik.values.kontak.map(l=>({label:l.nama_lengkap,value:l.no_hp}))}
                                            defaultOptions={options_kontak()}
                                            loadOptions={searchKontak}
                                            onChange={e=>{
                                                const penerima=e.map(l=>({nama_lengkap:l.label, no_hp:l.value}))
                                                formik.setFieldValue("kontak", penerima)
                                            }}
                                            onCreateOption={e=>{
                                                if(!_.isNaN(Number(e))){
                                                    const penerima=formik.values.kontak.concat([{nama_lengkap:e, no_hp:e}])
                                                    formik.setFieldValue("kontak", penerima)
                                                }
                                            }}
                                            placeholder="Cari Kontak"
                                            closeMenuOnSelect={false}
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