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

    return (
        <>
            <div id="doc-title" className="d-flex justify-content-center mt-3 mb-5 text-center" style={{width:"400px"}}>
                <h2>Identitas Tim Penyusun Laporan Kinerja Program Studi</h2>
            </div>
            <div id="table-container">
                <div className="d-flex flex-column">
                    {filtered_data().map(list=>(
                        <div className="block-print d-flex flex-column mb-2">
                            <div className="d-flex mb-1">
                                <div className="d-flex fw-bold" style={{width:"140px"}}>Nama</div>
                                <span className="d-flex" style={{width:"10px"}}>:</span>
                                <div>{list.nama}</div>
                            </div>
                            <div className="d-flex mb-1">
                                <div className="d-flex fw-bold" style={{width:"140px"}}>NIDN</div>
                                <span className="d-flex" style={{width:"10px"}}>:</span>
                                <div>{list.nidn}</div>
                            </div>
                            <div className="d-flex mb-1">
                                <div className="d-flex fw-bold" style={{width:"140px"}}>Jabatan</div>
                                <span className="d-flex" style={{width:"10px"}}>:</span>
                                <div>{list.jabatan}</div>
                            </div>
                            <div className="d-flex mb-1">
                                <div className="d-flex fw-bold" style={{width:"140px"}}>Tanggal Pengisian</div>
                                <span className="d-flex" style={{width:"10px"}}>:</span>
                                <div>{list.tgl_pengisian}</div>
                            </div>
                            <div className="d-flex mb-1">
                                <div className="d-flex fw-bold" style={{width:"140px"}}>Tanda Tangan</div>
                                <span className="d-flex" style={{width:"10px"}}>:</span>
                                <div className="d-flex align-items-center justify-content-center" style={{width:"200px", height:"70px", border:"1px solid", borderRadius:"5px"}}>
                                    <img 
                                        src={`/storage/${list.ttd}`} 
                                        style={{maxWidth:"100%", maxHeight:"100%"}}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Page