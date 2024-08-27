import { useThemeStore } from '@/Stores/theme'
import React from 'react'
import {default as ReactSelect} from 'react-select'
import {default as ReactSelectAsync} from "react-select/async"
import {default as CreatableSelect} from "react-select/creatable"
import {default as AsyncCreatableSelect} from "react-select/async-creatable"

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
                menuPortalTarget={document.body}
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
                    },
                    menuPortal:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            zIndex:99999
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
            menuPortalTarget={document.body}
            styles={{
                control:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        background:"#fff",
                        borderColor:"#dee2e6"
                    }
                },
                menuPortal:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        zIndex:99999
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
                menuPortalTarget={document.body}
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
                    },
                    menuPortal:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            zIndex:99999
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
            menuPortalTarget={document.body}
            styles={{
                control:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        background:"#fff",
                        borderColor:"#dee2e6"
                    }
                },
                menuPortal:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        zIndex:99999
                    }
                }
            }}
        />
    )
}

export const CreateMultiSelect=({options=[], value, onChange, onKeyDown, placeholder="", disabled=false})=>{

    const theme=useThemeStore()

    if(theme.data.layout_mode=="dark"){
        return (
            <CreatableSelect
                isMulti
                options={options}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                isDisabled={disabled}
                menuPortalTarget={document.body}
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
                    },
                    menuPortal:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            zIndex:99999
                        }
                    }
                }}
            />
        )
    }

    return (
        <CreatableSelect
            isMulti
            options={options}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            isDisabled={disabled}
            menuPortalTarget={document.body}
            styles={{
                control:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        background:"#fff",
                        borderColor:"#dee2e6"
                    }
                },
                menuPortal:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        zIndex:99999
                    }
                }
            }}
        />
    )
}

export const CreateSelect=({options=[], value, onChange, onKeyDown, onInputChange, placeholder="", disabled=false})=>{

    const theme=useThemeStore()

    if(theme.data.layout_mode=="dark"){
        return (
            <CreatableSelect
                options={options}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                isDisabled={disabled}
                onInputChange={onInputChange}
                menuPortalTarget={document.body}
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
                    },
                    menuPortal:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            zIndex:99999
                        }
                    }
                }}
            />
        )
    }

    return (
        <CreatableSelect
            options={options}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            isDisabled={disabled}
            onInputChange={onInputChange}
            menuPortalTarget={document.body}
            styles={{
                control:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        background:"#fff",
                        borderColor:"#dee2e6"
                    }
                },
                menuPortal:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        zIndex:99999
                    }
                }
            }}
        />
    )
}

export const CreateAsyncMultiSelect=({cacheOptions=false, value, defaultOptions=[], loadOptions, onChange, onCreateOption, closeMenuOnSelect=true, placeholder="", disabled=false})=>{

    const theme=useThemeStore()

    if(theme.data.layout_mode=="dark"){
        return (
            <AsyncCreatableSelect
                isMulti
                value={value}
                cacheOptions={cacheOptions}
                defaultOptions={defaultOptions}
                loadOptions={loadOptions}
                onChange={onChange}
                placeholder={placeholder}
                isDisabled={disabled}
                menuPortalTarget={document.body}
                onCreateOption={onCreateOption}
                closeMenuOnSelect={closeMenuOnSelect}
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
                    },
                    menuPortal:(baseStyles, state)=>{
                        return {
                            ...baseStyles,
                            zIndex:99999
                        }
                    }
                }}
            />
        )
    }

    return (
        <AsyncCreatableSelect
            isMulti
            value={value}
            cacheOptions={cacheOptions}
            defaultOptions={defaultOptions}
            loadOptions={loadOptions}
            onChange={onChange}
            placeholder={placeholder}
            isDisabled={disabled}
            menuPortalTarget={document.body}
            onCreateOption={onCreateOption}
            closeMenuOnSelect={closeMenuOnSelect}
            styles={{
                control:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        background:"#fff",
                        borderColor:"#dee2e6"
                    }
                },
                menuPortal:(baseStyles, state)=>{
                    return {
                        ...baseStyles,
                        zIndex:99999
                    }
                }
            }}
        />
    )
}