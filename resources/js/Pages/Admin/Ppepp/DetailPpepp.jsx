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
import { file_request, user_request, activity_prodi_request, ppepp_kriteria_request, ppepp_request } from "@/Config/request"
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
        type:"sub_ppepp",
        nested:"",
        id_kriteria:""
    })
    const [tambah_ppepp, setTambahPpepp]=useState({
        is_open:false,
        ppepp:{
            type:"sub_ppepp",
            id_kriteria:"",
            nested:"",
            nama_ppepp:"",
            deskripsi:""
        }
    })
    const [edit_ppepp, setEditPpepp]=useState({
        is_open:false,
        ppepp:{}
    })

    //DATA/MUTATION
    const gets_ppepp=useQuery({
        queryKey:["gets_ppepp", filter],
        queryFn:async()=>ppepp_request.gets(filter),
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
    const options_parent_ppepp=useQuery({
        queryKey:["options_parent_ppepp"],
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

    //ACTIONS
    const toggleTambah=()=>{
        setTambahPpepp({
            is_open:!tambah_ppepp.is_open,
            ppepp:{
                type:"sub_ppepp",
                id_kriteria:"",
                nested:"",
                nama_ppepp:"",
                deskripsi:""
            }
        })
    }
    const toggleEdit=(list={}, show=false)=>{
        setEditPpepp({
            is_open:show,
            ppepp:list
        })
    }
    const renderData=()=>{
        const {data}=this.state

        let count_kriteria=0
        let kriteria=[]
        let render=[]

        data.map(d=>{
            if(isUndefined(d.sub_kriteria)){
                let rowspan_kriteria=1
                let found_kriteria=kriteria.findIndex(x=>x==d.id_kriteria)==-1?false:true

                if(!found_kriteria){
                    kriteria.push(d.id_kriteria)
                    rowspan_kriteria=data.filter(fl=>fl.id_kriteria==d.id_kriteria).length
                    rowspan_kriteria=rowspan_kriteria==0?1:rowspan_kriteria
                    count_kriteria++
                }

                render.push(
                    <tr key={d}>
                        {!found_kriteria&&<td rowSpan={rowspan_kriteria}>{count_kriteria}</td>}
                        {!found_kriteria&&<td rowSpan={rowspan_kriteria}>{d.kriteria}</td>}
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                )
            }

            if(isUndefined(d.bukti)){
                let rowspan_kriteria=1
                let rowspan_sub_kriteria=1
                let found_kriteria=kriteria.findIndex(x=>x==d.id_kriteria)==-1?false:true
                let found_sub_kriteria=kriteria.findIndex(x=>x==d.sub_kriteria.id_kriteria)==-1?false:true

                if(!found_kriteria){
                    kriteria.push(d.id_kriteria)
                    rowspan_kriteria=data.filter(fl=>fl.id_kriteria==d.id_kriteria).length
                    rowspan_kriteria=rowspan_kriteria==0?1:rowspan_kriteria
                    count_kriteria++
                }
                if(!found_sub_kriteria){
                    kriteria.push(d.sub_kriteria.id_kriteria)
                    rowspan_sub_kriteria=data.filter(fl=>{
                        if(isUndefined(fl.sub_kriteria)) return false
                        else return fl.sub_kriteria.id_kriteria==d.sub_kriteria.id_kriteria
                    }).length
                    rowspan_sub_kriteria=rowspan_sub_kriteria==0?1:rowspan_sub_kriteria
                }

                render.push(
                    <tr key={d}>
                        {!found_kriteria&&<td rowSpan={rowspan_kriteria}>{count_kriteria}</td>}
                        {!found_kriteria&&<td rowSpan={rowspan_kriteria}>{d.kriteria}</td>}
                        {!found_sub_kriteria&&<td rowSpan={rowspan_sub_kriteria}>{d.sub_kriteria.kriteria}</td>}
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                )
            }

            if(!isUndefined(d.bukti)){
                let rowspan_kriteria=1
                let rowspan_sub_kriteria=1
                let found_kriteria=kriteria.findIndex(x=>x==d.id_kriteria)==-1?false:true
                let found_sub_kriteria=kriteria.findIndex(x=>x==d.sub_kriteria.id_kriteria)==-1?false:true

                if(!found_kriteria){
                    kriteria.push(d.id_kriteria)
                    rowspan_kriteria=data.filter(fl=>fl.id_kriteria==d.id_kriteria).length
                    rowspan_kriteria=rowspan_kriteria==0?1:rowspan_kriteria
                    count_kriteria++
                }
                if(!found_sub_kriteria){
                    kriteria.push(d.sub_kriteria.id_kriteria)
                    rowspan_sub_kriteria=data.filter(fl=>{
                        if(isUndefined(fl.sub_kriteria)) return false
                        else return fl.sub_kriteria.id_kriteria==d.sub_kriteria.id_kriteria
                    }).length
                    rowspan_sub_kriteria=rowspan_sub_kriteria==0?1:rowspan_sub_kriteria
                }

                render.push(
                    <tr key={d}>
                        {!found_kriteria&&<td rowSpan={rowspan_kriteria}>{count_kriteria}</td>}
                        {!found_kriteria&&<td rowSpan={rowspan_kriteria}>{d.kriteria}</td>}
                        {!found_sub_kriteria&&<td rowSpan={rowspan_sub_kriteria}>{d.sub_kriteria.kriteria}</td>}
                        <td>{d.bukti.bukti}</td>
                        <td>{this.getBuktiType(d.bukti.type)}</td>
                        <td>
                            {d.bukti.upload_dokumen&&
                                <a 
                                    href={BASE_URL+"/file/show/"+d.bukti.dokumen} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="link-info"
                                >
                                    {get_file(d.bukti.dokumen)}
                                </a>
                            }
                        </td>
                        <td>
                            {d.bukti.jawaban=="ya"&&"Ada"}
                            {d.bukti.jawaban=="tidak"&&"Tidak"}
                        </td>
                    </tr>
                )
            }
        })

        return render
    }

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Master Sub PPEPP</h4>
                            <button className="btn btn-primary fw-bold ms-2 rounded-pill" onClick={e=>toggleTambah()}>
                                <FiPlus/> Tambah
                            </button>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_ppepp} 
                    options_parent_ppepp={options_parent_ppepp}
                    filter={filter} 
                    setFilter={setFilter}
                    toggleEdit={toggleEdit}
                />
            </Layout>

            <ModalTambah
                data={tambah_ppepp}
                options_parent_ppepp={options_parent_ppepp}
                toggleTambah={toggleTambah}
            />

            <ModalEdit
                data={edit_ppepp}
                toggleEdit={toggleEdit}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION
    const delete_ppepp=useMutation({
        mutationFn:(id)=>ppepp_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_ppepp")
        },
        onError:err=>{
            toast.error("Remove Data Failed!", {position:"bottom-center"})
        }
    })

    //VALUES

    //FILTER
    const options_parent_ppepp=()=>{
        const data=props.options_parent_ppepp.data.data.map(d=>{
            return {
                label:d.nama_ppepp,
                value:d.id_ppepp
            }
        })

        return [{label:"Semua ppepp", value:""}].concat(data)
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
            title: "Yakin ingin menghapus Sub PPEPP "+list.nama_ppepp+"?",
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
                delete_ppepp.mutate(list.id_ppepp)
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
                                    options={options_parent_ppepp()}
                                    value={options_parent_ppepp().find(f=>f.value==props.filter.nested)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"nested", value:e.value}})
                                    }}
                                    placeholder="Pilih ppepp"
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
                                        <th className="" width="50">#</th>
                                        <th className="">Kriteria</th>
                                        <th className="">PPEPP</th>
                                        <th className="">Deskripsi</th>
                                        <th className="">Sub PPEPP</th>
                                        <th className="" width="50"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!props.data.isFetching?
                                        <>
                                            {props.data.data.data.map((list, idx)=>(
                                                <tr key={list}>
                                                    <td>{(idx+1)+((props.data.data.current_page-1)*props.filter.per_page)}</td>
                                                    <td>{list.parent.kriteria.nama_kriteria}</td>
                                                    <td>{list.parent.nama_ppepp}</td>
                                                    <td>{list.parent.deskripsi}</td>
                                                    <td>{list.nama_ppepp}</td>
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
                                                    <td colSpan={6} className="text-center">Data tidak ditemukan!</td>
                                                </tr>
                                            }
                                            {!_.isNull(props.data.error)&&
                                                <tr>
                                                    <td colSpan={6} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("gets_ppepp")}>
                                                        <span className="text-muted">Gagal Memuat Data! &nbsp;<FiRefreshCw/></span>
                                                    </td>
                                                </tr>
                                            }
                                        </>
                                    :
                                        <>
                                            <tr>
                                                <td colSpan={6} className="text-center">
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

    //MUTATION
    const add_ppepp=useMutation({
        mutationFn:params=>ppepp_request.add(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_ppepp")
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
    const options_parent_ppepp=()=>{
        const data=props.options_parent_ppepp.data.data.map(d=>{
            return {
                label:d.nama_ppepp,
                value:d.id_ppepp
            }
        })

        return [{label:"Pilih ppepp", value:""}].concat(data)
    }
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleTambah} backdrop="static" size="md" scrollable>
            <Formik
                initialValues={props.data.ppepp}
                onSubmit={(values, actions)=>{
                    const new_values=values
                    
                    add_ppepp.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        type:yup.string().required(),
                        nested:yup.string().required(),
                        nama_ppepp:yup.string().required(),
                        deskripsi:yup.string().optional()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Tambah Sub PPEPP</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2">PPEPP <span className="text-danger">*</span></label>
                                        <Select
                                            options={options_parent_ppepp()}
                                            value={options_parent_ppepp().find(f=>f.value==formik.values.nested)}
                                            onChange={e=>{
                                                formik.setFieldValue("nested", e.value)
                                            }}
                                            placeholder="Pilih ppepp"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Sub PPEPP <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_ppepp"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_ppepp}
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
    const update_ppepp=useMutation({
        mutationFn:params=>ppepp_request.update(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_ppepp")
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
                initialValues={props.data.ppepp}
                onSubmit={(values, actions)=>{
                    const new_values=values
                    
                    update_ppepp.mutate(new_values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        nama_ppepp:yup.string().required(),
                        deskripsi:yup.string().optional()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Sub PPEPP</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Sub PPEPP <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_ppepp"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_ppepp}
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