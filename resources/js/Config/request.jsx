

//USER
export const user_request={
    gets:async(params={})=>{
        return await axios.get("/api/user", {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/user", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/user/${id}`).then(res=>res.data)
    },
    update:async(params)=>{
        return await axios.put(`/api/user/${params.id_user}`, params).then(res=>res.data)
    }
}

//FILE
export const file_request={
    uploadAvatar:async file=>{
        let formData=new FormData()
        formData.append("image", file)

        return await axios.post("/api/file/upload_avatar", formData, {
            headers:{
                'content-type':"multipart/form-data"
            }
        })
        .then(res=>res.data)
    },
    uploadDokumen:async file=>{
        let formData=new FormData()
        formData.append("dokumen", file)

        return await axios.post("/api/file/upload", formData, {
            headers:{
                'content-type':"multipart/form-data"
            }
        })
        .then(res=>res.data)
    }
}

//ACTIVITY PRODI
export const activity_prodi_request={
    gets:async(params={})=>{
        return await axios.get("/api/activity_prodi", {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/activity_prodi", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/activity_prodi/${id}`).then(res=>res.data)
    },
    update:async(params)=>{
        return await axios.put(`/api/activity_prodi/${params.id_activity_prodi}`, params).then(res=>res.data)
    }
}

//PPEPP KRITERIA
export const ppepp_kriteria_request={
    gets:async(params={})=>{
        return await axios.get("/api/ppepp_kriteria", {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/ppepp_kriteria", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/ppepp_kriteria/${id}`).then(res=>res.data)
    },
    update:async(params)=>{
        return await axios.put(`/api/ppepp_kriteria/${params.id_kriteria}`, params).then(res=>res.data)
    }
}

//PPEPP
export const ppepp_request={
    gets:async(params={})=>{
        return await axios.get("/api/ppepp", {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/ppepp", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/ppepp/${id}`).then(res=>res.data)
    },
    update:async(params)=>{
        return await axios.put(`/api/ppepp/${params.id_ppepp}`, params).then(res=>res.data)
    }
}

//BUKTI
export const bukti_request={
    gets:async(params={})=>{
        return await axios.get("/api/bukti", {
            params:params
        })
        .then(res=>res.data)
    },
    gets_rekap_bukti:async(params={})=>{
        return await axios.get("/api/bukti/type/rekap_bukti", {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/bukti", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/bukti/${id}`).then(res=>res.data)
    },
    update:async(params)=>{
        return await axios.put(`/api/bukti/${params.id_bukti}`, params).then(res=>res.data)
    }
}

//PESAN WHATSAPP
export const pesan_request={
    gets:async(params={})=>{
        return await axios.get("/api/pesan_whatsapp", {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/pesan_whatsapp", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/pesan_whatsapp/${id}`).then(res=>res.data)
    },
    update:async(params)=>{
        return await axios.put(`/api/pesan_whatsapp/${params.id_pesan_whatsapp}`, params).then(res=>res.data)
    },
    send_message:async(params)=>{
        return await axios.post(`/api/pesan_whatsapp/action/send_message`, params).then(res=>res.data)
    },
    send_message_schedule:async(params)=>{
        return await axios.post(`/api/pesan_whatsapp/action/send_message_schedule`, params).then(res=>res.data)
    }
}

//KONTAK
export const kontak_request={
    gets:async(params={})=>{
        return await axios.get("/api/kontak", {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/kontak", params).then(res=>res.data)
    },
    upsert_multiple:async(params)=>{
        return await axios.post("/api/kontak/type/upsert_multiple", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/kontak/${id}`).then(res=>res.data)
    },
    update:async(params)=>{
        return await axios.put(`/api/kontak/${params.id_kontak}`, params).then(res=>res.data)
    }
}

//KONTAK GROUP
export const kontak_group_request={
    gets:async(params={})=>{
        return await axios.get("/api/kontak_group", {
            params:params
        })
        .then(res=>res.data)
    },
    add:async(params)=>{
        return await axios.post("/api/kontak_group", params).then(res=>res.data)
    },
    delete:async(id)=>{
        return await axios.delete(`/api/kontak_group/${id}`).then(res=>res.data)
    },
    update:async(params)=>{
        return await axios.put(`/api/kontak_group/${params.id_group}`, params).then(res=>res.data)
    }
}