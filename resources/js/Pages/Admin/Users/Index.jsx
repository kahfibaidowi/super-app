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
import _ from "underscore"
import { Map } from "immutable"
import { router } from "@inertiajs/react"
import clsx from "clsx"
import axios from "axios"
import { file_request,  user_request, ppepp_kriteria_request } from "@/Config/request"
import { SwitchInput } from "@/Components/ui/input_form"


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        per_page:15,
        last_page:0,
        page:1,
        q:"",
        role:"",
        status:""
    })
    const [tambah_user, setTambahUser]=useState({
        is_open:false,
        user:{
            username:"",
            email:"",
            nama_lengkap:"",
            password:"",
            role:"",
            avatar_url:"",
            status:"active",
            id_kriteria:""
        }
    })
    const [edit_user, setEditUser]=useState({
        is_open:false,
        user:{}
    })

    //DATA/MUTATION
    const gets_user=useQuery({
        queryKey:["gets_user", filter],
        queryFn:async()=>user_request.gets(filter),
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

    //ACTIONS
    const toggleTambah=()=>{
        setTambahUser({
            is_open:!tambah_user.is_open,
            user:{
                username:"",
                email:"",
                nama_lengkap:"",
                password:"",
                role:"",
                avatar_url:"",
                status:"active",
                id_kriteria:""
            }
        })
    }
    const toggleEdit=(list={}, show=false)=>{
        setEditUser({
            is_open:show,
            user:Object.assign({}, list, {
                password:"",
                id_kriteria:!_.isNull(list.id_kriteria)?list.id_kriteria:""
            })
        })
    }

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Master Users/Pengguna</h4>
                            <button className="btn btn-primary fw-bold ms-2 rounded-pill" onClick={e=>toggleTambah()}>
                                <FiPlus/> Tambah
                            </button>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_user} 
                    filter={filter} 
                    setFilter={setFilter}
                    toggleEdit={toggleEdit}
                />
            </Layout>

            <ModalTambah
                data={tambah_user}
                options_kriteria={options_kriteria}
                toggleTambah={toggleTambah}
            />

            <ModalEdit
                data={edit_user}
                options_kriteria={options_kriteria}
                toggleEdit={toggleEdit}
            />
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION
    const delete_user=useMutation({
        mutationFn:(id)=>user_request.delete(id),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_user")
        },
        onError:err=>{
            toast.error("Remove Data Failed!", {position:"bottom-center"})
        }
    })

    //VALUES
    const userStatus=status=>{
        switch(status){
            case "active":
                return <span className="badge bg-success">Aktif</span>
            break;
            case "suspend":
                return <span className="badge bg-danger">Disuspend</span>
            break;
        }
    }

    //FILTER
    const role_options=()=>{
        const data=[
            {label:"Admin", value:"admin"},
            {label:"Pengawal", value:"pengawal"}
        ]

        return [{label:"Semua Role/Group", value:""}].concat(data)
    }
    const status_options=[
        {label:"Semua Status", value:""},
        {label:"Aktif", value:"active"},
        {label:"Disuspend", value:"suspend"}
    ]
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
            title: "Yakin ingin menghapus user "+list.nama_lengkap+"?",
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
                delete_user.mutate(list.id_user)
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
                                    options={role_options()}
                                    value={role_options().find(f=>f.value==props.filter.role)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"role", value:e.value}})
                                    }}
                                    placeholder="Semua Role/Group"
                                />
                            </div>
                            <div style={{width:"200px"}} className="me-2">
                            <Select
                                    options={status_options}
                                    value={status_options.find(f=>f.value==props.filter.status)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"status", value:e.value}})
                                    }}
                                    placeholder="Semua Status"
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
                                        <th className="">User/Pengguna</th>
                                        <th className="" width="120">Username</th>
                                        <th className="" width="180">E-Mail</th>
                                        <th className="" width="100">Role</th>
                                        <th className="" width="120">Status</th>
                                        <th className="" width="50"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!props.data.isFetching?
                                        <>
                                            {props.data.data.data.map((list, idx)=>(
                                                <tr key={list}>
                                                    <td>{(idx+1)+((props.data.data.current_page-1)*props.filter.per_page)}</td>
                                                    <td className="py-0">
                                                        <div className="d-flex align-items-center h-100" style={{paddingTop:"2px"}}>
                                                            <div className="d-flex align-items-center">
                                                                <span className="avatar avatar-xs text-secondary d-flex align-items-center justify-content-center rounded-3 bg-dark-subtle">
                                                                    <Avatar 
                                                                        data={list}
                                                                        style={{borderRadius:0}}
                                                                    />
                                                                </span>
                                                            </div>
                                                            <span className="fw-semibold text-capitalize ms-2">{list.nama_lengkap}</span>
                                                        </div>
                                                    </td>
                                                    <td>{list.username}</td>
                                                    <td><a className="link-primary" href={`mailto:${list.email}`}>{list.email}</a></td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            {list.role}
                                                            {list.role=="pengawal"&&
                                                                <>
                                                                    {!_.isNull(list.kriteria)?
                                                                        <span className="text-success">{list.kriteria?.nama_kriteria}</span>
                                                                    :
                                                                        <span className="text-danger">-</span>
                                                                    }
                                                                </>
                                                            }
                                                        </div>
                                                    </td>
                                                    <td>{userStatus(list.status)}</td>
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
                                                    <td colSpan={7} className="text-center cursor-pointer" onClick={()=>queryClient.refetchQueries("gets_user")}>
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
    const add_user=useMutation({
        mutationFn:params=>user_request.add(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_user")
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
    const options_kriteria=()=>{
        const data=props.options_kriteria.data.data.map(d=>{
            return {
                label:d.nama_kriteria,
                value:d.id_kriteria
            }
        })

        return [{label:"Pilih kriteria", value:""}].concat(data)
    }
    const role_options=()=>{
        const data=[
            {label:"Admin", value:"admin"},
            {label:"Pengawal", value:"pengawal"}
        ]

        return [{label:"Pilih Role/Group", value:""}].concat(data)
    }
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleTambah} backdrop="static" size="md" scrollable>
            <Formik
                initialValues={props.data.user}
                onSubmit={(values, actions)=>{
                    add_user.mutate(values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        username:yup.string().required(),
                        email:yup.string().email().required().email(),
                        nama_lengkap:yup.string().required(),
                        password:yup.string().min(5).required(),
                        role:yup.string().required(),
                        status:yup.string().required(),
                        avatar_url:yup.string().optional(),
                        id_kriteria:yup.string().when("role", {
                            is:"pengawal",
                            then:schema=>schema.required()
                        })
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Tambah User/Pengguna</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Role/Group <span className="text-danger">*</span></label>
                                        <Select
                                            options={role_options()}
                                            value={role_options().find(f=>f.value==formik.values.role)}
                                            onChange={e=>{
                                                formik.setValues(
                                                    Object.assign({}, formik.values, {
                                                        role:e.value,
                                                        id_kriteria:""
                                                    })
                                                )
                                            }}
                                            placeholder="Pilih Role/Group"
                                        />
                                    </div>
                                </div>
                                {formik.values.role=="pengawal"&&
                                    <div className="col-12">
                                        <div className="mb-2">
                                            <label className="my-1 me-2" for="country">Kriteria <span className="text-danger">*</span></label>
                                            <Select
                                                options={options_kriteria()}
                                                value={options_kriteria().find(f=>f.value==formik.values.id_kriteria)}
                                                onChange={e=>{
                                                    formik.setFieldValue("id_kriteria", e.value)
                                                }}
                                                placeholder="Pilih Kriteria"
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                            <hr className="mb-1 mt-5"/>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Nama Lengkap <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_lengkap"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_lengkap}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">E-Mail <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="email"
                                            onChange={formik.handleChange}
                                            value={formik.values.email}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Username <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="username"
                                            onChange={formik.handleChange}
                                            value={formik.values.username}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Password <span className="text-danger">*</span></label>
                                        <input 
                                            type="password" 
                                            className="form-control"
                                            name="password"
                                            onChange={formik.handleChange}
                                            value={formik.values.password}
                                        />
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-4">
                                        <label className="my-1 me-2" for="country">Avatar/Foto</label>
                                        <div className="d-flex flex-column">
                                            <div>
                                                <label>
                                                    <div className="btn btn-secondary btn-sm cursor-pointer">
                                                        <FiUpload className="icon"/> Upload
                                                    </div>
                                                    <input
                                                        type="file"
                                                        style={{display:"none"}}
                                                        accept=".jpg, .png"
                                                        onChange={e=>{
                                                            file_request.uploadAvatar(e.target.files[0])
                                                            .then(data=>{
                                                                formik.setFieldValue("avatar_url", data.data.file)
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
                                                    onClick={e=>formik.setFieldValue("avatar_url", "")}
                                                >
                                                    <i><FiTrash2/></i>
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                <span className="d-flex avatar avatar-md text-secondary rounded-3 bg-gray-300">
                                                    <Avatar 
                                                        data={formik.values}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <SwitchInput
                                            label="Aktifkan User/Pengguna"
                                            id="sw-user-active"
                                            checked={formik.values.status=="active"}
                                            onChange={()=>{
                                                formik.setFieldValue("status", formik.values.status=="active"?"suspend":"active")
                                            }}
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
    const update_user=useMutation({
        mutationFn:params=>user_request.update(params),
        onSuccess:data=>{
            queryClient.refetchQueries("gets_user")
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
    const options_kriteria=()=>{
        const data=props.options_kriteria.data.data.map(d=>{
            return {
                label:d.nama_kriteria,
                value:d.id_kriteria
            }
        })

        return [{label:"Pilih kriteria", value:""}].concat(data)
    }
    const role_options=()=>{
        const data=[
            {label:"Admin", value:"admin"},
            {label:"Pengawal", value:"pengawal"}
        ]

        return [{label:"Pilih Role/Group", value:""}].concat(data)
    }
    
    return (
        <Modal show={props.data.is_open} onHide={props.toggleEdit} backdrop="static" size="md">
            <Formik
                initialValues={props.data.user}
                onSubmit={(values, actions)=>{
                    update_user.mutate(values, {
                        onSettled:data=>{
                            actions.setSubmitting(false)
                        }
                    })
                }}
                validationSchema={
                    yup.object().shape({
                        username:yup.string().required(),
                        email:yup.string().email().required().email(),
                        nama_lengkap:yup.string().required(),
                        password:yup.string().optional(),
                        status:yup.string().required(),
                        avatar_url:yup.string().optional(),
                        id_kriteria:yup.string().when("role", {
                            is:"pengawal",
                            then:schema=>schema.required()
                        })
                    })
                }
            >
                {formik=>(
                    <form onSubmit={formik.handleSubmit}>
                        <Modal.Header closeButton>
                            <h4 className="modal-title">Edit User/Pengguna</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="row">
                                <div className="col-12">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Role/Group <span className="text-danger">*</span></label>
                                        <Select
                                            options={role_options()}
                                            value={role_options().find(f=>f.value==formik.values.role)}
                                            onChange={e=>{
                                                formik.setFieldValue("role", e.value)
                                            }}
                                            placeholder="Pilih Role/Group"
                                            disabled
                                        />
                                    </div>
                                </div>
                                {formik.values.role=="pengawal"&&
                                    <div className="col-12">
                                        <div className="mb-2">
                                            <label className="my-1 me-2" for="country">Kriteria <span className="text-danger">*</span></label>
                                            <Select
                                                options={options_kriteria()}
                                                value={options_kriteria().find(f=>f.value==formik.values.id_kriteria)}
                                                onChange={e=>{
                                                    formik.setFieldValue("id_kriteria", e.value)
                                                }}
                                                placeholder="Pilih Kriteria"
                                                disabled={formik.values.id_kriteria!=""}
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                            <hr className="mb-1 mt-5"/>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Nama Lengkap <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="nama_lengkap"
                                            onChange={formik.handleChange}
                                            value={formik.values.nama_lengkap}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">E-Mail <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="email"
                                            onChange={formik.handleChange}
                                            value={formik.values.email}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Username <span className="text-danger">*</span></label>
                                        <input 
                                            type="text" 
                                            className="form-control"
                                            name="username"
                                            onChange={formik.handleChange}
                                            value={formik.values.username}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-2">
                                        <label className="my-1 me-2" for="country">Password</label>
                                        <input 
                                            type="password" 
                                            className="form-control"
                                            name="password"
                                            onChange={formik.handleChange}
                                            value={formik.values.password}
                                        />
                                        <span class="form-text text-muted">Kosongkan jika tidak dirubah!</span>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-4">
                                        <label className="my-1 me-2" for="country">Avatar/Foto</label>
                                        <div className="d-flex flex-column">
                                            <div>
                                                <label>
                                                    <div className="btn btn-secondary btn-sm cursor-pointer">
                                                        <FiUpload className="icon"/> Upload
                                                    </div>
                                                    <input
                                                        type="file"
                                                        style={{display:"none"}}
                                                        accept=".jpg, .png"
                                                        onChange={e=>{
                                                            file_request.uploadAvatar(e.target.files[0])
                                                            .then(data=>{
                                                                formik.setFieldValue("avatar_url", data.data.file)
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
                                                    onClick={e=>formik.setFieldValue("avatar_url", "")}
                                                >
                                                    <i><FiTrash2/></i>
                                                </button>
                                            </div>
                                            <div className="mt-2">
                                                <span className="d-flex avatar avatar-md text-secondary rounded-3 bg-gray-300">
                                                    <Avatar 
                                                        data={formik.values}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="mb-2">
                                        <SwitchInput
                                            label="Aktifkan User/Pengguna"
                                            id="sw-user-active"
                                            checked={formik.values.status=="active"}
                                            onChange={()=>{
                                                formik.setFieldValue("status", formik.values.status=="active"?"suspend":"active")
                                            }}
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