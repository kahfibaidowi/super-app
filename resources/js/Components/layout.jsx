import { side_type, useThemeStore } from '@/Stores/theme'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import Avatar from './ui/avatar'
import { FiBookOpen, FiBookmark, FiChevronRight, FiHome, FiLayers, FiLock, FiLogOut, FiMapPin, FiMenu, FiMessageSquare, FiMonitor, FiPackage, FiSettings, FiTruck, FiUser, FiUsers } from "react-icons/fi"
import { Collapse, Dropdown, Offcanvas } from 'react-bootstrap'
import { Link, router, usePage } from '@inertiajs/react'
import { Map } from 'immutable'
import { useQuery } from '@tanstack/react-query'
import { ppepp_kriteria_request } from '@/Config/request'
import * as _ from "underscore"

export default function Layout({children}){
    const page=usePage()
    const theme=useThemeStore()

    const login_data=page.props.auth.user
    const kriteria=page.props.kriteria
    const id_kriteria=!_.isUndefined(page.props.id_kriteria)?page.props.id_kriteria.toString():""

    const [active_page, setActivePage]=useState("")
    const [collapse, setCollapse]=useState("")
    const [setting, setSetting]=useState(false)

    useEffect(()=>{
        //page config
        setActivePage(page.component)

        //collapse
        if(["Admin/Ppepp/Index", "Admin/Ppepp/SubPpepp", "Admin/PpeppKriteria/Index"].includes(page.component)){
            setCollapse("ppepp")
        }
        if(["Admin/Bukti/Index"].includes(page.component)){
            setCollapse("bukti")
        }
        if(["Admin/Kontak/Index", "Admin/KontakGroup/Index", "Admin/PesanWhatsapp/Index"].includes(page.component)){
            setCollapse("pesan_wa")
        }
        
        //theme
        const handleWindowResize=()=>{
            const new_data=Map(theme.data).set("window_width", window.innerWidth)
            theme.setTheme(new_data.toJS())
        }
      
        handleWindowResize()
        window.addEventListener('resize', handleWindowResize);
    
        return ()=>{
            window.removeEventListener('resize', handleWindowResize);
        }
    }, [])

    //DATA

    //ACTIONS
    const logout=async()=>{
        router.delete("/logout")
        
    }

    return (
        <>
            <div className="wrapper">
                <div className="navbar-custom">
                    <div className="topbar container-fluid">
                        <div className="d-flex align-items-center gap-1">
                            <div className="logo-topbar">
                                <a href="index.html" className="logo-light">
                                    <span className="logo-lg">
                                        <img src="/images/logo2.png" alt="logo" style={{height:"50px"}}/>
                                    </span>
                                    <span className="logo-sm">
                                        <img src="/images/logo-sm.png" alt="small logo"/>
                                    </span>
                                </a>
                                <a href="index.html" className="logo-dark">
                                    <span className="logo-lg">
                                        <img src="/images/logo2.png" alt="logo" style={{height:"50px"}}/>
                                    </span>
                                    <span className="logo-sm">
                                        <img src="/images/logo-sm.png" alt="small logo"/>
                                    </span>
                                </a>
                            </div>
                            <button 
                                className="button-toggle-menu" 
                                onClick={e=>{
                                    if(side_type(theme.data)=="condensed"){
                                        theme.setTheme(Map(theme.data).set("layout_type", "default").toJS())
                                        return
                                    }
                                    if(side_type(theme.data)=="default"){
                                        theme.setTheme(Map(theme.data).set("layout_type", "condensed").toJS())
                                        return
                                    }
                                    if(side_type(theme.data)=="full"){
                                        theme.setTheme(Map(theme.data).set("sidebar_enable", true).toJS())
                                        return
                                    }
                                }}
                            >
                                <FiMenu/>
                            </button>
                        </div>

                        <ul className="topbar-menu d-flex align-items-center gap-3">
                            <li className="d-none d-sm-inline-block">
                                <a 
                                    className="nav-link" 
                                    onClick={e=>setSetting(true)}
                                >
                                    <FiSettings className='fs-22'/>
                                </a>
                            </li>
                            <Dropdown as="li">
                                <Dropdown.Toggle className="nav-link nav-user" as="a" href="#">
                                    <span className="account-user-avatar avatar avatar-xs bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white">
                                        <Avatar data={login_data}/>
                                    </span>
                                    <span className="d-lg-block d-none">
                                        <h5 className="my-0 fw-normal">{login_data?.nama_lengkap}</h5>
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end" className="dropdown-menu-animated profile-dropdown">
                                    <div className=" dropdown-header noti-title">
                                        <h6 className="text-overflow m-0">Welcome !</h6>
                                    </div>
                                    <a href="auth-lock-screen.html" className="dropdown-item">
                                        <FiLock className="fs-18 align-middle me-1"/>
                                        <span>Lock Screen</span>
                                    </a>
                                    <a className="dropdown-item cursor-pointer" onClick={e=>logout()}>
                                        <FiLogOut className="fs-18 align-middle me-1"/>
                                        <span>Logout</span>
                                    </a>
                                </Dropdown.Menu>
                            </Dropdown>
                        </ul>
                    </div>
                </div>
                <div className="leftside-menu menuitem-active">
                    <a href="index.html" className="logo logo-light">
                        <span className="logo-lg">
                            <img src="/images/logo2.png" alt="logo" style={{height:"50px"}}/>
                        </span>
                        <span className="logo-sm">
                            <img src="/images/logo-sm.png" alt="small logo"/>
                        </span>
                    </a>
                    <a href="index.html" className="logo logo-dark">
                        <span className="logo-lg">
                            <img src="/images/logo2.png" alt="logo" style={{height:"50px"}}/>
                        </span>
                        <span className="logo-sm">
                            <img src="/images/logo-sm.png" alt="small logo"/>
                        </span>
                    </a>

                    <div className="h-100" id="leftside-menu-container" data-simplebar>
                        <ul className="side-nav">

                            <li className="side-nav-title">Main</li>
                            <li
                                className={clsx(
                                    "side-nav-item", 
                                    {"menuitem-active":active_page=="Admin/Dashboard"
                                })}
                            >
                                <Link
                                    href="/admin"
                                    className={clsx("side-nav-link", "d-flex align-items-center", {"active":active_page=="Admin/Dashboard"})}
                                >
                                    <FiHome/>
                                    <span> Dashboard </span>
                                </Link>
                            </li>
                            <li
                                className={clsx(
                                    "side-nav-item", 
                                    {"menuitem-active":active_page=="Admin/ActivityProdi/Index"
                                })}
                            >
                                <Link
                                    href="/admin/activity_prodi"
                                    className={clsx("side-nav-link", "d-flex align-items-center", {"active":active_page=="Admin/ActivityProdi/Index"})}
                                >
                                    <FiBookmark/>
                                    <span> Activity Prodi </span>
                                </Link>
                            </li>
                            
                            <li
                                className={clsx(
                                    "side-nav-item", {
                                    "menuitem-active":["Admin/Ppepp/Index", "Admin/Ppepp/SubPpepp", "Admin/PpeppKriteria/Index"].includes(active_page)
                                })}
                            >
                                <a 
                                    className="side-nav-link d-flex align-items-center cursor-pointer"
                                    onClick={e=>setCollapse(collapse!="ppepp"?"ppepp":"")}
                                    aria-expanded={collapse=="ppepp"}
                                >
                                    <FiBookOpen/>
                                    <span> PPEPP </span>
                                    <span className='menu-arrow'><FiChevronRight className='ms-auto'/></span>
                                </a>
                                <Collapse in={collapse=="ppepp"}>
                                    <div>
                                        <ul className="side-nav-second-level">
                                            <li
                                                className={clsx({
                                                    "active":["Admin/PpeppKriteria/Index"].includes(active_page)
                                                })}
                                            >
                                                <Link
                                                    href="/admin/ppepp_kriteria"
                                                    className={clsx({
                                                        "active":["Admin/PpeppKriteria/Index"].includes(active_page)
                                                    })}
                                                >
                                                    Kriteria
                                                </Link>
                                            </li>
                                            <li
                                                className={clsx({
                                                    "active":["Admin/Ppepp/Index"].includes(active_page)
                                                })}
                                            >
                                                <Link
                                                    href="/admin/ppepp"
                                                    className={clsx({
                                                        "active":["Admin/Ppepp/Index"].includes(active_page)
                                                    })}
                                                >
                                                    PPEPP
                                                </Link>
                                            </li>
                                            <li
                                                className={clsx({
                                                    "active":["Admin/Ppepp/SubPpepp"].includes(active_page)
                                                })}
                                            >
                                                <Link
                                                    href="/admin/ppepp/sub"
                                                    className={clsx({
                                                        "active":["Admin/Ppepp/SubPpepp"].includes(active_page)
                                                    })}
                                                >
                                                    Sub PPEPP
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </Collapse>
                            </li>

                            <li
                                className={clsx(
                                    "side-nav-item", {
                                    "menuitem-active":["Admin/Bukti/Index"].includes(active_page)
                                })}
                            >
                                <a 
                                    className="side-nav-link d-flex align-items-center cursor-pointer"
                                    onClick={e=>setCollapse(collapse!="bukti"?"bukti":"")}
                                    aria-expanded={collapse=="bukti"}
                                >
                                    <FiBookOpen/>
                                    <span> Bukti PPEPP </span>
                                    <span className='menu-arrow'><FiChevronRight className='ms-auto'/></span>
                                </a>
                                <Collapse in={collapse=="bukti"}>
                                    <div>
                                        <ul className="side-nav-second-level">
                                            {kriteria.map(sub=>(
                                                <li
                                                    className={clsx({
                                                        "active":(active_page=="Admin/Bukti/Index" && id_kriteria==sub.id_kriteria.toString())
                                                    })}
                                                >
                                                    <Link
                                                        href={`/admin/bukti/${sub.id_kriteria}`}
                                                        className={clsx({
                                                            "active":(active_page=="Admin/Bukti/Index" && id_kriteria==sub.id_kriteria.toString())
                                                        })}
                                                    >
                                                        {sub.nama_kriteria}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Collapse>
                            </li>
                            <li
                                className={clsx(
                                    "side-nav-item", {
                                    "menuitem-active":["Admin/Kontak/Index", "Admin/KontakGroup/Index", "Admin/PesanWhatsapp/Index"].includes(active_page)
                                })}
                            >
                                <a 
                                    className="side-nav-link d-flex align-items-center cursor-pointer"
                                    onClick={e=>setCollapse(collapse!="pesan_wa"?"pesan_wa":"")}
                                    aria-expanded={collapse=="pesan_wa"}
                                >
                                    <FiMessageSquare/>
                                    <span> Pesan Whatsapp </span>
                                    <span className='menu-arrow'><FiChevronRight className='ms-auto'/></span>
                                </a>
                                <Collapse in={collapse=="pesan_wa"}>
                                    <div>
                                        <ul className="side-nav-second-level">
                                            <li
                                                className={clsx({
                                                    "active":(active_page=="Admin/Kontak/Index")
                                                })}
                                            >
                                                <Link
                                                    href={`/admin/kontak`}
                                                    className={clsx({
                                                        "active":(active_page=="Admin/Kontak/Index")
                                                    })}
                                                >
                                                    Kontak
                                                </Link>
                                            </li>
                                            <li
                                                className={clsx({
                                                    "active":(active_page=="Admin/KontakGroup/Index")
                                                })}
                                            >
                                                <Link
                                                    href={`/admin/kontak_group`}
                                                    className={clsx({
                                                        "active":(active_page=="Admin/KontakGroup/Index")
                                                    })}
                                                >
                                                    Group Kontak
                                                </Link>
                                            </li>
                                            <li
                                                className={clsx({
                                                    "active":(active_page=="Admin/PesanWhatsapp/Index")
                                                })}
                                            >
                                                <Link
                                                    href={`/admin/pesan_whatsapp`}
                                                    className={clsx({
                                                        "active":(active_page=="Admin/PesanWhatsapp/Index")
                                                    })}
                                                >
                                                    Pesan Whatsapp
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </Collapse>
                            </li>
                            <li
                                className={clsx(
                                    "side-nav-item", 
                                    {"menuitem-active":active_page=="Admin/Users/Index"
                                })}
                            >
                                <Link
                                    href="/admin/users"
                                    className={clsx("side-nav-link", "d-flex align-items-center", {"active":active_page=="Admin/Users/Index"})}
                                >
                                    <FiUsers/>
                                    <span> Users </span>
                                </Link>
                            </li>
                            
                        </ul>
                        <div className="clearfix"></div>
                    </div>
                </div>
                <div className="content-page">
                    <div className="content">
                        <div className="container-fluid">
                            {children}
                        </div>
                    </div>

                    <footer className="footer">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12 text-center">
                                    © Velonic Theme
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>

            {/* OFFCANVAS MENU */}
            {theme.data.sidebar_enable&&
                <div 
                    id="custom-backdrop" 
                    className={clsx("offcanvas-backdrop fade show")}
                    onClick={e=>theme.setTheme(Map(theme.data).set("sidebar_enable", false).toJS())}
                >
                </div>
            }

            {/* OFFCANVAS SETTING */}
            <Offcanvas show={setting} placement="end" onHide={()=>setSetting(false)}>
                <Offcanvas.Header 
                    className="d-flex align-items-center bg-primary p-3" 
                    closeButton 
                    closeVariant="white"
                >
                    <h5 className="text-white m-0">Theme Settings</h5>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div data-simplebar className="h-100">
                        <div className="p-3">
                            <h5 className="mb-3 fs-16 fw-bold">Color Scheme</h5>
                            <div className="row">
                                <div className="col-4">
                                    <div 
                                        className="form-check form-switch card-switch mb-1" 
                                        onClick={e=>theme.setTheme(Map(theme.data).set("layout_mode", "light").toJS())}
                                    >
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            name="data-bs-theme"
                                            checked={theme.data.layout_mode=="light"}
                                        />
                                        
                                        <label className="form-check-label" for="layout-color-light">
                                            <img src="/images/layouts/light.png" alt="" className="img-fluid"/>
                                        </label>
                                    </div>
                                    <h5 className="font-14 text-center text-muted mt-2">Light</h5>
                                </div>
                                <div className="col-4">
                                    <div 
                                        className="form-check form-switch card-switch mb-1"
                                        onClick={e=>theme.setTheme(Map(theme.data).set("layout_mode", "dark").toJS())}
                                    >
                                        <input
                                            className="form-check-input" 
                                            type="checkbox" 
                                            name="data-bs-theme"
                                            checked={theme.data.layout_mode=="dark"}
                                        />
                                        <label className="form-check-label" for="layout-color-dark">
                                            <img src="/images/layouts/dark.png" alt="" className="img-fluid"/>
                                        </label>
                                    </div>
                                    <h5 className="font-14 text-center text-muted mt-2">Dark</h5>
                                </div>
                            </div>

                            <h5 className="my-3 fs-16 fw-bold">Topbar Color</h5>
                            <div className="row">
                                <div className="col-4">
                                    <div 
                                        className="form-check form-switch card-switch mb-1"
                                        onClick={e=>theme.setTheme(Map(theme.data).set("topbar_color", "light").toJS())}
                                    >
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            name="data-topbar-color"
                                            checked={theme.data.topbar_color=="light"}
                                        />
                                        <label className="form-check-label" for="topbar-color-light">
                                            <img src="/images/layouts/light.png" alt="" className="img-fluid"/>
                                        </label>
                                    </div>
                                    <h5 className="font-14 text-center text-muted mt-2">Light</h5>
                                </div>

                                <div className="col-4">
                                    <div 
                                        className="form-check form-switch card-switch mb-1"
                                        onClick={e=>theme.setTheme(Map(theme.data).set("topbar_color", "dark").toJS())}
                                    >
                                        <input 
                                            className="form-check-input" 
                                            type="checkbox" 
                                            name="data-topbar-color"
                                            checked={theme.data.topbar_color=="dark"}
                                        />
                                        <label className="form-check-label" for="topbar-color-dark">
                                            <img src="/images/layouts/topbar-dark.png" alt="" className="img-fluid"/>
                                        </label>
                                    </div>
                                    <h5 className="font-14 text-center text-muted mt-2">Dark</h5>
                                </div>
                            </div>

                            <div>
                                <h5 className="my-3 fs-16 fw-bold">Menu Color</h5>
                                <div className="row">
                                    <div className="col-4">
                                        <div 
                                            className="form-check form-switch card-switch mb-1"
                                            onClick={e=>theme.setTheme(Map(theme.data).set("menu_color", "light").toJS())}
                                        >
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                name="data-menu-color"
                                                checked={theme.data.menu_color=="light"}
                                            />
                                            <label className="form-check-label" for="leftbar-color-light">
                                                <img src="/images/layouts/sidebar-light.png" alt="" className="img-fluid"/>
                                            </label>
                                        </div>
                                        <h5 className="font-14 text-center text-muted mt-2">Light</h5>
                                    </div>

                                    <div className="col-4">
                                        <div 
                                            className="form-check form-switch card-switch mb-1"
                                            onClick={e=>theme.setTheme(Map(theme.data).set("menu_color", "dark").toJS())}
                                        >
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                name="data-menu-color"
                                                checked={theme.data.menu_color=="dark"}
                                            />
                                            <label className="form-check-label" for="leftbar-color-dark">
                                                <img src="/images/layouts/light.png" alt="" className="img-fluid"/>
                                            </label>
                                        </div>
                                        <h5 className="font-14 text-center text-muted mt-2">Dark</h5>
                                    </div>
                                </div>
                            </div>

                            <div id="sidebar-size">
                                <h5 className="my-3 fs-16 fw-bold">Sidebar Size</h5>

                                <div className="row">
                                    <div className="col-4">
                                        <div 
                                            className="form-check form-switch card-switch mb-1"
                                            onClick={e=>theme.setTheme(Map(theme.data).set("layout_type", "default").toJS())}
                                        >
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                name="data-sidenav-size"
                                                checked={theme.data.layout_type=="default"}
                                            />
                                            <label className="form-check-label" for="leftbar-size-default">
                                                <img src="/images/layouts/light.png" alt="" className="img-fluid"/>
                                            </label>
                                        </div>
                                        <h5 className="font-14 text-center text-muted mt-2">Default</h5>
                                    </div>
                                    <div className="col-4">
                                        <div 
                                            className="form-check form-switch card-switch mb-1"
                                            onClick={e=>theme.setTheme(Map(theme.data).set("layout_type", "condensed").toJS())}
                                        >
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                name="data-sidenav-size"
                                                checked={theme.data.layout_type=="condensed"}
                                            />
                                            <label className="form-check-label" for="leftbar-size-small">
                                                <img src="/images/layouts/sm.png" alt="" className="img-fluid"/>
                                            </label>
                                        </div>
                                        <h5 className="font-14 text-center text-muted mt-2">Condensed</h5>
                                    </div>
                                    <div className="col-4">
                                        <div 
                                            className="form-check form-switch card-switch mb-1"
                                            onClick={e=>theme.setTheme(Map(theme.data).set("layout_type", "full").toJS())}
                                        >
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                name="data-sidenav-size"
                                                checked={theme.data.layout_type=="full"}
                                            />
                                            <label className="form-check-label" for="leftbar-size-full">
                                                <img src="/images/layouts/full.png" alt="" className="img-fluid"/>
                                            </label>
                                        </div>
                                        <h5 className="font-14 text-center text-muted mt-2">Full Layout</h5>
                                    </div>
                                </div>
                            </div>

                            <div id="layout-position">
                                <h5 class="my-3 fs-16 fw-bold">Layout Position</h5>

                                <div class="btn-group checkbox" role="group">
                                    <input 
                                        type="radio" 
                                        class="btn-check"
                                        id="layout-position-fixed"
                                        onChange={e=>theme.setTheme(Map(theme.data).set("layout_position", "fixed").toJS())}
                                        checked={theme.data.layout_position=="fixed"}
                                    />
                                    <label class="btn btn-soft-primary w-sm" for="layout-position-fixed">Fixed</label>

                                    <input 
                                        type="radio" 
                                        class="btn-check" 
                                        id="layout-position-scrollable"
                                        onChange={e=>theme.setTheme(Map(theme.data).set("layout_position", "scrollable").toJS())}
                                        checked={theme.data.layout_position=="scrollable"}
                                    />
                                    <label class="btn btn-soft-primary w-sm ms-0" for="layout-position-scrollable">Scrollable</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}
