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
    const jumlah_masa_tunggu_lulusan_bekerja=(type="")=>{
        if(type=="") return

        const columns=[
            "jumlah_lulusan",
            "jumlah_lulusan_terlacak",
            "avg_waktu_tunggu"
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
                <h2>Rata-rata Masa tunggu Lulusan untuk bekerja pertama kali</h2>
            </div>
            <div id="table-container">
                <table id="table" className="table table-sm">
                    <thead>
                        <tr>
                            <th className="" width="50">#</th>
                            <th className="">Tahun</th>
                            <th className="">Tahun Lulus</th>
                            <th className="">Jumlah Lulusan</th>
                            <th className="">Jumlah Lulusan yang Terlacak</th>
                            <th className="">Rata-rata waktu tunggu (Bulan)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered_data().map((list, idx)=>(
                            <tr key={list}>
                                <td>{idx+1}</td>
                                <td>{list.tahun}</td>
                                <td>{list.tahun_lulus}</td>
                                <td>{list.jumlah_lulusan}</td>
                                <td>{list.jumlah_lulusan_terlacak}</td>
                                <td>{list.avg_waktu_tunggu}</td>
                            </tr>
                        ))}
                        {filtered_data().length>0&&
                            <>
                                <tr>
                                    <th colSpan={3}>Jumlah*</th>
                                    <th>{jumlah_masa_tunggu_lulusan_bekerja("jumlah_lulusan")}</th>
                                    <th>{jumlah_masa_tunggu_lulusan_bekerja("jumlah_lulusan_terlacak")}</th>
                                    <th>{jumlah_masa_tunggu_lulusan_bekerja("avg_waktu_tunggu")}</th>
                                </tr>
                            </>
                        }
                        {filtered_data().length==0&&
                            <tr>
                                <td colSpan={6} className="text-center">Data tidak ditemukan!</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default Page