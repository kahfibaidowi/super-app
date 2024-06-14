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