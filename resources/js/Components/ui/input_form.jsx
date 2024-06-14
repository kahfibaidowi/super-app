import React from 'react'

export  const SwitchInput=({label="", id, checked=false, onChange})=>{
    return (
        <div class="form-check form-switch">
            <input 
                type="checkbox" 
                class="form-check-input" 
                id={id}
                checked={checked}
                onChange={onChange}
            />
            <label class="form-check-label" for={id}>
                {label}
            </label>
        </div>
    )
}
