import { akronim } from '@/Config/helpers'
import React from 'react'
import _ from 'underscore'


export default function Avatar({data, quality=100, style={}, className=""}) {
    const get_avatar_url=(avatar_url)=>{
        let avatar
        if(_.isUndefined(avatar_url)) avatar=""
        else avatar=avatar_url

        return "/storage/"+avatar
    }

    return (
        <>
            {!_.isUndefined(data)&&
                <>
                    {data.avatar_url==""?
                        <>{akronim(data.nama_lengkap)}</>
                    :
                        <img
                            src={get_avatar_url(data.avatar_url)}
                            quality={quality}
                            style={Object.assign({width:"100%", height:"100%"}, {}, style)}
                            className={className}
                        />
                    }
                </>
            }
        </>
    )
}
