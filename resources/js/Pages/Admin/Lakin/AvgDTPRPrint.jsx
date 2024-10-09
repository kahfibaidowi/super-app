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

    return (
        <>
            <div id="table-title" className="d-flex justify-content-center mt-3 mb-5">
                <h2>Rata-rata beban DTPR per semester, pada TS</h2>
            </div>
            <div id="table-container">
                <table id="table" className="table table-sm">
                    <thead>
                        <tr>
                            <th className="" rowSpan={2} width="50">#</th>
                            <th className="" rowSpan={2}>Tahun</th>
                            <th className="" rowSpan={2}>Nama Dosen Tetap DTPR</th>
                            <th className="" colSpan={3}>SKS Pengajaran Pada</th>
                            <th className="" rowSpan={2}>SKS Penelitian</th>
                            <th className="" rowSpan={2}>SKS Pengabdian Kepada Masy</th>
                            <th className="" colSpan={2}>SKS Manajemen</th>
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
                                </tr>
                            </>
                        }
                        {filtered_data().length==0&&
                            <tr>
                                <td colSpan={10} className="text-center">Data tidak ditemukan!</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Page