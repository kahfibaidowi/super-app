import { useThemeStore } from '@/Stores/theme'
import React from 'react'
import {default as ReactSelect} from 'react-select'
import {default as ReactSelectAsync} from "react-select/async"

export const Select=({options=[], value, onChange, placeholder="", disabled=false})=>{
    
    const theme=useThemeStore()

    if(theme.data.layout_mode=="dark"){
        return (
            <ReactSelect
                options={options}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                isDisabled={disabled}
                styles={{
                    control:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            background:"#313a46",
                            borderColor:"#464f5b",
                            color:"#aab8c5"
                        }
                    },
                    singleValue:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            color:"#aab8c5"
                        }
                    },
                    menu:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            background:"#313a46",
                            borderColor:"#464f5b"
                        }
                    },
                    option:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            background:state.isFocused&&(!state.isSelected&&"#404954")
                        }
                    }
                }}
            />
        )
    }

    return (
        <ReactSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isDisabled={disabled}
            styles={{
                control:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        background:"#fff",
                        borderColor:"#dee2e6"
                    }
                }
            }}
        />
    )
}

export const AsyncSelect=({cacheOptions=false, defaultOptions=[], loadOptions, onChange, placeholder="", disabled=false})=>{

    const theme=useThemeStore()

    if(theme.data.layout_mode=="dark"){
        return (
            <ReactSelectAsync
                cacheOptions={cacheOptions}
                defaultOptions={defaultOptions}
                loadOptions={loadOptions}
                onChange={onChange}
                placeholder={placeholder}
                isDisabled={disabled}
                styles={{
                    control:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            background:"#313a46",
                            borderColor:"#464f5b",
                            color:"#aab8c5"
                        }
                    },
                    singleValue:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            color:"#aab8c5"
                        }
                    },
                    menu:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            background:"#313a46",
                            borderColor:"#464f5b"
                        }
                    },
                    option:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            background:state.isFocused&&(!state.isSelected&&"#404954")
                        }
                    }
                }}
            />
        )
    }

    return (
        <ReactSelectAsync
            cacheOptions={cacheOptions}
            defaultOptions={defaultOptions}
            loadOptions={loadOptions}
            onChange={onChange}
            placeholder={placeholder}
            isDisabled={disabled}
            styles={{
                control:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        background:"#fff",
                        borderColor:"#dee2e6"
                    }
                }
            }}
        />
    )
}