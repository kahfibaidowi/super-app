

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