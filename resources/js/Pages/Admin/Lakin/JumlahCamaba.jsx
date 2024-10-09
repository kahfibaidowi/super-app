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
import moment from "moment"
import { PDFViewer, Page as PagePDF, Text as TextPDF, View as ViewPDF, Document as DocumentPDF, StyleSheet as StyleSheetPDF } from '@react-pdf/renderer'
import { table_pdf } from "@/Config/styles"


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
        type:"jumlah_camaba",
        tahun:"",
        q:""
    })
    const [tambah_lakin, setTambahLakin]=useState({
        is_open:false,
        data:{
            tahun:"",
            tahun_akademik:"",
            daya_tampung:"",
            camaba_pendaftar:"",
            camaba_lulus_seleksi:"",
            maba_reguler:"",
            maba_transfer:"",
            mahasiswa_aktif_reguler:"",
            mahasiswa_aktif_transfer:""
        }
    })
    const [edit_lakin, setEditLakin]=useState({
        is_open:false,
        index:-1,
        data:{}
    })

    //DATA/MUTATION
    const get_lakin=useQuery({
        queryKey:["get_lakin", filter],
        queryFn:async()=>lakin_request.get(filter.type),
        initialData:{
            data:{
                data:[]
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
                tahun_akademik:"",
                daya_tampung:"",
                camaba_pendaftar:"",
                camaba_lulus_seleksi:"",
                maba_reguler:"",
                maba_transfer:"",
                mahasiswa_aktif_reguler:"",
                mahasiswa_aktif_transfer:""
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

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Lakin (Jumlah Calon Mahasiswa Baru)</h4>
                        </div>
                    </div>
                </div>

                <Table 
                    data={get_lakin}
                    filter={filter} 
                    setFilter={setFilter}
                    toggleTambah={toggleTambah}
                    toggleEdit={toggleEdit}
                />
            </Layout>

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
            queryClient.refetchQueries("get_lakin")
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

    //FILTER
    const typeFilter=e=>{
        const target=e.target

        if(target.name=="q"){
            if(timeout) clearTimeout(timeout)
            timeout=setTimeout(()=>{
                props.setFilter(
                    Map(props.filter)
                    .set(target.name, target.value)
                    .toJS()
                )
            }, 500)
        }
        else{
            props.setFilter(
                Map(props.filter)
                .set(target.name, target.value)
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
                const sb=props.data.data.data.data.slice(0, idx);
                const eb=props.data.data.data.data.slice(idx+1);

                const params={
                    type:props.filter.type,
                    content:{
                        data:sb.concat(eb)
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
                        <div className="table-responsive">
                            <table className="table table-hover table-hover table-custom table-wrap table-sm mb-0 w-100">
                                <thead>
                                    <tr>
                                        <th className="" rowSpan={2} width="50">#</th>
                                        <th className="" rowSpan={2}>Tahun</th>
                                        <th className="" rowSpan={2}>Tahun Akademik</th>
                                        <th className="" rowSpan={2}>Daya Tampung</th>
                                        <th className="" colSpan={2}>Jumlah Calon Mahasiswa</th>
                                        <th className="" colSpan={2}>Jumlah Mahasiswa Baru</th>
                                        <th className="" colSpan={2}>Jumlah Mahasiswa Aktif</th>
                                        <th className="" rowSpan={2} width="50"></th>
                                    </tr>
                                    <tr>
                                        <th className="">Pendaftar</th>
                                        <th className="">Lulus Seleksi</th>
                                        <th className="">Regular</th>
                                        <th className="">Transfer*)</th>
                                        <th className="">Regular</th>
                                        <th className="">Transfer*)</th>
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
                                                            <td>{list.tahun_akademik}</td>
                                                            <td>{list.daya_tampung}</td>
                                                            <td>{list.camaba_pendaftar}</td>
                                                            <td>{list.camaba_lulus_seleksi}</td>
                                                            <td>{list.maba_reguler}</td>
                                                            <td>{list.maba_transfer}</td>
                                                            <td>{list.mahasiswa_aktif_reguler}</td>
                                                            <td>{list.mahasiswa_aktif_transfer}</td>
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
                                                    {(filtered_data().length==0&&_.isNull(props.data.error))&&
                                                        <tr>
                                                            <td colSpan={11} className="text-center">Data tidak ditemukan!</td>
                                                        </tr>
                                                    }
                                                </>
                                            }
                                            {!_.isNull(props.data.error)&&
                                                <tr>
                                                    <td colSpan={11} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("get_lakin")}>
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
                        
                        {/* <div className="d-flex w-100" style={{maxHeight:"600px"}}>
                        <PDFViewer style={{width:"100%", minHeight:"600px"}}>
                            <DocumentPDF>
                                <PagePDF size="a4">
                                    <ViewPDF style={table_pdf.section}>
                                        <TextPDF>Section #1</TextPDF>
                                    </ViewPDF>
                                    <ViewPDF style={table_pdf.section}>
                                        <TextPDF>Section #2</TextPDF>
                                    </ViewPDF>
                                </PagePDF>
                            </DocumentPDF>
                        </PDFViewer>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

const ModalTambah=(props)=>{

    //MUTATION
    const upsert_lakin=useMutation({
        mutationFn:params=>lakin_request.upsert(params),
        onSuccess:data=>{
            queryClient.refetchQueries("get_lakin")
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
                    const new_values=values

                    const params={
                        type:props.filter.type,
                        content:{
                            data:[new_values].concat(props.lakin.data.data.data)
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
                        tahun_akademik:yup.string().required(),
                        daya_tampung:yup.string().required(),
                        camaba_pendaftar:yup.string().required(),
                        camaba_lulus_seleksi:yup.string().required(),
                        maba_reguler:yup.string().required(),
                        maba_transfer:yup.string().required(),
                        mahasiswa_aktif_reguler:yup.string().required(),
                        mahasiswa_aktif_transfer:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Tambah Calon Mahasiswa Baru</h4>
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
                                        <label className="my-1 me-2" for="country">Tahun Akademik <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="tahun_akademik"
                                            onChange={formik.handleChange}
                                            value={formik.values.tahun_akademik}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Daya Tampung <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.daya_tampung}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("daya_tampung", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Calon Mahasiswa Baru Pendaftar <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.camaba_pendaftar}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("camaba_pendaftar", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Calon Mahasiswa Baru Lulus Seleksi <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.camaba_lulus_seleksi}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("camaba_lulus_seleksi", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Mahasiswa Baru Reguler <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.maba_reguler}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("maba_reguler", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Mahasiswa Baru Transfer*) <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.maba_transfer}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("maba_transfer", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Mahasiswa Aktif Reguler <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.mahasiswa_aktif_reguler}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("mahasiswa_aktif_reguler", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Mahasiswa Aktif Transfer*) <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.mahasiswa_aktif_transfer}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("mahasiswa_aktif_transfer", value)
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
            queryClient.refetchQueries("get_lakin")
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

                    const sb=props.lakin.data.data.data.slice(0, props.data.index);
                    const eb=props.lakin.data.data.data.slice(props.data.index+1);

                    const params={
                        type:props.filter.type,
                        content:{
                            data:sb.concat([new_values]).concat(eb)
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
                        tahun_akademik:yup.string().required(),
                        daya_tampung:yup.string().required(),
                        camaba_pendaftar:yup.string().required(),
                        camaba_lulus_seleksi:yup.string().required(),
                        maba_reguler:yup.string().required(),
                        maba_transfer:yup.string().required(),
                        mahasiswa_aktif_reguler:yup.string().required(),
                        mahasiswa_aktif_transfer:yup.string().required()
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Calon Mahasiswa Baru</h4>
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
                                        <label className="my-1 me-2" for="country">Tahun Akademik <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="tahun_akademik"
                                            onChange={formik.handleChange}
                                            value={formik.values.tahun_akademik}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Daya Tampung <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.daya_tampung}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("daya_tampung", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Calon Mahasiswa Baru Pendaftar <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.camaba_pendaftar}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("camaba_pendaftar", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Calon Mahasiswa Baru Lulus Seleksi <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.camaba_lulus_seleksi}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("camaba_lulus_seleksi", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Mahasiswa Baru Reguler <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.maba_reguler}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("maba_reguler", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Mahasiswa Baru Transfer*) <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.maba_transfer}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("maba_transfer", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Mahasiswa Aktif Reguler <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.mahasiswa_aktif_reguler}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("mahasiswa_aktif_reguler", value)
                                            }}
                                            allowNegative={false}
                                            decimalScale={0}
                                            thousandSeparator
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Mahasiswa Aktif Transfer*) <span className="text-danger">*</span></label>
                                        <NumericFormat
                                            className="form-control"
                                            value={formik.values.mahasiswa_aktif_transfer}
                                            onValueChange={values=>{
                                                const {value}=values

                                                formik.setFieldValue("mahasiswa_aktif_transfer", value)
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