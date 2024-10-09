import React, { useEffect, useMemo, useState } from "react"
import Layout from "@/Components/layout"
import { queryClient } from "@/Config/api"
import { toast } from "react-toastify"
import { FiChevronLeft, FiChevronRight, FiEdit, FiPlus, FiRefreshCw, FiTrash, FiTrash2, FiUpload } from "react-icons/fi"
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

const Page=(props)=>{

    //VALUES
    const filtered_data=()=>{
        if(props.tahun==""){
            return props.data
        }

        return props.data.filter(f=>f.tahun==props.tahun)
    }
    const filtered_detail=()=>{
        const detail_tahun=props.detail.filter(f=>f.tahun==props.tahun)
        if(detail_tahun.length>0){
            return detail_tahun[0]
        }
        return {
            tahun:props.tahun,
            jumlah_alumni_3_tahun_terakhir:"",
            jumlah_perusahaan_responden:""
        }
    }
    const jumlah_kelulusan_tepat_waktu=(type="")=>{
        if(type=="") return

        const columns=[
            "kepuasan_pengguna_sangat_baik",
            "kepuasan_pengguna_baik",
            "kepuasan_pengguna_cukup",
            "kepuasan_pengguna_kurang"
        ]
        
        if(columns.filter(f=>f==type).length>0){
            return filtered_data().reduce((prev, list)=>{
                return prev+Number(list[type])
            }, 0)
        }
    }

    return (
        <>
            <div id="table-title" className="d-flex justify-content-center mt-3 mb-5">
                <h2>Kelulusan Tepat Waktu</h2>
            </div>
            <div id="table-container">
                <table id="table" className="table table-sm">
                    <thead>
                        <tr>
                            <th className="" rowSpan={2} width="50">#</th>
                            <th className="" rowSpan={2}>Tahun</th>
                            <th className="" rowSpan={2}>Jenis Kemampuan</th>
                            <th className="" colSpan={4}>Tingkat Kepuasan Pengguna (%)</th>
                            <th className="" rowSpan={2}>Rencana Tindak Lanjut oleh UPPS/PS</th>
                        </tr>
                        <tr>
                            <th className="">Sangat Baik</th>
                            <th className="">Baik</th>
                            <th className="">Cukup</th>
                            <th className="">Kurang</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered_data().map((list, idx)=>(
                            <tr key={list}><td>{idx+1}</td>
                                <td>{list.tahun}</td>
                                <td>{list.jenis_kemampuan}</td>
                                <td>{list.kepuasan_pengguna_sangat_baik}</td>
                                <td>{list.kepuasan_pengguna_baik}</td>
                                <td>{list.kepuasan_pengguna_cukup}</td>
                                <td>{list.kepuasan_pengguna_kurang}</td>
                                <td className="text-prewrap">{list.rencana_tindak_lanjut_upps}</td>
                            </tr>
                        ))}
                        {filtered_data().length>0&&
                            <>
                                <tr>
                                    <th colSpan={3}>Jumlah*</th>
                                    <th>{jumlah_kelulusan_tepat_waktu("kepuasan_pengguna_sangat_baik")}</th>
                                    <th>{jumlah_kelulusan_tepat_waktu("kepuasan_pengguna_baik")}</th>
                                    <th>{jumlah_kelulusan_tepat_waktu("kepuasan_pengguna_cukup")}</th>
                                    <th>{jumlah_kelulusan_tepat_waktu("kepuasan_pengguna_kurang")}</th>
                                    <th></th>
                                </tr>
                            </>
                        }
                        {filtered_data().length==0&&
                            <tr>
                                <td colSpan={8} className="text-center">Data tidak ditemukan!</td>
                            </tr>
                        }
                    </tbody>
                </table>

                {props.tahun!=""&&
                    <div className="d-flex flex-column align-items-start mt-3">
                        <div>
                            Jumlah Alumni/Lulusan dalam 3 tahun terakhir : 
                            {filtered_detail().jumlah_alumni_3_tahun_terakhir!=""&&
                                <span className="fw-bold text-dark ms-2">{filtered_detail().jumlah_alumni_3_tahun_terakhir} orang</span>
                            }
                        </div>
                        <div>
                            Jumlah Perusahaan sbg Responden : 
                            {filtered_detail().jumlah_perusahaan_responden!=""&&
                                <span className="fw-bold text-dark ms-2">{filtered_detail().jumlah_perusahaan_responden} orang</span>
                            }
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default Page