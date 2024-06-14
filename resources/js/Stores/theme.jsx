import _ from 'underscore'
import { create } from 'zustand'
import { persist } from "zustand/middleware"

export const side_type=(data)=>{
    if(data.layout_type!="default"){
        return data.layout_type
    }
    
    if(!_.isNull(data.window_width)){
        if(data.window_width<=767.98){
            return "full"
        }
        if(data.window_width>=767 && data.window_width<=1140){
            if(data.layout_type=="full"){
                return "condensed"
            }
        }
    }
    return "default"
}

const store=(set, get)=>{
    return {
        data:{
            language:"id",
            layout_mode:"light",
            menu_color:"dark",
            topbar_color:"light",
            layout_position:"scrollable",
            sidebar_enable:false,
            layout_type:"default",
            window_width:null
        },
        setTheme:(data)=>{
            set({data})
            
            document.documentElement.setAttribute("lang", data.language)
            document.documentElement.setAttribute("data-bs-theme", data.layout_mode)
            document.documentElement.setAttribute("data-menu-color", data.menu_color)
            document.documentElement.setAttribute("data-topbar-color", data.topbar_color)
            document.documentElement.setAttribute("data-layout-position", data.layout_position)
            document.documentElement.setAttribute("data-sidenav-size", side_type(data))
            document.documentElement.setAttribute("class", data.sidebar_enable?"sidebar-enable":"")
        }
    }
}

export const useThemeStore=create(
    persist(store, {
        name:"data_theme"
    })
)