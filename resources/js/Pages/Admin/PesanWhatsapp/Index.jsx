import React, { useEffect, useMemo, useState } from "react"
import Layout from "@/Components/layout"
import { queryClient } from "@/Config/api"
import { toast } from "react-toastify"
import { FiArchive, FiCheckCircle, FiChevronLeft, FiChevronRight, FiEdit, FiPlus, FiRefreshCw, FiSend, FiTrash, FiTrash2, FiUpload } from "react-icons/fi"
import Avatar from "@/Components/ui/avatar"
import { Modal, Spinner } from "react-bootstrap"
import swal from "sweetalert2"
import withReactContent from 'sweetalert2-react-content'
import {CreateAsyncMultiSelect, CreateMultiSelect, Select} from "@/Components/ui/select"
import { Formik } from "formik"
import * as yup from "yup"
import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query"
import _, { object, range } from "underscore"
import { Map } from "immutable"
import { router } from "@inertiajs/react"
import clsx from "clsx"
import axios from "axios"
import { file_request, user_request, activity_prodi_request, ppepp_kriteria_request, ppepp_request, bukti_request, pesan_request, kontak_group_request, kontak_request } from "@/Config/request"
import { SwitchInput } from "@/Components/ui/input_form"
import { parse_image, parse_pdf } from "@/Config/ocr"
import extract from "@/Config/xlsx_extract"
import moment from 'moment-timezone'


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        per_page:15,
        last_page:0,
        page:1,
        q:""
    })
    const [tambah_pesan, setTambahPesan]=useState({
        is_open:false,
        pesan:{
            penerima:[],
            pesan:"",
            file:[],
            schedule:false,
            jadwal_kirim:""
        }
    })
    const [edit_pesan, setEditPesan]=useState({
        is_open:false,
        pesan:{}
    })

    //DATA/MUTATION
    const gets_pesan=useQuery({
        queryKey:["gets_pesan", filter],
        queryFn:async()=>pesan_request.gets(filter),
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
    const options_kontak_group=useQuery({
        queryKey:["options_kontak_group"],
        queryFn:async()=>kontak_group_request.gets({}),
        initialData:{
            data:[],
            last_page:0,
            first_page:1,
            current_page:1
        },
        refetchOnWindowFocus:false,
        refetchOnReconnect:false
    })
    const send_message=useMutation({
        mutationFn:params=>pesan_request.send_message(params),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Request Failed! ", {position:"bottom-center"})
        }
    })
    const send_message_schedule=useMutation({
        mutationFn:params=>pesan_request.send_message_schedule(params),
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Request Failed! ", {position:"bottom-center"})
        }
    })

    //ACTIONS
    const toggleTambah=()=>{
        setTambahPesan({
            is_open:!tambah_pesan.is_open,
            pesan:{
                penerima:[],
                pesan:"",
                file:[],
                schedule:false,
                jadwal_kirim:""
            }
        })
    }
    const toggleEdit=(list={}, show=false)=>{
        setEditPesan({
            is_open:show,
            pesan:Object.assign({}, list, {
                schedule:!_.isNull(list.jadwal_kirim)?true:false
            })
        })
    }

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Master Pesan Whatsapp</h4>
                            <button className="btn btn-primary fw-bold ms-2 rounded-pill" onClick={e=>toggleTambah()}>
                                <FiPlus/> Tambah
                            </button>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_pesan}
                    filter={filter} 
                    send_message={send_message}
                    send_message_schedule={send_message_schedule}
                    toggleEdit={toggleEdit}
                    setFilter={setFilter}
                />
            </Layout>

            <ModalTambah
                data={tambah_pesan}
                options_kontak={options_kontak}
                options_kontak_group={options_kontak_group}
                toggleTambah={toggleTambah}
                send_message={send_message}
                send_message_schedule={send_message_schedule}
            />

            <ModalEdit
                data={edit_pesan}
                options_kontak={options_kontak}
                options_kontak_group={options_kontak_group}
                toggleEdit={toggleEdit}
                send_message={send_message}
                send_message_schedule={send_message_schedule}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION
    const delete_pesan=useMutation({
        mutationFn:(id)=>pesan_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_pesan")
        },
        onError:err=>{
            toast.error("Remove Data Failed!", {position:"bottom-center"})
        }
    })
    const update_pesan=useMutation({
        mutationFn:params=>pesan_request.update(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_pesan")
        },
        onError:err=>{
            if(err.response.data?.error=="VALIDATION_ERROR")
                toast.error(err.response.data.data, {position:"bottom-center"})
            else
                toast.error("Update Data Failed! ", {position:"bottom-center"})
        }
    })

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
                delete_pesan.mutate(list.id_pesan_whatsapp)
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
                                        <th className="">Penerima</th>
                                        <th className="">Pesan</th>
                                        <th className="">File</th>
                                        <th className="" width="150">Jadwal Kirim</th>
                                        <th className="" width="120">Status</th>
                                        <th className="" width="150"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!props.data.isFetching?
                                        <>
                                            {props.data.data.data.map((list, idx)=>(
                                                <tr key={list}>
                                                    <td>{(idx+1)+((props.data.data.current_page-1)*props.filter.per_page)}</td>
                                                    <td>
                                                        {list.penerima.map(p=><span className="badge bg-purple fs-6 me-1">{p}</span>)}
                                                    </td>
                                                    <td className="text-prewrap">{list.pesan}</td>
                                                    <td className="pb-0">
                                                        <ul className="ms-0 ps-0 mb-0">
                                                            {list.file.map((f, idx)=>(
                                                                <li className="d-flex justify-content-between mb-1">
                                                                    <a 
                                                                        href={`/storage/${f.link}`} 
                                                                        target="_blank" 
                                                                        className="text-dark text-truncate"
                                                                    >
                                                                        {f.file}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td>
                                                        {!_.isNull(list.jadwal_kirim)&&
                                                            <>{moment(list.jadwal_kirim).format("DD/MM/YYYY HH:mm")}</>
                                                        }
                                                    </td>
                                                    <td>
                                                        {list.status=="sent"?
                                                            <span className="badge bg-success-subtle text-success py-1 px-2">
                                                                <FiCheckCircle/> Dikirim
                                                            </span>
                                                        :
                                                            <span className="badge bg-dark-subtle text-dark py-1 px-2">
                                                                <FiArchive/> Draft
                                                            </span>
                                                        }
                                                    </td>
                                                    <td className="text-nowrap py-0">
                                                        <div className="d-flex justify-content-end" style={{padding:"5px 0"}}>
                                                            {/* {list.status=="pending"&&
                                                                <button 
                                                                    type="button" 
                                                                    className="btn btn-secondary btn-sm rounded-2 ms-1"
                                                                    onClick={e=>{
                                                                        const {data, ...new_list}=list

                                                                        props.send_message.mutate(new_list, {
                                                                            onSuccess:data=>{
                                                                                const new_values_with_data=Object.assign({}, new_list, {
                                                                                    kirim:true,
                                                                                    data:data.data
                                                                                })
                                                                                update_pesan.mutate(new_values_with_data, {
                                                                                    onSettled:data=>{
                                                                                        actions.setSubmitting(false)
                                                                                    }
                                                                                })
                                                                            }
                                                                        })
                                                                    }}
                                                                >
                                                                    <FiSend className="icon"/> Kirim Sekarang
                                                                </button>
                                                            } */}
                                                            {list.status=="draft"&&
                                                                <button type="button" className="btn btn-secondary btn-sm rounded-2 ms-1" onClick={()=>props.toggleEdit(list, true)}>
                                                                    <FiEdit className="icon"/>
                                                                </button>
                                                            }
                                                            <button type="button" className="btn btn-danger btn-sm rounded-2 ms-1" onClick={()=>confirmHapus(list)}>
                                                                <FiTrash2 className="icon"/>
                                                            </button>
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
                                                    <td colSpan={7} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("gets_pesan")}>
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
    const add_pesan=useMutation({
        mutationFn:params=>pesan_request.add(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_pesan")
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
    const merged_kontak_and_group=()=>{
        const data_group=props.options_kontak_group.data.data
        const data_kontak=props.options_kontak.data.data

        return data_group.concat(data_kontak)
    }
    const options_kontak=()=>{
        const data=merged_kontak_and_group()
            .slice(0, 15)
            .map(d=>{
                if(!_.isUndefined(d.kontak)){
                    return {
                        label:`${d.nama_group} (${d.kontak.length} data)`,
                        value:`group-${d.id_group}`,
                        kontak:d.kontak
                    }
                }
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
                const options=merged_kontak_and_group()
                    .filter(f=>{
                        if(!_.isUndefined(f.kontak)){
                            return f.nama_group.toString().toLowerCase().indexOf(q.toLowerCase())>=0
                        }
                        return f.nama_lengkap.toString().toLowerCase().indexOf(q.toLowerCase())>=0 || f.no_hp.toString().indexOf(q)>=0
                    })
                    .slice(0, 15)
                    .map(d=>{
                        if(!_.isUndefined(d.kontak)){
                            return {
                                label:`${d.nama_group} (${d.kontak.length} data)`,
                                value:`group-${d.id_group}`,
                                kontak:d.kontak
                            }
                        }
                        return {
                            label:d.nama_lengkap,
                            value:d.no_hp
                        }
                    })
                
                resolve(options)
            }, 500);
        })
    }
    let timeoutSearchKontak=0
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleTambah} backdrop="static" size="md" scrollable>
            <Formik
                initialValues={props.data.pesan}
                onSubmit={(values, actions)=>{
                    const new_values=Object.assign({}, values, {
                        jadwal_kirim:values.jadwal_kirim!=""?moment(values.jadwal_kirim).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"):""
                    })
                    
                    let send_type
                    if(new_values.jadwal_kirim!=""){
                        send_type=props.send_message_schedule
                    }
                    else{
                        send_type=props.send_message
                    }

                    send_type.mutate(new_values, {
                        onSuccess:data=>{
                            const new_values_with_data=Object.assign({}, new_values, {
                                data:data.data,
                                status:"sent"
                            })
                            add_pesan.mutate(new_values_with_data, {
                                onSettled:data=>{
                                    actions.setSubmitting(false)
                                }
                            })
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        penerima:yup.array().required().min(1),
                        pesan:yup.string().required(),
                        file:yup.array().optional(),
                        schedule:yup.boolean().required(),
                        jadwal_kirim:yup.string().when("schedule", {
                            is:true,
                            then:schema=>schema.required()
                        })
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Tambah Pesan</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2">Penerima ({formik.values.penerima.length}) <span className="text-danger">*</span></label>
                                        <CreateAsyncMultiSelect
                                            value={formik.values.penerima.map(l=>({label:l, value:l}))}
                                            defaultOptions={options_kontak()}
                                            loadOptions={searchKontak}
                                            onChange={e=>{
                                                const penerima=e.slice(0, e.length-1)
                                                let penerima_new=[]
                                                
                                                //check type(kontak/group)
                                                const last_input=e[e.length-1]
                                                if(!_.isUndefined(last_input.kontak)){
                                                    penerima_new=last_input.kontak.map(k=>({label:k.no_hp, value:k.no_hp}))
                                                }
                                                else{
                                                    penerima_new=[last_input]
                                                }

                                                const data_penerima=penerima.concat(penerima_new).map(p=>p.value)
                                                formik.setFieldValue("penerima", _.uniq(data_penerima, true, x=>x))
                                            }}
                                            onCreateOption={e=>{
                                                if(!_.isNaN(Number(e))){
                                                    const penerima=formik.values.penerima.concat([e])
                                                    formik.setFieldValue("penerima", _.uniq(penerima, true, x=>x))
                                                }
                                            }}
                                            placeholder="Cari Kontak"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Pesan <span className="text-danger">*</span></label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            name="pesan"
                                            onChange={e=>formik.setFieldValue("pesan", e.target.value)}
                                            value={formik.values.pesan}
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
                                                                const dokumen=formik.values.file.concat([
                                                                    {
                                                                        file:data.data.file_name,
                                                                        link:data.data.file
                                                                    }
                                                                ])
                                                                formik.setFieldValue("file", dokumen)
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
                                            </div>
                                            <div className="mt-1">
                                                {formik.values.file.length>0?
                                                    <ul className="ms-0 ps-0">
                                                        {formik.values.file.map((list, idx)=>(
                                                            <li className="d-flex justify-content-between mb-1">
                                                                <a 
                                                                    href={`/storage/${list.link}`} 
                                                                    target="_blank" 
                                                                    className="text-dark text-truncate"
                                                                >
                                                                    {list.file}
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm px-1 ms-2"
                                                                    onClick={e=>{
                                                                        const dokumen=[
                                                                            ...formik.values.file.slice(0, idx),
                                                                            ...formik.values.file.slice(idx+1)
                                                                        ]
                                                                        formik.setFieldValue("file", dokumen)
                                                                    }}
                                                                >
                                                                    <i><FiTrash2/></i>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                :
                                                    <span className="text-dark">Tidak ada berkas dipilih!</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mt-4 mb-1">
                                        <SwitchInput
                                            label="Jadwalkan Pengiriman Pesan Whatsapp"
                                            id="send-wa-schedule"
                                            checked={formik.values.schedule}
                                            onChange={e=>{
                                                if(formik.values.schedule){
                                                    formik.setValues(
                                                        Object.assign({}, formik.values, {
                                                            schedule:false,
                                                            jadwal_kirim:""
                                                        })
                                                    )
                                                }
                                                else{
                                                    formik.setValues(
                                                        Object.assign({}, formik.values, {
                                                            schedule:true,
                                                            jadwal_kirim:moment().format("YYYY-MM-DD[T]HH:mm")
                                                        })
                                                    )
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                {formik.values.schedule&&
                                    <div className="col-12">
                                        <div className="mb-2">
                                            <input 
                                                type="datetime-local" 
                                                className="form-control"
                                                name="jadwal_kirim"
                                                onChange={formik.handleChange}
                                                value={formik.values.jadwal_kirim}
                                            />
                                        </div>
                                    </div>
                                }
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
                                type="button" 
                                className="btn btn-secondary me-1"
                                disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                                onClick={e=>{
                                    formik.setSubmitting(true)

                                    const new_values_with_data=Object.assign({}, formik.values, {
                                        data:[],
                                        status:"draft",
                                        jadwal_kirim:formik.values.jadwal_kirim!=""?moment(formik.values.jadwal_kirim).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"):""
                                    })
                                    add_pesan.mutate(new_values_with_data, {
                                        onSettled:data=>{
                                            formik.setSubmitting(false)
                                        }
                                    })
                                }}
                            >
                                Save Draft
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={formik.isSubmitting||!(formik.dirty&&formik.isValid)}
                            >
                                Kirim Sekarang
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
    const update_pesan=useMutation({
        mutationFn:params=>pesan_request.update(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_pesan")
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
    const merged_kontak_and_group=()=>{
        const data_group=props.options_kontak_group.data.data
        const data_kontak=props.options_kontak.data.data

        return data_group.concat(data_kontak)
    }
    const options_kontak=()=>{
        const data=merged_kontak_and_group()
            .slice(0, 15)
            .map(d=>{
                if(!_.isUndefined(d.kontak)){
                    return {
                        label:`${d.nama_group} (${d.kontak.length} data)`,
                        value:`group-${d.id_group}`,
                        kontak:d.kontak
                    }
                }
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
                const options=merged_kontak_and_group()
                    .filter(f=>{
                        if(!_.isUndefined(f.kontak)){
                            return f.nama_group.toString().toLowerCase().indexOf(q.toLowerCase())>=0
                        }
                        return f.nama_lengkap.toString().toLowerCase().indexOf(q.toLowerCase())>=0 || f.no_hp.toString().indexOf(q)>=0
                    })
                    .slice(0, 15)
                    .map(d=>{
                        if(!_.isUndefined(d.kontak)){
                            return {
                                label:`${d.nama_group} (${d.kontak.length} data)`,
                                value:`group-${d.id_group}`,
                                kontak:d.kontak
                            }
                        }
                        return {
                            label:d.nama_lengkap,
                            value:d.no_hp
                        }
                    })
                
                resolve(options)
            }, 500);
        })
    }
    let timeoutSearchKontak=0
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleEdit} backdrop="static" size="md" scrollable>
            <Formik
                initialValues={props.data.pesan}
                onSubmit={(values, actions)=>{
                    const new_values=Object.assign({}, values, {
                        jadwal_kirim:values.jadwal_kirim!=""?moment(values.jadwal_kirim).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"):""
                    })
                    
                    let send_type
                    if(new_values.jadwal_kirim!=""){
                        send_type=props.send_message_schedule
                    }
                    else{
                        send_type=props.send_message
                    }

                    send_type.mutate(new_values, {
                        onSuccess:data=>{
                            const new_values_with_data=Object.assign({}, new_values, {
                                data:data.data,
                                status:"sent"
                            })
                            update_pesan.mutate(new_values_with_data, {
                                onSettled:data=>{
                                    actions.setSubmitting(false)
                                }
                            })
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        penerima:yup.array().required().min(1),
                        pesan:yup.string().required(),
                        file:yup.array().optional(),
                        schedule:yup.boolean().required(),
                        jadwal_kirim:yup.string().when("schedule", {
                            is:true,
                            then:schema=>schema.required()
                        })
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit Pesan</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2">Penerima ({formik.values.penerima.length}) <span className="text-danger">*</span></label>
                                        <CreateAsyncMultiSelect
                                            value={formik.values.penerima.map(l=>({label:l, value:l}))}
                                            defaultOptions={options_kontak()}
                                            loadOptions={searchKontak}
                                            onChange={e=>{
                                                const penerima=e.slice(0, e.length-1)
                                                let penerima_new=[]
                                                
                                                //check type(kontak/group)
                                                const last_input=e[e.length-1]
                                                if(!_.isUndefined(last_input.kontak)){
                                                    penerima_new=last_input.kontak.map(k=>({label:k.no_hp, value:k.no_hp}))
                                                }
                                                else{
                                                    penerima_new=[last_input]
                                                }

                                                const data_penerima=penerima.concat(penerima_new).map(p=>p.value)
                                                formik.setFieldValue("penerima", _.uniq(data_penerima, true, x=>x))
                                            }}
                                            onCreateOption={e=>{
                                                if(!_.isNaN(Number(e))){
                                                    const penerima=formik.values.penerima.concat([e])
                                                    formik.setFieldValue("penerima", _.uniq(penerima, true, x=>x))
                                                }
                                            }}
                                            placeholder="Cari Kontak"
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Pesan <span className="text-danger">*</span></label>
                                        <textarea
                                            rows="3"
                                            className="form-control"
                                            name="pesan"
                                            onChange={e=>formik.setFieldValue("pesan", e.target.value)}
                                            value={formik.values.pesan}
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
                                                                const dokumen=formik.values.file.concat([
                                                                    {
                                                                        file:data.data.file_name,
                                                                        link:data.data.file
                                                                    }
                                                                ])
                                                                formik.setFieldValue("file", dokumen)
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
                                            </div>
                                            <div className="mt-1">
                                                {formik.values.file.length>0?
                                                    <ul className="ms-0 ps-0">
                                                        {formik.values.file.map((list, idx)=>(
                                                            <li className="d-flex justify-content-between mb-1">
                                                                <a 
                                                                    href={`/storage/${list.link}`} 
                                                                    target="_blank" 
                                                                    className="text-dark text-truncate"
                                                                >
                                                                    {list.file}
                                                                </a>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-danger btn-sm px-1 ms-2"
                                                                    onClick={e=>{
                                                                        const dokumen=[
                                                                            ...formik.values.file.slice(0, idx),
                                                                            ...formik.values.file.slice(idx+1)
                                                                        ]
                                                                        formik.setFieldValue("file", dokumen)
                                                                    }}
                                                                >
                                                                    <i><FiTrash2/></i>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                :
                                                    <span className="text-dark">Tidak ada berkas dipilih!</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mt-4 mb-1">
                                        <SwitchInput
                                            label="Jadwalkan Pengiriman Pesan Whatsapp"
                                            id="send-wa-schedule"
                                            checked={formik.values.schedule}
                                            onChange={e=>{
                                                if(formik.values.schedule){
                                                    formik.setValues(
                                                        Object.assign({}, formik.values, {
                                                            schedule:false,
                                                            jadwal_kirim:""
                                                        })
                                                    )
                                                }
                                                else{
                                                    formik.setValues(
                                                        Object.assign({}, formik.values, {
                                                            schedule:true,
                                                            jadwal_kirim:moment().format("YYYY-MM-DD[T]HH:mm")
                                                        })
                                                    )
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                {formik.values.schedule&&
                                    <div className="col-12">
                                        <div className="mb-2">
                                            <input 
                                                type="datetime-local" 
                                                className="form-control"
                                                name="jadwal_kirim"
                                                onChange={formik.handleChange}
                                                value={formik.values.jadwal_kirim}
                                            />
                                        </div>
                                    </div>
                                }
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
                                type="button" 
                                className="btn btn-secondary me-1"
                                disabled={formik.isSubmitting||!(formik.isValid)}
                                onClick={e=>{
                                    formik.setSubmitting(true)

                                    const new_values_with_data=Object.assign({}, formik.values, {
                                        data:[],
                                        status:"draft",
                                        jadwal_kirim:formik.values.jadwal_kirim!=""?moment(formik.values.jadwal_kirim).tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss"):""
                                    })
                                    update_pesan.mutate(new_values_with_data, {
                                        onSettled:data=>{
                                            formik.setSubmitting(false)
                                        }
                                    })
                                }}
                            >
                                Save Draft
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={formik.isSubmitting||!(formik.isValid)}
                            >
                                Kirim Sekarang
                            </button>
                        </Modal.Footer>
                    </form>
                )}
            </Formik>
        </Modal>
    )
}


export default Page