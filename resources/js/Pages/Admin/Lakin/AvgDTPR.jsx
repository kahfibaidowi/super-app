import React, { useEffect, useMemo, useState } from "react"
import Layout from "@/Components/layout"
import { queryClient } from "@/Config/api"
import { toast } from "react-toastify"
import { FiChevronLeft, FiChevronRight, FiEdit, FiFileText, FiPlus, FiRefreshCw, FiTrash, FiTrash2, FiUpload } from "react-icons/fi"
import Avatar from "@/Components/ui/avatar"
import { Modal, Spinner } from "react-bootstrap"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'
import {CreateSelect, Select} from "@/Components/ui/select"
import { Formik } from "formik"
import * as yup from "yup"
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import _, { object } from "underscore"
import { Map } from "immutable"
import { router, usePage } from "@inertiajs/react"
import clsx from "clsx"
import axios from "axios"
import { file_request, user_request, activity_prodi_request, ppepp_kriteria_request, ppepp_request, lakin_request } from "@/Config/request"
import { SwitchInput } from "@/Components/ui/input_form"
import { parse_image, parse_pdf } from "@/Config/ocr"
import extract from "@/Config/xlsx_extract"
import { NumericFormat } from "react-number-format"
import { generate_id } from "@/Config/helpers"


const MySwal=withReactContent(swal)

const options_tahun=(type="filter")=>{
    const year=(new Date()).getFullYear()

    let years=[]
    for(var i=year-2; i<=year+2; i++){
        years=years.concat([{value:i, label:i}])
    }

    return [{value:"", label:type=="filter"?"Semua Tahun":"Pilih Tahun"}].concat(years)
}

const Page=(props)=>{

    const [filter, setFilter]=useState({
        type:"avg_dtpr",
        tahun:"",
        q:""
    })
    const [tambah_lakin, setTambahLakin]=useState({
        is_open:false,
        data:{
            tahun:"",
            nama_dosen_dtpr:"",
            sks_pengajaran_pada_ps_sendiri:"",
            sks_pengajaran_pada_ps_lain_pt_sendiri:"",
            sks_pengajaran_pada_pt_lain:"",
            sks_penelitian:"",
            sks_pengabdian_pada_masy:"",
            sks_manajemen_pt_sendiri:"",
            sks_manajemen_pt_lain:""
        }
    })
    const [edit_lakin, setEditLakin]=useState({
        is_open:false,
        index:-1,
        data:{}
    })
    const [edit_detail, setEditDetail]=useState({
        is_open:false,
        data:{
            deskripsi:""
        }
    })

    //DATA/MUTATION
    const get_lakin=useQuery({
        queryKey:["get_lakin_avg_dtpr", filter],
        queryFn:async()=>lakin_request.get(filter.type),
        initialData:{
            data:{
                data:[],
                detail:[]
            }
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false
    })

    //ACTIONS
    const toggleTambah=()=>{
        setTambahLakin({
            is_open:!tambah_lakin.is_open,
            data:{
                tahun:filter.tahun,
                nama_dosen_dtpr:"",
                sks_pengajaran_pada_ps_sendiri:"",
                sks_pengajaran_pada_ps_lain_pt_sendiri:"",
                sks_pengajaran_pada_pt_lain:"",
                sks_penelitian:"",
                sks_pengabdian_pada_masy:"",
                sks_manajemen_pt_sendiri:"",
                sks_manajemen_pt_lain:""
            }
        })
    }
    const toggleEdit=(list={}, index=-1, show=false)=>{
        setEditLakin({
            is_open:show,
            index:index,
            data:list
        })
    }
    const toggleEditDetail=(list={}, show=false)=>{
        let new_list=list
        if(_.isNull(list)){
            new_list={
                tahun:filter.tahun,
                deskripsi:""
            }
        }

        setEditDetail({
            is_open:show,
            data:new_list
        })
    }

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Lakin (Rata-rata beban DTPR per semester, pada TS)</h4>
                        </div>
                    </div>
                </div>

                <Table 
                    data={get_lakin}
                    filter={filter} 
                    setFilter={setFilter}
                    toggleTambah={toggleTambah}
                    toggleEdit={toggleEdit}
                    toggleEditDetail={toggleEditDetail}
                />
            </Layout>

            <ModalEditDetail
                filter={filter}
                lakin={get_lakin}
                data={edit_detail}
                toggleEdit={toggleEditDetail}
            />

            <ModalTambah
                filter={filter}
                lakin={get_lakin}
                data={tambah_lakin}
                toggleTambah={toggleTambah}
            />

            <ModalEdit
                filter={filter}
                lakin={get_lakin}
                data={edit_lakin}
                toggleEdit={toggleEdit}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION
    const upsert_lakin=useMutation({
        mutationFn:(params)=>lakin_request.upsert(params),
        onSuccess:data=>{
            queryClient.refetchQueries("get_lakin_avg_dtpr")
        },
        onError:err=>{
            console.log(err)
            toast.error("Remove Data Failed!", {position:"bottom-center"})
        }
    })

    //VALUES
    const filtered_data=()=>{
        if(props.filter.tahun==""){
            return props.data.data.data.data
        }

        return props.data.data.data.data.filter(f=>f.tahun==props.filter.tahun)
    }
    const filtered_detail=()=>{
        const detail_tahun=props.data.data.data.detail.filter(f=>f.tahun==props.filter.tahun)
        if(detail_tahun.length>0){
            return detail_tahun[0]
        }
        return {tahun:props.filter.tahun, deskripsi:""}
    }
    const jumlah_dtpr=(type="")=>{
        if(type=="") return

        const columns=[
            "sks_pengajaran_pada_ps_sendiri",
            "sks_pengajaran_pada_ps_lain_pt_sendiri",
            "sks_pengajaran_pada_pt_lain",
            "sks_penelitian",
            "sks_pengabdian_pada_masy",
            "sks_manajemen_pt_sendiri",
            "sks_manajemen_pt_lai"
        ]
        
        if(columns.filter(f=>f==type).length>0){
            return filtered_data().reduce((prev, list)=>{
                return prev+Number(list[type])
            }, 0)
        }
    }
    const avg_dtpr=(type="")=>{
        if(type=="") return

        const columns=[
            "sks_pengajaran_pada_ps_sendiri",
            "sks_pengajaran_pada_ps_lain_pt_sendiri",
            "sks_pengajaran_pada_pt_lain",
            "sks_penelitian",
            "sks_pengabdian_pada_masy",
            "sks_manajemen_pt_sendiri",
            "sks_manajemen_pt_lai"
        ]
        
        if(columns.filter(f=>f==type).length>0){
            const jumlah=filtered_data().reduce((prev, list)=>{
                return prev+Number(list[type])
            }, 0)

            return jumlah/filtered_data().length
        }
    }

    //FILTER
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
    const confirmHapus=(list, idx)=>{
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
                const new_data=props.data.data.data.data.filter(f=>f.id!=list.id)

                const params={
                    type:props.filter.type,
                    content:{
                        data:new_data,
                        detail:props.data.data.data.detail
                    }
                }

                upsert_lakin.mutate(params)
            }
        })
    }

    return (
        <div className="row">
            <div className="col-12">
                <div class="card">
                    <div class="card-body">
                        <div className="d-flex mb-3">
                            <div style={{width:"200px"}}>
                                <CreateSelect
                                    value={
                                        props.filter.tahun==""?
                                        {label:"Semua tahun", value:""}:
                                        {label:props.filter.tahun, value:props.filter.tahun}
                                    }
                                    options={options_tahun()}
                                    onCreateOption={e=>{
                                        if(!_.isNaN(Number(e))){
                                            typeFilter({target:{name:"tahun", value:e}})
                                        }
                                    }}
                                    onChange={e=>{
                                        typeFilter({target:{name:"tahun", value:e.value}})
                                    }}
                                />
                            </div>
                        </div>
                        <div className="d-flex mb-3">
                            <button className="btn btn-primary fw-bold ms-2 rounded-pill" onClick={e=>props.toggleTambah()}>
                                <FiPlus/> Tambah
                            </button>
                            <a
                                href={`/admin/lakin/print?type=${props.filter.type}&tahun=${props.filter.tahun}`}
                                target="_blank"
                                className="btn btn-secondary ms-2 rounded-pill"
                            >
                                <FiFileText/> Print PDF
                            </a>
                        </div>
                        {props.filter.tahun!=""&&
                            <div className="d-flex flex-column align-items-start mb-3">
                                <button 
                                    className="btn btn-secondary rounded-pill mb-1"
                                    type="button"
                                    onClick={e=>props.toggleEditDetail(filtered_detail(), true)}
                                >
                                    <FiEdit/> Edit
                                </button>
                                <div>
                                    {filtered_detail().deskripsi!=""?
                                        <div className="text-prewrap">{filtered_detail().deskripsi}</div>
                                    :
                                        <span className="text-muted">tidak ada deskripsi!</span>
                                    }
                                </div>
                            </div>
                        }
                        <div className="table-responsive">
                            <table className="table table-hover table-hover table-custom table-wrap table-sm mb-0 w-100">
                                <thead>
                                    <tr>
                                        <th className="" rowSpan={2} width="50">#</th>
                                        <th className="" rowSpan={2}>Tahun</th>
                                        <th className="" rowSpan={2}>Nama Dosen Tetap DTPR</th>
                                        <th className="" colSpan={3}>SKS Pengajaran Pada</th>
                                        <th className="" rowSpan={2}>SKS Penelitian</th>
                                        <th className="" rowSpan={2}>SKS Pengabdian Kepada Masy</th>
                                        <th className="" colSpan={2}>SKS Manajemen</th>
                                        <th className="" rowSpan={2} width="50"></th>
                                    </tr>
                                    <tr>
                                        <th className="">PS Sendiri</th>
                                        <th className="">PS Lain, PT Sendiri</th>
                                        <th className="">PT Lain</th>
                                        <th className="">PT Sendiri</th>
                                        <th className="">PT Lain</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!props.data.isFetching?
                                        <>
                                            {_.isNull(props.data.error)&&
                                                <>
                                                    {filtered_data().map((list, idx)=>(
                                                        <tr key={list}>
                                                            <td>{idx+1}</td>
                                                            <td>{list.tahun}</td>
                                                            <td>{list.nama_dosen_dtpr}</td>
                                                            <td>{list.sks_pengajaran_pada_ps_sendiri}</td>
                                                            <td>{list.sks_pengajaran_pada_ps_lain_pt_sendiri}</td>
                                                            <td>{list.sks_pengajaran_pada_pt_lain}</td>
                                                            <td>{list.sks_penelitian}</td>
                                                            <td>{list.sks_pengabdian_pada_masy}</td>
                                                            <td>{list.sks_manajemen_pt_sendiri}</td>
                                                            <td>{list.sks_manajemen_pt_lain}</td>
                                                            <td className="text-nowrap py-0">
                                                                <div style={{padding:"5px 0"}}>
                                                                    <button type="button" className="btn btn-secondary btn-sm rounded-2" onClick={()=>props.toggleEdit(list, idx, true)}>
                                                                        <FiEdit className="icon"/>
                                                                    </button>
                                                                    <button type="button" className="btn btn-danger btn-sm rounded-2 ms-1" onClick={()=>confirmHapus(list, idx)}>
                                                                        <FiTrash2 className="icon"/>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {filtered_data().length>0&&
                                                        <>
                                                            <tr>
                                                                <th colSpan={3}>Jumlah*</th>
                                                                <th>{jumlah_dtpr("sks_pengajaran_pada_ps_sendiri")}</th>
                                                                <th>{jumlah_dtpr("sks_pengajaran_pada_ps_lain_pt_sendiri")}</th>
                                                                <th>{jumlah_dtpr("sks_pengajaran_pada_pt_lain")}</th>
                                                                <th>{jumlah_dtpr("sks_penelitian")}</th>
                                                                <th>{jumlah_dtpr("sks_pengabdian_pada_masy")}</th>
                                                                <th>{jumlah_dtpr("sks_manajemen_pt_sendiri")}</th>
                                                                <th>{jumlah_dtpr("sks_manajemen_pt_lain")}</th>
                                                                <th className="text-nowrap py-0"></th>
                                                            </tr>
                                                            <tr>
                                                                <th colSpan={3}>Rata-rata*</th>
                                                                <th>{avg_dtpr("sks_pengajaran_pada_ps_sendiri")}</th>
                                                                <th>{avg_dtpr("sks_pengajaran_pada_ps_lain_pt_sendiri")}</th>
                                                                <th>{avg_dtpr("sks_pengajaran_pada_pt_lain")}</th>
                                                                <th>{avg_dtpr("sks_penelitian")}</th>
                                                                <th>{avg_dtpr("sks_pengabdian_pada_masy")}</th>
                                                                <th>{avg_dtpr("sks_manajemen_pt_sendiri")}</th>
                                                                <th>{avg_dtpr("sks_manajemen_pt_lain")}</th>
                                                                <th className="text-nowrap py-0"></th>
                                                            </tr>
                                                        </>
                                                    }
                                                    {(filtered_data().length==0&&_.isNull(props.data.error))&&
                                                        <tr>
                                                            <td colSpan={11} className="text-center">Data tidak ditemukan!</td>
                                                        </tr>
                                                    }
                                                </>
                                            }
                                            {!_.isNull(props.data.error)&&
                                                <tr>
                                                    <td colSpan={11} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("get_lakin_avg_dtpr")}>
                                                        <span className="text-muted">Gagal Memuat Data! &nbsp;<FiRefreshCw/></span>
                                                    </td>
                                                </tr>
                                            }
                                        </>
                                    :
                                        <>
                                            <tr>
                                                <td colSpan={11} className="text-center">
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
                </div>
            </div>
        </div>
    )
}

const ModalEditDetail=(props)=>{

    //MUTATION
    const upsert_lakin=useMutation({
        mutationFn:params=>lakin_request.upsert(params),
        onSuccess:data=>{
            queryClient.refetchQueries("get_lakin_avg_dtpr")
            props.toggleEdit()
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
        <Modal show={props.data.is_open} onHide={props.toggleEdit} backdrop="static" size="md" scrollable>
            <Formik
                initialValues={props.data.data}
                onSubmit={(values, actions)=>{
                    const detail=props.lakin.data.data.detail.filter(f=>f.tahun!=values.tahun).concat([values])

                    const params={
                        type:props.filter.type,
                        content:{
                            detail:detail,
                            data:props.lakin.data.data.data
                        }
                    }

                    upsert_lakin.mutate(params, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        tahun:yup.string().required(),
                        deskripsi:yup.string().optional()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Detail {formik.values.tahun}</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Deskripsi</label>
                                        <textarea
                                            rows={5}
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

const ModalTambah=(props)=>{

    //MUTATION
    const upsert_lakin=useMutation({
        mutationFn:params=>lakin_request.upsert(params),
        onSuccess:data=>{
            queryClient.refetchQueries("get_lakin_avg_dtpr")
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
                initialValues={props.data.data}
                onSubmit={(values, actions)=>{
                    const id=generate_id()
                    const new_values=Object.assign({}, values, {
                        id
                    })

                    const params={
                        type:props.filter.type,
                        content:{
                            data:[new_values].concat(props.lakin.data.data.data),
                            detail:props.lakin.data.data.detail
                        }
                    }

                    upsert_lakin.mutate(params, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        tahun:yup.string().required(),
                        nama_dosen_dtpr:yup.string().required(),
                        sks_pengajaran_pada_ps_sendiri:yup.string().required(),
                        sks_pengajaran_pada_ps_lain_pt_sendiri:yup.string().required(),
                        sks_pengajaran_pada_pt_lain:yup.string().required(),
                        sks_penelitian:yup.string().required(),
                        sks_pengabdian_pada_masy:yup.string().required(),
                        sks_manajemen_pt_sendiri:yup.string().required(),
                        sks_manajemen_pt_lain:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Tambah Dosen Tetap DTPR</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Tahun <span className="text-danger">*</span></label>
                                        <CreateSelect
                                            value={
                                                formik.values.tahun==""?
                                                {label:"Pilih tahun", value:""}:
                                                {label:formik.values.tahun, value:formik.values.tahun}
                                            }
                                            options={options_tahun("select")}
                                            onCreateOption={e=>{
                                                if(!_.isNaN(Number(e))){
                                                    formik.setFieldValue("tahun", e)
                                                }
                                            }}
                                            onChange={e=>{
                                                formik.setFieldValue("tahun", e.value)
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Dosen Tetap DTPR <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_dosen_dtpr"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_dosen_dtpr}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Pengajaran Pada PS Sendiri <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_pengajaran_pada_ps_sendiri}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_pengajaran_pada_ps_sendiri", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Pengajaran Pada PS Lain, PT Sendiri <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_pengajaran_pada_ps_lain_pt_sendiri}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_pengajaran_pada_ps_lain_pt_sendiri", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Pengajaran Pada PT Lain <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_pengajaran_pada_pt_lain}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_pengajaran_pada_pt_lain", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Penelitian <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_penelitian}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_penelitian", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Pengabdian Pada Masy <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_pengabdian_pada_masy}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_pengabdian_pada_masy", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Manajemen PT Sendiri <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_manajemen_pt_sendiri}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_manajemen_pt_sendiri", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Manajemen PT Lain <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_manajemen_pt_lain}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_manajemen_pt_lain", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
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
    const upsert_lakin=useMutation({
        mutationFn:params=>lakin_request.upsert(params),
        onSuccess:data=>{
            queryClient.refetchQueries("get_lakin_avg_dtpr")
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
                initialValues={props.data.data}
                onSubmit={(values, actions)=>{
                    const new_values=values
                    
                    const index=props.lakin.data.data.data.findIndex(list=>list.id==new_values.id)
                    const sb=props.lakin.data.data.data.slice(0, index);
                    const eb=props.lakin.data.data.data.slice(index+1);

                    const params={
                        type:props.filter.type,
                        content:{
                            data:sb.concat([new_values]).concat(eb),
                            detail:props.lakin.data.data.detail
                        }
                    }

                    upsert_lakin.mutate(params, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        tahun:yup.string().required(),
                        nama_dosen_dtpr:yup.string().required(),
                        sks_pengajaran_pada_ps_sendiri:yup.string().required(),
                        sks_pengajaran_pada_ps_lain_pt_sendiri:yup.string().required(),
                        sks_pengajaran_pada_pt_lain:yup.string().required(),
                        sks_penelitian:yup.string().required(),
                        sks_pengabdian_pada_masy:yup.string().required(),
                        sks_manajemen_pt_sendiri:yup.string().required(),
                        sks_manajemen_pt_lain:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Dosen Tetap DTPR</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Tahun <span className="text-danger">*</span></label>
                                        <CreateSelect
                                            value={
                                                formik.values.tahun==""?
                                                {label:"Pilih tahun", value:""}:
                                                {label:formik.values.tahun, value:formik.values.tahun}
                                            }
                                            options={options_tahun("select")}
                                            onCreateOption={e=>{
                                                if(!_.isNaN(Number(e))){
                                                    formik.setFieldValue("tahun", e)
                                                }
                                            }}
                                            onChange={e=>{
                                                formik.setFieldValue("tahun", e.value)
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Dosen Tetap DTPR <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_dosen_dtpr"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_dosen_dtpr}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Pengajaran Pada PS Sendiri <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_pengajaran_pada_ps_sendiri}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_pengajaran_pada_ps_sendiri", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Pengajaran Pada PS Lain, PT Sendiri <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_pengajaran_pada_ps_lain_pt_sendiri}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_pengajaran_pada_ps_lain_pt_sendiri", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Pengajaran Pada PT Lain <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_pengajaran_pada_pt_lain}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_pengajaran_pada_pt_lain", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Penelitian <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_penelitian}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_penelitian", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Pengabdian Pada Masy <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_pengabdian_pada_masy}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_pengabdian_pada_masy", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Manajemen PT Sendiri <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_manajemen_pt_sendiri}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_manajemen_pt_sendiri", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">SKS Manajemen PT Lain <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.sks_manajemen_pt_lain}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("sks_manajemen_pt_lain", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
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