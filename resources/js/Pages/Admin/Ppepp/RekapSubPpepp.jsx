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
import Decimal from "decimal.js"


const MySwal=withReactContent(swal)

const Page=(props)=>{

    const [filter, setFilter]=useState({
        id_ppepp:"",
        id_sub_ppepp:"",
        id_kriteria:""
    })

    //DATA/MUTATION
    const gets_rekap_bukti=useQuery({
        queryKey:["gets_rekap_bukti"],
        queryFn:async()=>bukti_request.gets_rekap_bukti(),
        initialData:{
            data:[]
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
    const options_ppepp=useQuery({
        queryKey:["options_ppepp"],
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
    const options_sub_ppepp=useQuery({
        queryKey:["options_sub_ppepp"],
        queryFn:async()=>ppepp_request.gets({type:"sub_ppepp"}),
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

    return (
        <>
            <Layout>
                <div class="row">
                    <div class="col-12">
                        <div class="page-title-box d-flex align-items-center">
                            <h4 class="page-title">Penilaian</h4>
                        </div>
                    </div>
                </div>

                <Table 
                    data={gets_rekap_bukti}
                    filter={filter}
                    setFilter={setFilter}
                    options_kriteria={options_kriteria}
                    options_ppepp={options_ppepp}
                />
            </Layout>
        </>
    )
}

const Table=(props)=>{

    //DATA/MUTATION

    //VALUES
    const generated_data=()=>{
        let data_kriteria=props.data.data.data
        if(props.filter.id_kriteria!=""){
            data_kriteria=data_kriteria.filter(f=>f.id_kriteria==props.filter.id_kriteria)
        }
        
        const kriteria=data_kriteria.map(k=>{
            let k_row=k.ppepp.length==0?1:0
            
            let data_ppepp=k.ppepp
            if(props.filter.id_ppepp!=""){
                data_ppepp=data_ppepp.filter(f=>f.id_ppepp==props.filter.id_ppepp)
            }

            const ppepp=data_ppepp.map(p=>{
                let p_row=p.sub_ppepp.length==0?1:0

                let data_sub_ppepp=p.sub_ppepp

                if(data_sub_ppepp.length==0){
                    k_row++
                }

                const sub_ppepp=data_sub_ppepp.map(sp=>{
                    k_row++
                    p_row++

                    return sp
                })

                return Object.assign({}, p, {
                    sub_ppepp,
                    rowspan:p_row
                })
            })

            return Object.assign({}, k, {
                ppepp,
                rowspan:k_row
            })
        })

        return kriteria
    }

    //FILTER
    const options_kriteria=()=>{
        const data=props.options_kriteria.data.data.map(d=>{
            return {
                label:d.nama_kriteria,
                value:d.id_kriteria
            }
        })

        return [{label:"Semua kriteria", value:""}].concat(data)
    }
    const options_ppepp=()=>{
        const data=props.options_ppepp.data.data.filter(f=>f.id_kriteria==props.filter.id_kriteria).map(d=>{
            return {
                label:d.nama_ppepp,
                value:d.id_ppepp
            }
        })

        return [{label:"Semua ppepp", value:""}].concat(data)
    }
    const typeFilter=e=>{
        const target=e.target

        if(target.name=="id_kriteria"){
            props.setFilter(
                Map(props.filter)
                .set(target.name, target.value)
                .set("id_ppepp", "")
                .toJS()
            )
        }
        else{
            props.setFilter(
                Map(props.filter)
                .set(target.name, target.value)
                .toJS()
            )
        }
    }

    //ACTIONS

    //RENDER
    const render_generated_data=()=>{
        let sum_skor=""
        let sum_bobot=""
        let sum_na=""
        let rendered=[]
        generated_data().map((k, idx_k)=>{
            let sum_skor_kriteria=""
            let sum_bobot_kriteria=""
            let sum_na_kriteria=""

            if(k.ppepp.length==0){
                rendered=rendered.concat([
                    <tr>
                        <td rowspan={k.rowspan}>{idx_k+1}</td>
                        <td rowspan={k.rowspan}>{k.nama_kriteria}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>,
                    <tr>
                        <th colSpan="5" className="text-end"></th>
                        <th></th>
                        <th height="38"></th>
                        <th></th>
                    </tr>
                ])
                return
            }

            k.ppepp.map((p, idx_p)=>{
                if(p.sub_ppepp.length==0){
                    rendered=rendered.concat([
                        <tr>
                            {(idx_p==0)&&
                                <>
                                    <td rowspan={k.rowspan}>{idx_k+1}</td>
                                    <td rowspan={k.rowspan}>{k.nama_kriteria}</td>
                                </>
                            }
                            <td rowspan={p.rowspan}>{p.nama_ppepp}</td>
                            <td rowspan={p.rowspan} className="text-prewrap">{p.deskripsi}</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    ])
                    return
                }

                return p.sub_ppepp.map((sp, idx_sp)=>{
                    const found_bukti=sp.bukti.length>0?true:false
                    const skor=sp.skor
                    const bobot=sp.bobot
                    const na=new Decimal(skor).mul(bobot).toNumber()

                    if(found_bukti){
                        if(sum_skor=="" && sum_bobot=="" && sum_na==""){
                            sum_skor=Number(sp.skor)
                            sum_bobot=Number(sp.bobot)
                            sum_na=na
                        }
                        else{
                            sum_skor+=Number(sp.skor)
                            sum_bobot+=Number(sp.bobot)
                            sum_na+=na
                        }
    
                        if(sum_skor_kriteria=="" && sum_bobot_kriteria=="" && sum_na_kriteria==""){
                            sum_skor_kriteria=Number(sp.skor)
                            sum_bobot_kriteria=Number(sp.bobot)
                            sum_na_kriteria=na
                        }
                        else{
                            sum_skor_kriteria+=Number(sp.skor)
                            sum_bobot_kriteria+=Number(sp.bobot)
                            sum_na_kriteria+=na
                        }
                    }

                    rendered=rendered.concat([
                        <tr>
                            {(idx_p==0 && idx_sp==0)&&
                                <>
                                    <td rowspan={k.rowspan}>{idx_k+1}</td>
                                    <td rowspan={k.rowspan}>{k.nama_kriteria}</td>
                                </>
                            }
                            {(idx_sp==0)&&
                                <>
                                    <td rowspan={p.rowspan}>{p.nama_ppepp}</td>
                                    <td rowspan={p.rowspan} className="text-prewrap">{p.deskripsi}</td>
                                </>
                            }
                            <td rowspan={sp.rowspan}>{sp.nama_ppepp}</td>
                            <td>{found_bukti?sp.skor:""}</td>
                            <td>{found_bukti?sp.bobot+"%":""}</td>
                            <td>{found_bukti?na:""}</td>
                        </tr>
                    ])
                    return
                })
            })

            rendered=rendered.concat([
                <tr>
                    <th colSpan="5" className="text-end"></th>
                    <th>{sum_skor_kriteria}</th>
                    <th height="38">{sum_bobot_kriteria!=""?sum_bobot_kriteria+"%":""}</th>
                    <th>{sum_na_kriteria}</th>
                </tr>
            ])
        })

        //summary
        rendered=rendered.concat([
            <tr>
                <th colSpan="5" className="text-end">Total</th>
                <th>{sum_skor}</th>
                <th>{sum_bobot!=""?sum_bobot+"%":""}</th>
                <th>{sum_na}</th>
            </tr>
        ])
        
        return rendered
    }

    return (
        <div className="row">
            <div className="col-12">
                <div class="card">
                    <div className="card-header">
                        <div className="d-flex my-1">
                            <div style={{width:"200px"}} className="me-2">
                                <Select
                                    options={options_kriteria()}
                                    value={options_kriteria().find(f=>f.value==props.filter.id_kriteria)}
                                    onChange={e=>{
                                        typeFilter({target:{name:"id_kriteria", value:e.value}})
                                    }}
                                    placeholder="Pilih kriteria"
                                />
                            </div>
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
                        </div>
                    </div>
                    <div class="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered table-custom table-wrap table-sm mb-0 w-100">
                                <thead>
                                    <tr>
                                        <th className="" width="50">#</th>
                                        <th className="">Kriteria</th>
                                        <th className="">PPEPP</th>
                                        <th className="">Deskripsi</th>
                                        <th className="">Sub PPEPP</th>
                                        <th className="" width="100">Skor</th>
                                        <th className="" width="100">Bobot</th>
                                        <th className="" width="100">Nilai Akhir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {render_generated_data()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Page