import uniqid from "uniqid"


export const akronim=str=>{
    if(str.trim()===""){
        return ""
    }
    else{
        const matches=str.match(/\b(\w)/g)
        return matches.join('').toUpperCase().substring(0, 2)
    }
}
export const getURLParam=(param)=>{
    const params=new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    return params[param]
}
export function readFile(fileRes){
    return new Promise((resolve, reject)=>{
        const reader=new FileReader()
        reader.readAsArrayBuffer(fileRes)
        reader.onload=()=>{
            resolve(reader.result)
        }
    })
}
export const generate_id=(data=[])=>{
    let id=""

    while(true){
        const uniq_id=uniqid()

        if(data.filter(f=>f.id==uniq_id).length==0){
            id=uniq_id
            break
        }
    }

    return id
}