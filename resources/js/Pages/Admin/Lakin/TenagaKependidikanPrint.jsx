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
        return {tahun:props.tahun, deskripsi:""}
    }
    const jumlah_tenaga_kependidikan=(type="")=>{
        if(type=="") return

        const columns=[
            "jumlah_tenaga_kependidikan_s3",
            "jumlah_tenaga_kependidikan_s2",
            "jumlah_tenaga_kependidikan_s1",
            "jumlah_tenaga_kependidikan_d4",
            "jumlah_tenaga_kependidikan_d3",
            "jumlah_tenaga_kependidikan_d2",
            "jumlah_tenaga_kependidikan_d1",
            "jumlah_tenaga_kependidikan_smak"
        ]
        
        if(columns.filter(f=>f==type).length>0){
            return filtered_data().reduce((prev, list)=>{
                return prev+Number(list[type])
            }, 0)
        }
    }
    const avg_tenaga_kependidikan=(type="")=>{
        if(type=="") return

        const columns=[
            "jumlah_tenaga_kependidikan_s3",
            "jumlah_tenaga_kependidikan_s2",
            "jumlah_tenaga_kependidikan_s1",
            "jumlah_tenaga_kependidikan_d4",
            "jumlah_tenaga_kependidikan_d3",
            "jumlah_tenaga_kependidikan_d2",
            "jumlah_tenaga_kependidikan_d1",
            "jumlah_tenaga_kependidikan_smak"
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
                <h2>Kualifikasi Tenaga Kependidikan</h2>
            </div>
            {props.tahun!=""&&
                <div className="d-flex flex-column align-items-start w-100 mb-4">
                    <div>
                        {filtered_detail().deskripsi!=""?
                            <div className="text-prewrap">{filtered_detail().deskripsi}</div>
                        :
                            <span className="text-muted">tidak ada deskripsi!</span>
                        }
                    </div>
                </div>
            }
            <div id="table-container">
                <table id="table" className="table table-sm">
                    <thead>
                        <tr>
                            <th className="" rowSpan={2} width="50">#</th>
                            <th className="" rowSpan={2}>Tahun</th>
                            <th className="" rowSpan={2}>Jenis Tenaga Kependidikan</th>
                            <th className="" colSpan={8}>Jumlah Tenaga Kependidikan dengan Pendidikan Terakhir</th>
                            <th className="" rowSpan={2}>Unit Kerja</th>
                        </tr>
                        <tr>
                            <th className="">S3</th>
                            <th className="">S2</th>
                            <th className="">S1</th>
                            <th className="">D4</th>
                            <th className="">D3</th>
                            <th className="">D2</th>
                            <th className="">D1</th>
                            <th className="">SMA/SMK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered_data().map((list, idx)=>(
                            <tr key={list}>
                                <td>{idx+1}</td>
                                <td>{list.tahun}</td>
                                <td>{list.jenis_tenaga_kependidikan}</td>
                                <td>{list.jumlah_tenaga_kependidikan_s3}</td>
                                <td>{list.jumlah_tenaga_kependidikan_s2}</td>
                                <td>{list.jumlah_tenaga_kependidikan_s1}</td>
                                <td>{list.jumlah_tenaga_kependidikan_d4}</td>
                                <td>{list.jumlah_tenaga_kependidikan_d3}</td>
                                <td>{list.jumlah_tenaga_kependidikan_d2}</td>
                                <td>{list.jumlah_tenaga_kependidikan_d1}</td>
                                <td>{list.jumlah_tenaga_kependidikan_smak}</td>
                                <td>{list.unit_kerja}</td>
                            </tr>
                        ))}
                        {filtered_data().length>0&&
                            <>
                                <tr>
                                    <th colSpan={3}>Jumlah*</th>
                                    <th>{jumlah_tenaga_kependidikan("jumlah_tenaga_kependidikan_s3")}</th>
                                    <th>{jumlah_tenaga_kependidikan("jumlah_tenaga_kependidikan_s2")}</th>
                                    <th>{jumlah_tenaga_kependidikan("jumlah_tenaga_kependidikan_s1")}</th>
                                    <th>{jumlah_tenaga_kependidikan("jumlah_tenaga_kependidikan_d4")}</th>
                                    <th>{jumlah_tenaga_kependidikan("jumlah_tenaga_kependidikan_d3")}</th>
                                    <th>{jumlah_tenaga_kependidikan("jumlah_tenaga_kependidikan_d2")}</th>
                                    <th>{jumlah_tenaga_kependidikan("jumlah_tenaga_kependidikan_d1")}</th>
                                    <th>{jumlah_tenaga_kependidikan("jumlah_tenaga_kependidikan_smak")}</th>
                                    <th></th>
                                </tr>
                                <tr>
                                    <th colSpan={3}>Rata-rata*</th>
                                    <th>{avg_tenaga_kependidikan("jumlah_tenaga_kependidikan_s3")}</th>
                                    <th>{avg_tenaga_kependidikan("jumlah_tenaga_kependidikan_s2")}</th>
                                    <th>{avg_tenaga_kependidikan("jumlah_tenaga_kependidikan_s1")}</th>
                                    <th>{avg_tenaga_kependidikan("jumlah_tenaga_kependidikan_d4")}</th>
                                    <th>{avg_tenaga_kependidikan("jumlah_tenaga_kependidikan_d3")}</th>
                                    <th>{avg_tenaga_kependidikan("jumlah_tenaga_kependidikan_d2")}</th>
                                    <th>{avg_tenaga_kependidikan("jumlah_tenaga_kependidikan_d1")}</th>
                                    <th>{avg_tenaga_kependidikan("jumlah_tenaga_kependidikan_smak")}</th>
                                    <th></th>
                                </tr>
                            </>
                        }
                        {filtered_data().length==0&&
                            <tr>
                                <td colSpan={12} className="text-center">Data tidak ditemukan!</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Page